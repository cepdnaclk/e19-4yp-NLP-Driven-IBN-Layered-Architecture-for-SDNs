from langchain.chat_models import ChatOpenAI
from langchain.schema import HumanMessage

import json
from langchain.schema import Document
# from langchain_huggingface import HuggingFaceEmbeddings
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.vectorstores import FAISS
from langchain.prompts import ChatPromptTemplate

from langchain_deepseek.chat_models import ChatDeepSeek # Deepseek chat model

from langchain.schema import HumanMessage, AIMessage, SystemMessage

from datetime import datetime

import requests

import os
from dotenv import load_dotenv

# DeepSeek API Key and Endpoint
load_dotenv()
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")

if not DEEPSEEK_API_KEY:
    raise EnvironmentError("[ERROR] DEEPSEEK_API_KEY is not set! Please set it in your environment or .env.")


# queriying the knowledge base and retrieving the additional context

query = "Block all UDP traffic originating from 192.168.1.1"

chat_history = [
    SystemMessage(content="You are a helpful network policy expert.")
]

def retriever_agent(query):
    vector_store_path = "faiss_index_v2"

    embedding_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-mpnet-base-v2")

    print("[INFO] Loading FAISS index from disk...")
    vector_store = FAISS.load_local(vector_store_path, embedding_model, allow_dangerous_deserialization=True)

    print(query)
    retrieved_docs = vector_store.similarity_search_with_score(query, k=3)

    context = "\n\n".join([
        f"Intent: {doc.page_content}\nConfig: {json.dumps(doc.metadata['config'])}"
        for doc, _ in retrieved_docs
    ])

    print(context)

    return context



model = ChatDeepSeek(
    model="deepseek-chat",
    api_key=DEEPSEEK_API_KEY,
    base_url="https://api.deepseek.com/v1",
    temperature=0.1, # Adjust temperature for creativity
)

MAX_HISTORY = 3 #

def template_generator_agent(user_intent, context, acl_rules, system_timestamp):
    PROMPT_TEMPLATE = """
    You are a network policy expert.

    The target output must strictly follow **this JSON schema**:

    {{
    "intent": "<Rephrase the user intent in natural language>",
    "config": {{
        "intent_id": "<Generate a unique identifier that includes the current timestamp (e.g., INT-<YYYYMMDDHHMMSS>>",
        "user_role": "<USER_ROLE>", // default: "admin"
        "timestamp": {system_timestamp},
        "QOS": {{
            "application": "<APPLICATION>", // default: "Web Browsing"
            "protocol": "<TRAFFIC_PROTOCOL>", // default=>"http"; "video", "voip", "ftp", "mail", "db", "ssh"
            "latency": "<LATENCY_THRESHOLD>", // e.g., "50ms"
            "bandwidth": "<BANDWIDTH_THRESHOLD>", // e.g., "5Mbps"
            "jitter": "<JITTER_THRESHOLD>", // e.g., "30ms", use milliseconds only
            "priority": "<PRIORITY_LEVEL>", // default: "low"
            "time_constraints": {{
                "start": "<START_TIME>", 
                "end": "<END_TIME>",    
                "days": ["<DAY_1>", "<DAY_2>"] 
        }}
        }},
        "ACL": {{
            "rules": [
                {{
                "action": "<ACTION>", // "allow" or "deny"
                "source_ip": "<SOURCE_IP>", // default: "0.0.0.0/0"
                "destination_ip": "<DESTINATION_IP>", // default: "0.0.0.0/0"
                "source_port": "<SOURCE_PORT>", // default: null 
                "destination_port": "<DESTINATION_PORT>", // default: null or array
                "protocols": ["<ALLOW_PROTOCOL_1>", "<ALLOW_PROTOCOL_2>"] // default: ["HTTP"]
                }}
            ],
            "schedule": {{
                "start": "<ACL_START_TIME>", 
                "end": "<ACL_END_TIME>"      
        }}
        }},
        "LOGS": {{
            "filters": [
                {{
                "hosts": "<HOST_IP>",
                "ports": "<FILTER_PORT>", 
                "application": "<FILTER_APPLICATION>", 
                "time_window": "<TIME_WINDOW>" 
                }}
            ]
        }}
    }}
    }}

    ---

    **User Intent:** {user_intent}

    **Relevant Examples:**
    {context}

    **Existing ACL Rules:** {acl_rules}

    ---

    **Instructions:**
    - First, provide a brief explanation/reasoning for the intent configuration. **Do not use markdown heading syntax (e.g., '###') for the "Explanation/Reasoning:" and "JSON Configuration:" titles.**
    - Then, provide the JSON configuration wrapped in \\\json and \\\
    - Generate a complete JSON configuration strictly following the schema above.
    - Analyze the given relevant examples as an aid to generate the configuration.
    - If the user intent has to create new ACL rules, compare and check whether they conflict with existing rules. If there are conflicts, resolve them by modifying the new rules or suggesting changes to existing rules.
    - Only fill in sections that are relevant to the given user intent.
    - For irrelevant sections, keep the key but return an empty object {{}} or empty list [].
    - Do not add additional fields that are not specified in the schema when generating the config. Even if a field seems relevant or important, omit it unless it is part of the schema.
    - If a field doesn't apply to the user intent and it doesn't have a default value, don't add that field to the JSON.
    """
    # return PROMPT_TEMPLATE.format(user_intent=user_intent, context=context)
    prompt_template = ChatPromptTemplate.from_template(PROMPT_TEMPLATE)
    prompt = prompt_template.format(user_intent=user_intent, context=context, acl_rules=acl_rules, system_timestamp=system_timestamp)

    chat_history.append(HumanMessage(content=prompt))

    if len(chat_history) > (MAX_HISTORY *2 + 1): #each turn = Human + AI
        chat_history[:] = [chat_history[0]] + chat_history[-(MAX_HISTORY * 2):]

    response_text = model.invoke(chat_history)

    chat_history.append(response_text.content)

    return response_text.content

def acl_retriever_agent(acl_url):
    try:
        response = requests.get(acl_url, auth=('onos', 'rocks'), timeout=10)
        response.raise_for_status()  # raise error if status != 200
        acl_data = response.json()   # assuming the API returns JSON
    except Exception as e:
        print(f"[ERROR] Failed to retrieve ACL rules: {e}")
        # Fallback to empty list or object
        acl_data = {"rules": []}

    # Format ACL data nicely for inclusion in prompt
    acl_context = json.dumps(acl_data, indent=4)
    return acl_context


if __name__ == "__main__":
    user_query = "Prioritize HTTP traffic reaching the HTTP server at 192.168.0.1"
    system_timestamp = datetime.now().isoformat()
    retrieved_context = retriever_agent(user_query)
    acl_rules = acl_retriever_agent("http://10.40.19.248:8181/onos/v1/acl/rules")
    print("acl rules:", acl_rules)
    output = template_generator_agent(user_query, retrieved_context, acl_rules, system_timestamp)
    print("=== AI RESPONSE ===")
    print(output)


