#!/bin/bash

# Input paths
SERVER_PROFILE="../../../02_setupScripts/05_init_hosts/serverProfile.yaml"
IP_HOST_MAPPING="./08_ip_host_mapping.csv"
IP_MAC_MAPPING="./06_ip_mac_mapping.csv"
OUTPUT_FILE="../network_knowledge.yaml"

# Temporary maps
declare -A host_ip_map
declare -A ip_mac_map
declare -A server_traffic_map

# Load IP ↔ Hostname
while IFS=, read -r host ip; do
    ip=$(echo "$ip" | xargs)
    host=$(echo "$host" | xargs)
    host_ip_map["$host"]="$ip"
done < <(grep '^mn\.' "$IP_HOST_MAPPING")

# Load IP ↔ MAC
while IFS=',' read -r ip mac; do
    ip=$(echo "$ip" | xargs)
    mac=$(echo "$mac" | xargs)
    ip_mac_map["$ip"]="$mac"
done < "$IP_MAC_MAPPING"

# Read server profile
current_host=""
while IFS= read -r line; do
    [[ -z "$line" ]] && continue

    if [[ "$line" =~ ^[[:space:]]*mn\.d[0-9]+: ]]; then
        current_host=$(echo "$line" | cut -d':' -f1 | xargs)
        # initialize empty string for host
        server_traffic_map["$current_host"]=""
        continue
    fi

    if [[ "$line" =~ -[[:space:]]*([a-zA-Z0-9_]+):[[:space:]]*\[(.*)\] ]]; then
        service=$(echo "$line" | sed -nE 's/.*- *([^:]+):.*/\1/p' | xargs)
        ports=$(echo "$line" | sed -nE 's/.*: *\[([0-9, ]+)\].*/\1/p' | xargs)
        # Append line properly with newline, keep full list intact
        server_traffic_map["$current_host"]+="$service: [$ports]
"
    fi
done < "$SERVER_PROFILE"

# Start writing YAML
{
echo "servers:"
for host in "${!server_traffic_map[@]}"; do
    ip="${host_ip_map[$host]}"
    echo "  $host:"
    echo "    ip: $ip"
    echo "    traffic-types:"
    # Print stored lines directly with proper indentation
    while IFS= read -r traffic_line; do
        [[ -z "$traffic_line" ]] && continue
        echo "        $traffic_line"
    done <<< "${server_traffic_map[$host]}"
done


echo ""
echo "all_hosts:"
# For all hosts (from IP ↔ MAC), try to resolve hostname via IP
for ip in "${!ip_mac_map[@]}"; do
    mac="${ip_mac_map[$ip]}"
    name=""
    for host in "${!host_ip_map[@]}"; do
        [[ "${host_ip_map[$host]}" == "$ip" ]] && name="$host" && break
    done
    # If no hostname, label as unknown
    [[ -z "$name" ]] && name="unknown"
    echo "  - name: $name"
    echo "    ip: $ip"
    echo "    mac: $mac"
done

echo ""
echo "stats:"
echo "  total_servers: ${#server_traffic_map[@]}"
echo "  total_hosts: ${#ip_mac_map[@]}"
echo "  isUdp:"
echo "    - voip"

} > "$OUTPUT_FILE"

echo "✅ Generated $OUTPUT_FILE"
