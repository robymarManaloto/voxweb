import sys
import os
import re
import json
import concurrent.futures

module_dir = os.path.join(os.path.dirname(__file__), '../libraries')
sys.path.append(module_dir)
from gpt4free import g4f

# Main Function
def generate(transcript):
    try:
        # Translate the transcript and store the result in the 'context' dictionary
        context = translate(transcript)
        
        # Process the 'context' dictionary with 'file_struct_theme'
        struct_theme = file_struct_theme(context)
        web_context = context.copy()
        web_context.update(struct_theme)
        
        # Page Generation
        generate_pages(web_context)
        
        return True
    except Exception as e:
        # Handle exceptions here
        print(f"An error occurred: {e}")
        return False
            
def parse_json(response):
    pattern = r'\{.*\}'
    match = re.search(pattern, response, re.DOTALL)
    if match:
        try:
            json_str = match.group(0)
            json_str = json_str.replace("'", '"')
            return json.loads(json_str)
        except:
            return None
    else:
        return None

def parse_html(response):
    pattern = re.compile(r'<!DOCTYPE html>[\s\S]*?</html>', re.DOTALL)
    match = pattern.search(response)
    return match.group(0) if match else None

def get_data(context, prompt, keys):
    response = g4f.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt.format(context)}],
    )
    data = parse_json(response)
    if not isinstance(data, dict) or data is None or not len([key for key in keys if key in data]) == len(keys):
        return get_data(context, prompt, keys)
    return data

def translate(transcript):
    prompt = "Translate this in readable form. Answer in JSON format only with 'message' as the key. {}"
    return get_data(transcript, prompt, ['message'])

def file_struct_theme(context):
    prompt = "Give me a list of possible HTML files for a proper website and give me a creative description of a theme for a website with the colors in hex (inside the key). Answer in JSON format only with 'files' and 'theme' as the key. {}"
    return get_data(context, prompt, ['files', 'theme'])

def generate_pages(web_context):
    output_dir = "temp"
    os.makedirs(output_dir, exist_ok=True)

    def remove_files_in_directory(directory):
        for filename in os.listdir(directory):
            file_path = os.path.join(directory, filename)
            try:
                if os.path.isfile(file_path):
                    os.unlink(file_path)
            except Exception as e:
                print(f"Error deleting {file_path}: {e}")

    # Delete all files in the output directory
    remove_files_in_directory(output_dir)
    
    # Define a function to process each page and write the HTML content to a file.
    def process_page(page):
        html_content = each_page(web_context, page)
        if html_content:
            with open(os.path.join(output_dir, page), "w") as html_file:
                html_file.write(html_content)
    
    # Use ThreadPoolExecutor to run the processing of pages concurrently.
    with concurrent.futures.ThreadPoolExecutor() as executor:
        executor.map(process_page, web_context['files'])

def each_page(web_context, page):
    content = (
        "Give me a creative bootstrap design of HTML for {} in pages of {} with a theme of {} from the transcription. \" {} \". Add texts related to it. Give it a good layout. Add images using https://picsum.photos.".format(
            page, web_context['files'], web_context['theme'], web_context['message']
        )
    )
    response = g4f.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": content}],
    )
    website = parse_html(response)
    if website is None:
        return each_page(web_context, page)
    else:
        return website

