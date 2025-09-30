<template>
  <div class="admin-test">
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-8">
          <div class="card">
            <div class="card-header bg-dark text-white">
              <h3 class="mb-0">Admin System Test</h3>
            </div>
            <div class="card-body">
              <h5>✅ Admin routing is working!</h5>
              <p>This test page confirms that the admin routing system is functioning correctly.</p>
              
              <div class="mt-4">
                <h6>Available Admin Routes:</h6>
                <ul class="list-group">
                  <li class="list-group-item d-flex justify-content-between align-items-center">
                    <span>/admin/login</span>
                    <router-link to="/admin/login" class="btn btn-sm btn-primary">Go to Login</router-link>
                  </li>
                  <li class="list-group-item d-flex justify-content-between align-items-center">
                    <span>/admin/register</span>
                    <router-link to="/admin/register" class="btn btn-sm btn-success">Go to Register</router-link>
                  </li>
                  <li class="list-group-item d-flex justify-content-between align-items-center">
                    <span>/admin/dashboard</span>
                    <router-link to="/admin/dashboard" class="btn btn-sm btn-info">Go to Dashboard</router-link>
                  </li>
                </ul>
              </div>

              <div class="mt-4">
                <h6>System Information:</h6>
                <ul class="list-unstyled">
                  <li><strong>Current Route:</strong> {{ $route.path }}</li>
                  <li><strong>Component Name:</strong> {{ $options.name }}</li>
                  <li><strong>Vue Version:</strong> {{ vueVersion }}</li>
                  <li><strong>Router Mode:</strong> History</li>
                </ul>
              </div>

              <div class="mt-4">
                <h6>Service Status:</h6>
                <ul class="list-unstyled">
                  <li>
                    <span class="badge" :class="adminServiceStatus.class">
                      {{ adminServiceStatus.text }}
                    </span>
                    Admin Auth Service
                  </li>
                  <li>
                    <span class="badge" :class="clientServiceStatus.class">
                      {{ clientServiceStatus.text }}
                    </span>
                    Client Auth Service
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { version } from 'vue';

export default {
  name: 'AdminTest',
  data() {
    return {
      vueVersion: version,
      adminServiceStatus: { text: 'Unknown', class: 'bg-secondary' },
      clientServiceStatus: { text: 'Unknown', class: 'bg-secondary' }
    };
  },
  
  async mounted() {
    console.log('AdminTest component mounted successfully');
    this.checkServices();
  },
  
  methods: {
    async checkServices() {
      // Check admin auth service
      try {
        const adminAuthService = await import('@/services/adminAuthService');
        if (adminAuthService.default) {
          this.adminServiceStatus = { text: 'Available', class: 'bg-success' };
        } else {
          this.adminServiceStatus = { text: 'Not Available', class: 'bg-danger' };
        }
      } catch (error) {
        console.error('Admin service check failed:', error);
        this.adminServiceStatus = { text: 'Error', class: 'bg-danger' };
      }

      // Check client auth service
      try {
        const clientAuthService = await import('@/services/clientAuthService');
        if (clientAuthService.default) {
          this.clientServiceStatus = { text: 'Available', class: 'bg-success' };
        } else {
          this.clientServiceStatus = { text: 'Not Available', class: 'bg-danger' };
        }
      } catch (error) {
        console.error('Client service check failed:', error);
        this.clientServiceStatus = { text: 'Error', class: 'bg-danger' };
      }
    }
  }
};
</script>

<style scoped>
.admin-test {
  min-height: 100vh;
  background: #f8f9fa;
  padding: 2rem 0;
}

.card {
  border: none;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.badge {
  color: white;
  margin-right: 0.5rem;
}
</style>
