<template>
  <div class="unified-login">
    <div class="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div class="row w-100 justify-content-center">
        <div class="col-12 col-md-6 col-lg-5 col-xl-4">
          <div class="card shadow-lg border-0">
            <!-- Header with Logo -->
            <div class="card-header bg-primary text-white text-center py-4">
              <img
                src="@/assets/icon-of-bula.jpg"
                alt="Barangay Bula Council official seal"
                class="logo mb-2"
              />
              <h3 class="mb-0">
                Barangay Bula Document Hub
              </h3>
              <p class="mb-0 mt-2">
                <i class="fas fa-sign-in-alt me-2"></i>
                Login
              </p>
            </div>
            
            <div class="card-body p-4">
              <form @submit.prevent="submitLogin">
                <div class="mb-3">
                  <label for="username" class="form-label">Username</label>
                  <div class="input-group">
                    <span class="input-group-text">
                      <i class="fas fa-user"></i>
                    </span>
                    <input
                      type="text"
                      class="form-control"
                      :class="{ 'is-invalid': errors.username }"
                      id="username"
                      v-model="loginForm.username"
                      @blur="validateField('username')"
                      @input="clearFieldError('username')"
                      placeholder="Enter your username"
                      required
                      autocomplete="username"
                    >
                  </div>
                  <div v-if="errors.username" class="invalid-feedback d-block">
                    {{ errors.username }}
                  </div>
                </div>

                <div class="mb-4">
                  <label for="password" class="form-label">Password</label>
                  <div class="input-group">
                    <span class="input-group-text">
                      <i class="fas fa-lock"></i>
                    </span>
                    <input
                      :type="showPassword ? 'text' : 'password'"
                      class="form-control"
                      :class="{ 'is-invalid': errors.password }"
                      id="password"
                      v-model="loginForm.password"
                      @blur="validateField('password')"
                      @input="clearFieldError('password')"
                      placeholder="Enter your password"
                      required
                      autocomplete="current-password"
                    >
                    <button
                      type="button"
                      class="btn btn-outline-secondary"
                      @click="showPassword = !showPassword"
                      tabindex="-1"
                    >
                      <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                    </button>
                  </div>
                  <div v-if="errors.password" class="invalid-feedback d-block">
                    {{ errors.password }}
                  </div>
                </div>

                <!-- Ill commenr this for now -->
                <!-- <div class="mb-3">
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      id="rememberMe"
                      v-model="loginForm.rememberMe"
                    >
                    <label class="form-check-label" for="rememberMe">
                      Remember me
                    </label>
                  </div>
                </div> -->

                <div class="d-grid gap-2 mb-3">
                  <button
                    type="submit"
                    class="btn btn-primary btn-lg"
                    :disabled="loading"
                  >
                    <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                    {{ loading ? 'Signing In...' : 'Sign In' }}
                  </button>
                </div>

                <!-- <div class="text-center">
                  <a href="#" class="text-decoration-none text-muted" @click.prevent="showForgotPassword">
                    <i class="fas fa-key me-1"></i>
                    Forgot your password?
                  </a>
                </div> -->
              </form>

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

            <div class="card-footer text-center py-3 bg-light">
              <p class="mb-0 text-muted">
                Don't have an account? 
                <router-link to="/client/register" class="text-decoration-none">
                  Register Here
                </router-link>
              </p>
            </div>
          </div>

          <!-- Account Status Info -->
          <div v-if="showStatusInfo" class="card mt-3 border-warning">
            <div class="card-body">
              <h6 class="card-title text-warning">
                <i class="fas fa-info-circle me-2"></i>
                Account Status Information
              </h6>
              <div class="small text-muted">
                <p class="mb-2">
                  <strong>Pending Verification:</strong> Complete your email verification to activate your account.
                </p>
                <p class="mb-2">
                  <strong>Suspended:</strong> Your account has been temporarily suspended. Contact the administrator.
                </p>
                <p class="mb-0">
                  <strong>Inactive:</strong> Your account is inactive. Contact the administrator for assistance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import unifiedAuthService from '@/services/unifiedAuthService';
import { validators, clearFieldError } from '@/utils/validation';

export default {
  name: 'UnifiedLogin',
  data() {
    return {
      loading: false,
      showPassword: false,
      showStatusInfo: false,
      errorMessage: '',
      successMessage: '',
      
      // Login form data
      loginForm: {
        username: '',
        password: '',
        rememberMe: false
      },
      
      // Form errors
      errors: {}
    };
  },
  
  mounted() {
    // Check if user is already logged in
    if (unifiedAuthService.isLoggedIn()) {
      const user = unifiedAuthService.getCurrentUser();
      const redirectUrl = unifiedAuthService.getRedirectUrl(user);
      console.log('User already logged in, redirecting to:', redirectUrl);
      try {
        this.$router.push(redirectUrl);
      } catch (error) {
        console.error('Router push error in mounted:', error);
        window.location.href = redirectUrl;
      }
    }
    
    // Show success message if redirected from registration
    if (this.$route.query.registered === 'true') {
      this.successMessage = 'Registration completed successfully! Please log in.';
    }
  },
  
  methods: {
    // Validate individual field
    validateField(fieldName) {
      let error = null;
      const value = this.loginForm[fieldName];
      
      switch (fieldName) {
        case 'username':
          error = validators.required(value, 'Username');
          break;
        case 'password':
          error = validators.required(value, 'Password');
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
      this.showStatusInfo = false;
    },
    
    // Submit login form
    async submitLogin() {
      this.clearMessages();
      
      // Validate fields
      const fieldsToValidate = ['username', 'password'];
      let isValid = true;
      
      fieldsToValidate.forEach(field => {
        if (!this.validateField(field)) {
          isValid = false;
        }
      });
      
      if (!isValid) {
        this.errorMessage = 'Please fill in all required fields';
        return;
      }
      
      this.loading = true;
      
      try {
        const response = await unifiedAuthService.login({
          username: this.loginForm.username,
          password: this.loginForm.password
        });
        
        if (response.success) {
          this.successMessage = 'Login successful! Redirecting...';

          console.log('Login successful, user:', response.user);
          console.log('Redirect URL:', response.redirectUrl);

          // Verify authentication state is set and redirect
          setTimeout(() => {
            console.log('Verifying auth state before redirect:');
            console.log('- isLoggedIn:', unifiedAuthService.isLoggedIn());
            console.log('- getCurrentUser:', unifiedAuthService.getCurrentUser());
            console.log('- getUserType:', unifiedAuthService.getUserType());

            // Force a small additional delay to ensure state is persisted
            setTimeout(() => {
              console.log('Final redirect attempt to:', response.redirectUrl);
              try {
                this.$router.push(response.redirectUrl);
              } catch (error) {
                console.error('Router push error:', error);
                // Fallback to window.location
                window.location.href = response.redirectUrl;
              }
            }, 100);
          }, 1000);
        }
      } catch (error) {
        const errorData = unifiedAuthService.parseError(error);
        this.errorMessage = errorData.message;
        
        // Show status info for specific error types
        if (errorData.message.includes('pending') || 
            errorData.message.includes('suspended') || 
            errorData.message.includes('inactive')) {
          this.showStatusInfo = true;
        }
      } finally {
        this.loading = false;
      }
    },
    
    // Show forgot password (placeholder)
    showForgotPassword() {
      alert('Forgot password functionality will be implemented soon.');
    }
  }
};
</script>

<style scoped>
.unified-login {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.logo {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.card {
  border-radius: 15px;
  overflow: hidden;
}

.card-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.form-control {
  border-radius: 8px;
  border: 1px solid #e1e5e9;
  transition: all 0.3s ease;
}

.form-control:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
}

.input-group-text {
  background-color: #f8f9fa;
  border-color: #e1e5e9;
  color: #6c757d;
}
</style>
