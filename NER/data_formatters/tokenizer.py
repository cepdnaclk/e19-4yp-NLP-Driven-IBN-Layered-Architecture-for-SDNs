import json
from transformers import BertTokenizer

def load_data(file_path):
    with open(file_path, 'r') as f:
        data = []
        for line in f:  # Read data line by line
            example = json.loads(line)
            data.append({'tokens': example['text'], 'tags': example['labels']})
    return data

# Load the data
train_data = load_data('train.json')  # Replace with your file paths
dev_data = load_data('dev.json')
test_data = load_data('test.json')

tokenizer = BertTokenizer.from_pretrained('bert-base-uncased') # Or the model you want to use
