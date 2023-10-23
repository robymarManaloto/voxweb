from django.shortcuts import render
from django.http import JsonResponse
from generate_web import generate_web

# Create your views here.
def home(request):
    return render(request, 'home.html')

def process_transcription(request):
    if request.method == 'POST':
        transcription = request.POST.get('transcription', '')
        
        # Process the transcription data here
        generate_web(transcription)
            
        # Return a response, e.g., a JSON response
        response_data = {'message': 'Transcription processed successfully'}
        return JsonResponse(response_data)
    