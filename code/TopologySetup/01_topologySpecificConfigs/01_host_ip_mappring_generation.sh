#!/bin/bash

# Check for input argument
if [[ $# -ne 1 ]]; then
  echo "Usage: $0 <number between 01-03>"
  exit 1
fi

# Validate input
case "$1" in
  01|02|03) ;;
  *) echo "Invalid input. Please provide 01, 02, or 03."
     exit 1
     ;;
esac

# Find the folder
FOLDER=$(ls -d ${1}_*/ 2>/dev/null | head -n 1)

if [[ -z "$FOLDER" ]]; then
  echo "Folder starting with ${1}_ not found."
  exit 1
fi

cd "$FOLDER" || exit 1

# Find the python file
PYFILE=$(ls topo-*.py 2>/dev/null | head -n 1)

if [[ -z "$PYFILE" ]]; then
  echo "No Python file starting with topo- found."
  exit 1
fi

# Extract hostname and clean IP (remove CIDR suffix) and write to hostIpMapping.txt
grep "net.addDocker" "$PYFILE" | \
  sed -nE "s/.*'([^']+)'.*ip='([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+)\/[0-9]+'.*/mn.\1,\2/p" \
  > __hostIpMapping.txt

echo "Host-IP mapping written to $FOLDER/__hostIpMapping.txt"
