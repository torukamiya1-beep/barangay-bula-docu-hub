<!-- src/App.vue -->
<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
/* Global Mobile-First Responsive Styles */

/* CSS Reset and Base Styles */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-size: 16px;
  -webkit-text-size-adjust: 100%;
  -ms-text-size-adjust: 100%;
  scroll-behavior: smooth;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f8f9fa;
  line-height: 1.6;
  color: #333;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-tap-highlight-color: transparent;
}

/* Prevent body scroll for dashboard layouts with fixed header/sidebar */
body.dashboard-layout {
  overflow: hidden;
  height: 100vh;
}

#app {
  min-height: 100vh;
  width: 100%;
  position: relative;
}

/* Touch-friendly interactions */
button,
.btn,
.nav-link,
.action-card,
.stat-card,
[role="button"],
[tabindex] {
  touch-action: manipulation;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

/* Improved focus states for accessibility */
button:focus,
.btn:focus,
.nav-link:focus,
input:focus,
select:focus,
textarea:focus {
  outline: 2px solid #007bff;
  outline-offset: 2px;
}

/* Custom scrollbar - responsive */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Mobile scrollbar adjustments */
@media (max-width: 768px) {
  ::-webkit-scrollbar {
    width: 4px;
  }
}

/* Utility classes */
.text-decoration-none {
  text-decoration: none !important;
}

.cursor-pointer {
  cursor: pointer;
}

/* Mobile-specific utilities */
.mobile-only {
  display: none;
}

.desktop-only {
  display: block;
}

@media (max-width: 768px) {
  .mobile-only {
    display: block;
  }

  .desktop-only {
    display: none;
  }

  .mobile-hidden {
    display: none !important;
  }

  .mobile-full-width {
    width: 100% !important;
  }

  .mobile-text-center {
    text-align: center !important;
  }
}

/* Responsive text utilities */
.text-responsive {
  font-size: clamp(0.875rem, 2.5vw, 1rem);
}

.heading-responsive {
  font-size: clamp(1.25rem, 4vw, 2rem);
}

/* Animation classes - optimized for mobile */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Slide animations for mobile */
.slide-enter-active, .slide-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-enter-from {
  transform: translateX(-100%);
}

.slide-leave-to {
  transform: translateX(-100%);
}

/* Performance optimizations */
.gpu-accelerated {
  transform: translateZ(0);
  will-change: transform;
}

/* Safe area handling for modern mobile devices */
@supports (padding: max(0px)) {
  .safe-area-inset-top {
    padding-top: max(1rem, env(safe-area-inset-top));
  }

  .safe-area-inset-bottom {
    padding-bottom: max(1rem, env(safe-area-inset-bottom));
  }

  .safe-area-inset-left {
    padding-left: max(1rem, env(safe-area-inset-left));
  }

  .safe-area-inset-right {
    padding-right: max(1rem, env(safe-area-inset-right));
  }
}

/* Responsive breakpoint utilities */
@media (max-width: 480px) {
  .xs-hidden {
    display: none !important;
  }

  .xs-full-width {
    width: 100% !important;
  }
}

@media (max-width: 768px) {
  .sm-hidden {
    display: none !important;
  }

  .sm-full-width {
    width: 100% !important;
  }
}

@media (max-width: 992px) {
  .md-hidden {
    display: none !important;
  }

  .md-full-width {
    width: 100% !important;
  }
}

/* Improved loading states */
.loading-skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>