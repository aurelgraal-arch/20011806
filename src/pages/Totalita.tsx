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

interface FounderPost {
  id: string
  title: string
  content: string
}

export const Totalita: React.FC = () => {
  const user = useAuthStore((s) => s.user)
  const [stats, setStats] = useState<any>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [recentUsers, setRecentUsers] = useState<any[]>([])
  const [recentTrips, setRecentTrips] = useState<any[]>([])
  const [recentBadges, setRecentBadges] = useState<any[]>([])

  const founderPosts: FounderPost[] = [
    {
      id: 'founder-1',
      title: 'Perché esiste EdenTech',
      content:
        'EdenTech nasce per unire persone che vogliono evolvere, costruire valore reale e creare una civiltà digitale basata su merito, responsabilità e visione.',
    },
    {
      id: 'founder-2',
      title: 'Perché siamo qui',
      content:
        'Questa piattaforma è uno spazio operativo, non un social. Qui si costruisce, si impara, si cresce e si contribuisce all\'ecosistema.',
    },
    {
      id: 'founder-3',
      title: 'Perché è sicura',
      content:
        'L\'accesso tramite sequenze personali e un\'infrastruttura distribuita rende EdenTech una piattaforma privata, resiliente e indipendente.',
    },
  ]

  useEffect(() => {
    if (!user) return
    ;(async () => {
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
        .limit(6)
      if (usersData) setRecentUsers(usersData as any[])

      const { data: tripsData } = await supabase
        .from('journey_steps')
        .select('id,title,created_at')
        .order('created_at', { ascending: false })
        .limit(6)
      if (tripsData) setRecentTrips(tripsData as any[])

      const { data: badgesData } = await supabase
        .from('badges')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6)
      if (badgesData) setRecentBadges(badgesData as any[])
    })()
  }, [user])

  return (
    <div className="pt-[var(--spacing-lg)] px-[var(--spacing-lg)] pb-[var(--spacing-lg)]">
      <div className="max-w-[1400px] mx-auto">
        <h1 className="text-5xl font-black text-accent2 mb-12 tracking-wide">
          DASHBOARD CENTRALE
        </h1>

        <div className="grid gap-[var(--spacing-md)] lg:grid-cols-3">
          {/* LEFT COLUMN: User Stats */}
          <div className="space-y-[var(--spacing-md)]">
            <div className="card p-6">
              <h3 className="text-xl font-black text-accent2 tracking-wider mb-4">
                PROGRESSI
              </h3>
              {stats ? (
                <ul className="text-accent2/80 space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span>Livello</span>
                    <span className="text-accent2 font-semibold">{stats.level}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>XP</span>
                    <span className="text-accent2 font-semibold">{stats.xp}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Saldo Cancelliere</span>
                    <span className="text-accent2 font-semibold">
                      {stats.balance}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span>Missioni</span>
                    <span className="text-accent2 font-semibold">
                      {stats.missions || 0}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span>Badge</span>
                    <span className="text-accent2 font-semibold">
                      {stats.badge_count || 0}
                    </span>
                  </li>
                </ul>
              ) : (
                <p className="text-accent2/40 text-sm">Caricamento...</p>
              )}
            </div>
          </div>

          {/* CENTER COLUMN: Forum */}
          <div className="space-y-[var(--spacing-md)]">
            <div>
              <h2 className="text-2xl font-black text-accent2 tracking-wider mb-6">
                FORUM GLOBALE
              </h2>
              <div className="space-y-[var(--spacing-md)]">
                {/* Founder Posts */}
                {founderPosts.map((p) => (
                  <div key={p.id} className="card p-6 border-accent2/60 hover:border-accent2">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-lg font-black text-accent2 tracking-wide flex-1">
                        {p.title}
                      </h4>
                    </div>
                    <div className="mb-3">
                      <span className="inline-block px-2 py-1 text-xs font-bold text-black bg-accent2 rounded">
                        FONDATORE
                      </span>
                    </div>
                    <p className="text-accent2/80 text-sm leading-relaxed">
                      {p.content}
                    </p>
                  </div>
                ))}
                {/* User Posts */}
                {posts.map((p) => (
                  <div
                    key={p.id}
                    className="card p-6 border-accent2/30 hover:border-accent2 hover:glow-emerald"
                  >
                    <h4 className="text-md font-semibold text-accent2 mb-1">
                      {p.title}
                    </h4>
                    <p className="text-accent2/70 text-sm leading-relaxed">
                      {p.problem_reflection}
                    </p>
                  </div>
                ))}
                {posts.length === 0 && (
                  <div className="card p-6 border-accent2/20">
                    <p className="text-accent2/40 text-sm">Nessun post al momento</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Ecosystem Activity */}
          <div className="space-y-[var(--spacing-md)]">
            <div>
              <h2 className="text-2xl font-black text-accent2 tracking-wider mb-6">
                ATTIVITÀ ECOSISTEMA
              </h2>
              <div className="space-y-[var(--spacing-md)]">
                {/* Recent Users */}
                <div className="card p-6">
                  <h3 className="text-sm font-black text-accent2 tracking-wider mb-3 uppercase">
                    Nuovi utenti
                  </h3>
                  {recentUsers.length > 0 ? (
                    <ul className="text-accent2/80 space-y-1 text-xs">
                      {recentUsers.map((u) => (
                        <li
                          key={u.id}
                          className="text-accent2/70 truncate hover:text-accent2 transition"
                        >
                          {u.public_name || u.id.substring(0, 8)}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-accent2/40 text-xs">Nessuno</p>
                  )}
                </div>

                {/* Recent Trips */}
                <div className="card p-6">
                  <h3 className="text-sm font-black text-accent2 tracking-wider mb-3 uppercase">
                    Nuovi viaggi
                  </h3>
                  {recentTrips.length > 0 ? (
                    <ul className="text-accent2/80 space-y-1 text-xs">
                      {recentTrips.map((t) => (
                        <li
                          key={t.id}
                          className="text-accent2/70 truncate hover:text-accent2 transition"
                        >
                          {t.title}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-accent2/40 text-xs">Nessuno</p>
                  )}
                </div>

                {/* Recent Badges */}
                <div className="card p-6">
                  <h3 className="text-sm font-black text-accent2 tracking-wider mb-3 uppercase">
                    Badge sbloccati
                  </h3>
                  {recentBadges.length > 0 ? (
                    <ul className="text-accent2/80 space-y-1 text-xs">
                      {recentBadges.map((b) => (
                        <li
                          key={b.id}
                          className="text-accent2/70 truncate hover:text-accent2 transition"
                        >
                          {b.name || b.id}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-accent2/40 text-xs">Nessuno</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
