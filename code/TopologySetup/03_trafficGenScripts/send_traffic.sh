#!/bin/bash

PHASE="$1"
PROFILE="clientTrafficProfile.yaml"

if [[ -z "$PHASE" || ! -f "$PROFILE" ]]; then
  echo "Usage: $0 {offpeak|normal|peak|burst}"
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
    iperf3 -c "$target_ip" -u -b "$bandwidth" -t "$duration" -p "$port" --tos "$tos" > /dev/null 2>&1 &
  else
    iperf3 -c "$target_ip" -b "$bandwidth" -t "$duration" -p "$port" --tos "$tos" > /dev/null 2>&1 &
  fi
}

# Phase-based repetition logic
get_repeats_and_delay() {
  case "$PHASE" in
    offpeak) echo "3 10 25" ;;
    normal)  echo "10 5 13" ;;
    peak)    echo "20 2 5" ;;
    burst)   echo "40 0 0.5" ;;
    *) echo "Invalid phase"; exit 1 ;;
  esac
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
    mapfile -t ports < <(yq e "$base.server-port[]" "$PROFILE")
    
    read repeat min_delay max_delay <<< $(get_repeats_and_delay)

    if [[ "$PHASE" == "burst" ]]; then
      # Use only the first port
      port="${ports[0]}"
      for ((k=0; k<repeat; k++)); do
        send_traffic "$target_ip" "$tos" "$duration" "$bandwidth" "$is_udp" "$port"
        sleep "$max_delay"
      done
    else
      # Use ports excluding the first one
      for ((j=1; j<${#ports[@]}; j++)); do
        port="${ports[$j]}"
        for ((k=0; k<repeat; k++)); do
          send_traffic "$target_ip" "$tos" "$duration" "$bandwidth" "$is_udp" "$port"
          delay=$((RANDOM % (max_delay - min_delay + 1) + min_delay))
          sleep "$delay"
        done
      done
    fi
  done
done

wait
