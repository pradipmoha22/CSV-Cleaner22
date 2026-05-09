import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

export const uploadFile = (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

export const startCleaning = (fileId, options) => {
    return api.post(`/clean/${fileId}/start/`, options);
};

export const getJobStatus = (jobId) => {
    return api.get(`/job/${jobId}/status/`);
};

export const getJobResults = (jobId) => {
    return api.get(`/job/${jobId}/results/`);
};

export const downloadFile = (fileId) => {
    return api.get(`/download/${fileId}/`, { responseType: 'blob' });
};

export default api;