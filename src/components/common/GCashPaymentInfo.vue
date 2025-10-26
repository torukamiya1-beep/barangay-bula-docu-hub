<template>
  <div class="gcash-payment-info">
    <!-- GCash Account Details Card -->
    <div class="card mb-3">
      <div class="card-header bg-primary text-white">
        <h5 class="mb-0">
          <i class="fas fa-mobile-alt me-2"></i>GCash Payment Details
        </h5>
      </div>
      <div class="card-body">
        <div class="row">
          <!-- QR Code -->
          <div class="col-md-6 text-center mb-3">
            <p class="fw-bold mb-2">Scan QR Code:</p>
            <div class="qr-code-container">
              <img
                src="@/gcash/qr_code_gcash.jpg"
                alt="GCash QR Code"
                class="img-fluid qr-code-image"
                style="max-width: 200px; width: 100%; border: 2px solid #007bff; border-radius: 8px; padding: 10px; background: white;"
              />
            </div>
            <p class="text-muted small mt-2">
              <i class="fas fa-info-circle"></i> Open GCash app and scan this QR code
            </p>
          </div>

          <!-- Account Details -->
          <div class="col-md-6">
            <h6 class="fw-bold mb-3">Or send payment to:</h6>

            <div class="mb-3">
              <label class="text-muted small">Mobile Number:</label>
              <div class="d-flex align-items-center">
                <h5 class="mb-0 me-2 text-primary">{{ gcashMobile }}</h5>
                <button
                  class="btn btn-sm btn-outline-primary"
                  @click="copyToClipboard(gcashMobile, 'Mobile number')"
                  title="Copy mobile number"
                >
                  <i class="fas fa-copy"></i>
                </button>
              </div>
            </div>

            <div class="mb-3">
              <label class="text-muted small">Account Name:</label>
              <h6 class="mb-0">{{ gcashName }}</h6>
            </div>

            <div class="mb-3">
              <label class="text-muted small">Amount to Pay:</label>
              <h4 class="mb-0 text-success">₱{{ formattedAmount }}</h4>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Instructions Card -->
    <div class="card mb-3">
      <div class="card-header bg-info text-white">
        <h6 class="mb-0">
          <i class="fas fa-list-ol me-2"></i>Payment Instructions
        </h6>
      </div>
      <div class="card-body">
        <ol class="mb-0">
          <li class="mb-2">
            <strong>Send payment via GCash</strong> using the QR code or mobile number above
          </li>
          <li class="mb-2">
            <strong>Take a screenshot</strong> of your GCash payment confirmation showing:
            <ul class="mt-1">
              <li>Transaction details</li>
              <li>Amount paid (₱{{ formattedAmount }})</li>
              <li>Date and time</li>
              <li>Recipient name ({{ gcashName }})</li>
              <li>Reference number (if available)</li>
            </ul>
          </li>
          <li class="mb-2">
            <strong>Upload the screenshot</strong> using the form below
          </li>
          <li class="mb-2">
            <strong>Wait for verification</strong> - Admin will review your payment proof (usually within 24 hours)
          </li>
          <li class="mb-0">
            <strong>Receive confirmation</strong> - You'll get a notification once approved
          </li>
        </ol>
      </div>
    </div>

    <!-- Important Notes -->
    <div class="alert alert-warning">
      <h6 class="alert-heading">
        <i class="fas fa-exclamation-triangle me-2"></i>Important Notes
      </h6>
      <ul class="mb-0 small">
        <li>Make sure the payment amount matches exactly: <strong>₱{{ formattedAmount }}</strong></li>
        <li>Upload a clear, readable screenshot of your payment confirmation</li>
        <li>Accepted file formats: JPG, PNG, WebP (Max 10MB)</li>
        <li>Your payment will be verified by an administrator before processing</li>
        <li>Keep your GCash transaction reference for your records</li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GCashPaymentInfo',
  props: {
    amount: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      gcashMobile: '09526574063',
      gcashName: 'RHAIJANA ABDILAH'
    };
  },
  computed: {
    formattedAmount() {
      return parseFloat(this.amount).toFixed(2);
    }
  },
  methods: {
    async copyToClipboard(text, label) {
      try {
        await navigator.clipboard.writeText(text);
        this.$toast.success(`${label} copied to clipboard!`);
      } catch (error) {
        console.error('Failed to copy:', error);
        this.$toast.error('Failed to copy to clipboard');
      }
    }
  }
};
</script>

<style scoped>
.gcash-payment-info {
  max-width: 100%;
}

.qr-code-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 15px;
  margin-bottom: 10px;
}

.qr-code-image {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
  max-width: 200px !important;
  width: 100% !important;
  height: auto !important;
}

.qr-code-image:hover {
  transform: scale(1.05);
}

.card-header {
  font-weight: 600;
}

ol li {
  line-height: 1.6;
}

.alert-warning {
  border-left: 4px solid #ffc107;
}

/* Mobile responsive adjustments */
@media (max-width: 768px) {
  .qr-code-image {
    max-width: 150px !important;
  }

  .col-md-6 {
    margin-bottom: 1rem;
  }

  h4, h5 {
    font-size: 1.1rem !important;
  }
}
</style>
