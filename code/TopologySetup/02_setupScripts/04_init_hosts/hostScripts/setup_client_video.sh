#!/bin/bash
# Setup VoIP Simulation Client (installs iperf3 only)

set -e

echo "[*] Installing iperf3..."
apt-get update -qq
apt-get install -y iperf3

echo "[✔] VoIP simulation client ready. You can run iperf3 to simulate VoIP traffic."
echo "iperf3 -c <server-ip> -p 5201 -u -b 5M --dscp 46"
