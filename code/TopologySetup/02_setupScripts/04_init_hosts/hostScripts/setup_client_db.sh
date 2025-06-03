#!/bin/bash
# Setup a DB simulation client by installing iperf3

set -e

echo "[*] Installing iperf3..."
apt-get update -qq
apt-get install -y iperf3

echo "[✔] DB simulation client ready. You can now run iperf3 to simulate DB traffic."
echo "iperf3 -c <db-server-ip> -p 3306 -t 10"
