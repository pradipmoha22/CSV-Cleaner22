from django.urls import path
from . import views

urlpatterns = [
    path('upload/', views.upload_file, name='upload_file'),
    path('download/<uuid:file_id>/', views.download_file, name='download_file'),
    path('clean/<uuid:file_id>/start/', views.start_cleaning, name='start_cleaning'),
    path('job/<uuid:job_id>/status/', views.get_job_status, name='get_job_status'),
    path('job/<uuid:job_id>/results/', views.get_job_results, name='get_job_results'),
    path('health/', views.health_check, name='health_check'),
]