<template>
  <div class="request-history">
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
                  <input
                    type="date"
                    class="form-control"
                    v-model="filters.date_from"
                    :max="getCurrentDate()"
                  >
                </div>
                <div class="col-md-2 mb-3">
                  <label class="form-label">Date To</label>
                  <input
                    type="date"
                    class="form-control"
                    v-model="filters.date_to"
                    :max="getCurrentDate()"
                  >
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

              <!-- PDF Export Section -->
              <div class="row mt-3 pt-3 border-top">
                <div class="col-12">
                  <h6 class="mb-3">
                    <i class="fas fa-file-pdf text-danger me-2"></i>
                    PDF Export
                  </h6>
                </div>
                <div class="col-md-3 mb-3">
                  <label class="form-label">Report Type</label>
                  <select class="form-select" v-model="pdfExportForm.reportType">
                    <option value="daily">Daily Report</option>
                    <option value="weekly">Weekly Report</option>
                    <option value="monthly">Monthly Report</option>
                  </select>
                </div>
                <div class="col-md-3 mb-3" v-if="pdfExportForm.reportType === 'daily'">
                  <label class="form-label">Select Date</label>
                  <input
                    type="date"
                    class="form-control"
                    v-model="pdfExportForm.selectedDate"
                    :max="getCurrentDate()"
                  >
                </div>
                <div class="col-md-3 mb-3" v-if="pdfExportForm.reportType === 'weekly'">
                  <label class="form-label">Select Week</label>
                  <input
                    type="week"
                    class="form-control"
                    v-model="pdfExportForm.selectedWeek"
                    :max="getCurrentWeek()"
                  >
                </div>
                <div class="col-md-3 mb-3" v-if="pdfExportForm.reportType === 'monthly'">
                  <label class="form-label">Select Month</label>
                  <input
                    type="month"
                    class="form-control"
                    v-model="pdfExportForm.selectedMonth"
                    :max="getCurrentMonth()"
                  >
                </div>
                <div class="col-md-3 mb-3 d-flex align-items-end">
                  <button
                    class="btn btn-danger"
                    @click="exportToPDF"
                    :disabled="!isPDFExportValid() || pdfExportForm.loading"
                  >
                    <i class="fas fa-file-pdf me-1" :class="{ 'fa-spin': pdfExportForm.loading }"></i>
                    {{ pdfExportForm.loading ? 'Generating...' : 'Export PDF' }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Note: Bulk Actions removed for history view as completed and cancelled requests should not be modified -->

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

            <!-- Selection removed for history view -->
          </div>

          <!-- Card View -->
          <div v-if="viewMode === 'card'" class="requests-grid">
            <!-- Empty State -->
            <div v-if="requests.length === 0" class="empty-state text-center py-5">
              <div class="empty-state-icon mb-3">
                <i class="fas fa-inbox fa-4x text-muted"></i>
              </div>
              <h5 class="text-muted mb-2">No Historical Requests Found</h5>
              <p class="text-muted">There are no completed or cancelled document requests matching your current filters.</p>
            </div>

            <!-- Request Cards -->
            <div v-else class="row g-4">
              <div v-for="request in requests" :key="request.id" class="col-xl-4 col-lg-6 col-md-6">
                <div class="request-card" :class="{ 'cancelled-request': request.status_name.toLowerCase() === 'cancelled' }">
                  <!-- Card Header -->
                  <div class="request-card-header">
                    <div class="d-flex justify-content-between align-items-start">
                      <div class="d-flex align-items-center gap-2">
                        <div class="request-number">
                          <span class="badge bg-success">{{ request.request_number }}</span>
                        </div>
                        <!-- Cancelled Status Indicator -->
                        <div v-if="request.status_name.toLowerCase() === 'cancelled'" class="cancelled-indicator">
                          <span class="badge bg-danger">
                            <i class="fas fa-times-circle me-1"></i>CANCELLED
                          </span>
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
                <h6 class="empty-title">No Historical Requests Found</h6>
                <p class="empty-text">There are no completed or cancelled document requests matching your current filters.</p>
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
                <div class="header-cell">Date Completed</div>
                <div class="header-cell">Actions</div>
              </div>

              <!-- Table Body -->
              <div class="compact-table-body">
                <div v-for="request in requests" :key="request.id"
                     class="compact-row" :class="{ 'cancelled-request': request.status_name.toLowerCase() === 'cancelled' }">

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
          <div v-if="pagination.totalPages > 1" class="pagination-container">
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
                    <!-- Request Information -->
                    <div class="col-12">
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

                              <!-- I will comment priority for now -->
                              <!-- <div class="mb-3">
                                <label class="form-label fw-bold">Priority</label>
                                <p class="mb-0">
                                  <span class="badge" :class="currentRequest.priority === 'high' ? 'bg-danger' : currentRequest.priority === 'medium' ? 'bg-warning' : 'bg-secondary'">
                                    {{ currentRequest.priority || 'Normal' }}
                                  </span>
                                </p>
                              </div> -->

                              <!-- I will comment priority for now  -->
                              <!-- <div class="mb-3">
                                <label class="form-label fw-bold">Delivery Method</label>
                                <p class="mb-0">{{ currentRequest.delivery_method || 'Pickup' }}</p>
                              </div> -->
                              <div class="mb-3">
                                <label class="form-label fw-bold">Date Submitted</label>
                                <p class="mb-0">{{ formatDateTime(currentRequest.requested_at) }}</p>
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
                                <div class="d-flex align-items-center gap-3">
                                  <!-- I dont want to use or see the status for now in the frontend -->
                                  <!-- <div class="verification-status">
                                    <span class="badge" :class="getBeneficiaryVerificationStatusClass(currentRequest?.beneficiary?.verification_status)">
                                      {{ getBeneficiaryVerificationStatusText(currentRequest?.beneficiary?.verification_status) }}
                                    </span>
                                  </div> -->
                                  <button
                                    class="btn btn-outline-primary btn-sm"
                                    @click="viewVerificationImage(currentRequest.id, 'beneficiary')"
                                    title="View family member verification image"
                                  >
                                    <i class="fas fa-eye me-1"></i>View Verification Image
                                  </button>
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
import api from '@/services/api';
import { Modal } from 'bootstrap';
import notificationService from '@/services/notificationService';
import { jsPDF } from 'jspdf';
// Import jspdf-autotable plugin - v5.x uses named export
import autoTable from 'jspdf-autotable';

export default {
  name: 'RequestHistory',
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
      statusOptions: [],
      selectedRequestForPickup: null,
      processingPickupAction: false,

      // Pagination
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10
      },

      // Filters - Show all historical documents (completed and cancelled)
      filters: {
        status: '', // Empty to show all statuses including completed and cancelled
        document_type: '',
        priority: '',
        search: '',
        date_from: '',
        date_to: ''
      },

      // PDF Export Form
      pdfExportForm: {
        reportType: 'daily',
        selectedDate: '',
        selectedWeek: '',
        selectedMonth: '',
        loading: false
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

    // Initialize PDF export form with default values
    this.initializePDFExportForm();

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
      if (path.includes('/admin/history')) return 'history';
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

    // Initialize PDF export form with default values
    initializePDFExportForm() {
      // Set default date to today
      this.pdfExportForm.selectedDate = this.getCurrentDate();

      // Set default week to current week
      this.pdfExportForm.selectedWeek = this.getCurrentWeek();

      // Set default month to current month
      this.pdfExportForm.selectedMonth = this.getCurrentMonth();
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
        'history': '/admin/history',
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
          this.statusOptions = response.data || [];
          console.log('✅ Status options loaded:', this.statusOptions);
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

    // Load requests with current filters and pagination
    // NOTE: RequestHistory.vue shows HISTORICAL requests only (completed and cancelled)
    // For active request management, see AdminRequests.vue
    async loadRequests() {
      try {
        // Load ALL requests without pagination, then filter and paginate client-side
        // This ensures we get all historical requests for proper pagination
        const params = {
          limit: 1000, // Get all requests (adjust if you have more than 1000)
          priority: this.filters.priority,
          search: this.filters.search,
          date_from: this.filters.date_from,
          date_to: this.filters.date_to
        };

        // Apply document type filter if specified
        if (this.filters.document_type) {
          params.document_type = this.filters.document_type;
        }

        // Apply status filter if specified (allows filtering by specific status)
        if (this.filters.status) {
          params.status = this.filters.status;
        }

        console.log('🔍 RequestHistory: Loading historical requests (completed and cancelled)...');
        console.log('📋 RequestHistory: Params:', params);

        const response = await adminDocumentService.getAllRequests(params);
        console.log('📥 RequestHistory: API response:', response);

        if (response.success) {
          // Filter to show only completed and cancelled requests for historical view
          const allRequests = response.data.requests || [];
          const historicalRequests = allRequests.filter(request => {
            const statusName = request.status_name.toLowerCase();
            return statusName === 'completed' || statusName === 'cancelled';
          });

          console.log('✅ RequestHistory: Total historical requests:', historicalRequests.length);
          console.log('📊 RequestHistory: Breakdown - Total:', allRequests.length, 'Historical:', historicalRequests.length);

          // Calculate pagination based on ALL filtered historical requests
          const itemsPerPage = this.pagination.itemsPerPage;
          const totalItems = historicalRequests.length;
          const totalPages = Math.ceil(totalItems / itemsPerPage);
          
          // Paginate client-side: slice the filtered results
          const startIndex = (this.pagination.currentPage - 1) * itemsPerPage;
          const endIndex = startIndex + itemsPerPage;
          this.requests = historicalRequests.slice(startIndex, endIndex);

          console.log(`📄 RequestHistory: Showing page ${this.pagination.currentPage} (${this.requests.length} items)`);

          if (this.requests.length > 0) {
            console.log('📋 RequestHistory: First request on page:', this.requests[0]);
          }

          // Update pagination
          this.pagination = {
            currentPage: this.pagination.currentPage,
            totalPages: totalPages,
            totalItems: totalItems,
            itemsPerPage: itemsPerPage
          };
        } else {
          console.error('❌ RequestHistory: API returned unsuccessful response:', response);
        }
      } catch (error) {
        console.error('❌ RequestHistory: Failed to load requests:', error);
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
        status: '', // Remove fixed completed status filter to show all historical documents
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
      if (!this.currentRequest || !this.statusOptions) return [];

      const currentStatus = this.currentRequest.status_name.toLowerCase();

      // Only these states are truly final (cannot be changed)
      const finalStates = ['completed', 'cancelled'];

      // If current status is final, no changes allowed
      if (finalStates.includes(currentStatus)) {
        return [];
      }

      // Define allowed transitions based on current status
      const allowedTransitions = this.getAllowedStatusTransitions(currentStatus);

      // Return only allowed status options
      return this.statusOptions.filter(status =>
        allowedTransitions.includes(status.status_name.toLowerCase())
      );
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
         !this.currentRequest.is_online_payment);

      console.log('🔍 Cash payment detection:', {
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
        'ready_for_pickup': ['completed', 'cancelled'], // Simplified - direct completion
        'rejected': ['pending', 'under_review'], // Allow resubmission after corrections
        // Final states - no transitions allowed
        'completed': [],
        'cancelled': []
      };

      return transitions[currentStatus] || [];
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

    // PDF Export functionality
    async exportToPDF() {
      if (!this.isPDFExportValid()) {
        this.showToast('Error', 'Please select a valid date range for the report', 'error');
        return;
      }

      try {
        this.pdfExportForm.loading = true;

        // Get filtered data based on report type
        const reportData = await this.getReportData();

        if (!reportData || reportData.length === 0) {
          this.showToast('Warning', 'No data found for the selected date range', 'warning');
          return;
        }

        // Generate PDF
        const pdf = new jsPDF();
        this.generatePDFReport(pdf, reportData);

        // Download PDF
        const filename = this.getPDFFilename();
        pdf.save(filename);

        this.showToast('Success', 'PDF report generated successfully', 'success');
      } catch (error) {
        console.error('Failed to generate PDF report:', error);
        this.showToast('Error', 'Failed to generate PDF report', 'error');
      } finally {
        this.pdfExportForm.loading = false;
      }
    },

    // Get report data based on selected filters
    async getReportData() {
      const reportFilters = { ...this.filters };

      // Set date range based on report type
      const dateRange = this.getDateRangeForReport();
      reportFilters.date_from = dateRange.from;
      reportFilters.date_to = dateRange.to;

      try {
        console.log('📊 Fetching report data with filters:', reportFilters);

        const response = await adminDocumentService.getAllRequests({
          ...reportFilters,
          page: 1,
          limit: 1000 // Get all data for the report
        });

        console.log('📊 Raw API response:', response);

        if (response.success && response.data.requests) {
          const allRequests = response.data.requests;
          console.log('📊 All requests from API:', allRequests);

          // Log sample request structure for debugging
          if (allRequests.length > 0) {
            console.log('📊 Sample request structure:', {
              request_number: allRequests[0].request_number,
              total_document_fee: allRequests[0].total_document_fee,
              total_fee: allRequests[0].total_fee,
              amount: allRequests[0].amount,
              all_fields: Object.keys(allRequests[0])
            });
          }

          // Filter to only show completed and cancelled requests (historical data)
          const filteredRequests = allRequests.filter(request =>
            ['completed', 'cancelled'].includes(request.status_name.toLowerCase())
          );

          console.log('📊 Filtered requests for PDF:', filteredRequests);
          return filteredRequests;
        }
        return [];
      } catch (error) {
        console.error('Failed to fetch report data:', error);
        throw error;
      }
    },

    // Get date range based on report type and selected values
    getDateRangeForReport() {
      const { reportType, selectedDate, selectedWeek, selectedMonth } = this.pdfExportForm;

      // Declare variables outside switch to avoid ESLint no-case-declarations
      let year, week, month, startDate, endDate;

      switch (reportType) {
        case 'daily':
          return {
            from: selectedDate,
            to: selectedDate
          };

        case 'weekly':
          if (selectedWeek) {
            [year, week] = selectedWeek.split('-W');
            startDate = this.getDateFromWeek(parseInt(year), parseInt(week));
            endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 6);

            return {
              from: startDate.toISOString().split('T')[0],
              to: endDate.toISOString().split('T')[0]
            };
          }
          break;

        case 'monthly':
          if (selectedMonth) {
            [year, month] = selectedMonth.split('-');
            startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
            endDate = new Date(parseInt(year), parseInt(month), 0);

            return {
              from: startDate.toISOString().split('T')[0],
              to: endDate.toISOString().split('T')[0]
            };
          }
          break;
      }

      return { from: '', to: '' };
    },

    // Generate PDF report content
    generatePDFReport(pdf, data) {
      const dateRange = this.getDateRangeForReport();

      // Document Header with improved styling
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(44, 62, 80); // Dark blue-gray
      pdf.text('BARANGAY DOCUMENT REQUEST HISTORY', 105, 25, { align: 'center' });

      // Decorative line under header
      pdf.setDrawColor(52, 152, 219); // Blue line
      pdf.setLineWidth(1);
      pdf.line(20, 30, 190, 30);

      // Report type and metadata section
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      const reportTitle = this.getReportTitle();
      pdf.text(reportTitle, 20, 45);

      // Date range with improved formatting
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      const dateRangeText = this.getDateRangeText(dateRange);
      pdf.text(`Report Period: ${dateRangeText}`, 20, 55);

      // Generated date
      const generatedDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      pdf.text(`Generated: ${generatedDate}`, 20, 65);

      // Summary statistics with improved layout
      const stats = this.calculateReportStats(data);

      // Summary box background
      pdf.setFillColor(248, 249, 250); // Light gray background
      pdf.setDrawColor(206, 212, 218); // Border color
      pdf.roundedRect(20, 75, 170, 35, 3, 3, 'FD'); // Rounded rectangle with fill and border

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(52, 58, 64);
      pdf.text('SUMMARY STATISTICS', 25, 85);

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');

      // Statistics in columns
      pdf.text(`Total Requests: ${stats.total}`, 25, 95);
      pdf.text(`Completed: ${stats.completed}`, 80, 95);
      pdf.text(`Cancelled: ${stats.cancelled}`, 135, 95);

      // Add percentage if there are requests
      if (stats.total > 0) {
        const completionRate = Math.round((stats.completed / stats.total) * 100);
        pdf.text(`Completion Rate: ${completionRate}%`, 25, 105);
      }

      // Generate table with improved design (matching AdminReports.vue styling)
      if (data && data.length > 0) {
        const tableData = data.slice(0, 100).map(request => [
          request.request_number || 'N/A',
          request.client_name || 'N/A',
          request.document_type || 'N/A',
          this.formatStatus(request.status_name) || 'N/A',
          this.formatCurrencyForPDF(this.getAmountForPDF(request)),
          this.formatDateForPDF(request.requested_at) || 'N/A'
        ]);

        // Use autoTable function (v5.x syntax) with AdminReports.vue styling
        try {
          console.log('🔧 Calling autoTable function');
          autoTable(pdf, {
            head: [['Request #', 'Client Name', 'Document Type', 'Status', 'Amount', 'Date']],
            body: tableData,
            startY: 125,
            theme: 'grid',
            headStyles: {
              fillColor: [52, 152, 219],
              textColor: 255,
              fontStyle: 'bold',
              fontSize: 8
            },
            styles: {
              fontSize: 7,
              cellPadding: 3,
              overflow: 'linebreak',
              cellWidth: 'wrap'
            },
            columnStyles: {
              0: { cellWidth: 30, halign: 'center' },         // Request #
              1: { cellWidth: 35, overflow: 'linebreak' },    // Client Name (wrappable)
              2: { cellWidth: 38, overflow: 'linebreak' },    // Document Type (wrappable)
              3: { cellWidth: 22, halign: 'center' },         // Status
              4: { cellWidth: 20, halign: 'right' },          // Amount
              5: { cellWidth: 25, halign: 'center' }          // Date
            }
          });
          console.log('✅ AutoTable completed successfully');
        } catch (autoTableError) {
          console.error('❌ AutoTable call failed:', autoTableError);
          throw new Error(`AutoTable failed: ${autoTableError.message}`);
        }
      }

      // Add professional footer
      this.addPDFFooter(pdf);
    },

    // Fallback method to generate table manually using native jsPDF
    generateManualTable(pdf, data) {
      let yPosition = 125;
      const lineHeight = 14;
      const headerHeight = 12;

      // Improved column positioning and widths - matching autoTable
      const columns = [
        { x: 22, width: 30, align: 'center' },  // Request Number
        { x: 54, width: 35, align: 'left' },    // Client Name
        { x: 91, width: 38, align: 'left' },    // Document Type
        { x: 131, width: 22, align: 'center' }, // Status
        { x: 155, width: 20, align: 'right' },  // Amount (smaller)
        { x: 177, width: 25, align: 'center' }  // Date
      ];

      // Header background first (draw background before text)
      pdf.setFillColor(52, 152, 219); // Professional blue
      pdf.rect(20, yPosition - 10, 170, headerHeight, 'F');

      // Header border on top of background
      pdf.setDrawColor(206, 212, 218);
      pdf.setLineWidth(0.5);
      pdf.rect(20, yPosition - 10, 170, headerHeight, 'D');

      // Header text styling
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(255, 255, 255); // White text

      // Header text positioning - improved to prevent overlap
      const headers = ['Request Number', 'Client Name', 'Document Type', 'Status', 'Amount', 'Date'];
      const headerY = yPosition - 4; // Better vertical positioning

      headers.forEach((header, index) => {
        const col = columns[index];
        let textX;
        let align = 'left';

        if (col.align === 'center') {
          textX = col.x + (col.width / 2);
          align = 'center';
        } else if (col.align === 'right') {
          textX = col.x + col.width - 2;
          align = 'right';
        } else {
          textX = col.x + 2;
          align = 'left';
        }

        pdf.text(header, textX, headerY, { align: align });
      });

      yPosition += 6; // More space after header to prevent overlap

      // Reset text color and font for data rows
      pdf.setTextColor(33, 37, 41); // Dark gray
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8.5); // Slightly smaller but readable

      // Table rows with improved formatting
      data.forEach((request, index) => {
        // Alternate row background
        if (index % 2 === 1) {
          pdf.setFillColor(248, 249, 250); // Very light gray
          pdf.rect(20, yPosition - 8, 170, lineHeight, 'F');
        }

        // Row border
        pdf.setDrawColor(206, 212, 218);
        pdf.rect(20, yPosition - 8, 170, lineHeight, 'D');

        // Row data with proper formatting
        const rowData = [
          request.request_number || 'N/A',
          this.truncateText(request.client_name || 'N/A', 18),
          this.truncateText(request.document_type || 'N/A', 20),
          this.formatStatus(request.status_name) || 'N/A',
          this.formatCurrencyForPDF(this.getAmountForPDF(request)),
          this.formatDateForPDF(request.requested_at) || 'N/A'
        ];

        rowData.forEach((cellData, colIndex) => {
          const col = columns[colIndex];
          const text = String(cellData);

          if (col.align === 'center') {
            pdf.text(text, col.x + (col.width / 2), yPosition, { align: 'center' });
          } else if (col.align === 'right') {
            pdf.text(text, col.x + col.width - 2, yPosition, { align: 'right' });
          } else {
            pdf.text(text, col.x + 2, yPosition);
          }
        });

        yPosition += lineHeight;

        // Add new page if needed
        if (yPosition > 260) {
          pdf.addPage();
          yPosition = 30;

          // Repeat header on new page
          pdf.setFillColor(52, 152, 219);
          pdf.rect(20, yPosition - 10, 170, headerHeight, 'F');
          pdf.setTextColor(255, 255, 255);
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(9);

          headers.forEach((header, index) => {
            const col = columns[index];
            if (col.align === 'center') {
              pdf.text(header, col.x + (col.width / 2), yPosition - 3, { align: 'center' });
            } else if (col.align === 'right') {
              pdf.text(header, col.x + col.width - 2, yPosition - 3, { align: 'right' });
            } else {
              pdf.text(header, col.x + 2, yPosition - 3);
            }
          });

          yPosition += 4;
          pdf.setTextColor(33, 37, 41);
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(8.5);
        }
      });

      // Add footer to manual table as well
      this.addPDFFooter(pdf);
    },

    // Add professional footer to PDF
    addPDFFooter(pdf) {
      const pageCount = pdf.internal.getNumberOfPages();

      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);

        // Footer line
        pdf.setDrawColor(206, 212, 218);
        pdf.setLineWidth(0.5);
        pdf.line(20, 280, 190, 280);

        // Footer text
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(108, 117, 125); // Gray text

        // Left side - Document info
        pdf.text('Barangay Document Management System', 20, 285);
        pdf.text('Official Document Request Report', 20, 290);

        // Right side - Page number
        pdf.text(`Page ${i} of ${pageCount}`, 190, 285, { align: 'right' });
        pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 190, 290, { align: 'right' });
      }
    },

    // Helper method to truncate text for table cells
    truncateText(text, maxLength) {
      if (!text) return '';
      return text.length > maxLength ? text.substring(0, maxLength - 3) + '...' : text;
    },

    // Format date specifically for PDF display (month and day only)
    formatDateForPDF(dateString) {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      // Show only month and day (no year to save space)
      const month = date.toLocaleDateString('en-US', { month: 'short' });
      const day = date.getDate().toString().padStart(2, '0');
      return `${month} ${day}`;
    },

    // Format currency specifically for PDF (compact format, no PHP prefix)
    formatCurrencyForPDF(amount) {
      // Debug logging to trace amount values
      console.log('💰 formatCurrencyForPDF input:', {
        original: amount,
        type: typeof amount,
        parsed: parseFloat(amount),
        isNaN: isNaN(parseFloat(amount))
      });

      const numAmount = parseFloat(amount) || 0;
      const formatter = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      const result = formatter.format(numAmount);

      console.log('💰 formatCurrencyForPDF result:', result);
      return result;
    },

    // Enhanced method to extract amount from request data
    getAmountForPDF(request) {
      // Debug the entire request object structure
      console.log('📊 getAmountForPDF - Full request object:', request);

      // Try multiple possible field names in order of preference
      const possibleAmountFields = [
        'total_document_fee',
        'total_fee',
        'amount',
        'document_fee',
        'fee'
      ];

      let amount = 0;
      let foundField = null;

      for (const field of possibleAmountFields) {
        if (request[field] !== undefined && request[field] !== null) {
          const fieldValue = parseFloat(request[field]);
          if (!isNaN(fieldValue) && fieldValue > 0) {
            amount = fieldValue;
            foundField = field;
            break;
          }
        }
      }

      console.log('💰 getAmountForPDF result:', {
        request_number: request.request_number,
        found_field: foundField,
        amount: amount,
        all_fields: possibleAmountFields.reduce((acc, field) => {
          acc[field] = request[field];
          return acc;
        }, {})
      });

      return amount;
    },

    // Method to disable debug logging for production
    disablePDFDebugLogging() {
      // Override console.log for PDF-related debugging
      const originalLog = console.log;
      console.log = function(...args) {
        if (args.length > 0 && typeof args[0] === 'string' &&
            (args[0].includes('💰') || args[0].includes('📊'))) {
          return; // Skip PDF debug logs
        }
        originalLog.apply(console, args);
      };
    },

    // Helper methods for PDF export
    isPDFExportValid() {
      const { reportType, selectedDate, selectedWeek, selectedMonth } = this.pdfExportForm;

      switch (reportType) {
        case 'daily':
          return selectedDate !== '';
        case 'weekly':
          return selectedWeek !== '';
        case 'monthly':
          return selectedMonth !== '';
        default:
          return false;
      }
    },

    getPDFFilename() {
      const { reportType, selectedDate, selectedWeek, selectedMonth } = this.pdfExportForm;
      const timestamp = new Date().toISOString().split('T')[0];

      switch (reportType) {
        case 'daily':
          return `daily_report_${selectedDate}_${timestamp}.pdf`;
        case 'weekly':
          return `weekly_report_${selectedWeek}_${timestamp}.pdf`;
        case 'monthly':
          return `monthly_report_${selectedMonth}_${timestamp}.pdf`;
        default:
          return `report_${timestamp}.pdf`;
      }
    },

    getReportTitle() {
      const { reportType } = this.pdfExportForm;

      switch (reportType) {
        case 'daily':
          return 'Daily Document Request Report';
        case 'weekly':
          return 'Weekly Document Request Report';
        case 'monthly':
          return 'Monthly Document Request Report';
        default:
          return 'Document Request Report';
      }
    },

    getDateRangeText(dateRange) {
      if (dateRange.from === dateRange.to) {
        return this.formatDate(dateRange.from);
      }
      return `${this.formatDate(dateRange.from)} to ${this.formatDate(dateRange.to)}`;
    },

    calculateReportStats(data) {
      return {
        total: data.length,
        completed: data.filter(r => r.status_name.toLowerCase() === 'completed').length,
        cancelled: data.filter(r => r.status_name.toLowerCase() === 'cancelled').length
      };
    },

    getDateFromWeek(year, week) {
      const simple = new Date(year, 0, 1 + (week - 1) * 7);
      const dow = simple.getDay();
      const ISOweekStart = simple;
      if (dow <= 4) {
        ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
      } else {
        ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
      }
      return ISOweekStart;
    },

    // Date helper methods for form validation
    getCurrentDate() {
      return new Date().toISOString().split('T')[0];
    },

    getCurrentWeek() {
      const now = new Date();
      const year = now.getFullYear();
      const week = this.getWeekNumber(now);
      return `${year}-W${week.toString().padStart(2, '0')}`;
    },

    getCurrentMonth() {
      const now = new Date();
      const year = now.getFullYear();
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      return `${year}-${month}`;
    },

    getWeekNumber(date) {
      const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      const dayNum = d.getUTCDay() || 7;
      d.setUTCDate(d.getUTCDate() + 4 - dayNum);
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
      return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
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
        // This would call a new API endpoint for authorization verification
        // const response = await adminDocumentService.verifyAuthorization(requestId, {
        //   isApproved,
        //   notes: isApproved ? 'Authorization verified and approved' : 'Authorization rejected'
        // });

        // For now, show a placeholder message
        this.showToast(
          'Authorization ' + (isApproved ? 'Approved' : 'Rejected'),
          `Pickup authorization has been ${isApproved ? 'approved' : 'rejected'}`,
          isApproved ? 'success' : 'warning'
        );

        // Refresh the request details
        await this.refreshRequestDetails();

      } catch (error) {
        console.error('Failed to verify authorization:', error);
        this.errorMessage = 'Failed to verify authorization. Please try again.';
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

        // Use authenticated API call to get the document
        const response = await api.get(`/documents/view/${docId}`, {
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

        let filename = '';
        let documentType = '';

        switch (imageType) {
          case 'beneficiary':
            // Handle both list view (beneficiary_verification_image) and detail view (beneficiary.verification_image_path)
            filename = request.beneficiary_verification_image || request.beneficiary?.verification_image_path;
            documentType = 'beneficiary';
            // For beneficiary documents, we need the beneficiary ID, not the request ID
            if (request.beneficiary?.id) {
              requestId = request.beneficiary.id;
            }
            break;
          case 'pickup-id':
            filename = request.pickup_id_image || request.authorized_pickup?.id_image_path;
            documentType = 'pickup-id';
            break;
          case 'pickup-auth':
            filename = request.pickup_authorization_letter || request.authorized_pickup?.authorization_letter_path;
            documentType = 'pickup-auth';
            break;
          default:
            this.showToast('Error', 'Invalid image type', 'error');
            return;
        }

        if (!filename) {
          this.showToast('Error', 'No image available', 'error');
          return;
        }

        // Extract just the filename from the path (handle both forward and back slashes)
        const filenameOnly = filename.split(/[/\\]/).pop();

        // Construct the URL for the verification document service
        // Note: Don't include /api prefix because axios baseURL already includes it
        const imageUrl = `/verification-documents/serve/${documentType}/${requestId}/${filenameOnly}`;

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
        // Import the API service
        const api = (await import('@/services/api.js')).default;

        // Fetch the image with authentication headers
        const response = await api.get(imageUrl, {
          responseType: 'blob'
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
        console.error('Error displaying image:', error);
        this.showToast('Error', 'Failed to load image', 'error');
      }
    },

    // View pickup documents in modal
    async viewPickupDocuments(request) {
      try {
        // Set the selected request and show the modal
        this.selectedRequestForPickup = request;

        // Show modal
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
          `/api/verification-documents/serve/beneficiary/${request.id}/${request.beneficiary_verification_image.split('/').pop()}` :
          null,
        current_status: request.beneficiary_verification_status
      };

      this.verificationForm = {
        status: request.beneficiary_verification_status || 'pending',
        notes: ''
      };

      // Show the modal
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
@import './css/requestHistory.css';

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

/* Cancelled Documents Styling */
.cancelled-request {
  opacity: 0.75;
  position: relative;
}

.cancelled-request::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 10px,
    rgba(220, 53, 69, 0.1) 10px,
    rgba(220, 53, 69, 0.1) 20px
  );
  pointer-events: none;
  border-radius: 8px;
  z-index: 1;
}

.cancelled-request .request-card {
  border: 2px solid #dc3545;
  background-color: #f8f9fa;
}

.cancelled-request .request-card-header {
  background-color: #f5c6cb;
  border-bottom: 1px solid #dc3545;
}

.cancelled-request .client-info h6,
.cancelled-request .document-type span {
  text-decoration: line-through;
  color: #6c757d !important;
}

.cancelled-request .meta-item span {
  color: #6c757d !important;
}

/* Cancelled indicator styling */
.cancelled-indicator .badge {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
  100% {
    opacity: 1;
  }
}

/* Compact table cancelled styling */
.compact-row.cancelled-request {
  background-color: #f8f9fa;
  border-left: 4px solid #dc3545;
  opacity: 0.8;
}

.compact-row.cancelled-request .request-id-content,
.compact-row.cancelled-request .client-name,
.compact-row.cancelled-request .document-type {
  text-decoration: line-through;
  color: #6c757d !important;
}
</style>