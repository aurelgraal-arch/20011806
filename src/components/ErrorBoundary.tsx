import React from 'react'

interface Props {
  children: React.ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Unhandled error in component tree:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen flex items-center justify-center bg-black text-accent2">
          <div className="text-center">
            <h1 className="text-3xl mb-4">Oops! Si è verificato un errore.</h1>
            <p className="mb-2">{this.state.error?.message || 'Errore sconosciuto'}</p>
            <button
              className="bg-accent text-black px-4 py-2 rounded hover:bg-accent/90"
              onClick={() => window.location.reload()}
            >
              Ricarica pagina
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
