import React, { useEffect } from 'react'
import { useAuthStore } from '../../core/store/authStore'
import { governanceService } from '../../core/services/governanceService'
import { Card, Button, Badge, Skeleton } from '../../components/ui'
import { useToast } from '../../hooks/useToast'
import { useQuery, useQueryClient } from '@tanstack/react-query'

export const GovernancePage: React.FC = () => {
  const { user } = useAuthStore()
  const { addToast } = useToast()
  const queryClient = useQueryClient()

  const { data: proposals, isLoading, error } = useQuery<any[]>({
    queryKey: ['proposals'],
    queryFn: () => governanceService.getProposals(),
    staleTime: 1000 * 30,
  })

  useEffect(() => {
    const unsub = governanceService.subscribeProposals((_p) => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] })
    })
    return () => unsub && unsub()
  }, [queryClient])

  const handleVote = async (proposalId: string, vote: string) => {
    if (!user) return
    try {
      await governanceService.vote(proposalId, user.id, vote, 1)
      queryClient.invalidateQueries({ queryKey: ['proposals'] })
      addToast('Vote recorded', 'success')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Vote failed'
      addToast(msg, 'error')
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <h1 className="text-3xl font-bold text-white mb-4">Governance</h1>
      {isLoading && <Skeleton variant="card" count={2} />}
      {error && (
        <p className="text-red-400">Unable to load proposals.</p>
      )}
      <div className="space-y-4">
        {((proposals as any[]) || []).map((p: any) => (
          <Card key={p.id} className="p-4">
            <h2 className="text-lg font-semibold text-white mb-2">{p.title}</h2>
            <p className="text-sm text-slate-400 mb-4">{p.description}</p>
            <div className="flex gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleVote(p.id, 'yes')}
              >
                Vote Yes
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleVote(p.id, 'no')}
              >
                Vote No
              </Button>
              <Badge label={p.status || 'open'} variant="info" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default GovernancePage
