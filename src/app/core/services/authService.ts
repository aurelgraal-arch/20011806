/**
 * Authentication Service (edge-function based)
 * Only performs login via `dynamic-task` edge function.  No Supabase Auth.
 */

import { supabase } from '../../../lib/supabase'
import type { AuthUser, SignUpData } from '../../types'

interface EdgeResponse {
  valid: boolean
  user?: {
    id: string
    sequence_id: string
    public_name: string
    level: number
  }
}

class AuthService {
  private readonly STORAGE_KEY = 'auth_user'

  async loginWithHash(hash: string): Promise<AuthUser> {
    try {
      // Use RPC verify_sequence instead of edge function
      const { data, error } = await supabase.rpc('verify_sequence', { sequence_input: hash })
      if (error) throw new Error(error.message)

      const valid = (data && (data.valid === true || data === true)) || false
      const userId = data?.user_id || data?.user?.id || null
      if (!valid || !userId) throw new Error('Invalid access sequence')

      const profileRes = await supabase.from('profiles').select('id, public_name, level').eq('id', userId).single()
      const profile = profileRes.data
      const user: AuthUser = {
        id: profile?.id || userId,
        sequence_id: hash,
        public_name: profile?.public_name || '',
        level: profile?.level || 1,
      }

      // Store user in localStorage
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user))
      return user
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Login failed'
      throw new Error(msg)
    }
  }

  async signup(data: SignUpData): Promise<AuthUser> {
    // Since we're using hash-based auth, signup is not implemented
    // Users must receive their sequence hash from the system
    // The 'data' parameter is intentionally unused
    void data
    throw new Error('Signup is not available in this system. Please contact support for access.')
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) return null

      const user = JSON.parse(stored) as AuthUser
      // Verify user via RPC
      const { data, error } = await supabase.rpc('verify_sequence', { sequence_input: user.sequence_id })
      const valid = data && (data.valid === true || data === true)
      if (error || !valid) {
        localStorage.removeItem(this.STORAGE_KEY)
        return null
      }
      return user
    } catch (error) {
      localStorage.removeItem(this.STORAGE_KEY)
      return null
    }
  }

  async logout(): Promise<void> {
    localStorage.removeItem(this.STORAGE_KEY)
    // no server session to clear
  }
}

export const authService = new AuthService()
