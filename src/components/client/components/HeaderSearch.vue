<template>
  <div class="search-container">
    <button 
      class="search-toggle" 
      @click="handleToggle"
      :aria-label="searchToggleLabel"
      :aria-expanded="isActive"
    >
      <i class="fas fa-search" aria-hidden="true"></i>
    </button>
    
    <div 
      class="search-box" 
      :class="{ active: isActive }" 
      role="search"
    >
      <label for="header-search" class="sr-only">Search documents and services</label>
      <input
        id="header-search"
        ref="searchInput"
        type="search"
        placeholder="Search documents, services..."
        class="search-input"
        :value="query"
        @input="handleInput"
        @keyup.enter="handleSearch"
        @keyup.escape="handleEscape"
        autocomplete="off"
      />
      <button 
        class="search-submit" 
        @click="handleSearch" 
        aria-label="Submit search"
        :disabled="!query.trim()"
      >
        <i class="fas fa-search" aria-hidden="true"></i>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HeaderSearch',
  props: {
    isActive: {
      type: Boolean,
      default: false
    },
    query: {
      type: String,
      default: ''
    }
  },
  emits: ['toggle', 'search', 'input'],
  computed: {
    searchToggleLabel() {
      return this.isActive ? 'Close search' : 'Open search'
    }
  },
  watch: {
    isActive(newValue) {
      if (newValue) {
        this.$nextTick(() => {
          this.$refs.searchInput?.focus()
        })
      }
    }
  },
  methods: {
    handleToggle() {
      this.$emit('toggle')
    },
    
    handleInput(event) {
      this.$emit('input', event.target.value)
    },
    
    handleSearch() {
      if (this.query.trim()) {
        this.$emit('search', this.query.trim())
      }
    },
    
    handleEscape() {
      if (this.isActive) {
        this.$emit('toggle')
      }
    }
  }
}
</script>

<style scoped>
.search-container {
  position: relative;
  display: flex;
  align-items: center;
}

.search-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: transparent;
  border: 2px solid transparent;
  border-radius: 0.375rem;
  color: var(--text-secondary, #454545);
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.search-toggle:hover {
  color: var(--gov-blue, #005ea2);
  background-color: var(--bg-gray-5, #f9f9f9);
  border-color: var(--border-light, #dfe1e2);
}

.search-toggle:focus {
  outline: none;
  border-color: var(--gov-blue, #005ea2);
}

.search-toggle:focus-visible {
  outline: 3px solid var(--gov-yellow, #ffbe2e);
  outline-offset: 2px;
}

.search-box {
  position: absolute;
  top: 100%;
  right: 0;
  width: 320px;
  background: var(--bg-white, #ffffff);
  border: 2px solid var(--border-light, #dfe1e2);
  border-radius: 0.5rem;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-8px);
  transition: all 0.2s ease-in-out;
  z-index: 1000;
  margin-top: 0.5rem;
}

.search-box.active {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.search-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  background: transparent;
  font-size: 0.875rem;
  color: var(--text-primary, #1b1b1b);
  outline: none;
}

.search-input::placeholder {
  color: var(--text-light, #757575);
}

.search-submit {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--gov-blue, #005ea2);
  color: var(--text-white, #ffffff);
  border: none;
  border-radius: 0.375rem;
  margin: 0.25rem;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.search-submit:hover:not(:disabled) {
  background: var(--gov-blue-dark, #0f4c96);
  transform: translateY(-1px);
}

.search-submit:focus {
  outline: none;
  box-shadow: 0 0 0 3px var(--gov-yellow, #ffbe2e);
}

.search-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .search-box {
    width: 280px;
    right: -1rem;
  }
}

@media (max-width: 480px) {
  .search-box {
    width: 260px;
    right: -2rem;
  }
}

/* Screen reader only */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .search-box {
    border-color: var(--text-primary, #1b1b1b);
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.3);
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .search-toggle,
  .search-box,
  .search-submit {
    transition: none;
  }
  
  .search-submit:hover:not(:disabled) {
    transform: none;
  }
}
</style>
