<template>
  <header class="client-header" role="banner">
    
    <!-- Government Banner -->
    <!-- ill comment this for now and uncomment this soon -->
    <!-- <GovernmentBanner /> -->

    <!-- Main Header -->
    <div class="main-header">
      <div class="header-container">
        <!-- Left Section: Logo and Navigation -->
        <div class="header-left">
          <SiteLogo
            @navigate="handleMenuAction('dashboard')"
          />
        </div>

        <!-- Center Section: Navigation (Desktop) -->
        <MainNavigation
          :active-menu="uiState.activeMenu"
          @menu-action="handleMenuAction"
        />

        <!-- Right Section: User Actions -->
        <div class="header-actions">
          <!-- Search -->
          <!-- <HeaderSearch
            :is-active="searchState.isActive"
            :query="searchState.query"
            @toggle="toggleSearch"
            @search="performSearch"
            @input="updateSearchQuery"
          /> -->

          <!-- Notifications -->
          <ClientNotifications
            @new-notification="handleNewNotification"
            @notification-click="handleNotificationClick"
            @error="handleNotificationError"
          />

          <!-- User Profile -->
          <UserProfileDropdown
            :user-data="userData"
            :is-open="uiState.showUserDropdown"
            :can-request-documents="canRequestDocuments"
            @toggle="handleUserDropdownToggle"
            @menu-action="handleMenuAction"
            @logout="handleLogout"
          />
        </div>
      </div>
    </div>


  </header>
</template>

<script>
import { reactive, onMounted, onUnmounted } from 'vue'
import ClientNotifications from './ClientNotifications.vue'
// import GovernmentBanner from './components/GovernmentBanner.vue'
import SiteLogo from './components/SiteLogo.vue'
// import MobileMenuToggle from './components/MobileMenuToggle.vue'
import MainNavigation from './components/MainNavigation.vue'
// import HeaderSearch from './components/HeaderSearch.vue'
import UserProfileDropdown from './components/UserProfileDropdown.vue'
import { useErrorHandler } from '@/composables/useErrorHandler'

export default {
  name: 'ClientHeader',
  components: {
    ClientNotifications,
    // GovernmentBanner,
    SiteLogo,
    // MobileMenuToggle,
    MainNavigation,
    // HeaderSearch,
    UserProfileDropdown
  },
  props: {
    userData: {
      type: Object,
      default: () => ({
        userName: 'User',
        userEmail: 'user@example.com',
        userAvatar: null,
        firstName: 'User'
      })
    },
    uiState: {
      type: Object,
      default: () => ({
        showUserDropdown: false,
        sidebarCollapsed: false,
        activeMenu: 'dashboard'
      })
    },
    showBreadcrumbs: {
      type: Boolean,
      default: true
    },
    canRequestDocuments: {
      type: Boolean,
      default: true
    }
  },

  emits: [
    'sidebar-toggle',
    'user-dropdown-toggle',
    'menu-action',
    'logout',
    'error',
    'search',
    'notification-click'
  ],

  setup(props, { emit }) {
    const { handleError } = useErrorHandler()

    // Local reactive state
    const searchState = reactive({
      isActive: false,
      query: ''
    })

    // Methods
    const toggleSearch = () => {
      searchState.isActive = !searchState.isActive

      if (searchState.isActive) {
        // Focus search input on next tick
        setTimeout(() => {
          const searchInput = document.querySelector('.search-input')
          if (searchInput) {
            searchInput.focus()
          }
        }, 100)
      }
    }

    const updateSearchQuery = (query) => {
      searchState.query = query
    }

    const performSearch = () => {
      if (searchState.query.trim()) {
        emit('search', searchState.query.trim())

        // Close search on mobile after search
        if (window.innerWidth <= 768) {
          searchState.isActive = false
        }
      }
    }

    const handleSidebarToggle = () => {
      emit('sidebar-toggle')
    }

    const handleUserDropdownToggle = () => {
      emit('user-dropdown-toggle')
    }

    const handleMenuAction = (action) => {
      emit('menu-action', action)
    }

    const handleLogout = async () => {
      try {
        emit('logout')
      } catch (error) {
        handleError(error, 'Logout failed')
      }
    }

    // Notification event handlers
    const handleNewNotification = (notification) => {
      console.log('New notification received:', notification)
      // Handle new notification - could show toast, update UI, etc.
    }

    const handleNotificationClick = async (notification) => {
      console.log('🔔 ClientHeader: Notification clicked:', notification)

      // Ensure we have a valid notification object
      if (!notification || typeof notification !== 'object') {
        console.error('Invalid notification object received:', notification)
        return
      }

      try {
        // Parse notification data
        const notificationData = typeof notification.data === 'string'
          ? JSON.parse(notification.data)
          : notification.data || {}

        // Log navigation for debugging
        console.log('📊 ClientHeader: Notification data:', notificationData)

        // Additional header-specific logic can go here
        // For example, updating header state, showing badges, etc.

      } catch (error) {
        console.error('❌ ClientHeader: Error handling notification click:', error)
        handleError(error, 'Notification click handling failed')
      }

      // Always emit the event for other components that might need it
      emit('notification-click', notification)
    }

    const handleNotificationError = (error) => {
      console.error('Notification error:', error)
      emit('error', error)
    }

    // Outside click handling
    const handleOutsideClick = (event) => {
      // Check if click is outside user dropdown
      if (!event.target.closest('.user-profile')) {
        if (props.uiState.showUserDropdown) {
          emit('user-dropdown-toggle')
        }
      }

      // Check if click is outside search
      if (!event.target.closest('.search-container')) {
        searchState.isActive = false
      }
    }

    // Lifecycle hooks
    onMounted(() => {
      document.addEventListener('click', handleOutsideClick)
    })

    onUnmounted(() => {
      document.removeEventListener('click', handleOutsideClick)
    })

    return {
      // State
      searchState,

      // Methods
      toggleSearch,
      updateSearchQuery,
      performSearch,
      handleSidebarToggle,
      handleUserDropdownToggle,
      handleMenuAction,
      handleLogout,
      handleNewNotification,
      handleNotificationClick,
      handleNotificationError
    }
  }
}
</script>

<style scoped>
/* Modern Client Header Styles */
.client-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: var(--bg-white, #ffffff);
  box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.1);
  font-family: var(--font-family-sans, 'Source Sans Pro', system-ui, sans-serif);
  border-bottom: 1px solid var(--border-light, #dfe1e2);
}

.main-header {
  background: var(--bg-white, #ffffff);
  border-bottom: 1px solid var(--border-light, #dfe1e2);
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .header-container {
    padding: 0 0.75rem;
    height: 56px;
  }

  .header-actions {
    gap: 0.5rem;
  }
}

@media (max-width: 480px) {
  .header-container {
    padding: 0 0.5rem;
    height: 52px;
  }

  .header-left {
    flex: 1;
    min-width: 0;
  }

  .header-actions {
    gap: 0.25rem;
    flex-shrink: 0;
  }
}

/* Focus styles for accessibility */
:focus-visible {
  outline: 3px solid var(--gov-yellow, #ffbe2e);
  outline-offset: 2px;
}

/* Screen reader only content */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
