// Philippine Address Service
// Uses data from https://github.com/isaacdarcilla/philippine-addresses

class AddressService {
  constructor() {
    // Use environment variable for API URL to support cross-domain requests
    const API_BASE_URL = process.env.VUE_APP_API_URL || 'http://localhost:7000/api';
    this.baseUrl = `${API_BASE_URL}/address`;
    this.cache = {
      regions: null,
      provinces: null,
      cities: null,
      barangays: null
    };
  }

  // Get all regions
  async getRegions() {
    if (this.cache.regions) {
      return this.cache.regions;
    }

    try {
      const response = await fetch(`${this.baseUrl}/regions`);
      if (!response.ok) {
        throw new Error(`Failed to fetch regions: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      // Handle API response format: {success: true, data: [...]}
      const regions = result.success ? result.data : result;

      if (!Array.isArray(regions)) {
        throw new Error('Invalid regions data format');
      }

      this.cache.regions = regions;
      return regions;
    } catch (error) {
      console.error('Error fetching regions:', error);
      throw error;
    }
  }

  // Get provinces by region
  async getProvincesByRegion(regionCode) {
    try {
      if (!this.cache.provinces) {
        const response = await fetch(`${this.baseUrl}/provinces`);
        if (!response.ok) {
          throw new Error('Failed to fetch provinces');
        }
        const result = await response.json();
        const provinces = result.success ? result.data : result;

        if (!Array.isArray(provinces)) {
          throw new Error('Invalid provinces data format');
        }

        this.cache.provinces = provinces;
      }

      return this.cache.provinces.filter(province =>
        province.region_code === regionCode
      ).sort((a, b) => a.province_name.localeCompare(b.province_name));
    } catch (error) {
      console.error('Error fetching provinces:', error);
      throw error;
    }
  }

  // Get cities/municipalities by province
  async getCitiesByProvince(provinceCode) {
    try {
      if (!this.cache.cities) {
        const response = await fetch(`${this.baseUrl}/cities`);
        if (!response.ok) {
          throw new Error('Failed to fetch cities');
        }
        const result = await response.json();
        const cities = result.success ? result.data : result;

        if (!Array.isArray(cities)) {
          throw new Error('Invalid cities data format');
        }

        this.cache.cities = cities;
      }

      return this.cache.cities.filter(city =>
        city.province_code === provinceCode
      ).sort((a, b) => a.city_name.localeCompare(b.city_name));
    } catch (error) {
      console.error('Error fetching cities:', error);
      throw error;
    }
  }

  // Get barangays by city
  async getBarangaysByCity(cityCode) {
    try {
      if (!this.cache.barangays) {
        const response = await fetch(`${this.baseUrl}/barangays`);
        if (!response.ok) {
          throw new Error('Failed to fetch barangays');
        }
        const result = await response.json();
        const barangays = result.success ? result.data : result;

        if (!Array.isArray(barangays)) {
          throw new Error('Invalid barangays data format');
        }

        this.cache.barangays = barangays;
      }

      return this.cache.barangays.filter(barangay =>
        barangay.city_code === cityCode
      ).sort((a, b) => a.brgy_name.localeCompare(b.brgy_name));
    } catch (error) {
      console.error('Error fetching barangays:', error);
      throw error;
    }
  }

  // Search for Barangay Bula specifically
  async findBarangayBula() {
    try {
      if (!this.cache.barangays) {
        const response = await fetch(`${this.baseUrl}/barangays`);
        if (!response.ok) {
          throw new Error('Failed to fetch barangays');
        }
        this.cache.barangays = await response.json();
      }

      const bulaBarangays = this.cache.barangays.filter(barangay => 
        barangay.brgy_name.toLowerCase().includes('bula')
      );

      // Get additional details for each Barangay Bula found
      const detailedResults = [];
      for (const barangay of bulaBarangays) {
        try {
          const city = this.cache.cities?.find(c => c.city_code === barangay.city_code);
          const province = this.cache.provinces?.find(p => p.province_code === barangay.province_code);
          const region = this.cache.regions?.find(r => r.region_code === barangay.region_code);

          detailedResults.push({
            ...barangay,
            city_name: city?.city_name || 'Unknown City',
            province_name: province?.province_name || 'Unknown Province',
            region_name: region?.region_name || 'Unknown Region'
          });
        } catch (error) {
          console.warn('Error getting details for barangay:', barangay.brgy_name, error);
          detailedResults.push(barangay);
        }
      }

      return detailedResults;
    } catch (error) {
      console.error('Error finding Barangay Bula:', error);
      throw error;
    }
  }

  // Get complete address hierarchy for a barangay
  async getCompleteAddress(barangayCode) {
    try {
      if (!this.cache.barangays) {
        await this.getBarangaysByCity(''); // This will load all barangays
      }

      const barangay = this.cache.barangays.find(b => b.brgy_code === barangayCode);
      if (!barangay) {
        throw new Error('Barangay not found');
      }

      const city = this.cache.cities?.find(c => c.city_code === barangay.city_code);
      const province = this.cache.provinces?.find(p => p.province_code === barangay.province_code);
      const region = this.cache.regions?.find(r => r.region_code === barangay.region_code);

      return {
        barangay: barangay.brgy_name,
        city: city?.city_name || 'Unknown City',
        province: province?.province_name || 'Unknown Province',
        region: region?.region_name || 'Unknown Region',
        codes: {
          barangay: barangayCode,
          city: barangay.city_code,
          province: barangay.province_code,
          region: barangay.region_code
        }
      };
    } catch (error) {
      console.error('Error getting complete address:', error);
      throw error;
    }
  }

  // Clear cache (useful for refreshing data)
  clearCache() {
    this.cache = {
      regions: null,
      provinces: null,
      cities: null,
      barangays: null
    };
  }

  // Preload all address data (useful for better performance)
  async preloadAddressData() {
    try {
      await Promise.all([
        this.getRegions(),
        this.getProvincesByRegion('01'), // Load at least one province set
        this.getCitiesByProvince('0128'), // Load at least one city set
        this.getBarangaysByCity('012801') // Load at least one barangay set
      ]);
      console.log('Address data preloaded successfully');
    } catch (error) {
      console.warn('Failed to preload address data:', error);
    }
  }

  // Validate if an address combination is valid
  async validateAddress(regionCode, provinceCode, cityCode, barangayCode) {
    try {
      const regions = await this.getRegions();
      const region = regions.find(r => r.region_code === regionCode);
      if (!region) return { valid: false, error: 'Invalid region' };

      const provinces = await this.getProvincesByRegion(regionCode);
      const province = provinces.find(p => p.province_code === provinceCode);
      if (!province) return { valid: false, error: 'Invalid province for selected region' };

      const cities = await this.getCitiesByProvince(provinceCode);
      const city = cities.find(c => c.city_code === cityCode);
      if (!city) return { valid: false, error: 'Invalid city for selected province' };

      const barangays = await this.getBarangaysByCity(cityCode);
      const barangay = barangays.find(b => b.brgy_code === barangayCode);
      if (!barangay) return { valid: false, error: 'Invalid barangay for selected city' };

      return { valid: true };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }
}

// Create and export a singleton instance
const addressService = new AddressService();
export default addressService;
