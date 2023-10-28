from django.urls import path
from . import views

urlpatterns = [
    path('editor/', views.editor, name='editor'),
    path('get_html_files/', views.get_html_files, name='get_html_files'),
    path('editor/regenerate_page/', views.regenerate_page, name='regenerate_page'),
]