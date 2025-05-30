import json
import torch
from torch.nn.utils.rnn import pad_sequence
from torch.utils.data import TensorDataset, DataLoader, RandomSampler, SequentialSampler
from transformers import BertTokenizerFast, BertForTokenClassification
from torch.optim import AdamW
from sklearn.metrics import f1_score
import os # Import os for checking file existence

# --- 1. Prepare Your Data: Load the JSONL Data ---

def load_data_from_jsonl(file_path):
    """
    Loads NER data from a JSON Lines file where each line is
    {"tokens": [...], "tags": [...]}.
    """
    data = []
    if not os.path.exists(file_path):
        print(f"Error: File not found at {file_path}. Please ensure it exists.")
        return []

    with open(file_path, 'r', encoding='utf-8') as f:
        for line in f:
            try:
                item = json.loads(line)
                # Ensure 'tokens' is a list of strings and 'tags' exists
                if isinstance(item.get('tokens'), list) and isinstance(item.get('tags'), list):
                    data.append({'tokens': item['tokens'], 'tags': item['tags']})
                else:
                    print(f"Skipping invalid line (missing 'tokens' or 'tags' list): {line.strip()}")
            except json.JSONDecodeError as e:
                print(f"Skipping malformed JSON line in {file_path}: {line.strip()} - Error: {e}")
    return data

# Define your split file paths
train_file = 'ner_data_train.jsonl'
dev_file = 'ner_data_dev.jsonl'
test_file = 'ner_data_test.jsonl'

print("Loading training, development, and test data...")
train_data = load_data_from_jsonl(train_file)
dev_data = load_data_from_jsonl(dev_file)
test_data = load_data_from_jsonl(test_file)

if not train_data or not dev_data or not test_data:
    print("One or more datasets are empty. Please check your data files and paths.")
    exit() # Exit if data is not loaded correctly

tokenizer = BertTokenizerFast.from_pretrained('bert-base-uncased')

# Create a mapping from tags to IDs (including 'O')
# Ensure all_tags includes all possible tags from all splits for robustness
all_tags_set = set()
for dataset in [train_data, dev_data, test_data]:
    for example in dataset:
        all_tags_set.update(example['tags'])
all_tags = sorted(list(all_tags_set))
tag_to_id = {tag: id for id, tag in enumerate(all_tags)}
id_to_tag = {id: tag for tag, id in tag_to_id.items()}

print(f"Number of unique tags: {len(tag_to_id)}")
print(f"Tag to ID mapping: {tag_to_id}")


# --- 2. Tokenization and Input Encoding ---

def encode_tags(tags, tag_to_id):
    """Converts list of string tags to list of numerical IDs."""
    return [tag_to_id[tag] for tag in tags]

def preprocess_data(data, tokenizer, tag_to_id, max_len):
    """
    Preprocesses the data for BERT input, including tokenization,
    tag alignment, padding, and truncation.
    """
    input_ids = []
    attention_masks = []
    tag_ids = []

    for example in data:
        tokens = example['tokens']
        tags = example['tags']

        # Tokenize, but keep track of original word boundaries
        # is_split_into_words=True is crucial here as tokens are already split
        encoding = tokenizer(tokens,
                             is_split_into_words=True,
                             padding='max_length',
                             truncation=True,
                             max_length=max_len,
                             return_offsets_mapping=False, # Not needed if using word_ids directly
                             )

        # Map original tags to the *new* tokenized sequence (subwords).
        # This handles special tokens ([CLS], [SEP], [PAD]) and subword splits.
        word_ids = encoding.word_ids()
        new_tags = []
        previous_word_idx = None
        for word_idx in word_ids:
            if word_idx is None: # Special token ([CLS], [SEP], [PAD])
                new_tags.append(-100) # -100 is ignored by PyTorch's CrossEntropyLoss
            elif word_idx != previous_word_idx: # Start of a new word
                new_tags.append(tag_to_id[tags[word_idx]])
            else: # Continuation of a word (subword token)
                # For inside tokens, we keep the I- tag. For B- tags, we also keep the I- tag for subwords.
                # Here, we'll assign the I- tag if the original tag was B- or I-, otherwise -100.
                original_tag = tags[word_idx]
                if original_tag.startswith('B-'):
                    new_tags.append(tag_to_id[f"I-{original_tag[2:]}"]) # Convert B- to I- for subwords
                elif original_tag.startswith('I-'):
                    new_tags.append(tag_to_id[original_tag])
                else: # O tag
                    new_tags.append(-100) # Assign -100 to 'O' subwords to ignore them in loss
            previous_word_idx = word_idx

        input_ids.append(torch.tensor(encoding['input_ids']))
        attention_masks.append(torch.tensor(encoding['attention_mask']))
        tag_ids.append(torch.tensor(new_tags))

    # Pad sequences to the same length (important for batching)
    # Note: padding_value for tags should be -100 so it's ignored by loss function
    input_ids = pad_sequence(input_ids, batch_first=True, padding_value=tokenizer.pad_token_id)
    attention_masks = pad_sequence(attention_masks, batch_first=True, padding_value=0)
    tag_ids = pad_sequence(tag_ids, batch_first=True, padding_value=-100)

    return input_ids, attention_masks, tag_ids

max_len = 128  # Or your chosen maximum sequence length
print("Preprocessing training data...")
train_inputs, train_masks, train_tags = preprocess_data(train_data, tokenizer, tag_to_id, max_len)
print("Preprocessing development data...")
dev_inputs, dev_masks, dev_tags = preprocess_data(dev_data, tokenizer, tag_to_id, max_len)
print("Preprocessing test data...")
test_inputs, test_masks, test_tags = preprocess_data(test_data, tokenizer, tag_to_id, max_len)

print(f"Train data shapes: Input IDs {train_inputs.shape}, Masks {train_masks.shape}, Tags {train_tags.shape}")


# --- 3. Define the Model ---

print("Defining the BERT model for token classification...")
model = BertForTokenClassification.from_pretrained(
    'bert-base-uncased',
    num_labels=len(tag_to_id),  # Number of unique tags
    output_attentions=False,
    output_hidden_states=False
)

# --- 4. Fine-tuning ---

print("Setting up for fine-tuning...")
def create_dataloader(inputs, masks, tags, batch_size, sampler_type='random'):
    data = TensorDataset(inputs, masks, tags)
    if sampler_type == 'random':
        sampler = RandomSampler(data)
    else: # 'sequential' for eval
        sampler = SequentialSampler(data)
    dataloader = DataLoader(data, sampler=sampler, batch_size=batch_size)
    return dataloader

def compute_f1(preds_flat, labels_flat, label_map):
    """
    Computes the F1 score, handling padding and converting ids to tags.
    Only considers non-ignored labels (not -100).
    """
    true_labels = []
    predicted_labels = []

    for p, l in zip(preds_flat, labels_flat):
        if l != -100: # Exclude ignored labels (padding and special tokens)
            true_labels.append(label_map[l])
            predicted_labels.append(label_map[p])

    return f1_score(true_labels, predicted_labels, average='micro') # or 'weighted', 'macro'

# Create DataLoaders
batch_size = 32  # Adjust as needed
train_dataloader = create_dataloader(train_inputs, train_masks, train_tags, batch_size, 'random')
dev_dataloader = create_dataloader(dev_inputs, dev_masks, dev_tags, batch_size, 'sequential')
test_dataloader = create_dataloader(test_inputs, test_masks, test_tags, batch_size, 'sequential')

optimizer = AdamW(model.parameters(), lr=2e-5)  # Adjust learning rate if needed
epochs = 5  # Or your chosen number of epochs
device = torch.device('cuda') if torch.cuda.is_available() else torch.device('cpu')
model.to(device)

print(f"Starting training on {device}...")
for epoch in range(epochs):
    model.train()  # Set to training mode
    total_loss = 0

    for step, batch in enumerate(train_dataloader):
        batch_inputs, batch_masks, batch_tags = [b.to(device) for b in batch]

        model.zero_grad()  # Clear gradients
        outputs = model(input_ids=batch_inputs, attention_mask=batch_masks, labels=batch_tags)
        loss = outputs.loss
        total_loss += loss.item()
        loss.backward()  # Backward pass
        optimizer.step()  # Update parameters

        if step % 100 == 0 and step != 0:  # Print progress every 100 steps
            print(f"Epoch {epoch+1}/{epochs}, Step {step}/{len(train_dataloader)}, Loss: {loss.item():.4f}")

    avg_train_loss = total_loss / len(train_dataloader)
    print(f"Epoch {epoch+1}/{epochs}, Average Training Loss: {avg_train_loss:.4f}")

    # Evaluation on the development set
    model.eval()  # Set to evaluation mode
    dev_preds_flat = []
    dev_labels_flat = []

    for batch in dev_dataloader:
        batch_inputs, batch_masks, batch_tags = [b.to(device) for b in batch]

        with torch.no_grad():
            outputs = model(input_ids=batch_inputs, attention_mask=batch_masks)
            logits = outputs.logits

        # Get predictions and true labels, flatten them
        batch_preds = torch.argmax(logits, dim=2).cpu().numpy()
        batch_labels = batch_tags.cpu().numpy()

        for i in range(batch_labels.shape[0]): # Iterate through each sequence in the batch
            for j in range(batch_labels.shape[1]): # Iterate through each token in the sequence
                if batch_labels[i, j] != -100: # Only consider non-padding/special tokens
                    dev_preds_flat.append(batch_preds[i, j])
                    dev_labels_flat.append(batch_labels[i, j])

    f1_dev = compute_f1(dev_preds_flat, dev_labels_flat, id_to_tag)
    print(f"Epoch {epoch+1}/{epochs}, Development Set F1 Score: {f1_dev:.4f}")

print("\nTraining complete! Evaluating on the test set...")

# Evaluate on the test set
model.eval()
test_preds_flat = []
test_labels_flat = []
for batch in test_dataloader:
    batch_inputs, batch_masks, batch_tags = [b.to(device) for b in batch]

    with torch.no_grad():
        outputs = model(input_ids=batch_inputs, attention_mask=batch_masks)
        logits = outputs.logits

    batch_preds = torch.argmax(logits, dim=2).cpu().numpy()
    batch_labels = batch_tags.cpu().numpy()

    for i in range(batch_labels.shape[0]):
        for j in range(batch_labels.shape[1]):
            if batch_labels[i, j] != -100:
                test_preds_flat.append(batch_preds[i, j])
                test_labels_flat.append(batch_labels[i, j])

f1_test = compute_f1(test_preds_flat, test_labels_flat, id_to_tag)
print(f"Test Set F1 Score: {f1_test:.4f}")

# Optional: Save the trained model
model_save_path = "./bert_ner_model"
model.save_pretrained(model_save_path)
tokenizer.save_pretrained(model_save_path)
print(f"Model saved to {model_save_path}")
