/**
 * Dashboard Page
 * Main dashboard showing user stats, missions, and activity
 */

import React, { useMemo, useEffect } from 'react'
import { Card, StatCard, ProgressBar, Badge, Tabs, Skeleton } from '../../components/ui'
import { ActivityFeedComponent } from './ActivityFeed'
import { useAuthStore } from '../../core/store/authStore'
import { ReputationEngine } from '../../core/engines/reputationEngine'
import { RankingEngine } from '../../core/engines/rankingEngine'
import { userService } from '../../core/services/userService'
import { walletService } from '../../core/services/walletService'
import { missionService } from '../../core/services/missionService'
import { activityService } from '../../core/services/activityService'
import { governanceService } from '../../core/services/governanceService'
import { useQuery, useQueryClient } from '@tanstack/react-query'

// no longer using mock data

export const DashboardPage: React.FC = () => {
  const { user, refreshSession } = useAuthStore()
  const queryClient = useQueryClient()

  // queries for core data
  const profileQuery = useQuery<any>({
    queryKey: ['profile', user?.id],
    queryFn: () => userService.getProfile(user!.id),
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  })
  const walletQuery = useQuery<any>({
    queryKey: ['wallet', user?.id],
    queryFn: () => walletService.getWallet(user!.id),
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  })
  const statsQuery = useQuery<any>({
    queryKey: ['stats', user?.id],
    queryFn: () => userService.getUserStats(user!.id),
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  })
  const activitiesQuery = useQuery<any[]>({
    queryKey: ['activities'],
    queryFn: () => activityService.getActivities(20),
    staleTime: 1000 * 30,
  })
  const missionsQuery = useQuery<any[]>({
    queryKey: ['missions'],
    queryFn: () => missionService.getMissions(),
    staleTime: 1000 * 30,
  })
  const proposalsQuery = useQuery<any[]>({
    queryKey: ['proposals'],
    queryFn: () => governanceService.getProposals(),
    staleTime: 1000 * 30,
  })
  const leaderboardQuery = useQuery<any[]>({
    queryKey: ['leaderboard'],
    queryFn: () => userService.getLeaderboard(1000),
    staleTime: 1000 * 60 * 5,
  })

  const isLoading =
    profileQuery.isLoading ||
    walletQuery.isLoading ||
    statsQuery.isLoading ||
    activitiesQuery.isLoading ||
    missionsQuery.isLoading ||
    proposalsQuery.isLoading ||
    leaderboardQuery.isLoading
  const error =
    profileQuery.error ||
    walletQuery.error ||
    statsQuery.error ||
    activitiesQuery.error ||
    missionsQuery.error ||
    proposalsQuery.error ||
    leaderboardQuery.error

  // derived data
  const stats = statsQuery.data as any
  const totalReputation = useMemo(() => {
    if (!stats) return 0
    return ReputationEngine.calculateTotalReputation(stats)
  }, [stats])

  const userLevel = useMemo(
    () => ReputationEngine.getUserLevel(totalReputation),
    [totalReputation]
  )
  const progressToNext = useMemo(
    () => ReputationEngine.getProgressToNextLevel(totalReputation),
    [totalReputation]
  )

  const rankingScore = useMemo(() => {
    if (!stats) return { reputation_score:0, mission_score:0, governance_score:0, total_weighted_score:0 }
    return RankingEngine.calculateRankingScore({
      reputation: totalReputation,
      missions_completed: stats.missions_completed,
      governance_votes: stats.governance_votes,
      proposals_created: stats.proposals_created,
    })
  }, [stats, totalReputation])

  // compute ranking position
  const rankingPosition = useMemo(() => {
    if (!leaderboardQuery.data || !user) return null
    const idx = leaderboardQuery.data.findIndex((p: any) => p.id === user.id)
    return idx >= 0 ? idx + 1 : null
  }, [leaderboardQuery.data, user])

  useEffect(() => {
    let activityUnsub: (() => void) | undefined
    let missionUnsub: (() => void) | undefined
    let proposalUnsub: (() => void) | undefined
    if (!user) return

    // refresh session in case token expired
    refreshSession()

    // realtime subscriptions invalidate queries when items change
    activityUnsub = activityService.subscribe((item) => {
      queryClient.setQueryData(['activities'], (old: any[] = []) => [item, ...old])
    })
    missionUnsub = missionService.subscribe((_m) => {
      queryClient.invalidateQueries({ queryKey: ['missions'] })
    })
    proposalUnsub = governanceService.subscribeProposals(() => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] })
    })

    return () => {
      if (activityUnsub) activityUnsub()
      if (missionUnsub) missionUnsub()
      if (proposalUnsub) proposalUnsub()
    }
  }, [user, refreshSession, queryClient])

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-3">
          <p className="text-red-200 text-sm">{(error as Error).message}</p>
        </div>
      )}
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back, {user?.username}! 👋
        </h1>
        <p className="text-slate-400">
          Here's your platform overview and latest activity
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Reputation"
          value={isLoading ? 0 : totalReputation}
          icon="⭐"
          trend="up"
          trendValue={isLoading ? '...' : `${stats?.missions_completed || 0} missions`}
        />
        <StatCard
          label="Level"
          value={isLoading ? 0 : userLevel}
          icon="📊"
          trend="up"
          trendValue={isLoading ? '...' : `Next: Level ${progressToNext.next_level}`}
        />
        <StatCard
          label="Tokens"
          value={isLoading ? 0 : (walletQuery.data as any)?.token_balance || 0}
          icon="💰"
          trend="up"
          trendValue={isLoading ? '...' : `Balance`}
        />
        <StatCard
          label="Rank"
          value={isLoading ? '#' : rankingPosition ? `#${rankingPosition}` : 'N/A'}
          icon="🏆"
          trend="up"
          trendValue={isLoading ? '...' : 'Updated'}
        />
      </div>

      {/* Reputation and Level Progress */}
      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">
              Level Progress
            </h3>
            <ProgressBar
              progress={progressToNext.progress_percentage}
              label={`Level ${progressToNext.current_level} → Level ${progressToNext.next_level}`}
              color="purple"
            />
            <p className="text-sm text-slate-400 mt-2">
              {progressToNext.next_level_required - progressToNext.current_rep} reputation points to next level
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-4">
              Active Features
            </h3>
            <div className="flex flex-wrap gap-2">
              {ReputationEngine.getUnlockedFeatures(totalReputation).map(
                (feature) => (
                  <Badge
                    key={feature}
                    label={feature.replace(/_/g, ' ')}
                    variant="success"
                  />
                )
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Activity Tabs */}
      <Card className="p-6">
        <Tabs
          tabs={[
            {
              id: 'missions',
              label: 'Recent Missions',
              content: isLoading ? (
                <Skeleton variant="card" count={2} />
              ) : (
                <div className="space-y-3">
                  {((missionsQuery.data as any[]) || []).map((m) => (
                    <div key={m.id} className="flex justify-between items-start p-3 bg-slate-800 rounded-lg">
                      <div>
                        <p className="font-medium text-white">{m.title || m.name || 'Unnamed mission'}</p>
                        <p className="text-sm text-slate-400">{m.updated_at ? new Date(m.updated_at).toLocaleString() : ''}</p>
                      </div>
                      <Badge label={`+${m.reputation_reward || 0} REP`} variant="success" />
                    </div>
                  ))}
                </div>
              ),
            },
            {
              id: 'governance',
              label: 'Governance',
              content: isLoading ? (
                <Skeleton variant="text" count={1} />
              ) : (
                <div className="space-y-3">
                  {((leaderboardQuery.data as any[]) || []).length === 0 && (
                    <p className="text-slate-400">No recent governance activity.</p>
                  )}
                  {((proposalsQuery?.data as any[]) || []).map((p: any) => (
                    <div key={p.id} className="p-3 bg-slate-800 rounded-lg">
                      <p className="font-medium text-white">{p.title}</p>
                      <p className="text-sm text-slate-400">{p.status || 'open'}</p>
                    </div>
                  ))}
                </div>
              ),
            },
            {
              id: 'feed',
              label: 'Activity Feed',
              content: activitiesQuery.isLoading ? (
                <Skeleton variant="card" count={2} />
              ) : (
                <ActivityFeedComponent
                  activities={(activitiesQuery.data as any[]) || []}
                  isLoading={activitiesQuery.isLoading}
                />
              ),
            },
            {
              id: 'wallet',
              label: 'Wallet Activity',
              content: walletQuery.isLoading ? (
                <Skeleton variant="card" count={2} />
              ) : walletQuery.error ? (
                <p className="text-red-400">Failed to load wallet</p>
              ) : (
                <div className="space-y-3">
                  {(walletQuery.data as any)?.token_balance != null && (
                    <div className="p-3 bg-slate-800 rounded-lg">
                      <p className="text-sm text-slate-400">Balance</p>
                      <p className="text-2xl font-bold text-white">
                        {(walletQuery.data as any).token_balance}
                      </p>
                    </div>
                  )}
                  {(walletQuery.data as any)?.id && (
                    <div className="space-y-2">
                      <h4 className="text-lg font-semibold text-white">Recent Transactions</h4>
                      {(walletQuery.data?.id &&
                        // reuse getTransactions from service
                        true) ? (
                        <WalletTransactions walletId={(walletQuery.data as any).id} />
                      ) : null}
                    </div>
                  )}
                </div>
              ),
            },
          ]}
          defaultTab="missions"
          variant="underline"
        />
      </Card>

      {/* Ranking Info */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Your Ranking</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-slate-800 rounded-lg">
              <p className="text-2xl font-bold text-blue-400">
                {rankingScore.reputation_score}
              </p>
              <p className="text-xs text-slate-400 mt-1">Reputation Score</p>
            </div>
            <div className="p-4 bg-slate-800 rounded-lg">
              <p className="text-2xl font-bold text-green-400">
                {rankingScore.mission_score}
              </p>
              <p className="text-xs text-slate-400 mt-1">Mission Score</p>
            </div>
            <div className="p-4 bg-slate-800 rounded-lg">
              <p className="text-2xl font-bold text-purple-400">
                {rankingScore.governance_score}
              </p>
              <p className="text-xs text-slate-400 mt-1">Governance Score</p>
            </div>
          </div>
          <div className="p-4 bg-blue-900/20 border border-blue-800 rounded-lg">
            <p className="text-blue-200 font-semibold">
              Total Weighted Score: {rankingScore.total_weighted_score}
            </p>
            <p className="text-xs text-blue-300 mt-1">
              Based on: Reputation (50%) + Missions (30%) + Governance (20%)
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}

// small component to render wallet transactions with caching
const WalletTransactions: React.FC<{ walletId: string }> = React.memo(({ walletId }) => {
  const { data, isLoading, error } = useQuery<any[]>({
    queryKey: ['transactions', walletId],
    queryFn: () => walletService.getTransactions(walletId, 20),
    enabled: !!walletId,
    staleTime: 1000 * 30,
  })

  if (isLoading) return <Skeleton variant="text" count={3} />
  if (error) return <p className="text-red-400">Failed to load transactions</p>

  return (
    <div className="space-y-2">
      {data && data.length > 0 ? (
        data.map((tx) => (
          <div key={tx.id} className="p-2 bg-slate-800 rounded-lg flex justify-between">
            <span className="text-sm text-slate-300">{tx.description || tx.type}</span>
            <span className="text-sm font-semibold text-white">
              {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
            </span>
          </div>
        ))
      ) : (
        <p className="text-slate-400 text-sm">No recent transactions</p>
      )}
    </div>
  )
})

export default DashboardPage
