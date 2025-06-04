#!/bin/bash

set -e

# Input Validation
read -p "Enter a topology ID (allowed: 01, 02, 03): " xx
if [[ ! "$xx" =~ ^0[1-3]$ ]]; then
  echo "[✘] Invalid input: $xx. Must be 01, 02, or 03."
  exit 1
fi

clear
echo "=================================================="
echo "🚧  Preparing for Initialization of Topology: $xx"
echo "=================================================="
sleep 1

# Part 1: Run topology-specific config scripts
echo "[*] Switching to ../01_topologySpecificConfigs..."
cd ../01_topologySpecificConfigs || { echo "[✘] Directory not found."; exit 1; }

echo "[*] Running topology-specific config scripts with argument '$xx'..."

# Find and run scripts starting with 01_, 02_, etc. in order
for script in $(ls -1 [0-9][0-9]_*.sh 2>/dev/null | sort); do
  echo "→ Running $script with arg '$xx'..."
  bash "$script" "$xx"
done

echo ""
echo "✅  Preparation Complete for Topology: $xx"
echo ""
sleep 1

# Part 2: Move to setup scripts
echo "[*] Moving to ../02_setupScripts..."
cd ../02_setupScripts || { echo "[✘] Directory not found."; exit 1; }


echo "🚀  Starting Initialization..."
echo "========================================="
sleep 1


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
	 read -p "Do you want to proceed to the next stage: $next_dir? (Y/n): " ans
	 ans=${ans:-Y}  
		if [[ "$ans" != [Yy] ]]; then
			echo "⛔ Stopping execution by user choice."
			exit 0
		fi
  else
    echo "No more directories to process."
    break
  fi
done

echo ""
echo "=============================================================="
echo "✅ All initialization scripts have been executed successfully!"
echo "📄 Logs have been saved to: $logfile"
echo "📦 Topology setup is now complete and deployed."
echo "=============================================================="
echo ""

