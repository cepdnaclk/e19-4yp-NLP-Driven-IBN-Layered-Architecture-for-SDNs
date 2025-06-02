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
)

# Remove existing SSH host key entry (to avoid authenticity errors)
sudo ssh-keygen -f ~/.ssh/known_hosts -R '[$HOST]:$PORT' 2>/dev/null

# Start SSH session and activate apps
sshpass -p "$PASSWORD" ssh -tt -p $PORT -o StrictHostKeyChecking=no $USER@$HOST << EOF
$(for app in "${apps[@]}"; do
    echo "app activate $app"
done)

exit
EOF

