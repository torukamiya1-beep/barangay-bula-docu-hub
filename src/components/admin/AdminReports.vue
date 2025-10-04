<template>
  <div class="admin-reports">
    <AdminHeader
      :userName="adminData?.first_name || 'Admin'"
      :notificationCount="unreadNotifications"
      :showNotifications="showNotifications"
      :showUserDropdown="showUserDropdown"
      :sidebarCollapsed="sidebarCollapsed"
      :activeMenu="activeMenu"
      @sidebar-toggle="handleSidebarToggle"
      @notification-toggle="handleNotificationToggle"
      @user-dropdown-toggle="handleUserDropdownToggle"
      @menu-action="handleMenuAction"
      @logout="handleLogout"
      @view-all-notifications="handleViewAllNotifications"
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
        <div class="container-fluid py-4">
          <!-- Report Controls -->
          <div class="row mb-4">
            <div class="col-12">
              <div class="card shadow">
                <!-- PDF Export Configuration -->
                <div class="card-header border-top">
                  <h6 class="mb-3">
                    <i class="fas fa-file-pdf text-danger me-2"></i>
                    PDF Export Configuration
                  </h6>

                  <div class="row">
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

                <div class="card-body">
                  <div v-if="loading" class="text-center py-4">
                    <div class="spinner-border text-primary" role="status">
                      <span class="visually-hidden">Loading...</span>
                    </div>
                  </div>

                  <div v-else-if="analyticsData" class="row">
                    <!-- Request Trends Chart -->
                    <div class="col-lg-8 mb-4">
                      <div class="card h-100">
                        <div class="card-body">
                          <div style="height: 300px;">
                            <Bar
                              v-if="trendsChartData"
                              :data="trendsChartData"
                              :options="chartOptions"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Status Distribution -->
                    <!-- <div class="col-lg-6 mb-4">
                      <div class="card h-100">
                        <div class="card-header">
                          <h6 class="card-title mb-0">Status Distribution</h6>
                        </div>
                        <div class="card-body">
                          <div style="height: 300px;">
                            <Doughnut
                              v-if="statusDistributionChartData"
                              :data="statusDistributionChartData"
                              :options="chartOptions"
                            />
                          </div>
                        </div>
                      </div>
                    </div> -->

                    <!-- Top Clients -->
                    <div class="col-12 mb-4">
                      <div class="card">
                        <div class="card-header">
                          <h6 class="card-title mb-0">Clients</h6>
                        </div>
                        <div class="card-body">
                          <div class="table-responsive">
                            <table class="table table-hover">
                              <thead>
                                <tr>
                                  <th>Client Name</th>
                                  <th>Total Requests</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr v-if="!analyticsData || !analyticsData.topClients || analyticsData.topClients.length === 0">
                                  <td colspan="2" class="text-center text-muted">
                                    <span v-if="loading">Loading clients data...</span>
                                    <span v-else>No client data available</span>
                                  </td>
                                </tr>
                                <tr v-for="client in (analyticsData?.topClients || [])" :key="client.client_name">
                                  <td>{{ client.client_name }}</td>
                                  <td>{{ client.request_count }}</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  </div>
</template>

<script>
import AdminHeader from './AdminHeader.vue';
import AdminSidebar from './AdminSidebar.vue';
import adminDocumentService from '../../services/adminDocumentService';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, LineElement, PointElement } from 'chart.js';
import { Bar } from 'vue-chartjs';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, LineElement, PointElement);
import unifiedAuthService from '@/services/unifiedAuthService';
import { jsPDF } from 'jspdf';
// Import jspdf-autotable plugin - v5.x uses named export
import autoTable from 'jspdf-autotable';

// Verify autoTable plugin is loaded at module level
console.log('📦 Module loading - jsPDF autoTable check (v5.x):', {
  jsPDFAvailable: typeof jsPDF !== 'undefined',
  jsPDFVersion: jsPDF.version || 'unknown',
  autoTableAvailable: typeof autoTable === 'function',
  autoTableOnPrototype: jsPDF.prototype && typeof jsPDF.prototype.autoTable === 'function'
});

export default {
  name: 'AdminReports',
  components: {
    AdminHeader,
    AdminSidebar,
    Bar
    //Doughnut
  },

  data() {
    return {
      // UI State
      sidebarCollapsed: false,
      showUserDropdown: false,
      isMobile: false,
      adminData: null,
      // Component Data
      loading: false,
      analyticsData: null,
      selectedPeriod: 'month',
      reportFilters: {
        reportType: 'daily',
        date_from: '',
        date_to: '',
        format: 'json'
      },
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Document Request Analytics'
          }
        }
      },

      // PDF Export Form (copied from RequestHistory.vue)
      pdfExportForm: {
        reportType: 'daily',
        selectedDate: '',
        selectedWeek: '',
        selectedMonth: '',
        loading: false
      }
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
    trendsChartData() {
      if (!this.analyticsData?.trends || !Array.isArray(this.analyticsData.trends) || this.analyticsData.trends.length === 0) {
        return null;
      }

      return {
        labels: this.analyticsData.trends.map(item => item.period || 'Unknown'),
        datasets: [
          {
            label: 'Completed Requests',
            backgroundColor: '#28a745',
            data: this.analyticsData.trends.map(item => item.completed_requests || 0)
          },
          {
            label: 'Rejected Requests',
            backgroundColor: '#dc3545',
            data: this.analyticsData.trends.map(item => item.rejected_requests || 0)
          },
          {
            label: 'Cancelled Requests',
            backgroundColor: '#6c757d',
            data: this.analyticsData.trends.map(item => item.cancelled_requests || 0)
          }
        ]
      };
    },
    documentTypesChartData() {
      if (!this.analyticsData?.documentTypes || !Array.isArray(this.analyticsData.documentTypes) || this.analyticsData.documentTypes.length === 0) {
        return null;
      }

      return {
        labels: this.analyticsData.documentTypes.map(item => item.type_name || 'Unknown'),
        datasets: [{
          data: this.analyticsData.documentTypes.map(item => item.request_count || 0),
          backgroundColor: [
            '#007bff',
            '#28a745',
            '#ffc107',
            '#dc3545',
            '#6f42c1',
            '#fd7e14'
          ]
        }]
      };
    },
    statusDistributionChartData() {
      if (!this.analyticsData?.statusDistribution || !Array.isArray(this.analyticsData.statusDistribution) || this.analyticsData.statusDistribution.length === 0) {
        return null;
      }

      return {
        labels: this.analyticsData.statusDistribution.map(item => item.status_name || 'Unknown'),
        datasets: [{
          data: this.analyticsData.statusDistribution.map(item => item.percentage || 0),
          backgroundColor: [
            '#ffc107', // Pending
            '#17a2b8', // Under Review
            '#007bff', // Processing
            '#28a745', // Completed
            '#dc3545', // Rejected
            '#6c757d', // Cancelled
            '#fd7e14', // Ready for Pickup
            '#20c997', // Additional Info Required
            '#e83e8c'  // Other
          ]
        }]
      };
    },
    revenueChartData() {
      if (!this.analyticsData?.trends || !Array.isArray(this.analyticsData.trends) || this.analyticsData.trends.length === 0) {
        return null;
      }

      return {
        labels: this.analyticsData.trends.map(item => item.period || 'Unknown'),
        datasets: [{
          label: 'Revenue (₱)',
          borderColor: '#28a745',
          backgroundColor: 'rgba(40, 167, 69, 0.1)',
          data: this.analyticsData.trends.map(item => parseFloat(item.total_revenue || 0))
        }]
      };
    }
  },

  async mounted() {
    // Check authentication
    if (!unifiedAuthService.isLoggedIn() || unifiedAuthService.getUserType() !== 'admin') {
      this.$router.push('/login');
      return;
    }

    // Ensure jsPDF autoTable plugin is available
    this.ensureAutoTablePlugin();

    // Initialize UI state
    this.initializeUI();

    // Load component data
    await this.loadAdminProfile();
    await this.loadAnalyticsData();
    this.setDefaultDateRange();

    // Initialize PDF export form with default values
    this.initializePDFExportForm();
  },

  beforeUnmount() {
    if (this.handleResize) {
      window.removeEventListener('resize', this.handleResize);
    }
  },



  methods: {
    // Initialize UI state
    initializeUI() {
      this.isMobile = window.innerWidth <= 768;

      if (!this.isMobile) {
        const saved = localStorage.getItem('adminSidebarCollapsed');
        this.sidebarCollapsed = saved ? JSON.parse(saved) : false;
      } else {
        this.sidebarCollapsed = true;
      }

      this.handleResize = () => {
        const wasMobile = this.isMobile;
        this.isMobile = window.innerWidth <= 768;

        if (this.isMobile && !wasMobile) {
          this.sidebarCollapsed = true;
        } else if (!this.isMobile && wasMobile) {
          const saved = localStorage.getItem('adminSidebarCollapsed');
          this.sidebarCollapsed = saved ? JSON.parse(saved) : false;
        }
      };
      window.addEventListener('resize', this.handleResize);
    },

    handleSidebarToggle() {
      this.sidebarCollapsed = !this.sidebarCollapsed;
      localStorage.setItem('adminSidebarCollapsed', JSON.stringify(this.sidebarCollapsed));
    },

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

      if (this.isMobile) {
        this.sidebarCollapsed = true;
      }

      if (routes[menu]) {
        this.$router.push(routes[menu]);
      }
    },

    handleUserDropdownToggle() {
      this.showUserDropdown = !this.showUserDropdown;
    },

    handleMenuAction(action) {
      if (action === 'profile') {
        this.$router.push('/admin/profile');
      } else if (action === 'settings') {
        this.$router.push('/admin/settings');
      }
      this.showUserDropdown = false;
    },

    closeMobileSidebar() {
      if (this.isMobile) {
        this.sidebarCollapsed = true;
      }
    },

    handleLogout() {
      unifiedAuthService.logout();
      this.$router.push('/login');
    },

    async loadAdminProfile() {
      try {
        const user = unifiedAuthService.getCurrentUser();
        if (user && user.profile) {
          this.adminData = user.profile;
        } else {
          this.adminData = {
            first_name: user?.username || 'Admin',
            role: user?.role || 'admin'
          };
        }
      } catch (error) {
        console.error('Failed to load admin profile:', error);
        const user = unifiedAuthService.getCurrentUser();
        this.adminData = {
          first_name: user?.username || 'Admin',
          role: user?.role || 'admin'
        };
      }
    },

    setDefaultDateRange() {
      const today = new Date();
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());

      this.reportFilters.date_to = today.toISOString().split('T')[0];
      this.reportFilters.date_from = lastMonth.toISOString().split('T')[0];
    },

    async loadAnalyticsData() {
      try {
        this.loading = true;
        const response = await adminDocumentService.getAnalyticsData(this.selectedPeriod);

        // Enhanced error checking and data validation
        if (response && response.success && response.data) {
          this.analyticsData = response.data;
          console.log('✅ Analytics data loaded successfully:', this.analyticsData);
        } else {
          console.error('❌ Invalid analytics response:', response);
          throw new Error(response?.message || 'Invalid response format');
        }
      } catch (error) {
        console.error('Failed to load analytics data:', error);

        // Enhanced error handling with specific error messages
        let errorMessage = 'Failed to load analytics data';

        // Handle different error formats
        if (error.response) {
          // Direct API response error
          if (error.response.status === 500) {
            errorMessage = 'Server error while loading analytics. Please try again later.';
          } else if (error.response.status === 401) {
            errorMessage = 'Authentication required. Please log in again.';
          } else if (error.response.data?.message) {
            errorMessage = error.response.data.message;
          }
        } else if (error.message) {
          // Check if error message is JSON string (from service handleError)
          try {
            const parsedError = JSON.parse(error.message);
            if (parsedError.message) {
              errorMessage = parsedError.message;
            }
            if (parsedError.status === 500) {
              errorMessage = 'Server error while loading analytics. Please try again later.';
            }
          } catch (parseError) {
            // Not JSON, use original message
            errorMessage = error.message;
          }
        }

        // Safe toast notification
        if (this.$toast && typeof this.$toast.error === 'function') {
          this.$toast.error(errorMessage);
        } else {
          console.error('Toast not available, error message:', errorMessage);
        }

        // Set empty analytics data to prevent undefined errors
        this.analyticsData = {
          trends: [],
          documentTypes: [],
          statusDistribution: [],
          topClients: []
        };
      } finally {
        this.loading = false;
      }
    },

    async onPeriodChange() {
      await this.loadAnalyticsData();
    },

    async generateReport() {
      try {
        this.loading = true;
        const response = await adminDocumentService.generateReport(
          this.reportFilters.reportType,
          this.reportFilters
        );

        if (this.reportFilters.format === 'csv') {
          // CSV download is handled by the service
          this.$toast.success('Report downloaded successfully');
        } else {
          // Display JSON data (could open in modal or new tab)
          console.log('Report data:', response.data);
          this.$toast.success('Report generated successfully');
        }
      } catch (error) {
        console.error('Failed to generate report:', error);
        this.$toast.error('Failed to generate report');
      } finally {
        this.loading = false;
      }
    },

    async downloadReport() {
      try {
        this.loading = true;
        await adminDocumentService.downloadReport(
          this.reportFilters.reportType,
          this.reportFilters
        );
        this.$toast.success('Report downloaded successfully');
      } catch (error) {
        console.error('Failed to download report:', error);
        this.$toast.error('Failed to download report');
      } finally {
        this.loading = false;
      }
    },

    // PDF Export functionality (copied from RequestHistory.vue)
    async exportToPDF() {
      if (!this.isPDFExportValid()) {
        this.$toast.error('Please select a valid date range for the report');
        return;
      }

      try {
        this.pdfExportForm.loading = true;

        // Get filtered data based on report type
        const reportData = await this.getReportData();

        if (!reportData || !Array.isArray(reportData) || reportData.length === 0) {
          this.$toast.warning('No data found for the selected date range');
          return;
        }

        // Generate PDF
        const pdf = new jsPDF();

        // Debug: Check autoTable availability
        console.log('🔧 PDF Debug Info:', {
          autoTableAvailable: typeof autoTable === 'function',
          reportDataLength: reportData.length,
          sampleData: reportData.length > 0 ? reportData[0] : null
        });

        // Verify autoTable is available
        if (typeof autoTable !== 'function') {
          console.error('❌ autoTable function not available!');

          // Safe toast notification with fallback
          if (this.$toast && this.$toast.error) {
            this.$toast.error('PDF table plugin failed to load. Please refresh the page.');
          } else {
            alert('PDF table plugin failed to load. Please refresh the page.');
          }
          return;
        }

        console.log('✅ autoTable function is available');

        this.generatePDFReport(pdf, reportData);

        // Download PDF
        const filename = this.getPDFFilename();
        pdf.save(filename);

        // Check if toast is available before using it
        if (this.$toast && this.$toast.success) {
          this.$toast.success('PDF report generated successfully');
        } else {
          console.log('✅ PDF report generated successfully');
        }
      } catch (error) {
        console.error('Failed to generate PDF report:', error);

        // Safe toast notification with fallback
        if (this.$toast && this.$toast.error) {
          this.$toast.error('Failed to generate PDF report');
        } else {
          alert('Failed to generate PDF report. Check console for details.');
        }
      } finally {
        this.pdfExportForm.loading = false;
      }
    },

    // Get client requests data for the selected period
    async getClientRequestsData() {
      try {
        // Calculate date range based on selected period
        const dateRange = this.getDateRangeForPeriod();

        const response = await adminDocumentService.getAllRequests({
          date_from: dateRange.from,
          date_to: dateRange.to,
          page: 1,
          limit: 1000 // Get all data for the report
        });

        if (response.success && response.data.requests) {
          return response.data.requests;
        }

        return [];
      } catch (error) {
        console.error('Failed to fetch client requests data:', error);
        return [];
      }
    },

    // Get date range based on selected period
    getDateRangeForPeriod() {
      const today = new Date();
      let fromDate;

      switch (this.selectedPeriod) {
        case 'day':
          fromDate = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000)); // Last 30 days
          break;
        case 'week':
          fromDate = new Date(today.getTime() - (12 * 7 * 24 * 60 * 60 * 1000)); // Last 12 weeks
          break;
        case 'month':
        default:
          fromDate = new Date(today.getTime() - (12 * 30 * 24 * 60 * 60 * 1000)); // Last 12 months
          break;
      }

      return {
        from: fromDate.toISOString().split('T')[0],
        to: today.toISOString().split('T')[0]
      };
    },

    // Generate PDF content for analytics report
    generateAnalyticsPDF(pdf, clientRequestsData = []) {
      // Document Header
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(44, 62, 80);
      pdf.text('BARANGAY ANALYTICS REPORT', 105, 25, { align: 'center' });

      // Decorative line
      pdf.setDrawColor(52, 152, 219);
      pdf.setLineWidth(1);
      pdf.line(20, 30, 190, 30);

      // Report metadata
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);

      const periodText = this.selectedPeriod.charAt(0).toUpperCase() + this.selectedPeriod.slice(1);
      const generatedDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      pdf.text(`Report Period: ${periodText}`, 20, 45);
      pdf.text(`Generated: ${generatedDate}`, 20, 55);

      let yPosition = 75;

      // Request Trends Section
      if (this.analyticsData.trends && this.analyticsData.trends.length > 0) {
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(52, 152, 219);
        pdf.text('REQUEST TRENDS', 20, yPosition);
        yPosition += 15;

        // Prepare trends data for table
        const trendsHeaders = ['Period', 'Total Requests', 'Completed', 'Pending', 'Revenue (₱)'];
        const trendsData = this.analyticsData.trends.map(trend => [
          trend.period || 'N/A',
          trend.total_requests || '0',
          trend.completed_requests || '0',
          trend.pending_requests || '0',
          this.formatCurrency(trend.total_revenue || 0)
        ]);

        // Add trends table
        pdf.autoTable({
          head: [trendsHeaders],
          body: trendsData,
          startY: yPosition,
          theme: 'grid',
          headStyles: {
            fillColor: [52, 152, 219],
            textColor: 255,
            fontStyle: 'bold'
          },
          styles: {
            fontSize: 10,
            cellPadding: 4
          },
          columnStyles: {
            0: { cellWidth: 40 },
            1: { cellWidth: 30, halign: 'center' },
            2: { cellWidth: 30, halign: 'center' },
            3: { cellWidth: 30, halign: 'center' },
            4: { cellWidth: 40, halign: 'right' }
          }
        });

        yPosition = pdf.lastAutoTable.finalY + 20;
      }

      // Status Distribution Section
      if (this.analyticsData.statusDistribution && this.analyticsData.statusDistribution.length > 0) {
        // Check if we need a new page
        if (yPosition > 200) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(52, 152, 219);
        pdf.text('STATUS DISTRIBUTION', 20, yPosition);
        yPosition += 15;

        // Prepare status distribution data for table
        const statusHeaders = ['Status', 'Count', 'Percentage'];
        const totalRequests = this.analyticsData.statusDistribution.reduce((sum, status) => sum + (parseInt(status.count) || 0), 0);

        const statusData = this.analyticsData.statusDistribution.map(status => {
          const count = parseInt(status.count) || 0;
          const percentage = totalRequests > 0 ? ((count / totalRequests) * 100).toFixed(1) + '%' : '0%';
          return [
            status.status_name || 'Unknown',
            count.toString(),
            percentage
          ];
        });

        // Add status distribution table
        pdf.autoTable({
          head: [statusHeaders],
          body: statusData,
          startY: yPosition,
          theme: 'grid',
          headStyles: {
            fillColor: [52, 152, 219],
            textColor: 255,
            fontStyle: 'bold'
          },
          styles: {
            fontSize: 10,
            cellPadding: 4
          },
          columnStyles: {
            0: { cellWidth: 80 },
            1: { cellWidth: 40, halign: 'center' },
            2: { cellWidth: 40, halign: 'center' }
          }
        });

        yPosition = pdf.lastAutoTable.finalY + 20;
      }

      // Top Clients Section
      if (this.analyticsData.topClients && this.analyticsData.topClients.length > 0) {
        // Check if we need a new page
        if (yPosition > 200) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(52, 152, 219);
        pdf.text('TOP CLIENTS', 20, yPosition);
        yPosition += 15;

        // Prepare top clients data for table
        const clientsHeaders = ['Client Name', 'Email', 'Total Requests', 'Total Spent (₱)'];
        const clientsData = this.analyticsData.topClients.map(client => [
          client.client_name || 'N/A',
          client.email || 'N/A',
          client.request_count || '0',
          this.formatCurrency(client.total_spent || 0)
        ]);

        // Add top clients table
        pdf.autoTable({
          head: [clientsHeaders],
          body: clientsData,
          startY: yPosition,
          theme: 'grid',
          headStyles: {
            fillColor: [52, 152, 219],
            textColor: 255,
            fontStyle: 'bold'
          },
          styles: {
            fontSize: 10,
            cellPadding: 4
          },
          columnStyles: {
            0: { cellWidth: 60 },
            1: { cellWidth: 60 },
            2: { cellWidth: 30, halign: 'center' },
            3: { cellWidth: 40, halign: 'right' }
          }
        });
      }

      // Client Requests Section
      if (clientRequestsData && clientRequestsData.length > 0) {
        // Check if we need a new page
        if (yPosition > 150) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(52, 152, 219);
        pdf.text('CLIENT REQUESTS', 20, yPosition);
        yPosition += 15;

        // Prepare client requests data for table
        const requestsHeaders = ['Request #', 'Client Name', 'Document Type', 'Status', 'Amount (₱)', 'Date'];
        const requestsData = clientRequestsData.slice(0, 50).map(request => [ // Limit to 50 requests to avoid huge PDFs
          request.request_number || 'N/A',
          this.getClientFullName(request) || 'N/A',
          request.document_type || 'N/A',
          this.formatStatus(request.status_name) || 'N/A',
          this.formatCurrency(request.total_document_fee || request.total_fee || 0),
          this.formatDate(request.requested_at) || 'N/A'
        ]);

        // Add client requests table
        pdf.autoTable({
          head: [requestsHeaders],
          body: requestsData,
          startY: yPosition,
          theme: 'grid',
          headStyles: {
            fillColor: [52, 152, 219],
            textColor: 255,
            fontStyle: 'bold'
          },
          styles: {
            fontSize: 9,
            cellPadding: 3
          },
          columnStyles: {
            0: { cellWidth: 25 },
            1: { cellWidth: 40 },
            2: { cellWidth: 35 },
            3: { cellWidth: 25 },
            4: { cellWidth: 25, halign: 'right' },
            5: { cellWidth: 25, halign: 'center' }
          }
        });

        // Add note if there are more requests
        if (clientRequestsData.length > 50) {
          const finalY = pdf.lastAutoTable.finalY + 10;
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'italic');
          pdf.setTextColor(100, 100, 100);
          pdf.text(`Note: Showing first 50 of ${clientRequestsData.length} total requests for this period.`, 20, finalY);
        }
      }

      // Add footer
      this.addAnalyticsPDFFooter(pdf);
    },

    // Add professional footer to analytics PDF
    addAnalyticsPDFFooter(pdf) {
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

        // Right side - Page number
        pdf.text(`Page ${i} of ${pageCount}`, 190, 285, { align: 'right' });
      }
    },

    // Format currency for display
    formatCurrency(amount) {
      const numAmount = parseFloat(amount) || 0;
      return `₱${numAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    },

    // Helper methods for formatting data in PDF
    getClientFullName(request) {
      if (request.client_name) return request.client_name;

      const firstName = request.client_first_name || request.first_name || '';
      const lastName = request.client_last_name || request.last_name || '';

      return `${firstName} ${lastName}`.trim() || 'N/A';
    },

    formatStatus(status) {
      if (!status) return 'N/A';

      // Capitalize first letter of each word
      return status.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    },

    formatDate(dateString) {
      if (!dateString) return 'N/A';

      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      } catch (error) {
        return 'N/A';
      }
    },

    // Generate PDF report content (copied from RequestHistory.vue)
    generatePDFReport(pdf, data) {
      const dateRange = this.getDateRangeForReport();

      // Document Header with improved styling
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(44, 62, 80);
      pdf.text('BARANGAY BULA', 105, 25, { align: 'center' });

      pdf.setFontSize(18);
      pdf.setTextColor(52, 152, 219);
      pdf.text('DOCUMENT MANAGEMENT SYSTEM', 105, 35, { align: 'center' });

      // Decorative line
      pdf.setDrawColor(52, 152, 219);
      pdf.setLineWidth(1);
      pdf.line(20, 40, 190, 40);

      // Report title
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(44, 62, 80);
      const reportTitle = this.getReportTitle();
      pdf.text(reportTitle, 20, 55);

      // Date range with improved formatting
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      const dateRangeText = this.getDateRangeText(dateRange);
      pdf.text(`Report Period: ${dateRangeText}`, 20, 65);

      // Generated date
      const generatedDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      pdf.text(`Generated on: ${generatedDate}`, 20, 75);

      // Summary statistics
      const stats = this.calculateReportStats(data);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('REPORT SUMMARY', 20, 90);

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Total Requests: ${stats.total}`, 20, 100);
      pdf.text(`Completed: ${stats.completed}`, 20, 110);
      pdf.text(`Pending: ${stats.pending}`, 20, 120);
      pdf.text(`Rejected: ${stats.rejected}`, 20, 130);
      pdf.text(`Total Revenue: ${this.formatCurrencyForPDF(stats.totalRevenue)}`, 20, 140);

      // Requests table
      if (data && data.length > 0) {
        const tableData = data.slice(0, 100).map(request => [
          request.request_number || 'N/A',
          this.getClientFullName(request) || 'N/A',
          this.getBeneficiaryName(request) || 'N/A',
          this.getPickupPersonName(request) || 'N/A',
          request.document_type || 'N/A',
          this.formatStatus(request.status_name) || 'N/A',
          this.formatCurrencyForPDF(request.total_document_fee || request.total_fee || 0),
          this.formatDate(request.requested_at) || 'N/A'
        ]);

        // Use autoTable function (v5.x syntax)
        try {
          console.log('🔧 Calling autoTable function');
          autoTable(pdf, {
            head: [['Request #', 'Client Name', 'Beneficiary', 'Pickup Person', 'Document Type', 'Status', 'Amount', 'Date']],
            body: tableData,
            startY: 155,
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
              0: { cellWidth: 20 },                    // Request #
              1: { cellWidth: 25, overflow: 'linebreak' },  // Client Name (wrappable)
              2: { cellWidth: 25, overflow: 'linebreak' },  // Beneficiary (wrappable)
              3: { cellWidth: 22, overflow: 'linebreak' },  // Pickup Person (wrappable)
              4: { cellWidth: 22 },                    // Document Type
              5: { cellWidth: 18 },                    // Status
              6: { cellWidth: 20, halign: 'right' },   // Amount
              7: { cellWidth: 18, halign: 'center' }   // Date
            }
          });
          console.log('✅ AutoTable completed successfully');
        } catch (autoTableError) {
          console.error('❌ AutoTable call failed:', autoTableError);
          throw new Error(`AutoTable failed: ${autoTableError.message}`);
        }
      }

      // Add footer
      this.addAnalyticsPDFFooter(pdf);
    },

    // Calculate report statistics (copied from RequestHistory.vue)
    calculateReportStats(data) {
      if (!data || !Array.isArray(data) || data.length === 0) {
        return {
          total: 0,
          completed: 0,
          pending: 0,
          rejected: 0,
          totalRevenue: 0
        };
      }

      const stats = {
        total: data.length,
        completed: 0,
        pending: 0,
        rejected: 0,
        totalRevenue: 0
      };

      data.forEach(request => {
        const status = (request.status_name || '').toLowerCase();

        // Calculate total revenue for ALL requests in the report (not just completed)
        const fee = parseFloat(request.total_document_fee || request.total_fee || 0);
        stats.totalRevenue += fee;

        // Count status categories
        if (status === 'completed') {
          stats.completed++;
        } else if (status === 'rejected' || status === 'cancelled') {
          stats.rejected++;
        } else {
          stats.pending++;
        }
      });

      return stats;
    },

    formatCurrencyForPDF(amount) {
      const numAmount = parseFloat(amount) || 0;
      return `PHP ${numAmount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`;
    },

    // Get beneficiary name for third-party requests
    getBeneficiaryName(request) {
      console.log('🔍 getBeneficiaryName called with:', {
        is_third_party_request: request.is_third_party_request,
        beneficiary_name: request.beneficiary_name,
        beneficiary: request.beneficiary
      });

      if (!request.is_third_party_request) {
        return 'Self';
      }

      // Try different possible field names for beneficiary
      if (request.beneficiary_name) {
        return request.beneficiary_name;
      }

      if (request.beneficiary && request.beneficiary.full_name) {
        return request.beneficiary.full_name;
      }

      if (request.beneficiary) {
        const firstName = request.beneficiary.first_name || '';
        const lastName = request.beneficiary.last_name || '';
        const fullName = `${firstName} ${lastName}`.trim();
        if (fullName) return fullName;
      }

      return 'N/A';
    },

    // Get pickup person name
    getPickupPersonName(request) {
      console.log('🔍 getPickupPersonName called with:', {
        pickup_person_name: request.pickup_person_name,
        authorized_pickup: request.authorized_pickup
      });

      // Check for pickup person name field
      if (request.pickup_person_name) {
        return request.pickup_person_name;
      }

      // Check for authorized pickup object
      if (request.authorized_pickup && request.authorized_pickup.full_name) {
        return request.authorized_pickup.full_name;
      }

      // Default to client pickup
      return 'Client';
    },

    // Ensure jsPDF autoTable plugin is available (v5.x uses function export)
    ensureAutoTablePlugin() {
      try {
        if (typeof autoTable === 'function') {
          console.log('✅ jsPDF autoTable function is available (v5.x)');
          return true;
        } else {
          console.error('❌ autoTable function not available');
          return false;
        }
      } catch (error) {
        console.error('❌ Error checking autoTable plugin:', error);
        return false;
      }
    },

    // Initialize PDF export form with default values (copied from RequestHistory.vue)
    initializePDFExportForm() {
      // Set default date to today
      this.pdfExportForm.selectedDate = this.getCurrentDate();

      // Set default week to current week
      this.pdfExportForm.selectedWeek = this.getCurrentWeek();

      // Set default month to current month
      this.pdfExportForm.selectedMonth = this.getCurrentMonth();
    },

    // Get report data based on selected filters (copied from RequestHistory.vue)
    async getReportData() {
      const reportFilters = {
        status: '', // Get all statuses
        document_type: '',
        priority: '',
        search: ''
      };

      // Set date range based on report type
      const dateRange = this.getDateRangeForReport();
      reportFilters.date_from = dateRange.from;
      reportFilters.date_to = dateRange.to;

      try {
        console.log('📊 Fetching report data with filters:', reportFilters);
        console.log('📊 Date range details:', {
          reportType: this.pdfExportForm.reportType,
          selectedDate: this.pdfExportForm.selectedDate,
          selectedWeek: this.pdfExportForm.selectedWeek,
          selectedMonth: this.pdfExportForm.selectedMonth,
          calculatedRange: dateRange
        });
        const response = await adminDocumentService.getAllRequests({
          ...reportFilters,
          page: 1,
          limit: 1000 // Get all data for the report
        });

        if (response.success && response.data && response.data.requests) {
          console.log(`📊 Retrieved ${response.data.requests.length} requests for report`);

          // Debug: Log sample request data to check fields
          if (response.data.requests.length > 0) {
            console.log('📊 Sample request data:', response.data.requests[0]);
            console.log('📊 Available fields:', Object.keys(response.data.requests[0]));
            console.log('📊 Beneficiary fields check:', {
              is_third_party_request: response.data.requests[0].is_third_party_request,
              beneficiary_name: response.data.requests[0].beneficiary_name,
              pickup_person_name: response.data.requests[0].pickup_person_name
            });
          }

          return response.data.requests;
        } else {
          console.warn('📊 No data returned from API');
          return [];
        }
      } catch (error) {
        console.error('📊 Failed to fetch report data:', error);
        throw error;
      }
    },

    // Get date range based on report type and selected values (copied from RequestHistory.vue)
    getDateRangeForReport() {
      const { reportType, selectedDate, selectedWeek, selectedMonth } = this.pdfExportForm;

      switch (reportType) {
        case 'daily':
          return {
            from: selectedDate,
            to: selectedDate
          };

        case 'weekly':
          if (selectedWeek) {
            const [year, week] = selectedWeek.split('-W');
            const startDate = this.getDateFromWeek(parseInt(year), parseInt(week));
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 6);

            return {
              from: startDate.toISOString().split('T')[0],
              to: endDate.toISOString().split('T')[0]
            };
          }
          break;

        case 'monthly':
          if (selectedMonth) {
            const [year, month] = selectedMonth.split('-');
            const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
            const endDate = new Date(parseInt(year), parseInt(month), 0);

            return {
              from: startDate.toISOString().split('T')[0],
              to: endDate.toISOString().split('T')[0]
            };
          }
          break;
      }

      // Fallback to today
      const today = new Date().toISOString().split('T')[0];
      return { from: today, to: today };
    },

    // Helper methods for PDF export (copied from RequestHistory.vue)
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

    // Helper methods for date handling (copied from RequestHistory.vue)
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
    }
  }
};
</script>

<style scoped>
@import './css/adminDashboard.css';

/* Report card styles */
.report-card {
  cursor: pointer;
  transition: all 0.3s ease;
}

.report-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 0.5rem 2rem 0 rgba(58, 59, 69, 0.3);
}

.report-card:active {
  transform: translateY(-1px);
}

/* Icon circle for reports */
.icon-circle {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

/* Table improvements */
.table-sm th,
.table-sm td {
  padding: 0.5rem;
  font-size: 0.875rem;
}

/* Form improvements */
.form-control-sm,
.form-select-sm {
  font-size: 0.875rem;
}

/* Badge improvements */
.badge {
  font-size: 0.75rem;
  padding: 0.375rem 0.75rem;
}

/* Responsive improvements */
@media (max-width: 768px) {
  .report-card .card-body {
    padding: 1rem;
  }

  .icon-circle {
    width: 2.5rem;
    height: 2.5rem;
    font-size: 1rem;
  }

  .btn-group {
    flex-direction: column;
  }

  .btn-group .btn {
    border-radius: 0.375rem !important;
    margin-bottom: 0.25rem;
  }
}
</style>
