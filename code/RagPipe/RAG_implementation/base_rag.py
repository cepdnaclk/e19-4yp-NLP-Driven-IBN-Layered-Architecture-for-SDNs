# import json
# from langchain.schema import Document
# from langchain.vectorstores import Chroma
# from langchain.embeddings.openai import OpenAIEmbeddings

# # Load sample intents JSON
# with open("sample_intents.json") as f:
#     intents = json.load(f)

# # Convert intents to LangChain Documents
# docs = [
#     Document(page_content=intent["intent"], metadata={"config": intent["config"]})
#     for intent in intents
# ]

# # Embed intents & index them into Chroma DB
# embeddings = OpenAIEmbeddings(openai_api_key=OPENAI_API_KEY)
# db = Chroma.from_documents(docs, embeddings, persist_directory=CHROMA_PATH)

from langchain.chat_models import ChatOpenAI
from langchain.schema import HumanMessage

import json
from langchain.schema import Document
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.vectorstores import FAISS
from langchain.prompts import ChatPromptTemplate

from langchain_deepseek.chat_models import ChatDeepSeek # Deepseek chat model

# queriying the knowledge base and retrieving the additional context

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

PROMPT_TEMPLATE = """
You are a network policy expert.

The target output must strictly follow **this JSON schema**:

{{
  "intent": "<Rephrase the user intent in natural language>",
  "config": {{
    "intent_id": "<Generate a unique INTENT_ID or leave empty>",
    "user_role": "<USER_ROLE>", // default: "admin"
    "timestamp": "<current timestamp in ISO format>",
    "QOS": {{
      "application": "<APPLICATION>", // default: "Web Browsing"
      "category": "<TRAFFIC_CATEGORY>", // default: "web"
      "latency": "<LATENCY_THRESHOLD>", // e.g., "50ms"
      "bandwidth": "<BANDWIDTH_THRESHOLD>", // e.g., "5Mbps"
      "jitter": "<JITTER_THRESHOLD>", // e.g., "30ms"
      "priority": "<PRIORITY_LEVEL>", // default: "low"
      "time_constraints": {{
        "start": "<START_TIME>", // default: now
        "end": "<END_TIME>",     // default: 1 hour later
        "days": ["<DAY_1>", "<DAY_2>"] // default: ["Today"]
      }}
    }},
    "ACL": {{
      "rules": [
        {{
          "action": "<ACTION>", // "allow" or "deny"
          "source_ip": "<SOURCE_IP>", // default: "0.0.0.0/0"
          "destination_ip": "<DESTINATION_IP>", // default: "0.0.0.0/0"
          "source_port": "<SOURCE_PORT>", // default: "any"
          "destination_port": "<DESTINATION_PORT>", // default: "any"
          "protocols": ["<ALLOW_PROTOCOL_1>", "<ALLOW_PROTOCOL_2>"] // default: ["HTTP"]
        }}
      ],
      "schedule": {{
        "start": "<ACL_START_TIME>", // default: now
        "end": "<ACL_END_TIME>"      // default: 24h later
      }}
    }},
    "LOGS": {{
      "filters": [
        {{
          "hosts": "<HOST_IP>", // default: "any"
          "ports": "<FILTER_PORT>", // default: "any"
          "application": "<FILTER_APPLICATION>", // default: "any"
          "time_window": "<TIME_WINDOW>" // default: "5min"
        }}
      ]
    }}
  }}
}}

---

**User Intent:** {user_intent}

**Relevant Examples:**
{context}

---

**Instructions:**
- Generate a complete JSON configuration strictly following the schema above.
- Only fill in sections that are relevant to the given user intent.
- For irrelevant sections, keep the key but return an empty object {{}} or empty list [].
- Output only valid JSON, with no explanations or extra text.
"""

# PROMPT_TEMPLATE = """
# You are a network policy expert.

# The target output must strictly follow **this JSON schema**:

# {
#   "intent": "<Rephrase the user intent in natural language>",
#   "config": {
#     "intent_id": "<Generate a unique INTENT_ID or leave empty>",
#     "user_role": "<USER_ROLE>", // default: "admin"
#     "timestamp": "<current timestamp in ISO format>",
#     "QOS": {
#       "application": "<APPLICATION>", // default: "Web Browsing"
#       "category": "<TRAFFIC_CATEGORY>", // default: "web"
#       "latency": "<LATENCY_THRESHOLD>", // e.g., "50ms"
#       "bandwidth": "<BANDWIDTH_THRESHOLD>", // e.g., "5Mbps"
#       "jitter": "<JITTER_THRESHOLD>", // e.g., "30ms"
#       "priority": "<PRIORITY_LEVEL>", // default: "low"
#       "time_constraints": {
#         "start": "<START_TIME>", // default: now
#         "end": "<END_TIME>",     // default: 1 hour later
#         "days": ["<DAY_1>", "<DAY_2>"] // default: ["Today"]
#       }
#     },
#     "ACL": {
#       "rules": [
#         {
#           "action": "<ACTION>", // "allow" or "deny"
#           "source_ip": "<SOURCE_IP>", // default: "0.0.0.0/0"
#           "destination_ip": "<DESTINATION_IP>", // default: "0.0.0.0/0"
#           "source_port": "<SOURCE_PORT>", // default: "any"
#           "destination_port": "<DESTINATION_PORT>", // default: "any"
#           "protocols": ["<ALLOW_PROTOCOL_1>", "<ALLOW_PROTOCOL_2>"] // default: ["HTTP"]
#         }
#       ],
#       "schedule": {
#         "start": "<ACL_START_TIME>", // default: now
#         "end": "<ACL_END_TIME>"      // default: 24h later
#       }
#     },
#     "LOGS": {
#       "filters": [
#         {
#           "hosts": "<HOST_IP>", // default: "any"
#           "ports": "<FILTER_PORT>", // default: "any"
#           "application": "<FILTER_APPLICATION>", // default: "any"
#           "time_window": "<TIME_WINDOW>" // default: "5min"
#         }
#       ]
#     }
#   }
# }

# ---

# **User Intent:** {user_intent}

# **Relevant Examples:**
# {context}

# ---

# **Instructions:**
# - Generate a complete JSON configuration strictly following the schema above.
# - Only fill in sections that are relevant to the given user intent.
# - For irrelevant sections, keep the key but return an empty object `{}` or empty list `[]`.
# - Output only valid JSON, with no explanations or extra text.
# """

# DeepSeek API Key and Endpoint
DEEPSEEK_API_KEY = "sk-6be2a03a17044757a0465e88d1ecbc00"

# model = ChatOpenAI(
#     openai_api_base="https://api.deepseek.com/v1",
#     openai_api_key=DEEPSEEK_API_KEY,
#     model_name="deepseek-chat",
# )

model = ChatDeepSeek(
    model="deepseek-chat",
    api_key=DEEPSEEK_API_KEY,
    base_url="https://api.deepseek.com/v1",
    temperature=0.1, # Adjust temperature for creativity
)

# # Example Query
# response = model([
#     HumanMessage(content="Make sure video calls always work smoothly during important meetings. , Then use the below template to generate the configuration, do not reason template is {\"intent\": \"<Sample Intent in Natural Language>\", \"config\": {\"intent_id\": \"<INTENT_ID>\", \"user_role\": \"<USER_ROLE>\", \"timestamp\": \"<TIMESTAMP>\", \"QOS\": {\"application\": \"<APPLICATION>\", \"category\": \"<TRAFFIC_CATEGORY>\", \"latency\": \"<LATENCY_THRESHOLD>\", \"bandwidth\": \"<BANDWIDTH_THRESHOLD>\", \"jitter\": \"<JITTER_THRESHOLD>\", \"priority\": \"<PRIORITY_LEVEL>\", \"time_constraints\": {\"start\": \"<START_TIME>\", \"end\": \"<END_TIME>\", \"days\": [\"<DAY_1>\", \"<DAY_2>\", \"<DAY_3>\"]}}, \"ACL\": {\"allow_rules\": [{\"action\": \"<ACTION>\", \"source_ip\": \"<ALLOW_SOURCE_IP>\", \"destination_ip\": \"<ALLOW_DESTINATION_IP>\", \"source_ports\": [\"<ALLOW_PORT_1>\", \"<ALLOW_PORT_2>\"], \"destination_ports\": [\"<ALLOW_PORT_1>\", \"<ALLOW_PORT_2>\"], \"protocols\": [\"<ALLOW_PROTOCOL_1>\", \"<ALLOW_PROTOCOL_2>\"]}], \"schedule\": {\"start\": \"<ACL_START_TIME>\", \"end\": \"<ACL_END_TIME>\"}}, \"LOGS\": {\"filters\": [{\"hosts\": \"<HOST_IP>\", \"ports\": \"<FILTER_PORT>\", \"application\": \"<FILTER_APPLICATION>\", \"time_window\": \"<TIME_WINDOW>\"}]}}}")
# ])
# print(response.content)

# load retrieved context and user query in the prompt template
prompt_template = ChatPromptTemplate.from_template(PROMPT_TEMPLATE)
prompt = prompt_template.format(context=context, user_intent=query)

# call LLM model to generate the answer based on the given context and query
response_text = model.predict(prompt)
print(response_text)


