/**
 * Activity Feed Component
 * Real-time activity display for user actions on the platform
 */

import React, { useMemo } from 'react'
import { ActivityType } from '../../types'
import type { ActivityFeed } from '../../types'
import { Badge } from '../../components/ui'

interface ActivityFeedProps {
  activities: ActivityFeed[]
  isLoading?: boolean
  limit?: number
}

// Activity type to icon and color mapping
const ACTIVITY_CONFIG: Record<ActivityType, { icon: string; color: string; label: string }> = {
  [ActivityType.MISSION_COMPLETED]: {
    icon: '✅',
    color: 'success',
    label: 'Mission Completed',
  },
  [ActivityType.REWARD_CLAIMED]: {
    icon: '🎁',
    color: 'success',
    label: 'Reward Claimed',
  },
  [ActivityType.PROPOSAL_CREATED]: {
    icon: '📝',
    color: 'info',
    label: 'Proposal Created',
  },
  [ActivityType.VOTE_CAST]: {
    icon: '🗳️',
    color: 'info',
    label: 'Vote Cast',
  },
  [ActivityType.LEVEL_UP]: {
    icon: '⬆️',
    color: 'warning',
    label: 'Level Up',
  },
  [ActivityType.RANK_MILESTONE]: {
    icon: '🏆',
    color: 'warning',
    label: 'Rank Milestone',
  },
  [ActivityType.REPUTATION_GAINED]: {
    icon: '⭐',
    color: 'success',
    label: 'Reputation Gained',
  },
  [ActivityType.USER_FROZEN]: {
    icon: '❄️',
    color: 'danger',
    label: 'Account Frozen',
  },
  [ActivityType.ADMIN_ACTION]: {
    icon: '⚙️',
    color: 'danger',
    label: 'Admin Action',
  },
}

const formatTime = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString()
}

export const ActivityFeedComponent: React.FC<ActivityFeedProps> = ({
  activities,
  isLoading = false,
  limit = 10,
}) => {
  const displayActivities = useMemo(() => {
    return activities.slice(0, limit)
  }, [activities, limit])

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="bg-slate-800 rounded-lg p-4 animate-pulse h-16"
          />
        ))}
      </div>
    )
  }

  if (displayActivities.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-400">No activity yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {displayActivities.map((activity) => {
        const config = ACTIVITY_CONFIG[activity.activity_type]

        return (
          <div
            key={activity.id}
            className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-start gap-4">
              <div className="text-2xl flex-shrink-0 mt-1">
                {config.icon}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="font-semibold text-white whitespace-nowrap">
                    {activity.title}
                  </h4>
                  <Badge
                    label={config.label}
                    variant={config.color as any}
                    size="sm"
                  />
                </div>

                <p className="text-sm text-slate-400 mb-2">
                  {activity.description}
                </p>

                <p className="text-xs text-slate-500">
                  {formatTime(activity.created_at)}
                </p>

                {activity.metadata && (
                  <div className="mt-2 text-xs text-slate-400">
                    {Object.entries(activity.metadata).map(([key, value]) => (
                      <p key={key}>
                        {key}: <span className="text-slate-300">{String(value)}</span>
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default ActivityFeedComponent
