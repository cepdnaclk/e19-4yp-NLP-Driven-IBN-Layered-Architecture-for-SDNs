#!/bin/bash

# Save the current directory
initial_dir=$(pwd)

# File to check
host_file="04_clean_hosts.txt"

# Count non-empty lines
line_count=$(grep -cve '^\s*$' "$host_file")

# Determine the value of 'val' based on line count
case $line_count in
  5) val="01" ;;
  7) val="02" ;;
  11) val="03" ;;
  *) echo "Unsupported number of lines: $line_count"; exit 1 ;;
esac

# Find the folder that starts with "../../../01_"
target_folder=$(find ../../../ -maxdepth 1 -type d -name "01_*" | head -n 1)

if [[ -z "$target_folder" ]]; then
  echo "Target folder '../../../01_*' not found."
  exit 1
fi

# Change to the target folder
cd "$target_folder" || { echo "Failed to cd into $target_folder"; exit 1; }

# Run all bash scripts in sorted order with argument $val
for script in $(ls *.sh | sort); do
  echo "Running $script with argument $val ..."
  bash "$script" "$val"
done

# Return to the original folder
cd "$initial_dir" || exit

echo "All scripts completed. Returned to $initial_dir."
