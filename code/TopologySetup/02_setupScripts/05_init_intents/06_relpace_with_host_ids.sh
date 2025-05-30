#!/bin/bash

# Path to your formatted hosts CSV
csv_file="04_formatted_hosts.csv"

# Input script file containing add-host-intent lines
input_script="05_init_intents.txt"

# Output file for replaced lines
output_script="07_init_intents_replaced.txt"

# Function to lookup ID for a given IP from CSV
lookup_id() {
    local ip="$1"
    # Use grep to find line starting with IP, then cut second column (ID)
    grep -m1 "^${ip}," "$csv_file" | cut -d',' -f2 | tr -d ' '
}

# Clear output file
> "$output_script"

# Process each line of the input script
while read -r line; do
    if [[ "$line" =~ ^add-host-intent[[:space:]]+([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+)[[:space:]]+([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+) ]]; then
        ip1="${BASH_REMATCH[1]}"
        ip2="${BASH_REMATCH[2]}"

        id1=$(lookup_id "$ip1")
        id2=$(lookup_id "$ip2")

        if [[ -n "$id1" && -n "$id2" ]]; then
            echo "add-host-intent $id1 $id2" >> "$output_script"
        else
            echo "Warning: Could not find ID for $ip1 or $ip2. Keeping original line." >&2
            echo "$line" >> "$output_script"
        fi
    else
        # For lines that don't match add-host-intent format, just copy as-is
        echo "$line" >> "$output_script"
    fi
done < "$input_script"

echo "Replacement done. See $output_script"

