/**
 * Document Types Composable
 * Manages document types data and operations
 * Implements error handling, loading states, and data transformation
 */

import { ref, computed } from 'vue'
import documentRequestService from '@/services/documentRequestService'

export function useDocumentTypes() {
  // Reactive state
  const documentTypes = ref([])
  const loading = ref(false)
  const error = ref(null)
  const lastUpdated = ref(null)

  // Computed properties
  const activeDocumentTypes = computed(() => {
    return documentTypes.value.filter(doc => doc.is_active)
  })

  const inactiveDocumentTypes = computed(() => {
    return documentTypes.value.filter(doc => !doc.is_active)
  })

  const documentTypesCount = computed(() => ({
    total: documentTypes.value.length,
    active: activeDocumentTypes.value.length,
    inactive: inactiveDocumentTypes.value.length
  }))

  const documentTypesByCategory = computed(() => {
    const categories = {}
    documentTypes.value.forEach(doc => {
      const category = doc.category || 'General'
      if (!categories[category]) {
        categories[category] = []
      }
      categories[category].push(doc)
    })
    return categories
  })

  // Methods
  const loadDocumentTypes = async (forceRefresh = false) => {
    // Avoid unnecessary API calls if data is fresh (within 5 minutes)
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000)
    if (!forceRefresh && lastUpdated.value && lastUpdated.value > fiveMinutesAgo) {
      return
    }

    try {
      loading.value = true
      error.value = null

      const response = await documentRequestService.getDocumentTypes()
      
      if (response && response.data) {
        documentTypes.value = response.data.map(transformDocumentType)
        lastUpdated.value = Date.now()
      } else {
        throw new Error('Invalid response format')
      }
    } catch (err) {
      console.error('Error loading document types:', err)
      error.value = err.response?.data?.message || 'Failed to load available services'
      
      // Set empty array on error to prevent UI issues
      documentTypes.value = []
    } finally {
      loading.value = false
    }
  }

  const transformDocumentType = (docType) => {
    return {
      ...docType,
      // Ensure required fields have defaults
      id: docType.id || `doc-${Date.now()}-${Math.random()}`,
      type_name: docType.type_name || 'Unknown Document',
      description: docType.description || 'No description available',
      base_fee: parseFloat(docType.base_fee) || 0,
      is_active: Boolean(docType.is_active),
      category: docType.category || 'General',
      // Add computed properties
      icon: getDocumentIcon(docType.type_name),
      processingTime: getProcessingTime(docType.type_name),
      formattedFee: formatCurrency(docType.base_fee)
    }
  }

  const getDocumentIcon = (typeName) => {
    const iconMap = {
      'Barangay Clearance': 'fas fa-certificate',
      'Cedula': 'fas fa-id-card',
      'Business Permit': 'fas fa-briefcase',
      'Residence Certificate': 'fas fa-home',
      'Indigency Certificate': 'fas fa-hand-holding-heart',
      'Good Moral Certificate': 'fas fa-award'
    }
    return iconMap[typeName] || 'fas fa-file-alt'
  }

  const getProcessingTime = (typeName) => {
    const timeMap = {
      'Barangay Clearance': '3-5 business days',
      'Cedula': '1-2 business days',
      'Business Permit': '5-7 business days',
      'Residence Certificate': '2-3 business days',
      'Indigency Certificate': '1-2 business days',
      'Good Moral Certificate': '3-5 business days'
    }
    return timeMap[typeName] || '3-5 business days'
  }

  const formatCurrency = (amount) => {
    const numAmount = parseFloat(amount) || 0
    return numAmount.toFixed(2)
  }

  const getDocumentTypeById = (id) => {
    return documentTypes.value.find(doc => doc.id === id)
  }

  const getDocumentTypeByName = (name) => {
    return documentTypes.value.find(doc => 
      doc.type_name.toLowerCase() === name.toLowerCase()
    )
  }

  const searchDocumentTypes = (query) => {
    if (!query || query.trim().length === 0) {
      return documentTypes.value
    }

    const searchTerm = query.toLowerCase().trim()
    return documentTypes.value.filter(doc => 
      doc.type_name.toLowerCase().includes(searchTerm) ||
      doc.description.toLowerCase().includes(searchTerm) ||
      (doc.category && doc.category.toLowerCase().includes(searchTerm))
    )
  }

  const refreshDocumentTypes = () => {
    return loadDocumentTypes(true)
  }

  const clearError = () => {
    error.value = null
  }

  // Return public API
  return {
    // State
    documentTypes,
    loading,
    error,
    lastUpdated,
    
    // Computed
    activeDocumentTypes,
    inactiveDocumentTypes,
    documentTypesCount,
    documentTypesByCategory,
    
    // Methods
    loadDocumentTypes,
    refreshDocumentTypes,
    getDocumentTypeById,
    getDocumentTypeByName,
    searchDocumentTypes,
    clearError,
    
    // Utility methods
    getDocumentIcon,
    getProcessingTime,
    formatCurrency
  }
}
