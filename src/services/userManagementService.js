import api from './api';

class UserManagementService {
  constructor() {
    this.baseURL = '/users';
  }

  /**
   * Get all users with filtering and pagination
   */
  async getUsers(params = {}) {
    try {
      const response = await api.get(this.baseURL, { params });
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats() {
    try {
      const response = await api.get(`${this.baseURL}/stats`);
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get specific user details
   */
  async getUser(userId) {
    try {
      const response = await api.get(`${this.baseURL}/${userId}`);
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Create new user (admin or client)
   */
  async createUser(userData) {
    try {
      const response = await api.post(this.baseURL, userData);
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Update user information
   */
  async updateUser(userId, userData) {
    try {
      const response = await api.put(`${this.baseURL}/${userId}`, userData);
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Update user status (activate, suspend, etc.)
   */
  async updateUserStatus(userId, status, reason = '') {
    try {
      const response = await api.patch(`${this.baseURL}/${userId}/status`, {
        status,
        reason
      });
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Delete user
   */
  async deleteUser(userId, reason = '') {
    try {
      const response = await api.delete(`${this.baseURL}/${userId}`, {
        data: { reason }
      });
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Reset user password
   */
  async resetUserPassword(userId, newPassword) {
    try {
      const response = await api.post(`${this.baseURL}/${userId}/reset-password`, {
        new_password: newPassword
      });
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get user activity logs
   */
  async getUserActivity(userId, params = {}) {
    try {
      const response = await api.get(`${this.baseURL}/${userId}/activity`, { params });
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Bulk operations on users
   */
  async bulkUpdateUsers(userIds, action, data = {}) {
    try {
      const response = await api.post(`${this.baseURL}/bulk`, {
        user_ids: userIds,
        action,
        data
      });
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Export users data
   */
  async exportUsers(format = 'csv', filters = {}) {
    try {
      const response = await api.get(`${this.baseURL}/export`, {
        params: { format, ...filters },
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true, message: 'Export completed successfully' };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get archived (soft-deleted) users
   */
  async getArchivedUsers(page = 1, limit = 10, search = '') {
    try {
      const params = {
        page,
        limit,
        ...(search && { search })
      };

      const response = await api.get(`${this.baseURL}/get-archived-users`, { params });
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Restore archived user
   */
  async restoreUser(userId) {
    try {
      const response = await api.patch(`${this.baseURL}/${userId}/restore`);
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get available user roles/types
   */
  async getUserRoles() {
    try {
      const response = await api.get(`${this.baseURL}/roles`);
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Handle successful API response
   */
  handleResponse(response) {
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
        pagination: response.data.pagination
      };
    } else {
      throw new Error(response.data.message || 'Operation failed');
    }
  }

  /**
   * Handle API errors
   */
  handleError(error) {
    console.error('User Management Service Error:', error);
    
    let message = 'An unexpected error occurred';
    let errors = [];
    let status = 0;

    if (error.response) {
      status = error.response.status;
      const data = error.response.data;
      
      if (data.message) {
        message = data.message;
      }
      
      if (data.errors) {
        errors = Array.isArray(data.errors) ? data.errors : [data.errors];
      }
      
      // Handle specific HTTP status codes
      switch (status) {
        case 401:
          message = 'Authentication required. Please log in again.';
          break;
        case 403:
          message = 'You do not have permission to perform this action.';
          break;
        case 404:
          message = 'User not found.';
          break;
        case 422:
          message = 'Validation failed. Please check your input.';
          break;
        case 429:
          message = 'Too many requests. Please try again later.';
          break;
        case 500:
          message = 'Server error. Please try again later.';
          break;
      }
    } else if (error.request) {
      message = 'Network error. Please check your connection.';
    }

    return {
      success: false,
      message,
      errors,
      status
    };
  }

  /**
   * Validate user data before submission
   */
  validateUserData(userData, isUpdate = false) {
    const errors = [];

    if (!isUpdate || userData.username) {
      if (!userData.username || userData.username.length < 3) {
        errors.push('Username must be at least 3 characters long');
      }
    }

    if (!isUpdate || userData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!userData.email || !emailRegex.test(userData.email)) {
        errors.push('Please provide a valid email address');
      }
    }

    if (!isUpdate || userData.password) {
      if (!userData.password || userData.password.length < 6) {
        errors.push('Password must be at least 6 characters long');
      }
    }

    if (!isUpdate || userData.first_name) {
      if (!userData.first_name || userData.first_name.trim().length < 2) {
        errors.push('First name must be at least 2 characters long');
      }
    }

    if (!isUpdate || userData.last_name) {
      if (!userData.last_name || userData.last_name.trim().length < 2) {
        errors.push('Last name must be at least 2 characters long');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Format user data for display
   */
  formatUserData(user) {
    return {
      ...user,
      full_name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
      status_label: this.getStatusLabel(user.status),
      type_label: this.getTypeLabel(user.type || user.role),
      created_at_formatted: this.formatDate(user.created_at),
      last_login_formatted: user.last_login ? this.formatDate(user.last_login) : 'Never'
    };
  }

  /**
   * Get human-readable status label
   */
  getStatusLabel(status) {
    const labels = {
      'active': 'Active',
      'inactive': 'Inactive',
      'pending': 'Pending Verification',
      'suspended': 'Suspended',
      'pending_verification': 'Pending Verification'
    };
    return labels[status] || status;
  }

  /**
   * Get human-readable type label
   */
  getTypeLabel(type) {
    const labels = {
      'admin': 'Administrator',
      'employee': 'Employee',
      'client': 'Client',
      'user': 'User'
    };
    return labels[type] || type;
  }

  /**
   * Format date for display
   */
  formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

export default new UserManagementService();
