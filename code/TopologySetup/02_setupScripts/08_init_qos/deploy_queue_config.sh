#!/bin/bash

# Hardcoded container name and script
CONTAINER_NAME="containernet"                 
SCRIPT_PATH="./init_queues.sh"       
DEST_PATH="/tmp/init_queues.sh"

# Step 1: Copy the script into the container
echo "Copying init_queues.sh to $CONTAINER_NAME..."
docker cp "$SCRIPT_PATH" "$CONTAINER_NAME":"$DEST_PATH"

# Step 2: Make it executable
echo "Making script executable..."
docker exec "$CONTAINER_NAME" chmod +x "$DEST_PATH"

# Step 3: Execute the script
echo "Running the script in $CONTAINER_NAME..."
docker exec "$CONTAINER_NAME" "$DEST_PATH"

