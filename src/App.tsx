/**
 * Main Application Component
 * Entry point for the enterprise platform
 */

import React, { useEffect } from 'react'
import { AppRouter } from './router'
import { AuthHeader } from './components/AuthHeader'
import { useAuthStore } from './store/authStore'
import { useThemeStore } from './store/themeStore'

export default function App() {
  const restore = useAuthStore((s) => s.restoreSession)
  const theme = useThemeStore((s) => s.theme)

  useEffect(() => {
    restore()
  }, [restore])

  useEffect(() => {
    // apply theme attribute to html root
    try {
      document.documentElement.setAttribute('data-theme', theme)
    } catch (e) {
      // ignore in non-browser contexts
    }
  }, [theme])

  return (
    <>
      <AuthHeader />
      <AppRouter />
    </>
  )
}
