<template>
  <div class="image-viewer-overlay" @click="handleOverlayClick">
    <div class="image-viewer-container" @click.stop>
      <div class="viewer-header">
        <div class="image-info">
          <h4 class="image-title">
            <i class="fas fa-image me-2"></i>
            {{ title || 'Document Image' }}
          </h4>
          <div class="image-meta" v-if="showMeta">
            <span class="filename">{{ filename }}</span>
            <span class="image-type">{{ imageType }}</span>
          </div>
        </div>
        
        <div class="viewer-controls">
          <div class="main-controls">
            <button 
              class="btn btn-outline-secondary btn-sm me-2" 
              @click="zoomOut"
              :disabled="zoomLevel <= 0.5"
            >
              <i class="fas fa-search-minus"></i>
            </button>
            
            <span class="zoom-level me-2">{{ Math.round(zoomLevel * 100) }}%</span>
            
            <button 
              class="btn btn-outline-secondary btn-sm me-2" 
              @click="zoomIn"
              :disabled="zoomLevel >= 3"
            >
              <i class="fas fa-search-plus"></i>
            </button>
            
            <button 
              class="btn btn-outline-secondary btn-sm me-2" 
              @click="resetZoom"
            >
              <i class="fas fa-expand-arrows-alt"></i>
            </button>
            
            <button 
              v-if="downloadUrl" 
              class="btn btn-outline-primary btn-sm me-2" 
              @click="downloadImage"
            >
              <i class="fas fa-download me-1"></i>
            </button>
          </div>
          
          <button class="btn btn-outline-secondary btn-sm close-button" @click="$emit('close')">
            <i class="fas fa-times me-1"></i>
            Close
          </button>
        </div>
      </div>

      <div class="viewer-content" ref="viewerContent">
        <!-- Debug Info (only in development) -->
        <div v-if="$root.$data && $root.$data.isDevelopment" class="debug-info">
          <small>Loading: {{ loading }}, Error: {{ error }}, URL: {{ imageUrl ? imageUrl.substring(0, 30) + '...' : 'none' }}</small>
        </div>

        <!-- Loading State -->
        <div v-if="loading && !error" class="loading-state">
          <div class="spinner-border text-primary" role="status">
            <span class="sr-only">Loading...</span>
          </div>
          <p class="mt-2">Loading image...</p>
          <button class="btn btn-outline-secondary btn-sm mt-2" @click="debugImageState">
            <i class="fas fa-bug me-1"></i>
            Debug Info
          </button>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-state">
          <i class="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
          <h5>Unable to Load Image</h5>
          <p class="text-muted">{{ error }}</p>
          <button class="btn btn-primary" @click="retryLoad">
            <i class="fas fa-redo me-1"></i>
            Try Again
          </button>
        </div>

        <!-- Image Display -->
        <div v-show="shouldShowImage" class="image-display">
          <img
            :src="imageUrl"
            :alt="title || 'Document Image'"
            :style="{ transform: `scale(${zoomLevel})` }"
            class="main-image"
            @load="onImageLoad"
            @error="onImageError"
            @wheel="handleWheel"
            @loadstart="onImageLoadStart"
            @loadend="onImageLoadEnd"
            draggable="false"
            ref="mainImage"
          />
        </div>

        <!-- Always render image for debugging (hidden) -->
        <img
          v-if="imageUrl && loading"
          :src="imageUrl"
          style="position: absolute; opacity: 0; pointer-events: none; width: 1px; height: 1px;"
          @load="onImageLoad"
          @error="onImageError"
          ref="hiddenImage"
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ImageViewer',
  props: {
    imageUrl: {
      type: String,
      required: true
    },
    title: {
      type: String,
      default: ''
    },
    filename: {
      type: String,
      default: ''
    },
    imageType: {
      type: String,
      default: ''
    },
    downloadUrl: {
      type: String,
      default: ''
    },
    showMeta: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      loading: true,
      error: null,
      zoomLevel: 1,
      minZoom: 0.5,
      maxZoom: 3,
      zoomStep: 0.25,
      imageLoadAttempts: 0,
      maxLoadAttempts: 3
    };
  },
  computed: {
    shouldShowImage() {
      return !this.loading && !this.error && this.imageUrl;
    }
  },
  watch: {
    imageUrl: {
      handler(newUrl, oldUrl) {
        console.log('🔄 ImageViewer: imageUrl changed:', {
          oldUrl: oldUrl ? oldUrl.substring(0, 50) + '...' : 'none',
          newUrl: newUrl ? newUrl.substring(0, 50) + '...' : 'none',
          isBlobUrl: newUrl?.startsWith('blob:'),
          isDataUrl: newUrl?.startsWith('data:')
        });

        if (newUrl) {
          this.loading = true;
          this.error = null;
          this.imageLoadAttempts = 0;

          // Preload the image manually to ensure it works
          this.preloadImage(newUrl);
        }
      },
      immediate: true
    }
  },
  mounted() {
    // Add keyboard event listeners
    document.addEventListener('keydown', this.handleKeydown);

    // Add touch event listeners for mobile gestures
    this.addTouchListeners();

    // Check if image is already loaded (for cached blob URLs)
    this.$nextTick(() => {
      const img = this.$el?.querySelector('.main-image');
      if (img) {
        console.log('🔍 ImageViewer mounted, checking image state:', {
          src: img.src ? img.src.substring(0, 50) + '...' : 'none',
          complete: img.complete,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight
        });

        // If image is already loaded (cached), update loading state
        if (img.complete && img.naturalWidth > 0) {
          console.log('✅ Image was already loaded, updating state');
          this.loading = false;
          this.error = null;
        } else if (this.imageUrl) {
          // Validate blob URL
          this.validateImageUrl(this.imageUrl);

          // Set multiple timeout checks for robust loading
          setTimeout(() => this.checkImageLoadingState(), 1000);  // Quick check
          setTimeout(() => this.checkImageLoadingState(), 3000);  // Medium check
          setTimeout(() => this.checkImageLoadingState(), 5000);  // Final check
        }
      }
    });
  },
  beforeUnmount() {
    // Remove keyboard event listeners
    document.removeEventListener('keydown', this.handleKeydown);

    // Remove touch event listeners
    this.removeTouchListeners();
  },
  methods: {
    handleOverlayClick() {
      this.$emit('close');
    },

    onImageLoadStart(event) {
      console.log('🔄 ImageViewer: Image load started:', {
        src: event.target.src.substring(0, 50) + '...',
        loadingState: this.loading
      });
    },

    onImageLoadEnd(event) {
      console.log('🏁 ImageViewer: Image load ended:', {
        src: event.target.src.substring(0, 50) + '...',
        complete: event.target.complete,
        naturalWidth: event.target.naturalWidth,
        naturalHeight: event.target.naturalHeight
      });
    },

    onImageLoad(event) {
      console.log('✅ ImageViewer: Image loaded successfully:', {
        src: event.target.src.substring(0, 50) + '...',
        naturalWidth: event.target.naturalWidth,
        naturalHeight: event.target.naturalHeight,
        currentLoadingState: this.loading
      });

      // Force Vue reactivity update
      this.$nextTick(() => {
        this.loading = false;
        this.error = null;
        console.log('✅ ImageViewer: Loading state updated to false');
      });
    },

    onImageError(event) {
      console.error('❌ ImageViewer: Image failed to load:', {
        src: event.target.src.substring(0, 50) + '...',
        error: event.target.error,
        currentLoadingState: this.loading
      });

      // Force Vue reactivity update
      this.$nextTick(() => {
        this.loading = false;
        this.error = 'Failed to load image. The image file may be missing or corrupted.';
        console.log('❌ ImageViewer: Error state updated');
      });
    },

    retryLoad() {
      console.log('🔄 ImageViewer: Retrying image load');
      this.loading = true;
      this.error = null;

      // Force image reload
      const img = this.$el.querySelector('.main-image');
      if (img) {
        // For blob URLs, we can't add query parameters, so force reload differently
        if (this.imageUrl.startsWith('blob:')) {
          console.log('🔄 Retrying blob URL load');
          img.src = '';
          this.$nextTick(() => {
            img.src = this.imageUrl;
          });
        } else {
          console.log('🔄 Retrying regular URL load with cache bust');
          img.src = this.imageUrl + '?t=' + Date.now();
        }
      }
    },

    zoomIn() {
      if (this.zoomLevel < this.maxZoom) {
        this.zoomLevel = Math.min(this.maxZoom, this.zoomLevel + this.zoomStep);
      }
    },

    zoomOut() {
      if (this.zoomLevel > this.minZoom) {
        this.zoomLevel = Math.max(this.minZoom, this.zoomLevel - this.zoomStep);
      }
    },

    resetZoom() {
      this.zoomLevel = 1;
    },

    handleWheel(event) {
      event.preventDefault();
      if (event.deltaY < 0) {
        this.zoomIn();
      } else {
        this.zoomOut();
      }
    },

    handleKeydown(event) {
      switch (event.key) {
        case 'Escape':
          this.$emit('close');
          break;
        case '+':
        case '=':
          event.preventDefault();
          this.zoomIn();
          break;
        case '-':
          event.preventDefault();
          this.zoomOut();
          break;
        case '0':
          event.preventDefault();
          this.resetZoom();
          break;
      }
    },

    async downloadImage() {
      if (!this.downloadUrl) return;

      try {
        // If downloadUrl is already a blob URL, use it directly
        if (this.downloadUrl.startsWith('blob:')) {
          const link = document.createElement('a');
          link.href = this.downloadUrl;
          link.download = this.filename || 'image.jpg';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          // For regular URLs, fetch with authentication
          const api = (await import('@/services/api.js')).default;
          const response = await api.get(this.downloadUrl, { responseType: 'blob' });
          const blob = response.data;
          const url = URL.createObjectURL(blob);

          const link = document.createElement('a');
          link.href = url;
          link.download = this.filename || 'image.jpg';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      } catch (error) {
        console.error('Error downloading image:', error);
        this.$emit('error', 'Failed to download image');
      }
    },

    validateImageUrl(url) {
      console.log('🔍 ImageViewer: Validating image URL:', {
        url: url.substring(0, 50) + '...',
        isBlobUrl: url.startsWith('blob:'),
        isDataUrl: url.startsWith('data:'),
        isHttpUrl: url.startsWith('http')
      });

      // For blob URLs, try to validate they're still valid
      if (url.startsWith('blob:')) {
        try {
          // Create a test image to validate the blob URL
          const testImg = new Image();
          testImg.onload = () => {
            console.log('✅ Blob URL validation: URL is accessible');
          };
          testImg.onerror = () => {
            console.error('❌ Blob URL validation: URL is not accessible');
          };
          testImg.src = url;
        } catch (error) {
          console.error('❌ Blob URL validation error:', error);
        }
      }
    },

    debugImageState() {
      const img = this.$refs.mainImage;
      if (img) {
        console.log('🔍 ImageViewer: Current image state:', {
          src: img.src ? img.src.substring(0, 50) + '...' : 'none',
          complete: img.complete,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          readyState: img.readyState,
          loading: this.loading,
          error: this.error
        });
      } else {
        console.log('🔍 ImageViewer: No image ref found');
      }
    },

    forceImageReload() {
      console.log('🔄 ImageViewer: Force reloading image');
      this.imageLoadAttempts++;

      if (this.imageLoadAttempts > this.maxLoadAttempts) {
        console.error('❌ ImageViewer: Max load attempts reached, giving up');
        this.loading = false;
        this.error = 'Image failed to load after multiple attempts';
        return;
      }

      const img = this.$refs.mainImage;
      const hiddenImg = this.$refs.hiddenImage;

      [img, hiddenImg].forEach(imgEl => {
        if (imgEl && this.imageUrl) {
          // Clear the src and reload
          imgEl.src = '';
          this.$nextTick(() => {
            imgEl.src = this.imageUrl;
            console.log('🔄 ImageViewer: Image src reset and reloaded');
          });
        }
      });
    },

    checkImageLoadingState() {
      if (!this.loading) {
        return; // Already loaded or errored
      }

      const img = this.$refs.mainImage;
      const hiddenImg = this.$refs.hiddenImage;

      // Check both visible and hidden images
      [img, hiddenImg].forEach((imgEl, index) => {
        if (imgEl) {
          const imgType = index === 0 ? 'main' : 'hidden';
          console.log(`🔍 Checking ${imgType} image state:`, {
            complete: imgEl.complete,
            naturalWidth: imgEl.naturalWidth,
            naturalHeight: imgEl.naturalHeight,
            src: imgEl.src ? imgEl.src.substring(0, 30) + '...' : 'none'
          });

          // If image is actually loaded but events didn't fire
          if (imgEl.complete && imgEl.naturalWidth > 0 && this.loading) {
            console.log(`✅ ${imgType} image is loaded but state not updated, fixing...`);
            this.loading = false;
            this.error = null;
            return;
          }
        }
      });

      // If still loading after checks, provide more info
      if (this.loading) {
        console.log('⏰ Image still loading, current state:', {
          loading: this.loading,
          error: this.error,
          imageUrl: this.imageUrl ? this.imageUrl.substring(0, 50) + '...' : 'none',
          attempts: this.imageLoadAttempts
        });
      }
    },

    preloadImage(url) {
      console.log('🔄 ImageViewer: Preloading image manually:', url.substring(0, 50) + '...');

      // Create a new image element for preloading
      const preloadImg = new Image();

      preloadImg.onload = () => {
        console.log('✅ ImageViewer: Preload successful, updating component state');
        this.loading = false;
        this.error = null;

        // Update the actual image elements
        this.$nextTick(() => {
          const img = this.$refs.mainImage;
          const hiddenImg = this.$refs.hiddenImage;

          [img, hiddenImg].forEach(imgEl => {
            if (imgEl && imgEl.src !== url) {
              imgEl.src = url;
            }
          });
        });
      };

      preloadImg.onerror = (error) => {
        console.error('❌ ImageViewer: Preload failed:', error);
        this.loading = false;
        this.error = 'Failed to load image. The image may be corrupted or unavailable.';
      };

      // Start preloading
      preloadImg.src = url;

      // Fallback timeout
      setTimeout(() => {
        if (this.loading) {
          console.log('⏰ Preload timeout, checking if image actually loaded...');
          if (preloadImg.complete && preloadImg.naturalWidth > 0) {
            console.log('✅ Image was loaded but events may have been missed');
            this.loading = false;
            this.error = null;
          }
        }
      }, 10000);
    },

    addTouchListeners() {
      // Add touch gesture support for mobile devices
      const imageDisplay = this.$refs.viewerContent;
      if (imageDisplay) {
        let initialDistance = 0;
        let initialZoom = 1;
        let lastTouchTime = 0;

        // Handle pinch-to-zoom
        imageDisplay.addEventListener('touchstart', (e) => {
          if (e.touches.length === 2) {
            e.preventDefault();
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            initialDistance = Math.hypot(
              touch2.clientX - touch1.clientX,
              touch2.clientY - touch1.clientY
            );
            initialZoom = this.zoomLevel;
          } else if (e.touches.length === 1) {
            // Handle double-tap to reset zoom
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTouchTime;
            if (tapLength < 500 && tapLength > 0) {
              e.preventDefault();
              this.resetZoom();
            }
            lastTouchTime = currentTime;
          }
        }, { passive: false });

        imageDisplay.addEventListener('touchmove', (e) => {
          if (e.touches.length === 2) {
            e.preventDefault();
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const currentDistance = Math.hypot(
              touch2.clientX - touch1.clientX,
              touch2.clientY - touch1.clientY
            );

            const scale = currentDistance / initialDistance;
            const newZoom = Math.max(this.minZoom, Math.min(this.maxZoom, initialZoom * scale));
            this.zoomLevel = newZoom;
          }
        }, { passive: false });
      }
    },

    removeTouchListeners() {
      // Touch listeners are added with anonymous functions, so they'll be cleaned up automatically
      // when the component is destroyed
    }
  }
};
</script>

<style scoped>
.image-viewer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1060;
  backdrop-filter: blur(2px);
  overflow: hidden; /* Prevent scrolling on mobile */
  -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
}

.image-viewer-container {
  background: white;
  border-radius: 8px;
  width: 95%;
  height: 95%;
  max-width: 1400px;
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
  flex-shrink: 0;
}

.image-title {
  margin: 0;
  color: #495057;
  font-size: 1.25rem;
}

.image-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: #6c757d;
  margin-top: 0.25rem;
}

.viewer-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.zoom-level {
  font-size: 0.875rem;
  color: #6c757d;
  min-width: 50px;
  text-align: center;
  font-weight: 500;
}

.viewer-content {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: auto;
  background: #f8f9fa;
  position: relative;
}

.loading-state,
.error-state {
  text-align: center;
  padding: 2rem;
}

.image-display {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: auto;
  padding: 1rem;
}

.main-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: transform 0.2s ease;
  cursor: grab;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.main-image:active {
  cursor: grabbing;
}

.debug-info {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  z-index: 10;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.close-btn-mobile {
  min-height: 44px;
  min-width: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem;
}

/* Tablet responsiveness */
@media (max-width: 768px) {
  .image-viewer-overlay {
    padding: 0;
    /* Ensure full viewport coverage */
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100vw;
    height: 100vh;
  }

  .image-viewer-container {
    width: 100vw;
    height: 100vh;
    border-radius: 0;
    max-width: none;
    max-height: none;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    /* Ensure container takes full space */
    position: relative;
  }

  .viewer-header {
    padding: 1rem;
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    border-radius: 0;
    /* Optimize header height for mobile */
    min-height: auto;
    flex-shrink: 0;
  }

  .image-info {
    width: 100%;
    margin-bottom: 0.5rem;
  }

  .image-title {
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
  }

  .image-meta {
    flex-direction: column;
    gap: 0.25rem;
    font-size: 0.8rem;
  }

  .viewer-controls {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    align-items: stretch;
  }

  .main-controls {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .viewer-controls .btn {
    min-height: 48px; /* Larger touch-friendly size */
    min-width: 48px;
    padding: 0.75rem;
    font-size: 0.9rem;
    border-radius: 8px;
    transition: all 0.2s ease;
  }

  .close-button {
    width: 100%;
    background-color: #dc3545;
    border-color: #dc3545;
    color: white;
    font-weight: 600;
    margin-top: 0.5rem;
  }

  .close-button:hover {
    background-color: #c82333;
    border-color: #bd2130;
  }

  .zoom-level {
    order: -1;
    width: 100%;
    text-align: center;
    margin-bottom: 0.75rem;
    font-size: 1.1rem;
    font-weight: 600;
    background: rgba(0, 123, 255, 0.1);
    padding: 0.5rem;
    border-radius: 6px;
    border: 1px solid rgba(0, 123, 255, 0.2);
  }

  .viewer-content {
    padding: 0;
    flex: 1;
    overflow: hidden;
    /* Ensure content area uses remaining space */
    height: calc(100vh - 120px); /* Account for header height */
  }

  .image-display {
    padding: 0.5rem;
    width: 100%;
    height: 100%;
    overflow: hidden;
    /* Prevent horizontal scrolling */
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .main-image {
    max-width: calc(100vw - 1rem); /* Account for padding */
    max-height: calc(100vh - 140px); /* Account for header and padding */
    width: auto;
    height: auto;
    object-fit: contain;
    /* Prevent image from causing horizontal scroll */
    display: block;
  }
}

/* Mobile phone responsiveness */
@media (max-width: 480px) {
  .image-viewer-overlay {
    padding: 0;
    background-color: rgba(0, 0, 0, 0.95); /* Darker background for better focus */
    /* Ensure full viewport coverage on mobile */
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100vw;
    height: 100vh;
    /* Prevent any scrolling */
    overflow: hidden;
  }

  .image-viewer-container {
    height: 100vh; /* Full viewport height */
    width: 100vw; /* Full viewport width */
    border-radius: 0;
    position: relative;
    /* Remove any margins or padding that could cause issues */
    margin: 0;
    padding: 0;
    /* Ensure container fills entire screen */
    max-width: 100vw;
    max-height: 100vh;
  }

  .viewer-header {
    padding: 0.75rem;
    gap: 0.75rem;
    flex-shrink: 0; /* Prevent header from shrinking */
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(10px);
    /* Set CSS custom property for header height calculation */
    --header-height: 160px;
    min-height: var(--header-height);
  }

  .image-title {
    font-size: 1rem;
    line-height: 1.3;
  }

  .image-meta {
    font-size: 0.75rem;
  }

  .viewer-controls {
    gap: 0.25rem;
  }

  .viewer-controls {
    flex-wrap: wrap;
    gap: 0.75rem;
    justify-content: center;
    width: 100%;
  }

  .main-controls {
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    width: 100%;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }

  .main-controls .btn {
    min-height: 52px; /* Extra large touch targets for phones */
    min-width: 52px;
    padding: 0.875rem;
    font-size: 1rem;
    flex: 1;
    max-width: 80px;
    border-radius: 12px;
    transition: all 0.2s ease;
    font-weight: 500;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .main-controls .btn:active {
    transform: scale(0.92);
    background-color: rgba(0, 123, 255, 0.3);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  }

  .main-controls .btn i {
    font-size: 1.1rem;
  }

  .close-button {
    width: 100%;
    min-height: 52px;
    padding: 0.875rem;
    font-size: 1rem;
    font-weight: 600;
    border-radius: 12px;
    background-color: #dc3545;
    border-color: #dc3545;
    color: white;
    box-shadow: 0 3px 6px rgba(220, 53, 69, 0.3);
    transition: all 0.2s ease;
  }

  .close-button:active {
    transform: scale(0.95);
    background-color: #c82333;
    box-shadow: 0 2px 4px rgba(220, 53, 69, 0.4);
  }

  .zoom-level {
    font-size: 0.9rem;
    margin-bottom: 0.75rem;
    padding: 0.5rem;
    background: rgba(0, 0, 0, 0.05);
    border-radius: 4px;
  }

  .viewer-content {
    padding: 0;
    flex: 1;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    /* Calculate available height more precisely */
    height: calc(100vh - var(--header-height, 160px));
    position: relative;
  }

  .image-display {
    padding: 0.25rem;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    /* Prevent any scrolling */
    position: relative;
  }

  .main-image {
    max-width: calc(100vw - 0.5rem); /* Account for minimal padding */
    max-height: calc(100vh - var(--header-height, 160px) - 0.5rem);
    width: auto;
    height: auto;
    object-fit: contain; /* Ensure image fits without distortion */
    touch-action: pan-x pan-y pinch-zoom; /* Enable touch gestures */
    /* Prevent image from overflowing */
    display: block;
    margin: 0 auto;
    /* Smooth transitions for zoom */
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .loading-state,
  .error-state {
    padding: 1rem;
    text-align: center;
  }

  .loading-state .spinner-border {
    width: 3rem;
    height: 3rem;
  }

  .error-state .btn {
    min-height: 48px;
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
  }

  /* Debug info positioning for mobile */
  .debug-info {
    position: relative;
    top: 0;
    left: 0;
    margin-bottom: 0.5rem;
    font-size: 10px;
  }
}

/* Extra small devices */
@media (max-width: 360px) {
  .viewer-header {
    padding: 0.5rem;
    --header-height: 140px;
    min-height: var(--header-height);
    gap: 0.5rem;
  }

  .image-title {
    font-size: 0.9rem;
    line-height: 1.2;
    margin-bottom: 0.25rem;
  }

  .image-meta {
    font-size: 0.7rem;
    gap: 0.125rem;
  }

  .main-controls {
    gap: 0.25rem;
    margin-bottom: 0.5rem;
  }

  .main-controls .btn {
    padding: 0.625rem 0.5rem;
    font-size: 0.85rem;
    min-height: 48px;
    min-width: 48px;
    max-width: 70px;
  }

  .main-controls .btn .me-1 {
    margin-right: 0.25rem !important;
  }

  .close-button {
    min-height: 48px;
    font-size: 0.9rem;
    padding: 0.75rem;
  }

  .zoom-level {
    font-size: 0.85rem;
    padding: 0.375rem;
    margin-bottom: 0.5rem;
  }

  .viewer-content {
    height: calc(100vh - var(--header-height));
  }

  .main-image {
    max-width: calc(100vw - 0.25rem);
    max-height: calc(100vh - var(--header-height) - 0.25rem);
  }
}

/* Touch device optimizations */
@media (hover: none) and (pointer: coarse) {
  .main-controls .btn {
    min-height: 52px;
    min-width: 52px;
    padding: 0.875rem;
    /* Enhanced touch feedback */
    -webkit-tap-highlight-color: rgba(0, 123, 255, 0.3);
  }

  .close-button {
    min-height: 56px;
    padding: 1rem;
    /* Enhanced close button for touch */
    -webkit-tap-highlight-color: rgba(220, 53, 69, 0.3);
  }

  .viewer-controls .btn:hover {
    background-color: initial; /* Remove hover effects on touch */
  }

  .viewer-controls .btn:active {
    background-color: rgba(0, 123, 255, 0.2);
    transform: scale(0.92);
  }

  .close-button:active {
    background-color: rgba(220, 53, 69, 0.8);
    transform: scale(0.95);
  }

  .main-image {
    touch-action: pan-x pan-y pinch-zoom;
    user-select: none;
    -webkit-user-select: none;
    /* Improve touch responsiveness */
    -webkit-touch-callout: none;
    -webkit-user-drag: none;
  }

  /* Improve zoom level display on touch devices */
  .zoom-level {
    -webkit-tap-highlight-color: transparent;
    user-select: none;
  }
}

/* Landscape orientation on mobile */
@media (max-width: 768px) and (orientation: landscape) {
  .viewer-header {
    padding: 0.5rem 1rem;
    --header-height: 100px;
    min-height: var(--header-height);
    flex-direction: row;
    align-items: center;
    gap: 1rem;
  }

  .image-info {
    flex: 1;
    margin-bottom: 0;
  }

  .image-title {
    font-size: 0.9rem;
    margin-bottom: 0.25rem;
  }

  .image-meta {
    flex-direction: row;
    gap: 0.5rem;
    font-size: 0.75rem;
  }

  .viewer-controls {
    flex-direction: row;
    width: auto;
    gap: 0.5rem;
  }

  .main-controls {
    flex-direction: row;
    margin-bottom: 0;
    gap: 0.25rem;
  }

  .main-controls .btn {
    min-height: 44px;
    min-width: 44px;
    padding: 0.5rem;
    font-size: 0.8rem;
    max-width: 60px;
  }

  .close-button {
    width: auto;
    min-width: 80px;
    margin-top: 0;
    min-height: 44px;
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
  }

  .zoom-level {
    order: 0;
    width: auto;
    margin-bottom: 0;
    margin-right: 0.5rem;
    font-size: 0.8rem;
    padding: 0.25rem 0.5rem;
  }

  .viewer-content {
    height: calc(100vh - var(--header-height));
  }

  .main-image {
    max-height: calc(100vh - var(--header-height) - 0.5rem);
    max-width: calc(100vw - 0.5rem);
  }
}

/* Additional mobile optimizations */
@media (max-width: 768px) {
  /* Prevent zoom on double-tap for better UX */
  .image-viewer-overlay {
    touch-action: manipulation;
  }

  /* Optimize scrolling behavior */
  .viewer-content {
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
  }

  /* Improve button accessibility */
  .viewer-controls .btn {
    /* Ensure buttons are easily tappable */
    position: relative;
    z-index: 1;
  }

  /* Prevent text selection on mobile */
  .viewer-header,
  .viewer-controls {
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  /* Optimize image container for mobile */
  .image-display {
    /* Prevent any potential overflow issues */
    position: relative;
    overflow: hidden;
  }
}
</style>