<template>
  <div class="request-details-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-main">
          <h1 class="page-title">
            <i class="fas fa-file-alt"></i>
            Request Details
          </h1>
          <p class="page-description">
            View detailed information about your document request
          </p>
        </div>
        <div class="header-actions">
          <button class="back-btn" @click="goBack">
            <i class="fas fa-arrow-left"></i>
            Back to Requests
          </button>
        </div>
      </div>
    </div>

    <!-- Page Content -->
    <div class="page-content">
      <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
      </div>
      <p>Loading request details...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="error-content">
        <i class="fas fa-exclamation-triangle"></i>
        <h3>Unable to Load Request</h3>
        <p>{{ error }}</p>
        <button class="retry-btn" @click="loadRequestDetails">
          <i class="fas fa-redo"></i>
          Try Again
        </button>
      </div>
    </div>

    <!-- Request Details -->
    <div v-else-if="request" class="request-container">
      <!-- Request Overview -->
      <div class="request-overview">
        <div class="overview-header">
          <div class="request-type">
            <i :class="getDocumentIcon(request.document_type)"></i>
            <div>
              <h2>{{ request.document_type }}</h2>
              <p class="request-id">Request #{{ request.id.toString().padStart(6, '0') }}</p>
            </div>
          </div>
          <div class="request-status">
            <span class="status-badge" :class="getStatusClass(request.status)">
              {{ formatStatus(request.status) }}
            </span>
          </div>
        </div>

        <div class="overview-grid">
          <div class="overview-item">
            <label>Submitted Date:</label>
            <span>{{ formatDate(request.created_at) }}</span>
          </div>
          <div class="overview-item">
            <label>Last Updated:</label>
            <span>{{ formatDate(request.updated_at) }}</span>
          </div>
          <div class="overview-item">
            <label>Purpose:</label>
            <span>{{ request.purpose_category || 'Not specified' }}</span>
          </div>
          <div class="overview-item">
            <label>Total Fee:</label>
            <span class="amount">₱{{ formatCurrency(request.total_fee) }}</span>
          </div>
        </div>

        <!-- Progress Timeline -->
        <div class="progress-timeline">
          <h3>Request Progress</h3>

          <!-- Main Timeline -->
          <div class="timeline">
            <div
              v-for="(step, index) in getMainTimelineSteps()"
              :key="index"
              class="timeline-item"
              :class="{
                active: step.status === request.status,
                completed: isStepCompleted(step.status, request.status)
              }"
            >
              <div class="timeline-icon">
                <i :class="step.icon"></i>
              </div>
              <div class="timeline-content">
                <h4>{{ step.title }}</h4>
                <p>{{ step.description }}</p>
                <span v-if="step.status === request.status" class="timeline-date">
                  {{ formatDate(request.updated_at) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Rejection Branch (only show if rejected) -->
          <div v-if="request.status === 'rejected'" class="rejection-branch">
            <div class="branch-connector"></div>
            <div class="timeline-item rejected active">
              <div class="timeline-icon">
                <i class="fas fa-times-circle"></i>
              </div>
              <div class="timeline-content">
                <h4>Request Rejected</h4>
                <p>Your request has been rejected by our staff</p>
                <span class="timeline-date">{{ formatDate(request.updated_at) }}</span>
                <div v-if="request.rejection_reason" class="rejection-reason">
                  <i class="fas fa-info-circle"></i>
                  <strong>Reason:</strong> {{ request.rejection_reason }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Request Information -->
      <div class="request-info-section">
        <h3>Request Information</h3>
        
        <!-- Personal Information -->
        <div class="info-card">
          <h4>
            <i class="fas fa-user me-2"></i>
            Requestor Information
          </h4>
          <div class="info-grid">
            <div class="info-item">
              <label>Full Name:</label>
              <span>{{ getFullName() }}</span>
            </div>
            <div class="info-item">
              <label>Username:</label>
              <span>{{ getClientUsername() || 'Not provided' }}</span>
            </div>
            <div class="info-item" v-if="getClientEmail()">
              <label>Email:</label>
              <span>{{ getClientEmail() }}</span>
            </div>

            <!-- I will comment the email for now -->
            <!-- <div class="info-item">
              <label>Email Verified:</label>
              <span class="badge" :class="getClientEmailVerified() ? 'bg-success' : 'bg-warning'">
                {{ getClientEmailVerified() ? 'Verified' : 'Not Verified' }}
              </span>
            </div> -->
            <div class="info-item">
              <label>Phone:</label>
              <span>{{ getClientPhone() }}</span>
            </div>

            <!-- I will comment the Phone for now -->
            <!-- <div class="info-item">
              <label>Phone Verified:</label>
              <span class="badge" :class="getClientPhoneVerified() ? 'bg-success' : 'bg-warning'">
                {{ getClientPhoneVerified() ? 'Verified' : 'Not Verified' }}
              </span>
            </div> -->

            <div class="info-item">
              <label>Date of Birth:</label>
              <span>{{ formatDate(getClientBirthDate()) || 'Not provided' }}</span>
            </div>
            <div class="info-item">
              <label>Gender:</label>
              <span>{{ formatGender(getClientGender()) || 'Not provided' }}</span>
            </div>
            <div class="info-item">
              <label>Civil Status:</label>
              <span>{{ getCivilStatusName(getClientCivilStatus()) || 'Not provided' }}</span>
            </div>
            <div class="info-item">
              <label>Nationality:</label>
              <span v-if="request && request.requestor">{{ request.requestor.nationality || 'Not provided' }}</span>
            </div>
            <div class="info-item">
              <label>Address:</label>
              <span v-if="request && request.requestor">{{ request.requestor.address || 'Not provided' }}</span>
            </div>

            <div class="info-item">
              <label>Years of Residency:</label>
              <span>{{ getResidencyDisplay() || 'Not provided' }}</span>
            </div>

            <!-- I will comment the Profile Verified for now -->
            <!-- <div class="info-item">
              <label>Profile Verified:</label>
              <span class="badge" :class="getClientProfileVerified() ? 'bg-success' : 'bg-warning'">
                {{ getClientProfileVerified() ? 'Verified' : 'Pending Verification' }}
              </span>
            </div> -->

            <!-- I will comment the Residency Verified for now -->
            <!-- <div class="info-item">
              <label>Residency Verified:</label>
              <span class="badge" :class="getClientResidencyVerified() ? 'bg-success' : 'bg-warning'">
                {{ getClientResidencyVerified() ? 'Verified' : 'Pending Verification' }}
              </span>
            </div> -->

            <!-- I will comment the Account Status for now -->
            <!-- <div class="info-item">
              <label>Account Status:</label>
              <span class="badge" :class="getClientAccountStatusClass()">
                {{ formatAccountStatus(getClientAccountStatus()) }}
              </span>
            </div> -->

            <div v-if="getClientLastLogin()" class="info-item">
              <label>Last Login:</label>
              <span>{{ formatDate(getClientLastLogin()) }}</span>
            </div>

            <!-- I will comment the Account Created for now -->
            <!-- <div class="info-item">
              <label>Account Created:</label>
              <span>{{ formatDate(getClientCreatedAt()) || 'Not available' }}</span>
            </div> -->

          </div>
        </div>

        <!-- Beneficiary Information (for "For Someone Else" requests) -->
        <div v-if="request.is_third_party_request && request.beneficiary" class="info-card">
          <h4>
            <i class="fas fa-user-friends me-2"></i>
            Beneficiary Information (For Someone Else)
          </h4>
          <div class="info-grid">
            <div class="info-item">
              <label>Full Name:</label>
              <span>{{ getBeneficiaryFullName() }}</span>
            </div>
            <div class="info-item">
              <label>Relationship to Requestor:</label>
              <span>{{ request.beneficiary.relationship_to_requestor || 'Not specified' }}</span>
            </div>
            <div class="info-item">
              <label>Email:</label>
              <span>{{ request.beneficiary.email || 'Not provided' }}</span>
            </div>
            <div class="info-item">
              <label>Phone:</label>
              <span>{{ request.beneficiary.phone_number || 'Not provided' }}</span>
            </div>
            <div class="info-item">
              <label>Date of Birth:</label>
              <span>{{ formatDate(request.beneficiary.birth_date) || 'Not provided' }}</span>
            </div>
            <div class="info-item">
              <label>Gender:</label>
              <span>{{ formatGender(request.beneficiary.gender) || 'Not provided' }}</span>
            </div>
            <div class="info-item">
              <label>Civil Status:</label>
              <span>{{ getCivilStatusName(request.beneficiary.civil_status_id) || 'Not provided' }}</span>
            </div>
            <div class="info-item">
              <label>Nationality:</label>
              <span>{{ request.beneficiary.nationality || 'Not provided' }}</span>
            </div>
            <div class="info-item">
              <label>Address:</label>
              <span>{{ getBeneficiaryAddress() }}</span>
            </div>

            <div v-if="request.beneficiary.verification_image_path" class="info-item">
              <label>Verification Document:</label>
              <div class="verification-image-container">
                <img
                  v-if="imageUrls.beneficiaryVerification"
                  :src="imageUrls.beneficiaryVerification"
                  :alt="request.beneficiary.verification_image_name || 'Verification Document'"
                  class="verification-image"
                  @click="openImageModal(request.beneficiary.verification_image_path, request.beneficiary.verification_image_name, 'beneficiaries')"
                  @error="handleImageError($event, 'beneficiary verification')"
                  @load="handleImageLoad($event, 'beneficiary verification')"
                >
                <div v-else class="image-loading">
                  <i class="fas fa-spinner fa-spin"></i>
                  <span>Loading image...</span>
                </div>

                <!-- I will comment the Verification Status for now -->
                <!-- <div class="verification-status">
                  <span class="badge" :class="getVerificationStatusClass(request.beneficiary.verification_status)">
                    {{ formatVerificationStatus(request.beneficiary.verification_status) }}
                  </span>
                </div> -->
              </div>
            </div>

          </div>
        </div>

        <!-- Document Specific Information -->
        <div class="info-card">
          <h4>{{ request.document_type }} Details</h4>
          <div class="info-grid">
            <div class="info-item">
              <label>Purpose Category:</label>
              <span>{{ request.purpose_category || 'Not specified' }}</span>
            </div>

            <!-- I will comment purpose details for now  -->
            <!-- <div class="info-item">
              <label>Purpose Details:</label>
              <span>{{ request.purpose_details || 'General purpose' }}</span>
            </div> -->

            <!-- Barangay Clearance specific fields -->
            <template v-if="request.document_type === 'Barangay Clearance'">
              <div class="info-item" v-if="getEmergencyContact()">
                <label>Emergency Contact:</label>
                <span>{{ getEmergencyContact() }}</span>
              </div>
              <div class="info-item" v-if="getEmergencyPhone()">
                <label>Emergency Phone:</label>
                <span>{{ getEmergencyPhone() }}</span>
              </div>
              <div class="info-item">
                <label>Pending Cases:</label>
                <span>{{ request.has_pending_cases ? 'Yes' : 'No' }}</span>
              </div>
            </template>

            <!-- Cedula specific fields -->
            <template v-if="request.document_type === 'Cedula' && request.specific_details">
              <div class="info-item">
                <label>Annual Income:</label>
                <span>₱{{ formatCurrency(request.specific_details.annual_income) }}</span>
              </div>

              <!-- I will not show this in frontend  -->
              <!-- <div class="info-item">
                <label>Income Source:</label>
                <span>{{ request.specific_details.income_source || 'Not specified' }}</span>
              </div> -->

              <!-- I will not show this in frontend  -->
              <!-- <div class="info-item">
                <label>Real Property:</label>
                <span>{{ request.specific_details.has_real_property ? 'Yes' : 'No' }}</span>
              </div> -->

              <!-- I will not show this in frontend  -->
              <!-- <div v-if="request.specific_details.has_real_property" class="info-item">
                <label>Property Value:</label>
                <span>₱{{ formatCurrency(request.specific_details.property_value) }}</span>
              </div> -->
              <div v-if="request.specific_details.business_name" class="info-item">
                <label>Business Name:</label>
                <span>{{ request.specific_details.business_name }}</span>
              </div>
            </template>
          </div>
        </div>

        <!-- Property Information Section (for Cedula only) -->
        <div v-if="request.document_type === 'Cedula' && request.specific_details" class="info-card">
          <h4>
            <i class="fas fa-home me-2"></i>
            Property Information
          </h4>
          <div class="info-grid">
            <div class="info-item">
              <label>Assessed Property Value:</label>
              <span>₱{{ formatCurrency(request.specific_details.property_assessed_value || 0) }}</span>
            </div>
            <div v-if="request.specific_details.property_location" class="info-item">
              <label>Property Location:</label>
              <span>{{ request.specific_details.property_location }}</span>
            </div>
            <div class="info-item">
              <label>Personal Property Value:</label>
              <span>₱{{ formatCurrency(request.specific_details.personal_property_value || 0) }}</span>
            </div>
          </div>
        </div>

        <!-- Business Information Section (for Cedula only) -->
        <div v-if="request.document_type === 'Cedula' && request.specific_details && (request.specific_details.business_name || request.specific_details.business_gross_receipts > 0)" class="info-card">
          <h4>
            <i class="fas fa-briefcase me-2"></i>
            Business/Professional Information
          </h4>
          <div class="info-grid">
            <div v-if="request.specific_details.business_name" class="info-item">
              <label>Business Name:</label>
              <span>{{ request.specific_details.business_name }}</span>
            </div>
            <div v-if="request.specific_details.business_type" class="info-item">
              <label>Business Type:</label>
              <span>{{ request.specific_details.business_type }}</span>
            </div>
            <div class="info-item">
              <label>Annual Gross Receipts/Professional Fees:</label>
              <span>₱{{ formatCurrency(request.specific_details.business_gross_receipts || 0) }}</span>
            </div>
            <div v-if="request.specific_details.business_address" class="info-item">
              <label>Business Address:</label>
              <span>{{ request.specific_details.business_address }}</span>
            </div>
          </div>
        </div>

        <!-- I will not show the Tax Computation in frontend  -->
        <!-- Tax Computation Section (for Cedula only) -->
        <!-- <div v-if="request.document_type === 'Cedula' && request.specific_details" class="info-card">
          <h4>
            <i class="fas fa-calculator me-2"></i>
            Tax Computation
          </h4>
          <div class="info-grid">
            <div class="info-item">
              <label>Computed Tax:</label>
              <span>₱{{ formatCurrency(request.specific_details.computed_tax || 0) }}</span>
            </div>
            <div class="info-item">
              <label>Total Document Fee:</label>
              <span class="text-success fw-bold">₱{{ formatCurrency(request.total_document_fee || 0) }}</span>
            </div>
          </div>
        </div> -->
      </div>

        <!-- Authorized Pickup Person Information -->
        <div v-if="request.authorized_pickup" class="info-card">
          <h4>
            <i class="fas fa-user-check me-2"></i>
            Authorized Pickup Person
          </h4>
          <div class="info-grid">
            <div class="info-item">
              <label>Full Name:</label>
              <span>{{ getAuthorizedPickupFullName() }}</span>
            </div>
            <div class="info-item">
              <label>Relationship to Beneficiary:</label>
              <span>{{ request.authorized_pickup.relationship_to_beneficiary || 'Not specified' }}</span>
            </div>
            <div class="info-item">
              <label>Phone Number:</label>
              <span>{{ request.authorized_pickup.phone_number || 'Not provided' }}</span>
            </div>
            
            <!-- I will comment the Email for now -->
            <!-- <div class="info-item">
              <label>Email:</label>
              <span>{{ request.authorized_pickup.email || 'Not provided' }}</span>
            </div> -->

            <!-- I will comment the ID Type for now -->
            <!-- <div v-if="request.authorized_pickup.id_type" class="info-item">
              <label>ID Type:</label>
              <span>{{ request.authorized_pickup.id_type }}</span>
            </div>
            <div v-if="request.authorized_pickup.id_number" class="info-item">
              <label>ID Number:</label>
              <span>{{ request.authorized_pickup.id_number }}</span>
            </div>
            <div v-if="request.authorized_pickup.id_expiry_date" class="info-item">
              <label>ID Expiry Date:</label>
              <span>{{ formatDate(request.authorized_pickup.id_expiry_date) }}</span>
            </div> -->

            <!-- I will comment the Verification Status for now -->
            <!-- <div class="info-item">
              <label>Verification Status:</label>
              <span class="badge" :class="getVerificationStatusClass(request.authorized_pickup.is_verified ? 'approved' : 'pending')">
                {{ request.authorized_pickup.is_verified ? 'Verified' : 'Pending Verification' }}
              </span>
            </div> -->

            <div v-if="request.authorized_pickup.id_image_path" class="info-item">
              <label>ID Document:</label>
              <div class="verification-image-container">
                <img
                  v-if="imageUrls.pickupId"
                  :src="imageUrls.pickupId"
                  :alt="request.authorized_pickup.id_image_name || 'ID Document'"
                  class="verification-image"
                  @click="openImageModal(request.authorized_pickup.id_image_path, request.authorized_pickup.id_image_name, 'pickup_id')"
                  @error="handleImageError($event, 'pickup ID')"
                  @load="handleImageLoad($event, 'pickup ID')"
                >
                <div v-else class="image-loading">
                  <i class="fas fa-spinner fa-spin"></i>
                  <span>Loading image...</span>
                </div>
              </div>
            </div>

            <div v-if="request.authorized_pickup.authorization_letter_path" class="info-item">
              <label>Authorization Letter:</label>
              <div class="verification-image-container">
                <img
                  v-if="imageUrls.authorizationLetter"
                  :src="imageUrls.authorizationLetter"
                  alt="Authorization Letter"
                  class="verification-image"
                  @click="openImageModal(request.authorized_pickup.authorization_letter_path, 'Authorization Letter', 'pickup_authorization')"
                  @error="handleImageError($event, 'authorization letter')"
                  @load="handleImageLoad($event, 'authorization letter')"
                >
                <div v-else class="image-loading">
                  <i class="fas fa-spinner fa-spin"></i>
                  <span>Loading image...</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- Payment Information -->
        <div class="info-card">
          <h4>Payment Information</h4>
          <div class="info-grid">
            <div class="info-item">
              <label>Payment Method:</label>
              <span>{{ request.payment_method || 'Not selected' }}</span>
            </div>

            <!-- I will not show this in frontend  -->
            <!-- <div class="info-item">
              <label>Payment Status:</label>
              <span class="payment-status" :class="getPaymentStatusClass(request.payment_status)">
                {{ formatPaymentStatus(request.payment_status) }}
              </span>
            </div> -->
            <div class="info-item">
              <label>Total Fee:</label>
              <span class="amount">₱{{ formatCurrency(request.total_fee) }}</span>
            </div>
            <div v-if="request.payment_date" class="info-item">
              <label>Payment Date:</label>
              <span>{{ formatDate(request.payment_date) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="request-actions">
        <button 
          v-if="canCancelRequest(request.status)"
          class="action-btn cancel-btn"
          @click="cancelRequest"
        >
          <i class="fas fa-times"></i>
          Cancel Request
        </button>

        <button 
          v-if="needsPayment(request)"
          class="action-btn pay-btn"
          @click="processPayment"
        >
          <i class="fas fa-credit-card"></i>
          Pay Now
        </button>

        <!-- I will comment this, I dont need this for now -->
        <!-- <button 
          v-if="canDownload(request.status)"
          class="action-btn download-btn"
          @click="downloadDocument"
        >
          <i class="fas fa-download"></i>
          Download Document
        </button> -->

        <!-- I will comment this, I dont need this for now -->x
        <!-- <button class="action-btn print-btn" @click="printDetails">
          <i class="fas fa-print"></i>
          Print Details
        </button> -->
      </div>

      <!-- Admin Notes (if any) -->
      <div v-if="request.admin_notes" class="admin-notes">
        <h3>Admin Notes</h3>
        <div class="notes-content">
          <p>{{ request.admin_notes }}</p>
          <span class="notes-date">{{ formatDate(request.updated_at) }}</span>
        </div>
      </div>
    </div> <!-- End page-content -->

    <!-- Image Viewer Modal -->
    <ImageViewer
      v-if="showImageViewer && selectedImage"
      :imageUrl="selectedImage.url"
      :title="selectedImage.title"
      :filename="selectedImage.filename"
      :imageType="selectedImage.type"
      :downloadUrl="selectedImage.downloadUrl"
      @close="closeImageViewer"
    />
  </div>
</template>

<script>
import documentRequestService from '@/services/documentRequestService';
import clientAuthService from '@/services/clientAuthService';
import ImageViewer from '@/components/common/ImageViewer.vue';

export default {
  name: 'RequestDetails',
  components: {
    ImageViewer
  },
  data() {
    return {
      request: null,
      loading: true,
      error: null,
      showImageViewer: false,
      selectedImage: null,
      imageObjectUrls: new Map(), // Track created object URLs for cleanup
      imageUrls: {
        beneficiaryVerification: '',
        pickupId: '',
        authorizationLetter: ''
      }, // Store loaded image URLs for template binding
      progressSteps: [
        {
          status: 'pending',
          title: 'Request Submitted',
          description: 'Your request has been submitted and is waiting for review',
          icon: 'fas fa-paper-plane'
        },
        {
          status: 'under_review',
          title: 'Under Review',
          description: 'Your request is being reviewed by our staff',
          icon: 'fas fa-search'
        },
        {
          status: 'approved',
          title: 'Approved',
          description: 'Your request has been approved and payment is required',
          icon: 'fas fa-check'
        },
        {
          status: 'processing',
          title: 'Processing',
          description: 'Your document is being prepared',
          icon: 'fas fa-cog'
        },
        {
          status: 'ready_for_pickup',
          title: 'Ready for Pickup',
          description: 'Your document is ready for pickup',
          icon: 'fas fa-box'
        },
        {
          status: 'completed',
          title: 'Completed',
          description: 'Request has been completed successfully',
          icon: 'fas fa-check-circle'
        }
      ]
    };
  },
  computed: {
    clientData() {
      return clientAuthService.getCurrentUser();
    }
  },
  async mounted() {
    await this.loadRequestDetails();
  },
  beforeUnmount() {
    // Clean up object URLs to prevent memory leaks
    this.cleanupImageUrls();
  },
  methods: {
    async loadRequestDetails() {
      try {
        this.loading = true;
        this.error = null;
        
        const requestId = this.$route.params.id;
        const response = await documentRequestService.getRequestDetails(requestId);
        this.request = response.data;
        
        // Debug: Log the received request data
        console.log('🔍 Frontend received request data:', {
          id: this.request?.id,
          requestor: this.request?.requestor,
          nationality: this.request?.requestor?.nationality,
          months_of_residency: this.request?.requestor?.months_of_residency,
          years_of_residency: this.request?.requestor?.years_of_residency,
          beneficiary: this.request?.beneficiary,
          beneficiary_verification_image: this.request?.beneficiary?.verification_image_path,
          authorized_pickup: this.request?.authorized_pickup,
          pickup_id_image: this.request?.authorized_pickup?.id_image_path
        });

        // Debug: Log the request data to see what's available
        console.log('🔍 Request data loaded:', {
          hasAuthorizedPickup: !!this.request.authorized_pickup,
          authorizedPickupData: this.request.authorized_pickup,
          pickupIdImagePath: this.request.authorized_pickup?.id_image_path,
          authorizationLetterPath: this.request.authorized_pickup?.authorization_letter_path
        });

        // Load images after request details are loaded
        await this.loadImages();

      } catch (error) {
        console.error('Error loading request details:', error);
        this.error = error.response?.data?.message || 'Failed to load request details';
      } finally {
        this.loading = false;
      }
    },

    async loadImages() {
      // Check if user is authenticated
      const authToken = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      if (!authToken) {
        console.warn('⚠️ User not authenticated, skipping image loading');
        this.showToast('Warning', 'Please log in to view verification images', 'warning');
        return;
      }

      console.log('🖼️ Starting image loading process...');

      // Load beneficiary verification image
      if (this.request?.beneficiary?.verification_image_path) {
        try {
          console.log('📸 Loading beneficiary verification image...');
          const imageUrl = await this.getVerificationImageUrl(this.request.beneficiary.verification_image_path);
          if (imageUrl && imageUrl !== this.getPlaceholderImageUrl()) {
            this.imageUrls.beneficiaryVerification = imageUrl;
            console.log('✅ Beneficiary verification image loaded successfully');
          } else {
            this.imageUrls.beneficiaryVerification = this.getPlaceholderImageUrl();
          }
        } catch (error) {
          console.error('❌ Failed to load beneficiary verification image:', error.message);
          this.imageUrls.beneficiaryVerification = this.getPlaceholderImageUrl();
          if (error.message.includes('log in')) {
            this.showToast('Warning', 'Please log in to view images', 'warning');
          }
        }
      }

      // Load pickup ID image
      if (this.request?.authorized_pickup?.id_image_path) {
        try {
          console.log('📸 Loading pickup ID image...', {
            path: this.request.authorized_pickup.id_image_path,
            filename: this.request.authorized_pickup.id_image_path.split(/[/\\]/).pop()
          });
          const imageUrl = await this.getPickupIdImageUrl(this.request.authorized_pickup.id_image_path);
          if (imageUrl && imageUrl !== this.getPlaceholderImageUrl()) {
            this.imageUrls.pickupId = imageUrl;
            console.log('✅ Pickup ID image loaded successfully');
          } else {
            this.imageUrls.pickupId = this.getPlaceholderImageUrl();
            console.log('⚠️ Using placeholder for pickup ID image');
          }
        } catch (error) {
          console.error('❌ Failed to load pickup ID image:', error.message);
          this.imageUrls.pickupId = this.getPlaceholderImageUrl();
          if (error.message.includes('log in')) {
            this.showToast('Warning', 'Please log in to view images', 'warning');
          }
        }
      } else {
        console.log('⚠️ No pickup ID image path found in request data');
      }

      // Load authorization letter image
      if (this.request?.authorized_pickup?.authorization_letter_path) {
        try {
          console.log('📸 Loading authorization letter image...');
          const imageUrl = await this.getAuthorizationLetterUrl(this.request.authorized_pickup.authorization_letter_path);
          if (imageUrl && imageUrl !== this.getPlaceholderImageUrl()) {
            this.imageUrls.authorizationLetter = imageUrl;
            console.log('✅ Authorization letter image loaded successfully');
          } else {
            this.imageUrls.authorizationLetter = this.getPlaceholderImageUrl();
          }
        } catch (error) {
          console.error('❌ Failed to load authorization letter image:', error.message);
          this.imageUrls.authorizationLetter = this.getPlaceholderImageUrl();
          if (error.message.includes('log in')) {
            this.showToast('Warning', 'Please log in to view images', 'warning');
          }
        }
      }

      console.log('🖼️ Image loading process completed');
    },

    cleanupImageUrls() {
      // Revoke all object URLs to prevent memory leaks
      for (const [key, url] of this.imageObjectUrls) {
        URL.revokeObjectURL(url);
        console.log('🧹 Cleaned up object URL:', key);
      }
      this.imageObjectUrls.clear();
    },

    getDocumentIcon(type) {
      const icons = {
        'Barangay Clearance': 'fas fa-certificate',
        'Cedula': 'fas fa-id-card'
      };
      return icons[type] || 'fas fa-file-alt';
    },

    getStatusClass(status) {
      const classes = {
        'pending': 'status-pending',
        'under_review': 'status-review',
        'approved': 'status-approved',
        'processing': 'status-processing',
        'ready_for_pickup': 'status-ready',
        'completed': 'status-completed',
        'rejected': 'status-rejected',
        'cancelled': 'status-cancelled'
      };
      return classes[status] || 'status-unknown';
    },

    formatStatus(status) {
      const statusMap = {
        'pending': 'Pending',
        'under_review': 'Under Review',
        'approved': 'Approved',
        'processing': 'Processing',
        'ready_for_pickup': 'Ready for Pickup',
        'completed': 'Completed',
        'rejected': 'Rejected',
        'cancelled': 'Cancelled'
      };
      return statusMap[status] || status;
    },

    getPaymentStatusClass(status) {
      const classes = {
        'pending': 'payment-pending',
        'paid': 'payment-paid',
        'failed': 'payment-failed',
        'refunded': 'payment-refunded'
      };
      return classes[status] || 'payment-unknown';
    },

    formatPaymentStatus(status) {
      const statusMap = {
        'pending': 'Pending Payment',
        'paid': 'Paid',
        'failed': 'Payment Failed',
        'refunded': 'Refunded'
      };
      return statusMap[status] || 'Not Required';
    },

    getMainTimelineSteps() {
      // Create a copy of progress steps to modify for cash payments
      const steps = [...this.progressSteps];

      // Check if this is a cash payment
      const isCashPayment = this.request &&
        (this.request.payment_method === 'Cash Payment' ||
         this.request.payment_method === 'Cash' ||
         this.request.payment_method_code === 'CASH' ||
         this.request.payment_method_id === 1 ||
         this.request.is_online_payment === false ||
         this.request.is_online_payment === 0 ||
         this.request.is_online === false ||
         this.request.is_online === 0);

      // Modify the "approved" step description for cash payments
      if (isCashPayment) {
        const approvedStepIndex = steps.findIndex(step => step.status === 'approved');
        if (approvedStepIndex !== -1) {
          steps[approvedStepIndex] = {
            ...steps[approvedStepIndex],
            description: 'Your request has been approved. Payment will be collected during pickup.'
          };
        }
      }

      return steps;
    },

    isStepCompleted(stepStatus, currentStatus) {
      // Don't mark any steps as completed if the request is rejected
      if (currentStatus === 'rejected') {
        // Only mark steps before "under_review" as completed for rejected requests
        const completedBeforeRejection = ['pending'];
        return completedBeforeRejection.includes(stepStatus);
      }

      const statusOrder = ['pending', 'under_review', 'approved', 'processing', 'ready_for_pickup', 'completed'];
      const stepIndex = statusOrder.indexOf(stepStatus);
      const currentIndex = statusOrder.indexOf(currentStatus);
      return stepIndex < currentIndex;
    },

    getFullName() {
      const client = this.request?.client || this.clientData?.profile;
      if (!client) return 'N/A';
      return `${client.first_name || ''} ${client.middle_name || ''} ${client.last_name || ''}`.trim();
    },

    getClientEmail() {
      const email = this.request?.email || this.request?.client?.email || this.clientData?.profile?.email;
      return email && email.trim() ? email : null;
    },

    getClientPhone() {
      const phone = this.request?.phone_number || this.request?.client?.phone_number || this.clientData?.profile?.phone_number;
      return phone && phone.trim() ? phone : 'Contact information not available';
    },

    getEmergencyContact() {
      const contact = this.request?.emergency_contact_name;
      return contact && contact.trim() ? contact : null;
    },

    getEmergencyPhone() {
      const phone = this.request?.emergency_contact_phone;
      return phone && phone.trim() ? phone : null;
    },

    getFullAddress() {
      // Try multiple sources for address data
      const client = this.request?.client || this.clientData || this.request;
      if (!client) return 'Address not available';

      const parts = [
        client.house_number || client.requestor_house_number,
        client.street || client.requestor_street,
        client.subdivision,
        client.barangay || client.requestor_barangay,
        client.city_municipality || client.requestor_city_municipality || client.city,
        client.province || client.requestor_province
      ].filter(part => part && part.trim());

      return parts.length > 0 ? parts.join(', ') : 'Address not available';
    },

    // New helper methods for complete client information
    getClientUsername() {
      return this.request?.client_username || this.request?.client?.username || this.clientData?.username;
    },

    getClientEmailVerified() {
      return this.request?.email_verified || this.request?.client?.email_verified || this.clientData?.email_verified || false;
    },

    getClientPhoneVerified() {
      return this.request?.phone_verified || this.request?.client?.phone_verified || this.clientData?.phone_verified || false;
    },

    getClientProfileVerified() {
      return this.request?.is_verified || this.request?.client?.is_verified || this.clientData?.is_verified || false;
    },

    getClientResidencyVerified() {
      return this.request?.residency_verified || this.request?.client?.residency_verified || this.clientData?.residency_verified || false;
    },

    getClientAccountStatus() {
      return this.request?.status || this.request?.client?.status || this.clientData?.status || 'unknown';
    },

    getClientLastLogin() {
      return this.request?.last_login || this.request?.client?.last_login || this.clientData?.last_login;
    },

    getClientCreatedAt() {
      return this.request?.created_at || this.request?.client?.created_at || this.clientData?.created_at;
    },

    getClientBirthDate() {
      return this.request?.birth_date || this.request?.requestor_birth_date || this.request?.client?.birth_date || this.clientData?.birth_date;
    },

    getClientGender() {
      return this.request?.gender || this.request?.requestor_gender || this.request?.client?.gender || this.clientData?.gender;
    },

    getClientCivilStatus() {
      return this.request?.civil_status_id || this.request?.requestor_civil_status_id || this.request?.client?.civil_status_id || this.clientData?.civil_status_id;
    },

    getClientNationality() {
      return this.request?.requestor?.nationality || this.request?.nationality || this.request?.requestor_nationality || this.request?.client?.nationality || this.clientData?.nationality;
    },

    getClientAccountStatusClass() {
      const status = this.getClientAccountStatus();
      const classes = {
        'active': 'bg-success',
        'inactive': 'bg-secondary',
        'suspended': 'bg-danger',
        'pending_verification': 'bg-warning',
        'pending_residency_verification': 'bg-info'
      };
      return classes[status] || 'bg-secondary';
    },

    formatAccountStatus(status) {
      const statusMap = {
        'active': 'Active',
        'inactive': 'Inactive',
        'suspended': 'Suspended',
        'pending_verification': 'Pending Verification',
        'pending_residency_verification': 'Pending Residency Verification'
      };
      return statusMap[status] || status;
    },

    formatGender(gender) {
      if (!gender) return 'Not provided';
      return gender.charAt(0).toUpperCase() + gender.slice(1);
    },

    getCivilStatusName(statusId) {
      const statuses = {
        1: 'Single',
        2: 'Married',
        3: 'Divorced',
        4: 'Widowed',
        5: 'Separated'
      };
      return statuses[statusId] || 'Not provided';
    },

    getResidencyDisplay() {
      if (!this.request || !this.request.requestor) {
        return 'Not provided';
      }

      const years = this.request.requestor.years_of_residency || 0;
      const months = this.request.requestor.months_of_residency || 0;

      // If both are 0, return "Not provided"
      if (years === 0 && months === 0) {
        return 'Not provided';
      }

      const parts = [];
      if (years > 0) parts.push(`${years} year${years > 1 ? 's' : ''}`);
      if (months > 0) parts.push(`${months} month${months > 1 ? 's' : ''}`);

      return parts.length > 0 ? parts.join(' and ') : 'Less than a month';
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

    formatCurrency(amount) {
      return parseFloat(amount || 0).toFixed(2);
    },

    canCancelRequest(status) {
      // Enhanced cancellation rules - allow cancellation until payment is confirmed
      const cancellableStatuses = [
        'pending',
        'under_review',
        'additional_info_required',
        'approved',
        'payment_pending',
        'payment_failed'
      ];
      return cancellableStatuses.includes(status);
    },

    needsPayment(request) {
      // Check if request needs payment based on enhanced workflow
      const paymentRequiredStatuses = ['approved', 'payment_pending', 'payment_failed'];
      const unpaidStatuses = ['pending', 'failed', null, undefined, ''];

      return paymentRequiredStatuses.includes(request.status) &&
             unpaidStatuses.includes(request.payment_status) &&
             request.payment_method_id && // Must have a payment method selected
             request.is_online_payment; // Only show for online payment methods
    },

    canDownload(status) {
      return status === 'completed';
    },

    async cancelRequest() {
      // Enhanced cancellation with reason input
      const reason = prompt(
        'Please provide a reason for cancelling this request (optional):',
        ''
      );

      // If user clicked cancel on the prompt, don't proceed
      if (reason === null) return;

      // Confirm cancellation
      if (!confirm('Are you sure you want to cancel this request?')) return;

      try {
        console.log('🚫 Cancelling request:', this.request.id, 'Reason:', reason);

        const cancellationReason = reason.trim() || 'Cancelled by user';
        await documentRequestService.cancelRequest(this.request.id, cancellationReason);

        this.$toast?.success('Request cancelled successfully. Administrators have been notified.');
        this.request.status = 'cancelled';

        // Refresh request details to show updated status
        await this.loadRequestDetails();

        console.log('✅ Request cancelled successfully');
      } catch (error) {
        console.error('❌ Error cancelling request:', error);

        // Show more specific error messages
        if (error.response?.data?.message) {
          this.$toast?.error(error.response.data.message);
        } else if (error.message?.includes('cannot be cancelled')) {
          this.$toast?.error('This request cannot be cancelled at its current stage');
        } else {
          this.$toast?.error('Failed to cancel request. Please try again.');
        }
      }
    },

    async processPayment() {
      try {
        // Check if request has a payment method selected
        if (!this.request.payment_method_id) {
          this.showToast('Error', 'No payment method selected for this request', 'error');
          return;
        }

        // Check if it's an online payment method
        if (!this.request.is_online_payment) {
          this.showToast('Info', 'This request uses in-person payment. Please pay at the barangay office.', 'info');
          return;
        }

        // Show loading state
        this.showToast('Info', 'Initiating payment...', 'info');

        // Get current user data from clientAuthService
        const currentUser = this.$clientAuth.getCurrentUser();

        // Prepare payment data
        const paymentData = {
          request_id: this.request.id,
          payment_method_id: this.request.payment_method_id,
          customer_email: currentUser?.email || this.request.email
        };

        // Import paymentService dynamically if not already imported
        const { default: paymentService } = await import('@/services/paymentService');

        // Initiate payment through PayMongo
        const response = await paymentService.initiatePayment(paymentData);

        if (response.success && response.data.checkout_url) {
          // Redirect to PayMongo checkout page
          this.showToast('Success', 'Redirecting to payment page...', 'success');
          paymentService.redirectToPayMongo(response.data.checkout_url);
        } else {
          throw new Error(response.message || 'Failed to initiate payment');
        }

      } catch (error) {
        console.error('Payment initiation error:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to initiate payment';
        this.showToast('Error', errorMessage, 'error');
      }
    },

    downloadDocument() {
      // TODO: Implement document download
      console.log('Download document for request:', this.request.id);
    },

    printDetails() {
      window.print();
    },

    goBack() {
      this.$router.push({ name: 'MyRequests' });
    },

    // Beneficiary helper methods
    getBeneficiaryFullName() {
      if (!this.request?.beneficiary) return 'Not provided';
      const b = this.request.beneficiary;
      return `${b.first_name || ''} ${b.middle_name || ''} ${b.last_name || ''}`.trim();
    },

    getBeneficiaryAddress() {
      if (!this.request?.beneficiary) return 'Not provided';
      const b = this.request.beneficiary;
      const parts = [
        b.house_number,
        b.street,
        b.subdivision,
        b.barangay,
        b.city_municipality,
        b.province
      ].filter(part => part && part.trim());
      return parts.length > 0 ? parts.join(', ') : 'Not provided';
    },

    async getVerificationImageUrl(imagePath) {
      if (!imagePath) return this.getPlaceholderImageUrl();

      // Extract filename from path
      const filename = imagePath.split(/[/\\]/).pop();
      const cacheKey = `beneficiary-${filename}`;

      // Return cached URL if available
      if (this.imageObjectUrls.has(cacheKey)) {
        return this.imageObjectUrls.get(cacheKey);
      }

      try {
        // Debug logging for path consistency
        console.log('🔍 Debug beneficiary verification image loading:', {
          originalPath: imagePath,
          extractedFilename: filename,
          requestId: this.request.id,
          finalApiUrl: `/client/document-requests/${this.request.id}/verification-image/beneficiary/${filename}`
        });

        // Fetch image as blob with authentication
        const objectUrl = await documentRequestService.getVerificationImageObjectUrl(
          this.request.id,
          'beneficiary',
          filename
        );

        // Cache the object URL
        this.imageObjectUrls.set(cacheKey, objectUrl);
        console.log('✅ Created object URL for beneficiary verification image:', filename);
        return objectUrl;
      } catch (error) {
        console.error('❌ Failed to load beneficiary verification image:', {
          filename,
          imagePath,
          requestId: this.request.id,
          error: error.message,
          status: error.response?.status
        });

        // Show user-friendly error messages
        if (error.message.includes('not found')) {
          this.showToast('Warning', 'Verification image not found on server', 'warning');
        } else if (error.message.includes('contact support')) {
          this.showToast('Error', 'Server error - please contact support', 'error');
        } else {
          this.showToast('Warning', `Failed to load verification image: ${error.message}`, 'warning');
        }
        return this.getPlaceholderImageUrl();
      }
    },

    getVerificationStatusClass(status) {
      const classes = {
        'pending': 'bg-warning',
        'approved': 'bg-success',
        'rejected': 'bg-danger'
      };
      return classes[status] || 'bg-secondary';
    },

    formatVerificationStatus(status) {
      const statusMap = {
        'pending': 'Pending Verification',
        'approved': 'Verified',
        'rejected': 'Rejected'
      };
      return statusMap[status] || 'Unknown';
    },

    // Authorized pickup person helper methods
    getAuthorizedPickupFullName() {
      if (!this.request?.authorized_pickup) return 'Not provided';
      const p = this.request.authorized_pickup;
      return `${p.first_name || ''} ${p.middle_name || ''} ${p.last_name || ''}`.trim();
    },

    async getPickupIdImageUrl(imagePath) {
      if (!imagePath) return this.getPlaceholderImageUrl();

      // Extract filename from path
      const filename = imagePath.split(/[/\\]/).pop();
      const cacheKey = `pickup-id-${filename}`;

      // Return cached URL if available
      if (this.imageObjectUrls.has(cacheKey)) {
        return this.imageObjectUrls.get(cacheKey);
      }

      try {
        // Debug logging for path consistency
        console.log('🔍 Debug pickup ID image loading:', {
          originalPath: imagePath,
          extractedFilename: filename,
          requestId: this.request.id,
          finalApiUrl: `/client/document-requests/${this.request.id}/verification-image/pickup-id/${filename}`
        });

        // Fetch image as blob with authentication
        const objectUrl = await documentRequestService.getVerificationImageObjectUrl(
          this.request.id,
          'pickup-id',
          filename
        );

        // Cache the object URL
        this.imageObjectUrls.set(cacheKey, objectUrl);
        console.log('✅ Created object URL for pickup ID image:', filename);
        return objectUrl;
      } catch (error) {
        console.error('❌ Failed to load pickup ID image:', {
          filename,
          imagePath,
          requestId: this.request.id,
          error: error.message,
          status: error.response?.status
        });

        // Show user-friendly error messages
        if (error.message.includes('not found')) {
          this.showToast('Warning', 'ID image not found on server', 'warning');
        } else if (error.message.includes('contact support')) {
          this.showToast('Error', 'Server error - please contact support', 'error');
        } else {
          this.showToast('Warning', `Failed to load ID image: ${error.message}`, 'warning');
        }
        return this.getPlaceholderImageUrl();
      }
    },

    async getAuthorizationLetterUrl(imagePath) {
      if (!imagePath) return this.getPlaceholderImageUrl();

      // Extract filename from path
      const filename = imagePath.split(/[/\\]/).pop();
      const cacheKey = `pickup-auth-${filename}`;

      // Return cached URL if available
      if (this.imageObjectUrls.has(cacheKey)) {
        return this.imageObjectUrls.get(cacheKey);
      }

      try {
        // Debug logging for path consistency
        console.log('🔍 Debug authorization letter loading:', {
          originalPath: imagePath,
          extractedFilename: filename,
          requestId: this.request.id,
          finalApiUrl: `/client/document-requests/${this.request.id}/verification-image/pickup-auth/${filename}`
        });

        // Fetch image as blob with authentication
        const objectUrl = await documentRequestService.getVerificationImageObjectUrl(
          this.request.id,
          'pickup-auth',
          filename
        );

        // Cache the object URL
        this.imageObjectUrls.set(cacheKey, objectUrl);
        console.log('✅ Created object URL for authorization letter:', filename);
        return objectUrl;
      } catch (error) {
        console.error('❌ Failed to load authorization letter:', {
          filename,
          imagePath,
          requestId: this.request.id,
          error: error.message,
          status: error.response?.status
        });

        // Show user-friendly error messages
        if (error.message.includes('not found')) {
          this.showToast('Warning', 'Authorization letter not found on server', 'warning');
        } else if (error.message.includes('contact support')) {
          this.showToast('Error', 'Server error - please contact support', 'error');
        } else {
          this.showToast('Warning', `Failed to load authorization letter: ${error.message}`, 'warning');
        }
        return this.getPlaceholderImageUrl();
      }
    },

    getPlaceholderImageUrl() {
      // Return a data URL for a simple placeholder image
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04NSA2MEw5NSA3MEwxMTUgNTBMMTM1IDcwTDE0NSA2MEwxNjUgODBMMTY1IDEyMEg0NVY4MEw2NSA2MEw4NSA2MFoiIGZpbGw9IiNEMUQ1REIiLz4KPGNpcmNsZSBjeD0iNzAiIGN5PSI0NSIgcj0iOCIgZmlsbD0iI0QxRDVEQiIvPgo8dGV4dCB4PSIxMDAiIHk9IjEwNSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjNkI3MjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5JbWFnZSBub3QgYXZhaWxhYmxlPC90ZXh0Pgo8L3N2Zz4K';
    },

    async openImageModal(imagePath, imageName, imageType = 'beneficiaries') {
      try {
        // Use the already loaded image URLs from the reactive data
        let imageUrl;
        switch (imageType) {
          case 'pickup_id':
          case 'pickup_ids':
            imageUrl = this.imageUrls.pickupId;
            break;
          case 'pickup_authorization':
            imageUrl = this.imageUrls.authorizationLetter;
            break;
          default:
            imageUrl = this.imageUrls.beneficiaryVerification;
        }

        // If image URL is not loaded yet, try to load it
        if (!imageUrl || imageUrl === this.getPlaceholderImageUrl()) {
          console.log('🔄 Image not loaded yet, attempting to load for modal...');
          switch (imageType) {
            case 'pickup_id':
            case 'pickup_ids':
              imageUrl = await this.getPickupIdImageUrl(imagePath);
              this.imageUrls.pickupId = imageUrl;
              break;
            case 'pickup_authorization':
              imageUrl = await this.getAuthorizationLetterUrl(imagePath);
              this.imageUrls.authorizationLetter = imageUrl;
              break;
            default:
              imageUrl = await this.getVerificationImageUrl(imagePath);
              this.imageUrls.beneficiaryVerification = imageUrl;
          }
        }

        if (!imageUrl || imageUrl === this.getPlaceholderImageUrl()) {
          this.showToast('Error', 'Failed to load image', 'error');
          return;
        }

        // Debug logging for modal image data
        console.log('🖼️ Opening ImageViewer modal with:', {
          imageType,
          imageName,
          imagePath,
          imageUrl: imageUrl ? imageUrl.substring(0, 50) + '...' : 'none',
          isBlobUrl: imageUrl?.startsWith('blob:'),
          isDataUrl: imageUrl?.startsWith('data:'),
          isPlaceholder: imageUrl === this.getPlaceholderImageUrl()
        });

        // Set data for ImageViewer component
        this.selectedImage = {
          url: imageUrl,
          title: imageName || 'Document',
          filename: imagePath ? imagePath.split(/[/\\]/).pop() : '',
          type: imageType,
          downloadUrl: imageUrl
        };
        this.showImageViewer = true;
      } catch (error) {
        console.error('Error opening image modal:', error);
        this.showToast('Error', 'Failed to load image', 'error');
      }
    },

    closeImageViewer() {
      this.showImageViewer = false;
      this.selectedImage = null;
    },

    handleImageError(event, imageType) {
      console.error(`❌ Failed to load ${imageType} image:`, event.target.src);

      // Hide the broken image
      event.target.style.display = 'none';

      // Show error message to user
      const container = event.target.closest('.verification-image-container');
      if (container && !container.querySelector('.image-error-message')) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'image-error-message';
        errorDiv.innerHTML = `
          <i class="fas fa-exclamation-triangle text-warning"></i>
          <span>Unable to load ${imageType} image</span>
          <small class="d-block mt-1">Authentication or network error</small>
        `;
        container.appendChild(errorDiv);
      }
    },

    handleImageLoad(event, imageType) {
      console.log(`✅ Successfully loaded ${imageType} image:`, event.target.src);
    },

    showToast(title, message, type = 'info') {
      // Log to console for debugging
      console.log(`[${type.toUpperCase()}] ${title}: ${message}`);

      // Create a simple toast notification
      const toast = document.createElement('div');
      toast.className = `toast-notification toast-${type}`;
      toast.innerHTML = `
        <div class="toast-header">
          <strong>${title}</strong>
          <button type="button" class="toast-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
        <div class="toast-body">${message}</div>
      `;

      // Add toast styles if not already added
      if (!document.getElementById('toast-styles')) {
        const styles = document.createElement('style');
        styles.id = 'toast-styles';
        styles.textContent = `
          .toast-notification {
            position: fixed;
            top: 20px;
            right: 20px;
            min-width: 300px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 9999;
            animation: slideIn 0.3s ease;
          }
          .toast-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 16px 8px;
            border-bottom: 1px solid #e9ecef;
          }
          .toast-body {
            padding: 8px 16px 12px;
            color: #6c757d;
          }
          .toast-close {
            background: none;
            border: none;
            font-size: 18px;
            cursor: pointer;
            color: #6c757d;
          }
          .toast-success { border-left: 4px solid #28a745; }
          .toast-error { border-left: 4px solid #dc3545; }
          .toast-info { border-left: 4px solid #17a2b8; }
          .toast-warning { border-left: 4px solid #ffc107; }
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
        `;
        document.head.appendChild(styles);
      }

      // Add toast to page
      document.body.appendChild(toast);

      // Auto-remove after 5 seconds
      setTimeout(() => {
        if (toast.parentElement) {
          toast.style.animation = 'slideIn 0.3s ease reverse';
          setTimeout(() => toast.remove(), 300);
        }
      }, 5000);
    }
  }
};
</script>

<style src="./css/RequestDetails.css"></style>