#!/bin/bash
# Setup Video streaming Simulation Server with iperf3

set -e

echo "[*] Installing iperf3..."
apt-get update -qq
apt-get install -y iperf3


# Run iperf3 server in background with verbose output on port 5061
iperf3 -s -V -p 5201 > /var/log/streaming_iperf3_server.log 2>&1 &

echo "[✔] Video Streaming simulation server running on UDP port 5201"
