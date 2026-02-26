/**
 * Admin panel and control types
 */

export enum AdminAction {
  FREEZE_USER = 'freeze_user',
  UNFREEZE_USER = 'unfreeze_user',
  ADJUST_REPUTATION = 'adjust_reputation',
  ADJUST_TOKENS = 'adjust_tokens',
  DELETE_MISSION = 'delete_mission',
  SUSPEND_USER = 'suspend_user',
  CREATE_MISSION = 'create_mission',
  UPDATE_MISSION = 'update_mission',
}

export interface AdminLog {
  id: string
  admin_id: string
  target_user_id?: string
  action: AdminAction
  details: Record<string, any>
  reason?: string
  created_at: string
}

export interface PlatformStats {
  total_users: number
  active_users_24h: number
  total_missions_completed: number
  total_tokens_distributed: number
  total_reputation_issued: number
  average_user_level: number
  token_circulation: number
}

export interface UserFreezeStatus {
  user_id: string
  is_frozen: boolean
  frozen_at?: string
  frozen_until?: string
  reason?: string
  frozen_by?: string
}

export interface MissionManagement {
  mission_id: string
  action: 'create' | 'update' | 'delete' | 'deactivate'
  timestamp: string
  admin_id: string
}
