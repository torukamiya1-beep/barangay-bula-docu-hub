<template>
  <section class="quick-actions-section">
    <div class="container">
      <div class="section-header">
        <h2 class="section-title">Quick Actions</h2>
        <p class="section-description">Common tasks and frequently used services</p>
      </div>

      <div class="quick-actions-grid">
        <div 
          v-for="action in quickActions" 
          :key="action.id"
          class="action-card" 
          :class="{ primary: action.primary }"
          @click="handleAction(action.action)"
          @keyup.enter="handleAction(action.action)"
          role="button" 
          tabindex="0"
        >
          <div class="action-icon">
            <i :class="action.icon" aria-hidden="true"></i>
          </div>
          <div class="action-content">
            <h3>{{ action.title }}</h3>
            <p>{{ action.description }}</p>
          </div>
          <div class="action-arrow">
            <i class="fas fa-arrow-right" aria-hidden="true"></i>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'QuickActionsSection',
  emits: ['scroll-to-services', 'navigate-to-requests', 'navigate-to-profile', 'contact-support'],
  data() {
    return {
      quickActions: [
        {
          id: 'new-request',
          title: 'New Document Request',
          description: 'Start a new request for official documents',
          icon: 'fas fa-plus-circle',
          action: 'scroll-to-services',
          primary: true
        },
        {
          id: 'track-requests',
          title: 'Track Requests',
          description: 'View status and track your submitted requests',
          icon: 'fas fa-list-alt',
          action: 'navigate-to-requests',
          primary: false
        },
        {
          id: 'update-profile',
          title: 'Update Profile',
          description: 'Manage your account and personal information',
          icon: 'fas fa-user-edit',
          action: 'navigate-to-profile',
          primary: false
        },
        {
          id: 'get-support',
          title: 'Get Support',
          description: 'Contact our support team for assistance',
          icon: 'fas fa-headset',
          action: 'contact-support',
          primary: false
        }
      ]
    }
  },
  methods: {
    handleAction(action) {
      this.$emit(action)
    }
  }
}
</script>

<style scoped>
.quick-actions-section {
  padding: 2rem 0;
  position: relative;
  z-index: 1;
  background: var(--bg-gray-5, #f9f9f9);
  margin: 1rem;
  border-radius: 1rem;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.section-header {
  text-align: center;
  margin-bottom: 2rem;
  padding: 0 1rem;
}

.section-title {
  font-size: clamp(1.75rem, 4vw, 2.25rem);
  font-weight: 700;
  color: var(--gov-blue, #005ea2);
  margin-bottom: 0.75rem;
  font-family: var(--font-family-serif, 'Merriweather', Georgia, serif);
}

.section-description {
  font-size: 1rem;
  color: var(--text-secondary, #454545);
  margin: 0;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1rem;
  padding: 0 1rem;
}

.action-card {
  background: var(--bg-white, #ffffff);
  border-radius: 0.5rem;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
  border: 2px solid var(--bg-gray-20, #dfe1e2);
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.1);
}

.action-card:hover,
.action-card:focus {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.1);
  border-color: var(--gov-blue, #005ea2);
  outline: none;
}

.action-card:focus-visible {
  outline: 3px solid var(--gov-yellow, #ffbe2e);
  outline-offset: 2px;
}

.action-card.primary {
  background: linear-gradient(135deg, var(--gov-blue, #005ea2), var(--gov-blue-light, #2378c3));
  color: var(--text-white, #ffffff);
  border-color: var(--gov-blue, #005ea2);
}

.action-card.primary:hover,
.action-card.primary:focus {
  border-color: var(--gov-yellow, #ffbe2e);
  box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.1);
}

.action-icon {
  width: 4rem;
  height: 4rem;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #1e3a8a;
  flex-shrink: 0;
}

.action-card.primary .action-icon {
  background: rgba(251, 191, 36, 0.2);
  color: #fbbf24;
}

.action-content {
  flex: 1;
}

.action-content h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: inherit;
}

.action-content p {
  margin: 0;
  opacity: 0.8;
  line-height: 1.5;
}

.action-arrow {
  color: #6b7280;
  font-size: 1.25rem;
}

.action-card.primary .action-arrow {
  color: rgba(255, 255, 255, 0.8);
}

/* Responsive Design */
@media (max-width: 768px) {
  .quick-actions-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .action-card {
    padding: 1rem;
    gap: 0.75rem;
  }

  .action-icon {
    width: 48px;
    height: 48px;
    font-size: 1.25rem;
  }

  .quick-actions-section {
    margin: 0.5rem;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .action-card {
    border-color: var(--text-primary, #1b1b1b);
  }
  
  .action-card:hover,
  .action-card:focus {
    background-color: var(--text-primary, #1b1b1b);
    color: var(--bg-white, #ffffff);
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .action-card {
    transition: none;
  }
  
  .action-card:hover,
  .action-card:focus {
    transform: none;
  }
}
</style>
