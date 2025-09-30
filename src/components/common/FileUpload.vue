<template>
  <div class="file-upload-component">
    <div class="form-group">
      <label :for="inputId" class="form-label">
        {{ label }}
        <span v-if="required" class="text-danger">*</span>
      </label>
      
      <!-- File input -->
      <div class="file-input-wrapper">
        <input
          :id="inputId"
          type="file"
          :accept="acceptedTypes"
          :required="required"
          class="file-input"
          @change="handleFileSelect"
          ref="fileInput"
        >
        
        <!-- Custom file input display -->
        <div class="file-input-display" @click="triggerFileInput">
          <div v-if="!selectedFile && !uploadedFile" class="file-input-placeholder">
            <i class="fas fa-cloud-upload-alt"></i>
            <span>{{ placeholder }}</span>
            <small class="text-muted d-block mt-1">{{ acceptedTypesText }}</small>
          </div>
          
          <div v-else-if="selectedFile" class="file-selected">
            <i :class="getFileIcon(selectedFile.type)"></i>
            <div class="file-info">
              <span class="file-name">{{ selectedFile.name }}</span>
              <small class="file-size text-muted">{{ formatFileSize(selectedFile.size) }}</small>
            </div>
            <button type="button" class="btn btn-sm btn-outline-danger" @click.stop="removeFile">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div v-else-if="uploadedFile" class="file-uploaded">
            <i class="fas fa-check-circle text-success"></i>
            <div class="file-info">
              <span class="file-name">{{ uploadedFile.name }}</span>
              <small class="text-success">Uploaded successfully</small>
            </div>
            <button type="button" class="btn btn-sm btn-outline-secondary" @click.stop="replaceFile">
              <i class="fas fa-edit"></i> Replace
            </button>
          </div>
        </div>
      </div>
      
      <!-- Upload progress -->
      <div v-if="uploading" class="upload-progress mt-2">
        <div class="progress">
          <div class="progress-bar" :style="{ width: uploadProgress + '%' }"></div>
        </div>
        <small class="text-muted">Uploading... {{ uploadProgress }}%</small>
      </div>
      
      <!-- Error message -->
      <div v-if="errorMessage" class="alert alert-danger mt-2">
        <i class="fas fa-exclamation-triangle"></i>
        {{ errorMessage }}
      </div>
      
      <!-- Help text -->
      <small v-if="helpText" class="form-text text-muted">{{ helpText }}</small>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FileUpload',
  props: {
    label: {
      type: String,
      required: true
    },
    placeholder: {
      type: String,
      default: 'Click to select file or drag and drop'
    },
    required: {
      type: Boolean,
      default: false
    },
    acceptedTypes: {
      type: String,
      default: 'image/*'
    },
    acceptedTypesText: {
      type: String,
      default: 'Accepted: JPEG, PNG, GIF (Max 5MB)'
    },
    helpText: {
      type: String,
      default: ''
    },
    maxSize: {
      type: Number,
      default: 5 * 1024 * 1024 // 5MB
    },
    uploadUrl: {
      type: String,
      default: ''
    },
    autoUpload: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      selectedFile: null,
      uploadedFile: null,
      uploading: false,
      uploadProgress: 0,
      errorMessage: '',
      inputId: `file-input-${Math.random().toString(36).substr(2, 9)}`
    };
  },
  methods: {
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    
    handleFileSelect(event) {
      const file = event.target.files[0];
      if (!file) return;
      
      // Validate file
      const validation = this.validateFile(file);
      if (!validation.valid) {
        this.errorMessage = validation.message;
        return;
      }
      
      this.errorMessage = '';
      this.selectedFile = file;
      this.uploadedFile = null;
      
      // Emit file selected event
      this.$emit('file-selected', file);
      
      // Auto upload if enabled
      if (this.autoUpload && this.uploadUrl) {
        this.uploadFile();
      }
    },
    
    validateFile(file) {
      // Check file size
      if (file.size > this.maxSize) {
        return {
          valid: false,
          message: `File size too large. Maximum size is ${this.formatFileSize(this.maxSize)}.`
        };
      }
      
      // Check file type
      const acceptedTypes = this.acceptedTypes.split(',').map(type => type.trim());
      const isValidType = acceptedTypes.some(type => {
        if (type === 'image/*') {
          return file.type.startsWith('image/');
        }
        if (type === 'application/*') {
          return file.type.startsWith('application/');
        }
        return file.type === type;
      });
      
      if (!isValidType) {
        return {
          valid: false,
          message: 'Invalid file type. ' + this.acceptedTypesText
        };
      }
      
      return { valid: true };
    },
    
    async uploadFile() {
      if (!this.selectedFile || !this.uploadUrl) return;
      
      this.uploading = true;
      this.uploadProgress = 0;
      this.errorMessage = '';
      
      try {
        const formData = new FormData();
        formData.append('file', this.selectedFile);
        
        const response = await this.$http.post(this.uploadUrl, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            this.uploadProgress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
          }
        });
        
        if (response.data.success) {
          this.uploadedFile = {
            name: this.selectedFile.name,
            ...response.data.data
          };
          this.selectedFile = null;
          this.$emit('upload-success', this.uploadedFile);
        } else {
          throw new Error(response.data.message || 'Upload failed');
        }
        
      } catch (error) {
        this.errorMessage = error.response?.data?.message || error.message || 'Upload failed';
        this.$emit('upload-error', error);
      } finally {
        this.uploading = false;
        this.uploadProgress = 0;
      }
    },
    
    removeFile() {
      this.selectedFile = null;
      this.uploadedFile = null;
      this.errorMessage = '';
      this.$refs.fileInput.value = '';
      this.$emit('file-removed');
    },
    
    replaceFile() {
      this.uploadedFile = null;
      this.triggerFileInput();
    },
    
    getFileIcon(mimeType) {
      if (mimeType.startsWith('image/')) {
        return 'fas fa-image text-primary';
      } else if (mimeType === 'application/pdf') {
        return 'fas fa-file-pdf text-danger';
      } else if (mimeType.includes('word')) {
        return 'fas fa-file-word text-primary';
      } else {
        return 'fas fa-file text-secondary';
      }
    },
    
    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
  }
};
</script>

<style scoped>
.file-upload-component {
  margin-bottom: 1rem;
}

.file-input-wrapper {
  position: relative;
}

.file-input {
  display: none;
}

.file-input-display {
  border: 2px dashed #dee2e6;
  border-radius: 0.375rem;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #f8f9fa;
}

.file-input-display:hover {
  border-color: #0d6efd;
  background-color: #e7f1ff;
}

.file-input-placeholder i {
  font-size: 2rem;
  color: #6c757d;
  margin-bottom: 0.5rem;
  display: block;
}

.file-selected,
.file-uploaded {
  display: flex;
  align-items: center;
  gap: 1rem;
  text-align: left;
  background-color: white;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  padding: 1rem;
}

.file-selected i,
.file-uploaded i {
  font-size: 1.5rem;
}

.file-info {
  flex: 1;
}

.file-name {
  font-weight: 500;
  display: block;
}

.file-size {
  font-size: 0.875rem;
}

.upload-progress {
  margin-top: 0.5rem;
}

.progress {
  height: 0.5rem;
  background-color: #e9ecef;
  border-radius: 0.25rem;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background-color: #0d6efd;
  transition: width 0.3s ease;
}
</style>
