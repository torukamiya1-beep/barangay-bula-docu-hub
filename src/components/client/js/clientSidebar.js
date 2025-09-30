export default {
  name: 'ClientSidebar',
  props: {
    collapsed: {
      type: Boolean,
      default: false
    },
    activeMenu: {
      type: String,
      default: 'dashboard'
    },
    pendingRequests: {
      type: Number,
      default: 0
    },
    completedRequests: {
      type: Number,
      default: 0
    },
    totalServices: {
      type: Number,
      default: 8
    }
  },

  emits: ['menu-change', 'logout', 'toggle-sidebar'],

  computed: {
    // Detect if the current device is mobile
    isMobile() {
      return window.innerWidth <= 768;
    }
  },

  mounted() {
    // Listen for window resize to update mobile detection
    this.handleResize = () => {
      this.$forceUpdate(); // Force re-render to update isMobile computed property
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
    // Handle image error
    handleImageError(event) {
      console.log('Logo image failed to load, using fallback');
      // You could set a fallback image here if needed
      event.target.style.display = 'none';
    },

    // Handle menu item click
    handleMenuClick(menu) {
      // Prevent default link behavior
      event.preventDefault();

      // Handle special navigation cases
      if (menu === 'services') {
        // Navigate to new document request page
        this.$router.push({ name: 'NewDocumentRequest' });
      } else if (menu === 'requests') {
        // Navigate to my requests page
        this.$router.push({ name: 'MyRequests' });
      } else {
        // Emit menu change event to parent for other menus
        this.$emit('menu-change', menu);
      }
    },

    // Handle logout
    handleLogout() {
      // Prevent default link behavior
      event.preventDefault();

      // Emit logout event to parent
      this.$emit('logout');
    },

    // Handle mobile close button
    handleMobileClose() {
      // Emit toggle sidebar event to close the sidebar on mobile
      this.$emit('toggle-sidebar');
    }
  }
};
