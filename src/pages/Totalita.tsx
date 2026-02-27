import React from 'react'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { useAuthStore } from '../store/authStore'
import { supabase } from '../lib/supabase'

const Card: React.FC<{ title: string; to: string }> = ({ title, to }) => {
  const nav = useNavigate()
  return (
    <div
      onClick={() => nav(to)}
      className="cursor-pointer bg-card border border-accent2 p-6 rounded-lg shadow-lg hover:shadow-emerald transition-all duration-200 text-center"
    >
      <h2 className="text-accent2 text-xl font-semibold">{title}</h2>
    </div>
  )
}

export const Totalita: React.FC = () => {
  const user = useAuthStore((s) => s.user)
  const [stats, setStats] = React.useState<any>(null)

  React.useEffect(() => {
    if (!user) return
    ;(async () => {
      const { data, error } = await supabase.rpc('dashboard_data', {
        sequence_id: user.sequence_id,
        action: 'dashboard_data',
      })
      if (!error) setStats(data)
    })()
  }, [user])

  return (
    <div className="pt-20 pl-64 pr-64 pb-4">
      <div className="mb-6 grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card title="Profilo" to="/profile" />
        <Card title="Forum" to="/forum" />
        <Card title="Viaggio" to="/viaggio" />
        <Card title="Wallet" to="/wallet" />
        <Card title="Badge" to="/premi" />
      </div>
      {stats && (
        <div className="mt-8 text-accent2">
          <p>Livello: {stats.level}</p>
          <p>Saldo coin: {stats.balance}</p>
        </div>
      )}
    </div>
  )
}
