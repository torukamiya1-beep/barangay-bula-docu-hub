<template>
  <aside class="dashboard-sidebar" :class="{ collapsed: collapsed }">
    <!-- Logo Section -->
    <div class="sidebar-logo">
      <div class="logo-content">
        <div class="logo-image-container">
          <img
            src="@/assets/icon-of-bula.jpg"
            alt="Barangay Bula Logo"
            class="logo-image"
            @error="handleImageError"
          >
        </div>
        <div class="logo-text" :class="{ 'mobile-show': isMobile, 'desktop-hide': collapsed && !isMobile }">
          <h3 class="logo-title">Admin Panel</h3>
          <p class="logo-subtitle">Bula Document Hub</p>
        </div>
      </div>
      <!-- Mobile Close Button -->
      <button
        class="mobile-close-btn"
        @click="handleMobileClose"
        aria-label="Close sidebar"
      >
        <i class="fas fa-times"></i>
      </button>
    </div>

    <!-- Navigation -->
    <nav class="sidebar-nav">
      <ul class="nav-list">
        <!-- Document Requests - Now First -->
        <li class="nav-item">
          <a href="#"
             class="nav-link"
             :class="{ active: currentActiveMenu === 'requests', 'has-urgent': urgentRequests > 0 }"
             @click="handleMenuClick('requests', $event)"
             :title="collapsed && !isMobile ? 'Document Requests' : ''">
            <div class="nav-icon-container">
              <i class="fas fa-file-alt nav-icon"></i>
              <span v-if="collapsed && !isMobile && pendingRequests > 0" class="collapsed-badge" :class="{ 'urgent': urgentRequests > 0 }">{{ pendingRequests > 99 ? '99+' : pendingRequests }}</span>
              <span v-if="collapsed && !isMobile && urgentRequests > 0" class="urgent-indicator" :title="`${urgentRequests} urgent request${urgentRequests > 1 ? 's' : ''}`">
                <i class="fas fa-exclamation"></i>
              </span>
            </div>
            <div v-if="!collapsed || isMobile" class="nav-content">
              <span class="nav-text">Requests</span>
              <div class="nav-badges">
                <span v-if="pendingRequests > 0" class="nav-badge" :class="{ 'urgent': urgentRequests > 0 }">{{ pendingRequests }}</span>
                <span v-if="urgentRequests > 0" class="nav-badge urgent-badge" :title="`${urgentRequests} urgent`">
                  <i class="fas fa-exclamation-triangle"></i>
                  {{ urgentRequests }}
                </span>
              </div>
            </div>
            <div v-if="collapsed && !isMobile && currentActiveMenu === 'requests'" class="active-indicator"></div>
          </a>
        </li>

        <!-- Dashboard -->
         <!-- i will comment this dashboard byutton because I dont use this anymore -->
        <!-- <li class="nav-item">
          <a href="#"
             class="nav-link"
             :class="{ active: currentActiveMenu === 'dashboard' }"
             @click="handleMenuClick('dashboard', $event)"
             :title="collapsed && !isMobile ? 'Dashboard' : ''">
            <div class="nav-icon-container">
              <i class="fas fa-chart-bar nav-icon"></i>
            </div>
            <span v-if="!collapsed || isMobile" class="nav-text">Dashboard</span>
            <div v-if="collapsed && !isMobile && currentActiveMenu === 'dashboard'" class="active-indicator"></div>
          </a>
        </li> -->

        <!-- User Management -->
        <li class="nav-item">
          <a href="#"
             class="nav-link"
             :class="{ active: currentActiveMenu === 'users' }"
             @click="handleMenuClick('users', $event)"
             :title="collapsed && !isMobile ? 'User Management' : ''">
            <div class="nav-icon-container">
              <i class="fas fa-users nav-icon"></i>
              <span v-if="collapsed && !isMobile && totalUsers > 0" class="collapsed-badge">{{ totalUsers > 99 ? '99+' : totalUsers }}</span>
            </div>
            <div v-if="!collapsed || isMobile" class="nav-content">
              <!-- i rename the user management in to users -->
              <span class="nav-text">Users</span>
              <span v-if="totalUsers > 0" class="nav-badge">{{ totalUsers }}</span>
            </div>
            <div v-if="collapsed && !isMobile && currentActiveMenu === 'users'" class="active-indicator"></div>
          </a>
        </li>

        <!-- Archive -->
        <li class="nav-item">
          <a href="#"
             class="nav-link"
             :class="{ active: currentActiveMenu === 'archive' }"
             @click="handleMenuClick('archive', $event)"
             :title="collapsed && !isMobile ? 'Archive' : ''">
            <div class="nav-icon-container">
              <i class="fas fa-archive nav-icon"></i>
            </div>
            <div v-if="!collapsed || isMobile" class="nav-content">
              <span class="nav-text">Archive</span>
            </div>
            <div v-if="collapsed && !isMobile && currentActiveMenu === 'archive'" class="active-indicator"></div>
          </a>
        </li>

        <!-- Request History -->
        <li class="nav-item">
          <a href="#"
             class="nav-link"
             :class="{ active: currentActiveMenu === 'history' }"
             @click="handleMenuClick('history', $event)"
             :title="collapsed && !isMobile ? 'Request History' : ''">
            <div class="nav-icon-container">
              <i class="fas fa-history nav-icon"></i>
            </div>
            <div v-if="!collapsed || isMobile" class="nav-content">
              <span class="nav-text">History</span>
            </div>
            <div v-if="collapsed && !isMobile && currentActiveMenu === 'history'" class="active-indicator"></div>
          </a>
        </li>

        <!-- I dont use this for now so I commentr it -->
        <!-- Residency Verification -->
        <!-- <li class="nav-item">
          <a href="#"
             class="nav-link"
             :class="{ active: currentActiveMenu === 'residency-review' }"
             @click="handleMenuClick('residency-review', $event)"
             :title="collapsed && !isMobile ? 'Residency Verification' : ''">
            <div class="nav-icon-container">
              <i class="fas fa-home nav-icon"></i>
              <span v-if="collapsed && !isMobile && pendingResidencyCount > 0" class="collapsed-badge">{{ pendingResidencyCount > 99 ? '99+' : pendingResidencyCount }}</span>
            </div>
            <div v-if="!collapsed || isMobile" class="nav-content">
              <span class="nav-text">Residency Review</span>
              <span v-if="pendingResidencyCount > 0" class="nav-badge">{{ pendingResidencyCount }}</span>
            </div>
            <div v-if="collapsed && !isMobile && currentActiveMenu === 'residency-review'" class="active-indicator"></div>
          </a>
        </li> -->

        <!-- Reports & Analytics -->
        <li class="nav-item">
          <a href="#"
             class="nav-link"
             :class="{ active: currentActiveMenu === 'reports' }"
             @click="handleMenuClick('reports', $event)"
             :title="collapsed && !isMobile ? 'Reports & Analytics' : ''">
            <div class="nav-icon-container">
              <i class="fas fa-chart-line nav-icon"></i>
              <span v-if="collapsed && !isMobile && totalReports > 0" class="collapsed-badge">{{ totalReports > 99 ? '99+' : totalReports }}</span>
            </div>
            <div v-if="!collapsed || isMobile" class="nav-content">
              <span class="nav-text">Reports</span>
              <span v-if="totalReports > 0" class="nav-badge">{{ totalReports }}</span>
            </div>
            <div v-if="collapsed && !isMobile && currentActiveMenu === 'reports'" class="active-indicator"></div>
          </a>
        </li>

        <!-- System Settings -->
        <li class="nav-item">
          <a href="#"
             class="nav-link"
             :class="{ active: currentActiveMenu === 'settings' }"
             @click="handleMenuClick('settings', $event)"
             :title="collapsed && !isMobile ? 'System Settings' : ''">
            <div class="nav-icon-container">
              <i class="fas fa-cog nav-icon"></i>
            </div>
            <span v-if="!collapsed || isMobile" class="nav-text">Settings</span>
            <div v-if="collapsed && !isMobile && currentActiveMenu === 'settings'" class="active-indicator"></div>
          </a>
        </li>

        <!-- Activity Logs -->
        <li class="nav-item">
          <a href="#"
             class="nav-link"
             :class="{ active: currentActiveMenu === 'activity' || currentActiveMenu === 'audit' }"
             @click="handleMenuClick('activity', $event)"
             :title="collapsed && !isMobile ? 'Activity Logs' : ''">
            <div class="nav-icon-container">
              <i class="fas fa-history nav-icon"></i>
            </div>
            <span v-if="!collapsed || isMobile" class="nav-text">Activity Logs</span>
            <div v-if="collapsed && !isMobile && (currentActiveMenu === 'activity' || currentActiveMenu === 'audit')" class="active-indicator"></div>
          </a>
        </li>

        <!-- Profile -->
         <!-- I will not using the profile for now so Ill comment it -->
        <!-- <li class="nav-item">
          <a href="#"
             class="nav-link"
             :class="{ active: currentActiveMenu === 'profile' }"
             @click="handleMenuClick('profile', $event)"
             :title="collapsed && !isMobile ? 'Admin Profile' : ''">
            <div class="nav-icon-container">
              <i class="fas fa-user-shield nav-icon"></i>
            </div>
            <span v-if="!collapsed || isMobile" class="nav-text">Admin Profile</span>
            <div v-if="collapsed && !isMobile && currentActiveMenu === 'profile'" class="active-indicator"></div>
          </a>
        </li> -->
      </ul>
    </nav>

    <!-- Bottom Section -->
    <div class="sidebar-bottom">
      <!-- Enhanced Logout Button -->
      <div class="logout-section">
        <button
           class="logout-btn"
           @click="handleLogout($event)"
           :title="collapsed && !isMobile ? 'Logout' : ''"
           :class="{ 'collapsed': collapsed && !isMobile }">
          <div class="logout-icon-container">
            <i class="fas fa-sign-out-alt logout-icon"></i>
            <div class="logout-ripple"></div>
          </div>
          <div v-if="!collapsed || isMobile" class="logout-content">
            <span class="logout-text">Logout</span>
          </div>
          <div v-if="!collapsed || isMobile" class="logout-arrow">
            <i class="fas fa-chevron-right"></i>
          </div>
        </button>
      </div>
    </div>
  </aside>
</template>

<script>
export default {
  name: 'AdminSidebar',
  props: {
    collapsed: {
      type: Boolean,
      default: false
    },
    activeMenu: {
      type: String,
      default: 'dashboard'
    },
    totalUsers: {
      type: Number,
      default: 0
    },
    pendingRequests: {
      type: Number,
      default: 0
    },
    totalReports: {
      type: Number,
      default: 0
    },
    urgentRequests: {
      type: Number,
      default: 0
    },
    processingRequests: {
      type: Number,
      default: 0
    },
    pendingResidencyCount: {
      type: Number,
      default: 0
    }
  },

  emits: ['menu-change', 'logout', 'toggle-sidebar'],

  data() {
    return {
      isMobileState: false
    };
  },

  computed: {
    // Detect if the current device is mobile
    // Use parent's mobile detection to avoid conflicts
    isMobile() {
      return this.isMobileState;
    },

    // Get active menu based on current route
    currentActiveMenu() {
      const path = this.$route.path;
      const routeToMenu = {
        '/admin/dashboard': 'dashboard',
        '/admin/users': 'users',
        '/admin/requests': 'requests',
        '/admin/history': 'history',
        '/admin/reports': 'reports',
        '/admin/settings': 'settings',
        '/admin/activity-logs': 'activity',
        '/admin/audit-logs': 'audit',
        '/admin/profile': 'profile'
      };
      return routeToMenu[path] || this.activeMenu || 'dashboard';
    }
  },

  mounted() {
    // Set initial mobile state
    this.updateMobileState();

    // Listen for window resize to update mobile detection
    this.handleResize = () => {
      this.updateMobileState();
    };
    window.addEventListener('resize', this.handleResize);
  },

  beforeUnmount() {
    // Clean up event listener
    if (this.handleResize) {
      window.removeEventListener('resize', this.handleResize);
    }
  },

  methods: {
    // Update mobile state - keep in sync with parent mixin
    updateMobileState() {
      this.isMobileState = window.innerWidth <= 768;
    },

    // Handle image error
    handleImageError(event) {
      console.log('Logo image failed to load, using fallback');
      // You could set a fallback image here if needed
      event.target.style.display = 'none';
    },

    // Handle menu item click
    handleMenuClick(menu, event) {
      // Prevent default link behavior
      if (event) {
        event.preventDefault();
      }

      // Navigate to the appropriate route
      const routes = {
        'dashboard': '/admin/dashboard',
        'users': '/admin/users',
        'archive': '/admin/users/archive',
        'requests': '/admin/requests',
        'history': '/admin/history',
        'reports': '/admin/reports',
        'settings': '/admin/settings',
        'activity': '/admin/activity-logs',
        'audit': '/admin/audit-logs',
        'profile': '/admin/profile'
      };

      const route = routes[menu];
      if (route && this.$route.path !== route) {
        this.$router.push(route).catch(err => {
          // Handle navigation errors gracefully
          if (err.name !== 'NavigationDuplicated') {
            console.error('Navigation error:', err);
          }
        });
      }

      // Still emit for parent components that need to track active menu
      this.$emit('menu-action', menu);
    },

    // Handle logout
    handleLogout(event) {
      // Prevent default link behavior
      if (event) {
        event.preventDefault();
      }

      // Emit logout event to parent
      this.$emit('logout');
    },

    // Handle mobile close button
    handleMobileClose() {
      // Emit toggle sidebar event to close the sidebar on mobile
      this.$emit('toggle-sidebar');
    }
  },

  // Watch for prop changes
  watch: {
    collapsed: {
      handler(newVal) {
        // Update body class for layout adjustments
        if (newVal) {
          document.body.classList.add('sidebar-collapsed');
        } else {
          document.body.classList.remove('sidebar-collapsed');
        }
      },
      immediate: true
    }
  }
};
</script>

<style scoped src="./css/adminSidebar.css"></style>
