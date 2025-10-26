import api from '@/services/api'; // Use the configured API service with auth

const API_URL = process.env.VUE_APP_API_URL || 'http://localhost:7000/api';

/**
 * GCash Payment Service
 * Frontend service for GCash payment operations
 */
class GCashPaymentService {
  /**
   * Upload payment proof for a request
   * @param {number} requestId - Document request ID
   * @param {File} file - Payment proof file
   * @param {string} referenceNumber - Optional GCash reference number
   * @returns {Promise<Object>} Upload result
   */
  async uploadPaymentProof(requestId, file, referenceNumber = null) {
    const formData = new FormData();
    formData.append('payment_proof', file);
    if (referenceNumber) {
      formData.append('reference_number', referenceNumber);
    }

    console.log('🔄 Uploading GCash payment proof for request:', requestId);
    console.log('📁 File details:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // Debug authentication token
    const authToken = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    console.log('🔐 Authentication token:', authToken ? 'Bearer ***' : 'None');

    const response = await api.post(
      `/gcash-payments/upload-proof/${requestId}`,
      formData
      // Removed redundant headers - API interceptor handles Content-Type for FormData
    );

    console.log('✅ Payment proof uploaded successfully:', response.data);
    return response; // Return full response object, not just response.data
  }

  /**
   * Reupload payment proof after rejection
   * @param {number} requestId - Document request ID
   * @param {File} file - Payment proof file
   * @param {string} referenceNumber - Optional GCash reference number
   * @returns {Promise<Object>} Reupload result
   */
  async reuploadPaymentProof(requestId, file, referenceNumber = null) {
    const formData = new FormData();
    formData.append('payment_proof', file);
    if (referenceNumber) {
      formData.append('reference_number', referenceNumber);
    }

    console.log('🔄 Reuploading GCash payment proof for request:', requestId);

    const response = await api.post(
      `/gcash-payments/reupload-proof/${requestId}`,
      formData
      // Removed redundant headers - API interceptor handles Content-Type for FormData
    );

    console.log('✅ Payment proof reuploaded successfully:', response.data);
    return response; // Return full response object, not just response.data
  }

  /**
   * Get payment proof image URL
   * @param {number} requestId - Document request ID
   * @returns {string} Image URL
   */
  getPaymentProofImageUrl(requestId) {
    return `${API_URL}/gcash-payments/proof-image/${requestId}`;
  }

  /**
   * Verify (approve) payment proof - Admin only
   * @param {number} requestId - Document request ID
   * @returns {Promise<Object>} Verification result
   */
  async verifyPaymentProof(requestId) {
    console.log('🔄 Verifying payment proof for request:', requestId);

    try {
      const response = await api.post(
        `/gcash-payments/verify/${requestId}`
      );

      console.log('✅ Payment proof verified successfully:', response.data);
      return response; // Return full response object, not just response.data
    } catch (error) {
      console.error('❌ Error verifying payment proof:', error);
      throw error;
    }
  }

  /**
   * Reject payment proof - Admin only (No reason required)
   * @param {number} requestId - Document request ID
   * @returns {Promise<Object>} Rejection result
   */
  async rejectPaymentProof(requestId) {
    console.log('🔄 Rejecting payment proof for request:', requestId);

    const response = await api.post(
      `/gcash-payments/reject/${requestId}`
    );

    console.log('✅ Payment proof rejected successfully:', response.data);
    return response; // Return full response object, not just response.data
  }

  /**
   * Get pending payment proofs - Admin only
   * @returns {Promise<Array>} List of pending proofs
   */
  async getPendingProofs() {
    console.log('🔄 Getting pending payment proofs');

    const response = await api.get(
      `/gcash-payments/pending-proofs`
    );

    console.log('✅ Pending proofs retrieved:', response.data);
    return response.data;
  }

  /**
   * Get admin proof image URL
   * @param {number} requestId - Document request ID
   * @returns {string} Image URL for admin
   */
  getAdminProofImageUrl(requestId) {
    return `${API_URL}/gcash-payments/admin/proof-image/${requestId}`;
  }
}

export default new GCashPaymentService();
