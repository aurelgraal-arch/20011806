/**
 * Main Application Component
 * Entry point for the enterprise platform
 */

import { useEffect } from 'react'
import { AppRouter } from './app/router'
import { ErrorBoundary } from './app/components/common/ErrorBoundary'
import { useAuthStore } from './app/core/store/authStore'
import { authService } from './app/core/services/authService'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// create a client for caching queries across the app
const queryClient = new QueryClient()

export default function App() {
  const { refreshSession } = useAuthStore()

  // Refresh session on app load
  useEffect(() => {
    refreshSession()
  }, [refreshSession])

  // subscribe to Supabase auth state changes (session expirations, logouts from another tab)
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange((user) => {
      if (user) {
        useAuthStore.setState({ user, isAuthenticated: true })
      } else {
        useAuthStore.setState({ user: null, isAuthenticated: false })
      }
    })
    return unsubscribe
  }, [])

  // watch profile changes and update store accordingly
  const currentUser = useAuthStore((s) => s.user)
  useEffect(() => {
    if (!currentUser) return
    const unsub = userService.subscribeToProfile(currentUser.id, (updated) => {
      useAuthStore.setState((state) => ({
        user: state.user ? { ...state.user, ...updated } : state.user,
      }))
    })
    return unsub
  }, [currentUser])

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <AppRouter />
      </ErrorBoundary>
    </QueryClientProvider>
  )
}
