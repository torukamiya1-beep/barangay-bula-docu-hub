<template>
  <section class="services-wrapper">
    <section class="services-section">
      <div class="container">
        <!-- Clean, minimal header -->
        <div class="section-header">
          <h2 class="section-title">Available Document Services</h2>
          <p class="section-description">Select the type of document you need to request</p>
        </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-container" role="status" aria-live="polite">
        <div class="loading-content">
          <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin" aria-hidden="true"></i>
          </div>
          <p class="loading-text">Loading available services...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-container" role="alert">
        <div class="error-content">
          <div class="error-icon">
            <i class="fas fa-exclamation-triangle" aria-hidden="true"></i>
          </div>
          <h3 class="error-title">Unable to Load Services</h3>
          <p class="error-message">{{ error }}</p>
          <button class="retry-btn" @click="handleRetry">
            <i class="fas fa-redo" aria-hidden="true"></i>
            <span>Try Again</span>
          </button>
        </div>
      </div>

      <!-- Account Status Warning -->
      <div v-if="!isAccountActive || !canRequestDocuments" class="account-status-warning mb-4">
        <div class="alert alert-warning d-flex align-items-center justify-content-between">
          <div class="d-flex align-items-center">
            <i class="fas fa-exclamation-triangle me-3"></i>
            <div>
              <h5 class="alert-heading mb-1">
                <span v-if="!isAccountActive">Account Verification Required</span>
                <span v-else-if="!canRequestDocuments">Residency Verification Required</span>
              </h5>
              <p class="mb-0">
                <span v-if="!isAccountActive && clientData?.status === 'pending_residency_verification'">
                  Your account is pending residency verification. Please wait for admin approval before requesting documents.
                </span>
                <span v-else-if="!isAccountActive && clientData?.status === 'residency_rejected'">
                  Your residency verification was rejected. Please contact the administrator or upload new documents.
                </span>
                <span v-else-if="!isAccountActive">
                  Your account needs to be verified before you can request documents. Please contact the administrator.
                </span>
                <span v-else-if="!canRequestDocuments">
                  {{ statusMessage }}
                </span>
              </p>
            </div>
          </div>

          <!-- I comment this button because I dont use this much -->
          <!-- Refresh button for pending status -->
          <!-- <div v-if="!canRequestDocuments && statusMessage && statusMessage.includes('under review')" class="ms-3">
            <button
              type="button"
              class="btn btn-outline-primary btn-sm"
              @click="$emit('refresh-status')"
              :disabled="refreshingStatus"
              title="Check for status updates"
            >
              <i v-if="refreshingStatus" class="fas fa-spinner fa-spin me-1"></i>
              <i v-else class="fas fa-sync-alt me-1"></i>
              {{ refreshingStatus ? 'Checking...' : 'Check Status' }}
            </button>
          </div> -->
        </div>
      </div>

      <!-- Document Types Grid -->
      <div v-else class="document-types-grid">
        <div
          v-for="documentType in documentTypes"
          :key="documentType.id"
          class="document-card"
          @click="handleSelectDocument(documentType)"
          @keyup.enter="handleSelectDocument(documentType)"
          :class="{ 'disabled': !canRequestDocument(documentType) }"
          role="button"
          :tabindex="canRequestDocument(documentType) ? 0 : -1"
          :aria-disabled="!canRequestDocument(documentType)"
        >
          <!-- Card Header with Icon and Status -->
          <div class="card-header">
            <div class="document-icon">
              <i :class="getDocumentIcon(documentType.type_name)" aria-hidden="true"></i>
            </div>
            <div class="status-badge" :class="getStatusBadgeClass(documentType)">
              {{ getStatusText(documentType) }}
            </div>
          </div>

          <!-- Card Content -->
          <div class="card-content">
            <h3 class="document-title">{{ documentType.type_name }}</h3>
            <p class="document-description">{{ documentType.description }}</p>
          </div>

          <!-- Card Details -->
          <div class="card-details">
            <!-- <div class="detail-row">
              <div class="detail-item">
                <i class="fas fa-peso-sign detail-icon" aria-hidden="true"></i>
                <span class="detail-label">Fee</span>
                <span class="detail-value fee-amount">₱{{ formatCurrency(documentType.base_fee) }}</span>
              </div>
            </div> -->
            <!-- ill comment this for now and use this soon -->
            <!-- <div class="detail-row">
              <div class="detail-item">
                <i class="fas fa-clock detail-icon" aria-hidden="true"></i>
                <span class="detail-label">Processing Time</span>
                <span class="detail-value">{{ getProcessingTime(documentType.type_name) }}</span>
              </div>
            </div> -->
          </div>

          <!-- Card Action -->
          <div class="card-action">
            <i v-if="canRequestDocument(documentType)" class="fas fa-arrow-right" aria-hidden="true"></i>
            <span v-else-if="!isAccountActive" class="disabled-text">Account Verification Required</span>
            <span v-else-if="!canRequestDocuments" class="disabled-text">Residency Verification Required</span>
            <span v-else class="disabled-text">Not Available</span>
          </div>
        </div>
      </div>
      </div>
    </section>
  </section>

  <!-- Help Dialog Modal -->
  <div v-if="showHelpDialog" class="dialog-overlay" @click="closeDialog">
    <div class="dialog-content" @click.stop>
      <div class="dialog-header">
        <h3 class="dialog-title">Document Services Information</h3>
        <button class="dialog-close" @click="closeDialog" aria-label="Close dialog">
          <i class="fas fa-times" aria-hidden="true"></i>
        </button>
      </div>
        
        <div class="dialog-body">
          <div class="help-sections">
            <!-- Requirements Section -->
            <div class="help-section">
              <div class="section-header">
                <i class="fas fa-clipboard-list" aria-hidden="true"></i>
                <h4>Before You Start</h4>
              </div>
              <ul class="requirements-list">
                <li v-for="requirement in helpData.requirements" :key="requirement.id" class="requirement-item">
                  <i class="fas fa-check-circle" aria-hidden="true"></i>
                  <span>{{ requirement.text }}</span>
                </li>
              </ul>
            </div>

            <!-- Process Steps Section -->
            <div class="help-section">
              <div class="section-header">
                <i class="fas fa-route" aria-hidden="true"></i>
                <h4>How It Works</h4>
              </div>
              <ol class="process-steps">
                <li v-for="step in helpData.processSteps" :key="step.number" class="process-step">
                  <div class="step-number">{{ step.number }}</div>
                  <div class="step-content">
                    <strong>{{ step.title }}</strong>
                    <span>{{ step.description }}</span>
                  </div>
                </li>
              </ol>
            </div>

            <!-- Support Section -->
            <div class="help-section">
              <div class="section-header">
                <i class="fas fa-headset" aria-hidden="true"></i>
                <h4>Need Assistance?</h4>
              </div>
              <p class="support-description">Our support team is here to help you with any questions about document requirements or the application process.</p>
              <div class="support-actions">
                <button class="support-action-btn faq-btn" @click="handleOpenFAQ">
                  <i class="fas fa-question-circle" aria-hidden="true"></i>
                  <span>View FAQ</span>
                </button>
                <button class="support-action-btn contact-btn" @click="handleContactSupport">
                  <i class="fas fa-phone" aria-hidden="true"></i>
                  <span>Contact Support</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
  </div>
</template>

<script>
import unifiedAuthService from '@/services/unifiedAuthService';
import axios from 'axios';

export default {
  name: 'DocumentServicesSection',
  props: {
    documentTypes: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    error: {
      type: String,
      default: null
    },
    canRequestDocuments: {
      type: Boolean,
      default: true
    },
    statusMessage: {
      type: String,
      default: ''
    },
    refreshingStatus: {
      type: Boolean,
      default: false
    }
  },
  emits: ['select-document', 'retry-load', 'open-faq', 'contact-support', 'refresh-status'],
  data() {
    return {
      showHelpDialog: false,
      frequencyChecks: {}, // Store frequency check results for each document type
      helpData: {
        requirements: [
          {
            id: 1,
            text: 'Complete and accurate profile information'
          },
          {
            id: 2,
            text: 'Valid government-issued ID ready for upload'
          },
          {
            id: 3,
            text: 'Supporting documents (if required)'
          },
          {
            id: 4,
            text: 'Payment method for processing fees'
          }
        ],
        processSteps: [
          {
            number: 1,
            title: 'Select Document',
            description: 'Choose the document type you need'
          },
          {
            number: 2,
            title: 'Fill Application',
            description: 'Complete the required information'
          },
          {
            number: 3,
            title: 'Submit & Pay',
            description: 'Review and submit with payment'
          },
          {
            number: 4,
            title: 'Track Progress',
            description: 'Monitor your request status'
          }
        ]
      }
    }
  },
  computed: {
    clientData() {
      return unifiedAuthService.getCurrentUser();
    },

    isAccountActive() {
      return this.clientData?.status === 'active';
    }
  },
  methods: {
    async handleSelectDocument(documentType) {
      if (this.canRequestDocument(documentType)) {
        // Check frequency limits before allowing selection
        const frequencyCheck = await this.checkRequestFrequency(documentType.id);
        if (frequencyCheck && !frequencyCheck.canRequest) {
          // Show frequency limit message
          alert(frequencyCheck.message);
          return;
        }
        this.$emit('select-document', documentType)
      }
    },

    canRequestDocument(documentType) {
      const basicCheck = documentType.is_active && this.isAccountActive && this.canRequestDocuments;

      // Also check frequency limits if we have the data
      const frequencyCheck = this.frequencyChecks[documentType.id];
      if (frequencyCheck && !frequencyCheck.canRequest) {
        return false;
      }

      return basicCheck;
    },

    async checkRequestFrequency(documentTypeId) {
      try {
        const token = unifiedAuthService.getToken();
        const response = await axios.get(
          `${process.env.VUE_APP_API_BASE_URL}/api/client/document-requests/frequency-check/${documentTypeId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (response.data.success) {
          // Store the result for future reference
          this.$set(this.frequencyChecks, documentTypeId, response.data.data);
          return response.data.data;
        }
      } catch (error) {
        console.error('Error checking request frequency:', error);
        if (error.response?.status === 429) {
          // Frequency limit exceeded
          const errorData = error.response.data;
          this.$set(this.frequencyChecks, documentTypeId, errorData);
          return errorData;
        }
      }
      return null;
    },

    getStatusText(documentType) {
      if (!this.isAccountActive) {
        return 'Account Verification Required';
      }
      if (!this.canRequestDocuments) {
        return 'Residency Verification Required';
      }

      // Check frequency limits
      const frequencyCheck = this.frequencyChecks[documentType.id];
      if (frequencyCheck && !frequencyCheck.canRequest) {
        return `Next request allowed: ${new Date(frequencyCheck.nextAllowedDate).toLocaleDateString()}`;
      }

      return documentType.is_active ? 'Available' : 'Unavailable';
    },

    getStatusBadgeClass(documentType) {
      if (!this.isAccountActive) {
        return 'account-pending';
      }
      if (!this.canRequestDocuments) {
        return 'residency-pending';
      }

      // Check frequency limits
      const frequencyCheck = this.frequencyChecks[documentType.id];
      if (frequencyCheck && !frequencyCheck.canRequest) {
        return 'frequency-limited';
      }

      return {
        'available': documentType.is_active,
        'unavailable': !documentType.is_active
      };
    },
    
    handleRetry() {
      this.$emit('retry-load')
    },
    
    getDocumentIcon(typeName) {
      const icons = {
        'Barangay Clearance': 'fas fa-certificate',
        'Cedula': 'fas fa-id-card',
        'Business Permit': 'fas fa-briefcase',
        'Residence Certificate': 'fas fa-home',
        'Indigency Certificate': 'fas fa-hand-holding-heart'
      }
      return icons[typeName] || 'fas fa-file-alt'
    },

    getProcessingTime(typeName) {
      const times = {
        'Barangay Clearance': '3-5 business days',
        'Cedula': '1-2 business days',
        'Business Permit': '5-7 business days',
        'Residence Certificate': '2-3 business days',
        'Indigency Certificate': '1-2 business days'
      }
      return times[typeName] || '3-5 business days'
    },

    formatCurrency(amount) {
      return amount.toFixed(2)
    },

    closeDialog() {
      this.showHelpDialog = false
    },

    handleOpenFAQ() {
      this.$emit('open-faq')
      this.closeDialog()
    },

    handleContactSupport() {
      this.$emit('contact-support')
      this.closeDialog()
    },

    async checkAllDocumentFrequencies() {
      for (const documentType of this.documentTypes) {
        await this.checkRequestFrequency(documentType.id);
      }
    }
  },

  async mounted() {
    // Handle ESC key to close dialog
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.showHelpDialog) {
        this.closeDialog()
      }
    });

    // Check frequency limits for all document types when component mounts
    if (this.isAccountActive && this.canRequestDocuments && this.documentTypes.length > 0) {
      await this.checkAllDocumentFrequencies();
    }
  },

  watch: {
    // Watch for changes in document types and recheck frequencies
    documentTypes: {
      handler: async function(newTypes) {
        if (this.isAccountActive && this.canRequestDocuments && newTypes.length > 0) {
          await this.checkAllDocumentFrequencies();
        }
      },
      immediate: false
    }
  }
}
</script>

<style scoped>
/* Modern, clean layout with improved spacing and hierarchy */
.services-wrapper {
  display: flex;
  flex-direction: column;
  background: transparent;
}

.services-section {
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

/* Clean, minimal header design */
.section-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  margin-bottom: 2rem;
  padding: 0;
  background: none;
  border: none;
  box-shadow: none;
  width: 100%;
}

.section-title {
  font-size: clamp(2rem, 4vw, 2.75rem);
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 1rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  letter-spacing: -0.025em;
  line-height: 1.2;
}

.section-description {
  font-size: 1.125rem;
  color: #64748b;
  margin: 0;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
  font-weight: 400;
}

/* Account status warning */
.account-status-warning {
  margin-bottom: 2rem;
}

.account-status-warning .alert {
  border-radius: 12px;
  border: 1px solid #fbbf24;
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.account-status-warning .alert-heading {
  color: #92400e;
  font-weight: 600;
}

.account-status-warning p {
  color: #b45309;
}

/* Loading state with modern design */
.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  min-height: 300px;
}

.loading-content {
  text-align: center;
  background: white;
  padding: 3rem 2rem;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border: 1px solid #e2e8f0;
}

.loading-spinner i {
  font-size: 2.5rem;
  color: #3b82f6;
  margin-bottom: 1rem;
}

.loading-text {
  font-size: 1.125rem;
  color: #64748b;
  margin: 0;
  font-weight: 500;
}

/* Error state with clean design */
.error-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  min-height: 300px;
}

.error-content {
  text-align: center;
  background: white;
  padding: 3rem 2rem;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border: 1px solid #fee2e2;
  max-width: 400px;
}

.error-icon i {
  font-size: 2.5rem;
  color: #ef4444;
  margin-bottom: 1rem;
}

.error-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.error-message {
  color: #64748b;
  margin-bottom: 2rem;
  line-height: 1.5;
}

.retry-btn {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.retry-btn:hover {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

/* Modern grid layout */
.document-types-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-top: 0;
}

/* Clean, modern card design */
.document-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  position: relative;
  overflow: hidden;
}

.document-card:hover:not(.disabled) {
  border-color: #3b82f6;
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.document-card:focus:not(.disabled) {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.document-card.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #f8fafc;
}

/* Card header with icon and status */
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.document-icon {
  width: 3rem;
  height: 3rem;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3);
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.status-badge.available {
  background: #dcfce7;
  color: #166534;
}

.status-badge.unavailable {
  background: #fef2f2;
  color: #dc2626;
}

.status-badge.account-pending {
  background: #fef3c7;
  color: #d97706;
}

.status-badge.residency-pending {
  background: #fef3c7;
  color: #d97706;
}

.status-badge.frequency-limited {
  background: #fef2f2;
  color: #dc2626;
}

/* Card content */
.card-content {
  flex: 1;
}

.document-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.5rem;
  line-height: 1.3;
}

.document-description {
  color: #64748b;
  margin: 0;
  line-height: 1.5;
  font-size: 0.875rem;
}

/* Card details with better spacing */
.card-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem 0;
  border-top: 1px solid #f1f5f9;
}

.detail-row {
  display: flex;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
}

.detail-icon {
  width: 1rem;
  color: #64748b;
  font-size: 0.875rem;
}

.detail-label {
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 500;
  flex: 1;
}

.detail-value {
  font-weight: 600;
  color: #1e293b;
  font-size: 0.875rem;
}

.fee-amount {
  color: #059669;
  font-size: 1rem;
}

/* Card action */
.card-action {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-top: 0.5rem;
  border-top: 1px solid #f1f5f9;
}

.card-action i {
  color: #3b82f6;
  font-size: 1rem;
}

.disabled-text {
  color: #94a3b8;
  font-size: 0.875rem;
  font-weight: 500;
}

/* Responsive Design */
@media (max-width: 768px) {
  .services-section {
    padding: 2rem 0;
  }

  .container {
    padding: 0 1rem;
  }

  .section-header {
    margin-bottom: 2rem;
  }

  .document-types-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .document-card {
    padding: 1.25rem;
  }

  .loading-content,
  .error-content {
    padding: 2rem 1.5rem;
  }
}

@media (max-width: 480px) {
  .section-title {
    font-size: 1.75rem;
  }

  .section-description {
    font-size: 1rem;
  }

  .document-card {
    padding: 1rem;
  }

  .card-details {
    gap: 0.5rem;
  }
}

/* Dialog Modal Styles */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.dialog-content {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}

.dialog-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.dialog-close {
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.375rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dialog-close:hover {
  background: #e2e8f0;
  color: #1e293b;
}

.dialog-body {
  padding: 2rem;
  overflow-y: auto;
  max-height: calc(90vh - 120px);
}

.help-sections {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.help-section {
  background: #f8fafc;
  border-radius: 0.75rem;
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.section-header i {
  color: #3b82f6;
  font-size: 1.25rem;
}

.section-header h4 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

/* Requirements List */
.requirements-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.requirement-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  color: #374151;
  line-height: 1.5;
}

.requirement-item i {
  color: #059669;
  margin-top: 0.125rem;
  flex-shrink: 0;
}

/* Process Steps */
.process-steps {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.process-step {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.step-number {
  width: 2rem;
  height: 2rem;
  background: #3b82f6;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.step-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.step-content strong {
  color: #1e293b;
  font-weight: 600;
}

.step-content span {
  color: #64748b;
  font-size: 0.875rem;
  line-height: 1.4;
}

/* Support Section */
.support-description {
  color: #64748b;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.support-actions {
  display: flex;
  gap: 1rem;
}

.support-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  cursor: pointer;
  border: 1px solid #e2e8f0;
  background: white;
  color: #64748b;
  text-decoration: none;
}

.support-action-btn:hover {
  background: #f8fafc;
  color: #1e293b;
  border-color: #cbd5e1;
  transform: translateY(-1px);
}

.faq-btn:hover {
  border-color: #3b82f6;
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.05);
}

.contact-btn:hover {
  border-color: #059669;
  color: #059669;
  background: rgba(5, 150, 105, 0.05);
}

/* Responsive Design for Footer and Dialog */
@media (max-width: 768px) {
  .services-footer {
    margin-top: 2rem;
  }

  .footer-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
  }

  .footer-actions {
    width: 100%;
    justify-content: stretch;
  }

  .help-btn,
  .support-btn {
    flex: 1;
    justify-content: center;
  }

  .dialog-overlay {
    padding: 0.5rem;
  }

  .dialog-header {
    padding: 1rem 1.5rem;
  }

  .dialog-body {
    padding: 1.5rem;
  }

  .help-section {
    padding: 1rem;
  }

  .support-actions {
    flex-direction: column;
  }

  .support-action-btn {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .dialog-title {
    font-size: 1.25rem;
  }

  .dialog-header {
    padding: 1rem;
  }

  .dialog-body {
    padding: 1rem;
  }

  .help-sections {
    gap: 1.5rem;
  }

  .help-section {
    padding: 1rem;
  }

  .footer-actions {
    flex-direction: column;
  }
}
</style>