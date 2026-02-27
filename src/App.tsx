/**
 * Main Application Component
 * Entry point for the enterprise platform
 */

import React from 'react'
import { AppRouter } from './router'
import { AuthHeader } from './components/AuthHeader'

export default function App() {
  return (
    <>
      <AuthHeader />
      <AppRouter />
    </>
  )
}
