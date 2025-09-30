<template>
  <div class="admin-settings">
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
        <div class="container-fluid py-4">
          <!-- Success Message -->
          <div v-if="successMessage" class="alert alert-success alert-dismissible fade show" role="alert">
            <i class="fas fa-check-circle me-2"></i>
            {{ successMessage }}
            <button type="button" class="btn-close" @click="successMessage = ''" aria-label="Close"></button>
          </div>

          <!-- Error Message -->
          <div v-if="errorMessage" class="alert alert-danger alert-dismissible fade show" role="alert">
            <i class="fas fa-exclamation-triangle me-2"></i>
            {{ errorMessage }}
            <button type="button" class="btn-close" @click="errorMessage = ''" aria-label="Close"></button>
          </div>

          <!-- Settings Navigation -->
          <div class="row mb-4">
            <div class="col-12">
              <div class="card shadow">
                <div class="card-body">
                  <div class="row">
                    <div class="col-md-3">
                      <div class="nav flex-column nav-pills" role="tablist">
                        <button
                          class="nav-link"
                          :class="{ active: activeTab === 'profile' }"
                          @click="activeTab = 'profile'"
                          type="button"
                        >
                          <i class="fas fa-user me-2"></i>
                          Admin Profile
                        </button>
                        <button
                          class="nav-link"
                          :class="{ active: activeTab === 'password' }"
                          @click="activeTab = 'password'"
                          type="button"
                        >
                          <i class="fas fa-shield-alt me-2"></i>
                          Change Password
                        </button>
                        
                        <!-- Ill not using these buttons for now -->
                        <!-- <button
                          class="nav-link"
                          :class="{ active: activeTab === 'notifications' }"
                          @click="activeTab = 'notifications'"
                          type="button"
                        >
                          <i class="fas fa-bell me-2"></i>
                          Notifications
                        </button>
                        <button
                          class="nav-link"
                          :class="{ active: activeTab === 'system' }"
                          @click="activeTab = 'system'"
                          type="button"
                        >
                          <i class="fas fa-server me-2"></i>
                          System
                        </button>
                        <button
                          class="nav-link"
                          :class="{ active: activeTab === 'backup' }"
                          @click="activeTab = 'backup'"
                          type="button"
                        >
                          <i class="fas fa-database me-2"></i>
                          Backup & Restore
                        </button> -->
                      </div>
                    </div>
                    <div class="col-md-9">
                      <!-- Admin Profile Tab -->
                      <div v-if="activeTab === 'profile'" class="tab-content">
                        <h5 class="mb-3">Admin Profile</h5>
                        <form @submit.prevent="saveProfile">
                          <div class="row">
                            <div class="col-md-6 mb-3">
                              <label class="form-label">First Name</label>
                              <input type="text" class="form-control" v-model="profileForm.first_name" required>
                            </div>
                            <div class="col-md-6 mb-3">
                              <label class="form-label">Middle Name</label>
                              <input type="text" class="form-control" v-model="profileForm.middle_name">
                            </div>
                          </div>
                          <div class="row">
                            <div class="col-md-6 mb-3">
                              <label class="form-label">Last Name</label>
                              <input type="text" class="form-control" v-model="profileForm.last_name" required>
                            </div>
                            <div class="col-md-6 mb-3">
                              <label class="form-label">Suffix</label>
                              <input type="text" class="form-control" v-model="profileForm.suffix" placeholder="Jr., Sr., III, etc.">
                            </div>
                          </div>
                          <div class="row">
                            <div class="col-md-6 mb-3">
                              <label class="form-label">Employee ID</label>
                              <input type="text" class="form-control" v-model="profileForm.employee_id">
                            </div>
                            <div class="col-md-6 mb-3">
                              <label class="form-label">Phone Number</label>
                              <input type="tel" class="form-control" v-model="profileForm.phone_number">
                            </div>
                          </div>
                          <div class="row">
                            <div class="col-md-6 mb-3">
                              <label class="form-label">Email</label>
                              <input type="email" class="form-control" v-model="profileForm.email" required>
                            </div>
                            <div class="col-md-6 mb-3">
                              <label class="form-label">Position</label>
                              <input type="text" class="form-control" v-model="profileForm.position">
                            </div>
                          </div>
                          <div class="row">
                            <div class="col-md-6 mb-3">
                              <label class="form-label">Department</label>
                              <input type="text" class="form-control" v-model="profileForm.department">
                            </div>
                            <!-- I will hide this for now -->
                            <!-- <div class="col-md-6 mb-3">
                              <label class="form-label">Hire Date</label>
                              <input type="date" class="form-control" v-model="profileForm.hire_date">
                            </div> -->
                          </div>
                          <div class="text-end">
                            <button type="submit" class="btn btn-success" :disabled="profileLoading">
                              <i class="fas fa-save me-1"></i>
                              <span v-if="profileLoading">Saving...</span>
                              <span v-else>Save Profile</span>
                            </button>
                          </div>
                        </form>
                      </div>

                      <!-- Change Password Tab -->
                      <div v-if="activeTab === 'password'" class="tab-content">
                        <h5 class="mb-3">Change Password</h5>
                        <form @submit.prevent="changePassword">
                          <div class="alert alert-info">
                            <i class="fas fa-info-circle me-2"></i>
                            For security reasons, you must enter your current password to change it.
                          </div>
                          
                          <div class="mb-3">
                            <label class="form-label">Current Password</label>
                            <div class="input-group">
                              <input
                                :type="showCurrentPassword ? 'text' : 'password'"
                                class="form-control"
                                v-model="passwordForm.currentPassword"
                                required
                                autocomplete="current-password"
                              >
                              <button
                                type="button"
                                class="btn btn-outline-secondary"
                                @click="showCurrentPassword = !showCurrentPassword"
                              >
                                <i :class="showCurrentPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                              </button>
                            </div>
                          </div>
                          
                          <div class="mb-3">
                            <label class="form-label">New Password</label>
                            <div class="input-group">
                              <input
                                :type="showNewPassword ? 'text' : 'password'"
                                class="form-control"
                                v-model="passwordForm.newPassword"
                                required
                                autocomplete="new-password"
                              >
                              <button
                                type="button"
                                class="btn btn-outline-secondary"
                                @click="showNewPassword = !showNewPassword"
                              >
                                <i :class="showNewPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                              </button>
                            </div>
                            <div class="form-text">
                              Password must be at least 8 characters with uppercase, lowercase, and number.
                            </div>
                          </div>
                          
                          <div class="mb-3">
                            <label class="form-label">Confirm New Password</label>
                            <div class="input-group">
                              <input
                                :type="showConfirmPassword ? 'text' : 'password'"
                                class="form-control"
                                v-model="passwordForm.confirmPassword"
                                required
                                autocomplete="new-password"
                              >
                              <button
                                type="button"
                                class="btn btn-outline-secondary"
                                @click="showConfirmPassword = !showConfirmPassword"
                              >
                                <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                              </button>
                            </div>
                          </div>
                          
                          <div class="text-end">
                            <button type="submit" class="btn btn-warning" :disabled="passwordLoading">
                              <i class="fas fa-key me-1"></i>
                              <span v-if="passwordLoading">Changing...</span>
                              <span v-else>Change Password</span>
                            </button>
                          </div>
                        </form>
                      </div>

                      <!-- Notifications Settings Tab -->
                      <div v-if="activeTab === 'notifications'" class="tab-content">
                        <h5 class="mb-3">Notification Settings</h5>
                        <form @submit.prevent="saveNotificationSettings">
                          <div class="mb-4">
                            <h6>Email Notifications</h6>
                            <div class="form-check">
                              <input class="form-check-input" type="checkbox" v-model="settings.notifications.newUserRegistration">
                              <label class="form-check-label">New User Registration</label>
                            </div>
                            <div class="form-check">
                              <input class="form-check-input" type="checkbox" v-model="settings.notifications.documentRequests">
                              <label class="form-check-label">Document Requests</label>
                            </div>
                            <div class="form-check">
                              <input class="form-check-input" type="checkbox" v-model="settings.notifications.systemAlerts">
                              <label class="form-check-label">System Alerts</label>
                            </div>
                          </div>
                          <div class="mb-4">
                            <h6>SMS Notifications</h6>
                            <div class="form-check">
                              <input class="form-check-input" type="checkbox" v-model="settings.notifications.smsEnabled">
                              <label class="form-check-label">Enable SMS Notifications</label>
                            </div>
                            <div class="row mt-3">
                              <div class="col-md-6">
                                <label class="form-label">SMS Provider</label>
                                <select class="form-select" v-model="settings.notifications.smsProvider">
                                  <option value="semaphore">Semaphore</option>
                                  <option value="globe">Globe Labs</option>
                                  <option value="smart">Smart Communications</option>
                                </select>
                              </div>
                              <div class="col-md-6">
                                <label class="form-label">SMS API Key</label>
                                <input type="password" class="form-control" v-model="settings.notifications.smsApiKey">
                              </div>
                            </div>
                          </div>
                          <div class="text-end">
                            <button type="submit" class="btn btn-success">
                              <i class="fas fa-save me-1"></i>
                              Save Changes
                            </button>
                          </div>
                        </form>
                      </div>

                      <!-- System Settings Tab -->
                      <div v-if="activeTab === 'system'" class="tab-content">
                        <h5 class="mb-3">System Settings</h5>
                        <div class="row">
                          <div class="col-md-6 mb-4">
                            <div class="card border-0 bg-light">
                              <div class="card-body">
                                <h6 class="card-title">System Information</h6>
                                <table class="table table-sm table-borderless">
                                  <tbody>
                                    <tr>
                                      <td><strong>Version:</strong></td>
                                      <td>{{ systemInfo.version }}</td>
                                    </tr>
                                    <tr>
                                      <td><strong>Database:</strong></td>
                                      <td>{{ systemInfo.database }}</td>
                                    </tr>
                                    <tr>
                                      <td><strong>Server:</strong></td>
                                      <td>{{ systemInfo.server }}</td>
                                    </tr>
                                    <tr>
                                      <td><strong>Uptime:</strong></td>
                                      <td>{{ systemInfo.uptime }}</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                          <div class="col-md-6 mb-4">
                            <div class="card border-0 bg-light">
                              <div class="card-body">
                                <h6 class="card-title">System Actions</h6>
                                <div class="d-grid gap-2">
                                  <button class="btn btn-warning btn-sm" @click="clearCache">
                                    <i class="fas fa-broom me-1"></i>
                                    Clear System Cache
                                  </button>
                                  <button class="btn btn-info btn-sm" @click="optimizeDatabase">
                                    <i class="fas fa-database me-1"></i>
                                    Optimize Database
                                  </button>
                                  <button class="btn btn-success btn-sm" @click="checkUpdates">
                                    <i class="fas fa-sync-alt me-1"></i>
                                    Check for Updates
                                  </button>
                                  <button class="btn btn-danger btn-sm" @click="restartSystem">
                                    <i class="fas fa-power-off me-1"></i>
                                    Restart System
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Backup & Restore Tab -->
                      <div v-if="activeTab === 'backup'" class="tab-content">
                        <h5 class="mb-3">Backup & Restore</h5>
                        <div class="row">
                          <div class="col-md-6 mb-4">
                            <div class="card border-0 bg-light">
                              <div class="card-body">
                                <h6 class="card-title">Create Backup</h6>
                                <p class="text-muted small">Create a full system backup including database and files.</p>
                                <div class="mb-3">
                                  <label class="form-label">Backup Type</label>
                                  <select class="form-select" v-model="backupType">
                                    <option value="full">Full Backup</option>
                                    <option value="database">Database Only</option>
                                    <option value="files">Files Only</option>
                                  </select>
                                </div>
                                <button class="btn btn-primary" @click="createBackup" :disabled="backupInProgress">
                                  <i class="fas fa-download me-1" :class="{ 'fa-spin': backupInProgress }"></i>
                                  {{ backupInProgress ? 'Creating Backup...' : 'Create Backup' }}
                                </button>
                              </div>
                            </div>
                          </div>
                          <div class="col-md-6 mb-4">
                            <div class="card border-0 bg-light">
                              <div class="card-body">
                                <h6 class="card-title">Restore Backup</h6>
                                <p class="text-muted small">Restore system from a previous backup.</p>
                                <div class="mb-3">
                                  <label class="form-label">Select Backup File</label>
                                  <input type="file" class="form-control" accept=".zip,.sql" @change="selectBackupFile">
                                </div>
                                <button class="btn btn-warning" @click="restoreBackup" :disabled="!selectedBackupFile || restoreInProgress">
                                  <i class="fas fa-upload me-1" :class="{ 'fa-spin': restoreInProgress }"></i>
                                  {{ restoreInProgress ? 'Restoring...' : 'Restore Backup' }}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        <!-- Recent Backups -->
                        <div class="card border-0 bg-light">
                          <div class="card-body">
                            <h6 class="card-title">Recent Backups</h6>
                            <div class="table-responsive">
                              <table class="table table-sm">
                                <thead>
                                  <tr>
                                    <th>Date</th>
                                    <th>Type</th>
                                    <th>Size</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr v-for="backup in recentBackups" :key="backup.id">
                                    <td>{{ formatDate(backup.created_at) }}</td>
                                    <td>
                                      <span class="badge bg-info">{{ backup.type }}</span>
                                    </td>
                                    <td>{{ backup.size }}</td>
                                    <td>
                                      <span class="badge" :class="backup.status === 'completed' ? 'bg-success' : 'bg-warning'">
                                        {{ backup.status }}
                                      </span>
                                    </td>
                                    <td>
                                      <div class="btn-group btn-group-sm">
                                        <button class="btn btn-outline-primary" @click="downloadBackup(backup)">
                                          <i class="fas fa-download"></i>
                                        </button>
                                        <button class="btn btn-outline-danger" @click="deleteBackup(backup)">
                                          <i class="fas fa-trash"></i>
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
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
import adminAuthService from '@/services/adminAuthService';

export default {
  name: 'AdminSettings',
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
      activeTab: 'profile',
      loading: false,
      profileLoading: false,
      passwordLoading: false,
      successMessage: '',
      errorMessage: '',

      // Profile form data
      profileForm: {
        first_name: '',
        middle_name: '',
        last_name: '',
        suffix: '',
        employee_id: '',
        phone_number: '',
        email: '',
        position: '',
        department: '',
        hire_date: ''
      },

      // Password change form data
      passwordForm: {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      },

      // Show password toggles
      showCurrentPassword: false,
      showNewPassword: false,
      showConfirmPassword: false,

      systemInfo: {
        version: '1.0.0',
        database: 'MySQL 8.0',
        server: 'Apache 2.4',
        uptime: '15 days, 3 hours'
      },

      recentBackups: [
        {
          id: 1,
          created_at: '2024-01-31T10:30:00Z',
          type: 'Full',
          size: '45.2 MB',
          status: 'completed'
        },
        {
          id: 2,
          created_at: '2024-01-30T10:30:00Z',
          type: 'Database',
          size: '12.8 MB',
          status: 'completed'
        },
        {
          id: 3,
          created_at: '2024-01-29T10:30:00Z',
          type: 'Full',
          size: '44.1 MB',
          status: 'completed'
        }
      ]
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
    await this.loadProfileData();
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

    // Load profile data from backend
    async loadProfileData() {
      try {
        this.loading = true;
        const response = await adminAuthService.getProfile();

        if (response.success) {
          const data = response.data;
          this.profileForm = {
            first_name: data.first_name || '',
            middle_name: data.middle_name || '',
            last_name: data.last_name || '',
            suffix: data.suffix || '',
            employee_id: data.employee_id || '',
            phone_number: data.phone_number || '',
            email: data.email || '',
            position: data.position || '',
            department: data.department || '',
            hire_date: data.hire_date ? data.hire_date.split('T')[0] : ''
          };
        } else {
          this.errorMessage = 'Failed to load profile data';
        }
      } catch (error) {
        console.error('Failed to load profile data:', error);
        this.errorMessage = 'Failed to load profile data';
      } finally {
        this.loading = false;
      }
    },

    // Save profile data
    async saveProfile() {
      try {
        this.profileLoading = true;
        this.clearMessages();

        const response = await adminAuthService.updateProfile(this.profileForm);

        if (response.success) {
          this.successMessage = 'Profile updated successfully!';
          // Update the adminData for the header
          await this.loadAdminProfile();
        } else {
          this.errorMessage = response.message || 'Failed to update profile';
        }
      } catch (error) {
        console.error('Failed to save profile:', error);
        this.errorMessage = 'Failed to update profile. Please try again.';
      } finally {
        this.profileLoading = false;
      }
    },

    // Change password
    async changePassword() {
      try {
        this.passwordLoading = true;
        this.clearMessages();

        // Validate passwords match
        if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
          this.errorMessage = 'New passwords do not match';
          return;
        }

        // Validate password strength
        if (this.passwordForm.newPassword.length < 8) {
          this.errorMessage = 'Password must be at least 8 characters long';
          return;
        }

        const response = await adminAuthService.changePassword({
          currentPassword: this.passwordForm.currentPassword,
          newPassword: this.passwordForm.newPassword,
          confirmPassword: this.passwordForm.confirmPassword
        });

        if (response.success) {
          this.successMessage = 'Password changed successfully!';
          // Clear the form
          this.passwordForm = {
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          };
          // Reset show password toggles
          this.showCurrentPassword = false;
          this.showNewPassword = false;
          this.showConfirmPassword = false;
        } else {
          this.errorMessage = response.message || 'Failed to change password';
        }
      } catch (error) {
        console.error('Failed to change password:', error);
        this.errorMessage = 'Failed to change password. Please try again.';
      } finally {
        this.passwordLoading = false;
      }
    },

    // Clear messages
    clearMessages() {
      this.successMessage = '';
      this.errorMessage = '';
    },

    // System actions
    async clearCache() {
      if (confirm('Are you sure you want to clear the system cache?')) {
        try {
          console.log('Clearing cache...');
          await new Promise(resolve => setTimeout(resolve, 2000));
          alert('System cache cleared successfully!');
        } catch (error) {
          console.error('Failed to clear cache:', error);
          alert('Failed to clear cache. Please try again.');
        }
      }
    },

    async optimizeDatabase() {
      if (confirm('Are you sure you want to optimize the database? This may take a few minutes.')) {
        try {
          console.log('Optimizing database...');
          await new Promise(resolve => setTimeout(resolve, 3000));
          alert('Database optimized successfully!');
        } catch (error) {
          console.error('Failed to optimize database:', error);
          alert('Failed to optimize database. Please try again.');
        }
      }
    },

    async checkUpdates() {
      try {
        console.log('Checking for updates...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        alert('System is up to date!');
      } catch (error) {
        console.error('Failed to check updates:', error);
        alert('Failed to check for updates. Please try again.');
      }
    },

    async restartSystem() {
      if (confirm('Are you sure you want to restart the system? This will temporarily make the system unavailable.')) {
        try {
          console.log('Restarting system...');
          alert('System restart initiated. Please wait a few minutes before accessing the system again.');
        } catch (error) {
          console.error('Failed to restart system:', error);
          alert('Failed to restart system. Please try again.');
        }
      }
    },

    // Backup and restore methods
    async createBackup() {
      this.backupInProgress = true;
      try {
        console.log(`Creating ${this.backupType} backup...`);
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Add new backup to the list
        const newBackup = {
          id: Date.now(),
          created_at: new Date().toISOString(),
          type: this.backupType.charAt(0).toUpperCase() + this.backupType.slice(1),
          size: '42.5 MB',
          status: 'completed'
        };
        this.recentBackups.unshift(newBackup);

        alert('Backup created successfully!');
      } catch (error) {
        console.error('Failed to create backup:', error);
        alert('Failed to create backup. Please try again.');
      } finally {
        this.backupInProgress = false;
      }
    },

    selectBackupFile(event) {
      this.selectedBackupFile = event.target.files[0];
    },

    async restoreBackup() {
      if (!this.selectedBackupFile) {
        alert('Please select a backup file first.');
        return;
      }

      if (confirm('Are you sure you want to restore from this backup? This will overwrite current data.')) {
        this.restoreInProgress = true;
        try {
          console.log('Restoring backup:', this.selectedBackupFile.name);
          await new Promise(resolve => setTimeout(resolve, 8000));
          alert('Backup restored successfully!');
          this.selectedBackupFile = null;
        } catch (error) {
          console.error('Failed to restore backup:', error);
          alert('Failed to restore backup. Please try again.');
        } finally {
          this.restoreInProgress = false;
        }
      }
    },

    downloadBackup(backup) {
      console.log('Downloading backup:', backup);
      alert(`Download functionality for backup "${backup.type}" will be implemented soon.`);
    },

    deleteBackup(backup) {
      if (confirm(`Are you sure you want to delete the backup from ${this.formatDate(backup.created_at)}?`)) {
        const index = this.recentBackups.findIndex(b => b.id === backup.id);
        if (index > -1) {
          this.recentBackups.splice(index, 1);
          alert('Backup deleted successfully.');
        }
      }
    },

    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    // Navigation handlers are now provided by the mixin
    goBack() {
      this.$router.push('/admin/dashboard');
    }
  }
};
</script>

<style scoped>
@import './css/adminDashboard.css';

/* Navigation pills */
.nav-pills .nav-link {
  color: #6c757d;
  border-radius: 0.5rem;
  margin-bottom: 0.5rem;
  transition: all 0.3s ease;
}

.nav-pills .nav-link:hover {
  background-color: #f8f9fa;
  color: #495057;
}

.nav-pills .nav-link.active {
  background-color: #007bff;
  color: white;
}

/* Tab content */
.tab-content {
  min-height: 400px;
}

/* Form improvements */
.form-label {
  font-weight: 600;
  color: #495057;
  margin-bottom: 0.5rem;
}

.form-control,
.form-select {
  border-radius: 0.5rem;
  border: 1px solid #d1d3e2;
  transition: all 0.3s ease;
}

.form-control:focus,
.form-select:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

/* Card improvements */
.card {
  border-radius: 1rem;
  box-shadow: 0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.15);
}

/* Button improvements */
.btn {
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn:hover {
  transform: translateY(-1px);
}

/* Table improvements */
.table-sm th,
.table-sm td {
  padding: 0.5rem;
  font-size: 0.875rem;
}

.table-borderless td {
  border: none;
}

/* Badge improvements */
.badge {
  font-size: 0.75rem;
  padding: 0.375rem 0.75rem;
  border-radius: 0.5rem;
}

/* System info styling */
.card.bg-light {
  background-color: #f8f9fa !important;
  border: 1px solid #e9ecef;
}

/* Responsive improvements */
@media (max-width: 768px) {
  .nav-pills {
    flex-direction: row;
    overflow-x: auto;
    white-space: nowrap;
    margin-bottom: 1rem;
  }

  .nav-pills .nav-link {
    margin-right: 0.5rem;
    margin-bottom: 0;
    white-space: nowrap;
  }

  .tab-content {
    min-height: auto;
  }

  .row .col-md-6 {
    margin-bottom: 1rem;
  }
}

@media (max-width: 576px) {
  .d-grid.gap-2 .btn {
    font-size: 0.875rem;
    padding: 0.5rem;
  }

  .table-responsive {
    font-size: 0.8rem;
  }

  .btn-group-sm .btn {
    padding: 0.25rem 0.375rem;
    font-size: 0.7rem;
  }
}
</style>