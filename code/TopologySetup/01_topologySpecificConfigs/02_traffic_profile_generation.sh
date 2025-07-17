#!/bin/bash

# Validate input
if [[ $# -ne 1 ]]; then
  echo "Usage: $0 <number between 01-03>"
  exit 1
fi

case "$1" in
  01|02|03) ;;
  *) echo "Invalid input. Please provide 01, 02, or 03."
     exit 1
     ;;
esac

# Find the folder
FOLDER=$(ls -d ${1}_*/ 2>/dev/null | head -n 1)

if [[ -z "$FOLDER" ]]; then
  echo "Folder starting with ${1}_ not found."
  exit 1
fi

cd "$FOLDER" || exit 1

SERVER_CONFIG="serverHostConfig.txt"
CLIENT_CONFIG="clientHostConfig.txt"
IP_MAPPING="__hostIpMapping.txt"
TOS_MAPPING="../common/trafficTypeToTosValueMapping.txt"

# Check required files
if [[ ! -f $SERVER_CONFIG || ! -f $CLIENT_CONFIG || ! -f $IP_MAPPING || ! -f $TOS_MAPPING ]]; then
  echo "Missing one or more required files:"
  [[ ! -f $SERVER_CONFIG ]] && echo " - $SERVER_CONFIG not found"
  [[ ! -f $CLIENT_CONFIG ]] && echo " - $CLIENT_CONFIG not found"
  [[ ! -f $IP_MAPPING ]] && echo " - $IP_MAPPING not found"
  [[ ! -f $TOS_MAPPING ]] && echo " - $TOS_MAPPING not found"
  exit 1
fi

# Declare associative arrays
declare -A service_counts
declare -A server_services

# Define base ports
declare -A base_ports=(
  [http]=80
  [ssh]=220
  [voip]=16390
  [video]=5004
  [db]=3306
  [mail]=25
  [ftp]=20
)

# Read client config and count number of clients per service
declare -A service_client_counts
while IFS=',' read -r client services; do
  IFS=',' read -ra service_array <<< "$services"
  for service in "${service_array[@]}"; do
    [[ "$service" != "_" ]] && ((service_client_counts[$service]++))
  done
done < <(grep -v '^#' "$CLIENT_CONFIG")

# Read server config and store services per server
while IFS=',' read -r server services; do
  IFS=',' read -ra service_array <<< "$services"
  for service in "${service_array[@]}"; do
    [[ "$service" != "_" ]] && server_services[$server]+="$service "
  done
done < <(grep -v '^#' "$SERVER_CONFIG")

# Generate serverProfile.yaml
echo "Generating serverPortConfig.yaml..."
> serverProfile.yaml
declare -A port_alloc_pointer

for server in "${!server_services[@]}"; do
  echo "$server:" >> serverProfile.yaml
  for service in ${server_services[$server]}; do
    base=${base_ports[$service]}
    count=${service_client_counts[$service]:-0}
    ports=($base)
    for ((i=1; i<=count; i++)); do
      ports+=("$((base+i))")
    done
    port_alloc_pointer["$server,$service"]="${ports[@]}"
    if [[ -n "$service" ]]; then
		printf -- "- %s: [%s]\n" "$service" "$(IFS=,; echo "${ports[*]}")" >> serverProfile.yaml
	fi
  done
done

# Count all non-empty lines in serverHostConfig.txt
total_hosts=$(grep -v '^\s*$' serverHostConfig.txt | wc -l)
echo "totalHosts: $total_hosts" >> serverProfile.yaml

# Read IP mapping into associative array
declare -A ip_map
while IFS=',' read -r host ip; do
  ip_map[$(echo "$host" | xargs)]="$(echo "$ip" | xargs)"
done < "$IP_MAPPING"

# Read full TOS mapping (TOS, duration, bandwidth, protocol) into associative arrays
declare -A tos_map duration_map bandwidth_map proto_map

while IFS=',' read -r service tos duration bandwidth proto; do
  key="$(echo "$service" | xargs)"
  tos_map[$key]="$(echo "$tos" | xargs)"
  duration_map[$key]="$(echo "$duration" | xargs | tr -d '"')"
  bandwidth_map[$key]="$(echo "$bandwidth" | xargs | tr -d '"')"
  proto_map[$key]="$(echo "$proto" | xargs)"
done < "$TOS_MAPPING"

# Generate clientTrafficProfile.yaml
echo "Generating clientTrafficProfile.yaml..."
> clientTrafficProfile.yaml

while IFS=',' read -r client services; do
  echo "$client:" >> clientTrafficProfile.yaml
  IFS=',' read -ra service_array <<< "$services"
  for service in "${service_array[@]}"; do
    [[ "$service" == "_" ]] && continue
    # Find matching server(s)
    for server in "${!server_services[@]}"; do
      if [[ " ${server_services[$server]} " =~ " $service " ]]; then
        ip="${ip_map[$server]}"
        ports=(${port_alloc_pointer["$server,$service"]})
        default=${ports[0]}
        assigned=${ports[-1]}
        # remove used port from list
        port_alloc_pointer["$server,$service"]="${ports[@]:0:${#ports[@]}-1}"
        
        tos=${tos_map[$service]}
        duration=${duration_map[$service]}
        bandwidth=${bandwidth_map[$service]}
        proto=${proto_map[$service]}
        [[ "$proto" == "u" ]] && udp="true" || udp="false"

        echo "- server-ip: $ip" >> clientTrafficProfile.yaml
        echo "  server-port: [$default, $assigned]" >> clientTrafficProfile.yaml
        echo "  tos: $tos" >> clientTrafficProfile.yaml
        echo "  duration: $duration" >> clientTrafficProfile.yaml
        echo "  bandwidth: \"$bandwidth\"" >> clientTrafficProfile.yaml
        echo "  udp: $udp" >> clientTrafficProfile.yaml
        break
      fi
    done
  done
done < "$CLIENT_CONFIG"


echo "✅ All the Server and Client Profiles are ready now"

