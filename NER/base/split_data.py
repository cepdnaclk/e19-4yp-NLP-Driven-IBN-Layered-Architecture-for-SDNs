import json
from sklearn.model_selection import train_test_split
import os

# --- Modified: Load data directly in the desired format ---
def load_preformatted_ner_data(file_path):
    """
    Loads NER data from a JSON Lines file where each line is
    {"text": [...], "labels": [...]}.
    It converts 'labels' to 'tags' to match the expected format.
    """
    ner_data = []
    with open(file_path, 'r', encoding='utf-8') as f:
        for line in f:
            try:
                item = json.loads(line)
                # Ensure 'text' is a list of strings and 'labels' exists
                if isinstance(item.get('text'), list) and isinstance(item.get('labels'), list):
                    ner_data.append({
                        'tokens': item['text'],
                        'tags': item['labels'] # Rename 'labels' to 'tags'
                    })
                else:
                    print(f"Skipping invalid line (missing 'text' or 'labels' list): {line.strip()}")
            except json.JSONDecodeError as e:
                print(f"Skipping malformed JSON line in {file_path}: {line.strip()} - Error: {e}")
    return ner_data

# --- Function to split the data into files ---
def split_ner_dataset_to_files(full_dataset, base_output_name, train_ratio=0.8, dev_ratio=0.1, test_ratio=0.1, random_seed=42):
    """
    Splits a list of NER data dictionaries into training, development, and test sets
    and writes them to separate JSON Lines files.

    Args:
        full_dataset (list): List of dictionaries, each with 'tokens' and 'tags'.
        base_output_name (str): Base name for output files (e.g., 'ner_data').
                                 Files will be named 'ner_data_train.jsonl', etc.
        train_ratio (float): Proportion of the dataset for the train split.
        dev_ratio (float): Proportion for the dev split.
        test_ratio (float): Proportion for the test split.
        random_seed (int): Seed for reproducibility.
    """

    if not (train_ratio + dev_ratio + test_ratio == 1.0):
        raise ValueError("The sum of train, dev, and test ratios must be 1.0.")

    if not full_dataset:
        print("Input dataset is empty. No splits created.")
        return

    # First split: train and temp (for dev+test)
    train_data, temp_data = train_test_split(
        full_dataset, test_size=(dev_ratio + test_ratio), random_state=random_seed
    )

    # Second split: dev and test from temp_data
    if len(temp_data) > 0:
        dev_data, test_data = train_test_split(
            temp_data, test_size=(test_ratio / (dev_ratio + test_ratio)), random_state=random_seed
        )
    else:
        dev_data = []
        test_data = []

    # Define output file paths
    train_output_file = f"{base_output_name}_train.jsonl"
    dev_output_file = f"{base_output_name}_dev.jsonl"
    test_output_file = f"{base_output_name}_test.jsonl"

    # Write data to respective output files
    def write_to_jsonl(data_list, file_path):
        with open(file_path, 'w', encoding='utf-8') as f:
            for item in data_list:
                f.write(json.dumps(item) + '\n')

    print(f"Writing {len(train_data)} examples to {train_output_file}...")
    write_to_jsonl(train_data, train_output_file)

    print(f"Writing {len(dev_data)} examples to {dev_output_file}...")
    write_to_jsonl(dev_data, dev_output_file)

    print(f"Writing {len(test_data)} examples to {test_output_file}...")
    write_to_jsonl(test_data, test_output_file)

    print("\nSplitting complete!")
    print(f"  Train file: {train_output_file} ({len(train_data)} examples)")
    print(f"  Dev file:   {dev_output_file} ({len(dev_data)} examples)")
    print(f"  Test file:  {test_output_file} ({len(test_data)} examples)")


# --- How to use it ---
input_file = 'ner_train.txt' # Your input file
output_base_name = 'ner_data' # Base name for your output files (e.g., ner_data_train.jsonl)

print(f"Loading pre-formatted NER data from {input_file}...")
full_ner_dataset = load_preformatted_ner_data(input_file)
print(f"Loaded {len(full_ner_dataset)} pre-formatted NER examples.")

# Now split the loaded dataset and save to new files
split_ner_dataset_to_files(full_ner_dataset, output_base_name)
