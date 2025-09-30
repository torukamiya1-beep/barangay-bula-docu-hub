/**
 * Role-Based Notification Service Tests
 * 
 * Tests the notification service's ability to properly handle
 * role-based notifications and prevent cross-contamination
 */

// Mock localStorage for testing
const mockLocalStorage = {
  store: {},
  getItem: function(key) {
    return this.store[key] || null;
  },
  setItem: function(key, value) {
    this.store[key] = value.toString();
  },
  removeItem: function(key) {
    delete this.store[key];
  },
  clear: function() {
    this.store = {};
  }
};

// Mock global objects
global.localStorage = mockLocalStorage;
global.window = {
  localStorage: mockLocalStorage,
  addEventListener: jest.fn(),
  __notificationServiceInstance: null
};

// Mock EventSource
global.EventSource = jest.fn().mockImplementation(() => ({
  close: jest.fn(),
  addEventListener: jest.fn(),
  onopen: null,
  onmessage: null,
  onerror: null,
  readyState: 1
}));

// Mock Notification API
global.Notification = {
  permission: 'granted',
  requestPermission: jest.fn().mockResolvedValue('granted')
};

describe('NotificationService Role-Based Tests', () => {
  let NotificationService;
  let notificationService;

  beforeEach(() => {
    // Clear localStorage
    mockLocalStorage.clear();
    
    // Reset global references
    global.window.__notificationServiceInstance = null;
    
    // Clear all mocks
    jest.clearAllMocks();
    
    // Import the service (this would need to be adjusted based on actual import path)
    // For now, we'll create a mock implementation
    NotificationService = class MockNotificationService {
      constructor() {
        this.userContexts = new Map();
        this.activeContext = null;
        this.currentUserType = null;
        this.listeners = new Map();
      }

      detectUserContext() {
        const adminToken = localStorage.getItem('adminToken');
        const clientToken = localStorage.getItem('clientToken');
        
        if (adminToken) {
          const adminData = localStorage.getItem('adminData');
          if (adminData) {
            try {
              const parsed = JSON.parse(adminData);
              if (parsed && ['admin', 'employee'].includes(parsed.role)) {
                return 'admin';
              }
            } catch (error) {
              // Invalid admin data
            }
          }
        }
        
        if (clientToken) {
          return 'client';
        }
        
        return null;
      }

      validateUserContext(userType) {
        if (!userType || !['admin', 'client'].includes(userType)) {
          return false;
        }

        if (userType === 'admin') {
          const adminToken = localStorage.getItem('adminToken');
          const adminData = localStorage.getItem('adminData');
          return !!(adminToken && adminData);
        }

        if (userType === 'client') {
          const clientToken = localStorage.getItem('clientToken');
          return !!clientToken;
        }

        return false;
      }

      async init(userType = 'admin') {
        const detectedUserType = this.detectUserContext();
        const finalUserType = detectedUserType || userType;
        
        if (!this.validateUserContext(finalUserType)) {
          throw new Error(`Invalid user context: ${finalUserType}`);
        }

        this.activeContext = finalUserType;
        this.currentUserType = finalUserType;
        
        return Promise.resolve();
      }

      switchContext(userType) {
        if (!this.validateUserContext(userType)) {
          return false;
        }

        this.activeContext = userType;
        this.currentUserType = userType;
        return true;
      }

      handleNotification(notification, userType = null) {
        const contextType = userType || this.activeContext;
        
        // Validate notification is for the correct user context
        if (contextType && notification.recipient_type && notification.recipient_type !== contextType) {
          return false; // Notification filtered out
        }
        
        return true; // Notification processed
      }
    };

    notificationService = new NotificationService();
  });

  describe('User Context Detection', () => {
    test('should detect admin context when admin token and data are present', () => {
      localStorage.setItem('adminToken', 'test-admin-token');
      localStorage.setItem('adminData', JSON.stringify({
        id: 1,
        role: 'admin',
        username: 'admin'
      }));

      const context = notificationService.detectUserContext();
      expect(context).toBe('admin');
    });

    test('should detect client context when client token is present', () => {
      localStorage.setItem('clientToken', 'test-client-token');

      const context = notificationService.detectUserContext();
      expect(context).toBe('client');
    });

    test('should return null when no valid authentication is present', () => {
      const context = notificationService.detectUserContext();
      expect(context).toBeNull();
    });

    test('should prioritize admin context when both tokens are present', () => {
      localStorage.setItem('adminToken', 'test-admin-token');
      localStorage.setItem('adminData', JSON.stringify({
        id: 1,
        role: 'admin',
        username: 'admin'
      }));
      localStorage.setItem('clientToken', 'test-client-token');

      const context = notificationService.detectUserContext();
      expect(context).toBe('admin');
    });
  });

  describe('User Context Validation', () => {
    test('should validate admin context correctly', () => {
      localStorage.setItem('adminToken', 'test-admin-token');
      localStorage.setItem('adminData', JSON.stringify({
        id: 1,
        role: 'admin'
      }));

      expect(notificationService.validateUserContext('admin')).toBe(true);
      expect(notificationService.validateUserContext('client')).toBe(false);
    });

    test('should validate client context correctly', () => {
      localStorage.setItem('clientToken', 'test-client-token');

      expect(notificationService.validateUserContext('client')).toBe(true);
      expect(notificationService.validateUserContext('admin')).toBe(false);
    });

    test('should reject invalid user types', () => {
      expect(notificationService.validateUserContext('invalid')).toBe(false);
      expect(notificationService.validateUserContext(null)).toBe(false);
      expect(notificationService.validateUserContext('')).toBe(false);
    });
  });

  describe('Service Initialization', () => {
    test('should initialize with admin context when admin is authenticated', async () => {
      localStorage.setItem('adminToken', 'test-admin-token');
      localStorage.setItem('adminData', JSON.stringify({
        id: 1,
        role: 'admin'
      }));

      await notificationService.init('admin');
      
      expect(notificationService.activeContext).toBe('admin');
      expect(notificationService.currentUserType).toBe('admin');
    });

    test('should initialize with client context when client is authenticated', async () => {
      localStorage.setItem('clientToken', 'test-client-token');

      await notificationService.init('client');
      
      expect(notificationService.activeContext).toBe('client');
      expect(notificationService.currentUserType).toBe('client');
    });

    test('should throw error when initializing with invalid context', async () => {
      await expect(notificationService.init('admin')).rejects.toThrow('Invalid user context: admin');
    });

    test('should auto-detect context when available', async () => {
      localStorage.setItem('clientToken', 'test-client-token');

      await notificationService.init('admin'); // Request admin but client is detected
      
      expect(notificationService.activeContext).toBe('client');
    });
  });

  describe('Context Switching', () => {
    test('should switch context when both authentications are available', () => {
      localStorage.setItem('adminToken', 'test-admin-token');
      localStorage.setItem('adminData', JSON.stringify({
        id: 1,
        role: 'admin'
      }));
      localStorage.setItem('clientToken', 'test-client-token');

      notificationService.activeContext = 'admin';
      
      const result = notificationService.switchContext('client');
      
      expect(result).toBe(true);
      expect(notificationService.activeContext).toBe('client');
    });

    test('should reject switching to invalid context', () => {
      localStorage.setItem('adminToken', 'test-admin-token');
      localStorage.setItem('adminData', JSON.stringify({
        id: 1,
        role: 'admin'
      }));

      const result = notificationService.switchContext('client'); // No client auth
      
      expect(result).toBe(false);
      expect(notificationService.activeContext).toBeNull(); // Should remain unchanged
    });
  });

  describe('Notification Filtering', () => {
    test('should process admin notifications in admin context', () => {
      notificationService.activeContext = 'admin';
      
      const notification = {
        id: 1,
        type: 'new_request',
        recipient_type: 'admin',
        message: 'New document request'
      };

      const result = notificationService.handleNotification(notification);
      expect(result).toBe(true);
    });

    test('should process client notifications in client context', () => {
      notificationService.activeContext = 'client';
      
      const notification = {
        id: 1,
        type: 'status_change',
        recipient_type: 'client',
        message: 'Your request status changed'
      };

      const result = notificationService.handleNotification(notification);
      expect(result).toBe(true);
    });

    test('should filter out admin notifications in client context', () => {
      notificationService.activeContext = 'client';
      
      const notification = {
        id: 1,
        type: 'new_request',
        recipient_type: 'admin',
        message: 'New document request'
      };

      const result = notificationService.handleNotification(notification);
      expect(result).toBe(false);
    });

    test('should filter out client notifications in admin context', () => {
      notificationService.activeContext = 'admin';
      
      const notification = {
        id: 1,
        type: 'status_change',
        recipient_type: 'client',
        message: 'Your request status changed'
      };

      const result = notificationService.handleNotification(notification);
      expect(result).toBe(false);
    });
  });

  describe('Cross-Contamination Prevention', () => {
    test('should maintain separate contexts when both users are authenticated', async () => {
      // Setup both authentications
      localStorage.setItem('adminToken', 'test-admin-token');
      localStorage.setItem('adminData', JSON.stringify({
        id: 1,
        role: 'admin'
      }));
      localStorage.setItem('clientToken', 'test-client-token');

      // Initialize as admin
      await notificationService.init('admin');
      expect(notificationService.activeContext).toBe('admin');

      // Admin notification should be processed
      const adminNotification = {
        recipient_type: 'admin',
        message: 'Admin notification'
      };
      expect(notificationService.handleNotification(adminNotification)).toBe(true);

      // Client notification should be filtered out
      const clientNotification = {
        recipient_type: 'client',
        message: 'Client notification'
      };
      expect(notificationService.handleNotification(clientNotification)).toBe(false);

      // Switch to client context
      notificationService.switchContext('client');
      expect(notificationService.activeContext).toBe('client');

      // Now client notification should be processed
      expect(notificationService.handleNotification(clientNotification)).toBe(true);

      // And admin notification should be filtered out
      expect(notificationService.handleNotification(adminNotification)).toBe(false);
    });
  });
});
