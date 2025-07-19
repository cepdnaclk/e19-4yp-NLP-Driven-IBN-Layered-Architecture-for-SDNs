#!/bin/bash

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

log_phase() {
    echo "=== Phase: $1 ($(date '+%Y-%m-%d %H:%M:%S')) ==="
}

# Trap cleanup on Ctrl+C
cleanup() {
    echo "Stopping traffic scheduler..."
    pkill -f send_traffic.sh
    exit 0
}
trap cleanup SIGINT

# Main loop
while true; do
    current_phase=$(get_phase_by_time)
    log_phase "$current_phase"

    # Occasionally trigger burst traffic (10% chance per cycle)
    if (( RANDOM % 10 == 0 )); then
        echo "--- Triggering burst traffic ---"
        ./send_traffic.sh burst &
    fi

    # Send regular traffic
    ./send_traffic.sh "$current_phase" &

    # Wait for the duration of regular traffic phase before next cycle
    case "$current_phase" in
        offpeak) sleep 90 ;;
        normal)  sleep 60 ;;
        peak)    sleep 45 ;;
    esac
done
