#!/bin/bash

set -e

echo "[*] Installing Python3..."
apt update
apt install -y python3

echo "[*] Creating index.html..."
echo "<html><body><h1>Hello from $(hostname)</h1></body></html>" > index.html

echo "[*] Starting Python HTTP server on port 80..."
nohup python3 -m http.server 80 > /var/log/http_server.log 2>&1 &

echo "[✔] HTTP server started. Log: /var/log/http_server.log"
