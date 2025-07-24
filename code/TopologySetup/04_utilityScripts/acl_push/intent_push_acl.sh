#!/bin/bash

start_time=$(date +%s%N)

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

DST_IP=$(jq -r '.config.ACL.destination_ip' "$JSON_FILE")
DST_PORTS=$(jq -r '.config.ACL.destination_port | fromjson | join(",")' "$JSON_FILE")
PROTOCOLS=$(jq -r '.config.ACL.protocol | join(",")' "$JSON_FILE")
ACTION=$(jq -r '.config.ACL.action' "$JSON_FILE")

# Convert protocol and action to uppercase
# For protocol, pick first protocol if multiple are present
PROTOCOL_UPPER=$(echo "$PROTOCOLS" | cut -d',' -f1 | tr '[:lower:]' '[:upper:]')
ACTION_UPPER=$(echo "$ACTION" | tr '[:lower:]' '[:upper:]')

# Split destination ports and iterate
IFS=',' read -ra PORT_ARRAY <<< "$DST_PORTS"
for PORT in "${PORT_ARRAY[@]}"; do
  PORT_TRIMMED=$(echo "$PORT" | xargs) # remove any surrounding spaces

  echo "Sending ACL rule for port $PORT_TRIMMED..."

  # Remove any non-digit characters (just in case)
  PORT_NUM=$(echo "$PORT_TRIMMED" | tr -d -c '0-9')

  PAYLOAD=$(cat <<EOF
{
  "srcIp": "0.0.0.0/0",
  "dstIp": "${DST_IP}",
  "ipProto": "${PROTOCOL_UPPER}",
  "dstTpPort": "${PORT_NUM}",
  "action": "${ACTION_UPPER}"
}
EOF
)
  
  echo "Payload being sent:"
  echo "$PAYLOAD" | jq . || echo "$PAYLOAD"

  curl -X POST http://localhost:8181/onos/v1/acl/rules \
       -H "Content-Type: application/json" \
       -u onos:rocks \
       -d "$PAYLOAD"

  echo -e "\nRule for port $PORT_TRIMMED applied.\n"
done

#ORIGINAL_DIR=$(pwd)
#TARGET_DIR="../../03_trafficGenScripts"
#cd "$TARGET_DIR" 
#./stop_schedulers.sh
#cd "$ORIGINAL_DIR"

end_time=$(date +%s%N)
duration_ns=$(( end_time - start_time ))
duration_sec=$(echo "scale=3; $duration_ns / 1000000000" | bc)
echo "Total execution time: ${duration_sec} seconds"

echo "All rules sent."
