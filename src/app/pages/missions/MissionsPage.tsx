import React, { useEffect } from 'react'
import { useAuthStore } from '../../core/store/authStore'
import { missionService } from '../../core/services/missionService'
import { Button, Card, Badge, Skeleton } from '../../components/ui'
import { useToast } from '../../hooks/useToast'
import { useQuery, useQueryClient } from '@tanstack/react-query'

export const MissionsPage: React.FC = () => {
  const { user } = useAuthStore()
  const { addToast } = useToast()
  const queryClient = useQueryClient()

  const { data: missions, isLoading, error } = useQuery<any[]>({
    queryKey: ['missions'],
    queryFn: () => missionService.getMissions(),
    staleTime: 1000 * 30,
  })

  const { data: progress } = useQuery<any[]>({
    queryKey: ['missionProgress', user?.id],
    queryFn: () => missionService.getUserProgress(user!.id),
    enabled: !!user,
  })

  useEffect(() => {
    const unsub = missionService.subscribe((_m) => {
      queryClient.invalidateQueries({ queryKey: ['missions'] })
    })
    return () => unsub && unsub()
  }, [queryClient])

  const handleComplete = async (missionId: string) => {
    if (!user) return
    try {
      await missionService.completeMission(user.id, missionId, {
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      queryClient.invalidateQueries({ queryKey: ['missionProgress'] })
      queryClient.invalidateQueries({ queryKey: ['missions'] })
      addToast('Mission marked complete', 'success')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Action failed'
      addToast(msg, 'error')
    }
  }

  const isCompleted = (missionId: string) => {
    return progress?.some((p: any) => p.mission_id === missionId && p.status === 'completed')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <h1 className="text-3xl font-bold text-white mb-4">Missions</h1>
      {isLoading && <Skeleton variant="card" count={3} />}
      {error && (
        <p className="text-red-400">Unable to load missions.</p>
      )}
      <div className="space-y-4">
        {(missions || []).map((m: any) => (
          <Card key={m.id} className="p-4 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-white">{m.title || m.name}</h2>
              <p className="text-sm text-slate-400">{m.description}</p>
            </div>
            <div className="flex items-center gap-2">
              {isCompleted(m.id) ? (
                <Badge label="Completed" variant="success" />
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleComplete(m.id)}
                >
                  Complete
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default MissionsPage
