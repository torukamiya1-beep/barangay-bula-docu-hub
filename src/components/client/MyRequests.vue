<template>
  <div class="my-requests-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-main">
          <h1 class="page-title">
            <i class="fas fa-file-alt"></i>
            My Document Requests
          </h1>
          <p class="page-description">
            Track and manage your document requests
          </p>
        </div>
        <div class="header-actions">
          <!-- Ill comment this for now  -->
          <!-- <button class="new-request-btn" @click="createNewRequest">
            <i class="fas fa-plus"></i>
            New Request
          </button> -->
          <button class="back-btn" @click="goBack">
            <i class="fas fa-arrow-left"></i>
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>

    <!-- Page Content -->
    <div class="page-content">
      <!-- Filters and Search -->
    <div class="filters-section">
      <div class="filters-container">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search requests..."
            @input="handleSearch"
          />
        </div>
        
        <!-- ill comment this for now maybe gonna need this next month -->
        <!-- <div class="filter-group">
          <select v-model="statusFilter" @change="applyFilters">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="under_review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="processing">Processing</option>
            <option value="ready_for_pickup">Ready for Pickup</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div> -->

        <div class="filter-group">
          <select v-model="typeFilter" @change="applyFilters">
            <option value="">All Types</option>
            <option value="Barangay Clearance">Barangay Clearance</option>
            <option value="Cedula">Cedula</option>
          </select>
        </div>

        <div class="filter-group">
          <select v-model="sortBy" @change="applyFilters">
            <option value="created_at_desc">Newest First</option>
            <option value="created_at_asc">Oldest First</option>
            <option value="status">By Status</option>
            <option value="type">By Type</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
      </div>
      <p>Loading your requests...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="error-content">
        <i class="fas fa-exclamation-triangle"></i>
        <h3>Unable to Load Requests</h3>
        <p>{{ error }}</p>
        <button class="retry-btn" @click="loadRequests">
          <i class="fas fa-redo"></i>
          Try Again
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredRequests.length === 0 && !loading" class="empty-state">
      <div class="empty-content">
        <i class="fas fa-inbox"></i>
        <h3>{{ searchQuery || statusFilter || typeFilter ? 'No Matching Requests' : 'No Requests Yet' }}</h3>
        <p>
          {{ searchQuery || statusFilter || typeFilter 
            ? 'Try adjusting your search or filters' 
            : 'Start by creating your first document request' }}
        </p>
        <button v-if="!searchQuery && !statusFilter && !typeFilter" class="create-first-btn" @click="createNewRequest">
          <i class="fas fa-plus"></i>
          Create Your First Request
        </button>
      </div>
    </div>

    <!-- Requests List -->
    <div v-else class="requests-container">
      <!-- Table Controls -->
      <div class="table-controls">
        <div class="entries-selector">
          <label>Show</label>
          <select v-model="itemsPerPage" @change="handleItemsPerPageChange">
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
          <span>entries</span>
        </div>
        <div class="table-info">
          Showing {{ getShowingStart() }} to {{ getShowingEnd() }} of {{ filteredRequests.length }} entries
        </div>
      </div>

      <!-- Requests Table -->
      <div class="table-wrapper">
        <table class="requests-table">
          <thead>
            <tr>
              <th class="col-id">Request ID</th>
              <th class="col-type">Document Type</th>
              <th class="col-purpose">Purpose</th>
              <th class="col-status">Status</th>
              <th class="col-date">Submitted</th>
              <th class="col-amount">Amount</th>
              <th class="col-progress">Progress</th>
              <th class="col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="request in paginatedRequests"
              :key="request.id"
              class="request-row"
              @click="viewRequestDetails(request.id)"
            >
              <td class="col-id">
                <span class="request-id">#{{ request.id.toString().padStart(6, '0') }}</span>
              </td>
              <td class="col-type">
                <div class="document-type">
                  <i :class="getDocumentIcon(request.document_type)"></i>
                  <span>{{ request.document_type }}</span>
                </div>
              </td>
              <td class="col-purpose">
                <span>{{ request.purpose_category || 'Not specified' }}</span>
              </td>
              <td class="col-status">
                <div class="status-container">
                  <span class="status-badge" :class="getStatusClass(request.status)">
                    {{ formatStatus(request.status) }}
                  </span>
                  <!-- Show rejection reason if rejected -->
                  <div v-if="request.status === 'rejected' && request.rejection_reason" class="rejection-reason">
                    <i class="fas fa-info-circle text-warning"></i>
                    <small class="text-muted">{{ request.rejection_reason }}</small>
                  </div>
                </div>
              </td>
              <td class="col-date">
                <span>{{ formatDate(request.created_at) }}</span>
              </td>
              <td class="col-amount">
                <span class="amount">₱{{ formatCurrency(request.total_fee) }}</span>
              </td>
              <td class="col-progress">
                <div class="progress-container">
                  <div class="progress-bar">
                    <div 
                      class="progress-fill" 
                      :style="{ width: getProgressPercentage(request.status) + '%' }"
                    ></div>
                  </div>
                  <div class="progress-text">
                    {{ getProgressText(request.status) }}
                  </div>
                </div>
              </td>
              <td class="col-actions">
                <div class="action-buttons">
                  <button class="action-btn view-btn" @click.stop="viewRequestDetails(request.id)" title="View Details">
                    <i class="fas fa-eye"></i>
                  </button>
                  
                  <button 
                    v-if="canCancelRequest(request.status)"
                    class="action-btn cancel-btn"
                    @click.stop="cancelRequest(request.id)"
                    title="Cancel Request"
                  >
                    <i class="fas fa-times"></i>
                  </button>

                  <button 
                    v-if="needsPayment(request)"
                    class="action-btn pay-btn"
                    @click.stop="processPayment(request.id)"
                    title="Pay Now"
                  >
                    <i class="fas fa-credit-card"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination">
        <button 
          class="page-btn"
          :disabled="currentPage === 1"
          @click="changePage(currentPage - 1)"
        >
          <i class="fas fa-chevron-left"></i>
          Previous
        </button>
        
        <div class="page-numbers">
          <button
            v-for="page in visiblePages"
            :key="page"
            class="page-number"
            :class="{ active: page === currentPage }"
            @click="changePage(page)"
          >
            {{ page }}
          </button>
        </div>
        
        <button 
          class="page-btn"
          :disabled="currentPage === totalPages"
          @click="changePage(currentPage + 1)"
        >
          Next
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>

    <!-- ill comment the stats for now because its not needed -->
    <!-- Summary Stats -->
    <!-- <div class="summary-stats">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-file-alt"></i>
          </div>
          <div class="stat-content">
            <h3>{{ totalRequests }}</h3>
            <p>Total Requests</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon pending">
            <i class="fas fa-clock"></i>
          </div>
          <div class="stat-content">
            <h3>{{ pendingCount }}</h3>
            <p>Pending</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon completed">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="stat-content">
            <h3>{{ completedCount }}</h3>
            <p>Completed</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-peso-sign"></i>
          </div>
          <div class="stat-content">
            <h3>₱{{ formatCurrency(totalSpent) }}</h3>
            <p>Total Spent</p>
          </div>
        </div>
      </div>
    </div> -->
    </div> <!-- End page-content -->

  </div>
</template>

<script>
import documentRequestService from '@/services/documentRequestService';
import notificationService from '@/services/notificationService';
import paymentService from '@/services/paymentService';
import unifiedAuthService from '@/services/unifiedAuthService';

export default {
  name: 'MyRequests',
  data() {
    return {
      requests: [],
      loading: true,
      error: null,
      
      // Filters
      searchQuery: '',
      statusFilter: '',
      typeFilter: '',
      sortBy: 'created_at_desc',
      
      // Pagination
      currentPage: 1,
      itemsPerPage: 10,
      
      // Search debounce
      searchTimeout: null
    };
  },
  computed: {
    filteredRequests() {
      // Ensure requests is always an array
      if (!Array.isArray(this.requests)) {
        return [];
      }
      let filtered = [...this.requests];
      
      // Apply search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(request => 
          request.document_type.toLowerCase().includes(query) ||
          request.purpose_category?.toLowerCase().includes(query) ||
          request.id.toString().includes(query)
        );
      }
      
      // Apply status filter
      if (this.statusFilter) {
        filtered = filtered.filter(request => request.status === this.statusFilter);
      }
      
      // Apply type filter
      if (this.typeFilter) {
        filtered = filtered.filter(request => request.document_type === this.typeFilter);
      }
      
      // Apply sorting
      filtered.sort((a, b) => {
        switch (this.sortBy) {
          case 'created_at_desc':
            return new Date(b.created_at) - new Date(a.created_at);
          case 'created_at_asc':
            return new Date(a.created_at) - new Date(b.created_at);
          case 'status':
            return a.status.localeCompare(b.status);
          case 'type':
            return a.document_type.localeCompare(b.document_type);
          default:
            return 0;
        }
      });
      
      return filtered;
    },
    
    paginatedRequests() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredRequests.slice(start, end);
    },
    
    totalPages() {
      return Math.ceil(this.filteredRequests.length / this.itemsPerPage);
    },
    
    visiblePages() {
      const pages = [];
      const start = Math.max(1, this.currentPage - 2);
      const end = Math.min(this.totalPages, this.currentPage + 2);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      return pages;
    },
    
    totalRequests() {
      return this.requests.length;
    },
    
    pendingCount() {
      return this.requests.filter(r => ['pending', 'under_review'].includes(r.status)).length;
    },
    
    completedCount() {
      return this.requests.filter(r => r.status === 'completed').length;
    },
    
    totalSpent() {
      return this.requests
        .filter(r => r.status === 'completed')
        .reduce((sum, r) => sum + parseFloat(r.total_fee || 0), 0);
    }
  },
  async mounted() {
    await this.loadRequests();
    await this.initializeRealTimeFeatures();
  },

  beforeUnmount() {
    this.cleanupRealTimeFeatures();
  },
  methods: {
    async loadRequests() {
      try {
        this.loading = true;
        this.error = null;

        const response = await documentRequestService.getMyRequests();

        // Handle the nested response structure: response.data.requests
        if (response && response.data && response.data.requests && Array.isArray(response.data.requests)) {
          this.requests = response.data.requests;
        } else if (response && response.data && Array.isArray(response.data)) {
          this.requests = response.data;
        } else if (response && Array.isArray(response)) {
          this.requests = response;
        } else {
          this.requests = [];
          console.warn('API response does not contain array data:', response);
        }

      } catch (error) {
        console.error('Error loading requests:', error);
        this.error = error.response?.data?.message || 'Failed to load requests';
        this.requests = []; // Ensure requests is always an array even on error
      } finally {
        this.loading = false;
      }
    },

    handleSearch() {
      // Debounce search
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
      }
      
      this.searchTimeout = setTimeout(() => {
        this.currentPage = 1; // Reset to first page when searching
      }, 300);
    },

    applyFilters() {
      this.currentPage = 1; // Reset to first page when filtering
    },

    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },

    handleItemsPerPageChange() {
      this.currentPage = 1; // Reset to first page when changing items per page
    },

    getShowingStart() {
      if (this.filteredRequests.length === 0) return 0;
      return (this.currentPage - 1) * this.itemsPerPage + 1;
    },

    getShowingEnd() {
      const end = this.currentPage * this.itemsPerPage;
      return Math.min(end, this.filteredRequests.length);
    },

    getDocumentIcon(type) {
      const icons = {
        'Barangay Clearance': 'fas fa-certificate',
        'Cedula': 'fas fa-id-card'
      };
      return icons[type] || 'fas fa-file-alt';
    },

    getStatusClass(status) {
      const classes = {
        'pending': 'status-pending',
        'under_review': 'status-review',
        'additional_info_required': 'status-info-required',
        'approved': 'status-approved',
        'payment_pending': 'status-payment-pending',
        'payment_confirmed': 'status-payment-confirmed',
        'payment_failed': 'status-payment-failed',
        'processing': 'status-processing',
        'ready_for_pickup': 'status-ready',
        'pickup_scheduled': 'status-pickup-scheduled',
        'completed': 'status-completed',
        'rejected': 'status-rejected',
        'cancelled': 'status-cancelled'
      };
      return classes[status] || 'status-unknown';
    },

    formatStatus(status) {
      const statusMap = {
        'pending': 'Pending',
        'under_review': 'Under Review',
        'additional_info_required': 'Additional Info Required',
        'approved': 'Approved',
        'payment_pending': 'Payment Pending',
        'payment_confirmed': 'Payment Confirmed',
        'payment_failed': 'Payment Failed',
        'processing': 'Processing',
        'ready_for_pickup': 'Ready for Pickup',
        'pickup_scheduled': 'Pickup Scheduled',
        'completed': 'Completed',
        'rejected': 'Rejected',
        'cancelled': 'Cancelled'
      };
      return statusMap[status] || status;
    },

    getProgressPercentage(status) {
      const percentages = {
        'pending': 10,
        'under_review': 25,
        'additional_info_required': 20,
        'approved': 40,
        'payment_pending': 45,
        'payment_confirmed': 50,
        'payment_failed': 45,
        'processing': 75,
        'ready_for_pickup': 90,
        'pickup_scheduled': 95,
        'completed': 100,
        'rejected': 0,
        'cancelled': 0
      };
      return percentages[status] || 0;
    },

    getProgressText(status) {
      const texts = {
        'pending': 'Waiting for review',
        'under_review': 'Being reviewed',
        'additional_info_required': 'Additional information required',
        'approved': 'Approved, awaiting payment',
        'payment_pending': 'Payment required',
        'payment_confirmed': 'Payment confirmed, processing document',
        'payment_failed': 'Payment failed, please retry',
        'processing': 'Document being prepared',
        'ready_for_pickup': 'Ready for pickup',
        'pickup_scheduled': 'Pickup scheduled',
        'completed': 'Request completed',
        'rejected': 'Request rejected',
        'cancelled': 'Request cancelled'
      };
      return texts[status] || 'Unknown status';
    },

    canCancelRequest(status) {
      // Enhanced cancellation rules - allow cancellation until payment is confirmed
      const cancellableStatuses = [
        'pending',
        'under_review',
        'additional_info_required',
        'approved',
        'payment_pending',
        'payment_failed'
      ];
      return cancellableStatuses.includes(status);
    },

    needsPayment(request) {
      // Check if request needs payment based on enhanced workflow
      const paymentRequiredStatuses = ['approved', 'payment_pending', 'payment_failed'];
      const unpaidStatuses = ['pending', 'failed', null, undefined, ''];

      const needsPayment = paymentRequiredStatuses.includes(request.status) &&
                          unpaidStatuses.includes(request.payment_status) &&
                          request.payment_method_id && // Must have a payment method selected
                          request.is_online_payment; // Only show for online payment methods

      return needsPayment;
    },

    formatDate(dateString) {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    },

    formatCurrency(amount) {
      return parseFloat(amount || 0).toFixed(2);
    },

    viewRequestDetails(requestId) {
      this.$router.push({ name: 'RequestDetails', params: { id: requestId } });
    },

    async cancelRequest(requestId) {
      // Enhanced cancellation with reason input
      const reason = prompt(
        'Please provide a reason for cancelling this request (optional):',
        ''
      );

      // If user clicked cancel on the prompt, don't proceed
      if (reason === null) return;

      // Confirm cancellation
      if (!confirm('Are you sure you want to cancel this request?')) return;

      try {
        // Find the request to get its current status for debugging
        const currentRequest = this.requests.find(r => r.id === requestId);
        console.log('🚫 Cancelling request:', {
          requestId,
          reason,
          currentStatus: currentRequest?.status,
          currentRequest: currentRequest
        });

        const cancellationReason = reason.trim() || 'Cancelled by user';
        await documentRequestService.cancelRequest(requestId, cancellationReason);

        this.$toast?.success('Request cancelled successfully. Administrators have been notified.');
        await this.loadRequests(); // Reload requests

        console.log('✅ Request cancelled successfully');
      } catch (error) {
        console.error('❌ Error cancelling request:', error);
        console.error('❌ Error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message
        });

        // Show more specific error messages
        if (error.response?.data?.message) {
          this.$toast?.error(error.response.data.message);
        } else if (error.message?.includes('cannot be cancelled')) {
          this.$toast?.error('This request cannot be cancelled at its current stage');
        } else {
          this.$toast?.error('Failed to cancel request. Please try again.');
        }
      }
    },

    async processPayment(requestId) {
      try {
        // Find the request to get payment details
        const request = this.requests.find(r => r.id === requestId);
        if (!request) {
          this.showToast('Error', 'Request not found', 'error');
          console.error('Request not found:', requestId);
          return;
        }

        console.log('Processing payment for request:', request);

        // Check if request has a payment method selected
        if (!request.payment_method_id) {
          this.showToast('Error', 'No payment method selected for this request. Please contact support.', 'error');
          console.error('No payment method ID for request:', request);
          return;
        }

        // Check if it's an online payment method
        if (!request.is_online_payment) {
          this.showToast('Info', 'This request uses in-person payment. Please pay at the barangay office.', 'info');
          return;
        }

        // Show loading state
        this.showToast('Info', 'Initiating payment...', 'info');

        // Get current user data from unifiedAuthService
        const currentUser = unifiedAuthService.getCurrentUser();
        console.log('Current user:', currentUser);

        // Prepare payment data
        const paymentData = {
          request_id: requestId,
          payment_method_id: request.payment_method_id,
          customer_email: currentUser?.email || request.email
        };

        console.log('Payment data:', paymentData);

        // Initiate payment through PayMongo
        const response = await paymentService.initiatePayment(paymentData);

        console.log('Payment response:', response);

        if (response && response.success && response.data && response.data.checkout_url) {
          // Redirect to PayMongo checkout page
          this.showToast('Success', 'Redirecting to payment page...', 'success');
          paymentService.redirectToPayMongo(response.data.checkout_url);
        } else {
          console.error('Invalid payment response:', response);
          throw new Error(response?.message || 'Failed to initiate payment - invalid response');
        }

      } catch (error) {
        console.error('Payment initiation error:', error);
        console.error('Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          config: error.config
        });

        let errorMessage = 'Failed to initiate payment';

        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response?.status === 401) {
          errorMessage = 'Please log in to make a payment';
        } else if (error.response?.status === 404) {
          errorMessage = 'Payment service not found. Please contact support.';
        } else if (error.response?.status >= 500) {
          errorMessage = 'Payment service is temporarily unavailable. Please try again later.';
        } else if (error.message) {
          errorMessage = error.message;
        }

        this.showToast('Error', errorMessage, 'error');
      }
    },

    createNewRequest() {
      this.$router.push({ name: 'NewDocumentRequest' });
    },

    goBack() {
      this.$router.push({ name: 'ClientDashboard' });
    },

    showToast(title, message, type = 'info') {
      // Log to console for debugging
      console.log(`[${type.toUpperCase()}] ${title}: ${message}`);

      // Create a simple toast notification
      const toast = document.createElement('div');
      toast.className = `toast-notification toast-${type}`;
      toast.innerHTML = `
        <div class="toast-header">
          <strong>${title}</strong>
          <button type="button" class="toast-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
        <div class="toast-body">${message}</div>
      `;

      // Add toast styles if not already added
      if (!document.getElementById('toast-styles')) {
        const styles = document.createElement('style');
        styles.id = 'toast-styles';
        styles.textContent = `
          .toast-notification {
            position: fixed;
            top: 20px;
            right: 20px;
            min-width: 300px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 9999;
            animation: slideIn 0.3s ease;
          }
          .toast-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 16px 8px;
            border-bottom: 1px solid #e9ecef;
          }
          .toast-body {
            padding: 8px 16px 12px;
            color: #6c757d;
          }
          .toast-close {
            background: none;
            border: none;
            font-size: 18px;
            cursor: pointer;
            color: #6c757d;
          }
          .toast-success { border-left: 4px solid #28a745; }
          .toast-error { border-left: 4px solid #dc3545; }
          .toast-info { border-left: 4px solid #17a2b8; }
          .toast-warning { border-left: 4px solid #ffc107; }
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
        `;
        document.head.appendChild(styles);
      }

      // Add toast to page
      document.body.appendChild(toast);

      // Auto-remove after 5 seconds
      setTimeout(() => {
        if (toast.parentElement) {
          toast.style.animation = 'slideIn 0.3s ease reverse';
          setTimeout(() => toast.remove(), 300);
        }
      }, 5000);
    },

    // Real-time features
    async initializeRealTimeFeatures() {
      console.log('Initializing real-time features for MyRequests');

      try {
        // Initialize notification service for client
        await notificationService.init('client');

        // Listen for status change notifications
        notificationService.on('notification', this.handleRealTimeNotification);
        notificationService.on('status_change', this.handleStatusChange);
        notificationService.on('request_update', this.handleRequestUpdate);
      } catch (error) {
        console.error('Failed to initialize real-time features:', error);
      }
    },

    cleanupRealTimeFeatures() {
      console.log('Cleaning up real-time features for MyRequests');

      // Remove notification listeners
      notificationService.off('notification', this.handleRealTimeNotification);
      notificationService.off('status_change', this.handleStatusChange);
      notificationService.off('request_update', this.handleRequestUpdate);

      // Cleanup notification service
      notificationService.cleanup();
    },

    handleRealTimeNotification(notification) {
      console.log('Real-time notification received:', notification);

      // Handle different notification types
      switch (notification.type) {
        case 'status_change':
          this.handleStatusChange(notification);
          break;
        case 'request_update':
          this.handleRequestUpdate(notification);
          break;
        default:
          console.log('Unhandled notification type:', notification.type);
      }
    },

    handleStatusChange(notification) {
      console.log('Request status changed:', notification);

      // Find and update the request in the list
      const requestIndex = this.requests.findIndex(req => req.id === notification.data?.request_id);
      if (requestIndex !== -1) {
        // Update the request status
        this.requests[requestIndex].status = notification.data.new_status;

        // Show notification to user
        this.showStatusChangeNotification(notification);

        // Refresh the full request data to get updated details
        this.loadRequests();
      }
    },

    handleRequestUpdate(notification) {
      console.log('Request updated:', notification);

      // Refresh requests to show updates
      this.loadRequests();
    },

    showStatusChangeNotification(notification) {
      const { data } = notification;
      const statusMessages = {
        'approved': '✅ Your request has been approved!',
        'rejected': '❌ Your request has been rejected.',
        'processing': '⚙️ Your document is being processed.',
        'ready_for_pickup': '📋 Your document is ready for pickup!',
        'completed': '🎉 Your request has been completed!'
      };

      const message = statusMessages[data.new_status] || `Status updated to ${data.new_status}`;

      // Show browser notification if permission granted
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`Request ${data.request_number}`, {
          body: message,
          icon: '/favicon.ico',
          tag: `request-${data.request_id}`
        });
      }

      // You can also show an in-app toast notification here
      console.log(`🔔 ${message}`);
    }
  }
};
</script>

<style scoped>
.my-requests-page {
  padding: 0;
  max-width: none;
  margin: 0;
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.page-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: #f7fafc;
  margin: 0;
  padding: 2rem 2rem 1rem 2rem;
  border-bottom: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  flex-shrink: 0;
}

.page-content {
  flex: 1;
  padding: 0 2rem 2rem 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1a365d;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.page-title i {
  color: #3182ce;
}

.page-description {
  font-size: 1rem;
  color: #4a5568;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.new-request-btn,
.back-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: none;
}

.new-request-btn {
  background: #38a169;
  color: white;
}

.new-request-btn:hover {
  background: #2f855a;
}

.back-btn {
  background: #e2e8f0;
  color: #4a5568;
}

.back-btn:hover {
  background: #cbd5e0;
}

.filters-section {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.filters-container {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 1rem;
  align-items: center;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-box i {
  position: absolute;
  left: 1rem;
  color: #a0aec0;
  z-index: 1;
}

.search-box input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.search-box input:focus {
  outline: none;
  border-color: #3182ce;
  box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
}

.filter-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-group select:focus {
  outline: none;
  border-color: #3182ce;
  box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
}

.loading-container,
.error-container,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.loading-spinner i {
  font-size: 2rem;
  color: #3182ce;
  margin-bottom: 1rem;
}

.error-content,
.empty-content {
  max-width: 400px;
}

.error-content i,
.empty-content i {
  font-size: 3rem;
  color: #a0aec0;
  margin-bottom: 1rem;
}

.error-content h3,
.empty-content h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.error-content p,
.empty-content p {
  color: #718096;
  margin-bottom: 1.5rem;
}

.retry-btn,
.create-first-btn {
  background: #3182ce;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.retry-btn:hover,
.create-first-btn:hover {
  background: #2c5aa0;
}

.requests-container {
  margin-bottom: 3rem;
}

/* Table Controls */
.table-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.entries-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #4a5568;
}

.entries-selector select {
  padding: 0.25rem 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background: white;
  color: #374151;
  font-size: 0.9rem;
}

.table-info {
  font-size: 0.9rem;
  color: #6b7280;
}

/* Table Wrapper */
.table-wrapper {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  margin-bottom: 2rem;
}

/* Requests Table */
.requests-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.requests-table thead {
  background: #f8fafc;
  border-bottom: 2px solid #e2e8f0;
}

.requests-table th {
  padding: 1rem 0.75rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.requests-table tbody tr {
  border-bottom: 1px solid #f1f5f9;
  transition: background-color 0.2s;
  cursor: pointer;
}

.requests-table tbody tr:hover {
  background: #f8fafc;
}

.requests-table tbody tr:last-child {
  border-bottom: none;
}

.requests-table td {
  padding: 1rem 0.75rem;
  vertical-align: middle;
}

/* Column Specific Styles */
.col-id {
  width: 10%;
  min-width: 100px;
}

.col-type {
  width: 15%;
  min-width: 150px;
}

.col-purpose {
  width: 15%;
  min-width: 120px;
}

.col-status {
  width: 15%;
  min-width: 130px;
}

.col-date {
  width: 12%;
  min-width: 110px;
}

.col-amount {
  width: 10%;
  min-width: 90px;
}

.col-progress {
  width: 15%;
  min-width: 120px;
}

.col-actions {
  width: 8%;
  min-width: 100px;
}

/* Table Cell Content */
.request-id {
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: #3182ce;
  font-size: 0.85rem;
}

.document-type {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  color: #2d3748;
}

.document-type i {
  color: #3182ce;
  width: 16px;
}

.status-container {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.amount {
  font-weight: 600;
  color: #059669;
}

.progress-container {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #3182ce;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
}

.action-buttons {
  display: flex;
  gap: 0.25rem;
  justify-content: flex-start;
}

.action-btn {
  padding: 0.375rem;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  font-size: 0.8rem;
}

.view-btn {
  background: #e6f3ff;
  color: #3182ce;
}

.view-btn:hover {
  background: #3182ce;
  color: white;
}

.cancel-btn {
  background: #fef2f2;
  color: #dc2626;
}

.cancel-btn:hover {
  background: #dc2626;
  color: white;
}

.pay-btn {
  background: #f0fdf4;
  color: #059669;
}

.pay-btn:hover {
  background: #059669;
  color: white;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.status-pending { background: #fef5e7; color: #d69e2e; }
.status-review { background: #ebf8ff; color: #3182ce; }
.status-info-required { background: #fff7ed; color: #ea580c; }
.status-approved { background: #f0fff4; color: #38a169; }
.status-payment-pending { background: #fef3c7; color: #d97706; }
.status-payment-confirmed { background: #ecfdf5; color: #059669; }
.status-payment-failed { background: #fef2f2; color: #dc2626; }
.status-processing { background: #e6fffa; color: #319795; }
.status-ready { background: #f0f9ff; color: #0ea5e9; }
.status-pickup-scheduled { background: #f3e8ff; color: #9333ea; }
.status-completed { background: #f0fff4; color: #22c55e; }
.status-rejected { background: #fef2f2; color: #ef4444; }
.status-cancelled { background: #f8fafc; color: #64748b; }
.status-unknown { background: #f1f5f9; color: #475569; }

.rejection-reason {
  margin-top: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.rejection-reason i {
  font-size: 0.75rem;
  color: #f59e0b;
}

.rejection-reason small {
  font-size: 0.75rem;
  line-height: 1.4;
  color: #6b7280;
}

/* Old card styles removed - now using table layout */

/* Button styles now defined in table section above */

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.page-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #e2e8f0;
  background: white;
  color: #4a5568;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.page-btn:hover:not(:disabled) {
  background: #f7fafc;
  border-color: #cbd5e0;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 0.25rem;
}

.page-number {
  width: 2.5rem;
  height: 2.5rem;
  border: 1px solid #e2e8f0;
  background: white;
  color: #4a5568;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-number:hover {
  background: #f7fafc;
  border-color: #cbd5e0;
}

.page-number.active {
  background: #3182ce;
  color: white;
  border-color: #3182ce;
}

.summary-stats {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f7fafc;
  border-radius: 0.75rem;
}

.stat-icon {
  width: 3rem;
  height: 3rem;
  background: #3182ce;
  color: white;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.stat-icon.pending {
  background: #d69e2e;
}

.stat-icon.completed {
  background: #38a169;
}

.stat-content h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a365d;
  margin-bottom: 0.25rem;
}

.stat-content p {
  color: #718096;
  font-size: 0.875rem;
  margin: 0;
}

@media (max-width: 1024px) {
  .filters-container {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .table-controls {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .table-info {
    text-align: center;
  }

  .requests-table {
    font-size: 0.85rem;
  }

  .requests-table th,
  .requests-table td {
    padding: 0.75rem 0.5rem;
  }

  .col-purpose,
  .col-progress {
    display: none;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .page-header {
    padding: 1.5rem 1rem 1rem 1rem;
  }

  .page-content {
    padding: 0 1rem 1rem 1rem;
  }

  .page-title {
    font-size: 1.5rem;
    line-height: 1.3;
    text-align: center;
    margin-bottom: 0.5rem;
  }

  .page-title i {
    font-size: 1.25rem;
    margin-right: 0.5rem;
    color: #0d6efd;
  }

  .page-description {
    font-size: 0.9rem;
    text-align: center;
    line-height: 1.4;
    margin-top: 0.5rem;
  }

  .header-content {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .header-actions {
    justify-content: flex-start;
    gap: 0.75rem;
  }

  .back-btn {
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
    min-height: 44px; /* Touch-friendly size */
    border-radius: 6px;
  }

  .filters-section {
    padding: 1rem 0;
  }

  .search-input {
    font-size: 1rem;
    padding: 0.75rem;
  }

  .filter-select {
    font-size: 0.9rem;
    padding: 0.5rem;
  }

  .table-wrapper {
    overflow-x: auto;
  }

  .requests-table {
    min-width: 700px;
  }

  .action-buttons {
    flex-direction: column;
    gap: 0.125rem;
  }

  .action-btn {
    width: 1.75rem;
    height: 1.75rem;
    font-size: 0.75rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .stat-card {
    padding: 1rem;
  }

  .stat-number {
    font-size: 1.5rem;
  }

  .stat-label {
    font-size: 0.8rem;
  }

  .pagination {
    flex-wrap: wrap;
    gap: 0.5rem;
    padding: 1rem 0;
  }

  .page-numbers {
    order: -1;
    width: 100%;
    justify-content: center;
  }

  .page-btn {
    padding: 0.4rem 0.8rem;
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .page-header {
    padding: 1rem 0.75rem 0.75rem 0.75rem;
  }

  .page-content {
    padding: 0 0.75rem 0.75rem 0.75rem;
  }

  .page-title {
    font-size: 1.3rem;
    line-height: 1.2;
    text-align: center;
    margin-bottom: 0.75rem;
    word-wrap: break-word;
  }

  .page-title i {
    font-size: 1.1rem;
    margin-right: 0.5rem;
    color: #0d6efd;
  }

  .page-description {
    font-size: 0.85rem;
    text-align: center;
    line-height: 1.4;
    padding: 0 0.5rem;
    margin-top: 0.5rem;
  }

  .header-actions {
    flex-direction: column;
    gap: 0.5rem;
  }

  .back-btn {
    width: 100%;
    justify-content: center;
    min-height: 48px; /* Larger touch target for phones */
    padding: 0.875rem 1rem;
    font-size: 1rem;
    border-radius: 8px;
  }

  .back-btn i {
    font-size: 1.1rem;
    margin-right: 0.5rem;
  }

  .filters-container {
    gap: 0.75rem;
  }

  .search-input {
    font-size: 16px; /* Prevents zoom on iOS */
  }

  .table-controls {
    padding: 0.75rem;
    font-size: 0.85rem;
  }

  .entries-selector select {
    font-size: 0.85rem;
  }

  .requests-table {
    font-size: 0.8rem;
    min-width: 600px;
  }

  .requests-table th,
  .requests-table td {
    padding: 0.5rem 0.375rem;
  }

  .col-date {
    display: none;
  }

  .request-id {
    font-size: 0.75rem;
  }

  .document-type span {
    display: none;
  }

  .document-type i {
    font-size: 1rem;
  }

  .status-badge {
    font-size: 0.65rem;
    padding: 0.125rem 0.5rem;
  }

  .action-btn {
    width: 1.5rem;
    height: 1.5rem;
    font-size: 0.7rem;
  }

  .stat-card {
    padding: 0.75rem;
  }

  .stat-number {
    font-size: 1.3rem;
  }

  .stat-label {
    font-size: 0.75rem;
  }
}

/* Touch device optimizations */
@media (hover: none) and (pointer: coarse) {
  .back-btn,
  .btn-primary,
  .btn-outline-primary,
  .btn-outline-secondary {
    min-height: 48px;
    padding: 0.875rem 1rem;
    border-radius: 8px;
    transition: all 0.2s ease;
  }

  .back-btn:active,
  .btn:active {
    transform: scale(0.95);
    background-color: rgba(0, 123, 255, 0.1);
  }

  .request-card {
    transition: transform 0.2s ease;
  }

  .request-card:active {
    transform: scale(0.98);
  }
}

/* Prevent zoom on input focus (iOS Safari) */
@media (max-width: 768px) {
  input[type="text"],
  input[type="email"],
  input[type="search"],
  select {
    font-size: 16px !important; /* Prevents zoom on iOS */
  }

  .search-input {
    font-size: 16px !important;
  }
}
</style>
