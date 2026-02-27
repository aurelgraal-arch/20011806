/**
 * Profile Page
 * User profile and settings
 */

import React, { useEffect, useState } from 'react'
import { useAuthStore } from '../../core/store/authStore'
import { Card, StatCard, ProgressBar, Badge, Button, Skeleton } from '@components/ui'
import { Avatar } from '@components/ui'
import { ReputationEngine } from '../../core/engines/reputationEngine'
import { userService } from '../../core/services/userService'
import { useToast } from '@hooks/useToast'

export const ProfilePage: React.FC = () => {
  const { user, refreshSession } = useAuthStore()
  const { addToast } = useToast()

  const [profileData, setProfileData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    setLoading(true)
    userService
      .getProfile(user.id)
      .then((p: any) => {
        setProfileData(p)
      })
      .catch((e: any) => {
        const msg = e instanceof Error ? e.message : 'Failed to load profile'
        addToast(msg, 'error')
      })
      .finally(() => setLoading(false))

    userService
      .getUserStats(user.id)
      .then((_s: any) => {
        // stats loaded but not needed in ui yet
      })
      .catch((e: any) => {
        const msg = e instanceof Error ? e.message : 'Stats load failed'
        addToast(msg, 'error')
      })

    refreshSession()
  }, [user, refreshSession, addToast])

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-400">Loading profile...</p>
      </div>
    )
  }

  if (loading || !profileData) {
    return (
      <div className="p-6">
        <Skeleton variant="card" count={3} />
      </div>
    )
  }

  const progressData = ReputationEngine.getProgressToNextLevel(profileData.reputation)

  const statsData = [
    {
      label: 'Reputation',
      value: profileData.reputation.toLocaleString(),
      trend: '+245 this month',
    },
    {
      label: 'Level',
      value: String(ReputationEngine.getUserLevel(profileData.reputation)),
      trend: 'Unlocked features',
    },
    {
      label: 'Tokens',
      value: profileData.tokens.toLocaleString(),
      trend: '+1200 this month',
    },
    {
      label: 'Missions',
      value: profileData.missions_completed.toString(),
      trend: '3 this week',
    },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-6">
            <Avatar
              name={profileData.username}
              size="lg"
              className="h-24 w-24"
            />
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-white">{profileData.username}</h1>
              <p className="text-slate-400">{profileData.email}</p>
              <p className="text-slate-300 mt-2">{profileData.bio}</p>
              <p className="text-sm text-slate-500">
                Joined {new Date(profileData.joined_date).toLocaleDateString()}
              </p>
            </div>
          </div>
          <Button variant="primary">Edit Profile</Button>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {statsData.map((stat: any) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            trend={stat.trend}
          />
        ))}
      </div>

      {/* Reputation Section */}
      <Card>
        <h2 className="text-2xl font-bold text-white mb-6">Reputation Progress</h2>
        <div className="space-y-4">
          <div>
            <ProgressBar
              value={progressData.progress}
              max={100}
              label={`Level ${Math.floor(progressData.progress / (100 / 10))} → Level ${Math.floor(progressData.progress / (100 / 10)) + 1}`}
            />
            <p className="text-sm text-slate-400 mt-2">
              {progressData.next - progressData.current} points needed to reach next level
            </p>
          </div>

          {/* Unlocked Features */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-white mb-3">Unlocked Features</h3>
            <div className="flex flex-wrap gap-2">
              {ReputationEngine.getUnlockedFeatures(profileData.reputation || 0).map((feature: string) => (
                <Badge key={feature} label={feature.replace(/_/g, ' ')} variant="success" />
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Activity Summary */}
      <Card>
        <h2 className="text-2xl font-bold text-white mb-6">Activity Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-3 bg-slate-900 rounded-lg">
            <p className="text-slate-400 text-sm">Governance Votes</p>
            <p className="text-2xl font-bold text-white">{profileData.governance_votes}</p>
          </div>
          <div className="p-3 bg-slate-900 rounded-lg">
            <p className="text-slate-400 text-sm">Proposals Created</p>
            <p className="text-2xl font-bold text-white">{profileData.proposals_created}</p>
          </div>
          <div className="p-3 bg-slate-900 rounded-lg">
            <p className="text-slate-400 text-sm">Missions Completed</p>
            <p className="text-2xl font-bold text-white">{profileData.missions_completed}</p>
          </div>
        </div>
      </Card>

      {/* Account Settings */}
      <Card>
        <h2 className="text-2xl font-bold text-white mb-6">Account Settings</h2>
        <div className="space-y-3">
          <Button variant="secondary" className="w-full text-left">
            Change Password
          </Button>
          <Button variant="secondary" className="w-full text-left">
            Two-Factor Authentication
          </Button>
          <Button variant="secondary" className="w-full text-left">
            Download Data
          </Button>
          <Button variant="danger" className="w-full text-left">
            Delete Account
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default ProfilePage
