#!/bin/bash

# Path to credentials file
CRED_FILE="../../../01_topologySpecificConfigs/common/grafana_admin_config.txt"

# Extract username and password
username=$(grep "^username:" "$CRED_FILE" | cut -d':' -f2 | xargs)
password=$(grep "^password:" "$CRED_FILE" | cut -d':' -f2 | xargs)

# Check if credentials were extracted
if [[ -z "$username" || -z "$password" ]]; then
  echo "[!] Failed to extract username or password from $CRED_FILE"
  exit 1
fi

# Fetch dashboards from Grafana and save
curl -s -u "$username:$password" "http://localhost:3000/api/search" -o ./dashboards.json

if [[ $? -ne 0 ]]; then
  echo "[!] Failed to fetch dashboards"
  exit 2
fi

echo "[+] Dashboards saved to ./dashboards.json"

# Check if file exists
if [[ ! -f "./dashboards.json" ]]; then
  echo "[!] File not found: ./dashboards.json"
  exit 3
fi

# Parse and print dashboard titles and URLs
echo "[+] Dashboard Titles and URLs:"
jq -r '.[] | "\"\(.title)\" -> http://localhost:3000\(.url)"' ./dashboards.json
