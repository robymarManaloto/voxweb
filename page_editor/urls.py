from django.urls import path
from . import views

urlpatterns = [
    path('page_editor/<int:project_id>/', views.page_editor, name='editor'),
    path('get_html_files/', views.get_html_files, name='get_html_files'),
    path('page_editor/regenerate_page/', views.regenerate_page, name='regenerate_page'),
    path('remove_page/<int:page_id>/', views.remove_page, name='remove_page'),
    path('create_page/', views.create_page, name='create_page'),
    path('update_pages/', views.update_pages, name='update_pages'),
]