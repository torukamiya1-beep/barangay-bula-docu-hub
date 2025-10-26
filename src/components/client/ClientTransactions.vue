<template>
  <div class="transactions-page">
    <!-- Header -->
    <div class="page-header">
      <div class="container">
        <div class="header-content">
          <div class="header-text">
            <button
              class="btn btn-outline-secondary back-button"
              @click="goBack"
              title="Go back to previous page"
            >
              <i class="fas fa-arrow-left"></i>
              Back
            </button>
            <div class="title-section">
              <h1 class="page-title">Online Transactions</h1>
              <p class="page-description">View your payment receipts and transaction history</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container">

      <!-- I will not use the statics for now -->
      <!-- Statistics Cards -->
      <!-- <div class="stats-grid" v-if="statistics">
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-receipt"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ statistics.total_receipts || 0 }}</div>
            <div class="stat-label">Total Receipts</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ statistics.successful_payments || 0 }}</div>
            <div class="stat-label">Successful Payments</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-peso-sign"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">₱{{ formatAmount(statistics.total_amount_paid) }}</div>
            <div class="stat-label">Total Amount Paid</div>
          </div>
        </div>
      </div> -->

      <!-- Search Section -->
      <div class="search-section">
        <div class="search-container">
          <div class="search-input-group">
            <i class="fas fa-search search-icon"></i>
            <input
              type="text"
              v-model="searchQuery"
              @input="handleSearch"
              placeholder="Search transactions by receipt number, amount, or status..."
              class="search-input"
            >
            <button
              v-if="searchQuery"
              @click="clearSearch"
              class="clear-search-btn"
              type="button"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Transactions Table -->
      <div class="transactions-section">
        <div class="section-header">
          <h2>Payment Receipts</h2>
          <div class="section-actions">
            <span class="results-count" v-if="pagination.total">
              Showing {{ ((pagination.page - 1) * pagination.limit) + 1 }} -
              {{ Math.min(pagination.page * pagination.limit, pagination.total) }}
              of {{ pagination.total }} receipts
            </span>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i>
          </div>
          <p>Loading transactions...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-state">
          <div class="error-icon">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <h3>Error Loading Transactions</h3>
          <p>{{ error }}</p>
          <button class="btn btn-primary" @click="loadTransactions">
            <i class="fas fa-retry"></i>
            Try Again
          </button>
        </div>

        <!-- Empty State -->
        <div v-else-if="!transactions.length" class="empty-state">
          <div class="empty-icon">
            <i class="fas fa-receipt"></i>
          </div>
          <h3>No Transactions Found</h3>
          <p>You haven't made any online payments yet.</p>
          <router-link to="/client/home" class="btn btn-primary">
            <i class="fas fa-plus"></i>
            Make a Request
          </router-link>
        </div>

        <!-- Transactions Table - Desktop View -->
        <div v-else class="transactions-container">
          <!-- Desktop Table View -->
          <div class="table-responsive desktop-table">
            <table class="table transactions-table">
              <thead>
                <tr>
                  <th>Receipt #</th>
                  <th>Client Name</th>
                  <th>Document Type</th>
                  <th>Amount</th>
                  <th>Payment Method</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="transaction in transactions" :key="transaction.id" class="transaction-row">
                  <td>
                    <span class="receipt-number">{{ transaction.receipt_number }}</span>
                  </td>
                  <td>
                    <span class="client-name">{{ transaction.client_name }}</span>
                  </td>
                  <td>
                    <span class="document-type">{{ transaction.document_type }}</span>
                  </td>
                  <td>
                    <span class="amount">₱{{ formatAmount(transaction.amount) }}</span>
                  </td>
                  <td>
                    <span class="payment-method">{{ transaction.payment_method }}</span>
                  </td>
                  <td>
                    <span class="date">{{ formatDate(transaction.receipt_date) }}</span>
                  </td>
                  <td>
                    <span
                      class="status-badge"
                      :class="`status-${transaction.payment_status}`"
                    >
                      {{ formatStatus(transaction.payment_status) }}
                    </span>
                  </td>
                  <td>
                    <div class="action-buttons">
                      <button
                        class="btn btn-sm btn-primary"
                        @click="viewTransaction(transaction)"
                        title="View Details"
                      >
                        <i class="fas fa-eye"></i>
                        View
                      </button>
                      <button
                        class="btn btn-sm btn-success"
                        @click="downloadReceiptDirect(transaction)"
                        :disabled="downloadingReceipt === transaction.id"
                        title="Download Receipt"
                      >
                        <i class="fas fa-download" :class="{ 'fa-spin': downloadingReceipt === transaction.id }"></i>
                        <span class="btn-text">PDF</span>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Mobile Card View -->
          <div class="mobile-cards">
            <div
              v-for="transaction in transactions"
              :key="transaction.id"
              class="transaction-card"
            >
              <div class="card-header">
                <div class="receipt-info">
                  <span class="receipt-number">{{ transaction.receipt_number }}</span>
                  <span
                    class="status-badge"
                    :class="`status-${transaction.payment_status}`"
                  >
                    {{ formatStatus(transaction.payment_status) }}
                  </span>
                </div>
                <div class="amount">₱{{ formatAmount(transaction.amount) }}</div>
              </div>

              <div class="card-body">
                <div class="transaction-info">
                  <div class="info-row">
                    <span class="label">Client:</span>
                    <span class="value">{{ transaction.client_name }}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">Document:</span>
                    <span class="value">{{ transaction.document_type }}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">Payment Method:</span>
                    <span class="value">{{ transaction.payment_method }}</span>
                  </div>
                  <div class="info-row">
                    <span class="label">Date:</span>
                    <span class="value">{{ formatDate(transaction.receipt_date) }}</span>
                  </div>
                </div>
              </div>

              <div class="card-footer">
                <button
                  class="btn btn-sm btn-primary"
                  @click="viewTransaction(transaction)"
                >
                  <i class="fas fa-eye"></i>
                  View Details
                </button>
                <button
                  class="btn btn-sm btn-success"
                  @click="downloadReceiptDirect(transaction)"
                  :disabled="downloadingReceipt === transaction.id"
                >
                  <i class="fas fa-download" :class="{ 'fa-spin': downloadingReceipt === transaction.id }"></i>
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="pagination.totalPages > 1" class="pagination-section">
          <nav aria-label="Transactions pagination">
            <ul class="pagination">
              <li class="page-item" :class="{ disabled: !pagination.hasPrev }">
                <button
                  class="page-link"
                  @click="changePage(pagination.page - 1)"
                  :disabled="!pagination.hasPrev"
                >
                  <i class="fas fa-chevron-left"></i>
                  Previous
                </button>
              </li>

              <li
                v-for="page in visiblePages"
                :key="page"
                class="page-item"
                :class="{ active: page === pagination.page }"
              >
                <button class="page-link" @click="changePage(page)">
                  {{ page }}
                </button>
              </li>

              <li class="page-item" :class="{ disabled: !pagination.hasNext }">
                <button
                  class="page-link"
                  @click="changePage(pagination.page + 1)"
                  :disabled="!pagination.hasNext"
                >
                  Next
                  <i class="fas fa-chevron-right"></i>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>

    <!-- Transaction Details Modal -->
    <div v-if="showTransactionModal" class="modal-overlay" @click="closeTransactionModal">
      <div class="modal-content transaction-modal" @click.stop>
        <div class="modal-header">
          <h3>Transaction Details</h3>
          <button class="modal-close" @click="closeTransactionModal">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body" v-if="selectedTransaction">
          <div class="transaction-details">
            <!-- Receipt Information -->
            <div class="detail-section">
              <h4>Receipt Information</h4>
              <div class="detail-grid">
                <div class="detail-item">
                  <label>Receipt Number</label>
                  <span class="receipt-number">{{ selectedTransaction.receipt_number }}</span>
                </div>
                <div class="detail-item">
                  <label>Receipt Date</label>
                  <span>{{ formatDateTime(selectedTransaction.receipt_date) }}</span>
                </div>
                <div class="detail-item">
                  <label>Payment Date</label>
                  <span>{{ formatDateTime(selectedTransaction.payment_date) }}</span>
                </div>
              </div>
            </div>

            <!-- Client Information -->
            <div class="detail-section">
              <h4>Client Information</h4>
              <div class="detail-grid">
                <div class="detail-item">
                  <label>Full Name</label>
                  <span>{{ selectedTransaction.client_name }}</span>
                </div>
                <div class="detail-item">
                  <label>Email</label>
                  <span>{{ selectedTransaction.client_email }}</span>
                </div>
                <div class="detail-item">
                  <label>Phone</label>
                  <span>{{ selectedTransaction.client_phone }}</span>
                </div>
              </div>
            </div>

            <!-- Request Information -->
            <div class="detail-section">
              <h4>Request Information</h4>
              <div class="detail-grid">
                <div class="detail-item">
                  <label>Request Number</label>
                  <span>{{ selectedTransaction.request_number }}</span>
                </div>
                <div class="detail-item">
                  <label>Document Type</label>
                  <span>{{ selectedTransaction.document_type }}</span>
                </div>
              </div>
            </div>

            <!-- Payment Information -->
            <div class="detail-section">
              <h4>Payment Information</h4>
              <div class="detail-grid">
                <div class="detail-item">
                  <label>Payment Method</label>
                  <span>{{ selectedTransaction.payment_method }}</span>
                </div>
                <div class="detail-item">
                  <label>Amount</label>
                  <span class="amount">₱{{ formatAmount(selectedTransaction.amount) }}</span>
                </div>
                <!-- <div class="detail-item">
                  <label>Processing Fee</label>
                  <span>₱{{ formatAmount(selectedTransaction.processing_fee) }}</span>
                </div> -->
                <!-- <div class="detail-item">
                  <label>Net Amount</label>
                  <span class="net-amount">₱{{ formatAmount(selectedTransaction.net_amount) }}</span>
                </div> -->
                <!-- <div class="detail-item">
                  <label>Status</label>
                  <span
                    class="status-badge"
                    :class="`status-${selectedTransaction.payment_status}`"
                  >
                    {{ formatStatus(selectedTransaction.payment_status) }}
                  </span>
                </div> -->
              </div>
            </div>

            <!-- Transaction IDs -->
            <div class="detail-section" v-if="selectedTransaction.external_transaction_id">
              <h4>Transaction References</h4>
              <div class="detail-grid">
                <div class="detail-item" v-if="selectedTransaction.external_transaction_id">
                  <label>External Transaction ID</label>
                  <span class="transaction-id">{{ selectedTransaction.external_transaction_id }}</span>
                </div>
                <div class="detail-item" v-if="selectedTransaction.paymongo_payment_intent_id">
                  <label>PayMongo Payment Intent</label>
                  <span class="transaction-id">{{ selectedTransaction.paymongo_payment_intent_id }}</span>
                </div>
              </div>
            </div>

            <!-- Description -->
            <div class="detail-section" v-if="selectedTransaction.description">
              <h4>Description</h4>
              <p class="description">{{ selectedTransaction.description }}</p>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-outline-primary" @click="downloadReceipt" :disabled="downloadingReceipt">
            <i class="fas fa-download" :class="{ 'fa-spin': downloadingReceipt }"></i>
            {{ downloadingReceipt ? 'Preparing...' : 'Download Receipt' }}
          </button>
          <button class="btn btn-secondary" @click="closeTransactionModal">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api'
import jsPDF from 'jspdf'

export default {
  name: 'ClientTransactions',
  data() {
    return {
      transactions: [],
      allTransactions: [], // Store all transactions for client-side search
      statistics: null,
      loading: false,
      error: null,
      showTransactionModal: false,
      selectedTransaction: null,
      downloadingReceipt: false, // Can be boolean or transaction ID for specific loading
      searchQuery: '',
      searchTimeout: null,
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
      }
    }
  },
  computed: {
    visiblePages() {
      const current = this.pagination.page
      const total = this.pagination.totalPages
      const delta = 1
      const pages = []

      const left = current - delta
      const right = current + delta

      let last

      for (let i = 1; i <= total; i++) {
        if (i === 1 || i === total || (i >= left && i <= right)) {
          if (last && i - last > 1) {
            pages.push('...')
          }
          pages.push(i)
          last = i
        }
      }
      return pages
    }
  },
  async mounted() {
    await this.loadTransactions()
    await this.loadStatistics()
  },
  methods: {

    async loadTransactions() {
      try {
        this.loading = true
        this.error = null

        const params = {
          page: this.pagination.page,
          limit: this.pagination.limit,
          sortBy: 'receipt_date',
          sortOrder: 'DESC'
        }

        const response = await api.get('/client/receipts', { params })

        if (response.data.success) {
          this.allTransactions = response.data.data.receipts || []
          this.applySearchAndPagination()
        } else {
          throw new Error(response.data.message || 'Failed to load transactions')
        }
      } catch (error) {
        console.error('Failed to load transactions:', error)
        this.error = error.response?.data?.message || error.message || 'Failed to load transactions'
        this.transactions = []
        this.allTransactions = []
      } finally {
        this.loading = false
      }
    },

    async loadStatistics() {
      try {
        const response = await api.get('/client/receipts/statistics')

        if (response.data.success) {
          this.statistics = response.data.data
        }
      } catch (error) {
        console.error('Failed to load statistics:', error)
        // Don't show error for statistics, it's not critical
      }
    },

    goBack() {
      this.$router.go(-1)
    },

    applySearchAndPagination() {
      // Filter transactions based on search query
      let filteredTransactions = this.allTransactions

      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase().trim()
        filteredTransactions = this.allTransactions.filter(transaction => {
          return (
            transaction.receipt_number?.toLowerCase().includes(query) ||
            transaction.amount?.toString().includes(query) ||
            transaction.status?.toLowerCase().includes(query) ||
            transaction.payment_method?.toLowerCase().includes(query) ||
            transaction.document_type?.toLowerCase().includes(query)
          )
        })
      }

      // Calculate pagination
      const total = filteredTransactions.length
      const totalPages = Math.ceil(total / this.pagination.limit)
      const startIndex = (this.pagination.page - 1) * this.pagination.limit
      const endIndex = startIndex + this.pagination.limit

      // Update pagination info
      this.pagination.total = total
      this.pagination.totalPages = totalPages

      // Ensure current page is valid
      if (this.pagination.page > totalPages && totalPages > 0) {
        this.pagination.page = totalPages
        this.applySearchAndPagination() // Recursive call with corrected page
        return
      }

      // Set current page transactions
      this.transactions = filteredTransactions.slice(startIndex, endIndex)
    },

    handleSearch() {
      // Clear existing timeout
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout)
      }

      // Debounce search to avoid excessive filtering
      this.searchTimeout = setTimeout(() => {
        this.pagination.page = 1 // Reset to first page when searching
        this.applySearchAndPagination()
      }, 300)
    },

    clearSearch() {
      this.searchQuery = ''
      this.pagination.page = 1
      this.applySearchAndPagination()
    },

    changePage(page) {
      if (page >= 1 && page <= this.pagination.totalPages && page !== this.pagination.page) {
        this.pagination.page = page
        this.applySearchAndPagination()
      }
    },

    async viewTransaction(transaction) {
      try {
        this.loading = true
        const response = await api.get(`/client/receipts/${transaction.id}`)

        if (response.data.success) {
          this.selectedTransaction = response.data.data
          this.showTransactionModal = true
        } else {
          throw new Error(response.data.message || 'Failed to load transaction details')
        }
      } catch (error) {
        console.error('Failed to load transaction details:', error)
        this.$toast.error(error.response?.data?.message || 'Failed to load transaction details')
      } finally {
        this.loading = false
      }
    },

    closeTransactionModal() {
      this.showTransactionModal = false
      this.selectedTransaction = null
    },

    async downloadReceipt() {
      if (!this.selectedTransaction) return
      await this.generatePDF(this.selectedTransaction)
    },

    async downloadReceiptDirect(transaction) {
      await this.generatePDF(transaction)
    },

    async generatePDF(transaction) {
      try {
        this.downloadingReceipt = transaction.id

        // Get complete transaction details if not already available
        let transactionData = transaction
        if (!transaction.client_email) {
          const response = await api.get(`/client/receipts/${transaction.id}`)
          if (response.data.success) {
            transactionData = response.data.data
          }
        }

        // Create PDF
        const pdf = new jsPDF()

        // Set up fonts and colors
        const primaryColor = [45, 55, 72] // #2d3748
        const accentColor = [102, 126, 234] // #667eea
        const textColor = [74, 85, 104] // #4a5568

        // Header
        pdf.setFillColor(...primaryColor)
        pdf.rect(0, 0, 210, 40, 'F')

        // Title
        pdf.setTextColor(255, 255, 255)
        pdf.setFontSize(24)
        pdf.setFont('helvetica', 'bold')
        pdf.text('PAYMENT RECEIPT', 105, 20, { align: 'center' })

        pdf.setFontSize(12)
        pdf.setFont('helvetica', 'normal')
        pdf.text('Barangay Online Services for Document Requests', 105, 30, { align: 'center' })

        // Reset text color
        pdf.setTextColor(...textColor)

        // Receipt Information Section
        let yPos = 60
        pdf.setFontSize(16)
        pdf.setFont('helvetica', 'bold')
        pdf.setTextColor(...accentColor)
        pdf.text('Receipt Information', 20, yPos)

        yPos += 15
        pdf.setFontSize(11)
        pdf.setFont('helvetica', 'normal')
        pdf.setTextColor(...textColor)

        const receiptInfo = [
          ['Receipt Number:', transactionData.receipt_number || 'N/A'],
          ['Receipt Date:', this.formatDate(transactionData.receipt_date)],
          ['Payment Date:', this.formatDate(transactionData.payment_date || transactionData.receipt_date)],
          ['Status:', this.formatStatus(transactionData.payment_status)]
        ]

        receiptInfo.forEach(([label, value]) => {
          pdf.setFont('helvetica', 'bold')
          pdf.text(label, 20, yPos)
          pdf.setFont('helvetica', 'normal')
          pdf.text(value, 80, yPos)
          yPos += 8
        })

        // Client Information Section
        yPos += 10
        pdf.setFontSize(16)
        pdf.setFont('helvetica', 'bold')
        pdf.setTextColor(...accentColor)
        pdf.text('Client Information', 20, yPos)

        yPos += 15
        pdf.setFontSize(11)
        pdf.setFont('helvetica', 'normal')
        pdf.setTextColor(...textColor)

        const clientInfo = [
          ['Client Name:', transactionData.client_name || 'N/A'],
          ['Email:', transactionData.client_email || 'N/A'],
          ['Phone:', transactionData.client_phone || 'N/A']
        ]

        clientInfo.forEach(([label, value]) => {
          pdf.setFont('helvetica', 'bold')
          pdf.text(label, 20, yPos)
          pdf.setFont('helvetica', 'normal')
          pdf.text(value, 80, yPos)
          yPos += 8
        })

        // Document Information Section
        yPos += 10
        pdf.setFontSize(16)
        pdf.setFont('helvetica', 'bold')
        pdf.setTextColor(...accentColor)
        pdf.text('Document Information', 20, yPos)

        yPos += 15
        pdf.setFontSize(11)
        pdf.setFont('helvetica', 'normal')
        pdf.setTextColor(...textColor)

        const documentInfo = [
          ['Request Number:', transactionData.request_number || 'N/A'],
          ['Document Type:', transactionData.document_type || 'N/A'],
          ['Description:', transactionData.description || 'Payment for document request']
        ]

        documentInfo.forEach(([label, value]) => {
          pdf.setFont('helvetica', 'bold')
          pdf.text(label, 20, yPos)
          pdf.setFont('helvetica', 'normal')
          // Handle long text wrapping
          const splitText = pdf.splitTextToSize(value, 110)
          pdf.text(splitText, 80, yPos)
          yPos += splitText.length * 6
        })

        // Payment Information Section
        yPos += 10
        pdf.setFontSize(16)
        pdf.setFont('helvetica', 'bold')
        pdf.setTextColor(...accentColor)
        pdf.text('Payment Information', 20, yPos)

        yPos += 15
        pdf.setFontSize(11)
        pdf.setFont('helvetica', 'normal')
        pdf.setTextColor(...textColor)

        const paymentInfo = [
          ['Payment Method:', transactionData.payment_method || 'Online Payment'],
          ['Amount:', `PHP ${this.formatAmount(transactionData.amount)}`],
          ['Processing Fee:', `PHP ${this.formatAmount(transactionData.processing_fee || 0)}`],
          ['Net Amount:', `PHP ${this.formatAmount(transactionData.net_amount || transactionData.amount)}`],
          ['Currency:', transactionData.currency || 'PHP']
        ]

        paymentInfo.forEach(([label, value]) => {
          pdf.setFont('helvetica', 'bold')
          pdf.text(label, 20, yPos)
          pdf.setFont('helvetica', 'normal')
          pdf.text(value, 80, yPos)
          yPos += 8
        })

        // Total Amount Highlight
        yPos += 5
        pdf.setFillColor(248, 250, 252) // Light gray background
        pdf.rect(15, yPos - 5, 180, 15, 'F')
        pdf.setFontSize(14)
        pdf.setFont('helvetica', 'bold')
        pdf.setTextColor(...primaryColor)
        pdf.text('Total Amount Paid:', 20, yPos + 5)
        pdf.setTextColor(...accentColor)
        pdf.text(`PHP ${this.formatAmount(transactionData.net_amount || transactionData.amount)}`, 120, yPos + 5)

        // Footer
        yPos += 25 // Position footer after content with a gap
        if (yPos < 270) {
          // Ensure footer is at least at the bottom
          yPos = 270
        }
        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'normal')
        pdf.setTextColor(128, 128, 128)
        pdf.text('This is a computer-generated receipt. No signature required.', 105, yPos, { align: 'center' })
        pdf.text(`Generated on: ${new Date().toLocaleString()}`, 105, yPos + 8, { align: 'center' })

        // Transaction ID footer
        if (transactionData.external_transaction_id) {
          pdf.text(`Transaction ID: ${transactionData.external_transaction_id}`, 105, yPos + 16, { align: 'center' })
        }

        // Generate filename
        const filename = `Receipt_${transactionData.receipt_number || transactionData.id}_${new Date().toISOString().split('T')[0]}.pdf`

        // Save the PDF
        pdf.save(filename)

        // Show success message
        if (this.$toast) {
          this.$toast.success('Receipt downloaded successfully!')
        }

      } catch (error) {
        console.error('Failed to generate PDF:', error)
        if (this.$toast) {
          this.$toast.error('Failed to generate PDF receipt')
        }
      } finally {
        this.downloadingReceipt = false
      }
    },

    formatAmount(amount) {
      if (!amount) return '0.00'
      return parseFloat(amount).toFixed(2)
    },

    formatDate(dateString) {
      if (!dateString) return 'N/A'
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    },

    formatDateTime(dateString) {
      if (!dateString) return 'N/A'
      const date = new Date(dateString)
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },

    formatStatus(status) {
      const statusMap = {
        'succeeded': 'Successful',
        'pending': 'Pending',
        'processing': 'Processing',
        'failed': 'Failed',
        'cancelled': 'Cancelled',
        'refunded': 'Refunded'
      }
      return statusMap[status] || status
    }
  }
}
</script>

<style scoped>
.transactions-page {
  min-height: 100vh;
  background-color: #f8f9fa;
}

/* Header Styles */
.page-header {
  background: #f8f9fa;
  color: #2d3748;
  padding: 2rem 0;
  margin-bottom: 2rem;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-text {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.back-button {
  background: #2d3748;
  border: 1px solid #2d3748;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.back-button:hover {
  background: #4a5568;
  border-color: #4a5568;
  color: white;
  transform: translateY(-1px);
}

.back-button:active {
  transform: translateY(0);
}

.title-section {
  flex: 1;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
}

.page-description {
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 0.5rem 0 0 0;
}



/* Statistics Cards */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
}

.stat-card:nth-child(1) .stat-icon {
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.stat-card:nth-child(2) .stat-icon {
  background: linear-gradient(135deg, #f093fb, #f5576c);
}

.stat-card:nth-child(3) .stat-icon {
  background: linear-gradient(135deg, #4facfe, #00f2fe);
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
  line-height: 1;
}

.stat-label {
  font-size: 0.9rem;
  color: #718096;
  margin-top: 0.25rem;
}

/* Search Section */
.search-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.search-container {
  max-width: 600px;
  margin: 0 auto;
}

.search-input-group {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 1rem;
  color: #a0aec0;
  z-index: 2;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background: #f7fafc;
}

.search-input:focus {
  outline: none;
  border-color: #4299e1;
  background: white;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
}

.clear-search-btn {
  position: absolute;
  right: 0.5rem;
  background: none;
  border: none;
  color: #a0aec0;
  padding: 0.5rem;
  cursor: pointer;
  border-radius: 4px;
  transition: color 0.2s ease;
}

.clear-search-btn:hover {
  color: #718096;
}

/* Transactions Section */
.transactions-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f7fafc;
}

.section-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
}

.results-count {
  font-size: 0.9rem;
  color: #718096;
}

/* State Styles */
.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
}

.loading-spinner,
.error-icon,
.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.loading-spinner {
  color: #667eea;
}

.error-icon {
  color: #f56565;
}

.empty-icon {
  color: #a0aec0;
}

.loading-state p,
.error-state p,
.empty-state p {
  color: #718096;
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
}

.error-state h3,
.empty-state h3 {
  color: #4a5568;
  margin-bottom: 1rem;
}

/* Table Styles */
.table-responsive {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.transactions-table {
  margin: 0;
  background: white;
}

.transactions-table thead {
  background: #f7fafc;
}

.transactions-table th {
  font-weight: 600;
  color: #4a5568;
  border-bottom: 2px solid #e2e8f0;
  padding: 1rem 0.75rem;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.transactions-table td {
  padding: 1rem 0.75rem;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.transaction-row:hover {
  background-color: #f8fafc;
}

.receipt-number {
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: #667eea;
}

.client-name {
  font-weight: 500;
  color: #2d3748;
}

.document-type {
  color: #4a5568;
}

.amount {
  font-weight: 600;
  color: #2d3748;
}

.payment-method {
  color: #4a5568;
}

.date {
  color: #718096;
  font-size: 0.9rem;
}

/* Status Badges */
.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-succeeded {
  background-color: #c6f6d5;
  color: #22543d;
}

.status-pending {
  background-color: #fef5e7;
  color: #c05621;
}

.status-processing {
  background-color: #e6fffa;
  color: #234e52;
}

.status-failed {
  background-color: #fed7d7;
  color: #742a2a;
}

.status-cancelled {
  background-color: #e2e8f0;
  color: #4a5568;
}

.status-refunded {
  background-color: #e6fffa;
  color: #234e52;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.action-buttons .btn {
  min-width: auto;
  padding: 0.375rem 0.75rem;
}

.action-buttons .btn-text {
  margin-left: 0.25rem;
}

/* Responsive Design */
.transactions-container {
  position: relative;
}

/* Desktop Table - Hidden on mobile */
.desktop-table {
  display: block;
}

/* Mobile Cards - Hidden on desktop */
.mobile-cards {
  display: none;
}

/* Mobile Card Styles */
.transaction-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.transaction-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.card-header {
  background: #f7fafc;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid #e2e8f0;
}

.receipt-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.card-header .receipt-number {
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: #667eea;
  font-size: 0.9rem;
}

.card-header .amount {
  font-size: 1.25rem;
  font-weight: 700;
  color: #2d3748;
}

.card-body {
  padding: 1rem;
}

.transaction-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f1f5f9;
}

.info-row:last-child {
  border-bottom: none;
}

.info-row .label {
  font-weight: 600;
  color: #4a5568;
  font-size: 0.9rem;
}

.info-row .value {
  color: #2d3748;
  font-size: 0.9rem;
  text-align: right;
  flex: 1;
  margin-left: 1rem;
}

.card-footer {
  padding: 1rem;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.card-footer .btn {
  flex: 1;
  max-width: 120px;
}

/* Pagination */
.pagination-section {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
}

.pagination {
  display: flex;
  gap: 0.25rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.page-item {
  display: flex;
}

.page-link {
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  background: white;
  color: #4a5568;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.2s ease;
  cursor: pointer;
  font-size: 0.9rem;
}

.page-link:hover:not(:disabled) {
  background: #f7fafc;
  border-color: #cbd5e0;
  color: #2d3748;
}

.page-item.active .page-link {
  background: #667eea;
  border-color: #667eea;
  color: white;
}

.page-item.disabled .page-link {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #a0aec0;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: #f7fafc;
  color: #4a5568;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

/* Transaction Details */
.transaction-details {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.detail-section h4 {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #f7fafc;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-item label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.detail-item span {
  font-size: 1rem;
  color: #2d3748;
}

.detail-item .receipt-number {
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: #667eea;
}

.detail-item .amount,
.detail-item .net-amount {
  font-weight: 600;
  font-size: 1.1rem;
}

.detail-item .transaction-id {
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  color: #4a5568;
  word-break: break-all;
}

.description {
  color: #4a5568;
  line-height: 1.6;
  margin: 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
  }

  .header-text {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    width: 100%;
  }

  .back-button {
    align-self: flex-start;
  }

  .title-section {
    width: 100%;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .search-container {
    max-width: 100%;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  /* Hide desktop table, show mobile cards */
  .desktop-table {
    display: none;
  }

  .mobile-cards {
    display: block;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }

  .modal-content {
    margin: 1rem;
    max-height: calc(100vh - 2rem);
  }

  .modal-footer {
    flex-direction: column;
    gap: 0.75rem;
  }

  .modal-footer .btn {
    width: 100%;
  }

  .pagination {
    flex-wrap: wrap;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .page-header {
    padding: 1.5rem 0;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .page-description {
    font-size: 0.9rem;
  }

  .back-button {
    font-size: 0.7rem;
    padding: 0.3rem 0.6rem;
  }

  .container {
    padding: 0 1rem;
  }

  .stat-card {
    padding: 1rem;
  }

  .stat-value {
    font-size: 1.5rem;
  }

  .search-section,
  .transactions-section {
    padding: 1rem;
  }

  .modal-overlay {
    padding: 0.5rem;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 1rem;
  }

  /* Mobile card adjustments */
  .transaction-card {
    margin-bottom: 0.75rem;
  }

  .card-header {
    padding: 0.75rem;
  }

  .card-body {
    padding: 0.75rem;
  }

  .card-footer {
    padding: 0.75rem;
    flex-direction: column;
    gap: 0.5rem;
  }

  .card-footer .btn {
    max-width: none;
    width: 100%;
  }

  .info-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .info-row .value {
    text-align: left;
    margin-left: 0;
  }
}

/* Tablet responsive adjustments */
@media (max-width: 1024px) and (min-width: 769px) {
  .action-buttons {
    flex-direction: column;
    gap: 0.25rem;
  }

  .action-buttons .btn {
    font-size: 0.8rem;
    padding: 0.25rem 0.5rem;
  }

  .action-buttons .btn-text {
    display: none;
  }
}
</style>