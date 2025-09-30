import api from './api';

class ClientAuthService {
  // Register client account (Step 1)
  async registerAccount(accountData) {
    try {
      const response = await api.post('/client/auth/register-account', accountData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Complete registration with profile (Step 2)
  async completeRegistration(accountId, profileData) {
    try {
      const response = await api.post(`/client/auth/complete-registration/${accountId}`, profileData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Verify email with OTP
  async verifyEmail(email, otp) {
    try {
      const response = await api.post('/client/auth/verify-email', { email, otp });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Resend verification email
  async resendVerificationEmail(email) {
    try {
      const response = await api.post('/client/auth/resend-verification', { email });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Send SMS OTP
  async sendSMSOTP(phoneNumber, purpose = 'registration', firstName = '') {
    try {
      const response = await api.post('/otp/send-sms', {
        phoneNumber,
        purpose,
        firstName
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Verify SMS OTP
  async verifySMSOTP(phoneNumber, otp, purpose = 'email_verification') {
    try {
      const response = await api.post('/otp/verify-sms', {
        phoneNumber,
        otp,
        purpose
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Resend SMS OTP
  async resendSMSOTP(phoneNumber, purpose = 'registration', firstName = '') {
    try {
      const response = await api.post('/otp/resend-sms', {
        phoneNumber,
        purpose,
        firstName
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Send unified OTP (same code via both email and SMS)
  async sendUnifiedOTP(email, phoneNumber, purpose = 'registration', firstName = '') {
    try {
      const response = await api.post('/otp/send-unified', {
        email,
        phoneNumber,
        purpose,
        firstName
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Resend unified OTP (same code via both email and SMS)
  async resendUnifiedOTP(email, phoneNumber, purpose = 'registration', firstName = '') {
    try {
      const response = await api.post('/otp/resend-unified', {
        email,
        phoneNumber,
        purpose,
        firstName
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Send OTP (for backward compatibility)
  async sendOTP(email, purpose = 'registration', firstName = '') {
    try {
      const response = await api.post('/otp/send', {
        email,
        purpose,
        firstName
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Client login
  async login(credentials) {
    try {
      const response = await api.post('/client/auth/login', credentials);
      
      if (response.data.success && response.data.data.token) {
        // Store token and client data using unified auth system
        localStorage.setItem('auth_token', response.data.data.token);
        localStorage.setItem('auth_user', JSON.stringify(response.data.data.client));

        // Keep legacy storage for backward compatibility
        localStorage.setItem('clientToken', response.data.data.token);
        localStorage.setItem('clientData', JSON.stringify(response.data.data.client));
      }
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get client profile
  async getProfile() {
    try {
      const response = await api.get('/client/auth/profile');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Logout
  logout() {
    // Clear unified auth tokens
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_user');

    // Clear legacy tokens
    localStorage.removeItem('clientToken');
    localStorage.removeItem('clientData');
  }

  // Check if client is logged in
  isLoggedIn() {
    // Check unified auth token first, then fallback to legacy
    return !!(localStorage.getItem('auth_token') || localStorage.getItem('clientToken'));
  }

  // Get stored client data
  getClientData() {
    // Try unified auth first, then fallback to legacy
    let clientData = localStorage.getItem('auth_user') || localStorage.getItem('clientData');
    return clientData ? JSON.parse(clientData) : null;
  }

  // Get current user (alias for getClientData for compatibility)
  getCurrentUser() {
    return this.getClientData();
  }

  // Get stored token
  getToken() {
    // Try unified auth first, then fallback to legacy
    return localStorage.getItem('auth_token') || localStorage.getItem('clientToken');
  }

  // Migrate legacy auth to unified auth
  migrateLegacyAuth() {
    const clientToken = localStorage.getItem('clientToken');
    const clientData = localStorage.getItem('clientData');
    const authToken = localStorage.getItem('auth_token');

    // If we have legacy auth but no unified auth, migrate it
    if (clientToken && clientData && !authToken) {
      console.log('🔄 Migrating legacy client auth to unified auth system');
      localStorage.setItem('auth_token', clientToken);
      localStorage.setItem('auth_user', clientData);
      console.log('✅ Migration completed');
    }
  }

  // Initialize authentication on app start
  initializeAuth() {
    // First, migrate any legacy auth
    this.migrateLegacyAuth();

    const token = this.getToken();
    if (token) {
      // Set authorization header for API requests
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }



  // Verify OTP
  async verifyOTP(email, otp, purpose = 'registration') {
    try {
      const response = await api.post('/otp/verify', {
        email,
        otp,
        purpose
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Resend OTP
  async resendOTP(email, purpose = 'registration', firstName = '') {
    try {
      const response = await api.post('/otp/resend', {
        email,
        purpose,
        firstName
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Handle API errors
  handleError(error) {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || 'An error occurred';
      const errors = error.response.data?.errors || [];
      return new Error(JSON.stringify({ message, errors, status: error.response.status }));
    } else if (error.request) {
      // Request was made but no response received
      return new Error(JSON.stringify({ 
        message: 'Network error. Please check your connection.', 
        errors: [], 
        status: 0 
      }));
    } else {
      // Something else happened
      return new Error(JSON.stringify({ 
        message: error.message || 'An unexpected error occurred', 
        errors: [], 
        status: 0 
      }));
    }
  }

  // Parse error message
  parseError(error) {
    try {
      return JSON.parse(error.message);
    } catch {
      return { message: error.message, errors: [], status: 0 };
    }
  }
}

export default new ClientAuthService();
