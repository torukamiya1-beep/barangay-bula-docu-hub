/**
 * User Data Composable
 * Manages user data state and operations following Vue 3 Composition API best practices
 * Implements Google's software engineering principles: single responsibility, error handling
 */

import { reactive, computed } from 'vue'
import unifiedAuthService from '@/services/unifiedAuthService'

export function useUserData() {
  // Reactive state
  const userData = reactive({
    userName: 'User',
    userEmail: 'user@example.com',
    userAvatar: null,
    firstName: 'User',
    lastName: '',
    middleName: '',
    suffix: '',
    profile: null,
    isLoading: false,
    error: null
  })

  // Computed properties
  const fullName = computed(() => {
    return userData.firstName && userData.lastName 
      ? `${userData.firstName} ${userData.lastName}`.trim()
      : userData.firstName || userData.userName
  })

  const initials = computed(() => {
    if (userData.firstName && userData.lastName) {
      return `${userData.firstName[0]}${userData.lastName[0]}`.toUpperCase()
    }
    return userData.userName ? userData.userName.substring(0, 2).toUpperCase() : 'U'
  })

  const isAuthenticated = computed(() => {
    return userData.userName !== 'User' && userData.userEmail !== 'user@example.com'
  })

  // Methods
  const loadUserData = async () => {
    try {
      userData.isLoading = true
      userData.error = null

      const currentUser = unifiedAuthService.getCurrentUser()

      // Debug: Log current user data structure
      console.log('useUserData - currentUser:', currentUser)

      if (currentUser) {
        console.log('useUserData - processing currentUser:', currentUser)

        // Update basic user data
        userData.userName = currentUser.username || 'User'
        userData.userEmail = currentUser.email || 'user@example.com'
        userData.userAvatar = currentUser.avatar || null

        // Handle profile data - the correct structure has a profile object
        if (currentUser.profile) {
          console.log('useUserData - found profile object:', currentUser.profile)
          userData.firstName = currentUser.profile.first_name || ''
          userData.lastName = currentUser.profile.last_name || ''
          userData.middleName = currentUser.profile.middle_name || ''
          userData.suffix = currentUser.profile.suffix || ''
          userData.profile = currentUser.profile
        } else {
          // Fallback if no profile object (shouldn't happen with current backend)
          userData.firstName = currentUser.username || 'User'
          userData.lastName = ''
          userData.middleName = ''
          userData.suffix = ''
          userData.profile = null
        }

        console.log('useUserData - final userData:', {
          firstName: userData.firstName,
          lastName: userData.lastName,
          middleName: userData.middleName,
          suffix: userData.suffix,
          profile: userData.profile
        })
      } else {
        // Handle case where no user is found
        console.warn('No current user found')
        resetUserData()
      }
    } catch (error) {
      console.error('Error loading user data:', error)
      userData.error = 'Failed to load user information'
      resetUserData()
    } finally {
      userData.isLoading = false
    }
  }

  const resetUserData = () => {
    userData.userName = 'User'
    userData.userEmail = 'user@example.com'
    userData.userAvatar = null
    userData.firstName = 'User'
    userData.lastName = ''
    userData.middleName = ''
    userData.suffix = ''
    userData.profile = null
    userData.error = null
  }

  const updateUserData = (newData) => {
    try {
      Object.assign(userData, {
        ...userData,
        ...newData,
        error: null
      })
    } catch (error) {
      console.error('Error updating user data:', error)
      userData.error = 'Failed to update user information'
    }
  }

  // Validation helpers
  const validateUserData = () => {
    const errors = []
    
    if (!userData.userName || userData.userName.trim().length < 2) {
      errors.push('Username must be at least 2 characters long')
    }
    
    if (!userData.userEmail || !isValidEmail(userData.userEmail)) {
      errors.push('Valid email address is required')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Return public API
  return {
    // State
    userData,
    
    // Computed
    fullName,
    initials,
    isAuthenticated,
    
    // Methods
    loadUserData,
    resetUserData,
    updateUserData,
    validateUserData
  }
}
