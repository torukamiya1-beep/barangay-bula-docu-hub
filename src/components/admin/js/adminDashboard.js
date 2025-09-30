import adminAuthService from '@/services/adminAuthService';
import AdminHeader from '../AdminHeader.vue';
import AdminSidebar from '../AdminSidebar.vue';

export default {
  name: 'AdminDashboard',
  components: {
    AdminHeader,
    AdminSidebar
  },
  data() {
    return {
      loading: true,
      adminData: null,
      stats: {
        totalUsers: 0,
        activeRequests: 0,
        completedToday: 0,
        pendingApproval: 0
      },
      recentActivity: [],
      errorMessage: ''
    };
  },
  
  async mounted() {
    // Add dashboard layout class to body to prevent scrolling
    document.body.classList.add('dashboard-layout');

    // Check if admin is logged in
    if (!adminAuthService.isLoggedIn()) {
      this.$router.push('/admin/login');
      return;
    }
    
    await this.loadDashboardData();
  },
  
  methods: {
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
        const errorData = adminAuthService.parseError(error);
        this.errorMessage = errorData.message || 'Failed to load dashboard data';
        
        // If unauthorized, redirect to login
        if (errorData.status === 401) {
          adminAuthService.logout();
          this.$router.push('/admin/login');
        }
      } finally {
        this.loading = false;
      }
    },
    
    // Load admin profile
    async loadAdminProfile() {
      try {
        const response = await adminAuthService.getProfile();
        if (response.success) {
          this.adminData = response.data;
        }
      } catch (error) {
        console.error('Failed to load admin profile:', error);
        // Use stored admin data as fallback
        this.adminData = adminAuthService.getAdminData();
      }
    },
    
    // Load dashboard statistics
    async loadDashboardStats() {
      try {
        const response = await adminAuthService.getDashboardStats();
        if (response.success) {
          this.stats = {
            totalUsers: response.data.totalUsers || 0,
            activeRequests: response.data.activeRequests || 0,
            completedToday: response.data.completedToday || 0,
            pendingApproval: response.data.pendingApproval || 0
          };
        }
      } catch (error) {
        console.error('Failed to load dashboard stats:', error);
        // Keep default stats values
      }
    },
    
    // Load recent activity
    async loadRecentActivity() {
      try {
        const response = await adminAuthService.getRecentActivity();
        if (response.success) {
          this.recentActivity = response.data || [];
        }
      } catch (error) {
        console.error('Failed to load recent activity:', error);
        this.recentActivity = [];
      }
    },
    
    // Navigate to specific route
    navigateTo(route) {
      this.$router.push(route);
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
    
    // Handle logout
    logout() {
      adminAuthService.logout();
      this.$router.push('/admin/login');
    }
  },
  
  // Auto-refresh dashboard data every 5 minutes
  created() {
    this.refreshInterval = setInterval(() => {
      this.loadDashboardStats();
      this.loadRecentActivity();
    }, 5 * 60 * 1000); // 5 minutes
  },
  
  // Clean up interval on component destroy
  beforeUnmount() {
    // Remove dashboard layout class from body
    document.body.classList.remove('dashboard-layout');

    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }
};
