<template>
  <div class="document-request-page">
    <!-- Background -->
    <!-- <div class="background-container">
      <div class="background-image" role="presentation"></div>
      <div class="background-overlay" role="presentation"></div>
    </div> -->

    <!-- Page Content Wrapper -->
    <div class="page-content-wrapper">

    <!-- Client Header with Navigation -->
    <ClientHeader
      :user-data="headerUserData"
      :ui-state="headerUIState"
      :show-breadcrumbs="true"
      :can-request-documents="canRequestDocuments"
      @sidebar-toggle="handleSidebarToggle"
      @user-dropdown-toggle="handleUserDropdownToggle"
      @menu-action="handleMenuAction"
      @logout="handleLogout"
      @error="handleError"
      @search="handleSearch"
    />

    <!-- Main Content -->
    <main class="main-content" :class="{ 'sidebar-collapsed': uiState.sidebarCollapsed }">

      <!-- Document Services Section -->
      <DocumentServicesSection
        ref="servicesSection"
        :document-types="documentTypes"
        :loading="loading"
        :error="error"
        :can-request-documents="canRequestDocuments"
        :status-message="statusMessage"
        :refreshing-status="refreshingStatus"
        @select-document="selectDocumentType"
        @retry-load="loadDocumentTypes"
        @open-faq="openHelp"
        @contact-support="contactSupport"
        @refresh-status="refreshResidencyStatus"
      />

      <!-- Quick Actions Section -->
      <section class="quick-actions-section">
        <div class="container">
          <div class="quick-actions-grid" style="display: flex; gap: 1rem;">
            <button
              class="action-btn my-requests-btn"
              @click="goToMyRequests"
              :disabled="loading || !canRequestDocuments"
              :class="{ 'disabled': !canRequestDocuments }"
            >
              <div class="action-icon">
                <i class="fas fa-clock" aria-hidden="true"></i>
              </div>
              <div class="action-content">
                <h3 class="action-title">My Requests</h3>
                <p class="action-description" v-if="canRequestDocuments">View and track your document requests</p>
                <p class="action-description" v-else>{{ statusMessage }}</p>
              </div>
              <div class="action-arrow">
                <i class="fas fa-chevron-right" aria-hidden="true"></i>
              </div>
            </button>

            <button
              class="action-btn transactions-btn"
              @click="goToTransactions"
              :disabled="loading || !canRequestDocuments"
              :class="{ 'disabled': !canRequestDocuments }"
            >
              <div class="action-icon">
                <i class="fas fa-receipt" aria-hidden="true"></i>
              </div>
              <div class="action-content">
                <h3 class="action-title">Online Transactions</h3>
                <p class="action-description" v-if="canRequestDocuments">View your payment receipts and transaction history</p>
                <p class="action-description" v-else>{{ statusMessage }}</p>
              </div>
              <div class="action-arrow">
                <i class="fas fa-chevron-right" aria-hidden="true"></i>
              </div>
            </button>
          </div>
        </div>
      </section>

    </main>

    <!-- Help & Information Footer -->
    <footer class="page-footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-info">
            <h4 class="footer-title">Need Help Getting Started?</h4>
            <p class="footer-description">Learn about requirements, process steps, and get support for your document requests.</p>
          </div>
          <div class="footer-actions">
            <button class="help-btn" @click="openHelp">
              <i class="fas fa-question-circle" aria-hidden="true"></i>
              <span>View Requirements & Process</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
    </div>

    <!-- Help Dialog Modal -->
    <div v-if="showHelpDialog" class="dialog-overlay" @click="closeDialog">
      <div class="dialog-content" @click.stop>
        <div class="dialog-header">
          <h3 class="dialog-title">Document Services Information</h3>
          <button class="dialog-close" @click="closeDialog" aria-label="Close dialog">
            <i class="fas fa-times" aria-hidden="true"></i>
          </button>
        </div>
        
        <div class="dialog-body">
          <div class="help-sections">
            <!-- Requirements Section -->
            <div class="help-section">
              <div class="section-header">
                <i class="fas fa-clipboard-list" aria-hidden="true"></i>
                <h4>Before You Start</h4>
              </div>
              <ul class="requirements-list">
                <li v-for="requirement in helpData.requirements" :key="requirement.id" class="requirement-item">
                  <i class="fas fa-check-circle" aria-hidden="true"></i>
                  <span>{{ requirement.text }}</span>
                </li>
              </ul>
            </div>

            <!-- Process Steps Section -->
            <div class="help-section">
              <div class="section-header">
                <i class="fas fa-route" aria-hidden="true"></i>
                <h4>How It Works</h4>
              </div>
              <ol class="process-steps">
                <li v-for="step in helpData.processSteps" :key="step.number" class="process-step">
                  <div class="step-number">{{ step.number }}</div>
                  <div class="step-content">
                    <strong>{{ step.title }}</strong>
                    <span>{{ step.description }}</span>
                  </div>
                </li>
              </ol>
            </div>

            <!-- Support Section -->
            <!-- <div class="help-section">
              <div class="section-header">
                <i class="fas fa-headset" aria-hidden="true"></i>
                <h4>Need Assistance?</h4>
              </div>
              <p class="support-description">Our support team is here to help you with any questions about document requirements or the application process.</p>
              <div class="support-actions">
                <button class="support-action-btn faq-btn" @click="handleOpenFAQ">
                  <i class="fas fa-question-circle" aria-hidden="true"></i>
                  <span>View FAQ</span>
                </button>
                <button class="support-action-btn contact-btn" @click="handleContactSupport">
                  <i class="fas fa-phone" aria-hidden="true"></i>
                  <span>Contact Support</span>
                </button>
              </div>
            </div>-->
            
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import ClientHeader from './ClientHeader.vue'

import DocumentServicesSection from './components/DocumentServicesSection.vue'
import { useUserData } from '@/composables/useUserData'
import { useDocumentTypes } from '@/composables/useDocumentTypes'
import { useUserStats } from '@/composables/useUserStats'
import { useUIState } from '@/composables/useUIState'
import { useNavigation } from '@/composables/useNavigation'
import { useErrorHandler } from '@/composables/useErrorHandler'

export default {
  name: 'NewDocumentRequest',
  components: {
    ClientHeader,
    DocumentServicesSection
  },
  setup() {
    const router = useRouter()
    const servicesSection = ref(null)

    // Help Dialog State
    const showHelpDialog = ref(false)

    // Help Data
    const helpData = ref({
      requirements: [
        { id: 1, text: 'Valid government-issued ID (original and photocopy)' },
        { id: 2, text: 'Proof of residency (utility bill, lease agreement, etc.)' },
        { id: 3, text: 'Completed application form with accurate information' },
        { id: 4, text: 'Payment for processing fees' },
        { id: 5, text: 'Additional documents as specified for each document type' }
      ],
      processSteps: [
        {
          number: 1,
          title: 'Choose Document Type',
          description: 'Select the document you need from the available services'
        },
        {
          number: 2,
          title: 'Fill Application Form',
          description: 'Complete all required fields with accurate information'
        },
        {
          number: 3,
          title: 'Upload Requirements',
          description: 'Attach all necessary documents and supporting files'
        },
        {
          number: 4,
          title: 'Submit & Pay',
          description: 'Review your application and proceed with payment'
        },
        {
          number: 5,
          title: 'Track Progress',
          description: 'Monitor your request status and receive notifications'
        },
        {
          number: 6,
          title: 'Collect Document',
          description: 'Pick up your processed document at the barangay office'
        }
      ]
    })

    // Composables
    const { userData, loadUserData, resetUserData } = useUserData()
    const { documentTypes, loading, error, loadDocumentTypes } = useDocumentTypes()
    const { userStats, loadUserStats } = useUserStats()
    const { uiState, toggleSidebar, toggleUserDropdown } = useUIState()
    const { navigateToRoute, scrollToElement } = useNavigation()
    const { handleError } = useErrorHandler()

    // Computed properties for header
    const headerUserData = computed(() => {
      console.log('=== NewDocumentRequest - userData from composable ===');
      console.log('userData:', userData);
      console.log('userData keys:', Object.keys(userData));

      const result = {
        userName: userData.userName,
        userEmail: userData.userEmail,
        userAvatar: userData.userAvatar,
        firstName: userData.firstName,
        lastName: userData.lastName,
        middleName: userData.middleName,
        suffix: userData.suffix,
        profile: userData.profile
      };

      console.log('headerUserData result:', result);
      return result;
    })

    const headerUIState = computed(() => ({
      showUserDropdown: uiState.showUserDropdown,
      sidebarCollapsed: uiState.sidebarCollapsed,
      activeMenu: 'services'
    }))

    // Account status computed property
    const isAccountActive = computed(() => {
      const unifiedAuthService = require('@/services/unifiedAuthService').default;
      const currentUser = unifiedAuthService.getCurrentUser();

      // Check if account is verified (OTP/email verification)
      const isAccountVerified = currentUser?.status === 'active';

      // For document requests, we need to check residency verification status
      // If user has pending residency verification, they should still be able to request documents
      // Only block if account is not verified at all
      return isAccountVerified;
    })

    // Residency verification status
    const residencyStatus = ref({
      status: 'loading',
      canRequestDocuments: false,
      message: 'Checking residency verification status...',
      documents: []
    })

    // Load residency verification status
    const loadResidencyStatus = async () => {
      try {
        const residencyVerificationService = require('@/services/residencyVerificationService').default;
        const status = await residencyVerificationService.getResidencyVerificationStatus();
        residencyStatus.value = status;
      } catch (error) {
        console.error('Error loading residency status:', error);
        residencyStatus.value = {
          status: 'error',
          canRequestDocuments: false,
          message: 'Unable to check residency verification status',
          documents: []
        };
      }
    }

    // Refresh residency status (can be called manually)
    const refreshingStatus = ref(false);
    const refreshResidencyStatus = async () => {
      if (refreshingStatus.value) return; // Prevent multiple simultaneous refreshes

      console.log('Refreshing residency verification status...');
      refreshingStatus.value = true;
      try {
        await loadResidencyStatus();
        // Show a brief success message if status changed
        if (residencyStatus.value.canRequestDocuments) {
          console.log('✅ Residency verification approved! You can now request documents.');
        }
      } finally {
        refreshingStatus.value = false;
      }
    }

    // Computed property for document request availability
    const canRequestDocuments = computed(() => {
      return isAccountActive.value && residencyStatus.value.canRequestDocuments;
    })

    // Computed property for status message
    const statusMessage = computed(() => {
      if (!isAccountActive.value) {
        return 'Account verification required';
      }
      return residencyStatus.value.message;
    })

    // Set up periodic residency status check
    let statusCheckInterval = null;

    // Initialize data on mount
    onMounted(async () => {
      try {
        await Promise.all([
          loadUserData(),
          loadDocumentTypes(),
          loadUserStats(),
          loadResidencyStatus()
        ])

        // Set up periodic check for residency status updates (every 30 seconds)
        // This helps catch status changes made by admins
        statusCheckInterval = setInterval(async () => {
          if (residencyStatus.value.status === 'pending') {
            console.log('Checking for residency status updates...');
            await loadResidencyStatus();
          }
        }, 30000); // Check every 30 seconds

      } catch (error) {
        handleError(error, 'Failed to initialize page data')
      }
    })

    // Cleanup on unmount
    onUnmounted(() => {
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
      }
    })
    // Event handlers
    const handleSidebarToggle = () => {
      toggleSidebar()
    }

    const handleUserDropdownToggle = () => {
      toggleUserDropdown()
    }

    const handleMenuAction = (action) => {
      navigateToRoute(action)
    }

    const handleLogout = async () => {
      try {
        // Import the auth service
        const unifiedAuthService = await import('@/services/unifiedAuthService')

        // Clear authentication data
        unifiedAuthService.default.logout()

        // Reset user data
        resetUserData()

        // Clear any cached data
        localStorage.clear()
        sessionStorage.clear()

        // Redirect to welcome page
        await router.push({ name: 'WelcomePage' })

        // Force page reload to ensure clean state
        window.location.reload()

      } catch (error) {
        console.error('Logout error:', error)
        handleError(error, 'Logout failed')

        // Force redirect even if there's an error
        window.location.href = '/login'
      }
    }

    const handleSearch = (query) => {
      // TODO: Implement search functionality
      console.log('Search query:', query)
    }

    // Navigation methods
    const scrollToServices = async () => {
      await nextTick()
      scrollToElement(servicesSection.value)
    }

    const goToMyRequests = () => {
      router.push({ name: 'MyRequests' })
    }

    const goToTransactions = () => {
      router.push({ name: 'ClientTransactions' })
    }

    const goToProfile = () => {
      router.push({ name: 'ClientProfile' })
    }

    // Help Dialog Functions
    const openHelp = () => {
      showHelpDialog.value = true
    }

    const closeDialog = () => {
      showHelpDialog.value = false
    }

    const handleOpenFAQ = () => {
      // TODO: Navigate to FAQ page or open FAQ modal
      console.log('Opening FAQ...')
    }

    const handleContactSupport = () => {
      // TODO: Implement contact support functionality
      console.log('Contacting support...')
    }

    const contactSupport = () => {
      handleContactSupport()
    }

    const selectDocumentType = (documentType) => {
      if (!documentType.is_active) return

      const routeMap = {
        'Barangay Clearance': 'BarangayClearanceRequest',
        'Cedula': 'CedulaRequest'
      }

      const routeName = routeMap[documentType.type_name]
      if (routeName) {
        router.push({
          name: routeName,
          params: { documentTypeId: documentType.id }
        })
      }
    }

    return {
      // Refs
      servicesSection,

      // Reactive data
      userData,
      documentTypes,
      userStats,
      uiState,
      loading,
      error,

      // Computed
      headerUserData,
      headerUIState,
      isAccountActive,
      canRequestDocuments,
      statusMessage,

      // Residency status
      residencyStatus,
      refreshingStatus,

      // Methods
      handleSidebarToggle,
      handleUserDropdownToggle,
      handleMenuAction,
      handleLogout,
      handleError,
      handleSearch,
      scrollToServices,
      goToMyRequests,
      goToTransactions,
      goToProfile,
      openHelp,
      closeDialog,
      handleOpenFAQ,
      handleContactSupport,
      contactSupport,
      selectDocumentType,
      loadResidencyStatus,
      refreshResidencyStatus,

      // Help Dialog Data
      showHelpDialog,
      helpData,

      loadDocumentTypes
    }
  }
}
</script>

<style scoped>
/* Modern Document Request Page Layout */
.document-request-page {
  font-family: var(--font-family-sans, 'Source Sans Pro', system-ui, sans-serif);
  color: var(--color-text, #1e293b);
  line-height: 1.6;
  min-height: 100vh;
  position: relative;
}

.page-content-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
}

/* Background Setup */
.background-container {
  position: fixed;
  inset: 0;
  z-index: -2;
}

.background-image {
  width: 100%;
  height: 100%;
  background-image: url('@/assets/bula-request-background-pic.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  opacity: 0.4;
}

.background-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(0, 94, 162, 0.6) 0%,
    rgba(35, 120, 195, 0.5) 50%,
    rgba(0, 94, 162, 0.6) 100%
  );
  z-index: -1;
}

/* Main Content */
.main-content {
  margin-top: 140px; /* Account for fixed header */
  transition: margin-left 0.2s ease-in-out;
  padding: 2rem 0;
  position: relative;
  z-index: 1;
  flex: 1; /* Take up available space */
}

/* Quick Actions Section */
.quick-actions-section {
  padding: 2rem 0;
  position: relative;
  z-index: 1;
}

.quick-actions-grid {
  display: flex;
  justify-content: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.action-btn {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(15px);
  border: 2px solid rgba(0, 94, 162, 0.3);
  border-radius: 1.25rem;
  padding: 2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 94, 162, 0.15);
  text-align: left;
  min-width: 350px;
  max-width: 500px;
}

.action-btn:hover:not(:disabled) {
  border-color: var(--gov-blue, #005ea2);
  transform: translateY(-8px);
  box-shadow: 0 16px 40px rgba(0, 94, 162, 0.25);
  background: rgba(255, 255, 255, 1);
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.transactions-btn .action-icon {
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.transactions-btn:hover:not(:disabled) .action-icon {
  background: linear-gradient(135deg, #5a67d8, #6b46c1);
}

.action-icon {
  flex-shrink: 0;
  width: 4rem;
  height: 4rem;
  background: linear-gradient(135deg, var(--gov-blue, #005ea2), var(--gov-blue-light, #2378c3));
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  box-shadow: 0 4px 15px rgba(0, 94, 162, 0.3);
}

.action-content {
  flex: 1;
}

.action-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--gov-blue, #005ea2);
  margin-bottom: 0.5rem;
}

.action-description {
  color: var(--text-secondary, #454545);
  margin: 0;
  line-height: 1.5;
}

.action-arrow {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  color: #d1d5db;
  font-size: 1.25rem;
}

.main-content.sidebar-collapsed {
  margin-left: 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .main-content {
    margin-top: 120px;
    padding-bottom: 2rem;
  }

  .action-btn {
    flex-direction: column;
    text-align: center;
    padding: 1.5rem;
    min-width: auto;
    max-width: none;
    width: 100%;
  }

  .quick-actions-grid {
    padding: 0 1rem;
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .main-content {
    transition: none;
  }
}

/* Focus styles for better accessibility */
:focus-visible {
  outline: 3px solid var(--gov-yellow, #ffbe2e);
  outline-offset: 2px;
}

/* Page Footer Styles */
.page-footer {
  margin-top: auto;
  padding: 2rem 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border-top: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 2;
}

.footer-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.footer-info {
  flex: 1;
}

.footer-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.5rem;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
}

.footer-description {
  color: #64748b;
  margin: 0;
  line-height: 1.5;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5);
}

.footer-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-shrink: 0;
}

.help-btn,
.support-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  cursor: pointer;
  border: none;
  text-decoration: none;
  white-space: nowrap;
}

.help-btn {
  background: #3b82f6;
  color: white;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
}

.help-btn:hover {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.support-btn {
  background: rgba(255, 255, 255, 0.9);
  color: #64748b;
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.support-btn:hover {
  background: rgba(255, 255, 255, 1);
  color: #1e293b;
  border-color: rgba(255, 255, 255, 0.8);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Responsive Footer Design */
@media (max-width: 768px) {
  .page-footer {
    padding: 1.5rem 0;
  }

  .footer-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
    padding: 0 1rem;
  }

  .footer-actions {
    width: 100%;
    justify-content: stretch;
  }

  .help-btn,
  .support-btn {
    flex: 1;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .footer-actions {
    flex-direction: column;
    gap: 0.75rem;
  }

  .help-btn,
  .support-btn {
    width: 100%;
  }
}

/* Help Dialog Modal Styles */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.dialog-content {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}

.dialog-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.dialog-close {
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.375rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dialog-close:hover {
  background: #e2e8f0;
  color: #1e293b;
}

.dialog-body {
  padding: 2rem;
  overflow-y: auto;
  max-height: calc(90vh - 120px);
}

.help-sections {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.help-section {
  background: #f8fafc;
  border-radius: 0.75rem;
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.section-header i {
  color: #3b82f6;
  font-size: 1.25rem;
}

.section-header h4 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.requirements-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.requirement-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem;
  background: white;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
}

.requirement-item i {
  color: #10b981;
  font-size: 1rem;
  margin-top: 0.125rem;
  flex-shrink: 0;
}

.requirement-item span {
  color: #374151;
  line-height: 1.5;
}

.process-steps {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.process-step {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
}

.step-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background: #3b82f6;
  color: white;
  border-radius: 50%;
  font-weight: 600;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
}

.step-content strong {
  display: block;
  color: #1e293b;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.step-content span {
  color: #64748b;
  line-height: 1.5;
}

.support-description {
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.support-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.support-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  cursor: pointer;
  border: none;
  text-decoration: none;
}

.faq-btn {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.faq-btn:hover {
  background: #e5e7eb;
  color: #1f2937;
  transform: translateY(-1px);
}

.contact-btn {
  background: #3b82f6;
  color: white;
}

.contact-btn:hover {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

/* Responsive Dialog Design */
@media (max-width: 768px) {
  .dialog-content {
    margin: 1rem;
    max-height: calc(100vh - 2rem);
  }

  .dialog-header {
    padding: 1rem 1.5rem;
  }

  .dialog-body {
    padding: 1.5rem;
    max-height: calc(100vh - 140px);
  }

  .help-sections {
    gap: 1.5rem;
  }

  .help-section {
    padding: 1rem;
  }

  .support-actions {
    flex-direction: column;
  }

  .support-action-btn {
    justify-content: center;
  }
}

</style>
