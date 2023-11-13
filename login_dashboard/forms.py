from django import forms
from .models import UserProfile

class RegistrationForm(forms.ModelForm):
    class Meta:
        model = UserProfile
        fields = ['username', 'password']
        widgets = {
            'password': forms.PasswordInput(),
        }