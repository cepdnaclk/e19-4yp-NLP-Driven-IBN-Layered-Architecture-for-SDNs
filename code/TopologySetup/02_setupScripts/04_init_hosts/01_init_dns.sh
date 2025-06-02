#!/bin/bash

# Get the total number of lines in the file
end=$(wc -l < clientHostConfig.txt)

# Iterate from 1 to total lines (assumed container suffixes)
for i in $(seq 1 "$end"); do
    container="mn.d$i"
    echo "[*] Updating /etc/resolv.conf in container: $container"
    docker exec "$container" bash -c 'echo "nameserver 8.8.8.8" | tee /etc/resolv.conf > /dev/null'
done

echo "[✔] DNS updated in all containers from mn.d1 to mn.d$end."
