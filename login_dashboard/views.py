# authentication/views.py
from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.contrib.auth.hashers import make_password, check_password
from .models import UserProfile
from .forms import RegistrationForm

def login(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        try:
            user = UserProfile.objects.get(username=username)
            if check_password(password, user.password):
                return JsonResponse({'success': True, 'message': 'Login successful!'})
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
    return render(request, 'dashboard.html')
