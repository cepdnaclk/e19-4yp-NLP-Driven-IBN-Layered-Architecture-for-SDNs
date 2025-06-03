#!/bin/bash

set -e

echo "[*] Installing HTTP client tools (curl and wget)..."
apt update
apt install -y curl wget

echo "[✔] HTTP clients are ready (you can use 'curl http://host:port' or 'wget http://host:port')."
