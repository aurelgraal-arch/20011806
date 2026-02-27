import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'

export interface AuthUser {
  id: string
  sequence_id: string
  public_name: string
  level: number
  wallet_balance?: number
}

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
  login: (sequence_id: string) => Promise<void>
  logout: () => void
  restoreSession: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      login: async (sequence_id: string) => {
        set({ loading: true, error: null })
        try {
          // Call RPC verify_sequence as required by platform rules
          const { data, error } = await supabase.rpc('verify_sequence', { sequence_input: sequence_id })
          if (error) throw error

          // RPC should return an object with valid flag and optionally user_id
          // Be tolerant: handle variations in RPC response shape
          const valid = (data && (data.valid === true || data === true)) || false
          const userId = data?.user_id || data?.user?.id || null

          if (!valid) {
            throw new Error('Sequenza non valida')
          }

          // If RPC returned a user id, fetch profile; otherwise create minimal user
          if (userId) {
            const { data: profile, error: profErr } = await supabase.from('profiles').select('id, public_name, level').eq('id', userId).single()
            if (profErr) {
              // fallback to minimal user object
              set({ user: { id: userId, sequence_id, public_name: '', level: 1 }, isAuthenticated: true })
            } else {
              set({ user: { id: profile.id, sequence_id, public_name: profile.public_name || '', level: profile.level || 1 }, isAuthenticated: true })
            }
          } else {
            // no user id returned; use a minimal session object
            set({ user: { id: sequence_id, sequence_id, public_name: '', level: 1 }, isAuthenticated: true })
          }
        } catch (err: any) {
          set({ error: err.message || 'Login failed' })
          throw err
        } finally {
          set({ loading: false })
        }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false })
      },

      restoreSession: () => {
        const stored = get().user
        if (stored) {
          set({ user: stored, isAuthenticated: true })
        }
      },
    }),
    {
      name: 'aur-session',
      partialize: (state) => ({ user: state.user }),
    }
  )
)
