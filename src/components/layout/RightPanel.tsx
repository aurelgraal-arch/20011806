import React from 'react'
import { useAuthStore } from '../../store/authStore'
import { useUserStore } from '../../store/userStore'
import { StatCard } from '../ui/StatCard'
import { Avatar } from '../ui/Avatar'

export const RightPanel: React.FC = () => {
  const user = useAuthStore((s) => s.user)
  const xp = useUserStore((s) => s.xp)
  const level = useUserStore((s) => s.level)
  const walletBalance = useUserStore((s) => s.walletBalance)

  return (
    <aside className="w-60 bg-black fixed top-16 bottom-0 right-0 border-l border-accent2 p-4 overflow-auto hidden lg:block">
      <div className="flex flex-col items-center mb-4">
        {user && <Avatar name={user.public_name || user.sequence_id} size="md" />}
        <p className="text-accent2 mt-2 text-sm">Lv. {level}</p>
      </div>
      <h2 className="text-accent2 mb-2">Statistiche</h2>
      <div className="space-y-2">
        <StatCard label="XP" value={xp} />
        <StatCard label="Saldo" value={walletBalance} />
      </div>
      {/* future: streak, missioni etc */}
    </aside>
  )
}
