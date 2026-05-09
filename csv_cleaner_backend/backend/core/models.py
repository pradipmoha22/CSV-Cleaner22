from django.db import models
import uuid

class DataFile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    original_filename = models.CharField(max_length=255)
    file_size = models.IntegerField()
    file_format = models.CharField(max_length=10)
    file_path = models.CharField(max_length=500)
    upload_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, default='uploaded')
    
    total_rows = models.IntegerField(default=0)
    total_columns = models.IntegerField(default=0)
    missing_values = models.IntegerField(default=0)
    duplicate_rows = models.IntegerField(default=0)
    
    preview_columns = models.JSONField(default=list, blank=True)
    preview_rows = models.JSONField(default=list, blank=True)
    
    def __str__(self):
        return self.original_filename
    
    def get_file_size_mb(self):
        return round(self.file_size / (1024 * 1024), 2)


class CleaningJob(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    original_file = models.ForeignKey(DataFile, on_delete=models.CASCADE, related_name='original_jobs')
    cleaned_file = models.ForeignKey(DataFile, on_delete=models.SET_NULL, null=True, blank=True, related_name='cleaned_jobs')
    
    remove_duplicates = models.BooleanField(default=True)
    fix_missing_values = models.BooleanField(default=True)
    standardize_headers = models.BooleanField(default=True)
    trim_whitespace = models.BooleanField(default=True)
    
    status = models.CharField(max_length=20, default='pending')
    progress = models.IntegerField(default=0)
    duplicates_removed = models.IntegerField(default=0)
    missing_values_fixed = models.IntegerField(default=0)
    headers_standardized = models.IntegerField(default=0)
    whitespace_trimmed = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Cleaning {self.original_file.original_filename}"
