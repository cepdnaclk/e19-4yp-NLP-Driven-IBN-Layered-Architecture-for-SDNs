#!/bin/bash

# Name of the container
CONTAINER_NAME="containernet"

# Local directory to copy
LOCAL_TOPO_DIR="./topo"

# Destination inside the container
DEST_DIR="/root"

echo "[+] Copying '$LOCAL_TOPO_DIR' to container '$CONTAINER_NAME'..."
docker cp "$LOCAL_TOPO_DIR" "$CONTAINER_NAME":"$DEST_DIR"

echo "[+] Running apt update in the container..."
docker exec "$CONTAINER_NAME" apt update

echo "[+] Building Docker images from .Dockerfile files..."
docker exec "$CONTAINER_NAME" bash -c "
    cd $DEST_DIR/topo/docker_images && \
    for df in *.Dockerfile; do
        img_name=\${df%.Dockerfile}
        echo \"[+] Building image '\$img_name' from Dockerfile '\$df'\"
        docker build -f \"\$df\" -t \"\$img_name\" .
    done
"

