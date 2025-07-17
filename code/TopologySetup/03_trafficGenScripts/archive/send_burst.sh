#!/bin/bash

PROFILE="clientTrafficProfile.yaml"

if [[ ! -f "$PROFILE" ]]; then
  echo "clientTrafficProfile.yaml not found!"
  exit 1
fi

BURST_COUNT=40
BURST_INTERVAL=0.5

send_burst_traffic() {
  local target_ip="$1"
  local tos="$2"
  local duration="$3"
  local bandwidth="$4"
  local is_udp="$5"
  local port="$6"

  if [[ "$is_udp" == "true" ]]; then
    iperf3 -c "$target_ip" -u -b "$bandwidth" -t "$duration" -p "$port" --tos "$tos" > /dev/null 2>&1 &
  else
    iperf3 -c "$target_ip" -b "$bandwidth" -t "$duration" -p "$port" --tos "$tos" > /dev/null 2>&1 &
  fi
}

readarray -t clients < <(yq e 'keys | .[]' "$PROFILE")

for client in "${clients[@]}"; do
  mapfile -t entries < <(yq e ".\"$client\"[]" "$PROFILE")

  for i in "${!entries[@]}"; do
    base=".\"$client\"[$i]"
    target_ip=$(yq e "$base.server-ip" "$PROFILE")
    tos=$(yq e "$base.tos-value" "$PROFILE")
    duration=$(yq e "$base.duration" "$PROFILE")
    bandwidth=$(yq e "$base.bandwidth" "$PROFILE")
    is_udp=$(yq e "$base.udp" "$PROFILE")
    first_port=$(yq e "$base.server-port[0]" "$PROFILE")

    for ((k=0; k<BURST_COUNT; k++)); do
      send_burst_traffic "$target_ip" "$tos" "$duration" "$bandwidth" "$is_udp" "$first_port"
      sleep "$BURST_INTERVAL"
    done
  done
done

wait
