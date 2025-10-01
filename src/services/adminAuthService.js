import api from './api';

class AdminAuthService {
  // Register admin account (Step 1)
  async registerAccount(accountData) {
    try {
      const response = await api.post('/admin/auth/register-account', accountData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Complete registration with profile (Step 2)
  async completeRegistration(accountId, profileData) {
    try {
      const response = await api.post(`/admin/auth/complete-registration/${accountId}`, profileData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Verify email with OTP
  async verifyEmail(email, otp) {
    try {
      const response = await api.post('/admin/auth/verify-email', { email, otp });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Resend verification email
  async resendVerificationEmail(email) {
    try {
      const response = await api.post('/admin/auth/resend-verification', { email });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Admin login
  async login(credentials) {
    try {
      const response = await api.post('/admin/auth/login', credentials);
      
      if (response.data.success && response.data.data.token) {
        // Store token and admin data using unified auth system
        localStorage.setItem('auth_token', response.data.data.token);
        localStorage.setItem('auth_user', JSON.stringify(response.data.data.admin));

        // Keep legacy storage for backward compatibility
        localStorage.setItem('adminToken', response.data.data.token);
        localStorage.setItem('adminData', JSON.stringify(response.data.data.admin));

        // Note: Authorization header is now handled by API interceptor
      }
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get admin profile
  async getProfile() {
    try {
      const response = await api.get('/admin/auth/profile');
      
      // Update stored admin data
      if (response.data.success && response.data.data) {
        localStorage.setItem('auth_user', JSON.stringify(response.data.data));
        localStorage.setItem('adminData', JSON.stringify(response.data.data)); // Legacy compatibility
      }
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Update admin profile
  async updateProfile(profileData) {
    try {
      const response = await api.put('/admin/auth/profile', profileData);

      // Update stored admin data
      if (response.data.success && response.data.data) {
        localStorage.setItem('auth_user', JSON.stringify(response.data.data));
        localStorage.setItem('adminData', JSON.stringify(response.data.data)); // Legacy compatibility
      }

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Change password
  async changePassword(passwordData) {
    try {
      const response = await api.put('/admin/auth/change-password', passwordData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Send password reset email
  async sendPasswordReset(email) {
    try {
      const response = await api.post('/admin/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Reset password with token
  async resetPassword(token, newPassword) {
    try {
      const response = await api.post('/admin/auth/reset-password', { token, newPassword });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get dashboard statistics
  async getDashboardStats() {
    try {
      const response = await api.get('/admin/dashboard/stats');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get recent activity
  async getRecentActivity(limit = 10) {
    try {
      const response = await api.get(`/admin/dashboard/activity?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get notifications
  async getNotifications(limit = 20) {
    try {
      const response = await api.get(`/admin/notifications?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId) {
    try {
      const response = await api.put(`/admin/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Mark all notifications as read
  async markAllNotificationsAsRead() {
    try {
      const response = await api.put('/admin/notifications/read-all');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Logout
  async logout() {
    try {
      // Call logout endpoint if available
      await api.post('/admin/auth/logout');
    } catch (error) {
      // Continue with local logout even if API call fails
      console.error('Logout API error:', error);
    } finally {
      // Always clear local storage and headers
      this.clearAuthData();
    }
  }

  // Clear authentication data
  clearAuthData() {
    // Clear unified auth tokens
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_user');

    // Clear legacy tokens for backward compatibility
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    // Note: Authorization header is now handled by API interceptor
  }

  // Check if admin is logged in
  isLoggedIn() {
    // Check unified auth token first, then fallback to legacy
    const token = localStorage.getItem('auth_token') || localStorage.getItem('adminToken');
    return !!token;
  }

  // Check if admin is authenticated (with token validation)
  isAuthenticated() {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('adminToken');
    const adminData = this.getAdminData();

    if (!token || !adminData) {
      return false;
    }

    try {
      // Basic token validation
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        return false;
      }

      // Decode payload to check expiration
      const payload = JSON.parse(atob(tokenParts[1]));
      const currentTime = Math.floor(Date.now() / 1000);

      if (payload.exp && payload.exp < currentTime) {
        // Token expired
        this.clearAuthData();
        return false;
      }

      // Verify token type is admin
      if (payload.type !== 'admin') {
        this.clearAuthData();
        return false;
      }

      return true;
    } catch (error) {
      console.error('Token validation error:', error);
      this.clearAuthData();
      return false;
    }
  }

  // Check if admin has specific role
  hasRole(requiredRole) {
    const adminData = this.getAdminData();
    if (!adminData || !this.isAuthenticated()) {
      return false;
    }

    // Admin role has access to everything
    if (adminData.role === 'admin') {
      return true;
    }

    // Check specific role
    return adminData.role === requiredRole;
  }

  // Check if admin has any of the specified roles
  hasAnyRole(roles) {
    if (!Array.isArray(roles)) {
      return this.hasRole(roles);
    }

    return roles.some(role => this.hasRole(role));
  }

  // Get stored admin data
  getAdminData() {
    // Try unified auth first, then fallback to legacy
    const adminData = localStorage.getItem('auth_user') || localStorage.getItem('adminData');
    return adminData ? JSON.parse(adminData) : null;
  }

  // Get stored token
  getToken() {
    // Try unified auth first, then fallback to legacy
    return localStorage.getItem('auth_token') || localStorage.getItem('adminToken');
  }

  // Send OTP for registration or other purposes
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

  // Verify OTP (generic)
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

  // Initialize authentication on app start
  initializeAuth() {
    // Migrate legacy auth to unified auth if needed
    this.migrateLegacyAuth();

    const token = this.getToken();
    if (token) {
      // Note: Authorization header is now handled by API interceptor
      // Token is automatically included in requests by the interceptor
    }
  }

  // Migrate legacy auth to unified auth
  migrateLegacyAuth() {
    const adminToken = localStorage.getItem('adminToken');
    const adminData = localStorage.getItem('adminData');
    const authToken = localStorage.getItem('auth_token');

    // If we have legacy auth but no unified auth, migrate it
    if (adminToken && adminData && !authToken) {
      console.log('🔄 Migrating legacy admin auth to unified auth system');
      localStorage.setItem('auth_token', adminToken);
      localStorage.setItem('auth_user', adminData);
      console.log('✅ Migration completed');
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

export default new AdminAuthService();