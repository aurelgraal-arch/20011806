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
      const { data, error } = await supabase.functions.invoke('dynamic-task', {
        body: { sequence_id: hash },
      })
      
      if (error) throw new Error(error.message)
      
      const response = data as EdgeResponse
      if (!response.valid || !response.user) {
        throw new Error('Invalid access sequence')
      }

      const user: AuthUser = {
        id: response.user.id,
        sequence_id: response.user.sequence_id,
        public_name: response.user.public_name,
        level: response.user.level,
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
      
      // Verify user is still valid by calling the edge function
      const { data, error } = await supabase.functions.invoke('dynamic-task', {
        body: { sequence_id: user.sequence_id },
      })

      if (error || !(data as EdgeResponse).valid) {
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
