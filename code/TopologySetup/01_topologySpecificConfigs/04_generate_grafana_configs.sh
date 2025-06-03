#!/bin/bash

TEMPLATE_FILE="__generic_active_dashboard.json"
MAPPING_FILE="__hostIpMapping.txt"

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

# Check if files exist
if [[ ! -f "$TEMPLATE_FILE" ]]; then
  echo "Template file '$TEMPLATE_FILE' not found."
  exit 1
fi

if [[ ! -f "$MAPPING_FILE" ]]; then
  echo "Mapping file '$MAPPING_FILE' not found."
  exit 1
fi

rm -rf "./dashboards"
mkdir -p "./dashboards"

# Process each line in the mapping file
while IFS=',' read -r host ip; do
  if [[ "$host" =~ mn\.d([0-9]+) ]]; then
    i="${BASH_REMATCH[1]}"
    output_file="d${i}.json"
    sed "s/{{i}}/$i/g" "$TEMPLATE_FILE" > "./dashbaords/$output_file"
    echo "Created $output_file for $host ($ip)"
  fi
done < "$MAPPING_FILE"
