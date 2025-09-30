<template>
  <div class="admin-profile">
    <AdminHeader
      :userName="adminData?.first_name || 'Admin'"
      :showUserDropdown="showUserDropdown"
      :sidebarCollapsed="sidebarCollapsed"
      :activeMenu="activeMenu"
      @sidebar-toggle="handleSidebarToggle"
      @user-dropdown-toggle="handleUserDropdownToggle"
      @menu-action="handleMenuAction"
      @logout="handleLogout"
    />

    <!-- Mobile Overlay -->
    <div
      class="mobile-overlay"
      :class="{ active: !sidebarCollapsed && isMobile }"
      @click="closeMobileSidebar"
    ></div>

    <div class="dashboard-container">
      <AdminSidebar
        :collapsed="sidebarCollapsed"
        :activeMenu="activeMenu"
        @menu-change="handleMenuChange"
        @logout="handleLogout"
        @toggle-sidebar="handleSidebarToggle"
      />
      
      <main class="main-content" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
        <div class="container-fluid p-4">

          <!-- Profile Content -->
          <div class="row">
            <!-- Profile Information -->
            <div class="col-lg-8 mb-4">
              <div class="card shadow">
                <div class="card-header py-3">
                  <h6 class="m-0 font-weight-bold text-primary">
                    <i class="fas fa-user me-2"></i>
                    Profile Information
                  </h6>
                </div>
                <div class="card-body">
                  <form @submit.prevent="updateProfile">
                    <div class="row">
                      <div class="col-md-6 mb-3">
                        <label class="form-label">First Name</label>
                        <input type="text" class="form-control" v-model="profileForm.first_name" required>
                      </div>
                      <div class="col-md-6 mb-3">
                        <label class="form-label">Last Name</label>
                        <input type="text" class="form-control" v-model="profileForm.last_name" required>
                      </div>
                    </div>
                    <div class="row">
                      <div class="col-md-6 mb-3">
                        <label class="form-label">Email</label>
                        <input type="email" class="form-control" v-model="profileForm.email" required>
                      </div>
                      <div class="col-md-6 mb-3">
                        <label class="form-label">Phone Number</label>
                        <input type="tel" class="form-control" v-model="profileForm.phone_number">
                      </div>
                    </div>
                    <div class="row">
                      <div class="col-md-6 mb-3">
                        <label class="form-label">Position</label>
                        <input type="text" class="form-control" v-model="profileForm.position">
                      </div>
                      <div class="col-md-6 mb-3">
                        <label class="form-label">Department</label>
                        <input type="text" class="form-control" v-model="profileForm.department">
                      </div>
                    </div>
                    <div class="text-end">
                      <button type="submit" class="btn btn-success" :disabled="loading">
                        <i class="fas fa-save me-1" :class="{ 'fa-spin': loading }"></i>
                        {{ loading ? 'Saving...' : 'Save Changes' }}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            <!-- Profile Picture & Quick Actions -->
            <div class="col-lg-4 mb-4">
              <div class="card shadow mb-4">
                <div class="card-header py-3">
                  <h6 class="m-0 font-weight-bold text-primary">
                    <i class="fas fa-image me-2"></i>
                    Profile Picture
                  </h6>
                </div>
                <div class="card-body text-center">
                  <div class="profile-picture-container mb-3">
                    <img v-if="profileForm.profile_picture" :src="profileForm.profile_picture" alt="Profile" class="profile-picture">
                    <div v-else class="profile-placeholder">
                      {{ getInitials(profileForm.first_name, profileForm.last_name) }}
                    </div>
                  </div>
                  <button class="btn btn-primary btn-sm" @click="uploadPicture">
                    <i class="fas fa-upload me-1"></i>
                    Upload Picture
                  </button>
                </div>
              </div>

              <!-- Account Security -->
              <div class="card shadow">
                <div class="card-header py-3">
                  <h6 class="m-0 font-weight-bold text-primary">
                    <i class="fas fa-shield-alt me-2"></i>
                    Account Security
                  </h6>
                </div>
                <div class="card-body">
                  <div class="d-grid gap-2">
                    <button class="btn btn-warning btn-sm" @click="changePassword">
                      <i class="fas fa-key me-1"></i>
                      Change Password
                    </button>
                    <button class="btn btn-info btn-sm" @click="enableTwoFactor">
                      <i class="fas fa-mobile-alt me-1"></i>
                      Enable 2FA
                    </button>
                    <button class="btn btn-secondary btn-sm" @click="viewLoginHistory">
                      <i class="fas fa-history me-1"></i>
                      Login History
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script>
import AdminHeader from './AdminHeader.vue';
import AdminSidebar from './AdminSidebar.vue';
import unifiedAuthService from '@/services/unifiedAuthService';

export default {
  name: 'AdminProfile',
  components: {
    AdminHeader,
    AdminSidebar
  },

  data() {
    return {
      // UI State
      sidebarCollapsed: false,
      showUserDropdown: false,
      isMobile: false,
      adminData: null,
      // Component Data
      profileForm: {
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        position: '',
        department: '',
        profile_picture: null
      }
    };
  },

  async mounted() {
    // Check authentication
    if (!unifiedAuthService.isLoggedIn() || unifiedAuthService.getUserType() !== 'admin') {
      this.$router.push('/login');
      return;
    }

    // Initialize UI state
    this.initializeUI();

    // Load component data
    await this.loadAdminProfile();
    await this.loadProfile();
  },

  beforeUnmount() {
    if (this.handleResize) {
      window.removeEventListener('resize', this.handleResize);
    }
  },

  computed: {
    activeMenu() {
      const path = this.$route.path;
      if (path.includes('/admin/users')) return 'users';
      if (path.includes('/admin/requests')) return 'requests';
      if (path.includes('/admin/reports')) return 'reports';
      if (path.includes('/admin/settings')) return 'settings';
      if (path.includes('/admin/activity-logs')) return 'activity';
      if (path.includes('/admin/profile')) return 'profile';
      return 'dashboard';
    }
  },

  methods: {
    // Initialize UI state
    initializeUI() {
      this.isMobile = window.innerWidth <= 768;

      if (!this.isMobile) {
        const saved = localStorage.getItem('adminSidebarCollapsed');
        this.sidebarCollapsed = saved ? JSON.parse(saved) : false;
      } else {
        this.sidebarCollapsed = true;
      }

      this.handleResize = () => {
        const wasMobile = this.isMobile;
        this.isMobile = window.innerWidth <= 768;

        if (this.isMobile && !wasMobile) {
          this.sidebarCollapsed = true;
        } else if (!this.isMobile && wasMobile) {
          const saved = localStorage.getItem('adminSidebarCollapsed');
          this.sidebarCollapsed = saved ? JSON.parse(saved) : false;
        }
      };
      window.addEventListener('resize', this.handleResize);
    },

    handleSidebarToggle() {
      this.sidebarCollapsed = !this.sidebarCollapsed;
      localStorage.setItem('adminSidebarCollapsed', JSON.stringify(this.sidebarCollapsed));
    },

    handleMenuChange(menu) {
      const routes = {
        'dashboard': '/admin/dashboard',
        'users': '/admin/users',
        'requests': '/admin/requests',
        'reports': '/admin/reports',
        'settings': '/admin/settings',
        'activity': '/admin/activity-logs',
        'profile': '/admin/profile'
      };

      if (this.isMobile) {
        this.sidebarCollapsed = true;
      }

      if (routes[menu]) {
        this.$router.push(routes[menu]);
      }
    },

    handleUserDropdownToggle() {
      this.showUserDropdown = !this.showUserDropdown;
    },

    handleMenuAction(action) {
      if (action === 'profile') {
        this.$router.push('/admin/profile');
      } else if (action === 'settings') {
        this.$router.push('/admin/settings');
      }
      this.showUserDropdown = false;
    },

    closeMobileSidebar() {
      if (this.isMobile) {
        this.sidebarCollapsed = true;
      }
    },

    handleLogout() {
      unifiedAuthService.logout();
      this.$router.push('/login');
    },

    async loadAdminProfile() {
      try {
        const user = unifiedAuthService.getCurrentUser();
        if (user && user.profile) {
          this.adminData = user.profile;
        } else {
          this.adminData = {
            first_name: user?.username || 'Admin',
            role: user?.role || 'admin'
          };
        }
      } catch (error) {
        console.error('Failed to load admin profile:', error);
        const user = unifiedAuthService.getCurrentUser();
        this.adminData = {
          first_name: user?.username || 'Admin',
          role: user?.role || 'admin'
        };
      }
    },

    async loadProfile() {
      this.loading = true;
      try {
        const user = unifiedAuthService.getCurrentUser();
        if (user && user.profile) {
          this.adminData = user.profile;
          this.profileForm = { ...user.profile };
        } else {
          this.adminData = {
            first_name: user?.username || 'Admin',
            role: user?.role || 'admin'
          };
          this.profileForm = { ...this.adminData };
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
        const user = unifiedAuthService.getCurrentUser();
        this.adminData = {
          first_name: user?.username || 'Admin',
          role: user?.role || 'admin'
        };
        this.profileForm = { ...this.adminData };
      } finally {
        this.loading = false;
      }
    },

    async updateProfile() {
      this.loading = true;
      try {
        console.log('Updating profile:', this.profileForm);
        await new Promise(resolve => setTimeout(resolve, 1000));
        alert('Profile updated successfully!');
      } catch (error) {
        console.error('Failed to update profile:', error);
        alert('Failed to update profile. Please try again.');
      } finally {
        this.loading = false;
      }
    },

    getInitials(firstName, lastName) {
      const first = firstName ? firstName.charAt(0).toUpperCase() : '';
      const last = lastName ? lastName.charAt(0).toUpperCase() : '';
      return first + last || '?';
    },

    uploadPicture() {
      alert('Profile picture upload functionality will be implemented soon.');
    },

    changePassword() {
      alert('Change password functionality will be implemented soon.');
    },

    enableTwoFactor() {
      alert('Two-factor authentication setup will be implemented soon.');
    },

    viewLoginHistory() {
      alert('Login history view will be implemented soon.');
    },

    // Navigation handlers are now provided by the mixin

    goBack() {
      this.$router.push('/admin/dashboard');
    }
  }
};
</script>

<style scoped src="./css/adminDashboard.css"></style>
<style scoped>
.profile-picture-container {
  width: 120px;
  height: 120px;
  margin: 0 auto;
  position: relative;
}

.profile-picture {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #e9ecef;
}

.profile-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2rem;
  font-weight: 600;
  border: 4px solid #e9ecef;
}
</style>
