import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.DEV ? (import.meta.env.VITE_API_URL || '/api') : '/api',
    withCredentials: true
});

export default api;
