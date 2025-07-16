#!/bin/bash
# Install FTP client tools (no connection yet)

set -e

echo "[*] Installing FTP clients..."
apt-get update -qq
apt-get install -y ftp lftp

echo "[✔] FTP clients ready. You can now connect using:"
echo "  ftp <server-ip>"
echo "  or"
echo "  lftp ftpuser@<server-ip>"
