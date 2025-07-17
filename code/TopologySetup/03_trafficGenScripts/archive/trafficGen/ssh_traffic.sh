#!/bin/bash

PHASE="$1"
SSH_HOST="$2"
SSH_USER="root"
SSH_PASS="root"  # Replace with secure handling if needed
COMMANDS=("uptime" "whoami" "ls /" "hostname" "df -h")

run_ssh() {
    CMD=${COMMANDS[$RANDOM % ${#COMMANDS[@]}]}
    sshpass -p "$SSH_PASS" ssh -o StrictHostKeyChecking=no "$SSH_USER@$SSH_HOST" "$CMD" >/dev/null 2>&1
}

case "$PHASE" in
    offpeak)
        for i in {1..2}; do
            run_ssh &
            sleep $((RANDOM % 60 + 30))  # 30–90 sec
        done
        ;;
    normal)
        for i in {1..6}; do
            run_ssh &
            sleep $((RANDOM % 30 + 10))  # 10–40 sec
        done
        ;;
    peak)
        for i in {1..15}; do
            run_ssh &
            sleep $((RANDOM % 10 + 3))  # 3–13 sec
        done
        ;;
    burst)
        for i in {1..30}; do
            run_ssh &
            sleep 0.3  # intense short sessions
        done
        ;;
    *)
        echo "Usage: $0 {offpeak|normal|peak|burst} <ssh-host>"
        exit 1
        ;;
esac

wait
