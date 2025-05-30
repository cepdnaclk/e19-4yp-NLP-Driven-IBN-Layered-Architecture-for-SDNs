#!/bin/bash

logfile="script_run.log"
> "$logfile"  # Clear log file

echo "📜 Starting script execution at $(date)" | tee -a "$logfile"
echo "======================================" | tee -a "$logfile"

for script in $(ls *.sh | sort); do
  if [[ "$script" == "run_all.sh" ]]; then
    echo "⏭️  Skipping $script" | tee -a "$logfile"
    continue
  fi

  echo -e "\n▶️ Running $script ..." | tee -a "$logfile"
  echo "------------------------" | tee -a "$logfile"
  
  # Run the script and tee output (stdout + stderr)
  bash "$script" 2>&1 | tee -a "$logfile"

  echo "✅ Finished $script" | tee -a "$logfile"
  echo "========================" | tee -a "$logfile"
done

echo -e "\n✅ All scripts completed at $(date)."
echo "📁 Logs saved in: $logfile"

