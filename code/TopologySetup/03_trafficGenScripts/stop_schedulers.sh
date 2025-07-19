#!/bin/bash

TRAFFIC_PROFILE="clientTrafficProfile.yaml"

# Check for the profile file
if [[ ! -f "$TRAFFIC_PROFILE" ]]; then
    echo "Missing traffic profile: $TRAFFIC_PROFILE"
    exit 1
fi

# Get all hostnames
hosts=$(yq eval 'keys' "$TRAFFIC_PROFILE" | sed 's/- //g')

for host in $hosts; do
    echo "Stopping traffic in $host..."

    # Gracefully kill scheduler and traffic scripts
    docker exec "$host" pkill -f scheduler.sh
    docker exec "$host" pkill -f send_traffic.sh

    # Kill any lingering iperf3 clients
    docker exec "$host" pkill -f 'iperf3 -c'

    echo "✔️  Killed processes in $host"
done

echo "✅ All iperf3 client processes stopped."
