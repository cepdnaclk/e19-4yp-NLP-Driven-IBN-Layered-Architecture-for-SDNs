#!/bin/bash

set -e

echo "[*] Installing SIP client (linphonec)..."
apt update
apt install -y linphone-nogtk

echo "[✔] VoIP (SIP) client is ready. You can use 'linphonec' to register and make calls."
