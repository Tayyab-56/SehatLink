import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' }
});

// Add token to every request
API.interceptors.request.use(
  (config) => {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      // If you have token in user object
      if (userData.token) {
        config.headers.Authorization = `Bearer ${userData.token}`;
      }
      // Also send user ID for authorization
      config.headers['X-User-Id'] = userData.id;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default API;