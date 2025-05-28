#!/bin/bash

mkdir -p ./cleanup-logs
LOG_FILE="./cleanup-logs/cleanup_$(date +%Y-%m-%d_%H-%M-%S).log"

echo "⚠️  This will stop and remove ALL Docker containers, including Containernet and ONOS-related networks and volumes."
read -p "❓ Are you sure you want to continue? [Y/n] " confirm

# Convert input to lowercase
confirm=${confirm,,}

if [[ "$confirm" != "y" && "$confirm" != "yes" && "$confirm" != "" ]]; then
    echo "❌ Cleanup aborted by user."
    exit 1
fi

echo "📁 Logging cleanup process to $LOG_FILE"

{
    echo "🧹 Running docker-compose down (if any compose files are active)..."
    docker compose down

    echo "🛑 Stopping all Docker containers..."
    docker stop $(docker ps -q) 2>/dev/null

    echo "🗑️  Removing all Docker containers..."
    docker rm $(docker ps -aq) 2>/dev/null

    echo "🔗 Removing custom Docker networks (if any)..."
    docker network prune -f

    echo "📦 Removing dangling Docker volumes (if any)..."
    docker volume prune -f

    echo "✅ Docker cluster cleanup completed."
} 2>&1 | tee "$LOG_FILE"

echo "📝 Cleanup log saved to $LOG_FILE"

