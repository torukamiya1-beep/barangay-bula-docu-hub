import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.VUE_APP_API_URL || 'http://localhost:7000/api',
  timeout: 60000, // Increased to 60 seconds for slow connections
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

// Response interceptor to handle errors and retries
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const config = error.config;

    // Enhanced error logging for debugging
    const errorDetails = {
      url: config?.url,
      method: config?.method?.toUpperCase(),
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.response?.data?.message || error.message,
      data: error.response?.data,
      requestData: config?.data
    };

    console.error('API Error Details:', errorDetails);
    console.error('Full Error Object:', error);

    // Initialize retry count
    config._retryCount = config._retryCount || 0;
    const maxRetries = 3;
    const retryDelay = 1000; // 1 second base delay

    // Retry logic for network errors or 5xx server errors
    const shouldRetry = (
      !error.response || // Network error
      (error.response.status >= 500 && error.response.status < 600) // Server error
    ) && config._retryCount < maxRetries;

    if (shouldRetry) {
      config._retryCount += 1;

      // Exponential backoff: 1s, 2s, 4s
      const delay = retryDelay * Math.pow(2, config._retryCount - 1);

      console.log(`🔄 Retrying request (${config._retryCount}/${maxRetries}) after ${delay}ms...`);

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));

      // Retry the request
      return api(config);
    }

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
      if (config._retryCount >= maxRetries) {
        error.message = 'Network error - Unable to connect after multiple attempts. Please check your internet connection.';
      } else {
        error.message = 'Network error - please check if the backend server is running';
      }
    } else if (error.response.status === 500) {
      error.message = 'Server error - please check the backend logs for details';
    }

    return Promise.reject(error);
  }
);

export default api;
