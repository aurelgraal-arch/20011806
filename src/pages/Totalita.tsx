import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'

interface Post {
  id: string
  title: string
  problem_reflection: string
  solution_intention: string
  context_description: string
  created_at?: string
}

export const Totalita: React.FC = () => {
  const user = useAuthStore((s) => s.user)
  const [stats, setStats] = useState<any>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [recentUsers, setRecentUsers] = useState<any[]>([])
  const [recentTrips, setRecentTrips] = useState<any[]>([])

  const pinned: Post[] = [
    {
      id: 'pin1',
      title: 'Perché esiste EdenTech',
      problem_reflection: '',
      solution_intention: '',
      context_description: 'Scopri lo scopo della piattaforma.',
    },
    {
      id: 'pin2',
      title: 'Perché siamo qui',
      problem_reflection: '',
      solution_intention: '',
      context_description: 'Vale a dire la nostra missione.',
    },
    {
      id: 'pin3',
      title: 'Perché è sicura',
      problem_reflection: '',
      solution_intention: '',
      context_description: 'Tutti i dettagli sulla sicurezza.',
    },
  ]

  useEffect(() => {
    if (!user) return
    (async () => {
      const { data, error } = await supabase.rpc('dashboard_data', {
        sequence_id: user.sequence_id,
        action: 'dashboard_data',
      })
      if (!error) setStats(data)

      const { data: postsData } = await supabase
        .from('forum_posts')
        .select('*')
        .order('created_at', { ascending: false })
      if (postsData) setPosts(postsData as Post[])

      const { data: usersData } = await supabase
        .from('profiles')
        .select('id, public_name, created_at')
        .order('created_at', { ascending: false })
        .limit(5)
      if (usersData) setRecentUsers(usersData as any[])

      const { data: tripsData } = await supabase
        .from('journey_steps')
        .select('id,title,created_at')
        .order('created_at', { ascending: false })
        .limit(5)
      if (tripsData) setRecentTrips(tripsData as any[])
    })()
  }, [user])

  return (
    <div className="pt-20 px-6">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* left stats column */}
        <div className="space-y-4">
          <div className="bg-card border border-accent2 p-4 rounded">
            <h3 className="text-accent2 font-semibold">Progressi</h3>
            {stats ? (
              <ul className="text-accent2/80 mt-2 text-sm space-y-1">
                <li>Livello: {stats.level}</li>
                <li>XP: {stats.xp}</li>
                <li>Saldo: {stats.balance} Cancelliere</li>
                <li>Missioni: {stats.missions || 0}</li>
                <li>Badge: {stats.badge_count || 0}</li>
              </ul>
            ) : (
              <p className="text-accent2/40">Caricamento...</p>
            )}
          </div>
        </div>

        {/* center forum column */}
        <div className="space-y-6">
          {/* pinned posts */}
          {pinned.map((p) => (
            <div
              key={p.id}
              className="bg-card border border-accent2 p-4 rounded shadow-lg"
            >
              <h4 className="text-accent2 font-bold">{p.title}</h4>
              <p className="text-accent2/70 text-sm mt-1">
                {p.context_description}
              </p>
            </div>
          ))}
          {/* user posts */}
          {posts.map((p) => (
            <div
              key={p.id}
              className="bg-card border border-accent2 p-4 rounded hover:shadow-emerald transition"
            >
              <h4 className="text-accent2 font-semibold">{p.title}</h4>
              <p className="text-accent2/70 text-sm mt-1">
                {p.problem_reflection}
              </p>
            </div>
          ))}
        </div>

        {/* right activities column */}
        <div className="space-y-4">
          <div className="bg-card border border-accent2 p-4 rounded">
            <h3 className="text-accent2 font-semibold">Nuovi utenti</h3>
            {recentUsers.length > 0 ? (
              <ul className="text-accent2/80 mt-2 text-sm space-y-1">
                {recentUsers.map((u) => (
                  <li key={u.id}>{u.public_name || u.id}</li>
                ))}
              </ul>
            ) : (
              <p className="text-accent2/40">Nessuno</p>
            )}
          </div>
          <div className="bg-card border border-accent2 p-4 rounded">
            <h3 className="text-accent2 font-semibold">Nuovi viaggi</h3>
            {recentTrips.length > 0 ? (
              <ul className="text-accent2/80 mt-2 text-sm space-y-1">
                {recentTrips.map((t) => (
                  <li key={t.id}>{t.title}</li>
                ))}
              </ul>
            ) : (
              <p className="text-accent2/40">Nessuno</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
