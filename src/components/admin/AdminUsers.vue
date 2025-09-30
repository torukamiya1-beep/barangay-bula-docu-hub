<template>
  <div class="admin-users">
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
          <!-- <div class="row mb-4">
            <div class="col-12">
              <div class="d-flex justify-content-between align-items-center flex-wrap">

                <div class="d-flex gap-2">
                  <button class="btn btn-outline-success btn-sm" @click="loadUsers" :disabled="loading">
                    <i class="fas fa-sync-alt me-1" :class="{ 'fa-spin': loading }"></i>
                    Refresh
                  </button>
                  <button class="btn btn-success btn-sm" @click="showAddUserModal">
                    <i class="fas fa-user-plus me-1"></i>
                    Add User
                  </button>
                </div>
              </div>
            </div>
          </div> -->

          <!-- I dont need this statistics for now so I comment it -->
          <!-- User Statistics -->
          <!-- <div class="row mb-4">
            <div class="col-md-3 mb-3">
              <div class="card border-left-primary shadow h-100 py-2">
                <div class="card-body">
                  <div class="row no-gutters align-items-center">
                    <div class="col mr-2">
                      <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">
                        Total Users
                      </div>
                      <div class="h5 mb-0 font-weight-bold text-gray-800">{{ userStats.total || 0 }}</div>
                    </div>
                    <div class="col-auto">
                      <i class="fas fa-users fa-2x text-gray-300"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-md-3 mb-3">
              <div class="card border-left-success shadow h-100 py-2">
                <div class="card-body">
                  <div class="row no-gutters align-items-center">
                    <div class="col mr-2">
                      <div class="text-xs font-weight-bold text-success text-uppercase mb-1">
                        Active Users
                      </div>
                      <div class="h5 mb-0 font-weight-bold text-gray-800">{{ userStats.active || 0 }}</div>
                    </div>
                    <div class="col-auto">
                      <i class="fas fa-user-check fa-2x text-gray-300"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-md-3 mb-3">
              <div class="card border-left-warning shadow h-100 py-2">
                <div class="card-body">
                  <div class="row no-gutters align-items-center">
                    <div class="col mr-2">
                      <div class="text-xs font-weight-bold text-warning text-uppercase mb-1">
                        Pending Verification
                      </div>
                      <div class="h5 mb-0 font-weight-bold text-gray-800">{{ userStats.pending || 0 }}</div>
                    </div>
                    <div class="col-auto">
                      <i class="fas fa-user-clock fa-2x text-gray-300"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-md-3 mb-3">
              <div class="card border-left-info shadow h-100 py-2">
                <div class="card-body">
                  <div class="row no-gutters align-items-center">
                    <div class="col mr-2">
                      <div class="text-xs font-weight-bold text-info text-uppercase mb-1">
                        Admin Users
                      </div>
                      <div class="h5 mb-0 font-weight-bold text-gray-800">{{ userStats.admins || 0 }}</div>
                    </div>
                    <div class="col-auto">
                      <i class="fas fa-user-shield fa-2x text-gray-300"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div> -->

          <!-- Users Table -->
          <div class="row">
            <div class="col-12">
              <!-- Navigation Tabs -->
              <div class="card shadow mb-3">
                <div class="card-body py-2">
                  <ul class="nav nav-pills nav-fill" role="tablist">
                    <li class="nav-item" role="presentation">
                      <button
                        class="nav-link"
                        :class="{ active: activeTab === 'clients' }"
                        @click="setActiveTab('clients')"
                        type="button"
                        role="tab"
                      >
                        <i class="fas fa-users me-2"></i>
                        Client
                        <span v-if="clientStats.total > 0" class="badge bg-light text-dark ms-2">{{ clientStats.total }}</span>
                      </button>
                    </li>
                    <li class="nav-item" role="presentation">
                      <button
                        class="nav-link"
                        :class="{ active: activeTab === 'admins' }"
                        @click="setActiveTab('admins')"
                        type="button"
                        role="tab"
                      >
                        <i class="fas fa-user-shield me-2"></i>
                        Admin
                        <span v-if="adminStats.total > 0" class="badge bg-light text-dark ms-2">{{ adminStats.total }}</span>
                      </button>
                    </li>
                  </ul>
                </div>
              </div>

              <div class="card shadow">
                <div class="card-header py-3 d-flex justify-content-between align-items-center">
                  <!-- <h6 class="m-0 font-weight-bold text-primary">
                    <i class="fas fa-users me-2"></i>
                    {{ activeTab === 'clients' ? 'Client Management' : 'Admin Management' }}
                  </h6> -->
                  <div class="d-flex gap-2">
                    <button class="btn btn-outline-success btn-sm" @click="loadUsers" :disabled="loading">
                      <i class="fas fa-sync-alt me-1" :class="{ 'fa-spin': loading }"></i>
                      Refresh
                    </button>
                    <button v-if="activeTab === 'admins'" class="btn btn-success btn-sm" @click="showAddUserModal">
                      <i class="fas fa-user-plus me-1"></i>
                      Add Admin
                    </button>

                    <!-- ill comment this status because I dont use this -->
                    <!-- <select class="form-select form-select-sm" v-model="filterStatus">
                      <option value="">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="pending">Pending</option>
                      <option value="suspended">Suspended</option>
                      <option v-if="activeTab === 'clients'" value="pending_residency_verification">Pending Residency Verification</option>
                      <option v-if="activeTab === 'clients'" value="residency_rejected">Residency Rejected</option>
                    </select> -->
                  </div>
                </div>
                <div class="card-body">
                  <!-- Search Bar -->
                  <div class="row mb-3">
                    <div class="col-md-6">
                      <div class="input-group">
                        <span class="input-group-text">
                          <i class="fas fa-search"></i>
                        </span>
                        <input
                          type="text"
                          class="form-control"
                          placeholder="Search users by name, email, or username..."
                          v-model="searchQuery"
                        >
                      </div>
                    </div>
                    <div class="col-md-6 text-end">
                      <span class="text-muted">
                        Showing {{ filteredUsers.length }} of {{ users.length }} users
                      </span>
                    </div>
                  </div>

                  <!-- Loading State -->
                  <div v-if="loading" class="text-center py-4">
                    <div class="spinner-border text-primary" role="status">
                      <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="text-muted mt-2">Loading users...</p>
                  </div>

                  <!-- Empty State -->
                  <div v-else-if="filteredUsers.length === 0" class="text-center py-5">
                    <i class="fas fa-users fa-3x text-gray-300 mb-3"></i>
                    <h5 class="text-gray-600">No users found</h5>
                    <p class="text-muted">
                      {{ searchQuery ? 'Try adjusting your search criteria.' : 'No users have been registered yet.' }}
                    </p>
                  </div>

                  <!-- Users Table -->
                  <div v-else class="table-responsive">
                    <table class="table table-hover">
                      <thead class="table-light">
                        <tr>
                          <th>User</th>
                          <th>Email</th>
                          <th>Type</th>
                          <th>Status</th>
                          <th>Registered</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="user in paginatedUsers" :key="user.id">
                          <td>
                            <div class="d-flex align-items-center">
                              <div class="user-avatar me-3">
                                <img v-if="user.profile_picture" :src="user.profile_picture" :alt="user.full_name" class="rounded-circle">
                                <div v-else class="avatar-placeholder rounded-circle">
                                  {{ getInitials(user.full_name) }}
                                </div>
                              </div>
                              <div>
                                <div class="fw-bold">{{ user.full_name }}</div>
                                <div class="text-muted small">@{{ user.username }}</div>
                              </div>
                            </div>
                          </td>
                          <td>{{ user.email }}</td>
                          <td>
                            <span class="badge" :class="user.type === 'admin' ? 'bg-primary' : 'bg-info'">
                              {{ user.type === 'admin' ? 'Admin' : 'Client' }}
                            </span>
                          </td>
                          <td>
                            <span class="badge" :class="getStatusBadgeClass(getDisplayStatus(user))">
                              {{ formatStatus(getDisplayStatus(user)) }}
                            </span>
                          </td>
                          <td>{{ formatDate(user.created_at) }}</td>
                          <td>
                            <div class="btn-group btn-group-sm">
                              <button class="btn btn-outline-primary" @click="viewUser(user)" title="View Details">
                                <i class="fas fa-eye"></i>
                              </button>
                              <!-- Residency Documents Button (only for clients with residency documents that need review) -->
                              <button
                                v-if="user.type === 'client' && hasResidencyDocumentsNeedingReview(user)"
                                class="btn btn-outline-info"
                                @click="viewResidencyDocuments(user)"
                                title="Review Residency Documents"
                              >
                                <i class="fas fa-file-image"></i>
                              </button>
                              <!-- I will comment the quick approve and quick reject button and uncomment this in future -->
                              <!-- Quick Approve Button (only for pending residency verification) -->
                              <!-- <button
                                v-if="user.type === 'client' && canApproveResidency(user)"
                                class="btn btn-outline-success"
                                @click="quickApproveClient(user)"
                                title="Quick Approve Residency Verification"
                                :disabled="processingQuickAction"
                              >
                                <i class="fas fa-check"></i>
                              </button> -->
                              <!-- Quick Reject Button (only for pending residency verification) -->
                              <!-- <button
                                v-if="user.type === 'client' && canRejectResidency(user)"
                                class="btn btn-outline-danger"
                                @click="quickRejectClient(user)"
                                title="Quick Reject Residency Verification"
                                :disabled="processingQuickAction"
                              >
                                <i class="fas fa-times"></i>
                              </button> -->
                              <button class="btn btn-outline-warning" @click="editUser(user)" title="Edit User">
                                <i class="fas fa-edit"></i>
                              </button>
                              <!-- ill comment this for now and uncomment in the future -->
                              <!-- <button
                                class="btn"
                                :class="user.status === 'active' ? 'btn-outline-warning' : 'btn-outline-success'"
                                @click="toggleUserStatus(user)"
                                :title="user.status === 'active' ? 'Suspend User' : 'Activate User'"
                              >
                                <i :class="user.status === 'active' ? 'fas fa-pause' : 'fas fa-play'"></i>
                              </button> -->
                              <button class="btn btn-outline-danger" @click="deleteUser(user)" title="Delete User">
                                <i class="fas fa-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <!-- Pagination -->
                  <div v-if="totalPages > 1" class="d-flex justify-content-between align-items-center mt-3">
                    <div class="text-muted">
                      Page {{ currentPage }} of {{ totalPages }}
                    </div>
                    <nav>
                      <ul class="pagination pagination-sm mb-0">
                        <li class="page-item" :class="{ disabled: currentPage === 1 }">
                          <button class="page-link" @click="changePage(currentPage - 1)" :disabled="currentPage === 1">
                            Previous
                          </button>
                        </li>
                        <li
                          v-for="page in visiblePages"
                          :key="page"
                          class="page-item"
                          :class="{ active: page === currentPage }"
                        >
                          <button class="page-link" @click="changePage(page)">{{ page }}</button>
                        </li>
                        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                          <button class="page-link" @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages">
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



    <!-- Add User Modal -->
    <div class="modal fade" id="addUserModal" tabindex="-1" aria-labelledby="addUserModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="addUserModalLabel">
              <i class="fas fa-user-plus me-2"></i>
              Add New User
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="submitAddUser">
              <!-- Basic Information -->
              <div class="row">
                <div class="col-md-12 mb-3">
                  <label for="addUsername" class="form-label">Username *</label>
                  <input
                    type="text"
                    class="form-control"
                    id="addUsername"
                    v-model="addUserForm.username"
                    :class="{ 'is-invalid': formErrors.username }"
                    required
                  >
                  <div v-if="formErrors.username" class="invalid-feedback">
                    {{ formErrors.username }}
                  </div>
                </div>
              </div>

              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="addPassword" class="form-label">Password *</label>
                  <input
                    type="password"
                    class="form-control"
                    id="addPassword"
                    v-model="addUserForm.password"
                    :class="{ 'is-invalid': formErrors.password }"
                    required
                    minlength="6"
                  >
                  <div v-if="formErrors.password" class="invalid-feedback">
                    {{ formErrors.password }}
                  </div>
                </div>
                <div class="col-md-6 mb-3">
                  <label for="addConfirmPassword" class="form-label">Confirm Password *</label>
                  <input
                    type="password"
                    class="form-control"
                    id="addConfirmPassword"
                    v-model="addUserForm.confirmPassword"
                    :class="{ 'is-invalid': formErrors.confirmPassword }"
                    required
                    minlength="6"
                  >
                  <div v-if="formErrors.confirmPassword" class="invalid-feedback">
                    {{ formErrors.confirmPassword }}
                  </div>
                </div>
              </div>

              <!-- Personal Information -->
              <div class="row">
                <div class="col-md-4 mb-3">
                  <label for="addFirstName" class="form-label">First Name *</label>
                  <input
                    type="text"
                    class="form-control"
                    id="addFirstName"
                    v-model="addUserForm.first_name"
                    :class="{ 'is-invalid': formErrors.first_name }"
                    required
                  >
                  <div v-if="formErrors.first_name" class="invalid-feedback">
                    {{ formErrors.first_name }}
                  </div>
                </div>
                <div class="col-md-4 mb-3">
                  <label for="addMiddleName" class="form-label">Middle Name</label>
                  <input
                    type="text"
                    class="form-control"
                    id="addMiddleName"
                    v-model="addUserForm.middle_name"
                  >
                </div>
                <div class="col-md-4 mb-3">
                  <label for="addLastName" class="form-label">Last Name *</label>
                  <input
                    type="text"
                    class="form-control"
                    id="addLastName"
                    v-model="addUserForm.last_name"
                    :class="{ 'is-invalid': formErrors.last_name }"
                    required
                  >
                  <div v-if="formErrors.last_name" class="invalid-feedback">
                    {{ formErrors.last_name }}
                  </div>
                </div>
              </div>

              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="addSuffix" class="form-label">Suffix</label>
                  <input
                    type="text"
                    class="form-control"
                    id="addSuffix"
                    v-model="addUserForm.suffix"
                    placeholder="Jr, Sr, III, etc."
                  >
                </div>
                <div class="col-md-6 mb-3" v-if="!isCreatingAdminUser">
                  <label for="addRole" class="form-label">User Type *</label>
                  <select
                    class="form-select"
                    id="addRole"
                    v-model="addUserForm.role"
                    :class="{ 'is-invalid': formErrors.role }"
                    required
                    @change="clearRoleSpecificFields"
                  >
                    <option value="">Select User Type</option>
                    <option value="admin">Administrator</option>
                    <option value="client">Client</option>
                  </select>
                  <div v-if="formErrors.role" class="invalid-feedback">
                    {{ formErrors.role }}
                  </div>
                </div>
                <!-- Hidden field for admin user creation -->
                <div class="col-md-6 mb-3" v-if="isCreatingAdminUser">
                  <label class="form-label">User Type *</label>
                  <input
                    type="text"
                    class="form-control"
                    value="Administrator"
                    readonly
                    disabled
                  >
                  <small class="text-muted">Creating administrator account</small>
                </div>
              </div>

              <!-- Contact Information -->
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="addEmail" class="form-label">Email</label>
                  <input
                    type="email"
                    class="form-control"
                    id="addEmail"
                    v-model="addUserForm.email"
                    :class="{ 'is-invalid': formErrors.email }"
                  >
                  <div v-if="formErrors.email" class="invalid-feedback">
                    {{ formErrors.email }}
                  </div>
                </div>
                <div class="col-md-6 mb-3">
                  <label for="addPhone" class="form-label">Phone Number *</label>
                  <input
                    type="tel"
                    class="form-control"
                    id="addPhone"
                    v-model="addUserForm.phone_number"
                    :class="{ 'is-invalid': formErrors.phone_number }"
                    @input="handlePhoneInput($event, 'add')"
                    placeholder="09123456789"
                    maxlength="11"
                    pattern="[0-9]*"
                    required
                  >
                  <div v-if="formErrors.phone_number" class="invalid-feedback">
                    {{ formErrors.phone_number }}
                  </div>
                </div>
              </div>

              <!-- Admin-specific fields -->
              <div v-if="addUserForm.role === 'admin'">
                <hr>
                <h6 class="text-primary mb-3">
                  <i class="fas fa-user-shield me-2"></i>
                  Administrator Information
                </h6>
                <div class="alert alert-info">
                  <i class="fas fa-info-circle me-2"></i>
                  Administrator accounts will be created with basic information. Additional details can be updated later.
                </div>
              </div>

              <!-- Client-specific fields -->
              <div v-if="addUserForm.role === 'client'">
                <hr>
                <h6 class="text-info mb-3">
                  <i class="fas fa-user me-2"></i>
                  Client Information
                </h6>
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="addBirthDate" class="form-label">Birth Date *</label>
                    <input
                      type="date"
                      class="form-control"
                      id="addBirthDate"
                      v-model="addUserForm.birth_date"
                      :class="{ 'is-invalid': formErrors.birth_date }"
                      required
                    >
                    <div v-if="formErrors.birth_date" class="invalid-feedback">
                      {{ formErrors.birth_date }}
                    </div>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="addGender" class="form-label">Gender *</label>
                    <select
                      class="form-select"
                      id="addGender"
                      v-model="addUserForm.gender"
                      :class="{ 'is-invalid': formErrors.gender }"
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                    <div v-if="formErrors.gender" class="invalid-feedback">
                      {{ formErrors.gender }}
                    </div>
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="addCivilStatus" class="form-label">Civil Status *</label>
                    <select
                      class="form-select"
                      id="addCivilStatus"
                      v-model="addUserForm.civil_status_id"
                      required
                    >
                      <option value="1">Single</option>
                      <option value="2">Married</option>
                      <option value="3">Widowed</option>
                      <option value="4">Divorced</option>
                      <option value="5">Separated</option>
                    </select>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="addNationality" class="form-label">Nationality</label>
                    <input
                      type="text"
                      class="form-control"
                      id="addNationality"
                      v-model="addUserForm.nationality"
                      placeholder="Filipino"
                    >
                  </div>
                </div>

                <!-- Address Information -->
                <h6 class="text-secondary mb-3 mt-4">
                  <i class="fas fa-map-marker-alt me-2"></i>
                  Address Information
                </h6>
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="addHouseNumber" class="form-label">House Number</label>
                    <input
                      type="text"
                      class="form-control"
                      id="addHouseNumber"
                      v-model="addUserForm.house_number"
                      placeholder="e.g., 123"
                    >
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="addStreet" class="form-label">Street</label>
                    <input
                      type="text"
                      class="form-control"
                      id="addStreet"
                      v-model="addUserForm.street"
                      placeholder="e.g., Main Street"
                    >
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="addSubdivision" class="form-label">Subdivision</label>
                    <input
                      type="text"
                      class="form-control"
                      id="addSubdivision"
                      v-model="addUserForm.subdivision"
                      placeholder="e.g., Greenfield Village"
                    >
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="addBarangay" class="form-label">Barangay *</label>
                    <input
                      type="text"
                      class="form-control"
                      id="addBarangay"
                      v-model="addUserForm.barangay"
                      :class="{ 'is-invalid': formErrors.barangay }"
                      required
                      placeholder="e.g., Barangay Bula"
                    >
                    <div v-if="formErrors.barangay" class="invalid-feedback">
                      {{ formErrors.barangay }}
                    </div>
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-4 mb-3">
                    <label for="addCity" class="form-label">City/Municipality *</label>
                    <input
                      type="text"
                      class="form-control"
                      id="addCity"
                      v-model="addUserForm.city_municipality"
                      :class="{ 'is-invalid': formErrors.city_municipality }"
                      required
                      placeholder="e.g., Camarines Sur"
                    >
                    <div v-if="formErrors.city_municipality" class="invalid-feedback">
                      {{ formErrors.city_municipality }}
                    </div>
                  </div>
                  <div class="col-md-4 mb-3">
                    <label for="addProvince" class="form-label">Province *</label>
                    <input
                      type="text"
                      class="form-control"
                      id="addProvince"
                      v-model="addUserForm.province"
                      :class="{ 'is-invalid': formErrors.province }"
                      required
                      placeholder="e.g., Camarines Sur"
                    >
                    <div v-if="formErrors.province" class="invalid-feedback">
                      {{ formErrors.province }}
                    </div>
                  </div>
                  <div class="col-md-4 mb-3">
                    <label for="addPostalCode" class="form-label">Postal Code</label>
                    <input
                      type="text"
                      class="form-control"
                      id="addPostalCode"
                      v-model="addUserForm.postal_code"
                      placeholder="e.g., 4422"
                    >
                  </div>
                </div>

                <!-- Residency Information -->
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="addYearsResidency" class="form-label">Years of Residency</label>
                    <input
                      type="number"
                      class="form-control"
                      id="addYearsResidency"
                      v-model="addUserForm.years_of_residency"
                      min="0"
                      placeholder="e.g., 5"
                    >
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="addMonthsResidency" class="form-label">Additional Months</label>
                    <input
                      type="number"
                      class="form-control"
                      id="addMonthsResidency"
                      v-model="addUserForm.months_of_residency"
                      min="0"
                      max="11"
                      placeholder="e.g., 6"
                    >
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" @click="submitAddUser" :disabled="addUserLoading">
              <span v-if="addUserLoading" class="spinner-border spinner-border-sm me-2" role="status"></span>
              <i v-else class="fas fa-plus me-2"></i>
              {{ addUserLoading ? 'Creating...' : 'Create User' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit User Modal -->
    <div class="modal fade" id="editUserModal" tabindex="-1" aria-labelledby="editUserModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="editUserModalLabel">
              <i class="fas fa-user-edit me-2"></i>
              Edit User
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="submitEditUser" v-if="editUserForm.id">
              <!-- Basic Information -->
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="editUsername" class="form-label">Username *</label>
                  <input
                    type="text"
                    class="form-control"
                    id="editUsername"
                    v-model="editUserForm.username"
                    :class="{ 'is-invalid': editFormErrors.username }"
                    required
                  >
                  <div v-if="editFormErrors.username" class="invalid-feedback">
                    {{ editFormErrors.username }}
                  </div>
                </div>
                <div class="col-md-6 mb-3">
                  <label for="editStatus" class="form-label">Account Status *</label>
                  <select
                    class="form-select"
                    id="editStatus"
                    v-model="editUserForm.status"
                    :class="{ 'is-invalid': editFormErrors.status }"
                    required
                  >
                    <!-- Account status options only - residency verification is managed separately -->
                    <option value="active">Active</option>
                    <!-- I comment the inactive because I prefer to use suspended for deactivation of account of clients -->
                    <!-- <option value="inactive">Inactive</option> -->
                    <option value="suspended">Suspended</option>
                  </select>
                  <div v-if="editFormErrors.status" class="invalid-feedback">
                    {{ editFormErrors.status }}
                  </div>

                </div>
              </div>

              <!-- Personal Information -->
              <div class="row">
                <div class="col-md-4 mb-3">
                  <label for="editFirstName" class="form-label">First Name *</label>
                  <input
                    type="text"
                    class="form-control"
                    id="editFirstName"
                    v-model="editUserForm.first_name"
                    :class="{ 'is-invalid': editFormErrors.first_name }"
                    required
                  >
                  <div v-if="editFormErrors.first_name" class="invalid-feedback">
                    {{ editFormErrors.first_name }}
                  </div>
                </div>
                <div class="col-md-4 mb-3">
                  <label for="editMiddleName" class="form-label">Middle Name</label>
                  <input
                    type="text"
                    class="form-control"
                    id="editMiddleName"
                    v-model="editUserForm.middle_name"
                  >
                </div>
                <div class="col-md-4 mb-3">
                  <label for="editLastName" class="form-label">Last Name *</label>
                  <input
                    type="text"
                    class="form-control"
                    id="editLastName"
                    v-model="editUserForm.last_name"
                    :class="{ 'is-invalid': editFormErrors.last_name }"
                    required
                  >
                  <div v-if="editFormErrors.last_name" class="invalid-feedback">
                    {{ editFormErrors.last_name }}
                  </div>
                </div>
              </div>

              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="editSuffix" class="form-label">Suffix</label>
                  <input
                    type="text"
                    class="form-control"
                    id="editSuffix"
                    v-model="editUserForm.suffix"
                    placeholder="Jr, Sr, III, etc."
                  >
                </div>
                <div class="col-md-6 mb-3">
                  <label for="editRole" class="form-label">User Type *</label>
                  <select
                    class="form-select"
                    id="editRole"
                    v-model="editUserForm.role"
                    :class="{ 'is-invalid': editFormErrors.role }"
                    required
                    disabled
                  >
                    <option value="admin">Administrator</option>
                    <option value="client">Client</option>
                  </select>
                  <small class="text-muted">User type cannot be changed after creation</small>
                  <div v-if="editFormErrors.role" class="invalid-feedback">
                    {{ editFormErrors.role }}
                  </div>
                </div>
              </div>

              <!-- Contact Information -->
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="editEmail" class="form-label">Email</label>
                  <input
                    type="email"
                    class="form-control"
                    id="editEmail"
                    v-model="editUserForm.email"
                    :class="{ 'is-invalid': editFormErrors.email }"
                  >
                  <div v-if="editFormErrors.email" class="invalid-feedback">
                    {{ editFormErrors.email }}
                  </div>
                </div>
                <div class="col-md-6 mb-3">
                  <label for="editPhone" class="form-label">Phone Number *</label>
                  <input
                    type="tel"
                    class="form-control"
                    id="editPhone"
                    v-model="editUserForm.phone_number"
                    :class="{ 'is-invalid': editFormErrors.phone_number }"
                    @input="handlePhoneInput($event, 'edit')"
                    placeholder="09123456789"
                    maxlength="11"
                    pattern="[0-9]*"
                    required
                  >
                  <div v-if="editFormErrors.phone_number" class="invalid-feedback">
                    {{ editFormErrors.phone_number }}
                  </div>
                </div>
              </div>

              <!-- Admin-specific fields -->
              <div v-if="editUserForm.role === 'admin'">
                <hr>
                <h6 class="text-primary mb-3">
                  <i class="fas fa-user-shield me-2"></i>
                  Administrator Information
                </h6>
                <div class="alert alert-info">
                  <i class="fas fa-info-circle me-2"></i>
                  Administrator-specific information has been simplified. Only basic profile information is managed here.
                </div>
              </div>

              <!-- Client-specific fields (read-only for editing) -->
              <div v-if="editUserForm.role === 'client'">
                <hr>
                <h6 class="text-info mb-3">
                  <i class="fas fa-user me-2"></i>
                  Client Information
                </h6>
                <div class="alert alert-info">
                  <i class="fas fa-info-circle me-2"></i>
                  Client-specific information can only be updated by the client through their profile.
                </div>
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Birth Date</label>
                    <input
                      type="date"
                      class="form-control"
                      v-model="editUserForm.birth_date"
                      readonly
                    >
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Gender</label>
                    <input
                      type="text"
                      class="form-control"
                      :value="editUserForm.gender ? editUserForm.gender.charAt(0).toUpperCase() + editUserForm.gender.slice(1) : ''"
                      readonly
                    >
                  </div>
                </div>
                <div class="row">
                  <div class="col-md-12 mb-3">
                    <label class="form-label">Address</label>
                    <input
                      type="text"
                      class="form-control"
                      :value="getFullAddress(editUserForm)"
                      readonly
                    >
                  </div>
                </div>
              </div>

              <!-- Password Reset Section -->
              <hr>
              <div class="row">
                <div class="col-12 mb-3">
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      id="resetPassword"
                      v-model="editUserForm.resetPassword"
                    >
                    <label class="form-check-label" for="resetPassword">
                      Reset user password
                    </label>
                  </div>
                </div>
              </div>

              <div v-if="editUserForm.resetPassword" class="row">
                <div class="col-md-6 mb-3">
                  <label for="editNewPassword" class="form-label">New Password *</label>
                  <input
                    type="password"
                    class="form-control"
                    id="editNewPassword"
                    v-model="editUserForm.newPassword"
                    :class="{ 'is-invalid': editFormErrors.newPassword }"
                    minlength="6"
                  >
                  <div v-if="editFormErrors.newPassword" class="invalid-feedback">
                    {{ editFormErrors.newPassword }}
                  </div>
                </div>
                <div class="col-md-6 mb-3">
                  <label for="editConfirmPassword" class="form-label">Confirm Password *</label>
                  <input
                    type="password"
                    class="form-control"
                    id="editConfirmPassword"
                    v-model="editUserForm.confirmPassword"
                    :class="{ 'is-invalid': editFormErrors.confirmPassword }"
                    minlength="6"
                  >
                  <div v-if="editFormErrors.confirmPassword" class="invalid-feedback">
                    {{ editFormErrors.confirmPassword }}
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" @click="submitEditUser" :disabled="editUserLoading">
              <span v-if="editUserLoading" class="spinner-border spinner-border-sm me-2" role="status"></span>
              <i v-else class="fas fa-save me-2"></i>
              {{ editUserLoading ? 'Updating...' : 'Update User' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- View User Modal -->
    <div class="modal fade" id="viewUserModal" tabindex="-1" aria-labelledby="viewUserModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="viewUserModalLabel">
              <i class="fas fa-user me-2"></i>
              User Details
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body" v-if="viewUserData">
            <div class="row">
              <div class="col-md-4 text-center mb-4">
                <div class="user-avatar-large mx-auto mb-3">
                  <div v-if="viewUserData.profile_picture" class="avatar-image">
                    <img :src="viewUserData.profile_picture" :alt="viewUserData.full_name" class="rounded-circle" style="width: 80px; height: 80px; object-fit: cover;">
                  </div>
                  <div v-else class="avatar-placeholder-large rounded-circle bg-light d-flex align-items-center justify-content-center mx-auto" style="width: 80px; height: 80px;">
                    <i :class="viewUserData.type === 'admin' ? 'fas fa-user-shield fa-2x text-primary' : 'fas fa-user fa-2x text-info'"></i>
                  </div>
                </div>
                <h5>{{ viewUserData.full_name || 'No Name' }}</h5>
                <span class="badge" :class="getStatusBadgeClass(viewUserData.status)">
                  <i class="fas fa-circle me-1" style="font-size: 0.6em;"></i>
                  {{ formatStatus(viewUserData.status) }}
                </span>
                <div class="mt-2">
                  <span class="badge" :class="viewUserData.type === 'admin' ? 'bg-primary' : 'bg-info'">
                    <i :class="viewUserData.type === 'admin' ? 'fas fa-user-shield me-1' : 'fas fa-user me-1'"></i>
                    {{ viewUserData.type === 'admin' ? 'Administrator' : 'Client' }}
                  </span>
                </div>
              </div>
              <div class="col-md-8">
                <!-- Basic Information -->
                <h6 class="text-primary mb-3">
                  <i class="fas fa-id-card me-2"></i>
                  Basic Information
                </h6>
                <table class="table table-sm table-borderless">
                  <tr>
                    <td class="text-muted" style="width: 30%;"><strong><i class="fas fa-at me-1"></i>Username:</strong></td>
                    <td>{{ viewUserData.username }}</td>
                  </tr>
                  <tr>
                    <td class="text-muted"><strong><i class="fas fa-envelope me-1"></i>Email:</strong></td>
                    <td>{{ viewUserData.email || 'Not provided' }}</td>
                  </tr>
                  <tr>
                    <td class="text-muted"><strong><i class="fas fa-phone me-1"></i>Phone:</strong></td>
                    <td>{{ viewUserData.phone_number || 'Not provided' }}</td>
                  </tr>
                  <tr>
                    <td class="text-muted"><strong><i class="fas fa-info-circle me-1"></i>Status:</strong></td>
                    <td>
                      <span class="badge" :class="getStatusBadgeClass(viewUserData.status)">
                        <i class="fas fa-circle me-1" style="font-size: 0.6em;"></i>
                        {{ formatStatus(viewUserData.status) }}
                      </span>
                    </td>
                  </tr>
                </table>

                <!-- Admin-specific Information -->
                <div v-if="viewUserData.type === 'admin'">
                  <h6 class="text-primary mb-3">
                    <i class="fas fa-user-shield me-2"></i>
                    Administrator Details
                  </h6>
                  <div class="alert alert-info">
                    <i class="fas fa-info-circle me-2"></i>
                    Administrator accounts use simplified profile management. Additional administrative details can be managed through dedicated admin settings.
                  </div>
                  <div class="row mb-2">
                    <div class="col-sm-4"><strong>Account Type:</strong></div>
                    <div class="col-sm-8">
                      <span class="badge bg-primary">
                        <i class="fas fa-user-shield me-1"></i>
                        Administrator
                      </span>
                    </div>
                  </div>
                  <div class="row mb-3">
                    <div class="col-sm-4"><strong>Permissions:</strong></div>
                    <div class="col-sm-8">Full system access and user management</div>
                  </div>
                </div>

                <!-- Client-specific Information -->
                <div v-if="viewUserData.type === 'client'">
                  <h6 class="text-info mb-3">
                    <i class="fas fa-user me-2"></i>
                    Client Details
                  </h6>
                  <table class="table table-sm table-borderless">
                    <tr>
                      <td class="text-muted" style="width: 30%;"><strong><i class="fas fa-birthday-cake me-1"></i>Birth Date:</strong></td>
                      <td>{{ viewUserData.birth_date ? formatDate(viewUserData.birth_date) : 'Not provided' }}</td>
                    </tr>
                    <tr>
                      <td class="text-muted"><strong><i class="fas fa-venus-mars me-1"></i>Gender:</strong></td>
                      <td>{{ viewUserData.gender ? viewUserData.gender.charAt(0).toUpperCase() + viewUserData.gender.slice(1) : 'Not specified' }}</td>
                    </tr>
                    <tr>
                      <td class="text-muted"><strong><i class="fas fa-flag me-1"></i>Nationality:</strong></td>
                      <td>{{ viewUserData.nationality || 'Not specified' }}</td>
                    </tr>
                    <tr>
                      <td class="text-muted"><strong><i class="fas fa-map-marker-alt me-1"></i>Address:</strong></td>
                      <td>{{ getFullAddress(viewUserData) }}</td>
                    </tr>
                    <tr v-if="viewUserData.years_of_residency || viewUserData.months_of_residency">
                      <td class="text-muted"><strong><i class="fas fa-home me-1"></i>Residency:</strong></td>
                      <td>
                        <span class="badge bg-light text-dark">
                          {{ viewUserData.years_of_residency || 0 }} years, {{ viewUserData.months_of_residency || 0 }} months
                        </span>
                      </td>
                    </tr>
                  </table>
                </div>

                <!-- Account Information -->
                <h6 class="text-secondary mb-3 mt-4">
                  <i class="fas fa-clock me-2"></i>
                  Account Information
                </h6>
                <table class="table table-sm table-borderless">
                  <tr>
                    <td class="text-muted" style="width: 30%;"><strong><i class="fas fa-calendar-plus me-1"></i>Registered:</strong></td>
                    <td>{{ formatDate(viewUserData.created_at) }}</td>
                  </tr>
                  <tr>
                    <td class="text-muted"><strong><i class="fas fa-edit me-1"></i>Last Updated:</strong></td>
                    <td>{{ viewUserData.updated_at ? formatDate(viewUserData.updated_at) : 'Never' }}</td>
                  </tr>
                  <tr>
                    <td class="text-muted"><strong><i class="fas fa-sign-in-alt me-1"></i>Last Login:</strong></td>
                    <td>
                      <span v-if="viewUserData.last_login" class="badge bg-success">
                        {{ formatDate(viewUserData.last_login) }}
                      </span>
                      <span v-else class="badge bg-secondary">Never</span>
                    </td>
                  </tr>
                </table>

                <!-- Residency Documents Section (for clients) -->
                <div v-if="viewUserData && viewUserData.type === 'client'" class="mt-4">
                  <div class="d-flex justify-content-between align-items-center mb-3">
                    <h6 class="text-warning mb-0">
                      <i class="fas fa-home me-2"></i>
                      Residency Documents
                    </h6>
                    <button
                      class="btn btn-outline-primary btn-sm me-2"
                      @click="openImageModal(viewUserData)"
                    >
                      <i class="fas fa-images me-1"></i>
                      View Images
                    </button>

                  </div>

                  <!-- ill comment this because i dont really much needed this -->
                  <!-- Simple instruction -->
                  <!-- <div class="text-center py-4">
                    <i class="fas fa-images fa-3x text-muted mb-3"></i>
                    <p class="text-muted mb-0">Click "View Images" button above to open image viewer</p>
                  </div> -->
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              <i class="fas fa-times me-1"></i>
              Close
            </button>

            <!-- Residency Documents Button (only for clients needing verification) -->
            <button
              v-if="viewUserData && viewUserData.type === 'client' && needsResidencyVerification(viewUserData)"
              type="button"
              class="btn btn-warning"
              @click="viewResidencyDocuments(viewUserData)"
              data-bs-dismiss="modal"
            >
              <i class="fas fa-home me-1"></i>
              View Residency Documents
            </button>

            <button type="button" class="btn btn-primary" @click="editUser(viewUserData)" data-bs-dismiss="modal">
              <i class="fas fa-edit me-1"></i>
              Edit User
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Residency Documents Modal Component -->
    <ResidencyDocumentsModal
      :user="selectedUserForResidency"
      :processing="processingResidencyAction"
      @approve="approveResidencyVerification"
      @reject="showRejectResidencyModal"
    />

    <!-- Direct DOM Image Modal -->
    <div class="modal fade" id="directImageModal" tabindex="-1" aria-labelledby="directImageModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-xl modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="directImageModalLabel">
              <i class="fas fa-images me-2"></i>
              Residency Images
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body" id="imageModalContent">
            <!-- Content will be inserted directly via DOM manipulation -->
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Reject Residency Modal -->
    <div class="modal fade" id="rejectResidencyModal" tabindex="-1" aria-labelledby="rejectResidencyModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="rejectResidencyModalLabel">
              <i class="fas fa-times-circle me-2"></i>
              Reject Residency Verification
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="alert alert-warning">
              <i class="fas fa-exclamation-triangle me-2"></i>
              You are about to reject the residency verification for <strong>{{ selectedUserForResidency?.full_name }}</strong>.
            </div>
            <div class="mb-3">
              <label for="rejectionReason" class="form-label">Reason for Rejection *</label>
              <textarea
                id="rejectionReason"
                class="form-control"
                v-model="rejectionReason"
                rows="4"
                placeholder="Please provide a detailed reason for rejecting the residency verification..."
                required
              ></textarea>
              <div class="form-text">Minimum 10 characters required</div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button
              type="button"
              class="btn btn-danger"
              @click="rejectResidencyVerification"
              :disabled="!rejectionReason || rejectionReason.length < 10 || processingResidencyAction"
            >
              <span v-if="processingResidencyAction" class="spinner-border spinner-border-sm me-1" role="status"></span>
              <i v-else class="fas fa-times me-1"></i>
              Reject Verification
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AdminHeader from './AdminHeader.vue';
import AdminSidebar from './AdminSidebar.vue';
import ResidencyDocumentsModal from './ResidencyDocumentsModal.vue';
import unifiedAuthService from '@/services/unifiedAuthService';
import userManagementService from '@/services/userManagementService';
import residencyService from '@/services/residencyService';
import api from '@/services/api';
import { Modal } from 'bootstrap';

export default {
  name: 'AdminUsers',
  components: {
    AdminHeader,
    AdminSidebar,
    ResidencyDocumentsModal
  },

  data() {
    return {
      // UI State
      sidebarCollapsed: false,
      showUserDropdown: false,
      isMobile: false,
      adminData: null,
      // Component Data
      users: [],
      searchQuery: '',
      filterStatus: '',
      filterType: '',
      activeTab: 'clients', // New property for tab management
      currentPage: 1,
      itemsPerPage: 10,
      loading: false,
      userStats: {
        total: 0,
        active: 0,
        pending: 0,
        admins: 0
      },

      // Modal data
      viewUserData: null,
      addUserLoading: false,
      editUserLoading: false,

      // Residency verification data
      selectedUserForResidency: null,
      processingResidencyAction: false,
      processingQuickAction: false,
      rejectionReason: '',





      // Direct DOM modal (no reactive data needed)

      // Form validation errors
      formErrors: {},
      editFormErrors: {},

      // Add user form
      addUserForm: {
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        first_name: '',
        middle_name: '',
        last_name: '',
        suffix: '',
        role: '',
        phone_number: '',
        // Client specific fields
        birth_date: '',
        gender: '',
        civil_status_id: 1,
        nationality: 'Filipino',
        house_number: '',
        street: '',
        subdivision: '',
        barangay: '',
        city_municipality: '',
        province: '',
        postal_code: '',
        years_of_residency: null,
        months_of_residency: null
      },

      // Edit user form
      editUserForm: {
        id: null,
        username: '',
        email: '',
        first_name: '',
        middle_name: '',
        last_name: '',
        suffix: '',
        role: '',
        status: '',
        phone_number: '',
        // Client specific fields
        birth_date: '',
        gender: '',
        civil_status_id: 1,
        nationality: 'Filipino',
        house_number: '',
        street: '',
        subdivision: '',
        barangay: '',
        city_municipality: '',
        province: '',
        postal_code: '',
        years_of_residency: null,
        months_of_residency: null,
        // Password reset fields
        resetPassword: false,
        newPassword: '',
        confirmPassword: ''
      },

      // Available options
      genderOptions: [
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' }
      ],

      statusOptions: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'suspended', label: 'Suspended' },
        { value: 'pending_verification', label: 'Pending Verification' }
      ]
    };
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
    },

    // Separate statistics for clients and admins
    clientStats() {
      const clients = this.users.filter(user => user.type === 'client' && user.status !== 'inactive');
      return {
        total: clients.length,
        active: clients.filter(user => this.getDisplayStatus(user) === 'active').length,
        pending: clients.filter(user => this.getDisplayStatus(user) === 'pending_residency_verification').length,
        rejected: clients.filter(user => this.getDisplayStatus(user) === 'residency_rejected').length
      };
    },

    adminStats() {
      const admins = this.users.filter(user => user.type === 'admin' && user.status !== 'inactive');
      return {
        total: admins.length,
        active: admins.filter(user => user.status === 'active').length,
        suspended: admins.filter(user => user.status === 'suspended').length
      };
    },

    filteredUsers() {
      let filtered = [...this.users];

      // Apply tab-based role filter and exclude inactive users
      if (this.activeTab === 'clients') {
        filtered = filtered.filter(user => user.type === 'client' && user.status !== 'inactive');
      } else if (this.activeTab === 'admins') {
        filtered = filtered.filter(user => user.type === 'admin' && user.status !== 'inactive');
      }

      // Apply search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(user => {
          const displayStatus = this.getDisplayStatus(user);
          const formattedStatus = this.formatStatus(displayStatus);

          return user.full_name?.toLowerCase().includes(query) ||
                 user.email?.toLowerCase().includes(query) ||
                 user.username?.toLowerCase().includes(query) ||
                 user.type?.toLowerCase().includes(query) ||
                 user.status?.toLowerCase().includes(query) ||
                 displayStatus?.toLowerCase().includes(query) ||
                 formattedStatus?.toLowerCase().includes(query) ||
                 user.first_name?.toLowerCase().includes(query) ||
                 user.last_name?.toLowerCase().includes(query);
        });
      }

      // Apply status filter
      if (this.filterStatus) {
        filtered = filtered.filter(user => {
          const displayStatus = this.getDisplayStatus(user);
          return displayStatus === this.filterStatus;
        });
      }

      return filtered;
    },

    paginatedUsers() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredUsers.slice(start, end);
    },

    totalPages() {
      return Math.ceil(this.filteredUsers.length / this.itemsPerPage);
    },

    visiblePages() {
      const pages = [];
      const start = Math.max(1, this.currentPage - 2);
      const end = Math.min(this.totalPages, this.currentPage + 2);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      return pages;
    },

    // Check if we're creating an admin user (when admin tab is active)
    isCreatingAdminUser() {
      return this.activeTab === 'admins';
    }

  },

  watch: {
    // Reset pagination when search query changes
    searchQuery() {
      this.currentPage = 1;
    },

    // Reset pagination when status filter changes
    filterStatus() {
      this.currentPage = 1;
    }
  },

  async mounted() {
    // Check authentication
    if (!unifiedAuthService.isLoggedIn() || unifiedAuthService.getUserType() !== 'admin') {
      this.$router.push('/login');
      return;
    }

    // Initialize UI state
    this.initializeUI();

    // Make bootstrap available globally for this component
    this.$bootstrap = { Modal };

    // Debug authentication - using unified auth system
    const authToken = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    const userData = localStorage.getItem('auth_user') || sessionStorage.getItem('auth_user');

    console.log('🔍 Admin Authentication Debug:');
    console.log('  Auth Token:', authToken ? 'EXISTS' : 'NOT FOUND');
    console.log('  User Data:', userData ? 'EXISTS' : 'NOT FOUND');

    if (userData) {
      try {
        const data = JSON.parse(userData);
        console.log('  Username:', data.username);
        console.log('  User Type:', data.type);
        console.log('  Role:', data.role);
        console.log('  Status:', data.status);
      } catch (e) {
        console.error('  Error parsing user data:', e);
      }
    }

    // Check if user is authenticated and is an admin
    if (!authToken || !userData) {
      this.showToast('error', 'You are not logged in. Please login first.');
      this.$router.push('/login');
      return;
    }

    try {
      const user = JSON.parse(userData);
      if (user.type !== 'admin') {
        this.showToast('error', 'Access denied. Admin privileges required.');
        this.$router.push('/login');
        return;
      }
    } catch (e) {
      console.error('Error parsing user data:', e);
      this.showToast('error', 'Invalid authentication data. Please login again.');
      this.$router.push('/login');
      return;
    }

    // Load component data
    await this.loadAdminProfile();
    await this.loadUserStats();
    await this.loadUsers();

    // Add event listener for image modal close to clean up blob URLs
    const imageModal = document.getElementById('directImageModal');
    if (imageModal) {
      imageModal.addEventListener('hidden.bs.modal', () => {
        // Clean up blob URLs from images in the modal
        const contentDiv = document.getElementById('imageModalContent');
        if (contentDiv) {
          const images = contentDiv.querySelectorAll('img[src^="blob:"]');
          images.forEach(img => {
            URL.revokeObjectURL(img.src);
          });
          // Clear content
          contentDiv.innerHTML = '';
        }
      });
    }
  },

  beforeUnmount() {
    if (this.handleResize) {
      window.removeEventListener('resize', this.handleResize);
    }

    // Clean up blob URLs to prevent memory leaks
    const contentDiv = document.getElementById('imageModalContent');
    if (contentDiv) {
      const images = contentDiv.querySelectorAll('img[src^="blob:"]');
      images.forEach(img => {
        URL.revokeObjectURL(img.src);
      });
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

    // Handle phone number input to restrict to digits only
    handlePhoneInput(event, formType) {
      const value = event.target.value;
      // Remove any non-digit characters
      const digitsOnly = value.replace(/\D/g, '');
      // Limit to 11 digits
      const limitedValue = digitsOnly.substring(0, 11);

      if (formType === 'add') {
        this.addUserForm.phone_number = limitedValue;
      } else if (formType === 'edit') {
        this.editUserForm.phone_number = limitedValue;
      }
    },

    // Load admin profile data
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
        console.error('Failed to load admin data:', error);
        const currentUser = unifiedAuthService.getCurrentUser();
        this.adminData = {
          first_name: currentUser?.username || 'Admin',
          role: currentUser?.role || 'admin'
        };
      }
    },

    // Load user statistics
    async loadUserStats() {
      try {
        const response = await userManagementService.getUserStats();
        if (response.success) {
          this.userStats = response.data;
        } else {
          this.calculateStats();
        }
      } catch (error) {
        console.error('Failed to load user statistics:', error);
        this.calculateStats();
      }
    },

    // Load users data
    async loadUsers() {
      this.loading = true;
      try {
        const params = {
          page: this.currentPage,
          limit: 50,
          search: this.searchQuery || undefined,
          // Don't filter by role in API call since we handle it in frontend with tabs
          is_active: this.filterStatus === 'active' ? true :
                     this.filterStatus === 'inactive' ? false : undefined
        };

        const response = await userManagementService.getUsers(params);

        if (response.success) {
          this.users = response.data.users.map(user =>
            userManagementService.formatUserData(user)
          );
          this.calculateStats();
        } else {
          throw new Error(response.message || 'Failed to load users');
        }
      } catch (error) {
        console.error('Failed to load users:', error);
        this.showToast('error', error.message || 'Failed to load users');
        this.users = [];
        this.calculateStats();
      } finally {
        this.loading = false;
      }
    },

    // Calculate user statistics
    calculateStats() {
      this.userStats = {
        total: this.users.length,
        active: this.users.filter(u => this.getDisplayStatus(u) === 'active').length,
        pending: this.users.filter(u => this.getDisplayStatus(u) === 'pending_residency_verification').length,
        admins: this.users.filter(u => u.type === 'admin').length
      };
    },





    // Change page
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },

    // Get user initials for avatar
    getInitials(fullName) {
      if (!fullName) return '?';
      return fullName.split(' ').map(name => name.charAt(0)).join('').toUpperCase().slice(0, 2);
    },

    // Get status badge class
    getStatusBadgeClass(status) {
      const classes = {
        'active': 'bg-success',
        'inactive': 'bg-secondary',
        'pending': 'bg-warning',
        'suspended': 'bg-danger',
        'pending_verification': 'bg-warning',
        'pending_residency_verification': 'bg-info',
        'residency_rejected': 'bg-danger',
        'residency_approved': 'bg-success',
        'no_residency_documents': 'bg-warning'
      };
      return classes[status] || 'bg-secondary';
    },

    // Format status text
    formatStatus(status) {
      const statusLabels = {
        'active': 'Active',
        'inactive': 'Inactive',
        'pending': 'Pending',
        'suspended': 'Suspended',
        'pending_verification': 'Pending Verification',
        'pending_residency_verification': 'Pending Residency Verification',
        'residency_rejected': 'Residency Rejected',
        'residency_approved': 'Residency Approved',
        'no_residency_documents': 'No Residency Documents'
      };
      return statusLabels[status] || status.charAt(0).toUpperCase() + status.slice(1);
    },

    // Format date
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    },

    // User actions


    async toggleUserStatus(user) {
      try {
        const newStatus = user.status === 'active' ? 'suspended' : 'active';
        const reason = `Status changed by admin: ${this.adminData?.first_name || 'Admin'}`;

        const response = await userManagementService.updateUserStatus(user.id, newStatus, reason);

        if (response.success) {
          // Update local data
          user.status = newStatus;
          this.calculateStats();

          const statusText = newStatus === 'active' ? 'activated' : 'suspended';
          this.showToast('success', `User ${user.full_name} has been ${statusText}.`);
        } else {
          throw new Error(response.message || 'Failed to update user status');
        }
      } catch (error) {
        console.error('Failed to update user status:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to update user status. Please try again.';
        this.showToast('error', errorMessage);
      }
    },

    async deleteUser(user) {
      const confirmMessage = `Are you sure you want to delete user "${user.full_name}"?\n\nThis will:\n- Deactivate the user account\n- Prevent future logins\n- Preserve data for audit purposes\n\nThis action can be reversed by reactivating the user.`;

      if (!confirm(confirmMessage)) {
        return;
      }

      try {
        const reason = `User deleted by admin: ${this.adminData?.first_name || 'Admin'}`;
        const response = await userManagementService.deleteUser(user.id, reason);

        if (response.success) {
          this.showToast('success', `User ${user.full_name} has been deleted successfully.`);

          // Reload data to reflect changes
          await this.loadUsers();
          await this.loadUserStats();
        } else {
          throw new Error(response.message || 'Failed to delete user');
        }
      } catch (error) {
        console.error('Failed to delete user:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to delete user. Please try again.';
        this.showToast('error', errorMessage);
      }
    },

    // Helper methods
    showToast(type, message) {
      if (this.$toast?.[type]) {
        this.$toast[type](message);
      } else {
        console.log(`${type.toUpperCase()}: ${message}`);
        if (type === 'error') alert(`Error: ${message}`);
        else if (type === 'success') alert(`Success: ${message}`);
      }
    },

    closeModal(modalId) {
      try {
        const modal = Modal.getInstance(document.getElementById(modalId));
        if (modal) modal.hide();
      } catch (error) {
        console.error('Error closing modal:', error);
      }
    },

    handleFormError(error, errorField) {
      console.error('Form error:', error);

      // Handle server validation errors
      if (error.response?.data?.details) {
        const serverErrors = {};
        error.response.data.details.forEach(detail => {
          if (detail.path) serverErrors[detail.path] = detail.msg;
        });
        this[errorField] = { ...this[errorField], ...serverErrors };
      }

      const errorMessage = error.response?.data?.message || error.message || 'Operation failed';
      this.showToast('error', errorMessage);
    },



    // Modal methods
    showAddUserModal() {
      this.resetAddUserForm();
      try {
        const modalElement = document.getElementById('addUserModal');
        if (modalElement) {
          const modal = new Modal(modalElement);
          modal.show();
        }
      } catch (error) {
        console.error('Error showing add user modal:', error);
        this.$toast?.error?.('Failed to open add user modal');
      }
    },

    resetAddUserForm() {
      // Set default role based on active tab
      const defaultRole = this.activeTab === 'admins' ? 'admin' : '';

      Object.assign(this.addUserForm, {
        username: '', email: '', password: '', confirmPassword: '', first_name: '', middle_name: '', last_name: '',
        suffix: '', role: defaultRole, phone_number: '', birth_date: '', gender: '', civil_status_id: 1, nationality: 'Filipino',
        house_number: '', street: '', subdivision: '', barangay: '', city_municipality: '',
        province: '', postal_code: '', years_of_residency: null, months_of_residency: null
      });
      // Clear form errors object safely
      Object.keys(this.formErrors).forEach(key => delete this.formErrors[key]);
    },

    clearRoleSpecificFields() {
      const form = this.addUserForm;
      if (form.role === 'admin') {
        // Clear client fields
        Object.assign(form, {
          birth_date: '', gender: '', civil_status_id: 1, nationality: 'Filipino',
          house_number: '', street: '', subdivision: '', barangay: '',
          city_municipality: '', province: '', postal_code: '',
          years_of_residency: null, months_of_residency: null
        });
      } else if (form.role === 'client') {
        // No admin-specific fields to clear anymore
      }
    },

    validateAddUserForm() {
      const errors = {};
      const form = this.addUserForm;

      // Basic validation
      if (!form.username?.length || form.username.length < 3) errors.username = 'Username must be at least 3 characters long';
      if (!form.password?.length || form.password.length < 6) errors.password = 'Password must be at least 6 characters long';
      if (!form.confirmPassword?.length) errors.confirmPassword = 'Please confirm your password';
      if (form.password && form.confirmPassword && form.password !== form.confirmPassword) errors.confirmPassword = 'Passwords do not match';
      if (!form.first_name?.trim() || form.first_name.trim().length < 2) errors.first_name = 'First name must be at least 2 characters long';
      if (!form.last_name?.trim() || form.last_name.trim().length < 2) errors.last_name = 'Last name must be at least 2 characters long';
      if (!form.role) errors.role = 'Please select a user type';
      if (!form.phone_number?.trim() || form.phone_number.trim().length < 10) errors.phone_number = 'Please provide a valid phone number';
      if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Please provide a valid email address';

      // Client-specific validation
      if (form.role === 'client') {
        if (!form.birth_date) errors.birth_date = 'Birth date is required for clients';
        if (!form.gender) errors.gender = 'Gender is required for clients';
        if (!form.barangay?.trim()) errors.barangay = 'Barangay is required for clients';
        if (!form.city_municipality?.trim()) errors.city_municipality = 'City/Municipality is required for clients';
        if (!form.province?.trim()) errors.province = 'Province is required for clients';
      }

      this.formErrors = errors;
      return Object.keys(errors).length === 0;
    },

    validateEditUserForm() {
      const errors = {};
      const form = this.editUserForm;

      // Basic validation
      if (!form.username?.length || form.username.length < 3) errors.username = 'Username must be at least 3 characters long';
      if (!form.first_name?.trim() || form.first_name.trim().length < 2) errors.first_name = 'First name must be at least 2 characters long';
      if (!form.last_name?.trim() || form.last_name.trim().length < 2) errors.last_name = 'Last name must be at least 2 characters long';
      if (!form.phone_number?.trim() || form.phone_number.trim().length < 10) errors.phone_number = 'Please provide a valid phone number';
      if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Please provide a valid email address';

      // Password reset validation
      if (form.resetPassword) {
        if (!form.newPassword?.length || form.newPassword.length < 6) errors.newPassword = 'New password must be at least 6 characters long';
        if (form.newPassword !== form.confirmPassword) errors.confirmPassword = 'Passwords do not match';
      }

      this.editFormErrors = errors;
      return Object.keys(errors).length === 0;
    },

    getFullAddress(user) {
      const parts = [];
      if (user.house_number) parts.push(user.house_number);
      if (user.street) parts.push(user.street);
      if (user.subdivision) parts.push(user.subdivision);
      if (user.barangay) parts.push(user.barangay);
      if (user.city_municipality) parts.push(user.city_municipality);
      if (user.province) parts.push(user.province);
      return parts.join(', ') || 'No address provided';
    },

    async submitAddUser() {
      if (!this.validateAddUserForm()) {
        this.showToast('error', 'Please fix the validation errors before submitting.');
        return;
      }

      this.addUserLoading = true;
      try {
        const userData = { ...this.addUserForm };

        // Convert numeric fields
        ['years_of_residency', 'months_of_residency', 'civil_status_id'].forEach(field => {
          if (userData[field]) userData[field] = parseInt(userData[field]);
        });

        // Explicitly set status to 'active' for admin accounts created through AdminUsers.vue
        if (this.isCreatingAdminUser || userData.role === 'admin') {
          userData.status = 'active';
        }

        const response = await userManagementService.createUser(userData);

        if (response.success) {
          this.showToast('success', 'User created successfully');
          this.closeModal('addUserModal');
          this.resetAddUserForm();
          await Promise.all([this.loadUsers(), this.loadUserStats()]);
        } else {
          throw new Error(response.message || 'Failed to create user');
        }
      } catch (error) {
        this.handleFormError(error, 'formErrors');
      } finally {
        this.addUserLoading = false;
      }
    },

    editUser(user) {
      this.editUserForm = {
        id: user.id,
        username: user.username,
        email: user.email || '',
        first_name: user.first_name || '',
        middle_name: user.middle_name || '',
        last_name: user.last_name || '',
        suffix: user.suffix || '',
        role: user.type,
        status: user.status,
        phone_number: user.phone_number || '',
        birth_date: user.birth_date ? user.birth_date.split('T')[0] : '',
        gender: user.gender || '',
        civil_status_id: user.civil_status_id || 1,
        nationality: user.nationality || 'Filipino',
        house_number: user.house_number || '',
        street: user.street || '',
        subdivision: user.subdivision || '',
        barangay: user.barangay || '',
        city_municipality: user.city_municipality || '',
        province: user.province || '',
        postal_code: user.postal_code || '',
        years_of_residency: user.years_of_residency || null,
        months_of_residency: user.months_of_residency || null,
        resetPassword: false,
        newPassword: '',
        confirmPassword: ''
      };

      this.editFormErrors = {};

      try {
        const modal = new Modal(document.getElementById('editUserModal'));
        modal.show();
      } catch (error) {
        this.showToast('error', 'Failed to open edit user modal');
      }
    },

    async submitEditUser() {
      if (!this.validateEditUserForm()) {
        this.showToast('error', 'Please fix the validation errors before submitting.');
        return;
      }

      this.editUserLoading = true;
      try {
        const form = this.editUserForm;
        const updateData = {
          username: form.username,
          email: form.email,
          first_name: form.first_name,
          middle_name: form.middle_name,
          last_name: form.last_name,
          suffix: form.suffix,
          status: form.status,
          phone_number: form.phone_number
        };

        // Add role-specific fields
        if (form.role === 'admin') {
          Object.assign(updateData, {
            position: form.position,
            department: form.department,
            employee_id: form.employee_id,
            hire_date: form.hire_date
          });
        }

        // Add password if resetting
        if (form.resetPassword && form.newPassword) {
          updateData.password = form.newPassword;
        }

        const response = await userManagementService.updateUser(form.id, updateData);

        if (response.success) {
          this.showToast('success', 'User updated successfully');
          this.closeModal('editUserModal');
          await Promise.all([this.loadUsers(), this.loadUserStats()]);
        } else {
          throw new Error(response.message || 'Failed to update user');
        }
      } catch (error) {
        this.handleFormError(error, 'editFormErrors');
      } finally {
        this.editUserLoading = false;
      }
    },

    async viewUser(user) {
      try {
        const response = await userManagementService.getUser(user.id);
        if (response.success) {
          this.viewUserData = userManagementService.formatUserData(response.data);
          const modal = new Modal(document.getElementById('viewUserModal'));
          modal.show();
        } else {
          throw new Error(response.message || 'Failed to load user details');
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to load user details';
        this.showToast('error', errorMessage);
      }
    },

    // Handle tab switching
    setActiveTab(tab) {
      this.activeTab = tab;
      this.filterStatus = ''; // Reset status filter when switching tabs
      this.searchQuery = ''; // Reset search when switching tabs
      this.currentPage = 1; // Reset pagination
      console.log(`🔄 Switched to ${tab} tab`);
    },

    // Handle opening user modal from notifications
    async handleOpenUserModal(modalData) {
      console.log('🔔 AdminUsers: Opening user modal from notification:', modalData);

      try {
        const { userId, userType } = modalData;

        if (!userId) {
          console.error('❌ No user ID provided for modal');
          return;
        }

        console.log(`🔍 Looking for ${userType || 'unknown'} user with ID: ${userId}`);

        // Switch to the appropriate tab based on user type
        if (userType === 'client') {
          this.setActiveTab('clients');
        } else if (userType === 'admin') {
          this.setActiveTab('admins');
        }

        // Find the user in the current users list
        let user = this.users.find(u => u.id === userId || u.original_id === userId);

        if (!user) {
          // If user not found in current list, try to load it directly
          console.log('🔍 User not found in current list, loading directly...');
          const response = await userManagementService.getUser(userId);
          if (response.success) {
            user = userManagementService.formatUserData(response.data);
          } else {
            throw new Error('User not found');
          }
        }

        // Open the user details modal
        await this.viewUser(user);

        console.log('✅ User modal opened successfully');

      } catch (error) {
        console.error('❌ Failed to open user modal:', error);
        this.showToast('error', 'Failed to open user details');
      }
    },

    // Residency verification methods
    needsResidencyVerification(user) {
      return ['pending_residency_verification', 'residency_rejected'].includes(user.status);
    },

    // Check if user has residency documents uploaded
    hasResidencyDocuments(user) {
      if (user.type !== 'client') return false;
      return user.residency_document_count > 0;
    },

    // Check if user has residency documents that need review (not approved)
    hasResidencyDocumentsNeedingReview(user) {
      if (user.type !== 'client') return false;
      // Only show review button if they have documents AND they're not already approved
      return user.residency_document_count > 0 && user.residency_verification_status !== 'approved';
    },

    // Get the display status for a user (prioritizes residency verification status for clients)
    getDisplayStatus(user) {
      if (user.type !== 'client') {
        return user.status; // For admin users, use regular status
      }

      // For clients, check if they have residency verification status
      if (user.residency_verification_status) {
        // Map residency verification status to display status
        switch (user.residency_verification_status) {
          case 'pending':
            return 'pending_residency_verification';
          case 'approved':
            return 'active'; // Approved residency = active client
          case 'rejected':
            return 'residency_rejected';
          default:
            return user.status;
        }
      }

      // If no residency documents uploaded yet
      if (user.residency_document_count === 0 || user.residency_document_count === undefined) {
        // Check if they're in a residency verification workflow
        if (['pending_residency_verification', 'residency_rejected'].includes(user.status)) {
          return 'no_residency_documents';
        }
      }

      // If no residency verification status, check account status
      if (['pending_residency_verification', 'residency_rejected'].includes(user.status)) {
        return user.status;
      }

      // For other statuses, return as-is
      return user.status;
    },

    // Check if user can be approved for residency verification
    canApproveResidency(user) {
      if (user.type !== 'client') return false;

      const displayStatus = this.getDisplayStatus(user);
      // Can approve if they have pending residency verification and have uploaded documents
      return displayStatus === 'pending_residency_verification' && user.residency_document_count > 0;
    },

    // Check if user can be rejected for residency verification
    canRejectResidency(user) {
      if (user.type !== 'client') return false;

      const displayStatus = this.getDisplayStatus(user);
      // Can reject if they have pending residency verification and have uploaded documents
      return displayStatus === 'pending_residency_verification' && user.residency_document_count > 0;
    },

    viewResidencyDocuments(user) {
      // Set the selected user and show the modal
      this.selectedUserForResidency = user;
      this.rejectionReason = '';

      // Show modal using Bootstrap
      const modal = new Modal(document.getElementById('residencyDocumentsModal'));
      modal.show();
    },

    // Direct DOM manipulation method to avoid Vue reactivity issues
    async openImageModal(user) {
      if (!user) return;

      console.log('Opening image modal for user:', user);

      // Get modal elements
      const modal = new Modal(document.getElementById('directImageModal'));
      const contentDiv = document.getElementById('imageModalContent');

      // Show loading state directly in DOM
      contentDiv.innerHTML = `
        <div class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-3 text-muted">Loading images...</p>
        </div>
      `;

      // Show modal
      modal.show();

      try {
        // Get account ID
        const accountId = user.original_id || user.id;
        const numericId = typeof accountId === 'string' && accountId.includes('_')
          ? accountId.split('_')[1]
          : accountId;

        console.log('Fetching documents for account ID:', numericId);

        // Get documents
        const response = await residencyService.getAccountDocuments(numericId);

        if (response.success && response.data && response.data.length > 0) {
          console.log('Documents found:', response.data.length);

          // Filter images only
          const imageDocuments = response.data.filter(doc => {
            const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            return imageTypes.includes(doc.mime_type?.toLowerCase());
          });

          console.log('Image documents found:', imageDocuments.length);

          if (imageDocuments.length > 0) {
            // Start building HTML for images
            let imagesHtml = '<div class="row g-3">';
            let loadedCount = 0;

            // Load each image
            for (const doc of imageDocuments) {
              try {
                console.log('Loading image:', doc.document_name);

                const imgResponse = await api.get(`/residency/documents/${doc.id}/file`, {
                  responseType: 'blob'
                });

                const blob = new Blob([imgResponse.data], { type: doc.mime_type });
                const url = URL.createObjectURL(blob);

                // Add image card HTML
                imagesHtml += `
                  <div class="col-md-6 col-lg-4">
                    <div class="card shadow-sm">
                      <img src="${url}" alt="${doc.document_name || 'Residency Document'}"
                           class="card-img-top" style="height: 200px; object-fit: contain; background: #f8f9fa;">
                      <div class="card-body p-2">
                        <small class="text-muted">${doc.document_name || 'Unknown Document'}</small>
                        <br>
                        <small class="text-muted">${doc.document_type || 'Document'}</small>
                      </div>
                    </div>
                  </div>
                `;

                loadedCount++;
                console.log('✅ Successfully loaded:', doc.document_name);

              } catch (error) {
                console.error('❌ Failed to load image:', doc.document_name, error);

                // Add error card
                imagesHtml += `
                  <div class="col-md-6 col-lg-4">
                    <div class="card shadow-sm">
                      <div class="card-body text-center p-4">
                        <i class="fas fa-exclamation-triangle fa-2x text-danger mb-2"></i>
                        <p class="text-muted small mb-0">Failed to load</p>
                        <p class="text-muted small mb-0">${doc.document_name || 'Unknown'}</p>
                      </div>
                    </div>
                  </div>
                `;
              }
            }

            imagesHtml += '</div>';

            if (loadedCount > 0) {
              // Show images
              contentDiv.innerHTML = imagesHtml;
              console.log('Successfully displayed', loadedCount, 'images');
            } else {
              // Show error
              contentDiv.innerHTML = `
                <div class="text-center py-5">
                  <i class="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
                  <h5>Failed to Load Images</h5>
                  <p class="text-muted">All images failed to load. Please try again.</p>
                </div>
              `;
            }
          } else {
            // No image documents
            contentDiv.innerHTML = `
              <div class="text-center py-5">
                <i class="fas fa-file fa-3x text-muted mb-3"></i>
                <h5>No Image Documents</h5>
                <p class="text-muted">This user has uploaded documents, but none are image files.</p>
              </div>
            `;
          }
        } else {
          // No documents at all
          contentDiv.innerHTML = `
            <div class="text-center py-5">
              <i class="fas fa-folder-open fa-3x text-muted mb-3"></i>
              <h5>No Documents Found</h5>
              <p class="text-muted">This user has not uploaded any residency documents yet.</p>
            </div>
          `;
        }
      } catch (error) {
        console.error('Error loading images:', error);

        // Show error
        contentDiv.innerHTML = `
          <div class="text-center py-5">
            <i class="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
            <h5>Error Loading Images</h5>
            <p class="text-muted">${error.message || 'An unexpected error occurred'}</p>
            <button class="btn btn-outline-primary btn-sm mt-2" onclick="location.reload()">
              <i class="fas fa-refresh me-1"></i>
              Refresh Page
            </button>
          </div>
        `;
      }
    },

















    async approveResidencyVerification() {
      if (!this.selectedUserForResidency) return;

      this.processingResidencyAction = true;
      try {
        // Use the actual account ID, not the composite ID
        const accountId = this.selectedUserForResidency.original_id || this.selectedUserForResidency.id;

        // Extract numeric ID if it's in format like 'client_32'
        const numericId = typeof accountId === 'string' && accountId.includes('_')
          ? parseInt(accountId.split('_')[1])
          : parseInt(accountId);

        console.log('Approving residency for account ID:', numericId);

        const response = await residencyService.approveVerification(numericId);
        if (response.success) {
          this.showToast('success', 'Residency verification approved successfully');

          // Close modal
          const modal = Modal.getInstance(document.getElementById('residencyDocumentsModal'));
          if (modal) {
            modal.hide();
          }

          // Refresh user list
          await this.loadUsers();
        } else {
          throw new Error(response.message || 'Failed to approve verification');
        }
      } catch (error) {
        console.error('Failed to approve residency verification:', error);
        this.showToast('error', error.message || 'Failed to approve verification');
      } finally {
        this.processingResidencyAction = false;
      }
    },

    showRejectResidencyModal() {
      // Close documents modal first
      const documentsModal = Modal.getInstance(document.getElementById('residencyDocumentsModal'));
      documentsModal.hide();

      // Show reject modal
      setTimeout(() => {
        const rejectModal = new Modal(document.getElementById('rejectResidencyModal'));
        rejectModal.show();
      }, 300);
    },

    async rejectResidencyVerification() {
      if (!this.selectedUserForResidency || !this.rejectionReason || this.rejectionReason.length < 10) return;

      this.processingResidencyAction = true;
      try {
        // Use the actual account ID, not the composite ID
        const accountId = this.selectedUserForResidency.original_id || this.selectedUserForResidency.id;

        // Extract numeric ID if it's in format like 'client_32'
        const numericId = typeof accountId === 'string' && accountId.includes('_')
          ? parseInt(accountId.split('_')[1])
          : parseInt(accountId);

        console.log('Rejecting residency for account ID:', numericId);

        const response = await residencyService.rejectVerification(
          numericId,
          this.rejectionReason
        );
        if (response.success) {
          this.showToast('success', 'Residency verification rejected');

          // Close modal
          const modal = Modal.getInstance(document.getElementById('rejectResidencyModal'));
          modal.hide();

          // Refresh user list
          await this.loadUsers();
        } else {
          throw new Error(response.message || 'Failed to reject verification');
        }
      } catch (error) {
        console.error('Failed to reject residency verification:', error);
        this.showToast('error', error.message || 'Failed to reject verification');
      } finally {
        this.processingResidencyAction = false;
      }
    },

    // Quick approve client without viewing documents
    async quickApproveClient(user) {
      if (!user || !this.canApproveResidency(user)) return;

      const confirmed = confirm(`Are you sure you want to approve residency verification for ${user.full_name}? This will activate their account and allow them to request documents.`);
      if (!confirmed) return;

      this.processingQuickAction = true;
      try {
        // Use the actual account ID, not the composite ID
        const accountId = user.original_id || user.id;
        const response = await residencyService.approveVerification(accountId);
        if (response.success) {
          this.showToast('success', `Residency verification approved for ${user.full_name}`);
          // Reload users to reflect the change
          await this.loadUsers();
        } else {
          throw new Error(response.message || 'Failed to approve residency verification');
        }
      } catch (error) {
        console.error('Failed to approve residency verification:', error);
        this.showToast('error', error.message || 'Failed to approve residency verification');
      } finally {
        this.processingQuickAction = false;
      }
    },

    // Quick reject client with simple reason
    async quickRejectClient(user) {
      if (!user || !this.canRejectResidency(user)) return;

      const reason = prompt(`Please provide a reason for rejecting residency verification for ${user.full_name}:`, 'Documents do not meet verification requirements');
      if (!reason || reason.trim().length < 10) {
        this.showToast('warning', 'Please provide a detailed reason (minimum 10 characters)');
        return;
      }

      this.processingQuickAction = true;
      try {
        // Use the actual account ID, not the composite ID
        const accountId = user.original_id || user.id;
        const response = await residencyService.rejectVerification(accountId, reason.trim());
        if (response.success) {
          this.showToast('success', `Residency verification rejected for ${user.full_name}`);
          // Reload users to reflect the change
          await this.loadUsers();
        } else {
          throw new Error(response.message || 'Failed to reject residency verification');
        }
      } catch (error) {
        console.error('Failed to reject residency verification:', error);
        this.showToast('error', error.message || 'Failed to reject residency verification');
      } finally {
        this.processingQuickAction = false;
      }
    },

    formatDocumentType(type) {
      return residencyService.formatDocumentType(type);
    },

    formatDocumentStatus(status) {
      return residencyService.formatVerificationStatus(status);
    },

    getDocumentStatusBadgeClass(status) {
      return residencyService.getStatusBadgeClass(status);
    },

    formatFileSize(bytes) {
      if (!bytes) return 'Unknown';
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(1024));
      return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    },

    // Additional user-specific methods can be added here
    // Navigation handlers are now provided by the mixin
  }
};
</script>


<style scoped>
@import './css/adminDashboard.css';

.image-placeholder {
  height: 200px;
  min-height: 200px;
  border: 2px dashed #dee2e6;
  border-radius: 8px;
}

/* Simple styles for image modal */
#simpleImageModal .card-img-top {
  background: #f8f9fa;
}

#simpleImageModal .card {
  transition: transform 0.2s ease;
}

#simpleImageModal .card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

/* Navigation tabs styling */
.nav-pills .nav-link {
  border-radius: 0.375rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.nav-pills .nav-link:not(.active) {
  color: #5a5c69;
  background-color: transparent;
}

.nav-pills .nav-link:not(.active):hover {
  color: #4e73df;
  background-color: #f8f9fc;
}

.nav-pills .nav-link.active {
  background-color: #4e73df;
  color: white;
}

.nav-pills .nav-link.active .badge {
  background-color: rgba(255, 255, 255, 0.2) !important;
  color: white !important;
}

.nav-pills .nav-link:not(.active) .badge {
  background-color: #e3e6f0 !important;
  color: #5a5c69 !important;
}
</style>