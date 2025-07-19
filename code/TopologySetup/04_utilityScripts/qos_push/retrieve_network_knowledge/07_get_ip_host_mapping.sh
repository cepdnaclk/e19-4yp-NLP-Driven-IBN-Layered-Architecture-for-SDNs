#!/bin/bash
INPUT_FILE="04_clean_hosts.txt"
OUTPUT_CSV="08_ip_host_mapping.csv"
> "$OUTPUT_CSV"

while IFS= read -r line; do
    if [[ "$line" == id=* ]]; then
        ips_raw=$(echo "$line" | grep -oP 'ip\(s\)=\[\K[^\]]+')
        echo "[DEBUG] Line: $line"
        echo "[DEBUG] Extracted IPs: $ips_raw"

        IFS=',' read -ra ips <<< "$ips_raw"

        ip_172=""
        ip_target=""

        for ip in "${ips[@]}"; do
            ip_trim=$(echo "$ip" | xargs)
            echo "[DEBUG] Checking IP: $ip_trim"
            [[ "$ip_trim" == 172.* ]] && ip_172="$ip_trim"
            [[ "$ip_trim" == 192.* || "$ip_trim" == 10.* ]] && ip_target="$ip_trim"
        done

        echo "[DEBUG] Found 172 IP: $ip_172"
        echo "[DEBUG] Found target IP: $ip_target"

        if [[ -n "$ip_172" && -n "$ip_target" ]]; then
			last_byte=$(echo "$ip_172" | awk -F. '{print $4}' | tr -cd '0-9')
            if [[ "$last_byte" =~ ^[0-9]+$ ]]; then
                host_number=$((last_byte - 1))
                echo "mn.d$host_number,$ip_target" >> "$OUTPUT_CSV"
                echo "[DEBUG] Writing: mn.d$host_number,$ip_target"
            fi
        fi
    fi
done < "$INPUT_FILE"
