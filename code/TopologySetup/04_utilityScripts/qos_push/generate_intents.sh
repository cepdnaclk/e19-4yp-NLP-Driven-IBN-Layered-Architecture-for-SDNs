#!/bin/bash

if [[ -z "$1" ]]; then
  echo "Usage: $0 <json_file>"
  exit 1
fi

JSON_FILE="$1"

YAML_FILE="network_knowledge.yaml"
OUTPUT_FILE="qos_intents.txt"
RULE_PRIORITY_COUNTER_TXT="./retrieve_network_knowledge/rule_priority_counter.txt"

> "$OUTPUT_FILE"  # Clear existing

# Read values from JSON
protocol=$(jq -r '.config.QOS.protocol // empty' "$JSON_FILE")
priority=$(jq -r '.config.QOS.priority // "medium"' "$JSON_FILE")
RULE_PRIORITY=$(cat $RULE_PRIORITY_COUNTER_TXT)

# If protocol is empty, get all protocols from YAML
if [[ -z "$protocol" ]]; then
  mapfile -t protocols < <(yq '.servers.*.traffic-types | keys | .[]' "$YAML_FILE" | sort -u)
else
  protocols=("$protocol")
fi

# Loop over protocols safely // check - and  []
for proto in "${protocols[@]}"; do
  echo "Ports for protocol: $proto"
  yq ".servers.*.traffic-types.${proto} // [] | .[]" "$YAML_FILE"
done

# Priority to Queue Mapping
case "$priority" in
  low) queue=3 ;;
  medium) queue=2 ;;
  high) queue=1 ;;
  *) queue=2 ;;
esac

dest_ips=()
dest_hostnames=()
src_hostnames=()

for protocol in "${protocols[@]}"; do
  # Get all servers with this traffic-type
  matched_hosts=$(yq e ".servers | to_entries | map(select(.value.\"traffic-types\".$protocol)) | .[].key" "$YAML_FILE")

  while IFS= read -r hostname; do
    ip=$(yq e ".servers[\"$hostname\"].ip" "$YAML_FILE")
    dest_ips+=("$ip")
    dest_hostnames+=("$hostname")

    # Extract src hostnames from .clients.<protocol>
    clients=$(yq e ".servers[\"$hostname\"].clients.$protocol[]" "$YAML_FILE" 2>/dev/null)
    while IFS= read -r client; do
      src_hostnames+=("$client")
    done <<< "$clients"

  done <<< "$matched_hosts"
done

# Remove duplicates
dest_ips=($(printf "%s\n" "${dest_ips[@]}" | sort -u))
dest_hostnames=($(printf "%s\n" "${dest_hostnames[@]}" | sort -u))
src_hostnames=($(printf "%s\n" "${src_hostnames[@]}" | sort -u))

echo "Destination IPs:"
printf "%s\n" "${dest_ips[@]}"

echo -e "\nDestination Hostnames:"
printf "%s\n" "${dest_hostnames[@]}"

echo -e "\nSource Hostnames:"
printf "%s\n" "${src_hostnames[@]}"


get_mac_from_yaml() {
  yq e -r ".all_hosts[] | select(.name == \"$1\") | .mac" "$YAML_FILE"
}

get_all_macs() {
  yq -r '.all_hosts[].mac' "$YAML_FILE"
}

# Destination MACs from hostnames
dst_macs=()
for host in "${dest_hostnames[@]}"; do
  mac=$(get_mac_from_yaml "$host")
  if [[ -n "$mac" && "$mac" != "null" ]]; then
    dst_macs+=("$mac")
  else
    echo "[!] MAC not found for destination host: $host. Using all MACs."
    mapfile -t dst_macs < <(get_all_macs)
  fi
done

# Source MACs from hostnames
src_macs=()
for host in "${src_hostnames[@]}"; do
  mac=$(get_mac_from_yaml "$host")
  if [[ -n "$mac" && "$mac" != "null" ]]; then
    src_macs+=("$mac")
  else
    echo "[!] MAC not found for source host: $host. Using all MACs."
    mapfile -t src_macs < <(get_all_macs)
  fi
done

# Remove duplicates
dst_macs=($(printf "%s\n" "${dst_macs[@]}" | sort -u))
src_macs=($(printf "%s\n" "${src_macs[@]}" | sort -u))

echo -e "\nFinal Destination MACs:"
printf "%s\n" "${dst_macs[@]}"

echo -e "\nFinal Source MACs:"
printf "%s\n" "${src_macs[@]}"

# Iterate over each protocol
for proto in "${protocols[@]}"; do
  # Check if protocol is UDP
	is_udp=$(yq ".stats.isUdp[] | select(. == \"$proto\")" "$YAML_FILE")
	if [[ -n "$is_udp" ]]; then
	  ip_proto=17
	  use_ports=false
	else
	  ip_proto=6
	  proto_key="tcpSrc"
	  use_ports=true
	fi


  # Get destination ports for protocol
  mapfile -t ports < <(yq -r ".servers[].\"traffic-types\".$proto[]?" "$YAML_FILE")

  # Skip if no ports found
  if [[ "${#ports[@]}" -eq 0 ]]; then
    echo "⚠️  No ports found for protocol '$proto', skipping..."
    continue
  fi

  # Generate intents for all src-dst macs and ports
  for src in "${src_macs[@]}"; do
    for dst in "${dst_macs[@]}"; do
      if [[ "$use_ports" == true ]]; then
		for port in "${ports[@]}"; do
			echo "add-host-intent --ipProto=$ip_proto --$proto_key=$port --setQueue=1/$queue --priority=$RULE_PRIORITY $src $dst" >> "$OUTPUT_FILE"
			echo "add-host-intent --ipProto=$ip_proto --$proto_key=$port --setQueue=2/$queue --priority=$RULE_PRIORITY $src $dst" >> "$OUTPUT_FILE"
			echo "add-host-intent --ipProto=$ip_proto --$proto_key=$port --setQueue=3/$queue --priority=$RULE_PRIORITY $src $dst" >> "$OUTPUT_FILE"
			echo "add-host-intent --ipProto=$ip_proto --$proto_key=$port --setQueue=4/$queue --priority=$RULE_PRIORITY $src $dst" >> "$OUTPUT_FILE"

		done
      else
		echo "add-host-intent --ipProto=$ip_proto --setQueue=1/$queue --priority=$RULE_PRIORITY $src $dst" >> "$OUTPUT_FILE"
		echo "add-host-intent --ipProto=$ip_proto --setQueue=2/$queue --priority=$RULE_PRIORITY $src $dst" >> "$OUTPUT_FILE"
		echo "add-host-intent --ipProto=$ip_proto --setQueue=3/$queue --priority=$RULE_PRIORITY $src $dst" >> "$OUTPUT_FILE"
		echo "add-host-intent --ipProto=$ip_proto --setQueue=4/$queue --priority=$RULE_PRIORITY $src $dst" >> "$OUTPUT_FILE"

	  fi
    done
  done
done

NEXT_RULE_PRIORITY=$((RULE_PRIORITY + 1))
echo "$NEXT_RULE_PRIORITY" > $RULE_PRIORITY_COUNTER_TXT

echo "✅ Intents written to $OUTPUT_FILE"
