from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.hashers import make_password, check_password
from .models import UserProfile
from .models import Project
from .forms import RegistrationForm
from django.shortcuts import redirect
from django.shortcuts import render, get_object_or_404

def login(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        try:
            user = UserProfile.objects.get(username=username)
            
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
        except UserProfile.DoesNotExist:
            return JsonResponse({'success': False, 'message': 'Username does not exist.'})

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
    user_projects = Project.objects.filter(user__username=username)


    return render(request, 'dashboard.html', {'username': username, 'projects': user_projects})

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
            return JsonResponse({'success': False, 'error': 'Invalid old password'})

        # Check if the new password and confirm password match
        if new_password != confirm_password:
            return JsonResponse({'success': False, 'error': 'New password and confirm password do not match'})

        if len(new_password) < 8:
            return JsonResponse({'success': False, 'message': 'Password must be at least 8 characters long.'})

        # Update the user's password
        user.password = make_password(new_password)
        user.save()

        return JsonResponse({'success': True})

    return redirect('login')

def delete_account(request):
    if request.method == 'POST':
        username = request.session['username']
        user = UserProfile.objects.get(username=username)
        
        user.delete()
        return JsonResponse({'success': True})
    else:
        return JsonResponse({'success': False})


def create_project(request):
    if request.method == 'POST':
        project_name = request.POST.get('project_name')
        username = request.session['username']
        user = UserProfile.objects.get(username=username)
        
        Project.objects.create(user=user, name=project_name)
        return JsonResponse({'success': True})
    else:
        return JsonResponse({'success': False, 'error': 'Invalid request method'})
    
def delete_project(request, project_id):
    project = get_object_or_404(Project, id=project_id)
    
    if request.method == 'POST':
        project_name = project.name
        project.delete()
        return JsonResponse({'status': 'success', 'message': f'{project_name} has been deleted.'})
    
    return JsonResponse({'status': 'error', 'message': 'Invalid request method.'})