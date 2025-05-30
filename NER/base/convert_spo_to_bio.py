import json
import spacy
import re

# Load English tokenizer from spaCy
nlp = spacy.load("en_core_web_sm")

def create_bio_labels(text, spo_list):
    doc = nlp(text)
    tokens = [token.text for token in doc]
    labels = ["O"] * len(tokens)

    for spo in spo_list:
        for ent_text, ent_type in [
            (spo["subject"], spo["subject_type"]),
            (spo["object"]["@value"], spo["object_type"]["@value"])
        ]:
            for match in re.finditer(re.escape(ent_text), text):
                span = doc.char_span(match.start(), match.end(), alignment_mode="expand")
                if span:
                    for i, token in enumerate(span):
                        if token.i < len(labels):
                            labels[token.i] = ("B-" if i == 0 else "I-") + ent_type
                    break  # Only mark first occurrence

    return {"text": [token.text for token in doc], "labels": labels}

def convert_dataset(input_file, output_file):
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    formatted_data = [create_bio_labels(entry["text"], entry["spo_list"]) for entry in data]

    with open(output_file, 'w', encoding='utf-8') as f:
        for item in formatted_data:
            f.write(json.dumps(item, ensure_ascii=False) + "\n")

# Example usage
convert_dataset("formatted_data.json", "ner_train.txt")
