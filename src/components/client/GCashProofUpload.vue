<template>
  <div class="gcash-proof-upload">
    <!-- Upload Form Card -->
    <div class="card">
      <div class="card-header bg-success text-white">
        <h6 class="mb-0">
          <i class="fas fa-cloud-upload-alt me-2"></i>Upload Payment Proof
        </h6>
      </div>
      <div class="card-body">
        <!-- Status Message (when upload interface is hidden) -->
        <div v-if="uploadInterfaceMessage" class="alert" :class="paymentStatus === 'pending' ? 'alert-warning' : 'alert-success'" role="alert">
          <i :class="paymentStatus === 'pending' ? 'fas fa-clock' : 'fas fa-check-circle'" class="me-2"></i>
          <strong>{{ paymentStatus === 'pending' ? 'Under Review' : 'Verified' }}</strong>
          {{ uploadInterfaceMessage }}
        </div>

        <!-- Upload Interface (only show when appropriate) -->
        <template v-if="canShowUploadInterface">
        <div class="mb-3">
          <label for="referenceNumber" class="form-label">
            GCash Reference Number <span class="text-muted">(Optional)</span>
          </label>
          <input
            id="referenceNumber"
            v-model="referenceNumber"
            type="text"
            class="form-control"
            placeholder="Enter GCash reference number if available"
            :disabled="uploading"
          />
          <small class="text-muted">
            <i class="fas fa-info-circle"></i> You can find this in your GCash transaction history
          </small>
        </div>

        <!-- File Upload Section -->
        <div v-if="!uploading && !selectedFile" class="upload-zone">
          <label for="proofFileInput" class="upload-label">
            <div class="upload-content">
              <i class="fas fa-cloud-upload-alt fa-3x text-primary mb-3"></i>
              <h6>Click to Upload Payment Proof</h6>
              <p class="text-muted small mb-0">
                JPG, PNG, or WebP (Max 10MB)
              </p>
            </div>
          </label>
          <input
            id="proofFileInput"
            type="file"
            class="d-none"
            accept=".jpg,.jpeg,.png,.webp"
            @change="handleFileSelect"
          />
        </div>

        <!-- Upload Progress -->
        <div v-if="uploading" class="upload-progress">
          <div class="d-flex align-items-center justify-content-center mb-3">
            <div class="spinner-border text-primary me-2" role="status"></div>
            <span>Uploading payment proof...</span>
          </div>
          <div class="progress" style="height: 8px;">
            <div 
              class="progress-bar progress-bar-striped progress-bar-animated bg-success" 
              role="progressbar" 
              style="width: 100%"
            ></div>
          </div>
        </div>

        <!-- Preview Selected File -->
        <div v-if="selectedFile && !uploading" class="selected-file-preview">
          <div class="alert alert-info">
            <div class="d-flex align-items-start">
              <i class="fas fa-file-image fa-2x me-3 text-primary"></i>
              <div class="flex-grow-1">
                <h6 class="mb-1">Selected File:</h6>
                <p class="mb-1"><strong>{{ selectedFile.name }}</strong></p>
                <p class="mb-0 small text-muted">
                  Size: {{ formatFileSize(selectedFile.size) }}
                </p>
              </div>
            </div>
          </div>

          <!-- Image Preview -->
          <div v-if="imagePreview" class="mb-3 text-center">
            <img 
              :src="imagePreview" 
              alt="Payment Proof Preview" 
              class="img-fluid preview-image"
              style="max-height: 300px; border: 2px solid #ddd; border-radius: 8px;"
            />
          </div>

          <!-- Action Buttons -->
          <div class="d-flex gap-2 justify-content-center">
            <button
              class="btn btn-success"
              @click="uploadProof"
              :disabled="uploading"
            >
              <i class="fas fa-check me-1"></i>
              Confirm & Upload
            </button>
            <button
              class="btn btn-outline-secondary"
              @click="cancelFileSelection"
              :disabled="uploading"
            >
              <i class="fas fa-times me-1"></i>
              Cancel
            </button>
          </div>
        </div>

        <!-- Success Message -->
        <div v-if="uploadSuccess" class="alert alert-success mt-3">
          <i class="fas fa-check-circle me-2"></i>
          <strong>Success!</strong> Payment proof uploaded successfully. 
          Your payment is now awaiting admin verification.
        </div>

        <!-- Error Message -->
        <div v-if="uploadError" class="alert alert-danger mt-3">
          <i class="fas fa-exclamation-circle me-2"></i>
          <strong>Error:</strong> {{ uploadError }}
        </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import gcashPaymentService from '@/services/gcashPaymentService';

export default {
  name: 'GCashProofUpload',
  props: {
    requestId: {
      type: Number,
      required: true
    },
    isReupload: {
      type: Boolean,
      default: false
    },
    paymentStatus: {
      type: String,
      default: null // null, 'pending', 'verified', 'rejected'
    }
  },
  emits: ['upload-success', 'close'],
  computed: {
    canShowUploadInterface() {
      // Show upload interface if:
      // 1. It's a reupload (rejected status)
      // 2. No payment status (first time upload)
      // 3. Payment status is rejected
      return this.isReupload ||
             this.paymentStatus === null ||
             this.paymentStatus === undefined ||
             this.paymentStatus === 'rejected';
    },

    uploadInterfaceMessage() {
      if (this.paymentStatus === 'pending') {
        return 'Your payment proof is being reviewed by our admin team. Please wait for verification.';
      }
      if (this.paymentStatus === 'verified') {
        return 'Your payment has been verified and approved.';
      }
      return null;
    }
  },
  data() {
    return {
      selectedFile: null,
      imagePreview: null,
      referenceNumber: '',
      uploading: false,
      uploadSuccess: false,
      uploadError: null
    };
  },
  methods: {
    handleFileSelect(event) {
      const file = event.target.files[0];
      if (!file) return;

      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        this.uploadError = 'Invalid file type. Please upload JPG, PNG, or WebP image.';
        return;
      }

      // Validate file size (10MB max)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        this.uploadError = 'File too large. Maximum size is 10MB.';
        return;
      }

      this.selectedFile = file;
      this.uploadError = null;

      // Create image preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    },

    async uploadProof() {
      if (!this.selectedFile) return;

      // Check if user is authenticated
      const authToken = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      if (!authToken) {
        this.uploadError = 'Please log in to upload payment proof.';
        this.$router.push('/login');
        return;
      }

      this.uploading = true;
      this.uploadError = null;
      this.uploadSuccess = false;

      try {
        const refNumber = this.referenceNumber.trim() || null;
        
        let response;
        if (this.isReupload) {
          response = await gcashPaymentService.reuploadPaymentProof(
            this.requestId,
            this.selectedFile,
            refNumber
          );
        } else {
          response = await gcashPaymentService.uploadPaymentProof(
            this.requestId,
            this.selectedFile,
            refNumber
          );
        }

        // Check if upload was successful
        if (response && response.success) {
          this.uploadSuccess = true;
          this.selectedFile = null;
          this.imagePreview = null;
          this.referenceNumber = '';

          // Emit success event to parent - response contains the actual data
          this.$emit('upload-success', response);

          // Show success toast
          if (this.$toast && typeof this.$toast.success === 'function') {
            this.$toast.success(response.message || 'Payment proof uploaded successfully!');
          }

          // Wait a moment then close/refresh
          setTimeout(() => {
            this.$emit('close');
          }, 2000);
        } else {
          // Handle unexpected response format
          throw new Error('Unexpected response format from server');
        }
      } catch (error) {
        console.error('Error uploading payment proof:', error);
        console.error('Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          config: error.config
        });

        // Check if it's an authentication error
        if (error.response?.status === 401) {
          this.uploadError = 'Authentication failed. Please log in again.';
          // Redirect to login
          this.$router.push('/login');
        } else if (error.response?.data) {
          // API returned an error response
          this.uploadError = error.response.data.error || error.response.data.message || 'Failed to upload payment proof. Please try again.';
        } else if (error.message) {
          // Network or other error
          this.uploadError = error.message || 'Failed to upload payment proof. Please try again.';
        } else {
          this.uploadError = 'An unexpected error occurred. Please try again.';
        }

        // Show error toast if available
        if (this.$toast && typeof this.$toast.error === 'function') {
          this.$toast.error(this.uploadError);
        }
      } finally {
        this.uploading = false;
      }
    },

    cancelFileSelection() {
      this.selectedFile = null;
      this.imagePreview = null;
      this.uploadError = null;
      this.referenceNumber = '';
      
      // Reset file input
      const fileInput = document.getElementById('proofFileInput');
      if (fileInput) {
        fileInput.value = '';
      }
    },

    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    }
  }
};
</script>

<style scoped>
.gcash-proof-upload {
  max-width: 100%;
}

.upload-zone {
  border: 2px dashed #007bff;
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  background-color: #f8f9fa;
  transition: all 0.3s ease;
  cursor: pointer;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-zone:hover {
  border-color: #0056b3;
  background-color: #e9ecef;
}

.upload-label {
  display: block;
  cursor: pointer;
  margin: 0;
  width: 100%;
}

.upload-content {
  pointer-events: none;
  width: 100%;
}

.upload-progress {
  padding: 20px;
  text-align: center;
}

.selected-file-preview {
  animation: fadeIn 0.3s ease-in;
}

.preview-image {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
  max-height: 300px;
  width: 100%;
  object-fit: contain;
}

.preview-image:hover {
  transform: scale(1.02);
}

/* Responsive design */
@media (max-width: 768px) {
  .upload-zone {
    padding: 30px 15px;
    min-height: 150px;
  }

  .upload-content h6 {
    font-size: 1rem;
  }

  .preview-image {
    max-height: 200px;
  }

  .d-flex.gap-2 {
    flex-direction: column;
  }

  .d-flex.gap-2 .btn {
    width: 100%;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
