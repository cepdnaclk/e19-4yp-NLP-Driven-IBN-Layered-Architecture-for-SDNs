#!/bin/bash

# Remove stale SSH host entry
ssh-keygen -f ~/.ssh/known_hosts -R '[localhost]:8101' 2>/dev/null

# Run command on ONOS CLI via SSH
sshpass -p 'rocks' ssh -tt -p 8101 \
  -o StrictHostKeyChecking=no \
  -o UserKnownHostsFile=/dev/null \
  onos@localhost << EOF > "02_onos_hosts.txt"
hosts
exit
EOF

# Remove existing SSH host key entry (to avoid authenticity errors)
#ssh-keygen -f ~/.ssh/known_hosts -R '[localhost]:8101' 2>/dev/null

#timestamp=$(date +"%Y-%m-%d_%H-%M-%S")
#sshpass -p 'rocks' ssh -tt -p 8101 -o StrictHostKeyChecking=no onos@localhost << EOF > "02_onos_hosts_$timestamp.txt"
#hosts
#exit
#EOF

