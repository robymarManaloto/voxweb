from django.shortcuts import render, redirect
import os
from django.http import JsonResponse
import re
from . import regen
from login_dashboard.models import Page

# Render the editor page
def page_editor(request, project_id):
    if 'username' not in request.session:
        return redirect('/')
    global project
    project = int(project_id)
    
    return render(request, 'page_editor.html')

def get_html_files(request):
    html_files = []

    # Regular expressions for extracting id, name, component, and styles
    id_counter = 1
    name_pattern = r'<title>(.*?)<\/title>'
    component_pattern = r'<body>(.*?)<\/body>'
    styles_pattern = r'<style>(.*?)<\/style>'
    try:
        # Retrieve pages for the specified project_id
        pages = Page.objects.filter(project__id=project)
        for page in pages:
                # Extract id, name, component, and styles using regex
                name_match = re.search(name_pattern, page.content, re.DOTALL)
                component_match = re.search(component_pattern, page.content, re.DOTALL)
                styles_match = re.search(styles_pattern, page.content, re.DOTALL)

                # Create a dictionary with extracted information
                if name_match and component_match and styles_match:
                    html_file_data = {
                        'id': page.id,
                        'name': page.title.replace('.html', ''),
                        'component': component_match.group(1).strip(),
                        'styles': styles_match.group(1).strip()
                    }
                    html_files.append(html_file_data)
                    id_counter += 1
        return JsonResponse({'html_files': html_files})
    except Exception as e:
        return JsonResponse({'result': 'error', 'message': str(e)})

# Regenerate HTML page based on transcription and existing HTML
def regenerate_page(request):
    if request.method == 'POST':
        try:
            transcription = request.POST.get('transcription')
            html = request.POST.get('html')

            # Generate new HTML using the 'regen' module
            result = regen.generate(transcription, html)
            
            return JsonResponse(result)
        except Exception as e:
            # Handle exceptions and return an error response
            return JsonResponse({'result': 'error', 'message': str(e)})
    else:
        # Handle other HTTP methods if needed
        return JsonResponse({'result': 'error', 'message': 'Invalid request method'})

def remove_page(request, page_id):
    try:
        page = Page.objects.get(id=page_id)
        page.delete()
        return JsonResponse({'success': True})
    except Page.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Page does not exist'})

def create_page(request):
    if request.method == 'POST':
        name = request.POST.get('name')

        # Create a new page in the database
        new_page = Page.objects.create(
            project_id=project,
            title=name+'.html',
            content="""
                <!DOCTYPE html>
                <html lang="en">
                <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>About Us - Welcome to our Agricultural Website</title>
                <style>
                </style>
                </head>
                <body>
                    <div>New Page</div>
                </body>
                </html>
            """,
        )

        # Return the new page ID in the response
        response_data = {'page_id': new_page.id}
        return JsonResponse(response_data)

    # Handle other HTTP methods or invalid requests as needed
    return JsonResponse({'error': 'Invalid request'})