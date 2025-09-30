<template>
  <div class="residency-review">
    <AdminHeader
      :userName="adminData?.first_name || 'Admin'"
      :showUserDropdown="showUserDropdown"
      :sidebarCollapsed="sidebarCollapsed"
      :activeMenu="activeMenu"
      @sidebar-toggle="handleSidebarToggle"
      @user-dropdown-toggle="handleUserDropdownToggle"
      @menu-action="handleMenuAction"
      @logout="handleLogout"
    />

    <!-- Mobile Overlay -->
    <div
      class="mobile-overlay"
      :class="{ active: !sidebarCollapsed && isMobile }"
      @click="closeMobileSidebar"
    ></div>

    <div class="dashboard-container">
      <AdminSidebar
        :collapsed="sidebarCollapsed"
        :activeMenu="activeMenu"
        @menu-change="handleMenuChange"
        @logout="handleLogout"
        @toggle-sidebar="handleSidebarToggle"
      />

      <main class="main-content" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
        <div class="container-fluid p-4">
          <!-- Page Header -->
          <div class="row mb-4">
            <div class="col-12">
              <div class="d-flex justify-content-between align-items-center flex-wrap">
                <div>
                  <h1 class="h3 mb-0 text-gray-800">Residency Verification</h1>
                  <p class="text-muted">Review and approve client residency documents</p>
                </div>
                <div class="d-flex gap-2">
                  <button class="btn btn-outline-success btn-sm" @click="loadPendingVerifications" :disabled="loading">
                    <i class="fas fa-sync-alt me-1" :class="{ 'fa-spin': loading }"></i>
                    Refresh
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Statistics Cards -->
          <div class="row mb-4">
            <div class="col-xl-3 col-md-6 mb-4">
              <div class="card border-left-warning shadow h-100 py-2">
                <div class="card-body">
                  <div class="row no-gutters align-items-center">
                    <div class="col mr-2">
                      <div class="text-xs font-weight-bold text-warning text-uppercase mb-1">
                        Pending Review
                      </div>
                      <div class="h5 mb-0 font-weight-bold text-gray-800">
                        {{ pendingCount }}
                      </div>
                    </div>
                    <div class="col-auto">
                      <i class="fas fa-clock fa-2x text-gray-300"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="sr-only">Loading...</span>
            </div>
            <p class="mt-2 text-muted">Loading pending verifications...</p>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="alert alert-danger" role="alert">
            <i class="fas fa-exclamation-triangle me-2"></i>
            {{ error }}
          </div>

          <!-- Pending Verifications Table -->
          <div v-else class="card shadow mb-4">
            <div class="card-header py-3">
              <h6 class="m-0 font-weight-bold text-primary">Pending Residency Verifications</h6>
            </div>
            <div class="card-body">
              <div v-if="pendingVerifications.length === 0" class="text-center py-4">
                <i class="fas fa-check-circle fa-3x text-success mb-3"></i>
                <h5 class="text-muted">No Pending Verifications</h5>
                <p class="text-muted">All residency documents have been reviewed.</p>
              </div>
              <div v-else class="table-responsive">
                <table class="table table-bordered" width="100%" cellspacing="0">
                  <thead>
                    <tr>
                      <th>Client</th>
                      <th>Registration Date</th>
                      <th>Documents</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="verification in pendingVerifications" :key="verification.account_id">
                      <td>
                        <div class="d-flex align-items-center">
                          <div class="ms-3">
                            <div class="fw-bold">{{ getFullName(verification) }}</div>
                            <div class="text-muted small">{{ verification.username }}</div>
                            <div class="text-muted small">{{ verification.email }}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div class="small">
                          {{ formatDate(verification.registration_date) }}
                        </div>
                      </td>
                      <td>
                        <span class="badge bg-info">{{ verification.document_count }} documents</span>
                      </td>
                      <td>
                        <span class="badge" :class="getStatusBadgeClass(verification.account_status)">
                          {{ formatStatus(verification.account_status) }}
                        </span>
                      </td>
                      <td>
                        <button 
                          class="btn btn-primary btn-sm me-2" 
                          @click="reviewDocuments(verification)"
                          :disabled="loading"
                        >
                          <i class="fas fa-eye me-1"></i>
                          Review
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Document Review Modal -->
    <DocumentReviewModal
      v-if="showReviewModal"
      :client="selectedClient"
      :documents="clientDocuments"
      @close="closeReviewModal"
      @approve="handleApprove"
      @reject="handleReject"
    />
  </div>
</template>

<script>
import AdminHeader from './AdminHeader.vue';
import AdminSidebar from './AdminSidebar.vue';
import DocumentReviewModal from './DocumentReviewModal.vue';
import { adminDashboard } from './js/adminDashboard.js';

export default {
  name: 'ResidencyReview',
  components: {
    AdminHeader,
    AdminSidebar,
    DocumentReviewModal
  },
  mixins: [adminDashboard],
  data() {
    return {
      pendingVerifications: [],
      pendingCount: 0,
      loading: false,
      error: null,
      showReviewModal: false,
      selectedClient: null,
      clientDocuments: []
    };
  },
  async mounted() {
    await this.loadPendingVerifications();
  },
  methods: {
    async loadPendingVerifications() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await this.$http.get('/api/residency/pending', {
          headers: {
            'Authorization': `Bearer ${this.$store.getters.getToken}`
          }
        });

        if (response.data.success) {
          this.pendingVerifications = response.data.data;
          this.pendingCount = response.data.data.length;
        } else {
          this.error = response.data.message || 'Failed to load pending verifications';
        }
      } catch (error) {
        console.error('Error loading pending verifications:', error);
        this.error = error.response?.data?.message || 'Failed to load pending verifications';
      } finally {
        this.loading = false;
      }
    },

    async reviewDocuments(client) {
      this.loading = true;
      
      try {
        const response = await this.$http.get(`/api/residency/documents/${client.account_id}`, {
          headers: {
            'Authorization': `Bearer ${this.$store.getters.getToken}`
          }
        });

        if (response.data.success) {
          this.selectedClient = client;
          this.clientDocuments = response.data.data;
          this.showReviewModal = true;
        } else {
          this.error = response.data.message || 'Failed to load client documents';
        }
      } catch (error) {
        console.error('Error loading client documents:', error);
        this.error = error.response?.data?.message || 'Failed to load client documents';
      } finally {
        this.loading = false;
      }
    },

    closeReviewModal() {
      this.showReviewModal = false;
      this.selectedClient = null;
      this.clientDocuments = [];
    },

    async handleApprove(accountId) {
      try {
        const response = await this.$http.post('/api/residency/approve', {
          account_id: accountId
        }, {
          headers: {
            'Authorization': `Bearer ${this.$store.getters.getToken}`
          }
        });

        if (response.data.success) {
          this.$toast.success('Residency verification approved successfully');
          this.closeReviewModal();
          await this.loadPendingVerifications();
        } else {
          this.$toast.error(response.data.message || 'Failed to approve verification');
        }
      } catch (error) {
        console.error('Error approving verification:', error);
        this.$toast.error(error.response?.data?.message || 'Failed to approve verification');
      }
    },

    async handleReject(data) {
      try {
        const response = await this.$http.post('/api/residency/reject', {
          account_id: data.accountId,
          rejection_reason: data.reason
        }, {
          headers: {
            'Authorization': `Bearer ${this.$store.getters.getToken}`
          }
        });

        if (response.data.success) {
          this.$toast.success('Residency verification rejected');
          this.closeReviewModal();
          await this.loadPendingVerifications();
        } else {
          this.$toast.error(response.data.message || 'Failed to reject verification');
        }
      } catch (error) {
        console.error('Error rejecting verification:', error);
        this.$toast.error(error.response?.data?.message || 'Failed to reject verification');
      }
    },

    getFullName(client) {
      const parts = [client.first_name, client.middle_name, client.last_name].filter(Boolean);
      return parts.join(' ') || client.username;
    },

    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    },

    formatStatus(status) {
      const statusMap = {
        'pending_residency_verification': 'Pending Review',
        'residency_rejected': 'Rejected'
      };
      return statusMap[status] || status;
    },

    getStatusBadgeClass(status) {
      const classMap = {
        'pending_residency_verification': 'bg-warning',
        'residency_rejected': 'bg-danger'
      };
      return classMap[status] || 'bg-secondary';
    }
  }
};
</script>

<style scoped>
.residency-review {
  min-height: 100vh;
  background-color: #f8f9fc;
}

.border-left-warning {
  border-left: 0.25rem solid #f6c23e !important;
}

.card {
  box-shadow: 0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.15) !important;
}

.table th {
  border-top: none;
  font-weight: 600;
  color: #5a5c69;
}

.badge {
  font-size: 0.75em;
}
</style>
