import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import clsx from 'clsx'

export const Login: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as any)?.from?.pathname || '/totalita'

  const [sequence, setSequence] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (!sequence.trim()) {
      setErrorMsg('Inserisci una sequenza')
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase.rpc('verify_sequence', {
        input_code: sequence.trim(),
      })

      console.log('DATA:', data)
      console.log('ERROR:', error)

      if (error || !data) {
        setErrorMsg('Sequenza non valida')
        return
      }

      localStorage.setItem('auth', 'true')
      localStorage.setItem('sequence_id', sequence.trim())

      navigate(from, { replace: true })
    } catch (err: any) {
      setErrorMsg(err.message || 'Errore di login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen flex items-center justify-center bg-black relative">
      <div className="absolute inset-0 opacity-5 bg-[url('/circuits.svg')]" />
      <div className="absolute inset-0 flex items-center justify-center">
        {/* giant logo placeholder */}
        <div className="text-9xl text-accent/20 font-black">AUR</div>
      </div>
      <div className="relative bg-black/60 border border-accent2 rounded-xl p-8 w-full max-w-md glass">
        <h1 className="text-3xl text-accent2 mb-4 text-center">Accesso Evolutivo</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            value={sequence}
            onChange={(e) => setSequence(e.target.value)}
            disabled={loading}
            className="w-full px-4 py-2 bg-[#111] border border-accent2 rounded transition focus:ring-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="Sequence ID"
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
