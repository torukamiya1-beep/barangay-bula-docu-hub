import api from './api'

/**
 * Service for handling residency verification status
 */
class ResidencyVerificationService {
  /**
   * Get the current user's residency verification status
   * @returns {Promise<Object>} Verification status information
   */
  async getResidencyVerificationStatus() {
    try {
      const response = await api.get('/residency/verification-status')

      if (response.data.success) {
        return {
          success: true,
          status: response.data.data.status, // 'pending', 'approved', 'rejected'
          canRequestDocuments: response.data.data.canRequestDocuments,
          message: response.data.data.message,
          documents: response.data.data.documents || []
        };
      } else {
        return {
          success: false,
          status: 'unknown',
          canRequestDocuments: false,
          message: response.data.message || 'Failed to get verification status',
          documents: []
        };
      }
    } catch (error) {
      console.error('Error getting residency verification status:', error)

      // If there's an error, assume user needs to upload residency documents
      return {
        success: false,
        status: 'no_documents',
        canRequestDocuments: false,
        message: 'Please upload residency documents for verification',
        documents: []
      };
    }
  }

  /**
   * Check if user can request documents based on residency verification
   * @returns {Promise<boolean>} True if user can request documents
   */
  async canRequestDocuments() {
    const status = await this.getResidencyVerificationStatus()
    return status.canRequestDocuments
  }

  /**
   * Get user-friendly status message
   * @returns {Promise<string>} Status message for display
   */
  async getStatusMessage() {
    const status = await this.getResidencyVerificationStatus()
    
    switch (status.status) {
      case 'approved':
        return 'Your residency has been verified. You can now request documents.'
      case 'pending':
        return 'Your residency documents are under review. You cannot request documents yet.'
      case 'rejected':
        return 'Your residency document is rejected.'
      case 'no_documents':
        return 'Please upload residency documents for verification before requesting documents.'
      default:
        return 'Unable to determine residency verification status.'
    }
  }

  /**
   * Get the CSS class for status display
   * @returns {Promise<string>} CSS class name
   */
  async getStatusClass() {
    const status = await this.getResidencyVerificationStatus()
    
    switch (status.status) {
      case 'approved':
        return 'status-approved'
      case 'pending':
        return 'status-pending'
      case 'rejected':
        return 'status-rejected'
      case 'no_documents':
        return 'status-no-documents'
      default:
        return 'status-unknown'
    }
  }
}

export default new ResidencyVerificationService()
