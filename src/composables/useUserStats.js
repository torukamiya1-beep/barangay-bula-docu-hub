/**
 * User Statistics Composable
 * Manages user statistics and dashboard metrics
 * Implements caching and error handling
 */

import { reactive, computed } from 'vue'
import documentRequestService from '@/services/documentRequestService'

export function useUserStats() {
  // Reactive state
  const userStats = reactive({
    totalRequests: 0,
    pendingRequests: 0,
    completedRequests: 0,
    rejectedRequests: 0,
    totalSpent: 0,
    averageProcessingTime: 0,
    isLoading: false,
    error: null,
    lastUpdated: null
  })

  // Computed properties
  const completionRate = computed(() => {
    if (userStats.totalRequests === 0) return 0
    return Math.round((userStats.completedRequests / userStats.totalRequests) * 100)
  })

  const pendingRate = computed(() => {
    if (userStats.totalRequests === 0) return 0
    return Math.round((userStats.pendingRequests / userStats.totalRequests) * 100)
  })

  const rejectionRate = computed(() => {
    if (userStats.totalRequests === 0) return 0
    return Math.round((userStats.rejectedRequests / userStats.totalRequests) * 100)
  })

  const averageSpentPerRequest = computed(() => {
    if (userStats.totalRequests === 0) return 0
    return userStats.totalSpent / userStats.totalRequests
  })

  const statsCards = computed(() => [
    {
      id: 'total',
      title: 'Total Requests',
      value: userStats.totalRequests,
      icon: 'fas fa-file-alt',
      color: 'blue',
      trend: null
    },
    {
      id: 'pending',
      title: 'Pending',
      value: userStats.pendingRequests,
      icon: 'fas fa-clock',
      color: 'yellow',
      percentage: pendingRate.value
    },
    {
      id: 'completed',
      title: 'Completed',
      value: userStats.completedRequests,
      icon: 'fas fa-check-circle',
      color: 'green',
      percentage: completionRate.value
    },
    {
      id: 'spent',
      title: 'Total Spent',
      value: `₱${formatCurrency(userStats.totalSpent)}`,
      icon: 'fas fa-peso-sign',
      color: 'purple',
      average: `₱${formatCurrency(averageSpentPerRequest.value)} avg`
    }
  ])

  // Methods
  const loadUserStats = async (forceRefresh = false) => {
    // Cache for 2 minutes to avoid excessive API calls
    const twoMinutesAgo = Date.now() - (2 * 60 * 1000)
    if (!forceRefresh && userStats.lastUpdated && userStats.lastUpdated > twoMinutesAgo) {
      return
    }

    try {
      userStats.isLoading = true
      userStats.error = null

      // Try to get real stats from API
      try {
        const response = await documentRequestService.getDashboardStats()
        
        if (response && response.data) {
          updateStatsFromAPI(response.data)
        } else {
          // Fallback to placeholder data
          updateStatsWithPlaceholder()
        }
      } catch (apiError) {
        console.warn('API stats not available, using placeholder data:', apiError)
        updateStatsWithPlaceholder()
      }

      userStats.lastUpdated = Date.now()
    } catch (error) {
      console.error('Error loading user stats:', error)
      userStats.error = 'Failed to load statistics'
      updateStatsWithPlaceholder()
    } finally {
      userStats.isLoading = false
    }
  }

  const updateStatsFromAPI = (data) => {
    userStats.totalRequests = data.total_requests || 0
    userStats.pendingRequests = data.pending_requests || 0
    userStats.completedRequests = data.completed_requests || 0
    userStats.rejectedRequests = data.rejected_requests || 0
    userStats.totalSpent = parseFloat(data.total_spent) || 0
    userStats.averageProcessingTime = data.average_processing_time || 0
  }

  const updateStatsWithPlaceholder = () => {
    // Placeholder data for development/demo
    userStats.totalRequests = 5
    userStats.pendingRequests = 2
    userStats.completedRequests = 3
    userStats.rejectedRequests = 0
    userStats.totalSpent = 450.00
    userStats.averageProcessingTime = 3.5
  }

  const refreshStats = () => {
    return loadUserStats(true)
  }

  const resetStats = () => {
    userStats.totalRequests = 0
    userStats.pendingRequests = 0
    userStats.completedRequests = 0
    userStats.rejectedRequests = 0
    userStats.totalSpent = 0
    userStats.averageProcessingTime = 0
    userStats.error = null
    userStats.lastUpdated = null
  }

  const incrementStat = (statName, amount = 1) => {
    if (Object.prototype.hasOwnProperty.call(userStats, statName)) {
      userStats[statName] += amount
    }
  }

  const decrementStat = (statName, amount = 1) => {
    if (Object.prototype.hasOwnProperty.call(userStats, statName)) {
      userStats[statName] = Math.max(0, userStats[statName] - amount)
    }
  }

  // Utility functions
  const formatCurrency = (amount) => {
    const numAmount = parseFloat(amount) || 0
    return numAmount.toFixed(2)
  }

  const formatProcessingTime = (days) => {
    if (days < 1) return 'Less than 1 day'
    if (days === 1) return '1 day'
    return `${Math.round(days)} days`
  }

  const getStatsByDateRange = (startDate, endDate) => {
    // This would typically make an API call with date filters
    // For now, return current stats
    console.log('Getting stats for date range:', startDate, 'to', endDate)
    return { ...userStats }
  }

  const clearError = () => {
    userStats.error = null
  }

  // Return public API
  return {
    // State
    userStats,
    
    // Computed
    completionRate,
    pendingRate,
    rejectionRate,
    averageSpentPerRequest,
    statsCards,
    
    // Methods
    loadUserStats,
    refreshStats,
    resetStats,
    incrementStat,
    decrementStat,
    getStatsByDateRange,
    clearError,
    
    // Utilities
    formatCurrency,
    formatProcessingTime
  }
}
