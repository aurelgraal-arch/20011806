import React from 'react'
import { useAuthStore } from '../../core/store/authStore'
import { walletService } from '../../core/services/walletService'
import { Card, Skeleton } from '../../components/ui'
import { useQuery } from '@tanstack/react-query'

export const WalletPage: React.FC = () => {
  const { user } = useAuthStore()

  const walletQuery = useQuery<any>({
    queryKey: ['wallet', user?.id],
    queryFn: () => walletService.getWallet(user!.id),
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  })

  const txQuery = useQuery<any[]>({
    queryKey: ['transactions', walletQuery.data?.id],
    queryFn: () => walletService.getTransactions(walletQuery.data!.id, 50),
    enabled: !!walletQuery.data?.id,
  })

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <h1 className="text-3xl font-bold text-white mb-4">Wallet</h1>
      {walletQuery.isLoading && <Skeleton variant="card" count={1} />}
      {walletQuery.error && (
        <p className="text-red-400">Failed to load wallet</p>
      )}
      {walletQuery.data && (
        <Card className="p-4">
          <p className="text-white">Balance: {walletQuery.data.token_balance}</p>
          <p className="text-slate-400">Total earned: {walletQuery.data.total_earned}</p>
        </Card>
      )}
      {txQuery.isLoading && <Skeleton variant="card" count={2} />}
      {txQuery.data && (
        <div className="space-y-2">
          {txQuery.data.map((tx) => (
            <Card key={tx.id} className="p-2 flex justify-between">
              <span className="text-sm text-slate-300">{tx.description || tx.type}</span>
              <span className="text-sm font-semibold text-white">
                {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
              </span>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default WalletPage
