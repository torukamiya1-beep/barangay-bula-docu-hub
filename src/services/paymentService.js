import api from './api';

/**
 * Payment Service for PayMongo Integration
 * Handles online payments and payment verification
 */
class PaymentService {
  
  /**
   * Get PayMongo configuration for frontend
   * @returns {Promise<Object>} PayMongo configuration
   */
  async getPaymentConfig() {
    try {
      const response = await api.get('/payments/config');
      return response.data;
    } catch (error) {
      console.error('Failed to get payment config:', error);
      throw error;
    }
  }

  /**
   * Initiate payment process
   * @param {Object} paymentData - Payment information
   * @param {number} paymentData.request_id - Document request ID
   * @param {number} paymentData.payment_method_id - Payment method ID
   * @param {string} paymentData.customer_email - Customer email (optional)
   * @returns {Promise<Object>} Payment initiation response
   */
  async initiatePayment(paymentData) {
    try {
      const response = await api.post('/payments/initiate', paymentData);
      return response.data;
    } catch (error) {
      console.error('Failed to initiate payment:', error);
      throw error;
    }
  }

  /**
   * Get payment status
   * @param {string} transactionId - Transaction ID
   * @returns {Promise<Object>} Payment status
   */
  async getPaymentStatus(transactionId) {
    try {
      const response = await api.get(`/payments/status/${transactionId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get payment status:', error);
      throw error;
    }
  }

  /**
   * Get payment verification queue (Admin only)
   * @returns {Promise<Object>} Pending payment verifications
   */
  async getPaymentVerificationQueue() {
    try {
      const response = await api.get('/admin/documents/payment-verification-queue');
      return response.data;
    } catch (error) {
      console.error('Failed to get payment verification queue:', error);
      throw error;
    }
  }

  /**
   * Verify in-person payment (Admin only)
   * @param {number} requestId - Document request ID
   * @param {Object} paymentDetails - Payment verification details
   * @param {number} paymentDetails.amount_received - Amount received
   * @param {number} paymentDetails.payment_method_id - Payment method ID
   * @param {string} paymentDetails.receipt_number - Receipt number (optional)
   * @param {string} paymentDetails.notes - Verification notes (optional)
   * @returns {Promise<Object>} Verification response
   */
  async verifyInPersonPayment(requestId, paymentDetails) {
    try {
      const response = await api.post(`/admin/documents/requests/${requestId}/verify-payment`, paymentDetails);
      return response.data;
    } catch (error) {
      console.error('Failed to verify in-person payment:', error);
      throw error;
    }
  }

  /**
   * Handle PayMongo checkout redirect
   * @param {string} checkoutUrl - PayMongo checkout URL
   */
  redirectToPayMongo(checkoutUrl) {
    if (checkoutUrl) {
      window.location.href = checkoutUrl;
    } else {
      throw new Error('Invalid checkout URL');
    }
  }

  /**
   * Format amount for display
   * @param {number} amount - Amount in PHP
   * @returns {string} Formatted amount
   */
  formatAmount(amount) {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  }

  /**
   * Get payment method display name
   * @param {string} methodCode - Payment method code
   * @returns {string} Display name
   */
  getPaymentMethodDisplayName(methodCode) {
    const methodNames = {
      'CASH': 'Cash Payment',
      'ONLINE_PAYMENT_GROUP': 'Online Payment',
      'PAYMONGO_CARD': 'Credit/Debit Card',
      'PAYMONGO_GCASH': 'GCash',
      'PAYMONGO_GRABPAY': 'GrabPay',
      'PAYMONGO_PAYMAYA': 'Maya (PayMaya)',
      'PAYMONGO_BANK': 'Bank Transfer'
    };
    return methodNames[methodCode] || methodCode;
  }

  /**
   * Group payment methods for simplified UI display
   * @param {Array} paymentMethods - Array of payment method objects from backend
   * @returns {Array} Grouped payment methods
   */
  groupPaymentMethods(paymentMethods) {
    if (!Array.isArray(paymentMethods)) return [];

    const cashMethods = [];
    const onlineMethods = [];

    paymentMethods.forEach(method => {
      if (this.isOnlinePaymentMethod(method.method_code)) {
        onlineMethods.push(method);
      } else {
        cashMethods.push(method);
      }
    });

    const groupedMethods = [];

    // Add cash payment methods (typically just one)
    cashMethods.forEach(method => {
      groupedMethods.push({
        id: method.id,
        method_name: method.method_name,
        method_code: method.method_code,
        description: method.description,
        is_online: method.is_online,
        is_active: method.is_active,
        processing_fee_percentage: method.processing_fee_percentage,
        processing_fee_fixed: method.processing_fee_fixed,
        group_type: 'individual'
      });
    });

    // Add grouped online payment option if there are online methods
    // if (onlineMethods.length > 0) {
    //   groupedMethods.push({
    //     id: 'ONLINE_PAYMENT_GROUP',
    //     method_name: 'Online Payment',
    //     method_code: 'ONLINE_PAYMENT_GROUP',
    //     description: 'Pay securely online using credit/debit card, GCash, GrabPay, Maya, or bank transfer',
    //     is_online: true,
    //     is_active: true,
    //     processing_fee_percentage: onlineMethods[0]?.processing_fee_percentage || 0,
    //     processing_fee_fixed: onlineMethods[0]?.processing_fee_fixed || 0,
    //     group_type: 'group',
    //     grouped_methods: onlineMethods
    //   });
    // }

    return groupedMethods;
  }

  /**
   * Get the actual payment method ID for backend submission
   * @param {string|number} selectedMethodId - Selected method ID (could be group ID)
   * @param {Array} originalMethods - Original payment methods from backend
   * @returns {number|null} Actual payment method ID for backend
   */
  getActualPaymentMethodId(selectedMethodId, originalMethods) {
    // If it's the online payment group, return the preferred online method ID
    // Priority: Card > GCash > GrabPay > Maya > Bank Transfer
    if (selectedMethodId === 'ONLINE_PAYMENT_GROUP') {
      const methodPriority = ['PAYMONGO_CARD', 'PAYMONGO_GCASH', 'PAYMONGO_GRABPAY', 'PAYMONGO_PAYMAYA', 'PAYMONGO_BANK'];

      for (const methodCode of methodPriority) {
        const method = originalMethods.find(m =>
          m.method_code === methodCode && m.is_active
        );
        if (method) {
          return method.id;
        }
      }

      // Fallback to first available online method
      const firstOnlineMethod = originalMethods.find(method =>
        this.isOnlinePaymentMethod(method.method_code) && method.is_active
      );
      return firstOnlineMethod ? firstOnlineMethod.id : null;
    }

    // For individual methods, return the ID as-is
    return parseInt(selectedMethodId);
  }

  /**
   * Check if payment method is online
   * @param {string} methodCode - Payment method code
   * @returns {boolean} True if online payment method
   */
  isOnlinePaymentMethod(methodCode) {
    return methodCode && methodCode.startsWith('PAYMONGO_');
  }

  /**
   * Get payment status display info
   * @param {string} status - Payment status
   * @returns {Object} Status display information
   */
  getPaymentStatusDisplay(status) {
    const statusInfo = {
      'pending': { text: 'Pending', color: 'warning', icon: 'clock' },
      'succeeded': { text: 'Paid', color: 'success', icon: 'check-circle' },
      'failed': { text: 'Failed', color: 'danger', icon: 'x-circle' },
      'cancelled': { text: 'Cancelled', color: 'secondary', icon: 'x' }
    };
    return statusInfo[status] || { text: status, color: 'secondary', icon: 'help-circle' };
  }

  /**
   * Calculate processing fee
   * @param {number} baseAmount - Base amount
   * @param {number} feePercentage - Fee percentage
   * @param {number} feeFixed - Fixed fee
   * @returns {number} Processing fee
   */
  calculateProcessingFee(baseAmount, feePercentage = 0, feeFixed = 0) {
    const percentageFee = (baseAmount * feePercentage) / 100;
    return percentageFee + feeFixed;
  }

  /**
   * Calculate total amount including fees
   * @param {number} baseAmount - Base amount
   * @param {number} feePercentage - Fee percentage
   * @param {number} feeFixed - Fixed fee
   * @returns {Object} Amount breakdown
   */
  calculateTotalAmount(baseAmount, feePercentage = 0, feeFixed = 0) {
    const processingFee = this.calculateProcessingFee(baseAmount, feePercentage, feeFixed);
    const totalAmount = baseAmount + processingFee;
    
    return {
      baseAmount,
      processingFee,
      totalAmount,
      formattedBase: this.formatAmount(baseAmount),
      formattedFee: this.formatAmount(processingFee),
      formattedTotal: this.formatAmount(totalAmount)
    };
  }

  /**
   * Validate payment data before submission
   * @param {Object} paymentData - Payment data to validate
   * @returns {Object} Validation result
   */
  validatePaymentData(paymentData) {
    const errors = [];

    if (!paymentData.request_id) {
      errors.push('Request ID is required');
    }

    if (!paymentData.payment_method_id) {
      errors.push('Payment method is required');
    }

    if (paymentData.customer_email && !this.isValidEmail(paymentData.customer_email)) {
      errors.push('Invalid email format');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {boolean} True if valid email
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Handle payment errors with user-friendly messages
   * @param {Error} error - Error object
   * @returns {string} User-friendly error message
   */
  getErrorMessage(error) {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    
    if (error.response?.status === 400) {
      return 'Invalid payment information. Please check your details and try again.';
    }
    
    if (error.response?.status === 401) {
      return 'You need to be logged in to make a payment.';
    }
    
    if (error.response?.status === 404) {
      return 'Payment service not found. Please contact support.';
    }
    
    if (error.response?.status >= 500) {
      return 'Payment service is temporarily unavailable. Please try again later.';
    }
    
    return error.message || 'An unexpected error occurred during payment processing.';
  }
}

export default new PaymentService();
