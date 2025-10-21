import { createRouter, createWebHistory } from 'vue-router';
import unifiedAuthService from '@/services/unifiedAuthService';

// Import components with error handling
const AdminRegistration = () => import('@/components/admin/AdminRegistration.vue');
const AdminDashboard = () => import('@/components/admin/AdminDashboard.vue');
const AdminTest = () => import('@/components/admin/AdminTest.vue');
const ClientRegistration = () => import('@/components/client/ClientRegistration.vue');
const UnifiedLogin = () => import('@/components/UnifiedLogin.vue');
const WelcomePage = () => import('@/components/WelcomePage.vue');

const routes = [
  // Default route - redirect to welcome page
  {
    path: '/',
    redirect: '/welcome'
  },

  // Welcome page route
  {
    path: '/welcome',
    name: 'WelcomePage',
    component: WelcomePage,
    meta: {
      title: 'Welcome to Barangay Bula',
      requiresGuest: true // Only accessible when not logged in
    }
  },

  // Unified login route
  {
    path: '/login',
    name: 'UnifiedLogin',
    component: UnifiedLogin,
    meta: {
      title: 'Login',
      requiresGuest: true // Only accessible when not logged in
    }
  },
  
  // Client routes
  {
    path: '/client/login',
    redirect: '/login' // Redirect old client login to unified login
  },
  {
    path: '/client/register',
    name: 'ClientRegistration',
    component: ClientRegistration,
    meta: { 
      title: 'Client Registration',
      requiresGuest: true
    }
  },
  {
    path: '/client/dashboard',
    name: 'ClientDashboard',
    redirect: '/client/home' // Redirect old dashboard to new home page
  },
  {
    path: '/client/home',
    name: 'ClientHome',
    component: () => import('@/components/client/NewDocumentRequest.vue'),
    meta: {
      title: 'Client Portal - Barangay Bula',
      requiresAuth: true // Only accessible when logged in
    }
  },
  {
    path: '/client/request/new',
    name: 'NewDocumentRequest',
    redirect: '/client/home' // Redirect to new home page
  },
  {
    path: '/client/request/barangay-clearance',
    name: 'BarangayClearanceRequest',
    component: () => import('@/components/client/BarangayClearanceRequest.vue'),
    meta: {
      title: 'Barangay Clearance Request',
      requiresAuth: true
    }
  },
  {
    path: '/client/request/cedula',
    name: 'CedulaRequest',
    component: () => import('@/components/client/CedulaRequest.vue'),
    meta: {
      title: 'Cedula Request',
      requiresAuth: true
    }
  },
  {
    path: '/client/requests',
    name: 'MyRequests',
    component: () => import('@/components/client/MyRequests.vue'),
    meta: {
      title: 'My Requests',
      requiresAuth: true
    }
  },
  {
    path: '/client/transactions',
    name: 'ClientTransactions',
    component: () => import('@/components/client/ClientTransactions.vue'),
    meta: {
      title: 'Online Transactions',
      requiresAuth: true
    }
  },
  {
    path: '/client/rejected-documents',
    name: 'RejectedDocuments',
    component: () => import('@/components/client/RejectedDocuments.vue'),
    meta: {
      title: 'Rejected Documents',
      requiresAuth: true
    }
  },
  {
    path: '/client/request/:id',
    name: 'RequestDetails',
    component: () => import('@/components/client/RequestDetails.vue'),
    meta: {
      title: 'Request Details',
      requiresAuth: true
    }
  },
  
  // Admin routes
  {
    path: '/admin/test',
    name: 'AdminTest',
    component: AdminTest,
    meta: {
      title: 'Admin Test'
    }
  },
  {
    path: '/admin/login',
    redirect: '/login' // Redirect old admin login to unified login
  },
  {
    path: '/admin/register',
    name: 'AdminRegistration',
    component: AdminRegistration,
    meta: {
      title: 'Admin Registration',
      requiresAdminGuest: true
    }
  },
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: {
      title: 'Admin Dashboard',
      requiresAdminAuth: true // Only accessible when admin is logged in
    }
  },
  {
    path: '/admin/users',
    name: 'AdminUsers',
    component: () => import('@/components/admin/AdminUsers.vue'),
    meta: {
      title: 'Manage Users',
      requiresAdminAuth: true
    }
  },
  {
    path: '/admin/users/archive',
    name: 'AdminArchive',
    component: () => import('@/components/admin/AdminArchive.vue'),
    meta: {
      title: 'Archive',
      requiresAdminAuth: true
    }
  },
  {
    path: '/admin/requests',
    name: 'AdminRequests',
    component: () => import('@/components/admin/AdminRequests.vue'),
    meta: {
      title: 'View Requests',
      requiresAdminAuth: true
    }
  },
  {
    path: '/admin/history',
    name: 'RequestHistory',
    component: () => import('@/components/admin/RequestHistory.vue'),
    meta: {
      title: 'Request History',
      requiresAdminAuth: true
    }
  },
  {
    path: '/admin/reports',
    name: 'AdminReports',
    component: () => import('@/components/admin/AdminReports.vue'),
    meta: {
      title: 'Generate Reports',
      requiresAdminAuth: true
    }
  },
  {
    path: '/admin/settings',
    name: 'AdminSettings',
    component: () => import('@/components/admin/AdminSettings.vue'),
    meta: {
      title: 'System Settings',
      requiresAdminAuth: true,
      requiresRole: 'admin' // Only admin role can access settings
    }
  },
  {
    path: '/admin/residency-review',
    name: 'ResidencyReview',
    component: () => import('@/components/admin/ResidencyReview.vue'),
    meta: {
      title: 'Residency Verification',
      requiresAdminAuth: true
    }
  },
  {
    path: '/admin/residency-verification',
    name: 'AdminResidencyVerification',
    component: () => import('@/components/admin/AdminResidencyVerification.vue'),
    meta: {
      title: 'Residency Verification',
      requiresAdminAuth: true
    }
  },
  {
    path: '/admin/profile',
    name: 'AdminProfile',
    component: () => import('@/components/admin/AdminProfile.vue'),
    meta: {
      title: 'Admin Profile',
      requiresAdminAuth: true
    }
  },
  {
    path: '/admin/activity-logs',
    name: 'AdminActivityLogs',
    component: () => import('@/components/admin/AdminActivityLogs.vue'),
    meta: {
      title: 'Activity Logs',
      requiresAdminAuth: true
    }
  },
  {
    path: '/admin/audit-logs',
    name: 'AdminAuditLogs',
    component: () => import('@/components/admin/AdminActivityLogs.vue'), // Reuse ActivityLogs for now
    meta: {
      title: 'Audit Logs',
      requiresAdminAuth: true
    }
  },

  // Handle deprecated payment intent URLs
  {
    path: '/payment/intent',
    name: 'DeprecatedPaymentIntent',
    beforeEnter: (to, from, next) => {
      console.error('❌ Deprecated payment intent route accessed:', {
        query: to.query,
        from: from.path
      });

      // Show error message and redirect to my requests
      alert('This payment method is no longer supported. Please use the Pay Now button to proceed with PayMongo checkout.');
      next({ name: 'MyRequests' });
    }
  },

  // Catch-all route for 404
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/components/NotFound.vue'),
    meta: {
      title: 'Page Not Found'
    }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(_, __, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  }
});

// Navigation guards
router.beforeEach((to, _, next) => {
  try {
    console.log('Navigating to:', to.path, to.name);

    // Set page title
    document.title = to.meta.title ? `${to.meta.title} - Barangay Bula` : 'Barangay Bula';

    // Skip auth checks for public routes
    if (!to.meta.requiresAuth && !to.meta.requiresAdminAuth && !to.meta.requiresGuest && !to.meta.requiresAdminGuest) {
      console.log('Public route, skipping auth checks');
      next();
      return;
    }

    // Check unified authentication
    let isLoggedIn = false;
    let userType = null;
    let userRole = null;
    let currentUser = null;

    try {
      isLoggedIn = unifiedAuthService.isLoggedIn();
      if (isLoggedIn) {
        currentUser = unifiedAuthService.getCurrentUser();
        userType = unifiedAuthService.getUserType();
        userRole = unifiedAuthService.getUserRole();
      }
    } catch (error) {
      console.warn('Unified auth check failed:', error);
      isLoggedIn = false;
    }

    console.log('Navigation Guard Debug:');
    console.log('- Route:', to.path);
    console.log('- Logged in:', isLoggedIn);
    console.log('- User type:', userType);
    console.log('- User role:', userRole);
    console.log('- Current user:', currentUser);
    console.log('- Route meta:', to.meta);

    // Admin authentication checks
    if (to.meta.requiresAdminAuth) {
      console.log('Admin auth required. Logged in:', isLoggedIn, 'User type:', userType);
      if (!isLoggedIn || userType !== 'admin') {
        console.log('Admin auth required but not logged in as admin, redirecting to login');
        next('/login');
        return;
      }

      // Admin role-based authorization checks
      if (to.meta.requiresRole && userRole !== to.meta.requiresRole) {
        console.log(`Admin role '${to.meta.requiresRole}' required but user has role '${userRole}', redirecting to dashboard`);
        next('/admin/dashboard');
        return;
      }
    }

    // Client authentication checks
    if (to.meta.requiresAuth) {
      console.log('Client auth required. Logged in:', isLoggedIn, 'User type:', userType);
      if (!isLoggedIn || userType !== 'client') {
        console.log('Client auth required but not logged in as client, redirecting to login');
        next('/login');
        return;
      }
    }

    // Guest route checks - redirect logged in users to appropriate dashboard
    if (to.meta.requiresGuest || to.meta.requiresAdminGuest) {
      if (isLoggedIn) {
        console.log('Guest route but user is logged in, redirecting to appropriate dashboard');
        const redirectUrl = unifiedAuthService.getRedirectUrl(unifiedAuthService.getCurrentUser());
        next(redirectUrl);
        return;
      }
    }

    console.log('Navigation successful to:', to.path);
    next();
  } catch (error) {
    console.error('Navigation guard error:', error);
    // Continue navigation even if there's an error to prevent infinite loops
    next();
  }
});

export default router;