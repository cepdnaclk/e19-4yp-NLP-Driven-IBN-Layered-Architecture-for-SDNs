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
    python3-pip

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
DOCKER_COMPOSE_VERSION="2.24.5"
sudo curl -L "https://github.com/docker/compose/releases/download/v${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" \
  -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

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
