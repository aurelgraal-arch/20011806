import { supabase } from '../../../lib/supabaseClient'
import type { Wallet, Transaction } from '../../types'

class WalletService {
  async getWallet(userId: string): Promise<Wallet> {
    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .single()
    if (error) throw error
    return data
  }

  async getTransactions(walletId: string, limit = 50): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('wallet_id', walletId)
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) throw error
    return data || []
  }

  async addTransaction(transaction: Omit<Transaction, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('transactions')
      .insert([transaction])
      .select()
    if (error) throw error
    return data?.[0]
  }

  async updateBalance(walletId: string, amount: number) {
    const { data: existing, error: e1 } = await supabase
      .from('wallets')
      .select('token_balance')
      .eq('id', walletId)
      .single()
    if (e1) throw e1
    const newBal = (existing.token_balance || 0) + amount
    const { data, error } = await supabase
      .from('wallets')
      .update({ token_balance: newBal })
      .eq('id', walletId)
      .single()
    if (error) throw error
    return data
  }
}

export const walletService = new WalletService()
