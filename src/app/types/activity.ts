/**
 * Activity feed types
 * Real-time activity tracking
 */

export enum ActivityType {
  MISSION_COMPLETED = 'mission_completed',
  REWARD_CLAIMED = 'reward_claimed',
  PROPOSAL_CREATED = 'proposal_created',
  VOTE_CAST = 'vote_cast',
  LEVEL_UP = 'level_up',
  RANK_MILESTONE = 'rank_milestone',
  REPUTATION_GAINED = 'reputation_gained',
  USER_FROZEN = 'user_frozen',
  ADMIN_ACTION = 'admin_action',
}

export interface ActivityFeed {
  id: string
  user_id: string
  activity_type: ActivityType
  title: string
  description: string
  metadata?: Record<string, any>
  visibility: 'public' | 'private' | 'admin'
  created_at: string
}

export interface ActivityBatch {
  activities: ActivityFeed[]
  total_count: number
  has_more: boolean
}

export interface RealTimeActivityEvent {
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  activity: ActivityFeed
  timestamp: string
}
