import sys
import os
import re
import json
import concurrent.futures

module_dir = os.path.join(os.path.dirname(__file__), '../libraries')
sys.path.append(module_dir)
from gpt4free import g4f

# Main Function
def generate_web(transcript):
    try:
        # Translation
        context = translate(transcript)
        
        # File Structure and Theme
        with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
            future_file_struct = executor.submit(file_struct, context)
            future_theme = executor.submit(theme, context)

            file_struct_result = future_file_struct.result()
            theme_result = future_theme.result()

        # Page Generation
        generate_pages(file_struct_result, theme_result, context)

    except Exception as e:
        # Handle exceptions here
        print(f"An error occurred: {e}")
        # You can log the error, raise a custom exception, or take other appropriate actions.
    
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

def get_data(context, prompt, key):
    response = g4f.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt.format(context)}],
    )
    data = parse_json(response)
    if data is None or data.get(key) is None:
        return get_data(context, prompt)
    return data

def translate(transcript):
    prompt = "Translate this in readable form. Answer in JSON format with 'message' as the key. {}"
    return get_data(transcript, prompt, "message")

def file_struct(context):
    prompt = "Give me a list of possible HTML files for a proper website. {} Answer in JSON format with 'files' as the key."
    return get_data(context, prompt, "files")

def theme(context):
    prompt = "Give me a creative description of a theme for a website with the colors in hex. {} Answer in JSON format with 'theme' as the key."
    return get_data(context, prompt, "theme")

def generate_pages(pages, web_theme, context):
    output_dir = "temp"
    os.makedirs(output_dir, exist_ok=True)
    
    for page in pages['files']:
        html_content = each_page(pages, page, web_theme, context)
        if html_content:
            with open(os.path.join(output_dir, page), "w") as html_file:
                html_file.write(html_content)

def each_page(pages, page, web_theme, context):
    content = (
        "Give me a creative bootstrap HTML for {} in pages of {} with a theme of {} with a context of {}".format(
            page, pages, web_theme['theme'], context['message']
        )
    )
    response = g4f.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": content}],
    )
    website = parse_html(response)
    return website