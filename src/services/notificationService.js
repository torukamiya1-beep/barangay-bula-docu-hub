import axios from 'axios';

/**
 * Context-Specific Notification Service
 * Each instance is tied to a specific user type (admin or client)
 */
class ContextualNotificationService {
  constructor(userType) {
    this.userType = userType;
    this.eventSource = null;
    this.listeners = new Map();
    this.userContexts = new Map(); // Initialize userContexts Map
    this.activeContext = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.maxReconnectDelay = 30000;
    this.baseURL = process.env.VUE_APP_API_URL || 'http://localhost:7000/api';
    this.isConnecting = false;
    this.pollingInterval = null;
    this.reconnectTimer = null;

    console.log(`🔔 Creating ${userType} notification service instance`);
  }

  /**
   * Validate that this service can operate for its user type
   */
  validateContext() {
    const authToken = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    const userData = localStorage.getItem('auth_user') || sessionStorage.getItem('auth_user');

    if (!authToken || !userData) {
      throw new Error('Authentication required');
    }

    try {
      const user = JSON.parse(userData);

      if (this.userType === 'admin') {
        if (user.type !== 'admin') {
          throw new Error('Admin authentication required');
        }
        return true;
      }

      if (this.userType === 'client') {
        if (user.type !== 'client') {
          throw new Error('Client authentication required');
        }
        return true;
      }
    } catch (error) {
      throw new Error('Invalid user data format');
    }

    throw new Error(`Invalid user type: ${this.userType}`);
  }

  /**
   * Get authentication token for this user type
   */
  getAuthToken() {
    return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  }

  /**
   * Initialize the notification service for this specific user type
   */
  async init() {
    console.log(`🚀 Initializing ${this.userType} notification service`);

    try {
      // Validate context before proceeding
      this.validateContext();

      // Initialize user context if not exists
      if (!this.userContexts.has(this.userType)) {
        this.userContexts.set(this.userType, {
          isConnected: false,
          listeners: new Map(),
          eventSource: null
        });
      }

      // Set active context
      this.activeContext = this.userType;

      // Connect to notification stream
      await this.connect();

      console.log(`✅ ${this.userType} notification service initialized successfully`);
      return Promise.resolve();
    } catch (error) {
      console.error(`❌ Failed to initialize ${this.userType} notification service:`, error);
      throw error;
    }
  }

  /**
   * Detect current user context based on authentication state
   */
  detectUserContext() {
    const authToken = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    const userData = localStorage.getItem('auth_user') || sessionStorage.getItem('auth_user');

    if (!authToken || !userData) {
      console.log('🔍 No authentication found');
      return null;
    }

    try {
      const user = JSON.parse(userData);
      if (user && user.type) {
        console.log('🔍 Detected user context:', user.type);
        return user.type;
      }
    } catch (error) {
      console.warn('⚠️ Invalid user data in localStorage:', error);
    }

    console.log('🔍 No valid user context detected');
    return null;
  }

  /**
   * Validate user context against authentication state
   */
  validateUserContext(userType) {
    if (!userType || !['admin', 'client'].includes(userType)) {
      return false;
    }

    const authToken = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    const userData = localStorage.getItem('auth_user') || sessionStorage.getItem('auth_user');

    if (!authToken || !userData) {
      return false;
    }

    try {
      const user = JSON.parse(userData);
      return user && user.type === userType;
    } catch (error) {
      return false;
    }
  }

  /**
   * Switch active user context
   */
  switchContext(userType) {
    if (!this.validateUserContext(userType)) {
      console.warn('⚠️ Cannot switch to invalid user context:', userType);
      return false;
    }

    const previousContext = this.activeContext;
    this.activeContext = userType;
    this.currentUserType = userType;

    console.log('🔄 Context switched:', {
      from: previousContext,
      to: userType
    });

    // Emit context change event
    this.emit('context_changed', {
      previousContext,
      currentContext: userType
    });

    return true;
  }

  /**
   * Get current active context
   */
  getCurrentContext() {
    return this.activeContext;
  }

  /**
   * Check if a specific user context is connected
   */
  isContextConnected(userType) {
    const context = this.userContexts.get(userType);
    return context ? context.isConnected : false;
  }

  /**
   * Get all available contexts
   */
  getAvailableContexts() {
    const contexts = [];

    if (this.validateUserContext('admin')) {
      contexts.push({
        type: 'admin',
        connected: this.isContextConnected('admin'),
        active: this.activeContext === 'admin'
      });
    }

    if (this.validateUserContext('client')) {
      contexts.push({
        type: 'client',
        connected: this.isContextConnected('client'),
        active: this.activeContext === 'client'
      });
    }

    return contexts;
  }

  /**
   * Handle authentication state changes and auto-switch context
   */
  handleAuthStateChange() {
    const detectedContext = this.detectUserContext();

    if (!detectedContext) {
      console.log('🔒 No valid authentication detected, cleaning up all contexts');
      this.cleanup('admin');
      this.cleanup('client');
      this.activeContext = null;
      this.currentUserType = null;
      return;
    }

    // If detected context is different from active context, switch
    if (detectedContext !== this.activeContext) {
      console.log('🔄 Authentication state changed, switching context:', {
        from: this.activeContext,
        to: detectedContext
      });

      this.switchContext(detectedContext);
    }
  }

  /**
   * Start monitoring authentication state changes
   */
  startAuthStateMonitoring() {
    // Monitor localStorage changes for token updates
    window.addEventListener('storage', (event) => {
      if (event.key === 'adminToken' || event.key === 'clientToken' ||
          event.key === 'adminData' || event.key === 'clientData') {
        console.log('🔍 Authentication storage changed:', event.key);
        setTimeout(() => this.handleAuthStateChange(), 100);
      }
    });

    // Also monitor for direct localStorage changes in the same tab
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
      originalSetItem.call(this, key, value);
      if (key === 'adminToken' || key === 'clientToken' ||
          key === 'adminData' || key === 'clientData') {
        setTimeout(() => {
          if (window.__notificationServiceInstance) {
            window.__notificationServiceInstance.handleAuthStateChange();
          }
        }, 100);
      }
    };
  }

  /**
   * Cleanup with context awareness
   */
  cleanup(userType = null) {
    if (userType) {
      // Clean up specific context
      const context = this.userContexts.get(userType);
      if (context) {
        console.log('🧹 Cleaning up context:', userType);

        // Clean up event source
        if (context.eventSource) {
          context.eventSource.close();
          context.eventSource = null;
        }

        // Clear context data
        context.isConnected = false;
        context.listeners.clear();

        // Remove global reference
        if (window[`__sseConnection_${userType}`]) {
          delete window[`__sseConnection_${userType}`];
        }
      }
    } else {
      console.log('🧹 General notification service cleanup');
      // Don't disconnect - let connections persist for context switching
    }
  }

  /**
   * Connect to SSE stream for this specific user type
   */
  connect() {
    // Prevent multiple connections
    if (this.isConnected || this.isConnecting || this.eventSource) {
      console.log(`🔗 ${this.userType} notification service already connected`);
      return Promise.resolve();
    }

    this.isConnecting = true;
    console.log(`🔗 Establishing SSE connection for ${this.userType}`);

    return new Promise((resolve, reject) => {
      try {
        // Validate context and get token
        this.validateContext();
        const token = this.getAuthToken();

        if (!token) {
          this.isConnecting = false;
          reject(new Error(`No authentication token for ${this.userType}`));
          return;
        }

        // Create EventSource with proper URL
        const url = `${this.baseURL}/notifications/stream?token=${encodeURIComponent(token)}`;
        console.log(`🔗 SSE URL for ${this.userType}:`, url.replace(/token=[^&]+/, 'token=***'));

        this.eventSource = new EventSource(url);

        // Store reference with user-specific key to prevent conflicts
        window[`__sseConnection_${this.userType}`] = this.eventSource;

        // Event handlers for this specific user type
        this.eventSource.onopen = () => {
          console.log(`✅ SSE Connection established for ${this.userType}`);
          this.isConnected = true;
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.emit('connected');
          resolve();
        };

        this.eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log(`📨 SSE Message for ${this.userType}:`, data);

            // CRITICAL: Only process notifications intended for this user type
            if (data.recipient_type && data.recipient_type !== this.userType) {
              console.log(`🚫 ${this.userType} service ignoring ${data.recipient_type} notification:`, data.id);
              return;
            }

            this.handleNotification(data);
          } catch (error) {
            console.error(`❌ ${this.userType} SSE message parse error:`, error);
          }
        };

        // Handle specific event types
        this.eventSource.addEventListener('connected', () => {
          console.log(`🎯 Connected event received for ${this.userType}`);
        });

        this.eventSource.addEventListener('heartbeat', () => {
          console.log(`💓 Heartbeat received for ${this.userType}`);
        });

        this.eventSource.onerror = (event) => {
          console.error(`❌ SSE Error for ${this.userType}:`, event);
          this.isConnected = false;
          this.isConnecting = false;

          // Handle different error states
          if (this.eventSource.readyState === EventSource.CLOSED) {
            console.log(`🔌 SSE Connection closed by server for ${this.userType}`);
            this.emit('disconnected');
          } else if (this.eventSource.readyState === EventSource.CONNECTING) {
            console.log(`🔄 SSE Reconnecting for ${this.userType}`);
          }

          // Auto-reconnect with exponential backoff
          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect();
          } else {
            console.error(`🚫 Max reconnection attempts reached for ${this.userType}`);
            this.emit('max_reconnect_attempts');
            reject(new Error(`Max reconnection attempts reached for ${this.userType}`));
          }
        };

      } catch (error) {
        console.error('Failed to create SSE connection:', error);
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  /**
   * Poll for new notifications and updates
   */
  async pollNotifications() {
    try {
      const token = this.userType === 'admin'
        ? localStorage.getItem('adminToken')
        : localStorage.getItem('clientToken');

      if (!token) return;

      // Get unread count
      const response = await fetch(`${this.baseURL}/notifications/unread-count`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const count = data.data?.count || data.count || 0;

        // Only emit if count changed or every 10th poll
        if (!this.lastCount || this.lastCount !== count || this.pollCount % 10 === 0) {
          this.emit('notification', {
            type: 'unread_count_update',
            count: count,
            timestamp: new Date().toISOString()
          });
          this.lastCount = count;
        }

        this.pollCount = (this.pollCount || 0) + 1;
      }
    } catch (error) {
      console.error('Failed to poll notifications:', error);
    }
  }

  /**
   * Disconnect from SSE (Google/Mozilla standard)
   */
  disconnect() {
    console.log('🔌 Disconnecting SSE connection');

    this.isConnected = false;
    this.isConnecting = false;

    // Clear any reconnection timers
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    // Close EventSource properly
    if (this.eventSource) {
      console.log('🔌 Closing EventSource');
      this.eventSource.close();
      this.eventSource = null;
    }

    // Clear global references
    if (window.__sseConnection) {
      delete window.__sseConnection;
    }
    if (window.__notificationEventSource) {
      delete window.__notificationEventSource;
    }

    // Clean up any polling fallback
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }

    console.log('✅ SSE Disconnected cleanly');
    this.emit('disconnected');
  }

  /**
   * Schedule reconnection with exponential backoff and user context awareness
   */
  scheduleReconnect(userType = null) {
    const contextType = userType || this.currentUserType || this.detectUserContext();

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('🚫 Max reconnection attempts reached for:', contextType);
      this.emit('max_reconnect_attempts', { userType: contextType });
      return;
    }

    this.reconnectAttempts++;

    // Exponential backoff: 1s, 2s, 4s, 8s, 16s, max 30s
    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
      this.maxReconnectDelay
    );

    console.log(`🔄 Scheduling reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} for ${contextType} in ${delay}ms`);

    this.reconnectTimer = setTimeout(() => {
      const context = this.userContexts.get(contextType);
      if (context && !context.isConnected && !this.isConnecting) {
        console.log(`🔄 Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts} for ${contextType}`);
        this.connect(contextType).catch(error => {
          console.error('Reconnection failed for', contextType, ':', error);
        });
      }
    }, delay);
  }

  /**
   * Handle incoming notification for this specific user type
   */
  handleNotification(notification) {
    console.log(`📢 ${this.userType} service processing notification:`, notification);

    // Double-check recipient type (should already be filtered in onmessage)
    if (notification.recipient_type && notification.recipient_type !== this.userType) {
      console.warn(`🚫 ${this.userType} service received wrong notification type:`, notification.recipient_type);
      return;
    }

    // Emit to specific type listeners
    this.emit(notification.type, notification);

    // Emit to general notification listeners
    this.emit('notification', notification);

    // Show browser notification if permission granted
    this.showBrowserNotification(notification);
  }

  /**
   * Show browser notification
   */
  showBrowserNotification(notification) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const options = {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: `notification-${notification.id}`,
        requireInteraction: notification.priority === 'high' || notification.priority === 'urgent'
      };

      const browserNotification = new Notification(notification.title, options);
      
      browserNotification.onclick = () => {
        window.focus();
        this.emit('notification_click', notification);
        browserNotification.close();
      };

      // Auto close after 5 seconds for normal priority
      if (notification.priority !== 'high' && notification.priority !== 'urgent') {
        setTimeout(() => {
          browserNotification.close();
        }, 5000);
      }
    }
  }

  /**
   * Request browser notification permission
   */
  async requestNotificationPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  /**
   * Subscribe to notification events (context-aware)
   */
  on(event, callback, userType = null) {
    const contextType = userType || this.activeContext || this.detectUserContext();

    // Ensure userContexts is initialized (safety check)
    if (!this.userContexts) {
      this.userContexts = new Map();
    }

    // Use global listeners for backward compatibility
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    // Also store in context-specific listeners if context is available
    if (contextType && this.userContexts.has(contextType)) {
      const context = this.userContexts.get(contextType);
      if (!context.listeners.has(event)) {
        context.listeners.set(event, new Set());
      }
      context.listeners.get(event).add(callback);

      console.log('📝 Event listener registered for', contextType, ':', event);
    }
  }

  /**
   * Unsubscribe from notification events (context-aware)
   */
  off(event, callback, userType = null) {
    const contextType = userType || this.activeContext || this.detectUserContext();

    // Ensure userContexts is initialized (safety check)
    if (!this.userContexts) {
      this.userContexts = new Map();
    }

    // Remove from global listeners
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }

    // Remove from context-specific listeners
    if (contextType && this.userContexts.has(contextType)) {
      const context = this.userContexts.get(contextType);
      if (context.listeners.has(event)) {
        context.listeners.get(event).delete(callback);
      }

      console.log('🗑️ Event listener removed for', contextType, ':', event);
    }
  }

  /**
   * Emit event to listeners (context-aware)
   */
  emit(event, data = null, context = null) {
    const contextType = context?.userType || this.activeContext;

    // Ensure userContexts is initialized (safety check)
    if (!this.userContexts) {
      this.userContexts = new Map();
    }

    // Always emit to global listeners for backward compatibility
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data, context);
        } catch (error) {
          console.error(`Error in global notification listener for ${event}:`, error);
        }
      });
    }

    // Also emit to context-specific listeners if context is available
    if (contextType && this.userContexts.has(contextType)) {
      const userContext = this.userContexts.get(contextType);
      if (userContext.listeners.has(event)) {
        userContext.listeners.get(event).forEach(callback => {
          try {
            callback(data, context);
          } catch (error) {
            console.error(`Error in ${contextType} notification listener for ${event}:`, error);
          }
        });
      }
    }
  }

  /**
   * Get notifications for this specific user type
   */
  async getNotifications(page = 1, limit = 20, unreadOnly = false) {
    try {
      this.validateContext();
      const token = this.getAuthToken();

      console.log(`🔍 Getting notifications for ${this.userType}:`, { page, limit, unread_only: unreadOnly });

      if (!token) {
        throw new Error(`No authentication token found for ${this.userType}`);
      }

      const response = await axios.get(`${this.baseURL}/notifications`, {
        params: { page, limit, unread_only: unreadOnly },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log(`✅ ${this.userType} notifications retrieved:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to get ${this.userType} notifications:`, error);
      throw error;
    }
  }

  /**
   * Get unread notification count for this specific user type
   */
  async getUnreadCount() {
    try {
      this.validateContext();
      const token = this.getAuthToken();

      console.log(`🔍 Getting unread count for ${this.userType}`);

      if (!token) {
        throw new Error(`No authentication token found for ${this.userType}`);
      }

      const response = await axios.get(`${this.baseURL}/notifications/unread-count`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log(`✅ ${this.userType} unread count response:`, response.data);

      // Handle different response formats
      let count = 0;
      if (response.data && response.data.data && typeof response.data.data.count !== 'undefined') {
        count = response.data.data.count;
        console.log('📊 NotificationService: Found count in data.data.count:', count);
      } else if (response.data && typeof response.data.count !== 'undefined') {
        count = response.data.count;
        console.log('📊 NotificationService: Found count in data.count:', count);
      } else {
        count = 0;
        console.log('⚠️ NotificationService: No count found, defaulting to 0');
      }

      return count;
    } catch (error) {
      console.error('❌ NotificationService: Failed to get unread count:', error);
      if (error.response) {
        console.error('📊 NotificationService: Error response status:', error.response.status);
        console.error('📊 NotificationService: Error response data:', error.response.data);
      }
      throw error;
    }
  }

  /**
   * Mark notification as read for this specific user type
   */
  async markAsRead(notificationId) {
    try {
      if (!notificationId || notificationId === 'undefined') {
        throw new Error('Invalid notification ID provided');
      }

      this.validateContext();
      const token = this.getAuthToken();

      if (!token) {
        throw new Error(`No authentication token found for ${this.userType}`);
      }

      console.log(`Marking notification as read for ${this.userType}:`, notificationId);

      const response = await axios.put(`${this.baseURL}/notifications/${notificationId}/read`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to mark ${this.userType} notification as read:`, error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read for this specific user type
   */
  async markAllAsRead() {
    try {
      this.validateContext();
      const token = this.getAuthToken();

      if (!token) {
        throw new Error(`No authentication token found for ${this.userType}`);
      }

      console.log(`Marking all notifications as read for ${this.userType}`);

      const response = await axios.put(`${this.baseURL}/notifications/mark-all-read`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to mark all ${this.userType} notifications as read:`, error);
      throw error;
    }
  }

  /**
   * Send test notification (admin only)
   */
  async sendTestNotification(data) {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.post(`${this.baseURL}/notifications/test`, data, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to send test notification:', error);
      throw error;
    }
  }

  /**
   * Get notification statistics (admin only)
   */
  async getStatistics() {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${this.baseURL}/notifications/statistics`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get notification statistics:', error);
      throw error;
    }
  }

  /**
   * Test SSE connection (for debugging)
   */
  async testConnection() {
    console.log('🧪 Testing SSE connection...');

    try {
      // Clear any existing connection
      if (this.eventSource) {
        console.log('🧪 Clearing existing connection');
        this.eventSource.close();
        this.eventSource = null;
        this.isConnected = false;
        this.isConnecting = false;
      }

      // Reset state
      this.connectionRefs = 1;

      // Test connection
      await this.connect('admin');

      console.log('🧪 Test connection established');

      // Keep connection alive for 10 seconds
      setTimeout(() => {
        console.log('🧪 Test completed, keeping connection');
      }, 10000);

    } catch (error) {
      console.error('🧪 Test connection failed:', error);
    }
  }

  /**
   * Clean up old notifications (admin only)
   */
  async cleanupOldNotifications(days = 90) {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.delete(`${this.baseURL}/notifications/cleanup`, {
        params: { days },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to cleanup old notifications:', error);
      throw error;
    }
  }
}

/**
 * Factory function to create context-specific notification services
 */
function createNotificationService(userType) {
  if (!userType || !['admin', 'client'].includes(userType)) {
    throw new Error(`Invalid user type: ${userType}. Must be 'admin' or 'client'`);
  }

  return new ContextualNotificationService(userType);
}

/**
 * Global service instances (created on demand)
 */
let adminNotificationService = null;
let clientNotificationService = null;

/**
 * Get or create admin notification service
 */
function getAdminNotificationService() {
  if (!adminNotificationService) {
    adminNotificationService = createNotificationService('admin');
    window.__adminNotificationService = adminNotificationService;
  }
  return adminNotificationService;
}

/**
 * Get or create client notification service
 */
function getClientNotificationService() {
  if (!clientNotificationService) {
    clientNotificationService = createNotificationService('client');
    window.__clientNotificationService = clientNotificationService;
  }
  return clientNotificationService;
}

/**
 * Legacy compatibility - returns service based on current auth state
 */
function getLegacyNotificationService() {
  const adminToken = localStorage.getItem('adminToken');
  const clientToken = localStorage.getItem('clientToken');

  // Prioritize admin if both are present
  if (adminToken) {
    return getAdminNotificationService();
  }

  if (clientToken) {
    return getClientNotificationService();
  }

  // Default to admin for backward compatibility
  return getAdminNotificationService();
}

// Export the factory and getters
export {
  createNotificationService,
  getAdminNotificationService,
  getClientNotificationService,
  ContextualNotificationService
};

// Default export for backward compatibility
export default getLegacyNotificationService();

// Make services available globally for debugging
window.__createNotificationService = createNotificationService;
window.__getAdminNotificationService = getAdminNotificationService;
window.__getClientNotificationService = getClientNotificationService;
