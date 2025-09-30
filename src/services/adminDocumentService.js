import api from './api';

class AdminDocumentService {
  // ==================== DASHBOARD ENDPOINTS ====================
  
  /**
   * Get dashboard statistics
   * @returns {Promise} Dashboard stats including total requests, pending count, revenue, etc.
   */
  async getDashboardStats() {
    try {
      const response = await api.get('/admin/documents/dashboard/stats');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get recent activity for dashboard
   * @param {number} limit - Number of activities to fetch (default: 10)
   * @returns {Promise} Recent activity list
   */
  async getRecentActivity(limit = 10) {
    try {
      const response = await api.get(`/admin/documents/dashboard/recent?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ==================== REQUEST MANAGEMENT ENDPOINTS ====================

  /**
   * Get all document requests with filtering and pagination
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @param {string} params.status - Filter by status
   * @param {string} params.document_type - Filter by document type
   * @param {string} params.priority - Filter by priority
   * @param {string} params.search - Search term
   * @param {string} params.date_from - Start date filter
   * @param {string} params.date_to - End date filter
   * @returns {Promise} Paginated list of requests
   */
  async getAllRequests(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/admin/documents/requests?${queryString}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get specific document request details
   * @param {number} requestId - Request ID
   * @returns {Promise} Request details with client information
   */
  async getRequestDetails(requestId) {
    try {
      const response = await api.get(`/admin/documents/requests/${requestId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get request status history
   * @param {number} requestId - Request ID
   * @returns {Promise} Status change history
   */
  async getRequestHistory(requestId) {
    try {
      const response = await api.get(`/admin/documents/requests/${requestId}/history`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ==================== STATUS MANAGEMENT ENDPOINTS ====================

  /**
   * Get all available status options
   * @returns {Promise} List of status options
   */
  async getStatusOptions() {
    try {
      const response = await api.get('/admin/documents/status-options');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get all document types
   * @returns {Promise} List of document types
   */
  async getDocumentTypes() {
    try {
      const response = await api.get('/admin/documents/document-types');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update request status
   * @param {number} requestId - Request ID
   * @param {Object} statusData - Status update data
   * @param {number} statusData.status_id - New status ID
   * @param {string} statusData.reason - Optional reason for status change
   * @returns {Promise} Update result
   */
  async updateRequestStatus(requestId, statusData) {
    try {
      const response = await api.put(`/admin/documents/requests/${requestId}/status`, statusData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Approve document request
   * @param {number} requestId - Request ID
   * @param {Object} approvalData - Approval data
   * @param {string} approvalData.reason - Optional approval reason
   * @returns {Promise} Approval result
   */
  async approveRequest(requestId, approvalData = {}) {
    try {
      const response = await api.post(`/admin/documents/requests/${requestId}/approve`, approvalData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Reject document request
   * @param {number} requestId - Request ID
   * @param {Object} rejectionData - Rejection data
   * @param {string} rejectionData.reason - Required rejection reason
   * @returns {Promise} Rejection result
   */
  async rejectRequest(requestId, rejectionData) {
    try {
      const response = await api.post(`/admin/documents/requests/${requestId}/reject`, rejectionData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Mark request as processing
   * @param {number} requestId - Request ID
   * @param {Object} processingData - Processing data
   * @param {string} processingData.reason - Optional processing reason
   * @returns {Promise} Processing result
   */
  async markAsProcessing(requestId, processingData = {}) {
    try {
      const response = await api.post(`/admin/documents/requests/${requestId}/process`, processingData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Mark request as completed
   * @param {number} requestId - Request ID
   * @param {Object} completionData - Completion data
   * @param {string} completionData.reason - Optional completion reason
   * @returns {Promise} Completion result
   */
  async markAsCompleted(requestId, completionData = {}) {
    try {
      const response = await api.post(`/admin/documents/requests/${requestId}/complete`, completionData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Removed requireAdditionalInfo method - additional_info_required status is no longer used

  // ==================== BULK OPERATIONS ENDPOINTS ====================

  /**
   * Bulk update multiple requests
   * @param {Object} bulkData - Bulk update data
   * @param {Array} bulkData.request_ids - Array of request IDs
   * @param {number} bulkData.status_id - New status ID for all requests
   * @param {string} bulkData.reason - Optional reason for bulk update
   * @returns {Promise} Bulk update result
   */
  async bulkUpdateRequests(bulkData) {
    try {
      const response = await api.post('/admin/documents/requests/bulk-update', bulkData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ==================== DATA EXPORT ENDPOINTS ====================

  /**
   * Export requests data as CSV
   * @param {Object} filters - Export filters
   * @param {string} filters.status - Filter by status
   * @param {string} filters.document_type - Filter by document type
   * @param {string} filters.date_from - Start date filter
   * @param {string} filters.date_to - End date filter
   * @returns {Promise} CSV data
   */
  async exportRequests(filters = {}) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const response = await api.get(`/admin/documents/requests/export?${queryString}`, {
        responseType: 'text' // Expect CSV text response
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Download CSV data as file
   * @param {string} csvData - CSV data string
   * @param {string} filename - Filename for download
   */
  downloadCSV(csvData, filename = 'document_requests.csv') {
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Get analytics data for reporting
   * @param {string} period - Time period ('day', 'week', 'month')
   * @returns {Promise} Analytics data
   */
  async getAnalyticsData(period = 'month') {
    try {
      const response = await api.get(`/admin/documents/analytics?period=${period}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Generate comprehensive report
   * @param {string} reportType - Report type ('daily', 'weekly', 'monthly', 'custom')
   * @param {Object} filters - Report filters
   * @param {string} filters.date_from - Start date
   * @param {string} filters.date_to - End date
   * @param {string} filters.format - Output format ('csv' or 'json')
   * @returns {Promise} Report data
   */
  async generateReport(reportType, filters = {}) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const response = await api.get(`/admin/documents/reports/${reportType}?${queryString}`, {
        responseType: filters.format === 'csv' ? 'text' : 'json'
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Verify in-person payment
   * @param {number} requestId - Request ID
   * @param {Object} paymentData - Payment verification data
   * @returns {Promise} Verification result
   */
  async verifyInPersonPayment(requestId, paymentData) {
    try {
      const response = await api.post(`/admin/documents/requests/${requestId}/verify-payment`, paymentData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Schedule pickup appointment
   * @param {number} requestId - Request ID
   * @param {Object} scheduleData - Pickup schedule data
   * @returns {Promise} Schedule result
   */
  async schedulePickup(requestId, scheduleData) {
    try {
      const response = await api.post(`/admin/documents/requests/${requestId}/schedule-pickup`, scheduleData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Confirm document pickup
   * @param {number} requestId - Request ID
   * @param {Object} pickupData - Pickup confirmation data
   * @returns {Promise} Confirmation result
   */
  async confirmPickup(requestId, pickupData) {
    try {
      const response = await api.post(`/admin/documents/requests/${requestId}/confirm-pickup`, pickupData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Download report as CSV file
   * @param {string} reportType - Report type
   * @param {Object} filters - Report filters
   * @returns {Promise} Downloads CSV file
   */
  async downloadReport(reportType, filters = {}) {
    try {
      const csvData = await this.generateReport(reportType, { ...filters, format: 'csv' });
      const filename = `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`;
      this.downloadCSV(csvData, filename);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Format status name for display
   * @param {string} status - Status string
   * @returns {string} Formatted status
   */
  formatStatus(status) {
    if (!status) return 'Unknown';
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Get status color class
   * @param {string} status - Status string
   * @returns {string} CSS class for status color
   */
  getStatusColor(status) {
    const statusColors = {
      'pending': 'warning',
      'under_review': 'info',
      'additional_info_required': 'secondary',
      'approved': 'success',
      'processing': 'primary',
      'ready_for_pickup': 'info',
      'completed': 'success',
      'cancelled': 'secondary',
      'rejected': 'danger'
    };
    return statusColors[status] || 'secondary';
  }

  /**
   * Handle API errors
   * @param {Error} error - API error
   * @returns {Error} Formatted error
   */
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

  /**
   * Parse error message
   * @param {Error} error - Error object
   * @returns {Object} Parsed error data
   */
  parseError(error) {
    try {
      return JSON.parse(error.message);
    } catch {
      return { message: error.message, errors: [], status: 0 };
    }
  }
}

export default new AdminDocumentService();
