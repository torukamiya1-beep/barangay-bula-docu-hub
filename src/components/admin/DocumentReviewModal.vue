<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">
          <i class="fas fa-file-alt me-2"></i>
          Review Residency Documents
        </h3>
        <button class="btn-close" @click="$emit('close')" aria-label="Close">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <!-- Client Information -->
        <div class="client-info-card mb-4">
          <h5 class="card-title">
            <i class="fas fa-user me-2"></i>
            Client Information
          </h5>
          <div class="row">
            <div class="col-md-6">
              <div class="info-item">
                <label>Full Name:</label>
                <span>{{ getFullName(client) }}</span>
              </div>
              <div class="info-item">
                <label>Username:</label>
                <span>{{ client.username }}</span>
              </div>
              <div class="info-item">
                <label>Email:</label>
                <span>{{ client.email || 'Not provided' }}</span>
              </div>
            </div>
            <div class="col-md-6">
              <div class="info-item">
                <label>Phone:</label>
                <span>{{ client.phone_number || 'Not provided' }}</span>
              </div>
              <div class="info-item">
                <label>Address:</label>
                <span>{{ getAddress(client) }}</span>
              </div>
              <div class="info-item">
                <label>Registration Date:</label>
                <span>{{ formatDate(client.registration_date) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Documents Section -->
        <div class="documents-section">
          <h5 class="section-title">
            <i class="fas fa-folder-open me-2"></i>
            Uploaded Documents ({{ documents.length }})
          </h5>
          
          <div v-if="documents.length === 0" class="no-documents">
            <i class="fas fa-file-excel fa-3x text-muted mb-3"></i>
            <p class="text-muted">No documents uploaded</p>
          </div>

          <div v-else class="documents-grid">
            <div 
              v-for="document in documents" 
              :key="document.id" 
              class="document-card"
              @click="viewDocument(document)"
            >
              <div class="document-header">
                <div class="document-icon">
                  <i :class="getDocumentIcon(document.document_type)"></i>
                </div>
                <div class="document-type">
                  {{ formatDocumentType(document.document_type) }}
                </div>
              </div>
              
              <div class="document-info">
                <div class="document-name">{{ document.document_name }}</div>
                <div class="document-meta">
                  <span class="file-size">{{ formatFileSize(document.file_size) }}</span>
                  <span class="upload-date">{{ formatDate(document.created_at) }}</span>
                </div>
              </div>

              <div class="document-actions">
                <button 
                  class="btn btn-sm btn-outline-primary"
                  @click.stop="viewDocument(document)"
                >
                  <i class="fas fa-eye"></i>
                  View
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <div class="action-buttons">
          <button 
            class="btn btn-success me-2" 
            @click="handleApprove"
            :disabled="documents.length === 0"
          >
            <i class="fas fa-check me-1"></i>
            Approve Verification
          </button>
          
          <button 
            class="btn btn-danger me-2" 
            @click="showRejectModal = true"
            :disabled="documents.length === 0"
          >
            <i class="fas fa-times me-1"></i>
            Reject Verification
          </button>
          
          <button class="btn btn-secondary" @click="$emit('close')">
            <i class="fas fa-arrow-left me-1"></i>
            Back to List
          </button>
        </div>
      </div>
    </div>

    <!-- Document Viewer Modal -->
    <DocumentViewer
      v-if="showDocumentViewer"
      :document="selectedDocument"
      @close="closeDocumentViewer"
    />

    <!-- Rejection Reason Modal -->
    <div v-if="showRejectModal" class="modal-overlay" @click="showRejectModal = false">
      <div class="modal-container small" @click.stop>
        <div class="modal-header">
          <h4 class="modal-title">Reject Verification</h4>
          <button class="btn-close" @click="showRejectModal = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="rejectionReason">Reason for Rejection:</label>
            <textarea
              id="rejectionReason"
              v-model="rejectionReason"
              class="form-control"
              rows="4"
              placeholder="Please provide a detailed reason for rejecting this verification..."
              :class="{ 'is-invalid': rejectionError }"
            ></textarea>
            <div v-if="rejectionError" class="invalid-feedback">
              {{ rejectionError }}
            </div>
            <small class="form-text text-muted">
              Minimum 10 characters required. This will be sent to the client.
            </small>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-danger" @click="handleReject" :disabled="rejectionReason.length < 10">
            <i class="fas fa-times me-1"></i>
            Confirm Rejection
          </button>
          <button class="btn btn-secondary" @click="showRejectModal = false">
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DocumentViewer from './DocumentViewer.vue';

export default {
  name: 'DocumentReviewModal',
  components: {
    DocumentViewer
  },
  props: {
    client: {
      type: Object,
      required: true
    },
    documents: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      showDocumentViewer: false,
      selectedDocument: null,
      showRejectModal: false,
      rejectionReason: '',
      rejectionError: null
    };
  },
  methods: {
    handleOverlayClick() {
      this.$emit('close');
    },

    getFullName(client) {
      const parts = [client.first_name, client.middle_name, client.last_name].filter(Boolean);
      return parts.join(' ') || client.username;
    },

    getAddress(client) {
      const parts = [client.barangay, client.city_municipality, client.province].filter(Boolean);
      return parts.join(', ') || 'Not provided';
    },

    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    formatDocumentType(type) {
      const typeMap = {
        'utility_bill': 'Utility Bill',
        'barangay_certificate': 'Barangay Certificate',
        'valid_id': 'Valid ID',
        'lease_contract': 'Lease Contract',
        'other': 'Other Document'
      };
      return typeMap[type] || type;
    },

    getDocumentIcon(type) {
      const iconMap = {
        'utility_bill': 'fas fa-file-invoice text-warning',
        'barangay_certificate': 'fas fa-certificate text-success',
        'valid_id': 'fas fa-id-card text-info',
        'lease_contract': 'fas fa-file-contract text-primary',
        'other': 'fas fa-file text-secondary'
      };
      return iconMap[type] || 'fas fa-file text-secondary';
    },

    formatFileSize(bytes) {
      if (!bytes) return 'Unknown size';
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(1024));
      return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    },

    viewDocument(document) {
      this.selectedDocument = document;
      this.showDocumentViewer = true;
    },

    closeDocumentViewer() {
      this.showDocumentViewer = false;
      this.selectedDocument = null;
    },

    handleApprove() {
      if (confirm('Are you sure you want to approve this residency verification? This will activate the client account.')) {
        this.$emit('approve', this.client.account_id);
      }
    },

    handleReject() {
      this.rejectionError = null;
      
      if (this.rejectionReason.length < 10) {
        this.rejectionError = 'Rejection reason must be at least 10 characters long';
        return;
      }

      if (confirm('Are you sure you want to reject this residency verification? The client will need to upload new documents.')) {
        this.$emit('reject', {
          accountId: this.client.account_id,
          reason: this.rejectionReason
        });
        this.showRejectModal = false;
        this.rejectionReason = '';
      }
    }
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
}

.modal-container {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 1000px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.modal-container.small {
  max-width: 500px;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  margin: 0;
  color: #495057;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #6c757d;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
}

.btn-close:hover {
  background-color: #f8f9fa;
  color: #495057;
}

.modal-body {
  padding: 1.5rem;
}

.client-info-card {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #dee2e6;
}

.card-title {
  color: #495057;
  margin-bottom: 1rem;
}

.info-item {
  margin-bottom: 0.75rem;
}

.info-item label {
  font-weight: 600;
  color: #6c757d;
  margin-right: 0.5rem;
  min-width: 120px;
  display: inline-block;
}

.section-title {
  color: #495057;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e9ecef;
}

.documents-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.document-card {
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1rem;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.document-card:hover {
  border-color: #007bff;
  box-shadow: 0 2px 8px rgba(0, 123, 255, 0.15);
}

.document-header {
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
}

.document-icon {
  font-size: 1.5rem;
  margin-right: 0.75rem;
}

.document-type {
  font-weight: 600;
  color: #495057;
}

.document-name {
  font-size: 0.9rem;
  color: #6c757d;
  margin-bottom: 0.5rem;
  word-break: break-word;
}

.document-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #868e96;
}

.document-actions {
  margin-top: 0.75rem;
  text-align: right;
}

.no-documents {
  text-align: center;
  padding: 3rem;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #dee2e6;
  background: #f8f9fa;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

@media (max-width: 768px) {
  .modal-container {
    width: 95%;
    margin: 1rem;
  }
  
  .documents-grid {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .action-buttons .btn {
    margin-bottom: 0.5rem;
  }
}
</style>
