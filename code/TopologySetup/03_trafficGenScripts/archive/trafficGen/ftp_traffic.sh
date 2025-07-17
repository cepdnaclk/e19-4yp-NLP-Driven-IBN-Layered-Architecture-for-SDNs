#!/bin/bash

PHASE="$1"
FTP_SERVER="$2"
FTP_USER="ftpuser"
FTP_PASS="ftppassword"  # Replace or use env vars if needed
REMOTE_DIR="/upload"
LOCAL_FILE="/tmp/testfile.dat"

# Create dummy file if not exists
[ -f "$LOCAL_FILE" ] || dd if=/dev/urandom of="$LOCAL_FILE" bs=1M count=1 >/dev/null 2>&1

transfer_file() {
    lftp -u "$FTP_USER","$FTP_PASS" "$FTP_SERVER" <<EOF
cd $REMOTE_DIR
put $LOCAL_FILE
bye
EOF
}

case "$PHASE" in
    offpeak)
        for i in {1..2}; do
            transfer_file &
            sleep $((RANDOM % 60 + 30))  # 30–90 sec
        done
        ;;
    normal)
        for i in {1..6}; do
            transfer_file &
            sleep $((RANDOM % 30 + 10))  # 10–40 sec
        done
        ;;
    peak)
        for i in {1..15}; do
            transfer_file &
            sleep $((RANDOM % 10 + 3))  # 3–13 sec
        done
        ;;
    burst)
        for i in {1..30}; do
            transfer_file &
            sleep 0.3  # Fast consecutive transfers
        done
        ;;
    *)
        echo "Usage: $0 {offpeak|normal|peak|burst} <ftp-server>"
        exit 1
        ;;
esac

wait
