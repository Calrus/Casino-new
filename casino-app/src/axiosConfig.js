import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://localhost:3001',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add a request interceptor to include the Authorization token in requests
instance.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token'); // Adjust based on where you store the token
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    error => Promise.reject(error)
);

export default instance;
