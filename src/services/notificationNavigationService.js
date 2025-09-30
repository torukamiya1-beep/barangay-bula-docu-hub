import api from './api';

/**
 * Service for handling notification navigation and validation
 */
class NotificationNavigationService {
  /**
   * Check if a request exists and is accessible to the current user
   * @param {number} requestId - The request ID to check
   * @param {string} userType - 'admin' or 'client'
   * @returns {Promise<boolean>} - True if request exists and is accessible
   */
  async checkRequestExists(requestId, userType = 'client') {
    try {
      console.log(`🔍 Checking if request ${requestId} exists for ${userType}`);
      
      const endpoint = userType === 'admin' 
        ? `/admin/documents/requests/${requestId}/exists`
        : `/client/document-requests/${requestId}/exists`;
      
      const response = await api.get(endpoint);
      
      if (response.data && response.data.success) {
        console.log(`✅ Request ${requestId} exists and is accessible`);
        return true;
      } else {
        console.log(`❌ Request ${requestId} does not exist or is not accessible`);
        return false;
      }
    } catch (error) {
      console.error(`❌ Error checking request existence:`, error);
      
      // If it's a 404, the request doesn't exist
      if (error.response && error.response.status === 404) {
        return false;
      }
      
      // For other errors, assume it exists to avoid blocking navigation
      // The actual page will handle the error appropriately
      console.log(`⚠️ Assuming request exists due to error`);
      return true;
    }
  }

  /**
   * Check if a user exists and is accessible to the current admin
   * @param {number} userId - The user ID to check
   * @returns {Promise<boolean>} - True if user exists and is accessible
   */
  async checkUserExists(userId) {
    try {
      console.log(`🔍 Checking if user ${userId} exists`);
      
      const response = await api.get(`/admin/users/${userId}/exists`);
      
      if (response.data && response.data.success) {
        console.log(`✅ User ${userId} exists and is accessible`);
        return true;
      } else {
        console.log(`❌ User ${userId} does not exist or is not accessible`);
        return false;
      }
    } catch (error) {
      console.error(`❌ Error checking user existence:`, error);
      
      // If it's a 404, the user doesn't exist
      if (error.response && error.response.status === 404) {
        return false;
      }
      
      // For other errors, assume it exists
      console.log(`⚠️ Assuming user exists due to error`);
      return true;
    }
  }

  /**
   * Validate notification data and extract relevant IDs
   * @param {Object} notification - The notification object
   * @returns {Object} - Parsed and validated notification data
   */
  parseNotificationData(notification) {
    try {
      let data = {};
      
      if (notification.data) {
        if (typeof notification.data === 'string') {
          data = JSON.parse(notification.data);
        } else if (typeof notification.data === 'object') {
          data = notification.data;
        }
      }
      
      return {
        requestId: data.request_id || null,
        userId: data.user_id || data.client_id || null,
        userType: data.user_type || null,
        requestNumber: data.request_number || null,
        documentType: data.document_type || null,
        priority: data.priority || null,
        ...data // Include all other data
      };
    } catch (error) {
      console.error('❌ Error parsing notification data:', error);
      return {};
    }
  }

  /**
   * Show a toast notification for navigation errors
   * @param {string} message - Error message to display
   * @param {Function} emitFn - Function to emit error events
   */
  showNavigationError(message, emitFn) {
    console.error('🚨 Navigation Error:', message);
    
    if (typeof emitFn === 'function') {
      emitFn('error', message);
    }
    
    // You could also integrate with a toast notification system here
    // For example: this.$toast.error(message);
  }

  /**
   * Get the appropriate icon for a notification type
   * @param {string} type - Notification type
   * @param {string} userType - 'admin' or 'client'
   * @returns {string} - CSS classes for the icon
   */
  getNotificationIcon(type, userType = 'client') {
    const adminIcons = {
      'new_request': 'fas fa-file-plus text-success',
      'status_change': 'fas fa-sync-alt text-info',
      'request_update': 'fas fa-edit text-warning',
      'request_cancelled': 'fas fa-times-circle text-danger',
      'payment_confirmed': 'fas fa-check-circle text-success',
      'payment_update': 'fas fa-money-bill text-info',
      'system_alert': 'fas fa-exclamation-triangle text-danger',
      'urgent_request': 'fas fa-exclamation-circle text-danger',
      'user_registration': 'fas fa-user-plus text-info',
      'new_user': 'fas fa-user-check text-success',
      'test': 'fas fa-vial text-secondary',
      'connection': 'fas fa-plug text-success'
    };

    const clientIcons = {
      'status_change': 'fas fa-sync-alt text-info',
      'payment_confirmed': 'fas fa-credit-card text-success',
      'payment_required': 'fas fa-money-bill text-warning',
      'payment_update': 'fas fa-money-bill text-info',
      'document_ready': 'fas fa-file-check text-success',
      'ready_for_pickup': 'fas fa-hand-paper text-success',
      'request_approved': 'fas fa-check-circle text-success',
      'request_rejected': 'fas fa-times-circle text-danger',
      'request_update': 'fas fa-edit text-warning',
      'system_alert': 'fas fa-exclamation-triangle text-danger',
      'maintenance_notice': 'fas fa-tools text-warning',
      'test': 'fas fa-vial text-secondary',
      'connection': 'fas fa-plug text-success'
    };

    const icons = userType === 'admin' ? adminIcons : clientIcons;
    return icons[type] || 'fas fa-bell text-primary';
  }

  /**
   * Format notification time in a human-readable way
   * @param {string} timestamp - ISO timestamp
   * @returns {string} - Formatted time string
   */
  formatNotificationTime(timestamp) {
    if (!timestamp) return '';
    
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      
      if (diffInMinutes < 1) return 'Just now';
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      
      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) return `${diffInHours}h ago`;
      
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) return `${diffInDays}d ago`;
      
      return date.toLocaleDateString();
    } catch (error) {
      console.error('Error formatting notification time:', error);
      return '';
    }
  }
}

// Export a singleton instance
export default new NotificationNavigationService();
