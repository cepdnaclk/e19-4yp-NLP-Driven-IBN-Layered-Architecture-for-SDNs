#!/bin/bash

CONFIG_FILE="02_grafana_config.txt"
CONTAINER_NAME="grafana"
NETWORK_NAME="bridge"

# Check if the container exists
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  echo "Container '$CONTAINER_NAME' not found."
  exit 1
fi

# Use docker network inspect to find the IP using the container name
GRAFANA_IP=$(docker network inspect "$NETWORK_NAME" \
  | jq -r --arg NAME "$CONTAINER_NAME" \
  '.[]?.Containers[] | select(.Name == $NAME) | .IPv4Address' \
  | cut -d'/' -f1)

if [[ "$GRAFANA_IP" != 172.* ]]; then
  echo "Failed to find a 172.* IP address for '$CONTAINER_NAME' in '$NETWORK_NAME'."
  exit 1
fi

# Replace or append the IP field in the config file
if grep -q '^ip:' "$CONFIG_FILE"; then
  sed -i "s/^ip:.*/ip: $GRAFANA_IP/" "$CONFIG_FILE"
else
  echo "ip: $GRAFANA_IP" >> "$CONFIG_FILE"
fi

echo "Updated IP in $CONFIG_FILE to $GRAFANA_IP"
