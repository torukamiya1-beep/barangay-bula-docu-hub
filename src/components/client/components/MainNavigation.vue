<template>
  <nav
    v-if="navigationItems.length > 0"
    class="main-navigation"
    role="navigation"
    aria-label="Main navigation"
  >
    <ul class="nav-list">
      <li
        v-for="item in navigationItems"
        :key="item.id"
        class="nav-item"
      >
        <a
          href="#"
          class="nav-link"
          :class="{ active: activeMenu === item.id }"
          @click.prevent="handleMenuAction(item.id)"
          role="menuitem"
          :aria-current="activeMenu === item.id ? 'page' : null"
        >
          <i :class="item.icon" aria-hidden="true"></i>
          <span>{{ item.label }}</span>
        </a>
      </li>
    </ul>
  </nav>
</template>

<script>
export default {
  name: 'MainNavigation',
  props: {
    activeMenu: {
      type: String,
      default: 'dashboard'
    }
  },
  emits: ['menu-action'],
  data() {
    return {
      navigationItems: []
    }
  },
  methods: {
    handleMenuAction(action) {
      this.$emit('menu-action', action)
    }
  }
}
</script>

<style scoped>
.main-navigation {
  display: flex;
  align-items: center;
}

.nav-list {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-item {
  display: flex;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  color: var(--text-secondary, #454545);
  text-decoration: none;
  border-radius: 0.375rem;
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.2s ease-in-out;
  border: 2px solid transparent;
}

.nav-link:hover {
  color: var(--gov-blue, #005ea2);
  background-color: var(--bg-gray-5, #f9f9f9);
}

.nav-link:focus {
  outline: none;
  border-color: var(--gov-blue, #005ea2);
}

.nav-link:focus-visible {
  outline: 3px solid var(--gov-yellow, #ffbe2e);
  outline-offset: 2px;
}

.nav-link.active {
  color: var(--gov-blue, #005ea2);
  background-color: var(--gov-blue-lighter, #e7f6f8);
  font-weight: 600;
}

.nav-link i {
  font-size: 1rem;
  flex-shrink: 0;
}

/* Hide on mobile - will be shown in mobile menu */
@media (max-width: 768px) {
  .main-navigation {
    display: none;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .nav-link {
    border-color: var(--text-primary, #1b1b1b);
  }
  
  .nav-link:hover,
  .nav-link.active {
    background-color: var(--text-primary, #1b1b1b);
    color: var(--bg-white, #ffffff);
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .nav-link {
    transition: none;
  }
}
</style>
