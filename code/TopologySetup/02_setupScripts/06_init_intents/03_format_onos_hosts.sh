#!/bin/bash

# Find latest ONOS hosts output file
input_file=$(ls -t 02_onos_hosts.txt 2>/dev/null | head -n 1)

# Exit if none found
if [[ -z "$input_file" ]]; then
    echo "No onos_hosts.txt files found."
    exit 1
fi

# Output file
output_file="04_formatted_hosts.csv"

# Clear previous output
> "$output_file"

# Process the latest file
grep "id=" "$input_file" | while read -r line; do
    id=$(echo "$line" | grep -oP 'id=\K[^,]+')
    
    # Extract IPs list and remove whitespace
    ips=$(echo "$line" | grep -oP 'ip\(s\)=\[\K[^\]]+' | tr -d ' ')

    # Split into array and find the first non-172.* IP
    # because 172 range belongs to monitoring network
    selected_ip=""
    IFS=',' read -ra ip_array <<< "$ips"
    for ip in "${ip_array[@]}"; do
        if [[ ! $ip =~ ^172\. ]]; then
            selected_ip=$ip
            break
        fi
    done

    if [[ -n "$selected_ip" && -n "$id" ]]; then
        echo "$selected_ip, $id" >> "$output_file"
    fi
done

echo "✅ Formatted output written to $output_file"
