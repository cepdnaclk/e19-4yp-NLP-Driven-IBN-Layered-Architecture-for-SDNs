#!/bin/bash

if [[ -z "$1" ]]; then
  echo "Usage: $0 <json_file>"
  exit 1
fi

JSON_FILE="$1"

YAML_FILE="network_knowledge.yaml"
OUTPUT_FILE="qos_intents.txt"

> "$OUTPUT_FILE"  # Clear existing

# Read values from JSON
protocol=$(jq -r '.config.QOS.protocol // empty' "$JSON_FILE")
priority=$(jq -r '.config.QOS.priority // "medium"' "$JSON_FILE")
source_ip=$(jq -r '.config.QOS.source_ip // empty' "$JSON_FILE")
source_hostname=$(jq -r '.config.QOS?.source_hostname // ""' "$JSON_FILE")
dest_ip=$(jq -r '.config.QOS.destination_ip // empty' "$JSON_FILE")
dest_hostname=$(jq -r '.config.QOS?.destination_hostname // ""' "$JSON_FILE")

# If protocol is empty, get all protocols from YAML
if [[ -z "$protocol" ]]; then
  mapfile -t protocols < <(yq '.servers.*.traffic-types | keys | .[]' "$YAML_FILE" | sort -u)
else
  protocols=("$protocol")
fi

# Loop over protocols safely
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

# Function: Get MAC for a given IP or Hostname
get_mac() {
  local search="$1"
  yq -r ".all_hosts[] | select(.ip == \"$search\" or .name == \"$search\") | .mac" "$YAML_FILE"
}

# Function: Get all MACs
get_all_macs() {
  yq -r '.all_hosts[].mac' "$YAML_FILE"
}

# Get Source MACs
if [[ -n "$source_ip" || -n "$source_hostname" ]]; then
  src_mac=$(get_mac "${source_ip:-$source_hostname}")
  src_macs=("$src_mac")
else
  mapfile -t src_macs < <(get_all_macs)
fi

# Get Destination MACs
if [[ -n "$dest_ip" || -n "$dest_hostname" ]]; then
  dst_mac=$(get_mac "${dest_ip:-$dest_hostname}")
  dst_macs=("$dst_mac")
else
  mapfile -t dst_macs < <(get_all_macs)
fi

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
			echo "add-host-intent --ipProto=$ip_proto --$proto_key=$port --setQueue=$queue $src $dst" >> "$OUTPUT_FILE"
		done
      else
		echo "add-host-intent --ipProto=$ip_proto --setQueue=$queue $src $dst" >> "$OUTPUT_FILE"
	  fi
    done
  done
done

echo "✅ Intents written to $OUTPUT_FILE"
