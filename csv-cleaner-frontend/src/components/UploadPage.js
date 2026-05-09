import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { uploadFileThunk, setUploadProgress } from '../redux/slices/fileSlice';
import './UploadPage.css';

function UploadPage() {
    const [file, setFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            validateAndSetFile(droppedFile);
        }
    };

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            validateAndSetFile(selectedFile);
        }
    };

    const validateAndSetFile = (selectedFile) => {
        const fileExt = selectedFile.name.split('.').pop().toLowerCase();
        if (fileExt !== 'csv') {
            setError('Only CSV files are supported');
            return;
        }
        if (selectedFile.size > 25 * 1024 * 1024) {
            setError('File size exceeds 25MB limit');
            return;
        }
        setFile(selectedFile);
        setError('');
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a file');
            return;
        }

        setIsUploading(true);
        setError('');

        try {
            const resultAction = await dispatch(uploadFileThunk(file));
            if (uploadFileThunk.fulfilled.match(resultAction)) {
                navigate('/clean', { state: { fileData: resultAction.payload } });
            } else {
                setError(resultAction.payload || 'Upload failed');
            }
        } catch (err) {
            setError('Upload failed. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="upload-container">
            <header className="header">
                <h1>CSV Cleaner</h1>
                <p>Clean your CSV files in seconds</p>
            </header>

            <main className="upload-main">
                <section className="upload-section">
                    <h2>1. Upload File</h2>
                    
                    <div className={`drop-zone ${isDragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}>
                        {file ? (
                            <div className="file-selected">
                                <div className="file-icon">📄</div>
                                <div className="file-info">
                                    <h3>{file.name}</h3>
                                    <p>Size: {formatFileSize(file.size)}</p>
                                </div>
                                <button className="change-file" onClick={() => setFile(null)}>
                                    Change File
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="upload-icon">📤</div>
                                <h3>Drag & drop your CSV file here</h3>
                                <p className="or-text">or</p>
                                <label className="file-input-label">
                                    <input type="file" onChange={handleFileSelect} accept=".csv" hidden />
                                    <span className="file-input-button">Choose File</span>
                                </label>
                            </>
                        )}
                    </div>

                    <div className="file-requirements">
                        <h3>📁 Supported format: CSV only</h3>
                        <p>⚖️ Max file size: 25MB</p>
                        <p>✅ Your original file remains untouched</p>
                    </div>

                    {error && (
                        <div className="error-message">
                            <div className="error-icon">⚠️</div>
                            <p>{error}</p>
                        </div>
                    )}

                    <button className={`upload-button ${!file || isUploading ? 'disabled' : ''}`}
                        onClick={handleUpload} disabled={!file || isUploading}>
                        {isUploading ? 'Uploading...' : 'Upload & Continue →'}
                    </button>
                </section>

                <section className="info-section">
                    <h2>File Requirements</h2>
                    <div className="requirements-card">
                        <h3>📋 Supported Format</h3>
                        <ul>
                            <li><strong>CSV</strong> - Comma Separated Values</li>
                        </ul>
                        <h3>🎯 Best Practices</h3>
                        <ul>
                            <li>Include a header row with column names</li>
                            <li>Remove completely empty rows and columns</li>
                            <li>Use consistent date/number formatting</li>
                            <li>Keep file under 25MB for best performance</li>
                        </ul>
                        <div className="safety-note">
                            <p>🔒 <strong>Your data is safe:</strong> We never modify your original file.</p>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default UploadPage;