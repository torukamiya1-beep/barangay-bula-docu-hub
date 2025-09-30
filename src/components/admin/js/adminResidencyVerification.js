import AdminHeader from '../AdminHeader.vue';
import AdminSidebar from '../AdminSidebar.vue';
import adminAuthService from '@/services/adminAuthService';
import { Modal } from 'bootstrap';

export default {
  name: 'AdminResidencyVerification',
  components: {
    AdminHeader,
    AdminSidebar
  },
  data() {
    return {
      // Admin data
      adminData: null,
      
      // UI state
      sidebarCollapsed: false,
      showUserDropdown: false,
      activeMenu: 'residency-verification',
      isMobile: false,
      
      // Loading states
      loading: false,
      actionLoading: false,
      loadingDocuments: false,
      
      // Data
      pendingVerifications: [],
      documents: [],
      selectedVerification: null,
      
      // Pagination
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
      },
      
      // Statistics
      statistics: {
        pending: 0,
        approved: 0,
        rejected: 0,
        total: 0
      },
      
      // Rejection modal
      rejectionReason: '',
      rejectionError: '',
      
      // Messages
      successMessage: '',
      errorMessage: ''
    };
  },
  async mounted() {
    this.checkMobile();
    window.addEventListener('resize', this.checkMobile);
    
    try {
      this.adminData = await adminAuthService.getCurrentAdmin();
      await this.loadPendingVerifications();
      await this.loadStatistics();
    } catch (error) {
      console.error('Failed to initialize admin residency verification:', error);
      this.errorMessage = 'Failed to load admin data';
    }
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkMobile);
  },
  methods: {
    // UI Methods
    checkMobile() {
      this.isMobile = window.innerWidth < 768;
      if (!this.isMobile) {
        this.sidebarCollapsed = false;
      }
    },
    
    handleSidebarToggle() {
      this.sidebarCollapsed = !this.sidebarCollapsed;
    },
    
    closeMobileSidebar() {
      if (this.isMobile) {
        this.sidebarCollapsed = true;
      }
    },
    
    handleUserDropdownToggle() {
      this.showUserDropdown = !this.showUserDropdown;
    },
    
    handleMenuChange(menu) {
      this.activeMenu = menu;
      this.showUserDropdown = false;
    },
    
    handleMenuAction(action) {
      if (action === 'profile') {
        this.$router.push('/admin/profile');
      } else if (action === 'settings') {
        this.$router.push('/admin/settings');
      }
      this.showUserDropdown = false;
    },
    
    async handleLogout() {
      try {
        await adminAuthService.logout();
        this.$router.push('/admin/login');
      } catch (error) {
        console.error('Logout failed:', error);
      }
    },
    
    // Data Loading Methods
    async loadPendingVerifications(page = 1) {
      this.loading = true;
      this.clearMessages();
      
      try {
        const response = await this.fetchPendingVerifications(page);
        
        if (response.success) {
          this.pendingVerifications = response.data;
          this.pagination = response.pagination;
        } else {
          throw new Error(response.message || 'Failed to load pending verifications');
        }
      } catch (error) {
        console.error('Failed to load pending verifications:', error);
        this.errorMessage = error.message || 'Failed to load pending verifications';
      } finally {
        this.loading = false;
      }
    },
    
    async loadStatistics() {
      try {
        // This would be implemented with actual API calls
        // For now, calculate from current data
        this.statistics = {
          pending: this.pendingVerifications.length,
          approved: 0, // Would come from API
          rejected: 0, // Would come from API
          total: this.pagination.total || this.pendingVerifications.length
        };
      } catch (error) {
        console.error('Failed to load statistics:', error);
      }
    },
    
    // API Methods
    async fetchPendingVerifications(page = 1, limit = 10) {
      const response = await fetch(`/api/residency/pending?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch pending verifications');
      }

      return data;
    },
    
    async fetchAccountDocuments(accountId) {
      const response = await fetch(`/api/residency/documents/${accountId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch documents');
      }

      return data;
    },
    
    async approveVerificationAPI(accountId) {
      const response = await fetch('/api/residency/approve', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          account_id: accountId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to approve verification');
      }

      return data;
    },
    
    async rejectVerificationAPI(accountId, rejectionReason) {
      const response = await fetch('/api/residency/reject', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          account_id: accountId,
          rejection_reason: rejectionReason
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reject verification');
      }

      return data;
    },
    
    // Action Methods
    async viewDocuments(verification) {
      this.selectedVerification = verification;
      this.loadingDocuments = true;
      this.documents = [];
      
      // Show modal
      const modal = new Modal(this.$refs.documentModal);
      modal.show();
      
      try {
        const response = await this.fetchAccountDocuments(verification.account_id);
        
        if (response.success) {
          this.documents = response.data;
        } else {
          throw new Error(response.message || 'Failed to load documents');
        }
      } catch (error) {
        console.error('Failed to load documents:', error);
        this.errorMessage = error.message || 'Failed to load documents';
      } finally {
        this.loadingDocuments = false;
      }
    },
    
    async approveVerification(verification) {
      if (!confirm(`Are you sure you want to approve the residency verification for ${verification.first_name} ${verification.last_name}?`)) {
        return;
      }
      
      this.actionLoading = true;
      this.clearMessages();
      
      try {
        const response = await this.approveVerificationAPI(verification.account_id);
        
        if (response.success) {
          this.successMessage = `Residency verification approved for ${verification.first_name} ${verification.last_name}`;
          await this.loadPendingVerifications(this.pagination.page);
          await this.loadStatistics();
        } else {
          throw new Error(response.message || 'Failed to approve verification');
        }
      } catch (error) {
        console.error('Failed to approve verification:', error);
        this.errorMessage = error.message || 'Failed to approve verification';
      } finally {
        this.actionLoading = false;
      }
    },
    
    showRejectModal(verification) {
      this.selectedVerification = verification;
      this.rejectionReason = '';
      this.rejectionError = '';
      
      const modal = new Modal(this.$refs.rejectModal);
      modal.show();
    },
    
    async confirmRejectVerification() {
      if (!this.rejectionReason.trim()) {
        this.rejectionError = 'Rejection reason is required';
        return;
      }
      
      if (this.rejectionReason.trim().length < 10) {
        this.rejectionError = 'Rejection reason must be at least 10 characters';
        return;
      }
      
      this.actionLoading = true;
      this.rejectionError = '';
      this.clearMessages();
      
      try {
        const response = await this.rejectVerificationAPI(
          this.selectedVerification.account_id,
          this.rejectionReason.trim()
        );
        
        if (response.success) {
          this.successMessage = `Residency verification rejected for ${this.selectedVerification.first_name} ${this.selectedVerification.last_name}`;
          
          // Close modal
          const modal = Modal.getInstance(this.$refs.rejectModal);
          modal.hide();
          
          await this.loadPendingVerifications(this.pagination.page);
          await this.loadStatistics();
        } else {
          throw new Error(response.message || 'Failed to reject verification');
        }
      } catch (error) {
        console.error('Failed to reject verification:', error);
        this.errorMessage = error.message || 'Failed to reject verification';
      } finally {
        this.actionLoading = false;
      }
    },

    approveFromModal() {
      // Close document modal first
      const documentModal = Modal.getInstance(this.$refs.documentModal);
      documentModal.hide();

      // Approve the verification
      this.approveVerification(this.selectedVerification);
    },

    showRejectModalFromDocuments() {
      // Close document modal first
      const documentModal = Modal.getInstance(this.$refs.documentModal);
      documentModal.hide();

      // Show reject modal
      setTimeout(() => {
        this.showRejectModal(this.selectedVerification);
      }, 300);
    },

    viewDocument(document) {
      // This would open the document in a new tab or modal
      // For now, just show an alert
      alert(`Viewing document: ${document.document_name}\nThis feature would open the document file.`);
    },

    // Pagination Methods
    changePage(page) {
      if (page >= 1 && page <= this.pagination.totalPages && page !== this.pagination.page) {
        this.loadPendingVerifications(page);
      }
    },

    getPageNumbers() {
      const pages = [];
      const totalPages = this.pagination.totalPages;
      const currentPage = this.pagination.page;

      // Show up to 5 page numbers
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, startPage + 4);

      if (endPage - startPage < 4) {
        startPage = Math.max(1, endPage - 4);
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      return pages;
    },

    // Utility Methods
    getFullName(verification) {
      const parts = [verification.first_name, verification.middle_name, verification.last_name].filter(Boolean);
      return parts.join(' ');
    },

    formatDate(dateString) {
      if (!dateString) return 'N/A';

      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (error) {
        return 'Invalid Date';
      }
    },

    getTimeAgo(dateString) {
      if (!dateString) return 'N/A';

      try {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;

        return this.formatDate(dateString);
      } catch (error) {
        return 'N/A';
      }
    },

    getDocumentTypeLabel(documentType) {
      const labels = {
        utility_bill: 'Utility Bill',
        barangay_certificate: 'Barangay Certificate',
        valid_id: 'Valid ID',
        lease_contract: 'Lease Contract',
        other: 'Other Document'
      };

      return labels[documentType] || documentType;
    },

    formatFileSize(bytes) {
      if (!bytes) return 'N/A';

      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(1024));

      return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    },

    clearMessages() {
      this.successMessage = '';
      this.errorMessage = '';
    }
  }
};
