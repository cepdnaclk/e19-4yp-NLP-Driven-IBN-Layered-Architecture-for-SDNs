#!/bin/bash

# ONOS login details
HOST="localhost"
PORT=8101
USER="onos"
PASSWORD="rocks"

# Path to the Python topology file
TOPO_FILE=$(ls ./topo/topo*.py 2>/dev/null | head -n 1)

if [[ -z "$TOPO_FILE" ]]; then
  echo "❌ No topo*.py file found in ./topo"
  exit 1
fi

# Remove existing SSH host key entry (to avoid authenticity errors)
sudo ssh-keygen -f ~/.ssh/known_hosts -R '[localhost]:8101' 2>/dev/null

# Extract ONOS controller IP using sshpass
CONTROLLER_INFO=$(sshpass -p "$PASSWORD" ssh -tt -p "$PORT" -o StrictHostKeyChecking=no "$USER@$HOST" << EOF
nodes
exit
EOF
)

# Extract IP address from the output
NEW_IP=$(echo "$CONTROLLER_INFO" | grep -oP 'address=\K[\d.]+' | head -n 1)

if [[ -z "$NEW_IP" ]]; then
  echo "❌ Could not extract ONOS controller IP."
  exit 1
fi

echo "ℹ️  Found controller IP: $NEW_IP"
echo "📝 Updating IP in file: $TOPO_FILE"

# Replace IP in the target line in topo*.py
sed -i -E "s/(RemoteController\(name,ip=')([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+)('\))/\1$NEW_IP\3/" "$TOPO_FILE"

echo "✅ Controller IP updated to $NEW_IP in $TOPO_FILE"

