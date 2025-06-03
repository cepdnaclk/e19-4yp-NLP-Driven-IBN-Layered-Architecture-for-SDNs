#!/bin/bash

CONFIG_FILE="trafficConfig.txt"

# Traffic script map
declare -A TRAFFIC_SCRIPTS
TRAFFIC_SCRIPTS["http"]="./trafficGen/http_traffic.sh"
TRAFFIC_SCRIPTS["voip"]="./voip_traffic.sh"
TRAFFIC_SCRIPTS["db"]="./db_traffic.sh"
TRAFFIC_SCRIPTS["video"]="./video_traffic.sh"
TRAFFIC_SCRIPTS["ftp"]="./ftp_traffic.sh"
TRAFFIC_SCRIPTS["ssh"]="./ssh_traffic.sh"
TRAFFIC_SCRIPTS["mail"]="./mail_traffic.sh"

# Phase by time
get_phase_by_time() {
    hour=$(date +%H)

    if (( hour >= 8 && hour < 10 )) || (( hour >= 15 && hour < 17 )); then
        echo "normal"
    elif (( hour >= 10 && hour < 15 )); then
        echo "peak"
    else
        echo "offpeak"
    fi
}

# Main loop
while true; do
    current_phase=$(get_phase_by_time)
    echo "=== Phase: $current_phase ($(date)) ==="

    # Read each line from the config file
    while IFS=, read -r raw_ip traffic_type; do
        ip=$(echo "$raw_ip" | tr -d '"')

        script=${TRAFFIC_SCRIPTS[$traffic_type]}
        if [[ -x "$script" ]]; then
            echo "Starting $traffic_type traffic to $ip"
            bash "$script" "$current_phase" "$ip" &
            
            # Occasionally inject burst
            if (( RANDOM % 4 == 0 )); then
                echo ">>> Burst for $traffic_type to $ip"
                bash "$script" burst "$ip" &
            fi
        else
            echo "Warning: Script for traffic type '$traffic_type' not found or not executable."
        fi
    done < "$CONFIG_FILE"

    wait
    sleep 2
done
