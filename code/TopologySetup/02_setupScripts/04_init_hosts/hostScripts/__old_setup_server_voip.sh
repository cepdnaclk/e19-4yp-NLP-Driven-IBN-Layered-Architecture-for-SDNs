#!/bin/bash

set -e

echo "[*] Installing SIP server (kamailio)..."
apt update
apt install -y kamailio kamailio-mysql-modules

echo "[*] Enabling kamailio to start..."
sed -i 's/^#RUN_KAMAILIO=yes/RUN_KAMAILIO=yes/' /etc/default/kamailio
systemctl enable kamailio

echo "[*] Starting kamailio server..."
nohup kamailio -DD -E > /var/log/voip_server.log 2>&1 &

echo "[✔] VoIP (SIP) server started. Log: /var/log/voip_server.log"
