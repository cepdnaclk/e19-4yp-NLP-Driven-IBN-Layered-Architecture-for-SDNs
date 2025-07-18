#!/bin/bash

# Get only interfaces with names like s1-eth1, h1-eth0, etc.
interfaces=$(ovs-vsctl list Interface | grep '^name' | awk -F'"' '{print $2}' | grep -E '^[a-zA-Z0-9]+-eth[0-9]+$')

for iface in $interfaces; do
  echo "Configuring QoS on interface: $iface"
  bash /tmp/init_queues.sh "$iface"
done
