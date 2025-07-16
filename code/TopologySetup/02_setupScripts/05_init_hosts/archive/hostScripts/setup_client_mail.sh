#!/bin/bash
# setup_smtp_client.sh

set -e

echo "[*] Installing swaks SMTP client tool..."
apt-get update
apt-get install -y swaks

echo "[✔] SMTP client ready. Use swaks to send emails, e.g.:"
echo "swaks --to test@example.com --server <smtp-server-ip>"
