#!/bin/bash

# Check if a JSON file path was provided
if [ "$#" -ne 1 ]; then
  echo "Usage: $0 <json_input_file>"
  exit 1
fi

JSON_FILE="$1"

# Validate file exists
if [ ! -f "$JSON_FILE" ]; then
  echo "File not found: $JSON_FILE"
  exit 1
fi

# Extract required fields from the input JSON using jq
DST_IP=$(jq -r '.config.ACL.source_ip' "$JSON_FILE")
DST_PORT=$(jq -r '.config.ACL.destination_port' "$JSON_FILE")
PROTOCOL=$(jq -r '.config.ACL.protocol' "$JSON_FILE")
ACTION=$(jq -r '.config.ACL.action' "$JSON_FILE")

# Formatted JSON payload
read -r -d '' PAYLOAD <<EOF
{
  "priority": 100,
  "srcIp": "0.0.0.0/0",
  "dstIp": "${DST_IP}",
  "protocol": "${PROTOCOL^^}",
  "dstPort": ${DST_PORT},
  "action": "${ACTION^^}"
}
EOF

# Send the request
echo "Sending ACL rule to ONOS..."
curl -X POST http://localhost:8181/onos/v1/acl/rules \
     -H "Content-Type: application/json" \
     -u onos:rocks \
     -d "$PAYLOAD"

echo -e "\nDone."
