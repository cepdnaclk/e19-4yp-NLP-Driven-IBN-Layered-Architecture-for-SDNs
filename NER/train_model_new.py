from datasets import load_dataset

data_files = {
    "train": "ner_data_v1_train.jsonl",
    "validation": "ner_data_v1_dev.jsonl",
    "test": "ner_data_v1_test.jsonl"
}

dataset = load_dataset('json', data_files=data_files)

labels = [
    "O",
    "B-bandwidth",
"B-latency",
"B-CPU utilization",
"B-MLU",
"B-action",
"B-bandwidth",
"B-business business",
"B-communication service",
"B-controller",
"B-delay",
"B-destination",
"B-destination address",
"B-ip address",
"B-jitter",
"B-latency",
"B-maximum latency",
"B-middlebox",
"B-network business",
"B-network equipment",
"B-network function",
"B-network performance",
"B-network scenario",
"B-network security",
"B-network service",
"B-network utilization",
"B-online service",
"B-packet loss rate",
"B-priority",
"B-protocol",
"B-quota",
"B-reliability",
"B-round-trip time",
"B-service",
"B-service level",
"B-service range",
"B-service target",
"B-source",
"B-source address",
"B-terminal",
"B-throughput",
"B-time",
"B-user",
"B-user type",
"I-CPU utilization",
"I-MLU",
"I-business business",
"I-communication service",
"I-delay",
"I-destination address",
"I-ip address",
"I-latency",
"I-middlebox",
"I-network business",
"I-network equipment",
"I-network function",
"I-network performance",
"I-network scenario",
"I-network service",
"I-network traffic",
"I-network utilization",
"I-online service",
"I-packet loss rate",
"I-priority",
"I-protocol",
"I-quota",
"I-reliability",
"I-service",
"I-service range",
"I-service target",
"I-source address",
"I-terminal",
"I-time",
"I-user type"
]

# Extract unique labels from all dataset splits and clean them
all_labels = set()

for split in dataset:
    for example in dataset[split]:
        all_labels.update(tag.strip() for tag in example["tags"])

label_list = sorted(list(all_labels))
label2id = {label: idx for idx, label in enumerate(label_list)}
id2label = {idx: label for label, idx in label2id.items()}

from transformers import AutoTokenizer

tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")

def tokenize_and_align_labels(examples):
    tokenized_inputs = tokenizer(
        examples['tokens'],
        truncation=True,
        is_split_into_words=True
    )

    labels = []
    for i, label in enumerate(examples['tags']):
        word_ids = tokenized_inputs.word_ids(batch_index=i)
        previous_word_idx = None
        label_ids = []
        for word_idx in word_ids:
            if word_idx is None:
                label_ids.append(-100)
            elif word_idx != previous_word_idx:
                clean_label = label[word_idx].strip()
                label_ids.append(label2id[clean_label])
            else:
                # For subwords, use the I- version of the label
                clean_label = label[word_idx].strip()
                if clean_label.startswith("B-"):
                    clean_label = clean_label.replace("B-", "I-")
                label_ids.append(label2id.get(clean_label, -100))
            previous_word_idx = word_idx
        labels.append(label_ids)

    tokenized_inputs["labels"] = labels
    return tokenized_inputs


tokenized_datasets = dataset.map(tokenize_and_align_labels, batched=True)

from transformers import AutoModelForTokenClassification

model = AutoModelForTokenClassification.from_pretrained(
    "bert-base-uncased",
    num_labels=len(labels),
    id2label=id2label,
    label2id=label2id
)

from transformers import TrainingArguments

training_args = TrainingArguments(
    output_dir="./bert-ner-network-uncased",
    evaluation_strategy="epoch",
    learning_rate=5e-5,
    per_device_train_batch_size=16,
    per_device_eval_batch_size=16,
    num_train_epochs=3,
    weight_decay=0.01,
    save_strategy="epoch",
    logging_dir="./logs",
    logging_steps=10,
    load_best_model_at_end=True,
    metric_for_best_model="f1",
    greater_is_better=True,
)


import numpy as np
import evaluate

metric = evaluate.load("seqeval")

def compute_metrics(p):
    predictions, labels = p
    predictions = np.argmax(predictions, axis=2)

    true_labels = [[id2label[l] for l in label if l != -100] for label in labels]
    true_predictions = [
        [id2label[p] for (p, l) in zip(prediction, label) if l != -100]
        for prediction, label in zip(predictions, labels)
    ]

    results = metric.compute(predictions=true_predictions, references=true_labels)
    return {
        "precision": results["overall_precision"],
        "recall": results["overall_recall"],
        "f1": results["overall_f1"],
        "accuracy": results["overall_accuracy"],
    }


from transformers import Trainer

from transformers import DataCollatorForTokenClassification

data_collator = DataCollatorForTokenClassification(tokenizer=tokenizer)


trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_datasets['train'],
    eval_dataset=tokenized_datasets['validation'],
    tokenizer=tokenizer,
    data_collator=data_collator,
    compute_metrics=compute_metrics
)

trainer.train()

results = trainer.evaluate(tokenized_datasets['test'])
print(results)

trainer.save_model("./bert-ner-network-final-uncased")
tokenizer.save_pretrained("./bert-ner-network-final-uncased")
