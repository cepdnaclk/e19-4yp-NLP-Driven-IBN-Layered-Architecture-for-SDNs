#import os
import json
from langchain.schema import Document
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.vectorstores import FAISS
from langchain.prompts import ChatPromptTemplate
from langchain.chat_models import ChatOpenAI

# Load DeepSeek API Key
#DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")

# Load Sample Intents (Knowledge Base)
with open("sample_intents_2.json") as f:
    intents = json.load(f)

docs = [
    Document(page_content=intent["intent"], metadata={"config": intent["config"]})
    for intent in intents
]

# Embeddings & FAISS Vector Store (Local Retrieval)
embedding_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-mpnet-base-v2")
vector_store_path = "faiss_index_v2"

print("[INFO] Building FAISS index...")
vector_store = FAISS.from_documents(docs, embedding_model)
vector_store.save_local(vector_store_path)