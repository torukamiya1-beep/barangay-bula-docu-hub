import clientAuthService from '@/services/clientAuthService';
import { validators, formatApiErrors, clearFieldError } from '@/utils/validation';
import AddressSelector from '@/components/common/AddressSelector.vue';

export default {
  name: 'ClientRegistration',
  components: {
    AddressSelector
  },
  data() {
    return {
      currentStep: 1,
      loading: false,
      resendLoading: false,
      resendCooldown: 0,
      showPassword: false,
      errorMessage: '',
      successMessage: '',
      accountId: null,

      verificationMethodSelected: false,
      
      // Account form data
      accountForm: {
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
      },
      
      // Profile form data
      profileForm: {
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
        barangay: '',
        city_municipality: '',
        province: '',
        region: '',
        region_code: '',
        province_code: '',
        city_code: '',
        barangay_code: '',
        postal_code: '9500',
        years_of_residency: null,
        months_of_residency: null
      },
      
      // Document upload data
      uploadedFiles: {
        utility_bill: [],
        barangay_certificate: [],
        valid_id: [],
        lease_contract: [],
        other: []
      },

      // Verification form data
      verificationForm: {
        otp: ''
      },

      // Address data
      addressData: {
        region_code: '',
        province_code: '',
        city_code: '',
        barangay_code: '',
        region_name: '',
        province_name: '',
        city_name: '',
        barangay_name: ''
      },

      // Form errors
      errors: {},
      addressErrors: {}
    };
  },

  computed: {
    hasUploadedFiles() {
      return Object.values(this.uploadedFiles).some(files => files.length > 0);
    }
  },

  mounted() {
    // Ensure profileForm is properly initialized
    if (!this.profileForm) {
      this.profileForm = {
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
        barangay: '',
        city_municipality: '',
        province: '',
        region: '',
        region_code: '',
        province_code: '',
        city_code: '',
        barangay_code: '',
        postal_code: '9500',
        years_of_residency: null,
        months_of_residency: null
      };
    }
  },

  methods: {
    // Validate individual field
    validateField(fieldName) {
      let error = null;
      const value = this.getFieldValue(fieldName);
      
      switch (fieldName) {
        case 'username':
          error = validators.required(value, 'Username') || validators.username(value);
          break;
        case 'email':
          error = validators.required(value, 'Email') || validators.email(value);
          break;
        case 'password':
          error = validators.required(value, 'Password') || validators.password(value);
          break;
        case 'confirmPassword':
          error = validators.required(value, 'Confirm Password') || 
                  validators.confirmPassword(value, this.accountForm.password);
          break;
        case 'first_name':
          error = validators.required(value, 'First Name') || validators.name(value, 'First Name');
          break;
        case 'last_name':
          error = validators.required(value, 'Last Name') || validators.name(value, 'Last Name');
          break;
        case 'birth_date':
          error = validators.required(value, 'Birth Date') || validators.birthDate(value);
          break;
        case 'gender':
          error = validators.required(value, 'Gender');
          break;
        case 'civil_status_id':
          error = validators.required(value, 'Civil Status');
          break;
        case 'nationality':
          error = validators.required(value, 'Nationality') || validators.name(value, 'Nationality');
          break;
        case 'phone_number':
          error = validators.required(value, 'Phone Number') || validators.phoneNumber(value);
          break;
        case 'barangay':
          error = validators.required(value, 'Barangay') || validators.address(value, 'Barangay');
          break;
        case 'city_municipality':
          error = validators.required(value, 'City/Municipality') || 
                  validators.address(value, 'City/Municipality');
          break;
        case 'province':
          error = validators.required(value, 'Province') || validators.address(value, 'Province');
          break;
        case 'otp':
          error = validators.required(value, 'Verification Code') || validators.otp(value);
          break;
      }
      
      if (error) {
        this.errors = { ...this.errors, [fieldName]: error };
      } else {
        this.clearFieldError(fieldName);
      }
      
      return !error;
    },
    
    // Get field value from appropriate form
    getFieldValue(fieldName) {
      if (Object.prototype.hasOwnProperty.call(this.accountForm, fieldName)) {
        return this.accountForm[fieldName];
      } else if (Object.prototype.hasOwnProperty.call(this.profileForm, fieldName)) {
        return this.profileForm[fieldName];
      } else if (Object.prototype.hasOwnProperty.call(this.verificationForm, fieldName)) {
        return this.verificationForm[fieldName];
      }
      return '';
    },
    
    // Clear field error
    clearFieldError(fieldName) {
      this.errors = clearFieldError(this.errors, fieldName);
    },

    // Handle gender change - clear suffix field when female is selected
    handleGenderChange() {
      this.clearFieldError('gender');

      // Clear suffix field when female is selected
      if (this.profileForm.gender === 'female') {
        this.profileForm.suffix = '';
      }
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
    
    // Clear all messages
    clearMessages() {
      this.errorMessage = '';
      this.successMessage = '';
    },
    
    // Submit account form (Step 1)
    async submitAccountForm() {
      this.clearMessages();
      
      // Validate all account fields
      const fieldsToValidate = ['username', 'email', 'password', 'confirmPassword'];
      let isValid = true;
      
      fieldsToValidate.forEach(field => {
        if (!this.validateField(field)) {
          isValid = false;
        }
      });
      
      if (!isValid) {
        this.errorMessage = 'Please fix the errors above';
        return;
      }
      
      this.loading = true;
      
      try {
        const response = await clientAuthService.registerAccount({
          username: this.accountForm.username,
          email: this.accountForm.email,
          password: this.accountForm.password,
          confirmPassword: this.accountForm.confirmPassword
        });
        
        if (response.success) {
          this.accountId = response.data.accountId;
          this.profileForm.email = this.accountForm.email;
          this.successMessage = response.message;
          this.currentStep = 2;
        }
      } catch (error) {
        const errorData = clientAuthService.parseError(error);
        this.errorMessage = errorData.message;
        
        if (errorData.errors && errorData.errors.length > 0) {
          this.errors = { ...this.errors, ...formatApiErrors(errorData.errors) };
        }
      } finally {
        this.loading = false;
      }
    },
    
    // Submit profile form (Step 2)
    async submitProfileForm() {
      this.clearMessages();

      // Validate address selection first
      if (!this.validateAddressSelection()) {
        this.errorMessage = 'Please select a complete address (Region, Province, City, and Barangay)';
        return;
      }

      // Validate all required profile fields
      const fieldsToValidate = [
        'first_name', 'last_name', 'birth_date', 'gender',
        'civil_status_id', 'nationality', 'phone_number', 'barangay',
        'city_municipality', 'province', 'region'
      ];

      let isValid = true;

      fieldsToValidate.forEach(field => {
        if (!this.validateField(field)) {
          isValid = false;
        }
      });

      if (!isValid) {
        this.errorMessage = 'Please fix the errors above';
        return;
      }

      this.loading = true;

      try {
        const response = await clientAuthService.completeRegistration(this.accountId, {
          ...this.profileForm,
          civil_status_id: parseInt(this.profileForm.civil_status_id)
        });

        if (response.success) {
          this.successMessage = response.message;
          this.currentStep = 3;

          // Start resend cooldown
          this.startResendCooldown();
        }
      } catch (error) {
        const errorData = clientAuthService.parseError(error);

        // Handle specific error cases
        if (errorData.message.includes('Profile already exists')) {
          this.errorMessage = 'Your registration is already complete. Redirecting to login...';

          // Redirect to login after 3 seconds
          setTimeout(() => {
            this.goToLogin();
          }, 3000);
        } else if (errorData.message.includes('Account not found')) {
          this.errorMessage = 'Registration session expired. Please start over.';

          // Go back to step 1 after 3 seconds
          setTimeout(() => {
            this.currentStep = 1;
            this.accountId = null;
            this.clearMessages();
          }, 3000);
        } else {
          this.errorMessage = errorData.message;
        }

        if (errorData.errors && errorData.errors.length > 0) {
          this.errors = { ...this.errors, ...formatApiErrors(errorData.errors) };
        }
      } finally {
        this.loading = false;
      }
    },

    // Handle address change from AddressSelector component
    onAddressChange(addressData) {
      this.addressData = {
        region_code: addressData.region.code,
        province_code: addressData.province.code,
        city_code: addressData.city.code,
        barangay_code: addressData.barangay.code,
        region_name: addressData.region.name,
        province_name: addressData.province.name,
        city_name: addressData.city.name,
        barangay_name: addressData.barangay.name
      };

      // Update profile form with address data
      this.profileForm.barangay = addressData.barangay.name;
      this.profileForm.city_municipality = addressData.city.name;
      this.profileForm.province = addressData.province.name;
      this.profileForm.region = addressData.region.name;
      this.profileForm.region_code = addressData.region.code;
      this.profileForm.province_code = addressData.province.code;
      this.profileForm.city_code = addressData.city.code;
      this.profileForm.barangay_code = addressData.barangay.code;

      // Clear address errors
      this.addressErrors = {};
    },

    // Handle file upload
    handleFileUpload(event, documentType) {
      const files = Array.from(event.target.files);

      // Validate file types and sizes
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf', 'image/webp'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      const validFiles = files.filter(file => {
        if (!validTypes.includes(file.type)) {
          this.errorMessage = `Invalid file type: ${file.name}. Only JPG, PNG, PDF, and WebP files are allowed.`;
          return false;
        }

        if (file.size > maxSize) {
          this.errorMessage = `File too large: ${file.name}. Maximum size is 5MB.`;
          return false;
        }

        return true;
      });

      if (validFiles.length > 0) {
        // For single file types, replace existing files
        if (['barangay_certificate', 'lease_contract'].includes(documentType)) {
          this.uploadedFiles[documentType] = validFiles.slice(0, 1);
        } else {
          // For multiple file types, add to existing files
          this.uploadedFiles[documentType] = [...this.uploadedFiles[documentType], ...validFiles];
        }

        this.clearMessages();
      }

      // Clear the input
      event.target.value = '';
    },

    // Remove uploaded file
    removeFile(documentType, index) {
      this.uploadedFiles[documentType].splice(index, 1);
    },

    // Submit document form (Step 3)
    async submitDocumentForm() {
      this.clearMessages();

      if (!this.hasUploadedFiles) {
        this.errorMessage = 'Please upload at least one proof of residency document';
        return;
      }

      this.loading = true;

      try {
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('account_id', this.accountId);

        // Add all uploaded files to FormData
        Object.keys(this.uploadedFiles).forEach(documentType => {
          this.uploadedFiles[documentType].forEach(file => {
            formData.append(documentType, file);
          });
        });

        // Upload documents using the residency service
        const response = await this.uploadResidencyDocuments(formData);

        if (response.success) {
          this.successMessage = response.message;
          this.currentStep = 4; // Move to verification step
          // Automatically send both email and SMS OTP
          await this.sendBothOTPs();
        }
      } catch (error) {
        const errorData = clientAuthService.parseError(error);
        this.errorMessage = errorData.message;
      } finally {
        this.loading = false;
      }
    },

    // Upload residency documents (API call)
    async uploadResidencyDocuments(formData) {
      // Use the proper API base URL to avoid proxy issues
      const API_BASE_URL = process.env.VUE_APP_API_URL || 'http://localhost:7000/api';

      // Use the registration-specific endpoint that doesn't require authentication
      const response = await fetch(`${API_BASE_URL}/residency/upload-registration`, {
        method: 'POST',
        // No Authorization header needed for registration uploads
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload documents');
      }

      return data;
    },

    // Submit verification form (Step 4)
    async submitVerificationForm() {
      this.clearMessages();
      
      if (!this.validateField('otp')) {
        this.errorMessage = 'Please enter a valid verification code';
        return;
      }
      
      this.loading = true;
      
      try {
        let response;
        let verificationSuccessful = false;

        // Try to verify OTP with email first
        try {
          response = await clientAuthService.verifyEmail(
            this.accountForm.email,
            this.verificationForm.otp
          );
          if (response.success) {
            verificationSuccessful = true;
            this.successMessage = response.message + ' (verified via email)';
          }
        } catch (emailError) {
          // Email verification failed, try SMS if phone number exists
          if (this.profileForm.phone_number) {
            try {
              response = await clientAuthService.verifySMSOTP(
                this.profileForm.phone_number,
                this.verificationForm.otp
              );
              if (response.success) {
                verificationSuccessful = true;
                this.successMessage = response.message + ' (verified via SMS)';
              }
            } catch (smsError) {
              // Both failed
              this.errorMessage = `Invalid verification code. Please check your email or SMS for the correct code.`;
            }
          } else {
            // Only email verification available
            const errorData = clientAuthService.parseError(emailError);
            this.errorMessage = errorData.message;
          }
        }

        if (verificationSuccessful) {
          this.currentStep = 5; // Registration complete
        }
      } catch (error) {
        const errorData = clientAuthService.parseError(error);
        this.errorMessage = errorData.message;
      } finally {
        this.loading = false;
      }
    },
    
    // Resend unified verification code (same code via both email and SMS)
    async resendVerificationCode() {
      if (this.resendCooldown > 0) return;

      this.resendLoading = true;
      this.clearMessages();

      try {
        // Resend unified OTP (same code to both email and SMS)
        const result = await clientAuthService.resendUnifiedOTP(
          this.accountForm.email,
          this.profileForm.phone_number,
          'email_verification',
          this.profileForm.first_name
        );

        if (result.success) {
          let successMessages = [];

          if (result.data.emailSent) {
            successMessages.push('Email verification code resent');
          }

          if (result.data.smsSent) {
            successMessages.push('SMS verification code resent');
          }

          if (successMessages.length > 0) {
            this.successMessage = `${successMessages.join(' and ')}! The same verification code has been resent to both channels - you can use it from either your email or SMS.`;
            this.startResendCooldown();
          } else {
            this.errorMessage = 'Failed to resend verification codes. Please try again.';
          }
        } else {
          this.errorMessage = result.message || 'Failed to resend verification codes. Please try again.';
        }

      } catch (error) {
        console.error('Failed to resend verification codes:', error);
        const errorData = clientAuthService.parseError(error);
        this.errorMessage = errorData.message || 'Failed to resend verification codes. Please try again.';
      } finally {
        this.resendLoading = false;
      }
    },
    
    // Start resend cooldown timer
    startResendCooldown() {
      this.resendCooldown = 60;
      const timer = setInterval(() => {
        this.resendCooldown--;
        if (this.resendCooldown <= 0) {
          clearInterval(timer);
        }
      }, 1000);
    },

    // Validate address selection
    validateAddressSelection() {
      const addressErrors = {};

      if (!this.addressData.region_code) {
        addressErrors.region = 'Region is required';
      }

      if (!this.addressData.province_code) {
        addressErrors.province = 'Province is required';
      }

      if (!this.addressData.city_code) {
        addressErrors.city = 'City/Municipality is required';
      }

      if (!this.addressData.barangay_code) {
        addressErrors.barangay = 'Barangay is required';
      }

      this.addressErrors = addressErrors;
      return Object.keys(addressErrors).length === 0;
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
      this.$router.push('/client/login');
    },

    // Automatically send unified OTP (same code via both email and SMS)
    async sendBothOTPs() {
      this.verificationMethodSelected = true;

      try {
        this.loading = true;
        this.errorMessage = '';

        // Send unified OTP (same code to both email and SMS)
        const result = await clientAuthService.sendUnifiedOTP(
          this.accountForm.email,
          this.profileForm.phone_number,
          'email_verification',
          this.profileForm.first_name
        );

        if (result.success) {
          let successMessages = [];

          if (result.data.emailSent) {
            successMessages.push('Email verification code sent');
          }

          if (result.data.smsSent) {
            successMessages.push('SMS verification code sent');
          }

          if (successMessages.length > 0) {
            this.successMessage = "Email verification code sent! Please check your Gmail to retrieve the code.";
            // this.successMessage = `${successMessages.join(' and ')}! The same verification code has been sent to both channels - you can use it from either your email or SMS.`;
            this.startResendCooldown();
          } else {
            this.errorMessage = 'Failed to send verification codes. Please try again.';
          }
        } else {
          this.errorMessage = result.message || 'Failed to send verification codes. Please try again.';
        }

      } catch (error) {
        console.error('Failed to send verification codes:', error);
        const errorData = clientAuthService.parseError(error);
        this.errorMessage = errorData.message || 'Failed to send verification codes. Please try again.';
      } finally {
        this.loading = false;
      }
    }
  }
};