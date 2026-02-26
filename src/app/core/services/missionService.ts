import { supabase } from '../../../lib/supabaseClient'
import type { Mission } from '../../types'

class MissionService {
  async getMissions(): Promise<Mission[]> {
    const { data, error } = await supabase
      .from('missions')
      .select('*')
      .order('created_at', { ascending: true })
    if (error) throw error
    return data || []
  }

  /**
   * Subscribe to mission list changes (new/updated missions)
   */
  subscribe(callback: (mission: Mission) => void) {
    supabase
      .channel('missions')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'missions' },
        (payload: any) => {
          callback(payload.new as Mission)
        }
      )
      .subscribe()
    return () => {
      supabase.channel('missions').unsubscribe()
    }
  }

  async getUserProgress(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('user_mission_progress')
      .select('*')
      .eq('user_id', userId)
    if (error) throw error
    return data || []
  }

  async completeMission(userId: string, missionId: string, updates: Partial<any>) {
    const { data, error } = await supabase
      .from('user_mission_progress')
      .update(updates)
      .eq('user_id', userId)
      .eq('mission_id', missionId)
    if (error) throw error
    return data
  }
}

export const missionService = new MissionService()
