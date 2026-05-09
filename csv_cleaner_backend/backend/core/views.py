from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.utils import timezone
from django.http import HttpResponse
import pandas as pd
import os
import uuid
import threading
from datetime import datetime

from .models import DataFile, CleaningJob
from .serializers import DataFileSerializer, CleaningOptionsSerializer
from .utils import analyze_file, clean_csv_dataframe


@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def upload_file(request):
    if 'file' not in request.FILES:
        return Response({'success': False, 'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
    
    uploaded_file = request.FILES['file']
    file_name = uploaded_file.name
    file_size = uploaded_file.size
    
    if file_size > 25 * 1024 * 1024:
        return Response({'success': False, 'error': 'File size exceeds 25MB limit'}, status=status.HTTP_400_BAD_REQUEST)
    
    file_ext = os.path.splitext(file_name)[1].lower()
    if file_ext != '.csv':
        return Response({'success': False, 'error': 'Only CSV files are supported'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        unique_name = f"{uuid.uuid4()}{file_ext}"
        file_path = f"uploads/{datetime.now().strftime('%Y/%m/%d')}/{unique_name}"
        saved_path = default_storage.save(file_path, ContentFile(uploaded_file.read()))
        
        uploaded_file.seek(0)
        preview_data = analyze_file(uploaded_file, file_ext)
        
        if preview_data['total_rows'] == 0:
            return Response({'success': False, 'error': 'File appears empty', 'empty_file': True}, status=status.HTTP_400_BAD_REQUEST)
        
        data_file = DataFile.objects.create(
            original_filename=file_name,
            file_size=file_size,
            file_format='csv',
            file_path=saved_path,
            status='uploaded',
            total_rows=preview_data['total_rows'],
            total_columns=preview_data['total_columns'],
            missing_values=preview_data['missing_values'],
            duplicate_rows=preview_data['duplicate_rows'],
            preview_columns=preview_data['columns'],
            preview_rows=preview_data['sample_rows']
        )
        
        return Response({'success': True, 'file': DataFileSerializer(data_file).data})
        
    except Exception as e:
        return Response({'success': False, 'error': f'Upload failed: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def start_cleaning(request, file_id):
    try:
        data_file = DataFile.objects.get(id=file_id)
        options_serializer = CleaningOptionsSerializer(data=request.data)
        
        if not options_serializer.is_valid():
            return Response({'success': False, 'error': 'Invalid cleaning options'}, status=status.HTTP_400_BAD_REQUEST)
        
        options = options_serializer.validated_data
        
        cleaning_job = CleaningJob.objects.create(
            original_file=data_file,
            remove_duplicates=options.get('remove_duplicates', True),
            fix_missing_values=options.get('fix_missing_values', True),
            standardize_headers=options.get('standardize_headers', True),
            trim_whitespace=options.get('trim_whitespace', True),
            status='pending'
        )
        
        thread = threading.Thread(target=process_cleaning_job, args=(cleaning_job.id,))
        thread.start()
        
        return Response({'success': True, 'job_id': str(cleaning_job.id), 'message': 'Cleaning started successfully'})
        
    except DataFile.DoesNotExist:
        return Response({'success': False, 'error': 'File not found'}, status=status.HTTP_404_NOT_FOUND)


def process_cleaning_job(job_id):
    try:
        job = CleaningJob.objects.get(id=job_id)
        job.status = 'processing'
        job.started_at = timezone.now()
        job.progress = 10
        job.save()
        
        file_path = job.original_file.file_path
        df = pd.read_csv(file_path)
        
        job.progress = 30
        job.save()
        
        options = {
            'remove_duplicates': job.remove_duplicates,
            'fix_missing_values': job.fix_missing_values,
            'standardize_headers': job.standardize_headers,
            'trim_whitespace': job.trim_whitespace
        }
        
        cleaned_df, changes = clean_csv_dataframe(df, options)
        
        job.duplicates_removed = changes['duplicates_removed']
        job.missing_values_fixed = changes['missing_values_fixed']
        job.headers_standardized = changes['headers_standardized']
        job.whitespace_trimmed = changes['whitespace_trimmed']
        job.progress = 80
        job.save()
        
        output_filename = f"{os.path.splitext(job.original_file.original_filename)[0]}_cleaned.csv"
        output_path = f"cleaned/{job.created_at.year}/{job.created_at.month}/{job.id}_{output_filename}"
        full_output_path = default_storage.save(output_path, ContentFile(cleaned_df.to_csv(index=False).encode('utf-8')))
        
        cleaned_file = DataFile.objects.create(
            original_filename=output_filename,
            file_size=default_storage.size(full_output_path),
            file_format='csv',
            file_path=full_output_path,
            status='completed',
            total_rows=len(cleaned_df),
            total_columns=len(cleaned_df.columns)
        )
        
        job.cleaned_file = cleaned_file
        job.status = 'completed'
        job.completed_at = timezone.now()
        job.progress = 100
        job.save()
        
    except Exception as e:
        try:
            job = CleaningJob.objects.get(id=job_id)
            job.status = 'failed'
            job.save()
        except:
            pass


@api_view(['GET'])
def get_job_status(request, job_id):
    try:
        job = CleaningJob.objects.get(id=job_id)
        return Response({
            'success': True,
            'job': {
                'id': str(job.id),
                'status': job.status,
                'progress': job.progress,
                'duplicates_removed': job.duplicates_removed,
                'missing_values_fixed': job.missing_values_fixed,
                'headers_standardized': job.headers_standardized,
                'whitespace_trimmed': job.whitespace_trimmed
            }
        })
    except CleaningJob.DoesNotExist:
        return Response({'success': False, 'error': 'Job not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
def get_job_results(request, job_id):
    try:
        job = CleaningJob.objects.get(id=job_id)
        
        if job.status != 'completed':
            return Response({'success': False, 'error': 'Job not completed yet'}, status=status.HTTP_400_BAD_REQUEST)
        
        total_changes = job.duplicates_removed + job.missing_values_fixed + job.headers_standardized + job.whitespace_trimmed
        
        improvements = []
        if job.duplicates_removed > 0:
            improvements.append(f'Removed {job.duplicates_removed} duplicate rows')
        if job.missing_values_fixed > 0:
            improvements.append(f'Filled in {job.missing_values_fixed} missing values')
        if job.headers_standardized > 0:
            improvements.append('Standardized header formats')
        if job.whitespace_trimmed > 0:
            improvements.append('Trimmed whitespace from text columns')
        
        return Response({
            'success': True,
            'results': {
                'original_file': {
                    'name': job.original_file.original_filename,
                    'size_mb': job.original_file.get_file_size_mb(),
                    'rows': job.original_file.total_rows,
                    'columns': job.original_file.total_columns
                },
                'cleaned_file': {
                    'id': str(job.cleaned_file.id) if job.cleaned_file else None,
                    'name': job.cleaned_file.original_filename if job.cleaned_file else '',
                    'size_mb': job.cleaned_file.get_file_size_mb() if job.cleaned_file else 0,
                    'rows': job.cleaned_file.total_rows if job.cleaned_file else 0,
                    'download_url': f'/api/download/{job.cleaned_file.id}/' if job.cleaned_file else None
                },
                'stats': {
                    'total_changes': total_changes,
                    'duplicates_removed': job.duplicates_removed,
                    'missing_values_fixed': job.missing_values_fixed,
                    'headers_standardized': job.headers_standardized,
                    'whitespace_trimmed': job.whitespace_trimmed
                },
                'improvements': improvements if improvements else ['Data was already clean']
            }
        })
        
    except CleaningJob.DoesNotExist:
        return Response({'success': False, 'error': 'Job not found'}, status=status.HTTP_404_NOT_FOUND)
# In your job status view
def get(self, request, job_id):
    job = CleaningJob.objects.get(id=job_id)
    response = {
        "success": True,
        "job": {
            "id": str(job.id),
            "status": job.status,
            "progress": job.progress,
            "cleaned_file_url": job.cleaned_file.file_path if job.cleaned_file else None
        }
    }
    return Response(response)


@api_view(['GET'])
def download_file(request, file_id):
    try:
        file_obj = DataFile.objects.get(id=file_id)
        file_path = file_obj.file_path
        
        if not default_storage.exists(file_path):
            return Response({'success': False, 'error': 'File not found'}, status=status.HTTP_404_NOT_FOUND)
        
        file_handle = default_storage.open(file_path, 'rb')
        response = HttpResponse(file_handle.read(), content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="{file_obj.original_filename}"'
        return response
        
    except DataFile.DoesNotExist:
        return Response({'success': False, 'error': 'File not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
def health_check(request):
    return Response({'status': 'healthy', 'service': 'CSV Cleaner API', 'timestamp': datetime.now().isoformat()})