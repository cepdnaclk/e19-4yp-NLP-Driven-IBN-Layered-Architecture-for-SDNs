#!/bin/bash

set -e

logfile="init_all.log"
> "$logfile"


for dir in $(ls -d [0-9][0-9]_*/ | sort); do
  echo "Processing directory: $dir"

  if [[ -f "$dir/startup.sh" ]]; then
    script="startup.sh"
  elif [[ -f "$dir/run_all.sh" ]]; then
    script="run_all.sh"
  else
    echo "[!] No startup.sh or run_all.sh found in $dir, skipping."
    continue
  fi

  echo "==========================" | tee -a "$logfile"
  echo "Running $script in $dir" | tee -a "$logfile"
  echo "--------------------------" | tee -a "$logfile"

  (
    cd "$dir"
    bash "$script"
  ) 2>&1 | tee -a "$logfile"

  echo "Finished $script in $dir" | tee -a "$logfile"
  echo "==========================" | tee -a "$logfile"

  # Get the next directory name
  next_dir=$(ls -d [0-9][0-9]_* | sort | awk -v d="${dir%/}" 'found { print; exit } $0 == d { found=1 }')

  if [[ -n "$next_dir" ]]; then
    read -p "Do you want to proceed to the next stage: $next_dir? (y/n): " ans
    if [[ "$ans" != "y" && "$ans" != "Y" ]]; then
      echo "Stopping execution by user choice."
      exit 0
    fi
  else
    echo "No more directories to process."
    break
  fi
done


echo "All scripts completed. Logs saved in $logfile."
