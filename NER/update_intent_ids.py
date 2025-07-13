import json
import re

def update_intent_ids():
    file_path = r"d:\Campus\Semester 8\e19-4yp-NLP-Driven-IBN-Layered-Architecture-for-SDNs\NER\intent_configuration_set1.json"
    
    print(f"Reading file: {file_path}")
    
    # Read the file
    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Split content into lines
    lines = content.split('\n')
    print(f"Total lines in file: {len(lines)}")
    
    # Find all intent_id patterns and their line numbers
    intent_counter = 298  # Start from 160 since the last valid one was 159
    
    # Process lines starting from line 3885 (index 3884)
    start_line = 7189  # 0-based index for line 3885
    
    updates_made = 0
    print(f"Starting updates from line {start_line + 1}")
    
    for i in range(start_line, len(lines)):
        line = lines[i]
        # Check if this line contains an intent_id
        if '"intent_id": "INTENT-' in line:
            old_line = line
            # Replace with the new intent ID
            new_intent_id = f"INTENT-{intent_counter:03d}"
            # Use regex to replace the intent ID while preserving formatting
            lines[i] = re.sub(r'"intent_id": "INTENT-\d+"', f'"intent_id": "{new_intent_id}"', line)
            print(f"Line {i+1}: Updated to {new_intent_id}")
            intent_counter += 1
            updates_made += 1
    
    print(f"Total updates made: {updates_made}")
    
    # Write back to file
    with open(file_path, 'w', encoding='utf-8') as file:
        file.write('\n'.join(lines))
    
    print(f"Updated intent IDs from line 3885 onwards. Last intent ID: INTENT-{intent_counter-1:03d}")

if __name__ == "__main__":
    update_intent_ids()
