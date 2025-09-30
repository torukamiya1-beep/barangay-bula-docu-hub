/**
 * UI State Composable
 * Manages global UI state like sidebar, dropdowns, modals
 * Implements reactive state management with proper cleanup
 */

import { reactive, computed, onMounted, onUnmounted } from 'vue'

export function useUIState() {
  // Reactive state
  const uiState = reactive({
    sidebarCollapsed: false,
    showUserDropdown: false,
    showNotifications: false,
    showMobileMenu: false,
    activeModal: null,
    isLoading: false,
    isMobile: false,
    screenWidth: 0,
    screenHeight: 0
  })

  // Computed properties
  const isMobileDevice = computed(() => {
    return uiState.screenWidth <= 768
  })

  const isTabletDevice = computed(() => {
    return uiState.screenWidth > 768 && uiState.screenWidth <= 1024
  })

  const isDesktopDevice = computed(() => {
    return uiState.screenWidth > 1024
  })

  const deviceType = computed(() => {
    if (isMobileDevice.value) return 'mobile'
    if (isTabletDevice.value) return 'tablet'
    return 'desktop'
  })

  const hasAnyDropdownOpen = computed(() => {
    return uiState.showUserDropdown || uiState.showNotifications || uiState.showMobileMenu
  })

  // Methods
  const toggleSidebar = () => {
    uiState.sidebarCollapsed = !uiState.sidebarCollapsed
    
    // Store preference in localStorage
    try {
      localStorage.setItem('sidebar-collapsed', uiState.sidebarCollapsed.toString())
    } catch (error) {
      console.warn('Could not save sidebar state to localStorage:', error)
    }
  }

  const collapseSidebar = () => {
    uiState.sidebarCollapsed = true
    try {
      localStorage.setItem('sidebar-collapsed', 'true')
    } catch (error) {
      console.warn('Could not save sidebar state to localStorage:', error)
    }
  }

  const expandSidebar = () => {
    uiState.sidebarCollapsed = false
    try {
      localStorage.setItem('sidebar-collapsed', 'false')
    } catch (error) {
      console.warn('Could not save sidebar state to localStorage:', error)
    }
  }

  const toggleUserDropdown = () => {
    // Close other dropdowns first
    if (uiState.showNotifications) uiState.showNotifications = false
    if (uiState.showMobileMenu) uiState.showMobileMenu = false
    
    uiState.showUserDropdown = !uiState.showUserDropdown
  }

  const toggleNotifications = () => {
    // Close other dropdowns first
    if (uiState.showUserDropdown) uiState.showUserDropdown = false
    if (uiState.showMobileMenu) uiState.showMobileMenu = false
    
    uiState.showNotifications = !uiState.showNotifications
  }

  const toggleMobileMenu = () => {
    // Close other dropdowns first
    if (uiState.showUserDropdown) uiState.showUserDropdown = false
    if (uiState.showNotifications) uiState.showNotifications = false
    
    uiState.showMobileMenu = !uiState.showMobileMenu
  }

  const closeAllDropdowns = () => {
    uiState.showUserDropdown = false
    uiState.showNotifications = false
    uiState.showMobileMenu = false
  }

  const openModal = (modalName) => {
    uiState.activeModal = modalName
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden'
  }

  const closeModal = () => {
    uiState.activeModal = null
    // Restore body scroll
    document.body.style.overflow = ''
  }

  const setLoading = (loading) => {
    uiState.isLoading = loading
  }

  // Screen size handling
  const updateScreenSize = () => {
    uiState.screenWidth = window.innerWidth
    uiState.screenHeight = window.innerHeight
    uiState.isMobile = window.innerWidth <= 768
    
    // Auto-collapse sidebar on mobile
    if (uiState.isMobile && !uiState.sidebarCollapsed) {
      uiState.sidebarCollapsed = true
    }
  }

  const handleResize = () => {
    updateScreenSize()
    
    // Close dropdowns on resize to prevent positioning issues
    if (hasAnyDropdownOpen.value) {
      closeAllDropdowns()
    }
  }

  const handleClickOutside = (event) => {
    // Close dropdowns when clicking outside
    if (hasAnyDropdownOpen.value) {
      const isClickInsideDropdown = event.target.closest('.dropdown-container, .user-profile, .notifications-container, .mobile-menu')
      
      if (!isClickInsideDropdown) {
        closeAllDropdowns()
      }
    }
  }

  const handleEscapeKey = (event) => {
    if (event.key === 'Escape') {
      if (uiState.activeModal) {
        closeModal()
      } else if (hasAnyDropdownOpen.value) {
        closeAllDropdowns()
      }
    }
  }

  // Initialize UI state
  const initializeUIState = () => {
    // Restore sidebar state from localStorage
    try {
      const savedSidebarState = localStorage.getItem('sidebar-collapsed')
      if (savedSidebarState !== null) {
        uiState.sidebarCollapsed = savedSidebarState === 'true'
      }
    } catch (error) {
      console.warn('Could not restore sidebar state from localStorage:', error)
    }

    // Set initial screen size
    updateScreenSize()

    // Add event listeners
    window.addEventListener('resize', handleResize)
    document.addEventListener('click', handleClickOutside)
    document.addEventListener('keydown', handleEscapeKey)
  }

  const cleanupUIState = () => {
    // Remove event listeners
    window.removeEventListener('resize', handleResize)
    document.removeEventListener('click', handleClickOutside)
    document.removeEventListener('keydown', handleEscapeKey)
    
    // Restore body scroll if modal was open
    document.body.style.overflow = ''
  }

  // Auto-initialize when composable is used
  onMounted(() => {
    initializeUIState()
  })

  onUnmounted(() => {
    cleanupUIState()
  })

  // Return public API
  return {
    // State
    uiState,
    
    // Computed
    isMobileDevice,
    isTabletDevice,
    isDesktopDevice,
    deviceType,
    hasAnyDropdownOpen,
    
    // Methods
    toggleSidebar,
    collapseSidebar,
    expandSidebar,
    toggleUserDropdown,
    toggleNotifications,
    toggleMobileMenu,
    closeAllDropdowns,
    openModal,
    closeModal,
    setLoading,
    updateScreenSize,
    
    // Cleanup
    cleanupUIState
  }
}
