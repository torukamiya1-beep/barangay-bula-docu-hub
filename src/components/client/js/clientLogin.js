import clientAuthService from '@/services/clientAuthService';
import { validators, clearFieldError } from '@/utils/validation';

export default {
  name: 'ClientLogin',
  data() {
    return {
      loading: false,
      forgotPasswordLoading: false,
      showPassword: false,
      showStatusInfo: false,
      showForgotPasswordModal: false,
      errorMessage: '',
      successMessage: '',
      
      // Login form data
      loginForm: {
        username: '',
        password: '',
        rememberMe: false
      },
      
      // Forgot password form data
      forgotPasswordForm: {
        email: ''
      },
      
      // Form errors
      errors: {}
    };
  },
  
  mounted() {
    // Check if user is already logged in
    if (clientAuthService.isLoggedIn()) {
      this.$router.push('/client/dashboard');
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
        const response = await clientAuthService.login({
          username: this.loginForm.username,
          password: this.loginForm.password
        });
        
        if (response.success) {
          this.successMessage = 'Login successful! Redirecting...';
          
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            this.$router.push('/client/dashboard');
          }, 1500);
        }
      } catch (error) {
        const errorData = clientAuthService.parseError(error);
        this.errorMessage = errorData.message;
        
        // Show status info for specific error types
        if (errorData.message.includes('pending') ||
            errorData.message.includes('suspended') ||
            errorData.message.includes('inactive') ||
            errorData.message.includes('residency') ||
            errorData.message.includes('rejected')) {
          this.showStatusInfo = true;
        }
      } finally {
        this.loading = false;
      }
    },
    
    // Show forgot password modal
    showForgotPassword() {
      this.showForgotPasswordModal = true;
      this.clearMessages();
    },
    
    // Close forgot password modal
    closeForgotPassword() {
      this.showForgotPasswordModal = false;
      this.forgotPasswordForm.email = '';
      this.clearFieldError('resetEmail');
    },
    
    // Submit forgot password form
    async submitForgotPassword() {
      this.clearMessages();
      
      if (!validators.email(this.forgotPasswordForm.email)) {
        this.errors = { ...this.errors, resetEmail: 'Please enter a valid email address' };
        return;
      }
      
      this.forgotPasswordLoading = true;
      
      try {
        // This would typically call a password reset API
        // For now, we'll simulate the process
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        this.successMessage = 'Password reset instructions have been sent to your email.';
        this.closeForgotPassword();
      } catch (error) {
        this.errorMessage = 'Failed to send password reset email. Please try again.';
      } finally {
        this.forgotPasswordLoading = false;
      }
    }
  }
};
