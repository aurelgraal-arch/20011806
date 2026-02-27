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
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

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

  const uploadAvatar = async () => {
    if (!user || !avatarFile) return
    setUploading(true)
    try {
      const filename = `avatars/${user.id}/${crypto.randomUUID()}_${avatarFile.name}`
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filename, avatarFile)
      if (uploadError) {
        setError('Errore upload avatar')
        return
      }
      const { data: urlData } = await supabase.storage.from('avatars').getPublicUrl(filename)
      const avatarUrl = urlData?.publicUrl || ''

      const { error: rpcErr } = await supabase.rpc('update_profile', {
        sequence_id: user.sequence_id,
        action: 'update_profile',
        name: publicName,
        bio,
        avatar_url: avatarUrl,
        avatar_frame: '',
        theme_choice: '',
      })
      if (rpcErr) {
        setError(rpcErr.message)
      } else {
        setError('')
        setAvatarFile(null)
      }
    } finally {
      setUploading(false)
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

  const truncateSequence = (seq: string) => seq.substring(0, 12) + '...'

  return (
    <div className="pt-[var(--spacing-lg)] px-[var(--spacing-lg)] pb-[var(--spacing-lg)]">
      <div className="max-w-[1400px] mx-auto">
        <h1 className="text-4xl font-black text-accent2 mb-8 tracking-wide">PROFILO</h1>
        <div className="grid gap-[var(--spacing-md)] lg:grid-cols-2">
          {/* Identità block */}
          <section className="card p-6">
            <h2 className="text-xl font-black text-accent2 mb-4 tracking-wider">IDENTITÀ</h2>
            <div className="flex items-center gap-4 mb-6">
              <Avatar name={user?.public_name || ''} size="lg" />
              <div>
                <p className="text-accent2 font-bold">{user?.public_name || 'Anonimo'}</p>
                <p className="text-accent2/70 text-sm">ID: {truncateSequence(user?.sequence_id || '')}</p>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-accent2 text-sm font-semibold mb-2">Nome pubblico</label>
              <input
                value={publicName}
                onChange={(e) => setPublicName(e.target.value)}
                className="w-full px-4 py-2 bg-black/50 border border-accent2/30 rounded text-accent2 placeholder-accent2/40"
              />
              <button
                onClick={updateName}
                className="mt-2 bg-accent text-black px-4 py-2 rounded hover:bg-accent/90 font-semibold"
              >
                Salva nome
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-accent2 text-sm font-semibold mb-2">Avatar</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setAvatarFile(e.target.files ? e.target.files[0] : null)}
                disabled={uploading}
                className="w-full text-accent2/70 text-sm"
              />
              {avatarFile && (
                <button
                  onClick={uploadAvatar}
                  disabled={uploading}
                  className="mt-2 w-full bg-accent text-black px-4 py-2 rounded hover:bg-accent/90 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Caricamento...' : 'Carica avatar'}
                </button>
              )}
            </div>
          </section>

          {/* Stats block */}
          <section className="card p-6">
            <h2 className="text-xl font-black text-accent2 mb-4 tracking-wider">EVOLUZIONE</h2>
            <div className="space-y-2">
              {user?.level ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-accent2/70">Livello</span>
                    <span className="text-accent2 font-semibold">{user.level}</span>
                  </div>
                </>
              ) : null}
            </div>
          </section>
        </div>
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
