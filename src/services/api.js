import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.VUE_APP_API_URL || 'http://localhost:7000/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Enable credentials for CORS
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Get unified auth token
    const authToken = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');

    // Add auth token to all requests if available
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }

    // Debug logging for API requests
    if (config.url?.includes('/users') || config.url?.includes('/admin/') || config.url?.includes('/client/')) {
      console.log('🔗 API Request:', {
        url: config.url,
        hasAuthToken: !!authToken,
        authHeader: config.headers.Authorization ? 'Bearer ***' : 'None'
      });
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Enhanced error logging for debugging
    const errorDetails = {
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.response?.data?.message || error.message,
      data: error.response?.data,
      requestData: error.config?.data
    };

    console.error('API Error Details:', errorDetails);
    console.error('Full Error Object:', error);

    if (error.response?.status === 401) {
      // Token expired or invalid - clear unified auth data
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      sessionStorage.removeItem('auth_token');
      sessionStorage.removeItem('auth_user');
      // Don't redirect here, let components handle it
    }

    // Add more helpful error messages
    if (!error.response) {
      error.message = 'Network error - please check if the backend server is running on port 7000';
    } else if (error.response.status === 500) {
      error.message = 'Server error - please check the backend logs for details';
    }

    return Promise.reject(error);
  }
);

export default api;
