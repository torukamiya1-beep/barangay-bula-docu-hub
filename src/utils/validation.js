// Form validation utilities
export const validators = {
  // Required field validator
  required: (value, fieldName = 'Field') => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return `${fieldName} is required`;
    }
    return null;
  },

  // Email validator
  email: (value) => {
    if (!value) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Please enter a valid email address';
    }
    return null;
  },

  // Username validator
  username: (value) => {
    if (!value) return null;
    if (value.length < 3 || value.length > 50) {
      return 'Username must be between 3 and 50 characters';
    }
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      return 'Username can only contain letters, numbers, and underscores';
    }
    return null;
  },

  // Password validator
  password: (value) => {
    if (!value) return null;
    if (value.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
      return 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }
    return null;
  },

  // Confirm password validator
  confirmPassword: (value, originalPassword) => {
    if (!value) return null;
    if (value !== originalPassword) {
      return 'Passwords do not match';
    }
    return null;
  },

  // Phone number validator (Philippine format)
  phoneNumber: (value) => {
    if (!value) return null;
    // Remove any spaces or special characters except digits
    const cleanValue = value.replace(/\s/g, '');
    const phoneRegex = /^09\d{9}$/;
    if (!phoneRegex.test(cleanValue)) {
      return 'Please enter a valid Philippine phone number (09XXXXXXXXX - 11 digits starting with 09)';
    }
    return null;
  },

  // Name validator
  name: (value, fieldName = 'Name') => {
    if (!value) return null;
    if (value.length < 1 || value.length > 100) {
      return `${fieldName} must be between 1 and 100 characters`;
    }
    if (!/^[a-zA-Z\s\-.]+$/.test(value)) {
      return `${fieldName} can only contain letters, spaces, hyphens, and periods`;
    }
    return null;
  },

  // Date validator
  date: (value, fieldName = 'Date') => {
    if (!value) return null;
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return `Please enter a valid ${fieldName.toLowerCase()}`;
    }
    return null;
  },

  // Birth date validator (must be in the past and reasonable age)
  birthDate: (value) => {
    if (!value) return null;
    const date = new Date(value);
    const today = new Date();
    
    if (isNaN(date.getTime())) {
      return 'Please enter a valid birth date';
    }
    
    if (date >= today) {
      return 'Birth date must be in the past';
    }
    
    const age = today.getFullYear() - date.getFullYear();
    if (age > 150) {
      return 'Please enter a valid birth date';
    }
    
    if (age < 13) {
      return 'You must be at least 13 years old to register';
    }
    
    return null;
  },

  // OTP validator
  otp: (value) => {
    if (!value) return null;
    if (!/^\d{4,10}$/.test(value)) {
      return 'OTP must be a 4-10 digit number';
    }
    return null;
  },

  // Address field validator
  address: (value, fieldName = 'Address') => {
    if (!value) return null;
    if (value.length < 1 || value.length > 100) {
      return `${fieldName} must be between 1 and 100 characters`;
    }
    return null;
  },

  // Postal code validator
  postalCode: (value) => {
    if (!value) return null;
    if (!/^\d{4}$/.test(value)) {
      return 'Postal code must be 4 digits';
    }
    return null;
  },

  // Min length validator
  minLength: (value, min, fieldName = 'Field') => {
    if (!value) return null;
    if (value.length < min) {
      return `${fieldName} must be at least ${min} characters`;
    }
    return null;
  },

  // Max length validator
  maxLength: (value, max, fieldName = 'Field') => {
    if (!value) return null;
    if (value.length > max) {
      return `${fieldName} must be less than ${max} characters`;
    }
    return null;
  },

  // Exact length validator
  exactLength: (value, length, fieldName = 'Field') => {
    if (!value) return null;
    if (value.length !== length) {
      return `${fieldName} must be exactly ${length} characters`;
    }
    return null;
  },

  // Password match validator
  passwordMatch: (value, password) => {
    if (!value) return null;
    if (value !== password) {
      return 'Passwords do not match';
    }
    return null;
  },

  // Phone validator (alias for phoneNumber)
  phone: (value) => validators.phoneNumber(value)
};

// Validate multiple fields
export const validateForm = (formData, validationRules) => {
  const errors = {};
  let isValid = true;

  for (const [fieldName, rules] of Object.entries(validationRules)) {
    const value = formData[fieldName];
    
    for (const rule of rules) {
      let error = null;
      
      if (typeof rule === 'function') {
        error = rule(value);
      } else if (typeof rule === 'object' && rule.validator) {
        error = rule.validator(value, ...(rule.params || []));
      }
      
      if (error) {
        errors[fieldName] = error;
        isValid = false;
        break; // Stop at first error for this field
      }
    }
  }

  return { isValid, errors };
};

// Format error messages from API
export const formatApiErrors = (apiErrors) => {
  if (!Array.isArray(apiErrors)) return {};
  
  const formattedErrors = {};
  apiErrors.forEach(error => {
    if (error.path) {
      formattedErrors[error.path] = error.msg || error.message;
    }
  });
  
  return formattedErrors;
};

// Clear specific field errors
export const clearFieldError = (errors, fieldName) => {
  const newErrors = { ...errors };
  delete newErrors[fieldName];
  return newErrors;
};

// Check if form has any errors
export const hasErrors = (errors) => {
  return Object.keys(errors).length > 0;
};