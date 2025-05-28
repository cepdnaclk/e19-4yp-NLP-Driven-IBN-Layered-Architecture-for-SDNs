#!/bin/bash

timestamp=$(date +"%Y-%m-%d_%H-%M-%S")
sshpass -p 'rocks' ssh -tt -p 8101 -o StrictHostKeyChecking=no onos@localhost << EOF > "02_onos_hosts_$timestamp.txt"
hosts
exit
EOF

