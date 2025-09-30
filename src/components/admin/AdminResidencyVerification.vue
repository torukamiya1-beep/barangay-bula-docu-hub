<template>
  <div class="admin-residency-verification">
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
                  <h2 class="mb-1">
                    <i class="fas fa-home me-2 text-primary"></i>
                    Residency Verification
                  </h2>
                  <p class="text-muted mb-0">Review and approve resident verification requests</p>
                </div>
                <div class="d-flex gap-2">
                  <button class="btn btn-outline-primary btn-sm" @click="loadPendingVerifications" :disabled="loading">
                    <i class="fas fa-sync-alt me-1" :class="{ 'fa-spin': loading }"></i>
                    Refresh
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Statistics Cards -->
          <div class="row mb-4">
            <div class="col-md-3 col-sm-6 mb-3">
              <div class="card bg-warning text-white">
                <div class="card-body">
                  <div class="d-flex justify-content-between">
                    <div>
                      <h4 class="mb-0">{{ statistics.pending }}</h4>
                      <p class="mb-0">Pending Review</p>
                    </div>
                    <div class="align-self-center">
                      <i class="fas fa-clock fa-2x"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-md-3 col-sm-6 mb-3">
              <div class="card bg-success text-white">
                <div class="card-body">
                  <div class="d-flex justify-content-between">
                    <div>
                      <h4 class="mb-0">{{ statistics.approved }}</h4>
                      <p class="mb-0">Approved Today</p>
                    </div>
                    <div class="align-self-center">
                      <i class="fas fa-check-circle fa-2x"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-md-3 col-sm-6 mb-3">
              <div class="card bg-danger text-white">
                <div class="card-body">
                  <div class="d-flex justify-content-between">
                    <div>
                      <h4 class="mb-0">{{ statistics.rejected }}</h4>
                      <p class="mb-0">Rejected Today</p>
                    </div>
                    <div class="align-self-center">
                      <i class="fas fa-times-circle fa-2x"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-md-3 col-sm-6 mb-3">
              <div class="card bg-info text-white">
                <div class="card-body">
                  <div class="d-flex justify-content-between">
                    <div>
                      <h4 class="mb-0">{{ statistics.total }}</h4>
                      <p class="mb-0">Total Requests</p>
                    </div>
                    <div class="align-self-center">
                      <i class="fas fa-users fa-2x"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Pending Verifications Table -->
          <div class="row">
            <div class="col-12">
              <div class="card">
                <div class="card-header">
                  <h5 class="mb-0">
                    <i class="fas fa-list me-2"></i>
                    Pending Residency Verifications
                  </h5>
                </div>
                <div class="card-body">
                  <!-- Loading State -->
                  <div v-if="loading" class="text-center py-4">
                    <div class="spinner-border text-primary" role="status">
                      <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mt-2 text-muted">Loading pending verifications...</p>
                  </div>

                  <!-- Empty State -->
                  <div v-else-if="pendingVerifications.length === 0" class="text-center py-4">
                    <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
                    <h5 class="text-muted">No Pending Verifications</h5>
                    <p class="text-muted">All residency verification requests have been processed.</p>
                  </div>

                  <!-- Verifications Table -->
                  <div v-else class="table-responsive">
                    <table class="table table-hover">
                      <thead class="table-light">
                        <tr>
                          <th>Applicant</th>
                          <th>Contact</th>
                          <th>Address</th>
                          <th>Registration Date</th>
                          <th>Documents</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="verification in pendingVerifications" :key="verification.account_id">
                          <td>
                            <div>
                              <strong>{{ getFullName(verification) }}</strong><br>
                              <small class="text-muted">@{{ verification.username }}</small>
                            </div>
                          </td>
                          <td>
                            <div>
                              <i class="fas fa-envelope me-1"></i>{{ verification.email }}<br>
                              <i class="fas fa-phone me-1"></i>{{ verification.phone_number || 'N/A' }}
                            </div>
                          </td>
                          <td>
                            <div>
                              {{ verification.barangay }}<br>
                              <small class="text-muted">
                                {{ verification.city_municipality }}, {{ verification.province }}
                              </small>
                            </div>
                          </td>
                          <td>
                            <div>
                              {{ formatDate(verification.registration_date) }}<br>
                              <small class="text-muted">
                                {{ getTimeAgo(verification.registration_date) }}
                              </small>
                            </div>
                          </td>
                          <td>
                            <div>
                              <span class="badge bg-info">{{ verification.document_count }} files</span><br>
                              <small class="text-muted">
                                Last upload: {{ formatDate(verification.latest_document_upload) }}
                              </small>
                            </div>
                          </td>
                          <td>
                            <div class="btn-group-vertical btn-group-sm" role="group">
                              <button
                                class="btn btn-outline-primary"
                                @click="viewDocuments(verification)"
                                :disabled="actionLoading"
                              >
                                <i class="fas fa-eye me-1"></i>
                                View Documents
                              </button>
                              <button
                                class="btn btn-outline-success"
                                @click="approveVerification(verification)"
                                :disabled="actionLoading"
                              >
                                <i class="fas fa-check me-1"></i>
                                Approve
                              </button>
                              <button
                                class="btn btn-outline-danger"
                                @click="showRejectModal(verification)"
                                :disabled="actionLoading"
                              >
                                <i class="fas fa-times me-1"></i>
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <!-- Pagination -->
                  <div v-if="pagination && pagination.totalPages > 1" class="d-flex justify-content-between align-items-center mt-3">
                    <div>
                      <small class="text-muted">
                        Showing {{ (pagination.page - 1) * pagination.limit + 1 }} to 
                        {{ Math.min(pagination.page * pagination.limit, pagination.total) }} of 
                        {{ pagination.total }} entries
                      </small>
                    </div>
                    <nav>
                      <ul class="pagination pagination-sm mb-0">
                        <li class="page-item" :class="{ disabled: pagination.page <= 1 }">
                          <button class="page-link" @click="changePage(pagination.page - 1)" :disabled="pagination.page <= 1">
                            Previous
                          </button>
                        </li>
                        <li
                          v-for="page in getPageNumbers()"
                          :key="page"
                          class="page-item"
                          :class="{ active: page === pagination.page }"
                        >
                          <button class="page-link" @click="changePage(page)">{{ page }}</button>
                        </li>
                        <li class="page-item" :class="{ disabled: pagination.page >= pagination.totalPages }">
                          <button class="page-link" @click="changePage(pagination.page + 1)" :disabled="pagination.page >= pagination.totalPages">
                            Next
                          </button>
                        </li>
                      </ul>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Document Viewer Modal -->
    <div class="modal fade" id="documentModal" tabindex="-1" ref="documentModal">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fas fa-file-alt me-2"></i>
              Residency Documents - {{ selectedVerification?.first_name }} {{ selectedVerification?.last_name }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div v-if="loadingDocuments" class="text-center py-4">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading documents...</span>
              </div>
            </div>
            <div v-else-if="documents.length === 0" class="text-center py-4">
              <i class="fas fa-file-slash fa-3x text-muted mb-3"></i>
              <p class="text-muted">No documents found for this verification request.</p>
            </div>
            <div v-else>
              <div class="row">
                <div v-for="document in documents" :key="document.id" class="col-md-6 mb-3">
                  <div class="card">
                    <div class="card-body">
                      <h6 class="card-title">
                        <i class="fas fa-file me-2"></i>
                        {{ getDocumentTypeLabel(document.document_type) }}
                      </h6>
                      <p class="card-text">
                        <strong>File:</strong> {{ document.document_name }}<br>
                        <strong>Size:</strong> {{ formatFileSize(document.file_size) }}<br>
                        <strong>Uploaded:</strong> {{ formatDate(document.created_at) }}
                      </p>
                      <button class="btn btn-primary btn-sm" @click="viewDocument(document)">
                        <i class="fas fa-eye me-1"></i>
                        View Document
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button
              type="button"
              class="btn btn-success"
              @click="approveFromModal"
              :disabled="actionLoading"
            >
              <i class="fas fa-check me-1"></i>
              Approve Verification
            </button>
            <button
              type="button"
              class="btn btn-danger"
              @click="showRejectModalFromDocuments"
              :disabled="actionLoading"
            >
              <i class="fas fa-times me-1"></i>
              Reject Verification
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Rejection Modal -->
    <div class="modal fade" id="rejectModal" tabindex="-1" ref="rejectModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fas fa-times-circle me-2 text-danger"></i>
              Reject Residency Verification
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p>
              You are about to reject the residency verification for:
              <strong>{{ selectedVerification?.first_name }} {{ selectedVerification?.last_name }}</strong>
            </p>
            <div class="mb-3">
              <label for="rejectionReason" class="form-label">
                Reason for Rejection <span class="text-danger">*</span>
              </label>
              <textarea
                id="rejectionReason"
                class="form-control"
                :class="{ 'is-invalid': rejectionError }"
                v-model="rejectionReason"
                rows="4"
                placeholder="Please provide a clear reason for rejecting this verification request..."
                required
              ></textarea>
              <div v-if="rejectionError" class="invalid-feedback">
                {{ rejectionError }}
              </div>
              <div class="form-text">
                This reason will be sent to the applicant. Please be clear and helpful.
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button
              type="button"
              class="btn btn-danger"
              @click="confirmRejectVerification"
              :disabled="actionLoading || !rejectionReason.trim()"
            >
              <span v-if="actionLoading" class="spinner-border spinner-border-sm me-2"></span>
              <i v-else class="fas fa-times me-1"></i>
              {{ actionLoading ? 'Rejecting...' : 'Reject Verification' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Success/Error Messages -->
    <div v-if="successMessage" class="toast-container position-fixed top-0 end-0 p-3">
      <div class="toast show" role="alert">
        <div class="toast-header bg-success text-white">
          <i class="fas fa-check-circle me-2"></i>
          <strong class="me-auto">Success</strong>
          <button type="button" class="btn-close btn-close-white" @click="successMessage = ''"></button>
        </div>
        <div class="toast-body">
          {{ successMessage }}
        </div>
      </div>
    </div>

    <div v-if="errorMessage" class="toast-container position-fixed top-0 end-0 p-3">
      <div class="toast show" role="alert">
        <div class="toast-header bg-danger text-white">
          <i class="fas fa-exclamation-triangle me-2"></i>
          <strong class="me-auto">Error</strong>
          <button type="button" class="btn-close btn-close-white" @click="errorMessage = ''"></button>
        </div>
        <div class="toast-body">
          {{ errorMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<script src="./js/adminResidencyVerification.js"></script>
<style scoped src="./css/adminDashboard.css"></style>
