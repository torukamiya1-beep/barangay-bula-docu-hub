<template>
  <div class="admin-requests">
    <AdminHeader
      :userName="adminData?.first_name || 'Admin'"
      :showUserDropdown="showUserDropdown"
      :sidebarCollapsed="sidebarCollapsed"
      :activeMenu="activeMenu"
      @sidebar-toggle="handleSidebarToggle"
      @user-dropdown-toggle="handleUserDropdownToggle"
      @menu-action="handleMenuAction"
      @open-request-modal="handleOpenRequestModal"
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
        <!-- Loading State -->
        <div v-if="loading" class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>

        <!-- Main Content -->
        <div v-else class="container-fluid py-4">
          <!-- Error Message -->
          <div v-if="errorMessage" class="alert alert-danger alert-dismissible fade show" role="alert">
            <i class="fas fa-exclamation-triangle me-2"></i>
            {{ errorMessage }}
            <button type="button" class="btn-close" @click="errorMessage = ''" aria-label="Close"></button>
          </div>

          <!-- Filters Panel -->
          <div v-if="showFilters" class="card shadow mb-4">
            <div class="card-body">
              <div class="row">
                <div class="col-md-3 mb-3">
                  <label class="form-label">Search</label>
                  <input
                    type="text"
                    class="form-control"
                    v-model="filters.search"
                    placeholder="Search by request number"
                    @input="debouncedSearch"
                    @keyup.enter="applyFilters"
                  >
                </div>
                <div class="col-md-2 mb-3">
                  <label class="form-label">Status</label>
                  <select class="form-select" v-model="filters.status" @change="applyFilters">
                    <option value="">All Statuses</option>
                    <option v-for="status in filterStatusOptions" :key="status.id" :value="status.status_name">
                      {{ formatStatus(status.status_name) }}
                    </option>
                  </select>
                </div>
                <div class="col-md-2 mb-3">
                  <label class="form-label">Document Type</label>
                  <select class="form-select" v-model="filters.document_type" @change="applyFilters">
                    <option value="">All Types</option>
                    <option v-for="docType in documentTypes" :key="docType.id" :value="docType.type_name">
                      {{ docType.type_name }}
                    </option>
                  </select>
                </div>
                <div class="col-md-2 mb-3">
                  <label class="form-label">Date From</label>
                  <input type="date" class="form-control" v-model="filters.date_from">
                </div>
                <div class="col-md-2 mb-3">
                  <label class="form-label">Date To</label>
                  <input type="date" class="form-control" v-model="filters.date_to">
                </div>
                <div class="col-md-1 mb-3 d-flex align-items-end">
                  <div class="d-flex gap-1 w-100">
                    <button class="btn btn-primary btn-sm" @click="applyFilters">
                      <i class="fas fa-search"></i>
                    </button>
                    <button class="btn btn-outline-secondary btn-sm" @click="clearFilters">
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Bulk Actions Panel -->
          <div v-if="selectedRequests.length > 0" class="card shadow mb-4">
            <div class="card-header py-3 bg-warning">
              <h6 class="m-0 fw-bold text-dark">
                <i class="fas fa-tasks me-2"></i>
                Bulk Actions ({{ selectedRequests.length }} selected)
              </h6>
            </div>
            <div class="card-body">
              <div class="row align-items-end">
                <div class="col-md-3 mb-3">
                  <label class="form-label">Action</label>
                  <select class="form-select" v-model="bulkAction">
                    <option value="">Select Action</option>
                    <option v-for="status in filterStatusOptions" :key="status.id" :value="status.id">
                      Change to {{ formatStatus(status.status_name) }}
                    </option>
                  </select>
                </div>

                <div class="col-md-3 mb-3">
                  <div class="d-flex gap-2">
                    <button class="btn btn-warning" @click="performBulkAction" :disabled="!bulkAction">
                      <i class="fas fa-play me-1"></i>
                      Apply
                    </button>
                    <button class="btn btn-outline-secondary" @click="selectedRequests = []">
                      <i class="fas fa-times me-1"></i>
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- View Toggle -->
          <div class="d-flex justify-content-between align-items-center mb-4">
            <div class="d-flex align-items-center gap-3">

              <div class="d-flex align-items-center gap-2">
                <span class="text-muted small">
                  Showing {{ ((pagination.currentPage - 1) * pagination.itemsPerPage) + 1 }} -
                  {{ Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems) }}
                  of {{ pagination.totalItems }} requests
                </span>
                <select class="form-select form-select-sm" style="width: auto;" v-model="pagination.itemsPerPage" @change="changeItemsPerPage(pagination.itemsPerPage)">
                  <option value="10">10 per page</option>
                  <option value="25">25 per page</option>
                  <option value="50">50 per page</option>
                  <option value="100">100 per page</option>
                </select>
              </div>
              <div class="d-flex gap-2 align-items-center">
                  <button class="btn btn-outline-primary btn-sm" @click="showFilters = !showFilters">
                    <i class="fas fa-filter me-1"></i>
                    {{ showFilters ? 'Hide' : 'Show' }} Filters
                  </button>
                </div>
            </div>
          </div>

          <!-- Card View -->
          <div v-if="viewMode === 'card'" class="requests-grid">
            <!-- Empty State -->
            <div v-if="requests.length === 0" class="empty-state text-center py-5">
              <div class="empty-state-icon mb-3">
                <i class="fas fa-inbox fa-4x text-muted"></i>
              </div>
              <h5 class="text-muted mb-2">No Active Document Requests Found</h5>
              <p class="text-muted">There are no active document requests matching your current filters. Completed and cancelled requests can be viewed in Request History.</p>
            </div>

            <!-- Request Cards -->
            <div v-else class="row g-4">
              <div v-for="request in requests" :key="request.id" class="col-xl-4 col-lg-6 col-md-6">
                <div class="request-card" :class="{ 'selected': selectedRequests.includes(request.id) }">
                  <!-- Card Header -->
                  <div class="request-card-header">
                    <div class="d-flex justify-content-between align-items-start">
                      <div class="d-flex align-items-center gap-2">
                        <input
                          type="checkbox"
                          class="form-check-input"
                          :checked="selectedRequests.includes(request.id)"
                          @change="toggleRequestSelection(request.id)"
                        >
                        <div class="request-number">
                          <span class="badge bg-primary">{{ request.request_number }}</span>
                        </div>
                      </div>
                      <div class="request-actions-simple">
                        <button class="btn btn-sm btn-primary" @click="viewRequestDetails(request.id)" title="View & Manage Request">
                          <i class="fas fa-edit me-1"></i>Manage
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Card Body -->
                  <div class="request-card-body">
                    <!-- Client Info -->
                    <div class="client-info mb-3">
                      <div class="d-flex align-items-center gap-2 mb-2">
                        <div class="client-avatar">
                          <i class="fas fa-user-circle fa-2x text-primary"></i>
                        </div>
                        <div class="flex-grow-1">
                          <!-- Third-party request: Show beneficiary name prominently -->
                          <div v-if="request.is_third_party_request && request.beneficiary_name">
                            <h6 class="mb-0 fw-bold text-success">
                              <i class="fas fa-user-friends me-1"></i>
                              {{ request.beneficiary_name }}
                            </h6>
                            <small class="text-muted">
                              Document for: {{ request.beneficiary_relationship || 'Family Member' }}
                            </small>
                            <div class="mt-1">
                              <small class="text-muted">Requested by: {{ request.client_name }}</small>
                            </div>
                          </div>
                          <!-- Self request: Show client name -->
                          <div v-else>
                            <h6 class="mb-0 fw-bold">{{ request.client_name }}</h6>
                            <small class="text-muted">{{ request.client_email }}</small>
                          </div>
                        </div>
                        <!-- Request type indicator -->
                        <div class="request-type-badge">
                          <span v-if="request.is_third_party_request" class="badge bg-info">
                            <i class="fas fa-users me-1"></i>Family
                          </span>
                          <span v-else class="badge bg-secondary">
                            <i class="fas fa-user me-1"></i>Self
                          </span>
                        </div>
                      </div>

                      <!-- Additional Client Details -->
                      <div class="client-details-grid mt-2">
                        <div class="row g-1">
                          <div class="col-6" v-if="request.client_birth_date">
                            <small class="text-muted d-block">Date of Birth</small>
                            <small class="fw-medium">{{ formatDate(request.client_birth_date) }}</small>
                          </div>
                          <div class="col-6" v-if="request.client_gender">
                            <small class="text-muted d-block">Gender</small>
                            <small class="fw-medium">{{ formatGender(request.client_gender) }}</small>
                          </div>
                          <div class="col-6" v-if="getCivilStatusName(request.client_civil_status_id)">
                            <small class="text-muted d-block">Civil Status</small>
                            <small class="fw-medium">{{ getCivilStatusName(request.client_civil_status_id) }}</small>
                          </div>
                          <div class="col-6" v-if="request.client_nationality">
                            <small class="text-muted d-block">Nationality</small>
                            <small class="fw-medium">{{ request.client_nationality }}</small>
                          </div>
                          <div class="col-12" v-if="getResidencyDisplay(request)">
                            <small class="text-muted d-block">Years of Residency</small>
                            <small class="fw-medium">{{ getResidencyDisplay(request) }}</small>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Third-Party Request Indicator -->
                    <div v-if="request.is_third_party_request" class="third-party-indicator mb-3">
                      <div class="alert alert-info py-2 px-3 mb-0">
                        <div class="d-flex align-items-center">
                          <i class="fas fa-users me-2"></i>
                          <div class="flex-grow-1">
                            <small class="fw-bold">Third-Party Request</small>
                            <div class="small text-muted">
                              Document for: <span class="fw-medium">{{ request.beneficiary_name || 'Another person' }}</span>
                              <span v-if="request.relationship_to_requestor && request.relationship_to_requestor !== 'self'">
                                ({{ formatRelationship(request.relationship_to_requestor) }})
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Family Member Verification Status -->
                    <div v-if="request.is_third_party_request" class="verification-status mb-3">
                      <div class="card border-0 bg-light">
                        <div class="card-body py-2 px-3">
                          <div class="d-flex align-items-center justify-content-between">
                            <div class="d-flex align-items-center gap-2">
                              <i class="fas fa-id-card text-primary"></i>
                              <small class="fw-bold">Family Verification</small>
                            </div>
                            <div class="d-flex align-items-center gap-2">
                              <!-- Verification Status Badge -->
                              <span class="badge" :class="getBeneficiaryVerificationStatusClass(request.beneficiary_verification_status)">
                                {{ getBeneficiaryVerificationStatusText(request.beneficiary_verification_status) }}
                              </span>
                              <!-- View/Manage Verification Button -->
                              <button
                                v-if="request.beneficiary_verification_image"
                                class="btn btn-sm btn-outline-primary"
                                @click="openVerificationModal(request)"
                                title="Manage verification"
                              >
                                <i class="fas fa-eye me-1"></i>Review
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Authorized Pickup Indicator -->
                    <div v-if="request.pickup_person_name" class="pickup-indicator mb-3">
                      <div class="card border-0 bg-warning-subtle">
                        <div class="card-body py-2 px-3">
                          <div class="d-flex align-items-center justify-content-between mb-2">
                            <div class="d-flex align-items-center gap-2">
                              <i class="fas fa-hand-paper text-warning"></i>
                              <small class="fw-bold">Authorized Pickup</small>
                            </div>
                            <span class="badge" :class="getAuthorizationStatusClass(request.pickup_authorization_verified ? 'verified' : 'pending')">
                              {{ request.pickup_authorization_verified ? 'Verified' : 'Pending' }}
                            </span>
                          </div>
                          <div class="small text-muted mb-2">
                            Pickup by: <span class="fw-medium">{{ request.pickup_person_name }}</span>
                          </div>
                          <!-- Pickup Documents -->
                          <div class="d-flex gap-2">
                            <button
                              v-if="request.pickup_id_image"
                              class="btn btn-sm btn-outline-secondary"
                              @click="viewVerificationImage(request.id, 'pickup-id')"
                              title="View pickup person's ID"
                            >
                              <i class="fas fa-id-card me-1"></i>ID
                            </button>
                            <button
                              v-if="request.pickup_authorization_letter"
                              class="btn btn-sm btn-outline-secondary"
                              @click="viewVerificationImage(request.id, 'pickup-auth')"
                              title="View authorization letter"
                            >
                              <i class="fas fa-file-signature me-1"></i>Letter
                            </button>
                            <!-- View All Documents Button -->
                            <button
                              v-if="request.pickup_id_image || request.pickup_authorization_letter"
                              class="btn btn-sm btn-primary"
                              @click="viewPickupDocuments(request)"
                              title="View all pickup documents"
                            >
                              <i class="fas fa-images me-1"></i>View All
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Document Type -->
                    <div class="document-type mb-3">
                      <div class="d-flex align-items-center gap-2">
                        <i class="fas fa-file-alt text-info"></i>
                        <span class="badge bg-info-subtle text-info-emphasis px-3 py-2">
                          {{ request.document_type }}
                        </span>
                      </div>
                    </div>

                    <!-- Status and Amount -->
                    <div class="request-meta mb-3">
                      <div class="row g-2">
                        <div class="col-6">
                          <div class="meta-item">
                            <small class="text-muted d-block">Status</small>
                            <span class="badge" :class="`bg-${getStatusColor(request.status_name)}`">
                              {{ formatStatus(request.status_name) }}
                            </span>
                          </div>
                        </div>
                        <div class="col-6">
                          <div class="meta-item">
                            <small class="text-muted d-block">Amount</small>
                            <div v-if="hasConvenienceFee(request)">
                              <div class="fee-breakdown">
                                <div class="base-fee">
                                  <small class="text-muted">Document Fee:</small>
                                  <span class="fw-bold text-primary">{{ formatCurrency(getBaseFee(request)) }}</span>
                                </div>
                                <div class="convenience-fee">
                                  <small class="text-muted">Convenience Fee:</small>
                                  <span class="fw-bold text-warning">{{ formatCurrency(getConvenienceFee(request)) }}</span>
                                  <i class="fas fa-info-circle text-muted ms-1"
                                     :title="getConvenienceFeeExplanation(request)"></i>
                                </div>
                                <div class="total-fee border-top pt-1">
                                  <small class="text-muted">Total Payment:</small>
                                  <span class="fw-bold text-success">{{ formatCurrency(getDisplayFee(request)) }}</span>
                                </div>
                              </div>
                            </div>
                            <div v-else>
                              <span class="fw-bold text-success">{{ formatCurrency(getDisplayFee(request)) }}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Date -->
                    <div class="request-date">
                      <small class="text-muted">
                        <i class="fas fa-calendar-alt me-1"></i>
                        Submitted {{ formatDate(request.requested_at) }}
                      </small>
                    </div>
                  </div>

                  <!-- Card Footer -->
                  <div class="request-card-footer">
                    <div class="d-grid">
                      <button class="btn btn-sm btn-primary" @click="viewRequestDetails(request.id)">
                        <i class="fas fa-edit me-1"></i>Manage Request
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Table View -->
          <div v-else class="modern-table-container">

            <!-- Empty State -->
            <div v-if="requests.length === 0" class="modern-table-empty">
              <div class="empty-content">
                <div class="empty-icon">
                  <i class="fas fa-inbox"></i>
                </div>
                <h6 class="empty-title">No Active Document Requests Found</h6>
                <p class="empty-text">There are no active document requests matching your current filters. Completed and cancelled requests can be viewed in Request History.</p>
              </div>
            </div>

            <!-- Modern Compact Table -->
            <div v-else class="compact-table-wrapper">
              <!-- Table Header -->
              <div class="compact-table-header">
                <div class="header-cell">Request ID</div>
                <div class="header-cell">Client</div>
                <div class="header-cell">Document</div>
                <div class="header-cell">Status</div>
                <div class="header-cell">Amount</div>
                <div class="header-cell">Date Requested</div>
                <div class="header-cell">Actions</div>
              </div>

              <!-- Table Body -->
              <div class="compact-table-body">
                <div v-for="request in requests" :key="request.id"
                     class="compact-row"
                     :class="{ 'selected': selectedRequests.includes(request.id) }">

                  <!-- Request ID -->
                  <div class="row-cell request-id-cell">
                    <div class="request-id-content">
                      <span class="request-number">{{ request.request_number }}</span>
                      <!-- never show the actual ID from database -->
                      <!-- <span class="request-id-small">{{ request.id }}</span> -->
                    </div>
                  </div>

                  <!-- Client -->
                  <div class="row-cell client-cell">
                    <div class="client-compact">
                      <div class="client-avatar-tiny">
                        <i class="fas fa-user"></i>
                      </div>
                      <div class="client-info-compact">
                        <div class="client-name-compact">{{ request.client_name }}</div>
                      </div>
                    </div>
                  </div>

                  <!-- Document Type -->
                  <div class="row-cell document-cell">
                    <span class="document-badge">
                      <i class="fas fa-file-alt"></i>
                      {{ request.document_type }}
                    </span>
                  </div>

                  <!-- Status -->
                  <div class="row-cell status-cell">
                    <span class="status-compact" :class="`status-${getStatusColor(request.status_name)}`">
                      <i class="fas fa-circle"></i>
                      {{ formatStatus(request.status_name) }}
                    </span>
                  </div>

                  <!-- Amount -->
                  <div class="row-cell amount-cell">
                    <div v-if="hasConvenienceFee(request)" class="amount-breakdown">
                      <div class="amount-compact">{{ formatCurrency(getDisplayFee(request)) }}</div>
                      <small class="text-muted d-block">
                        Base: {{ formatCurrency(getBaseFee(request)) }} +
                        Conv: {{ formatCurrency(getConvenienceFee(request)) }}
                      </small>
                    </div>
                    <div v-else>
                      <span class="amount-compact">{{ formatCurrency(getDisplayFee(request)) }}</span>
                    </div>
                  </div>

                  <!-- Date -->
                  <div class="row-cell date-cell">
                    <div class="date-compact">
                      <span class="date-main">{{ formatDate(request.requested_at) }}</span>
                      <span class="time-small">{{ formatTime(request.requested_at) }}</span>
                    </div>
                  </div>

                  <!-- Actions -->
                  <div class="row-cell actions-cell">
                    <div class="actions-simple">
                      <button class="action-btn-sm primary-btn-sm" @click="viewRequestDetails(request.id)" title="View & Manage Request">
                        <i class="fas fa-edit"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Pagination -->
          <div v-if="pagination.totalItems > 10" class="pagination-container">
              <nav aria-label="Requests pagination">
                <ul class="pagination pagination-sm justify-content-center mb-0">
                  <li class="page-item" :class="{ disabled: pagination.currentPage === 1 }">
                    <a class="page-link" href="#" @click.prevent="changePage(pagination.currentPage - 1)">
                      <i class="fas fa-chevron-left"></i>
                    </a>
                  </li>
                  <li
                    v-for="page in Math.min(pagination.totalPages, 10)"
                    :key="page"
                    class="page-item"
                    :class="{ active: page === pagination.currentPage }"
                  >
                    <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
                  </li>
                  <li class="page-item" :class="{ disabled: pagination.currentPage === pagination.totalPages }">
                    <a class="page-link" href="#" @click.prevent="changePage(pagination.currentPage + 1)">
                      <i class="fas fa-chevron-right"></i>
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
          </div>

          <!-- Request Details Modal -->
          <div v-if="showRequestDetails && currentRequest" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
            <div class="modal-dialog modal-xl modal-dialog-scrollable">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title">
                    <i class="fas fa-file-alt me-2"></i>
                    Request Details - {{ currentRequest.request_number }}
                  </h5>
                  <button type="button" class="btn-close" @click="showRequestDetails = false"></button>
                </div>
                <div class="modal-body">
                  <div class="row">
                    <!-- Left Column - Request Information -->
                    <div class="col-lg-8">
                      <!-- Basic Information -->
                      <div class="card mb-4">
                        <div class="card-header">
                          <h6 class="mb-0"><i class="fas fa-info-circle me-2"></i>Request Information</h6>
                        </div>
                        <div class="card-body">
                          <div class="row">
                            <div class="col-md-6">
                              <div class="mb-3">
                                <label class="form-label fw-bold">Request Number</label>
                                <p class="mb-0">{{ currentRequest.request_number }}</p>
                              </div>
                              <div class="mb-3">
                                <label class="form-label fw-bold">Document Type</label>
                                <p class="mb-0">
                                  <span class="badge bg-info">{{ currentRequest.document_type }}</span>
                                </p>
                              </div>
                              <div class="mb-3">
                                <label class="form-label fw-bold">Purpose Category</label>
                                <p class="mb-0">{{ currentRequest.purpose_category }}</p>
                              </div>
                              <div class="mb-3">
                                <label class="form-label fw-bold">Purpose Details</label>
                                <p class="mb-0">{{ currentRequest.purpose_details || 'Not specified' }}</p>
                              </div>
                            </div>
                            <div class="col-md-6">
                              <div class="mb-3">
                                <label class="form-label fw-bold">Current Status</label>
                                <p class="mb-0">
                                  <span class="badge" :class="`bg-${getStatusColor(currentRequest.status_name)}`">
                                    {{ formatStatus(currentRequest.status_name) }}
                                  </span>
                                </p>
                              </div>

                              <div class="mb-3">
                                <label class="form-label fw-bold">Date Submitted</label>
                                <p class="mb-0">{{ formatDateTime(currentRequest.requested_at) }}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Payment Information Card (Convenience Fee Breakdown) -->
                      <div v-if="hasConvenienceFee(currentRequest)" class="card mb-4">
                        <div class="card-body">
                          <div class="alert alert-warning mb-3">
                            <div class="d-flex align-items-start">
                              <i class="fas fa-info-circle me-2 mt-1"></i>
                              <div>
                                <strong>Convenience Fee Applied</strong>
                                <p class="mb-0 small">{{ getConvenienceFeeExplanation(currentRequest) }}</p>
                              </div>
                            </div>
                          </div>

                          <div class="row">
                            <div class="col-md-8">
                              <div class="fee-breakdown-modal">
                                <!-- Base Document Fee -->
                                <div class="fee-item d-flex justify-content-between align-items-center py-2">
                                  <div class="fee-label">
                                    <i class="fas fa-file-alt text-primary me-2"></i>
                                    <span class="fw-medium">Base Document Fee</span>
                                    <small class="text-muted d-block">Original {{ currentRequest.document_type }} fee</small>
                                  </div>
                                  <div class="fee-amount">
                                    <span class="h6 mb-0 text-primary">{{ formatCurrency(getBaseFee(currentRequest)) }}</span>
                                  </div>
                                </div>

                                <!-- Convenience Fee -->
                                <div class="fee-item d-flex justify-content-between align-items-center py-2 bg-warning bg-opacity-10 rounded px-3">
                                  <div class="fee-label">
                                    <i class="fas fa-plus-circle text-warning me-2"></i>
                                    <span class="fw-medium">Convenience Fee</span>
                                    <small class="text-muted d-block">PayMongo minimum requirement</small>
                                  </div>
                                  <div class="fee-amount">
                                    <span class="h6 mb-0 text-warning">{{ formatCurrency(getConvenienceFee(currentRequest)) }}</span>
                                  </div>
                                </div>

                                <!-- Total Payment -->
                                <div class="fee-item d-flex justify-content-between align-items-center py-3 border-top border-2 mt-2">
                                  <div class="fee-label">
                                    <i class="fas fa-calculator text-success me-2"></i>
                                    <span class="fw-bold">Total Payment Amount</span>
                                    <small class="text-muted d-block">Amount charged to customer</small>
                                  </div>
                                  <div class="fee-amount">
                                    <span class="h5 mb-0 text-success fw-bold">{{ formatCurrency(getDisplayFee(currentRequest)) }}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div class="col-md-4">
                              <div class="payment-summary-card bg-light rounded p-3">
                                <h6 class="text-center mb-3">
                                  <i class="fas fa-receipt me-1"></i>
                                  Payment Summary
                                </h6>
                                <div class="text-center">
                                  <div class="mb-2">
                                    <small class="text-muted">Customer Pays</small>
                                    <div class="h4 text-success mb-0">{{ formatCurrency(getDisplayFee(currentRequest)) }}</div>
                                  </div>
                                  <div class="small text-muted">
                                    <div>Document: {{ formatCurrency(getBaseFee(currentRequest)) }}</div>
                                    <div>Service: {{ formatCurrency(getConvenienceFee(currentRequest)) }}</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Request Type Indicator -->
                      <div v-if="currentRequest.is_third_party_request" class="alert alert-info mb-4">
                        <div class="d-flex align-items-center">
                          <i class="fas fa-users me-2"></i>
                          <div>
                            <strong>Third-Party Request</strong>
                            <p class="mb-0 small">This document is being requested on behalf of another person.</p>
                          </div>
                        </div>
                      </div>

                      <!-- Requestor Information (Person who submitted the request) -->
                      <div class="card mb-4">
                        <div class="card-header">
                          <h6 class="mb-0">
                            <i class="fas fa-user-edit me-2"></i>
                            {{ currentRequest.is_third_party_request ? 'Requestor Information' : 'Client Information' }}
                            <small class="text-muted ms-2">
                              {{ currentRequest.is_third_party_request ? '(Person who submitted this request)' : '' }}
                            </small>
                          </h6>
                        </div>
                        <div class="card-body">
                          <!-- Basic Information -->
                          <div class="row">
                            <div class="col-md-6">
                              <div class="mb-3">
                                <label class="form-label fw-bold">Full Name</label>
                                <p class="mb-0" :class="{ 'text-muted': getClientFullName(currentRequest) === 'Not provided' }">
                                  <span v-if="getClientFullName(currentRequest) !== 'Not provided'">{{ getClientFullName(currentRequest) }}</span>
                                  <span v-else class="not-provided">Not provided</span>
                                </p>
                              </div>
                              <div class="mb-3">
                                <label class="form-label fw-bold">Email Address</label>
                                <p class="mb-0" :class="{ 'text-muted': !currentRequest.client_email }">
                                  <a v-if="currentRequest.client_email" :href="`mailto:${currentRequest.client_email}`">{{ currentRequest.client_email }}</a>
                                  <span v-else class="not-provided">Not provided</span>
                                </p>
                              </div>
                              <div class="mb-3">
                                <label class="form-label fw-bold">Phone Number</label>
                                <p class="mb-0" :class="{ 'text-muted': !currentRequest.client_phone }">
                                  <a v-if="currentRequest.client_phone" :href="`tel:${currentRequest.client_phone}`">{{ currentRequest.client_phone }}</a>
                                  <span v-else class="not-provided">Not provided</span>
                                </p>
                              </div>
                            </div>
                            <div class="col-md-6">
                              <div class="mb-3">
                                <label class="form-label fw-bold">Date of Birth</label>
                                <p class="mb-0" :class="{ 'text-muted': !currentRequest.client_birth_date }">
                                  <span v-if="formatDate(currentRequest.client_birth_date)">{{ formatDate(currentRequest.client_birth_date) }}</span>
                                  <span v-else class="not-provided">Not provided</span>
                                </p>
                              </div>
                              <div class="mb-3">
                                <label class="form-label fw-bold">Gender</label>
                                <p class="mb-0" :class="{ 'text-muted': !currentRequest.client_gender }">
                                  <span v-if="formatGender(currentRequest.client_gender)">{{ formatGender(currentRequest.client_gender) }}</span>
                                  <span v-else class="not-provided">Not provided</span>
                                </p>
                              </div>
                              <div class="mb-3">
                                <label class="form-label fw-bold">Civil Status</label>
                                <p class="mb-0" :class="{ 'text-muted': !currentRequest.client_civil_status_id }">
                                  <span v-if="getCivilStatusName(currentRequest.client_civil_status_id)">{{ getCivilStatusName(currentRequest.client_civil_status_id) }}</span>
                                  <span v-else class="not-provided">Not provided</span>
                                </p>
                              </div>
                            </div>
                          </div>

                          <!-- Address Information -->
                          <div class="row">
                            <div class="col-12">
                              <div class="mb-3">
                                <label class="form-label fw-bold">Complete Address</label>
                                <p class="mb-0" :class="{ 'text-muted': !getClientFullAddress(currentRequest) }">
                                  <span v-if="getClientFullAddress(currentRequest)">{{ getClientFullAddress(currentRequest) }}</span>
                                  <span v-else class="not-provided">Not provided</span>
                                </p>
                              </div>
                            </div>
                          </div>

                          <!-- Additional Information -->
                          <div class="row">
                            <div class="col-md-6">
                              <div class="mb-3">
                                <label class="form-label fw-bold">Nationality</label>
                                <p class="mb-0" :class="{ 'text-muted': !currentRequest.client_nationality }">
                                  <span v-if="currentRequest.client_nationality">{{ currentRequest.client_nationality }}</span>
                                  <span v-else class="not-provided">Not provided</span>
                                </p>
                              </div>
                            </div>
                            <div class="col-md-6">
                              <div class="mb-3">
                                <label class="form-label fw-bold">Years of Residency</label>
                                <p class="mb-0" :class="{ 'text-muted': !getResidencyDisplay(currentRequest) }">
                                  <span v-if="getResidencyDisplay(currentRequest)">{{ getResidencyDisplay(currentRequest) }}</span>
                                  <span v-else class="not-provided">Not provided</span>
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Beneficiary Information (Person the document is for) -->
                      <div v-if="currentRequest.is_third_party_request && currentRequest.beneficiary" class="card mb-4">
                        <div class="card-header bg-light">
                          <h6 class="mb-0">
                            <i class="fas fa-user-check me-2 text-primary"></i>
                            Document Beneficiary Information
                            <small class="text-muted ms-2">(Person this document is for)</small>
                          </h6>
                        </div>
                        <div class="card-body">
                          <!-- Basic Information -->
                          <div class="row">
                            <div class="col-md-6">
                              <div class="mb-3">
                                <label class="form-label fw-bold">Full Name</label>
                                <p class="mb-0">{{ currentRequest.beneficiary.full_name || 'Not provided' }}</p>
                              </div>
                              <div class="mb-3">
                                <label class="form-label fw-bold">Email Address</label>
                                <p class="mb-0" :class="{ 'text-muted': !currentRequest.beneficiary.email }">
                                  <a v-if="currentRequest.beneficiary.email" :href="`mailto:${currentRequest.beneficiary.email}`">{{ currentRequest.beneficiary.email }}</a>
                                  <span v-else class="not-provided">Not provided</span>
                                </p>
                              </div>
                              <div class="mb-3">
                                <label class="form-label fw-bold">Phone Number</label>
                                <p class="mb-0" :class="{ 'text-muted': !currentRequest.beneficiary.phone_number }">
                                  <a v-if="currentRequest.beneficiary.phone_number" :href="`tel:${currentRequest.beneficiary.phone_number}`">{{ currentRequest.beneficiary.phone_number }}</a>
                                  <span v-else class="not-provided">Not provided</span>
                                </p>
                              </div>
                            </div>
                            <div class="col-md-6">
                              <div class="mb-3">
                                <label class="form-label fw-bold">Date of Birth</label>
                                <p class="mb-0" :class="{ 'text-muted': !currentRequest.beneficiary.birth_date }">
                                  <span v-if="formatDate(currentRequest.beneficiary.birth_date)">{{ formatDate(currentRequest.beneficiary.birth_date) }}</span>
                                  <span v-else class="not-provided">Not provided</span>
                                </p>
                              </div>
                              <div class="mb-3">
                                <label class="form-label fw-bold">Gender</label>
                                <p class="mb-0" :class="{ 'text-muted': !currentRequest.beneficiary.gender }">
                                  <span v-if="formatGender(currentRequest.beneficiary.gender)">{{ formatGender(currentRequest.beneficiary.gender) }}</span>
                                  <span v-else class="not-provided">Not provided</span>
                                </p>
                              </div>
                              <div class="mb-3">
                                <label class="form-label fw-bold">Civil Status</label>
                                <p class="mb-0" :class="{ 'text-muted': !currentRequest.beneficiary.civil_status_id }">
                                  <span v-if="getCivilStatusName(currentRequest.beneficiary.civil_status_id)">{{ getCivilStatusName(currentRequest.beneficiary.civil_status_id) }}</span>
                                  <span v-else class="not-provided">Not provided</span>
                                </p>
                              </div>
                            </div>
                          </div>

                          <!-- Address Information -->
                          <div class="row">
                            <div class="col-12">
                              <div class="mb-3">
                                <label class="form-label fw-bold">Complete Address</label>
                                <p class="mb-0" :class="{ 'text-muted': !currentRequest.beneficiary.address }">
                                  <span v-if="currentRequest.beneficiary.address">{{ currentRequest.beneficiary.address }}</span>
                                  <span v-else class="not-provided">Not provided</span>
                                </p>
                              </div>
                            </div>
                          </div>

                          <!-- Relationship and Additional Information -->
                          <div class="row">
                            <div class="col-md-6">
                              <div class="mb-3">
                                <label class="form-label fw-bold">Relationship to Requestor</label>
                                <p class="mb-0">
                                  <span class="badge bg-info-subtle text-info-emphasis px-2 py-1">
                                    {{ formatRelationship(currentRequest.beneficiary.relationship_to_requestor) }}
                                  </span>
                                </p>
                              </div>
                            </div>
                            <div class="col-md-6">
                              <div class="mb-3">
                                <label class="form-label fw-bold">Nationality</label>
                                <p class="mb-0" :class="{ 'text-muted': !currentRequest.beneficiary.nationality }">
                                  <span v-if="currentRequest.beneficiary.nationality">{{ currentRequest.beneficiary.nationality }}</span>
                                  <span v-else class="not-provided">Not provided</span>
                                </p>
                              </div>
                            </div>
                          </div>



                          <!-- Verification Image -->
                          <div v-if="currentRequest?.beneficiary?.verification_image_path" class="row">
                            <div class="col-12">
                              <div class="mb-3">
                                <label class="form-label fw-bold">Family Member Verification</label>
                                <div class="d-flex align-items-center gap-3 flex-wrap">
                                  <!-- Verification Status Badge -->
                                  <div class="verification-status">
                                    <span class="badge" :class="getBeneficiaryVerificationStatusClass(currentRequest?.beneficiary?.verification_status)">
                                      {{ getBeneficiaryVerificationStatusText(currentRequest?.beneficiary?.verification_status) }}
                                    </span>
                                  </div>
                                  
                                  <button
                                    class="btn btn-outline-primary btn-sm"
                                    @click="viewVerificationImage(currentRequest.id, 'beneficiary')"
                                    title="View family member verification image"
                                  >
                                    <i class="fas fa-eye me-1"></i>View Verification Image
                                  </button>
                                  
                                  <!-- Approve/Reject Buttons for Pending Verifications -->
                                  <div v-if="currentRequest?.beneficiary?.verification_status === 'pending'" class="btn-group">
                                    <button 
                                      class="btn btn-sm btn-success"
                                      @click="approveBeneficiaryVerification(currentRequest.beneficiary.id)"
                                      title="Approve beneficiary verification"
                                    >
                                      <i class="fas fa-check me-1"></i>
                                      Approve
                                    </button>
                                    <button 
                                      class="btn btn-sm btn-danger"
                                      @click="rejectBeneficiaryVerification(currentRequest.beneficiary.id)"
                                      title="Reject beneficiary verification"
                                    >
                                      <i class="fas fa-times me-1"></i>
                                      Reject
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <!-- Requestor Notes -->
                           <!-- Ill comment this because I dont need this for now -->
                          <!-- <div v-if="currentRequest.requestor_notes" class="row">
                            <div class="col-12">
                              <div class="mb-3">
                                <label class="form-label fw-bold">Additional Notes from Requestor</label>
                                <div class="alert alert-light border">
                                  <i class="fas fa-sticky-note me-2 text-warning"></i>
                                  {{ currentRequest.requestor_notes }}
                                </div>
                              </div>
                            </div>
                          </div> -->
                        </div>
                      </div>

                      <!-- Authorized Pickup Information -->
                      <div v-if="currentRequest.authorized_pickup" class="card mb-4">
                        <div class="card-header bg-warning-subtle">
                          <h6 class="mb-0">
                            <i class="fas fa-hand-paper me-2 text-warning"></i>
                            Authorized Pickup Person
                            <small class="text-muted ms-2">(Person authorized to collect the document)</small>
                          </h6>
                        </div>
                        <div class="card-body">
                          <div class="row">
                            <div class="col-md-6">
                              <div class="mb-3">
                                <label class="form-label fw-bold">Full Name</label>
                                <p class="mb-0">{{ currentRequest.authorized_pickup.full_name || 'Not provided' }}</p>
                              </div>
                              <div class="mb-3">
                                <label class="form-label fw-bold">Phone Number</label>
                                <p class="mb-0" :class="{ 'text-muted': !currentRequest.authorized_pickup.phone_number }">
                                  <a v-if="currentRequest.authorized_pickup.phone_number" :href="`tel:${currentRequest.authorized_pickup.phone_number}`">{{ currentRequest.authorized_pickup.phone_number }}</a>
                                  <span v-else class="not-provided">Not provided</span>
                                </p>
                              </div>
                              <div class="mb-3">
                                <label class="form-label fw-bold">Relationship to {{ currentRequest.is_third_party_request ? 'Beneficiary' : 'Requestor' }}</label>
                                <p class="mb-0">
                                  <span class="badge bg-secondary-subtle text-secondary-emphasis px-2 py-1">
                                    {{ formatRelationship(currentRequest.authorized_pickup.relationship_to_beneficiary) }}
                                  </span>
                                </p>
                              </div>

                              <!-- ill comment this status for now because I dont really use it. Ill uncomment this in future -->
                              <!-- <div class="mb-3">
                                <label class="form-label fw-bold">Authorization Status</label>
                                <p class="mb-0">
                                  <span class="badge" :class="getAuthorizationStatusClass(currentRequest.authorized_pickup.verification_status)">
                                    <i class="fas" :class="getAuthorizationStatusIcon(currentRequest.authorized_pickup.verification_status)"></i>
                                    {{ formatAuthorizationStatus(currentRequest.authorized_pickup.verification_status) }}
                                  </span>
                                </p>
                              </div> -->

                            </div>
                            <div class="col-md-6">
                              <!-- View Documents Section -->
                              <div class="mb-3">
                                <label class="form-label fw-bold">Uploaded Documents</label>
                                <div class="d-flex flex-column gap-2">
                                  <div v-if="currentRequest.authorized_pickup?.id_image_path || currentRequest.authorized_pickup?.authorization_letter_path" class="document-actions">
                                    <button
                                      class="btn btn-primary btn-sm w-100"
                                      @click="viewPickupDocuments(currentRequest)"
                                      title="View all pickup authorization documents"
                                    >
                                      <i class="fas fa-images me-2"></i>
                                      View Authorization Documents
                                    </button>
                                    <div class="mt-2 small text-muted">
                                      <div v-if="currentRequest.authorized_pickup?.id_image_path" class="d-flex align-items-center mb-1">
                                        <i class="fas fa-id-card me-2 text-info"></i>
                                        <span>ID Document Available</span>
                                      </div>
                                      <div v-if="currentRequest.authorized_pickup?.authorization_letter_path" class="d-flex align-items-center">
                                        <i class="fas fa-file-signature me-2 text-warning"></i>
                                        <span>Authorization Letter Available</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div v-else class="text-muted small">
                                    <i class="fas fa-exclamation-triangle me-2 text-warning"></i>
                                    No documents uploaded yet
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <!-- Authorization Actions -->
                          <div v-if="currentRequest.authorized_pickup.verification_status === 'pending'" class="row">
                            <div class="col-12">
                              <div class="alert alert-warning">
                                <i class="fas fa-exclamation-triangle me-2"></i>
                                <strong>Action Required:</strong> This pickup authorization needs to be verified before the document can be released.
                              </div>
                              <div class="d-flex gap-2">
                                <button class="btn btn-success btn-sm" @click="verifyAuthorization(currentRequest.id, true)">
                                  <i class="fas fa-check me-1"></i>
                                  Verify & Approve
                                </button>
                                <button class="btn btn-danger btn-sm" @click="verifyAuthorization(currentRequest.id, false)">
                                  <i class="fas fa-times me-1"></i>
                                  Reject Authorization
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Document-Specific Details -->
                      <div v-if="currentRequest.specific_details" class="card mb-4">
                        <div class="card-header">
                          <h6 class="mb-0">
                            <i class="fas fa-file-alt me-2"></i>
                            {{ currentRequest.document_type }} Application Details
                          </h6>
                        </div>
                        <div class="card-body">
                          <!-- Cedula Application Details -->
                          <div v-if="currentRequest.document_type === 'Cedula'" class="cedula-details">
                            <!-- Income Information -->
                            <div class="row mb-4">
                              <div class="col-12">
                                <h6 class="text-primary mb-3">
                                  <i class="fas fa-money-bill-wave me-2"></i>Income Information
                                </h6>
                                <div class="row">
                                  <div class="col-md-6">
                                    <div class="mb-3">
                                      <label class="form-label fw-bold">Annual Income</label>
                                      <p class="mb-0">{{ formatCurrency(currentRequest.specific_details.annual_income || 0) }}</p>
                                    </div>
                                    <div class="mb-3">
                                      <label class="form-label fw-bold">Monthly Income</label>
                                      <p class="mb-0">{{ formatCurrency(currentRequest.specific_details.monthly_income || 0) }}</p>
                                    </div>
                                  </div>
                                  <div class="col-md-6">
                                    <div class="mb-3">
                                      <label class="form-label fw-bold">Occupation</label>
                                      <p class="mb-0">{{ currentRequest.specific_details.occupation || 'Not provided' }}</p>
                                    </div>
                                    <div class="mb-3" v-if="currentRequest.specific_details.employer_name">
                                      <label class="form-label fw-bold">Employer</label>
                                      <p class="mb-0">{{ currentRequest.specific_details.employer_name }}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <!-- Property Information -->
                            <div v-if="currentRequest.specific_details.has_real_property || currentRequest.specific_details.property_assessed_value > 0" class="row mb-4">
                              <div class="col-12">
                                <h6 class="text-success mb-3">
                                  <i class="fas fa-home me-2"></i>Real Property Information
                                </h6>
                                <div class="row">
                                  <div class="col-md-6">
                                    <div class="mb-3">
                                      <label class="form-label fw-bold">Assessed Property Value</label>
                                      <p class="mb-0">{{ formatCurrency(currentRequest.specific_details.property_assessed_value || 0) }}</p>
                                    </div>
                                  </div>
                                  <div class="col-md-6">
                                    <div class="mb-3" v-if="currentRequest.specific_details.property_location">
                                      <label class="form-label fw-bold">Property Location</label>
                                      <p class="mb-0">{{ currentRequest.specific_details.property_location }}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <!-- Personal Property Information -->
                            <div v-if="currentRequest.specific_details.has_personal_property || currentRequest.specific_details.personal_property_value > 0" class="row mb-4">
                              <div class="col-12">
                                <h6 class="text-info mb-3">
                                  <i class="fas fa-car me-2"></i>Personal Property Information
                                </h6>
                                <div class="row">
                                  <div class="col-md-6">
                                    <div class="mb-3">
                                      <label class="form-label fw-bold">Personal Property Value</label>
                                      <p class="mb-0">{{ formatCurrency(currentRequest.specific_details.personal_property_value || 0) }}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <!-- Business Information -->
                            <div v-if="currentRequest.specific_details.business_name || currentRequest.specific_details.business_gross_receipts > 0" class="row mb-4">
                              <div class="col-12">
                                <h6 class="text-warning mb-3">
                                  <i class="fas fa-briefcase me-2"></i>Business/Professional Information
                                </h6>
                                <div class="row">
                                  <div class="col-md-6">
                                    <div class="mb-3" v-if="currentRequest.specific_details.business_name">
                                      <label class="form-label fw-bold">Business Name</label>
                                      <p class="mb-0">{{ currentRequest.specific_details.business_name }}</p>
                                    </div>
                                    <div class="mb-3" v-if="currentRequest.specific_details.business_type">
                                      <label class="form-label fw-bold">Business Type</label>
                                      <p class="mb-0">{{ currentRequest.specific_details.business_type }}</p>
                                    </div>
                                  </div>
                                  <div class="col-md-6">
                                    <div class="mb-3">
                                      <label class="form-label fw-bold">Annual Gross Receipts/Professional Fees</label>
                                      <p class="mb-0">{{ formatCurrency(currentRequest.specific_details.business_gross_receipts || 0) }}</p>
                                    </div>
                                    <div class="mb-3" v-if="currentRequest.specific_details.business_address">
                                      <label class="form-label fw-bold">Business Address</label>
                                      <p class="mb-0">{{ currentRequest.specific_details.business_address }}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <!-- Tax Computation -->
                            <div class="row">
                              <div class="col-12">
                                <h6 class="text-danger mb-3">
                                  <i class="fas fa-calculator me-2"></i>Tax Computation
                                </h6>
                                <div class="row">
                                  <div class="col-md-6">
                                    <div class="mb-3">
                                      <label class="form-label fw-bold">Computed Tax</label>
                                      <p class="mb-0">{{ formatCurrency(currentRequest.specific_details.computed_tax || 0) }}</p>
                                    </div>
                                  </div>
                                  <div class="col-md-6">
                                    <div class="mb-3">
                                      <label class="form-label fw-bold">Total Document Fee</label>
                                      <p class="mb-0 text-success fw-bold">{{ formatCurrency(currentRequest.total_document_fee || 0) }}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <!-- Barangay Clearance Application Details -->
                          <div v-else-if="currentRequest.document_type === 'Barangay Clearance'" class="barangay-clearance-details">
                            <!-- Pending Cases Information -->
                            <div class="row mb-4">
                              <div class="col-12">
                                <h6 class="text-warning mb-3">
                                  <i class="fas fa-gavel me-2"></i>Legal Status Information
                                </h6>
                                <div class="row">
                                  <div class="col-md-6">
                                    <div class="mb-3">
                                      <label class="form-label fw-bold">Pending Cases</label>
                                      <p class="mb-0">
                                        <span class="badge" :class="currentRequest.specific_details.has_pending_cases ? 'bg-warning' : 'bg-success'">
                                          {{ currentRequest.specific_details.has_pending_cases ? 'Has Pending Cases' : 'No Pending Cases' }}
                                        </span>
                                      </p>
                                    </div>
                                    <div v-if="currentRequest.specific_details.has_pending_cases && currentRequest.specific_details.pending_cases_details" class="mb-3">
                                      <label class="form-label fw-bold">Pending Cases Details</label>
                                      <div class="alert alert-warning">
                                        <i class="fas fa-exclamation-triangle me-2"></i>
                                        {{ currentRequest.specific_details.pending_cases_details }}
                                      </div>
                                    </div>
                                  </div>
                                  <div class="col-md-6">
                                    <div class="mb-3" v-if="currentRequest.specific_details.voter_registration_number">
                                      <label class="form-label fw-bold">Voter Registration Number</label>
                                      <p class="mb-0">{{ currentRequest.specific_details.voter_registration_number }}</p>
                                    </div>
                                    <div class="mb-3" v-if="currentRequest.specific_details.precinct_number">
                                      <label class="form-label fw-bold">Precinct Number</label>
                                      <p class="mb-0">{{ currentRequest.specific_details.precinct_number }}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <!-- Emergency Contact Information -->
                            <div v-if="currentRequest.specific_details.emergency_contact_name" class="row">
                              <div class="col-12">
                                <h6 class="text-info mb-3">
                                  <i class="fas fa-phone me-2"></i>Emergency Contact Information
                                </h6>
                                <div class="row">
                                  <div class="col-md-6">
                                    <div class="mb-3">
                                      <label class="form-label fw-bold">Contact Name</label>
                                      <p class="mb-0">{{ currentRequest.specific_details.emergency_contact_name }}</p>
                                    </div>
                                    <div class="mb-3" v-if="currentRequest.specific_details.emergency_contact_relationship">
                                      <label class="form-label fw-bold">Relationship</label>
                                      <p class="mb-0">{{ currentRequest.specific_details.emergency_contact_relationship }}</p>
                                    </div>
                                  </div>
                                  <div class="col-md-6">
                                    <div class="mb-3" v-if="currentRequest.specific_details.emergency_contact_phone">
                                      <label class="form-label fw-bold">Phone Number</label>
                                      <p class="mb-0">
                                        <a :href="`tel:${currentRequest.specific_details.emergency_contact_phone}`">
                                          {{ currentRequest.specific_details.emergency_contact_phone }}
                                        </a>
                                      </p>
                                    </div>
                                    <div class="mb-3" v-if="currentRequest.specific_details.emergency_contact_address">
                                      <label class="form-label fw-bold">Address</label>
                                      <p class="mb-0">{{ currentRequest.specific_details.emergency_contact_address }}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Uploaded Documents -->
                      <div class="card mb-4">
                        <div class="card-header">
                          <h6 class="mb-0"><i class="fas fa-paperclip me-2"></i>Uploaded Documents</h6>
                        </div>
                        <div class="card-body">
                          <div v-if="currentRequest.uploaded_documents && currentRequest.uploaded_documents.length > 0">
                            <div class="row g-3">
                              <div v-for="document in currentRequest.uploaded_documents" :key="document.id" class="col-md-4">
                                <div class="document-preview-card">
                                  <div class="document-preview-header">
                                    <div class="document-type-badge">
                                      <i class="fas fa-file-alt me-1"></i>
                                      {{ getDocumentTypeDisplayName(document.document_type) }}
                                    </div>
                                  </div>
                                  <div class="document-preview-content">
                                    <!-- Image Preview -->
                                    <div v-if="isImageFile(document.mime_type)"
                                         class="image-preview"
                                         @click="openImageModal(document)"
                                         @mouseenter="preloadImage(document)">
                                      <!-- Successfully loaded image -->
                                      <img
                                        v-if="documentUrls[document.id]"
                                        :src="documentUrls[document.id]"
                                        :alt="document.document_name"
                                        class="document-image"
                                        @error="handleImageError"
                                      />

                                      <!-- Loading state -->
                                      <div v-else-if="loadingDocuments.has(document.id)" class="loading-placeholder">
                                        <i class="fas fa-spinner fa-spin"></i>
                                        <span>Loading image...</span>
                                      </div>

                                      <!-- Failed state with retry option -->
                                      <div v-else-if="failedDocuments.has(document.id)" class="error-placeholder" @click.stop="retryLoadDocument(document)">
                                        <i class="fas fa-exclamation-triangle"></i>
                                        <span>Failed to load</span>
                                        <small>Click to retry</small>
                                      </div>

                                      <!-- Initial state (not yet attempted) -->
                                      <div v-else class="loading-placeholder">
                                        <i class="fas fa-image"></i>
                                        <span>Click to load</span>
                                      </div>
                                      <div class="image-overlay">
                                        <i class="fas fa-search-plus"></i>
                                        <span>Click to view</span>
                                      </div>
                                    </div>
                                    <!-- PDF Preview -->
                                    <div v-else-if="isPdfFile(document.mime_type)" class="pdf-preview">
                                      <div class="pdf-icon">
                                        <i class="fas fa-file-pdf fa-3x text-danger"></i>
                                      </div>
                                      <div class="pdf-info">
                                        <p class="mb-1 fw-bold">{{ document.document_name }}</p>
                                        <small class="text-muted">{{ formatFileSize(document.file_size) }}</small>
                                      </div>
                                      <button
                                        class="btn btn-sm btn-outline-primary mt-2"
                                        @click="downloadDocument(document)"
                                      >
                                        <i class="fas fa-download me-1"></i>Download
                                      </button>
                                    </div>
                                    <!-- Other File Types -->
                                    <div v-else class="file-preview">
                                      <div class="file-icon">
                                        <i class="fas fa-file fa-3x text-secondary"></i>
                                      </div>
                                      <div class="file-info">
                                        <p class="mb-1 fw-bold">{{ document.document_name }}</p>
                                        <small class="text-muted">{{ formatFileSize(document.file_size) }}</small>
                                      </div>
                                      <button
                                        class="btn btn-sm btn-outline-primary mt-2"
                                        @click="downloadDocument(document)"
                                      >
                                        <i class="fas fa-download me-1"></i>Download
                                      </button>
                                    </div>
                                  </div>
                                  <div class="document-preview-footer">
                                    <small class="text-muted">
                                      <i class="fas fa-clock me-1"></i>
                                      Uploaded {{ formatDate(document.created_at) }}
                                    </small>
                                    
                                    <!-- Verification Status Badge -->
                                    <div v-if="document.verification_status" class="mt-2">
                                      <span class="badge" :class="{
                                        'bg-success': document.verification_status === 'approved',
                                        'bg-danger': document.verification_status === 'rejected',
                                        'bg-warning text-dark': document.verification_status === 'pending'
                                      }">
                                        {{ document.verification_status.toUpperCase() }}
                                      </span>
                                    </div>
                                    
                                    <!-- Approve/Reject Buttons for Pending Documents -->
                                    <div v-if="document.verification_status === 'pending'" class="btn-group mt-2 w-100">
                                      <button 
                                        class="btn btn-sm btn-success"
                                        @click="approveSupportingDocument(document.id)"
                                        title="Approve this document"
                                      >
                                        <i class="fas fa-check me-1"></i>
                                        Approve
                                      </button>
                                      <button 
                                        class="btn btn-sm btn-danger"
                                        @click="rejectSupportingDocument(document.id)"
                                        title="Reject this document"
                                      >
                                        <i class="fas fa-times me-1"></i>
                                        Reject
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div v-else class="no-documents">
                            <div class="text-center py-4">
                              <i class="fas fa-folder-open fa-3x text-muted mb-3"></i>
                              <h6 class="text-muted">No Documents Uploaded</h6>
                              <p class="text-muted mb-0">
                                <span v-if="currentRequest.document_type === 'Cedula'">
                                  Cedula requests typically don't require supporting documents.
                                </span>
                                <span v-else>
                                  The client hasn't uploaded any supporting documents yet.
                                </span>
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Right Column - Status Management -->
                    <div class="col-lg-4">
                      <!-- Status Management -->
                      <div class="card mb-4">
                        <div class="card-header">
                          <h6 class="mb-0"><i class="fas fa-tasks me-2"></i>Status Management</h6>
                        </div>
                        <div class="card-body">
                          <!-- Current Status Display -->
                          <div class="mb-3">
                            <label class="form-label fw-bold">Current Status</label>
                            <div class="d-flex align-items-center gap-2">
                              <span class="badge" :class="`bg-${getStatusColor(currentRequest.status_name)}`">
                                {{ formatStatus(currentRequest.status_name) }}
                              </span>
                              <small class="text-muted">
                                <i class="fas fa-info-circle me-1"></i>
                                {{ getStatusDescription(currentRequest.status_name) }}
                              </small>
                            </div>
                          </div>

                          <!-- Status Progression Buttons -->
                          <div class="mb-3">
                            <label class="form-label fw-bold">Available Actions</label>
                            <div v-if="getNextStatusActions().length === 0" class="alert alert-info py-2 px-3 mb-0">
                              <i class="fas fa-info-circle me-2"></i>
                              <small>No further actions available for this request ({{ formatStatus(currentRequest.status_name) }})</small>
                            </div>
                            <div v-else class="d-flex flex-wrap gap-2">
                              <button
                                v-for="action in getNextStatusActions()"
                                :key="action.status_id"
                                class="btn"
                                :class="action.buttonClass"
                                @click="progressToNextStatus(action.status_id)"
                                :title="action.description"
                              >
                                <i :class="action.icon" class="me-1"></i>
                                {{ action.label }}
                              </button>
                            </div>
                          </div>

                          <!-- Separate Cancel Button -->
                          <div v-if="canCancelRequest()" class="d-grid">
                            <button
                              class="btn btn-outline-danger"
                              @click="cancelRequest"
                              title="Cancel this request permanently"
                            >
                              <i class="fas fa-times me-1"></i>
                              Cancel Request
                            </button>
                          </div>
                        </div>
                      </div>

                      <!-- Ill comment this for now because I dont need this for now -->
                      <!-- Payment Information -->
                      <div class="card mb-4">
                        <div class="card-header">
                          <h6 class="mb-0"><i class="fas fa-credit-card me-2"></i>Payment Information</h6>
                        </div>
                        <div class="card-body">
                          <div class="mb-3">
                            <label class="form-label fw-bold">Payment Method</label>
                            <p class="mb-0">{{ currentRequest.payment_method || 'Not specified' }}</p>
                          </div>
                          
                          <div class="row">
                            <div class="col-6">
                              <div class="mb-2">
                                <label class="form-label fw-bold small">Total Amount</label>
                                <p class="mb-0 fw-bold text-primary">{{ formatCurrency(getDisplayFee(currentRequest)) }}</p>
                              </div>
                            </div>
                          </div>

                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Status History Timeline -->
                  <div class="card">
                    <div class="card-header">
                      <h6 class="mb-0"><i class="fas fa-history me-2"></i>Status History</h6>
                    </div>
                    <div class="card-body">
                      <div v-if="currentRequest.status_history && currentRequest.status_history.length > 0" class="timeline">
                        <div
                          v-for="(history, index) in currentRequest.status_history"
                          :key="history.id"
                          class="timeline-item"
                          :class="{ 'timeline-item-last': index === currentRequest.status_history.length - 1 }"
                        >
                          <div class="timeline-marker" :class="`bg-${getStatusColor(history.new_status_name)}`">
                            <i class="fas fa-circle"></i>
                          </div>
                          <div class="timeline-content">
                            <div class="timeline-header">
                              <span class="badge" :class="`bg-${getStatusColor(history.new_status_name)}`">
                                {{ formatStatus(history.new_status_name) }}
                              </span>
                              <small class="text-muted ms-2">{{ formatDateTime(history.changed_at) }}</small>
                            </div>
                            <div class="timeline-body">
                              <p class="mb-1">
                                <strong>Changed by:</strong> {{ getChangedByName(history) }}
                              </p>
                              <p v-if="history.old_status_name" class="mb-1">
                                <strong>From:</strong> {{ formatStatus(history.old_status_name) }}
                              </p>
                              <!-- I dont neeed reason for now -->
                              <!-- <p v-if="history.change_reason" class="mb-0">
                                <strong>Reason:</strong> {{ getFormattedReason(history.change_reason) }}
                              </p> -->
                            </div>
                          </div>
                        </div>
                      </div>
                      <div v-else class="text-center text-muted py-3">
                        <i class="fas fa-history fa-2x mb-2"></i>
                        <p>No status history available</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-info me-2" @click="exportSingleRequestToExcel" :disabled="!currentRequest">
                    <i class="fas fa-file-excel me-1"></i>
                    Export to Excel
                  </button>
                  <button type="button" class="btn btn-danger me-2" @click="exportSingleRequestToPDF" :disabled="!currentRequest">
                    <i class="fas fa-file-pdf me-1"></i>
                    Export to PDF
                  </button>
                  <button type="button" class="btn btn-secondary" @click="showRequestDetails = false">
                    <i class="fas fa-times me-1"></i>
                    Close
                  </button>
                  <button type="button" class="btn btn-primary" @click="refreshRequestDetails">
                    <i class="fas fa-sync-alt me-1"></i>
                    Refresh
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Reject Modal -->
          <div v-if="showQuickReject && selectedRequestForReject" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
            <div class="modal-dialog">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title">
                    <i class="fas fa-times-circle text-danger me-2"></i>
                    Reject Request
                  </h5>
                  <button type="button" class="btn-close" @click="closeQuickRejectModal"></button>
                </div>
                <div class="modal-body">
                  <div class="alert alert-warning">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    You are about to reject this document request. This action will notify the client immediately.
                  </div>

                  <div class="mb-3">
                    <strong>Request Details:</strong>
                    <ul class="list-unstyled mt-2">
                      <li><strong>Request Number:</strong> {{ selectedRequestForReject.request_number }}</li>
                      <li><strong>Document Type:</strong> {{ selectedRequestForReject.document_type }}</li>
                      <li><strong>Client:</strong> {{ selectedRequestForReject.client_name }}</li>
                    </ul>
                  </div>


                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" @click="closeQuickRejectModal" :disabled="quickRejectForm.loading">
                    <i class="fas fa-times me-1"></i>
                    Cancel
                  </button>
                  <button type="button" class="btn btn-danger" @click="confirmQuickReject" :disabled="quickRejectForm.loading">
                    <i class="fas fa-times-circle me-1"></i>
                    <span v-if="quickRejectForm.loading">
                      <i class="fas fa-spinner fa-spin me-1"></i>
                      Rejecting...
                    </span>
                    <span v-else>Reject Request</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Approve Modal -->
          <div v-if="showQuickApprove && selectedRequestForApprove" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
            <div class="modal-dialog">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title">
                    <i class="fas fa-check-circle text-success me-2"></i>
                    Approve Request
                  </h5>
                  <button type="button" class="btn-close" @click="closeQuickApproveModal"></button>
                </div>
                <div class="modal-body">
                  <div class="alert alert-info">
                    <i class="fas fa-info-circle me-2"></i>
                    You are about to approve this document request. This action will notify the client immediately and move the request to the next processing stage.
                  </div>

                  <div class="mb-3">
                    <strong>Request Details:</strong>
                    <ul class="list-unstyled mt-2">
                      <li><strong>Request Number:</strong> {{ selectedRequestForApprove.request_number }}</li>
                      <li><strong>Document Type:</strong> {{ selectedRequestForApprove.document_type }}</li>
                      <li><strong>Client:</strong> {{ selectedRequestForApprove.client_name }}</li>
                    </ul>
                  </div>

                  <div v-if="quickApproveForm.error" class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    {{ quickApproveForm.error }}
                  </div>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" @click="closeQuickApproveModal" :disabled="quickApproveForm.loading">
                    <i class="fas fa-times me-1"></i>
                    Cancel
                  </button>
                  <button type="button" class="btn btn-success" @click="confirmQuickApprove" :disabled="quickApproveForm.loading">
                    <i class="fas fa-check-circle me-1"></i>
                    <span v-if="quickApproveForm.loading">
                      <i class="fas fa-spinner fa-spin me-1"></i>
                      Approving...
                    </span>
                    <span v-else>Approve Request</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>

    <!-- Image Modal -->
    <div v-if="showImageModal && selectedImage" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.8);" @click.self="closeImageModal">
      <div class="modal-dialog modal-xl modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header sticky-header">
            <h5 class="modal-title">
              <i class="fas fa-image me-2"></i>
              {{ selectedImage.document_name }}
            </h5>
            <div class="header-controls">
              <button
                type="button"
                class="btn btn-outline-light btn-sm me-2"
                @click="downloadDocument(selectedImage)"
                :disabled="!documentUrls[selectedImage.id] || imageLoadingInModal"
                title="Download">
                <i class="fas fa-download"></i>
              </button>
              <button
                type="button"
                class="btn-close btn-close-white"
                @click="closeImageModal"
                aria-label="Close"
                title="Close">
              </button>
            </div>
          </div>
          <div class="modal-body text-center p-0">
            <div class="image-modal-container">
              <!-- Successfully loaded image -->
              <img
                v-if="documentUrls[selectedImage.id] && !imageLoadingInModal"
                :src="documentUrls[selectedImage.id]"
                :alt="selectedImage.document_name"
                class="modal-image"
                @error="handleImageError"
                @load="onModalImageLoad"
                loading="lazy"
              />

              <!-- Loading state -->
              <div v-else-if="imageLoadingInModal || loadingDocuments.has(selectedImage.id)" class="loading-placeholder modal-loading">
                <div class="loading-content">
                  <i class="fas fa-spinner fa-spin fa-3x mb-3"></i>
                  <span class="loading-text">Loading high-resolution image...</span>
                  <div class="loading-progress mt-2">
                    <div class="progress-bar"></div>
                  </div>
                </div>
              </div>

              <!-- Failed state -->
              <div v-else-if="modalImageError || failedDocuments.has(selectedImage.id)" class="error-placeholder modal-error">
                <i class="fas fa-exclamation-triangle fa-3x mb-3"></i>
                <span class="error-text">Failed to load image</span>
                <button
                  class="btn btn-outline-light mt-3"
                  @click="retryLoadDocument(selectedImage)"
                  :disabled="imageLoadingInModal">
                  <i class="fas fa-redo me-2"></i>Retry
                </button>
              </div>

              <!-- Fallback -->
              <div v-else class="loading-placeholder modal-loading">
                <i class="fas fa-image fa-3x mb-3"></i>
                <span class="loading-text">Preparing image...</span>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <div class="d-flex justify-content-between align-items-center w-100">
              <div class="image-info">
                <span class="badge bg-info me-2">{{ getDocumentTypeDisplayName(selectedImage.document_type) }}</span>
                <small class="text-muted">
                  {{ formatFileSize(selectedImage.file_size) }} •
                  Uploaded {{ formatDate(selectedImage.created_at) }}
                </small>
              </div>
              <div class="image-actions">
                <button
                  type="button"
                  class="btn btn-outline-primary me-2"
                  @click="downloadDocument(selectedImage)"
                  :disabled="!documentUrls[selectedImage.id] || imageLoadingInModal">
                  <i class="fas fa-download me-1"></i>Download
                </button>
                <button type="button" class="btn btn-secondary" @click="closeImageModal">
                  <i class="fas fa-times me-1"></i>Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Verification Status Modal -->
    <div class="modal fade" id="verificationModal" tabindex="-1" aria-labelledby="verificationModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="verificationModalLabel">
              <i class="fas fa-id-card me-2"></i>
              Family Member Verification
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div v-if="currentVerification">
              <!-- Beneficiary Information -->
              <div class="card mb-3">
                <div class="card-header">
                  <h6 class="mb-0">Beneficiary Information</h6>
                </div>
                <div class="card-body">
                  <div class="row">
                    <div class="col-md-6">
                      <strong>Name:</strong> {{ currentVerification.beneficiary_name }}
                    </div>
                    <div class="col-md-6">
                      <strong>Relationship:</strong> {{ currentVerification.relationship }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Verification Image -->
              <div class="card mb-3">
                <div class="card-header">
                  <h6 class="mb-0">Verification Image</h6>
                </div>
                <div class="card-body text-center">
                  <img
                    v-if="currentVerification.image_url"
                    :src="currentVerification.image_url"
                    class="img-fluid rounded border"
                    style="max-height: 400px;"
                    alt="Verification Image"
                  />
                  <div v-else class="text-muted">
                    <i class="fas fa-image fa-3x mb-2"></i>
                    <p>No verification image available</p>
                  </div>
                </div>
              </div>

              <!-- Verification Actions -->
              <div class="card">
                <div class="card-header">
                  <h6 class="mb-0">Verification Decision</h6>
                </div>
                <div class="card-body">
                  <div class="row">
                    <div class="col-md-6">
                      <label class="form-label">Status</label>
                      <select v-model="verificationForm.status" class="form-select">
                        <option value="pending">Pending Review</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label">Notes (Optional)</label>
                      <textarea
                        v-model="verificationForm.notes"
                        class="form-control"
                        rows="3"
                        placeholder="Add any notes about the verification decision..."
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button
              type="button"
              class="btn btn-primary"
              @click="saveVerificationStatus"
              :disabled="!verificationForm.status"
            >
              <i class="fas fa-save me-1"></i>
              Save Decision
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Authorized Pickup Documents Modal Component -->
    <AuthorizedPickupDocumentsModal
      :request="selectedRequestForPickup"
      :processing="processingPickupAction"
      @verify="verifyPickupAuthorization"
      @reject="rejectPickupAuthorization"
    />
</template>

<script>
import AdminHeader from './AdminHeader.vue';
import AdminSidebar from './AdminSidebar.vue';
import AuthorizedPickupDocumentsModal from './AuthorizedPickupDocumentsModal.vue';
import unifiedAuthService from '@/services/unifiedAuthService';
import adminDocumentService from '@/services/adminDocumentService';
import supportingDocumentService from '@/services/supportingDocumentService';
import beneficiaryVerificationService from '@/services/beneficiaryVerificationService';
import authorizationDocumentService from '@/services/authorizationDocumentService';
import api from '@/services/api';
import { Modal } from 'bootstrap';
import notificationService from '@/services/notificationService';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default {
  name: 'AdminRequests',
  components: {
    AdminHeader,
    AdminSidebar,
    AuthorizedPickupDocumentsModal
  },



  data() {
    return {
      // UI State
      loading: true,
      sidebarCollapsed: false,
      showUserDropdown: false,
      isMobile: false,
      adminData: null,
      errorMessage: '',
      viewMode: 'table', // 'card' or 'table' - default to table view

      // Request Management Data
      requests: [],
      selectedRequests: [],
      currentRequest: null,
      statusOptions: [], // All status options (for transitions)
      filterStatusOptions: [], // Filtered status options (for filter dropdown)
      selectedRequestForPickup: null,
      processingPickupAction: false,

      // Pagination
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10
      },

      // Filters
      filters: {
        status: '',
        document_type: '',
        priority: '',
        search: '',
        date_from: '',
        date_to: ''
      },

      // Statistics
      requestStats: {
        total: 0,
        pending: 0,
        approved: 0,
        completed: 0,
        thisMonth: 0
      },

      // Document Types and Status Options
      documentTypes: [],
      searchTimeout: null,

      // UI State
      showFilters: false,
      showBulkActions: false,
      showRequestDetails: false,
      showRejectForm: false,
      showQuickReject: false,
      showQuickApprove: false,

      // Verification Modal
      currentVerification: null,
      verificationForm: {
        status: 'pending',
        notes: ''
      },
      showImageModal: false,
      selectedImage: null,
      bulkAction: '',
      documentUrls: {}, // Store blob URLs for documents
      loadingDocuments: new Set(), // Track which documents are currently loading
      failedDocuments: new Set(), // Track which documents failed to load
      imageLoadingInModal: false, // Track if modal image is loading
      modalImageError: false, // Track if modal image failed

      // Status Update Forms
      statusUpdateForm: {
        status_id: ''
      },
      rejectForm: {
        reason: ''
      },
      quickRejectForm: {
        loading: false,
        error: ''
      },
      selectedRequestForReject: null,
      quickApproveForm: {
        loading: false,
        error: ''
      },
      selectedRequestForApprove: null,

      // Payment verification form
      paymentVerificationForm: {
        amount_received: '',
        receipt_number: '',
        loading: false,
        error: ''
      },

      // Pickup scheduling form
      pickupScheduleForm: {
        scheduled_date: '',
        scheduled_time_start: '',
        scheduled_time_end: '',
        loading: false,
        error: ''
      },

      // Real-time features
      refreshInterval: null,
      autoRefreshEnabled: true,
      refreshRate: 30000, // 30 seconds
      lastRefresh: null
    };
  },

  async mounted() {
    // Check authentication
    if (!unifiedAuthService.isLoggedIn() || unifiedAuthService.getUserType() !== 'admin') {
      this.$router.push('/login');
      return;
    }

    // Initialize UI state
    this.initializeUI();

    // Load component data
    await this.loadComponentData();

    // Initialize real-time features
    this.initializeRealTimeFeatures();
  },

  beforeUnmount() {
    if (this.handleResize) {
      window.removeEventListener('resize', this.handleResize);
    }

    // Clean up real-time features
    this.cleanupRealTimeFeatures();

    // Clean up blob URLs to prevent memory leaks
    this.cleanupDocumentUrls();
  },

  computed: {
    activeMenu() {
      const path = this.$route.path;
      if (path.includes('/admin/users')) return 'users';
      if (path.includes('/admin/requests')) return 'requests';
      if (path.includes('/admin/reports')) return 'reports';
      if (path.includes('/admin/settings')) return 'settings';
      if (path.includes('/admin/activity-logs')) return 'activity';
      if (path.includes('/admin/profile')) return 'profile';
      return 'dashboard';
    }
  },

  methods: {
    // Initialize UI state
    initializeUI() {
      this.isMobile = window.innerWidth <= 768;

      // Load saved sidebar state (only on desktop)
      if (!this.isMobile) {
        const saved = localStorage.getItem('adminSidebarCollapsed');
        this.sidebarCollapsed = saved ? JSON.parse(saved) : false;
      } else {
        this.sidebarCollapsed = true; // Always collapsed on mobile
      }

      // Setup resize listener
      this.handleResize = () => {
        const wasMobile = this.isMobile;
        this.isMobile = window.innerWidth <= 768;

        if (this.isMobile && !wasMobile) {
          this.sidebarCollapsed = true; // Collapse when switching to mobile
        } else if (!this.isMobile && wasMobile) {
          // Restore saved state when switching to desktop
          const saved = localStorage.getItem('adminSidebarCollapsed');
          this.sidebarCollapsed = saved ? JSON.parse(saved) : false;
        }
      };
      window.addEventListener('resize', this.handleResize);
    },

    // Sidebar toggle
    handleSidebarToggle() {
      this.sidebarCollapsed = !this.sidebarCollapsed;
      localStorage.setItem('adminSidebarCollapsed', JSON.stringify(this.sidebarCollapsed));
    },

    // Menu navigation
    handleMenuChange(menu) {
      const routes = {
        'dashboard': '/admin/dashboard',
        'users': '/admin/users',
        'requests': '/admin/requests',
        'reports': '/admin/reports',
        'settings': '/admin/settings',
        'activity': '/admin/activity-logs',
        'profile': '/admin/profile'
      };

      // Close sidebar on mobile after navigation
      if (this.isMobile) {
        this.sidebarCollapsed = true;
      }

      if (routes[menu]) {
        this.$router.push(routes[menu]);
      }
    },

    // User dropdown toggle
    handleUserDropdownToggle() {
      this.showUserDropdown = !this.showUserDropdown;
    },

    // Handle opening request modal from notifications
    async handleOpenRequestModal(modalData) {
      console.log('🔔 AdminRequests: Opening request modal from notification:', modalData);

      try {
        const { requestId, focusTab } = modalData;

        if (!requestId) {
          console.error('❌ No request ID provided for modal');
          return;
        }

        // Use the existing viewRequestDetails method to open the modal
        await this.viewRequestDetails(requestId);

        // If a specific tab should be focused, handle that after modal opens
        if (focusTab) {
          // Wait a bit for the modal to fully render
          setTimeout(() => {
            this.focusModalTab(focusTab);
          }, 300);
        }

        console.log('✅ Request modal opened successfully');

      } catch (error) {
        console.error('❌ Error opening request modal:', error);
        // Show error message to user
        this.showErrorMessage('Failed to open request details');
      }
    },

    // Focus on a specific tab in the request details modal
    focusModalTab(tabName) {
      try {
        console.log('🎯 Focusing on modal tab:', tabName);

        // Map tab names to actual tab elements or actions
        const tabMappings = {
          'payment': () => {
            // Focus on payment section in the modal
            const paymentSection = document.querySelector('#requestDetailsModal .payment-section');
            if (paymentSection) {
              paymentSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
              paymentSection.classList.add('highlight-section');
              setTimeout(() => paymentSection.classList.remove('highlight-section'), 2000);
            }
          },
          'status': () => {
            // Focus on status section
            const statusSection = document.querySelector('#requestDetailsModal .status-section');
            if (statusSection) {
              statusSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
              statusSection.classList.add('highlight-section');
              setTimeout(() => statusSection.classList.remove('highlight-section'), 2000);
            }
          },
          'documents': () => {
            // Focus on documents section
            const documentsSection = document.querySelector('#requestDetailsModal .documents-section');
            if (documentsSection) {
              documentsSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
              documentsSection.classList.add('highlight-section');
              setTimeout(() => documentsSection.classList.remove('highlight-section'), 2000);
            }
          }
        };

        const focusAction = tabMappings[tabName];
        if (focusAction) {
          focusAction();
        } else {
          console.log('⚠️ Unknown tab name:', tabName);
        }

      } catch (error) {
        console.error('❌ Error focusing modal tab:', error);
      }
    },

    // Menu actions
    handleMenuAction(action) {
      if (action === 'profile') {
        this.$router.push('/admin/profile');
      } else if (action === 'settings') {
        this.$router.push('/admin/settings');
      }
      this.showUserDropdown = false;
    },

    // Close mobile sidebar
    closeMobileSidebar() {
      if (this.isMobile) {
        this.sidebarCollapsed = true;
      }
    },

    // Logout
    handleLogout() {
      unifiedAuthService.logout();
      this.$router.push('/login');
    },

    // Load admin profile
    async loadAdminProfile() {
      try {
        const currentUser = unifiedAuthService.getCurrentUser();
        if (currentUser && currentUser.profile) {
          this.adminData = currentUser.profile;
        } else {
          // Fallback to basic user data
          this.adminData = {
            first_name: currentUser?.username || 'Admin',
            role: currentUser?.role || 'admin'
          };
        }
      } catch (error) {
        console.error('Failed to load admin profile:', error);
        const currentUser = unifiedAuthService.getCurrentUser();
        this.adminData = {
          first_name: currentUser?.username || 'Admin',
          role: currentUser?.role || 'admin'
        };
      }
    },

    // Load all component data
    async loadComponentData() {
      this.loading = true;
      try {
        await Promise.all([
          this.loadAdminProfile(),
          this.loadStatusOptions(),
          this.loadDocumentTypes(),
          this.loadRequests(),
          this.loadDashboardStats()
        ]);
      } catch (error) {
        console.error('Failed to load component data:', error);
        const errorData = adminDocumentService.parseError(error);
        this.errorMessage = errorData.message || 'Failed to load request data';

        if (errorData.status === 401) {
          unifiedAuthService.logout();
          this.$router.push('/login');
        }
      } finally {
        this.loading = false;
      }
    },

    // Load status options
    async loadStatusOptions() {
      try {
        console.log('🔄 Loading status options...');
        const response = await adminDocumentService.getStatusOptions();
        console.log('📋 Status options response:', response);

        if (response.success) {
          // Keep all statuses available for status transitions
          // We'll filter them appropriately in different contexts
          const allStatuses = response.data || [];
          this.statusOptions = allStatuses;

          // Create a separate array for filter dropdown (excluding final states)
          this.filterStatusOptions = allStatuses.filter(status => {
            const statusName = status.status_name.toLowerCase();
            return statusName !== 'completed' && statusName !== 'cancelled';
          });

          console.log('✅ All status options loaded:', this.statusOptions);
          console.log('✅ Filter status options (active only):', this.filterStatusOptions);
        } else {
          console.error('❌ Failed to load status options:', response.message);
          this.statusOptions = [];
        }
      } catch (error) {
        console.error('❌ Error loading status options:', error);
        this.statusOptions = [];
        this.showToast('Error', 'Failed to load status options', 'error');
      }
    },

    // Load dashboard statistics
    async loadDashboardStats() {
      try {
        console.log('🔄 Loading dashboard stats...');
        const response = await adminDocumentService.getDashboardStats();
        console.log('📊 Dashboard stats response:', response);

        if (response.success) {
          // Map the backend response structure to frontend expectations
          const data = response.data;
          this.requestStats = {
            total: data.overview?.total_requests || 0,
            pending: data.overview?.pending_requests || 0,
            approved: data.overview?.approved_requests || 0,
            completed: data.overview?.completed_requests || 0,
            thisMonth: data.time_based?.today_requests || 0
          };
          console.log('✅ Request stats updated:', this.requestStats);
        } else {
          console.error('❌ Failed to load dashboard stats:', response.message);
        }
      } catch (error) {
        console.error('❌ Error loading dashboard stats:', error);
        // Set default values on error
        this.requestStats = {
          total: 0,
          pending: 0,
          approved: 0,
          completed: 0,
          thisMonth: 0
        };
      }
    },

    // Load document types
    async loadDocumentTypes() {
      try {
        console.log('🔄 Loading document types...');
        const response = await adminDocumentService.getDocumentTypes();
        console.log('📋 Document types response:', response);

        if (response.success) {
          this.documentTypes = response.data || [];
          console.log('✅ Document types loaded:', this.documentTypes);
        } else {
          console.error('❌ Failed to load document types:', response.message);
          this.documentTypes = [];
        }
      } catch (error) {
        console.error('❌ Error loading document types:', error);
        this.documentTypes = [];
        this.showToast('Error', 'Failed to load document types', 'error');
      }
    },

    // Load requests with current filters and pagination
    // NOTE: AdminRequests.vue shows ACTIVE requests only (excludes completed and cancelled)
    // For historical view including cancelled requests, see RequestHistory.vue
    async loadRequests() {
      try {
        const params = {
          page: this.pagination.currentPage,
          limit: this.pagination.itemsPerPage,
          ...this.filters
        };

        const response = await adminDocumentService.getAllRequests(params);
        if (response.success) {
          // Filter out completed and cancelled requests from the response
          // AdminRequests is for active document management only
          const filteredRequests = (response.data.requests || []).filter(request => {
            const statusName = request.status_name.toLowerCase();
            return statusName !== 'completed' && statusName !== 'cancelled';
          });

          this.requests = filteredRequests;
          this.pagination = {
            currentPage: response.data.pagination?.current_page || 1,
            totalPages: response.data.pagination?.total_pages || 1,
            totalItems: filteredRequests.length, // Update to reflect filtered count
            itemsPerPage: response.data.pagination?.per_page || 10
          };
        }
      } catch (error) {
        console.error('Failed to load requests:', error);
        const errorData = adminDocumentService.parseError(error);
        this.errorMessage = errorData.message || 'Failed to load requests';
        this.requests = [];
      }
    },

    // Filter and search methods
    applyFilters() {
      this.pagination.currentPage = 1;
      this.loadRequests();
    },

    // Debounced search method
    debouncedSearch() {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.applyFilters();
      }, 300);
    },

    clearFilters() {
      this.filters = {
        status: '',
        document_type: '',
        priority: '',
        search: '',
        date_from: '',
        date_to: ''
      };
      this.applyFilters();
    },

    // Pagination methods
    changePage(page) {
      if (page >= 1 && page <= this.pagination.totalPages) {
        this.pagination.currentPage = page;
        this.loadRequests();
      }
    },

    changeItemsPerPage(itemsPerPage) {
      this.pagination.itemsPerPage = itemsPerPage;
      this.pagination.currentPage = 1;
      this.loadRequests();
    },

    goBack() {
      this.$router.push('/admin/dashboard');
    },

    // Request selection methods
    toggleRequestSelection(requestId) {
      const index = this.selectedRequests.indexOf(requestId);
      if (index > -1) {
        this.selectedRequests.splice(index, 1);
      } else {
        this.selectedRequests.push(requestId);
      }
    },

    selectAllRequests() {
      if (this.selectedRequests.length === this.requests.length) {
        this.selectedRequests = [];
      } else {
        this.selectedRequests = this.requests.map(r => r.id);
      }
    },

    // Request details
    async viewRequestDetails(requestId) {
      console.log('🚀 View details clicked for request ID:', requestId);

      try {
        const response = await adminDocumentService.getRequestDetails(requestId);
        console.log('📋 API Response received:', response);

        if (response.success) {
          console.log('✅ Response successful, data:', response.data);

          // Debug client profile fields
          const data = response.data;
          console.log('🎯 COMPLETE RESPONSE DATA:', data);
          console.log('🎯 ALL DATA KEYS:', Object.keys(data));
          console.log('🎯 CLIENT PROFILE FIELDS DEBUG:');
          console.log('   Birth Date:', data.client_birth_date);
          console.log('   Gender:', data.client_gender);
          console.log('   Civil Status ID:', data.client_civil_status_id);
          console.log('   Nationality:', data.client_nationality);
          console.log('   Years of Residency:', data.client_years_of_residency);
          console.log('   Months of Residency:', data.client_months_of_residency);

          // Check if fields exist with different names
          console.log('🔍 SEARCHING FOR SIMILAR FIELDS:');
          Object.keys(data).forEach(key => {
            if (key.includes('birth') || key.includes('gender') || key.includes('civil') ||
                key.includes('nationality') || key.includes('residency')) {
              console.log(`   Found: ${key} = ${data[key]}`);
            }
          });

          this.currentRequest = response.data;
          this.showRequestDetails = true;
          // Reset forms
          this.statusUpdateForm = { status_id: '' };
          this.rejectForm = { reason: '' };
          this.showRejectForm = false;
          console.log('📋 Request details loaded:', response.data);

          // Load document URLs for images
          if (response.data.uploaded_documents && response.data.uploaded_documents.length > 0) {
            this.loadDocumentUrls(response.data.uploaded_documents);
          }

          this.showToast('Success', `Request details loaded for ${response.data.request_number}`, 'success');
        }
      } catch (error) {
        console.error('Failed to load request details:', error);
        const errorData = adminDocumentService.parseError(error);
        this.errorMessage = errorData.message || 'Failed to load request details';
        this.showToast('Error', 'Failed to load request details', 'error');
      }
    },

    // Refresh request details
    async refreshRequestDetails() {
      if (this.currentRequest) {
        await this.viewRequestDetails(this.currentRequest.id);
      }
    },

    // Update request status from modal
    async updateRequestStatusFromModal() {
      console.log('🔄 Updating request status...');
      console.log('📋 Status form data:', this.statusUpdateForm);
      console.log('📋 Current request:', this.currentRequest);

      if (!this.statusUpdateForm.status_id || !this.currentRequest) {
        console.error('❌ Missing required data for status update');
        this.showToast('Error', 'Please select a status to update', 'error');
        return;
      }

      // Enhanced debugging for status validation
      const currentStatus = this.currentRequest.status_name;
      const newStatusId = this.statusUpdateForm.status_id;
      const newStatus = this.statusOptions.find(s => s.id == newStatusId);

      console.log('🔍 Status validation debug:');
      console.log('   Current status:', currentStatus);
      console.log('   New status ID:', newStatusId, '(type:', typeof newStatusId, ')');
      console.log('   New status object:', newStatus);
      console.log('   Available transitions:', this.getAllowedStatusTransitions(currentStatus.toLowerCase()));
      console.log('   Available status options:', this.getAvailableStatusOptions());
      console.log('   All status options:', this.statusOptions);

      if (!this.isValidStatusChange(currentStatus, newStatusId)) {
        console.error('❌ Invalid status change attempted');
        console.error('   From:', currentStatus, 'To:', newStatus?.status_name);
        this.showToast('Error', 'This status change is not allowed', 'error');
        return;
      }

      try {
        const updateData = {
          status_id: parseInt(this.statusUpdateForm.status_id)
        };

        console.log('📤 Sending status update:', updateData);

        const response = await adminDocumentService.updateRequestStatus(
          this.currentRequest.id,
          updateData
        );

        console.log('📥 Status update response:', response);

        if (response.success) {
          // Refresh the request details
          await this.refreshRequestDetails();
          // Refresh the main requests list
          await this.loadRequests();
          // Reset form
          this.statusUpdateForm = { status_id: '' };

          // Show success message
          this.errorMessage = '';
          this.showToast('Success', 'Request status updated successfully', 'success');
        } else {
          console.error('❌ Status update failed:', response.message);
          this.showToast('Error', response.message || 'Failed to update request status', 'error');
        }
      } catch (error) {
        console.error('❌ Error updating request status:', error);
        const errorData = adminDocumentService.parseError(error);
        this.errorMessage = errorData.message || 'Failed to update request status';
        this.showToast('Error', errorData.message || 'Failed to update request status', 'error');
      }
    },



    // Reject request from modal
    async rejectRequestFromModal() {
      if (!this.currentRequest || !this.rejectForm.reason.trim()) return;

      try {
        const response = await adminDocumentService.rejectRequest(
          this.currentRequest.id,
          { reason: this.rejectForm.reason }
        );

        if (response.success) {
          await this.refreshRequestDetails();
          await this.loadRequests();
          this.rejectForm = { reason: '' };
          this.showRejectForm = false;
        }
      } catch (error) {
        console.error('Failed to reject request:', error);
        const errorData = adminDocumentService.parseError(error);
        this.errorMessage = errorData.message || 'Failed to reject request';
      }
    },

    // Status update methods
    async updateRequestStatus(requestId, statusId, reason = '') {
      try {
        const response = await adminDocumentService.updateRequestStatus(requestId, {
          status_id: statusId,
          reason: reason
        });

        if (response.success) {
          await this.loadRequests();
          await this.loadDashboardStats();
          this.errorMessage = '';
        }
      } catch (error) {
        console.error('Failed to update request status:', error);
        const errorData = adminDocumentService.parseError(error);
        this.errorMessage = errorData.message || 'Failed to update request status';
      }
    },

    async approveRequest(requestId, reason = '') {
      try {
        const response = await adminDocumentService.approveRequest(requestId, { reason });
        if (response.success) {
          await this.loadRequests();
          await this.loadDashboardStats();
          this.errorMessage = '';
        }
      } catch (error) {
        console.error('Failed to approve request:', error);
        const errorData = adminDocumentService.parseError(error);
        this.errorMessage = errorData.message || 'Failed to approve request';
      }
    },

    async rejectRequest(requestId, reason) {
      if (!reason || reason.trim() === '') {
        this.errorMessage = 'Rejection reason is required';
        return;
      }

      try {
        const response = await adminDocumentService.rejectRequest(requestId, { reason });
        if (response.success) {
          await this.loadRequests();
          await this.loadDashboardStats();
          this.errorMessage = '';
        }
      } catch (error) {
        console.error('Failed to reject request:', error);
        const errorData = adminDocumentService.parseError(error);
        this.errorMessage = errorData.message || 'Failed to reject request';
      }
    },

    // Quick approval/rejection methods
    canApprove(request) {
      // Can approve if 'approved' is in allowed transitions
      const allowedTransitions = this.getAllowedStatusTransitions(request.status_name.toLowerCase());
      return allowedTransitions.includes('approved');
    },

    canReject(request) {
      // Can reject if 'rejected' is in allowed transitions
      const allowedTransitions = this.getAllowedStatusTransitions(request.status_name.toLowerCase());
      return allowedTransitions.includes('rejected');
    },

    // Helper method to get status explanation for disabled buttons
    getStatusExplanation(request, action) {
      const status = request.status_name.toLowerCase();
      const allowedTransitions = this.getAllowedStatusTransitions(status);

      if (action === 'approve') {
        if (allowedTransitions.includes('approved')) {
          return 'Click to approve this request';
        } else if (status === 'approved') {
          return 'This request has already been approved';
        } else if (status === 'rejected') {
          return 'Rejected requests can be resubmitted, not directly approved';
        } else if (status === 'completed') {
          return 'This request has already been completed';
        } else {
          return `Cannot approve from ${this.formatStatus(status)} status`;
        }
      } else if (action === 'reject') {
        if (allowedTransitions.includes('rejected')) {
          return 'Click to reject this request';
        } else if (status === 'rejected') {
          return 'This request has already been rejected';
        } else if (status === 'completed') {
          return 'Cannot reject a completed request';
        } else {
          return `Cannot reject from ${this.formatStatus(status)} status`;
        }
      }

      return `Request status: ${this.formatStatus(status)}`;
    },

    // Check if status change is valid
    isValidStatusChange(currentStatus, newStatusId) {
      if (!currentStatus || !newStatusId) return false;

      // Find the new status name
      const newStatus = this.statusOptions.find(s => s.id == newStatusId);
      if (!newStatus) return false;

      const currentStatusName = currentStatus.toLowerCase();
      const newStatusName = newStatus.status_name.toLowerCase();

      // Same status - no change needed
      if (currentStatusName === newStatusName) {
        return false;
      }

      // Check if transition is allowed based on workflow rules
      const allowedTransitions = this.getAllowedStatusTransitions(currentStatusName);

      return allowedTransitions.includes(newStatusName);
    },

    // Check if request needs payment verification
    needsPaymentVerification(request) {
      return request.status_name === 'payment_pending' &&
             request.payment_method &&
             !request.payment_method.includes('PayMongo') &&
             request.payment_status !== 'paid';
    },

    // Check if pickup can be scheduled
    canSchedulePickup(request) {
      return request.status_name === 'ready_for_pickup';
    },

    // Get payment status color
    getPaymentStatusColor(status) {
      const colors = {
        'pending': 'bg-warning',
        'processing': 'bg-info',
        'paid': 'bg-success',
        'failed': 'bg-danger',
        'refunded': 'bg-secondary',
        'cancelled': 'bg-dark'
      };
      return colors[status] || 'bg-secondary';
    },

    // Format payment status
    formatPaymentStatus(status) {
      const statuses = {
        'pending': 'Pending',
        'processing': 'Processing',
        'paid': 'Paid',
        'failed': 'Failed',
        'refunded': 'Refunded',
        'cancelled': 'Cancelled'
      };
      return statuses[status] || 'Unknown';
    },

    // Get tomorrow's date for pickup scheduling
    getTomorrowDate() {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split('T')[0];
    },

    // Validate pickup form
    isPickupFormValid() {
      return this.pickupScheduleForm.scheduled_date &&
             this.pickupScheduleForm.scheduled_time_start &&
             this.pickupScheduleForm.scheduled_time_end &&
             this.pickupScheduleForm.scheduled_time_start < this.pickupScheduleForm.scheduled_time_end;
    },

    // Get filtered status options based on current status
    getAvailableStatusOptions() {
      if (!this.currentRequest || !this.statusOptions) {
        console.log('🔍 getAvailableStatusOptions: Missing currentRequest or statusOptions');
        return [];
      }

      const currentStatus = this.currentRequest.status_name.toLowerCase();

      // Only these states are truly final (cannot be changed)
      const finalStates = ['completed', 'cancelled'];

      // If current status is final, no changes allowed
      if (finalStates.includes(currentStatus)) {
        console.log('🔍 getAvailableStatusOptions: Current status is final:', currentStatus);
        return [];
      }

      // Define allowed transitions based on current status
      const allowedTransitions = this.getAllowedStatusTransitions(currentStatus);

      // Check if current request uses cash payment
      const isCashPayment = this.currentRequest &&
        (this.currentRequest.payment_method === 'Cash Payment' ||
         this.currentRequest.payment_method === 'Cash' ||
         this.currentRequest.payment_method_code === 'CASH' ||
         this.currentRequest.payment_method_id === 1 || // Assuming cash is ID 1
         this.currentRequest.is_online_payment === false ||
         this.currentRequest.is_online_payment === 0 ||
         this.currentRequest.is_online === false ||
         this.currentRequest.is_online === 0);

      // Filter out "payment_confirmed" status for cash payments
      let filteredTransitions = allowedTransitions;
      if (isCashPayment) {
        filteredTransitions = allowedTransitions.filter(transition =>
          transition !== 'payment_confirmed'
        );
        console.log('🔍 Filtered out payment_confirmed for cash payment:', {
          originalTransitions: allowedTransitions,
          filteredTransitions: filteredTransitions
        });
      }

      // Return only allowed status options
      const availableOptions = this.statusOptions.filter(status =>
        filteredTransitions.includes(status.status_name.toLowerCase())
      );

      console.log('🔍 getAvailableStatusOptions result:', {
        currentStatus: currentStatus,
        isCashPayment: isCashPayment,
        allowedTransitions: allowedTransitions,
        filteredTransitions: filteredTransitions,
        availableOptions: availableOptions.map(opt => ({ id: opt.id, name: opt.status_name })),
        totalStatusOptions: this.statusOptions.length
      });

      return availableOptions;
    },

    // Define allowed status transitions based on government workflow best practices
    // This must match the backend validateStatusTransition logic exactly
    getAllowedStatusTransitions(currentStatus) {
      // Check if current request uses cash payment - enhanced detection
      const isCashPayment = this.currentRequest &&
        (this.currentRequest.payment_method === 'Cash Payment' ||
         this.currentRequest.payment_method === 'Cash' ||
         this.currentRequest.payment_method_code === 'CASH' ||
         this.currentRequest.payment_method_id === 1 || // Assuming cash is ID 1
         this.currentRequest.is_online_payment === false ||
         this.currentRequest.is_online_payment === 0 ||
         this.currentRequest.is_online === false ||
         this.currentRequest.is_online === 0);

      console.log('🔍 Cash payment detection for status transitions:', {
        currentStatus: currentStatus,
        payment_method: this.currentRequest?.payment_method,
        payment_method_code: this.currentRequest?.payment_method_code,
        payment_method_id: this.currentRequest?.payment_method_id,
        is_online_payment: this.currentRequest?.is_online_payment,
        isCashPayment: isCashPayment
      });

      const transitions = {
        // Simplified workflow matching actual database statuses
        'pending': ['approved', 'cancelled', 'rejected'],
        'under_review': ['approved', 'rejected', 'cancelled'],
        'approved': isCashPayment
          ? ['payment_confirmed', 'processing', 'cancelled'] // Cash payments can go directly to processing
          : ['payment_confirmed', 'cancelled'], // Online payments go through PayMongo webhook to payment_confirmed
        'payment_confirmed': ['processing'], // Automatic transition after payment
        'processing': ['ready_for_pickup'], // Processing can only complete successfully
        'ready_for_pickup': ['completed', 'cancelled'], // Allow completion for both cash and online payments
        'rejected': ['pending', 'under_review'], // Allow resubmission after corrections
        // Final states - no transitions allowed
        'completed': [],
        'cancelled': []
      };

      const allowedTransitions = transitions[currentStatus] || [];
      console.log('🔍 Allowed transitions for', currentStatus, ':', allowedTransitions);

      return allowedTransitions;
    },

    // Get title for update button based on validation state
    getUpdateButtonTitle() {
      if (!this.statusUpdateForm.status_id) {
        return 'Please select a new status';
      }
      if (!this.isValidStatusChange(this.currentRequest.status_name, this.statusUpdateForm.status_id)) {
        return 'Invalid status change';
      }
      return 'Update request status';
    },

    // Get dynamic button text based on selected status
    getActionButtonText() {
      if (!this.statusUpdateForm.status_id) {
        return 'Update Status';
      }

      const selectedStatus = this.statusOptions.find(s => s.id === parseInt(this.statusUpdateForm.status_id));
      if (!selectedStatus) {
        return 'Update Status';
      }

      const statusName = selectedStatus.status_name.toLowerCase();

      // Special button text for common actions
      switch (statusName) {
        case 'approved':
          return 'Approve Request';
        case 'rejected':
          return 'Reject Request';
        case 'under_review':
          return 'Move to Review';
        case 'processing':
          return 'Start Processing';
        case 'ready_for_pickup':
          return 'Mark Ready for Pickup';
        case 'completed':
          return 'Complete Request';
        default:
          return `Update to ${selectedStatus.status_name}`;
      }
    },

    // Get status description for current status display
    getStatusDescription(statusName) {
      const descriptions = {
        'pending': 'Waiting for admin review',
        'under_review': 'Being reviewed by admin',
        'approved': 'Approved, waiting for payment',
        'payment_confirmed': 'Payment received, ready for processing',
        'processing': 'Document is being prepared',
        'ready_for_pickup': 'Document ready for collection',
        'completed': 'Request completed successfully',
        'rejected': 'Request rejected, can be resubmitted',
        'cancelled': 'Request cancelled permanently'
      };
      return descriptions[statusName.toLowerCase()] || 'Status information';
    },

    // Get next available status actions for automatic progression
    getNextStatusActions() {
      if (!this.currentRequest) return [];

      const currentStatus = this.currentRequest.status_name.toLowerCase();
      const allowedTransitions = this.getAllowedStatusTransitions(currentStatus);

      // Filter out 'cancelled' and 'rejected' from regular progression (handled separately)
      // 'cancelled' is handled by the separate Cancel Request button
      // 'rejected' is redundant since we have Cancel Request which serves the same purpose
      const progressionTransitions = allowedTransitions.filter(status =>
        status !== 'cancelled' && status !== 'rejected'
      );

      return progressionTransitions.map(statusName => {
        const statusOption = this.statusOptions.find(s => s.status_name.toLowerCase() === statusName);
        if (!statusOption) return null;

        return {
          status_id: statusOption.id,
          status_name: statusName,
          label: this.getProgressionButtonLabel(statusName),
          icon: this.getProgressionButtonIcon(statusName),
          buttonClass: this.getProgressionButtonClass(statusName),
          description: this.getProgressionButtonDescription(statusName)
        };
      }).filter(action => action !== null);
    },

    // Get button label for status progression
    getProgressionButtonLabel(statusName) {
      const labels = {
        'approved': 'Approve Request',
        'rejected': 'Reject Request',
        'payment_confirmed': 'Confirm Payment',
        'processing': 'Start Processing',
        'ready_for_pickup': 'Mark Ready',
        'completed': 'Complete Request',
        'under_review': 'Review Request',
        'pending': 'Mark Pending'
      };
      return labels[statusName] || `Change to ${this.formatStatus(statusName)}`;
    },

    // Get button icon for status progression
    getProgressionButtonIcon(statusName) {
      const icons = {
        'approved': 'fas fa-check',
        'rejected': 'fas fa-times',
        'payment_confirmed': 'fas fa-credit-card',
        'processing': 'fas fa-cogs',
        'ready_for_pickup': 'fas fa-hand-paper',
        'completed': 'fas fa-check-circle',
        'under_review': 'fas fa-search',
        'pending': 'fas fa-clock'
      };
      return icons[statusName] || 'fas fa-arrow-right';
    },

    // Get button CSS class for status progression
    getProgressionButtonClass(statusName) {
      const classes = {
        'approved': 'btn-success',
        'rejected': 'btn-danger',
        'payment_confirmed': 'btn-info',
        'processing': 'btn-warning',
        'ready_for_pickup': 'btn-primary',
        'completed': 'btn-success',
        'under_review': 'btn-secondary',
        'pending': 'btn-outline-secondary'
      };
      return classes[statusName] || 'btn-outline-primary';
    },

    // Get button description for status progression
    getProgressionButtonDescription(statusName) {
      const descriptions = {
        'approved': 'Approve this request and proceed to payment',
        'rejected': 'Reject this request with reason',
        'payment_confirmed': 'Confirm payment has been received',
        'processing': 'Start processing the document',
        'ready_for_pickup': 'Mark document as ready for collection',
        'completed': 'Mark request as completed',
        'under_review': 'Move request to review status',
        'pending': 'Move request back to pending status'
      };
      return descriptions[statusName] || `Change status to ${this.formatStatus(statusName)}`;
    },

    // Check if request can be cancelled
    canCancelRequest() {
      if (!this.currentRequest) return false;

      const currentStatus = this.currentRequest.status_name.toLowerCase();
      const finalStates = ['completed', 'cancelled'];

      // Can cancel if not in final states
      return !finalStates.includes(currentStatus);
    },

    // Progress to next status automatically
    async progressToNextStatus(statusId) {
      if (!statusId || !this.currentRequest) {
        this.showToast('Error', 'Invalid status selection', 'error');
        return;
      }

      try {
        const updateData = {
          status_id: parseInt(statusId)
        };

        console.log('📤 Progressing to next status:', updateData);

        const response = await adminDocumentService.updateRequestStatus(
          this.currentRequest.id,
          updateData
        );

        if (response.success) {
          // Refresh the request details
          await this.refreshRequestDetails();
          // Refresh the main requests list
          await this.loadRequests();

          // Show success message
          const newStatus = this.statusOptions.find(s => s.id === parseInt(statusId));
          this.showToast('Success', `Request status updated to ${this.formatStatus(newStatus.status_name)}`, 'success');
        } else {
          this.showToast('Error', response.message || 'Failed to update request status', 'error');
        }
      } catch (error) {
        console.error('❌ Error progressing status:', error);
        const errorData = adminDocumentService.parseError(error);
        this.showToast('Error', errorData.message || 'Failed to update request status', 'error');
      }
    },

    // Cancel request permanently
    async cancelRequest() {
      if (!this.currentRequest) return;

      // Find cancelled status
      const cancelledStatus = this.statusOptions.find(s => s.status_name.toLowerCase() === 'cancelled');
      if (!cancelledStatus) {
        this.showToast('Error', 'Cancelled status not found', 'error');
        return;
      }

      // Confirm cancellation
      if (!confirm(`Are you sure you want to cancel request ${this.currentRequest.request_number}? This action cannot be undone.`)) {
        return;
      }

      try {
        const updateData = {
          status_id: cancelledStatus.id
        };

        console.log('📤 Cancelling request:', updateData);

        const response = await adminDocumentService.updateRequestStatus(
          this.currentRequest.id,
          updateData
        );

        if (response.success) {
          // Refresh the request details
          await this.refreshRequestDetails();
          // Refresh the main requests list
          await this.loadRequests();

          this.showToast('Success', 'Request has been cancelled', 'success');
        } else {
          this.showToast('Error', response.message || 'Failed to cancel request', 'error');
        }
      } catch (error) {
        console.error('❌ Error cancelling request:', error);
        const errorData = adminDocumentService.parseError(error);
        this.showToast('Error', errorData.message || 'Failed to cancel request', 'error');
      }
    },

    async quickApprove(request) {
      console.log('🚀 Quick approve clicked for request:', request);

      try {
        this.loading = true;
        const response = await adminDocumentService.approveRequest(request.id, {
          reason: 'Quick approval from admin interface'
        });

        if (response.success) {
          await this.loadRequests();
          await this.loadDashboardStats();
          this.showToast('Success', `Request ${request.request_number} approved successfully`, 'success');
        }
      } catch (error) {
        console.error('Failed to approve request:', error);
        const errorData = adminDocumentService.parseError(error);
        this.showToast('Error', errorData.message || 'Failed to approve request', 'error');
      } finally {
        this.loading = false;
      }
    },

    showQuickRejectModal(request) {
      console.log('🚀 Quick reject clicked for request:', request);

      this.selectedRequestForReject = request;
      this.quickRejectForm = {
        loading: false,
        error: ''
      };
      this.showQuickReject = true;
    },

    closeQuickRejectModal() {
      this.showQuickReject = false;
      this.selectedRequestForReject = null;
      this.quickRejectForm = {
        loading: false,
        error: ''
      };
    },

    async confirmQuickReject() {
      this.quickRejectForm.loading = true;
      this.quickRejectForm.error = '';

      try {
        const response = await adminDocumentService.rejectRequest(
          this.selectedRequestForReject.id,
          { reason: 'Request rejected by admin' }
        );

        if (response.success) {
          await this.loadRequests();
          await this.loadDashboardStats();
          this.showToast('Success', `Request ${this.selectedRequestForReject.request_number} rejected successfully`, 'success');
          this.closeQuickRejectModal();
        }
      } catch (error) {
        console.error('Failed to reject request:', error);
        const errorData = adminDocumentService.parseError(error);
        this.quickRejectForm.error = errorData.message || 'Failed to reject request';
      } finally {
        this.quickRejectForm.loading = false;
      }
    },

    showQuickApproveModal(request) {
      console.log('🚀 Quick approve clicked for request:', request);

      this.selectedRequestForApprove = request;
      this.quickApproveForm = {
        loading: false,
        error: ''
      };
      this.showQuickApprove = true;
    },

    closeQuickApproveModal() {
      this.showQuickApprove = false;
      this.selectedRequestForApprove = null;
      this.quickApproveForm = {
        loading: false,
        error: ''
      };
    },

    async confirmQuickApprove() {
      this.quickApproveForm.loading = true;
      this.quickApproveForm.error = '';

      try {
        const response = await adminDocumentService.approveRequest(
          this.selectedRequestForApprove.id,
          { reason: 'Quick approval from admin interface' }
        );

        if (response.success) {
          await this.loadRequests();
          await this.loadDashboardStats();
          this.showToast('Success', `Request ${this.selectedRequestForApprove.request_number} approved successfully`, 'success');
          this.closeQuickApproveModal();
        }
      } catch (error) {
        console.error('Failed to approve request:', error);
        const errorData = adminDocumentService.parseError(error);
        this.quickApproveForm.error = errorData.message || 'Failed to approve request';
      } finally {
        this.quickApproveForm.loading = false;
      }
    },

    // Bulk operations
    async performBulkAction() {
      if (this.selectedRequests.length === 0) {
        this.errorMessage = 'Please select at least one request';
        return;
      }

      if (!this.bulkAction) {
        this.errorMessage = 'Please select a bulk action';
        return;
      }

      try {
        const response = await adminDocumentService.bulkUpdateRequests({
          request_ids: this.selectedRequests,
          status_id: parseInt(this.bulkAction)
        });

        if (response.success) {
          await this.loadRequests();
          await this.loadDashboardStats();
          this.selectedRequests = [];
          this.bulkAction = '';
          this.showBulkActions = false;
          this.errorMessage = '';
        }
      } catch (error) {
        console.error('Failed to perform bulk action:', error);
        const errorData = adminDocumentService.parseError(error);
        this.errorMessage = errorData.message || 'Failed to perform bulk action';
      }
    },

    // Export functionality
    async exportRequests() {
      try {
        const csvData = await adminDocumentService.exportRequests(this.filters);
        const filename = `document_requests_${new Date().toISOString().split('T')[0]}.csv`;
        adminDocumentService.downloadCSV(csvData, filename);
      } catch (error) {
        console.error('Failed to export requests:', error);
        const errorData = adminDocumentService.parseError(error);
        this.errorMessage = errorData.message || 'Failed to export requests';
      }
    },

    // Comprehensive Excel export functionality
    async exportRequestsToExcel() {
      try {
        this.showToast('Info', 'Preparing comprehensive Excel export...', 'info');

        // Get all requests with full details (no pagination)
        const allRequestsResponse = await adminDocumentService.getAllRequests({
          ...this.filters,
          page: 1,
          limit: 10000 // Get all requests
        });

        if (!allRequestsResponse.success || !allRequestsResponse.data.requests) {
          throw new Error('Failed to fetch requests data');
        }

        const requests = allRequestsResponse.data.requests;

        if (requests.length === 0) {
          this.showToast('Warning', 'No requests found to export', 'warning');
          return;
        }

        // For each request, get detailed information
        const detailedRequests = [];
        for (const request of requests) {
          try {
            const detailResponse = await adminDocumentService.getRequestDetails(request.id);
            if (detailResponse.success) {
              detailedRequests.push(detailResponse.data);
            } else {
              // If detailed fetch fails, use basic request data
              detailedRequests.push(request);
            }
          } catch (error) {
            console.warn(`Failed to get details for request ${request.id}:`, error);
            detailedRequests.push(request);
          }
        }

        // Create comprehensive Excel data
        const excelData = this.prepareExcelData(detailedRequests);

        // Check if xlsx library is available
        if (typeof XLSX === 'undefined') {
          // Fallback to CSV if xlsx is not available
          this.showToast('Warning', 'Excel library not available. Downloading as CSV instead.', 'warning');
          this.downloadAsCSV(excelData.mainSheet, 'comprehensive_requests_export');
          return;
        }

        // Create Excel workbook with multiple sheets
        this.createExcelWorkbook(excelData);

      } catch (error) {
        console.error('Failed to export requests to Excel:', error);
        this.showToast('Error', 'Failed to export requests to Excel', 'error');
      }
    },

    // Prepare comprehensive Excel data with vertical key-value layout
    prepareExcelData(requests) {
      const mainSheet = [];
      const cedulaSheet = [];
      const barangaySheet = [];

      // Process each request with vertical key-value format
      requests.forEach((request, index) => {
        // Add request separator and header
        if (index > 0) {
          mainSheet.push(['']); // Empty row separator
        }

        mainSheet.push([`REQUEST #${index + 1}: ${request.request_number || 'N/A'}`]);
        mainSheet.push(['='.repeat(50)]);
        mainSheet.push(['']);

        // Request Information Block
        mainSheet.push(['REQUEST INFORMATION']);
        mainSheet.push(['Request Number:', request.request_number || '']);
        mainSheet.push(['Document Type:', request.document_type || '']);
        mainSheet.push(['Status:', this.formatStatus(request.status_name) || '']);
        mainSheet.push(['Submitted Date:', this.formatDate(request.requested_at) || '']);
        mainSheet.push(['Last Updated:', this.formatDate(request.updated_at) || '']);
        mainSheet.push(['Purpose Category:', request.purpose_category || '']);
        mainSheet.push(['Purpose Details:', request.purpose_details || '']);
        mainSheet.push(['']);

        // Client Information Block
        mainSheet.push(['CLIENT INFORMATION']);
        mainSheet.push(['Full Name:', this.getClientFullName(request) || '']);
        mainSheet.push(['Email Address:', request.client_email || '']);
        mainSheet.push(['Phone Number:', request.client_phone || '']);
        mainSheet.push(['Date of Birth:', this.formatDate(request.client_birth_date) || '']);
        mainSheet.push(['Gender:', this.formatGender(request.client_gender) || '']);
        mainSheet.push(['Civil Status:', this.getCivilStatusName(request.client_civil_status_id) || '']);
        mainSheet.push(['Nationality:', request.client_nationality || '']);
        mainSheet.push(['Complete Address:', this.getClientFullAddress(request) || '']);
        mainSheet.push(['Years of Residency:', this.getResidencyDisplay(request) || '']);
        mainSheet.push(['']);

        // Third Party Request Information (if applicable)
        if (request.is_third_party_request) {
          mainSheet.push(['THIRD PARTY REQUEST']);
          mainSheet.push(['Is Third Party Request:', 'Yes']);

          if (request.beneficiary) {
            mainSheet.push(['']);
            mainSheet.push(['BENEFICIARY INFORMATION']);
            mainSheet.push(['Full Name:', request.beneficiary.full_name || '']);
            mainSheet.push(['Email Address:', request.beneficiary.email || '']);
            mainSheet.push(['Phone Number:', request.beneficiary.phone_number || '']);
            mainSheet.push(['Date of Birth:', this.formatDate(request.beneficiary.birth_date) || '']);
            mainSheet.push(['Gender:', this.formatGender(request.beneficiary.gender) || '']);
            mainSheet.push(['Civil Status:', this.getCivilStatusName(request.beneficiary.civil_status_id) || '']);
            mainSheet.push(['Nationality:', request.beneficiary.nationality || '']);
            mainSheet.push(['Address:', request.beneficiary.address || '']);
            mainSheet.push(['Relationship to Requestor:', this.formatRelationship(request.beneficiary.relationship_to_requestor) || '']);
          }
          mainSheet.push(['']);
        }

        // Authorized Pickup Information (if applicable)
        if (request.authorized_pickup) {
          mainSheet.push(['AUTHORIZED PICKUP PERSON']);
          mainSheet.push(['Full Name:', request.authorized_pickup.full_name || '']);
          mainSheet.push(['Phone Number:', request.authorized_pickup.phone_number || '']);
          mainSheet.push(['Relationship:', this.formatRelationship(request.authorized_pickup.relationship_to_beneficiary) || '']);
          mainSheet.push(['']);
        }

        // Payment Information
        mainSheet.push(['PAYMENT INFORMATION']);
        mainSheet.push(['Payment Method:', request.payment_method || '']);
        mainSheet.push(['Payment Status:', this.formatPaymentStatus(request.payment_status) || '']);
        mainSheet.push(['Total Fee:', this.formatCurrency(request.total_fee || 0)]);
        mainSheet.push(['']);

        // Admin Notes (if any)
        if (request.admin_notes) {
          mainSheet.push(['ADMIN NOTES']);
          mainSheet.push(['Notes:', request.admin_notes]);
          mainSheet.push(['']);
        }

        // Document-Specific Information for Cedula
        if (request.document_type === 'Cedula' && request.specific_details) {
          // Add to Cedula sheet with vertical format
          if (cedulaSheet.length === 0) {
            cedulaSheet.push(['CEDULA DOCUMENT DETAILS']);
            cedulaSheet.push(['='.repeat(50)]);
            cedulaSheet.push(['']);
          } else {
            cedulaSheet.push(['']); // Separator between requests
          }

          cedulaSheet.push([`REQUEST: ${request.request_number || 'N/A'}`]);
          cedulaSheet.push(['Client Name:', this.getClientFullName(request) || '']);
          cedulaSheet.push(['']);

          cedulaSheet.push(['INCOME INFORMATION']);
          cedulaSheet.push(['Annual Income:', this.formatCurrency(request.specific_details.annual_income || 0)]);
          cedulaSheet.push(['Monthly Income:', this.formatCurrency(request.specific_details.monthly_income || 0)]);
          cedulaSheet.push(['Occupation:', request.specific_details.occupation || '']);
          cedulaSheet.push(['Employer Name:', request.specific_details.employer_name || '']);
          cedulaSheet.push(['']);

          if (request.specific_details.has_real_property || request.specific_details.property_assessed_value > 0) {
            cedulaSheet.push(['REAL PROPERTY INFORMATION']);
            cedulaSheet.push(['Has Real Property:', request.specific_details.has_real_property ? 'Yes' : 'No']);
            cedulaSheet.push(['Property Assessed Value:', this.formatCurrency(request.specific_details.property_assessed_value || 0)]);
            cedulaSheet.push(['Property Location:', request.specific_details.property_location || '']);
            cedulaSheet.push(['']);
          }

          if (request.specific_details.has_personal_property || request.specific_details.personal_property_value > 0) {
            cedulaSheet.push(['PERSONAL PROPERTY INFORMATION']);
            cedulaSheet.push(['Has Personal Property:', request.specific_details.has_personal_property ? 'Yes' : 'No']);
            cedulaSheet.push(['Personal Property Value:', this.formatCurrency(request.specific_details.personal_property_value || 0)]);
            cedulaSheet.push(['']);
          }

          if (request.specific_details.business_name || request.specific_details.business_gross_receipts > 0) {
            cedulaSheet.push(['BUSINESS INFORMATION']);
            cedulaSheet.push(['Business Name:', request.specific_details.business_name || '']);
            cedulaSheet.push(['Business Type:', request.specific_details.business_type || '']);
            cedulaSheet.push(['Business Address:', request.specific_details.business_address || '']);
            cedulaSheet.push(['Annual Gross Receipts:', this.formatCurrency(request.specific_details.business_gross_receipts || 0)]);
            cedulaSheet.push(['']);
          }

          cedulaSheet.push(['TAX COMPUTATION']);
          cedulaSheet.push(['Computed Tax:', this.formatCurrency(request.specific_details.computed_tax || 0)]);
          cedulaSheet.push(['Total Document Fee:', this.formatCurrency(request.total_document_fee || 0)]);
          cedulaSheet.push(['']);
        }

        // Document-Specific Information for Barangay Clearance
        if (request.document_type === 'Barangay Clearance' && request.specific_details) {
          // Add to Barangay sheet with vertical format
          if (barangaySheet.length === 0) {
            barangaySheet.push(['BARANGAY CLEARANCE DOCUMENT DETAILS']);
            barangaySheet.push(['='.repeat(50)]);
            barangaySheet.push(['']);
          } else {
            barangaySheet.push(['']); // Separator between requests
          }

          barangaySheet.push([`REQUEST: ${request.request_number || 'N/A'}`]);
          barangaySheet.push(['Client Name:', this.getClientFullName(request) || '']);
          barangaySheet.push(['']);

          barangaySheet.push(['LEGAL STATUS INFORMATION']);
          barangaySheet.push(['Has Pending Cases:', request.specific_details.has_pending_cases ? 'Yes' : 'No']);
          if (request.specific_details.has_pending_cases && request.specific_details.pending_cases_details) {
            barangaySheet.push(['Pending Cases Details:', request.specific_details.pending_cases_details]);
          }
          barangaySheet.push(['']);

          if (request.specific_details.voter_registration_number || request.specific_details.precinct_number) {
            barangaySheet.push(['VOTER INFORMATION']);
            barangaySheet.push(['Voter Registration Number:', request.specific_details.voter_registration_number || '']);
            barangaySheet.push(['Precinct Number:', request.specific_details.precinct_number || '']);
            barangaySheet.push(['']);
          }

          if (request.specific_details.emergency_contact_name) {
            barangaySheet.push(['EMERGENCY CONTACT INFORMATION']);
            barangaySheet.push(['Contact Name:', request.specific_details.emergency_contact_name || '']);
            barangaySheet.push(['Contact Phone:', request.specific_details.emergency_contact_phone || '']);
            barangaySheet.push(['Relationship:', request.specific_details.emergency_contact_relationship || '']);
            barangaySheet.push(['Address:', request.specific_details.emergency_contact_address || '']);
            barangaySheet.push(['']);
          }
        }
      });

      return {
        mainSheet,
        cedulaSheet,
        barangaySheet
      };
    },

    // Create Excel workbook with multiple sheets
    createExcelWorkbook(excelData) {
      try {
        // Create a new workbook
        const wb = XLSX.utils.book_new();

        // Add main sheet
        const mainWs = XLSX.utils.aoa_to_sheet(excelData.mainSheet);
        XLSX.utils.book_append_sheet(wb, mainWs, 'All Requests');

        // Add Cedula-specific sheet if there's data
        if (excelData.cedulaSheet.length > 1) {
          const cedulaWs = XLSX.utils.aoa_to_sheet(excelData.cedulaSheet);
          XLSX.utils.book_append_sheet(wb, cedulaWs, 'Cedula Details');
        }

        // Add Barangay Clearance-specific sheet if there's data
        if (excelData.barangaySheet.length > 1) {
          const barangayWs = XLSX.utils.aoa_to_sheet(excelData.barangaySheet);
          XLSX.utils.book_append_sheet(wb, barangayWs, 'Barangay Clearance Details');
        }

        // Set column widths for better readability
        this.setExcelColumnWidths(wb);

        // Generate filename
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `comprehensive_requests_export_${timestamp}.xlsx`;

        // Write and download the file
        XLSX.writeFile(wb, filename);

        this.showToast('Success', 'Excel file downloaded successfully!', 'success');
      } catch (error) {
        console.error('Failed to create Excel workbook:', error);
        // Fallback to CSV
        this.downloadAsCSV(excelData.mainSheet, 'comprehensive_requests_export');
      }
    },

    // Set column widths for Excel sheets (optimized for vertical key-value format)
    setExcelColumnWidths(workbook) {
      try {
        // Set column widths for all sheets with vertical key-value format
        Object.keys(workbook.Sheets).forEach(sheetName => {
          const sheet = workbook.Sheets[sheetName];
          if (sheet) {
            // For vertical key-value format, we need:
            // Column A: Labels/Keys (wider)
            // Column B: Values (wider for content)
            const colWidths = [
              { wch: 35 }, // Column A: Labels/Keys
              { wch: 50 }  // Column B: Values/Content
            ];
            sheet['!cols'] = colWidths;
          }
        });
      } catch (error) {
        console.warn('Failed to set column widths:', error);
      }
    },

    // CSV fallback method (optimized for vertical key-value format)
    downloadAsCSV(sheetData, filename) {
      try {
        // Convert vertical key-value format to readable CSV
        const csvContent = sheetData.map(row => {
          if (Array.isArray(row)) {
            return row.map(cell => {
              // Escape commas and quotes in CSV
              const cellValue = String(cell || '');
              if (cellValue.includes(',') || cellValue.includes('"') || cellValue.includes('\n')) {
                return `"${cellValue.replace(/"/g, '""')}"`;
              }
              return cellValue;
            }).join(',');
          }
          return String(row || '');
        }).join('\n');

        // Create and download CSV file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        this.showToast('Success', 'CSV file downloaded successfully!', 'success');
      } catch (error) {
        console.error('Failed to download CSV:', error);
        this.showToast('Error', 'Failed to download CSV file', 'error');
      }
    },

    // Export single request to Excel
    async exportSingleRequestToExcel() {
      try {
        if (!this.currentRequest) {
          this.showToast('Warning', 'No request selected for export', 'warning');
          return;
        }

        this.showToast('Info', 'Preparing request export...', 'info');

        // Prepare data for single request
        const excelData = this.prepareExcelData([this.currentRequest]);

        // Check if xlsx library is available
        if (typeof XLSX === 'undefined') {
          // Fallback to CSV if xlsx is not available
          this.showToast('Warning', 'Excel library not available. Downloading as CSV instead.', 'warning');
          this.downloadAsCSV(excelData.mainSheet, `request_${this.currentRequest.request_number}_export`);
          return;
        }

        // Create Excel workbook
        const wb = XLSX.utils.book_new();

        // Add main sheet with single request data
        const mainWs = XLSX.utils.aoa_to_sheet(excelData.mainSheet);
        XLSX.utils.book_append_sheet(wb, mainWs, 'Request Details');

        // Add document-specific sheet if applicable
        if (this.currentRequest.document_type === 'Cedula' && excelData.cedulaSheet.length > 1) {
          const cedulaWs = XLSX.utils.aoa_to_sheet(excelData.cedulaSheet);
          XLSX.utils.book_append_sheet(wb, cedulaWs, 'Cedula Details');
        } else if (this.currentRequest.document_type === 'Barangay Clearance' && excelData.barangaySheet.length > 1) {
          const barangayWs = XLSX.utils.aoa_to_sheet(excelData.barangaySheet);
          XLSX.utils.book_append_sheet(wb, barangayWs, 'Barangay Clearance Details');
        }

        // Set column widths
        this.setExcelColumnWidths(wb);

        // Generate filename with request number
        const filename = `request_${this.currentRequest.request_number}_export_${new Date().toISOString().split('T')[0]}.xlsx`;

        // Write and download the file
        XLSX.writeFile(wb, filename);

        this.showToast('Success', 'Request exported to Excel successfully!', 'success');

      } catch (error) {
        console.error('Failed to export single request to Excel:', error);
        this.showToast('Error', 'Failed to export request to Excel', 'error');
      }
    },

    // Export single request to PDF
    async exportSingleRequestToPDF() {
      try {
        if (!this.currentRequest) {
          this.showToast('Warning', 'No request selected for export', 'warning');
          return;
        }

        this.showToast('Info', 'Generating PDF export...', 'info');

        // Create PDF document
        const pdf = new jsPDF();

        // Generate PDF content
        this.generateRequestPDF(pdf, this.currentRequest);

        // Generate filename with request number
        const filename = `Request_${this.currentRequest.request_number || 'Unknown'}.pdf`;

        // Download PDF
        pdf.save(filename);

        this.showToast('Success', 'Request exported to PDF successfully!', 'success');

      } catch (error) {
        console.error('Failed to export single request to PDF:', error);
        this.showToast('Error', 'Failed to export request to PDF', 'error');
      }
    },

    // Generate PDF content for single request
    generateRequestPDF(pdf, request) {
      // Document Header
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(44, 62, 80);
      pdf.text('BARANGAY DOCUMENT REQUEST DETAILS', 105, 25, { align: 'center' });

      // Decorative line
      pdf.setDrawColor(52, 152, 219);
      pdf.setLineWidth(1);
      pdf.line(20, 30, 190, 30);

      let yPosition = 45;
      const lineHeight = 8;
      const sectionSpacing = 12;

      // Helper function to add section header
      const addSectionHeader = (title) => {
        // Check if we need a new page before adding section header
        checkPageBreak(lineHeight + 10); // Reserve space for header and some content

        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(52, 152, 219);
        pdf.text(title, 20, yPosition);
        yPosition += lineHeight + 2;
      };

      // Helper function to check if we need a new page
      const checkPageBreak = (requiredSpace = 20) => {
        if (yPosition + requiredSpace > 270) { // Leave space for footer
          pdf.addPage();
          yPosition = 20;
        }
      };

      // Helper function to add field with text wrapping
      const addField = (label, value) => {
        // Check if we need a new page before adding content
        checkPageBreak(lineHeight * 3); // Reserve space for at least 3 lines

        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(0, 0, 0);
        pdf.text(`${label}:`, 20, yPosition);

        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(60, 60, 60);
        const displayValue = value || 'N/A';

        // Calculate available width for text (page width - left margin - label width - right margin)
        const maxWidth = 190 - 80 - 10; // 100 units available for text

        // Split text into lines that fit within the available width
        const textLines = pdf.splitTextToSize(displayValue, maxWidth);

        // Check if all lines will fit on current page
        const totalHeight = textLines.length * lineHeight;
        if (yPosition + totalHeight > 270) {
          pdf.addPage();
          yPosition = 20;
          // Re-add the label on the new page
          pdf.setFontSize(11);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(0, 0, 0);
          pdf.text(`${label}:`, 20, yPosition);
        }

        // Add each line
        textLines.forEach((line, index) => {
          pdf.text(line, 80, yPosition + (index * lineHeight));
        });

        // Update yPosition based on number of lines used
        yPosition += (textLines.length * lineHeight);
      };

      // Request Information Section
      addSectionHeader('REQUEST INFORMATION');
      addField('Request Number', request.request_number);
      addField('Document Type', request.document_type);
      addField('Status', this.formatStatus(request.status_name));
      addField('Submitted Date', this.formatDate(request.requested_at));
      addField('Last Updated', this.formatDate(request.updated_at));
      addField('Purpose Category', request.purpose_category);
      addField('Purpose Details', request.purpose_details);
      yPosition += sectionSpacing;

      // Client Information Section
      addSectionHeader('CLIENT INFORMATION');
      addField('Full Name', this.getClientFullName(request));
      addField('Email Address', request.client_email);
      addField('Phone Number', request.client_phone);
      addField('Date of Birth', this.formatDate(request.client_birth_date));
      addField('Gender', this.formatGender(request.client_gender));
      addField('Civil Status', this.getCivilStatusName(request.client_civil_status_id));
      addField('Nationality', request.client_nationality);
      addField('Complete Address', this.getClientFullAddress(request));
      addField('Years of Residency', this.getResidencyDisplay(request));
      yPosition += sectionSpacing;

      // Third Party Request Information (if applicable)
      if (request.is_third_party_request && request.beneficiary) {
        addSectionHeader('THIRD PARTY REQUEST - BENEFICIARY INFORMATION');
        addField('Full Name', request.beneficiary.full_name);
        addField('Email Address', request.beneficiary.email);
        addField('Phone Number', request.beneficiary.phone_number);
        addField('Date of Birth', this.formatDate(request.beneficiary.birth_date));
        addField('Gender', this.formatGender(request.beneficiary.gender));
        addField('Civil Status', this.getCivilStatusName(request.beneficiary.civil_status_id));
        addField('Nationality', request.beneficiary.nationality);
        addField('Address', request.beneficiary.address);
        addField('Relationship to Requestor', this.formatRelationship(request.beneficiary.relationship_to_requestor));
        yPosition += sectionSpacing;
      }

      // Authorized Pickup Information (if applicable)
      if (request.authorized_pickup) {
        addSectionHeader('AUTHORIZED PICKUP PERSON');
        addField('Full Name', request.authorized_pickup.full_name);
        addField('Phone Number', request.authorized_pickup.phone_number);
        addField('Relationship', this.formatRelationship(request.authorized_pickup.relationship_to_beneficiary));
        yPosition += sectionSpacing;
      }

      // Payment Information Section
      addSectionHeader('PAYMENT INFORMATION');
      addField('Payment Method', request.payment_method);
      addField('Payment Status', this.formatPaymentStatus(request.payment_status));
      addField('Total Fee', this.formatCurrencyForPDF(request.total_fee || request.total_document_fee || 0));
      yPosition += sectionSpacing;

      // Admin Notes (if any)
      if (request.admin_notes) {
        addSectionHeader('ADMIN NOTES');
        addField('Notes', request.admin_notes);
        yPosition += sectionSpacing;
      }

      // Document-Specific Information for Cedula
      if (request.document_type === 'Cedula' && request.specific_details) {
        addSectionHeader('CEDULA DOCUMENT DETAILS');
        addField('Annual Income', this.formatCurrencyForPDF(request.specific_details.annual_income || 0));
        addField('Occupation', request.specific_details.occupation);
        addField('Employer/Business', request.specific_details.employer_business);
        addField('TIN Number', request.specific_details.tin_number);
        addField('Height (cm)', request.specific_details.height_cm);
        addField('Weight (kg)', request.specific_details.weight_kg);
        addField('ICR Number', request.specific_details.icr_number);
        yPosition += sectionSpacing;
      }

      // Document-Specific Information for Barangay Clearance
      if (request.document_type === 'Barangay Clearance' && request.specific_details) {
        addSectionHeader('BARANGAY CLEARANCE DETAILS');
        addField('Clearance Type', request.specific_details.clearance_type);
        addField('Business Name', request.specific_details.business_name);
        addField('Business Address', request.specific_details.business_address);
        addField('Business Type', request.specific_details.business_type);
        yPosition += sectionSpacing;
      }

      // Add footer
      this.addPDFFooter(pdf);
    },

    // Add professional footer to PDF
    addPDFFooter(pdf) {
      const pageCount = pdf.internal.getNumberOfPages();

      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);

        // Footer line
        pdf.setDrawColor(200, 200, 200);
        pdf.setLineWidth(0.5);
        pdf.line(20, 280, 190, 280);

        // Footer text
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(100, 100, 100);

        // Left side - Generated info
        const generatedDate = new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        pdf.text(`Generated on: ${generatedDate}`, 20, 285);

        // Center - Barangay info
        pdf.text('Barangay Bula Document Management System', 105, 285, { align: 'center' });

        // Right side - Page number
        pdf.text(`Page ${i} of ${pageCount}`, 190, 285, { align: 'right' });
      }
    },

    // Verify in-person payment
    async verifyInPersonPayment() {
      if (!this.paymentVerificationForm.amount_received || !this.currentRequest) {
        this.showToast('Error', 'Please enter the amount received', 'error');
        return;
      }

      const totalFee = parseFloat(this.currentRequest.total_document_fee || this.currentRequest.total_fee);
      const amountReceived = parseFloat(this.paymentVerificationForm.amount_received);

      if (amountReceived < totalFee) {
        this.showToast('Error', `Insufficient payment. Required: ${this.formatCurrency(totalFee)}`, 'error');
        return;
      }

      this.paymentVerificationForm.loading = true;
      this.paymentVerificationForm.error = '';

      try {
        const paymentData = {
          amount_received: amountReceived,
          payment_method_id: this.currentRequest.payment_method_id || 1, // Default to cash
          receipt_number: this.paymentVerificationForm.receipt_number
        };

        const response = await adminDocumentService.verifyInPersonPayment(this.currentRequest.id, paymentData);

        if (response.success) {
          await this.refreshRequestDetails();
          await this.loadRequests();

          // Reset form
          this.paymentVerificationForm = {
            amount_received: '',
            receipt_number: '',
            loading: false,
            error: ''
          };

          this.showToast('Success', 'Payment verified successfully', 'success');
        }
      } catch (error) {
        console.error('Failed to verify payment:', error);
        const errorData = adminDocumentService.parseError(error);
        this.paymentVerificationForm.error = errorData.message || 'Failed to verify payment';
        this.showToast('Error', errorData.message || 'Failed to verify payment', 'error');
      } finally {
        this.paymentVerificationForm.loading = false;
      }
    },

    // Schedule pickup appointment
    async schedulePickup() {
      if (!this.isPickupFormValid() || !this.currentRequest) {
        this.showToast('Error', 'Please fill in all required fields', 'error');
        return;
      }

      this.pickupScheduleForm.loading = true;
      this.pickupScheduleForm.error = '';

      try {
        const scheduleData = {
          scheduled_date: this.pickupScheduleForm.scheduled_date,
          scheduled_time_start: this.pickupScheduleForm.scheduled_time_start,
          scheduled_time_end: this.pickupScheduleForm.scheduled_time_end
        };

        const response = await adminDocumentService.schedulePickup(this.currentRequest.id, scheduleData);

        if (response.success) {
          await this.refreshRequestDetails();
          await this.loadRequests();

          // Reset form
          this.pickupScheduleForm = {
            scheduled_date: '',
            scheduled_time_start: '',
            scheduled_time_end: '',
            loading: false,
            error: ''
          };

          this.showToast('Success', 'Pickup scheduled successfully', 'success');
        }
      } catch (error) {
        console.error('Failed to schedule pickup:', error);
        const errorData = adminDocumentService.parseError(error);
        this.pickupScheduleForm.error = errorData.message || 'Failed to schedule pickup';
        this.showToast('Error', errorData.message || 'Failed to schedule pickup', 'error');
      } finally {
        this.pickupScheduleForm.loading = false;
      }
    },

    // Utility methods
    formatStatus(status) {
      return adminDocumentService.formatStatus(status);
    },

    getStatusColor(status) {
      return adminDocumentService.getStatusColor(status);
    },

    // Enhanced fee display method with debugging
    getDisplayFee(request) {
      const totalDocumentFee = parseFloat(request.total_document_fee);
      const totalFee = parseFloat(request.total_fee);

      // Debug logging for Cedula requests
      if (request.document_type === 'Cedula') {
        console.log(`🔍 Cedula Fee Debug - Request ${request.request_number}:`, {
          total_document_fee: request.total_document_fee,
          total_fee: request.total_fee,
          parsed_total_document_fee: totalDocumentFee,
          parsed_total_fee: totalFee,
          will_display: totalDocumentFee || totalFee || 0
        });
      }

      // Prioritize total_document_fee, fallback to total_fee
      return totalDocumentFee || totalFee || 0;
    },

    // Check if request has convenience fee
    hasConvenienceFee(request) {
      const baseFee = this.getBaseFee(request);
      const totalFee = this.getDisplayFee(request);
      return totalFee > baseFee && baseFee > 0;
    },

    // Get base document fee (without convenience fee)
    getBaseFee(request) {
      const documentType = request.document_type;
      const totalFee = this.getDisplayFee(request);

      // For Cedula requests, calculate the actual document fee
      if (documentType === 'Cedula') {
        // If total is ₱100.00, the base fee is likely ₱30.00 (with ₱70.00 convenience fee)
        if (totalFee === 100.00) {
          return 30.00; // Standard Cedula fee for ₱20K income
        }
        // For other amounts, assume no convenience fee for now
        return totalFee;
      }

      // For other document types, check if convenience fee was applied
      const PAYMONGO_MINIMUM = 100.00;
      if (totalFee === PAYMONGO_MINIMUM && documentType !== 'Barangay Clearance') {
        // Likely has convenience fee - estimate base fee
        return totalFee - (PAYMONGO_MINIMUM - totalFee);
      }

      return totalFee;
    },

    // Get convenience fee amount
    getConvenienceFee(request) {
      const baseFee = this.getBaseFee(request);
      const totalFee = this.getDisplayFee(request);
      return Math.max(0, totalFee - baseFee);
    },

    // Get convenience fee explanation
    getConvenienceFeeExplanation(request) {
      const convenienceFee = this.getConvenienceFee(request);
      if (convenienceFee > 0) {
        return `PayMongo requires a minimum payment of ₱100.00. A convenience fee of ₱${convenienceFee.toFixed(2)} was added to meet this requirement.`;
      }
      return '';
    },

    formatDate(dateString) {
      console.log('🗓️ formatDate called with:', dateString);
      if (!dateString) {
        console.log('🗓️ formatDate: No date provided, returning null');
        return null;
      }
      const date = new Date(dateString);
      const formatted = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      console.log('🗓️ formatDate result:', formatted);
      return formatted;
    },

    formatCurrency(amount) {
      return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP'
      }).format(amount || 0);
    },

    // PDF-specific currency formatting (avoids special character issues in jsPDF)
    formatCurrencyForPDF(amount) {
      const numAmount = parseFloat(amount) || 0;
      return `PHP ${numAmount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`;
    },

    formatDateTime(dateString) {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    // Get formatted changed by name for status history
    getChangedByName(history) {
      // If the reason starts with "SYSTEM:", show "System" regardless of changed_by_name
      if (history.change_reason && history.change_reason.startsWith('SYSTEM:')) {
        return 'System';
      }
      return history.changed_by_name || 'System';
    },

    // Get formatted reason for status history
    getFormattedReason(reason) {
      if (!reason) return '';
      // Remove "SYSTEM:" prefix if present
      if (reason.startsWith('SYSTEM:')) {
        return reason.substring(7).trim(); // Remove "SYSTEM:" and trim whitespace
      }
      return reason;
    },

    // New helper methods for complete client information
    getClientFullName(request) {
      if (!request) return 'Not provided';
      const parts = [
        request.client_first_name,
        request.client_middle_name,
        request.client_last_name,
        request.client_suffix
      ].filter(Boolean);
      return parts.length > 0 ? parts.join(' ') : request.client_name || 'Not provided';
    },

    getClientFullAddress(request) {
      if (!request) return null;
      const parts = [
        request.client_house_number,
        request.client_street,
        request.client_subdivision,
        request.client_barangay,
        request.client_city_municipality || request.client_city,
        request.client_province
      ].filter(Boolean);
      return parts.length > 0 ? parts.join(', ') : (request.client_address || null);
    },

    formatGender(gender) {
      if (!gender) {
        return null;
      }
      return gender.charAt(0).toUpperCase() + gender.slice(1);
    },

    getCivilStatusName(statusId) {
      const statuses = {
        1: 'Single',
        2: 'Married',
        3: 'Divorced',
        4: 'Widowed',
        5: 'Separated'
      };
      return statuses[statusId] || null;
    },

    // New helper methods for third-party requests
    formatRelationship(relationship) {
      if (!relationship) return 'Not specified';

      const relationships = {
        'spouse': 'Spouse',
        'child': 'Child',
        'parent': 'Parent',
        'sibling': 'Sibling',
        'relative': 'Other Relative',
        'friend': 'Friend',
        'colleague': 'Colleague',
        // 'other': 'Other',
        'self': 'Self'
      };

      return relationships[relationship] || relationship.charAt(0).toUpperCase() + relationship.slice(1);
    },



    formatAuthorizationStatus(status) {
      if (!status) return 'Pending';

      const statuses = {
        'pending': 'Pending Verification',
        'verified': 'Verified',
        'rejected': 'Rejected'
      };

      return statuses[status] || status.charAt(0).toUpperCase() + status.slice(1);
    },

    getAuthorizationStatusClass(status) {
      const classes = {
        'pending': 'bg-warning text-dark',
        'verified': 'bg-success',
        'rejected': 'bg-danger'
      };

      return classes[status] || 'bg-secondary';
    },

    getAuthorizationStatusIcon(status) {
      const icons = {
        'pending': 'fa-clock',
        'verified': 'fa-check-circle',
        'rejected': 'fa-times-circle'
      };

      return icons[status] || 'fa-question-circle';
    },

    // Authorization verification methods
    async verifyAuthorization(requestId, isApproved) {
      try {
        // Validate that we have a pickup person ID
        if (!this.currentRequest?.authorized_pickup?.id) {
          this.$toast?.error('Pickup person ID not found');
          return;
        }

        const pickupId = this.currentRequest.authorized_pickup.id;
        const status = isApproved ? 'verified' : 'rejected';

        // Call the actual API endpoint to verify pickup person
        const response = await this.$http.patch(
          `/api/authorized-pickup/${pickupId}/verify`,
          { verification_status: status }
        );

        if (response.data.success) {
          this.$toast?.success(
            isApproved 
              ? 'Pickup authorization approved successfully. Client has been notified.' 
              : 'Pickup authorization rejected. Client has been notified.'
          );
          
          // Refresh the request details to show updated status
          await this.loadRequestDetails(requestId);
        } else {
          this.$toast?.error(response.data.message || 'Failed to update pickup authorization');
        }

      } catch (error) {
        console.error('Failed to verify authorization:', error);
        this.$toast?.error(error.response?.data?.message || 'Failed to verify authorization. Please try again.');
      }
    },

    getResidencyDisplay(request) {
      if (!request) return null;
      const years = request.client_years_of_residency;
      const months = request.client_months_of_residency;

      if (!years && !months) return null; // Return null so the template can handle "Not provided"

      const parts = [];
      if (years) parts.push(`${years} year${years > 1 ? 's' : ''}`);
      if (months) parts.push(`${months} month${months > 1 ? 's' : ''}`);

      return parts.join(' and ');
    },

    formatTime(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    },

    // Real-time features
    async initializeRealTimeFeatures() {
      console.log('Initializing real-time features for AdminRequests');

      try {
        // Initialize notification service
        await notificationService.init('admin');

        // Listen for request-related notifications
        notificationService.on('notification', this.handleRealTimeNotification);
        notificationService.on('request_status_changed', this.handleStatusChange);
        notificationService.on('new_request', this.handleNewRequest);

        // Start auto-refresh if enabled
        if (this.autoRefreshEnabled) {
          this.startAutoRefresh();
        }
      } catch (error) {
        console.error('Failed to initialize real-time features:', error);
      }
    },

    cleanupRealTimeFeatures() {
      console.log('Cleaning up real-time features for AdminRequests');

      // Remove notification listeners
      notificationService.off('notification', this.handleRealTimeNotification);
      notificationService.off('request_status_changed', this.handleStatusChange);
      notificationService.off('new_request', this.handleNewRequest);

      // Cleanup (simplified)
      notificationService.cleanup();

      // Stop auto-refresh
      this.stopAutoRefresh();
    },

    startAutoRefresh() {
      if (this.refreshInterval) {
        clearInterval(this.refreshInterval);
      }

      this.refreshInterval = setInterval(() => {
        if (this.autoRefreshEnabled && !this.loading) {
          console.log('Auto-refreshing requests data...');
          this.refreshRequestsData();
        }
      }, this.refreshRate);

      console.log(`Auto-refresh started with ${this.refreshRate / 1000}s interval`);
    },

    stopAutoRefresh() {
      if (this.refreshInterval) {
        clearInterval(this.refreshInterval);
        this.refreshInterval = null;
        console.log('Auto-refresh stopped');
      }
    },

    toggleAutoRefresh() {
      this.autoRefreshEnabled = !this.autoRefreshEnabled;

      if (this.autoRefreshEnabled) {
        this.startAutoRefresh();
      } else {
        this.stopAutoRefresh();
      }
    },

    async refreshRequestsData() {
      try {
        this.lastRefresh = new Date();

        // Refresh requests list
        await this.loadRequests();

        // Refresh statistics
        await this.loadDashboardStats();

        // If request details modal is open, refresh it
        if (this.showRequestDetails && this.currentRequest) {
          await this.refreshRequestDetails();
        }

        console.log('Requests data refreshed successfully');
      } catch (error) {
        console.error('Failed to refresh requests data:', error);
      }
    },

    handleRealTimeNotification(notification) {
      console.log('Real-time notification received:', notification);

      // Handle different notification types
      switch (notification.type) {
        case 'request_status_changed':
          this.handleStatusChange(notification.data);
          break;
        case 'new_request':
          this.handleNewRequest(notification.data);
          break;
        case 'request_updated':
          this.handleRequestUpdate(notification.data);
          break;
        case 'unread_count_update':
        case 'heartbeat':
          // Polling system notifications - handled by notification service
          break;
        default:
          // Only log unknown types, not system types
          if (!['unread_count_update', 'heartbeat'].includes(notification.type)) {
            console.log('Unhandled notification type:', notification.type);
          }
      }
    },

    handleStatusChange(data) {
      console.log('🔄 Request status changed:', data);
      console.log('🔍 Data properties:', {
        request_id: data.request_id,
        new_status: data.new_status,
        payment_status: data.payment_status,
        amount: data.amount
      });

      // Update the request in the list if it exists
      const requestId = data.request_id;
      if (!requestId) {
        console.warn('⚠️ No request_id in status change data');
        return;
      }

      const requestIndex = this.requests.findIndex(req => req.id == requestId);
      if (requestIndex !== -1) {
        console.log(`📝 Updating request #${data.request_id} in the list`);

        // Update the specific request in the list for immediate UI update
        const updatedRequest = { ...this.requests[requestIndex] };

        // Map the status based on the new status
        if (data.new_status === 'payment_confirmed') {
          updatedRequest.status_name = 'Payment Confirmed';
          updatedRequest.status_id = 11;
          updatedRequest.payment_status = 'paid';
        } else if (data.new_status === 'payment_failed') {
          updatedRequest.status_name = 'Payment Failed';
          updatedRequest.payment_status = 'failed';
        }

        // Update the timestamp
        updatedRequest.updated_at = data.timestamp || new Date().toISOString();

        // Replace the request in the array
        this.$set(this.requests, requestIndex, updatedRequest);

        // Also refresh data in background to ensure consistency
        setTimeout(() => {
          this.refreshRequestsData();
        }, 1000);

        console.log(`✅ Request #${data.request_id} updated in real-time`);
      } else {
        console.log(`📄 Request #${data.request_id} not in current view, refreshing data`);
        // If request is not in current view, just refresh
        this.refreshRequestsData();
      }

      // Show toast notification with payment-specific message
      const toastRequestId = data.request_id || 'Unknown';
      const newStatus = data.new_status || 'unknown';

      let title = 'Status Update';
      let message = `Request #${toastRequestId} status changed`;
      let type = 'info';

      if (newStatus === 'payment_confirmed') {
        title = 'Payment Confirmed';
        message = `Payment confirmed for request #${toastRequestId}`;
        type = 'success';
      } else if (newStatus === 'payment_failed') {
        title = 'Payment Failed';
        message = `Payment failed for request #${toastRequestId}`;
        type = 'error';
      }

      console.log('🔔 Showing toast:', { title, message, type });
      this.showToast(title, message, type);
    },

    handleNewRequest(data) {
      console.log('New request received:', data);

      // Refresh requests to show the new request
      this.refreshRequestsData();

      // Show toast notification
      this.showToast('New Request', `New ${data.document_type} request received`, 'success');
    },

    handleRequestUpdate(data) {
      console.log('Request updated:', data);

      // If the updated request is currently being viewed, refresh details
      if (this.currentRequest && this.currentRequest.id === data.request_id) {
        this.refreshRequestDetails();
      }

      // Refresh the requests list
      this.refreshRequestsData();
    },

    showToast(title, message, type = 'info') {
      // Enhanced debugging
      console.log('🔔 showToast called with:', {
        title: title,
        titleType: typeof title,
        message: message,
        messageType: typeof message,
        type: type
      });

      // Handle undefined values
      const safeTitle = title || 'Notification';
      const safeMessage = message || 'No message provided';

      // Log to console for debugging
      console.log(`[${type.toUpperCase()}] ${safeTitle}: ${safeMessage}`);

      // Create a simple toast notification
      const toast = document.createElement('div');
      toast.className = `toast-notification toast-${type}`;
      toast.innerHTML = `
        <div class="toast-header">
          <strong>${safeTitle}</strong>
          <button type="button" class="toast-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
        <div class="toast-body">${safeMessage}</div>
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

    // Document handling methods
    getDocumentTypeDisplayName(type) {
      const displayNames = {
        'government_id': 'Government ID',
        'proof_of_residency': 'Proof of Residency',
        'cedula': 'Community Tax Certificate (Cedula)',
        'birth_certificate': 'Birth Certificate',
        'marriage_certificate': 'Marriage Certificate',
        'other': 'Other Document'
      };
      return displayNames[type] || type;
    },

    isImageFile(mimeType) {
      return mimeType && (
        mimeType.startsWith('image/') ||
        ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'].includes(mimeType)
      );
    },

    isPdfFile(mimeType) {
      return mimeType === 'application/pdf';
    },

    async loadDocumentUrls(documents) {
      // Filter documents that need loading (images only, not already loaded/loading/failed)
      const documentsToLoad = documents.filter(doc =>
        this.isImageFile(doc.mime_type) &&
        !this.documentUrls[doc.id] &&
        !this.loadingDocuments.has(doc.id) &&
        !this.failedDocuments.has(doc.id)
      );

      if (documentsToLoad.length === 0) return;

      // Load documents in parallel with concurrency limit
      const CONCURRENT_LIMIT = 3;
      const chunks = this.chunkArray(documentsToLoad, CONCURRENT_LIMIT);

      for (const chunk of chunks) {
        await Promise.allSettled(
          chunk.map(document => this.loadSingleDocument(document))
        );
      }
    },

    async loadSingleDocument(document, isForModal = false) {
      const docId = document.id;

      try {
        // Mark as loading
        this.loadingDocuments.add(docId);
        if (isForModal) this.imageLoadingInModal = true;

        // Add timestamp to force cache busting (especially important after reupload)
        const timestamp = new Date().getTime();
        
        // Use authenticated API call to get the document
        const response = await api.get(`/documents/view/${docId}?t=${timestamp}`, {
          responseType: 'blob',
          timeout: 15000, // Increased timeout for large images
          onDownloadProgress: (progressEvent) => {
            // Optional: Could emit progress events here
            if (progressEvent.lengthComputable) {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              console.log(`Loading ${docId}: ${percentCompleted}%`);
            }
          }
        });

        // Validate response
        if (!response.data || response.data.size === 0) {
          throw new Error('Empty response received');
        }

        // Check file size and optimize if needed
        const blob = response.data;
        const optimizedBlob = await this.optimizeImageBlob(blob, document.mime_type, isForModal);

        // Create blob URL using requestIdleCallback for better performance
        await this.createBlobUrlWhenIdle(docId, optimizedBlob);

        // Remove from failed set if it was there
        this.failedDocuments.delete(docId);
        if (isForModal) this.modalImageError = false;

      } catch (error) {
        console.warn(`Failed to load document ${docId}:`, error.message);
        this.failedDocuments.add(docId);
        if (isForModal) this.modalImageError = true;

        // Optionally retry after a delay for network errors
        if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNABORTED') {
          setTimeout(() => {
            this.failedDocuments.delete(docId);
          }, 30000); // Retry after 30 seconds
        }
      } finally {
        // Remove from loading set
        this.loadingDocuments.delete(docId);
        if (isForModal) this.imageLoadingInModal = false;
      }
    },

    chunkArray(array, size) {
      const chunks = [];
      for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
      }
      return chunks;
    },

    async getDocumentUrl(document) {
      // This method is now deprecated in favor of loadDocumentUrls
      // Keeping for backward compatibility
      if (this.documentUrls[document.id]) {
        return this.documentUrls[document.id];
      }
      return null;
    },

    formatFileSize(bytes) {
      if (!bytes) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    },

    async openImageModal(document) {
      // Prevent multiple rapid clicks
      if (this.imageLoadingInModal) return;

      // Don't open modal if document failed to load and we're not retrying
      if (this.failedDocuments.has(document.id)) {
        return;
      }

      // Set modal state immediately for responsiveness
      this.selectedImage = document;
      this.showImageModal = true;
      this.modalImageError = false;

      // Use nextTick to ensure DOM is updated before heavy operations
      await this.$nextTick();

      // If image isn't loaded yet, try to load it with modal optimization
      if (!this.documentUrls[document.id] && !this.loadingDocuments.has(document.id)) {
        await this.loadSingleDocument(document, true);
      }
    },

    async retryLoadDocument(document) {
      // Remove from failed set and retry loading
      this.failedDocuments.delete(document.id);
      this.modalImageError = false;
      await this.loadSingleDocument(document, true);
    },

    onModalImageLoad() {
      // Called when modal image finishes loading
      this.imageLoadingInModal = false;
    },

    cleanupDocumentUrls() {
      // Revoke all blob URLs to prevent memory leaks
      Object.values(this.documentUrls).forEach(url => {
        if (url) URL.revokeObjectURL(url);
      });

      // Clear all tracking sets and objects
      this.documentUrls = {};
      this.loadingDocuments.clear();
      this.failedDocuments.clear();
    },

    preloadImage(document) {
      // Preload image on hover for better UX
      if (!this.documentUrls[document.id] &&
          !this.loadingDocuments.has(document.id) &&
          !this.failedDocuments.has(document.id)) {
        this.loadSingleDocument(document, false);
      }
    },

    async optimizeImageBlob(blob, mimeType, isForModal = false) {
      // For very large images, we might want to resize them
      const MAX_SIZE = isForModal ? 5 * 1024 * 1024 : 2 * 1024 * 1024; // 5MB for modal, 2MB for preview

      if (blob.size <= MAX_SIZE) {
        return blob; // No optimization needed
      }

      try {
        // Create image element for resizing
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        return new Promise((resolve) => {
          img.onload = () => {
            // Calculate new dimensions (maintain aspect ratio)
            const maxDimension = isForModal ? 1920 : 800;
            let { width, height } = img;

            if (width > height && width > maxDimension) {
              height = (height * maxDimension) / width;
              width = maxDimension;
            } else if (height > maxDimension) {
              width = (width * maxDimension) / height;
              height = maxDimension;
            }

            // Set canvas size and draw resized image
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);

            // Convert to blob with compression
            canvas.toBlob(
              (optimizedBlob) => {
                resolve(optimizedBlob || blob); // Fallback to original if optimization fails
              },
              mimeType,
              0.85 // 85% quality
            );
          };

          img.onerror = () => resolve(blob); // Fallback to original
          img.src = URL.createObjectURL(blob);
        });
      } catch (error) {
        console.warn('Image optimization failed:', error);
        return blob; // Fallback to original
      }
    },

    async createBlobUrlWhenIdle(docId, blob) {
      return new Promise((resolve) => {
        const createUrl = () => {
          this.documentUrls[docId] = URL.createObjectURL(blob);
          resolve();
        };

        // Use requestIdleCallback if available, otherwise use setTimeout
        if (window.requestIdleCallback) {
          window.requestIdleCallback(createUrl, { timeout: 1000 });
        } else {
          setTimeout(createUrl, 0);
        }
      });
    },

    closeImageModal() {
      // Prevent rapid clicking during image loading
      if (this.imageLoadingInModal) return;

      this.showImageModal = false;
      this.selectedImage = null;
      this.imageLoadingInModal = false;
      this.modalImageError = false;
    },

    async downloadDocument(documentFile) {
      try {
        // Use authenticated API call to download the document
        const response = await api.get(`/documents/download/${documentFile.id}`, {
          responseType: 'blob'
        });

        // Create a download link
        const blob = new Blob([response.data], { type: documentFile.mime_type });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = documentFile.document_name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Failed to download document:', error);
        this.showToast('Error', 'Failed to download document', 'error');
      }
    },

    handleImageError(event) {
      console.error('Failed to load image:', event.target.src);
      // You could set a placeholder image here
      event.target.style.display = 'none';

      // Show error message
      const errorDiv = document.createElement('div');
      errorDiv.className = 'text-center text-muted p-3';
      errorDiv.innerHTML = '<i class="fas fa-exclamation-triangle"></i><br>Failed to load image';
      event.target.parentNode.appendChild(errorDiv);
    },

    // Supporting Document Verification Methods
    async approveSupportingDocument(documentId) {
      if (!confirm('Are you sure you want to approve this supporting document?')) return;
      
      try {
        const result = await supportingDocumentService.updateDocumentStatus(documentId, 'approved');
        
        if (result.success) {
          this.$toast?.success('Supporting document approved successfully');
          
          // Clear cached blob URL for this document to force reload
          if (this.documentUrls[documentId]) {
            URL.revokeObjectURL(this.documentUrls[documentId]);
            delete this.documentUrls[documentId];
          }
          this.loadingDocuments.delete(documentId);
          this.failedDocuments.delete(documentId);
          
          // Refresh the current request details
          await this.viewRequestDetails(this.currentRequest.id);
          
          // Close the dialog
          this.showRequestDetails = false;
        } else {
          this.$toast?.error(result.message || 'Failed to approve document');
        }
      } catch (error) {
        console.error('Error approving supporting document:', error);
        this.$toast?.error('An error occurred while approving the document');
      }
    },

    async rejectSupportingDocument(documentId) {
      if (!confirm('Are you sure you want to reject this supporting document? The client will be notified to reupload.')) return;
      
      try {
        const result = await supportingDocumentService.updateDocumentStatus(documentId, 'rejected');
        
        if (result.success) {
          this.$toast?.warning('Supporting document rejected. Client will be notified.');
          
          // Clear cached blob URL for this document to force reload
          if (this.documentUrls[documentId]) {
            URL.revokeObjectURL(this.documentUrls[documentId]);
            delete this.documentUrls[documentId];
          }
          this.loadingDocuments.delete(documentId);
          this.failedDocuments.delete(documentId);
          
          // Refresh the current request details
          await this.viewRequestDetails(this.currentRequest.id);
          
          // Close the dialog
          this.showRequestDetails = false;
        } else {
          this.$toast?.error(result.message || 'Failed to reject document');
        }
      } catch (error) {
        console.error('Error rejecting supporting document:', error);
        this.$toast?.error('An error occurred while rejecting the document');
      }
    },

    // Beneficiary Verification Methods
    async approveBeneficiaryVerification(beneficiaryId) {
      if (!confirm('Are you sure you want to approve this beneficiary verification?')) return;
      
      try {
        const result = await beneficiaryVerificationService.updateVerificationStatus(beneficiaryId, 'approved');
        
        if (result.success) {
          this.$toast?.success('Beneficiary verification approved successfully');
          await this.loadRequestDetails(this.currentRequest.id);
          
          // Close the dialog
          this.showRequestDetails = false;
        } else {
          this.$toast?.error(result.message || 'Failed to approve verification');
        }
      } catch (error) {
        console.error('Error approving beneficiary verification:', error);
        this.$toast?.error('An error occurred');
      }
    },

    async rejectBeneficiaryVerification(beneficiaryId) {
      if (!confirm('Are you sure you want to reject this beneficiary verification? The client will be notified to reupload.')) return;
      
      try {
        const result = await beneficiaryVerificationService.updateVerificationStatus(beneficiaryId, 'rejected');
        
        if (result.success) {
          this.$toast?.warning('Beneficiary verification rejected. Client will be notified.');
          await this.loadRequestDetails(this.currentRequest.id);
          
          // Close the dialog
          this.showRequestDetails = false;
        } else {
          this.$toast?.error(result.message || 'Failed to reject verification');
        }
      } catch (error) {
        console.error('Error rejecting beneficiary verification:', error);
        this.$toast?.error('An error occurred');
      }
    },

    // Authorization Document Methods
    async approveAuthorizationDocument(documentId) {
      if (!confirm('Are you sure you want to approve this authorization document?')) return;
      
      try {
        const result = await authorizationDocumentService.updateDocumentStatus(documentId, 'approved');
        
        if (result.success) {
          this.$toast?.success('Authorization document approved successfully');
          await this.loadRequestDetails(this.currentRequest.id);
        } else {
          this.$toast?.error(result.message || 'Failed to approve document');
        }
      } catch (error) {
        console.error('Error approving authorization document:', error);
        this.$toast?.error('An error occurred');
      }
    },

    async rejectAuthorizationDocument(documentId) {
      if (!confirm('Are you sure you want to reject this authorization document? The client will be notified to reupload.')) return;
      
      try {
        const result = await authorizationDocumentService.updateDocumentStatus(documentId, 'rejected');
        
        if (result.success) {
          this.$toast?.warning('Authorization document rejected. Client will be notified.');
          await this.loadRequestDetails(this.currentRequest.id);
        } else {
          this.$toast?.error(result.message || 'Failed to reject document');
        }
      } catch (error) {
        console.error('Error rejecting authorization document:', error);
        this.$toast?.error('An error occurred');
      }
    },

    // Beneficiary verification status methods
    getBeneficiaryVerificationStatusClass(status) {
      switch (status) {
        case 'approved':
          return 'bg-success';
        case 'rejected':
          return 'bg-danger';
        case 'pending':
        default:
          return 'bg-warning';
      }
    },

    getBeneficiaryVerificationStatusText(status) {
      switch (status) {
        case 'approved':
          return 'Verified';
        case 'rejected':
          return 'Rejected';
        case 'pending':
        default:
          return 'Pending';
      }
    },

    // View verification image
    async viewVerificationImage(requestId, imageType) {
      try {
        // Find the request to get the filename - check both requests list and currentRequest
        let request = this.requests.find(r => r.id === requestId);

        // If not found in requests list, check if it's the current request being viewed
        if (!request && this.currentRequest && this.currentRequest.id === requestId) {
          request = this.currentRequest;
        }

        if (!request) {
          this.showToast('Error', 'Request not found', 'error');
          return;
        }

        // Debug: Log the request object to see what properties are available
        console.log('🔍 Debug - Request object for image viewing:', {
          requestId,
          imageType,
          request: {
            id: request.id,
            is_third_party_request: request.is_third_party_request,
            beneficiary_verification_image: request.beneficiary_verification_image,
            pickup_id_image: request.pickup_id_image,
            pickup_authorization_letter: request.pickup_authorization_letter,
            beneficiary_id: request.beneficiary_id,
            beneficiary_name: request.beneficiary_name,
            beneficiary_verification_status: request.beneficiary_verification_status,
            pickup_person_name: request.pickup_person_name,
            pickup_verified: request.pickup_verified,
            beneficiary: request.beneficiary,
            authorized_pickup: request.authorized_pickup,
            // Show all properties that might contain image paths
            allImageProperties: Object.keys(request).filter(key =>
              key.includes('image') || key.includes('verification') || key.includes('authorization') || key.includes('pickup') || key.includes('beneficiary')
            ).reduce((obj, key) => {
              obj[key] = request[key];
              return obj;
            }, {}),
            // Show first 10 properties to understand the structure
            sampleProperties: Object.keys(request).slice(0, 10).reduce((obj, key) => {
              obj[key] = request[key];
              return obj;
            }, {})
          }
        });

        let filename = '';
        let documentType = '';

        // Declare variables outside switch to avoid ESLint no-case-declarations
        let tempId;

        switch (imageType) {
          case 'beneficiary':
            // Handle both list view (beneficiary_verification_image) and detail view (beneficiary.verification_image_path)
            filename = request.beneficiary_verification_image || request.beneficiary?.verification_image_path;
            documentType = 'beneficiary';
            // Use beneficiary ID if available, otherwise keep request ID
            tempId = request.beneficiary_id || request.beneficiary?.id;
            if (tempId) {
              requestId = tempId;
            }
            break;
          case 'pickup-id':
            filename = request.pickup_id_image || request.authorized_pickup?.id_image_path;
            documentType = 'pickup-id';
            // Use pickup person ID if available
            tempId = request.pickup_person_id || request.authorized_pickup?.id;
            if (tempId) {
              requestId = tempId;
            }
            break;
          case 'pickup-auth':
            filename = request.pickup_authorization_letter || request.authorized_pickup?.authorization_letter_path;
            documentType = 'pickup-auth';
            // Use pickup person ID if available
            tempId = request.pickup_person_id || request.authorized_pickup?.id;
            if (tempId) {
              requestId = tempId;
            }
            break;
          default:
            this.showToast('Error', 'Invalid image type', 'error');
            return;
        }

        console.log('🔍 Debug - Image path resolution:', {
          imageType,
          filename,
          documentType,
          finalRequestId: requestId,
          hasFilename: !!filename,
          filenameLength: filename ? filename.length : 0,
          filenameType: typeof filename
        });

        if (!filename) {
          let errorMessage = 'No image available';
          let detailMessage = '';

          switch (imageType) {
            case 'beneficiary':
              errorMessage = 'No beneficiary verification image available';
              detailMessage = 'The beneficiary has not uploaded a verification image yet.';
              break;
            case 'pickup-id':
              errorMessage = 'No pickup person ID image available';
              detailMessage = 'The authorized pickup person has not uploaded their ID image yet.';
              break;
            case 'pickup-auth':
              errorMessage = 'No authorization document available';
              detailMessage = 'The authorization letter has not been uploaded yet.';
              break;
          }

          console.log('❌ No image available - Detailed analysis:', {
            imageType,
            errorMessage,
            detailMessage,
            requestData: {
              beneficiary_verification_image: request.beneficiary_verification_image,
              pickup_id_image: request.pickup_id_image,
              pickup_authorization_letter: request.pickup_authorization_letter
            },
            alternativeProperties: {
              'beneficiary?.verification_image_path': request.beneficiary?.verification_image_path,
              'authorized_pickup?.id_image_path': request.authorized_pickup?.id_image_path,
              'authorized_pickup?.authorization_letter_path': request.authorized_pickup?.authorization_letter_path
            },
            isThirdPartyRequest: request.is_third_party_request,
            hasBeneficiaryId: !!request.beneficiary_id,
            hasPickupPersonName: !!request.pickup_person_name
          });

          this.showToast('Error', errorMessage, 'error');
          return;
        }

        // Extract just the filename from the path (handle both forward and back slashes)
        const filenameOnly = filename.split(/[/\\]/).pop();

        // Construct the URL for the verification document service
        // Note: Don't include /api prefix because axios baseURL already includes it
        const imageUrl = `/verification-documents/serve/${documentType}/${requestId}/${filenameOnly}`;

        console.log('✅ Image filename found - Proceeding to load:', {
          originalFilename: filename,
          filenameOnly,
          imageUrl,
          documentType,
          requestId
        });

        // Fetch the image with authentication headers and display in modal
        await this.displayImageInModal(imageUrl, `${documentType} verification image`);

      } catch (error) {
        console.error('Error viewing verification image:', error);
        this.showToast('Error', 'Failed to view image', 'error');
      }
    },

    // Display image in modal with authentication
    async displayImageInModal(imageUrl, title) {
      try {
        console.log('🖼️ Attempting to load image:', {
          url: imageUrl,
          title
        });

        // Import the API service
        const api = (await import('@/services/api.js')).default;

        // Fetch the image with authentication headers
        const response = await api.get(imageUrl, {
          responseType: 'blob'
        });

        console.log('✅ Image loaded successfully:', {
          url: imageUrl,
          contentType: response.headers['content-type'],
          size: response.data.size
        });

        // Create object URL from blob
        const imageObjectUrl = URL.createObjectURL(response.data);

        // Create and show modal
        const modalHtml = `
          <div class="modal fade" id="imageViewModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-lg modal-dialog-centered">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title">${title}</h5>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body text-center">
                  <img src="${imageObjectUrl}" class="img-fluid" alt="${title}" style="max-height: 70vh;">
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </div>
              </div>
            </div>
          </div>
        `;

        // Remove existing modal if any
        const existingModal = document.getElementById('imageViewModal');
        if (existingModal) {
          existingModal.remove();
        }

        // Add modal to DOM
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        // Show modal
        const modal = new Modal(document.getElementById('imageViewModal'));
        modal.show();

        // Clean up object URL when modal is hidden
        document.getElementById('imageViewModal').addEventListener('hidden.bs.modal', () => {
          URL.revokeObjectURL(imageObjectUrl);
          document.getElementById('imageViewModal').remove();
        });

      } catch (error) {
        console.error('❌ Error displaying image:', {
          url: imageUrl,
          error: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        });

        let errorMessage = 'Failed to load image';
        let detailMessage = '';

        if (error.response) {
          switch (error.response.status) {
            case 404:
              errorMessage = 'Image not found';
              detailMessage = 'The verification image file could not be found on the server.';
              break;
            case 403:
              errorMessage = 'Access denied';
              detailMessage = 'You do not have permission to view this image.';
              break;
            case 401:
              errorMessage = 'Authentication required';
              detailMessage = 'Please log in again to view this image.';
              break;
            case 500:
              errorMessage = 'Server error';
              detailMessage = 'There was a problem loading the image from the server.';
              break;
            default:
              errorMessage = `Failed to load image (${error.response.status})`;
              detailMessage = error.response.statusText || 'Unknown server error';
          }
        } else if (error.code === 'NETWORK_ERROR') {
          errorMessage = 'Network error';
          detailMessage = 'Could not connect to the server. Please check your internet connection.';
        }

        console.log('📝 Showing error message:', { errorMessage, detailMessage });
        this.showToast('Error', errorMessage, 'error');
      }
    },

    // View pickup documents in modal
    async viewPickupDocuments(request) {
      try {
        // Set the selected request and show the modal
        this.selectedRequestForPickup = request;

        // Show modal using Bootstrap
        const modal = new Modal(document.getElementById('authorizedPickupDocumentsModal'));
        modal.show();
      } catch (error) {
        console.error('Error opening pickup documents modal:', error);
        this.showToast('Error', 'Failed to open documents modal', 'error');
      }
    },

    // Verify pickup authorization
    async verifyPickupAuthorization() {
      if (!this.selectedRequestForPickup) return;

      this.processingPickupAction = true;
      try {
        // This would call a new API endpoint for pickup authorization verification
        // const response = await adminDocumentService.verifyPickupAuthorization(this.selectedRequestForPickup.id);

        this.showToast('Success', 'Pickup authorization verified successfully', 'success');

        // Close modal
        const modal = Modal.getInstance(document.getElementById('authorizedPickupDocumentsModal'));
        if (modal) {
          modal.hide();
        }

        // Refresh requests list
        await this.loadRequests();
      } catch (error) {
        console.error('Error verifying pickup authorization:', error);
        this.showToast('Error', 'Failed to verify pickup authorization', 'error');
      } finally {
        this.processingPickupAction = false;
      }
    },

    // Reject pickup authorization
    async rejectPickupAuthorization() {
      if (!this.selectedRequestForPickup) return;

      this.processingPickupAction = true;
      try {
        // This would call a new API endpoint for pickup authorization rejection
        // const response = await adminDocumentService.rejectPickupAuthorization(this.selectedRequestForPickup.id);

        this.showToast('Success', 'Pickup authorization rejected', 'success');

        // Close modal
        const modal = Modal.getInstance(document.getElementById('authorizedPickupDocumentsModal'));
        if (modal) {
          modal.hide();
        }

        // Refresh requests list
        await this.loadRequests();
      } catch (error) {
        console.error('Error rejecting pickup authorization:', error);
        this.showToast('Error', 'Failed to reject pickup authorization', 'error');
      } finally {
        this.processingPickupAction = false;
      }
    },

    // Update beneficiary verification status
    async updateBeneficiaryVerificationStatus(beneficiaryId, status, notes = '') {
      try {
        const response = await this.$http.put(
          `/api/verification-documents/beneficiary/${beneficiaryId}/verification-status`,
          { status, notes }
        );

        if (response.data.success) {
          this.showToast('Success', 'Verification status updated successfully', 'success');
          // Refresh the requests to show updated status
          await this.loadRequests();
        } else {
          throw new Error(response.data.message || 'Failed to update verification status');
        }

      } catch (error) {
        console.error('Error updating verification status:', error);
        this.showToast('Error', error.response?.data?.message || 'Failed to update verification status', 'error');
      }
    },

    // Open verification modal
    openVerificationModal(request) {
      this.currentVerification = {
        requestId: request.id,
        beneficiaryId: request.beneficiary_id,
        beneficiary_name: request.beneficiary_name,
        relationship: request.beneficiary_relationship,
        image_url: request.beneficiary_verification_image ?
          `/verification-documents/serve/beneficiary/${request.id}/${request.beneficiary_verification_image.split('/').pop()}` :
          null,
        current_status: request.beneficiary_verification_status
      };

      this.verificationForm = {
        status: request.beneficiary_verification_status || 'pending',
        notes: ''
      };

      // Show the modal using Bootstrap
      const modal = new Modal(document.getElementById('verificationModal'));
      modal.show();
    },

    // Save verification status from modal
    async saveVerificationStatus() {
      if (!this.currentVerification) return;

      try {
        await this.updateBeneficiaryVerificationStatus(
          this.currentVerification.beneficiaryId,
          this.verificationForm.status,
          this.verificationForm.notes
        );

        // Close the modal
        const modal = Modal.getInstance(document.getElementById('verificationModal'));
        modal.hide();

        // Reset form
        this.currentVerification = null;
        this.verificationForm = {
          status: 'pending',
          notes: ''
        };

      } catch (error) {
        // Error handling is done in updateBeneficiaryVerificationStatus
      }
    }
  }
};
</script>

<style scoped>
@import './css/adminDashboard.css';

/* Convenience Fee Display Styling */
.fee-breakdown {
  font-size: 0.85rem;
  line-height: 1.3;
}

.fee-breakdown .base-fee,
.fee-breakdown .convenience-fee,
.fee-breakdown .total-fee {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2px;
}

.fee-breakdown .convenience-fee {
  background-color: #fff3cd;
  padding: 2px 4px;
  border-radius: 3px;
  border-left: 3px solid #ffc107;
}

.fee-breakdown .total-fee {
  margin-top: 4px;
  padding-top: 4px;
  font-weight: bold;
}

.amount-breakdown {
  text-align: center;
}

.amount-breakdown .amount-compact {
  font-weight: bold;
  color: #198754;
}

.amount-breakdown small {
  font-size: 0.7rem;
  line-height: 1.2;
}

/* Tooltip styling for convenience fee info */
.fas.fa-info-circle {
  cursor: help;
  opacity: 0.7;
}

.fas.fa-info-circle:hover {
  opacity: 1;
}

/* Modal Fee Breakdown Styling */
.fee-breakdown-modal {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
}

.fee-breakdown-modal .fee-item {
  border-radius: 6px;
  transition: all 0.2s ease;
}

.fee-breakdown-modal .fee-item:hover {
  background-color: rgba(0, 123, 255, 0.05);
}

.fee-breakdown-modal .fee-label {
  flex: 1;
}

.fee-breakdown-modal .fee-amount {
  text-align: right;
  min-width: 120px;
}

.fee-breakdown-modal .fee-item:last-child {
  background-color: rgba(25, 135, 84, 0.1) !important;
  border-color: #198754 !important;
}

.fee-breakdown-modal .fee-item:last-child:hover {
  background-color: rgba(25, 135, 84, 0.15) !important;
}

/* Payment Summary Card */
.payment-summary-card {
  border: 2px solid #e9ecef;
  transition: all 0.3s ease;
}

.payment-summary-card:hover {
  border-color: #198754;
  box-shadow: 0 4px 8px rgba(25, 135, 84, 0.1);
}

/* Modal Convenience Fee Alert */
.modal .alert-warning {
  border-left: 4px solid #ffc107;
  background-color: #fff3cd;
}

/* Responsive adjustments for modal fee breakdown */
@media (max-width: 768px) {
  .fee-breakdown-modal .fee-item {
    flex-direction: column;
    align-items: flex-start !important;
  }

  .fee-breakdown-modal .fee-amount {
    text-align: left;
    min-width: auto;
    margin-top: 0.5rem;
  }

  .payment-summary-card {
    margin-top: 1rem;
  }
}
</style>