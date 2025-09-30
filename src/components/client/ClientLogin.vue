<template>
  <div class="client-login">
    <div class="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div class="row w-100 justify-content-center">
        <div class="col-12 col-md-6 col-lg-5 col-xl-4">
          <div class="card shadow-lg border-0">
            <div class="card-header bg-primary text-white text-center py-4">
              <h3 class="mb-0">
                <i class="fas fa-sign-in-alt me-2"></i>
                Client Login
              </h3>
              <p class="mb-0 mt-2">Barangay Bula Management System</p>
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

                <div class="mb-3">
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
                </div>

                <div class="d-grid gap-2 mb-3">
                  <button
                    type="submit"
                    class="btn btn-primary"
                    :disabled="loading"
                  >
                    <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                    {{ loading ? 'Signing In...' : 'Sign In' }}
                  </button>
                </div>

                <div class="text-center">
                  <a href="#" class="text-decoration-none text-muted" @click.prevent="showForgotPassword">
                    <i class="fas fa-key me-1"></i>
                    Forgot your password?
                  </a>
                </div>
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

            <div class="card-footer text-center py-3">
              <p class="mb-0 text-muted">
                Don't have an account? 
                <router-link to="/client/register" class="text-decoration-none">
                  Register here
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

    <!-- Forgot Password Modal -->
    <div v-if="showForgotPasswordModal" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fas fa-key me-2"></i>
              Reset Password
            </h5>
            <button type="button" class="btn-close" @click="closeForgotPassword"></button>
          </div>
          <div class="modal-body">
            <p class="text-muted mb-3">
              Enter your email address and we'll send you a link to reset your password.
            </p>
            <form @submit.prevent="submitForgotPassword">
              <div class="mb-3">
                <label for="resetEmail" class="form-label">Email Address</label>
                <input
                  type="email"
                  class="form-control"
                  :class="{ 'is-invalid': errors.resetEmail }"
                  id="resetEmail"
                  v-model="forgotPasswordForm.email"
                  @input="clearFieldError('resetEmail')"
                  placeholder="Enter your email address"
                  required
                >
                <div v-if="errors.resetEmail" class="invalid-feedback">
                  {{ errors.resetEmail }}
                </div>
              </div>
              <div class="d-grid gap-2">
                <button
                  type="submit"
                  class="btn btn-primary"
                  :disabled="forgotPasswordLoading"
                >
                  <span v-if="forgotPasswordLoading" class="spinner-border spinner-border-sm me-2"></span>
                  {{ forgotPasswordLoading ? 'Sending...' : 'Send Reset Link' }}
                </button>
                <button
                  type="button"
                  class="btn btn-outline-secondary"
                  @click="closeForgotPassword"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script src="./js/clientLogin.js"></script>

<style scoped src="./css/clientLogin.css"></style>