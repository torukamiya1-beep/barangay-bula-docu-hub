import api from './api';

/**
 * Document Request Service
 * Handles all document request related API calls
 */
class DocumentRequestService {
  
  /**
   * Get available document types
   */
  async getDocumentTypes() {
    try {
      const response = await api.get('/client/document-requests/document-types');
      return response.data;
    } catch (error) {
      console.error('Error fetching document types:', error);
      throw error;
    }
  }

  /**
   * Get purpose categories
   */
  async getPurposeCategories() {
    try {
      const response = await api.get('/client/document-requests/purpose-categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching purpose categories:', error);
      throw error;
    }
  }

  /**
   * Get payment methods
   */
  async getPaymentMethods() {
    try {
      const response = await api.get('/client/document-requests/payment-methods');
      return response.data;
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      throw error;
    }
  }

  /**
   * Submit a new document request
   */
  async submitRequest(requestData) {
    try {
      const response = await api.post('/client/document-requests', requestData);
      return response.data;
    } catch (error) {
      console.error('Error submitting request:', error);
      throw error;
    }
  }

  /**
   * Get client's requests
   */
  async getMyRequests(filters = {}) {
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
          params.append(key, filters[key]);
        }
      });

      console.log('🔄 Frontend: Getting my requests with filters:', filters);
      const response = await api.get(`/client/document-requests?${params.toString()}`);
      console.log('📋 Frontend: My requests response:', response.data);

      return response.data;
    } catch (error) {
      console.error('Error fetching requests:', error);
      throw error;
    }
  }

  /**
   * Get specific request details
   */
  async getRequestDetails(requestId) {
    try {
      const response = await api.get(`/client/document-requests/${requestId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching request details:', error);
      throw error;
    }
  }

  /**
   * Update request (for additional information)
   */
  async updateRequest(requestId, updateData) {
    try {
      const response = await api.put(`/client/document-requests/${requestId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating request:', error);
      throw error;
    }
  }

  /**
   * Cancel a request
   */
  async cancelRequest(requestId, reason) {
    try {
      const response = await api.put(`/client/document-requests/${requestId}/cancel`, { reason });
      return response.data;
    } catch (error) {
      console.error('Error cancelling request:', error);
      throw error;
    }
  }

  /**
   * Get request status history
   */
  async getRequestHistory(requestId) {
    try {
      const response = await api.get(`/client/document-requests/${requestId}/history`);
      return response.data;
    } catch (error) {
      console.error('Error fetching request history:', error);
      throw error;
    }
  }



  /**
   * Process payment for a request
   */
  async processPayment(requestId, paymentData) {
    try {
      const response = await api.post(`/client/document-requests/${requestId}/payment`, paymentData);
      return response.data;
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(requestId) {
    try {
      const response = await api.get(`/client/document-requests/${requestId}/payment/status`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payment status:', error);
      throw error;
    }
  }

  /**
   * Calculate fees for a request
   */
  async calculateFees(requestData) {
    try {
      const response = await api.post('/client/document-requests/calculate-cedula-tax', requestData);
      return response.data;
    } catch (error) {
      console.error('Error calculating fees:', error);
      throw error;
    }
  }

  /**
   * Get dashboard statistics
   * TODO: Implement client dashboard endpoints in backend
   */
  async getDashboardStats() {
    // TODO: Uncomment when backend endpoint is implemented
    // try {
    //   const response = await api.get('/client/dashboard/stats');
    //   return response.data;
    // } catch (error) {
    //   console.error('Error fetching dashboard stats:', error);
    //   throw error;
    // }

    // Temporary placeholder until backend endpoint is implemented
    return {
      success: true,
      data: {
        total_requests: 0,
        pending_requests: 0,
        completed_requests: 0,
        recent_activity: []
      },
      message: 'Dashboard stats placeholder'
    };
  }

  /**
   * Get recent activity
   * TODO: Implement client dashboard endpoints in backend
   */
  async getRecentActivity(limit = 10) {
    try {
      // const response = await api.get(`/client/dashboard/activity?limit=${limit}`);
      // return response.data;

      // Temporary placeholder until backend endpoint is implemented
      // eslint-disable-next-line no-unused-vars
      const activityLimit = limit; // Acknowledge the parameter for future use
      return {
        success: true,
        data: [],
        message: 'Recent activity placeholder'
      };
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      throw error;
    }
  }

  /**
   * Upload supporting documents for a request
   */
  async uploadDocuments(requestId, files) {
    try {
      const formData = new FormData();

      // Add each file to the form data
      files.forEach(({ type, file }) => {
        formData.append(type, file);
      });

      const response = await api.post(`/client/document-requests/${requestId}/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error uploading documents:', error);
      throw error;
    }
  }

  /**
   * Get uploaded documents for a request
   */
  async getDocuments(requestId) {
    try {
      const response = await api.get(`/client/document-requests/${requestId}/documents`);
      return response.data;
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  }

  /**
   * Delete an uploaded document
   */
  async deleteDocument(requestId, documentId) {
    try {
      const response = await api.delete(`/client/document-requests/${requestId}/documents/${documentId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }

  /**
   * Fetch verification image as blob with authentication
   */
  async fetchVerificationImageBlob(requestId, imageType, filename) {
    try {
      // Check if user is authenticated before making request
      const authToken = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      if (!authToken) {
        throw new Error('Please log in to view images');
      }

      console.log('🔗 Fetching verification image:', {
        requestId,
        imageType,
        filename,
        hasToken: !!authToken
      });

      const response = await api.get(`/client/document-requests/${requestId}/verification-image/${imageType}/${filename}`, {
        responseType: 'blob'
      });

      console.log('✅ Image fetched successfully:', {
        filename,
        size: response.data.size,
        type: response.data.type
      });

      return response.data;
    } catch (error) {
      console.error(`❌ Error fetching ${imageType} verification image:`, {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        filename,
        imageType,
        requestId,
        message: error.message
      });

      // Provide descriptive error messages based on status code
      if (error.response?.status === 404) {
        throw new Error(`Image not found: ${filename}`);
      } else if (error.response?.status === 401) {
        throw new Error('Please log in to view images');
      } else if (error.response?.status === 403) {
        throw new Error('Access denied to this image');
      } else if (error.response?.status === 500) {
        throw new Error('Server error - please contact support');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error - please contact support');
      } else if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        throw new Error('Network error - check your connection');
      } else if (error.message.includes('log in')) {
        throw new Error(error.message); // Pass through authentication messages
      } else {
        throw new Error(error.response?.data?.message || error.message || 'Failed to load image');
      }
    }
  }

  /**
   * Create object URL for verification image
   */
  async getVerificationImageObjectUrl(requestId, imageType, filename) {
    try {
      const blob = await this.fetchVerificationImageBlob(requestId, imageType, filename);
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error(`Error creating object URL for ${imageType} image:`, error);
      throw error;
    }
  }
}

export default new DocumentRequestService();
