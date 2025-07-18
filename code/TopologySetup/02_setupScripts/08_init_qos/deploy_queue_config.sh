#!/bin/bash

CONTAINER_NAME="containernet"
INIT_SCRIPT="./init_queues.sh"
ITER_SCRIPT="./iterate_through_interfaces.sh"

# Copy both scripts into the container
docker cp "$INIT_SCRIPT" "$CONTAINER_NAME":/tmp/init_queues.sh
docker cp "$ITER_SCRIPT" "$CONTAINER_NAME":/tmp/iterate_through_interfaces.sh

# Make them executable
docker exec "$CONTAINER_NAME" chmod +x /tmp/init_queues.sh
docker exec "$CONTAINER_NAME" chmod +x /tmp/iterate_through_interfaces.sh

# Run the interface iteration inside the container
docker exec "$CONTAINER_NAME" /tmp/iterate_through_interfaces.sh
