<template>
  <div class="document-viewer-overlay" @click="handleOverlayClick">
    <div class="document-viewer-container" @click.stop>
      <div class="viewer-header">
        <div class="document-info">
          <h4 class="document-title">
            <i :class="getDocumentIcon(document.document_type)" class="me-2"></i>
            {{ formatDocumentType(document.document_type) }}
          </h4>
          <div class="document-meta">
            <span class="filename">{{ document.document_name }}</span>
            <span class="file-size">{{ formatFileSize(document.file_size) }}</span>
            <span class="upload-date">Uploaded: {{ formatDate(document.created_at) }}</span>
          </div>
        </div>
        
        <div class="viewer-controls">
          <button 
            v-if="canZoom" 
            class="btn btn-outline-secondary btn-sm me-2" 
            @click="zoomOut"
            :disabled="zoomLevel <= 0.5"
          >
            <i class="fas fa-search-minus"></i>
          </button>
          
          <span v-if="canZoom" class="zoom-level me-2">{{ Math.round(zoomLevel * 100) }}%</span>
          
          <button 
            v-if="canZoom" 
            class="btn btn-outline-secondary btn-sm me-2" 
            @click="zoomIn"
            :disabled="zoomLevel >= 3"
          >
            <i class="fas fa-search-plus"></i>
          </button>
          
          <button class="btn btn-outline-primary btn-sm me-2" @click="downloadDocument">
            <i class="fas fa-download me-1"></i>
            Download
          </button>
          
          <button class="btn btn-outline-secondary btn-sm" @click="$emit('close')">
            <i class="fas fa-times me-1"></i>
            Close
          </button>
        </div>
      </div>

      <div class="viewer-content" ref="viewerContent">
        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <div class="spinner-border text-primary" role="status">
            <span class="sr-only">Loading...</span>
          </div>
          <p class="mt-2">Loading document...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-state">
          <i class="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
          <h5>Unable to Load Document</h5>
          <p class="text-muted">{{ error }}</p>
          <button class="btn btn-primary" @click="loadDocument">
            <i class="fas fa-redo me-1"></i>
            Try Again
          </button>
        </div>

        <!-- Image Viewer -->
        <div v-else-if="isImage" class="image-viewer">
          <img 
            :src="documentUrl" 
            :alt="document.document_name"
            :style="{ transform: `scale(${zoomLevel})` }"
            class="document-image"
            @load="onImageLoad"
            @error="onImageError"
          />
        </div>

        <!-- PDF Viewer -->
        <div v-else-if="isPDF" class="pdf-viewer">
          <iframe 
            :src="documentUrl" 
            class="pdf-frame"
            @load="onPDFLoad"
            @error="onPDFError"
          ></iframe>
        </div>

        <!-- Unsupported File Type -->
        <div v-else class="unsupported-file">
          <i class="fas fa-file fa-3x text-muted mb-3"></i>
          <h5>Preview Not Available</h5>
          <p class="text-muted">
            This file type cannot be previewed in the browser.
            <br>
            Please download the file to view its contents.
          </p>
          <button class="btn btn-primary" @click="downloadDocument">
            <i class="fas fa-download me-1"></i>
            Download File
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api';

export default {
  name: 'DocumentViewer',
  props: {
    document: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      loading: true,
      error: null,
      documentUrl: null,
      zoomLevel: 1,
      canZoom: false
    };
  },
  computed: {
    isImage() {
      const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      return imageTypes.includes(this.document.mime_type?.toLowerCase());
    },

    isPDF() {
      return this.document.mime_type?.toLowerCase() === 'application/pdf';
    }
  },
  async mounted() {
    await this.loadDocument();
  },
  methods: {
    async loadDocument() {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.get(`/residency/documents/${this.document.id}/file`, {
          responseType: 'blob'
        });

        // Create blob URL for the document
        const blob = new Blob([response.data], { type: this.document.mime_type });
        this.documentUrl = URL.createObjectURL(blob);

        // Enable zoom for images
        this.canZoom = this.isImage;

      } catch (error) {
        console.error('Error loading document:', error);
        this.error = error.response?.data?.message || 'Failed to load document';
      } finally {
        this.loading = false;
      }
    },

    async downloadDocument() {
      try {
        const response = await api.get(`/residency/documents/${this.document.id}/file`, {
          responseType: 'blob'
        });

        // Create download link
        const blob = new Blob([response.data], { type: this.document.mime_type });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = this.document.document_name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

      } catch (error) {
        console.error('Error downloading document:', error);
        // Use a simple alert instead of $toast which might not be available
        alert('Failed to download document');
      }
    },

    handleOverlayClick() {
      this.$emit('close');
    },

    zoomIn() {
      if (this.zoomLevel < 3) {
        this.zoomLevel += 0.25;
      }
    },

    zoomOut() {
      if (this.zoomLevel > 0.5) {
        this.zoomLevel -= 0.25;
      }
    },

    onImageLoad() {
      this.loading = false;
    },

    onImageError() {
      this.error = 'Failed to load image';
      this.loading = false;
    },

    onPDFLoad() {
      this.loading = false;
    },

    onPDFError() {
      this.error = 'Failed to load PDF';
      this.loading = false;
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

    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  },
  
  beforeUnmount() {
    // Clean up blob URL
    if (this.documentUrl) {
      URL.revokeObjectURL(this.documentUrl);
    }
  }
};
</script>

<style scoped>
.document-viewer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1060;
}

.document-viewer-container {
  background: white;
  border-radius: 8px;
  width: 95%;
  height: 95%;
  max-width: 1200px;
  max-height: 900px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.viewer-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fa;
  border-radius: 8px 8px 0 0;
}

.document-title {
  margin: 0;
  color: #495057;
  font-size: 1.25rem;
}

.document-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: #6c757d;
  margin-top: 0.25rem;
}

.viewer-controls {
  display: flex;
  align-items: center;
}

.zoom-level {
  font-size: 0.875rem;
  color: #6c757d;
  min-width: 50px;
  text-align: center;
}

.viewer-content {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: auto;
  background: #f8f9fa;
}

.loading-state,
.error-state,
.unsupported-file {
  text-align: center;
  padding: 2rem;
}

.image-viewer {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: auto;
  padding: 1rem;
}

.document-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: transform 0.2s ease;
  cursor: grab;
}

.document-image:active {
  cursor: grabbing;
}

.pdf-viewer {
  width: 100%;
  height: 100%;
  padding: 1rem;
}

.pdf-frame {
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 4px;
}

@media (max-width: 768px) {
  .document-viewer-container {
    width: 100%;
    height: 100%;
    border-radius: 0;
  }
  
  .viewer-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    border-radius: 0;
  }
  
  .document-meta {
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .viewer-controls {
    width: 100%;
    justify-content: space-between;
  }
  
  .zoom-level {
    order: -1;
  }
}
</style>
