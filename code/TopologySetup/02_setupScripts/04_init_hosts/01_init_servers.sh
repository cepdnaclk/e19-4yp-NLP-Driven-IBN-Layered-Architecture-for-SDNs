#!/bin/bash

HOST_SCRIPTS_DIR="./hostScripts"
SERVER_CONFIG="serverHostConfig.txt"
CLIENT_CONFIG="clientHostConfig.txt"

# Function to process a config file (server or client)
process_config() {
    local config_file=$1
    local type=$2  # "server" or "client"

    while IFS=',' read -r container service1 rest; do
        # Collect all services into an array
        IFS=',' read -ra services <<< "${service1},${rest}"

        for service in "${services[@]}"; do
            # Skip if service is "_" or "external" or empty
            if [[ "$service" == "_" || "$service" == "external" || -z "$service" ]]; then
                continue
            fi

            script_name="setup_${type}_${service}.sh"
            script_path="${HOST_SCRIPTS_DIR}/${script_name}"

            if [[ -f "$script_path" ]]; then
                echo "Copying and executing ${script_name} in container ${container}..."
                docker cp "$script_path" "${container}:/tmp/${script_name}"
                docker exec "$container" bash "/tmp/${script_name}"
            else
                echo "⚠️  Script not found: ${script_name}, skipping for container ${container}"
            fi
        done
    done < "$config_file"
}

echo "=== Processing Server Configs ==="
process_config "$SERVER_CONFIG" "server"

echo "=== Processing Client Configs ==="
process_config "$CLIENT_CONFIG" "client"

echo "✅ All scripts processed."
