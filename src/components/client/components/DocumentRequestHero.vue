<template>
  <section class="hero-section">
    <div class="container">
      <div class="hero-content">
        <div class="hero-text">
          <h1 class="hero-title">Welcome back, {{ userName }}!</h1>
          <p class="hero-subtitle">Access government services and request official documents through our secure digital platform.</p>
          <div class="hero-actions">
            <button class="btn btn-primary" @click="handleScrollToServices">
              <i class="fas fa-plus-circle" aria-hidden="true"></i>
              Start New Request
            </button>
            <button class="btn btn-secondary" @click="handleNavigateToRequests">
              <i class="fas fa-list-alt" aria-hidden="true"></i>
              View My Requests
            </button>
          </div>
        </div>
        <div class="hero-stats">
          <div class="stats-grid">
            <div 
              v-for="stat in statsCards" 
              :key="stat.id"
              class="stat-card"
            >
              <div class="stat-icon">
                <i :class="stat.icon" aria-hidden="true"></i>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ stat.value }}</div>
                <div class="stat-label">{{ stat.title }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'DocumentRequestHero',
  props: {
    userName: {
      type: String,
      default: 'User'
    },
    stats: {
      type: Object,
      default: () => ({
        totalRequests: 0,
        pendingRequests: 0,
        completedRequests: 0
      })
    }
  },
  emits: ['scroll-to-services', 'navigate-to-requests'],
  computed: {
    statsCards() {
      return [
        {
          id: 'total',
          title: 'Total Requests',
          value: this.stats.totalRequests || 0,
          icon: 'fas fa-file-alt'
        },
        {
          id: 'pending',
          title: 'Pending',
          value: this.stats.pendingRequests || 0,
          icon: 'fas fa-clock'
        },
        {
          id: 'completed',
          title: 'Completed',
          value: this.stats.completedRequests || 0,
          icon: 'fas fa-check-circle'
        }
      ]
    }
  },
  methods: {
    handleScrollToServices() {
      this.$emit('scroll-to-services')
    },
    
    handleNavigateToRequests() {
      this.$emit('navigate-to-requests')
    }
  }
}
</script>

<style scoped>
.hero-section {
  padding: 2rem 0;
  position: relative;
  z-index: 1;
  background: var(--bg-white, #ffffff);
  margin: 1rem;
  border-radius: 1rem;
  box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.1);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.hero-content {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 2rem;
  align-items: start;
  padding: 2rem;
}

.hero-text {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.hero-title {
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 700;
  color: var(--gov-blue, #005ea2);
  margin: 0;
  line-height: 1.2;
  font-family: var(--font-family-serif, 'Merriweather', Georgia, serif);
}

.hero-subtitle {
  font-size: 1.125rem;
  color: var(--text-secondary, #454545);
  margin: 0;
  line-height: 1.5;
  max-width: 600px;
}

.hero-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-top: 0.5rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-family: inherit;
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1.2;
  text-decoration: none;
  border: 2px solid transparent;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
  white-space: nowrap;
}

.btn-primary {
  background-color: var(--gov-blue, #005ea2);
  color: var(--text-white, #ffffff);
  border-color: var(--gov-blue, #005ea2);
}

.btn-primary:hover {
  background-color: var(--gov-blue-dark, #0f4c96);
  border-color: var(--gov-blue-dark, #0f4c96);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.1);
}

.btn-secondary {
  background-color: var(--bg-white, #ffffff);
  color: var(--gov-blue, #005ea2);
  border-color: var(--gov-blue, #005ea2);
}

.btn-secondary:hover {
  background-color: var(--gov-blue, #005ea2);
  color: var(--text-white, #ffffff);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.1);
}

.hero-stats {
  display: flex;
  justify-content: center;
  min-width: 280px;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
  width: 100%;
}

.stat-card {
  background: linear-gradient(135deg, var(--gov-blue, #005ea2), var(--gov-blue-light, #2378c3));
  border-radius: 0.5rem;
  padding: 1rem;
  color: var(--text-white, #ffffff);
  text-align: center;
  flex: 1;
  box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.1);
  transition: all 0.15s ease-in-out;
  border: 1px solid rgba(255, 255, 255, 0.1);
  min-height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.stat-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 1.5rem;
  color: var(--gov-yellow, #ffbe2e);
  margin-bottom: 0.5rem;
  display: block;
}

.stat-number {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
  color: var(--gov-yellow, #ffbe2e);
  font-family: var(--font-family-serif, 'Merriweather', Georgia, serif);
  line-height: 1;
}

.stat-label {
  font-size: 0.75rem;
  opacity: 0.9;
  font-weight: 500;
  line-height: 1.2;
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-content {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    padding: 1.5rem;
  }

  .hero-title {
    font-size: clamp(1.5rem, 6vw, 2rem);
  }

  .hero-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
  }

  .stat-card {
    padding: 0.75rem;
    min-height: 100px;
  }

  .stat-number {
    font-size: 1.5rem;
  }

  .hero-section {
    margin: 0.5rem;
  }
}
</style>
