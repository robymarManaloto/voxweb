import sys
import os
import re
import json

module_dir = os.path.join(os.path.dirname(__file__), '../libraries')
sys.path.append(module_dir)
from gpt4free import g4f

# Define a function to generate a web page based on a given transcript and current HTML content
def generate(transcript, curr_html):
    context = translate(transcript)  # Translate the transcript into a readable form
    return generate_page(context['message'], curr_html)

# Define a function to parse HTML content from a response
def parse_html(html_string):
    # Extracting component and styles using regex
    component_pattern = r'<body>(.*?)<\/body>'
    styles_pattern = r'<style>(.*?)<\/style>'
    component_match = re.search(component_pattern, html_string, re.DOTALL)
    styles_match = re.search(styles_pattern, html_string, re.DOTALL)

    # Construct the response dictionary
    result = {
        "component": component_match.group(1).strip() if component_match else None,
        "styles": styles_match.group(1).strip() if styles_match else None
    }
    
    return result

# Define a function to generate a web page based on a given web context and current HTML content
def generate_page(web_context, curr_html):
    content = (
        f"Redesign this Bootstrap HTML page with the following transcript: {web_context}: {curr_html}. Give me the body tag and the style tag needed."
    )
    response = g4f.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": content}],
    )
    website = parse_html(response)
    if website["component"] == None and website["styles"] == None:
        return generate_page(web_context, curr_html)  # Retry if HTML parsing fails
    else:
        return website

# Define a function to get data based on a given context, prompt, and keys
def get_data(context, prompt, keys):
    response = g4f.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt.format(context)}],
    )
    data = parse_json(response)
    if not isinstance(data, dict) or data is None or not all(key in data for key in keys):
        return get_data(context, prompt, keys)  # Retry if data retrieval fails
    return data

# Define a function to translate a given transcript into a readable format
def translate(transcript):
    prompt = "Translate the following into a readable form and provide the answer in JSON format with 'message' as the key: {}"
    return get_data(transcript, prompt, ['message'])

# Define a function to parse JSON data from a response
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
