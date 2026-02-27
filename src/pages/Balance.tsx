import React from 'react'
import { useAuthStore } from '../store/authStore'
import { StatCard } from '../components/ui/StatCard'

export const Balance: React.FC = () => {
  const user = useAuthStore((s) => s.user)

  return (
    <div className="pt-20 pl-64 pr-64 pb-4">
      <h1 className="text-accent2 text-2xl">Saldo Cancellieri</h1>
      {user ? (
        <div className="max-w-xs">
          <StatCard label="Saldo" value={user.wallet_balance ?? 0} />
        </div>
      ) : (
        <p className="text-accent2/40">Utente non autenticato</p>
      )}
    </div>
  )
}