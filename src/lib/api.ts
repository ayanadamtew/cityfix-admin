import axios from 'axios';
import { auth } from './firebase';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to attach Firebase token
api.interceptors.request.use(
    async (config) => {
        if (auth.currentUser) {
            const token = await auth.currentUser.getIdToken();
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for global error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Optionally handle generic 401/403 errors here, like logging out
        if (error.response?.status === 401) {
            console.error('Unauthorized access - please log in again.');
            // auth.signOut();
        }
        return Promise.reject(error);
    }
);

export default api;
