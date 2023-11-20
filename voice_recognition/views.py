from django.shortcuts import render
from django.shortcuts import redirect
from django.http import JsonResponse
from .aiweb import generate
from login_dashboard.models import Page
from login_dashboard.models import Project
from django.views.decorators.csrf import csrf_exempt

# Create your views here.
def start_project(request, project_id):
    if 'username' not in request.session:
        return redirect('/')
    
    username = request.session['username']
    
    try:
        project = Project.objects.get(id=project_id, user__username=username)
    except Project.DoesNotExist:
        return redirect('/')

    # Check if there are pages in the project
    if Page.objects.filter(project=project).exists():
        # Redirect to page_editor
        return redirect('/page_editor/'+ str(project_id) +"/")

    return render(request, 'voice_recognition.html', {'project': project})

@csrf_exempt
def process_transcription(request, project_id):
    if request.method == 'POST':
        transcription = request.POST.get('transcription')
        result = generate(transcription, project_id)
        if result['error'] == 'false':
            response_data = {'error': False, 'message': 'Transcription processed successfully'}
            return JsonResponse(response_data)
        else:
            try:
                response_data = {'error': True, 'message': result['message']}
            except:
                response_data = {'error': True, 'message': 'Something goes wrong.'}
                
            return JsonResponse(response_data, status=400)