// src/main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Import Tailwind CSS
import './assets/css/tailwind.css'

// Import Bootstrap’s CSS
import 'bootstrap/dist/css/bootstrap.min.css'

// Import Bootstrap's JS
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

// Import Font-Awesome’s JS
import '@fortawesome/fontawesome-free/js/all.js'

// Import and initialize unified auth service
import unifiedAuthService from './services/unifiedAuthService'
import clientAuthService from './services/clientAuthService'

// Initialize unified authentication service with error handling
try {
  // First migrate any legacy client auth
  if (clientAuthService && typeof clientAuthService.migrateLegacyAuth === 'function') {
    clientAuthService.migrateLegacyAuth()
  }

  // Then initialize unified auth
  if (unifiedAuthService && typeof unifiedAuthService.initializeAuth === 'function') {
    unifiedAuthService.initializeAuth()
  }
} catch (error) {
  console.warn('Auth service initialization failed:', error)
}

const app = createApp(App)

// Add global error handler
app.config.errorHandler = (err, instance, info) => {
  console.error('Global error:', err)
  console.error('Component instance:', instance)
  console.error('Error info:', info)
}

// Add global warning handler
app.config.warnHandler = (msg, instance, trace) => {
  console.warn('Global warning:', msg)
  console.warn('Component instance:', instance)
  console.warn('Trace:', trace)
}

// Make unified auth service available globally
app.config.globalProperties.$auth = unifiedAuthService
app.config.globalProperties.$clientAuth = unifiedAuthService // For backward compatibility
app.config.globalProperties.$adminAuth = unifiedAuthService // For backward compatibility

app.use(router)
app.mount('#app')

console.log('Vue app mounted successfully')