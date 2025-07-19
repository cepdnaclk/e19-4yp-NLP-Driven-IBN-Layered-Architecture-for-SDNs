#!/bin/bash

# Input from raw ONOS CLI output
input_file="02_onos_cli_output.txt"
cleaned_file="04_clean_hosts.txt"

# Step 1: Remove ANSI escape sequences and control chars
# Step 2: Extract lines starting with 'id='
sed -E 's/.*(id=)/\1/' "$input_file" | grep '^id=' > "$cleaned_file"

echo "Cleaned ONOS host info saved to: $cleaned_file"
