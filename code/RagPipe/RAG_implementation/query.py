import json
from langchain.schema import Document
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.vectorstores import FAISS
from langchain.prompts import ChatPromptTemplate
# from langchain.chat_models import ChatOpenAI

vector_store_path = "faiss_index_v2"

embedding_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-mpnet-base-v2")

print("[INFO] Loading FAISS index from disk...")
vector_store = FAISS.load_local(vector_store_path, embedding_model, allow_dangerous_deserialization=True)

# query = "Block all HTTP traffic originating from the subnet 192.168.1.0/24"
# query = "Transferring tasks are performed daily from 5:00 to 21:00, requiring latency below 62ms, jitter not exceeding 2ms"
query = "Block all TCP traffic"

print(query)
retrieved_docs = vector_store.similarity_search_with_score(query, k=3)

# print(retrieved_docs)

context = "\n\n".join([
    f"Intent: {doc.page_content}\nConfig: {json.dumps(doc.metadata['config'])}"
    for doc, _ in retrieved_docs
])

print(context)