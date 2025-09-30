<template>
  <div class="user-profile" :class="{ active: isOpen }">
    <button
      class="user-btn"
      @click="handleToggle"
      aria-label="User account menu"
      :aria-expanded="isOpen"
    >
      <div class="user-avatar">
        <img
          v-if="userData.userAvatar"
          :src="userData.userAvatar"
          :alt="getFullName()"
          class="avatar-image"
          loading="lazy"
        />
        <i v-else class="fas fa-user-circle avatar-icon" aria-hidden="true"></i>
      </div>
      <div class="user-info">
        <span class="user-name">{{ getFullName() }}</span>
        <span class="user-role">Client Portal</span>
      </div>
      <i class="fas fa-chevron-down dropdown-arrow" aria-hidden="true"></i>
    </button>

    <div 
      v-if="isOpen" 
      class="user-dropdown-menu" 
      role="menu" 
      aria-label="User account options"
    >
      <a
        href="#"
        class="dropdown-item"
        :class="{ 'disabled': !canRequestDocuments }"
        @click.prevent="canRequestDocuments ? handleMenuAction('requests') : null"
        role="menuitem"
        :aria-disabled="!canRequestDocuments"
        :title="canRequestDocuments ? 'View your document requests' : 'Residency verification required to request documents'"
      >
        <i class="fas fa-clock" aria-hidden="true"></i>
        <span>My Requests</span>
        <i v-if="!canRequestDocuments" class="fas fa-lock disabled-icon" aria-hidden="true"></i>
      </a>

      <div class="dropdown-divider"></div>

      <a
        href="#"
        class="dropdown-item logout-item"
        @click.prevent="handleLogout"
        role="menuitem"
      >
        <i class="fas fa-sign-out-alt" aria-hidden="true"></i>
        <span>Sign Out</span>
      </a>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserProfileDropdown',
  props: {
    userData: {
      type: Object,
      default: () => ({
        userName: 'User',
        userEmail: 'user@example.com',
        userAvatar: null
      })
    },
    isOpen: {
      type: Boolean,
      default: false
    },
    canRequestDocuments: {
      type: Boolean,
      default: true
    }
  },
  emits: ['toggle', 'menu-action', 'logout'],

  mounted() {
    console.log('=== UserProfileDropdown MOUNTED ===');
    console.log('userData prop received:', this.userData);
    console.log('userData keys:', Object.keys(this.userData || {}));
    console.log('userData.profile:', this.userData?.profile);
    console.log('Initial full name:', this.getFullName());
  },

  methods: {
    handleToggle() {
      this.$emit('toggle')
    },

    handleMenuAction(action) {
      this.$emit('menu-action', action)
    },

    handleLogout() {
      // Confirm logout action
      if (confirm('Are you sure you want to sign out?')) {
        this.$emit('logout')
      }
    },

    getFullName() {
      // Debug: Log user data structure
      console.log('UserProfileDropdown - userData:', this.userData)
      console.log('UserProfileDropdown - userData.profile:', this.userData?.profile)
      console.log('UserProfileDropdown - userData keys:', Object.keys(this.userData || {}))

      if (!this.userData) {
        return 'User'
      }

      const parts = []

      // Try all possible data structure patterns to ensure compatibility

      // Pattern 1: Check if userData has profile object with nested properties (backend structure)
      if (this.userData.profile && typeof this.userData.profile === 'object') {
        const profile = this.userData.profile
        console.log('UserProfileDropdown - using profile object:', profile)
        if (profile.first_name) parts.push(profile.first_name)
        if (profile.middle_name) parts.push(profile.middle_name)
        if (profile.last_name) parts.push(profile.last_name)
        if (profile.suffix) parts.push(profile.suffix)
      }

      // Pattern 2: Check if profile fields are directly on userData (from useUserData composable)
      if (parts.length === 0 && (this.userData.firstName || this.userData.lastName)) {
        console.log('UserProfileDropdown - using direct userData properties')
        if (this.userData.firstName) parts.push(this.userData.firstName)
        if (this.userData.middleName) parts.push(this.userData.middleName)
        if (this.userData.lastName) parts.push(this.userData.lastName)
        if (this.userData.suffix) parts.push(this.userData.suffix)
      }

      // Pattern 3: Check if userData has first_name, last_name directly (raw backend data)
      if (parts.length === 0 && (this.userData.first_name || this.userData.last_name)) {
        console.log('UserProfileDropdown - using raw backend properties')
        if (this.userData.first_name) parts.push(this.userData.first_name)
        if (this.userData.middle_name) parts.push(this.userData.middle_name)
        if (this.userData.last_name) parts.push(this.userData.last_name)
        if (this.userData.suffix) parts.push(this.userData.suffix)
      }

      // Pattern 4: Try to extract from any nested user object
      if (parts.length === 0 && this.userData.user && typeof this.userData.user === 'object') {
        console.log('UserProfileDropdown - checking nested user object')
        const user = this.userData.user
        if (user.profile) {
          if (user.profile.first_name) parts.push(user.profile.first_name)
          if (user.profile.middle_name) parts.push(user.profile.middle_name)
          if (user.profile.last_name) parts.push(user.profile.last_name)
          if (user.profile.suffix) parts.push(user.profile.suffix)
        } else {
          if (user.first_name) parts.push(user.first_name)
          if (user.middle_name) parts.push(user.middle_name)
          if (user.last_name) parts.push(user.last_name)
          if (user.suffix) parts.push(user.suffix)
        }
      }

      const fullName = parts.join(' ').trim()

      // Final fallback to username if no name parts found
      const result = fullName || this.userData.username || this.userData.userName || 'User'

      console.log('UserProfileDropdown - parts found:', parts)
      console.log('UserProfileDropdown - computed fullName:', result)
      return result
    }
  }
}
</script>

<style scoped>
.user-profile {
  position: relative;
  display: flex;
  align-items: center;
}

.user-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  background: transparent;
  border: 2px solid transparent;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  color: var(--text-primary, #1b1b1b);
}

.user-btn:hover {
  background-color: var(--bg-gray-5, #f9f9f9);
  border-color: var(--border-light, #dfe1e2);
}

.user-btn:focus {
  outline: none;
  border-color: var(--gov-blue, #005ea2);
}

.user-btn:focus-visible {
  outline: 3px solid var(--gov-yellow, #ffbe2e);
  outline-offset: 2px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-gray-10, #f0f0f0);
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-icon {
  font-size: 1.5rem;
  color: var(--text-light, #757575);
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.125rem;
}

.user-name {
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1.2;
}

.user-role {
  font-size: 0.75rem;
  color: var(--text-light, #757575);
  line-height: 1;
}

.dropdown-arrow {
  font-size: 0.75rem;
  color: var(--text-light, #757575);
  transition: transform 0.2s ease-in-out;
}

.user-profile.active .dropdown-arrow {
  transform: rotate(180deg);
}

.user-dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  width: 240px;
  background: var(--bg-white, #ffffff);
  border: 2px solid var(--border-light, #dfe1e2);
  border-radius: 0.5rem;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.1);
  padding: 0.5rem 0;
  margin-top: 0.5rem;
  z-index: 1000;
}

.dropdown-header {
  padding: 0.75rem 1rem;
}

.user-details strong {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary, #1b1b1b);
  margin-bottom: 0.25rem;
}

.user-email {
  font-size: 0.75rem;
  color: var(--text-light, #757575);
}

.dropdown-divider {
  height: 1px;
  background-color: var(--border-light, #dfe1e2);
  margin: 0.5rem 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: var(--text-primary, #1b1b1b);
  text-decoration: none;
  font-size: 0.875rem;
  transition: background-color 0.2s ease-in-out;
}

.dropdown-item:hover {
  background-color: var(--bg-gray-5, #f9f9f9);
}

.dropdown-item:focus {
  outline: none;
  background-color: var(--gov-blue-lighter, #e7f6f8);
}

.dropdown-item i {
  width: 16px;
  text-align: center;
  flex-shrink: 0;
}

.dropdown-item.disabled {
  color: var(--text-light, #757575);
  cursor: not-allowed;
  opacity: 0.6;
}

.dropdown-item.disabled:hover {
  background-color: transparent;
}

.disabled-icon {
  margin-left: auto;
  width: auto !important;
  font-size: 0.75rem;
  color: var(--text-light, #757575);
}

.logout-item {
  color: var(--gov-red, #d63384);
}

.logout-item:hover {
  background-color: rgba(214, 51, 132, 0.1);
}

/* Mobile responsive */
@media (max-width: 768px) {
  .user-info {
    display: none;
  }
  
  .user-dropdown-menu {
    width: 200px;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .user-dropdown-menu {
    border-color: var(--text-primary, #1b1b1b);
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.3);
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .user-btn,
  .dropdown-arrow,
  .dropdown-item {
    transition: none;
  }
  
  .user-profile.active .dropdown-arrow {
    transform: none;
  }
}
</style>
