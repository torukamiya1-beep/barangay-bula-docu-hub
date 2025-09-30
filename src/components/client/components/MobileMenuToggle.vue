<template>
  <button 
    class="mobile-menu-toggle" 
    @click="handleToggle"
    :aria-label="ariaLabel"
    :aria-expanded="isExpanded"
    :class="{ 'is-active': isExpanded }"
  >
    <span class="hamburger-line"></span>
    <span class="hamburger-line"></span>
    <span class="hamburger-line"></span>
  </button>
</template>

<script>
export default {
  name: 'MobileMenuToggle',
  props: {
    isExpanded: {
      type: Boolean,
      default: false
    }
  },
  emits: ['toggle'],
  computed: {
    ariaLabel() {
      return this.isExpanded ? 'Close navigation menu' : 'Open navigation menu'
    }
  },
  methods: {
    handleToggle() {
      this.$emit('toggle')
    }
  }
}
</script>

<style scoped>
.mobile-menu-toggle {
  display: none;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 44px;
  height: 44px;
  background: transparent;
  border: 2px solid transparent;
  border-radius: 0.375rem;
  cursor: pointer;
  padding: 0.5rem;
  transition: all 0.2s ease-in-out;
  position: relative;
}

.mobile-menu-toggle:hover {
  background-color: var(--bg-gray-5, #f9f9f9);
  border-color: var(--border-light, #dfe1e2);
}

.mobile-menu-toggle:focus {
  outline: none;
  border-color: var(--gov-blue, #005ea2);
  background-color: var(--bg-gray-5, #f9f9f9);
}

.mobile-menu-toggle:focus-visible {
  outline: 3px solid var(--gov-yellow, #ffbe2e);
  outline-offset: 2px;
}

.hamburger-line {
  display: block;
  width: 20px;
  height: 2px;
  background-color: var(--text-primary, #1b1b1b);
  border-radius: 1px;
  transition: all 0.3s ease-in-out;
  transform-origin: center;
}

.hamburger-line:not(:last-child) {
  margin-bottom: 4px;
}

/* Active state animation */
.mobile-menu-toggle.is-active .hamburger-line:nth-child(1) {
  transform: translateY(6px) rotate(45deg);
}

.mobile-menu-toggle.is-active .hamburger-line:nth-child(2) {
  opacity: 0;
  transform: scaleX(0);
}

.mobile-menu-toggle.is-active .hamburger-line:nth-child(3) {
  transform: translateY(-6px) rotate(-45deg);
}

/* Show on mobile */
@media (max-width: 768px) {
  .mobile-menu-toggle {
    display: flex;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .mobile-menu-toggle {
    border-color: var(--text-primary, #1b1b1b);
  }
  
  .mobile-menu-toggle:hover,
  .mobile-menu-toggle:focus {
    background-color: var(--text-primary, #1b1b1b);
  }
  
  .mobile-menu-toggle:hover .hamburger-line,
  .mobile-menu-toggle:focus .hamburger-line {
    background-color: var(--bg-white, #ffffff);
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .mobile-menu-toggle,
  .hamburger-line {
    transition: none;
  }
  
  .mobile-menu-toggle.is-active .hamburger-line:nth-child(1) {
    transform: rotate(45deg);
  }
  
  .mobile-menu-toggle.is-active .hamburger-line:nth-child(3) {
    transform: rotate(-45deg);
  }
}

/* Touch device optimizations */
@media (hover: none) and (pointer: coarse) {
  .mobile-menu-toggle {
    width: 48px;
    height: 48px;
  }
}
</style>
