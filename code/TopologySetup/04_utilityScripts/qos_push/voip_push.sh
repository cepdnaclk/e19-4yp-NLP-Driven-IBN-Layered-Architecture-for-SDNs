#!/bin/bash

# Iterate over all OVS bridges
for br in $(sudo ovs-vsctl list-br); do
  echo "Adding voice priority flow to bridge $br"

  # Force OpenFlow 1.3, match UDP + DSCP EF (TOS 184)
  sudo ovs-ofctl -O OpenFlow13 add-flow $br "priority=500,ip,udp,nw_tos=184,actions=set_queue:1,normal"
done

