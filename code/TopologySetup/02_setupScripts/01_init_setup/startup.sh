#!/bin/bash

mkdir -p ./startup-logs
LOG_FILE="./startup-logs/startup_$(date +%Y-%m-%d_%H-%M-%S).log"

echo "🟢 Running docker-compose in detached mode..."
docker compose up -d

if [ $? -ne 0 ]; then
    echo "❌ Failed to start docker-compose services."
    exit 1
fi

echo "📜 Logging output to $LOG_FILE ..."

# Start background logging to file only
docker compose logs -f > "$LOG_FILE" 2>&1 &
LOG_PID=$!

# Show only first 30 lines to terminal (live)
( docker compose logs -f 2>&1 | head -n 30 ) &

echo "📝 Logs are being written to $LOG_FILE (PID: $LOG_PID)"
echo "🛑 Only the first 30 log lines are shown in the terminal."
echo "🔍 To see full logs, use: tail -f $LOG_FILE"

