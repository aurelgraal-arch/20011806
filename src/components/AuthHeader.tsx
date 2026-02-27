import React from 'react'
import { useNavigate } from 'react-router-dom'

export const AuthHeader: React.FC = () => {
  const navigate = useNavigate()
  const sequence = localStorage.getItem('sequence_id')

  const handleLogout = () => {
    localStorage.removeItem('auth')
    localStorage.removeItem('sequence_id')
    navigate('/login', { replace: true })
  }


  if (!sequence) return null

  return (
    <div className="fixed top-0 right-0 p-4 z-50">
      <div className="flex items-center gap-4 bg-black/60 border border-accent2 rounded px-4 py-2">
        <span className="text-accent2 text-sm">{sequence.substring(0, 8)}...</span>
        <button
          onClick={handleLogout}
          className="px-3 py-1 bg-accent text-black font-bold rounded text-sm hover:bg-accent/90 transition"
        >
          Logout
        </button>
      </div>
    </div>
  )
}
