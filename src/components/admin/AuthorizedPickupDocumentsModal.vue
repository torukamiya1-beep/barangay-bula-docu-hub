<template>
  <div class="modal fade" id="authorizedPickupDocumentsModal" tabindex="-1" aria-labelledby="authorizedPickupDocumentsModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-xl modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="authorizedPickupDocumentsModalLabel">
            <i class="fas fa-hand-paper me-2"></i>
            Authorized Pickup Documents Review
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div v-if="request">
            <!-- Request Information -->
            <div class="row mb-4">
              <div class="col-12">
                <div class="card bg-light">
                  <div class="card-body">
                    <h6 class="card-title mb-3">
                      <i class="fas fa-file-alt me-2"></i>
                      Request Information
                    </h6>
                    <div class="row">
                      <div class="col-md-6">
                        <p><strong>Request Number:</strong> {{ request.request_number }}</p>
                        <p><strong>Document Type:</strong> {{ request.document_type }}</p>
                        <p><strong>Requestor:</strong> {{ request.client_name }}</p>
                      </div>

                       <!-- ill comment status for now because I dont need it to be display
                      ill comment request date for now because I dont need it to be display -->

                      <!-- <div class="col-md-6">
                        <p><strong>Status:</strong>
                          <span class="badge" :class="getStatusBadgeClass(request.status_name)">
                            {{ request.status_name }}
                          </span>
                        </p>
                        <p><strong>Request Date:</strong> {{ formatDate(request.created_at) }}</p>
                      </div> -->

                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Authorized Pickup Person Information -->
            <div v-if="request.authorized_pickup" class="row mb-4">
              <div class="col-12">
                <div class="card">
                  <div class="card-header bg-warning-subtle">
                    <h6 class="mb-0">
                      <i class="fas fa-user me-2"></i>
                      Authorized Pickup Person Details
                    </h6>
                  </div>
                  <div class="card-body">
                    <div class="row">
                      <div class="col-md-6">
                        <p><strong>Full Name:</strong> {{ request.authorized_pickup.full_name }}</p>
                        <p><strong>Phone:</strong> {{ request.authorized_pickup.phone_number || 'Not provided' }}</p>
                        
                        <!-- ill comment email for now because I dont need it to be display -->
                        <!-- <p><strong>Email:</strong> {{ request.authorized_pickup.email || 'Not provided' }}</p> -->
                      </div>
                      <div class="col-md-6">
                        <p><strong>Relationship:</strong> {{ request.authorized_pickup.relationship_to_beneficiary }}</p>
                        
                        <!-- ill comment the verification status because I dont need it to be display -->
                        <!-- <p><strong>Verification Status:</strong>
                          <span class="badge" :class="getVerificationStatusClass(request.authorized_pickup.verification_status)">
                            {{ formatVerificationStatus(request.authorized_pickup.verification_status) }}
                          </span>
                        </p> -->
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Documents Section -->
            <div class="row">
              <div class="col-12">
                <h6 class="mb-3">
                  <i class="fas fa-folder-open me-2"></i>
                  Uploaded Documents
                </h6>

                <!-- Loading State -->
                <div v-if="loading" class="text-center py-4">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading documents...</span>
                  </div>
                  <p class="mt-2">Loading documents...</p>
                </div>

                <!-- Error State -->
                <div v-else-if="error" class="alert alert-danger">
                  <i class="fas fa-exclamation-triangle me-2"></i>
                  {{ error }}
                </div>

                <!-- No Documents -->
                <div v-else-if="!hasDocuments" class="text-center py-4">
                  <i class="fas fa-file-slash fa-3x text-muted mb-3"></i>
                  <p class="text-muted">No pickup authorization documents found for this request.</p>
                </div>

                <!-- Documents Grid -->
                <div v-else class="row">
                  <!-- Valid ID -->
                  <div v-if="getAuthDocByType('valid_id')" class="col-md-6 mb-3">
                    <div class="card h-100 document-card">
                      <!-- Document Preview -->
                      <div class="card-img-top document-preview" @click="viewDocument(`auth-doc-${getAuthDocByType('valid_id').id}`)">
                        <img
                          v-if="documentBlobUrls[`auth-doc-${getAuthDocByType('valid_id').id}`]"
                          :src="documentBlobUrls[`auth-doc-${getAuthDocByType('valid_id').id}`]"
                          alt="Valid ID"
                          class="preview-image"
                          @error="handleImageError"
                        />
                        <div v-else class="loading-preview">
                          <div class="spinner-border spinner-border-sm" role="status">
                            <span class="sr-only">Loading...</span>
                          </div>
                        </div>
                        <div class="preview-overlay">
                          <i class="fas fa-eye fa-2x"></i>
                        </div>
                      </div>
                      
                      <div class="card-header d-flex justify-content-between align-items-center">
                        <h6 class="mb-0">
                          <i class="fas fa-id-card me-2"></i>
                          Valid ID
                        </h6>
                        <span class="badge" :class="{
                          'bg-success': getAuthDocByType('valid_id').verification_status === 'approved',
                          'bg-danger': getAuthDocByType('valid_id').verification_status === 'rejected',
                          'bg-warning text-dark': getAuthDocByType('valid_id').verification_status === 'pending'
                        }">
                          {{ formatDocStatus(getAuthDocByType('valid_id').verification_status) }}
                        </span>
                      </div>
                      <div class="card-body">
                        <p class="card-text">
                          <strong>File:</strong> {{ getFileName(getAuthDocByType('valid_id').file_path) }}<br>
                          <strong>Size:</strong> {{ formatFileSize(getAuthDocByType('valid_id').file_size) }}
                        </p>
                        <div class="d-grid gap-2">
                          <button class="btn btn-outline-primary btn-sm" @click="viewDocument(`auth-doc-${getAuthDocByType('valid_id').id}`)">
                            <i class="fas fa-eye me-1"></i>
                            View Document
                          </button>
                          
                          <!-- Approve/Reject Buttons for Pending Verification -->
                          <div v-if="getAuthDocByType('valid_id').verification_status === 'pending'" class="btn-group mt-2">
                            <button 
                              class="btn btn-success btn-sm"
                              @click="approveDocument(getAuthDocByType('valid_id').id, 'valid_id')"
                              :disabled="processingDocs[getAuthDocByType('valid_id').id]"
                              title="Approve Valid ID"
                            >
                              <i class="fas fa-check me-1"></i>
                              Approve
                            </button>
                            <button 
                              class="btn btn-danger btn-sm"
                              @click="rejectDocument(getAuthDocByType('valid_id').id, 'valid_id')"
                              :disabled="processingDocs[getAuthDocByType('valid_id').id]"
                              title="Reject Valid ID"
                            >
                              <i class="fas fa-times me-1"></i>
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Authorization Letter -->
                  <div v-if="getAuthDocByType('authorization_letter')" class="col-md-6 mb-3">
                    <div class="card h-100 document-card">
                      <!-- Document Preview -->
                      <div class="card-img-top document-preview" @click="viewDocument(`auth-doc-${getAuthDocByType('authorization_letter').id}`)">
                        <img
                          v-if="documentBlobUrls[`auth-doc-${getAuthDocByType('authorization_letter').id}`]"
                          :src="documentBlobUrls[`auth-doc-${getAuthDocByType('authorization_letter').id}`]"
                          alt="Authorization Letter"
                          class="preview-image"
                          @error="handleImageError"
                        />
                        <div v-else class="loading-preview">
                          <div class="spinner-border spinner-border-sm" role="status">
                            <span class="sr-only">Loading...</span>
                          </div>
                        </div>
                        <div class="preview-overlay">
                          <i class="fas fa-eye fa-2x"></i>
                        </div>
                      </div>
                      
                      <div class="card-header d-flex justify-content-between align-items-center">
                        <h6 class="mb-0">
                          <i class="fas fa-file-signature me-2"></i>
                          Authorization Letter
                        </h6>
                        <span class="badge" :class="{
                          'bg-success': getAuthDocByType('authorization_letter').verification_status === 'approved',
                          'bg-danger': getAuthDocByType('authorization_letter').verification_status === 'rejected',
                          'bg-warning text-dark': getAuthDocByType('authorization_letter').verification_status === 'pending'
                        }">
                          {{ formatDocStatus(getAuthDocByType('authorization_letter').verification_status) }}
                        </span>
                      </div>
                      <div class="card-body">
                        <p class="card-text">
                          <strong>File:</strong> {{ getFileName(getAuthDocByType('authorization_letter').file_path) }}<br>
                          <strong>Type:</strong> Signed authorization letter
                        </p>
                        <div class="d-grid gap-2">
                          <button class="btn btn-outline-primary btn-sm" @click="viewDocument(`auth-doc-${getAuthDocByType('authorization_letter').id}`)">
                            <i class="fas fa-eye me-1"></i>
                            View Document
                          </button>
                          
                          <!-- Approve/Reject Buttons for Pending Verification -->
                          <div v-if="getAuthDocByType('authorization_letter').verification_status === 'pending'" class="btn-group mt-2">
                            <button 
                              class="btn btn-success btn-sm"
                              @click="approveDocument(getAuthDocByType('authorization_letter').id, 'authorization_letter')"
                              :disabled="processingDocs[getAuthDocByType('authorization_letter').id]"
                              title="Approve Authorization Letter"
                            >
                              <i class="fas fa-check me-1"></i>
                              Approve
                            </button>
                            <button 
                              class="btn btn-danger btn-sm"
                              @click="rejectDocument(getAuthDocByType('authorization_letter').id, 'authorization_letter')"
                              :disabled="processingDocs[getAuthDocByType('authorization_letter').id]"
                              title="Reject Authorization Letter"
                            >
                              <i class="fas fa-times me-1"></i>
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Loading State for Authorization Documents -->
                <div v-if="loadingAuthDocs" class="col-12 mt-3">
                  <div class="text-center py-3">
                    <div class="spinner-border spinner-border-sm text-primary" role="status">
                      <span class="visually-hidden">Loading additional documents...</span>
                    </div>
                    <p class="mt-2 small text-muted">Loading additional authorization documents...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          <!-- Show verification buttons if documents exist and are not verified -->
          <div v-if="hasDocuments && canVerify" class="ms-auto">
            <!-- ill comment this button for now  -->
            <!-- <button
              type="button"
              class="btn btn-danger me-2"
              @click="$emit('reject')"
              :disabled="processing"
            >
              <i class="fas fa-times me-1"></i>
              Reject
            </button> -->

            <!-- ill comment this button because I dont need it for now -->
            <!-- <button
              type="button"
              class="btn btn-success"
              @click="$emit('verify')"
              :disabled="processing"
            >
              <span v-if="processing" class="spinner-border spinner-border-sm me-1" role="status"></span>
              <i v-else class="fas fa-check me-1"></i>
              Verify
            </button> -->
          </div>
          <!-- Show status message when verified -->
          <div v-else-if="isVerified" class="ms-auto">
            <span class="badge bg-success fs-6">
              <i class="fas fa-check me-1"></i>
              Documents Verified
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import authorizationDocumentService from '@/services/authorizationDocumentService';
import api from '@/services/api';

export default {
  name: 'AuthorizedPickupDocumentsModal',
  props: {
    request: {
      type: Object,
      default: null
    },
    processing: {
      type: Boolean,
      default: false
    }
  },
  emits: ['verify', 'reject', 'verified', 'rejected'],
  
  data() {
    return {
      loading: false,
      error: null,
      documentBlobUrls: {},
      authorizationDocuments: [],
      loadingAuthDocs: false,
      processingDocs: {}
    };
  },

  computed: {
    hasDocuments() {
      return (this.request?.authorized_pickup && (
        this.request.authorized_pickup.id_image_path ||
        this.request.authorized_pickup.authorization_letter_path
      )) || (this.authorizationDocuments && this.authorizationDocuments.length > 0);
    },

    canVerify() {
      return this.request?.authorized_pickup?.verification_status !== 'verified';
    },

    isVerified() {
      return this.request?.authorized_pickup?.verification_status === 'verified';
    }
  },

  watch: {
    request: {
      handler(newRequest) {
        if (newRequest) {
          console.log('AuthorizedPickupDocumentsModal - Request data:', newRequest);
          console.log('AuthorizedPickupDocumentsModal - Authorized pickup:', newRequest.authorized_pickup);
          if (newRequest.authorized_pickup) {
            console.log('AuthorizedPickupDocumentsModal - ID image path:', newRequest.authorized_pickup.id_image_path);
            console.log('AuthorizedPickupDocumentsModal - Auth letter path:', newRequest.authorized_pickup.authorization_letter_path);
            console.log('AuthorizedPickupDocumentsModal - Pickup person ID:', newRequest.authorized_pickup.id);
          }
          this.loadDocuments();
        }
      },
      immediate: true
    }
  },

  methods: {
    async loadDocuments() {
      if (!this.request) return;

      this.loading = true;
      this.error = null;
      this.documentBlobUrls = {};
      this.authorizationDocuments = [];

      try {
        // Load ID document from authorized_pickup_persons table
        if (this.request.authorized_pickup?.id_image_path) {
          await this.loadDocument('pickup-id', this.request.authorized_pickup.id_image_path);
        }

        // Load authorization letter from authorized_pickup_persons table
        if (this.request.authorized_pickup?.authorization_letter_path) {
          await this.loadDocument('pickup-auth', this.request.authorized_pickup.authorization_letter_path);
        }

        // Load additional authorization documents from authorization_documents table
        if (this.request.authorized_pickup?.id) {
          await this.loadAuthorizationDocuments(this.request.authorized_pickup.id);
        }
      } catch (error) {
        console.error('Error loading pickup documents:', error);
        this.error = 'Failed to load documents. Please try again.';
      } finally {
        this.loading = false;
      }
    },

    async loadAuthorizationDocuments(pickupPersonId) {
      this.loadingAuthDocs = true;
      try {
        // Call backend API to get authorization documents for this pickup person
        const response = await api.get(`/authorization-documents/pickup-person/${pickupPersonId}`);
        
        if (response.data && response.data.data) {
          this.authorizationDocuments = response.data.data;
          console.log('Loaded authorization documents:', this.authorizationDocuments);
          
          // Load document previews
          for (const doc of this.authorizationDocuments) {
            const docKey = `auth-doc-${doc.id}`;
            await this.loadDocument(docKey, doc.file_path);
          }
        }
      } catch (error) {
        console.error('Error loading authorization documents:', error);
        // Don't throw error, just log it - these documents are optional
      } finally {
        this.loadingAuthDocs = false;
      }
    },

    async loadDocument(type, filename) {
      try {
        console.log(`Loading ${type} document from path: "${filename}"`);

        // Convert database path to web-accessible URL
        const webUrl = this.convertPathToUrl(filename);
        console.log(`Converted to web URL: ${webUrl}`);

        if (!webUrl) {
          console.error('Could not convert path to URL');
          return;
        }

        // Use fetch directly instead of api (which adds /api prefix)
        const API_BASE_URL = process.env.VUE_APP_API_URL?.replace('/api', '') || 'http://localhost:7000';
        const response = await fetch(`${API_BASE_URL}${webUrl}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        this.documentBlobUrls[type] = url;
        console.log(`Successfully loaded ${type} document`);
      } catch (error) {
        console.error(`Error loading ${type} document:`, error);
        const API_BASE_URL = process.env.VUE_APP_API_URL?.replace('/api', '') || 'http://localhost:7000';
        console.error(`Failed URL: ${API_BASE_URL}${this.convertPathToUrl(filename)}`);
        // Don't throw here, just log the error for individual documents
      }
    },

    convertPathToUrl(dbPath) {
      if (!dbPath) return null;

      // Convert database path to web URL
      // From: "uploads\\verification\\pickup_authorization\\filename.jpg"
      // To: "/uploads/verification/pickup_authorization/filename.jpg"

      let webPath = dbPath;

      // Replace backslashes with forward slashes
      webPath = webPath.replace(/\\/g, '/');

      // Ensure it starts with /
      if (!webPath.startsWith('/')) {
        webPath = '/' + webPath;
      }

      console.log(`Path conversion: "${dbPath}" -> "${webPath}"`);
      return webPath;
    },

    viewDocument(type) {
      // Check if we have a blob URL for this document
      const blobUrl = this.documentBlobUrls[type];
      
      if (blobUrl) {
        // Open the blob URL in a new tab
        window.open(blobUrl, '_blank');
      } else {
        console.error('Document not loaded:', type);
        alert('Document is still loading. Please wait a moment and try again.');
      }
    },

    getFileName(path) {
      return path ? path.split('/').pop() : 'Unknown';
    },

    getStatusBadgeClass(status) {
      const statusMap = {
        'pending': 'bg-warning text-dark',
        'processing': 'bg-info',
        'approved': 'bg-success',
        'rejected': 'bg-danger',
        'completed': 'bg-success'
      };
      return statusMap[status?.toLowerCase()] || 'bg-secondary';
    },

    getVerificationStatusClass(status) {
      const statusMap = {
        'pending': 'bg-warning text-dark',
        'verified': 'bg-success',
        'rejected': 'bg-danger'
      };
      return statusMap[status?.toLowerCase()] || 'bg-secondary';
    },

    formatVerificationStatus(status) {
      if (!status) return 'Pending';
      return status.charAt(0).toUpperCase() + status.slice(1);
    },

    formatDate(dateString) {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    handleImageError(event) {
      console.error('Image failed to load:', event.target.src);
      event.target.style.display = 'none';
    },

    // Approve authorization document
    async approveAuthorizationDocument(documentId) {
      if (!confirm('Are you sure you want to approve this authorization document?')) return;
      
      try {
        const result = await authorizationDocumentService.updateDocumentStatus(documentId, 'approved');
        
        if (result.success) {
          this.$toast?.success('Authorization document approved successfully');
          // Reload documents to show updated status
          if (this.request.authorized_pickup?.id) {
            await this.loadAuthorizationDocuments(this.request.authorized_pickup.id);
          }
        } else {
          this.$toast?.error(result.message || 'Failed to approve document');
        }
      } catch (error) {
        console.error('Error approving authorization document:', error);
        this.$toast?.error('An error occurred while approving the document');
      }
    },

    // Reject authorization document
    async rejectAuthorizationDocument(documentId) {
      if (!confirm('Are you sure you want to reject this authorization document? The client will be notified to reupload.')) return;
      
      try {
        const result = await authorizationDocumentService.updateDocumentStatus(documentId, 'rejected');
        
        if (result.success) {
          this.$toast?.warning('Authorization document rejected. Client will be notified.');
          // Reload documents to show updated status
          if (this.request.authorized_pickup?.id) {
            await this.loadAuthorizationDocuments(this.request.authorized_pickup.id);
          }
        } else {
          this.$toast?.error(result.message || 'Failed to reject document');
        }
      } catch (error) {
        console.error('Error rejecting authorization document:', error);
        this.$toast?.error('An error occurred while rejecting the document');
      }
    },

    getDocumentTypeLabel(type) {
      const labels = {
        'authorization_letter': 'Authorization Letter',
        'valid_id': 'Valid ID',
        'additional_proof': 'Additional Proof'
      };
      return labels[type] || type;
    },

    formatFileSize(bytes) {
      if (!bytes) return 'Unknown size';
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(1024));
      return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    },

    formatPickupVerificationStatus(status) {
      if (!status || status === 'pending') return 'PENDING';
      if (status === 'verified') return 'VERIFIED';
      if (status === 'rejected') return 'REJECTED';
      return status.toUpperCase();
    },

    // Approve individual authorization document
    async approveDocument(documentId, documentType) {
      const docName = documentType === 'valid_id' ? 'Valid ID' : 'Authorization Letter';
      if (!confirm(`Are you sure you want to approve this ${docName}?`)) return;
      
      try {
        this.processingDocs[documentId] = true;

        // Call backend API to approve document
        const response = await api.patch(`/authorization-documents/${documentId}/status`, {
          verification_status: 'approved'
        });

        if (response.data.success) {
          this.$toast?.success(`${docName} approved successfully`);
          // Reload authorization documents to get updated status
          await this.loadAuthorizationDocuments(this.request.authorized_pickup.id);
          // Emit event to parent
          this.$emit('verified');
          
          // Close the modal
          const modalElement = document.getElementById('authorizedPickupDocumentsModal');
          if (modalElement) {
            const modal = window.bootstrap.Modal.getInstance(modalElement);
            if (modal) {
              modal.hide();
            }
          }
        } else {
          this.$toast?.error(response.data.message || `Failed to approve ${docName}`);
        }
      } catch (error) {
        console.error(`Error approving ${documentType}:`, error);
        this.$toast?.error(error.response?.data?.message || 'An error occurred while approving');
      } finally {
        this.processingDocs[documentId] = false;
      }
    },

    // Reject individual authorization document
    async rejectDocument(documentId, documentType) {
      const docName = documentType === 'valid_id' ? 'Valid ID' : 'Authorization Letter';
      if (!confirm(`Are you sure you want to reject this ${docName}? The client will be notified.`)) return;
      
      try {
        this.processingDocs[documentId] = true;

        // Call backend API to reject document
        const response = await api.patch(`/authorization-documents/${documentId}/status`, {
          verification_status: 'rejected'
        });

        if (response.data.success) {
          this.$toast?.warning(`${docName} rejected. Client will be notified.`);
          // Reload authorization documents to get updated status
          await this.loadAuthorizationDocuments(this.request.authorized_pickup.id);
          // Emit event to parent
          this.$emit('rejected');
          
          // Close the modal
          const modalElement = document.getElementById('authorizedPickupDocumentsModal');
          if (modalElement) {
            const modal = window.bootstrap.Modal.getInstance(modalElement);
            if (modal) {
              modal.hide();
            }
          }
        } else {
          this.$toast?.error(response.data.message || `Failed to reject ${docName}`);
        }
      } catch (error) {
        console.error(`Error rejecting ${documentType}:`, error);
        this.$toast?.error(error.response?.data?.message || 'An error occurred while rejecting');
      } finally {
        this.processingDocs[documentId] = false;
      }
    },

    // Get authorization document by type
    getAuthDocByType(type) {
      return this.authorizationDocuments.find(doc => doc.document_type === type);
    },

    // Format document type for display
    formatDocType(type) {
      if (type === 'valid_id') return 'Valid ID';
      if (type === 'authorization_letter') return 'Authorization Letter';
      return type;
    },

    // Format verification status
    formatDocStatus(status) {
      if (!status || status === 'pending') return 'PENDING';
      if (status === 'approved') return 'APPROVED';
      if (status === 'rejected') return 'REJECTED';
      return status.toUpperCase();
    }
  },

  beforeUnmount() {
    // Clean up blob URLs to prevent memory leaks
    Object.values(this.documentBlobUrls).forEach(url => {
      URL.revokeObjectURL(url);
    });
  }
};
</script>

<style scoped>
.document-card {
  transition: transform 0.2s ease-in-out;
  border: 1px solid #dee2e6;
}

.document-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.document-preview {
  position: relative;
  height: 200px;
  overflow: hidden;
  cursor: pointer;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.document-preview:hover .preview-image {
  transform: scale(1.05);
}

.loading-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #6c757d;
}

.preview-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  color: white;
}

.document-preview:hover .preview-overlay {
  opacity: 1;
}

.card-header h6 {
  font-size: 0.9rem;
  font-weight: 600;
}

.card-text {
  font-size: 0.85rem;
  line-height: 1.4;
}

.badge {
  font-size: 0.75rem;
}
</style>
