from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.hashers import make_password, check_password
from .models import UserProfile
from .models import Project
from .forms import RegistrationForm
from django.shortcuts import redirect
from django.shortcuts import render, get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.core.exceptions import ObjectDoesNotExist

def login(request):
    if request.method == 'POST':
        username_or_email = request.POST['username_or_email']
        password = request.POST['password']
        
        try:
            # Check if the input is an email
            if '@' in username_or_email:
                user = UserProfile.objects.get(email=username_or_email)
            else:
                user = UserProfile.objects.get(username=username_or_email)

            if check_password(password, user.password):
                # Add username and email to the session
                request.session['username'] = user.username
                request.session['email'] = user.email
                request.session['password'] = user.password

                return JsonResponse({
                    'success': True,
                    'message': 'Login successful!',
                    'username': user.username,
                    'email': user.email
                })
            else:
                return JsonResponse({'success': False, 'message': 'Invalid password.'})
        except ObjectDoesNotExist:
            return JsonResponse({'success': False, 'message': 'Invalid username or email.'})

    return render(request, 'login.html')

def register(request):
    if request.method == 'POST':
        form = RegistrationForm(request.POST)
        if form.is_valid():
            username = request.POST.get('username')
            email = request.POST.get('email')
            password = request.POST.get('password')
            confirm_password = request.POST.get('confirm_password')
            
            if UserProfile.objects.filter(email=email).exists():
                return JsonResponse({'success': False, 'message': 'Email is already registered.'})
            
            # Check if password is strong
            # You can customize the password strength check according to your requirements
            if len(password) < 8:
                return JsonResponse({'success': False, 'message': 'Password must be at least 8 characters long.'})

            # Check if password and confirm_password match
            if password != confirm_password:
                return JsonResponse({'success': False, 'message': 'Passwords do not match.'})

            # All checks passed, save the user
            user = form.save(commit=False)
            user.password = make_password(password)
            user.email = email
            user.save()
            return JsonResponse({'success': True, 'message': 'Registration successful!'})
        else:
            return JsonResponse({'success': False, 'message': 'Username is already taken.'})
    else:
        form = RegistrationForm()

    return render(request, 'login.html', {'form': form})

def dashboard(request):
    if 'username' not in request.session:
        return redirect('/')

    username = request.session['username']
    
    # Retrieve projects for the logged-in user
    user_projects = Project.objects.filter(user__username=username).order_by('-last_update')

    return render(request, 'dashboard.html', {'username': username, 'projects': user_projects})

@csrf_exempt
def logout(request):
    if request.method == 'POST':
        # Clear all session data
        request.session.flush()

        return JsonResponse({'success': True})

    return JsonResponse({'success': False})


def change_password(request):
    if request.method == 'POST':
        username = request.session['username']
        user = UserProfile.objects.get(username=username)
        
        old_password = request.POST.get('old_password')
        new_password = request.POST.get('new_password')
        confirm_password = request.POST.get('confirm_password')

        # Check if the old password is valid
        if not check_password(old_password, user.password):
            return JsonResponse({'success': False, 'message': 'Invalid old password. '})

        # Check if the new password and confirm password match
        if new_password != confirm_password:
            return JsonResponse({'success': False, 'message': 'New password and confirm password do not match. '})

        if len(new_password) < 8:
            return JsonResponse({'success': False, 'message': 'Password must be at least 8 characters long. '})

        # Update the user's password
        user.password = make_password(new_password)
        user.save()

        return JsonResponse({'success': True})

    return redirect('login')

@csrf_exempt
def delete_account(request):
    if request.method == 'POST':
        username = request.session['username']
        user = UserProfile.objects.get(username=username)
        
        user.delete()
        return JsonResponse({'success': True})
    else:
        return JsonResponse({'success': False})

@csrf_exempt
def create_project(request):
    if request.method == 'POST':
        project_name = request.POST.get('project_name')
        username = request.session['username']
        user = UserProfile.objects.get(username=username)
        
        Project.objects.create(user=user, name=project_name)
        return JsonResponse({'success': True})
    else:
        return JsonResponse({'success': False, 'error': 'Invalid request method'})

@csrf_exempt
def delete_project(request, project_id):
    project = get_object_or_404(Project, id=project_id)
    
    if request.method == 'POST':
        project_name = project.name
        project.delete()
        return JsonResponse({'status': 'success', 'message': f'{project_name} has been deleted.'})
    
    return JsonResponse({'status': 'error', 'message': 'Invalid request method.'})

@csrf_exempt
def update_project_name(request):
    if request.method == 'POST':
        project_id = request.POST.get('project_id')
        new_name = request.POST.get('new_name')

        # Get the project
        project = get_object_or_404(Project, id=project_id)

        # Update the project name
        project.name = new_name
        project.save()

        return JsonResponse({'status': 'success', 'new_name': project.name})
    else:
        return JsonResponse({'status': 'error'})