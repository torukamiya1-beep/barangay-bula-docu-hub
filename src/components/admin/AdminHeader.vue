<template>
  <header class="dashboard-header" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
    <div class="header-content">
      <!-- Left Section -->
      <div class="header-left">
        <button class="sidebar-toggle" @click="handleSidebarToggle">
          <i class="fas fa-bars"></i>
        </button>
        <div class="page-title">
          <h1>{{ getPageTitle() }}</h1>
        </div>
      </div>

      <!-- Header Actions -->
      <div class="header-actions">
        <!-- Notifications -->
        <AdminNotifications
          @new-notification="handleNewNotification"
          @notification-click="handleNotificationClick"
          @open-request-modal="handleOpenRequestModal"
          @open-user-modal="handleOpenUserModal"
          @error="handleNotificationError"
        />

        <!-- User Profile -->
        <div class="user-dropdown" :class="{ active: showUserDropdown }">
          <button class="user-btn" @click="handleUserDropdownToggle">
            <div class="user-avatar">
              <i class="fas fa-user-circle"></i>
            </div>
            <div class="user-info">
              <span class="user-name">{{ displayUserName }}</span>
              <span class="user-role">{{ displayUserRole }}</span>
            </div>
            <!-- <i class="fas fa-chevron-down dropdown-arrow"></i> -->
          </button>

          <div v-if="showUserDropdown" class="dropdown-menu">
            <a href="#" class="dropdown-item" @click="handleMenuAction('profile', $event)">
              <i class="fas fa-user me-2"></i>
              My Profile
            </a>
            <a href="#" class="dropdown-item" @click="handleMenuAction('settings', $event)">
              <i class="fas fa-cog me-2"></i>
              Settings
            </a>
            <a href="#" class="dropdown-item" @click="handleMenuAction('account', $event)">
              <i class="fas fa-id-card me-2"></i>
              Account Info
            </a>
            <div class="dropdown-divider"></div>
            <a href="#" class="dropdown-item" @click="handleLogout($event)">
              <i class="fas fa-sign-out-alt me-2"></i>
              Logout
            </a>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import AdminNotifications from './AdminNotifications.vue';

export default {
  name: 'AdminHeader',
  components: {
    AdminNotifications
  },
  props: {
    userName: {
      type: String,
      default: 'Admin'
    },
    showUserDropdown: {
      type: Boolean,
      default: false
    },
    sidebarCollapsed: {
      type: Boolean,
      default: false
    },
    activeMenu: {
      type: String,
      default: 'dashboard'
    }
  },

  emits: [
    'sidebar-toggle',
    'user-dropdown-toggle',
    'menu-action',
    'logout',
    'error',
    'new-notification'
  ],

  computed: {
    // Get display name from admin data or fallback to prop
    displayUserName() {
      const adminData = this.$adminAuth?.getAdminData();
      if (adminData) {
        // Check if user has profile data
        if (adminData.profile && adminData.profile.first_name) {
          return adminData.profile.last_name
            ? `${adminData.profile.first_name} ${adminData.profile.last_name}`
            : adminData.profile.first_name;
        }
        // Fallback to username
        return adminData.username || this.userName;
      }
      return this.userName || 'Admin';
    },

    // Get display role from admin data
    displayUserRole() {
      const adminData = this.$adminAuth?.getAdminData();
      if (adminData && adminData.role) {
        return adminData.role.charAt(0).toUpperCase() + adminData.role.slice(1);
      }
      return 'Admin';
    }
  },



  mounted() {
    // Setup event listeners for outside clicks
    document.addEventListener('click', this.handleOutsideClick);
  },

  beforeUnmount() {
    // Clean up event listeners
    document.removeEventListener('click', this.handleOutsideClick);
  },

  methods: {
    // Get page title based on current route
    getPageTitle() {
      const path = this.$route.path;
      const routeTitles = {
        '/admin/dashboard': 'Admin Dashboard',
        '/admin/users': 'User Management',
        '/admin/requests': 'Document Requests',
        '/admin/reports': 'Reports & Analytics',
        '/admin/settings': 'System Settings',
        '/admin/activity-logs': 'Activity Logs',
        '/admin/audit-logs': 'Audit Logs',
        '/admin/profile': 'Admin Profile'
      };

      // Use route-based title first, then fall back to activeMenu prop, then default
      return routeTitles[path] || this.$route.meta?.title || 'Admin Dashboard';
    },

    // Handle sidebar toggle
    handleSidebarToggle() {
      this.$emit('sidebar-toggle');
    },



    // Handle user dropdown toggle
    handleUserDropdownToggle() {
      this.$emit('user-dropdown-toggle');
    },

    // Handle menu actions (profile, settings, etc.)
    handleMenuAction(action, event) {
      // Prevent default link behavior
      if (event) {
        event.preventDefault();
      }

      // Navigate to the appropriate route
      const routes = {
        'profile': '/admin/profile',
        'settings': '/admin/settings',
        'account': '/admin/profile' // Account info redirects to profile
      };

      const route = routes[action];
      if (route && this.$route.path !== route) {
        this.$router.push(route).catch(err => {
          // Handle navigation errors gracefully
          if (err.name !== 'NavigationDuplicated') {
            console.error('Navigation error:', err);
          }
        });
      }

      // Close dropdown after navigation
      if (this.showUserDropdown) {
        this.$emit('user-dropdown-toggle');
      }

      // Still emit for parent components that need to track actions
      this.$emit('menu-action', action);
    },

    // Handle logout
    handleLogout(event) {
      // Prevent default link behavior
      if (event) {
        event.preventDefault();
      }
      this.$emit('logout');
    },



    // Handle outside clicks to close dropdowns
    handleOutsideClick(event) {
      // Check if click is outside user dropdown
      if (!event.target.closest('.user-dropdown')) {
        if (this.showUserDropdown) {
          this.$emit('user-dropdown-toggle');
        }
      }
    },

    // Notification handlers
    handleNewNotification(notification) {
      console.log('New notification received:', notification);
      // Emit to parent component if needed
      this.$emit('new-notification', notification);
    },

    async handleNotificationClick(notification) {
      console.log('🔔 AdminHeader: Notification clicked:', notification);

      try {
        // The AdminNotifications component now handles navigation internally,
        // but we can add additional logic here if needed

        // Parse notification data
        const notificationData = typeof notification.data === 'string'
          ? JSON.parse(notification.data)
          : notification.data || {};

        // Log navigation for debugging
        console.log('📊 AdminHeader: Notification data:', notificationData);

        // Additional header-specific logic can go here
        // For example, updating header state, showing badges, etc.

        // The navigation is now handled by the AdminNotifications component
        // This handler can focus on header-specific updates

      } catch (error) {
        console.error('❌ AdminHeader: Error handling notification click:', error);
      }

      // Always emit the event for other components that might need it
      this.$emit('notification-click', notification);
    },

    handleOpenRequestModal(modalData) {
      console.log('🔔 AdminHeader: Request to open modal:', modalData);

      // Emit event to parent component (likely AdminRequests or main layout)
      // to handle opening the request details modal
      this.$emit('open-request-modal', modalData);
    },

    handleOpenUserModal(modalData) {
      console.log('🔔 AdminHeader: Request to open user modal:', modalData);

      // Emit event to parent component (likely AdminUsers or main layout)
      // to handle opening the user details modal
      this.$emit('open-user-modal', modalData);
    },

    handleNotificationError(error) {
      console.error('Notification error:', error);
      this.$emit('error', error);
    }
  }
};
</script>

<style scoped src="./css/adminHeader.css"></style>
