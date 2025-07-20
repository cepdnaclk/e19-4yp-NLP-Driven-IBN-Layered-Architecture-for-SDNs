#!/bin/bash

# Path to credentials
CRED_FILE="../../../01_topologySpecificConfigs/common/grafana_admin_config.txt"

# Extract username and password
username=$(grep "^username:" "$CRED_FILE" | cut -d':' -f2 | xargs)
password=$(grep "^password:" "$CRED_FILE" | cut -d':' -f2 | xargs)

# Output CSV
OUTPUT_FILE="./panel_details.csv"
echo '"Dashboard Title","Panel Title","URL"' > "$OUTPUT_FILE"

# Loop through dashboards.json entries
jq -c '.[]' dashboards.json | while read -r dashboard; do
  uid=$(echo "$dashboard" | jq -r '.uid')
  slug=$(echo "$dashboard" | jq -r '.uri' | sed 's/.*\///')
  dash_title=$(echo "$dashboard" | jq -r '.title')

  # Fetch full dashboard JSON
  dash_json=$(curl -s -u "$username:$password" "http://localhost:3000/api/dashboards/uid/$uid")

  # Loop through panels
  echo "$dash_json" | jq -c '.dashboard.panels[]?' | while read -r panel; do
    panel_title=$(echo "$panel" | jq -r '.title')
    panel_id=$(echo "$panel" | jq -r '.id')
    url="http://localhost:3000/d/$uid/$slug?viewPanel=$panel_id"
    echo "\"$dash_title\",\"$panel_title\",\"$url\"" >> "$OUTPUT_FILE"
  done
done

echo "[+] Panel URLs written to $OUTPUT_FILE"
