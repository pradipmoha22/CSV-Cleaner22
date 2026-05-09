import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { pollJobStatus } from '../redux/slices/jobSlice';
import './ProcessingPage.css';

function ProcessingPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { jobId, fileName } = location.state || {};
    const { jobProgress, jobStatus, jobError } = useSelector((state) => state.jobs);
    const [polling, setPolling] = useState(true);

    useEffect(() => {
        if (!jobId) {
            navigate('/');
            return;
        }

        let interval;
        if (polling) {
            interval = setInterval(() => {
                dispatch(pollJobStatus(jobId));
            }, 2000);
        }

        return () => clearInterval(interval);
    }, [jobId, polling, dispatch, navigate]);

    useEffect(() => {
        if (jobStatus === 'succeeded') {
            setPolling(false);
            setTimeout(() => {
                navigate('/results', { state: { jobId } });
            }, 1000);
        } else if (jobStatus === 'failed') {
            setPolling(false);
        }
    }, [jobStatus, jobId, navigate]);

    const operations = [
        { name: 'Validating file', completed: jobProgress >= 10 },
        { name: 'Reading file', completed: jobProgress >= 30 },
        { name: 'Removing duplicates', completed: jobProgress >= 50 },
        { name: 'Cleaning data', completed: jobProgress >= 70 },
        { name: 'Saving cleaned file', completed: jobProgress >= 90 },
        { name: 'Complete', completed: jobProgress >= 100 },
    ];

    return (
        <div className="processing-container">
            <header className="header">
                <h1>CSV Cleaner</h1>
                <p>Processing your file</p>
            </header>

            <main className="processing-main">
                <div className="processing-card">
                    <h2>Cleaning Your Data</h2>
                    
                    <div className="file-info">
                        <div className="file-icon">📄</div>
                        <div>
                            <h3>{fileName || 'Your file'}</h3>
                            <p>Processing in progress...</p>
                        </div>
                    </div>

                    <div className="progress-section">
                        <p>Processing your file...</p>
                        <div className="progress-bar">
                            <div 
                                className="progress-fill" 
                                style={{ width: `${jobProgress}%` }}
                            ></div>
                        </div>
                        <div className="progress-text">{jobProgress}% complete</div>
                    </div>

                    <div className="operations-list">
                        <h4>Current Operations</h4>
                        {operations.map((operation, index) => (
                            <div key={index} className="operation-item">
                                <div className="operation-icon">
                                    {operation.completed ? (
                                        <span className="icon completed">✓</span>
                                    ) : (
                                        <span className="icon pending">○</span>
                                    )}
                                </div>
                                <div className={`operation-text ${operation.completed ? 'completed' : 'pending'}`}>
                                    {operation.name}
                                </div>
                            </div>
                        ))}
                    </div>

                    {jobError && (
                        <div className="error-message">
                            <div className="error-icon">⚠️</div>
                            <p>{jobError}</p>
                            <button className="retry-button" onClick={() => navigate('/')}>
                                Try Again
                            </button>
                        </div>
                    )}

                    <div className="processing-notice">
                        <p>Please don't close this window during processing</p>
                    </div>

                    <div className="status-indicator">
                        <span className={`status-dot ${jobStatus}`}></span>
                        <span className="status-text">
                            Status: {jobStatus?.toUpperCase() || 'PROCESSING'}
                        </span>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default ProcessingPage;