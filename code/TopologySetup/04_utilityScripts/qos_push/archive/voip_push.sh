#!/bin/bash

# Iterate over all OVS bridges
for br in $(sudo ovs-vsctl list-br); do
  echo "Adding {} priority flow to bridge $br"

  sudo ovs-ofctl -O OpenFlow13 add-flow s1 "table=0,priority=500,ip,tcp,tp_dst=80,actions=set_queue:1,normal"
done

