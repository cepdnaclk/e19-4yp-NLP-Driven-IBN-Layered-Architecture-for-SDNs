#!/bin/bash

PHASE="$1"
TARGET_IP="$2"

PORT=5201
DURATION=10  # 10-second streaming simulation
DSCP=46      # DSCP marking for EF (Expedited Forwarding – video/audio)
BASE_BW="5M" # base bandwidth

send_video_session() {
    iperf3 -c "$TARGET_IP" -p "$PORT" -u -t "$DURATION" -b "$1" --dscp $DSCP > /dev/null 2>&1 &
}

case "$PHASE" in
    offpeak)
        for i in {1..3}; do
            send_video_session "2M"
            sleep $((RANDOM % 20 + 15))  # 15–35 sec
        done
        ;;
    normal)
        for i in {1..8}; do
            send_video_session "5M"
            sleep $((RANDOM % 10 + 5))  # 5–15 sec
        done
        ;;
    peak)
        for i in {1..25}; do
            send_video_session "6M"
            sleep $((RANDOM % 5 + 2))  # 2–7 sec
        done
        ;;
    burst)
        for i in {1..40}; do
            send_video_session "10M"
            sleep 0.2  # Fast, dense traffic
        done
        ;;
    *)
        echo "Usage: $0 {offpeak|normal|peak|burst} <server-ip>"
        exit 1
        ;;
esac

wait
