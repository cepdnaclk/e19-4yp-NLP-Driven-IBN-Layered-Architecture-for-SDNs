# Network Policy RAG API

A FastAPI application that provides REST endpoints for processing network policy queries using RAG (Retrieval-Augmented Generation).

## Features

- **Query Processing**: Convert natural language network policy requests into structured JSON configurations
- **Context Retrieval**: Retrieve relevant examples from the vector store
- **ACL Integration**: Fetch current ACL rules from ONOS controller
- **Multiple Endpoints**: Full response, simplified response, and debugging endpoints
- **CORS Support**: Cross-origin requests enabled for web applications

## Setup

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Environment Setup

Create a `.env` file in the same directory with your DeepSeek API key:

```env
DEEPSEEK_API_KEY=your_deepseek_api_key_here
```

### 3. Ensure FAISS Index Exists

Make sure you have a `faiss_index_v2` directory with your vector store data in the same directory as the FastAPI app.

## Running the Server

### Development Mode (with auto-reload)

```bash
python fastapi_app.py
```

### Production Mode

```bash
uvicorn fastapi_app:app --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

## API Endpoints

### 1. Health Check

**GET** `/` or `/health`

```json
{
  "status": "healthy",
  "timestamp": "2025-07-19T10:30:00.123456",
  "version": "1.0.0"
}
```

### 2. Process Query (Full Response)

**POST** `/query`

**Request Body:**
```json
{
  "query": "Block all UDP traffic originating from 192.168.1.1",
  "acl_url": "http://10.40.19.248:8181/onos/v1/acl/rules"
}
```

**Response:**
```json
{
  "intent": "Block all UDP traffic originating from 192.168.1.1",
  "config": {
    "intent_id": "INT-20250719103000",
    "user_role": "admin",
    "timestamp": "2025-07-19T10:30:00.123456",
    "QOS": {},
    "ACL": {
      "rules": [
        {
          "action": "deny",
          "source_ip": "192.168.1.1",
          "destination_ip": "0.0.0.0/0",
          "source_port": "any",
          "destination_port": "any",
          "protocols": ["UDP"]
        }
      ]
    },
    "LOGS": {}
  },
  "retrieved_context": "...",
  "acl_rules": "...",
  "timestamp": "2025-07-19T10:30:00.123456",
  "processing_time_ms": 1234.56
}
```

### 3. Process Query (Simple Response)

**POST** `/query/simple`

**Request Body:**
```json
{
  "query": "Allow HTTP traffic from 10.0.0.0/24 to 172.16.1.100"
}
```

**Response:** Returns only the generated configuration JSON.

### 4. Get Context Only (Debug)

**GET** `/context/{query}`

Returns only the retrieved context for debugging purposes.

### 5. Get ACL Rules (Debug)

**GET** `/acl?acl_url={url}`

Returns current ACL rules from the ONOS controller.

## Testing the API

### Using the Test Script

```bash
python test_api.py
```

### Using cURL

```bash
# Health check
curl http://localhost:8000/health

# Process query
curl -X POST "http://localhost:8000/query" \
  -H "Content-Type: application/json" \
  -d '{"query": "Block all UDP traffic originating from 192.168.1.1"}'
```

### Using Python requests

```python
import requests
import json

response = requests.post(
    "http://localhost:8000/query",
    json={"query": "Block all UDP traffic originating from 192.168.1.1"}
)

result = response.json()
print(json.dumps(result, indent=2))
```

## API Documentation

Once the server is running, you can access:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## Error Handling

The API returns appropriate HTTP status codes:

- `200`: Success
- `422`: Validation Error (invalid request format)
- `500`: Internal Server Error

Error responses include detailed error messages:

```json
{
  "detail": "Internal server error: specific error message"
}
```

## Configuration

### Environment Variables

- `DEEPSEEK_API_KEY`: Required - Your DeepSeek API key

### Default Values

- **Host**: `0.0.0.0`
- **Port**: `8000`
- **ACL URL**: `http://10.40.19.248:8181/onos/v1/acl/rules`
- **Vector Store Path**: `faiss_index_v2`
- **Embedding Model**: `sentence-transformers/all-mpnet-base-v2`

## Logging

The application uses Python's built-in logging module. Log level is set to INFO by default.

## CORS

CORS is enabled for all origins in development. For production, configure the `allow_origins` parameter in the CORS middleware appropriately.
