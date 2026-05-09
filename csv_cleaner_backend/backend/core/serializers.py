from rest_framework import serializers
from .models import DataFile, CleaningJob


class DataFileSerializer(serializers.ModelSerializer):
    file_size_mb = serializers.SerializerMethodField()
    
    class Meta:
        model = DataFile
        fields = ['id', 'original_filename', 'file_size', 'file_size_mb', 'file_format', 
                  'upload_date', 'status', 'total_rows', 'total_columns', 
                  'preview_columns', 'preview_rows', 'missing_values', 'duplicate_rows']
    
    def get_file_size_mb(self, obj):
        return obj.get_file_size_mb()


class CleaningJobSerializer(serializers.ModelSerializer):
    original_file = DataFileSerializer(read_only=True)
    cleaned_file = DataFileSerializer(read_only=True)
    
    class Meta:
        model = CleaningJob
        fields = '__all__'


class FileUploadSerializer(serializers.Serializer):
    file = serializers.FileField()


class CleaningOptionsSerializer(serializers.Serializer):
    remove_duplicates = serializers.BooleanField(default=True)
    fix_missing_values = serializers.BooleanField(default=True)
    standardize_headers = serializers.BooleanField(default=True)
    trim_whitespace = serializers.BooleanField(default=True)