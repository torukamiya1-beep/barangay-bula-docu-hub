<template>
  <div class="client-notifications">
    <!-- Notification Bell Icon -->
    <div class="notification-bell" @click="toggleNotificationPanel">
      <i class="fas fa-bell"></i>
      <span v-if="unreadCount > 0" class="notification-badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
    </div>

    <!-- Notification Panel -->
    <div v-if="showPanel" class="notification-panel" @click.stop>
      <div class="notification-header">
        <h5>Notifications</h5>
        <div class="notification-actions">
          <button 
            v-if="unreadCount > 0" 
            @click="markAllAsRead" 
            class="btn btn-sm btn-outline-primary"
            :disabled="markingAllRead"
          >
            <i class="fas fa-check-double"></i>
            {{ markingAllRead ? 'Marking...' : 'Mark All Read' }}
          </button>
          <button @click="toggleNotificationPanel" class="btn btn-sm btn-outline-secondary">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>

      <div class="notification-content">
        <div v-if="loading" class="notification-loading">
          <div class="spinner-border spinner-border-sm" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <span class="ms-2">Loading notifications...</span>
        </div>

        <div v-else-if="error" class="notification-error">
          <i class="fas fa-exclamation-triangle"></i>
          <span>{{ error }}</span>
          <button @click="loadNotifications(1)" class="btn btn-sm btn-outline-primary ms-2">
            <i class="fas fa-redo"></i> Retry
          </button>
        </div>

        <div v-else-if="notifications.length === 0" class="no-notifications">
          <i class="fas fa-bell-slash"></i>
          <p>No notifications yet</p>
        </div>

        <div v-else class="notification-list">
          <div
            v-for="notification in notifications"
            :key="notification.id"
            :data-notification-id="notification.id"
            class="notification-item"
            :class="{
              'unread': !notification.is_read,
              'priority-high': notification.priority === 'high' || notification.priority === 'urgent',
              'clickable': true
            }"
            @click="handleNotificationClick(notification)"
          >
            <div class="notification-icon">
              <i :class="getNotificationIcon(notification.type)"></i>
            </div>
            <div class="notification-content">
              <div class="notification-title">{{ notification.title }}</div>
              <div class="notification-message">{{ notification.message }}</div>
              <div class="notification-time">{{ formatTime(notification.created_at) }}</div>
            </div>
            <div v-if="!notification.is_read" class="unread-indicator"></div>
          </div>

          <!-- Load More Button -->
          <div v-if="hasMore" class="load-more-container">
            <button 
              @click="loadMore" 
              class="btn btn-sm btn-outline-primary"
              :disabled="loadingMore"
            >
              <i v-if="loadingMore" class="fas fa-spinner fa-spin"></i>
              <i v-else class="fas fa-chevron-down"></i>
              {{ loadingMore ? 'Loading...' : 'Load More' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getClientNotificationService } from '../../services/notificationService';
import notificationNavigationService from '../../services/notificationNavigationService';

export default {
  name: 'ClientNotifications',
  
  emits: [
    'new-notification',
    'notification-click', 
    'notification-read',
    'notifications-read',
    'connected',
    'error'
  ],

  data() {
    return {
      showPanel: false,
      notifications: [],
      unreadCount: 0,
      loading: false,
      loadingMore: false,
      markingAllRead: false,
      error: null,
      currentPage: 1,
      hasMore: true,
      pageSize: 20,
      notificationService: null // Store the client-specific service instance
    };
  },

  async mounted() {
    await this.initializeNotifications();
    
    // Close panel when clicking outside
    document.addEventListener('click', this.handleOutsideClick);
  },

  beforeUnmount() {
    // Clean up event listeners
    document.removeEventListener('click', this.handleOutsideClick);

    // Remove notification service listeners
    if (this.notificationService) {
      this.notificationService.off('notification', this.handleNewNotification);
      this.notificationService.off('connected', this.onConnected);
      this.notificationService.off('error', this.onError);
    }
  },

  methods: {
    async initializeNotifications() {
      try {
        console.log('🚀 ClientNotifications: Initializing client notification service');

        // Get the client-specific notification service
        this.notificationService = getClientNotificationService();

        // Request notification permission
        await this.notificationService.requestNotificationPermission();

        // Initialize the client notification service
        await this.notificationService.init();

        // Set up event listeners
        this.notificationService.on('notification', this.handleNewNotification);
        this.notificationService.on('connected', this.onConnected);
        this.notificationService.on('error', this.onError);

        // Load initial data
        await this.loadUnreadCount();

        console.log('✅ ClientNotifications: Client notification service initialized successfully');

      } catch (error) {
        console.error('❌ ClientNotifications: Failed to initialize client notifications:', error);
        this.error = error.message || 'Failed to connect to notification service';
      }
    },

    toggleNotificationPanel() {
      this.showPanel = !this.showPanel;
      
      if (this.showPanel && this.notifications.length === 0) {
        this.loadNotifications(1);
      }
    },

    handleOutsideClick(event) {
      if (!event.target.closest('.client-notifications')) {
        this.showPanel = false;
      }
    },

    async loadNotifications(page = 1) {
      try {
        if (page === 1) {
          this.loading = true;
          this.error = null;
        } else {
          this.loadingMore = true;
        }

        const response = await this.notificationService.getNotifications(page, this.pageSize);
        console.log('Notifications response:', response);

        // Handle the correct response structure from backend
        let notifications = [];
        let pagination = {};

        if (response.data && response.data.notifications) {
          // Backend returns: { success: true, data: { notifications: [...], pagination: {...} } }
          if (Array.isArray(response.data.notifications)) {
            notifications = response.data.notifications;
            pagination = response.data.pagination || {};
          }
        }

        if (page === 1) {
          this.notifications = notifications;
        } else {
          this.notifications.push(...notifications);
        }

        this.currentPage = page;
        this.hasMore = pagination.page < pagination.pages;

        console.log('Loaded notifications:', this.notifications);

      } catch (error) {
        console.error('Failed to load notifications:', error);
        this.error = 'Failed to load notifications';
      } finally {
        this.loading = false;
        this.loadingMore = false;
      }
    },

    async loadMore() {
      if (this.hasMore && !this.loadingMore) {
        await this.loadNotifications(this.currentPage + 1);
      }
    },

    async loadUnreadCount() {
      try {
        this.unreadCount = await this.notificationService.getUnreadCount();
      } catch (error) {
        console.error('Failed to load unread count:', error);
      }
    },

    async markAllAsRead() {
      try {
        this.markingAllRead = true;
        await this.notificationService.markAllAsRead();
        
        // Update local state
        this.notifications.forEach(notification => {
          notification.is_read = true;
        });
        this.unreadCount = 0;
        
        this.$emit('notifications-read');
        
      } catch (error) {
        console.error('Failed to mark all as read:', error);
        this.$emit('error', 'Failed to mark notifications as read');
      } finally {
        this.markingAllRead = false;
      }
    },

    async handleNotificationClick(notification) {
      console.log('🔔 Client notification clicked:', notification);

      // Ensure we have a valid notification object with an ID
      if (!notification || !notification.id) {
        console.error('Invalid notification object:', notification);
        return;
      }

      // Show loading state
      this.showLoadingState(notification);

      try {
        // Mark as read if not already read
        if (!notification.is_read) {
          await this.notificationService.markAsRead(notification.id);
          notification.is_read = true;
          this.unreadCount = Math.max(0, this.unreadCount - 1);
          this.$emit('notification-read', notification);
        }

        // Navigate based on notification type and data
        await this.navigateToRelevantPage(notification);

        // Close notification panel after successful navigation
        this.showPanel = false;

      } catch (error) {
        console.error('❌ Failed to handle notification click:', error);
        this.showErrorToast('Failed to process notification');
      } finally {
        this.hideLoadingState(notification);
      }

      // Emit click event for parent components to handle
      this.$emit('notification-click', notification);
    },

    /**
     * Navigate to the relevant page based on notification type and data
     */
    async navigateToRelevantPage(notification) {
      console.log('🧭 Determining navigation for notification:', notification.type, notification.data);

      try {
        const notificationData = typeof notification.data === 'string'
          ? JSON.parse(notification.data)
          : notification.data || {};

        let targetRoute = null;

        switch (notification.type) {
          case 'status_change':
          case 'request_update':
            targetRoute = await this.handleRequestUpdateNavigation(notificationData);
            break;

          case 'payment_confirmed':
          case 'payment_required':
          case 'payment_update':
            targetRoute = await this.handlePaymentNavigation(notificationData);
            break;

          case 'document_ready':
          case 'ready_for_pickup':
            targetRoute = await this.handleDocumentReadyNavigation(notificationData);
            break;

          case 'request_approved':
          case 'request_rejected':
            targetRoute = await this.handleRequestStatusNavigation(notificationData);
            break;

          case 'system_alert':
          case 'maintenance_notice':
            targetRoute = await this.handleSystemAlertNavigation(notificationData);
            break;

          default:
            console.log('🤷 Unknown notification type, using default navigation');
            targetRoute = await this.handleDefaultNavigation(notificationData);
        }

        if (targetRoute) {
          console.log('🚀 Navigating to:', targetRoute);

          // Add timeout to prevent hanging navigation
          const navigationPromise = this.$router.push(targetRoute);
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Navigation timeout')), 5000);
          });

          await Promise.race([navigationPromise, timeoutPromise]);
        } else {
          console.log('ℹ️ No navigation target determined for notification');
        }

      } catch (error) {
        console.error('❌ Navigation error:', error);
        throw new Error('Failed to navigate to notification target');
      }
    },

    /**
     * Handle navigation for request update notifications
     */
    async handleRequestUpdateNavigation(data) {
      if (data.request_id) {
        // Check if request still exists
        const exists = await this.checkRequestExists(data.request_id);
        if (exists) {
          return {
            name: 'RequestDetails',
            params: { id: data.request_id }
          };
        } else {
          this.showErrorToast('Request no longer exists');
          return { name: 'MyRequests' };
        }
      }
      return { name: 'MyRequests' };
    },

    /**
     * Handle navigation for payment-related notifications
     */
    async handlePaymentNavigation(data) {
      if (data.request_id) {
        const exists = await this.checkRequestExists(data.request_id);
        if (exists) {
          return {
            name: 'RequestDetails',
            params: { id: data.request_id },
            query: { tab: 'payment' } // Focus on payment section
          };
        }
      }
      // Fallback to requests page with payment filter
      return {
        name: 'MyRequests',
        query: { filter: 'payment_required' }
      };
    },

    /**
     * Handle navigation for document ready notifications
     */
    async handleDocumentReadyNavigation(data) {
      if (data.request_id) {
        const exists = await this.checkRequestExists(data.request_id);
        if (exists) {
          return {
            name: 'RequestDetails',
            params: { id: data.request_id },
            query: { tab: 'status' } // Focus on status/pickup info
          };
        }
      }
      // Fallback to requests page with ready filter
      return {
        name: 'MyRequests',
        query: { filter: 'ready' }
      };
    },

    /**
     * Handle navigation for request status change notifications
     */
    async handleRequestStatusNavigation(data) {
      if (data.request_id) {
        const exists = await this.checkRequestExists(data.request_id);
        if (exists) {
          return {
            name: 'RequestDetails',
            params: { id: data.request_id }
          };
        }
      }
      return { name: 'MyRequests' };
    },

    /**
     * Handle navigation for system alerts
     */
    async handleSystemAlertNavigation(data) {
      // For system alerts, usually go to dashboard or help page
      if (data.help_section) {
        return {
          name: 'HelpSupport',
          query: { section: data.help_section }
        };
      }
      return { name: 'ClientDashboard' };
    },

    /**
     * Handle default navigation when type is unknown
     */
    async handleDefaultNavigation(data) {
      // Priority order: request_id > dashboard
      if (data.request_id) {
        const exists = await this.checkRequestExists(data.request_id);
        if (exists) {
          return {
            name: 'RequestDetails',
            params: { id: data.request_id }
          };
        }
      }

      return { name: 'ClientDashboard' };
    },

    /**
     * Check if a request still exists and belongs to the current user
     */
    async checkRequestExists(requestId) {
      return await notificationNavigationService.checkRequestExists(requestId, 'client');
    },

    /**
     * Show loading state for a notification
     */
    showLoadingState(notification) {
      // Add loading class to notification item
      const notificationElement = document.querySelector(`[data-notification-id="${notification.id}"]`);
      if (notificationElement) {
        notificationElement.classList.add('loading');
      }
    },

    /**
     * Hide loading state for a notification
     */
    hideLoadingState(notification) {
      const notificationElement = document.querySelector(`[data-notification-id="${notification.id}"]`);
      if (notificationElement) {
        notificationElement.classList.remove('loading');
      }
    },

    /**
     * Show error toast message
     */
    showErrorToast(message) {
      notificationNavigationService.showNavigationError(message, this.$emit.bind(this));
    },

    handleNewNotification(notification, context = null) {
      // Validate this is a client notification
      if (context && context.userType && context.userType !== 'client') {
        console.log('🚫 ClientNotifications: Ignoring non-client notification:', context.userType);
        return;
      }

      // Additional validation: check notification recipient type
      if (notification.recipient_type && notification.recipient_type !== 'client') {
        console.log('🚫 ClientNotifications: Ignoring notification for:', notification.recipient_type);
        return;
      }

      console.log('📢 ClientNotifications: Processing client notification:', notification);

      // Handle unread count updates from polling
      if (notification.type === 'unread_count_update') {
        this.unreadCount = notification.count || 0;
        return;
      }

      // Handle notification read status updates
      if (notification.type === 'notification_read') {
        const notificationIndex = this.notifications.findIndex(n => n.id === notification.notification_id);
        if (notificationIndex !== -1) {
          this.notifications[notificationIndex].is_read = true;
          this.unreadCount = Math.max(0, this.unreadCount - 1);
        }
        return;
      }

      // Handle all notifications marked as read
      if (notification.type === 'all_notifications_read') {
        this.notifications.forEach(n => n.is_read = true);
        this.unreadCount = 0;
        return;
      }

      // Add to beginning of list if panel is open
      if (this.showPanel) {
        this.notifications.unshift(notification);
      }

      // Update unread count for new notifications
      if (!notification.is_read) {
        this.unreadCount++;
      }

      // Emit event for parent components
      this.$emit('new-notification', notification);
    },

    onConnected() {
      console.log('Connected to client notification stream');
      this.$emit('connected');
    },

    onError(error) {
      console.error('Client notification stream error:', error);
      this.$emit('error', 'Connection to notification stream failed');
    },

    getNotificationIcon(type) {
      const icons = {
        'status_change': 'fas fa-sync-alt text-info',
        'payment_confirmed': 'fas fa-credit-card text-success',
        'document_ready': 'fas fa-file-check text-success',
        'request_update': 'fas fa-edit text-warning',
        'system_alert': 'fas fa-exclamation-triangle text-danger',
        'test': 'fas fa-vial text-secondary',
        'connection': 'fas fa-plug text-success'
      };
      return icons[type] || 'fas fa-bell text-primary';
    },

    formatTime(timestamp) {
      if (!timestamp) return '';
      
      const date = new Date(timestamp);
      const now = new Date();
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      
      if (diffInMinutes < 1) return 'Just now';
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      
      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) return `${diffInHours}h ago`;
      
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) return `${diffInDays}d ago`;
      
      return date.toLocaleDateString();
    }
  }
};
</script>

<style scoped>
/* Client Notifications Styles */
.client-notifications {
  position: relative;
  display: inline-block;
}

.notification-bell {
  position: relative;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.3s ease;
  color: #495057;
  font-size: 1.2rem;
}

.notification-bell:hover {
  background: rgba(0, 123, 255, 0.1);
  color: #007bff;
  transform: scale(1.05);
}

.notification-badge {
  position: absolute;
  top: 0;
  right: 0;
  background: #dc3545;
  color: white;
  border-radius: 50%;
  padding: 2px 6px;
  font-size: 0.75rem;
  font-weight: bold;
  min-width: 18px;
  text-align: center;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.notification-panel {
  position: absolute;
  top: 100%;
  right: 0;
  width: 400px;
  max-height: 500px;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1050;
  overflow: hidden;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
  background: #f8f9fa;
}

.notification-header h5 {
  margin: 0;
  color: #1e3a8a;
  font-weight: 600;
}

.notification-actions {
  display: flex;
  gap: 0.5rem;
}

.notification-content {
  max-height: 400px;
  overflow-y: auto;
}

.notification-loading,
.notification-error {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #6c757d;
}

.notification-error {
  flex-direction: column;
  gap: 1rem;
}

.no-notifications {
  text-align: center;
  padding: 2rem;
  color: #6c757d;
}

.no-notifications i {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  opacity: 0.5;
}

.notification-list {
  padding: 0;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid #f1f3f4;
  cursor: pointer;
  transition: background-color 0.2s ease;
  position: relative;
}

.notification-item:hover {
  background: #f8f9fa;
}

.notification-item.unread {
  background: #f0f8ff;
  border-left: 3px solid #007bff;
}

.notification-item.priority-high {
  border-left: 3px solid #dc3545;
}

.notification-item.clickable {
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
}

.notification-item.clickable:hover {
  background: #f0f8ff;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 123, 255, 0.15);
}

.notification-item.loading {
  opacity: 0.7;
  pointer-events: none;
}

.notification-item.loading::after {
  content: '';
  position: absolute;
  top: 50%;
  right: 1rem;
  width: 16px;
  height: 16px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.notification-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #f8f9fa;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-weight: 600;
  color: #212529;
  margin-bottom: 0.25rem;
  line-height: 1.4;
}

.notification-message {
  color: #6c757d;
  font-size: 0.9rem;
  line-height: 1.4;
  margin-bottom: 0.5rem;
}

.notification-time {
  color: #adb5bd;
  font-size: 0.8rem;
}

.unread-indicator {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 8px;
  height: 8px;
  background: #007bff;
  border-radius: 50%;
}

.load-more-container {
  padding: 1rem;
  text-align: center;
  border-top: 1px solid #dee2e6;
}

/* Responsive Design */
@media (max-width: 768px) {
  .notification-bell {
    padding: 0.4rem;
    font-size: 1.1rem;
  }

  .notification-panel {
    position: fixed;
    top: 60px;
    right: 0.5rem;
    left: 0.5rem;
    width: auto;
    max-width: none;
    margin: 0;
    border-radius: 0.5rem;
  }

  .notification-header {
    padding: 1rem;
  }

  .notification-header h5 {
    font-size: 1.1rem;
  }

  .notification-item {
    padding: 0.75rem;
  }

  .notification-title {
    font-size: 0.9rem;
  }

  .notification-message {
    font-size: 0.8rem;
  }

  .notification-time {
    font-size: 0.75rem;
  }

  .notification-actions {
    flex-direction: column;
    gap: 0.25rem;
  }

  .btn-sm {
    padding: 0.2rem 0.4rem;
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .notification-panel {
    right: 0.25rem;
    left: 0.25rem;
    top: 55px;
  }

  .notification-header {
    padding: 0.75rem;
  }

  .notification-item {
    padding: 0.5rem;
  }

  .notification-title {
    font-size: 0.85rem;
  }

  .notification-message {
    font-size: 0.75rem;
  }
}

/* Bootstrap utility classes */
.btn {
  display: inline-block;
  font-weight: 400;
  line-height: 1.5;
  color: #212529;
  text-align: center;
  text-decoration: none;
  vertical-align: middle;
  cursor: pointer;
  user-select: none;
  background-color: transparent;
  border: 1px solid transparent;
  padding: 0.375rem 0.75rem;
  font-size: 1rem;
  border-radius: 0.375rem;
  transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  border-radius: 0.25rem;
}

.btn-outline-primary {
  color: #0d6efd;
  border-color: #0d6efd;
}

.btn-outline-primary:hover {
  color: #fff;
  background-color: #0d6efd;
  border-color: #0d6efd;
}

.btn-outline-secondary {
  color: #6c757d;
  border-color: #6c757d;
}

.btn-outline-secondary:hover {
  color: #fff;
  background-color: #6c757d;
  border-color: #6c757d;
}

.btn:disabled {
  pointer-events: none;
  opacity: 0.65;
}

.spinner-border {
  display: inline-block;
  width: 2rem;
  height: 2rem;
  vertical-align: -0.125em;
  border: 0.25em solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spinner-border 0.75s linear infinite;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
  border-width: 0.2em;
}

@keyframes spinner-border {
  to {
    transform: rotate(360deg);
  }
}

.visually-hidden {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
}

.ms-2 {
  margin-left: 0.5rem !important;
}
</style>
