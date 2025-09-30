export default {
  name: 'ClientHeader',
  props: {
    userName: {
      type: String,
      default: 'User'
    },
    notificationCount: {
      type: Number,
      default: 0
    },
    showNotifications: {
      type: Boolean,
      default: false
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
    'notification-toggle', 
    'user-dropdown-toggle',
    'menu-action',
    'logout',
    'view-all-notifications'
  ],
  
  data() {
    return {
      notifications: [
        {
          id: 1,
          title: 'Document Ready',
          message: 'Your Barangay Clearance is ready for pickup',
          time: '5 minutes ago',
          icon: 'fas fa-file-check text-success',
          read: false
        },
        {
          id: 2,
          title: 'Payment Received',
          message: 'Payment for Certificate of Residency confirmed',
          time: '1 hour ago',
          icon: 'fas fa-credit-card text-primary',
          read: false
        },
        {
          id: 3,
          title: 'Request Update',
          message: 'Your Certificate of Indigency is being processed',
          time: '2 hours ago',
          icon: 'fas fa-clock text-warning',
          read: true
        }
      ]
    };
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
    // Get page title based on active menu
    getPageTitle() {
      const titles = {
        'dashboard': 'Dashboard',
        'services': 'Services',
        'requests': 'My Requests',
        'documents': 'Documents',
        'profile': 'Profile',
        'notifications': 'Notifications',
        'help': 'Help & Support'
      };
      return titles[this.activeMenu] || 'Dashboard';
    },

    // Handle sidebar toggle
    handleSidebarToggle() {
      this.$emit('sidebar-toggle');
    },
    
    // Handle notification toggle
    handleNotificationToggle() {
      this.$emit('notification-toggle');
    },
    
    // Handle user dropdown toggle
    handleUserDropdownToggle() {
      this.$emit('user-dropdown-toggle');
    },
    
    // Handle menu actions (profile, settings, etc.)
    handleMenuAction(action) {
      this.$emit('menu-action', action);
    },
    
    // Handle logout
    handleLogout() {
      this.$emit('logout');
    },
    
    // Handle view all notifications
    handleViewAllNotifications() {
      this.$emit('view-all-notifications');
    },
    
    // Handle outside clicks to close dropdowns
    handleOutsideClick(event) {
      // Check if click is outside notification dropdown
      if (!event.target.closest('.notification-dropdown')) {
        if (this.showNotifications) {
          this.$emit('notification-toggle');
        }
      }
      
      // Check if click is outside user dropdown
      if (!event.target.closest('.user-dropdown')) {
        if (this.showUserDropdown) {
          this.$emit('user-dropdown-toggle');
        }
      }
    },
    
    // Mark notification as read
    markAsRead(notificationId) {
      const notification = this.notifications.find(n => n.id === notificationId);
      if (notification) {
        notification.read = true;
      }
    },
    
    // Get unread notification count
    getUnreadCount() {
      return this.notifications.filter(n => !n.read).length;
    }
  }
};
