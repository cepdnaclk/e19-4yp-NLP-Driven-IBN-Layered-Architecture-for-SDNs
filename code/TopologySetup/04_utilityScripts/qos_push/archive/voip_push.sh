#!/bin/bash

# Iterate over all OVS bridges
for br in $(sudo ovs-vsctl list-br); do
  echo "Adding {} priority flow to bridge $br"

  sudo ovs-ofctl -O OpenFlow13 add-flow s1 "table=0,priority=500,ip,tcp,tp_dst=80,actions=set_queue:1,normal"
done

add-host-intent --ipProto=6 --tcpDst=81 --setQueue=2/3 --priority=300 46:83:8E:93:C3:06/None EE:4F:49:66:EC:90/None  
