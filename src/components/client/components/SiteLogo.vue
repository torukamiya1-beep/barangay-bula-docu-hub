<template>
  <div 
    class="logo-section" 
    @click="handleClick"
    @keyup.enter="handleClick"
    role="button" 
    tabindex="0"
    :aria-label="ariaLabel"
  >
    <img 
      src="@/assets/icon-of-bula.jpg" 
      alt="Barangay Bula Logo" 
      class="logo"
      loading="lazy"
    />
    <div class="site-identity">
      <h1 class="site-title">Barangay Bula</h1>
      <span class="site-subtitle">Digital Services Portal</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SiteLogo',
  emits: ['navigate'],
  computed: {
    ariaLabel() {
      return 'Navigate to dashboard - Barangay Bula Digital Services Portal'
    }
  },
  methods: {
    handleClick() {
      this.$emit('navigate', 'dashboard')
    }
  }
}
</script>

<style scoped>
.logo-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: background-color 0.2s ease-in-out;
  text-decoration: none;
}

.logo-section:hover,
.logo-section:focus {
  background-color: var(--bg-gray-5, #f9f9f9);
  outline: none;
}

.logo-section:focus-visible {
  outline: 3px solid var(--gov-yellow, #ffbe2e);
  outline-offset: 2px;
}

.logo {
  width: 40px;
  height: 40px;
  border-radius: 0.375rem;
  object-fit: cover;
  flex-shrink: 0;
}

.site-identity {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.site-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--gov-blue, #005ea2);
  margin: 0;
  line-height: 1.2;
  font-family: var(--font-family-serif, 'Merriweather', Georgia, serif);
}

.site-subtitle {
  font-size: 0.75rem;
  color: var(--text-secondary, #454545);
  font-weight: 500;
  line-height: 1;
}

/* Responsive Design */
@media (max-width: 768px) {
  .logo-section {
    gap: 0.5rem;
    padding: 0.375rem;
  }
  
  .logo {
    width: 36px;
    height: 36px;
  }
  
  .site-title {
    font-size: 1rem;
  }
  
  .site-subtitle {
    font-size: 0.7rem;
  }
}

@media (max-width: 480px) {
  .logo-section {
    gap: 0.4rem;
    padding: 0.25rem;
  }

  .site-identity {
    display: block;
    line-height: 1;
  }

  .site-title {
    font-size: 0.9rem;
    line-height: 1;
    margin-bottom: 0;
    display: block;
  }

  .site-subtitle {
    font-size: 0.6rem;
    line-height: 1;
    display: block;
    margin-top: 0;
  }

  .logo {
    width: 28px;
    height: 28px;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .logo-section:hover,
  .logo-section:focus {
    background-color: var(--text-primary, #1b1b1b);
    color: var(--bg-white, #ffffff);
  }
  
  .site-title {
    color: var(--text-primary, #1b1b1b);
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .logo-section {
    transition: none;
  }
}
</style>
