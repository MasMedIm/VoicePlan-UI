import os
from datetime import datetime
import json
import praw
import yaml

with open("keys.yaml", 'r') as stream:
    keys = yaml.safe_load(stream)

def get_comments_text(submission, max_comments=10):
    """
    Extract comments from a Reddit submission.
    Returns a string containing all comment text.
    """
    comments_text = []
    try:
        # Expand more comments to get deeper nested comments
        submission.comments.replace_more(limit=0)
        
        # Get all comments (flattened list)
        all_comments = submission.comments.list()
        
        # Limit the number of comments to avoid extremely long text
        for comment in all_comments[:max_comments]:
            if hasattr(comment, 'body') and comment.body != '[deleted]' and comment.body != '[removed]':
                comments_text.append(comment.body)
                
    except Exception as e:
        print(f"Error fetching comments: {e}")
        
    return " ".join(comments_text)


def scrape_reddit_topicwise(city: str, topic: str, limit: int = 20):
    """
    Fetches subreddits matching the given topic and returns a list sorted by subscriber count.
    """
    reddit = praw.Reddit(
        client_id=keys['REDDIT_CLIENT_ID'],
        client_secret=keys['REDDIT_CLIENT_SECRET'],
        user_agent=keys['REDDIT_USER_AGENT'],
        username=keys['REDDIT_USERNAME'],
        password=keys['REDDIT_PASSWORD']
    )
    
    
    output_dir_base = "runs"
    
    #create a directory for the current run
    current_time = datetime.now().strftime("%Y-%m-%d_%H_%M")
    
        ## if a folder with the current time exists, skip the scraping and return the path to the existing folder
    if os.path.exists(os.path.join(output_dir_base, current_time)):
        return os.path.join(output_dir_base, current_time)
    
    os.makedirs(os.path.join(output_dir_base, current_time), exist_ok=True)
    
    #path to the current run
    current_run_path = os.path.join(output_dir_base, current_time)
    
    # Save the Pinecone-formatted results
    raw_scraps_filename = os.path.join(output_dir_base, current_time, f"raw_scrap_results.json")    


    pinecone_formatted_results = []
    
    subs = reddit.subreddits.search(query=city, limit=limit)

    for sub in subs:
        posts = sub.search(query=topic, limit=limit)
        for post in posts:
            comments_text = get_comments_text(post)
            pinecone_formatted_results.append({
                "_id": post.id,
                "subreddit": sub.display_name,
                "created_utc": post.created_utc,
                "chunk_text": f"{post.title} {post.selftext} {comments_text}".strip(),
                "upvotes": post.score,
                "num_comments": post.num_comments,

            })

    with open(raw_scraps_filename, "w", encoding="utf-8") as f:
        json.dump(pinecone_formatted_results, f, ensure_ascii=False, indent=2)
    print(f"Saved {len(pinecone_formatted_results)} posts in Pinecone format to {raw_scraps_filename}")
    
    return current_run_path

