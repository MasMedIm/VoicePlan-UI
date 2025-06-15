from ingestion import scrape_reddit
from ingestion_topicwise import scrape_reddit_topicwise
from create_vector_database import create_vector_database
from search_vector_db import search_vector_db
from gemini_retrieval import return_gemini_response
import os

def main():
    
    QUERY = "What are the top restaurants people are recommending and why?"    
    current_run_path = scrape_reddit_topicwise(city="Atlanta", topic="Restaurants", limit=5)
    
    # check if vector search results already exist. If yes then skip creation of vector database and search
    if os.path.exists(os.path.join(current_run_path, "vector_search_results.txt")):
        print("Vector search results already exist. Skipping vector database creation and search.")
    else:
        create_vector_database(current_run_path, batch_size=95, index_name="mcp-test")
        search_vector_db(index_name="mcp-test", query=QUERY, current_run_path=current_run_path, top_k = 50)
    
    return_gemini_response(query=QUERY, current_run_path=current_run_path, model="gemini-2.5-flash-preview-05-20")
    
if __name__ == "__main__":
    main()