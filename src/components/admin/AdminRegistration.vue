<template>
  <div class="admin-registration">
    <div class="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div class="row w-100 justify-content-center">
        <div class="col-12 col-md-8 col-lg-6 col-xl-5">
          <div class="card shadow-lg border-0">
            <div class="card-header bg-success text-white text-center py-4">
              <h3 class="mb-0">
                <i class="fas fa-user-plus me-2"></i>
                Admin Registration
              </h3>
              <p class="mb-0 mt-2">Barangay Bula Management System</p>
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
                      <div class="step-label">Verify</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Step 1: Account Creation -->
              <div v-if="currentStep === 1" class="step-content">
                <h5 class="mb-3">Create Admin Account</h5>
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
                    <label for="role" class="form-label">Role</label>
                    <select
                      class="form-select"
                      :class="{ 'is-invalid': errors.role }"
                      id="role"
                      v-model="accountForm.role"
                      @change="clearFieldError('role')"
                      required
                    >
                      <option value="">Select Role</option>
                      <option value="admin">System Administrator</option>
                      <option value="employee">Barangay Employee</option>
                      <option value="staff">Support Staff</option>
                    </select>
                    <div v-if="errors.role" class="invalid-feedback">
                      {{ errors.role }}
                    </div>
                    <div class="form-text">
                      Choose the appropriate role for this admin account.
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
                      class="btn btn-success"
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
                      <label for="suffix" class="form-label">Suffix (Optional)</label>
                      <input
                        type="text"
                        class="form-control"
                        id="suffix"
                        v-model="profileForm.suffix"
                        placeholder="Jr., Sr., III, etc."
                      >
                    </div>
                  </div>

                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label for="employeeId" class="form-label">Employee ID (Optional)</label>
                      <input
                        type="text"
                        class="form-control"
                        id="employeeId"
                        v-model="profileForm.employee_id"
                        placeholder="Enter employee ID"
                      >
                    </div>
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
                  </div>

                  <!-- Work Information -->
                  <h6 class="mt-4 mb-3">Work Information</h6>
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label for="position" class="form-label">Position</label>
                      <input
                        type="text"
                        class="form-control"
                        id="position"
                        v-model="profileForm.position"
                        placeholder="Enter your position"
                      >
                    </div>
                    <div class="col-md-6 mb-3">
                      <label for="department" class="form-label">Department</label>
                      <input
                        type="text"
                        class="form-control"
                        id="department"
                        v-model="profileForm.department"
                        placeholder="Enter your department"
                      >
                    </div>
                  </div>

                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label for="hireDate" class="form-label">Hire Date (Optional)</label>
                      <input
                        type="date"
                        class="form-control"
                        id="hireDate"
                        v-model="profileForm.hire_date"
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
                      class="btn btn-success"
                      :disabled="loading"
                    >
                      <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                      {{ loading ? 'Saving Profile...' : 'Complete Registration' }}
                    </button>
                  </div>
                </form>
              </div>

              <!-- Step 3: Email Verification -->
              <div v-if="currentStep === 3" class="step-content">
                <div class="text-center">
                  <div class="mb-4">
                    <i class="fas fa-envelope-open-text text-success" style="font-size: 3rem;"></i>
                  </div>
                  <h5 class="mb-3">Verify Your Email</h5>
                  <p class="text-muted mb-4">
                    We've sent a 6-digit verification code to <strong>{{ accountForm.email }}</strong>.
                    Please check your email and enter the code below to complete your registration.
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
                      class="btn btn-success"
                      :disabled="loading"
                    >
                      <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                      {{ loading ? 'Verifying...' : 'Verify Email' }}
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
              <div v-if="currentStep === 4" class="step-content text-center">
                <div class="mb-4">
                  <i class="fas fa-check-circle text-success" style="font-size: 4rem;"></i>
                </div>
                <h4 class="text-success mb-3">Registration Successful!</h4>
                <p class="text-muted mb-4">
                  Your admin account has been created and verified successfully.
                  You can now log in to access the admin panel.
                </p>
                <div class="d-grid gap-2">
                  <button
                    type="button"
                    class="btn btn-success"
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
                <router-link to="/admin/login" class="text-decoration-none">
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

<script>
import adminAuthService from '@/services/adminAuthService';
import { validators, clearFieldError } from '@/utils/validation';

export default {
  name: 'AdminRegistration',
  data() {
    return {
      currentStep: 1,
      loading: false,
      resendLoading: false,
      resendCooldown: 0,
      showPassword: false,
      errorMessage: '',
      successMessage: '',

      // Account form data (Step 1)
      accountForm: {
        username: '',
        email: '',
        role: '',
        password: '',
        confirmPassword: ''
      },

      // Profile form data (Step 2)
      profileForm: {
        first_name: '',
        middle_name: '',
        last_name: '',
        suffix: '',
        employee_id: '',
        phone_number: '',
        position: '',
        department: '',
        hire_date: ''
      },

      // Verification form data (Step 3)
      verificationForm: {
        otp: ''
      },

      // Form errors
      errors: {},

      // Store account ID for profile completion
      accountId: null
    };
  },

  mounted() {
    console.log('AdminRegistration component mounted');

    // Check if admin is already logged in
    try {
      if (adminAuthService && typeof adminAuthService.isLoggedIn === 'function' && adminAuthService.isLoggedIn()) {
        this.$router.push('/admin/dashboard');
      }
    } catch (error) {
      console.warn('Admin auth check failed:', error);
    }
  },

  methods: {
    // Validate individual field
    validateField(fieldName) {
      let error = null;
      let value;

      // Determine which form the field belongs to
      if (fieldName in this.accountForm) {
        value = this.accountForm[fieldName];
      } else if (fieldName in this.profileForm) {
        value = this.profileForm[fieldName];
      } else if (fieldName in this.verificationForm) {
        value = this.verificationForm[fieldName];
      }

      switch (fieldName) {
        case 'username':
          error = validators.required(value, 'Username') ||
                  validators.minLength(value, 3, 'Username') ||
                  validators.maxLength(value, 50, 'Username');
          break;
        case 'email':
          error = validators.required(value, 'Email') ||
                  validators.email(value);
          break;
        case 'role':
          error = validators.required(value, 'Role');
          break;
        case 'password':
          error = validators.required(value, 'Password') ||
                  validators.password(value);
          break;
        case 'confirmPassword':
          error = validators.required(value, 'Confirm Password') ||
                  validators.passwordMatch(value, this.accountForm.password);
          break;
        case 'first_name':
          error = validators.required(value, 'First Name') ||
                  validators.maxLength(value, 100, 'First Name');
          break;
        case 'last_name':
          error = validators.required(value, 'Last Name') ||
                  validators.maxLength(value, 100, 'Last Name');
          break;
        case 'phone_number':
          error = validators.required(value, 'Phone Number') ||
                  validators.phone(value);
          break;
        case 'otp':
          error = validators.required(value, 'Verification Code') ||
                  validators.exactLength(value, 6, 'Verification Code');
          break;
      }

      if (error) {
        this.errors = { ...this.errors, [fieldName]: error };
      } else {
        this.clearFieldError(fieldName);
      }

      return !error;
    },

    // Clear field error
    clearFieldError(fieldName) {
      this.errors = clearFieldError(this.errors, fieldName);
    },

    // Clear all messages
    clearMessages() {
      this.errorMessage = '';
      this.successMessage = '';
    },

    // Handle phone number input to restrict to digits only
    handlePhoneInput(event) {
      const value = event.target.value;
      // Remove any non-digit characters
      const digitsOnly = value.replace(/\D/g, '');
      // Limit to 11 digits
      const limitedValue = digitsOnly.substring(0, 11);
      this.profileForm.phone_number = limitedValue;
      this.clearFieldError('phone_number');
    },

    // Submit account form (Step 1)
    async submitAccountForm() {
      this.clearMessages();

      // Validate account form fields
      const fieldsToValidate = ['username', 'email', 'role', 'password', 'confirmPassword'];
      let isValid = true;

      fieldsToValidate.forEach(field => {
        if (!this.validateField(field)) {
          isValid = false;
        }
      });

      if (!isValid) {
        this.errorMessage = 'Please fill in all required fields correctly';
        return;
      }

      this.loading = true;

      try {
        const response = await adminAuthService.registerAccount({
          username: this.accountForm.username,
          email: this.accountForm.email,
          role: this.accountForm.role,
          password: this.accountForm.password,
          confirmPassword: this.accountForm.confirmPassword
        });

        if (response.success) {
          this.accountId = response.data.accountId;
          this.currentStep = 2;
          this.successMessage = 'Account created successfully! Please complete your profile.';
        }
      } catch (error) {
        const errorData = adminAuthService.parseError(error);
        this.errorMessage = errorData.message;

        // Handle field-specific errors
        if (errorData.errors && errorData.errors.length > 0) {
          errorData.errors.forEach(err => {
            if (err.field) {
              this.errors = { ...this.errors, [err.field]: err.message };
            }
          });
        }
      } finally {
        this.loading = false;
      }
    },

    // Submit profile form (Step 2)
    async submitProfileForm() {
      this.clearMessages();

      // Validate profile form fields
      const fieldsToValidate = ['first_name', 'last_name', 'phone_number'];
      let isValid = true;

      fieldsToValidate.forEach(field => {
        if (!this.validateField(field)) {
          isValid = false;
        }
      });

      if (!isValid) {
        this.errorMessage = 'Please fill in all required fields correctly';
        return;
      }

      this.loading = true;

      try {
        const response = await adminAuthService.completeRegistration(this.accountId, {
          email: this.accountForm.email, // Include email from step 1
          first_name: this.profileForm.first_name,
          middle_name: this.profileForm.middle_name,
          last_name: this.profileForm.last_name,
          suffix: this.profileForm.suffix,
          employee_id: this.profileForm.employee_id,
          phone_number: this.profileForm.phone_number,
          position: this.profileForm.position,
          department: this.profileForm.department,
          hire_date: this.profileForm.hire_date
        });

        if (response.success) {
          // Send OTP for email verification
          await this.sendVerificationOTP();
          this.currentStep = 3;
          this.successMessage = 'Profile completed! Please verify your email address.';
        }
      } catch (error) {
        const errorData = adminAuthService.parseError(error);
        this.errorMessage = errorData.message;

        // Handle field-specific errors
        if (errorData.errors && errorData.errors.length > 0) {
          errorData.errors.forEach(err => {
            if (err.field) {
              this.errors = { ...this.errors, [err.field]: err.message };
            }
          });
        }
      } finally {
        this.loading = false;
      }
    },

    // Send verification OTP
    async sendVerificationOTP() {
      try {
        await adminAuthService.sendOTP(
          this.accountForm.email,
          'registration',
          this.profileForm.first_name
        );
      } catch (error) {
        console.error('Failed to send OTP:', error);
        // Don't throw error here as profile was already saved
      }
    },

    // Submit verification form (Step 3)
    async submitVerificationForm() {
      this.clearMessages();

      if (!this.validateField('otp')) {
        this.errorMessage = 'Please enter a valid verification code';
        return;
      }

      this.loading = true;

      try {
        const response = await adminAuthService.verifyEmail(
          this.accountForm.email,
          this.verificationForm.otp
        );

        if (response.success) {
          this.currentStep = 4;
          this.successMessage = 'Email verified successfully!';
        }
      } catch (error) {
        const errorData = adminAuthService.parseError(error);
        this.errorMessage = errorData.message;
      } finally {
        this.loading = false;
      }
    },

    // Resend verification code
    async resendVerificationCode() {
      if (this.resendCooldown > 0) return;

      this.resendLoading = true;

      try {
        await this.sendVerificationOTP();
        this.successMessage = 'Verification code sent successfully!';
        this.startResendCooldown();
      } catch (error) {
        const errorData = adminAuthService.parseError(error);
        this.errorMessage = errorData.message || 'Failed to resend verification code';
      } finally {
        this.resendLoading = false;
      }
    },

    // Start resend cooldown
    startResendCooldown() {
      this.resendCooldown = 60;
      const interval = setInterval(() => {
        this.resendCooldown--;
        if (this.resendCooldown <= 0) {
          clearInterval(interval);
        }
      }, 1000);
    },

    // Go to previous step
    goToPreviousStep() {
      if (this.currentStep > 1) {
        this.currentStep--;
        this.clearMessages();
      }
    },

    // Go to login page
    goToLogin() {
      this.$router.push('/admin/login?registered=true');
    }
  }
};
</script>

<style scoped src="./css/adminRegistration.css"></style>
