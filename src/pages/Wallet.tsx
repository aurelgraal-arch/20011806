import React, { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { ensureBaseNetwork } from '../lib/wallet'

export const Wallet: React.FC = () => {
  const user = useAuthStore((s) => s.user)
  const [connected, setConnected] = useState(false)
  const [address, setAddress] = useState('')

  const connect = async () => {
    try {
      await ensureBaseNetwork()
      const accounts = await (window as any).ethereum.request({
        method: 'eth_requestAccounts',
      })
      setAddress(accounts[0])
      setConnected(true)
    } catch (e) {
      console.error(e)
    }
  }

  // check network on mount
  React.useEffect(() => {
    ensureBaseNetwork().catch(() => {
      // banner could show, not implemented
    })
  }, [])

  return (
    <div className="pt-20 pl-64 pr-64 pb-4">
      <h1 className="text-accent2 text-2xl mb-4">Wallet</h1>
      <div className="bg-card border border-accent2 p-4 rounded-lg">
        <p className="text-accent2">User: {user?.sequence_id}</p>
        {connected ? (
          <p className="text-accent2">Address: {address}</p>
        ) : (
          <button
            onClick={connect}
            className="bg-accent text-black px-4 py-2 rounded hover:bg-accent/90"
          >
            Connetti MetaMask
          </button>
        )}
      </div>
    </div>
  )
}
