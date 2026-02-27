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
          const { data, error } = await supabase.functions.invoke('dynamic-task', {
            body: {
              action: 'login',
              sequence_id: sequence_id,
            },
          })
          if (error) throw error
          if (!data?.valid) {
            throw new Error('Sequenza non valida')
          }
          // dynamic-task now returns a user object when valid
          // shape: { valid: true, user: { id, sequence_id, public_name, level, wallet_balance? } }
          const returnedUser = data.user || {}
          const userObj: AuthUser = {
            id: returnedUser.id,
            sequence_id: returnedUser.sequence_id || sequence_id,
            public_name: returnedUser.public_name || '',
            level: returnedUser.level || 1,
          }
          // include optional wallet_balance if provided
          if ('wallet_balance' in returnedUser) {
            ;(userObj as any).wallet_balance = returnedUser.wallet_balance
          }
          set({ user: userObj, isAuthenticated: true })
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
