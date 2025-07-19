#import os
import json
from langchain.schema import Document
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.vectorstores import FAISS
from langchain.prompts import ChatPromptTemplate
from langchain.chat_models import ChatOpenAI
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load DeepSeek API Key
#DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")

# Global variables
embedding_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-mpnet-base-v2")
vector_store_path = "faiss_index_v2"

def build_vector_store():
    """Build the initial vector store from sample intents"""
    # Load Sample Intents (Knowledge Base)
    with open("sample_intents_2.json") as f:
        intents = json.load(f)

    docs = [
        Document(page_content=intent["intent"], metadata={"config": intent["config"]})
        for intent in intents
    ]

    print("[INFO] Building FAISS index...")
    vector_store = FAISS.from_documents(docs, embedding_model)
    vector_store.save_local(vector_store_path)
    print(f"[INFO] FAISS index built and saved to {vector_store_path}")
    return vector_store

def load_vector_store():
    """Load existing vector store or build new one if doesn't exist"""
    try:
        print(f"[INFO] Loading existing FAISS index from {vector_store_path}")
        vector_store = FAISS.load_local(vector_store_path, embedding_model, allow_dangerous_deserialization=True)
        print("[INFO] FAISS index loaded successfully")
        return vector_store
    except Exception as e:
        print(f"[WARNING] Failed to load existing index: {e}")
        print("[INFO] Building new vector store...")
        return build_vector_store()

def update_vector_store(new_intent):
    """Update the vector store with a new intent"""
    try:
        # Load existing vector store
        vector_store = load_vector_store()
        
        # Create document for new intent
        new_doc = Document(
            page_content=new_intent["intent"], 
            metadata={"config": new_intent["config"]}
        )
        
        # Add new document to vector store
        vector_store.add_documents([new_doc])
        
        # Save updated vector store
        vector_store.save_local(vector_store_path)
        
        logger.info(f"Vector store updated with new intent: {new_intent['intent'][:100]}...")
        return True
        
    except Exception as e:
        logger.error(f"Failed to update vector store: {str(e)}")
        return False

def update_vector_store_batch(new_intents):
    """Update the vector store with multiple new intents"""
    try:
        # Load existing vector store
        vector_store = load_vector_store()
        
        # Create documents for new intents
        new_docs = [
            Document(
                page_content=intent["intent"], 
                metadata={"config": intent["config"]}
            )
            for intent in new_intents
        ]
        
        # Add new documents to vector store
        vector_store.add_documents(new_docs)
        
        # Save updated vector store
        vector_store.save_local(vector_store_path)
        
        logger.info(f"Vector store updated with {len(new_intents)} new intents")
        return True
        
    except Exception as e:
        logger.error(f"Failed to update vector store in batch: {str(e)}")
        return False

# Build initial vector store if this file is run directly
if __name__ == "__main__":
    build_vector_store()