/**
 * User profile and wallet types
 * Tracks reputation, tokens, status, and account data
 */

import { UserRole } from './auth'

export interface UserProfile {
  id: string
  user_id: string
  username: string
  email: string
  avatar_url?: string
  bio?: string
  role: UserRole
  reputation: number
  level: number
  token_balance: number
  is_frozen: boolean
  created_at: string
  updated_at: string
}

export interface Wallet {
  id: string
  user_id: string
  token_balance: number
  total_earned: number
  total_spent: number
  governance_weight: number
  staking_balance: number
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  wallet_id: string
  amount: number
  type: 'reward' | 'spend' | 'stake' | 'claim'
  description: string
  created_at: string
}

export interface UserStats {
  missions_completed: number
  governance_votes: number
  forum_posts: number
  proposals_created: number
  rank_position?: number
  total_reputation: number
  consistency_streak: number
}
