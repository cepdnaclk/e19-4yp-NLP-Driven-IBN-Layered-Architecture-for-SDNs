#!/bin/bash

PHASE="$1"
PROFILE="clientTrafficProfile.yaml"

if [[ "$PHASE" != "regular" && "$PHASE" != "burst" ]] || [[ ! -f "$PROFILE" ]]; then
  echo "Usage: $0 {regular|burst}"
  exit 1
fi

send_traffic() {
  local target_ip="$1"
  local tos="$2"
  local duration="$3"
  local bandwidth="$4"
  local is_udp="$5"
  local port="$6"

  if [[ "$is_udp" == "true" ]]; then
    iperf3 -c "$target_ip" -u -b "$bandwidth" -t "$duration" -p "$port" --tos "$tos" > /dev/null 2>&1
  else
    iperf3 -c "$target_ip" -b "$bandwidth" -t "$duration" -p "$port" --tos "$tos" > /dev/null 2>&1
  fi
}

entry_count=$(yq e 'length' "$PROFILE")

for ((i = 0; i < entry_count; i++)); do
  base=".[$i]"
  target_ip=$(yq e "$base.server-ip" "$PROFILE")
  tos=$(yq e "$base.tos" "$PROFILE")
  bandwidth=$(yq e "$base.bandwidth" "$PROFILE")
  is_udp=$(yq e "$base.udp" "$PROFILE")
  mapfile -t ports < <(yq e "$base.server-port[]" "$PROFILE")

  if [[ "$PHASE" == "regular" ]]; then
    # Use second port in infinite loop, one per server in background
    (
      port="${ports[1]}"
      while true; do
        send_traffic "$target_ip" "$tos" 86400 "$bandwidth" "$is_udp" "$port"
      done
    ) &
  else  # burst phase
    # Use first port, send 40 short bursts
    port="${ports[0]}"
    for ((k=0; k<40; k++)); do
      duration=$((RANDOM % 4 + 2))  # 2–5 seconds
      send_traffic "$target_ip" "$tos" "$duration" "$bandwidth" "$is_udp" "$port" &
      sleep $(awk -v min=0.1 -v max=0.6 'BEGIN {srand(); print min + rand() * (max - min)}')
    done
  fi
done

wait
