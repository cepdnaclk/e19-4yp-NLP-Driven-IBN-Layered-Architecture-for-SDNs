#!/bin/bash

SERVER_YAML="serverProfile.yaml"

# 🔧 Define a writable log directory
LOG_DIR="$HOME/logs"      # or you can use: LOG_DIR="$(pwd)/logs"
mkdir -p "$LOG_DIR"       # create it if not exists

# Extract all server names
servers=$(grep '^[^[:space:]]' "$SERVER_YAML" | grep -v 'totalHosts' | sed 's/://')

for server in $servers; do
  # Extract all lines related to this server's services
  services=$(awk -v srv="$server" '
    $0 ~ "^"srv":" {in_srv=1; next}
    in_srv && $0 ~ "^-" { print; next }
    in_srv && $0 !~ "^-|^$" { exit }
  ' "$SERVER_YAML")

  echo "🔧 Starting iperf3 servers inside $server..."

  # For each service line 
  while read -r line; do
    service=$(echo "$line" | sed -n 's/- \(.*\):.*/\1/p')
    ports=$(echo "$line" | grep -o '\[.*\]' | tr -d '[]')
    IFS=',' read -ra port_array <<< "$ports"

    for port in "${port_array[@]}"; do
      echo "🚀 Starting $service server on port $port in $server"
      # 🔧 Redirect logs to LOG_DIR instead of /var/log
      docker exec -d "$server" iperf3 -s -V -p "$port" > "${LOG_DIR}/${service}_iperf3_server_${port}.log" 2>&1
    done
  done <<< "$services"

done
