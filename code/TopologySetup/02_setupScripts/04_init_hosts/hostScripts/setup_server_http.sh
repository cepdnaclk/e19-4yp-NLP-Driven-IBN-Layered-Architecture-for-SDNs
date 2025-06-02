#!/bin/bash

set -e

echo "[*] Installing Python3..."
apt update
apt install -y python3

echo "[*] Starting Python HTTP server on port 8000..."
nohup python3 -m http.server 8000 > /var/log/http_server.log 2>&1 &

echo "[✔] HTTP server started. Log: /var/log/http_server.log"
