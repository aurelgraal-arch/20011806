/**
 * Authentication Service
 * Handles all Supabase authentication operations
 * Integrates with AuthStore for state management
 */

import { supabase } from '../../../lib/supabaseClient'
import type { AuthCredentials, SignUpData, AuthUser } from '../../types'
import { UserRole } from '../../types'

class AuthService {
  // using shared supabase client; no constructor needed


  /**
   * Sign up new user
   */
  async signup(data: SignUpData): Promise<AuthUser> {
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            username: data.username,
          },
        },
      })

      if (authError) throw authError

      if (!authData.user) throw new Error('No user created')

      // Create user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          username: data.username,
          email: data.email,
          role: UserRole.USER,
          reputation: 0,
          level: 1,
          token_balance: 0,
          is_frozen: false,
        })

      if (profileError) throw profileError

      // Create wallet
      await supabase.from('wallets').insert({
        user_id: authData.user.id,
        token_balance: 0,
        total_earned: 0,
        total_spent: 0,
        governance_weight: 0,
        staking_balance: 0,
      })

      return this.mapAuthUser(authData.user, data.username, UserRole.USER)
    } catch (error) {
      throw error instanceof Error ? error : new Error('Signup failed')
    }
  }

  /**
   * Login user
   */
  /**
   * Legacy login which may still call earlier edge function.  Keeps the same
   * signature for backward compatibility but simply forwards to loginWithHash
   * if provided input looks like a single string.  (Credentials type is no
   * longer used by new hash-based system.)
   */
  async login(credentials: AuthCredentials | string): Promise<AuthUser> {
    if (typeof credentials === 'string') {
      return this.loginWithHash(credentials)
    }
    // if somehow called with email/password, fallback to existing edge fn
    try {
      const { data: fnData, error: fnError } = await supabase.functions.invoke(
        'login',
        {
          body: {
            sequence: credentials.email,
            wallet: '',
            signature: credentials.password,
          },
        }
      )
      if (fnError) throw fnError

      const session = fnData?.session
      if (session) {
        const { error: setErr } = await supabase.auth.setSession(session)
        if (setErr) throw setErr
      }

      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser()
      if (userErr) throw userErr
      if (!user) throw new Error('No user returned')

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      if (profileError) throw profileError

      return this.mapAuthUser(user, profileData.username, profileData.role)
    } catch (error) {
      throw error instanceof Error ? error : new Error('Login failed')
    }
  }

  /**
   * Authenticate by hash sequence.
   * Sends value to `/functions/v1/login-hash` that will validate against the
   * issued hash list and then generate a Supabase session for the associated
   * user (password is assumed equal to the hash).
   */
  async loginWithHash(hash: string): Promise<AuthUser> {
    try {
      const { data: fnData, error: fnError } = await supabase.functions.invoke(
        'login-hash',
        { body: { hash } }
      )
      if (fnError) throw fnError

      const session = fnData?.session
      if (session) {
        const { error: setErr } = await supabase.auth.setSession(session)
        if (setErr) throw setErr
      }

      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser()
      if (userErr) throw userErr
      if (!user) throw new Error('No user returned')

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      if (profileError) throw profileError

      return this.mapAuthUser(user, profileData.username, profileData.role)
    } catch (error) {
      throw error instanceof Error ? error : new Error('Login failed')
    }
  }
  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  /**
   * Get current session
   */
  async getSession() {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    return data.session
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const session = await this.getSession()
      if (!session?.user) return null

      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (error) throw error

      return this.mapAuthUser(
        session.user,
        profileData.username,
        profileData.role
      )
    } catch {
      return null
    }
  }

  /**
   * Refresh session
   */
  async refreshSession(): Promise<AuthUser | null> {
    try {
      const { data, error } = await supabase.auth.refreshSession()
      if (error) throw error
      if (!data.session?.user) return null

      return this.getCurrentUser()
    } catch {
      return null
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updates: Partial<AuthUser>): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)

    if (error) throw error
  }

  /**
   * Subscribe to auth changes
   */
  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const user = await this.getCurrentUser()
        callback(user)
      } else {
        callback(null)
      }
    })
  }

  /**
   * Helper: Map Supabase user to AuthUser
   */
  private mapAuthUser(
    supabaseUser: any,
    username: string,
    role: UserRole
  ): AuthUser {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      username,
      role,
      created_at: supabaseUser.created_at || new Date().toISOString(),
      updated_at: supabaseUser.updated_at || new Date().toISOString(),
    }
  }
}

export const authService = new AuthService()