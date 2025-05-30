#!/bin/bash

# Config
SESSION_NAME="topo_cli"
CONTAINER_NAME="containernet"
TOPODIR="/root/topo"

# Python script matcher (e.g., topoxxx.py)
PYTHON_SCRIPT=$(docker exec "$CONTAINER_NAME" bash -c "ls $TOPODIR/topo*.py 2>/dev/null | head -n 1")

if [ -z "$PYTHON_SCRIPT" ]; then
    echo "❌ No Python file starting with 'topo' found in $TOPODIR"
    exit 1
fi

# Switch to docker group in this shell
#newgrp docker

# Launch tmux session and run the commands inside it
tmux new-session -d -s "$SESSION_NAME" "

# Execute inside container
docker exec -it $CONTAINER_NAME bash -c '
cd $TOPODIR && sudo mn -c && sudo python3 $(basename $PYTHON_SCRIPT)
'
"

echo "✅ tmux session '$SESSION_NAME' started."
echo "ℹ️  Attach with: tmux attach -t $SESSION_NAME"
echo "⚠️  Kill tmux session with: tmux kill-session -t $SESSION_NAME"

