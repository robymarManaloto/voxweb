from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.hashers import make_password, check_password
from .models import UserProfile
from .forms import RegistrationForm
from django.shortcuts import redirect

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
        return redirect('login')

    username = request.session['username']
    
    return render(request, 'dashboard.html')


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