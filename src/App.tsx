/**
 * Main Application Component
 * Entry point for the enterprise platform
 */

import React, { useEffect } from 'react'
import { AppRouter } from './router'
import { AuthHeader } from './components/AuthHeader'
import { useAuthStore } from './store/authStore'

export default function App() {
  const restore = useAuthStore((s) => s.restoreSession)

  useEffect(() => {
    restore()
  }, [restore])

  return (
    <>
      <AuthHeader />
      <AppRouter />
    </>
  )
}
