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

class IntentRequest(BaseModel):
    intent: str
    config: Dict[str, Any]

class BatchIntentRequest(BaseModel):
    intents: list[IntentRequest]

class IntentResponse(BaseModel):
    message: str
    intent_id: str
    timestamp: str
    status: str

class BatchIntentResponse(BaseModel):
    message: str
    stored_count: int
    intent_ids: list[str]
    timestamp: str
    status: str

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

@app.post("/store-intent", response_model=IntentResponse)
async def store_intent(request: IntentRequest):
    """
    Store a new intent in the knowledge base and update the vector store
    """
    try:
        logger.info(f"Storing new intent: {request.intent[:100]}...")
        
        # Generate a unique intent ID
        import uuid
        intent_id = f"INTENT-{str(uuid.uuid4())[:8].upper()}"
        
        # Add metadata if not present
        if "intent_id" not in request.config:
            request.config["intent_id"] = intent_id
        else:
            intent_id = request.config["intent_id"]

        if "timestamp" not in request.config:
            request.config["timestamp"] = datetime.now().isoformat()    
        
        # Load existing intents
        intents_file = "pushed_configs.json"
        try:
            with open(intents_file, 'r', encoding='utf-8') as f:
                intents = json.load(f)
        except FileNotFoundError:
            intents = []
        
        # Add new intent
        new_intent = {
            "intent": request.intent,
            "config": request.config
        }
        intents.append(new_intent)
        
        # Save updated intents
        with open(intents_file, 'w', encoding='utf-8') as f:
            json.dump(intents, f, indent=2, ensure_ascii=False)
        
        # Update vector store
        from vector_store import update_vector_store
        update_vector_store(new_intent)
        
        logger.info(f"Successfully stored intent with ID: {intent_id} , {request.intent[:50]}...")
        
        return IntentResponse(
            message="Intent stored successfully",
            intent_id=intent_id,
            timestamp=datetime.now().isoformat(),
            status="success"
        )
        
    except Exception as e:
        logger.error(f"Error storing intent: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to store intent: {str(e)}")

@app.post("/store-intents-batch", response_model=BatchIntentResponse)
async def store_intents_batch(request: BatchIntentRequest):
    """
    Store multiple intents in batch
    """
    try:
        logger.info(f"Storing {len(request.intents)} intents in batch...")
        
        # Load existing intents
        intents_file = "sample_intents_2.json"
        try:
            with open(intents_file, 'r', encoding='utf-8') as f:
                intents = json.load(f)
        except FileNotFoundError:
            intents = []
        
        intent_ids = []
        new_intents = []
        
        # Process each intent
        for intent_req in request.intents:
            import uuid
            intent_id = f"INTENT-{str(uuid.uuid4())[:8].upper()}"
            
            # Add metadata if not present
            if "intent_id" not in intent_req.config:
                intent_req.config["intent_id"] = intent_id
            if "timestamp" not in intent_req.config:
                intent_req.config["timestamp"] = datetime.now().isoformat()
            
            # Create new intent object
            new_intent = {
                "intent": intent_req.intent,
                "config": intent_req.config
            }
            
            intents.append(new_intent)
            new_intents.append(new_intent)
            intent_ids.append(intent_id)
        
        # Save updated intents file
        with open(intents_file, 'w', encoding='utf-8') as f:
            json.dump(intents, f, indent=2, ensure_ascii=False)
        
        # Update vector store with all new intents
        from vector_store import update_vector_store_batch
        update_vector_store_batch(new_intents)
        
        logger.info(f"Successfully stored {len(intent_ids)} intents in batch")
        
        return BatchIntentResponse(
            message=f"Successfully stored {len(intent_ids)} intents",
            stored_count=len(intent_ids),
            intent_ids=intent_ids,
            timestamp=datetime.now().isoformat(),
            status="success"
        )
        
    except Exception as e:
        logger.error(f"Error storing intents batch: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to store intents: {str(e)}")

@app.get("/intents")
async def get_all_intents():
    """
    Retrieve all stored intents from the knowledge base
    """
    try:
        intents_file = "sample_intents_2.json"
        with open(intents_file, 'r', encoding='utf-8') as f:
            intents = json.load(f)
        
        return {
            "total_intents": len(intents),
            "intents": intents,
            "timestamp": datetime.now().isoformat()
        }
    except FileNotFoundError:
        return {
            "total_intents": 0,
            "intents": [],
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error retrieving intents: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve intents: {str(e)}")

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
        retrieved_context = retriever_agent(request.message)
        acl_rules = acl_retriever_agent(ACL_URL)
        # Generate configuration
        raw_output = template_generator_agent(request.message, retrieved_context, acl_rules)
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
