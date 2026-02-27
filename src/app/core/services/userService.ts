/**
 * User Service
 * Handles user-related data operations
 */

import { supabase } from '../../../lib/supabase'

export interface UserProfile {
  id: string
  username: string
  email: string
  bio: string
  joined_date: string
  reputation: number
  tokens: number
  missions_completed: number
}

interface UserStats {
  achievement_count: number
  contribution_score: number
  activity_level: string
}

class UserService {
  async getProfile(userId: string): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, email, bio, joined_date, reputation, tokens, missions_completed')
      .eq('id', userId)
      .single()

    if (error) throw new Error(error.message)
    return data as UserProfile
  }

  async getUserStats(userId: string): Promise<UserStats> {
    const { data, error } = await supabase
      .from('user_stats')
      .select('achievement_count, contribution_score, activity_level')
      .eq('user_id', userId)
      .single()

    if (error) {
      // Return default stats if not found
      return { achievement_count: 0, contribution_score: 0, activity_level: 'active' }
    }
    return data as UserStats
  }

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)

    if (error) throw new Error(error.message)
  }
}

export const userService = new UserService()
