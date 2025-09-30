<template>
  <div class="client-dashboard">
    <!-- Header Component -->
    <ClientHeader
      :user-name="getFullName()"
      :notification-count="notificationCount"
      :show-notifications="showNotifications"
      :show-user-dropdown="showUserDropdown"
      :sidebar-collapsed="sidebarCollapsed"
      :active-menu="activeMenu"
      @sidebar-toggle="toggleSidebar"
      @notification-toggle="toggleNotifications"
      @user-dropdown-toggle="toggleUserDropdown"
      @menu-action="handleMenuAction"
      @logout="logout"
      @view-all-notifications="handleViewAllNotifications"
    />

    <!-- Mobile Overlay -->
    <div
      class="mobile-overlay"
      :class="{ active: !sidebarCollapsed && isMobile }"
      @click="closeMobileSidebar"
    ></div>

    <!-- Layout Container -->
    <div class="layout-container">
      <!-- Sidebar -->
      <ClientSidebar
        :collapsed="sidebarCollapsed"
        :active-menu="activeMenu"
        :pending-requests="pendingRequests"
        :completed-requests="completedRequests"
        :total-services="totalServices"
        @menu-change="setActiveMenu"
        @toggle-sidebar="toggleSidebar"
        @logout="logout"
      />

      <!-- Main Content -->
      <main class="main-content" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
        <div class="content-wrapper">
          <!-- Loading State -->
          <div v-if="loading" class="loading-state" role="status" aria-live="polite">
            <div class="loading-spinner" aria-hidden="true">
              <i class="fas fa-spinner fa-spin"></i>
            </div>
            <p>Loading your dashboard...</p>
            <span class="sr-only">Dashboard content is loading, please wait.</span>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="error-state" role="alert" aria-live="assertive">
            <div class="error-icon" aria-hidden="true">
              <i class="fas fa-exclamation-triangle"></i>
            </div>
            <h3>Oops! Something went wrong</h3>
            <p>{{ error }}</p>
            <button
              @click="loadDashboardData"
              class="retry-button"
              :aria-label="`Retry loading dashboard. Error: ${error}`"
            >
              <i class="fas fa-redo" aria-hidden="true"></i> Try Again
            </button>
          </div>

          <!-- Dashboard Content -->
          <div v-else-if="activeMenu === 'dashboard'" class="dashboard-content">
            <!-- Last Updated Info -->
            <div v-if="lastUpdated" class="last-updated" role="status" aria-live="polite">
              <i class="fas fa-clock" aria-hidden="true"></i>
              <span>Last updated: {{ formatTimeAgo(lastUpdated) }}</span>
              <button
                @click="refreshDashboardStats"
                class="refresh-button"
                :disabled="loading"
                :aria-label="loading ? 'Refreshing dashboard data' : 'Refresh dashboard data'"
              >
                <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }" aria-hidden="true"></i>
              </button>
            </div>

          <!-- Stats Cards -->
          <div class="stats-section">
            <div class="stats-grid">
              <div class="stat-card" @click="navigateTo('requests')" tabindex="0" role="button" aria-label="View all requests">
                <div class="stat-icon">
                  <i class="fas fa-file-alt"></i>
                </div>
                <div class="stat-content">
                  <h3 class="stat-number">{{ totalRequests }}</h3>
                  <p class="stat-label">Total Requests</p>
                  <div class="stat-trend" v-if="requestsTrend">
                    <i :class="requestsTrend.icon"></i>
                    <span>{{ requestsTrend.text }}</span>
                  </div>
                </div>
              </div>

              <div class="stat-card" @click="navigateTo('requests')" tabindex="0" role="button" aria-label="View pending requests">
                <div class="stat-icon pending">
                  <i class="fas fa-clock"></i>
                </div>
                <div class="stat-content">
                  <h3 class="stat-number">{{ pendingRequests }}</h3>
                  <p class="stat-label">Pending</p>
                  <div class="stat-progress">
                    <div class="progress-bar">
                      <div class="progress-fill" :style="{ width: pendingPercentage + '%' }"></div>
                    </div>
                    <span class="progress-text">{{ pendingPercentage }}% of total</span>
                  </div>
                </div>
              </div>

              <div class="stat-card" @click="navigateTo('requests')" tabindex="0" role="button" aria-label="View completed requests">
                <div class="stat-icon completed">
                  <i class="fas fa-check-circle"></i>
                </div>
                <div class="stat-content">
                  <h3 class="stat-number">{{ completedRequests }}</h3>
                  <p class="stat-label">Completed</p>
                  <div class="stat-progress">
                    <div class="progress-bar">
                      <div class="progress-fill success" :style="{ width: completedPercentage + '%' }"></div>
                    </div>
                    <span class="progress-text">{{ completedPercentage }}% success rate</span>
                  </div>
                </div>
              </div>

              <div class="stat-card" @click="navigateTo('payments')" tabindex="0" role="button" aria-label="View payment history">
                <div class="stat-icon payments">
                  <i class="fas fa-peso-sign"></i>
                </div>
                <div class="stat-content">
                  <h3 class="stat-number">₱{{ formatCurrency(totalPaid) }}</h3>
                  <p class="stat-label">Total Paid</p>
                  <div class="stat-trend" v-if="paymentsTrend">
                    <i :class="paymentsTrend.icon"></i>
                    <span>{{ paymentsTrend.text }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Data Visualization Section -->
          <div class="visualization-section" v-if="totalRequests > 0">
            <h3 class="section-title">Request Analytics</h3>
            <div class="charts-grid">
              <!-- Request Status Chart -->
              <div class="chart-card">
                <h4 class="chart-title">Request Status Distribution</h4>
                <div class="chart-container">
                  <div class="donut-chart">
                    <svg viewBox="0 0 100 100" class="donut-svg">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" stroke-width="8"/>
                      <circle
                        cx="50" cy="50" r="40" fill="none"
                        stroke="#10b981"
                        stroke-width="8"
                        stroke-dasharray="251.2"
                        :stroke-dashoffset="251.2 - (251.2 * completedPercentage / 100)"
                        transform="rotate(-90 50 50)"
                        class="progress-circle"
                      />
                      <circle
                        cx="50" cy="50" r="40" fill="none"
                        stroke="#f59e0b"
                        stroke-width="8"
                        stroke-dasharray="251.2"
                        :stroke-dashoffset="251.2 - (251.2 * pendingPercentage / 100)"
                        :transform="`rotate(${-90 + (360 * completedPercentage / 100)} 50 50)`"
                        class="progress-circle"
                      />
                    </svg>
                    <div class="chart-center">
                      <div class="chart-value">{{ totalRequests }}</div>
                      <div class="chart-label">Total</div>
                    </div>
                  </div>
                  <div class="chart-legend">
                    <div class="legend-item">
                      <div class="legend-color completed"></div>
                      <span>Completed ({{ completedRequests }})</span>
                    </div>
                    <div class="legend-item">
                      <div class="legend-color pending"></div>
                      <span>Pending ({{ pendingRequests }})</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Monthly Activity Chart -->
              <div class="chart-card" v-if="monthlyActivity.length > 0">
                <h4 class="chart-title">Monthly Activity</h4>
                <div class="chart-container">
                  <div class="bar-chart">
                    <div class="bar-chart-bars">
                      <div
                        v-for="(month, index) in monthlyActivity"
                        :key="index"
                        class="bar-item"
                        :style="{ height: (month.value / maxMonthlyValue * 100) + '%' }"
                        :title="`${month.label}: ${month.value} requests`"
                      >
                        <div class="bar-value">{{ month.value }}</div>
                      </div>
                    </div>
                    <div class="bar-chart-labels">
                      <div v-for="(month, index) in monthlyActivity" :key="index" class="bar-label">
                        {{ month.label }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Search and Filters -->
          <div class="search-section" v-if="totalRequests > 0">
            <div class="search-container">
              <div class="search-input-group">
                <i class="fas fa-search search-icon"></i>
                <input
                  type="text"
                  v-model="searchQuery"
                  placeholder="Search requests, documents, or status..."
                  class="search-input"
                  @input="handleSearch"
                />
                <button v-if="searchQuery" @click="clearSearch" class="clear-search">
                  <i class="fas fa-times"></i>
                </button>
              </div>

              <div class="filter-group">
                <select v-model="statusFilter" @change="handleFilter" class="filter-select">
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="approved">Approved</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                </select>

                <select v-model="timeFilter" @change="handleFilter" class="filter-select">
                  <option value="">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="quarter">This Quarter</option>
                </select>
              </div>
            </div>

            <!-- Search Results -->
            <div v-if="searchQuery && searchResults.length > 0" class="search-results">
              <h4 class="search-results-title">Search Results ({{ searchResults.length }})</h4>
              <div class="search-results-list">
                <div
                  v-for="result in searchResults.slice(0, 5)"
                  :key="result.id"
                  class="search-result-item"
                  @click="navigateToRequest(result.id)"
                >
                  <div class="result-icon">
                    <i :class="getRequestActivityIcon(result.status)"></i>
                  </div>
                  <div class="result-content">
                    <h5 class="result-title">{{ result.document_type }}</h5>
                    <p class="result-description">{{ result.purpose || 'No description' }}</p>
                    <div class="result-meta">
                      <span class="result-status" :class="'status-' + result.status">{{ result.status }}</span>
                      <span class="result-date">{{ formatTimeAgo(result.created_at) }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="searchResults.length > 5" class="search-results-more">
                <button @click="navigateTo('requests')" class="view-all-button">
                  View all {{ searchResults.length }} results
                </button>
              </div>
            </div>

            <div v-else-if="searchQuery && searchResults.length === 0" class="no-search-results">
              <i class="fas fa-search"></i>
              <p>No results found for "{{ searchQuery }}"</p>
            </div>
          </div>

        </div>

        <!-- Help & Support Content -->
        <div v-else-if="activeMenu === 'help'" class="help-content">
          <HelpSupport />
        </div>

        <!-- Other Menu Content Placeholders -->
        <div v-else class="page-content">
          <div class="page-header">
            <h2 class="page-title">{{ getPageTitle() }}</h2>
            <p class="page-description">{{ getPageDescription() }}</p>
          </div>

          <div class="page-body">
            <div class="coming-soon">
              <i class="fas fa-tools"></i>
              <h3>Coming Soon</h3>
              <p>This feature is under development and will be available soon.</p>
            </div>
          </div>
        </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script src="./js/clientDashboard.js"></script>

<style scoped src="./css/clientDashboard.css"></style>
<style src="./css/mobileUtilities.css"></style>
<style scoped>
.help-content {
  padding: 0;
  margin: 0;
}
</style>
