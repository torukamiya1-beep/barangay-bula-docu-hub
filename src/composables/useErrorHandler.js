/**
 * Error Handler Composable
 * Centralized error handling with logging, user notifications, and recovery
 * Implements Google's error handling best practices
 */

import { ref } from 'vue'

export function useErrorHandler() {
  // Error state
  const errors = ref([])
  const globalError = ref(null)
  const isErrorModalOpen = ref(false)

  // Error types
  const ERROR_TYPES = {
    NETWORK: 'network',
    VALIDATION: 'validation',
    AUTHENTICATION: 'authentication',
    AUTHORIZATION: 'authorization',
    SERVER: 'server',
    CLIENT: 'client',
    UNKNOWN: 'unknown'
  }

  // Error severity levels
  const SEVERITY_LEVELS = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical'
  }

  // Methods
  const handleError = (error, context = '', options = {}) => {
    const errorInfo = processError(error, context, options)
    
    // Log error
    logError(errorInfo)
    
    // Store error
    addError(errorInfo)
    
    // Show user notification if needed
    if (options.showToUser !== false) {
      showErrorToUser(errorInfo)
    }
    
    // Report to monitoring service if critical
    if (errorInfo.severity === SEVERITY_LEVELS.CRITICAL) {
      reportCriticalError(errorInfo)
    }
    
    return errorInfo
  }

  const processError = (error, context, options) => {
    const timestamp = new Date().toISOString()
    const errorId = generateErrorId()
    
    let errorInfo = {
      id: errorId,
      timestamp,
      context,
      severity: options.severity || SEVERITY_LEVELS.MEDIUM,
      type: ERROR_TYPES.UNKNOWN,
      message: 'An unexpected error occurred',
      originalError: error,
      stack: null,
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: getCurrentUserId(),
      sessionId: getSessionId()
    }

    // Process different error types
    if (error instanceof Error) {
      errorInfo.message = error.message
      errorInfo.stack = error.stack
      errorInfo.type = classifyError(error)
    } else if (typeof error === 'string') {
      errorInfo.message = error
      errorInfo.type = ERROR_TYPES.CLIENT
    } else if (error?.response) {
      // Axios error
      errorInfo = processAxiosError(error, errorInfo)
    } else if (error?.code) {
      // Custom error with code
      errorInfo.type = error.code
      errorInfo.message = error.message || errorInfo.message
    }

    return errorInfo
  }

  const processAxiosError = (axiosError, errorInfo) => {
    const response = axiosError.response
    const request = axiosError.request
    
    if (response) {
      // Server responded with error status
      errorInfo.type = response.status >= 500 ? ERROR_TYPES.SERVER : ERROR_TYPES.CLIENT
      errorInfo.message = response.data?.message || `HTTP ${response.status}: ${response.statusText}`
      errorInfo.statusCode = response.status
      errorInfo.responseData = response.data
      
      // Set severity based on status code
      if (response.status >= 500) {
        errorInfo.severity = SEVERITY_LEVELS.HIGH
      } else if (response.status === 401) {
        errorInfo.type = ERROR_TYPES.AUTHENTICATION
        errorInfo.severity = SEVERITY_LEVELS.MEDIUM
      } else if (response.status === 403) {
        errorInfo.type = ERROR_TYPES.AUTHORIZATION
        errorInfo.severity = SEVERITY_LEVELS.MEDIUM
      }
    } else if (request) {
      // Network error
      errorInfo.type = ERROR_TYPES.NETWORK
      errorInfo.message = 'Network error - please check your connection'
      errorInfo.severity = SEVERITY_LEVELS.HIGH
    }
    
    return errorInfo
  }

  const classifyError = (error) => {
    const message = error.message.toLowerCase()
    
    if (message.includes('network') || message.includes('fetch')) {
      return ERROR_TYPES.NETWORK
    } else if (message.includes('validation') || message.includes('invalid')) {
      return ERROR_TYPES.VALIDATION
    } else if (message.includes('unauthorized') || message.includes('authentication')) {
      return ERROR_TYPES.AUTHENTICATION
    } else if (message.includes('forbidden') || message.includes('permission')) {
      return ERROR_TYPES.AUTHORIZATION
    }
    
    return ERROR_TYPES.CLIENT
  }

  const logError = (errorInfo) => {
    // Console logging with appropriate level
    const logLevel = getLogLevel(errorInfo.severity)
    const logMessage = `[${errorInfo.type.toUpperCase()}] ${errorInfo.context}: ${errorInfo.message}`
    
    console[logLevel](logMessage, {
      errorId: errorInfo.id,
      timestamp: errorInfo.timestamp,
      originalError: errorInfo.originalError,
      stack: errorInfo.stack
    })
  }

  const getLogLevel = (severity) => {
    switch (severity) {
      case SEVERITY_LEVELS.LOW:
        return 'info'
      case SEVERITY_LEVELS.MEDIUM:
        return 'warn'
      case SEVERITY_LEVELS.HIGH:
      case SEVERITY_LEVELS.CRITICAL:
        return 'error'
      default:
        return 'warn'
    }
  }

  const addError = (errorInfo) => {
    errors.value.unshift(errorInfo)
    
    // Keep only last 50 errors to prevent memory issues
    if (errors.value.length > 50) {
      errors.value = errors.value.slice(0, 50)
    }
    
    // Set global error for critical issues
    if (errorInfo.severity === SEVERITY_LEVELS.CRITICAL) {
      globalError.value = errorInfo
    }
  }

  const showErrorToUser = (errorInfo) => {
    const userMessage = getUserFriendlyMessage(errorInfo)
    
    // You can integrate with your notification system here
    // For now, we'll use a simple approach
    if (errorInfo.severity === SEVERITY_LEVELS.CRITICAL) {
      // Show modal for critical errors
      globalError.value = errorInfo
      isErrorModalOpen.value = true
    } else {
      // Show toast notification for other errors
      showToastNotification(userMessage, errorInfo.severity)
    }
  }

  const getUserFriendlyMessage = (errorInfo) => {
    switch (errorInfo.type) {
      case ERROR_TYPES.NETWORK:
        return 'Please check your internet connection and try again.'
      case ERROR_TYPES.AUTHENTICATION:
        return 'Please log in again to continue.'
      case ERROR_TYPES.AUTHORIZATION:
        return 'You do not have permission to perform this action.'
      case ERROR_TYPES.VALIDATION:
        return errorInfo.message // Validation messages are usually user-friendly
      case ERROR_TYPES.SERVER:
        return 'Server error. Please try again later.'
      default:
        return 'Something went wrong. Please try again.'
    }
  }

  const showToastNotification = (message, severity) => {
    // Placeholder for toast notification
    // You would integrate with your actual notification system
    console.log(`Toast [${severity}]: ${message}`)
  }

  const reportCriticalError = (errorInfo) => {
    // Report to external monitoring service (e.g., Sentry, LogRocket)
    // This is a placeholder implementation
    console.error('CRITICAL ERROR REPORTED:', errorInfo)
  }

  // Utility functions
  const generateErrorId = () => {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  const getCurrentUserId = () => {
    // Get current user ID from auth service
    try {
      const user = JSON.parse(localStorage.getItem('auth_user') || '{}')
      return user.id || 'anonymous'
    } catch {
      return 'anonymous'
    }
  }

  const getSessionId = () => {
    // Get or generate session ID
    let sessionId = sessionStorage.getItem('session_id')
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem('session_id', sessionId)
    }
    return sessionId
  }

  // Error management
  const clearErrors = () => {
    errors.value = []
    globalError.value = null
  }

  const clearError = (errorId) => {
    errors.value = errors.value.filter(error => error.id !== errorId)
    
    if (globalError.value?.id === errorId) {
      globalError.value = null
    }
  }

  const closeErrorModal = () => {
    isErrorModalOpen.value = false
    globalError.value = null
  }

  const retryLastAction = () => {
    // Placeholder for retry functionality
    console.log('Retrying last action...')
  }

  // Return public API
  return {
    // State
    errors,
    globalError,
    isErrorModalOpen,
    
    // Constants
    ERROR_TYPES,
    SEVERITY_LEVELS,
    
    // Methods
    handleError,
    clearErrors,
    clearError,
    closeErrorModal,
    retryLastAction,
    
    // Utilities
    getUserFriendlyMessage
  }
}
