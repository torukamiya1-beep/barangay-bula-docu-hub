import axios from 'axios';

// Ensure the API URL always has the protocol
let API_BASE_URL = process.env.VUE_APP_API_URL || 'http://localhost:7000/api';

// Fix: If the URL doesn't start with http:// or https://, add https://
if (API_BASE_URL && !API_BASE_URL.startsWith('http://') && !API_BASE_URL.startsWith('https://')) {
  API_BASE_URL = `https://${API_BASE_URL}`;
  console.warn('⚠️ API URL was missing protocol, added https://', API_BASE_URL);
}

console.log('🔗 API Base URL:', API_BASE_URL);

class UnifiedAuthService {
  // Clear invalid authentication data
  clearInvalidData() {
    const userStr = localStorage.getItem('auth_user');
    if (userStr === 'undefined' || userStr === 'null') {
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_token');
    }

    const sessionUserStr = sessionStorage.getItem('auth_user');
    if (sessionUserStr === 'undefined' || sessionUserStr === 'null') {
      sessionStorage.removeItem('auth_user');
      sessionStorage.removeItem('auth_token');
    }
  }

  constructor() {
    // Clean up any invalid data from previous sessions
    this.clearInvalidData();

    this.apiClient = axios.create({
      baseURL: `${API_BASE_URL}/auth/unified`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.apiClient.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor to handle token expiration
    this.apiClient.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.logout();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Login method
  async login(credentials) {
    try {
      const response = await this.apiClient.post('/login', credentials);
      
      if (response.data.success) {
        const { user, token, redirectUrl } = response.data.data;
        
        // Store authentication data
        this.setToken(token);
        this.setUser(user);
        
        return {
          success: true,
          user,
          redirectUrl,
          message: response.data.message
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Login failed'
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Check if user is logged in
  isLoggedIn() {
    const token = this.getToken();
    const user = this.getUser();
    return !!(token && user);
  }

  // Get current user
  getCurrentUser() {
    return this.getUser();
  }

  // Backward compatibility methods
  getAdminData() {
    const user = this.getUser();
    return user && user.type === 'admin' ? user : null;
  }

  getClientData() {
    const user = this.getUser();
    return user && user.type === 'client' ? user : null;
  }

  // Get user type (admin or client)
  getUserType() {
    const user = this.getUser();
    return user?.type || null;
  }

  // Get user role (for admin users)
  getUserRole() {
    const user = this.getUser();
    return user?.role || null;
  }

  // Logout
  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_user');
  }



  // Token management
  setToken(token) {
    localStorage.setItem('auth_token', token);
  }

  getToken() {
    return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  }

  // User data management
  setUser(user) {
    if (user && typeof user === 'object') {
      localStorage.setItem('auth_user', JSON.stringify(user));
      console.log('User data stored successfully:', user);
    } else {
      console.error('Invalid user data, not storing:', user);
    }
  }

  getUser() {
    const userStr = localStorage.getItem('auth_user') || sessionStorage.getItem('auth_user');
    try {
      if (!userStr || userStr === 'undefined' || userStr === 'null') {
        return null;
      }
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Error parsing user data:', error);
      // Clear invalid data
      localStorage.removeItem('auth_user');
      sessionStorage.removeItem('auth_user');
      return null;
    }
  }

  // Parse error response
  parseError(error) {
    if (error.response?.data) {
      return {
        message: error.response.data.message || 'An error occurred',
        status: error.response.status,
        errors: error.response.data.errors || []
      };
    }
    
    if (error.message) {
      return {
        message: error.message,
        status: 500,
        errors: []
      };
    }
    
    return {
      message: 'Network error occurred',
      status: 0,
      errors: []
    };
  }

  // Get redirect URL based on user type and role
  getRedirectUrl(user) {
    if (user.type === 'admin') {
      return '/admin/requests'; // Changed from /admin/dashboard to /admin/requests
    } else if (user.type === 'client') {
      return '/client/home'; // Updated to redirect to new client home page
    }
    return '/';
  }
}

export default new UnifiedAuthService();
