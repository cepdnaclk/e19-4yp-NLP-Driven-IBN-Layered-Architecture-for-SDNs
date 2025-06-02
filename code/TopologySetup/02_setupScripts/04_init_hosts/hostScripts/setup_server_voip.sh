#!/bin/bash
# Setup VoIP Simulation Server with iperf3

set -e

echo "[*] Installing iperf3..."
apt-get update -qq
apt-get install -y iperf3

echo "[*] Starting iperf3 server on port 5061 (verbose mode)..."

# Run iperf3 server in background with verbose output on port 5061
iperf3 -s -V -p 5061 > /var/log/voip_iperf3_server.log 2>&1 &

echo "[✔] VoIP simulation server running on UDP port 5061"
