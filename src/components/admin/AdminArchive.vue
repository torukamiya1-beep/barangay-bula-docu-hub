<template>
  <div class="admin-archive">
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
        <div class="container-fluid px-4">
          <!-- Archive Table -->
          <div class="row">
            <div class="col-12">
              <div class="card shadow">
                <div class="card-header py-3 d-flex justify-content-between align-items-center">
                  <h6 class="m-0 font-weight-bold text-primary">
                    <i class="fas fa-archive me-2"></i>
                    Archived Users
                  </h6>
                  <div class="d-flex gap-2 align-items-center">
                    <div class="input-group" style="width: 300px;">
                      <span class="input-group-text">
                        <i class="fas fa-search"></i>
                      </span>
                      <input
                        type="text"
                        class="form-control"
                        placeholder="Search archived users..."
                        v-model="searchQuery"
                      >
                    </div>
                    <div class="d-flex align-items-center gap-2">
                      <label class="form-label mb-0 text-muted small">Show:</label>
                      <select class="form-select form-select-sm" v-model="itemsPerPage" style="width: auto;">
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                      </select>
                      <span class="text-muted small">entries</span>
                    </div>
                  </div>
                </div>

                <div class="card-body">
                  <!-- Summary Info -->
                  <div v-if="!loading && archivedUsers.length > 0" class="row mb-3">
                    <div class="col-md-6">
                      <p class="text-muted mb-0">
                        Showing {{ ((currentPage - 1) * itemsPerPage) + 1 }} to {{ Math.min(currentPage * itemsPerPage, filteredUsers.length) }}
                        of {{ filteredUsers.length }} archived users
                        <span v-if="searchQuery">(filtered from {{ archivedUsers.length }} total)</span>
                      </p>
                    </div>
                    <div class="col-md-6 text-end">
                      <small class="text-muted">
                        <i class="fas fa-info-circle me-1"></i>
                        Archived users can be restored to active status
                      </small>
                    </div>
                  </div>

                  <!-- Loading State -->
                  <div v-if="loading" class="text-center py-4">
                    <div class="spinner-border text-primary" role="status">
                      <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mt-2 text-muted">Loading archived users...</p>
                  </div>

                  <!-- Empty State -->
                  <div v-else-if="!loading && filteredUsers.length === 0" class="text-center py-5">
                    <i class="fas fa-archive fa-3x text-muted mb-3"></i>
                    <h5 class="text-muted">
                      {{ searchQuery ? 'No Matching Archived Users' : 'No Archived Users' }}
                    </h5>
                    <p class="text-muted">
                      {{ searchQuery
                        ? `No archived users match your search for "${searchQuery}". Try adjusting your search terms.`
                        : 'There are no archived users to display. Users will appear here when they are deleted from the system.'
                      }}
                    </p>
                    <button v-if="searchQuery" class="btn btn-outline-primary btn-sm" @click="searchQuery = ''">
                      <i class="fas fa-times me-1"></i>
                      Clear Search
                    </button>
                  </div>

                  <!-- Users Table -->
                  <div v-else class="table-responsive">
                    <table class="table table-bordered table-hover">
                      <thead class="table-light">
                        <tr>
                          <th>User Information</th>
                          <th>Account Type</th>
                          <th>Status</th>
                          <th>Archived Date</th>
                          <th class="text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="user in paginatedUsers" :key="user.id">
                          <td>
                            <div class="d-flex align-items-center">
                              <div class="user-avatar me-3">
                                <div class="avatar-placeholder rounded-circle bg-light d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
                                  <i :class="user.type === 'admin' ? 'fas fa-user-shield text-primary' : 'fas fa-user text-info'"></i>
                                </div>
                              </div>
                              <div>
                                <div class="fw-bold">{{ user.full_name || 'No Name' }}</div>
                                <div class="text-muted small">
                                  <i class="fas fa-envelope me-1"></i>{{ user.email || 'No email' }}
                                </div>
                                <div class="text-muted small">
                                  <i class="fas fa-at me-1"></i>{{ user.username }}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span class="badge" :class="user.type === 'admin' ? 'bg-primary' : 'bg-info'">
                              <i :class="user.type === 'admin' ? 'fas fa-user-shield me-1' : 'fas fa-user me-1'"></i>
                              {{ user.type === 'admin' ? 'Administrator' : 'Client' }}
                            </span>
                          </td>
                          <td>
                            <span class="badge bg-secondary">
                              <i class="fas fa-archive me-1"></i>
                              Archived
                            </span>
                          </td>
                          <td>
                            <div class="text-muted small">
                              <i class="fas fa-calendar me-1"></i>
                              {{ formatDate(user.updated_at) }}
                            </div>
                          </td>
                          <td class="text-center">
                            <div class="btn-group btn-group-sm">
                              <button
                                class="btn btn-outline-info"
                                @click="viewUser(user)"
                                title="View Details"
                              >
                                <i class="fas fa-eye"></i>
                              </button>
                              <button
                                class="btn btn-outline-success"
                                @click="restoreUser(user)"
                                title="Restore User"
                              >
                                <i class="fas fa-undo"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <!-- Pagination -->
                  <div v-if="filteredUsers.length > 0" class="d-flex justify-content-between align-items-center mt-3">
                    <div class="text-muted small">
                      <i class="fas fa-info-circle me-1"></i>
                      Page {{ currentPage }} of {{ totalPages }}
                      ({{ ((currentPage - 1) * itemsPerPage) + 1 }} to {{ Math.min(currentPage * itemsPerPage, filteredUsers.length) }} of {{ filteredUsers.length }} entries)
                    </div>
                    <nav v-if="totalPages > 1">
                      <ul class="pagination pagination-sm mb-0">
                        <li class="page-item" :class="{ disabled: currentPage === 1 }">
                          <button class="page-link" @click="changePage(currentPage - 1)" :disabled="currentPage === 1">
                            <i class="fas fa-chevron-left"></i>
                            Previous
                          </button>
                        </li>
                        <li v-for="page in visiblePages" :key="page" class="page-item" :class="{ active: page === currentPage }">
                          <button class="page-link" @click="changePage(page)">{{ page }}</button>
                        </li>
                        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                          <button class="page-link" @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages">
                            Next
                            <i class="fas fa-chevron-right"></i>
                          </button>
                        </li>
                      </ul>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- View User Modal -->
    <div class="modal fade" id="viewUserModal" tabindex="-1" aria-labelledby="viewUserModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
          <div class="modal-header bg-light">
            <h5 class="modal-title" id="viewUserModalLabel">
              <i class="fas fa-user-circle me-2"></i>
              Archived User Details
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body p-4">
            <div v-if="viewUserData" class="container-fluid">
              <!-- User Profile Header -->
              <div class="row align-items-center mb-4">
                <div class="col-auto">
                  <div class="avatar-placeholder-large rounded-circle bg-light d-flex align-items-center justify-content-center" style="width: 80px; height: 80px;">
                    <i :class="viewUserData.type === 'admin' ? 'fas fa-user-shield fa-3x text-primary' : 'fas fa-user fa-3x text-info'"></i>
                  </div>
                </div>
                <div class="col">
                  <h4 class="mb-0">{{ viewUserData.full_name || 'No Name' }}</h4>
                  <p class="text-muted mb-0">@{{ viewUserData.username }}</p>
                  <div class="mt-2">
                    <span class="badge" :class="viewUserData.type === 'admin' ? 'bg-primary' : 'bg-info'">
                      <i :class="viewUserData.type === 'admin' ? 'fas fa-user-shield me-1' : 'fas fa-user me-1'"></i>
                      {{ viewUserData.type === 'admin' ? 'Administrator' : 'Client' }}
                    </span>
                    <span class="badge bg-secondary ms-2">
                      <i class="fas fa-archive me-1"></i>
                      Archived
                    </span>
                  </div>
                </div>
              </div>

              <!-- User Information Sections -->
              <div class="row">
                <!-- Personal Information -->
                <div class="col-md-6 mb-4">
                  <div class="card h-100">
                    <div class="card-header">
                      <h6 class="mb-0">
                        <i class="fas fa-id-card me-2"></i>
                        Personal Information
                      </h6>
                    </div>
                    <div class="card-body">
                      <ul class="list-group list-group-flush">
                        <li class="list-group-item d-flex justify-content-between align-items-center">
                          <strong>Full Name:</strong>
                          <span class="value-text">{{ viewUserData.full_name || 'Not provided' }}</span>
                        </li>
                        <li v-if="viewUserData.type === 'client'" class="list-group-item d-flex justify-content-between align-items-center">
                          <strong>Gender:</strong>
                          <span class="value-text">{{ viewUserData.gender ? viewUserData.gender.charAt(0).toUpperCase() + viewUserData.gender.slice(1) : 'Not specified' }}</span>
                        </li>
                        <li v-if="viewUserData.type === 'client'" class="list-group-item d-flex justify-content-between align-items-center">
                          <strong>Birth Date:</strong>
                          <span class="value-text">{{ viewUserData.birth_date ? formatDate(viewUserData.birth_date) : 'Not provided' }}</span>
                        </li>
                        <li v-if="viewUserData.type === 'client'" class="list-group-item d-flex justify-content-between align-items-center">
                          <strong>Civil Status:</strong>
                          <span class="value-text">{{ getCivilStatusLabel(viewUserData.civil_status_id) }}</span>
                        </li>
                        <li v-if="viewUserData.type === 'client'" class="list-group-item d-flex justify-content-between align-items-center">
                          <strong>Nationality:</strong>
                          <span class="value-text">{{ viewUserData.nationality || 'Not provided' }}</span>
                        </li>
                        <li v-if="viewUserData.type === 'admin'" class="list-group-item d-flex justify-content-between align-items-center">
                          <strong>Employee ID:</strong>
                          <span class="value-text">{{ viewUserData.employee_id || 'Not provided' }}</span>
                        </li>
                        <li v-if="viewUserData.type === 'admin'" class="list-group-item d-flex justify-content-between align-items-center">
                          <strong>Position:</strong>
                          <span class="value-text">{{ viewUserData.position || 'Not provided' }}</span>
                        </li>
                        <li v-if="viewUserData.type === 'admin'" class="list-group-item d-flex justify-content-between align-items-center">
                          <strong>Department:</strong>
                          <span class="value-text">{{ viewUserData.department || 'Not provided' }}</span>
                        </li>
                        <li v-if="viewUserData.type === 'admin'" class="list-group-item d-flex justify-content-between align-items-center">
                          <strong>Hire Date:</strong>
                          <span class="value-text">{{ viewUserData.hire_date ? formatDate(viewUserData.hire_date) : 'Not provided' }}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <!-- Contact Information -->
                <div class="col-md-6 mb-4">
                  <div class="card h-100">
                    <div class="card-header">
                      <h6 class="mb-0">
                        <i class="fas fa-address-book me-2"></i>
                        Contact Information
                      </h6>
                    </div>
                    <div class="card-body">
                      <ul class="list-group list-group-flush">
                        <li class="list-group-item d-flex justify-content-between align-items-center">
                          <strong>Email:</strong>
                          <span class="value-text">{{ viewUserData.email || 'Not provided' }}</span>
                        </li>
                        <li class="list-group-item d-flex justify-content-between align-items-center">
                          <strong>Phone:</strong>
                          <span class="value-text">{{ viewUserData.phone_number || 'Not provided' }}</span>
                        </li>
                        <li v-if="viewUserData.type === 'client'" class="list-group-item d-flex justify-content-between align-items-start">
                          <strong>Address:</strong>
                          <span class="value-text text-end">{{ getFullAddress(viewUserData) }}</span>
                        </li>
                        <li v-if="viewUserData.type === 'client'" class="list-group-item d-flex justify-content-between align-items-center">
                          <strong>Years of Residency:</strong>
                          <span class="value-text">{{ getResidencyDuration(viewUserData) }}</span>
                        </li>
                        
                        <!-- I will comment email and phone number verification since this is archive view -->
                        <!-- <li v-if="viewUserData.type === 'client'" class="list-group-item d-flex justify-content-between align-items-center">
                          <strong>Email Verified:</strong>
                          <span class="value-text">
                            <span :class="viewUserData.email_verified ? 'badge bg-success' : 'badge bg-warning'">
                              {{ viewUserData.email_verified ? 'Yes' : 'No' }}
                            </span>
                          </span>
                        </li>
                        <li v-if="viewUserData.type === 'client'" class="list-group-item d-flex justify-content-between align-items-center">
                          <strong>Phone Verified:</strong>
                          <span class="value-text">
                            <span :class="viewUserData.phone_verified ? 'badge bg-success' : 'badge bg-warning'">
                              {{ viewUserData.phone_verified ? 'Yes' : 'No' }}
                            </span>
                          </span>
                        </li> -->
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <!-- I will comment this -->
              <!-- Client Verification Status (only for clients) -->
              <!-- <div v-if="viewUserData.type === 'client'" class="row mb-4">
                <div class="col-12">
                  <div class="card">
                    <div class="card-header">
                      <h6 class="mb-0">
                        <i class="fas fa-shield-alt me-2"></i>
                        Verification Status
                      </h6>
                    </div>
                    <div class="card-body">
                      <ul class="list-group list-group-flush">
                        <li class="list-group-item d-flex justify-content-between align-items-center">
                          <strong>Profile Verified:</strong>
                          <span class="value-text">
                            <span :class="viewUserData.is_verified ? 'badge bg-success' : 'badge bg-warning'">
                              {{ viewUserData.is_verified ? 'Verified' : 'Pending' }}
                            </span>
                          </span>
                        </li>
                        <li v-if="viewUserData.verified_by" class="list-group-item d-flex justify-content-between align-items-center">
                          <strong>Verified By:</strong>
                          <span class="value-text">Admin ID: {{ viewUserData.verified_by }}</span>
                        </li>
                        <li v-if="viewUserData.verified_at" class="list-group-item d-flex justify-content-between align-items-center">
                          <strong>Verified At:</strong>
                          <span class="value-text">{{ formatDate(viewUserData.verified_at) }}</span>
                        </li>
                        <li class="list-group-item d-flex justify-content-between align-items-center">
                          <strong>Residency Verified:</strong>
                          <span class="value-text">
                            <span :class="viewUserData.residency_verified ? 'badge bg-success' : 'badge bg-warning'">
                              {{ viewUserData.residency_verified ? 'Verified' : 'Pending' }}
                            </span>
                          </span>
                        </li>
                        <li v-if="viewUserData.residency_verified_by" class="list-group-item d-flex justify-content-between align-items-center">
                          <strong>Residency Verified By:</strong>
                          <span class="value-text">Admin ID: {{ viewUserData.residency_verified_by }}</span>
                        </li>
                        <li v-if="viewUserData.residency_verified_at" class="list-group-item d-flex justify-content-between align-items-center">
                          <strong>Residency Verified At:</strong>
                          <span class="value-text">{{ formatDate(viewUserData.residency_verified_at) }}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div> -->

              <!-- Account Status -->
              <div class="card">
                <div class="card-header">
                  <h6 class="mb-0">
                    <i class="fas fa-cogs me-2"></i>
                    Account Status
                  </h6>
                </div>
                <div class="card-body">
                  <ul class="list-group list-group-flush">
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                      <strong>Account Created:</strong>
                      <span class="value-text">{{ formatDate(viewUserData.created_at) }}</span>
                    </li>
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                      <strong>Last Updated:</strong>
                      <span class="value-text">{{ formatDate(viewUserData.updated_at) }}</span>
                    </li>
                    <li v-if="viewUserData.last_login" class="list-group-item d-flex justify-content-between align-items-center">
                      <strong>Last Login:</strong>
                      <span class="value-text">{{ formatDate(viewUserData.last_login) }}</span>
                    </li>
                    <li v-if="viewUserData.password_changed_at" class="list-group-item d-flex justify-content-between align-items-center">
                      <strong>Password Changed:</strong>
                      <span class="value-text">{{ formatDate(viewUserData.password_changed_at) }}</span>
                    </li>
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                      <strong>Archived Date:</strong>
                      <span class="value-text">{{ formatDate(viewUserData.updated_at) }}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div v-else class="text-center">
              <p>No user data to display.</p>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
              <i class="fas fa-times me-1"></i>
              Close
            </button>
            <button type="button" class="btn btn-success" @click="restoreUser(viewUserData)">
              <i class="fas fa-undo me-1"></i>
              Restore User
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AdminHeader from './AdminHeader.vue';
import AdminSidebar from './AdminSidebar.vue';
import userManagementService from '@/services/userManagementService';
import { Modal } from 'bootstrap';

export default {
  name: 'AdminArchive',
  components: {
    AdminHeader,
    AdminSidebar
  },
  data() {
    return {
      // UI State
      sidebarCollapsed: false,
      showUserDropdown: false,
      activeMenu: 'archive',
      loading: false,

      // User Data
      archivedUsers: [],
      viewUserData: null,

      // Filters and Search
      searchQuery: '',
      currentPage: 1,
      itemsPerPage: 10,

      // Admin Data
      adminData: null
    };
  },
  computed: {
    filteredUsers() {
      let filtered = [...this.archivedUsers];

      // Apply search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(user =>
          user.full_name?.toLowerCase().includes(query) ||
          user.email?.toLowerCase().includes(query) ||
          user.username?.toLowerCase().includes(query) ||
          user.type?.toLowerCase().includes(query)
        );
      }

      return filtered;
    },

    paginatedUsers() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredUsers.slice(start, end);
    },

    totalPages() {
      return Math.ceil(this.filteredUsers.length / this.itemsPerPage);
    },

    visiblePages() {
      const pages = [];
      const start = Math.max(1, this.currentPage - 2);
      const end = Math.min(this.totalPages, this.currentPage + 2);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      return pages;
    }
  },

  watch: {
    searchQuery() {
      this.currentPage = 1;
    },
    itemsPerPage() {
      this.currentPage = 1;
    }
  },

  async mounted() {
    await this.loadArchivedUsers();
  },

  methods: {
    // Load archived users
    async loadArchivedUsers() {
      try {
        this.loading = true;
        const response = await userManagementService.getArchivedUsers(1, 100, this.searchQuery);
        
        if (response.success) {
          this.archivedUsers = response.data.map(user => ({
            ...user,
            full_name: `${user.first_name || ''} ${user.last_name || ''}`.trim()
          }));
        } else {
          this.showToast('error', response.message || 'Failed to load archived users');
        }
      } catch (error) {
        console.error('Error loading archived users:', error);
        this.showToast('error', 'Failed to load archived users');
      } finally {
        this.loading = false;
      }
    },

    // View user details
    async viewUser(user) {
      try {
        // Fetch detailed user data from the API
        const response = await userManagementService.getUser(user.id);
        if (response.success) {
          this.viewUserData = userManagementService.formatUserData(response.data);
          const modal = new Modal(document.getElementById('viewUserModal'));
          modal.show();
        } else {
          throw new Error(response.message || 'Failed to load user details');
        }
      } catch (error) {
        console.error('Error viewing user:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to load user details';
        this.showToast('error', errorMessage);
      }
    },

    // Restore user (reactivate)
    async restoreUser(user) {
      if (!confirm(`Are you sure you want to restore ${user.full_name}?`)) {
        return;
      }

      try {
        const response = await userManagementService.restoreUser(user.id);

        if (response.success) {
          this.showToast('success', `${user.full_name} has been restored successfully`);

          // Remove user from archived list
          this.archivedUsers = this.archivedUsers.filter(u => u.id !== user.id);

          // Close modal if open
          const modal = Modal.getInstance(document.getElementById('viewUserModal'));
          if (modal) {
            modal.hide();
          }
        } else {
          this.showToast('error', response.message || 'Failed to restore user');
        }
      } catch (error) {
        console.error('Error restoring user:', error);
        this.showToast('error', 'Failed to restore user');
      }
    },

    // Pagination
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },

    // UI Event Handlers
    handleSidebarToggle() {
      this.sidebarCollapsed = !this.sidebarCollapsed;
    },

    handleUserDropdownToggle() {
      this.showUserDropdown = !this.showUserDropdown;
    },

    handleMenuAction(action) {
      if (action === 'archive') {
        // Already on archive page
        return;
      }
      
      // Navigate to other pages
      const routes = {
        'dashboard': '/admin/dashboard',
        'users': '/admin/users',
        'requests': '/admin/requests'
      };

      if (routes[action]) {
        this.$router.push(routes[action]);
      }
    },

    handleLogout() {
      // Implement logout logic
      this.$router.push('/admin/login');
    },

    // Utility methods
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

    showToast(type, message) {
      // Simple alert for now - can be replaced with proper toast library
      if (type === 'success') {
        alert(`✅ ${message}`);
      } else if (type === 'error') {
        alert(`❌ ${message}`);
      } else {
        alert(`ℹ️ ${message}`);
      }
    },

    // Get civil status label
    getCivilStatusLabel(civilStatusId) {
      const labels = {
        1: 'Single',
        2: 'Married',
        3: 'Widowed',
        4: 'Divorced',
        5: 'Separated'
      };
      return labels[civilStatusId] || 'Not specified';
    },

    // Get full address
    getFullAddress(user) {
      if (!user) return 'Not provided';

      const addressParts = [
        user.house_number,
        user.street,
        user.subdivision,
        user.barangay,
        user.city_municipality,
        user.province
      ].filter(part => part && part.trim() !== '');

      return addressParts.length > 0 ? addressParts.join(', ') : 'Not provided';
    },

    // Get residency duration
    getResidencyDuration(user) {
      if (!user) return 'Not provided';

      const years = user.years_of_residency || 0;
      const months = user.months_of_residency || 0;

      if (years === 0 && months === 0) return 'Not provided';

      const parts = [];
      if (years > 0) parts.push(`${years} year${years !== 1 ? 's' : ''}`);
      if (months > 0) parts.push(`${months} month${months !== 1 ? 's' : ''}`);

      return parts.join(', ');
    }
  }
};
</script>

<style scoped>
.admin-archive {
  min-height: 100vh;
  background-color: #f8f9fc;
}

.dashboard-container {
  display: flex;
  min-height: calc(100vh - 70px); /* Adjust based on header height */
}

.main-content {
  padding: 100px 20px 20px 20px; /* Combined padding-top with other paddings */
  flex: 1;
  margin-left: 250px;
  transition: margin-left 0.3s ease;
}

.main-content.sidebar-collapsed {
  margin-left: 80px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.table th {
  border-top: none;
  font-weight: 600;
  color: #5a5c69;
  background-color: #f8f9fc;
}

.table td {
  vertical-align: middle;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.badge {
  font-size: 0.75rem;
}

@media (max-width: 768px) {
  .main-content,
  .main-content.sidebar-collapsed {
    margin-left: 0;
  }
}

.value-text {
  word-break: break-word;
  max-width: 70%;
  text-align: right;
}
</style>