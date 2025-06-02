#!/bin/bash
# setup_smtp_server.sh

set -e

echo "[*] Installing Postfix SMTP server..."
apt-get update
DEBIAN_FRONTEND=noninteractive apt-get install -y postfix mailutils

echo "[*] Configuring Postfix to listen on all interfaces..."
postconf -e 'inet_interfaces = all'
postconf -e 'mydestination = localhost'

echo "[*] Restarting postfix service..."
service postfix restart

echo "[✔] SMTP server is running on port 25."
