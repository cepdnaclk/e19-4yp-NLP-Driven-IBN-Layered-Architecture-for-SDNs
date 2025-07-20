#!/bin/bash

input_file="./panel_details.csv"
output_file="../panel_links.csv"

awk -F, 'BEGIN {
    OFS = FS
    print_header = 1
}
NR == 1 {
    print $0
    next
}
{
    # Remove quotes around Dashboard Title
    dashboard = $1
    gsub(/^"|"$/, "", dashboard)

    if (dashboard != prev_dashboard) {
        count = 1
        prev_dashboard = dashboard
    }

    # Replace null with the current panel number
    gsub(/viewPanel=null/, "viewPanel=" count, $3)
    print $1, $2, $3
    count++
}' "$input_file" > "$output_file"

echo "[+] Updated file written to $output_file"
