<template>
  <div class="breadcrumb-section">
    <div class="header-container">
      <nav class="breadcrumb-nav" aria-label="Breadcrumb navigation">
        <ol class="breadcrumb-list">
          <li 
            v-for="(breadcrumb, index) in breadcrumbs" 
            :key="breadcrumb.path"
            class="breadcrumb-item"
            :class="{ active: breadcrumb.active }"
          >
            <a 
              v-if="!breadcrumb.active"
              href="#" 
              @click.prevent="handleNavigate(breadcrumb.action || 'dashboard')"
              class="breadcrumb-link"
            >
              <i v-if="index === 0" class="fas fa-home" aria-hidden="true"></i>
              {{ breadcrumb.name }}
            </a>
            <span 
              v-else
              class="breadcrumb-current"
              aria-current="page"
            >
              {{ breadcrumb.name }}
            </span>
            
            <i 
              v-if="!breadcrumb.active && index < breadcrumbs.length - 1"
              class="fas fa-chevron-right breadcrumb-separator" 
              aria-hidden="true"
            ></i>
          </li>
        </ol>
      </nav>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BreadcrumbNavigation',
  props: {
    breadcrumbs: {
      type: Array,
      default: () => [
        {
          name: 'Dashboard',
          path: '/client/dashboard',
          action: 'dashboard',
          active: false
        },
        {
          name: 'Current Page',
          path: '/current',
          active: true
        }
      ]
    }
  },
  emits: ['navigate'],
  methods: {
    handleNavigate(action) {
      this.$emit('navigate', action)
    }
  }
}
</script>

<style scoped>
.breadcrumb-section {
  background: var(--bg-gray-5, #f9f9f9);
  border-bottom: 1px solid var(--border-light, #dfe1e2);
  padding: 0.75rem 0;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.breadcrumb-nav {
  display: flex;
  align-items: center;
}

.breadcrumb-list {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  list-style: none;
  margin: 0;
  padding: 0;
  flex-wrap: wrap;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.breadcrumb-link {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  color: var(--gov-blue, #005ea2);
  text-decoration: none;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  transition: all 0.2s ease-in-out;
  font-weight: 500;
}

.breadcrumb-link:hover {
  background-color: var(--gov-blue-lighter, #e7f6f8);
  text-decoration: underline;
}

.breadcrumb-link:focus {
  outline: none;
  background-color: var(--gov-blue-lighter, #e7f6f8);
  box-shadow: 0 0 0 2px var(--gov-blue, #005ea2);
}

.breadcrumb-link:focus-visible {
  outline: 3px solid var(--gov-yellow, #ffbe2e);
  outline-offset: 2px;
}

.breadcrumb-current {
  color: var(--text-primary, #1b1b1b);
  font-weight: 600;
  padding: 0.25rem 0.5rem;
}

.breadcrumb-separator {
  color: var(--text-light, #757575);
  font-size: 0.75rem;
  margin: 0 0.25rem;
}

.breadcrumb-item.active {
  color: var(--text-primary, #1b1b1b);
}

/* Mobile responsive */
@media (max-width: 768px) {
  .header-container {
    padding: 0 0.75rem;
  }
  
  .breadcrumb-section {
    padding: 0.5rem 0;
  }
  
  .breadcrumb-list {
    gap: 0.375rem;
  }
  
  .breadcrumb-item {
    font-size: 0.8rem;
  }
  
  .breadcrumb-separator {
    margin: 0 0.125rem;
  }
}

@media (max-width: 480px) {
  .breadcrumb-list {
    flex-wrap: nowrap;
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  
  .breadcrumb-list::-webkit-scrollbar {
    display: none;
  }
  
  .breadcrumb-item {
    white-space: nowrap;
    flex-shrink: 0;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .breadcrumb-section {
    border-bottom-color: var(--text-primary, #1b1b1b);
  }
  
  .breadcrumb-link:hover,
  .breadcrumb-link:focus {
    background-color: var(--text-primary, #1b1b1b);
    color: var(--bg-white, #ffffff);
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .breadcrumb-link {
    transition: none;
  }
}

/* Print styles */
@media print {
  .breadcrumb-section {
    display: none;
  }
}
</style>
