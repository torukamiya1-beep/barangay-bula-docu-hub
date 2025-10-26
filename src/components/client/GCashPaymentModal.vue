<template>
  <!-- Modal Backdrop -->
  <div
    v-if="modalId && modalId.trim() !== ''"
    class="modal-backdrop fade show"
    @click="closeModal"
    style="z-index: 1055;"
  ></div>

  <!-- Modal Container -->
  <div
    v-if="modalId && modalId.trim() !== ''"
    class="modal fade show d-block"
    :id="modalId"
    tabindex="-1"
    role="dialog"
    aria-labelledby="gcashPaymentModalLabel"
    aria-hidden="true"
    style="z-index: 1056; position: fixed; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;"
  >
    <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable" role="document">
      <div class="modal-content" style="max-height: 90vh; overflow-y: auto;">
        <!-- Modal Header -->
        <div class="modal-header bg-primary text-white">
          <h5 class="modal-title" id="gcashPaymentModalLabel">
            <i class="fas fa-mobile-alt me-2"></i>
            GCash Payment - Request #{{ requestNumber }}
          </h5>
          <button
            type="button"
            class="btn-close btn-close-white"
            @click="closeModal"
            aria-label="Close"
          ></button>
        </div>

        <!-- Modal Body -->
        <div class="modal-body">
          <div class="container-fluid">
            <!-- Payment Status Alert -->
            <div v-if="paymentStatus" class="alert" :class="statusAlertClass" role="alert">
              <i :class="statusIconClass + ' me-2'"></i>
              <strong>{{ statusTitle }}</strong> {{ statusMessage }}
            </div>

            <div class="row">
              <!-- Left Column: Payment Info -->
              <div class="col-lg-6 col-md-12 mb-4">
                <GCashPaymentInfo :amount="amount" />
              </div>

              <!-- Right Column: Upload Proof -->
              <div class="col-lg-6 col-md-12 mb-4">
                <GCashProofUpload
                  :request-id="requestId"
                  :is-reupload="isReupload"
                  :payment-status="paymentStatus"
                  @upload-success="handleUploadSuccess"
                  @close="closeModal"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="closeModal">
            <i class="fas fa-times me-1"></i>Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import GCashPaymentInfo from '@/components/common/GCashPaymentInfo.vue';
import GCashProofUpload from '@/components/client/GCashProofUpload.vue';

export default {
  name: 'GCashPaymentModal',
  components: {
    GCashPaymentInfo,
    GCashProofUpload
  },
  props: {
    modalId: {
      type: String,
      default: 'gcashPaymentModal'
    },
    requestId: {
      type: Number,
      required: true
    },
    requestNumber: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    paymentStatus: {
      type: String,
      default: null // null, 'pending', 'verified', 'rejected'
    },
    isReupload: {
      type: Boolean,
      default: false
    }
  },
  emits: ['uploadSuccess', 'close'],
  computed: {
    statusAlertClass() {
      const classes = {
        pending: 'alert-warning',
        verified: 'alert-success',
        rejected: 'alert-danger'
      };
      return classes[this.paymentStatus] || 'alert-info';
    },
    statusIconClass() {
      const icons = {
        pending: 'fas fa-clock',
        verified: 'fas fa-check-circle',
        rejected: 'fas fa-times-circle'
      };
      return icons[this.paymentStatus] || 'fas fa-info-circle';
    },
    statusTitle() {
      const titles = {
        pending: 'Pending Verification',
        verified: 'Payment Verified',
        rejected: 'Payment Rejected'
      };
      return titles[this.paymentStatus] || 'Payment Required';
    },
    statusMessage() {
      const messages = {
        pending: 'Your payment proof is being reviewed by our admin team.',
        verified: 'Your payment has been verified and approved.',
        rejected: 'Your payment proof was rejected. Please reupload a valid proof.'
      };
      return messages[this.paymentStatus] || 'Please complete your GCash payment and upload proof.';
    }
  },
  mounted() {
    // Modal will show automatically when modalId is set via CSS classes
    console.log('GCash Payment Modal mounted with ID:', this.modalId);
  },
  methods: {
    handleUploadSuccess(data) {
      console.log('Payment proof uploaded successfully:', data);
      this.$emit('upload-success', data);
    },
    closeModal() {
      console.log('Closing GCash modal');
      this.$emit('close');
    }
  }
};
</script>

<style scoped>
/* Global modal styles to ensure proper z-index stacking */
:global(.modal) {
  z-index: 1056 !important;
}

:global(.modal-backdrop) {
  z-index: 1055 !important;
}

:global(.modal-content) {
  z-index: 1057 !important;
}

:global(.modal-header) {
  z-index: 1058 !important;
}

:global(.modal-body) {
  z-index: 1057 !important;
}

:global(.modal-footer) {
  z-index: 1057 !important;
}

/* Prevent any text overlapping */
:global(.modal-body .row) {
  display: flex !important;
  flex-wrap: wrap !important;
  gap: 1rem !important;
}

:global(.modal-body .col-lg-6) {
  flex: 1 !important;
  min-width: 250px !important;
  word-wrap: break-word !important;
  overflow-wrap: break-word !important;
}

/* Ensure proper text sizing */
:global(.modal-body h4) {
  font-size: 1.25rem !important;
  line-height: 1.4 !important;
}

:global(.modal-body h5) {
  font-size: 1.1rem !important;
  line-height: 1.4 !important;
}

:global(.modal-body .qr-code-image) {
  max-width: 200px !important;
  width: 100% !important;
  height: auto !important;
}

/* Modal Container */
.modal {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
  z-index: 1056 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  background: transparent !important;
}

.modal.show {
  display: flex !important;
}

/* Modal Backdrop */
.modal-backdrop {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
  background-color: rgba(0, 0, 0, 0.5) !important;
  z-index: 1055 !important;
}

.modal-backdrop.show {
  opacity: 1 !important;
}

/* Modal Dialog */
.modal-dialog {
  position: relative !important;
  max-width: 90vw !important;
  max-height: 90vh !important;
  margin: 0 !important;
  z-index: 1057 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.modal-dialog-centered {
  min-height: calc(100vh - 1rem) !important;
}

.modal-dialog-scrollable .modal-content {
  max-height: 90vh !important;
  overflow-y: auto !important;
}

/* Modal Content */
.modal-content {
  border: none !important;
  border-radius: 1rem !important;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
  background: white !important;
  width: 100% !important;
  max-width: 1200px !important;
}

/* Modal Header */
.modal-header {
  border-bottom: 2px solid rgba(255, 255, 255, 0.2) !important;
  padding: 1.5rem 2rem !important;
  border-radius: 1rem 1rem 0 0 !important;
}

.modal-header.bg-primary {
  background: linear-gradient(135deg, #3182ce 0%, #2c5aa0 100%) !important;
}

.modal-title {
  font-size: 1.5rem !important;
  font-weight: 600 !important;
  margin: 0 !important;
  color: white !important;
}

.btn-close-white {
  filter: invert(1) !important;
  opacity: 0.8 !important;
}

.btn-close-white:hover {
  opacity: 1 !important;
}

/* Modal Body */
.modal-body {
  background-color: #f8f9fa !important;
  padding: 2rem !important;
  max-height: 70vh !important;
  overflow-y: auto !important;
}

.modal-body::-webkit-scrollbar {
  width: 8px !important;
}

.modal-body::-webkit-scrollbar-track {
  background: #f1f1f1 !important;
  border-radius: 4px !important;
}

.modal-body::-webkit-scrollbar-thumb {
  background: #c1c1c1 !important;
  border-radius: 4px !important;
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8 !important;
}

/* Alert Styles */
.alert {
  border-left: 4px solid !important;
  border-radius: 0.5rem !important;
  padding: 1rem 1.5rem !important;
  margin-bottom: 1.5rem !important;
  font-size: 1rem !important;
}

.alert-warning {
  border-left-color: #ffc107 !important;
  background-color: #fff8e1 !important;
  color: #856404 !important;
}

.alert-success {
  border-left-color: #28a745 !important;
  background-color: #d4edda !important;
  color: #155724 !important;
}

.alert-danger {
  border-left-color: #dc3545 !important;
  background-color: #f8d7da !important;
  color: #721c24 !important;
}

.alert-info {
  border-left-color: #17a2b8 !important;
  background-color: #d1ecf1 !important;
  color: #0c5460 !important;
}

/* Modal Footer */
.modal-footer {
  border-top: 1px solid #e9ecef !important;
  padding: 1.5rem 2rem !important;
  border-radius: 0 0 1rem 1rem !important;
  background: white !important;
}

.modal-footer .btn {
  padding: 0.75rem 1.5rem !important;
  font-weight: 500 !important;
  border-radius: 0.5rem !important;
  transition: all 0.2s !important;
}

.modal-footer .btn:hover {
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15) !important;
}

/* Responsive Design */
@media (max-width: 768px) {
  .modal-dialog {
    max-width: 95vw !important;
    margin: 0.5rem !important;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 1rem !important;
  }

  .modal-title {
    font-size: 1.25rem !important;
  }

  .col-lg-6 {
    width: 100% !important;
    margin-bottom: 1.5rem !important;
  }

  .row {
    margin: 0 !important;
  }

  .row > * {
    padding: 0 !important;
  }
}

/* Prevent text overlapping */
.modal-body .row {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.modal-body .col-lg-6 {
  flex: 1;
  min-width: 250px;
}

/* Ensure proper spacing */
.qr-code-container {
  margin-bottom: 1rem;
}

.mb-3 {
  margin-bottom: 1rem !important;
}

.mb-4 {
  margin-bottom: 1.5rem !important;
}

/* Animation */
.modal.fade .modal-dialog {
  transition: transform 0.3s ease-out !important;
  transform: translate(0, -50px) !important;
}

.modal.show .modal-dialog {
  transform: translate(0, 0) !important;
}
</style>
