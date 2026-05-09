// ✅ REPLACE your entire Login.jsx with this:

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleDemoLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('📡 Attempting login...');
      
      const response = await axios.post('http://localhost:8000/api/token/', {
        username: 'Auto24',
        password: 'Python@123'
      });

      console.log('✅ Login response:', response.data);
      
      // ✅ CRITICAL - Verify we got tokens
      if (!response.data.access) {
        throw new Error('No access token received');
      }

      // ✅ STORE TOKENS
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      localStorage.setItem('user', JSON.stringify({ 
        username: 'Auto24',
        login_time: new Date().toISOString()
      }));
      
      // ✅ VERIFY storage worked
      const storedToken = localStorage.getItem('access_token');
      console.log('✅ Token stored:', storedToken ? storedToken.substring(0, 20) + '...' : 'FAILED!');
      
      // ✅ Force navigate to home
      window.location.href = '/';  // Use this instead of navigate() for reliability
      
    } catch (error) {
      console.error('❌ Login failed:', error);
      setError(
        error.response?.data?.detail || 
        error.message ||
        'Login failed. Make sure backend is running on port 8000.'
      );
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>AutoDataDash</h1>
        <h2>Login</h2>
        
        {error && <div className="error-message">⚠️ {error}</div>}
        
        <button 
          onClick={handleDemoLogin}
          disabled={loading}
          className="login-button"
        >
          {loading ? 'Logging in...' : 'Login with Demo Account'}
        </button>
        
        <div className="demo-credentials">
          <p><strong>Demo Credentials:</strong></p>
          <p>Username: <code>Auto24</code></p>
          <p>Password: <code>Python@123</code></p>
        </div>
      </div>
    </div>
  );
}

export default Login;