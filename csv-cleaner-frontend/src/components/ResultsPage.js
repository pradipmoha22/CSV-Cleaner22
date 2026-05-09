import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchJobResults } from '../redux/slices/jobSlice';
import { downloadFile } from '../services/api';
import './ResultsPage.css';

function ResultsPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { jobId } = location.state || {};
    const { jobResults } = useSelector((state) => state.jobs);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        if (!jobId) {
            navigate('/');
            return;
        }

        const loadResults = async () => {
            try {
                await dispatch(fetchJobResults(jobId)).unwrap();
            } catch (err) {
                setError(err || 'Failed to load results');
            } finally {
                setIsLoading(false);
            }
        };
        loadResults();
    }, [jobId, dispatch, navigate]);

    const handleDownload = async () => {
        if (!jobResults?.cleaned_file?.download_url) return;
        
        setIsDownloading(true);
        try {
            const fileId = jobResults.cleaned_file.download_url.split('/').filter(Boolean).pop();
            const response = await downloadFile(fileId);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', jobResults.cleaned_file.name || 'cleaned_data.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            alert('Download failed. Please try again.');
        } finally {
            setIsDownloading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading results...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <div className="error-icon">✕</div>
                <h2>Unable to Load Results</h2>
                <p>{error}</p>
                <button className="primary-button" onClick={() => navigate('/')}>
                    Go Back to Upload
                </button>
            </div>
        );
    }

    return (
        <div className="results-container">
            <header className="header">
                <h1>CSV Cleaner</h1>
                <p>Your file has been processed</p>
            </header>

            <main className="results-main">
                <div className="success-banner">
                    <div className="success-icon">✓</div>
                    <div className="success-text">
                        <strong>Cleaning Complete!</strong>
                        <p>Your file has been processed successfully</p>
                    </div>
                </div>

                <div className="file-details">
                    <h3>File Details</h3>
                    <div className="details-grid">
                        <div className="detail-item">
                            <span>Original File</span>
                            <strong>{jobResults?.original_file?.name || 'Unknown'}</strong>
                        </div>
                        <div className="detail-item">
                            <span>Cleaned File</span>
                            <strong>{jobResults?.cleaned_file?.name || 'cleaned_data.csv'}</strong>
                        </div>
                        <div className="detail-item">
                            <span>File Size</span>
                            <strong>{jobResults?.cleaned_file?.size_mb || '0'} MB</strong>
                        </div>
                        <div className="detail-item">
                            <span>Rows</span>
                            <strong>{jobResults?.cleaned_file?.rows || 0}</strong>
                        </div>
                    </div>
                </div>

                <div className="statistics-section">
                    <h3>Cleaning Statistics</h3>
                    <div className="stats-grid">
                        <div className="stat-item">
                            <span>Duplicates Removed:</span>
                            <strong>{jobResults?.stats?.duplicates_removed || 0}</strong>
                        </div>
                        <div className="stat-item">
                            <span>Missing Values Fixed:</span>
                            <strong>{jobResults?.stats?.missing_values_fixed || 0}</strong>
                        </div>
                        <div className="stat-item">
                            <span>Headers Standardized:</span>
                            <strong>{jobResults?.stats?.headers_standardized || 0}</strong>
                        </div>
                        <div className="stat-item">
                            <span>Whitespace Trimmed:</span>
                            <strong>{jobResults?.stats?.whitespace_trimmed || 0}</strong>
                        </div>
                    </div>
                </div>

                <div className="improvements-section">
                    <h3>Improvements Made</h3>
                    <ul className="improvements-list">
                        {jobResults?.improvements?.map((improvement, index) => (
                            <li key={index}>{improvement}</li>
                        ))}
                    </ul>
                </div>

                <div className="download-section">
                    <button
                        className={`download-button ${isDownloading ? 'downloading' : ''}`}
                        onClick={handleDownload}
                        disabled={isDownloading}
                    >
                        {isDownloading ? 'Downloading...' : 'Download Cleaned CSV'}
                    </button>
                    <p className="download-note">
                        Your original file remains untouched. This is a new, cleaned version.
                    </p>
                </div>

                <div className="action-buttons">
                    <button className="secondary-button" onClick={() => navigate('/')}>
                        Clean Another File
                    </button>
                </div>
            </main>
        </div>
    );
}

export default ResultsPage;