<template>
  <div class="address-selector">
    <!-- Region Dropdown - Hidden by default -->
    <div class="mb-3" v-show="!hideDropdowns">
      <label :for="regionId" class="form-label">
        Region <span class="text-danger">*</span>
      </label>
      <select
        :id="regionId"
        class="form-select"
        :class="{ 'is-invalid': errors.region }"
        v-model="selectedRegion"
        @change="onRegionChange"
        :disabled="loading.regions"
        required
      >
        <option value="">
          {{ loading.regions ? 'Loading regions...' : 'Select Region' }}
        </option>
        <option
          v-for="region in regions"
          :key="region.region_code"
          :value="region.region_code"
        >
          {{ region.region_name }}
        </option>
      </select>
      <div v-if="errors.region" class="invalid-feedback">
        {{ errors.region }}
      </div>
    </div>

    <!-- Hidden input to maintain region value -->
    <input v-if="hideDropdowns" type="hidden" v-model="selectedRegion" />

    <!-- Province Dropdown - Hidden by default -->
    <div class="mb-3" v-show="!hideDropdowns">
      <label :for="provinceId" class="form-label">
        Province <span class="text-danger">*</span>
      </label>
      <select
        :id="provinceId"
        class="form-select"
        :class="{ 'is-invalid': errors.province }"
        v-model="selectedProvince"
        @change="onProvinceChange"
        :disabled="!selectedRegion || loading.provinces"
        required
      >
        <option value="">
          {{ getProvinceOptionText() }}
        </option>
        <option
          v-for="province in provinces"
          :key="province.province_code"
          :value="province.province_code"
        >
          {{ province.province_name }}
        </option>
      </select>
      <div v-if="errors.province" class="invalid-feedback">
        {{ errors.province }}
      </div>
    </div>

    <!-- Hidden input to maintain province value -->
    <input v-if="hideDropdowns" type="hidden" v-model="selectedProvince" />

    <!-- City/Municipality Dropdown - Hidden by default -->
    <div class="mb-3" v-show="!hideDropdowns">
      <label :for="cityId" class="form-label">
        City/Municipality <span class="text-danger">*</span>
      </label>
      <select
        :id="cityId"
        class="form-select"
        :class="{ 'is-invalid': errors.city }"
        v-model="selectedCity"
        @change="onCityChange"
        :disabled="!selectedProvince || loading.cities"
        required
      >
        <option value="">
          {{ getCityOptionText() }}
        </option>
        <option
          v-for="city in cities"
          :key="city.city_code"
          :value="city.city_code"
        >
          {{ city.city_name }}
        </option>
      </select>
      <div v-if="errors.city" class="invalid-feedback">
        {{ errors.city }}
      </div>
    </div>

    <!-- Hidden input to maintain city value -->
    <input v-if="hideDropdowns" type="hidden" v-model="selectedCity" />

    <!-- Barangay Dropdown - Hidden by default -->
    <div class="mb-3" v-show="!hideDropdowns">
      <label :for="barangayId" class="form-label">
        Barangay <span class="text-danger">*</span>
      </label>
      <select
        :id="barangayId"
        class="form-select"
        :class="{ 'is-invalid': errors.barangay }"
        v-model="selectedBarangay"
        @change="onBarangayChange"
        :disabled="!selectedCity || loading.barangays"
        required
      >
        <option value="">
          {{ getBarangayOptionText() }}
        </option>
        <option
          v-for="barangay in barangays"
          :key="barangay.brgy_code"
          :value="barangay.brgy_code"
        >
          {{ barangay.brgy_name }}
        </option>
      </select>
      <div v-if="errors.barangay" class="invalid-feedback">
        {{ errors.barangay }}
      </div>
    </div>

    <!-- Hidden input to maintain barangay value -->
    <input v-if="hideDropdowns" type="hidden" v-model="selectedBarangay" />

    <!-- Display current address when dropdowns are hidden -->
    <div v-if="hideDropdowns" class="address-display">
      <div class="alert alert-info">
        <h6><i class="fas fa-map-marker-alt me-2"></i>Address Information</h6>
        <p class="mb-0">
          <strong>Region:</strong> Region XII (SOCCSKSARGEN)<br>
          <strong>Province:</strong> South Cotabato<br>
          <strong>City/Municipality:</strong> General Santos City (Dadiangas)<br>
          <strong>Barangay:</strong> Bula
        </p>
      </div>
    </div>



    <!-- Error Display -->
    <div v-if="generalError" class="alert alert-danger">
      <i class="fas fa-exclamation-triangle me-2"></i>
      {{ generalError }}
    </div>
  </div>
</template>

<script>
import addressService from '@/services/addressService';

export default {
  name: 'AddressSelector',
  props: {
    // Initial values
    initialRegion: {
      type: String,
      default: ''
    },
    initialProvince: {
      type: String,
      default: ''
    },
    initialCity: {
      type: String,
      default: ''
    },
    initialBarangay: {
      type: String,
      default: ''
    },

    // Custom validation errors
    validationErrors: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      // Selected values - set to default General Santos City values
      selectedRegion: this.initialRegion || '12',
      selectedProvince: this.initialProvince || '1263',
      selectedCity: this.initialCity || '126303',
      selectedBarangay: this.initialBarangay || '126303005',

      // Data arrays
      regions: [],
      provinces: [],
      cities: [],
      barangays: [],

      // Loading states
      loading: {
        regions: false,
        provinces: false,
        cities: false,
        barangays: false
      },

      // Errors
      errors: {},
      generalError: '',

      // Hide dropdowns flag
      hideDropdowns: true
    };
  },
  computed: {
    // Generate unique IDs for form elements
    regionId() {
      return `region-${this._uid}`;
    },
    provinceId() {
      return `province-${this._uid}`;
    },
    cityId() {
      return `city-${this._uid}`;
    },
    barangayId() {
      return `barangay-${this._uid}`;
    }
  },
  watch: {
    // Watch for external validation errors
    validationErrors: {
      handler(newErrors) {
        this.errors = { ...newErrors };
      },
      deep: true
    }
  },
  async mounted() {
    await this.loadRegions();

    // Load default address data for General Santos City
    if (this.hideDropdowns) {
      await this.loadProvinces('12'); // Region XII
      await this.loadCities('1263'); // South Cotabato
      await this.loadBarangays('126303'); // General Santos City

      // Emit the default address data
      this.emitChange();
    } else {
      // Load initial data if provided
      if (this.initialRegion) {
        await this.loadProvinces(this.initialRegion);
        if (this.initialProvince) {
          await this.loadCities(this.initialProvince);
          if (this.initialCity) {
            await this.loadBarangays(this.initialCity);
          }
        }
      }
    }
  },
  methods: {
    // Load regions
    async loadRegions() {
      this.loading.regions = true;
      this.generalError = '';

      try {
        const response = await addressService.getRegions();
        // Handle both direct array and API response format
        this.regions = Array.isArray(response) ? response : (response.data || []);
        console.log('Loaded regions:', this.regions.length, 'items');
      } catch (error) {
        this.generalError = 'Failed to load regions. Please try again.';
        console.error('Error loading regions:', error);
        this.regions = [];
      } finally {
        this.loading.regions = false;
      }
    },
    
    // Load provinces by region
    async loadProvinces(regionCode) {
      this.loading.provinces = true;
      this.provinces = [];
      this.cities = [];
      this.barangays = [];

      try {
        const response = await addressService.getProvincesByRegion(regionCode);
        this.provinces = Array.isArray(response) ? response : (response.data || []);
        console.log('Loaded provinces:', this.provinces.length, 'items for region', regionCode);
      } catch (error) {
        this.generalError = 'Failed to load provinces. Please try again.';
        console.error('Error loading provinces:', error);
        this.provinces = [];
      } finally {
        this.loading.provinces = false;
      }
    },
    
    // Load cities by province
    async loadCities(provinceCode) {
      this.loading.cities = true;
      this.cities = [];
      this.barangays = [];

      try {
        const response = await addressService.getCitiesByProvince(provinceCode);
        this.cities = Array.isArray(response) ? response : (response.data || []);
        console.log('Loaded cities:', this.cities.length, 'items for province', provinceCode);
      } catch (error) {
        this.generalError = 'Failed to load cities. Please try again.';
        console.error('Error loading cities:', error);
        this.cities = [];
      } finally {
        this.loading.cities = false;
      }
    },
    
    // Load barangays by city
    async loadBarangays(cityCode) {
      this.loading.barangays = true;
      this.barangays = [];

      try {
        const response = await addressService.getBarangaysByCity(cityCode);
        this.barangays = Array.isArray(response) ? response : (response.data || []);
        console.log('Loaded barangays:', this.barangays.length, 'items for city', cityCode);
      } catch (error) {
        this.generalError = 'Failed to load barangays. Please try again.';
        console.error('Error loading barangays:', error);
        this.barangays = [];
      } finally {
        this.loading.barangays = false;
      }
    },

    // Event handlers
    async onRegionChange() {
      this.clearError('region');
      this.selectedProvince = '';
      this.selectedCity = '';
      this.selectedBarangay = '';

      if (this.selectedRegion) {
        await this.loadProvinces(this.selectedRegion);
      }

      this.emitChange();
    },

    async onProvinceChange() {
      this.clearError('province');
      this.selectedCity = '';
      this.selectedBarangay = '';

      if (this.selectedProvince) {
        await this.loadCities(this.selectedProvince);
      }

      this.emitChange();
    },

    async onCityChange() {
      this.clearError('city');
      this.selectedBarangay = '';

      if (this.selectedCity) {
        await this.loadBarangays(this.selectedCity);
      }

      this.emitChange();
    },

    onBarangayChange() {
      this.clearError('barangay');
      this.emitChange();
    },

    // Helper text methods
    getProvinceOptionText() {
      if (!this.selectedRegion) return 'Select region first';
      if (this.loading.provinces) return 'Loading provinces...';
      return 'Select Province';
    },

    getCityOptionText() {
      if (!this.selectedProvince) return 'Select province first';
      if (this.loading.cities) return 'Loading cities...';
      return 'Select City/Municipality';
    },

    getBarangayOptionText() {
      if (!this.selectedCity) return 'Select city first';
      if (this.loading.barangays) return 'Loading barangays...';
      return 'Select Barangay';
    },



    // Emit change event
    emitChange() {
      const addressData = {
        region: {
          code: this.selectedRegion,
          name: Array.isArray(this.regions)
            ? this.regions.find(r => r.region_code === this.selectedRegion)?.region_name || ''
            : ''
        },
        province: {
          code: this.selectedProvince,
          name: Array.isArray(this.provinces)
            ? this.provinces.find(p => p.province_code === this.selectedProvince)?.province_name || ''
            : ''
        },
        city: {
          code: this.selectedCity,
          name: Array.isArray(this.cities)
            ? this.cities.find(c => c.city_code === this.selectedCity)?.city_name || ''
            : ''
        },
        barangay: {
          code: this.selectedBarangay,
          name: Array.isArray(this.barangays)
            ? this.barangays.find(b => b.brgy_code === this.selectedBarangay)?.brgy_name || ''
            : ''
        }
      };

      this.$emit('address-change', addressData);
    },

    // Clear specific error
    clearError(field) {
      if (this.errors[field]) {
        this.errors = { ...this.errors };
        delete this.errors[field];
      }
    },

    // Validate the component
    validate() {
      const errors = {};

      if (!this.selectedRegion) {
        errors.region = 'Region is required';
      }

      if (!this.selectedProvince) {
        errors.province = 'Province is required';
      }

      if (!this.selectedCity) {
        errors.city = 'City/Municipality is required';
      }

      if (!this.selectedBarangay) {
        errors.barangay = 'Barangay is required';
      }

      this.errors = errors;
      return Object.keys(errors).length === 0;
    },

    // Get current address data
    getAddressData() {
      return {
        region_code: this.selectedRegion,
        province_code: this.selectedProvince,
        city_code: this.selectedCity,
        barangay_code: this.selectedBarangay,
        region_name: this.regions.find(r => r.region_code === this.selectedRegion)?.region_name || '',
        province_name: this.provinces.find(p => p.province_code === this.selectedProvince)?.province_name || '',
        city_name: this.cities.find(c => c.city_code === this.selectedCity)?.city_name || '',
        barangay_name: this.barangays.find(b => b.brgy_code === this.selectedBarangay)?.brgy_name || ''
      };
    },

    // Reset the component
    reset() {
      this.selectedRegion = '';
      this.selectedProvince = '';
      this.selectedCity = '';
      this.selectedBarangay = '';
      this.provinces = [];
      this.cities = [];
      this.barangays = [];
      this.errors = {};
      this.generalError = '';
    }
  }
};
</script>

<style scoped>
.address-selector .form-select:disabled {
  background-color: #f8f9fa;
  opacity: 0.65;
}

.address-selector .list-group-item {
  cursor: pointer;
  transition: background-color 0.15s ease-in-out;
}

.address-selector .list-group-item:hover {
  background-color: #f8f9fa;
}

.address-selector .spinner-border-sm {
  width: 0.875rem;
  height: 0.875rem;
}
</style>
