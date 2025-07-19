#!/bin/bash

cd retrieve_network_knowledge || { echo "Directory 'retrieve_network_knowledge' not found."; exit 1; }

logfile="./script_run.log"
> "$logfile"

for script in $(ls *.sh | sort); do
  if [[ "$script" == "run_all.sh" ]]; then
    echo "Skipping $script" | tee -a "$logfile"
    continue
  fi

  echo "Running $script ..." | tee -a "$logfile"
  bash "$script" 2>&1 | tee -a "$logfile"
  echo "Finished $script" | tee -a "$logfile"
  echo "------------------------" | tee -a "$logfile"
done

echo "All scripts completed. Logs saved in $logfile."
