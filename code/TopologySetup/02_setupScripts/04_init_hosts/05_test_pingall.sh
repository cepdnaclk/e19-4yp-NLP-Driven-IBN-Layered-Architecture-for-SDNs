#!/bin/bash

SESSION="topo_cli"
COMMAND="pingall"

# Check if the session exists
if tmux has-session -t "$SESSION" 2>/dev/null; then
  # Send the command to the tmux session
  tmux send-keys -t "$SESSION" "$COMMAND" C-m

  # Optional: wait a bit for output to complete before detaching
  sleep 2

  # Detach if currently attached (safe even if already detached)
  tmux detach -s "$SESSION"
else
  echo "Error: tmux session '$SESSION' not found."
  exit 1
fi
