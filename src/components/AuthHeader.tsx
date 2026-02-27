import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export const AuthHeader: React.FC = () => {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  // always render a header; if no user show a minimal placeholder or login link
  return (
    <div className="fixed top-0 right-0 p-4 z-50">
      <div className="flex items-center gap-4 bg-black/60 border border-accent2 rounded px-4 py-2">
        {user ? (
          <>
            <span className="text-accent2 text-sm">{user.sequence_id?.substring(0, 8)}...</span>
            <button
              onClick={handleLogout}
              className="px-3 py-1 bg-accent text-black font-bold rounded text-sm hover:bg-accent/90 transition"
            >
              Logout
            </button>
          </>
        ) : (
          <span className="text-accent2 text-sm">Ospite</span>
        )}
      </div>
    </div>
  )
}
