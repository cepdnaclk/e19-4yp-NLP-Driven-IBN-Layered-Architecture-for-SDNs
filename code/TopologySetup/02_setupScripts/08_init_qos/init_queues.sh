#!/bin/bash

iface="$1"
speed=$(ethtool $iface 2>/dev/null | grep Speed | awk '{print $2}' | sed 's/Mb\/s//')
bps=$((speed * 1000000))

min_q1=$((bps / 2))
max_q1=$((bps / 1))
min_q2=$((bps / 8))
max_q2=$((bps / 2))
min_q3=$((bps / 40))
max_q3=$((bps / 8))

sudo ovs-vsctl set port $iface qos=@newqos \
  -- --id=@newqos create qos type=linux-htb other-config:max-rate=$bps \
  queues:1=@q1 queues:2=@q2 queues:3=@q3 \
  -- --id=@q1 create queue other-config:min-rate=$min_q1 other-config:max-rate=$max_q1 \
  -- --id=@q2 create queue other-config:min-rate=$min_q2 other-config:max-rate=$max_q2 \
  -- --id=@q3 create queue other-config:min-rate=$min_q3 other-config:max-rate=$max_q3

