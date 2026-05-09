import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { startCleaningThunk } from '../redux/slices/jobSlice';
import './CleaningPage.css';

function CleaningPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { fileData } = location.state || {};

    const [options, setOptions] = useState({
        remove_duplicates: true,
        fix_missing_values: true,
        standardize_headers: true,
        trim_whitespace: true
    });
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');

    const handleOptionChange = (option) => {
        setOptions({
            ...options,
            [option]: !options[option]
        });
    };

    const handleStartCleaning = async () => {
        if (!fileData?.file?.id) {
            setError('File data not found');
            return;
        }

        setIsProcessing(true);
        setError('');

        try {
            const resultAction = await dispatch(startCleaningThunk({
                fileId: fileData.file.id,
                options
            }));
            
            if (startCleaningThunk.fulfilled.match(resultAction)) {
                navigate('/processing', {
                    state: {
                        jobId: resultAction.payload.job_id,
                        fileName: fileData.file.original_filename
                    }
                });
            } else {
                setError(resultAction.payload || 'Failed to start cleaning');
            }
        } catch (err) {
            setError('Failed to start cleaning. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    if (!fileData) {
        return (
            <div className="error-container">
                <h2>No file selected</h2>
                <button onClick={() => navigate('/')}>Go Back to Upload</button>
            </div>
        );
    }

    return (
        <div className="cleaning-container">
            <header className="header">
                <h1>CSV Cleaner</h1>
                <p>Configure your cleaning options</p>
            </header>

            <main className="cleaning-main">
                <section className="file-info-section">
                    <h3>Selected File</h3>
                    <div className="file-card">
                        <div className="file-icon">📄</div>
                        <div className="file-details">
                            <h4>{fileData.file.original_filename}</h4>
                            <p>{fileData.file.file_size_mb} MB • {fileData.file.total_rows} rows • {fileData.file.total_columns} columns</p>
                        </div>
                    </div>
                </section>

                <section className="options-section">
                    <h2>Cleaning Options</h2>
                    <div className="options-grid">
                        <div 
                            className={`option-card ${options.remove_duplicates ? 'selected' : ''}`}
                            onClick={() => handleOptionChange('remove_duplicates')}
                        >
                            <div className="option-icon">{options.remove_duplicates ? '✓' : '+'}</div>
                            <div className="option-content">
                                <h4>Remove Duplicates</h4>
                                <p>Eliminate duplicate rows from your data</p>
                            </div>
                        </div>

                        <div 
                            className={`option-card ${options.fix_missing_values ? 'selected' : ''}`}
                            onClick={() => handleOptionChange('fix_missing_values')}
                        >
                            <div className="option-icon">{options.fix_missing_values ? '✓' : '+'}</div>
                            <div className="option-content">
                                <h4>Fix Missing Values</h4>
                                <p>Fill empty cells with appropriate values</p>
                            </div>
                        </div>

                        <div 
                            className={`option-card ${options.standardize_headers ? 'selected' : ''}`}
                            onClick={() => handleOptionChange('standardize_headers')}
                        >
                            <div className="option-icon">{options.standardize_headers ? '✓' : '+'}</div>
                            <div className="option-content">
                                <h4>Standardize Headers</h4>
                                <p>Convert column names to consistent format</p>
                            </div>
                        </div>

                        <div 
                            className={`option-card ${options.trim_whitespace ? 'selected' : ''}`}
                            onClick={() => handleOptionChange('trim_whitespace')}
                        >
                            <div className="option-icon">{options.trim_whitespace ? '✓' : '+'}</div>
                            <div className="option-content">
                                <h4>Trim Whitespace</h4>
                                <p>Remove extra spaces from text data</p>
                            </div>
                        </div>
                    </div>

                    <div className="safety-notice">
                        <p>🔒 We only apply safe, non-destructive cleaning actions. Your original file remains untouched.</p>
                    </div>

                    {error && (
                        <div className="error-message">
                            <div className="error-icon">⚠️</div>
                            <p>{error}</p>
                        </div>
                    )}

                    <div className="action-buttons">
                        <button 
                            className="secondary-button" 
                            onClick={() => navigate('/')}
                        >
                            ← Start Over
                        </button>
                        <button 
                            className={`primary-button ${isProcessing ? 'processing' : ''}`}
                            onClick={handleStartCleaning}
                            disabled={isProcessing}
                        >
                            {isProcessing ? 'Processing...' : 'Start Cleaning →'}
                        </button>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default CleaningPage;