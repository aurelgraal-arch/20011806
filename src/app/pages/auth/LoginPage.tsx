/**
 * Login Page
 * Hash-based authentication system
 * Users enter their access sequence/hash to authenticate
 */

import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../core/store/authStore'
import { Button, Card } from '@components/ui'
import { useToast } from '@hooks/useToast'

interface LocationState {
  from?: { pathname: string }
}

export const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isLoading, isAuthenticated } = useAuthStore()
  const { addToast } = useToast()

  const [hash, setHash] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const from = (location.state as LocationState)?.from?.pathname || '/dashboard'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!hash.trim()) {
      setError('Please enter your access sequence')
      return
    }

    console.log('[LoginPage] Submitting with hash:', hash.trim())
    
    try {
      console.log('[LoginPage] Calling login...')
      await login(hash.trim())
      console.log('[LoginPage] Login successful')
      addToast('Login successful!', 'success')
      navigate(from)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login failed'
      console.error('[LoginPage] Login error:', msg)
      setError(msg)
      addToast(msg, 'error')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Enterprise Platform</h1>
          <p className="text-slate-400">Access your account</p>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 mb-6 flex gap-3">
            <div className="text-red-500 flex-shrink-0">✕</div>
            <div>
              <p className="text-red-200 text-sm font-medium">Authentication Failed</p>
              <p className="text-red-300 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="hash" className="block text-sm font-medium text-slate-300 mb-2">
              Access Sequence
            </label>
            <input
              id="hash"
              type="text"
              value={hash}
              onChange={(e) => {
                setHash(e.target.value)
                setError(null) // Clear error on input change
              }}
              disabled={isLoading}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              placeholder="Enter your access sequence"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            disabled={isLoading || !hash.trim()}
            className="w-full"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-800">
          <p className="text-slate-400 text-sm text-center">
            Need help?{' '}
            <span className="text-blue-400">Contact support</span>
          </p>
        </div>
      </Card>
    </div>
  )
}

export default LoginPage
