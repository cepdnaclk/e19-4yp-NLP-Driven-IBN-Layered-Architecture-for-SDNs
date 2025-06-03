#!/bin/bash

PHASE="$1"
SMTP_SERVER="$2"
RECIPIENT="test@example.com"

send_mail() {
    swaks --to "$RECIPIENT" \
          --server "$SMTP_SERVER" \
          --from "user@example.com" \
          --header "Subject: Test Email $(date)" \
          --body "This is a test message sent at $(date)." \
          >/dev/null 2>&1
}

case "$PHASE" in
    offpeak)
        for i in {1..2}; do
            send_mail &
            sleep $((RANDOM % 90 + 30))  # 30–120 sec
        done
        ;;
    normal)
        for i in {1..6}; do
            send_mail &
            sleep $((RANDOM % 30 + 10))  # 10–40 sec
        done
        ;;
    peak)
        for i in {1..15}; do
            send_mail &
            sleep $((RANDOM % 10 + 2))  # 2–12 sec
        done
        ;;
    burst)
        for i in {1..30}; do
            send_mail &
            sleep 0.3  # rapid fire
        done
        ;;
    *)
        echo "Usage: $0 {offpeak|normal|peak|burst} <smtp-server-ip>"
        exit 1
        ;;
esac

wait
