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

# Find and enter the folder
FOLDER=$(ls -d ${1}_*/ 2>/dev/null | head -n 1)

if [[ -z "$FOLDER" ]]; then
  echo "Folder starting with ${1}_ not found."
  exit 1
fi

cd "$FOLDER" || exit 1

# Check required files
if [[ ! -f __hostIpMapping.txt || ! -f serverHostConfig.txt ]]; then
  echo "Both hostIpMapping.txt and serverHostConfig.txt must exist in $FOLDER"
  exit 1
fi

# Create hostname → IP mapping
declare -A hostToIp

while IFS=',' read -r host ip; do
  host=$(echo "$host" | xargs)
  ip=$(echo "$ip" | xargs)
  hostToIp["$host"]="$ip"
done < __hostIpMapping.txt

# Prepare output file
> __ipServerMapping.txt

# Read serverHostConfig.txt and generate mapping
while IFS=',' read -r host rest; do
  rest=$(echo "$rest" | xargs)
  if [[ "$rest" == "_" || -z "$rest" ]]; then
    continue  # Skip empty or underscore-only lines
  fi

  ip="${hostToIp[$host]}"
  IFS=',' read -ra services <<< "$rest"
  for service in "${services[@]}"; do
    service=$(echo "$service" | xargs)
    echo "$ip,$service" >> __ipServerMapping.txt
  done
done < serverHostConfig.txt

echo "__ipServerMapping.txt created in $FOLDER."
