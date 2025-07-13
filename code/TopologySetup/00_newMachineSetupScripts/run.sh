#!/bin/bash

set -e  # Exit on error

echo "[+] Updating system packages..."
sudo apt update && sudo apt upgrade -y

echo "[+] Installing required packages..."
sudo apt install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    software-properties-common \
    sshpass \
    openssh-server \
    git \
    tmux \
    python3-pip \
    jq

echo "[+] Installing Docker..."
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] \
  https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

echo "[+] Enabling Docker..."
sudo systemctl enable docker
sudo systemctl start docker

echo "[+] Installing Docker Compose..."
mkdir -p ~/.docker/cli-plugins
LATEST_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep '"tag_name":' | cut -d '"' -f 4)
curl -SL "https://github.com/docker/compose/releases/download/${LATEST_VERSION}/docker-compose-$(uname -s)-$(uname -m)" \
  -o ~/.docker/cli-plugins/docker-compose
chmod +x ~/.docker/cli-plugins/docker-compose
sudo systemctl restart docker
docker compose version

echo "[+] Adding current user to docker group..."
sudo usermod -aG docker $USER
newgrp docker

echo "[+] Pulling Docker images..."
docker pull onosproject/onos
docker pull containernet/containernet
docker pull prom/prometheus
docker pull grafana/grafana

echo "[+] Making all the scripts executable"
sudo find ../../TopologySetup -type f -name "*.sh" -exec chmod +x {} +

echo "[+] Setup complete. Please reboot or log out and back in for Docker group changes to apply."
