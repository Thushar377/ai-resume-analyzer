// src/services/api.js
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE,
    headers: { 'Content-Type': 'application/json' }
});

// Request interceptor - attach token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor - handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config;
        
        if (error.response?.status === 401 && !original._retry) {
            original._retry = true;
            
            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
                try {
                    const { data } = await axios.post(
                        `${API_BASE}/auth/refresh`,
                        {},
                        { headers: { Authorization: `Bearer ${refreshToken}` } }
                    );
                    localStorage.setItem('access_token', data.access_token);
                    original.headers.Authorization = `Bearer ${data.access_token}`;
                    return api(original);
                } catch {
                    localStorage.clear();
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: (data) => api.post('/auth/register', data).then(r => r.data),
    login: (data) => api.post('/auth/login', data).then(r => r.data),
    logout: () => api.post('/auth/logout').then(r => r.data),
    getMe: () => api.get('/auth/me').then(r => r.data),
    refresh: (token) => api.post('/auth/refresh', {}, {
        headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.data)
};

// Resume API
export const resumeAPI = {
    upload: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post('/resumes/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }).then(r => r.data);
    },
    getAll: () => api.get('/resumes/').then(r => r.data),
    getById: (id) => api.get(`/resumes/${id}`).then(r => r.data),
    delete: (id) => api.delete(`/resumes/${id}`)
};

// Analysis API
export const analysisAPI = {
    create: (data) => api.post('/analyses/', data).then(r => r.data),
    getAll: () => api.get('/analyses/').then(r => r.data),
    getById: (id) => api.get(`/analyses/${id}`).then(r => r.data),
    delete: (id) => api.delete(`/analyses/${id}`)
};

// Dashboard API
export const dashboardAPI = {
    getStats: () => api.get('/dashboard/stats').then(r => r.data),
    getHistory: (skip = 0, limit = 20) => 
        api.get(`/dashboard/analyses/history?skip=${skip}&limit=${limit}`).then(r => r.data)
};

export default api;