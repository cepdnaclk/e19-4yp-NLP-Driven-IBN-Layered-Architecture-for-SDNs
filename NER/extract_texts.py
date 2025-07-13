import json
import os

def extract_texts_from_volu_json(input_file_path, output_file_path):
    """
    Extract all text fields from the volu.json file and save them to a text file.
    """
    texts = []
    
    try:
        with open(input_file_path, 'r', encoding='utf-8') as file:
            content = file.read()
            
        # Split by empty lines to separate JSON objects
        json_objects = content.strip().split('\n\n')
        
        for i, json_str in enumerate(json_objects, 1):
            if json_str.strip():
                try:
                    data = json.loads(json_str.strip())
                    if 'text' in data:
                        texts.append(data['text'])
                        print(f"Extracted text {i}: {data['text'][:100]}...")
                except json.JSONDecodeError as e:
                    print(f"Error parsing JSON object {i}: {e}")
                    continue
        
        # Save extracted texts to file
        with open(output_file_path, 'w', encoding='utf-8') as output_file:
            for i, text in enumerate(texts, 1):
                output_file.write(f"{i}. {text}\n")
        
        print(f"\nExtraction completed!")
        print(f"Total texts extracted: {len(texts)}")
        print(f"Texts saved to: {output_file_path}")
        
        return texts
        
    except FileNotFoundError:
        print(f"Error: File {input_file_path} not found.")
        return []
    except Exception as e:
        print(f"Error: {e}")
        return []

if __name__ == "__main__":
    # File paths
    input_file = r"c:\Users\Nipul\Downloads\BINS-dataset\BINS_dataset\label  intent data\volu.json"
    output_file = r"d:\Campus\Semester 8\e19-4yp-NLP-Driven-IBN-Layered-Architecture-for-SDNs\NER\extracted_texts.txt"
    
    # Extract texts
    extracted_texts = extract_texts_from_volu_json(input_file, output_file)
    
    # Display first few texts as preview
    if extracted_texts:
        print("\nFirst 5 extracted texts:")
        for i, text in enumerate(extracted_texts[:5], 1):
            print(f"{i}. {text}")
