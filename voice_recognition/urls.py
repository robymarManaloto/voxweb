from django.urls import path
from . import views

urlpatterns = [
    path("start_project/<int:project_id>/", views.start_project, name="start_project"),
    path('process_transcription/<int:project_id>/', views.process_transcription, name='process_transcription'),
]