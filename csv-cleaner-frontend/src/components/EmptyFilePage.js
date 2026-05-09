import React from 'react';
import { useNavigate } from 'react-router-dom';
import './EmptyFilePage.css';

function EmptyFilePage() {
    const navigate = useNavigate();

    return (
        <div className="empty-file-page">
            <div className="empty-icon">⚠️</div>
            <h2>File Appears Empty</h2>
            <p>We couldn't find any readable data in your file. This can happen if:</p>
            <ul className="issues-list">
                <li>The file is truly empty</li>
                <li>Incorrect file format</li>
                <li>Data is in an unsupported sheet</li>
            </ul>
            <div className="action-buttons">
                <button className="primary-button" onClick={() => navigate('/')}>
                    Upload Different File
                </button>
                <button className="secondary-button">View File Requirements</button>
            </div>
            <div className="support-links">
                <p>Need help?</p>
                <button className="text-button">Contact Support</button>
                <span> or </span>
                <button className="text-button" onClick={() => navigate('/')}>
                    Return to Home Page
                </button>
            </div>
        </div>
    );
}

export default EmptyFilePage;