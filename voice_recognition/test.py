import sys
import os
module_dir = os.path.join(os.path.dirname(__file__), '../libraries')
sys.path.append(module_dir)
from gpt4free import g4f

response = g4f.ChatCompletion.create(
    model=g4f.models.gpt_4,
    messages=[{"role": "user", "content": "Can you generate me a hello world in html?"}],
)

print(response)