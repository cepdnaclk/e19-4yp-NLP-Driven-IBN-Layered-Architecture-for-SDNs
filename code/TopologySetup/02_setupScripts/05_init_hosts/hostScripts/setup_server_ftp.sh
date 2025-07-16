#!/bin/bash
# Setup a simple FTP server using vsftpd

set -e

echo "[*] Installing vsftpd..."
apt-get update -qq
apt-get install -y vsftpd

echo "[*] Creating FTP user and directory..."
useradd -m ftpuser || true
echo "ftpuser:ftppassword" | chpasswd

echo "[*] Creating secure_chroot_dir..."
mkdir -p /var/run/vsftpd/empty
chmod 755 /var/run/vsftpd/empty
chown ftpuser:ftpuser /home/ftpuser/ftp

echo "[*] Configuring vsftpd..."
cat <<EOF > /etc/vsftpd.conf
listen=YES
anonymous_enable=NO
local_enable=YES
write_enable=YES
local_umask=022
listen_port=21
chroot_local_user=YES
allow_writeable_chroot=YES
EOF

echo "[*] Starting vsftpd..."
# Kill old process if exists
pkill vsftpd || true
/usr/sbin/vsftpd /etc/vsftpd.conf > /var/log/ftp_server.log 2>&1 &

echo "[✔] FTP server running on port 21 (user: ftpuser / password: ftppassword)"
