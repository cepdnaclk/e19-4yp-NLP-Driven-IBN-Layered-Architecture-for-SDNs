#!/bin/bash

# Trap cleanup on Ctrl+C
cleanup() {
    echo "Stopping traffic scheduler..."
    pkill -f "traffic.sh regular"
    pkill -f "traffic.sh burst"
    exit 0
}
trap cleanup SIGINT

log_event() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Start regular traffic (runs forever with auto-restart internally)
log_event "Starting regular traffic..."
./send_traffic.sh regular &

# Monitor loop to trigger occasional bursts
while true; do
    sleep 30  # check every 30 seconds

    if (( RANDOM % 10 == 0 )); then
        log_event "Triggering burst traffic..."
        ./send_traffic.sh burst &
    fi
done
