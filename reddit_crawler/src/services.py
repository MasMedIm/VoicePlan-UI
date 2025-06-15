from fastapi import FastAPI, HTTPException
from fastapi_mcp import FastApiMCP
from pydantic import BaseModel
import os
import uvicorn
# from .ingestion import scrape_reddit
from .ingestion_topicwise import scrape_reddit_topicwise
from .create_vector_database import create_vector_database
from .search_vector_db import search_vector_db

app = FastAPI()

mcp = FastApiMCP(app)
# Mount the MCP server directly to your FastAPI app
mcp.mount()

class FetchSearchRequest(BaseModel):
    query: str
    city: str = "Atlanta"
    topic: str = "Food" 


@app.post("/fetch_and_search")
async def fetch_and_search(request: FetchSearchRequest):
    try:
        current_run_path = scrape_reddit_topicwise(city=request.city, topic=request.topic, limit=10)
        
        # Check if vector search results already exist.
        output_filename = os.path.join(current_run_path, "vector_search_results.txt")
        if os.path.exists(output_filename):
            print("Vector search results already exist. Skipping vector database creation and search.")
            return {"message": "Search results already exist.", "output_filename": output_filename}
        else:
            create_vector_database(current_run_path, batch_size=95, index_name="mcp-test")
            output_filename = search_vector_db(index_name="mcp-test", query=request.query, current_run_path=current_run_path, top_k=50)
            return {"message": "Fetch and search completed successfully", "output_filename": output_filename}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001) 