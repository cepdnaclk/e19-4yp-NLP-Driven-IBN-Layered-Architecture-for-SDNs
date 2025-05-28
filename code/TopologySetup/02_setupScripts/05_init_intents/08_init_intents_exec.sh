#!/bin/bash

HOST="localhost"
PORT=8101
USER="onos"
PASSWORD="rocks"

INPUT_FILE="07_init_intents_replaced.txt"

# Use sshpass with ssh and feed all commands in one SSH session
sshpass -p "$PASSWORD" ssh -tt -p $PORT -o StrictHostKeyChecking=no $USER@$HOST << EOF
$(cat "$INPUT_FILE")

exit
EOF

