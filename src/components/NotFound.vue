<template>
  <div class="not-found">
    <div class="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div class="text-center">
        <div class="mb-4">
          <i class="fas fa-exclamation-triangle text-warning" style="font-size: 5rem;"></i>
        </div>
        <h1 class="display-4 text-dark mb-3">404</h1>
        <h2 class="h4 text-muted mb-4">Page Not Found</h2>
        <p class="text-muted mb-4">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <div class="d-flex gap-3 justify-content-center">
          <button @click="goBack" class="btn btn-outline-secondary">
            <i class="fas fa-arrow-left me-2"></i>
            Go Back
          </button>

        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotFound',
  methods: {
    goBack() {
      this.$router.go(-1);
    }
  }
};
</script>

<style scoped>
.not-found {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.btn {
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 500;
}
</style>
