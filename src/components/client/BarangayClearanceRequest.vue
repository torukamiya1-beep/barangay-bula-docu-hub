<template>
  <div class="barangay-clearance-request">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-main">
          <h1 class="page-title">
            <i class="fas fa-certificate"></i>
            Barangay Clearance Request
          </h1>
          <p class="page-description">
            Apply for your Barangay Clearance certificate online
          </p>
        </div>
        <button class="back-btn" @click="goBack">
          <i class="fas fa-arrow-left"></i>
          Back
        </button>
      </div>
    </div>

    <!-- Page Content -->
    <div class="page-content">
      <!-- Progress Steps -->
    <div class="progress-steps">
      <div class="step" :class="{ active: currentStep >= 1, completed: currentStep > 1 }">
        <div class="step-number">1</div>
        <span class="step-label">Upload Documents</span>
      </div>
      <div class="step" :class="{ active: currentStep >= 2, completed: currentStep > 2 }">
        <div class="step-number">2</div>
        <span class="step-label">Purpose & Details</span>
      </div>
      <div class="step" :class="{ active: currentStep >= 3, completed: currentStep > 3 }">
        <div class="step-number">3</div>
        <span class="step-label">Payment</span>
      </div>
      <div class="step" :class="{ active: currentStep >= 4 }">
        <div class="step-number">4</div>
        <span class="step-label">Review & Submit</span>
      </div>
    </div>

    <!-- Form Container -->
    <div class="form-container">
      <form @submit.prevent="handleSubmit">
        
        <!-- Step 1: Personal Information -->
        <div v-if="currentStep === 1" class="form-step">
          <div class="step-header">
            <h2>Personal Information</h2>
            <p>Choose who this document is for</p>
          </div>

          <!-- Request Type Selection -->
          <div class="form-section">
            <h3>Who is this document for?</h3>
            <div class="request-type-options">
              <label class="radio-option">
                <input
                  type="radio"
                  v-model="formData.is_third_party_request"
                  :value="false"
                  @change="handleRequestTypeChange"
                >
                <span class="radio-custom"></span>
                <div class="option-content">
                  <strong>For myself</strong>
                  <p>Request document using my profile information</p>
                </div>
              </label>

              <label class="radio-option">
                <input
                  type="radio"
                  v-model="formData.is_third_party_request"
                  :value="true"
                  @change="handleRequestTypeChange"
                >
                <span class="radio-custom"></span>
                <div class="option-content">
                  <strong>For someone else</strong>
                  <p>Request document on behalf of another person</p>
                </div>
              </label>
            </div>
          </div>

          <!-- Profile Preview (shown when requesting for self) -->
          <div v-if="!formData.is_third_party_request" class="profile-preview">
            <div class="profile-card">
              <div class="profile-info">
                <h3>{{ getFullName() }}</h3>
                <div class="info-grid">
                  <div class="info-item">
                    <label>Email:</label>
                    <span>{{ (clientData?.email || clientData?.profile?.email) || 'Not provided' }}</span>
                  </div>
                  <div class="info-item">
                    <label>Phone:</label>
                    <span>{{ (clientData?.phone_number || clientData?.profile?.phone_number) || 'Not provided' }}</span>
                  </div>
                  <div class="info-item">
                    <label>Address:</label>
                    <span>{{ getFullAddress() }}</span>
                  </div>
                  <div class="info-item">
                    <label>Date of Birth:</label>
                    <span>{{ formatDate(clientData?.birth_date || clientData?.profile?.birth_date) }}</span>
                  </div>
                  <div class="info-item">
                    <label>Gender:</label>
                    <span>{{ (clientData?.gender || clientData?.profile?.gender) || 'Not provided' }}</span>
                  </div>
                  <div class="info-item">
                    <label>Civil Status:</label>
                    <span>{{ getCivilStatusName(clientData?.civil_status_id || clientData?.profile?.civil_status_id) }}</span>
                  </div>
                  <div class="info-item">
                    <label>Nationality:</label>
                    <span>{{ (clientData?.nationality || clientData?.profile?.nationality) || 'Not provided' }}</span>
                  </div>
                  <div class="info-item">
                    <label>Years of Residency:</label>
                    <span>{{ getResidencyDisplay() }}</span>
                  </div>
                </div>
              </div>
              <!-- ill comment this status because I dont use this -->
              <!-- <div class="profile-actions">
                <button type="button" class="update-profile-btn" @click="updateProfile">
                  <i class="fas fa-edit"></i>
                  Update Profile
                </button>
              </div> -->
            </div>
          </div>

          <!-- Beneficiary Information Form (shown when third-party is selected) -->
          <div v-if="formData.is_third_party_request" class="beneficiary-section">
            <h3>Person this document is for</h3>

            <div class="form-grid">
              <div class="form-group">
                <label>First Name *</label>
                <input
                  type="text"
                  v-model="formData.beneficiary.first_name"
                  required
                  class="form-control"
                >
              </div>

              <div class="form-group">
                <label>Middle Name</label>
                <input
                  type="text"
                  v-model="formData.beneficiary.middle_name"
                  class="form-control"
                >
              </div>

              <div class="form-group">
                <label>Last Name *</label>
                <input
                  type="text"
                  v-model="formData.beneficiary.last_name"
                  required
                  class="form-control"
                >
              </div>

              <div class="form-group">
                <label>Date of Birth *</label>
                <input
                  type="date"
                  v-model="formData.beneficiary.birth_date"
                  required
                  class="form-control"
                >
              </div>

              <div class="form-group">
                <label>Gender *</label>
                <select v-model="formData.beneficiary.gender" required class="form-control" @change="handleGenderChange">
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <div class="form-group" v-if="formData.beneficiary.gender === 'male'">
                <label>Suffix</label>
                <select v-model="formData.beneficiary.suffix" class="form-control">
                  <option value="">None</option>
                  <option value="Jr">Jr</option>
                  <option value="Sr">Sr</option>
                  <option value="II">II</option>
                  <option value="III">III</option>
                </select>
              </div>

              <div class="form-group">
                <label>Civil Status *</label>
                <select v-model="formData.beneficiary.civil_status_id" required class="form-control">
                  <option value="">Select Status</option>
                  <option v-for="status in civilStatuses" :key="status.id" :value="status.id">
                    {{ status.status_name }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label>Relationship to You *</label>
                <select v-model="formData.beneficiary.relationship_to_requestor" required class="form-control" @change="validateFamilyRelationship">
                  <option value="">Select Relationship</option>
                  <option value="spouse">Spouse</option>
                  <option value="child">Child</option>
                  <option value="parent">Parent</option>
                  <option value="sibling">Sibling</option>
                </select>
                <small class="form-text text-muted">
                  Note: You can only request documents on behalf of immediate family members (spouse, children, parents, siblings).
                </small>
                <div v-if="familyRelationshipError" class="alert alert-danger mt-2">
                  {{ familyRelationshipError }}
                </div>
              </div>
            </div>

            <!-- Family Member Verification -->
            <div class="verification-section">
              <h4>Family Member Verification</h4>
              <div class="alert alert-info">
                <i class="fas fa-info-circle"></i>
                {{ familyVerificationText }}
              </div>

              <FileUpload
                label="Family Member Verification Image"
                :placeholder="familyVerificationPlaceholder"
                :required="true"
                accepted-types="image/*"
                accepted-types-text="Accepted: JPEG, PNG, GIF (Max 5MB)"
                help-text="Upload a clear photo of the family member's valid government-issued ID for verification purposes."
                @file-selected="handleBeneficiaryVerificationFile"
                @upload-success="onBeneficiaryVerificationUpload"
                @upload-error="onBeneficiaryVerificationError"
                @file-removed="onBeneficiaryVerificationRemoved"
              />
            </div>

            <!-- Address Information -->
            <h4>Address Information</h4>
            <div class="form-grid">
              <div class="form-group">
                <label>House Number</label>
                <input type="text" v-model="formData.beneficiary.house_number" class="form-control">
              </div>

              <div class="form-group">
                <label>Street</label>
                <input type="text" v-model="formData.beneficiary.street" class="form-control">
              </div>

              <!-- Hidden address fields with default values -->
              <input type="hidden" v-model="formData.beneficiary.region_code">
              <input type="hidden" v-model="formData.beneficiary.province_code">
              <input type="hidden" v-model="formData.beneficiary.city_code">
              <input type="hidden" v-model="formData.beneficiary.barangay_code">

              <!-- Display current address -->
              <div class="form-group col-span-2">
                <div class="alert alert-info">
                  <h6><i class="fas fa-map-marker-alt me-2"></i>Address Information</h6>
                  <p class="mb-0">
                    <strong>Region:</strong> Region XII (SOCCSKSARGEN)<br>
                    <strong>Province:</strong> South Cotabato<br>
                    <strong>City/Municipality:</strong> General Santos City (Dadiangas)<br>
                    <strong>Barangay:</strong> Bula
                  </p>
                </div>
              </div>
            </div>

            <!-- Contact Information -->
            <h4>Contact Information</h4>
            <div class="form-grid">
              <div class="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  v-model="formData.beneficiary.phone_number"
                  class="form-control"
                  @input="handlePhoneInput($event, 'beneficiary')"
                  placeholder="09123456789"
                  maxlength="11"
                  pattern="[0-9]*"
                >
              </div>

              <div class="form-group">
                <label>Email Address</label>
                <input type="email" v-model="formData.beneficiary.email" class="form-control">
              </div>
            </div>


          </div>

          <!-- Required Documents Upload -->
          <div class="form-section">
            <h3><i class="fas fa-upload"></i> Required Documents</h3>
            <p class="section-description">Please upload the following required documents as per government regulations:</p>

            <!-- Valid Government ID -->
            <div class="document-upload-group">
              <label class="document-label">
                <i class="fas fa-id-card"></i>
                Valid Government ID *
                <span class="document-info">(Driver's License, Voter's ID, Passport, etc.)</span>
              </label>
              <div class="file-upload-area" @click="triggerFileInput('government_id')" @dragover.prevent @drop.prevent="handleFileDrop($event, 'government_id')">
                <input
                  ref="governmentIdInput"
                  type="file"
                  accept="image/*,.pdf"
                  @change="handleFileSelect($event, 'government_id')"
                  style="display: none"
                  required
                />
                <div v-if="!uploadedFiles.government_id" class="upload-placeholder">
                  <i class="fas fa-cloud-upload-alt"></i>
                  <p>Click to upload or drag and drop</p>
                  <small>JPG, PNG, PDF (Max 5MB)</small>
                </div>
                <div v-else class="uploaded-file">
                  <i class="fas fa-file-check"></i>
                  <span>{{ uploadedFiles.government_id.name }}</span>
                  <button type="button" @click.stop="removeFile('government_id')" class="remove-file">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
            </div>

            <!-- Proof of Residency -->
            <div class="document-upload-group">
              <label class="document-label">
                <i class="fas fa-home"></i>
                Proof of Residency *
                <span class="document-info">(Utility Bill, Lease Agreement, Barangay Certificate)</span>
              </label>
              <div class="file-upload-area" @click="triggerFileInput('proof_of_residency')" @dragover.prevent @drop.prevent="handleFileDrop($event, 'proof_of_residency')">
                <input
                  ref="proofOfResidencyInput"
                  type="file"
                  accept="image/*,.pdf"
                  @change="handleFileSelect($event, 'proof_of_residency')"
                  style="display: none"
                  required
                />
                <div v-if="!uploadedFiles.proof_of_residency" class="upload-placeholder">
                  <i class="fas fa-cloud-upload-alt"></i>
                  <p>Click to upload or drag and drop</p>
                  <small>JPG, PNG, PDF (Max 5MB)</small>
                </div>
                <div v-else class="uploaded-file">
                  <i class="fas fa-file-check"></i>
                  <span>{{ uploadedFiles.proof_of_residency.name }}</span>
                  <button type="button" @click.stop="removeFile('proof_of_residency')" class="remove-file">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
            </div>

            <!-- Community Tax Certificate (Optional) -->
            <div class="document-upload-group">
              <label class="document-label">
                <i class="fas fa-certificate"></i>
                Community Tax Certificate (Cedula)
                <span class="document-info optional">(Optional - if available)</span>
              </label>
              <div class="file-upload-area" @click="triggerFileInput('cedula')" @dragover.prevent @drop.prevent="handleFileDrop($event, 'cedula')">
                <input
                  ref="cedulaInput"
                  type="file"
                  accept="image/*,.pdf"
                  @change="handleFileSelect($event, 'cedula')"
                  style="display: none"
                />
                <div v-if="!uploadedFiles.cedula" class="upload-placeholder">
                  <i class="fas fa-cloud-upload-alt"></i>
                  <p>Click to upload or drag and drop</p>
                  <small>JPG, PNG, PDF (Max 5MB)</small>
                </div>
                <div v-else class="uploaded-file">
                  <i class="fas fa-file-check"></i>
                  <span>{{ uploadedFiles.cedula.name }}</span>
                  <button type="button" @click.stop="removeFile('cedula')" class="remove-file">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Legal Notice -->
          <div class="form-section">
            <div class="legal-notice">
              <h3><i class="fas fa-info-circle"></i> Important Notice</h3>
              <p>This barangay clearance certifies that you are a resident in good standing with no pending legal cases or disputes within the barangay. Only information required by law is collected.</p>
              <div class="data-privacy-note">
                <small><i class="fas fa-shield-alt"></i> Your personal information is protected under the Data Privacy Act of 2012.</small>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 2: Purpose and Details -->
        <div v-if="currentStep === 2" class="form-step">
          <div class="step-header">
            <h2>Purpose and Additional Details</h2>
            <p>Please provide the purpose and any additional information</p>
          </div>

          <div class="form-section">
            <div class="form-group">
              <label for="purpose_category">Purpose Category *</label>
              <select
                id="purpose_category"
                v-model="formData.purpose_category_id"
                required
                @change="onPurposeChange"
              >
                <option value="">Select purpose</option>
                <option
                  v-for="category in purposeCategories"
                  :key="category.id"
                  :value="category.id"
                >
                  {{ category.category_name }}
                </option>
              </select>
            </div>

            <div v-if="shouldShowPurposeDetails" class="form-group">
              <label for="purpose_details">Purpose Details *</label>
              <textarea
                id="purpose_details"
                v-model="formData.purpose_details"
                rows="3"
                required
                placeholder="Please provide specific details about the purpose of this clearance"
              ></textarea>
            </div>

            <div class="form-group">
              <label for="pending_cases">Pending Cases Declaration *</label>
              <div class="radio-group">
                <label class="radio-option">
                  <input
                    type="radio"
                    v-model="formData.has_pending_cases"
                    :value="false"
                    required
                  />
                  <span class="radio-custom"></span>
                  No pending cases
                </label>
                <label class="radio-option">
                  <input
                    type="radio"
                    v-model="formData.has_pending_cases"
                    :value="true"
                    required
                  />
                  <span class="radio-custom"></span>
                  Has pending cases
                </label>
              </div>
            </div>

            <div v-if="formData.has_pending_cases" class="form-group">
              <label for="pending_cases_details">Pending Cases Details *</label>
              <textarea
                id="pending_cases_details"
                v-model="formData.pending_cases_details"
                rows="3"
                required
                placeholder="Please provide details about pending cases"
              ></textarea>
            </div>

            <!-- Voter Registration Status -->
            <div class="form-group">
              <label for="voter_registration_status">Voter Registration Status *</label>
              <div class="radio-group">
                <label class="radio-option">
                  <input
                    type="radio"
                    v-model="formData.voter_registration_status"
                    :value="true"
                    required
                  />
                  <span class="radio-custom"></span>
                  Registered voter
                </label>
                <label class="radio-option">
                  <input
                    type="radio"
                    v-model="formData.voter_registration_status"
                    :value="false"
                    required
                  />
                  <span class="radio-custom"></span>
                  Not registered voter
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 3: Payment Method -->
        <div v-if="currentStep === 3" class="form-step">
          <div class="step-header">
            <h2>Payment Information</h2>
            <p>Choose your preferred payment method</p>
          </div>

          <!-- Fee Summary -->
          <div class="fee-summary">
            <div class="fee-card">
              <h3>Fee Breakdown</h3>
              <div class="fee-items">
                <div class="fee-item">
                  <span>Barangay Clearance Fee</span>
                  <span>₱{{ formatCurrency(baseFee) }}</span>
                </div>
                <div class="fee-item total">
                  <span>Total Amount</span>
                  <span>₱{{ formatCurrency(totalFee) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Payment Methods -->
          <div class="form-section">
            <h3>Select Payment Method</h3>
            <div class="payment-methods">
              <div
                v-for="method in paymentMethods"
                :key="method.id"
                class="payment-option"
                :class="{ selected: formData.payment_method_id === method.id }"
                @click="selectPaymentMethod(method.id)"
              >
                <div class="payment-icon">
                  <i :class="getPaymentIcon(method.method_code)"></i>
                </div>
                <div class="payment-info">
                  <h4>{{ method.method_name }}</h4>
                  <p v-if="method.description">{{ method.description }}</p>
                  <div v-if="method.group_type === 'group' && method.grouped_methods" class="grouped-methods-preview">
                    <small class="text-muted">
                      Includes: {{ method.grouped_methods.map(m => getPaymentMethodDisplayName(m.method_code)).join(', ') }}
                    </small>
                  </div>
                </div>
                <div class="payment-radio">
                  <input
                    type="radio"
                    :value="method.id"
                    v-model="formData.payment_method_id"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Pickup Options -->
          <div class="form-section">
            <h3>Document Pickup</h3>

            <div class="pickup-options">
              <label class="radio-option">
                <input
                  type="radio"
                  v-model="pickupOption"
                  value="self"
                  @change="handlePickupOptionChange"
                >
                <span class="radio-custom"></span>
                <div class="option-content">
                  <strong>I will pick up personally</strong>
                  <p>{{ formData.is_third_party_request ? 'You (the requestor)' : 'You' }} will collect the document</p>
                </div>
              </label>

              <label class="radio-option">
                <input
                  type="radio"
                  v-model="pickupOption"
                  value="authorized"
                  @change="handlePickupOptionChange"
                >
                <span class="radio-custom"></span>
                <div class="option-content">
                  <strong>Someone else will pick up</strong>
                  <p>Authorize another person to collect the document</p>
                </div>
              </label>
            </div>

            <!-- Authorized Pickup Person Form -->
            <div v-if="pickupOption === 'authorized'" class="authorized-pickup-form">
              <h4>Authorized Pickup Person</h4>
              <div class="alert alert-info">
                <i class="fas fa-info-circle"></i>
                You will need to upload an authorization letter and valid ID after submitting this request.
              </div>

              <div class="form-grid">
                <div class="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    v-model="formData.authorized_pickup.first_name"
                    required
                    class="form-control"
                  >
                </div>

                <div class="form-group">
                  <label>Middle Name</label>
                  <input
                    type="text"
                    v-model="formData.authorized_pickup.middle_name"
                    class="form-control"
                  >
                </div>

                <div class="form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    v-model="formData.authorized_pickup.last_name"
                    required
                    class="form-control"
                  >
                </div>

                <div class="form-group">
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    v-model="formData.authorized_pickup.phone_number"
                    required
                    class="form-control"
                    @input="handlePhoneInput($event, 'authorized_pickup')"
                    placeholder="09123456789"
                    maxlength="11"
                    pattern="[0-9]*"
                  >
                </div>

                <!-- Valid ID Image Upload -->
                <div class="form-group">
                  <FileUpload
                    label="Valid ID Image"
                    placeholder="Click to upload pickup person's valid ID"
                    :required="true"
                    accepted-types="image/*"
                    accepted-types-text="Accepted: JPEG, PNG, GIF (Max 5MB)"
                    help-text="Upload a clear photo of the pickup person's valid government-issued ID."
                    @file-selected="handlePickupIdFile"
                    @upload-success="onPickupIdUpload"
                    @upload-error="onPickupIdError"
                    @file-removed="onPickupIdRemoved"
                  />
                </div>

                <!-- Authorization Letter Upload -->
                <div class="form-group">
                  <FileUpload
                    label="Authorization Letter"
                    placeholder="Click to upload authorization letter"
                    :required="true"
                    accepted-types="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    accepted-types-text="Accepted: Images, PDF, Word documents (Max 5MB)"
                    help-text="Upload the authorization letter allowing this person to pick up the document on your behalf."
                    @file-selected="handlePickupAuthFile"
                    @upload-success="onPickupAuthUpload"
                    @upload-error="onPickupAuthError"
                    @file-removed="onPickupAuthRemoved"
                  />
                </div>

                <div class="form-group">
                  <label>Relationship to {{ formData.is_third_party_request ? 'Beneficiary' : 'You' }} *</label>
                  <select v-model="formData.authorized_pickup.relationship_to_beneficiary" required class="form-control">
                    <option value="">Select Relationship</option>
                    <option value="spouse">Spouse</option>
                    <option value="child">Child</option>
                    <option value="parent">Parent</option>
                    <option value="sibling">Sibling</option>
                    <option value="relative">Other Relative</option>
                    <option value="friend">Friend</option>
                    <option value="colleague">Colleague</option>
                    <!-- <option value="other">Other</option> -->
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 4: Review and Submit -->
        <div v-if="currentStep === 4" class="form-step">
          <div class="step-header">
            <h2>Review Your Request</h2>
            <p>Please review all information before submitting</p>
          </div>

          <div class="review-sections">
            <!-- Personal Information Review -->
            <div class="review-section">
              <h3>Personal Information</h3>
              <div class="review-grid">
                <div class="review-item">
                  <label>Full Name:</label>
                  <span>{{ getFullName() }}</span>
                </div>
                <div class="review-item">
                  <label>Address:</label>
                  <span>{{ getFullAddress() }}</span>
                </div>
                <div class="review-item">
                  <label>Phone:</label>
                  <span>{{ (clientData?.phone_number || clientData?.profile?.phone_number) || 'Not provided' }}</span>
                </div>
              </div>
            </div>



            <!-- Purpose Review -->
            <div class="review-section">
              <h3>Purpose & Details</h3>
              <div class="review-grid">
                <div class="review-item">
                  <label>Purpose:</label>
                  <span>{{ getPurposeCategoryName() }}</span>
                </div>
                <div v-if="shouldShowPurposeDetails && formData.purpose_details" class="review-item">
                  <label>Details:</label>
                  <span>{{ formData.purpose_details }}</span>
                </div>
                <div class="review-item">
                  <label>Pending Cases:</label>
                  <span>{{ formData.has_pending_cases ? 'Yes' : 'No' }}</span>
                </div>
                <div v-if="formData.has_pending_cases && formData.pending_cases_details" class="review-item">
                  <label>Case Details:</label>
                  <span>{{ formData.pending_cases_details }}</span>
                </div>
                <div class="review-item">
                  <label>Voter Registration:</label>
                  <span>{{ formData.voter_registration_status === true ? 'Registered voter' : formData.voter_registration_status === false ? 'Not registered voter' : 'Not specified' }}</span>
                </div>
              </div>
            </div>

            <!-- Payment Review -->
            <div class="review-section">
              <h3>Payment Information</h3>
              <div class="review-grid">
                <div class="review-item">
                  <label>Payment Method:</label>
                  <span>{{ getPaymentMethodName() }}</span>
                </div>
                <div class="review-item">
                  <label>Total Amount:</label>
                  <span class="amount">₱{{ formatCurrency(totalFee) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Terms and Conditions -->
          <div class="terms-section">
            <label class="checkbox-option">
              <input
                type="checkbox"
                v-model="formData.agree_to_terms"
                required
              />
              <span class="checkbox-custom"></span>
              I agree to the <a href="#" @click.prevent="showTerms">terms and conditions</a> and certify that all information provided is true and accurate.
            </label>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="form-actions">
          <button
            v-if="currentStep > 1"
            type="button"
            class="btn-secondary"
            @click="previousStep"
          >
            <i class="fas fa-chevron-left"></i>
            Previous
          </button>
          
          <button
            v-if="currentStep < 4"
            type="button"
            class="btn-primary"
            @click="nextStep"
            :disabled="!canProceedToNextStep()"
          >
            Next
            <i class="fas fa-chevron-right"></i>
          </button>
          
          <button
            v-if="currentStep === 4"
            type="submit"
            class="btn-submit"
            :disabled="submitting || !formData.agree_to_terms"
          >
            <template v-if="submitting">
              <i class="fas fa-spinner fa-spin"></i>
              Submitting...
            </template>
            <template v-else>
              <i class="fas fa-paper-plane"></i>
              Submit Request
            </template>
          </button>
        </div>
      </form>
    </div>
    </div> <!-- End page-content -->
  </div>
</template>

<script>
import api from '@/utils/api';
import documentRequestService from '@/services/documentRequestService';
import clientAuthService from '@/services/clientAuthService';
import paymentService from '@/services/paymentService';
import addressService from '@/services/addressService';
import FileUpload from '@/components/common/FileUpload.vue';

export default {
  name: 'BarangayClearanceRequest',
  components: {
    FileUpload
  },
  data() {
    return {
      currentStep: 1,
      submitting: false,
      purposeCategories: [],
      paymentMethods: [], // Grouped payment methods for display
      originalPaymentMethods: [], // Original payment methods from backend
      baseFee: 0,
      totalFee: 0,
      loadingFee: true,
      familyRelationshipError: null,
      formData: {
        document_type_id: 2, // Barangay Clearance
        purpose_category_id: '',
        purpose_details: '',
        is_third_party_request: false,

        beneficiary: {
          first_name: '',
          middle_name: '',
          last_name: '',
          suffix: '',
          birth_date: '',
          gender: '',
          civil_status_id: '',
          nationality: 'Filipino',
          phone_number: '',
          email: '',
          house_number: '',
          street: '',
          subdivision: '',
          barangay: 'Bula',
          city_municipality: 'General Santos City (Dadiangas)',
          province: 'South Cotabato',
          postal_code: '',
          years_of_residency: null,
          months_of_residency: null,
          relationship_to_requestor: '',
          region_code: '12',
          province_code: '1263',
          city_code: '126303',
          barangay_code: '126303005'
        },

        authorized_pickup: {
          first_name: '',
          middle_name: '',
          last_name: '',
          suffix: '',
          phone_number: '',
          email: '',
          relationship_to_beneficiary: ''
        },

        has_pending_cases: false,
        pending_cases_details: '',
        voter_registration_status: null,
        payment_method_id: '',
        agree_to_terms: false
      },
      uploadedFiles: {
        government_id: null,
        proof_of_residency: null,
        cedula: null,
        beneficiary_verification: null,
        pickup_id_image: null,
        pickup_authorization: null
      },
      uploadErrors: {},
      maxFileSize: 5 * 1024 * 1024, // 5MB
      allowedFileTypes: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'],

      pickupOption: 'self', // 'self' or 'authorized'
      civilStatuses: [],
      clientData: null, // Fresh profile data

      // Address dropdown data
      regions: [],
      provinces: [],
      cities: [],
      barangays: [],
      filteredProvinces: [],
      filteredCities: [],
      filteredBarangays: [],

      // Validation control
      isValidating: false
    };
  },
  computed: {
    // Keep the old method as fallback
    cachedClientData() {
      return clientAuthService.getCurrentUser();
    },

    shouldShowPurposeDetails() {
      // Show purpose details only when "Other" category (id=10) is selected
      return this.formData.purpose_category_id === 10;
    },

    familyVerificationPlaceholder() {
      // Dynamic placeholder based on relationship selection
      if (this.formData.beneficiary.relationship_to_requestor === 'spouse') {
        return 'Click to upload spouse verification image';
      }
      return 'Click to upload Philippine Statistics Authority (PSA) Image';
    },

    familyVerificationText() {
      // Dynamic verification text based on relationship selection
      if (this.formData.beneficiary.relationship_to_requestor === 'spouse') {
        return 'To verify that this person is indeed your spouse, please upload a clear photo of Marriage Application.';
      }
      return 'To verify that this person is indeed your family member, please upload a clear photo of their Philippine Statistics Authority (PSA).';
    }
  },
  async mounted() {
    await this.loadFormData();
  },
  methods: {
    async loadFormData() {
      try {
        // Load fresh profile data first
        console.log('Loading fresh profile data...');
        const profileResponse = await clientAuthService.getProfile();
        if (profileResponse.success) {
          this.clientData = profileResponse.data;
          console.log('Fresh profile data loaded:', this.clientData);
        }

        const [purposeResponse, paymentResponse] = await Promise.all([
          this.loadPurposeCategories(),
          this.loadPaymentMethods(),
          this.loadCivilStatuses(),
          this.loadAddressData(),
          this.loadCurrentFee()
        ]);

        this.purposeCategories = purposeResponse.data || [];
        this.originalPaymentMethods = paymentResponse.data || [];
        this.paymentMethods = paymentService.groupPaymentMethods(this.originalPaymentMethods);

      } catch (error) {
        console.error('Error loading form data:', error);
        // Fallback to cached data on error
        this.clientData = this.cachedClientData;
        this.showToast('Error', 'Failed to load some form data', 'error');
      }
    },

    async loadCurrentFee() {
      try {
        this.loadingFee = true;
        const response = await api.get('/document-fees/2/current'); // Document type ID 2 = Barangay Clearance
        
        if (response.data.success && response.data.data) {
          this.baseFee = parseFloat(response.data.data.fee_amount);
          this.totalFee = this.baseFee;
          console.log('Loaded current fee:', this.baseFee);
        } else {
          // Fallback to default if API fails
          console.warn('Failed to load current fee, using default');
          this.baseFee = 150.00;
          this.totalFee = 150.00;
        }
      } catch (error) {
        console.error('Error loading current fee:', error);
        // Fallback to default
        this.baseFee = 150.00;
        this.totalFee = 150.00;
        this.showToast('Warning', 'Using default fee amount', 'warning');
      } finally {
        this.loadingFee = false;
      }
    },

    getFullAddress() {
      // Try fresh data first, then fallback to cached data structure
      const profile = this.clientData || this.clientData?.profile;
      if (!profile) return 'Not provided';

      const parts = [
        profile.house_number,
        profile.street,
        profile.subdivision,
        profile.barangay,
        profile.city_municipality || profile.city,
        profile.province
      ].filter(Boolean);

      return parts.length > 0 ? parts.join(', ') : 'Not provided';
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
      const profile = this.clientData || this.clientData?.profile;
      if (!profile) return 'Not provided';

      const years = profile.years_of_residency;
      const months = profile.months_of_residency;

      if (!years && !months) return 'Not provided';

      const parts = [];
      if (years) parts.push(`${years} year${years > 1 ? 's' : ''}`);
      if (months) parts.push(`${months} month${months > 1 ? 's' : ''}`);

      return parts.join(' and ');
    },

    formatDate(dateString) {
      if (!dateString) return 'Not provided';
      return new Date(dateString).toLocaleDateString();
    },

    formatCurrency(amount) {
      return parseFloat(amount).toFixed(2);
    },

    canProceedToNextStep() {
      switch (this.currentStep) {
        case 1: {
          // Step 1: Required documents must be uploaded AND third-party validation
          const documentsUploaded = this.uploadedFiles.government_id && this.uploadedFiles.proof_of_residency;

          if (!documentsUploaded) return false;

          // Additional validation for third-party requests
          if (this.formData.is_third_party_request) {
            return this.validateBeneficiaryData();
          }

          return true;
        }
        case 2: {
          let validation = this.formData.purpose_category_id &&
                          this.formData.has_pending_cases !== null &&
                          this.formData.voter_registration_status !== null;

          // Only require purpose details if the field is shown (Other category, id=10)
          if (this.shouldShowPurposeDetails) {
            validation = validation && this.formData.purpose_details;
          }

          return validation;
        }
        case 3: {
          const paymentValid = this.formData.payment_method_id;
          if (!paymentValid) return false;

          // Additional validation for authorized pickup
          if (this.pickupOption === 'authorized') {
            return this.validateAuthorizedPickup();
          }

          return true;
        }
        default:
          return true;
      }
    },

    nextStep() {
      if (this.canProceedToNextStep() && this.currentStep < 4) {
        this.currentStep++;
      }
    },

    previousStep() {
      if (this.currentStep > 1) {
        this.currentStep--;
      }
    },

    onPurposeChange() {
      // Clear purpose details if not "Other" category (id=10)
      if (!this.shouldShowPurposeDetails) {
        this.formData.purpose_details = '';
      }
      // Could implement dynamic fee calculation based on purpose
    },

    sanitizeRequestData(data) {
      // Convert undefined values to null to prevent MySQL binding errors
      const sanitized = {};
      for (const [key, value] of Object.entries(data)) {
        if (value === undefined) {
          sanitized[key] = null;
        } else if (value === '') {
          sanitized[key] = null;
        } else if (typeof value === 'object' && value !== null) {
          // Recursively sanitize nested objects
          sanitized[key] = this.sanitizeRequestData(value);
        } else {
          sanitized[key] = value;
        }
      }
      return sanitized;
    },

    redirectToCedula() {
      // Redirect to Cedula application page
      this.$router.push('/client/cedula-request');
    },

    selectPaymentMethod(methodId) {
      this.formData.payment_method_id = methodId;
    },

    getActualPaymentMethodId() {
      return paymentService.getActualPaymentMethodId(
        this.formData.payment_method_id,
        this.originalPaymentMethods
      );
    },

    getPaymentIcon(methodCode) {
      const icons = {
        'CASH': 'fas fa-money-bill',
        'ONLINE_PAYMENT_GROUP': 'fas fa-credit-card',
        'PAYMONGO_CARD': 'fas fa-credit-card',
        'PAYMONGO_GCASH': 'fab fa-google-pay',
        'PAYMONGO_GRABPAY': 'fas fa-mobile-alt',
        'PAYMONGO_PAYMAYA': 'fas fa-wallet',
        'PAYMONGO_BANK': 'fas fa-university'
      };
      return icons[methodCode] || 'fas fa-credit-card';
    },

    getPurposeCategoryName() {
      const category = this.purposeCategories.find(c => c.id === this.formData.purpose_category_id);
      return category?.category_name || '';
    },

    getPaymentMethodName() {
      const method = this.paymentMethods.find(m => m.id === this.formData.payment_method_id);
      return method?.method_name || '';
    },

    getPaymentMethodDisplayName(methodCode) {
      return paymentService.getPaymentMethodDisplayName(methodCode);
    },

    // Handle phone number input to restrict to digits only
    handlePhoneInput(event, section) {
      const value = event.target.value;
      // Remove any non-digit characters
      const digitsOnly = value.replace(/\D/g, '');
      // Limit to 11 digits
      const limitedValue = digitsOnly.substring(0, 11);

      if (section === 'beneficiary') {
        this.formData.beneficiary.phone_number = limitedValue;
      } else if (section === 'authorized_pickup') {
        this.formData.authorized_pickup.phone_number = limitedValue;
      }
    },

    async handleSubmit() {
      if (!this.formData.agree_to_terms) return;

      // Debug pickup option and form data
      console.log('🔍 DEBUG: pickupOption =', this.pickupOption);
      console.log('🔍 DEBUG: authorized_pickup data =', JSON.stringify(this.formData.authorized_pickup, null, 2));
      console.log('🔍 DEBUG: uploadedFiles =', this.uploadedFiles);

      // Final validation with error messages for authorized pickup
      if (this.pickupOption === 'authorized') {
        console.log('🔍 Running final validation for authorized pickup...');
        if (!this.validateAuthorizedPickup(true)) {
          console.log('❌ Validation failed, stopping submission');
          this.submitting = false;
          return;
        }
        console.log('✅ Validation passed, continuing with submission');
      }

      try {
        this.submitting = true;

        // Prepare request data with proper validation and sanitization
        const requestData = this.sanitizeRequestData({
          document_type_id: parseInt(this.formData.document_type_id) || 2,
          purpose_category_id: parseInt(this.formData.purpose_category_id) || 1,
          purpose_details: this.shouldShowPurposeDetails && this.formData.purpose_details && this.formData.purpose_details.length >= 10
            ? this.formData.purpose_details
            : null,
          payment_method_id: this.getActualPaymentMethodId(),
          delivery_method: 'pickup',
          priority: 'normal',
          // Third-party request data
          is_third_party_request: this.formData.is_third_party_request || false,
          requestor_notes: null,
          beneficiary: this.formData.is_third_party_request ? this.formData.beneficiary : null,
          authorized_pickup: this.pickupOption === 'authorized' ? this.formData.authorized_pickup : null,
          // Barangay Clearance specific fields (legally required)
          has_pending_cases: Boolean(this.formData.has_pending_cases),
          pending_cases_details: this.formData.pending_cases_details || null,
          voter_registration_status: this.formData.voter_registration_status !== null ? Boolean(this.formData.voter_registration_status) : null,

          total_fee: this.totalFee || this.baseFee,
          // CRITICAL: Send exact total_document_fee for PayMongo accuracy
          total_document_fee: this.baseFee
        });

        console.log('Submitting request data:', requestData);

        const response = await documentRequestService.submitRequest(requestData);

        const requestId = response.data.id;
        console.log('Request created with ID:', requestId);

        // Upload documents if any are selected
        const hasDocuments = this.uploadedFiles.government_id ||
                            this.uploadedFiles.proof_of_residency ||
                            this.uploadedFiles.cedula;

        if (hasDocuments) {
          console.log('Uploading documents...');
          await this.uploadDocumentsToRequest(requestId);
        }

        // Upload beneficiary verification if this is a third-party request
        if (this.formData.is_third_party_request && this.uploadedFiles.beneficiary_verification) {
          console.log('📤 Uploading beneficiary verification...');
          await this.uploadBeneficiaryVerification(requestId);
        }

        // Upload pickup files if this is an authorized pickup request
        if (this.pickupOption === 'authorized') {
          console.log('📤 Uploading pickup authorization files...');
          await this.uploadPickupFiles(requestId);
        }

        this.showToast('Success', 'Request submitted successfully!', 'success');
        this.$router.push({
          name: 'RequestDetails',
          params: { id: requestId }
        });

      } catch (error) {
        console.error('Error submitting request:', error);
        console.error('Error details:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });

        let errorMessage = 'Failed to submit request';
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response?.data?.errors) {
          errorMessage = error.response.data.errors.map(e => e.msg).join(', ');
        } else if (error.message) {
          errorMessage = error.message;
        }

        this.showToast('Error', errorMessage, 'error');
      } finally {
        this.submitting = false;
      }
    },

    async uploadDocumentsToRequest(requestId) {
      try {
        const filesToUpload = [];

        // Collect ONLY the main Barangay Clearance documents (exclude verification and pickup files)
        const mainDocumentTypes = ['government_id', 'proof_of_residency', 'cedula'];

        Object.entries(this.uploadedFiles).forEach(([type, file]) => {
          if (file && mainDocumentTypes.includes(type)) {
            filesToUpload.push({ type, file });
          }
        });

        if (filesToUpload.length === 0) {
          console.log('No main documents to upload');
          return;
        }

        console.log('📤 Uploading main documents:', filesToUpload.map(f => f.type));

        // Upload documents using the service
        const uploadResponse = await documentRequestService.uploadDocuments(requestId, filesToUpload);

        if (uploadResponse.success) {
          console.log('Documents uploaded successfully:', uploadResponse.data);
          this.showToast('Success', `${uploadResponse.data.total_uploaded} document(s) uploaded successfully`, 'success');
        } else {
          console.error('Document upload failed:', uploadResponse);
          this.showToast('Warning', 'Request submitted but some documents failed to upload', 'warning');
        }

      } catch (error) {
        console.error('Document upload error:', error);
        this.showToast('Warning', 'Request submitted but document upload failed. You can upload documents later.', 'warning');
      }
    },

    async uploadPickupFiles(requestId) {
      try {
        console.log('🔍 Starting file upload for request:', requestId);

        // Import the API service
        const api = (await import('@/services/api.js')).default;

        // First, get the authorized pickup person ID from the backend
        const pickupResponse = await api.get(`/client/document-requests/${requestId}/authorization-status`);
        const pickupPersonId = pickupResponse.data.data?.pickup_person?.id;

        if (!pickupPersonId) {
          console.error('❌ No pickup person ID found');
          console.error('❌ Response data:', pickupResponse.data);
          return;
        }

        console.log('✅ Found pickup person ID:', pickupPersonId);

        // Upload ID image if available
        if (this.uploadedFiles.pickup_id_image) {
          console.log('📤 Uploading pickup ID image...');
          const idFormData = new FormData();
          idFormData.append('id_image', this.uploadedFiles.pickup_id_image);

          const idResponse = await api.post(`/verification-documents/pickup-person/${pickupPersonId}/id-image`, idFormData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          console.log('✅ ID image uploaded successfully:', idResponse.data);
        }

        // Upload authorization document if available
        if (this.uploadedFiles.pickup_authorization) {
          console.log('📤 Uploading authorization document...');
          const authFormData = new FormData();
          authFormData.append('authorization_document', this.uploadedFiles.pickup_authorization);

          const authResponse = await api.post(`/verification-documents/pickup-person/${pickupPersonId}/authorization-document`, authFormData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          console.log('✅ Authorization document uploaded successfully:', authResponse.data);
        }

        console.log('🎉 All pickup files uploaded successfully');
      } catch (error) {
        console.error('❌ Error uploading pickup files:', error);
        console.error('❌ Error response:', error.response?.data);
        // Don't throw the error - the request was already created successfully
        this.showToast('Warning', 'Request created but some files failed to upload. You can upload them later.', 'warning');
      }
    },

    async uploadBeneficiaryVerification(requestId) {
      try {
        console.log('🔍 Starting beneficiary verification upload for request:', requestId);

        // First, get the beneficiary ID from the request
        const api = (await import('@/services/api.js')).default;
        const requestResponse = await api.get(`/client/document-requests/${requestId}`);

        if (!requestResponse.data.success || !requestResponse.data.data.beneficiary) {
          throw new Error('Beneficiary information not found');
        }

        const beneficiaryId = requestResponse.data.data.beneficiary.id;
        console.log('📋 Found beneficiary ID:', beneficiaryId);

        // Upload the verification image
        const formData = new FormData();
        formData.append('verification_image', this.uploadedFiles.beneficiary_verification);

        const uploadResponse = await api.post(
          `/verification-documents/beneficiary/${beneficiaryId}/verification-image`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );

        if (uploadResponse.data.success) {
          console.log('✅ Beneficiary verification uploaded successfully');
          this.showToast('Success', 'Family member verification uploaded successfully', 'success');
        } else {
          throw new Error(uploadResponse.data.message || 'Upload failed');
        }

      } catch (error) {
        console.error('❌ Error uploading beneficiary verification:', error);
        console.error('❌ Error response:', error.response?.data);
        // Don't throw the error - the request was already created successfully
        this.showToast('Warning', 'Request created but verification image failed to upload. You can upload it later.', 'warning');
      }
    },

    goBack() {
      this.$router.push({ name: 'NewDocumentRequest' });
    },

    updateProfile() {
      // TODO: Navigate to profile update page
      console.log('Update profile');
    },

    // File handling methods
    triggerFileInput(fileType) {
      // Convert snake_case to camelCase for ref names
      const refNameMap = {
        'government_id': 'governmentIdInput',
        'proof_of_residency': 'proofOfResidencyInput',
        'cedula': 'cedulaInput'
      };

      const inputRef = refNameMap[fileType];

      if (!inputRef) {
        console.error(`Unknown file type: ${fileType}`);
        return;
      }

      // Add safety check for ref existence
      if (this.$refs[inputRef]) {
        this.$refs[inputRef].click();
      } else {
        console.warn(`File input ref '${inputRef}' not found`);
        // Try again after next tick
        this.$nextTick(() => {
          if (this.$refs[inputRef]) {
            this.$refs[inputRef].click();
          } else {
            console.error(`File input ref '${inputRef}' still not found after nextTick`);
          }
        });
      }
    },

    handleFileSelect(event, fileType) {
      const file = event.target.files[0];
      if (file) {
        this.validateAndSetFile(file, fileType);
      }
    },

    handleFileDrop(event, fileType) {
      const file = event.dataTransfer.files[0];
      if (file) {
        this.validateAndSetFile(file, fileType);
      }
    },

    validateAndSetFile(file, fileType) {
      // Clear previous errors (Vue 3 compatible)
      delete this.uploadErrors[fileType];

      // Validate file size
      if (file.size > this.maxFileSize) {
        this.uploadErrors[fileType] = 'File size must be less than 5MB';
        this.showToast('Error', 'File size must be less than 5MB', 'error');
        return;
      }

      // Validate file type
      if (!this.allowedFileTypes.includes(file.type)) {
        this.uploadErrors[fileType] = 'Only JPG, PNG, and PDF files are allowed';
        this.showToast('Error', 'Only JPG, PNG, and PDF files are allowed', 'error');
        return;
      }

      // Set the file (Vue 3 compatible)
      this.uploadedFiles[fileType] = file;
      this.showToast('Success', `${file.name} uploaded successfully`, 'success');
    },

    removeFile(fileType) {
      // Vue 3 compatible reactive updates
      this.uploadedFiles[fileType] = null;
      delete this.uploadErrors[fileType];

      // Convert snake_case to camelCase for ref names
      const refNameMap = {
        'government_id': 'governmentIdInput',
        'proof_of_residency': 'proofOfResidencyInput',
        'cedula': 'cedulaInput'
      };

      const inputRef = refNameMap[fileType];

      // Clear the input with safety check
      if (inputRef && this.$refs[inputRef]) {
        this.$refs[inputRef].value = '';
      } else {
        console.warn(`File input ref '${inputRef}' not found during removal`);
      }
    },

    showTerms() {
      // TODO: Show terms and conditions modal
      console.log('Show terms');
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
            font-weight: 600;
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
            padding: 0;
            margin-left: 8px;
          }
          .toast-success {
            border-left: 4px solid #28a745;
          }
          .toast-error {
            border-left: 4px solid #dc3545;
          }
          .toast-warning {
            border-left: 4px solid #ffc107;
          }
          .toast-info {
            border-left: 4px solid #17a2b8;
          }
          @keyframes slideIn {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `;
        document.head.appendChild(styles);
      }

      // Add toast to page
      document.body.appendChild(toast);

      // Auto remove after 5 seconds
      setTimeout(() => {
        if (toast.parentElement) {
          toast.remove();
        }
      }, 5000);
    },

    // New methods for third-party requests
    handleRequestTypeChange() {
      if (!this.formData.is_third_party_request) {
        // Reset beneficiary data when switching back to self
        this.resetBeneficiaryData();
        this.familyRelationshipError = null;
      }
    },

    handleGenderChange() {
      // Clear suffix when male is not selected since suffix field will be hidden
      if (this.formData.beneficiary.gender !== 'male') {
        this.formData.beneficiary.suffix = '';
      }
    },

    validateFamilyRelationship() {
      this.familyRelationshipError = null;

      if (!this.formData.is_third_party_request) {
        return true;
      }

      const relationship = this.formData.beneficiary.relationship_to_requestor;
      if (!relationship) {
        return true; // Will be caught by required validation
      }

      // Define allowed immediate family relationships
      const allowedRelationships = [
        'spouse', 'husband', 'wife', 'child', 'son', 'daughter',
        'parent', 'father', 'mother', 'sibling', 'brother', 'sister'
      ];

      if (!allowedRelationships.includes(relationship.toLowerCase())) {
        this.familyRelationshipError = 'You can only request documents on behalf of immediate family members (spouse, children, parents, siblings).';
        return false;
      }

      return true;
    },

    handlePickupOptionChange() {
      if (this.pickupOption !== 'authorized') {
        // Reset authorized pickup data
        this.resetAuthorizedPickupData();
      }
    },

    resetBeneficiaryData() {
      this.formData.beneficiary = {
        first_name: '',
        middle_name: '',
        last_name: '',
        suffix: '',
        birth_date: '',
        gender: '',
        civil_status_id: '',
        nationality: 'Filipino',
        phone_number: '',
        email: '',
        house_number: '',
        street: '',
        subdivision: '',
        barangay: 'Bula',
        city_municipality: 'General Santos City (Dadiangas)',
        province: 'South Cotabato',
        postal_code: '',
        years_of_residency: null,
        months_of_residency: null,
        relationship_to_requestor: '',
        region: 'Region XII (SOCCSKSARGEN)',
        region_code: '12',
        province_code: '1263',
        city_code: '126303',
        barangay_code: '126303005'
      };
    },

    resetAuthorizedPickupData() {
      this.formData.authorized_pickup = {
        first_name: '',
        middle_name: '',
        last_name: '',
        suffix: '',
        phone_number: '',
        email: '',
        relationship_to_beneficiary: ''
      };
      // Also reset the uploaded files
      this.uploadedFiles.pickup_id_image = null;
      this.uploadedFiles.pickup_authorization = null;
    },

    async loadCivilStatuses() {
      try {
        // For now, use a static list. In production, this would be an API call
        this.civilStatuses = [
          { id: 1, status_name: 'Single' },
          { id: 2, status_name: 'Married' },
          { id: 3, status_name: 'Widowed' },
          { id: 4, status_name: 'Divorced' },
          { id: 5, status_name: 'Separated' }
        ];
      } catch (error) {
        console.error('Error loading civil statuses:', error);
      }
    },

    validateBeneficiaryData() {
      if (!this.formData.is_third_party_request) return true;

      const required = [
        'first_name', 'last_name', 'birth_date', 'gender',
        'civil_status_id', 'region_code', 'province_code',
        'city_code', 'barangay_code', 'relationship_to_requestor'
      ];

      for (const field of required) {
        if (!this.formData.beneficiary[field]) {
          this.showToast('Error', `Please fill in the beneficiary's ${field.replace('_', ' ')}`, 'error');
          return false;
        }
      }

      // Validate family relationship
      if (!this.validateFamilyRelationship()) {
        this.showToast('Error', this.familyRelationshipError, 'error');
        return false;
      }

      // Check for required verification image
      if (!this.uploadedFiles.beneficiary_verification) {
        this.showToast('Error', 'Please upload the family member\'s verification ID image', 'error');
        return false;
      }

      return true;
    },

    validateAuthorizedPickup(showErrors = false) {
      console.log('🔍 validateAuthorizedPickup called with showErrors:', showErrors);
      console.log('🔍 pickupOption:', this.pickupOption);
      console.log('🔍 authorized_pickup data:', this.formData.authorized_pickup);

      if (this.pickupOption !== 'authorized') {
        console.log('✅ Not authorized pickup, validation passed');
        return true;
      }

      // Prevent multiple validation calls in quick succession
      if (this.isValidating) {
        console.log('⚠️ Validation already in progress, skipping');
        return false;
      }

      if (showErrors) {
        this.isValidating = true;
        setTimeout(() => { this.isValidating = false; }, 1000); // Reset after 1 second
      }

      const required = [
        'first_name', 'last_name', 'phone_number', 'relationship_to_beneficiary'
      ];

      for (const field of required) {
        const value = this.formData.authorized_pickup[field];
        console.log(`🔍 Checking field ${field}:`, value);

        if (!value || value.trim() === '') {
          if (showErrors) {
            console.log(`❌ Field ${field} is missing`);
            this.showToast('Error', `Please fill in the pickup person's ${field.replace('_', ' ')}`, 'error');
          }
          return false;
        }
      }

      // Check for required file uploads
      if (!this.uploadedFiles.pickup_id_image) {
        if (showErrors) {
          console.log('❌ Missing pickup ID image');
          this.showToast('Error', 'Please upload the pickup person\'s valid ID image', 'error');
        }
        return false;
      }

      if (!this.uploadedFiles.pickup_authorization) {
        if (showErrors) {
          console.log('❌ Missing pickup authorization');
          this.showToast('Error', 'Please upload the authorization letter', 'error');
        }
        return false;
      }

      console.log('✅ Authorized pickup validation passed');
      return true;
    },

    // Verification file upload handlers
    handleBeneficiaryVerificationFile(file) {
      console.log('Beneficiary verification file selected:', file.name);
      this.uploadedFiles.beneficiary_verification = file;
    },

    onBeneficiaryVerificationUpload(uploadResult) {
      console.log('Beneficiary verification uploaded successfully:', uploadResult);
      this.showToast('Success', 'Family member verification image uploaded successfully', 'success');
    },

    onBeneficiaryVerificationError(error) {
      console.error('Beneficiary verification upload error:', error);
      this.showToast('Error', 'Failed to upload verification image: ' + (error.response?.data?.message || error.message), 'error');
    },

    onBeneficiaryVerificationRemoved() {
      console.log('Beneficiary verification file removed');
      this.uploadedFiles.beneficiary_verification = null;
    },

    // Pickup person file upload handlers
    handlePickupIdFile(file) {
      console.log('Pickup ID file selected:', file.name);
      this.uploadedFiles.pickup_id_image = file;
    },

    onPickupIdUpload(uploadResult) {
      console.log('Pickup ID uploaded successfully:', uploadResult);
      this.showToast('Success', 'Pickup person ID image uploaded successfully', 'success');
    },

    onPickupIdError(error) {
      console.error('Pickup ID upload error:', error);
      this.showToast('Error', 'Failed to upload ID image: ' + (error.response?.data?.message || error.message), 'error');
    },

    onPickupIdRemoved() {
      console.log('Pickup ID file removed');
      this.uploadedFiles.pickup_id_image = null;
    },

    handlePickupAuthFile(file) {
      console.log('Pickup authorization file selected:', file.name);
      this.uploadedFiles.pickup_authorization = file;
    },

    onPickupAuthUpload(uploadResult) {
      console.log('Pickup authorization uploaded successfully:', uploadResult);
      this.showToast('Success', 'Authorization document uploaded successfully', 'success');
    },

    onPickupAuthError(error) {
      console.error('Pickup authorization upload error:', error);
      this.showToast('Error', 'Failed to upload authorization document: ' + (error.response?.data?.message || error.message), 'error');
    },

    onPickupAuthRemoved() {
      console.log('Pickup authorization file removed');
      this.uploadedFiles.pickup_authorization = null;
    },

    // Address dropdown methods
    async loadAddressData() {
      try {
        this.regions = await addressService.getRegions();
      } catch (error) {
        console.error('Error loading address data:', error);
        this.showToast('Error', 'Failed to load address data', 'error');
      }
    },

    async onRegionChange() {
      try {
        this.filteredProvinces = [];
        this.filteredCities = [];
        this.filteredBarangays = [];

        // Reset dependent fields
        this.formData.beneficiary.province_code = '';
        this.formData.beneficiary.city_code = '';
        this.formData.beneficiary.barangay_code = '';
        this.formData.beneficiary.province = '';
        this.formData.beneficiary.city_municipality = '';
        this.formData.beneficiary.barangay = '';
        this.formData.beneficiary.region = '';

        if (this.formData.beneficiary.region_code) {
          this.filteredProvinces = await addressService.getProvincesByRegion(this.formData.beneficiary.region_code);

          // Set region name
          const selectedRegion = this.regions.find(r => r.region_code === this.formData.beneficiary.region_code);
          if (selectedRegion) {
            this.formData.beneficiary.region = selectedRegion.region_name;
          }
        }
      } catch (error) {
        console.error('Error loading provinces:', error);
        this.showToast('Error', 'Failed to load provinces', 'error');
      }
    },

    async onProvinceChange() {
      try {
        this.filteredCities = [];
        this.filteredBarangays = [];

        // Reset dependent fields
        this.formData.beneficiary.city_code = '';
        this.formData.beneficiary.barangay_code = '';
        this.formData.beneficiary.city_municipality = '';
        this.formData.beneficiary.barangay = '';

        if (this.formData.beneficiary.province_code) {
          this.filteredCities = await addressService.getCitiesByProvince(this.formData.beneficiary.province_code);

          // Set province name
          const selectedProvince = this.filteredProvinces.find(p => p.province_code === this.formData.beneficiary.province_code);
          if (selectedProvince) {
            this.formData.beneficiary.province = selectedProvince.province_name;
          }
        }
      } catch (error) {
        console.error('Error loading cities:', error);
        this.showToast('Error', 'Failed to load cities', 'error');
      }
    },

    async onCityChange() {
      try {
        this.filteredBarangays = [];

        // Reset dependent fields
        this.formData.beneficiary.barangay_code = '';
        this.formData.beneficiary.barangay = '';

        if (this.formData.beneficiary.city_code) {
          this.filteredBarangays = await addressService.getBarangaysByCity(this.formData.beneficiary.city_code);

          // Set city name
          const selectedCity = this.filteredCities.find(c => c.city_code === this.formData.beneficiary.city_code);
          if (selectedCity) {
            this.formData.beneficiary.city_municipality = selectedCity.city_name;
          }
        }
      } catch (error) {
        console.error('Error loading barangays:', error);
        this.showToast('Error', 'Failed to load barangays', 'error');
      }
    },

    onBarangayChange() {
      // Set barangay name
      if (this.formData.beneficiary.barangay_code) {
        const selectedBarangay = this.filteredBarangays.find(b => b.brgy_code === this.formData.beneficiary.barangay_code);
        if (selectedBarangay) {
          this.formData.beneficiary.barangay = selectedBarangay.brgy_name;
        }
      }
    }
  }
};
</script>

<style scoped>
.barangay-clearance-request {
  padding: 0;
  max-width: none;
  margin: 0;
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.page-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: #f7fafc;
  margin: 0;
  padding: 2rem 2rem 1.5rem 2rem;
  border-bottom: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  flex-shrink: 0;
}

.page-content {
  flex: 1;
  padding: 1.5rem 2rem 2rem 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1a365d;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.page-title i {
  color: #3182ce;
}

.page-description {
  font-size: 1rem;
  color: #4a5568;
  margin: 0;
}

.back-btn {
  background: #e2e8f0;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  color: #4a5568;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.back-btn:hover {
  background: #cbd5e0;
  color: #2d3748;
}

.progress-steps {
  display: flex;
  justify-content: center;
  margin-bottom: 3rem;
  position: relative;
}

.progress-steps::before {
  content: '';
  position: absolute;
  top: 1.5rem;
  left: 25%;
  right: 25%;
  height: 2px;
  background: #e2e8f0;
  z-index: 1;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  position: relative;
  z-index: 2;
}

.step-number {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: #e2e8f0;
  color: #a0aec0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-bottom: 0.5rem;
  transition: all 0.3s;
}

.step.active .step-number {
  background: #3182ce;
  color: white;
}

.step.completed .step-number {
  background: #38a169;
  color: white;
}

.step-label {
  font-size: 0.875rem;
  color: #718096;
  text-align: center;
}

.step.active .step-label {
  color: #3182ce;
  font-weight: 500;
}

.form-container {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.form-step {
  min-height: 400px;
}

.step-header {
  text-align: center;
  margin-bottom: 2rem;
}

.step-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a365d;
  margin-bottom: 0.5rem;
}

.step-header p {
  color: #4a5568;
  margin: 0;
}

.profile-preview {
  margin-bottom: 2rem;
}

.profile-card {
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.profile-info h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a365d;
  margin-bottom: 1rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-item label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #718096;
}

.info-item span {
  color: #2d3748;
}

.update-profile-btn {
  background: #3182ce;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.update-profile-btn:hover {
  background: #2c5aa0;
}

.form-section {
  margin-bottom: 2rem;
}

.form-section h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a365d;
  margin-bottom: 1rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: #2d3748;
  font-size: 0.875rem;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3182ce;
  box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
}

.radio-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: all 0.2s;
}

.radio-option:hover {
  background: #f7fafc;
}

.radio-option input[type="radio"] {
  display: none;
}

.radio-custom {
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid #e2e8f0;
  border-radius: 50%;
  position: relative;
  transition: all 0.2s;
}

.radio-option input[type="radio"]:checked + .radio-custom {
  border-color: #3182ce;
}

.radio-option input[type="radio"]:checked + .radio-custom::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 0.5rem;
  height: 0.5rem;
  background: #3182ce;
  border-radius: 50%;
}

.fee-summary {
  margin-bottom: 2rem;
}

.fee-card {
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 1.5rem;
}

.fee-card h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a365d;
  margin-bottom: 1rem;
}

.fee-items {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.fee-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
}

.fee-item.total {
  border-top: 1px solid #e2e8f0;
  padding-top: 1rem;
  font-weight: 600;
  font-size: 1.125rem;
  color: #1a365d;
}

.payment-methods {
  display: grid;
  gap: 1rem;
}

.payment-option {
  border: 2px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.payment-option:hover {
  border-color: #cbd5e0;
}

.payment-option.selected {
  border-color: #3182ce;
  background: #ebf8ff;
}

.grouped-methods-preview {
  margin-top: 0.5rem;
}

.grouped-methods-preview small {
  color: #6b7280;
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.payment-icon {
  width: 3rem;
  height: 3rem;
  background: #f7fafc;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: #4a5568;
}

.payment-option.selected .payment-icon {
  background: #3182ce;
  color: white;
}

.payment-info {
  flex: 1;
}

.payment-info h4 {
  font-weight: 600;
  color: #1a365d;
  margin-bottom: 0.25rem;
}

.payment-info p {
  color: #718096;
  font-size: 0.875rem;
  margin: 0;
}

.payment-radio input {
  width: 1.25rem;
  height: 1.25rem;
}

.review-sections {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-bottom: 2rem;
}

.review-section {
  background: #f7fafc;
  border-radius: 0.75rem;
  padding: 1.5rem;
}

.review-section h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a365d;
  margin-bottom: 1rem;
}

.review-grid {
  display: grid;
  gap: 1rem;
}

.review-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e2e8f0;
}

.review-item:last-child {
  border-bottom: none;
}

.review-item label {
  font-weight: 500;
  color: #4a5568;
  min-width: 120px;
}

.review-item span {
  color: #2d3748;
  text-align: right;
  flex: 1;
}

.review-item .amount {
  font-weight: 600;
  color: #38a169;
  font-size: 1.125rem;
}

.terms-section {
  margin-bottom: 2rem;
  padding: 1rem;
  background: #fffaf0;
  border: 1px solid #fed7aa;
  border-radius: 0.5rem;
}

.checkbox-option {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  cursor: pointer;
  line-height: 1.5;
}

.checkbox-option input[type="checkbox"] {
  display: none;
}

.checkbox-custom {
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid #e2e8f0;
  border-radius: 0.25rem;
  position: relative;
  flex-shrink: 0;
  margin-top: 0.125rem;
  transition: all 0.2s;
}

.checkbox-option input[type="checkbox"]:checked + .checkbox-custom {
  border-color: #3182ce;
  background: #3182ce;
}

.checkbox-option input[type="checkbox"]:checked + .checkbox-custom::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 0.875rem;
  font-weight: bold;
}

.checkbox-option a {
  color: #3182ce;
  text-decoration: underline;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding-top: 2rem;
  border-top: 1px solid #e2e8f0;
}

.btn-secondary,
.btn-primary,
.btn-submit {
  padding: 0.75rem 2rem;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: none;
}

.btn-secondary {
  background: #e2e8f0;
  color: #4a5568;
}

.btn-secondary:hover {
  background: #cbd5e0;
}

.btn-primary {
  background: #3182ce;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2c5aa0;
}

.btn-submit {
  background: #38a169;
  color: white;
}

.btn-submit:hover:not(:disabled) {
  background: #2f855a;
}

.btn-primary:disabled,
.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Third-party request styles */
.request-type-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.radio-option {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.5rem;
  border: 2px solid #e2e8f0;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.radio-option:hover {
  border-color: #cbd5e0;
  background-color: #f7fafc;
}

.radio-option input[type="radio"]:checked + .radio-custom + .option-content {
  color: #3182ce;
}

.radio-option input[type="radio"]:checked ~ .option-content strong {
  color: #2c5aa0;
}

.radio-option input[type="radio"] {
  display: none;
}

.radio-custom {
  width: 20px;
  height: 20px;
  border: 2px solid #cbd5e0;
  border-radius: 50%;
  position: relative;
  flex-shrink: 0;
  margin-top: 2px;
}

.radio-option input[type="radio"]:checked + .radio-custom {
  border-color: #3182ce;
}

.radio-option input[type="radio"]:checked + .radio-custom::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 10px;
  height: 10px;
  background-color: #3182ce;
  border-radius: 50%;
}

.option-content {
  flex: 1;
}

.option-content strong {
  display: block;
  font-size: 1.125rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.25rem;
}

.option-content p {
  color: #718096;
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.4;
}

.beneficiary-section {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 2rem;
  margin-bottom: 2rem;
}

.beneficiary-section h3 {
  color: #2d3748;
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
}

.beneficiary-section h4 {
  color: #4a5568;
  font-size: 1.125rem;
  font-weight: 600;
  margin: 2rem 0 1rem 0;
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

.pickup-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.authorized-pickup-form {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-top: 1rem;
}

.authorized-pickup-form h4 {
  color: #2d3748;
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.alert {
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.alert-info {
  background-color: #ebf8ff;
  border: 1px solid #bee3f8;
  color: #2c5aa0;
}

.alert-info i {
  color: #3182ce;
}

@media (max-width: 768px) {
  .page-header {
    padding: 1.5rem 1rem 1.25rem 1rem;
  }

  .page-content {
    padding: 1rem 1rem 1rem 1rem;
  }

  .header-content {
    flex-direction: column;
    align-items: stretch;
  }

  .progress-steps {
    flex-wrap: wrap;
    gap: 1rem;
  }

  .progress-steps::before {
    display: none;
  }

  .form-container {
    padding: 1.5rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .profile-card {
    flex-direction: column;
    gap: 1rem;
  }

  .form-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .review-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .review-item span {
    text-align: left;
  }
}

/* Legal Notice Styles */
.legal-notice {
  background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
  border: 1px solid #2196f3;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.legal-notice h3 {
  color: #1976d2;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.legal-notice p {
  color: #424242;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.data-privacy-note {
  background: rgba(76, 175, 80, 0.1);
  border-left: 4px solid #4caf50;
  padding: 0.75rem;
  border-radius: 4px;
}

.data-privacy-note small {
  color: #2e7d32;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Document Upload Styles */
.document-upload-group {
  margin-bottom: 1.5rem;
}

.document-label {
  display: block;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-size: 1rem;
}

.document-label i {
  margin-right: 0.5rem;
  color: #3498db;
}

.document-info {
  font-weight: 400;
  color: #7f8c8d;
  font-size: 0.875rem;
  display: block;
  margin-top: 0.25rem;
}

.document-info.optional {
  color: #27ae60;
}

.file-upload-area {
  border: 2px dashed #bdc3c7;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f8f9fa;
}

.file-upload-area:hover {
  border-color: #3498db;
  background: #e3f2fd;
}

.file-upload-area.dragover {
  border-color: #2ecc71;
  background: #e8f5e8;
}

.upload-placeholder i {
  font-size: 2rem;
  color: #95a5a6;
  margin-bottom: 0.5rem;
}

.upload-placeholder p {
  margin: 0.5rem 0;
  color: #2c3e50;
  font-weight: 500;
}

.upload-placeholder small {
  color: #7f8c8d;
}

.uploaded-file {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #27ae60;
  font-weight: 500;
}

.uploaded-file i {
  color: #27ae60;
}

.remove-file {
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-left: 0.5rem;
  transition: background 0.3s ease;
}

.remove-file:hover {
  background: #c0392b;
}

.upload-error {
  color: #e74c3c;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

@media (max-width: 768px) {
  .file-upload-area {
    padding: 1.5rem 1rem;
  }

  .upload-placeholder i {
    font-size: 1.5rem;
  }
}
</style>