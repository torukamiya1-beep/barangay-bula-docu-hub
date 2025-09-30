<template>
  <div class="gov-banner" role="banner" aria-label="Government website banner">
    <div class="gov-banner-content">
      <div class="gov-banner-flag">
        <img 
          src="/assets/images/ph_flag_small.png" 
          alt="Philippine flag" 
          class="flag-icon"
          loading="lazy"
        />
      </div>
      <div class="gov-banner-text">
        <span class="gov-banner-label">An official website of the</span>
        <strong class="gov-banner-agency">Barangay Bula, General Santos City</strong>
      </div>
      <div class="gov-banner-secure">
        <i class="fas fa-shield-alt" aria-hidden="true"></i>
        <span>Secure</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GovernmentBanner'
}
</script>

<style scoped>
.gov-banner {
  background: var(--gov-blue, #005ea2);
  color: var(--text-white, #ffffff);
  padding: 0.5rem 0;
  font-size: 0.875rem;
}

.gov-banner-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.gov-banner-flag {
  display: flex;
  align-items: center;
}

.flag-icon {
  width: 20px;
  height: auto;
  margin-right: 0.5rem;
}

.gov-banner-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.gov-banner-label {
  font-size: 0.75rem;
  opacity: 0.9;
}

.gov-banner-agency {
  font-size: 0.875rem;
  font-weight: 600;
}

.gov-banner-secure {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.gov-banner-secure i {
  color: var(--gov-yellow, #ffbe2e);
}

/* Responsive Design */
@media (max-width: 768px) {
  .gov-banner-content {
    padding: 0 0.75rem;
    gap: 0.5rem;
  }
  
  .gov-banner-text {
    font-size: 0.75rem;
  }
  
  .gov-banner-agency {
    font-size: 0.8rem;
  }
  
  .gov-banner-secure {
    font-size: 0.7rem;
  }
}

@media (max-width: 480px) {
  .gov-banner-text {
    flex-direction: row;
    gap: 0.25rem;
  }
  
  .gov-banner-label::after {
    content: " ";
  }
}
</style>
