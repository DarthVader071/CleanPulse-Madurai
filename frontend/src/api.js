import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authAPI = {
    login: (data) => api.post('/auth/login', data),
    register: (data) => api.post('/auth/register', data),
    getProfile: () => api.get('/auth/me'),
};

export const complaintAPI = {
    create: (data) => api.post('/complaints', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
    getAll: () => api.get('/complaints'),
    getMyComplaints: () => api.get('/complaints'),
    updateStatus: (id, status) => api.put(`/complaints/${id}/status`, { status }),
};

export const leaderboardAPI = {
    getTopCitizens: () => api.get('/auth/leaderboard'),
};

export const routeAPI = {
    optimize: (data) => axios.post('http://localhost:5002/api/optimize-route', data),
};

export default api;
