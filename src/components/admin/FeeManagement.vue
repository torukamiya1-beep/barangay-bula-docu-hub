<template>
  <div class="admin-fee-management">
    <AdminHeader
      :userName="adminData?.first_name || 'Admin'"
      :showUserDropdown="showUserDropdown"
      :sidebarCollapsed="sidebarCollapsed"
      :activeMenu="activeMenu"
      @sidebar-toggle="handleSidebarToggle"
      @user-dropdown-toggle="handleUserDropdownToggle"
      @menu-action="handleMenuAction"
      @logout="handleLogout"
      @open-user-modal="handleOpenUserModal"
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
          <div class="page-header mb-4">
            <h1 class="page-title">
              <i class="fas fa-money-bill-wave"></i>
              Document Fee Management
            </h1>
            <p class="page-subtitle">Manage dynamic pricing for document types</p>
          </div>

          <!-- Statistics Cards -->
          <div class="stats-grid mb-4" v-if="statistics">
            <div class="stat-card">
              <div class="stat-icon">
                <i class="fas fa-file-alt"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ statistics.total_document_types }}</div>
                <div class="stat-label">Document Types</div>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">
                <i class="fas fa-history"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ statistics.total_fee_changes }}</div>
                <div class="stat-label">Total Fee Changes</div>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">
                <i class="fas fa-peso-sign"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">₱{{ parseFloat(statistics.average_fee || 0).toFixed(2) }}</div>
                <div class="stat-label">Average Fee</div>
              </div>
            </div>
          </div>

          <!-- Document Fees Table -->
          <div class="fees-table-container">
      <div class="table-header">
        <h2 class="table-title">Current Document Fees</h2>
        <div class="table-actions">
          <button class="btn-refresh" @click="loadDocumentFees" :disabled="loading">
            <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
            Refresh
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading document fees...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <i class="fas fa-exclamation-triangle"></i>
        <p>{{ error }}</p>
        <button class="btn-retry" @click="loadDocumentFees">Try Again</button>
      </div>

      <!-- Fees Table -->
      <div v-else-if="documentFees.length > 0" class="table-wrapper">
        <table class="fees-table">
          <thead>
            <tr>
              <th>Document Type</th>
              <th>Description</th>
              <th>Current Fee</th>
              <th>Effective Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="fee in documentFees" :key="fee.document_type_id">
              <td class="document-type">
                <i class="fas fa-file-alt"></i>
                {{ fee.type_name }}
              </td>
              <td class="description">{{ fee.description || 'N/A' }}</td>
              <td class="fee-amount">
                <span class="amount">₱{{ parseFloat(fee.fee_amount || 0).toFixed(2) }}</span>
              </td>
              <td class="effective-date">
                {{ formatDate(fee.effective_date) }}
              </td>
              <td class="actions">
                <button 
                  class="btn-action btn-edit" 
                  @click="openEditModal(fee)"
                  title="Update Fee">
                  <i class="fas fa-edit"></i>
                  Update
                </button>
                <button 
                  class="btn-action btn-history" 
                  @click="viewHistory(fee)"
                  title="View History">
                  <i class="fas fa-history"></i>
                  History
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

            <!-- Empty State -->
            <div v-else class="empty-state">
              <i class="fas fa-inbox"></i>
              <p>No document fees found</p>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Edit Fee Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="closeEditModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Update Fee: {{ selectedFee?.type_name }}</h3>
          <button class="btn-close" @click="closeEditModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label>Current Fee</label>
            <div class="current-fee-display">
              ₱{{ parseFloat(selectedFee?.fee_amount || 0).toFixed(2) }}
            </div>
          </div>

          <div class="form-group">
            <label for="newFee">New Fee Amount *</label>
            <div class="input-group">
              <span class="input-prefix">₱</span>
              <input
                id="newFee"
                type="number"
                v-model.number="newFeeAmount"
                class="form-control"
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              />
            </div>
            <small class="form-hint">
              <i class="fas fa-info-circle"></i>
              This will only affect new requests. Existing requests keep their original fee.
            </small>
          </div>

          <div v-if="updateError" class="alert alert-error">
            <i class="fas fa-exclamation-circle"></i>
            {{ updateError }}
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeEditModal" :disabled="updating">
            Cancel
          </button>
          <button 
            class="btn btn-primary" 
            @click="updateFee" 
            :disabled="updating || !isValidFee">
            <i class="fas fa-save" :class="{ 'fa-spin': updating }"></i>
            {{ updating ? 'Updating...' : 'Update Fee' }}
          </button>
        </div>
      </div>
    </div>

    <!-- History Modal -->
    <div v-if="showHistoryModal" class="modal-overlay" @click.self="closeHistoryModal">
      <div class="modal-content modal-large">
        <div class="modal-header">
          <h3>Fee History: {{ selectedFee?.type_name }}</h3>
          <button class="btn-close" @click="closeHistoryModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div v-if="loadingHistory" class="loading-state">
            <div class="spinner"></div>
            <p>Loading history...</p>
          </div>

          <div v-else-if="feeHistory.length > 0" class="history-timeline">
            <div 
              v-for="item in feeHistory" 
              :key="item.id"
              class="history-item"
              :class="{ 'active': item.is_active }">
              <div class="history-marker">
                <i class="fas" :class="item.is_active ? 'fa-check-circle' : 'fa-circle'"></i>
              </div>
              <div class="history-content">
                <div class="history-header">
                  <span class="history-fee">₱{{ parseFloat(item.fee_amount).toFixed(2) }}</span>
                  <span v-if="item.is_active" class="badge badge-active">Current</span>
                  <span v-else class="badge badge-inactive">Previous</span>
                </div>
                <div class="history-date">
                  Effective: {{ formatDate(item.effective_date) }}
                </div>
                <div class="history-meta">
                  Created: {{ formatDate(item.created_at) }}
                </div>
              </div>
            </div>
          </div>

          <div v-else class="empty-state">
            <i class="fas fa-history"></i>
            <p>No history available</p>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeHistoryModal">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/utils/api';
import AdminHeader from './AdminHeader.vue';
import AdminSidebar from './AdminSidebar.vue';
import adminAuthService from '@/services/adminAuthService';

export default {
  name: 'FeeManagement',
  
  components: {
    AdminHeader,
    AdminSidebar
  },
  
  data() {
    return {
      // Admin layout data
      adminData: null,
      sidebarCollapsed: false,
      showUserDropdown: false,
      activeMenu: 'fee-management',
      isMobile: window.innerWidth <= 768,
      
      // Fee management data
      documentFees: [],
      statistics: null,
      loading: false,
      error: null,
      
      // Edit modal
      showEditModal: false,
      selectedFee: null,
      newFeeAmount: null,
      updating: false,
      updateError: null,
      
      // History modal
      showHistoryModal: false,
      feeHistory: [],
      loadingHistory: false
    };
  },

  computed: {
    isValidFee() {
      return this.newFeeAmount !== null && 
             this.newFeeAmount !== '' && 
             this.newFeeAmount >= 0 &&
             this.newFeeAmount !== parseFloat(this.selectedFee?.fee_amount || 0);
    }
  },

  async mounted() {
    await this.loadAdminData();
    this.loadDocumentFees();
    this.loadStatistics();
    
    // Handle window resize for mobile
    window.addEventListener('resize', this.handleResize);
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize);
  },

  methods: {
    // Admin layout methods
    async loadAdminData() {
      try {
        const response = await adminAuthService.getProfile();
        if (response.success) {
          this.adminData = response.data;
        }
      } catch (error) {
        console.error('Error loading admin data:', error);
      }
    },

    handleSidebarToggle() {
      this.sidebarCollapsed = !this.sidebarCollapsed;
    },

    handleUserDropdownToggle() {
      this.showUserDropdown = !this.showUserDropdown;
    },

    handleMenuChange(menu) {
      this.activeMenu = menu;
      this.$router.push(`/admin/${menu}`);
    },

    handleMenuAction(action) {
      if (action === 'profile') {
        this.$router.push('/admin/profile');
      } else if (action === 'settings') {
        this.$router.push('/admin/settings');
      }
    },

    handleLogout() {
      adminAuthService.logout();
      this.$router.push('/admin/login');
    },

    handleOpenUserModal() {
      // Handle user modal if needed
    },

    closeMobileSidebar() {
      if (this.isMobile) {
        this.sidebarCollapsed = true;
      }
    },

    handleResize() {
      this.isMobile = window.innerWidth <= 768;
      if (!this.isMobile) {
        this.sidebarCollapsed = false;
      }
    },

    // Fee management methods
    async loadDocumentFees() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await api.get('/document-fees');
        
        if (response.data.success) {
          this.documentFees = response.data.data;
        } else {
          this.error = response.data.message || 'Failed to load document fees';
        }
      } catch (error) {
        console.error('Error loading document fees:', error);
        this.error = error.response?.data?.message || 'Failed to load document fees';
      } finally {
        this.loading = false;
      }
    },

    async loadStatistics() {
      try {
        const response = await api.get('/document-fees/statistics');
        
        if (response.data.success) {
          this.statistics = response.data.data;
        }
      } catch (error) {
        console.error('Error loading statistics:', error);
      }
    },

    openEditModal(fee) {
      this.selectedFee = fee;
      this.newFeeAmount = parseFloat(fee.fee_amount || 0);
      this.updateError = null;
      this.showEditModal = true;
    },

    closeEditModal() {
      this.showEditModal = false;
      this.selectedFee = null;
      this.newFeeAmount = null;
      this.updateError = null;
    },

    async updateFee() {
      if (!this.isValidFee) return;

      this.updating = true;
      this.updateError = null;

      try {
        const response = await api.put(
          `/document-fees/${this.selectedFee.document_type_id}`,
          { fee_amount: this.newFeeAmount }
        );

        if (response.data.success) {
          // Show success message
          this.$emit('show-notification', {
            type: 'success',
            message: `Fee updated successfully for ${this.selectedFee.type_name}`
          });

          // Reload data
          await this.loadDocumentFees();
          await this.loadStatistics();
          
          this.closeEditModal();
        } else {
          this.updateError = response.data.message || 'Failed to update fee';
        }
      } catch (error) {
        console.error('Error updating fee:', error);
        this.updateError = error.response?.data?.message || 'Failed to update fee';
      } finally {
        this.updating = false;
      }
    },

    async viewHistory(fee) {
      this.selectedFee = fee;
      this.showHistoryModal = true;
      this.loadingHistory = true;
      this.feeHistory = [];

      try {
        const response = await api.get(`/document-fees/${fee.document_type_id}/history`);
        
        if (response.data.success) {
          this.feeHistory = response.data.data;
        }
      } catch (error) {
        console.error('Error loading fee history:', error);
      } finally {
        this.loadingHistory = false;
      }
    },

    closeHistoryModal() {
      this.showHistoryModal = false;
      this.selectedFee = null;
      this.feeHistory = [];
    },

    formatDate(dateString) {
      if (!dateString) return 'N/A';
      
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }
};
</script>

<style src="./css/adminDashboard.css"></style>
<style scoped src="./css/feeManagement.css"></style>
