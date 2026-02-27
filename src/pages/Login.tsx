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
    <div className="h-screen flex items-center justify-center bg-black relative overflow-hidden">
      {/* subtle circuit background */}
      <div className="absolute inset-0 opacity-10 bg-[url('/circuits.svg')] bg-center bg-cover" />
      {/* big glowing title */}
      <div className="absolute top-20 w-full text-center">
        <h1 className="text-6xl font-extrabold text-accent drop-shadow-lg">AUR EdenTech</h1>
        <p className="mt-2 text-accent2 text-sm tracking-wide">
          Accesso evolutivo · solo su richiesta · per merito o riconoscimento
        </p>
      </div>
      <div className="relative bg-black/70 border border-accent2 rounded-xl p-10 w-full max-w-lg glass shadow-lg">
        <h2 className="text-2xl text-accent2 mb-4 text-center">
          Accesso tramite sequenza personale
        </h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            value={sequence}
            onChange={(e) => setSequence(e.target.value)}
            disabled={loading}
            className="w-full px-4 py-2 bg-[#111] border border-accent2 rounded transition focus:ring-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="Sequenza"
          />
          {errorMsg && <p className="text-accent animate-pulse text-sm">{errorMsg}</p>}
          <button
            type="submit"
            disabled={loading}
            className={clsx(
              'w-full py-2 rounded text-black font-bold transition',
              loading
                ? 'bg-accent/50 cursor-wait'
                : 'bg-accent hover:bg-accent/90'
            )}
          >
            {loading ? '…' : 'Accedi'}
          </button>
        </form>
      </div>
    </div>
  )
}
