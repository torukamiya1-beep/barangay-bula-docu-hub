<template>
  <div class="rejected-documents-container">
    <div class="container py-4">
      <div class="row">
        <div class="col-12">
          <!-- Page Header -->
          <div class="page-header mb-4 d-flex justify-content-between align-items-center">
            <div>
              <h2 class="mb-2">
                <i class="fas fa-exclamation-triangle text-warning me-2"></i>
                Rejected Documents
              </h2>
              <p class="text-muted mb-0">Review and reupload your rejected documents</p>
            </div>
            <router-link to="/client/dashboard" class="btn btn-outline-secondary">
              <i class="fas fa-arrow-left me-2"></i>
              Back to Dashboard
            </router-link>
          </div>

          <!-- Loading State -->
          <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-3 text-muted">Loading rejected documents...</p>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="alert alert-danger" role="alert">
            <i class="fas fa-exclamation-circle me-2"></i>
            {{ error }}
            <button class="btn btn-sm btn-outline-danger ms-3" @click="loadRejectedDocuments">
              <i class="fas fa-redo me-1"></i>
              Retry
            </button>
          </div>

          <!-- Empty State -->
          <div v-else-if="hasNoRejectedDocuments" class="text-center py-5">
            <div class="empty-state">
              <i class="fas fa-check-circle text-success" style="font-size: 4rem;"></i>
              <h4 class="mt-4 mb-3">No Rejected Documents</h4>
              <p class="text-muted mb-4">
                All your documents are either approved or pending review.
              </p>
              <router-link to="/client/dashboard" class="btn btn-primary">
                <i class="fas fa-home me-2"></i>
                Go to Dashboard
              </router-link>
            </div>
          </div>

          <!-- Rejected Documents List -->
          <div v-else>
            <div class="alert alert-info mb-4" role="alert">
              <i class="fas fa-info-circle me-2"></i>
              <strong>Action Required:</strong> The following documents were rejected. Please reupload them for review.
            </div>

            <!-- Residency Documents Section -->
            <div v-if="rejectedDocuments.length > 0" class="mb-5">
              <h4 class="section-title mb-3">
                <i class="fas fa-home me-2 text-danger"></i>
                Rejected Residency Documents
              </h4>
              <div class="document-list">
                <div v-for="document in rejectedDocuments" :key="'residency-' + document.id" class="document-list-item">
                  <div class="document-card">
                    <!-- Document Type Header -->
                    <div class="card-header bg-danger text-white d-flex align-items-center">
                      <i :class="getDocumentIcon(document.document_type)" class="me-2"></i>
                      <h6 class="mb-0 flex-grow-1">{{ formatDocumentType(document.document_type) }}</h6>
                    </div>

                    <!-- Document Content -->
                    <div class="card-body d-flex">
                      <!-- Document Preview -->
                      <div class="document-preview me-3" @click="viewDocument(document)">
                        <img
                          v-if="isImageDocument(document) && documentBlobUrls[document.id]"
                          :src="documentBlobUrls[document.id]"
                          :alt="document.document_name"
                          class="preview-image"
                        />
                        <div v-else-if="isImageDocument(document)" class="loading-preview">
                          <div class="spinner-border spinner-border-sm" role="status"></div>
                        </div>
                        <div v-else class="file-icon-preview">
                          <i :class="getDocumentIcon(document.document_type)" class="fa-2x text-muted"></i>
                        </div>
                        <div class="preview-overlay">
                          <i class="fas fa-eye fa-lg"></i>
                        </div>
                      </div>

                      <!-- Document Details -->
                      <div class="document-info flex-grow-1">
                        <div class="document-details mb-3">
                          <p class="card-text mb-2">
                            <strong>File:</strong> {{ document.document_name }}<br>
                            <strong>Uploaded:</strong> {{ formatDate(document.created_at) }}
                          </p>
                        </div>

                        <!-- Reupload Section -->
                        <div class="reupload-section">
                          <div v-if="!uploadingDocuments[document.id]" class="d-flex gap-2 flex-wrap">
                            <label :for="`file-input-${document.id}`" class="btn btn-warning btn-sm">
                              <i class="fas fa-upload me-1"></i>
                              Reupload Document
                            </label>
                            <input
                              :id="`file-input-${document.id}`"
                              type="file"
                              class="d-none"
                              accept=".jpg,.jpeg,.png,.pdf,.webp"
                              @change="handleFileSelect($event, document)"
                            />
                            <button class="btn btn-outline-primary btn-sm" @click="viewDocument(document)">
                              <i class="fas fa-eye me-1"></i>
                              View Current
                            </button>
                          </div>

                          <!-- Upload Progress -->
                          <div v-else class="upload-progress mt-2">
                            <div class="d-flex align-items-center mb-2">
                              <div class="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                              <span class="small">Uploading...</span>
                            </div>
                            <div class="progress" style="height: 5px;">
                              <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style="width: 100%"></div>
                            </div>
                          </div>

                          <!-- Preview Selected File -->
                          <div v-if="selectedFiles[document.id]" class="mt-3">
                            <div class="alert alert-info py-2 mb-2">
                              <small>
                                <i class="fas fa-file me-1"></i>
                                <strong>Selected:</strong> {{ selectedFiles[document.id].name }}
                              </small>
                            </div>
                            <div class="d-flex gap-2 flex-wrap">
                              <button
                                class="btn btn-success btn-sm"
                                @click="uploadDocument(document)"
                                :disabled="uploadingDocuments[document.id]"
                              >
                                <i class="fas fa-check me-1"></i>
                                Confirm Upload
                              </button>
                              <button
                                class="btn btn-outline-secondary btn-sm"
                                @click="cancelFileSelection(document.id)"
                                :disabled="uploadingDocuments[document.id]"
                              >
                                <i class="fas fa-times me-1"></i>
                                Cancel
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

            <!-- Supporting Documents Section -->
            <div v-if="rejectedSupportingDocuments.length > 0" class="mb-5">
              <h4 class="section-title mb-3">
                <i class="fas fa-file-alt me-2 text-danger"></i>
                Rejected Supporting Documents
              </h4>
              <div class="document-list">
                <div v-for="document in rejectedSupportingDocuments" :key="'supporting-' + document.id" class="document-list-item">
                  <div class="document-card">
                    <!-- Document Type Header -->
                    <div class="card-header bg-danger text-white d-flex align-items-center">
                      <i :class="getDocumentIcon(document.document_type)" class="me-2"></i>
                      <h6 class="mb-0 flex-grow-1">{{ formatDocumentType(document.document_type) }}</h6>
                    </div>

                    <!-- Document Content -->
                    <div class="card-body">
                      <div class="document-details mb-3">
                        <p class="card-text mb-2">
                          <strong>Request:</strong> {{ document.request_number || 'N/A' }}<br>
                          <strong>File:</strong> {{ document.document_name }}<br>
                          <strong>Rejected:</strong> {{ formatDate(document.verified_at || document.created_at) }}
                        </p>
                      </div>

                      <!-- Reupload Section -->
                      <div class="reupload-section">
                        <div v-if="!uploadingDocuments['supporting-' + document.id]" class="d-flex gap-2 flex-wrap">
                          <label :for="`file-input-supporting-${document.id}`" class="btn btn-warning btn-sm">
                            <i class="fas fa-upload me-1"></i>
                            Reupload Document
                          </label>
                          <input
                            :id="`file-input-supporting-${document.id}`"
                            type="file"
                            class="d-none"
                            accept=".jpg,.jpeg,.png,.pdf,.webp"
                            @change="handleFileSelect($event, document, 'supporting')"
                          />
                        </div>

                        <!-- Upload Progress -->
                        <div v-else class="upload-progress mt-2">
                          <div class="d-flex align-items-center mb-2">
                            <div class="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                            <span class="small">Uploading...</span>
                          </div>
                          <div class="progress" style="height: 5px;">
                            <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style="width: 100%"></div>
                          </div>
                        </div>

                        <!-- Preview Selected File -->
                        <div v-if="selectedFiles['supporting-' + document.id]" class="mt-3">
                          <div class="alert alert-info py-2 mb-2">
                            <small>
                              <i class="fas fa-file me-1"></i>
                              <strong>Selected:</strong> {{ selectedFiles['supporting-' + document.id].name }}
                            </small>
                          </div>
                          <div class="d-flex gap-2 flex-wrap">
                            <button
                              class="btn btn-success btn-sm"
                              @click="uploadSupportingDocument(document)"
                              :disabled="uploadingDocuments['supporting-' + document.id]"
                            >
                              <i class="fas fa-check me-1"></i>
                              Confirm Upload
                            </button>
                            <button
                              class="btn btn-outline-secondary btn-sm"
                              @click="cancelFileSelection('supporting-' + document.id)"
                              :disabled="uploadingDocuments['supporting-' + document.id]"
                            >
                              <i class="fas fa-times me-1"></i>
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- GCash Payment Proofs Section -->
            <div v-if="rejectedGCashProofs.length > 0" class="mb-5">
              <h4 class="section-title mb-3">
                <i class="fas fa-mobile-alt me-2 text-danger"></i>
                Rejected GCash Payment Proofs
              </h4>
              <div class="document-list">
                <div v-for="proof in rejectedGCashProofs" :key="'gcash-' + proof.id" class="document-list-item">
                  <div class="document-card">
                    <!-- Document Type Header -->
                    <div class="card-header bg-danger text-white d-flex align-items-center">
                      <i class="fas fa-mobile-alt me-2"></i>
                      <h6 class="mb-0 flex-grow-1">GCash Payment Proof - Request #{{ proof.request_number || 'N/A' }}</h6>
                    </div>

                    <!-- Document Content -->
                    <div class="card-body">
                      <div class="document-details mb-3">
                        <p class="card-text mb-2">
                          <strong>Document Type:</strong> {{ proof.document_type || 'N/A' }}<br>
                          <strong>Amount:</strong> ₱{{ formatCurrency(proof.total_fee || proof.total_document_fee || proof.total_amount) }}<br>
                          <strong>Rejected:</strong> {{ formatDate(proof.gcash_verified_at) }}<br>
                          <strong>Request:</strong> {{ proof.request_number || 'N/A' }}
                        </p>
                      </div>

                      <!-- Reupload Section -->
                      <div class="reupload-section">
                        <div v-if="!uploadingDocuments['gcash-' + proof.id]" class="d-flex gap-2 flex-wrap">
                          <label :for="`file-input-gcash-${proof.id}`" class="btn btn-warning btn-sm">
                            <i class="fas fa-upload me-1"></i>
                            Reupload Payment Proof
                          </label>
                          <input
                            :id="`file-input-gcash-${proof.id}`"
                            type="file"
                            class="d-none"
                            accept=".jpg,.jpeg,.png,.webp"
                            @change="handleFileSelect($event, proof, 'gcash')"
                          />
                        </div>

                        <!-- Upload Progress -->
                        <div v-else class="upload-progress mt-2">
                          <div class="d-flex align-items-center mb-2">
                            <div class="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                            <span class="small">Uploading payment proof...</span>
                          </div>
                          <div class="progress" style="height: 5px;">
                            <div class="progress-bar progress-bar-striped progress-bar-animated bg-success" role="progressbar" style="width: 100%"></div>
                          </div>
                        </div>

                        <!-- Preview Selected File -->
                        <div v-if="selectedFiles['gcash-' + proof.id]" class="mt-3">
                          <div class="alert alert-info py-2 mb-2">
                            <small>
                              <i class="fas fa-file-image me-1"></i>
                              <strong>Selected:</strong> {{ selectedFiles['gcash-' + proof.id].name }}
                            </small>
                          </div>
                          
                          <!-- Optional Reference Number -->
                          <div class="mb-2">
                            <input
                              v-model="gcashReferenceNumbers[proof.id]"
                              type="text"
                              class="form-control form-control-sm"
                              placeholder="GCash Reference Number (Optional)"
                            />
                          </div>
                          
                          <div class="d-flex gap-2 flex-wrap">
                            <button
                              class="btn btn-success btn-sm"
                              @click="uploadGCashProof(proof)"
                              :disabled="uploadingDocuments['gcash-' + proof.id]"
                            >
                              <i class="fas fa-check me-1"></i>
                              Confirm Upload
                            </button>
                            <button
                              class="btn btn-outline-secondary btn-sm"
                              @click="cancelFileSelection('gcash-' + proof.id)"
                              :disabled="uploadingDocuments['gcash-' + proof.id]"
                            >
                              <i class="fas fa-times me-1"></i>
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Beneficiary Verification Documents Section -->
            <div v-if="rejectedBeneficiaryVerifications.length > 0" class="mb-5">
              <h4 class="section-title mb-3">
                <i class="fas fa-user-check me-2 text-danger"></i>
                Rejected Beneficiary Verification Documents
              </h4>
              <div class="document-list">
                <div v-for="verification in rejectedBeneficiaryVerifications" :key="'beneficiary-' + verification.id" class="document-list-item">
                  <div class="document-card">
                    <!-- Document Type Header -->
                    <div class="card-header bg-danger text-white">
                      <h6 class="mb-0">
                        <i class="fas fa-user-check me-2"></i>
                        Beneficiary Verification
                      </h6>
                    </div>

                    <!-- Document Content -->
                    <div class="card-body">
                      <div class="document-details mb-3">
                        <p class="card-text mb-2">
                          <strong>Beneficiary:</strong> {{ verification.first_name }} {{ verification.last_name }}<br>
                          <strong>Relationship:</strong> {{ formatRelationship(verification.relationship_to_requestor) }}<br>
                          <strong>Document Type:</strong> {{ getDocumentTypeName(verification.relationship_to_requestor) }}<br>
                          <strong>Request:</strong> {{ verification.request_number || 'N/A' }}<br>
                          <strong>Rejected:</strong> {{ formatDate(verification.verified_at || verification.created_at) }}
                        </p>
                      </div>

                      <!-- Reupload Section -->
                      <div class="reupload-section">
                        <div v-if="!uploadingDocuments['beneficiary-' + verification.id]" class="d-flex gap-2 flex-wrap">
                          <label :for="`file-input-beneficiary-${verification.id}`" class="btn btn-warning btn-sm">
                            <i class="fas fa-upload me-1"></i>
                            Reupload Document
                          </label>
                          <input
                            :id="`file-input-beneficiary-${verification.id}`"
                            type="file"
                            class="d-none"
                            accept=".jpg,.jpeg,.png,.pdf,.webp"
                            @change="handleFileSelect($event, verification, 'beneficiary')"
                          />
                        </div>

                        <!-- Upload Progress -->
                        <div v-else class="upload-progress mt-2">
                          <div class="d-flex align-items-center mb-2">
                            <div class="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                            <span class="small">Uploading...</span>
                          </div>
                          <div class="progress" style="height: 5px;">
                            <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style="width: 100%"></div>
                          </div>
                        </div>

                        <!-- Preview Selected File -->
                        <div v-if="selectedFiles['beneficiary-' + verification.id]" class="mt-3">
                          <div class="alert alert-info py-2 mb-2">
                            <small>
                              <i class="fas fa-file me-1"></i>
                              <strong>Selected:</strong> {{ selectedFiles['beneficiary-' + verification.id].name }}
                            </small>
                          </div>
                          <div class="d-flex gap-2 flex-wrap">
                            <button
                              class="btn btn-success btn-sm"
                              @click="uploadBeneficiaryDocument(verification)"
                              :disabled="uploadingDocuments['beneficiary-' + verification.id]"
                            >
                              <i class="fas fa-check me-1"></i>
                              Confirm Upload
                            </button>
                            <button
                              class="btn btn-outline-secondary btn-sm"
                              @click="cancelFileSelection('beneficiary-' + verification.id)"
                              :disabled="uploadingDocuments['beneficiary-' + verification.id]"
                            >
                              <i class="fas fa-times me-1"></i>
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Rejected Pickup Persons Section -->
            <div v-if="rejectedPickupPersons.length > 0" class="mb-5">
              <h4 class="section-title mb-3">
                <i class="fas fa-user-times me-2 text-danger"></i>
                Rejected Authorized Pickup Persons
              </h4>
              <div class="document-list">
                <div v-for="pickup in rejectedPickupPersons" :key="'pickup-' + pickup.id" class="document-list-item">
                  <div class="document-card">
                    <!-- Document Type Header -->
                    <div class="card-header bg-danger text-white">
                      <h6 class="mb-0">
                        <i class="fas fa-user-shield me-2"></i>
                        Authorized Pickup Person
                      </h6>
                    </div>

                    <!-- Document Content -->
                    <div class="card-body">
                      <div class="document-details mb-3">
                        <p class="card-text mb-2">
                          <strong>Name:</strong> {{ pickup.first_name }} {{ pickup.middle_name || '' }} {{ pickup.last_name }}<br>
                          <strong>Request:</strong> {{ pickup.request_number || 'N/A' }}<br>
                          <strong>Document Type:</strong> {{ pickup.document_type || 'N/A' }}<br>
                          <strong>Relationship:</strong> {{ pickup.relationship_to_beneficiary || 'N/A' }}<br>
                          <strong>Rejected:</strong> {{ formatDate(pickup.verified_at) }}
                        </p>
                        <div v-if="pickup.verification_notes" class="alert alert-info mt-2 mb-0">
                          <small><strong>Reason:</strong> {{ pickup.verification_notes }}</small>
                        </div>
                      </div>

                      <div class="alert alert-warning mt-3 mb-0">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        <small>Pickup authorization rejected. Please update the pickup person information and documents in your request.</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Authorization Documents Section -->
            <div v-if="rejectedAuthorizationDocuments.length > 0" class="mb-5">
              <h4 class="section-title mb-3">
                <i class="fas fa-file-signature me-2 text-danger"></i>
                Rejected Authorization Documents
              </h4>
              <div class="document-list">
                <div v-for="document in rejectedAuthorizationDocuments" :key="'authorization-' + document.id" class="document-list-item">
                  <div class="document-card">
                    <!-- Document Type Header -->
                    <div class="card-header bg-danger text-white d-flex align-items-center">
                      <i :class="getDocumentIcon(document.document_type)" class="me-2"></i>
                      <h6 class="mb-0 flex-grow-1">{{ formatDocumentType(document.document_type) }}</h6>
                    </div>

                    <!-- Document Content -->
                    <div class="card-body">
                      <div class="document-details mb-3">
                        <p class="card-text mb-2">
                          <strong>Pickup Person:</strong> {{ document.first_name }} {{ document.last_name }}<br>
                          <strong>Request:</strong> {{ document.request_number || 'N/A' }}<br>
                          <strong>File:</strong> {{ document.document_name }}<br>
                          <strong>Rejected:</strong> {{ formatDate(document.verified_at || document.created_at) }}
                        </p>
                      </div>

                      <!-- Reupload Section -->
                      <div class="reupload-section">
                        <div v-if="!uploadingDocuments['authorization-' + document.id]" class="d-flex gap-2 flex-wrap">
                          <label :for="`file-input-authorization-${document.id}`" class="btn btn-warning btn-sm">
                            <i class="fas fa-upload me-1"></i>
                            Reupload Document
                          </label>
                          <input
                            :id="`file-input-authorization-${document.id}`"
                            type="file"
                            class="d-none"
                            accept=".jpg,.jpeg,.png,.pdf,.webp"
                            @change="handleFileSelect($event, document, 'authorization')"
                          />
                        </div>

                        <!-- Upload Progress -->
                        <div v-else class="upload-progress mt-2">
                          <div class="d-flex align-items-center mb-2">
                            <div class="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                            <span class="small">Uploading...</span>
                          </div>
                          <div class="progress" style="height: 5px;">
                            <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style="width: 100%"></div>
                          </div>
                        </div>

                        <!-- Preview Selected File -->
                        <div v-if="selectedFiles['authorization-' + document.id]" class="mt-3">
                          <div class="alert alert-info py-2 mb-2">
                            <small>
                              <i class="fas fa-file me-1"></i>
                              <strong>Selected:</strong> {{ selectedFiles['authorization-' + document.id].name }}
                            </small>
                          </div>
                          <div class="d-flex gap-2 flex-wrap">
                            <button
                              class="btn btn-success btn-sm"
                              @click="uploadAuthorizationDocument(document)"
                              :disabled="uploadingDocuments['authorization-' + document.id]"
                            >
                              <i class="fas fa-check me-1"></i>
                              Confirm Upload
                            </button>
                            <button
                              class="btn btn-outline-secondary btn-sm"
                              @click="cancelFileSelection('authorization-' + document.id)"
                              :disabled="uploadingDocuments['authorization-' + document.id]"
                            >
                              <i class="fas fa-times me-1"></i>
                              Cancel
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
        </div>
      </div>
    </div>

    <!-- Document Viewer Modal -->
    <DocumentViewer 
      v-if="selectedDocument" 
      :document="selectedDocument" 
      @close="closeDocumentViewer"
    />
  </div>
</template>

<script>
import residencyService from '@/services/residencyService';
import supportingDocumentService from '@/services/supportingDocumentService';
import beneficiaryVerificationService from '@/services/beneficiaryVerificationService';
import authorizationDocumentService from '@/services/authorizationDocumentService';
import gcashPaymentService from '@/services/gcashPaymentService';
import documentRequestService from '@/services/documentRequestService';
import api from '@/services/api';
import DocumentViewer from '@/components/admin/DocumentViewer.vue';

export default {
  name: 'RejectedDocuments',
  components: {
    DocumentViewer
  },
  data() {
    return {
      rejectedDocuments: [],
      rejectedSupportingDocuments: [],
      rejectedGCashProofs: [],
      rejectedBeneficiaryVerifications: [],
      rejectedAuthorizationDocuments: [],
      rejectedPickupPersons: [],
      loading: false,
      error: null,
      selectedDocument: null,
      documentBlobUrls: {},
      selectedFiles: {},
      uploadingDocuments: {},
      gcashReferenceNumbers: {},
      isDestroyed: false
    };
  },
  computed: {
    hasNoRejectedDocuments() {
      return (
        (!this.rejectedDocuments || this.rejectedDocuments.length === 0) &&
        (!this.rejectedGCashProofs || this.rejectedGCashProofs.length === 0) &&
        (!this.rejectedSupportingDocuments || this.rejectedSupportingDocuments.length === 0) &&
        (!this.rejectedPickupPersons || this.rejectedPickupPersons.length === 0) &&
        (!this.rejectedBeneficiaryVerifications || this.rejectedBeneficiaryVerifications.length === 0) &&
        (!this.rejectedAuthorizationDocuments || this.rejectedAuthorizationDocuments.length === 0)
      );
    }
  },
  mounted() {
    this.loadRejectedDocuments();
  },
  beforeUnmount() {
    this.isDestroyed = true;
    // Clean up blob URLs
    Object.values(this.documentBlobUrls).forEach(url => {
      URL.revokeObjectURL(url);
    });
  },
  methods: {
    async loadRejectedDocuments() {
      this.loading = true;
      this.error = null;

      try {
        // Load all types of rejected documents in parallel
        const [residencyRes, supportingRes, beneficiaryRes, authorizationRes, pickupRes, gcashRes] = await Promise.all([
          residencyService.getRejectedDocuments(),
          supportingDocumentService.getRejectedDocuments(),
          beneficiaryVerificationService.getRejectedVerifications(),
          authorizationDocumentService.getRejectedDocuments(),
          api.get('/authorized-pickup/rejected/list'),
          this.loadRejectedGCashProofs()
        ]);
        
        if (residencyRes.success) {
          this.rejectedDocuments = residencyRes.data || [];
        }
        
        if (supportingRes.success) {
          this.rejectedSupportingDocuments = supportingRes.data || [];
        }
        
        if (beneficiaryRes.success) {
          this.rejectedBeneficiaryVerifications = beneficiaryRes.data || [];
        }
        
        if (authorizationRes.success) {
          this.rejectedAuthorizationDocuments = authorizationRes.data || [];
        }

        if (pickupRes.data && pickupRes.data.success) {
          this.rejectedPickupPersons = pickupRes.data.data || [];
        }

        // Handle GCash proofs response
        if (gcashRes && !gcashRes.success) {
          console.warn('⚠️ GCash proofs loading failed:', gcashRes.error);
        }

        // Load thumbnails for image documents
        await this.loadDocumentThumbnails();
      } catch (error) {
        console.error('Failed to load rejected documents:', error);
        this.error = error.message || 'Failed to load rejected documents';
      } finally {
        this.loading = false;
      }
    },

    async loadDocumentThumbnails() {
      for (const document of this.rejectedDocuments) {
        if (this.isDestroyed) return;
        
        if (this.isImageDocument(document)) {
          try {
            const response = await api.get(`/residency/documents/${document.id}/file`, {
              responseType: 'blob'
            });

            if (!this.isDestroyed) {
              const blob = new Blob([response.data], { type: document.mime_type });
              this.documentBlobUrls[document.id] = URL.createObjectURL(blob);
            }
          } catch (error) {
            console.error(`Failed to load thumbnail for document ${document.id}:`, error);
          }
        }
      }
    },

    handleFileSelect(event, document, type = 'residency') {
      const file = event.target.files[0];
      if (!file) return;

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        this.$toast?.error('Invalid file type. Please upload JPG, PNG, WEBP, or PDF files.');
        event.target.value = '';
        return;
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        this.$toast?.error('File size exceeds 10MB. Please upload a smaller file.');
        event.target.value = '';
        return;
      }

      // Store selected file with type prefix
      const key = type === 'residency' ? document.id : `${type}-${document.id}`;
      this.selectedFiles[key] = file;
    },

    async uploadDocument(document) {
      const file = this.selectedFiles[document.id];
      if (!file) return;

      this.uploadingDocuments[document.id] = true;

      try {
        // Pass the document type to match backend middleware field name expectations
        const response = await residencyService.reuploadDocument(
          document.id, 
          file, 
          document.document_type
        );
        
        if (response.success) {
          alert('✅ Document uploaded successfully! It will be reviewed by admin.');
          
          // Remove from rejected list (optimistic update)
          this.rejectedDocuments = this.rejectedDocuments.filter(d => d.id !== document.id);
          
          // Clean up
          delete this.selectedFiles[document.id];
          
          // Clear file input
          const fileInput = document.getElementById(`file-input-${document.id}`);
          if (fileInput) fileInput.value = '';
        } else {
          throw new Error(response.message || 'Failed to upload document');
        }
      } catch (error) {
        console.error('Failed to upload document:', error);
        this.$toast?.error(error.message || 'Failed to upload document');
      } finally {
        delete this.uploadingDocuments[document.id];
      }
    },

    async uploadSupportingDocument(document) {
      const file = this.selectedFiles[`supporting-${document.id}`];
      if (!file) return;

      this.uploadingDocuments[`supporting-${document.id}`] = true;

      try {
        const response = await supportingDocumentService.reuploadDocument(
          document.id,
          file
        );
        
        if (response.success) {
          alert('✅ Supporting document uploaded successfully! It will be reviewed by admin.');
          
          // Remove from rejected list
          this.rejectedSupportingDocuments = this.rejectedSupportingDocuments.filter(d => d.id !== document.id);
          
          // Clean up
          delete this.selectedFiles[`supporting-${document.id}`];
          
          // Clear file input
          const fileInput = document.getElementById(`file-input-supporting-${document.id}`);
          if (fileInput) fileInput.value = '';
        } else {
          throw new Error(response.message || 'Failed to upload document');
        }
      } catch (error) {
        console.error('Failed to upload supporting document:', error);
        this.$toast?.error(error.message || 'Failed to upload document');
      } finally {
        delete this.uploadingDocuments[`supporting-${document.id}`];
      }
    },

    async uploadBeneficiaryDocument(verification) {
      const file = this.selectedFiles[`beneficiary-${verification.id}`];
      if (!file) return;

      this.uploadingDocuments[`beneficiary-${verification.id}`] = true;

      try {
        const response = await beneficiaryVerificationService.reuploadDocument(
          verification.id,
          file
        );
        
        if (response.success) {
          alert('✅ Beneficiary document uploaded successfully! It will be reviewed by admin.');
          
          // Remove from rejected list
          this.rejectedBeneficiaryVerifications = this.rejectedBeneficiaryVerifications.filter(v => v.id !== verification.id);
          
          // Clean up
          delete this.selectedFiles[`beneficiary-${verification.id}`];
          
          // Clear file input
          const fileInput = document.getElementById(`file-input-beneficiary-${verification.id}`);
          if (fileInput) fileInput.value = '';
        } else {
          throw new Error(response.message || 'Failed to upload document');
        }
      } catch (error) {
        console.error('Failed to upload beneficiary document:', error);
        this.$toast?.error(error.message || 'Failed to upload document');
      } finally {
        delete this.uploadingDocuments[`beneficiary-${verification.id}`];
      }
    },

    async uploadAuthorizationDocument(document) {
      const file = this.selectedFiles[`authorization-${document.id}`];
      if (!file) return;

      this.uploadingDocuments[`authorization-${document.id}`] = true;

      try {
        const response = await authorizationDocumentService.reuploadDocument(
          document.id,
          file
        );
        
        if (response.success) {
          alert('✅ Authorization document uploaded successfully! It will be reviewed by admin.');
          
          // Remove from rejected list
          this.rejectedAuthorizationDocuments = this.rejectedAuthorizationDocuments.filter(d => d.id !== document.id);
          
          // Clean up
          delete this.selectedFiles[`authorization-${document.id}`];
          
          // Clear file input
          const fileInput = document.getElementById(`file-input-authorization-${document.id}`);
          if (fileInput) fileInput.value = '';
        } else {
          throw new Error(response.message || 'Failed to upload document');
        }
      } catch (error) {
        console.error('Failed to upload authorization document:', error);
        this.$toast?.error(error.message || 'Failed to upload document');
      } finally {
        delete this.uploadingDocuments[`authorization-${document.id}`];
      }
    },

    cancelFileSelection(documentId) {
      delete this.selectedFiles[documentId];
      // Handle different input ID formats
      let fileInput = document.getElementById(`file-input-${documentId}`);
      if (!fileInput) {
        // Try with type prefix
        const types = ['supporting', 'beneficiary', 'authorization'];
        for (const type of types) {
          const id = documentId.replace(`${type}-`, '');
          fileInput = document.getElementById(`file-input-${type}-${id}`);
          if (fileInput) break;
        }
      }
      if (fileInput) fileInput.value = '';
    },

    viewDocument(document) {
      this.selectedDocument = document;
    },

    closeDocumentViewer() {
      this.selectedDocument = null;
    },

    isImageDocument(document) {
      const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      return imageTypes.includes(document.mime_type?.toLowerCase());
    },

    getDocumentIcon(type) {
      const iconMap = {
        // Residency documents
        'utility_bill': 'fas fa-file-invoice',
        'barangay_certificate': 'fas fa-certificate',
        'valid_id': 'fas fa-id-card',
        'lease_contract': 'fas fa-file-contract',
        'other': 'fas fa-file',
        // Supporting documents
        'government_id': 'fas fa-id-card',
        'proof_of_residency': 'fas fa-home',
        'cedula': 'fas fa-file-invoice-dollar',
        // Authorization documents
        'authorization_letter': 'fas fa-file-signature',
        'additional_proof': 'fas fa-file-alt'
      };
      return iconMap[type] || 'fas fa-file';
    },

    formatDocumentType(type) {
      const typeLabels = {
        // Residency documents
        'utility_bill': 'Utility Bill',
        'barangay_certificate': 'Barangay Certificate',
        'valid_id': 'Valid ID',
        'lease_contract': 'Lease Contract',
        'other': 'Other Document',
        // Supporting documents
        'government_id': 'Government ID',
        'proof_of_residency': 'Proof of Residency',
        'cedula': 'Community Tax Certificate (Cedula)',
        // Authorization documents
        'authorization_letter': 'Authorization Letter',
        'additional_proof': 'Additional Proof'
      };
      return typeLabels[type] || type;
    },

    formatFileSize(bytes) {
      if (!bytes) return 'Unknown size';
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(1024));
      return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    },

    formatDate(dateString) {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    formatRelationship(relationship) {
      const relationships = {
        'spouse': 'Spouse',
        'child': 'Child',
        'parent': 'Parent',
        'sibling': 'Sibling',
        'self': 'Self'
      };
      return relationships[relationship] || relationship;
    },

    getDocumentTypeName(relationship) {
      // Return the required document type based on relationship
      if (relationship === 'spouse') {
        return 'Marriage Certificate';
      }
      return 'PSA Birth Certificate';
    },

    // GCash Payment Methods
    async loadRejectedGCashProofs() {
      try {
        console.log('🔄 Loading rejected GCash proofs...');
        console.log('🔐 Checking authentication token...');

        // Check authentication
        const authToken = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
        if (!authToken) {
          console.warn('⚠️ No authentication token found');
          this.rejectedGCashProofs = [];
          return { success: false, error: 'Not authenticated' };
        }

        // Get all requests for the current client
        const response = await documentRequestService.getMyRequests();
        console.log('📋 My requests response:', response);

        if (response.success && response.data) {
          console.log('📊 Total requests received:', response.data.length);

          // Handle different response structures
          const requests = response.data.requests || response.data;

          // Filter requests with rejected GCash payment proofs
          const rejectedProofs = requests.filter(request => {
            const isRejected = request.gcash_verification_status === 'rejected';
            const isGCash = request.payment_method_code === 'GCASH_MANUAL';
            console.log('🔍 Checking request:', request.id, {
              gcash_status: request.gcash_verification_status,
              payment_method: request.payment_method_code,
              isRejected,
              isGCash
            });
            return isRejected && isGCash;
          });

          console.log('🔍 Filtered rejected GCash proofs:', rejectedProofs);
          this.rejectedGCashProofs = rejectedProofs || [];
        } else {
          console.warn('⚠️ No requests data received:', response);
          this.rejectedGCashProofs = [];
        }

        // Return success for Promise.all
        return { success: true };
      } catch (error) {
        console.error('❌ Failed to load rejected GCash proofs:', error);
        this.rejectedGCashProofs = [];
        // Return error for Promise.all
        return { success: false, error: error.message };
      }
    },

    async uploadGCashProof(proof) {
      const key = `gcash-${proof.id}`;
      const file = this.selectedFiles[key];
      if (!file) return;

      this.uploadingDocuments[key] = true;

      try {
        const referenceNumber = this.gcashReferenceNumbers[proof.id] || null;
        const response = await gcashPaymentService.reuploadPaymentProof(
          proof.id,
          file,
          referenceNumber
        );

        if (response && response.data && response.data.success) {
          this.$toast?.success('Payment proof reuploaded successfully! Awaiting admin verification.');

          // Remove from rejected list
          this.rejectedGCashProofs = this.rejectedGCashProofs.filter(p => p.id !== proof.id);

          // Clear selected file and reference number
          delete this.selectedFiles[key];
          delete this.gcashReferenceNumbers[proof.id];

          // Clear file input
          const fileInput = document.getElementById(`file-input-gcash-${proof.id}`);
          if (fileInput) fileInput.value = '';
        } else {
          throw new Error(response?.data?.message || response?.message || 'Failed to reupload payment proof');
        }
      } catch (error) {
        console.error('Failed to reupload GCash proof:', error);

        let errorMessage = 'Failed to reupload payment proof';
        if (error.response?.status === 400) {
          errorMessage = error.response.data?.error || 'Invalid payment proof. Please check your file and try again.';
        } else if (error.response?.status === 401) {
          errorMessage = 'Authentication failed. Please log in again.';
          this.$router.push('/login');
        } else if (error.response?.status === 404) {
          errorMessage = 'Request not found. Please refresh the page.';
        } else if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
        } else {
          errorMessage = error.message || 'Failed to reupload payment proof';
        }

        this.$toast?.error(errorMessage);
      } finally {
        this.uploadingDocuments[key] = false;
      }
    },

    formatCurrency(amount) {
      if (!amount && amount !== 0) return '0.00';
      return parseFloat(amount).toFixed(2);
    }
  }
}  
</script>
<style scoped>
.rejected-documents-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding-bottom: 3rem;
}

.page-header {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 2rem;
}

.page-header h2 {
  color: #2c3e50;
  font-weight: 700;
  font-size: 1.75rem;
}

.page-header p {
  color: #6c757d;
  font-size: 0.95rem;
}

.section-title {
  font-weight: 700;
  color: #2c3e50;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 10px;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-title i {
  font-size: 1.3rem;
}

/* List Layout Styles */
.document-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.document-list-item {
  width: 100%;
  animation: fadeInUp 0.4s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.document-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.document-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(220, 53, 69, 0.25);
}

.document-card .card-header {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border: none;
  padding: 1rem 1.25rem;
  font-weight: 600;
}

.document-card .card-body {
  padding: 1.5rem;
}

/* Document Preview Styles */
.document-preview {
  position: relative;
  width: 140px;
  height: 105px;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 10px;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.document-preview:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.document-preview:hover .preview-image {
  transform: scale(1.1);
}

.file-icon-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: white;
}

.file-icon-preview i {
  font-size: 3rem;
  opacity: 0.9;
}

.preview-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.95) 0%, rgba(118, 75, 162, 0.95) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 10px;
}

.document-preview:hover .preview-overlay {
  opacity: 1;
}

.preview-overlay i {
  font-size: 2rem;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.loading-preview {
  height: 105px;
  width: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
}

.loading-preview .spinner-border {
  color: white;
}

.document-info {
  min-width: 0;
  flex: 1;
}

/* Document Details */
.document-details {
  margin-bottom: 1.25rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.document-details p {
  margin-bottom: 0.5rem;
  line-height: 1.6;
  color: #495057;
}

.document-details strong {
  color: #2c3e50;
  font-weight: 600;
}

/* Reupload Section */
.reupload-section {
  border-top: 2px solid #e9ecef;
  padding-top: 1.25rem;
  margin-top: 1rem;
}

.reupload-section .btn {
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.reupload-section .btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.reupload-section .btn-warning {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border: none;
  color: white;
}

.reupload-section .btn-success {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  border: none;
}

.reupload-section .btn-outline-primary {
  border: 2px solid #667eea;
  color: #667eea;
}

.reupload-section .btn-outline-primary:hover {
  background: #667eea;
  color: white;
}

.upload-progress {
  padding: 1rem;
  background: linear-gradient(135deg, #e0f7fa 0%, #e1f5fe 100%);
  border-radius: 10px;
  border: 2px solid #4fc3f7;
}

.upload-progress .progress {
  height: 8px;
  border-radius: 10px;
  background: white;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

.upload-progress .progress-bar {
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}

/* Alert Styles */
.alert {
  border-radius: 10px;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.alert-info {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  color: #1565c0;
  border-left: 4px solid #2196f3;
}

.alert-warning {
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
  color: #e65100;
  border-left: 4px solid #ff9800;
}

.alert-danger {
  background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
  color: #c62828;
  border-left: 4px solid #f44336;
}

/* Badge Styles */
.badge {
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-weight: 500;
  font-size: 0.75rem;
}

/* Empty State */
.empty-state {
  padding: 4rem 2rem;
  text-align: center;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.empty-state i {
  animation: bounceIn 0.8s ease-out;
}

@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.empty-state h4 {
  color: #2c3e50;
  font-weight: 700;
}

.empty-state .btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 25px;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
}

.empty-state .btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
}

/* Loading State */
.spinner-border {
  width: 3rem;
  height: 3rem;
}

/* Button Styles */
.btn-outline-secondary {
  border: 2px solid #6c757d;
  color: #6c757d;
  border-radius: 8px;
  padding: 0.5rem 1.25rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-outline-secondary:hover {
  background: #6c757d;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
}

/* Responsive Design */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 1rem;
  }

  .page-header h2 {
    font-size: 1.5rem;
  }

  .document-card .card-body {
    padding: 1rem;
    flex-direction: column;
  }

  .document-preview {
    width: 100%;
    height: 200px;
    margin-bottom: 1rem;
  }

  .loading-preview {
    height: 200px;
    width: 100%;
  }

  .section-title {
    font-size: 1.1rem;
    padding: 0.75rem 1rem;
  }

  .reupload-section .btn {
    width: 100%;
    margin-bottom: 0.5rem;
  }
}

@media (max-width: 576px) {
  .container {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .page-header {
    padding: 1rem;
  }

  .document-card .card-body {
    padding: 0.75rem;
  }
}
</style>