#!/bin/bash

# Usage: ./http_traffic.sh <phase> <target_ip>
# Phases: offpeak, normal, peak, burst

PHASE="$1"
TARGET_IP="$2"

if [[ -z "$PHASE" || -z "$TARGET_IP" ]]; then
    echo "Usage: $0 <phase: offpeak|normal|peak|burst> <target_ip>"
    exit 1
fi

generate_requests() {
    local rate=$1
    local parallel=$2
    local duration=$3

    end=$((SECONDS + duration))
    while [ $SECONDS -lt $end ]; do
        for i in $(seq 1 "$parallel"); do
            curl -s "http://$TARGET_IP" >/dev/null &
        done
        sleep "$rate"
    done
    wait
}

case "$PHASE" in
    offpeak)
        echo "[*] Off-peak: Low frequency..."
        generate_requests 10 1 60   # every 10s, 1 request, 1 min
        ;;
    normal)
        echo "[*] Normal load: Regular traffic..."
        generate_requests 5 2 60    # every 5s, 2 requests, 1 min
        ;;
    peak)
        echo "[*] Peak hour: High parallel traffic..."
        generate_requests 2 5 60    # every 2s, 5 requests, 1 min
        ;;
    burst)
        echo "[*] Burst mode: Sudden traffic spike..."
        generate_requests 0.5 10 20 # every 0.5s, 10 requests, 20s
        ;;
    *)
        echo "Invalid phase: $PHASE"
        exit 1
        ;;
esac

