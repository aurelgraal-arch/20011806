import { supabase } from '../../../lib/supabaseClient'
import type { ActivityFeed } from '../../types'

class ActivityService {
  async getActivities(limit = 50) {
    const { data, error } = await supabase
      .from('activity_feed')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) throw error
    return data || []
  }

  subscribe(callback: (item: ActivityFeed) => void) {
    const channel = supabase
      .channel('activity_feed')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'activity_feed' },
        (payload: any) => {
          callback(payload.new as ActivityFeed)
        }
      )
      .subscribe()
    return () => channel.unsubscribe()
  }

  subscribeNotifications(callback: (payload: any) => void) {
    const ch = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        (payload: any) => {
          callback(payload.new)
        }
      )
      .subscribe()
    return () => ch.unsubscribe()
  }
}

export const activityService = new ActivityService()
