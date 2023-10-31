from django.shortcuts import render
from django.http import JsonResponse
from . import aiweb

# Create your views here.
def home(request):
    return render(request, 'home.html')

def process_transcription(request):
    if request.method == 'POST':
        transcription = request.POST.get('transcription')
        print("generating")
        if aiweb.generate(transcription):
            # Return a success response
            response_data = {'message': 'Transcription processed successfully'}
            print("done")
            return JsonResponse(response_data)
        else:
            # Return an error response
            print("awts")
            response_data = {'error': 'Error processing transcription'}
            return JsonResponse(response_data, status=400)  # Set the HTTP status code to 400 (Bad Request)