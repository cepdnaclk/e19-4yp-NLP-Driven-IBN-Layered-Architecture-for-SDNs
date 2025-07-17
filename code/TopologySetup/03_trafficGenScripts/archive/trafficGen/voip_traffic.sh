#!/bin/bash

PHASE="$1"
TARGET_IP="$2"

PORT=5061
TOS=184  # DSCP value for EF (Expedited Forwarding)
DURATION=10  # Each "call" simulation lasts 10s
BANDWIDTH="512k"

send_voip_call() {
    iperf3 -c "$TARGET_IP" -u -b "$BANDWIDTH" -t "$DURATION" -p "$PORT" --tos "$TOS" > /dev/null 2>&1 &
}

case "$PHASE" in
    offpeak)
        for i in {1..3}; do
            send_voip_call
            sleep $((RANDOM % 15 + 10))  # Wait 10–25 sec between calls
        done
        ;;
    normal)
        for i in {1..10}; do
            send_voip_call
            sleep $((RANDOM % 8 + 5))  # Wait 5–13 sec
        done
        ;;
    peak)
        for i in {1..20}; do
            send_voip_call
            sleep $((RANDOM % 3 + 2))  # Wait 2–5 sec
        done
        ;;
    burst)
        for i in {1..40}; do
            send_voip_call
            sleep 0.5
        done
        ;;
    *)
        echo "Usage: $0 {offpeak|normal|peak|burst} <server-ip>"
        exit 1
        ;;
esac

wait
