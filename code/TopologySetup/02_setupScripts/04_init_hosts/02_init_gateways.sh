#!/bin/bash

for x in {1..5}; do
    echo "Processing mn.d$x ..."

    # Get IP addresses of d<x>-eth0 and eth0
    ip1=$(docker exec mn.d$x sh -c "ip -4 addr show d${x}-eth0 | grep -oP '(?<=inet\s)\d+(\.\d+){3}'")
    ip2=$(docker exec mn.d$x sh -c "ip -4 addr show eth0 | grep -oP '(?<=inet\s)\d+(\.\d+){3}'")

    echo "  d${x}-eth0 IP: $ip1"
    echo "  eth0 IP: $ip2"

    # Update routing table inside container
    docker exec mn.d$x sh -c "
        ip route del default;
        ip route add default via $ip1 dev d${x}-eth0;
        ip route add 172.17.0.0/16 via $ip2 dev eth0;
    "

    echo "  Routing updated in mn.d$x."
    echo ""
done

