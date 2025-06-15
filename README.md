# Reddit Crawler

This project is a Reddit crawler that scrapes data from Reddit, processes it, and uses it to answer questions using a large language model.

## Setup

1.  **Install Docker and Docker Compose.**
2.  **Create a `keys.yaml` file** in the root of the project and add your API keys. You can use `keys.yaml.example` as a template.
3.  **Build and run the application:**
    ```bash
    docker-compose up
    ```

## How it works

The application is a FastAPI service containerized using Docker. When you run `docker-compose up`, it will:

1.  Build a Docker image based on the `Dockerfile`.
2.  Install the Python dependencies from `requirements.txt`.
3.  Start a FastAPI server on port 8000.

You can then send requests to the API. For example, to fetch and search for posts:

```bash
curl -X 'POST' \
  'http://localhost:8000/fetch_and_search' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "query": "What are the best pizza places?",
  "city": "New York",
  "topic": "Pizza"
}'
```

The server will then:

1.  Scrape data from Reddit using the `praw` library based on the provided city and topic.
2.  Create a vector database using Pinecone.
3.  Search the vector database for relevant information based on the query.
4.  Return a message indicating the process is complete and where the results are stored.

The results of each run are stored in the `runs` directory. 