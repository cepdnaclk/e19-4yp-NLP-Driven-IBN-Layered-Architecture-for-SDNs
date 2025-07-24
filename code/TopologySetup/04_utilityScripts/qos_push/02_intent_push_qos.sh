#!/bin/bash

start_time=$(date +%s%N)

if [[ -z "$1" ]]; then
  echo "Usage: $0 <json_file>"
  exit 1
fi

JSON_FILE="$1"

./generate_intents.sh "$JSON_FILE"
# Wait for generate_intents.sh to complete before proceeding
wait

echo "Intent generation completed."


# ONOS login details
HOST="localhost"
PORT=8101
USER="onos"
PASSWORD="rocks"

INTENTS_FILE="./qos_intents.txt"

# Ensure ~/.ssh exists and clean known hosts for this host:port combo
mkdir -p ~/.ssh
chmod 700 ~/.ssh
ssh-keygen -f ~/.ssh/known_hosts -R "[$HOST]:$PORT" 2>/dev/null

echo "⏳ Waiting for ONOS CLI to become available..."

until sshpass -p "$PASSWORD" ssh -tt -p "$PORT" \
  -o StrictHostKeyChecking=no \
  -o UserKnownHostsFile=/dev/null \
  "$USER@$HOST" "apps -a" 2>/dev/null | grep -q "org.onosproject"; do
    echo "🔄 ONOS not ready yet... retrying in 3s"
    sleep 3
done

echo "✅ ONOS CLI is available."

# Prepare commands to run inside ONOS CLI
{
  # Run all intents line by line
  while IFS= read -r intent_cmd || [[ -n "$intent_cmd" ]]; do
    # Skip empty lines or lines starting with #
    [[ -z "$intent_cmd" || "$intent_cmd" =~ ^# ]] && continue
    echo "$intent_cmd"
  done < "$INTENTS_FILE"

  echo "exit"
} | sshpass -p "$PASSWORD" ssh -tt -p "$PORT" -o StrictHostKeyChecking=no "$USER@$HOST"

echo "✅ Intents applied and SSH session closed."

end_time=$(date +%s%N)
duration_ns=$(( end_time - start_time ))
duration_sec=$(echo "scale=3; $duration_ns / 1000000000" | bc)
echo "Total execution time: ${duration_sec} seconds"
