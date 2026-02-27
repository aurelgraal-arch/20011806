import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Badge } from '../components/ui/Badge'

interface Badge {
  id: string
  name: string
  description: string
  unlocked: boolean
}

export const Premi: React.FC = () => {
  const [badges, setBadges] = useState<Badge[]>([])

  useEffect(() => {
    // fetch all badges (requires rpc or table)
    const fetch = async () => {
      const { data, error } = await supabase.from('badges').select('*')
      if (!error && Array.isArray(data)) setBadges(data as Badge[])
    }
    fetch()
  }, [])

  return (
    <div className="pt-20 px-6 pb-4">
      <h1 className="text-accent2 text-2xl mb-4">Premi</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {badges.map((b) => (
          <div
            key={b.id}
            className={
              'bg-card border border-accent2 rounded-lg p-4 shadow-lg hover:shadow-emerald transition ' +
              (b.unlocked ? 'opacity-100' : 'opacity-40')
            }
          >
            <h3 className="text-accent2 font-semibold">{b.name}</h3>
            <p className="text-accent2/70 text-sm mb-2">{b.description}</p>
            <Badge label={b.unlocked ? 'Sbloccato' : 'Bloccato'} variant={b.unlocked ? 'success' : 'warning'} />
          </div>
        ))}
        {badges.length === 0 && (
          <p className="text-accent2/40">Nessun badge trovato.</p>
        )}
      </div>
    </div>
  )
}
