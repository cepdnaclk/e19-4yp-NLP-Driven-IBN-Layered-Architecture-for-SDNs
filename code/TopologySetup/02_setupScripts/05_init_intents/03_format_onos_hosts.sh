#!/bin/bash

# Find latest ONOS hosts output file
input_file=$(ls -t 02_onos_hosts_*.txt 2>/dev/null | head -n 1)

# Exit if none found
if [[ -z "$input_file" ]]; then
    echo "No onos_hosts_*.txt files found."
    exit 1
fi

# Output file
output_file="04_formatted_hosts.csv"

# Clear previous output
> "$output_file"

# Process the latest file
grep "id=" "$input_file" | while read -r line; do
    id=$(echo "$line" | grep -oP 'id=\K[^,]+')
    ip=$(echo "$line" | grep -oP 'ip\(s\)=\[\K[^\]]+')
    
    if [[ -n "$ip" && -n "$id" ]]; then
        echo "$ip, $id" >> "$output_file"
    fi
done

echo "Formatted output written to $output_file"

