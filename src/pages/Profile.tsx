import React, { useEffect, useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { supabase } from '../lib/supabase'
import { ensureBaseNetwork } from '../lib/wallet'
import { Avatar } from '../components/ui/Avatar'
import { StatCard } from '../components/ui/StatCard'

export const Profile: React.FC = () => {
  const user = useAuthStore((s) => s.user)
  const [publicName, setPublicName] = useState(user?.public_name || '')
  const [error, setError] = useState('')
  const [bio, setBio] = useState('')

  useEffect(() => {
    if (user) {
      // network check
      ensureBaseNetwork().catch(() => {
        // ignore, banner could appear
      })
      // load profile details from rpc
      ;(async () => {
        const { data, error } = await supabase.rpc('get_profile', {
          sequence_id: user.sequence_id,
          action: 'get_profile',
        })
        if (!error && data) {
          setPublicName(data.name || '')
          setBio(data.bio || '')
        }
      })()
    }
  }, [user])

  const updateName = async () => {
    if (!user) return
    if (!/^[\w]{3,24}$/.test(publicName)) {
      setError('Nome non valido')
      return
    }
    const { error: rpcErr } = await supabase.rpc('update_public_name', {
      p_user_id: user.id,
      p_new_name: publicName,
    })
    if (rpcErr) {
      setError(rpcErr.message)
    } else {
      setError('')
    }
  }

  const saveProfile = async () => {
    if (!user) return
    const { error: rpcErr } = await supabase.rpc('update_profile', {
      sequence_id: user.sequence_id,
      action: 'update_profile',
      name: publicName,
      bio,
      avatar_url: '',
      avatar_frame: '',
      theme_choice: '',
    })
    if (rpcErr) setError(rpcErr.message)
  }

  return (
    <div className="pt-20 px-6 pb-4">
      <h1 className="text-accent2 text-2xl mb-4">Profilo</h1>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Identità block */}
        <section className="bg-card border border-accent2 p-4 rounded-lg flex-1">
          <h2 className="text-accent2 font-semibold mb-2">Identità</h2>
          <div className="flex items-center gap-4 mb-4">
            <Avatar name={user?.public_name || ''} size="lg" />
            <div>
              <p className="text-accent2 font-bold">{user?.public_name || 'Anonimo'}</p>
              <p className="text-accent2 text-sm">Sequence ID: {user?.sequence_id}</p>
            </div>
          </div>
          <div className="mb-2">
            <label className="block text-accent2 text-sm">Nome pubblico</label>
            <input
              value={publicName}
              onChange={(e) => setPublicName(e.target.value)}
              className="w-full px-3 py-2 bg-[#111] border border-accent2 rounded"
            />
            <button
              onClick={updateName}
              className="mt-2 bg-accent text-black px-3 py-1 rounded hover:bg-accent/90"
            >
              Salva nome
            </button>
          </div>
        </section>

        {/* Evolution block */}
        <section className="bg-card border border-accent2 p-4 rounded-lg flex-1">
          <h2 className="text-accent2 font-semibold mb-2">Evoluzione</h2>
          <div className="grid grid-cols-1 gap-4">
            <StatCard label="Livello" value={user?.level || 0} />
            <StatCard label="XP" value={user?.level ? user?.level * 100 : 0} />
          </div>
        </section>
      </div>
      {/* additional blocks (customization, activity, wallet) would follow similarly */}
      <div className="mt-4">
        <button
          onClick={saveProfile}
          className="bg-accent text-black px-4 py-2 rounded hover:bg-accent/90"
        >
          Salva profilo completo
        </button>
      </div>
      {error && <p className="text-accent animate-pulse text-sm text-accent">{error}</p>}
    </div>
  )
}
