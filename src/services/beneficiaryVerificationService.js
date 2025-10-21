import api from './api';

class BeneficiaryVerificationService {
  constructor() {
    this.baseURL = '/beneficiary-verification';
  }

  /**
   * Update beneficiary verification status (Admin only)
   */
  async updateVerificationStatus(beneficiaryId, status) {
    try {
      const response = await api.patch(`${this.baseURL}/${beneficiaryId}/status`, {
        verification_status: status
      });
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get rejected beneficiary verifications for current client
   */
  async getRejectedVerifications() {
    try {
      const response = await api.get(`${this.baseURL}/rejected/list`);
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Reupload a rejected beneficiary verification document
   */
  async reuploadDocument(beneficiaryId, file) {
    try {
      const formData = new FormData();
      formData.append('document', file);

      const response = await api.post(`${this.baseURL}/${beneficiaryId}/reupload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Handle successful API response
   */
  handleResponse(response) {
    if (response.data) {
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Operation successful'
      };
    }
    return {
      success: false,
      message: 'Invalid response format'
    };
  }

  /**
   * Handle API errors
   */
  handleError(error) {
    console.error('Beneficiary Verification Service Error:', error);
    
    if (error.response) {
      return {
        success: false,
        message: error.response.data?.message || error.response.data?.error || 'Server error occurred',
        error: error.response.data
      };
    }
    
    if (error.request) {
      return {
        success: false,
        message: 'No response from server. Please check your connection.',
        error: error.message
      };
    }
    
    return {
      success: false,
      message: error.message || 'An unexpected error occurred',
      error: error
    };
  }
}

export default new BeneficiaryVerificationService();
