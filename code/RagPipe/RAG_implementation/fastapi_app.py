import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
import uvicorn
import json
import logging
from datetime import datetime


# Import your RAG functions
from rag_v2 import retriever_agent, template_generator_agent, acl_retriever_agent

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
ACL_URL = os.getenv("ACL_RULES_API", "http://10.40.19.248:8181/onos/v1/acl/rules")
HOST = os.getenv("HOST", "localhost")
PORT = int(os.getenv("PORT", 8001))

app = FastAPI(
    title="Network Policy RAG API",
    description="API for generating network policy configurations using RAG",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response
class QueryRequest(BaseModel):
    message: str
class QueryResponse(BaseModel):
    intent: str
    config: Dict[str, Any]
    retrieved_context: str
    acl_rules: str
    timestamp: str
    processing_time_ms: float

class HealthResponse(BaseModel):
    status: str
    timestamp: str
    version: str

@app.get("/", response_model=HealthResponse)
async def root():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        timestamp=datetime.now().isoformat(),
        version="1.0.0"
    )

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Detailed health check endpoint"""
    return HealthResponse(
        status="healthy",
        timestamp=datetime.now().isoformat(),
        version="1.0.0"
    )

@app.post("/chat")
async def process_query_simple(request: QueryRequest):
    """
    Simplified endpoint that returns only the generated configuration
    """
    try:
        logger.info(f"Processing query: {request.message}")
        
        # Retrieve context and ACL rules
        retrieved_context = retriever_agent("Block all http traffic")
        acl_rules = acl_retriever_agent(ACL_URL)
        # Generate configuration
        raw_output = template_generator_agent("Block all http traffic", retrieved_context, acl_rules)
        return {
            "response": raw_output,
            "timestamp": datetime.now().isoformat(),
        }
            
    except Exception as e:
        logger.error(f"Error processing query: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/context/{message}")
async def get_context_only(message: str):
    """
    Get only the retrieved context for a query (for debugging)
    """
    try:
        retrieved_context = retriever_agent(message)
        return {
            "message": message,
            "response": retrieved_context,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error retrieving context: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/acl")
async def get_acl_rules(acl_url: Optional[str] = ACL_URL):
    """
    Get current ACL rules (for debugging)
    """
    try:
        acl_rules = acl_retriever_agent(acl_url)
        return {
            "acl_url": acl_url,
            "rules": json.loads(acl_rules),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error retrieving ACL rules: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(
        "fastapi_app:app",
        host=HOST,
        port=PORT,
        reload=True,
        log_level="info"
    )
