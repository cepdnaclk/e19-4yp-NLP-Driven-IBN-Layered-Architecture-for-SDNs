#!/bin/bash

CONFIG_DIR="./trafficConfig"
GENERATOR_DIR="./trafficGen"
SCHEDULER_FILE="./scheduler.sh"

# Ensure required files/dirs exist
if [[ ! -d "$GENERATOR_DIR" || ! -f "$SCHEDULER_FILE" ]]; then
    echo "[✘] Missing required trafficGen directory or schedular.sh script."
    exit 1
fi

echo "Starting Traffic Generation..."

# Iterate over config files
for config_file in "$CONFIG_DIR"/trafficConfig_d*.txt; do
    [[ -e "$config_file" ]] || continue  # Skip if no match

    # Extract index (e.g., from trafficConfig_d1.sh -> 1)
    index=$(basename "$config_file" | grep -oP '(?<=trafficConfig_d)\d+(?=\.txt)')
    container_name="mn.d$index"

    echo "[*] Deploying to $container_name..."

    # Copy files and directories into the container
    docker cp "$GENERATOR_DIR" "$container_name":/root/
    docker cp "$SCHEDULER_FILE" "$container_name":/root/
    docker cp "$config_file" "$container_name":/root/trafficConfig.txt

    # Run the scheduler in the background inside the container
    docker exec -d "$container_name" bash -c "cd /root && chmod +x scheduler.sh && ./scheduler.sh > traffic.log 2>&1 &"

    echo "[✔] Deployment complete for $container_name"
done

echo "🔧 Traffic schedule initiated! Simulated packets are hitting the road"

