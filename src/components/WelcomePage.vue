<template>
  <div class="welcome-page">
    <!-- Government Banner -->
    <div class="gov-banner">
      <div class="banner-content">
        <div class="banner-flag">
          <i class="fas fa-flag"></i>
        </div>
        <div class="banner-text">
          <span class="banner-title">An official website of Barangay Bula General Santos City</span>
        </div>
      </div>
    </div>

    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-background">
        <div class="hero-overlay"></div>
      </div>
      <div class="hero-content">
        <div class="hero-header">
          <img
            src="@/assets/icon-of-bula.jpg"
            alt="Barangay Bula Official Seal"
            class="hero-logo"
          />
          <div class="hero-text">
            <h1 class="hero-title">Barangay Bula</h1>
            <p class="hero-subtitle">Digital Document Request Portal</p>
          </div>
        </div>

        <div class="hero-main">
          <h2 class="hero-headline">Request Official Documents Online</h2>
          <p class="hero-description">
            Get barangay certificates and clearances quickly and securely.
            Our digital platform serves over 34,000 residents with efficient government services.
          </p>

          <div class="hero-actions">
            <button
              class="btn btn-primary"
              @click="goToLogin"
              :disabled="loading"
            >
              <i class="fas fa-sign-in-alt"></i>
              <span v-if="!loading">Sign In</span>
              <span v-else>
                <i class="fas fa-spinner fa-spin"></i>
                Loading...
              </span>
            </button>
            <button
              class="btn btn-outline"
              @click="goToRegister"
            >
              <i class="fas fa-user-plus"></i>
              Create Account
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Services Section -->
    <section class="services-section">
      <div class="container">
        <div class="section-header">
          <h3 class="section-title">Available Services</h3>
          <p class="section-description">Request these documents online through our secure portal</p>
        </div>

        <div class="services-grid">
          <div class="service-card">
            <div class="service-icon">
              <i class="fas fa-certificate"></i>
            </div>
            <h4 class="service-title">Barangay Certificate</h4>
            <p class="service-description">Official certification of residency and good standing</p>
          </div>

          <div class="service-card">
            <div class="service-icon">
              <i class="fas fa-id-card"></i>
            </div>
            <h4 class="service-title">Barangay Clearance</h4>
            <p class="service-description">Required for employment and business applications</p>
          </div>

        </div>
      </div>
    </section>

    <!-- Benefits Section -->
    <section class="benefits-section">
      <div class="container">
        <div class="section-header">
          <h3 class="section-title">Why Use Our Digital Platform?</h3>
          <p class="section-description">Experience modern, efficient government services</p>
        </div>

        <div class="benefits-grid">
          <div class="benefit-item">
            <div class="benefit-icon">
              <i class="fas fa-clock"></i>
            </div>
            <div class="benefit-content">
              <h4>Save Time</h4>
              <p>Submit requests online without visiting our office</p>
            </div>
          </div>

          <div class="benefit-item">
            <div class="benefit-icon">
              <i class="fas fa-shield-alt"></i>
            </div>
            <div class="benefit-content">
              <h4>Secure & Safe</h4>
              <p>Your data is protected with government-grade security</p>
            </div>
          </div>

          <div class="benefit-item">
            <div class="benefit-icon">
              <i class="fas fa-mobile-alt"></i>
            </div>
            <div class="benefit-content">
              <h4>24/7 Access</h4>
              <p>Request documents anytime from any device</p>
            </div>
          </div>

          <div class="benefit-item">
            <div class="benefit-icon">
              <i class="fas fa-search"></i>
            </div>
            <div class="benefit-content">
              <h4>Track Status</h4>
              <p>Monitor your request progress in real-time</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- About Section -->
    <section class="about-section">
      <div class="container">
        <div class="about-content">
          <div class="about-text">
            <h3>About Barangay Bula</h3>
            <p>
              Established in 1959, Barangay Bula is a thriving coastal community in General Santos City,
              serving over 34,000 residents. We are committed to providing transparent, efficient,
              and accessible government services to all our constituents.
            </p>
            <p>
              This digital platform represents our commitment to modernizing public service delivery,
              making it easier for residents to access essential government documents and services.
            </p>
          </div>
          <div class="about-stats">
            <div class="stat-item">
              <div class="stat-number">34,000+</div>
              <div class="stat-label">Residents Served</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">1959</div>
              <div class="stat-label">Year Established</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">24/7</div>
              <div class="stat-label">Online Access</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer-section">
      <div class="container">
        <div class="footer-content">
          <div class="footer-info">
            <div class="footer-logo">
              <img
                src="@/assets/icon-of-bula.jpg"
                alt="Barangay Bula Official Seal"
                class="footer-logo-img"
              />
              <div class="footer-text">
                <h4>Barangay Bula</h4>
                <p>General Santos City</p>
              </div>
            </div>

            <div class="footer-contact">
              <h5>Contact Information</h5>
              <div class="contact-item">
                <i class="fas fa-map-marker-alt"></i>
                <span>Barangay Bula, General Santos City</span>
              </div>
              <div class="contact-item">
                <i class="fas fa-phone"></i>
                <span>(083) 552-XXXX</span>
              </div>
              <div class="contact-item">
                <i class="fas fa-envelope"></i>
                <span>barangaybula@gensantos.gov.ph</span>
              </div>
            </div>

            <div class="footer-hours">
              <h5>Office Hours</h5>
              <p>Monday - Friday<br>8:00 AM - 5:00 PM</p>
            </div>
          </div>

          <div class="footer-bottom">
            <p>&copy; 2024 Barangay Bula, General Santos City. All rights reserved.</p>
            <p>Committed to transparent and efficient public service.</p>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'WelcomePage',
  data() {
    return {
      loading: false
    };
  },
  methods: {
    async goToLogin() {
      this.loading = true;
      try {
        // Add a small delay for better UX
        await new Promise(resolve => setTimeout(resolve, 500));
        this.$router.push({ name: 'UnifiedLogin' });
      } catch (error) {
        console.error('Navigation error:', error);
        // Fallback navigation
        window.location.href = '/login';
      } finally {
        this.loading = false;
      }
    },
    
    goToRegister() {
      this.$router.push({ name: 'ClientRegistration' });
    }
  }
};
</script>

<style scoped>
/* Reset and base styles */
* {
  box-sizing: border-box;
}

.welcome-page {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f8f9fa;
}

/* Container utility */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* Government Banner */
.gov-banner {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
  color: white;
  padding: 0.75rem 0;
  border-bottom: 3px solid #fbbf24;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.banner-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.banner-flag {
  font-size: 1.25rem;
  color: #fbbf24;
}

.banner-text {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.banner-title {
  font-weight: 600;
  font-size: 0.875rem;
}

.banner-subtitle {
  font-size: 0.75rem;
  opacity: 0.9;
}

/* Hero Section */
.hero-section {
  position: relative;
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: white;
  /* Ensure hero section maintains its structure */
  overflow: hidden;
  isolation: isolate;
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('@/assets/bula-welcome-page-background-pic.JPG');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: scroll; /* Changed from fixed to scroll for better mobile support */
  opacity: 1 !important; /* Ensure background stays visible */
  z-index: -2;
  /* Prevent background from being affected by animations */
  will-change: auto;
  transform: translateZ(0); /* Force hardware acceleration */
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    135deg,
    rgba(30, 58, 138, 0.85) 0%,
    rgba(30, 64, 175, 0.9) 100%
  );
  opacity: 1 !important; /* Ensure overlay stays visible */
  z-index: -1;
  /* Prevent overlay from being affected by animations */
  will-change: auto;
  transform: translateZ(0); /* Force hardware acceleration */
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
  z-index: 1;
}

.hero-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.hero-logo {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 3px solid white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.hero-text {
  text-align: left;
}

.hero-title {
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 700;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.hero-subtitle {
  font-size: clamp(1rem, 2.5vw, 1.25rem);
  margin: 0.25rem 0 0 0;
  opacity: 0.95;
  font-weight: 400;
}

.hero-main {
  margin-top: 2rem;
}

.hero-headline {
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 700;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.hero-description {
  font-size: clamp(1.1rem, 2.5vw, 1.25rem);
  margin-bottom: 2rem;
  opacity: 0.95;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

/* Button Styles */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.75rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 1rem;
  text-decoration: none;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 160px;
  justify-content: center;
}

.btn-primary {
  background: #fbbf24;
  color: #1e3a8a;
  border-color: #fbbf24;
}

.btn-primary:hover:not(:disabled) {
  background: #f59e0b;
  border-color: #f59e0b;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(251, 191, 36, 0.4);
}

.btn-outline {
  background: transparent;
  color: white;
  border-color: white;
}

.btn-outline:hover {
  background: white;
  color: #1e3a8a;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(255, 255, 255, 0.3);
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

/* Section Styles */
.services-section,
.benefits-section,
.about-section {
  padding: 4rem 0;
}

.services-section {
  background: white;
}

.benefits-section {
  background: #f8f9fa;
}

.about-section {
  background: white;
}

.section-header {
  text-align: center;
  margin-bottom: 3rem;
}

.section-title {
  font-size: clamp(2rem, 4vw, 2.5rem);
  font-weight: 700;
  color: #1e3a8a;
  margin-bottom: 1rem;
}

.section-description {
  font-size: 1.125rem;
  color: #6b7280;
  max-width: 600px;
  margin: 0 auto;
}

/* Services Grid */
.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
}

.service-card {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
}

.service-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  border-color: #fbbf24;
}

.service-icon {
  width: 4rem;
  height: 4rem;
  background: linear-gradient(135deg, #1e3a8a, #1e40af);
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  color: white;
  font-size: 1.5rem;
}

.service-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e3a8a;
  margin-bottom: 0.75rem;
}

.service-description {
  color: #6b7280;
  line-height: 1.6;
}

/* Benefits Grid */
.benefits-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.benefit-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.5rem;
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
}

.benefit-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.benefit-icon {
  width: 3rem;
  height: 3rem;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1e3a8a;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.benefit-content h4 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e3a8a;
  margin-bottom: 0.5rem;
}

.benefit-content p {
  color: #6b7280;
  line-height: 1.5;
  margin: 0;
}

/* About Section */
.about-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 3rem;
  align-items: center;
}

.about-text h3 {
  font-size: 2rem;
  font-weight: 700;
  color: #1e3a8a;
  margin-bottom: 1.5rem;
}

.about-text p {
  color: #6b7280;
  line-height: 1.7;
  margin-bottom: 1rem;
  font-size: 1.125rem;
}

.about-stats {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.stat-item {
  text-align: center;
  padding: 1.5rem;
  background: linear-gradient(135deg, #1e3a8a, #1e40af);
  border-radius: 1rem;
  color: white;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #fbbf24;
}

.stat-label {
  font-size: 0.875rem;
  opacity: 0.9;
  font-weight: 500;
}

/* Footer */
.footer-section {
  background: #1e3a8a;
  color: white;
  padding: 3rem 0 1.5rem;
}

.footer-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.footer-logo-img {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 2px solid white;
}

.footer-text h4 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
}

.footer-text p {
  margin: 0;
  opacity: 0.9;
}

.footer-contact h5,
.footer-hours h5 {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #fbbf24;
}

.contact-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  opacity: 0.9;
}

.contact-item i {
  color: #fbbf24;
  margin-top: 0.125rem;
  flex-shrink: 0;
}

.footer-hours p {
  margin: 0;
  opacity: 0.9;
  line-height: 1.6;
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding-top: 1.5rem;
  text-align: center;
}

.footer-bottom p {
  margin: 0.25rem 0;
  opacity: 0.8;
}

/* Responsive Design */
@media (max-width: 768px) {
  .banner-content {
    padding: 0 0.75rem;
  }

  .banner-text {
    font-size: 0.8rem;
  }

  .hero-header {
    flex-direction: column;
    gap: 1rem;
  }

  .hero-text {
    text-align: center;
  }

  .hero-logo {
    width: 70px;
    height: 70px;
  }

  .hero-actions {
    flex-direction: column;
    align-items: center;
  }

  .btn {
    width: 100%;
    max-width: 280px;
  }

  .services-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
  }

  .benefits-grid {
    grid-template-columns: 1fr;
  }

  .about-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .about-stats {
    flex-direction: row;
    justify-content: space-around;
  }

  .stat-item {
    flex: 1;
    padding: 1rem;
  }

  .stat-number {
    font-size: 1.75rem;
  }

  .footer-info {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .footer-logo {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 0.75rem;
  }

  .services-section,
  .benefits-section,
  .about-section {
    padding: 3rem 0;
  }

  .services-grid {
    grid-template-columns: 1fr;
  }

  .service-card {
    padding: 1.5rem;
  }

  .about-stats {
    flex-direction: column;
    gap: 1rem;
  }
}

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Apply animations only to content sections, not hero background elements */
.services-section,
.benefits-section,
.about-section,
.footer-section {
  animation: fadeInUp 0.8s ease-out;
}

/* Animate hero content separately without affecting background */
.hero-content {
  animation: fadeInUp 1.2s ease-out 0.3s both;
}

/* Ensure background elements are never animated */
.hero-background,
.hero-overlay {
  animation: none !important;
  transition: none !important;
}

.services-section {
  animation-delay: 0.2s;
}

.benefits-section {
  animation-delay: 0.4s;
}

.about-section {
  animation-delay: 0.6s;
}

.footer-section {
  animation-delay: 0.8s;
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .hero-content,
  .services-section,
  .benefits-section,
  .about-section,
  .footer-section {
    animation: none !important;
  }

  .service-card:hover,
  .benefit-item:hover,
  .btn:hover {
    transform: none;
    transition: none !important;
  }

  /* Always keep background elements stable */
  .hero-background,
  .hero-overlay {
    animation: none !important;
    transition: none !important;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .hero-overlay {
    background: rgba(0, 0, 0, 0.8);
  }

  .service-card,
  .benefit-item {
    border: 2px solid #000;
  }

  .footer-section {
    border-top: 3px solid #fbbf24;
  }
}

/* Focus styles for accessibility */
.btn:focus,
button:focus {
  outline: 3px solid #fbbf24;
  outline-offset: 2px;
}

/* Print styles */
@media print {
  .gov-banner,
  .hero-section,
  .footer-section {
    background: white !important;
    color: black !important;
  }

  .btn {
    border: 2px solid black;
    background: white;
    color: black;
  }
}
</style>
