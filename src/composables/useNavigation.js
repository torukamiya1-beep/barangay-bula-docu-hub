/**
 * Navigation Composable
 * Handles routing, navigation actions, and scroll behaviors
 * Implements proper error handling and accessibility features
 */

import { nextTick } from 'vue'
import { useRouter } from 'vue-router'

export function useNavigation() {
  const router = useRouter()

  // Route mapping for menu actions
  const routeMap = {
    dashboard: 'ClientDashboard',
    services: 'NewDocumentRequest',
    requests: 'MyRequests',
    documents: 'MyDocuments',
    profile: 'ClientProfile',
    settings: 'ClientSettings',
    history: 'RequestHistory',
    notifications: 'ClientNotifications',
    help: 'HelpSupport',
    account: 'ClientProfile'
  }

  // Navigation methods
  const navigateToRoute = async (routeNameOrAction, params = {}, query = {}) => {
    try {
      // Handle both direct route names and action mappings
      const routeName = routeMap[routeNameOrAction] || routeNameOrAction
      
      if (!routeName) {
        console.warn(`No route found for action: ${routeNameOrAction}`)
        return false
      }

      await router.push({
        name: routeName,
        params,
        query
      })
      
      return true
    } catch (error) {
      console.error('Navigation error:', error)
      return false
    }
  }

  const navigateBack = () => {
    try {
      if (window.history.length > 1) {
        router.back()
      } else {
        // Fallback to dashboard if no history
        navigateToRoute('dashboard')
      }
    } catch (error) {
      console.error('Error navigating back:', error)
      navigateToRoute('dashboard')
    }
  }

  const navigateForward = () => {
    try {
      router.forward()
    } catch (error) {
      console.error('Error navigating forward:', error)
    }
  }

  const navigateToExternal = (url, newTab = true) => {
    try {
      if (newTab) {
        window.open(url, '_blank', 'noopener,noreferrer')
      } else {
        window.location.href = url
      }
    } catch (error) {
      console.error('Error navigating to external URL:', error)
    }
  }

  const reloadCurrentRoute = async () => {
    try {
      const currentRoute = router.currentRoute.value
      await router.replace({
        path: '/loading'
      })
      await nextTick()
      await router.replace(currentRoute)
    } catch (error) {
      console.error('Error reloading route:', error)
    }
  }

  // Scroll utilities
  const scrollToElement = (element, options = {}) => {
    if (!element) {
      console.warn('Element not found for scrolling')
      return
    }

    const defaultOptions = {
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest'
    }

    const scrollOptions = { ...defaultOptions, ...options }

    try {
      if (element.scrollIntoView) {
        element.scrollIntoView(scrollOptions)
      } else {
        // Fallback for older browsers
        element.scrollTop = 0
      }
    } catch (error) {
      console.error('Error scrolling to element:', error)
    }
  }

  const scrollToTop = (smooth = true) => {
    try {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: smooth ? 'smooth' : 'auto'
      })
    } catch (error) {
      console.error('Error scrolling to top:', error)
    }
  }

  const scrollToBottom = (smooth = true) => {
    try {
      window.scrollTo({
        top: document.body.scrollHeight,
        left: 0,
        behavior: smooth ? 'smooth' : 'auto'
      })
    } catch (error) {
      console.error('Error scrolling to bottom:', error)
    }
  }

  const scrollToSection = (sectionId, offset = 0) => {
    try {
      const element = document.getElementById(sectionId)
      if (element) {
        const elementPosition = element.offsetTop - offset
        window.scrollTo({
          top: elementPosition,
          behavior: 'smooth'
        })
      } else {
        console.warn(`Section with ID '${sectionId}' not found`)
      }
    } catch (error) {
      console.error('Error scrolling to section:', error)
    }
  }

  // URL utilities
  const getCurrentPath = () => {
    return router.currentRoute.value.path
  }

  const getCurrentRouteName = () => {
    return router.currentRoute.value.name
  }

  const getRouteParams = () => {
    return router.currentRoute.value.params
  }

  const getRouteQuery = () => {
    return router.currentRoute.value.query
  }

  const buildRouteUrl = (routeName, params = {}, query = {}) => {
    try {
      return router.resolve({
        name: routeName,
        params,
        query
      }).href
    } catch (error) {
      console.error('Error building route URL:', error)
      return '#'
    }
  }

  // Navigation guards
  const canNavigateAway = () => {
    // Add logic to check if user can leave current page
    // For example, check for unsaved changes
    return true
  }

  const confirmNavigation = (message = 'Are you sure you want to leave this page?') => {
    return window.confirm(message)
  }

  // Breadcrumb utilities
  const generateBreadcrumbs = () => {
    const route = router.currentRoute.value
    const breadcrumbs = []
    
    // Add home/dashboard
    breadcrumbs.push({
      name: 'Dashboard',
      path: '/client/dashboard',
      active: false
    })

    // Add current page
    if (route.meta?.title && route.path !== '/client/dashboard') {
      breadcrumbs.push({
        name: route.meta.title,
        path: route.path,
        active: true
      })
    }

    return breadcrumbs
  }

  // Return public API
  return {
    // Navigation
    navigateToRoute,
    navigateBack,
    navigateForward,
    navigateToExternal,
    reloadCurrentRoute,
    
    // Scrolling
    scrollToElement,
    scrollToTop,
    scrollToBottom,
    scrollToSection,
    
    // URL utilities
    getCurrentPath,
    getCurrentRouteName,
    getRouteParams,
    getRouteQuery,
    buildRouteUrl,
    
    // Navigation guards
    canNavigateAway,
    confirmNavigation,
    
    // Breadcrumbs
    generateBreadcrumbs,
    
    // Route map
    routeMap
  }
}
