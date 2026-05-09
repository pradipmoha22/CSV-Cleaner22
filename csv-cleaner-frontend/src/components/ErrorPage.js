// ErrorPage.js - AutoDataDash
// Displayed when file upload or processing fails

import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ErrorPage.css';

function ErrorPage() {
    
    // Initialize navigation
    const navigate = useNavigate();
    
    // Handle navigation back to upload page
    const handleRetry = () => {
        navigate('/');
    };
    
    // Handle viewing file requirements
    const handleViewRequirements = () => {
        // Could open a modal or navigate to help page
        alert('File Requirements:\n• CSV, XLS, XLSX, TSV formats\n• Max 25MB size\n• Include header row\n• No merged cells');
    };
    
    return (
        <div className="error-page">
            
            {/* Error display */}
            <div className="error-content">
                
                <div className="error-icon">✕</div>
                
                <h2>Unable to Process Your File</h2>
                
                <div className="error-message">
                    <p>
                        We encountered an issue processing your file.
                    </p>
                    <p className="error-detail">
                        <strong>Unsupported file format. Please use .CSV or .XLSX.</strong>
                    </p>
                </div>
                
                {/* Primary action buttons */}
                <div className="action-buttons">
                    <button
                        className="secondary-button retry-button"
                        onClick={handleRetry}
                        aria-label="Try processing the file again"
                    >
                        Try Processing Again
                    </button>
                    
                    <button
                        className="secondary-button upload-button"
                        onClick={handleRetry}
                        aria-label="Upload a different file"
                    >
                        Upload Different File
                    </button>
                </div>
                
                {/* Support options */}
                <div className="support-options">
                    <button 
                        className="text-button support-button"
                        onClick={() => {/* Contact support logic */}}
                    >
                        Contact Support
                    </button>
                </div>
                
                {/* Helpful tips */}
                <div className="troubleshooting">
                    <h4>Troubleshooting Tips</h4>
                    <button 
                        className="text-button requirements-button"
                        onClick={handleViewRequirements}
                    >
                        View File Requirements
                    </button>
                </div>
                
            </div>
            
        </div>
    );
}

export default ErrorPage;