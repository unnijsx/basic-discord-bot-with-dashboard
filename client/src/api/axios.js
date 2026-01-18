import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.DEV ? '/api' : `${import.meta.env.VITE_API_URL || 'https://basicbotbackend.vercel.app'}/api`,
    withCredentials: true
});

export default api;
