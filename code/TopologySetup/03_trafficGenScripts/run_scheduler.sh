#!/bin/bash

TRAFFIC_PROFILE="clientTrafficProfile.yaml"

# Check required files
for file in scheduler.sh send_traffic.sh "$TRAFFIC_PROFILE"; do
    [[ ! -f $file ]] && echo "Missing file: $file" && exit 1
done

# Parse clientTrafficProfile.yaml into per-host temp files
echo "Parsing $TRAFFIC_PROFILE..."
hosts=$(yq eval 'keys' "$TRAFFIC_PROFILE" | sed 's/- //g')

for host in $hosts; do
    count=$(yq eval ".\"$host\" | length" "$TRAFFIC_PROFILE")
    if [[ $count -gt 0 ]]; then
        profile_file="${host#mn.}TrafficProfile.yaml"
        echo "Creating traffic profile for $host => $profile_file"

        yq eval ".\"$host\"" "$TRAFFIC_PROFILE" > "$profile_file"

        # Copy files into the container
        echo "Copying files into $host..."
        docker cp scheduler.sh "$host":/root/
        docker cp send_traffic.sh "$host":/root/
        docker cp "$profile_file" "$host":/root/clientTrafficProfile.yaml
        rm profile_file
        
        # Run the scheduler inside container
        echo "Launching traffic scheduler inside $host..."
        docker exec -d "$host" bash -c "cd /root && nohup bash scheduler.sh > traffic.log 2>&1 &"
    else
        echo "Skipping $host (no traffic defined)"
    fi
done

echo "✅ All traffic schedulers launched successfully."
