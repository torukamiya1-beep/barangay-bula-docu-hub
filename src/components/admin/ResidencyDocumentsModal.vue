<template>
  <div class="modal fade" id="residencyDocumentsModal" tabindex="-1" aria-labelledby="residencyDocumentsModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-xl modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="residencyDocumentsModalLabel">
            <i class="fas fa-file-image me-2"></i>
            Residency Documents Review
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div v-if="user">
            <!-- User Information -->
            <div class="row mb-4">
              <div class="col-12">
                <div class="card bg-light">
                  <div class="card-body">
                    <h6 class="card-title mb-3">
                      <i class="fas fa-user me-2"></i>
                      User Information
                    </h6>
                    <div class="row">
                      <div class="col-md-6">
                        <p><strong>Name:</strong> {{ user.full_name }}</p>
                        <p><strong>Username:</strong> {{ user.username }}</p>
                        <p><strong>Email:</strong> {{ user.email }}</p>
                      </div>
                      <div class="col-md-6">
                        <p><strong>Status:</strong>
                          <span class="badge" :class="getStatusBadgeClass(user.status)">
                            {{ formatStatus(user.status) }}
                          </span>
                        </p>
                        <p><strong>Registration Date:</strong> {{ formatDate(user.created_at) }}</p>
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
                <div v-else-if="!documents || documents.length === 0" class="text-center py-4">
                  <i class="fas fa-file-slash fa-3x text-muted mb-3"></i>
                  <p class="text-muted">No residency documents found for this user.</p>
                </div>

                <!-- Documents Grid -->
                <div v-else class="row">
                  <div v-for="document in documents" :key="document.id" class="col-md-6 col-lg-4 mb-3">
                    <div class="card h-100 document-card">
                      <!-- Document Preview -->
                      <div class="card-img-top document-preview" @click="viewDocument(document)">
                        <img
                          v-if="isImageDocument(document) && documentBlobUrls[document.id]"
                          :src="documentBlobUrls[document.id]"
                          :alt="document.document_name"
                          class="preview-image"
                          @error="handleImageError"
                        />
                        <div v-else-if="isImageDocument(document)" class="loading-preview">
                          <div class="spinner-border spinner-border-sm" role="status">
                            <span class="sr-only">Loading...</span>
                          </div>
                        </div>
                        <div v-else class="file-icon-preview">
                          <i :class="getDocumentIcon(document.document_type)" class="fa-3x"></i>
                        </div>
                        <div class="preview-overlay">
                          <i class="fas fa-eye fa-2x"></i>
                        </div>
                      </div>
                      
                      <div class="card-header d-flex justify-content-between align-items-center">
                        <h6 class="mb-0">{{ formatDocumentType(document.document_type) }}</h6>
                        <span class="badge" :class="getDocumentStatusBadgeClass(document.verification_status)">
                          {{ formatDocumentStatus(document.verification_status) }}
                        </span>
                      </div>
                      <div class="card-body">
                        <p class="card-text">
                          <strong>File:</strong> {{ document.document_name }}<br>
                          <strong>Size:</strong> {{ formatFileSize(document.file_size) }}<br>
                          <strong>Uploaded:</strong> {{ formatDate(document.created_at) }}
                        </p>
                        <div class="d-grid gap-2">
                          <button class="btn btn-outline-primary btn-sm" @click="viewDocument(document)">
                            <i class="fas fa-eye me-1"></i>
                            View Document
                          </button>
                          
                          <!-- Individual Approve/Reject Buttons -->
                          <div v-if="document.verification_status === 'pending'" class="btn-group" role="group">
                            <button 
                              class="btn btn-success btn-sm"
                              @click="approveDocument(document)"
                              :disabled="processingDocuments[document.id]"
                            >
                              <span v-if="processingDocuments[document.id] === 'approving'" class="spinner-border spinner-border-sm me-1"></span>
                              <i v-else class="fas fa-check me-1"></i>
                              Approve
                            </button>
                            <button 
                              class="btn btn-danger btn-sm"
                              @click="rejectDocument(document)"
                              :disabled="processingDocuments[document.id]"
                            >
                              <span v-if="processingDocuments[document.id] === 'rejecting'" class="spinner-border spinner-border-sm me-1"></span>
                              <i v-else class="fas fa-times me-1"></i>
                              Reject
                            </button>
                          </div>
                          <div v-else-if="document.verification_status === 'approved'" class="alert alert-success mb-0 py-1">
                            <i class="fas fa-check-circle me-1"></i> Approved
                          </div>
                          <div v-else-if="document.verification_status === 'rejected'" class="alert alert-danger mb-0 py-1">
                            <i class="fas fa-times-circle me-1"></i> Rejected
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          <!-- Show approve/reject buttons only if documents exist and are not all approved -->
          <div v-if="documents && documents.length > 0 && !allDocumentsApproved" class="ms-auto">
            <button
              type="button"
              class="btn btn-danger me-2"
              @click="$emit('reject')"
              :disabled="processing"
            >
              <i class="fas fa-times me-1"></i>
              Reject
            </button>
            <button
              type="button"
              class="btn btn-success"
              @click="$emit('approve')"
              :disabled="processing"
            >
              <span v-if="processing" class="spinner-border spinner-border-sm me-1" role="status"></span>
              <i v-else class="fas fa-check me-1"></i>
              Approve
            </button>
          </div>
          <!-- Show status message when all documents are approved -->
          <div v-else-if="allDocumentsApproved" class="ms-auto">
            <span class="badge bg-success fs-6">
              <i class="fas fa-check me-1"></i>
              All Documents Approved
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Document Viewer Component -->
    <DocumentViewer 
      v-if="selectedDocument" 
      :document="selectedDocument" 
      @close="closeDocumentViewer"
    />
  </div>
</template>

<script>
import DocumentViewer from './DocumentViewer.vue';
import residencyService from '@/services/residencyService';
import api from '@/services/api';

export default {
  name: 'ResidencyDocumentsModal',
  components: {
    DocumentViewer
  },
  props: {
    user: {
      type: Object,
      default: null
    },
    processing: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      documents: [],
      loading: false,
      error: null,
      selectedDocument: null,
      documentBlobUrls: {}, // Store blob URLs for thumbnails
      isDestroyed: false, // Track component lifecycle
      processingDocuments: {} // Track processing state for each document
    };
  },
  watch: {
    user: {
      handler(newUser) {
        if (newUser) {
          this.loadDocuments();
        }
      },
      immediate: true
    }
  },
  computed: {
    // Check if all documents are already approved
    allDocumentsApproved() {
      if (!this.documents || this.documents.length === 0) return false;
      // Check if all documents are approved OR if user's residency verification status is approved
      return this.documents.every(doc => doc.verification_status === 'approved') ||
             this.user?.residency_verification_status === 'approved';
    }
  },
  beforeUnmount() {
    // Mark component as destroyed
    this.isDestroyed = true;

    // Clean up blob URLs to prevent memory leaks
    Object.values(this.documentBlobUrls).forEach(url => {
      URL.revokeObjectURL(url);
    });
  },
  methods: {
    async loadDocuments() {
      if (!this.user || this.isDestroyed) return;

      this.loading = true;
      this.error = null;
      this.documents = [];

      try {
        // Use the actual account ID, not the composite ID
        const accountId = this.user.original_id || this.user.id;

        // Extract numeric ID if it's in format like 'client_32'
        const numericId = typeof accountId === 'string' && accountId.includes('_')
          ? accountId.split('_')[1]
          : accountId;

        const response = await residencyService.getAccountDocuments(numericId);

        // Check if component is still mounted before updating state
        if (this.isDestroyed) return;

        if (response.success) {
          this.documents = response.data || [];
          // Load blob URLs for image documents
          await this.loadDocumentThumbnails();
        } else {
          throw new Error(response.message || 'Failed to load documents');
        }
      } catch (error) {
        console.error('Failed to load residency documents:', error);

        // Check if component is still mounted before updating state
        if (!this.isDestroyed) {
          this.error = error.message || 'Failed to load documents';
        }
      } finally {
        // Check if component is still mounted before updating state
        if (!this.isDestroyed) {
          this.loading = false;
        }
      }
    },

    viewDocument(document) {
      this.selectedDocument = document;
    },

    closeDocumentViewer() {
      this.selectedDocument = null;
    },

    async loadDocumentThumbnails() {
      // Load blob URLs for image documents
      for (const document of this.documents) {
        // Check if component is still mounted
        if (this.isDestroyed) return;

        if (this.isImageDocument(document)) {
          try {
            const response = await api.get(`/residency/documents/${document.id}/file`, {
              responseType: 'blob'
            });

            // Check if component is still mounted before updating state
            if (!this.isDestroyed) {
              const blob = new Blob([response.data], { type: document.mime_type });
              this.documentBlobUrls[document.id] = URL.createObjectURL(blob);
            }
          } catch (error) {
            console.error(`Failed to load thumbnail for document ${document.id}:`, error);
            // Don't set a blob URL, the template will show loading spinner
          }
        }
      }
    },

    isImageDocument(document) {
      const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      return imageTypes.includes(document.mime_type?.toLowerCase());
    },

    getDocumentPreviewUrl(documentId) {
      return residencyService.getDocumentFileUrl(documentId);
    },

    handleImageError(event) {
      console.error('Image failed to load:', event.target.src);
      // You could set a placeholder image here
      event.target.style.display = 'none';
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

    formatDocumentType(type) {
      return residencyService.formatDocumentType(type);
    },

    formatDocumentStatus(status) {
      return residencyService.formatVerificationStatus(status);
    },

    getDocumentStatusBadgeClass(status) {
      return residencyService.getStatusBadgeClass(status);
    },

    getStatusBadgeClass(status) {
      const classes = {
        'active': 'bg-success',
        'inactive': 'bg-secondary',
        'pending': 'bg-warning',
        'suspended': 'bg-danger',
        'pending_verification': 'bg-warning',
        'pending_residency_verification': 'bg-info',
        'residency_rejected': 'bg-danger',
        'residency_approved': 'bg-success',
        'no_residency_documents': 'bg-warning'
      };
      return classes[status] || 'bg-secondary';
    },

    formatStatus(status) {
      return status?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown';
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

    formatFileSize(bytes) {
      if (!bytes) return 'Unknown size';
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(1024));
      return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    },

    async approveDocument(document) {
      if (!confirm(`Are you sure you want to approve this ${this.formatDocumentType(document.document_type)}?`)) {
        return;
      }

      this.processingDocuments[document.id] = 'approving';

      try {
        const response = await residencyService.updateDocumentStatus(document.id, 'approved');
        
        if (response.success) {
          // Wait for next tick before updating to prevent DOM race conditions
          await this.$nextTick();
          
          // Update document status in local array using proper Vue 3 reactivity
          const docIndex = this.documents.findIndex(d => d.id === document.id);
          if (docIndex !== -1) {
            // Create a new object to trigger reactivity properly
            this.documents[docIndex] = {
              ...this.documents[docIndex],
              verification_status: 'approved'
            };
          }

          // Show success message
          this.$toast?.success('Document approved successfully');
          
          // Emit event to parent
          this.$emit('document-approved', document);
        } else {
          throw new Error(response.message || 'Failed to approve document');
        }
      } catch (error) {
        console.error('Failed to approve document:', error);
        this.$toast?.error(error.message || 'Failed to approve document');
      } finally {
        await this.$nextTick();
        delete this.processingDocuments[document.id];
      }
    },

    async rejectDocument(document) {
      if (!confirm(`Are you sure you want to reject this ${this.formatDocumentType(document.document_type)}? The client will be notified to reupload.`)) {
        return;
      }

      this.processingDocuments[document.id] = 'rejecting';

      try {
        const response = await residencyService.updateDocumentStatus(document.id, 'rejected');
        
        if (response.success) {
          // Wait for next tick before updating to prevent DOM race conditions
          await this.$nextTick();
          
          // Update document status in local array using proper Vue 3 reactivity
          const docIndex = this.documents.findIndex(d => d.id === document.id);
          if (docIndex !== -1) {
            // Create a new object to trigger reactivity properly
            this.documents[docIndex] = {
              ...this.documents[docIndex],
              verification_status: 'rejected'
            };
          }

          // Show success message
          this.$toast?.success('Document rejected. Client has been notified.');
          
          // Emit event to parent
          this.$emit('document-rejected', document);
        } else {
          throw new Error(response.message || 'Failed to reject document');
        }
      } catch (error) {
        console.error('Failed to reject document:', error);
        this.$toast?.error(error.message || 'Failed to reject document');
      } finally {
        await this.$nextTick();
        delete this.processingDocuments[document.id];
      }
    }
  }
};
</script>

<style scoped>
.document-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
}

.document-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.document-preview {
  position: relative;
  height: 200px;
  overflow: hidden;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.2s ease;
}

.file-icon-preview {
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
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.document-preview:hover .preview-overlay {
  opacity: 1;
}

.document-preview:hover .preview-image {
  transform: scale(1.05);
}

.loading-preview {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  border-radius: 8px;
}
</style>
