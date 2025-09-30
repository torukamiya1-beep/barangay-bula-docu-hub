import api from '@/services/api';

class ActivityLogService {
  /**
   * Get activity logs with filtering and pagination (legacy endpoint)
   * @param {Object} filters - Filter parameters
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise} Activity logs response
   */
  async getActivityLogs(filters = {}, page = 1, limit = 20) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...Object.fromEntries(
          Object.entries(filters).filter(([, value]) => value !== '' && value !== null && value !== undefined)
        )
      });

      const response = await api.get(`/admin/activity-logs?${params}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get comprehensive activity logs from audit_logs table
   * @param {Object} filters - Filter parameters
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise} Comprehensive activity logs response
   */
  async getComprehensiveActivityLogs(filters = {}, page = 1, limit = 50) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...Object.fromEntries(
          Object.entries(filters).filter(([, value]) => value !== '' && value !== null && value !== undefined)
        )
      });

      const response = await api.get(`/admin/activity-logs/comprehensive?${params}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get recent activity (simplified version for dashboard)
   * @param {number} limit - Number of recent activities to fetch
   * @returns {Promise} Recent activity response
   */
  async getRecentActivity(limit = 10) {
    try {
      const response = await api.get(`/admin/dashboard/activity?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get activity log details by ID
   * @param {number} id - Activity log ID
   * @returns {Promise} Activity log details
   */
  async getActivityLogDetails(id) {
    try {
      const response = await api.get(`/admin/activity-logs/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Export activity logs as CSV
   * @param {Object} filters - Filter parameters
   * @returns {Promise} CSV export response
   */
  async exportActivityLogs(filters = {}) {
    try {
      const params = new URLSearchParams(
        Object.fromEntries(
          Object.entries(filters).filter(([, value]) => value !== '' && value !== null && value !== undefined)
        )
      );

      const response = await api.get(`/admin/activity-logs/export?${params}`, {
        responseType: 'blob'
      });
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get activity statistics
   * @param {string} period - Time period (day, week, month)
   * @returns {Promise} Activity statistics
   */
  async getActivityStats(period = 'week') {
    try {
      const response = await api.get(`/admin/activity-logs/stats?period=${period}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Transform request status history data to activity log format
   * @param {Array} statusHistory - Raw status history data
   * @returns {Array} Formatted activity logs
   */
  transformStatusHistoryToActivityLogs(statusHistory) {
    return statusHistory.map(item => ({
      id: item.id,
      timestamp: item.changed_at,
      user_name: item.changed_by_name || 'System',
      user_role: this.getUserRole(item.changed_by_name),
      user_type: this.getUserType(item.changed_by_name),
      activity: this.generateActivityDescription(item),
      type: 'status_change',
      document_type: item.document_type,
      status_change: item.new_status,
      ip_address: item.ip_address || 'N/A',
      details: this.generateDetailedDescription(item)
    }));
  }

  /**
   * Generate activity description from status history
   * @param {Object} item - Status history item
   * @returns {string} Activity description
   */
  generateActivityDescription(item) {
    const action = item.old_status ? 
      `changed status from "${item.old_status}" to "${item.new_status}"` :
      `set status to "${item.new_status}"`;
    
    return `${item.changed_by_name || 'System'} ${action} for ${item.document_type} request ${item.request_number}`;
  }

  /**
   * Generate detailed description
   * @param {Object} item - Status history item
   * @returns {string} Detailed description
   */
  generateDetailedDescription(item) {
    let details = `Request: ${item.request_number}\n`;
    details += `Document Type: ${item.document_type}\n`;
    details += `Client: ${item.client_name || 'Unknown'}\n`;
    
    if (item.old_status) {
      details += `Status Changed: ${item.old_status} → ${item.new_status}\n`;
    } else {
      details += `Status Set: ${item.new_status}\n`;
    }
    
    if (item.change_reason) {
      details += `Reason: ${item.change_reason}\n`;
    }
    
    details += `Changed At: ${new Date(item.changed_at).toLocaleString()}\n`;
    details += `Changed By: ${item.changed_by_name || 'System'}`;
    
    return details;
  }

  /**
   * Determine user role from name
   * @param {string} userName - User name
   * @returns {string} User role
   */
  getUserRole(userName) {
    if (!userName || userName === 'System') return 'System';
    // This is a simplified approach - in a real system, you'd get this from the database
    return 'Administrator'; // Default for now
  }

  /**
   * Determine user type from name
   * @param {string} userName - User name
   * @returns {string} User type
   */
  getUserType(userName) {
    if (!userName || userName === 'System') return 'system';
    // This is a simplified approach - in a real system, you'd get this from the database
    return 'admin'; // Default for now
  }

  /**
   * Handle API errors
   * @param {Error} error - API error
   * @returns {Object} Formatted error
   */
  handleError(error) {
    console.error('ActivityLogService error:', error);
    
    if (error.response) {
      return {
        success: false,
        message: error.response.data?.message || 'An error occurred',
        errors: error.response.data?.errors || [],
        status: error.response.status
      };
    }
    
    return {
      success: false,
      message: error.message || 'Network error occurred',
      errors: [],
      status: 0
    };
  }

  /**
   * Parse error response
   * @param {Error} error - Error object
   * @returns {Object} Parsed error data
   */
  parseError(error) {
    return this.handleError(error);
  }
}

export default new ActivityLogService();
