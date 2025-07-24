#!/bin/bash

# ONOS login details
HOST="localhost"
PORT=8101
USER="onos"
PASSWORD="rocks" 

# List of ONOS apps to activate
apps=(
  "org.onosproject.optical-model"
  "org.onosproject.openflow-base"
  "org.onosproject.lldpprovider"
  "org.onosproject.hostprovider"
  "org.onosproject.drivers"
  "org.onosproject.openflow"
  "org.onosproject.proxyarp"
  "org.onosproject.acl"
  "org.onosproject.drivers.optical"
  "org.onosproject.drivermatrix"
  "org.onosproject.gui2"
  "org.onosproject.roadm"
  "org.onosproject.pathpainter"
  "org.onosproject.layout"
  "org.onosproject.fwd"
)

# Ensure ~/.ssh exists
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Remove existing SSH host key entry (to avoid authenticity errors)
ssh-keygen -f ~/.ssh/known_hosts -R "[$HOST]:$PORT" 2>/dev/null

# Wait for ONOS CLI to be ready
echo "⏳ Waiting for ONOS CLI to become available..."

until sshpass -p "$PASSWORD" ssh -tt -p "$PORT" \
  -o StrictHostKeyChecking=no \
  -o UserKnownHostsFile=/dev/null \
  "$USER@$HOST" "apps -a" 2>/dev/null | grep -q "org.onosproject"; do
    echo "🔄 ONOS not ready yet... retrying in 3s"
    sleep 3
done

echo "✅ ONOS CLI is available."

# Start SSH session and activate apps
sshpass -p "$PASSWORD" ssh -tt -p $PORT -o StrictHostKeyChecking=no $USER@$HOST << EOF
$(for app in "${apps[@]}"; do
    echo "app activate $app"
done)

exit
EOF

