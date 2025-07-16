#!/bin/bash

set -e

echo "[*] Installing OpenSSH Server..."
apt update
apt install -y openssh-server

echo "[*] Configuring SSH server..."
mkdir -p /var/run/sshd
sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config
sed -i 's/^#*PasswordAuthentication.*/PasswordAuthentication yes/' /etc/ssh/sshd_config
echo 'root:root' | chpasswd

echo "[*] Starting SSH server..."
nohup /usr/sbin/sshd -D > /var/log/ssh_server.log 2>&1 &

echo "[✔] SSH server started. Log: /var/log/ssh_server.log"
