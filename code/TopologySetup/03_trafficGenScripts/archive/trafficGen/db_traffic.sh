#!/bin/bash

PHASE="$1"
TARGET_IP="$2"

PORT=5432  # Typical PostgreSQL port, change to 3306 for MySQL
DURATION=5  # Each session lasts 5s
BANDWIDTH="1M"

send_db_session() {
    iperf3 -c "$TARGET_IP" -t "$DURATION" -p "$PORT" > /dev/null 2>&1 &
}

case "$PHASE" in
    offpeak)
        for i in {1..3}; do
            send_db_session
            sleep $((RANDOM % 15 + 10))  # 10–25 sec between sessions
        done
        ;;
    normal)
        for i in {1..10}; do
            send_db_session
            sleep $((RANDOM % 8 + 5))  # 5–13 sec
        done
        ;;
    peak)
        for i in {1..25}; do
            send_db_session
            sleep $((RANDOM % 3 + 2))  # 2–5 sec
        done
        ;;
    burst)
        for i in {1..50}; do
            send_db_session
            sleep 0.3  # Super tight burst
        done
        ;;
    *)
        echo "Usage: $0 {offpeak|normal|peak|burst} <server-ip>"
        exit 1
        ;;
esac

wait
