<template>
  <div class="admin-dashboard">
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
        :totalUsers="stats.totalUsers"
        :pendingRequests="stats.activeRequests"
        :totalReports="stats.completedToday"
        @menu-change="handleMenuChange"
        @logout="handleLogout"
        @toggle-sidebar="handleSidebarToggle"
      />
      <main class="main-content" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
        <div class="container-fluid p-4">

          <!-- I comment these buttosn because I dont need it -->
          <!-- <div class="row mb-4">
            <div class="col-12">
              <div class="d-flex justify-content-between align-items-center flex-wrap">

                <div class="d-flex gap-2">
                  <button class="btn btn-outline-success btn-sm" @click="refreshDashboard" :disabled="loading">
                    <i class="fas fa-sync-alt me-1" :class="{ 'fa-spin': loading }"></i>
                    Refresh
                  </button>
                  <div class="dropdown">
                    <button class="btn btn-success btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown">
                      <i class="fas fa-plus me-1"></i>
                      Quick Actions
                    </button>
                    <ul class="dropdown-menu">
                      <li><a class="dropdown-item" href="#" @click="navigateTo('/admin/users')">
                        <i class="fas fa-user-plus me-2"></i>Add User
                      </a></li>
                      <li><a class="dropdown-item" href="#" @click="navigateTo('/admin/requests')">
                        <i class="fas fa-file-alt me-2"></i>New Request
                      </a></li>
                      <li><hr class="dropdown-divider"></li>
                      <li><a class="dropdown-item" href="#" @click="navigateTo('/admin/reports')">
                        <i class="fas fa-chart-bar me-2"></i>Generate Report
                      </a></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div> -->

          <!-- I comment these because I dont need it -->
          <!-- Enhanced Request Management Dashboard Stats -->
          <!-- <div class="row mb-4">
            <div class="col-xl-3 col-md-6 mb-4">
              <div class="card border-left-primary shadow h-100 py-2 stat-card" @click="navigateTo('/admin/requests')">
                <div class="card-body">
                  <div class="row no-gutters align-items-center">
                    <div class="col mr-2">
                      <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">
                        Total Requests
                      </div>
                      <div class="h5 mb-0 font-weight-bold text-gray-800">{{ stats.totalRequests || 0 }}</div>
                      <div class="text-xs text-muted mt-1">
                        <i class="fas fa-file-alt text-primary me-1"></i>
                        All document requests
                      </div>
                    </div>
                    <div class="col-auto">
                      <div class="icon-circle bg-primary">
                        <i class="fas fa-file-alt text-white"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
     
            <div class="col-xl-3 col-md-6 mb-4">
              <div class="card border-left-warning shadow h-100 py-2 stat-card" @click="filterRequestsByStatus('pending')">
                <div class="card-body">
                  <div class="row no-gutters align-items-center">
                    <div class="col mr-2">
                      <div class="text-xs font-weight-bold text-warning text-uppercase mb-1">
                        Pending Requests
                      </div>
                      <div class="h5 mb-0 font-weight-bold text-gray-800">{{ stats.pendingRequests || 0 }}</div>
                      <div class="text-xs text-muted mt-1">
                        <i class="fas fa-clock text-warning me-1"></i>
                        <span class="badge badge-danger ms-1" v-if="stats.urgentRequests > 0">{{ stats.urgentRequests }} urgent</span>
                        <span v-else>Awaiting review</span>
                      </div>
                    </div>
                    <div class="col-auto">
                      <div class="icon-circle bg-warning">
                        <i class="fas fa-clock text-white"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="col-xl-3 col-md-6 mb-4">
              <div class="card border-left-info shadow h-100 py-2 stat-card" @click="filterRequestsByStatus('processing')">
                <div class="card-body">
                  <div class="row no-gutters align-items-center">
                    <div class="col mr-2">
                      <div class="text-xs font-weight-bold text-info text-uppercase mb-1">
                        Processing
                      </div>
                      <div class="h5 mb-0 font-weight-bold text-gray-800">{{ stats.processingRequests || 0 }}</div>
                      <div class="text-xs text-muted mt-1">
                        <i class="fas fa-cog text-info me-1"></i>
                        Currently being processed
                      </div>
                    </div>
                    <div class="col-auto">
                      <div class="icon-circle bg-info">
                        <i class="fas fa-cog text-white"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="col-xl-3 col-md-6 mb-4">
              <div class="card border-left-success shadow h-100 py-2 stat-card" @click="filterRequestsByDate('today')">
                <div class="card-body">
                  <div class="row no-gutters align-items-center">
                    <div class="col mr-2">
                      <div class="text-xs font-weight-bold text-success text-uppercase mb-1">
                        Completed Today
                      </div>
                      <div class="h5 mb-0 font-weight-bold text-gray-800">{{ stats.todayRequests || 0 }}</div>
                      <div class="text-xs text-muted mt-1">
                        <i class="fas fa-check-circle text-success me-1"></i>
                        ₱{{ (stats.todayRevenue || 0).toLocaleString() }} revenue
                      </div>
                    </div>
                    <div class="col-auto">
                      <div class="icon-circle bg-success">
                        <i class="fas fa-check-circle text-white"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div> -->

          <!-- Request Management Quick Actions -->
          <div class="row mb-4">
            <div class="col-12">
              <div class="card shadow">
                <div class="card-header py-3 d-flex justify-content-between align-items-center">
                  <h6 class="m-0 font-weight-bold text-primary">
                    <i class="fas fa-tasks me-2"></i>
                    Request Management Center
                  </h6>

              <!-- I comment these buttosn because I dont need it -->
                  <!-- <div class="d-flex gap-2">
                    <button class="btn btn-outline-primary btn-sm" @click="refreshDashboard" :disabled="loading">
                      <i class="fas fa-sync-alt me-1" :class="{ 'fa-spin': loading }"></i>
                      Refresh
                    </button>
                    <div class="dropdown">
                      <button class="btn btn-primary btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown">
                        <i class="fas fa-bolt me-1"></i>
                        Quick Actions
                      </button>
                      <ul class="dropdown-menu">
                        <li><a class="dropdown-item" href="#" @click="navigateToRequests('pending')">
                          <i class="fas fa-clock me-2 text-warning"></i>Review Pending Requests
                        </a></li>
                        <li><a class="dropdown-item" href="#" @click="navigateToRequests('urgent')">
                          <i class="fas fa-exclamation-triangle me-2 text-danger"></i>Handle Urgent Requests
                        </a></li>
                        <li><a class="dropdown-item" href="#" @click="navigateToRequests('processing')">
                          <i class="fas fa-cog me-2 text-info"></i>Monitor Processing
                        </a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item" href="#" @click="navigateTo('/admin/reports')">
                          <i class="fas fa-chart-bar me-2 text-success"></i>Generate Reports
                        </a></li>
                      </ul>
                    </div>
                  </div> -->
                </div>
                <div class="card-body">
                  <div class="row">
                    <!-- i comment the priority request for now -->
                    <!-- Priority Requests -->
                    <!-- <div class="col-lg-4 mb-3">
                      <div class="border rounded p-3 h-100">
                        <h6 class="text-danger mb-3">
                          <i class="fas fa-exclamation-triangle me-2"></i>
                          Priority Requests
                        </h6>
                        <div v-if="priorityRequests.length === 0" class="text-center text-muted py-3">
                          <i class="fas fa-check-circle fa-2x mb-2 text-success"></i>
                          <p class="mb-0">No urgent requests</p>
                        </div>
                        <div v-else>
                          <div v-for="request in priorityRequests.slice(0, 3)" :key="request.id"
                               class="d-flex justify-content-between align-items-center mb-2 p-2 bg-light rounded">
                            <div>
                              <small class="text-muted">{{ request.request_number }}</small>
                              <div class="fw-bold">{{ request.document_type }}</div>
                              <small class="text-danger">{{ request.priority }} Priority</small>
                            </div>
                            <button class="btn btn-sm btn-outline-primary" @click="viewRequestDetails(request.id)">
                              <i class="fas fa-eye"></i>
                            </button>
                          </div>
                          <div v-if="priorityRequests.length > 3" class="text-center mt-2">
                            <button class="btn btn-sm btn-outline-danger" @click="navigateToRequests('urgent')">
                              View {{ priorityRequests.length - 3 }} more urgent
                            </button>
                          </div>
                        </div>
                      </div>
                    </div> -->

                    <!-- Recent Submissions -->
                    <div class="col-lg-4 mb-3">
                      <div class="border rounded p-3 h-100">
                        <h6 class="text-info mb-3">
                          <i class="fas fa-clock me-2"></i>
                          Recent Submissions
                        </h6>
                        <div v-if="recentRequests.length === 0" class="text-center text-muted py-3">
                          <i class="fas fa-inbox fa-2x mb-2 text-gray-300"></i>
                          <p class="mb-0">No recent submissions</p>
                        </div>
                        <div v-else>
                          <div v-for="request in recentRequests.slice(0, 3)" :key="request.id"
                               class="d-flex justify-content-between align-items-center mb-2 p-2 bg-light rounded">
                            <div>
                              <small class="text-muted">{{ formatTimeAgo(request.requested_at) }}</small>
                              <div class="fw-bold">{{ request.document_type }}</div>
                              <small class="text-info">{{ request.client_name }}</small>
                            </div>
                            <button class="btn btn-sm btn-outline-primary" @click="viewRequestDetails(request.id)">
                              <i class="fas fa-eye"></i>
                            </button>
                          </div>
                          <div v-if="recentRequests.length > 3" class="text-center mt-2">
                            <button class="btn btn-sm btn-outline-info" @click="navigateToRequests('recent')">
                              View {{ recentRequests.length - 3 }} more recent
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Processing Overview -->
                    <div class="col-lg-4 mb-3">
                      <div class="border rounded p-3 h-100">
                        <h6 class="text-success mb-3">
                          <i class="fas fa-cogs me-2"></i>
                          Processing Overview
                        </h6>
                        <div class="mb-2">
                          <div class="d-flex justify-content-between">
                            <span class="small">Pending Review</span>
                            <span class="badge bg-warning">{{ stats.pendingRequests || 0 }}</span>
                          </div>
                          <div class="progress mb-2" style="height: 4px;">
                            <div class="progress-bar bg-warning" :style="{ width: getProgressPercentage('pending') + '%' }"></div>
                          </div>
                        </div>
                        <div class="mb-2">
                          <div class="d-flex justify-content-between">
                            <span class="small">Processing</span>
                            <span class="badge bg-info">{{ stats.processingRequests || 0 }}</span>
                          </div>
                          <div class="progress mb-2" style="height: 4px;">
                            <div class="progress-bar bg-info" :style="{ width: getProgressPercentage('processing') + '%' }"></div>
                          </div>
                        </div>
                        <div class="mb-2">
                          <div class="d-flex justify-content-between">
                            <span class="small">Completed</span>
                            <span class="badge bg-success">{{ stats.completedRequests || 0 }}</span>
                          </div>
                          <div class="progress mb-2" style="height: 4px;">
                            <div class="progress-bar bg-success" :style="{ width: getProgressPercentage('completed') + '%' }"></div>
                          </div>
                        </div>
                        <div class="text-center mt-3">
                          <button class="btn btn-sm btn-success" @click="navigateTo('/admin/requests')">
                            <i class="fas fa-list me-1"></i>
                            View All Requests
                          </button>
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
import unifiedAuthService from '@/services/unifiedAuthService';
import adminDocumentService from '@/services/adminDocumentService';
import notificationService from '@/services/notificationService';
import AdminHeader from './AdminHeader.vue';
import AdminSidebar from './AdminSidebar.vue';

export default {
  name: 'AdminDashboard',
  components: {
    AdminHeader,
    AdminSidebar
  },
  data() {
    return {
      loading: true,
      // UI State
      sidebarCollapsed: false,
      showUserDropdown: false,
      isMobile: false,
      adminData: null,
      // Dashboard Data
      stats: {
        totalRequests: 0,
        pendingRequests: 0,
        approvedRequests: 0,
        completedRequests: 0,
        processingRequests: 0,
        urgentRequests: 0,
        totalRevenue: 0,
        todayRequests: 0,
        todayRevenue: 0,
        totalUsers: 0,
        activeRequests: 0,
        completedToday: 0,
        pendingApproval: 0
      },
      recentActivity: [],
      priorityRequests: [],
      recentRequests: [],
      errorMessage: ''
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

    // Load dashboard data
    await this.loadDashboardData();

    // Initialize real-time features
    this.initializeRealTimeFeatures();
  },

  beforeUnmount() {
    if (this.handleResize) {
      window.removeEventListener('resize', this.handleResize);
    }
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }

    // Clean up real-time features
    this.cleanupRealTimeFeatures();
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

      // Load saved sidebar state (only on desktop)
      if (!this.isMobile) {
        const saved = localStorage.getItem('adminSidebarCollapsed');
        this.sidebarCollapsed = saved ? JSON.parse(saved) : false;
      } else {
        this.sidebarCollapsed = true; // Always collapsed on mobile
      }

      // Setup resize listener
      this.handleResize = () => {
        const wasMobile = this.isMobile;
        this.isMobile = window.innerWidth <= 768;

        if (this.isMobile && !wasMobile) {
          this.sidebarCollapsed = true; // Collapse when switching to mobile
        } else if (!this.isMobile && wasMobile) {
          // Restore saved state when switching to desktop
          const saved = localStorage.getItem('adminSidebarCollapsed');
          this.sidebarCollapsed = saved ? JSON.parse(saved) : false;
        }
      };
      window.addEventListener('resize', this.handleResize);
    },

    // Sidebar toggle
    handleSidebarToggle() {
      this.sidebarCollapsed = !this.sidebarCollapsed;
      localStorage.setItem('adminSidebarCollapsed', JSON.stringify(this.sidebarCollapsed));
    },

    // Menu navigation
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

      // Close sidebar on mobile after navigation
      if (this.isMobile) {
        this.sidebarCollapsed = true;
      }

      if (routes[menu]) {
        this.$router.push(routes[menu]);
      }
    },

    // User dropdown toggle
    handleUserDropdownToggle() {
      this.showUserDropdown = !this.showUserDropdown;
    },

    // Menu actions
    handleMenuAction(action) {
      if (action === 'profile') {
        this.$router.push('/admin/profile');
      } else if (action === 'settings') {
        this.$router.push('/admin/settings');
      }
      this.showUserDropdown = false;
    },

    // Close mobile sidebar
    closeMobileSidebar() {
      if (this.isMobile) {
        this.sidebarCollapsed = true;
      }
    },

    // Logout
    handleLogout() {
      unifiedAuthService.logout();
      this.$router.push('/login');
    },

    // Load dashboard data
    async loadDashboardData() {
      this.loading = true;

      try {
        // Load admin profile
        await this.loadAdminProfile();

        // Load dashboard statistics
        await this.loadDashboardStats();

        // Load recent activity
        await this.loadRecentActivity();

      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        const errorData = unifiedAuthService.parseError(error);
        this.errorMessage = errorData.message || 'Failed to load dashboard data';

        // If unauthorized, redirect to login
        if (errorData.status === 401) {
          unifiedAuthService.logout();
          this.$router.push('/login');
        }
      } finally {
        this.loading = false;
      }
    },

    // Load admin profile
    async loadAdminProfile() {
      try {
        const currentUser = unifiedAuthService.getCurrentUser();
        if (currentUser && currentUser.profile) {
          this.adminData = currentUser.profile;
        } else {
          // Fallback to basic user data
          this.adminData = {
            first_name: currentUser?.username || 'Admin',
            role: currentUser?.role || 'admin'
          };
        }
      } catch (error) {
        console.error('Failed to load admin profile:', error);
        const currentUser = unifiedAuthService.getCurrentUser();
        this.adminData = {
          first_name: currentUser?.username || 'Admin',
          role: currentUser?.role || 'admin'
        };
      }
    },



    // Load dashboard statistics
    async loadDashboardStats() {
      try {
        const response = await adminDocumentService.getDashboardStats();
        if (response.success) {
          // Update stats with enhanced request management data
          this.stats = {
            totalRequests: response.data.totalRequests || 0,
            pendingRequests: response.data.pendingRequests || 0,
            approvedRequests: response.data.approvedRequests || 0,
            completedRequests: response.data.completedRequests || 0,
            processingRequests: response.data.processingRequests || 0,
            urgentRequests: response.data.urgentRequests || 0,
            totalRevenue: response.data.totalRevenue || 0,
            todayRequests: response.data.todayRequests || 0,
            todayRevenue: response.data.todayRevenue || 0,
            // Keep legacy fields for backward compatibility
            totalUsers: response.data.totalUsers || 0,
            activeRequests: response.data.pendingRequests || 0,
            completedToday: response.data.todayRequests || 0,
            pendingApproval: response.data.pendingRequests || 0
          };
        }

        // Load priority and recent requests
        await this.loadPriorityRequests();
        await this.loadRecentRequests();
      } catch (error) {
        console.error('Failed to load dashboard stats:', error);
        const errorData = adminDocumentService.parseError(error);
        this.errorMessage = errorData.message || 'Failed to load dashboard statistics';
      }
    },

    // Load priority requests
    async loadPriorityRequests() {
      try {
        const response = await adminDocumentService.getAllRequests({
          priority: 'high',
          limit: 5,
          status: 'pending'
        });
        if (response.success) {
          this.priorityRequests = response.data.requests || [];
        }
      } catch (error) {
        console.error('Failed to load priority requests:', error);
        this.priorityRequests = [];
      }
    },

    // Load recent requests
    async loadRecentRequests() {
      try {
        const response = await adminDocumentService.getAllRequests({
          limit: 5,
          sort: 'requested_at',
          order: 'desc'
        });
        if (response.success) {
          this.recentRequests = response.data.requests || [];
        }
      } catch (error) {
        console.error('Failed to load recent requests:', error);
        this.recentRequests = [];
      }
    },

    // Load recent activity
    async loadRecentActivity() {
      try {
        const response = await adminDocumentService.getRecentActivity(10);
        if (response.success) {
          this.recentActivity = response.data || [];
        }
      } catch (error) {
        console.error('Failed to load recent activity:', error);
        const errorData = adminDocumentService.parseError(error);
        console.error('Recent activity error details:', errorData);
        this.recentActivity = [];
      }
    },

    // Navigate to specific route
    navigateTo(route) {
      try {
        console.log('Navigating to:', route);
        this.$router.push(route);
      } catch (error) {
        console.error('Navigation error:', error);
        this.errorMessage = 'Navigation failed. Please try again.';
      }
    },

    // Format date for display
    formatDate(dateString) {
      if (!dateString) return '';

      const date = new Date(dateString);
      const now = new Date();
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));

      if (diffInMinutes < 1) {
        return 'Just now';
      } else if (diffInMinutes < 60) {
        return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
      } else if (diffInMinutes < 1440) {
        const hours = Math.floor(diffInMinutes / 60);
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
      } else {
        const days = Math.floor(diffInMinutes / 1440);
        return `${days} day${days > 1 ? 's' : ''} ago`;
      }
    },

    // Format time for display
    formatTime(dateString) {
      if (!dateString) return '';

      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    },

    // Refresh dashboard data
    async refreshDashboard() {
      await this.loadDashboardData();
    },

    // Export activity logs
    exportActivity() {
      // Implement export functionality
      console.log('Exporting activity logs...');
      // This would typically generate and download a CSV/Excel file
    },

    // Get activity icon based on type
    getActivityIcon(type) {
      const icons = {
        'user_registration': 'fas fa-user-plus',
        'document_request': 'fas fa-file-alt',
        'document_approved': 'fas fa-check-circle',
        'document_rejected': 'fas fa-times-circle',
        'system_update': 'fas fa-cog',
        'login': 'fas fa-sign-in-alt',
        'logout': 'fas fa-sign-out-alt',
        'default': 'fas fa-info-circle'
      };
      return icons[type] || icons.default;
    },

    // Get activity icon circle class based on type
    getActivityIconClass(type) {
      const classes = {
        'user_registration': 'bg-success',
        'document_request': 'bg-primary',
        'document_approved': 'bg-success',
        'document_rejected': 'bg-danger',
        'system_update': 'bg-warning',
        'login': 'bg-info',
        'logout': 'bg-secondary',
        'default': 'bg-primary'
      };
      return classes[type] || classes.default;
    },

    // Get activity badge class based on status
    getActivityBadgeClass(status) {
      const classes = {
        'completed': 'badge-success',
        'pending': 'badge-warning',
        'failed': 'badge-danger',
        'in_progress': 'badge-info',
        'default': 'badge-secondary'
      };
      return classes[status?.toLowerCase()] || classes.default;
    },

    // Enhanced Request Management Methods

    // Format time ago for display
    formatTimeAgo(dateString) {
      if (!dateString) return '';

      const date = new Date(dateString);
      const now = new Date();
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));

      if (diffInMinutes < 1) {
        return 'Just now';
      } else if (diffInMinutes < 60) {
        return `${diffInMinutes}m ago`;
      } else if (diffInMinutes < 1440) {
        const hours = Math.floor(diffInMinutes / 60);
        return `${hours}h ago`;
      } else {
        const days = Math.floor(diffInMinutes / 1440);
        return `${days}d ago`;
      }
    },

    // Filter requests by status and navigate
    filterRequestsByStatus(status) {
      this.$router.push({
        path: '/admin/requests',
        query: { status: status }
      });
    },

    // Filter requests by date and navigate
    filterRequestsByDate(period) {
      const query = {};
      const today = new Date();

      if (period === 'today') {
        query.date_from = today.toISOString().split('T')[0];
        query.date_to = today.toISOString().split('T')[0];
      }

      this.$router.push({
        path: '/admin/requests',
        query: query
      });
    },

    // Navigate to requests with specific filters
    navigateToRequests(filter) {
      const query = {};

      switch (filter) {
        case 'pending':
          query.status = 'pending';
          break;
        case 'urgent':
          query.priority = 'high';
          query.status = 'pending';
          break;
        case 'processing':
          query.status = 'processing';
          break;
        case 'recent':
          query.sort = 'requested_at';
          query.order = 'desc';
          break;
      }

      this.$router.push({
        path: '/admin/requests',
        query: query
      });
    },

    // View request details
    viewRequestDetails(requestId) {
      this.$router.push({
        path: '/admin/requests',
        query: { view: requestId }
      });
    },

    // Get progress percentage for processing overview
    getProgressPercentage(type) {
      const total = this.stats.totalRequests || 1; // Avoid division by zero

      switch (type) {
        case 'pending':
          return Math.round((this.stats.pendingRequests / total) * 100);
        case 'processing':
          return Math.round((this.stats.processingRequests / total) * 100);
        case 'completed':
          return Math.round((this.stats.completedRequests / total) * 100);
        default:
          return 0;
      }
    },

    // Format currency for display
    formatCurrency(amount) {
      if (!amount) return '0.00';
      return parseFloat(amount).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    },

    // Real-time features
    async initializeRealTimeFeatures() {
      console.log('Initializing real-time features for AdminDashboard');

      try {
        // Initialize notification service
        await notificationService.init('admin');

        // Listen for dashboard-relevant notifications
        notificationService.on('notification', this.handleRealTimeNotification);
        notificationService.on('new_request', this.handleNewRequest);
        notificationService.on('request_status_changed', this.handleStatusChange);
        notificationService.on('dashboard_update', this.handleDashboardUpdate);
      } catch (error) {
        console.error('Failed to initialize real-time features:', error);
      }
    },

    cleanupRealTimeFeatures() {
      console.log('Cleaning up real-time features for AdminDashboard');

      // Remove notification listeners
      notificationService.off('notification', this.handleRealTimeNotification);
      notificationService.off('new_request', this.handleNewRequest);
      notificationService.off('request_status_changed', this.handleStatusChange);
      notificationService.off('dashboard_update', this.handleDashboardUpdate);

      // Cleanup (simplified)
      notificationService.cleanup();
    },

    handleRealTimeNotification(notification) {
      console.log('Dashboard received real-time notification:', notification);

      // Handle different notification types
      switch (notification.type) {
        case 'new_request':
          this.handleNewRequest(notification.data);
          break;
        case 'request_status_changed':
          this.handleStatusChange(notification.data);
          break;
        case 'dashboard_update':
          this.handleDashboardUpdate(notification.data);
          break;
        default:
          console.log('Unhandled notification type:', notification.type);
      }
    },

    handleNewRequest(data) {
      console.log('New request received on dashboard:', data);

      // Update statistics
      this.stats.totalRequests++;
      this.stats.pendingRequests++;
      this.stats.todayRequests++;

      // Refresh dashboard data to get accurate counts
      this.loadDashboardStats();
      this.loadRecentActivity();
      this.loadRecentRequests();
    },

    handleStatusChange(data) {
      console.log('Request status changed on dashboard:', data);

      // Refresh dashboard statistics and recent activity
      this.loadDashboardStats();
      this.loadRecentActivity();
      this.loadPriorityRequests();
      this.loadRecentRequests();
    },

    handleDashboardUpdate(data) {
      console.log('Dashboard update received:', data);

      // Refresh all dashboard data
      this.loadDashboardData();
    }

  },

  // Auto-refresh dashboard data every 5 minutes
  created() {
    this.refreshInterval = setInterval(() => {
      this.loadDashboardStats();
      this.loadRecentActivity();
      this.loadPriorityRequests();
      this.loadRecentRequests();
    }, 5 * 60 * 1000); // 5 minutes
  }
};
</script>

<style scoped>
@import './css/adminDashboard.css';
</style>
