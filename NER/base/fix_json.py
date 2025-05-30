import json

# Step 1: Read the raw JSON objects from a file
with open("volu.json", "r", encoding="utf-8") as f:
    raw_content = f.read()

# Step 2: Split the raw content into individual JSON blocks
# Assumes blocks are separated by newlines or blank lines
raw_objects = [block.strip() for block in raw_content.split('\n\n') if block.strip()]

# Step 3: Parse each block as a JSON object
json_objects = [json.loads(obj) for obj in raw_objects]

# Step 4: Write the full list to a new JSON file as a proper array
with open("formatted_volu_data.json", "w", encoding="utf-8") as f:
    json.dump(json_objects, f, ensure_ascii=False, indent=2)

print("Conversion completed. Output written to formatted_data.json")
