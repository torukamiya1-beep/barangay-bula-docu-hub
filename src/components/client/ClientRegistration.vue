<template>
  <div class="client-registration">
    <div class="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div class="row w-100 justify-content-center">
        <div class="col-12 col-md-10 col-lg-8 col-xl-7 col-xxl-6">
          <div class="card shadow-lg border-0">
            <div class="card-header bg-primary text-white text-center py-4">
              <h3 class="mb-0">
                Barangay Bula Document Hub
              </h3>
              <p class="mb-0 mt-2">
                <i class="fas fa-user-plus me-2"></i>
                Create an account
              </p>
            </div>
            
            <div class="card-body p-4">
              <!-- Registration Steps Indicator -->
              <div class="row mb-4">
                <div class="col-12">
                  <div class="d-flex justify-content-between align-items-center">
                    <div class="step-indicator" :class="{ active: currentStep >= 1, completed: currentStep > 1 }">
                      <div class="step-number">1</div>
                      <div class="step-label">Account</div>
                    </div>
                    <div class="step-line" :class="{ active: currentStep > 1 }"></div>
                    <div class="step-indicator" :class="{ active: currentStep >= 2, completed: currentStep > 2 }">
                      <div class="step-number">2</div>
                      <div class="step-label">Profile</div>
                    </div>
                    <div class="step-line" :class="{ active: currentStep > 2 }"></div>
                    <div class="step-indicator" :class="{ active: currentStep >= 3, completed: currentStep > 3 }">
                      <div class="step-number">3</div>
                      <div class="step-label">Documents</div>
                    </div>
                    <div class="step-line" :class="{ active: currentStep > 3 }"></div>
                    <div class="step-indicator" :class="{ active: currentStep >= 4, completed: currentStep > 4 }">
                      <div class="step-number">4</div>
                      <div class="step-label">Verify</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Step 1: Account Creation -->
              <div v-if="currentStep === 1" class="step-content">
                <h5 class="mb-3">Create Your Account</h5>
                <form @submit.prevent="submitAccountForm">
                  <div class="mb-3">
                    <label for="username" class="form-label">Username</label>
                    <input
                      type="text"
                      class="form-control"
                      :class="{ 'is-invalid': errors.username }"
                      id="username"
                      v-model="accountForm.username"
                      @blur="validateField('username')"
                      @input="clearFieldError('username')"
                      placeholder="Enter your username"
                      required
                    >
                    <div v-if="errors.username" class="invalid-feedback">
                      {{ errors.username }}
                    </div>
                  </div>

                  <div class="mb-3">
                    <label for="email" class="form-label">Email Address</label>
                    <input
                      type="email"
                      class="form-control"
                      :class="{ 'is-invalid': errors.email }"
                      id="email"
                      v-model="accountForm.email"
                      @blur="validateField('email')"
                      @input="clearFieldError('email')"
                      placeholder="Enter your email address"
                      required
                    >
                    <div v-if="errors.email" class="invalid-feedback">
                      {{ errors.email }}
                    </div>
                  </div>

                  <div class="mb-3">
                    <label for="password" class="form-label">Password</label>
                    <div class="input-group">
                      <input
                        :type="showPassword ? 'text' : 'password'"
                        class="form-control"
                        :class="{ 'is-invalid': errors.password }"
                        id="password"
                        v-model="accountForm.password"
                        @blur="validateField('password')"
                        @input="clearFieldError('password')"
                        placeholder="Enter your password"
                        required
                      >
                      <button
                        type="button"
                        class="btn btn-outline-secondary"
                        @click="showPassword = !showPassword"
                      >
                        <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                      </button>
                    </div>
                    <div v-if="errors.password" class="invalid-feedback d-block">
                      {{ errors.password }}
                    </div>
                    <div class="form-text">
                      Password must be at least 8 characters with uppercase, lowercase, and number.
                    </div>
                  </div>

                  <div class="mb-4">
                    <label for="confirmPassword" class="form-label">Confirm Password</label>
                    <input
                      type="password"
                      class="form-control"
                      :class="{ 'is-invalid': errors.confirmPassword }"
                      id="confirmPassword"
                      v-model="accountForm.confirmPassword"
                      @blur="validateField('confirmPassword')"
                      @input="clearFieldError('confirmPassword')"
                      placeholder="Confirm your password"
                      required
                    >
                    <div v-if="errors.confirmPassword" class="invalid-feedback">
                      {{ errors.confirmPassword }}
                    </div>
                  </div>

                  <div class="d-grid gap-2">
                    <button
                      type="submit"
                      class="btn btn-primary"
                      :disabled="loading"
                    >
                      <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                      {{ loading ? 'Creating Account...' : 'Create Account' }}
                    </button>
                  </div>
                </form>
              </div>

              <!-- Step 2: Profile Information -->
              <div v-if="currentStep === 2" class="step-content">
                <h5 class="mb-3">Complete Your Profile</h5>
                <form @submit.prevent="submitProfileForm">
                  <!-- Personal Information -->
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label for="firstName" class="form-label">First Name</label>
                      <input
                        type="text"
                        class="form-control"
                        :class="{ 'is-invalid': errors.first_name }"
                        id="firstName"
                        v-model="profileForm.first_name"
                        @blur="validateField('first_name')"
                        @input="clearFieldError('first_name')"
                        required
                      >
                      <div v-if="errors.first_name" class="invalid-feedback">
                        {{ errors.first_name }}
                      </div>
                    </div>
                    <div class="col-md-6 mb-3">
                      <label for="lastName" class="form-label">Last Name</label>
                      <input
                        type="text"
                        class="form-control"
                        :class="{ 'is-invalid': errors.last_name }"
                        id="lastName"
                        v-model="profileForm.last_name"
                        @blur="validateField('last_name')"
                        @input="clearFieldError('last_name')"
                        required
                      >
                      <div v-if="errors.last_name" class="invalid-feedback">
                        {{ errors.last_name }}
                      </div>
                    </div>
                  </div>

                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label for="middleName" class="form-label">Middle Name (Optional)</label>
                      <input
                        type="text"
                        class="form-control"
                        id="middleName"
                        v-model="profileForm.middle_name"
                      >
                    </div>
                    <div class="col-md-6 mb-3">
                      <label for="birthDate" class="form-label">Birth Date</label>
                      <input
                        type="date"
                        class="form-control"
                        :class="{ 'is-invalid': errors.birth_date }"
                        id="birthDate"
                        v-model="profileForm.birth_date"
                        @blur="validateField('birth_date')"
                        @input="clearFieldError('birth_date')"
                        required
                      >
                      <div v-if="errors.birth_date" class="invalid-feedback">
                        {{ errors.birth_date }}
                      </div>
                    </div>
                  </div>

                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label for="civilStatus" class="form-label">Civil Status</label>
                      <select
                        class="form-select"
                        :class="{ 'is-invalid': errors.civil_status_id }"
                        id="civilStatus"
                        v-model="profileForm.civil_status_id"
                        @change="clearFieldError('civil_status_id')"
                        required
                      >
                        <option value="">Select Civil Status</option>
                        <option value="1">Single</option>
                        <option value="2">Married</option>
                        <option value="3">Divorced</option>
                        <option value="4">Widowed</option>
                        <option value="5">Separated</option>
                      </select>
                      <div v-if="errors.civil_status_id" class="invalid-feedback">
                        {{ errors.civil_status_id }}
                      </div>
                    </div>
                    <div class="col-md-6 mb-3">
                      <label for="gender" class="form-label">Gender</label>
                      <select
                        class="form-select"
                        :class="{ 'is-invalid': errors.gender }"
                        id="gender"
                        v-model="profileForm.gender"
                        @change="handleGenderChange"
                        required
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                      <div v-if="errors.gender" class="invalid-feedback">
                        {{ errors.gender }}
                      </div>
                    </div>
                  </div>

                  <div class="row">
                    <div class="col-md-6 mb-3">
                        <label for="phoneNumber" class="form-label">Phone Number</label>
                        <input
                          type="tel"
                          class="form-control"
                          :class="{ 'is-invalid': errors.phone_number }"
                          id="phoneNumber"
                          v-model="profileForm.phone_number"
                          @blur="validateField('phone_number')"
                          @input="handlePhoneInput"
                          placeholder="09123456789"
                          maxlength="11"
                          pattern="[0-9]*"
                          required
                        >
                        <div v-if="errors.phone_number" class="invalid-feedback">
                          {{ errors.phone_number }}
                    </div>
                    </div>
                    <div v-if="profileForm.gender === 'male'" class="col-md-6 mb-3">
                      <label for="suffix" class="form-label">Suffix (Optional)</label>
                      <select
                        class="form-select"
                        id="suffix"
                        v-model="profileForm.suffix"
                      >
                        <option value="">Select Suffix (Optional)</option>
                        <option value="JR.">JR.</option>
                        <option value="SR.">SR.</option>
                        <option value="II">II</option>
                        <option value="III">III</option>
                        <option value="IV">IV</option>
                        <option value="V">V</option>
                        <option value="VI">VI</option>
                        <option value="VII">VII</option>
                        <option value="VIII">VIII</option>
                        <option value="IX">IX</option>
                        <option value="X">X</option>
                      </select>
                    </div>
                  </div>

                  <!-- Address Information -->
                  <div class="address-section mt-4">
                    <h6 class="mb-4">
                      <i class="fas fa-map-marker-alt me-2 text-primary"></i>
                      Address Information
                    </h6>

                    <!-- Address Selector Component -->
                    <div class="address-selector-wrapper mb-4">
                      <AddressSelector
                        ref="addressSelector"
                        :validation-errors="addressErrors"
                        @address-change="onAddressChange"
                      />
                    </div>

                    <!-- Additional Address Details -->
                    <div class="row">
                      <div class="col-md-6 mb-3">
                        <label for="houseNumber" class="form-label">House Number (Optional)</label>
                        <input
                          type="text"
                          class="form-control"
                          id="houseNumber"
                          v-model="profileForm.house_number"
                          placeholder="e.g., 123, Blk 5 Lot 10"
                        >
                      </div>
                      <div class="col-md-6 mb-3">
                        <label for="street" class="form-label">Street (Optional)</label>
                        <input
                          type="text"
                          class="form-control"
                          id="street"
                          v-model="profileForm.street"
                          placeholder="e.g., Main Street, Rizal Avenue"
                        >
                      </div>
                    </div>
                  </div>

                    <div class="row">
                      <!-- Postal Code field hidden as requested -->
                      <div class="col-md-6 mb-3" style="display: none;">
                        <label for="subdivision" class="form-label">Subdivision (Optional)</label>
                        <input
                          type="text"
                          class="form-control"
                          id="subdivision"
                          v-model="profileForm.subdivision"
                          placeholder="e.g., Green Valley, Sunrise Village"
                        >
                      </div>
                      <!-- Postal Code hidden (frontend-only). Default value set to '9500' in component data. -->
                      <input type="hidden" id="postalCode" v-model="profileForm.postal_code" />
                    </div>

                  <!-- Residency Information -->
                  <div class="residency-section mt-4">
                    <h6 class="mb-3">
                      <i class="fas fa-clock me-2 text-primary"></i>
                      Residency Information
                    </h6>
                    <div class="row">
                      <div class="col-md-6 mb-3">
                        <label for="nationality" class="form-label">Nationality</label>
                        <input
                          type="text"
                          class="form-control"
                          :class="{ 'is-invalid': errors.nationality }"
                          id="nationality"
                          v-model="profileForm.nationality"
                          @blur="validateField('nationality')"
                          @input="clearFieldError('nationality')"
                          required
                        >
                        <div v-if="errors.nationality" class="invalid-feedback">
                          {{ errors.nationality }}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label for="yearsOfResidency" class="form-label">Years of Residency (Optional)</label>
                      <input
                        type="number"
                        class="form-control"
                        id="yearsOfResidency"
                        v-model.number="profileForm.years_of_residency"
                        placeholder="e.g., 5"
                        min="0"
                        max="100"
                      >
                    </div>
                    <div class="col-md-6 mb-3">
                      <label for="monthsOfResidency" class="form-label">Additional Months (Optional)</label>
                      <input
                        type="number"
                        class="form-control"
                        id="monthsOfResidency"
                        v-model.number="profileForm.months_of_residency"
                        placeholder="e.g., 6"
                        min="0"
                        max="11"
                      >
                    </div>
                  </div>

                  <div class="d-grid gap-2 d-md-flex justify-content-md-between">
                    <button
                      type="button"
                      class="btn btn-outline-secondary"
                      @click="goToPreviousStep"
                    >
                      <i class="fas fa-arrow-left me-2"></i>
                      Back
                    </button>
                    <button
                      type="submit"
                      class="btn btn-primary"
                      :disabled="loading"
                    >
                      <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                      {{ loading ? 'Saving Profile...' : 'Complete Registration' }}
                    </button>
                  </div>
                </form>
              </div>

              <!-- Step 3: Residency Document Upload -->
              <div v-if="currentStep === 3" class="step-content">
                <h5 class="mb-3">Proof of Residency</h5>
                <div class="alert alert-info mb-4">
                  <i class="fas fa-info-circle me-2"></i>
                  <strong>Required:</strong> Please upload at least one document that proves you are a resident of Barangay Bula.
                </div>

                <form @submit.prevent="submitDocumentForm">
                  <!-- Document Upload Section -->
                  <div class="mb-4">
                    <h6 class="mb-3">Upload Proof of Residency Documents</h6>

                    <!-- Utility Bill -->
                    <div class="mb-3">
                      <label class="form-label">
                        <i class="fas fa-file-invoice me-2"></i>
                        Utility Bill (Electricity, Water, Internet)
                      </label>
                      <input
                        type="file"
                        class="form-control"
                        @change="handleFileUpload($event, 'utility_bill')"
                        accept=".jpg,.jpeg,.png,.pdf,.webp"
                        multiple
                      >
                      <small class="form-text text-muted">
                        Upload recent utility bills showing your name and Barangay Bula address
                      </small>
                      <div v-if="uploadedFiles.utility_bill && uploadedFiles.utility_bill.length > 0" class="mt-2">
                        <div v-for="(file, index) in uploadedFiles.utility_bill" :key="index" class="d-flex align-items-center justify-content-between bg-light p-2 rounded mb-1">
                          <span class="text-truncate">{{ file.name }}</span>
                          <button type="button" class="btn btn-sm btn-outline-danger" @click="removeFile('utility_bill', index)">
                            <i class="fas fa-times"></i>
                          </button>
                        </div>
                      </div>
                    </div>

                    <!-- Barangay Certificate -->
                    <div class="mb-3">
                      <label class="form-label">
                        <i class="fas fa-certificate me-2"></i>
                        Barangay Certificate of Residency
                      </label>
                      <input
                        type="file"
                        class="form-control"
                        @change="handleFileUpload($event, 'barangay_certificate')"
                        accept=".jpg,.jpeg,.png,.pdf,.webp"
                      >
                      <small class="form-text text-muted">
                        Official certificate from Barangay Bula confirming your residency
                      </small>
                      <div v-if="uploadedFiles.barangay_certificate && uploadedFiles.barangay_certificate.length > 0" class="mt-2">
                        <div v-for="(file, index) in uploadedFiles.barangay_certificate" :key="index" class="d-flex align-items-center justify-content-between bg-light p-2 rounded mb-1">
                          <span class="text-truncate">{{ file.name }}</span>
                          <button type="button" class="btn btn-sm btn-outline-danger" @click="removeFile('barangay_certificate', index)">
                            <i class="fas fa-times"></i>
                          </button>
                        </div>
                      </div>
                    </div>

                    <!-- Valid ID -->
                    <div class="mb-3">
                      <label class="form-label">
                        <i class="fas fa-id-card me-2"></i>
                        Valid ID with Barangay Bula Address
                      </label>
                      <input
                        type="file"
                        class="form-control"
                        @change="handleFileUpload($event, 'valid_id')"
                        accept=".jpg,.jpeg,.png,.pdf,.webp"
                        multiple
                      >
                      <small class="form-text text-muted">
                        Government-issued ID showing your address in Barangay Bula
                      </small>
                      <div v-if="uploadedFiles.valid_id && uploadedFiles.valid_id.length > 0" class="mt-2">
                        <div v-for="(file, index) in uploadedFiles.valid_id" :key="index" class="d-flex align-items-center justify-content-between bg-light p-2 rounded mb-1">
                          <span class="text-truncate">{{ file.name }}</span>
                          <button type="button" class="btn btn-sm btn-outline-danger" @click="removeFile('valid_id', index)">
                            <i class="fas fa-times"></i>
                          </button>
                        </div>
                      </div>
                    </div>

                    <!-- Lease Contract -->
                    <div class="mb-3">
                      <label class="form-label">
                        <i class="fas fa-file-contract me-2"></i>
                        Lease Contract or Property Documents
                      </label>
                      <input
                        type="file"
                        class="form-control"
                        @change="handleFileUpload($event, 'lease_contract')"
                        accept=".jpg,.jpeg,.png,.pdf,.webp"
                      >
                      <small class="form-text text-muted">
                        Rental agreement or property ownership documents for Barangay Bula
                      </small>
                      <div v-if="uploadedFiles.lease_contract && uploadedFiles.lease_contract.length > 0" class="mt-2">
                        <div v-for="(file, index) in uploadedFiles.lease_contract" :key="index" class="d-flex align-items-center justify-content-between bg-light p-2 rounded mb-1">
                          <span class="text-truncate">{{ file.name }}</span>
                          <button type="button" class="btn btn-sm btn-outline-danger" @click="removeFile('lease_contract', index)">
                            <i class="fas fa-times"></i>
                          </button>
                        </div>
                      </div>
                    </div>

                    <!-- Other Documents -->
                    <div class="mb-3">
                      <label class="form-label">
                        <i class="fas fa-file-alt me-2"></i>
                        Other Supporting Documents
                      </label>
                      <input
                        type="file"
                        class="form-control"
                        @change="handleFileUpload($event, 'other')"
                        accept=".jpg,.jpeg,.png,.pdf,.webp"
                        multiple
                      >
                      <small class="form-text text-muted">
                        Any other documents that can prove your residency in Barangay Bula
                      </small>
                      <div v-if="uploadedFiles.other && uploadedFiles.other.length > 0" class="mt-2">
                        <div v-for="(file, index) in uploadedFiles.other" :key="index" class="d-flex align-items-center justify-content-between bg-light p-2 rounded mb-1">
                          <span class="text-truncate">{{ file.name }}</span>
                          <button type="button" class="btn btn-sm btn-outline-danger" @click="removeFile('other', index)">
                            <i class="fas fa-times"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="d-grid gap-2 d-md-flex justify-content-md-between">
                    <button
                      type="button"
                      class="btn btn-outline-secondary"
                      @click="goToPreviousStep"
                    >
                      <i class="fas fa-arrow-left me-2"></i>
                      Back
                    </button>
                    <button
                      type="submit"
                      class="btn btn-primary"
                      :disabled="loading || !hasUploadedFiles"
                    >
                      <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                      {{ loading ? 'Uploading Documents...' : 'Upload Documents' }}
                    </button>
                  </div>
                </form>
              </div>

              <!-- Step 4: Verification Code Input -->
              <div v-if="currentStep === 4 && verificationMethodSelected && profileForm" class="step-content">
                <div class="text-center">
                  <div class="mb-4">
                    <i class="fas fa-shield-alt text-primary" style="font-size: 3rem;"></i>
                  </div>
                  <h5 class="mb-3">Verify Your Account</h5>
                  <!-- <p class="text-muted mb-4">
                    We've sent the <strong>same verification code</strong> to both your email <strong>{{ accountForm?.email }}</strong>
                    <span v-if="profileForm?.phone_number"> and SMS <strong>{{ profileForm.phone_number }}</strong></span>.
                    <br>Enter the verification code you received (it's the same in both channels).
                  </p> -->
                  <p class="text-muted mb-4">
                    We've sent the <strong>verification code</strong> to your email <strong>{{ accountForm?.email }}</strong>.
                    <br>Enter the verification code you received.
                  </p>

                </div>

                <form @submit.prevent="submitVerificationForm">
                  <div class="mb-3">
                    <label for="otp" class="form-label">Verification Code</label>
                    <input
                      type="text"
                      class="form-control text-center"
                      :class="{ 'is-invalid': errors.otp }"
                      id="otp"
                      v-model="verificationForm.otp"
                      @input="clearFieldError('otp')"
                      placeholder="Enter 6-digit code"
                      maxlength="6"
                      required
                    >
                    <div v-if="errors.otp" class="invalid-feedback">
                      {{ errors.otp }}
                    </div>
                  </div>

                  <div class="d-grid gap-2 mb-3">
                    <button
                      type="submit"
                      class="btn btn-primary"
                      :disabled="loading"
                    >
                      <!-- <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span> -->
                      Send
                      <!-- {{ loading ? 'Verifying...' : (verificationMethod === 'email' ? 'Verify Email' : 'Verify Phone Number') }} -->
                    </button>
                  </div>

                  <div class="text-center">
                    <p class="text-muted mb-2">Didn't receive the code?</p>
                    <button
                      type="button"
                      class="btn btn-link p-0"
                      @click="resendVerificationCode"
                      :disabled="resendLoading || resendCooldown > 0"
                    >
                      <span v-if="resendLoading" class="spinner-border spinner-border-sm me-2"></span>
                      {{ resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code' }}
                    </button>
                  </div>
                </form>
              </div>

              <!-- Success Message -->
              <div v-if="currentStep === 5" class="step-content text-center">
                <div class="mb-4">
                  <i class="fas fa-check-circle text-success" style="font-size: 4rem;"></i>
                </div>
                <h4 class="text-success mb-3">Registration Complete!</h4>
                <div class="alert alert-success mb-4">
                  <i class="fas fa-check-circle me-2"></i>
                  <strong>Account Status:</strong> Active
                </div>
                <p class="text-muted mb-4">
                  Your account has been created successfully! You can now log in to access the system.
                  To request barangay documents, you'll need to upload residency verification documents
                  for admin review.
                </p>
                <div class="d-grid gap-2">
                  <button
                    type="button"
                    class="btn btn-primary"
                    @click="goToLogin"
                  >
                    <i class="fas fa-sign-in-alt me-2"></i>
                    Go to Login
                  </button>
                </div>
              </div>

              <!-- Error Alert -->
              <div v-if="errorMessage" class="alert alert-danger mt-3" role="alert">
                <i class="fas fa-exclamation-triangle me-2"></i>
                {{ errorMessage }}
              </div>

              <!-- Success Alert -->
              <div v-if="successMessage" class="alert alert-success mt-3" role="alert">
                <i class="fas fa-check-circle me-2"></i>
                {{ successMessage }}
              </div>
            </div>

            <div class="card-footer text-center py-3">
              <p class="mb-0 text-muted">
                Already have an account? 
                <router-link to="/client/login" class="text-decoration-none">
                  Sign in here
                </router-link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script src="./js/clientRegistration.js"></script>

<style scoped src="./css/clientRegistration.css"></style>
