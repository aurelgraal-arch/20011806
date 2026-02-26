/**
 * Mission system types
 * Defines all mission-related interfaces
 */

export enum MissionType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  GOVERNANCE = 'governance',
  COMMUNITY = 'community',
  MILESTONE = 'milestone',
}

export enum MissionStatus {
  AVAILABLE = 'available',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  EXPIRED = 'expired',
  LOCKED = 'locked',
}

export interface Mission {
  id: string
  title: string
  description: string
  type: MissionType
  status: MissionStatus
  reward_tokens: number
  reputation_gain: number
  requirements: MissionRequirement[]
  cooldown_hours: number
  min_reputation_required: number
  min_level_required: number
  max_participants?: number
  current_participants?: number
  expires_at: string
  created_at: string
  updated_at: string
}

export interface MissionRequirement {
  type: 'action' | 'count' | 'condition'
  description: string
  target_value?: number
}

export interface UserMissionProgress {
  id: string
  user_id: string
  mission_id: string
  status: MissionStatus
  progress: number
  completed_at?: string
  created_at: string
  updated_at: string
}

export interface MissionReward {
  user_id: string
  mission_id: string
  tokens: number
  reputation: number
  claimed: boolean
  created_at: string
}
