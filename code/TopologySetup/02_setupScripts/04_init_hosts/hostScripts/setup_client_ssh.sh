#!/bin/bash

set -e

echo "[*] Installing OpenSSH client..."
apt update
apt install -y openssh-client

echo "[✔] SSH client is ready (you can use 'ssh user@host')."
