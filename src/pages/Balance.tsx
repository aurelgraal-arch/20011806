import React from 'react'
import { useAuthStore } from '../store/authStore'

export const Balance: React.FC = () => {
  const user = useAuthStore((s) => s.user)

  return (
    <div className="pt-20 pl-64 pr-64 pb-4">
      <h1 className="text-accent2 text-2xl">Saldo Cancellieri</h1>
      {user ? (
        <p className="text-accent2/70 text-lg">
          {user.wallet_balance ?? '0'}<span className="ml-1">₿</span>
        </p>
      ) : (
        <p className="text-accent2/40">Utente non autenticato</p>
      )}
    </div>
  )
}