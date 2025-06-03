#!/bin/bash

# Validate input
if [[ $# -ne 1 ]]; then
  echo "Usage: $0 <number between 01-03>"
  exit 1
fi

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

# Check required files
if [[ ! -f __ipServerMapping.txt || ! -f clientHostConfig.txt ]]; then
  echo "Both ipServerMapping.txt and clientHostConfig.txt must exist in $FOLDER"
  exit 1
fi

# Create the output directory
rm -rf "./trafficConfig"
mkdir -p "./trafficConfig"

# Read clientHostConfig.txt and generate config files
while IFS=',' read -r host rest; do
  rest=$(echo "$rest" | xargs)
  if [[ "$rest" == "_" || -z "$rest" ]]; then
    continue  # Skip empty or "_" lines
  fi

  # Extract client ID from mn.dX
  clientId="${host##*.}"  # d1, d2, etc.
  outFile="trafficConfig/trafficConfig_${clientId}.txt"

  # Start fresh
  > "$outFile"

  # Split the service list
  IFS=',' read -ra services <<< "$rest"
  for service in "${services[@]}"; do
    service=$(echo "$service" | xargs)
    # Look for matching line in __ipServerMapping.txt
    grep ",$service\$" __ipServerMapping.txt | while IFS=',' read -r ip proto; do
      echo "\"$ip\",$proto" >> "$outFile"
    done
  done
done < clientHostConfig.txt

echo "trafficConfig/ directory populated with trafficConfig_dX.txt files."
