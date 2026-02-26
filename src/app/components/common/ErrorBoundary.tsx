/**
 * Error Boundary
 * Catches errors and displays fallback UI
 */

import React, { type ReactNode, type ErrorInfo } from 'react'
import { Button } from '../ui'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  reset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 max-w-md">
            <h1 className="text-2xl font-bold text-white mb-2">⚠️ Something Went Wrong</h1>
            <p className="text-slate-400 mb-4">
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <div className="space-y-3">
              <Button
                variant="primary"
                onClick={this.reset}
                className="w-full"
              >
                Try Again
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  window.location.href = '/'
                }}
                className="w-full"
              >
                Go Home
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
