<template>
  <div class="help-support-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-text">
          <h1 class="page-title">
            <i class="fas fa-headset"></i>
            Help & Support
          </h1>
          <p class="page-description">
            Get assistance with your document requests and learn how to use our services
          </p>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions">
      <div class="action-card" @click="scrollToSection('faq')">
        <div class="action-icon">
          <i class="fas fa-question-circle"></i>
        </div>
        <div class="action-content">
          <h3>Frequently Asked Questions</h3>
          <p>Find answers to common questions</p>
        </div>
      </div>

      <div class="action-card" @click="scrollToSection('contact')">
        <div class="action-icon">
          <i class="fas fa-phone"></i>
        </div>
        <div class="action-content">
          <h3>Contact Us</h3>
          <p>Get in touch with our support team</p>
        </div>
      </div>

      <div class="action-card" @click="scrollToSection('guides')">
        <div class="action-icon">
          <i class="fas fa-book"></i>
        </div>
        <div class="action-content">
          <h3>User Guides</h3>
          <p>Step-by-step instructions</p>
        </div>
      </div>

      <div class="action-card" @click="scrollToSection('office-hours')">
        <div class="action-icon">
          <i class="fas fa-clock"></i>
        </div>
        <div class="action-content">
          <h3>Office Hours</h3>
          <p>When we're available to help</p>
        </div>
      </div>
    </div>

    <!-- FAQ Section -->
    <div id="faq" class="content-section">
      <h2 class="section-title">
        <i class="fas fa-question-circle"></i>
        Frequently Asked Questions
      </h2>
      
      <div class="faq-categories">
        <div class="faq-category">
          <h3 class="category-title">Document Requests</h3>
          <div class="faq-items">
            <div class="faq-item" v-for="faq in documentFAQs" :key="faq.id" @click="toggleFAQ(faq.id)">
              <div class="faq-question">
                <span>{{ faq.question }}</span>
                <i class="fas fa-chevron-down" :class="{ 'rotated': faq.expanded }"></i>
              </div>
              <div class="faq-answer" v-show="faq.expanded">
                <p v-html="faq.answer"></p>
              </div>
            </div>
          </div>
        </div>

        <div class="faq-category">
          <h3 class="category-title">Account & Profile</h3>
          <div class="faq-items">
            <div class="faq-item" v-for="faq in accountFAQs" :key="faq.id" @click="toggleFAQ(faq.id)">
              <div class="faq-question">
                <span>{{ faq.question }}</span>
                <i class="fas fa-chevron-down" :class="{ 'rotated': faq.expanded }"></i>
              </div>
              <div class="faq-answer" v-show="faq.expanded">
                <p v-html="faq.answer"></p>
              </div>
            </div>
          </div>
        </div>

        <div class="faq-category">
          <h3 class="category-title">Payments & Fees</h3>
          <div class="faq-items">
            <div class="faq-item" v-for="faq in paymentFAQs" :key="faq.id" @click="toggleFAQ(faq.id)">
              <div class="faq-question">
                <span>{{ faq.question }}</span>
                <i class="fas fa-chevron-down" :class="{ 'rotated': faq.expanded }"></i>
              </div>
              <div class="faq-answer" v-show="faq.expanded">
                <p v-html="faq.answer"></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- User Guides Section -->
    <div id="guides" class="content-section">
      <h2 class="section-title">
        <i class="fas fa-book"></i>
        User Guides
      </h2>
      
      <div class="guides-grid">
        <div class="guide-card" v-for="guide in userGuides" :key="guide.id">
          <div class="guide-icon">
            <i :class="guide.icon"></i>
          </div>
          <div class="guide-content">
            <h3>{{ guide.title }}</h3>
            <p>{{ guide.description }}</p>
            <button class="guide-btn" @click="openGuide(guide.id)">
              <i class="fas fa-arrow-right"></i>
              View Guide
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Contact Information Section -->
    <div id="contact" class="content-section">
      <h2 class="section-title">
        <i class="fas fa-phone"></i>
        Contact Information
      </h2>
      
      <div class="contact-grid">
        <div class="contact-card">
          <div class="contact-icon">
            <i class="fas fa-map-marker-alt"></i>
          </div>
          <div class="contact-info">
            <h3>Barangay Office Address</h3>
            <p>Barangay Bula<br>Camarines Sur, Philippines<br>Postal Code: 4422</p>
          </div>
        </div>

        <div class="contact-card">
          <div class="contact-icon">
            <i class="fas fa-phone"></i>
          </div>
          <div class="contact-info">
            <h3>Phone Numbers</h3>
            <p>Main Office: (054) 123-4567<br>Emergency: (054) 987-6543<br>Mobile: +63 917 123 4567</p>
          </div>
        </div>

        <div class="contact-card">
          <div class="contact-icon">
            <i class="fas fa-envelope"></i>
          </div>
          <div class="contact-info">
            <h3>Email Addresses</h3>
            <p>General Inquiries: info@barangaybula.gov.ph<br>Document Requests: documents@barangaybula.gov.ph<br>Technical Support: support@barangaybula.gov.ph</p>
          </div>
        </div>

        <div class="contact-card">
          <div class="contact-icon">
            <i class="fab fa-facebook"></i>
          </div>
          <div class="contact-info">
            <h3>Social Media</h3>
            <p>Facebook: @BarangayBulaOfficial<br>Follow us for updates and announcements</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Office Hours Section -->
    <div id="office-hours" class="content-section">
      <h2 class="section-title">
        <i class="fas fa-clock"></i>
        Office Hours & Service Schedule
      </h2>
      
      <div class="hours-grid">
        <div class="hours-card">
          <h3>Regular Office Hours</h3>
          <div class="schedule">
            <div class="schedule-item">
              <span class="day">Monday - Friday</span>
              <span class="time">8:00 AM - 5:00 PM</span>
            </div>
            <div class="schedule-item">
              <span class="day">Saturday</span>
              <span class="time">8:00 AM - 12:00 PM</span>
            </div>
            <div class="schedule-item">
              <span class="day">Sunday</span>
              <span class="time">Closed</span>
            </div>
          </div>
        </div>

        <div class="hours-card">
          <h3>Document Processing</h3>
          <div class="schedule">
            <div class="schedule-item">
              <span class="day">Barangay Clearance</span>
              <span class="time">Same day processing</span>
            </div>
            <div class="schedule-item">
              <span class="day">Cedula</span>
              <span class="time">Same day processing</span>
            </div>
            <div class="schedule-item">
              <span class="day">Other Documents</span>
              <span class="time">1-3 business days</span>
            </div>
          </div>
        </div>

        <div class="hours-card">
          <h3>Emergency Services</h3>
          <div class="schedule">
            <div class="schedule-item">
              <span class="day">24/7 Hotline</span>
              <span class="time">(054) 987-6543</span>
            </div>
            <div class="schedule-item">
              <span class="day">Emergency Response</span>
              <span class="time">Available 24/7</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Document Fees Section -->
    <div class="content-section">
      <h2 class="section-title">
        <i class="fas fa-peso-sign"></i>
        Document Fees
      </h2>
      
      <div class="fees-table">
        <table>
          <thead>
            <tr>
              <th>Document Type</th>
              <th>Fee</th>
              <th>Processing Time</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Barangay Clearance</td>
              <td>₱150.00</td>
              <td>Same day</td>
            </tr>
            <tr>
              <td>Cedula (Community Tax Certificate)</td>
              <td>₱30.00</td>
              <td>Same day</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Emergency Contact -->
    <div class="emergency-section">
      <div class="emergency-card">
        <div class="emergency-icon">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <div class="emergency-content">
          <h3>Emergency Contact</h3>
          <p>For urgent matters or emergencies, please call our 24/7 hotline:</p>
          <div class="emergency-number">
            <i class="fas fa-phone"></i>
            <span>(054) 987-6543</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script src="./js/helpSupport.js"></script>
<style scoped src="./css/helpSupport.css"></style>
