/**
 * User Service
 * Manages user profiles, stats, and wallet operations
 */

import { supabase } from '../../../lib/supabaseClient'
import type { UserProfile, Wallet, Transaction, UserStats } from '../../types'

class UserService {
  // using shared supabase client


  /**
   * Get user profile
   */
  async getProfile(userId: string): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error
    return data
  }

  /**
   * Get user wallet
   */
  async getWallet(userId: string): Promise<Wallet> {
    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) throw error
    return data
  }

  /**
   * Get user stats
   */
  async getUserStats(userId: string): Promise<UserStats> {
    try {
      const [missionsResp, votesResp, forumResp, proposalsResp] = await Promise.all([
        supabase
          .from('user_mission_progress')
          .select('status')
          .eq('user_id', userId)
          .eq('status', 'completed'),
        supabase
          .from('proposal_votes')
          .select('id')
          .eq('user_id', userId),
        supabase
          .from('forum_posts')
          .select('id')
          .eq('user_id', userId),
        supabase
          .from('proposals')
          .select('id')
          .eq('creator_id', userId),
      ])

      const profile = await this.getProfile(userId)

      return {
        missions_completed: missionsResp.data?.length || 0,
        governance_votes: votesResp.data?.length || 0,
        forum_posts: forumResp.data?.length || 0,
        proposals_created: proposalsResp.data?.length || 0,
        total_reputation: profile.reputation,
        consistency_streak: 0, // Would calculate from database
      }
    } catch (error) {
      throw error
    }
  }

  /**
   * Get transaction history
   */
  async getTransactionHistory(
    walletId: string,
    limit: number = 50
  ): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('wallet_id', walletId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  }

  /**
   * Add transaction
   */
  async addTransaction(transaction: Omit<Transaction, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('transactions')
      .insert([transaction])
      .select()

    if (error) throw error
    return data?.[0]
  }

  /**
   * Update wallet balance
   */
  async updateWalletBalance(
    walletId: string,
    amount: number,
    type: 'add' | 'subtract'
  ): Promise<Wallet> {
    const currentWallet = await this.getWallet(walletId.split('_')[0])

    const newBalance =
      type === 'add' ? currentWallet.token_balance + amount : currentWallet.token_balance - amount

    const { data, error } = await supabase
      .from('wallets')
      .update({ token_balance: newBalance })
      .eq('id', walletId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(limit: number = 100, offset: number = 0) {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, reputation, level')
      .order('reputation', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    return data
  }

  /**
   * Search users
   */
  async searchUsers(query: string): Promise<UserProfile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .ilike('username', `%${query}%`)
      .limit(10)

    if (error) throw error
    return data || []
  }

  /**
   * Subscribe to profile changes
   */
  subscribeToProfile(userId: string, callback: (profile: UserProfile) => void) {
    // Use channel API for real-time updates
    supabase
      .channel(`profile-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`,
        },
        (payload: any) => {
          callback(payload.new as UserProfile)
        }
      )
      .subscribe()
    
    return () => {
      supabase.channel(`profile-${userId}`).unsubscribe()
    }
  }
}

export const userService = new UserService()
