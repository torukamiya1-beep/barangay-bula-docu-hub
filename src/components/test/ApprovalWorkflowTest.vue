<template>
  <div class="approval-workflow-test">
    <div class="container-fluid">
      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h3>🧪 Admin Approval/Rejection Workflow Test</h3>
              <p class="text-muted">Test the complete admin approval/rejection system with real-time notifications</p>
            </div>
            <div class="card-body">
              
              <!-- Test Controls -->
              <div class="test-controls mb-4">
                <h5>Test Controls</h5>
                <div class="btn-group" role="group">
                  <button class="btn btn-primary" @click="loadTestRequests">
                    <i class="fas fa-refresh"></i> Load Test Requests
                  </button>
                  <button class="btn btn-success" @click="testSSEConnection">
                    <i class="fas fa-plug"></i> Test SSE Connection
                  </button>
                  <button class="btn btn-info" @click="clearLogs">
                    <i class="fas fa-trash"></i> Clear Logs
                  </button>
                </div>
              </div>

              <!-- Test Requests -->
              <div class="test-requests mb-4">
                <h5>Test Document Requests</h5>
                <div class="table-responsive">
                  <table class="table table-striped">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Request Number</th>
                        <th>Document Type</th>
                        <th>Client</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="request in testRequests" :key="request.id">
                        <td>{{ request.id }}</td>
                        <td>{{ request.request_number }}</td>
                        <td>{{ request.document_type }}</td>
                        <td>{{ request.client_name }}</td>
                        <td>
                          <span class="badge" :class="getStatusBadgeClass(request.status)">
                            {{ request.status }}
                          </span>
                        </td>
                        <td>
                          <div class="btn-group btn-group-sm">
                            <button 
                              v-if="canApprove(request)"
                              class="btn btn-success" 
                              @click="testApprove(request)"
                            >
                              ✅ Approve
                            </button>
                            <button 
                              v-if="canReject(request)"
                              class="btn btn-danger" 
                              @click="testReject(request)"
                            >
                              ❌ Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Real-time Logs -->
              <div class="realtime-logs">
                <h5>Real-time Event Logs</h5>
                <div class="logs-container">
                  <div 
                    v-for="(log, index) in eventLogs" 
                    :key="index"
                    class="log-entry"
                    :class="log.type"
                  >
                    <span class="log-timestamp">{{ log.timestamp }}</span>
                    <span class="log-message">{{ log.message }}</span>
                  </div>
                  <div v-if="eventLogs.length === 0" class="text-muted text-center py-3">
                    No events logged yet. Start testing to see real-time updates.
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import adminDocumentService from '@/services/adminDocumentService';
import notificationService from '@/services/notificationService';

export default {
  name: 'ApprovalWorkflowTest',
  data() {
    return {
      testRequests: [],
      eventLogs: [],
      loading: false
    };
  },
  
  async mounted() {
    await this.initializeTest();
  },
  
  beforeUnmount() {
    this.cleanup();
  },
  
  methods: {
    async initializeTest() {
      this.addLog('info', '🚀 Initializing approval workflow test...');
      
      try {
        // Initialize SSE connection
        await notificationService.init('admin');
        this.addLog('success', '✅ SSE connection initialized');
        
        // Set up event listeners
        notificationService.on('notification', this.handleNotification);
        notificationService.on('status_change', this.handleStatusChange);
        
        // Load test data
        await this.loadTestRequests();
        
      } catch (error) {
        this.addLog('error', `❌ Failed to initialize test: ${error.message}`);
      }
    },
    
    cleanup() {
      notificationService.off('notification', this.handleNotification);
      notificationService.off('status_change', this.handleStatusChange);
      notificationService.cleanup();
    },
    
    async loadTestRequests() {
      this.addLog('info', '📋 Loading test requests...');
      
      try {
        const response = await adminDocumentService.getRequests({
          page: 1,
          limit: 10,
          status: 'pending'
        });
        
        if (response.success && response.data) {
          this.testRequests = response.data.requests || [];
          this.addLog('success', `✅ Loaded ${this.testRequests.length} test requests`);
        }
      } catch (error) {
        this.addLog('error', `❌ Failed to load requests: ${error.message}`);
      }
    },
    
    async testSSEConnection() {
      this.addLog('info', '🔌 Testing SSE connection...');
      
      try {
        await notificationService.connect('admin');
        this.addLog('success', '✅ SSE connection test successful');
      } catch (error) {
        this.addLog('error', `❌ SSE connection test failed: ${error.message}`);
      }
    },
    
    async testApprove(request) {
      this.addLog('info', `✅ Testing approval for request ${request.request_number}...`);
      
      try {
        const response = await adminDocumentService.approveRequest(request.id, {
          reason: 'Test approval from workflow test'
        });
        
        if (response.success) {
          this.addLog('success', `✅ Request ${request.request_number} approved successfully`);
          await this.loadTestRequests(); // Refresh list
        }
      } catch (error) {
        this.addLog('error', `❌ Failed to approve request: ${error.message}`);
      }
    },
    
    async testReject(request) {
      this.addLog('info', `❌ Testing rejection for request ${request.request_number}...`);
      
      try {
        const response = await adminDocumentService.rejectRequest(request.id, {
          reason: 'Test rejection from workflow test - missing required documents'
        });
        
        if (response.success) {
          this.addLog('success', `✅ Request ${request.request_number} rejected successfully`);
          await this.loadTestRequests(); // Refresh list
        }
      } catch (error) {
        this.addLog('error', `❌ Failed to reject request: ${error.message}`);
      }
    },
    
    handleNotification(notification) {
      this.addLog('notification', `🔔 Notification: ${JSON.stringify(notification)}`);
    },
    
    handleStatusChange(data) {
      this.addLog('status', `📊 Status Change: Request ${data.request_id} → ${data.new_status}`);
    },
    
    canApprove(request) {
      return ['pending', 'under_review'].includes(request.status);
    },
    
    canReject(request) {
      return ['pending', 'under_review', 'approved'].includes(request.status);
    },
    
    getStatusBadgeClass(status) {
      const classes = {
        'pending': 'badge-warning',
        'approved': 'badge-success',
        'rejected': 'badge-danger',
        'processing': 'badge-info',
        'completed': 'badge-primary'
      };
      return classes[status] || 'badge-secondary';
    },
    
    addLog(type, message) {
      this.eventLogs.unshift({
        type,
        message,
        timestamp: new Date().toLocaleTimeString()
      });
      
      // Keep only last 50 logs
      if (this.eventLogs.length > 50) {
        this.eventLogs = this.eventLogs.slice(0, 50);
      }
    },
    
    clearLogs() {
      this.eventLogs = [];
      this.addLog('info', '🧹 Logs cleared');
    }
  }
};
</script>

<style scoped>
.approval-workflow-test {
  padding: 2rem;
}

.logs-container {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  padding: 1rem;
  background: #f8f9fa;
}

.log-entry {
  display: flex;
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  border-radius: 0.25rem;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
}

.log-entry.info { background: #e3f2fd; border-left: 3px solid #2196f3; }
.log-entry.success { background: #e8f5e8; border-left: 3px solid #4caf50; }
.log-entry.error { background: #ffebee; border-left: 3px solid #f44336; }
.log-entry.notification { background: #fff3e0; border-left: 3px solid #ff9800; }
.log-entry.status { background: #f3e5f5; border-left: 3px solid #9c27b0; }

.log-timestamp {
  font-weight: bold;
  margin-right: 1rem;
  min-width: 80px;
}

.log-message {
  flex: 1;
}

.test-controls {
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 1rem;
}

.test-requests {
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 1rem;
}
</style>
