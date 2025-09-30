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
                  <!-- ID Document -->
                  <div v-if="request.authorized_pickup?.id_image_path" class="col-md-6 mb-3">
                    <div class="card h-100 document-card">
                      <!-- Document Preview -->
                      <div class="card-img-top document-preview" @click="viewDocument('pickup-id')">
                        <img
                          v-if="documentBlobUrls['pickup-id']"
                          :src="documentBlobUrls['pickup-id']"
                          alt="Pickup Person ID"
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
                          ID Document
                        </h6>
                        <!-- <span class="badge bg-info">Required</span> -->
                      </div>
                      <div class="card-body">
                        <p class="card-text">
                          <strong>File:</strong> {{ getFileName(request.authorized_pickup?.id_image_path) }}<br>
                          <strong>Type:</strong> Government-issued ID
                        </p>
                        <div class="d-grid">
                          <button class="btn btn-outline-primary btn-sm" @click="viewDocument('pickup-id')">
                            <i class="fas fa-eye me-1"></i>
                            View Document
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Authorization Letter -->
                  <div v-if="request.authorized_pickup?.authorization_letter_path" class="col-md-6 mb-3">
                    <div class="card h-100 document-card">
                      <!-- Document Preview -->
                      <div class="card-img-top document-preview" @click="viewDocument('pickup-auth')">
                        <img
                          v-if="documentBlobUrls['pickup-auth']"
                          :src="documentBlobUrls['pickup-auth']"
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
                        <!-- <span class="badge bg-info">Required</span> -->
                      </div>
                      <div class="card-body">
                        <p class="card-text">
                          <strong>File:</strong> {{ getFileName(request.authorized_pickup?.authorization_letter_path) }}<br>
                          <strong>Type:</strong> Signed authorization letter
                        </p>
                        <div class="d-grid">
                          <button class="btn btn-outline-primary btn-sm" @click="viewDocument('pickup-auth')">
                            <i class="fas fa-eye me-1"></i>
                            View Document
                          </button>
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
  emits: ['verify', 'reject'],
  
  data() {
    return {
      loading: false,
      error: null,
      documentBlobUrls: {}
    };
  },

  computed: {
    hasDocuments() {
      return this.request?.authorized_pickup && (
        this.request.authorized_pickup.id_image_path ||
        this.request.authorized_pickup.authorization_letter_path
      );
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
      if (!this.request || !this.hasDocuments) return;

      this.loading = true;
      this.error = null;
      this.documentBlobUrls = {};

      try {
        // Load ID document
        if (this.request.authorized_pickup?.id_image_path) {
          await this.loadDocument('pickup-id', this.request.authorized_pickup.id_image_path);
        }

        // Load authorization letter
        if (this.request.authorized_pickup?.authorization_letter_path) {
          await this.loadDocument('pickup-auth', this.request.authorized_pickup.authorization_letter_path);
        }
      } catch (error) {
        console.error('Error loading pickup documents:', error);
        this.error = 'Failed to load documents. Please try again.';
      } finally {
        this.loading = false;
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
        const response = await fetch(`http://localhost:7000${webUrl}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        this.documentBlobUrls[type] = url;
        console.log(`Successfully loaded ${type} document`);
      } catch (error) {
        console.error(`Error loading ${type} document:`, error);
        console.error(`Failed URL: http://localhost:7000${this.convertPathToUrl(filename)}`);
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
      let filename = '';
      switch (type) {
        case 'pickup-id':
          filename = this.request.authorized_pickup?.id_image_path;
          break;
        case 'pickup-auth':
          filename = this.request.authorized_pickup?.authorization_letter_path;
          break;
        default:
          return;
      }

      if (!filename) return;

      // Convert database path to web-accessible URL
      const webUrl = this.convertPathToUrl(filename);
      const fullUrl = `http://localhost:7000${webUrl}`;
      console.log(`Opening document: ${fullUrl}`);

      if (webUrl) {
        window.open(fullUrl, '_blank');
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
