from django.urls import path
from . import views

urlpatterns = [
    path("start-project/", views.home, name="home"),
    path('process_transcription/', views.process_transcription, name='process_transcription'),
]