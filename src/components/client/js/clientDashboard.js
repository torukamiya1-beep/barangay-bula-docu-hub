import unifiedAuthService from '@/services/unifiedAuthService';
import documentRequestService from '@/services/documentRequestService';
import notificationService from '@/services/notificationService';
import ClientSidebar from '../ClientSidebar.vue';
import ClientHeader from '../ClientHeader.vue';
import HelpSupport from '../HelpSupport.vue';

export default {
  name: 'ClientDashboard',
  components: {
    ClientSidebar,
    ClientHeader,
    HelpSupport
  },
  data() {
    return {
      clientData: null,
      recentActivity: [],

      // UI State
      sidebarCollapsed: false,
      showUserDropdown: false,
      showNotifications: false,
      activeMenu: 'dashboard',

      // Dashboard Stats
      totalRequests: 0,
      pendingRequests: 0,
      completedRequests: 0,
      totalServices: 8,
      totalPaid: 0,
      notificationCount: 0,

      // Loading and Error States
      loading: true,
      error: null,
      dataRefreshInterval: null,

      // Performance optimization
      resizeTimeout: null,
      isMobile: false,

      // Real-time updates
      lastUpdated: null,
      autoRefresh: true,
      refreshInterval: 30000, // 30 seconds

      // Dashboard metrics for better UX
      dashboardMetrics: {
        averageProcessingTime: 0,
        successRate: 0,
        mostRequestedService: '',
        upcomingDeadlines: []
      },

      // Chart data
      monthlyActivity: [],
      requestsTrend: null,
      paymentsTrend: null,

      // Search and filter
      searchQuery: '',
      statusFilter: '',
      timeFilter: '',
      searchResults: [],
      allRequests: [],
      searchTimeout: null
    };
  },

  computed: {
    // Calculate percentages for progress bars
    pendingPercentage() {
      return this.totalRequests > 0 ? Math.round((this.pendingRequests / this.totalRequests) * 100) : 0;
    },

    completedPercentage() {
      return this.totalRequests > 0 ? Math.round((this.completedRequests / this.totalRequests) * 100) : 0;
    },

    // Get max value for bar chart scaling
    maxMonthlyValue() {
      return this.monthlyActivity.length > 0
        ? Math.max(...this.monthlyActivity.map(m => m.value))
        : 1;
    }
  },

  async mounted() {
    try {
      // Add dashboard layout class to body to prevent scrolling
      document.body.classList.add('dashboard-layout');

      // Security: Check if user is logged in and token is valid
      if (!unifiedAuthService.isLoggedIn() || unifiedAuthService.getUserType() !== 'client') {
        this.$router.push('/login');
        return;
      }

      // Security: Validate client data and sanitize
      const currentUser = unifiedAuthService.getCurrentUser();
      this.clientData = this.sanitizeClientData(currentUser);

      // Security: Check for session timeout
      if (this.isSessionExpired()) {
        this.handleSessionExpiry();
        return;
      }

      // Set initial sidebar state based on screen size
      this.handleResize();

      // Initialize notification service for real-time updates
      await this.initializeNotifications();

      // Load dashboard data
      await this.loadDashboardData();

      // Setup event listeners
      this.setupEventListeners();

      // Setup auto-refresh if enabled
      if (this.autoRefresh) {
        this.setupAutoRefresh();
      }

      this.loading = false;
    } catch (error) {
      console.error('Error initializing dashboard:', error);
      this.error = 'Failed to load dashboard. Please refresh the page.';
      this.loading = false;
    }
  },

  beforeUnmount() {
    // Remove dashboard layout class from body
    document.body.classList.remove('dashboard-layout');

    // Clean up event listeners
    this.removeEventListeners();

    // Clean up auto-refresh
    this.clearAutoRefresh();

    // Clean up notification service
    this.cleanupNotifications();

    // Clean up search timeout
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    // Clean up resize timeout
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }

    // Clean up data refresh interval
    if (this.dataRefreshInterval) {
      clearInterval(this.dataRefreshInterval);
    }
  },

  methods: {
    // Initialize notification service
    async initializeNotifications() {
      try {
        await notificationService.init('client');

        // Listen for real-time updates
        notificationService.on('notification', this.handleRealtimeNotification);
        notificationService.on('unread_count_update', this.updateNotificationCount);

        // Get initial notification count
        this.notificationCount = await notificationService.getUnreadCount();
      } catch (error) {
        console.error('Failed to initialize notifications:', error);
      }
    },

    // Clean up notification service
    cleanupNotifications() {
      notificationService.off('notification', this.handleRealtimeNotification);
      notificationService.off('unread_count_update', this.updateNotificationCount);
      notificationService.cleanup();
    },

    // Handle real-time notifications
    handleRealtimeNotification(notification) {
      // Update notification count
      this.notificationCount++;

      // Add to recent activity if relevant
      if (notification.type === 'document_status_update' ||
          notification.type === 'payment_received' ||
          notification.type === 'document_ready') {
        this.addToRecentActivity(notification);
      }

      // Refresh dashboard data for important updates
      if (notification.type === 'document_status_update') {
        this.refreshDashboardStats();
      }
    },

    // Update notification count
    updateNotificationCount(data) {
      this.notificationCount = data.count || 0;
    },

    // Add notification to recent activity
    addToRecentActivity(notification) {
      const activity = {
        id: Date.now(),
        title: notification.title,
        description: notification.message,
        time: 'Just now',
        icon: this.getActivityIcon(notification.type)
      };

      this.recentActivity.unshift(activity);

      // Keep only last 10 activities
      if (this.recentActivity.length > 10) {
        this.recentActivity = this.recentActivity.slice(0, 10);
      }
    },

    // Get icon for activity type
    getActivityIcon(type) {
      const iconMap = {
        'document_status_update': 'fas fa-file-alt text-info',
        'payment_received': 'fas fa-credit-card text-success',
        'document_ready': 'fas fa-check-circle text-success',
        'document_approved': 'fas fa-check-circle text-success',
        'document_rejected': 'fas fa-times-circle text-danger',
        'payment_required': 'fas fa-peso-sign text-warning'
      };
      return iconMap[type] || 'fas fa-bell text-info';
    },

    // Setup auto-refresh
    setupAutoRefresh() {
      this.dataRefreshInterval = setInterval(() => {
        this.refreshDashboardStats();
      }, this.refreshInterval);
    },

    // Clear auto-refresh
    clearAutoRefresh() {
      if (this.dataRefreshInterval) {
        clearInterval(this.dataRefreshInterval);
        this.dataRefreshInterval = null;
      }
    },

    // Setup event listeners
    setupEventListeners() {
      document.addEventListener('click', this.handleOutsideClick);
      window.addEventListener('resize', this.throttledResize);
      window.addEventListener('focus', this.handleWindowFocus);
    },

    // Remove event listeners
    removeEventListeners() {
      document.removeEventListener('click', this.handleOutsideClick);
      window.removeEventListener('resize', this.throttledResize);
      window.removeEventListener('focus', this.handleWindowFocus);
      if (this.resizeTimeout) {
        clearTimeout(this.resizeTimeout);
      }
    },

    // Handle window focus (refresh data when user returns)
    handleWindowFocus() {
      if (this.autoRefresh) {
        this.refreshDashboardStats();
      }
    },

    // Debounced resize handler for better performance
    debouncedResize() {
      if (this.resizeTimeout) {
        clearTimeout(this.resizeTimeout);
      }
      this.resizeTimeout = setTimeout(() => {
        this.handleResize();
      }, 100);
    },

    // Optimized data loading with caching
    async loadDataWithCache(key, loadFunction, cacheTime = 300000) { // 5 minutes cache
      const cacheKey = `dashboard_${key}`;
      const cached = localStorage.getItem(cacheKey);

      if (cached) {
        try {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < cacheTime) {
            return data;
          }
        } catch (error) {
          console.warn('Cache parse error:', error);
        }
      }

      try {
        const data = await loadFunction();
        localStorage.setItem(cacheKey, JSON.stringify({
          data,
          timestamp: Date.now()
        }));
        return data;
      } catch (error) {
        // Return cached data if available, even if expired
        if (cached) {
          try {
            const { data } = JSON.parse(cached);
            return data;
          } catch (parseError) {
            console.warn('Fallback cache parse error:', parseError);
          }
        }
        throw error;
      }
    },

    // Lazy load components for better initial performance
    async lazyLoadCharts() {
      if (this.totalRequests > 0 && !this.chartsLoaded) {
        await this.loadChartData();
        this.chartsLoaded = true;
      }
    },

    // Intersection Observer for lazy loading
    setupIntersectionObserver() {
      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              this.lazyLoadCharts();
              observer.unobserve(entry.target);
            }
          });
        }, { threshold: 0.1 });

        // Observe the visualization section
        this.$nextTick(() => {
          const visualizationSection = this.$el.querySelector('.visualization-section');
          if (visualizationSection) {
            observer.observe(visualizationSection);
          }
        });
      } else {
        // Fallback for browsers without IntersectionObserver
        this.lazyLoadCharts();
      }
    },

    // Handle outside clicks to close dropdowns
    handleOutsideClick(event) {
      if (!event.target.closest('.user-dropdown')) {
        this.showUserDropdown = false;
      }
      if (!event.target.closest('.notification-dropdown')) {
        this.showNotifications = false;
      }
    },

    // Throttled resize handler for better performance
    throttledResize() {
      if (this.resizeTimeout) {
        clearTimeout(this.resizeTimeout);
      }
      this.resizeTimeout = setTimeout(() => {
        this.handleResize();
      }, 150);
    },

    // Handle window resize
    handleResize() {
      this.isMobile = window.innerWidth <= 768;

      if (this.isMobile) {
        this.sidebarCollapsed = true;
      } else if (window.innerWidth <= 992) {
        // Auto-collapse on tablet sizes for better space usage
        this.sidebarCollapsed = true;
      }
    },

    // Close mobile sidebar
    closeMobileSidebar() {
      if (this.isMobile) {
        this.sidebarCollapsed = true;
      }
    },

    // Toggle sidebar
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed;
    },

    // Toggle user dropdown
    toggleUserDropdown() {
      this.showUserDropdown = !this.showUserDropdown;
      this.showNotifications = false;
    },

    // Toggle notifications
    toggleNotifications() {
      this.showNotifications = !this.showNotifications;
      this.showUserDropdown = false;
    },

    // Set active menu
    setActiveMenu(menu) {
      this.activeMenu = menu;

      // Close sidebar on mobile after selection
      if (window.innerWidth <= 768) {
        this.sidebarCollapsed = true;
      }
    },

    // Navigate to specific page/section
    navigateTo(page) {
      switch (page) {
        case 'profile':
          this.setActiveMenu('profile');
          break;
        case 'settings':
          this.setActiveMenu('settings');
          break;
        case 'new-request':
          // Navigate to new document request page
          this.$router.push({ name: 'NewDocumentRequest' });
          break;
        case 'track-request':
          // Navigate to my requests page
          this.$router.push({ name: 'MyRequests' });
          break;
        case 'payments':
          this.setActiveMenu('payments');
          break;
        case 'help':
          this.setActiveMenu('help');
          break;
        default:
          this.setActiveMenu('dashboard');
      }

      // Close dropdowns
      this.showUserDropdown = false;
      this.showNotifications = false;
    },

    // Get full name
    getFullName() {
      if (this.clientData?.profile) {
        const { first_name, middle_name, last_name } = this.clientData.profile;
        let fullName = first_name;
        if (middle_name) fullName += ` ${middle_name}`;
        fullName += ` ${last_name}`;
        return fullName;
      }
      return this.clientData?.username || 'User';
    },

    // Get status badge class
    getStatusBadgeClass() {
      const status = this.clientData?.status;
      switch (status) {
        case 'active': return 'status-active';
        case 'pending_verification': return 'status-pending';
        case 'suspended': return 'status-suspended';
        case 'inactive': return 'status-inactive';
        default: return 'status-unknown';
      }
    },

    // Get status text
    getStatusText() {
      const status = this.clientData?.status;
      switch (status) {
        case 'active': return 'Active';
        case 'pending_verification': return 'Pending Verification';
        case 'suspended': return 'Suspended';
        case 'inactive': return 'Inactive';
        default: return 'Unknown';
      }
    },

    // Get page title based on active menu
    getPageTitle() {
      const titles = {
        dashboard: 'Dashboard',
        services: 'Document Services',
        requests: 'My Requests',
        payments: 'Payments',
        history: 'History',
        profile: 'My Profile',
        help: 'Help & Support'
      };
      return titles[this.activeMenu] || 'Dashboard';
    },

    // Get page description based on active menu
    getPageDescription() {
      const descriptions = {
        dashboard: 'Overview of your account and recent activities',
        services: 'Apply for barangay documents and certificates',
        requests: 'Track and manage your document requests',
        payments: 'View and manage your payment history',
        history: 'View your complete transaction history',
        profile: 'Manage your personal information and settings',
        help: 'Get assistance and support for your account'
      };
      return descriptions[this.activeMenu] || '';
    },

    // Helper methods for activity generation
    getRequestActivityTitle(request) {
      const statusTitles = {
        'pending': `${request.document_type} Request Submitted`,
        'processing': `${request.document_type} Under Review`,
        'approved': `${request.document_type} Approved`,
        'ready_for_pickup': `${request.document_type} Ready for Pickup`,
        'completed': `${request.document_type} Completed`,
        'rejected': `${request.document_type} Request Rejected`
      };
      return statusTitles[request.status] || `${request.document_type} Status Updated`;
    },

    getRequestActivityDescription(request) {
      const statusDescriptions = {
        'pending': 'Your request has been submitted and is awaiting review.',
        'processing': 'Your request is currently being processed by our staff.',
        'approved': 'Your request has been approved and is being prepared.',
        'ready_for_pickup': 'Your document is ready for pickup at the barangay office.',
        'completed': 'Your request has been completed successfully.',
        'rejected': 'Your request was rejected. Please check the details and resubmit if needed.'
      };
      return statusDescriptions[request.status] || 'Status has been updated.';
    },

    getRequestActivityIcon(status) {
      const statusIcons = {
        'pending': 'fas fa-clock text-warning',
        'processing': 'fas fa-cog text-info',
        'approved': 'fas fa-check text-success',
        'ready_for_pickup': 'fas fa-hand-paper text-primary',
        'completed': 'fas fa-check-circle text-success',
        'rejected': 'fas fa-times-circle text-danger'
      };
      return statusIcons[status] || 'fas fa-info-circle text-info';
    },

    // Format time ago
    formatTimeAgo(dateString) {
      if (!dateString) return 'Unknown';

      const now = new Date();
      const date = new Date(dateString);
      const diffInSeconds = Math.floor((now - date) / 1000);

      if (diffInSeconds < 60) return 'Just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
      if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;

      return this.formatDate(dateString);
    },

    // Format date
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },

    // Format currency
    formatCurrency(amount) {
      if (!amount || isNaN(amount)) return '0.00';
      return parseFloat(amount).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    },

    // Get computed property for total paid display
    get totalPaidFormatted() {
      return this.formatCurrency(this.totalPaid);
    },

    // Load chart data for visualizations
    async loadChartData() {
      try {
        await this.generateMonthlyActivity();
        this.calculateTrends();
      } catch (error) {
        console.error('Error loading chart data:', error);
      }
    },

    // Generate monthly activity data
    async generateMonthlyActivity() {
      try {
        const response = await documentRequestService.getMyRequests();

        if (response.success && response.data) {
          const requests = response.data;
          const monthlyData = {};

          // Get last 6 months
          const months = [];
          for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthKey = date.toISOString().slice(0, 7); // YYYY-MM format
            const monthLabel = date.toLocaleDateString('en-US', { month: 'short' });
            months.push({ key: monthKey, label: monthLabel });
            monthlyData[monthKey] = 0;
          }

          // Count requests by month
          requests.forEach(request => {
            const requestMonth = request.created_at.slice(0, 7);
            if (Object.prototype.hasOwnProperty.call(monthlyData, requestMonth)) {
              monthlyData[requestMonth]++;
            }
          });

          // Convert to chart format
          this.monthlyActivity = months.map(month => ({
            label: month.label,
            value: monthlyData[month.key]
          }));
        }
      } catch (error) {
        console.error('Error generating monthly activity:', error);
        this.monthlyActivity = [];
      }
    },

    // Calculate trends for stats
    calculateTrends() {
      // Calculate requests trend (simplified)
      if (this.monthlyActivity.length >= 2) {
        const current = this.monthlyActivity[this.monthlyActivity.length - 1].value;
        const previous = this.monthlyActivity[this.monthlyActivity.length - 2].value;

        if (current > previous) {
          this.requestsTrend = {
            icon: 'fas fa-arrow-up text-success',
            text: `+${current - previous} this month`
          };
        } else if (current < previous) {
          this.requestsTrend = {
            icon: 'fas fa-arrow-down text-danger',
            text: `${current - previous} this month`
          };
        } else {
          this.requestsTrend = {
            icon: 'fas fa-minus text-muted',
            text: 'No change'
          };
        }
      }

      // Calculate payments trend (simplified)
      if (this.totalPaid > 0) {
        this.paymentsTrend = {
          icon: 'fas fa-chart-line text-success',
          text: 'Total spent'
        };
      }
    },

    // Load dashboard data
    async loadDashboardData() {
      try {
        this.loading = true;
        this.error = null;

        // Load all dashboard data concurrently
        await Promise.all([
          this.loadStats(),
          this.loadRecentActivity(),
          this.loadDashboardMetrics(),
          this.loadChartData()
        ]);

        this.lastUpdated = new Date();
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        this.error = 'Failed to load dashboard data. Please try again.';
      } finally {
        this.loading = false;
      }
    },

    // Refresh dashboard stats (lighter refresh)
    async refreshDashboardStats() {
      try {
        await this.loadStats();
        this.lastUpdated = new Date();
      } catch (error) {
        console.error('Error refreshing dashboard stats:', error);
      }
    },

    // Load dashboard statistics
    async loadStats() {
      try {
        // Try to get real data from API
        const response = await documentRequestService.getDashboardStats();

        if (response.success) {
          this.totalRequests = response.data.total_requests || 0;
          this.pendingRequests = response.data.pending_requests || 0;
          this.completedRequests = response.data.completed_requests || 0;
          this.totalPaid = response.data.total_paid || 0;
        }

        // Get actual requests data for more accurate stats
        const requestsResponse = await documentRequestService.getMyRequests();
        if (requestsResponse.success && requestsResponse.data) {
          const requests = requestsResponse.data;

          // Store all requests for search functionality
          this.allRequests = requests;

          this.totalRequests = requests.length;
          this.pendingRequests = requests.filter(r =>
            ['pending', 'processing', 'under_review'].includes(r.status)
          ).length;
          this.completedRequests = requests.filter(r =>
            ['completed', 'ready_for_pickup', 'released'].includes(r.status)
          ).length;

          // Calculate total paid
          this.totalPaid = requests
            .filter(r => r.payment_status === 'paid')
            .reduce((sum, r) => sum + (parseFloat(r.total_fee) || 0), 0);
        }
      } catch (error) {
        console.error('Error loading stats:', error);
        // Fallback to placeholder data
        this.totalRequests = 0;
        this.pendingRequests = 0;
        this.completedRequests = 0;
        this.totalPaid = 0;
      }
    },

    // Load recent activity
    async loadRecentActivity() {
      try {
        // Try to get real activity data
        const response = await documentRequestService.getRecentActivity(5);

        if (response.success && response.data.length > 0) {
          this.recentActivity = response.data.map(activity => ({
            id: activity.id,
            title: activity.title,
            description: activity.description,
            time: this.formatTimeAgo(activity.created_at),
            icon: this.getActivityIcon(activity.type)
          }));
        } else {
          // Fallback: Generate activity from recent requests
          await this.generateActivityFromRequests();
        }
      } catch (error) {
        console.error('Error loading recent activity:', error);
        await this.generateActivityFromRequests();
      }
    },

    // Generate activity from recent requests (fallback)
    async generateActivityFromRequests() {
      try {
        const response = await documentRequestService.getMyRequests({
          limit: 5,
          sort: 'created_at_desc'
        });

        if (response.success && response.data) {
          this.recentActivity = response.data.map(request => ({
            id: request.id,
            title: this.getRequestActivityTitle(request),
            description: this.getRequestActivityDescription(request),
            time: this.formatTimeAgo(request.updated_at || request.created_at),
            icon: this.getRequestActivityIcon(request.status)
          }));
        }
      } catch (error) {
        console.error('Error generating activity from requests:', error);
        // Final fallback to empty array
        this.recentActivity = [];
      }
    },

    // Load dashboard metrics
    async loadDashboardMetrics() {
      try {
        const response = await documentRequestService.getMyRequests();

        if (response.success && response.data) {
          const requests = response.data;

          // Calculate average processing time
          const completedRequests = requests.filter(r =>
            ['completed', 'ready_for_pickup', 'released'].includes(r.status)
          );

          if (completedRequests.length > 0) {
            const totalProcessingTime = completedRequests.reduce((sum, request) => {
              const created = new Date(request.created_at);
              const completed = new Date(request.updated_at);
              return sum + (completed - created);
            }, 0);

            this.dashboardMetrics.averageProcessingTime = Math.round(
              totalProcessingTime / completedRequests.length / (1000 * 60 * 60 * 24)
            ); // Convert to days
          }

          // Calculate success rate
          const totalProcessed = requests.filter(r =>
            !['pending', 'processing', 'under_review'].includes(r.status)
          ).length;

          if (totalProcessed > 0) {
            this.dashboardMetrics.successRate = Math.round(
              (completedRequests.length / totalProcessed) * 100
            );
          }

          // Find most requested service
          const serviceCounts = {};
          requests.forEach(request => {
            const service = request.document_type || 'Unknown';
            serviceCounts[service] = (serviceCounts[service] || 0) + 1;
          });

          this.dashboardMetrics.mostRequestedService = Object.keys(serviceCounts)
            .reduce((a, b) => serviceCounts[a] > serviceCounts[b] ? a : b, '');
        }
      } catch (error) {
        console.error('Error loading dashboard metrics:', error);
      }
    },

    // Search functionality
    handleSearch() {
      // Clear previous timeout
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
      }

      // Debounce search
      this.searchTimeout = setTimeout(() => {
        this.performSearch();
      }, 300);
    },

    performSearch() {
      if (!this.searchQuery.trim()) {
        this.searchResults = [];
        return;
      }

      const query = this.searchQuery.toLowerCase();
      this.searchResults = this.allRequests.filter(request => {
        return (
          request.document_type?.toLowerCase().includes(query) ||
          request.purpose?.toLowerCase().includes(query) ||
          request.status?.toLowerCase().includes(query) ||
          request.tracking_number?.toLowerCase().includes(query)
        );
      });
    },

    clearSearch() {
      this.searchQuery = '';
      this.searchResults = [];
    },

    handleFilter() {
      // Apply filters to search results or recent activity
      this.performSearch();
    },

    navigateToRequest(requestId) {
      this.$router.push({ name: 'MyRequests', query: { highlight: requestId } });
    },

    refreshRecentActivity() {
      this.loadRecentActivity();
    },

    // Handle menu actions from header
    handleMenuAction(action) {
      this.navigateTo(action);
    },

    // Handle view all notifications
    handleViewAllNotifications() {
      this.setActiveMenu('notifications');
      this.showNotifications = false;
    },

    // Security: Sanitize client data
    sanitizeClientData(data) {
      if (!data) return null;

      // Create a clean copy with only expected fields
      return {
        id: this.sanitizeString(data.id),
        username: this.sanitizeString(data.username),
        email_verified: Boolean(data.email_verified),
        phone_verified: Boolean(data.phone_verified),
        status: this.sanitizeString(data.status),
        created_at: this.sanitizeString(data.created_at),
        profile: data.profile ? {
          first_name: this.sanitizeString(data.profile.first_name),
          middle_name: this.sanitizeString(data.profile.middle_name),
          last_name: this.sanitizeString(data.profile.last_name),
          email: this.sanitizeString(data.profile.email),
          phone_number: this.sanitizeString(data.profile.phone_number)
        } : null
      };
    },

    // Security: Sanitize string input
    sanitizeString(str) {
      if (typeof str !== 'string') return '';
      return str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replace(/javascript:/gi, '')
                .replace(/on\w+\s*=/gi, '')
                .trim();
    },

    // Security: Check session expiry
    isSessionExpired() {
      const token = unifiedAuthService.getToken();
      if (!token) return true;

      try {
        // Basic JWT expiry check (you might want to use a proper JWT library)
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000 < Date.now();
      } catch (error) {
        console.warn('Token validation error:', error);
        return true;
      }
    },

    // Security: Handle session expiry
    handleSessionExpiry() {
      alert('Your session has expired. Please log in again.');
      unifiedAuthService.logout();
      this.$router.push('/login');
    },

    // Security: Rate limiting for API calls
    async rateLimitedApiCall(apiFunction, key = 'default') {
      const now = Date.now();
      const lastCall = this.lastApiCalls?.[key] || 0;
      const minInterval = 1000; // 1 second minimum between calls

      if (now - lastCall < minInterval) {
        throw new Error('Rate limit exceeded. Please wait before making another request.');
      }

      if (!this.lastApiCalls) this.lastApiCalls = {};
      this.lastApiCalls[key] = now;

      return await apiFunction();
    },

    // Logout
    logout() {
      if (confirm('Are you sure you want to logout?')) {
        // Security: Clear sensitive data
        this.clearSensitiveData();
        unifiedAuthService.logout();
        this.$router.push('/login');
      }
    },

    // Security: Clear sensitive data from memory
    clearSensitiveData() {
      this.clientData = null;
      this.allRequests = [];
      this.searchResults = [];
      this.recentActivity = [];

      // Clear any cached data
      const cacheKeys = Object.keys(localStorage).filter(key => key.startsWith('dashboard_'));
      cacheKeys.forEach(key => localStorage.removeItem(key));
    }
  }
};
