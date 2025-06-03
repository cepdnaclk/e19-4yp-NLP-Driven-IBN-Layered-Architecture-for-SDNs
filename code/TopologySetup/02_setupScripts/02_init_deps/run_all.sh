#!/bin/bash

logfile="script_run.log"
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

