from django.contrib import admin
from .models import DataFile, CleaningJob

@admin.register(DataFile)
class DataFileAdmin(admin.ModelAdmin):
    list_display = ['original_filename', 'file_format', 'file_size', 'upload_date', 'status']
    list_filter = ['status', 'upload_date']
    search_fields = ['original_filename']


@admin.register(CleaningJob)
class CleaningJobAdmin(admin.ModelAdmin):
    list_display = ['id', 'original_file', 'status', 'progress', 'created_at']
    list_filter = ['status', 'created_at']
