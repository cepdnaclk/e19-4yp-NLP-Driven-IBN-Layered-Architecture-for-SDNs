#!/bin/bash

start_time=$(date +%s%N)

if [[ -z "$1" ]]; then
  echo "Usage: $0 <intent_json_file>"
  exit 1
fi

INTENT_JSON="$1"
CSV_FILE="./panel_links.csv"
OUTPUT_FILE="./matched_urls.txt"

# Clear output
> "$OUTPUT_FILE"

# Extract application and time_window from JSON (first filter only)
application=$(jq -r '.config.LOGS.filters[0].application' "$INTENT_JSON")
time_window=$(jq -r '.config.LOGS.filters[0].time_window' "$INTENT_JSON")

if [[ -z "$application" || -z "$time_window" ]]; then
  echo "[!] Application or time_window missing in intent JSON."
  exit 1
fi

# Debug output
echo "[+] Searching for application: $application"
echo "[+] Using time window: $time_window"

# Search CSV and update URLs
tail -n +2 "$CSV_FILE" | while IFS=',' read -r dash_title panel_title url; do
  dash_title=$(echo "$dash_title" | tr -d '"')
  panel_title=$(echo "$panel_title" | tr -d '"')
  url=$(echo "$url" | tr -d '"')

  # Case-insensitive search for application in either title
  if echo "$dash_title $panel_title" | grep -iq "$application"; then
    updated_url="${url}&from=now-${time_window}&to=now"
    echo "$updated_url" >> "$OUTPUT_FILE"
  fi
done

echo "[+] Matching URLs written to $OUTPUT_FILE"

FILE="./matched_urls.txt"

if [ ! -f "$FILE" ]; then
  echo "File $FILE not found!"
  exit 1
fi

while IFS= read -r url; do
  if [[ -n "$url" ]]; then
    echo "Opening $url"
    # For Linux (xdg-open)
    xdg-open "$url" >/dev/null 2>&1 &
  fi
done < "$FILE"

end_time=$(date +%s%N)
duration_ns=$(( end_time - start_time ))
duration_sec=$(echo "scale=3; $duration_ns / 1000000000" | bc)
echo "Total execution time: ${duration_sec} seconds"
