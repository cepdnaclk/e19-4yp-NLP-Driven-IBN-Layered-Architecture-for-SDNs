#!/bin/bash

CONFIG_FILE="02_grafana_config.txt"
DASHBOARD_FOLDER="dashboards" 

# Read values from config file
USERNAME=$(grep '^username:' "$CONFIG_FILE" | cut -d':' -f2 | xargs)
PASSWORD=$(grep '^password:' "$CONFIG_FILE" | cut -d':' -f2 | xargs)
IP=$(grep '^ip:' "$CONFIG_FILE" | cut -d':' -f2 | xargs)

# Construct the Grafana API URL
GRAFANA_URL="http://$USERNAME:$PASSWORD@$IP:3000"

echo "$GRAFANA_URL"

for file in "$DASHBOARD_FOLDER"/*.json; do
  echo "Uploading $file..."

  # Wrap the JSON with the required Grafana structure
  payload=$(jq -n --argjson dashboard "$(cat "$file")" \
    '{dashboard: $dashboard, overwrite: true}')

  curl -s -H "Content-Type: application/json" \
       -X POST "$GRAFANA_URL/api/dashboards/db" \
       -d "$payload"

  echo "Uploaded $file"
done
