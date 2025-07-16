#!/bin/bash
# Simulate a DB server using iperf3 on TCP port 3306

set -e

echo "[*] Installing iperf3..."
apt-get update -qq
apt-get install -y iperf3

echo "[*] Starting iperf3 server on TCP port 3306..."

# Run iperf3 server on port 3306 (default DB port)
iperf3 -s -p 3306 > /var/log/db_iperf3_server.log 2>&1 &

echo "[✔] DB simulation server running on TCP port 3306"
