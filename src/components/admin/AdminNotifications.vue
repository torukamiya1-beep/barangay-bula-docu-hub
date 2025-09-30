<template>
  <div class="admin-notifications">
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

      <div class="notification-body">
        <div v-if="loading" class="text-center p-3">
          <div class="spinner-border spinner-border-sm" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2 mb-0">Loading notifications...</p>
        </div>

        <div v-else-if="notifications.length === 0" class="text-center p-4 text-muted">
          <i class="fas fa-bell-slash fa-2x mb-2"></i>
          <p class="mb-0">No notifications</p>
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
            <div class="notification-priority" v-if="notification.priority === 'high' || notification.priority === 'urgent'">
              <i class="fas fa-exclamation-triangle text-warning"></i>
            </div>
          </div>
        </div>

        <div v-if="hasMore" class="notification-footer">
          <button 
            @click="loadMore" 
            class="btn btn-sm btn-outline-primary w-100"
            :disabled="loadingMore"
          >
            <i class="fas fa-chevron-down"></i>
            {{ loadingMore ? 'Loading...' : 'Load More' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Overlay -->
    <div v-if="showPanel" class="notification-overlay" @click="toggleNotificationPanel"></div>
  </div>
</template>

<script>
import { getAdminNotificationService } from '../../services/notificationService';
import notificationNavigationService from '../../services/notificationNavigationService';

export default {
  name: 'AdminNotifications',
  data() {
    return {
      showPanel: false,
      notifications: [],
      unreadCount: 0,
      loading: false,
      loadingMore: false,
      markingAllRead: false,
      currentPage: 1,
      hasMore: true,
      limit: 10,
      notificationService: null // Store the admin-specific service instance
    };
  },
  mounted() {
    this.initializeNotifications();
  },
  beforeUnmount() {
    this.cleanup();
  },
  methods: {
    async initializeNotifications() {
      try {
        console.log('🚀 AdminNotifications: Initializing admin notification service');

        // Get the admin-specific notification service
        this.notificationService = getAdminNotificationService();

        // Request notification permission
        await this.notificationService.requestNotificationPermission();

        // Initialize the admin notification service
        await this.notificationService.init();

        // Set up event listeners
        this.notificationService.on('notification', this.handleNewNotification);
        this.notificationService.on('connected', this.onConnected);
        this.notificationService.on('error', this.onError);

        // Load initial data
        await this.loadUnreadCount();

        console.log('✅ AdminNotifications: Admin notification service initialized successfully');

      } catch (error) {
        console.error('❌ AdminNotifications: Failed to initialize notifications:', error);
        this.error = error.message || 'Failed to initialize notifications';
      }
    },

    cleanup() {
      if (this.notificationService) {
        this.notificationService.off('notification', this.handleNewNotification);
        this.notificationService.off('connected', this.onConnected);
        this.notificationService.off('error', this.onError);
      }
    },

    async toggleNotificationPanel() {
      this.showPanel = !this.showPanel;
      
      if (this.showPanel && this.notifications.length === 0) {
        await this.loadNotifications();
      }
    },

    async loadNotifications(page = 1) {
      try {
        if (page === 1) {
          this.loading = true;
          this.notifications = [];
          this.currentPage = 1;
        } else {
          this.loadingMore = true;
        }

        console.log('🔍 AdminNotifications: Loading notifications, page:', page, 'limit:', this.limit);
        const response = await this.notificationService.getNotifications(page, this.limit);
        console.log('📨 AdminNotifications: Raw API response:', response);

        // Handle the correct response structure from backend
        let notifications = [];
        let pagination = {};

        if (response.data && response.data.notifications) {
          // Backend returns: { success: true, data: { notifications: [...], pagination: {...} } }
          if (Array.isArray(response.data.notifications)) {
            notifications = response.data.notifications;
            pagination = response.data.pagination || {};
            console.log('✅ AdminNotifications: Parsed notifications:', notifications.length, 'items');
            console.log('📊 AdminNotifications: Pagination:', pagination);
          } else {
            console.warn('⚠️ AdminNotifications: Invalid response structure - notifications is not an array');
            console.log('📊 AdminNotifications: response.data.notifications:', response.data.notifications);
          }
        } else {
          console.warn('⚠️ AdminNotifications: Invalid response structure - no data.notifications found');
          console.log('📊 AdminNotifications: response.data:', response.data);
        }

        if (page === 1) {
          this.notifications = notifications;
        } else {
          this.notifications.push(...notifications);
        }

        this.hasMore = pagination.page < pagination.pages;
        this.currentPage = page;

        console.log('📋 AdminNotifications: Final notifications array:', this.notifications);
        console.log('📄 AdminNotifications: Has more pages:', this.hasMore);

      } catch (error) {
        console.error('❌ AdminNotifications: Failed to load notifications:', error);
        this.$emit('error', 'Failed to load notifications');
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
      console.log('🔔 Admin notification clicked:', notification);

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
          case 'new_request':
            targetRoute = await this.handleNewRequestNavigation(notificationData);
            break;

          case 'status_change':
          case 'request_update':
            targetRoute = await this.handleRequestUpdateNavigation(notificationData);
            break;

          case 'request_cancelled':
            targetRoute = await this.handleRequestCancellationNavigation(notificationData);
            break;

          case 'payment_confirmed':
            targetRoute = await this.handlePaymentConfirmationNavigation(notificationData);
            break;

          case 'payment_update':
            targetRoute = await this.handlePaymentNavigation(notificationData);
            break;

          case 'system_alert':
          case 'urgent_request':
            targetRoute = await this.handleSystemAlertNavigation(notificationData);
            break;

          case 'user_registration':
          case 'new_user':
          case 'new_client_registration':
            targetRoute = await this.handleUserNavigation(notificationData);
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
     * Handle navigation for new request notifications
     */
    async handleNewRequestNavigation(data) {
      if (data.request_id) {
        // Check if request still exists
        const exists = await this.checkRequestExists(data.request_id);
        if (exists) {
          // Open request details modal directly for better UX
          return await this.openRequestDetailsModal(data.request_id);
        } else {
          this.showErrorToast('Request no longer exists');
          return { name: 'AdminRequests' };
        }
      }
      return { name: 'AdminRequests' };
    },

    /**
     * Handle navigation for request update notifications
     */
    async handleRequestUpdateNavigation(data) {
      if (data.request_id) {
        const exists = await this.checkRequestExists(data.request_id);
        if (exists) {
          // Open request details modal directly for better UX
          return await this.openRequestDetailsModal(data.request_id);
        } else {
          this.showErrorToast('Request no longer exists');
          return { name: 'AdminRequests' };
        }
      }
      return { name: 'AdminRequests' };
    },

    /**
     * Handle navigation for request cancellation notifications
     */
    async handleRequestCancellationNavigation(data) {
      if (data.request_id) {
        const exists = await this.checkRequestExists(data.request_id);
        if (exists) {
          // Open request details modal to show the cancelled request
          // Focus on status section to highlight the cancellation
          return await this.openRequestDetailsModal(data.request_id, 'status');
        } else {
          this.showErrorToast('Request no longer exists');
          return { name: 'AdminRequests' };
        }
      }
      // If no specific request, show cancelled requests filter
      return {
        name: 'AdminRequests',
        query: { filter: 'cancelled' }
      };
    },

    /**
     * Handle navigation for payment confirmation notifications
     */
    async handlePaymentConfirmationNavigation(data) {
      if (data.request_id) {
        const exists = await this.checkRequestExists(data.request_id);
        if (exists) {
          // Open request details modal to show the payment confirmation
          // Focus on payment section to highlight the confirmation
          return await this.openRequestDetailsModal(data.request_id, 'payment');
        } else {
          this.showErrorToast('Request no longer exists');
          return { name: 'AdminRequests' };
        }
      }
      // If no specific request, show payment confirmed requests filter
      return {
        name: 'AdminRequests',
        query: { filter: 'payment_confirmed' }
      };
    },

    /**
     * Handle navigation for payment-related notifications
     */
    async handlePaymentNavigation(data) {
      if (data.request_id) {
        const exists = await this.checkRequestExists(data.request_id);
        if (exists) {
          // Open request details modal with focus on payment section
          return await this.openRequestDetailsModal(data.request_id, 'payment');
        }
      }
      // Fallback to reports page for payment overview
      return { name: 'AdminReports', query: { section: 'revenue' } };
    },

    /**
     * Handle navigation for system alerts and urgent requests
     */
    async handleSystemAlertNavigation(data) {
      if (data.request_id) {
        return {
          name: 'AdminRequests',
          query: {
            highlight: data.request_id,
            filter: 'urgent'
          }
        };
      }
      // For general system alerts, go to dashboard
      return { name: 'AdminDashboard' };
    },

    /**
     * Handle navigation for user-related notifications
     */
    async handleUserNavigation(data) {
      if (data.user_id || data.client_id) {
        const userId = data.user_id || data.client_id;
        const exists = await this.checkUserExists(userId);
        if (exists) {
          // For new client registrations, open user details modal for better UX
          return await this.openUserDetailsModal(userId, data.user_type || 'client');
        } else {
          this.showErrorToast('User no longer exists');
          return { name: 'AdminUsers' };
        }
      }
      return { name: 'AdminUsers' };
    },

    /**
     * Handle default navigation when type is unknown
     */
    async handleDefaultNavigation(data) {
      // Priority order: request_id > user_id > dashboard
      if (data.request_id) {
        const exists = await this.checkRequestExists(data.request_id);
        if (exists) {
          // Open modal for request-related notifications for better UX
          return await this.openRequestDetailsModal(data.request_id);
        }
      }

      if (data.user_id || data.client_id) {
        const userId = data.user_id || data.client_id;
        const exists = await this.checkUserExists(userId);
        if (exists) {
          return {
            name: 'AdminUsers',
            query: {
              highlight: userId,
              type: data.user_type || 'client'
            }
          };
        } else {
          this.showErrorToast('User no longer exists');
          return { name: 'AdminUsers' };
        }
      }

      return { name: 'AdminDashboard' };
    },

    /**
     * Check if a request still exists in the system
     */
    async checkRequestExists(requestId) {
      return await notificationNavigationService.checkRequestExists(requestId, 'admin');
    },

    /**
     * Check if a user still exists in the system
     */
    async checkUserExists(userId) {
      return await notificationNavigationService.checkUserExists(userId);
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

    /**
     * Open request details modal by communicating with parent component
     * This provides better UX by keeping context and avoiding page navigation
     */
    async openRequestDetailsModal(requestId, focusTab = null) {
      try {
        console.log('🔔 Opening request details modal for ID:', requestId, 'Focus tab:', focusTab);

        // Emit event to parent component to open the modal
        // The parent (AdminRequests or AdminHeader) will handle the modal opening
        this.$emit('open-request-modal', {
          requestId: requestId,
          focusTab: focusTab
        });

        // Return null to indicate no navigation is needed
        // The modal will be opened by the parent component
        return null;

      } catch (error) {
        console.error('❌ Error opening request modal:', error);
        // Fallback to page navigation if modal opening fails
        return {
          name: 'AdminRequests',
          query: {
            highlight: requestId,
            tab: focusTab
          }
        };
      }
    },

    /**
     * Open user details modal by communicating with parent component
     * This provides better UX for new client registration notifications
     */
    async openUserDetailsModal(userId, userType = 'client') {
      try {
        console.log('🔔 Opening user details modal for ID:', userId, 'Type:', userType);

        // Emit event to parent component to open the user modal
        // The parent (AdminUsers or AdminHeader) will handle the modal opening
        this.$emit('open-user-modal', {
          userId: userId,
          userType: userType
        });

        // Return null to indicate no navigation is needed
        // The modal will be opened by the parent component
        return null;

      } catch (error) {
        console.error('❌ Error opening user modal:', error);
        // Fallback to page navigation if modal opening fails
        return {
          name: 'AdminUsers',
          query: {
            highlight: userId,
            type: userType
          }
        };
      }
    },

    handleNewNotification(notification, context = null) {
      // Validate this is an admin notification
      if (context && context.userType && context.userType !== 'admin') {
        console.log('🚫 AdminNotifications: Ignoring non-admin notification:', context.userType);
        return;
      }

      // Additional validation: check notification recipient type
      if (notification.recipient_type && notification.recipient_type !== 'admin') {
        console.log('🚫 AdminNotifications: Ignoring notification for:', notification.recipient_type);
        return;
      }

      console.log('📢 AdminNotifications: Processing admin notification:', notification);

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
      console.log('Connected to notification stream');
      this.$emit('connected');
    },

    onError(error) {
      console.error('Notification stream error:', error);
      this.$emit('error', 'Connection to notification stream failed');
    },

    getNotificationIcon(type) {
      const icons = {
        'status_change': 'fas fa-sync-alt text-info',
        'new_request': 'fas fa-file-alt text-success',
        'request_update': 'fas fa-edit text-warning',
        'system_alert': 'fas fa-exclamation-triangle text-danger',
        'user_registration': 'fas fa-user-plus text-info',
        'new_user': 'fas fa-user-check text-success',
        'new_client_registration': 'fas fa-user-plus text-info',
        'test': 'fas fa-vial text-secondary',
        'connection': 'fas fa-plug text-success'
      };
      return icons[type] || 'fas fa-bell text-primary';
    },

    formatTime(timestamp) {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      
      if (diffInMinutes < 1) return 'Just now';
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
      return date.toLocaleDateString();
    }
  }
};
</script>

<style scoped>
.admin-notifications {
  position: relative;
}

.notification-bell {
  position: relative;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.notification-bell:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.notification-bell i {
  font-size: 1.2rem;
  color: #6c757d;
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
  font-weight: 600;
}

.notification-actions {
  display: flex;
  gap: 0.5rem;
}

.notification-body {
  max-height: 400px;
  overflow-y: auto;
}

.notification-list {
  padding: 0;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  padding: 1rem;
  border-bottom: 1px solid #f1f3f4;
  cursor: pointer;
  transition: background-color 0.2s;
}

.notification-item:hover {
  background-color: #f8f9fa;
}

.notification-item.unread {
  background-color: #e3f2fd;
  border-left: 4px solid #2196f3;
}

.notification-item.priority-high {
  border-left: 4px solid #ff9800;
}

.notification-item.clickable {
  cursor: pointer;
  position: relative;
}

.notification-item.clickable:hover {
  background-color: #f8f9fa;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
  margin-right: 0.75rem;
  margin-top: 0.25rem;
}

.notification-content {
  flex: 1;
}

.notification-title {
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: #212529;
}

.notification-message {
  font-size: 0.875rem;
  color: #6c757d;
  margin-bottom: 0.25rem;
  line-height: 1.4;
}

.notification-time {
  font-size: 0.75rem;
  color: #adb5bd;
}

.notification-priority {
  margin-left: 0.5rem;
  margin-top: 0.25rem;
}

.notification-footer {
  padding: 0.75rem;
  border-top: 1px solid #dee2e6;
  background: #f8f9fa;
}

.notification-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1040;
}

@media (max-width: 768px) {
  .notification-panel {
    width: 320px;
    right: -50px;
  }
}
</style>
