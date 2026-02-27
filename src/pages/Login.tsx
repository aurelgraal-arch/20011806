import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import clsx from 'clsx'

export const Login: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as any)?.from?.pathname || '/totalita'

  const login = useAuthStore((s) => s.login)
  const loading = useAuthStore((s) => s.loading)
  const authError = useAuthStore((s) => s.error)
  const [sequence, setSequence] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (!sequence.trim()) {
      setErrorMsg('Inserisci una sequenza')
      return
    }

    setErrorMsg('')
    try {
      await login(sequence.trim())
      navigate(from, { replace: true })
    } catch (err: any) {
      setErrorMsg(err.message || authError || 'Errore di login')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black relative overflow-hidden">
      {/* subtle circuit background */}
      <div className="absolute inset-0 opacity-5 bg-[url('/circuits.svg')] bg-center bg-cover" />
      
      {/* Title Section */}
      <div className="relative mb-12 text-center">
        <h1 className="text-8xl font-black text-accent2 tracking-widest drop-shadow-lg glow-gold">
          AUR EDENTECH
        </h1>
        <div className="mt-6 space-y-1">
          <p className="text-lg text-accent2 tracking-wider">Accesso evolutivo</p>
          <p className="text-sm text-accent2/70">Solo su richiesta</p>
          <p className="text-sm text-accent2/70">Per merito o riconoscimento</p>
        </div>
      </div>

      {/* Login Box */}
      <div className="relative bg-card border border-accent2/50 rounded-xl p-12 w-full max-w-2xl glass shadow-lg hover:border-accent2 transition-colors">
        <h2 className="text-2xl text-accent2 mb-6 text-center font-semibold tracking-wide">
          Accesso tramite sequenza personale
        </h2>
        <form onSubmit={handleLogin} className="space-y-6">
          <input
            value={sequence}
            onChange={(e) => setSequence(e.target.value)}
            disabled={loading}
            className="w-full px-4 py-3 bg-black/50 border border-accent2/30 rounded transition focus:border-accent2 focus:ring-2 focus:ring-accent/50 disabled:opacity-50 disabled:cursor-not-allowed text-accent2 placeholder-accent2/40"
            placeholder="Sequenza"
          />
          {errorMsg && <p className="text-accent animate-pulse text-sm">{errorMsg}</p>}
          <button
            type="submit"
            disabled={loading}
            className={clsx(
              'w-full py-3 rounded text-black font-bold tracking-wide transition',
              loading
                ? 'bg-accent/50 cursor-wait'
                : 'bg-accent hover:bg-accent/90 hover:shadow-lg hover:shadow-emerald/50'
            )}
          >
            {loading ? '…' : 'ACCEDI'}
          </button>
        </form>
      </div>
    </div>
  )
}
