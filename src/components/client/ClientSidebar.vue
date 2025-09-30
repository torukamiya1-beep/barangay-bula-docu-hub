<template>
  <aside class="dashboard-sidebar" :class="{ collapsed: collapsed }">
    <!-- Logo Section -->
    <div class="sidebar-logo">
      <div class="logo-content">
        <img
          src="@/assets/icon-of-bula.jpg"
          alt="Barangay Bula Logo"
          class="logo-image"
          @error="handleImageError"
        >
        <div class="logo-text" :class="{ 'mobile-show': isMobile, 'desktop-hide': collapsed && !isMobile }">
          <h3 class="logo-title">Barangay Bula</h3>
          <p class="logo-subtitle">Management System</p>
        </div>
      </div>
      <!-- Mobile Close Button -->
      <button
        class="mobile-close-btn"
        @click="handleMobileClose"
        aria-label="Close sidebar"
      >
        <i class="fas fa-times"></i>
      </button>
    </div>

    <!-- Navigation -->
    <nav class="sidebar-nav">
      <ul class="nav-list">
        <!-- Dashboard -->
        <li class="nav-item">
          <a href="#"
             class="nav-link"
             :class="{ active: activeMenu === 'dashboard' }"
             @click="handleMenuClick('dashboard')"
             :title="collapsed ? 'Dashboard' : ''">
            <i class="fas fa-chart-bar nav-icon"></i>
            <span v-if="!collapsed || isMobile" class="nav-text">Dashboard</span>
          </a>
        </li>

        <!-- Document Requests -->
        <li class="nav-item">
          <a href="#"
             class="nav-link"
             :class="{ active: activeMenu === 'requests' }"
             @click="handleMenuClick('requests')"
             :title="collapsed ? 'My Requests' : ''">
            <i class="fas fa-file-alt nav-icon"></i>
            <div v-if="!collapsed || isMobile" class="nav-content">
              <span class="nav-text">My Requests</span>
              <span class="nav-badge">{{ pendingRequests }}</span>
            </div>
          </a>
        </li>

        <!-- Services -->
        <li class="nav-item">
          <a href="#"
             class="nav-link"
             :class="{ active: activeMenu === 'services' }"
             @click="handleMenuClick('services')"
             :title="collapsed ? 'Services' : ''">
            <i class="fas fa-concierge-bell nav-icon"></i>
            <div v-if="!collapsed || isMobile" class="nav-content">
              <span class="nav-text">Available Services</span>
              <span class="nav-badge">{{ totalServices }}</span>
            </div>
          </a>
        </li>



        <!-- History -->
        <li class="nav-item">
          <a href="#"
             class="nav-link"
             :class="{ active: activeMenu === 'history' }"
             @click="handleMenuClick('history')"
             :title="collapsed ? 'History' : ''">
            <i class="fas fa-history nav-icon"></i>
            <div v-if="!collapsed || isMobile" class="nav-content">
              <span class="nav-text">Completed</span>
              <span class="nav-badge">{{ completedRequests }}</span>
            </div>
          </a>
        </li>

        <!-- Profile -->
        <li class="nav-item">
          <a href="#"
             class="nav-link"
             :class="{ active: activeMenu === 'profile' }"
             @click="handleMenuClick('profile')"
             :title="collapsed ? 'Profile' : ''">
            <i class="fas fa-user nav-icon"></i>
            <span v-if="!collapsed || isMobile" class="nav-text">My Profile</span>
          </a>
        </li>

        <!-- Help -->
        <li class="nav-item">
          <a href="#"
             class="nav-link"
             :class="{ active: activeMenu === 'help' }"
             @click="handleMenuClick('help')"
             :title="collapsed ? 'Help & Support' : ''">
            <i class="fas fa-question-circle nav-icon"></i>
            <span v-if="!collapsed || isMobile" class="nav-text">Help & Support</span>
          </a>
        </li>
      </ul>
    </nav>

    <!-- Bottom Section -->
    <div class="sidebar-bottom">
      <!-- Enhanced Logout Button -->
      <div class="logout-section">
        <button
           class="logout-btn nav-link logout-link"
           @click="handleLogout"
           :title="collapsed ? 'Logout' : ''"
           :class="{ 'collapsed': collapsed }">
          <div class="logout-icon-container">
            <i class="fas fa-sign-out-alt logout-icon nav-icon"></i>
            <div class="logout-ripple"></div>
          </div>
          <div v-if="!collapsed || isMobile" class="logout-content">
            <span class="logout-text nav-text">Logout</span>
            <span class="logout-subtitle">Sign out safely</span>
          </div>
          <div v-if="!collapsed || isMobile" class="logout-arrow">
            <i class="fas fa-chevron-right"></i>
          </div>
        </button>
      </div>
    </div>
  </aside>
</template>

<script src="./js/clientSidebar.js"></script>

<style scoped src="./css/clientSidebar.css"></style>
