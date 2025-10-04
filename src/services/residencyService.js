import api from './api';

class ResidencyService {
  constructor() {
    this.baseURL = '/residency';
  }

  /**
   * Get residency documents for a specific account
   */
  async getAccountDocuments(accountId) {
    try {
      const response = await api.get(`${this.baseURL}/documents/${accountId}`);
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get pending residency verifications for admin review
   */
  async getPendingVerifications(params = {}) {
    try {
      const response = await api.get(`${this.baseURL}/pending`, { params });
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Approve residency verification
   */
  async approveVerification(accountId, documentIds = []) {
    try {
      const response = await api.post(`${this.baseURL}/approve`, {
        account_id: accountId,
        document_ids: documentIds
      });
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Reject residency verification
   */
  async rejectVerification(accountId, rejectionReason, documentIds = []) {
    try {
      const response = await api.post(`${this.baseURL}/reject`, {
        account_id: accountId,
        rejection_reason: rejectionReason,
        document_ids: documentIds
      });
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get document file URL for viewing
   */
  getDocumentFileUrl(documentId) {
    // Use the API base URL to construct the full URL
    const API_BASE_URL = process.env.VUE_APP_API_URL || 'http://localhost:7000/api';
    return `${API_BASE_URL}/residency/documents/${documentId}/file`;
  }

  /**
   * Delete a residency document
   */
  async deleteDocument(documentId) {
    try {
      const response = await api.delete(`${this.baseURL}/documents/${documentId}`);
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
        message: response.data.message
      };
    } else {
      throw new Error(response.data.message || 'Operation failed');
    }
  }

  /**
   * Handle API errors
   */
  handleError(error) {
    console.error('Residency Service Error:', error);
    
    let message = 'An unexpected error occurred';
    let errors = [];
    let status = 0;

    if (error.response) {
      // Server responded with error status
      status = error.response.status;
      const errorData = error.response.data;
      
      if (errorData) {
        message = errorData.message || errorData.error || message;
        errors = errorData.errors || errorData.details || [];
      }
    } else if (error.request) {
      // Request was made but no response received
      message = 'Network error - please check your connection';
    } else {
      // Something else happened
      message = error.message || message;
    }

    return {
      success: false,
      message,
      errors,
      status
    };
  }

  /**
   * Format document type for display
   */
  formatDocumentType(type) {
    const typeLabels = {
      'utility_bill': 'Utility Bill',
      'barangay_certificate': 'Barangay Certificate',
      'valid_id': 'Valid ID',
      'lease_contract': 'Lease Contract',
      'other': 'Other Document'
    };
    return typeLabels[type] || type;
  }

  /**
   * Format verification status for display
   */
  formatVerificationStatus(status) {
    const statusLabels = {
      'pending': 'Pending Review',
      'approved': 'Approved',
      'rejected': 'Rejected'
    };
    return statusLabels[status] || status;
  }

  /**
   * Get status badge class for verification status
   */
  getStatusBadgeClass(status) {
    const statusClasses = {
      'pending': 'bg-warning',
      'approved': 'bg-success',
      'rejected': 'bg-danger'
    };
    return statusClasses[status] || 'bg-secondary';
  }
}

export default new ResidencyService();
