/**
 * Sidebar Component
 * Main navigation sidebar
 */

import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAuthStore } from '../../core/store/authStore'
import { UserRole } from '../../types'

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onClose }) => {
  const { user } = useAuthStore()
  const isAdmin = user?.role === UserRole.ADMIN
  const isModerator = user?.role === UserRole.MODERATOR

  const baseClasses =
    'block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200'
  const activeClasses = 'bg-blue-600 text-white'
  const inactiveClasses = 'text-slate-400 hover:text-white hover:bg-slate-800'

  return (
    <div className={`${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:relative left-0 top-0 h-screen w-64 bg-slate-900 border-r border-slate-800 transition-transform duration-300 z-40 lg:z-0 overflow-y-auto`}>
      <div className="p-6">
        <h2 className="text-lg font-bold text-white mb-8">Navigation</h2>

        <nav className="space-y-2">
          <NavLink
            to="/dashboard"
            end
            onClick={onClose}
            className={({ isActive }) =>
              `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`
            }
          >
            📊 Dashboard
          </NavLink>

          <NavLink
            to="/profile"
            onClick={onClose}
            className={({ isActive }) =>
              `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`
            }
          >
            👤 Profile
          </NavLink>

          <NavLink
            to="/missions"
            onClick={onClose}
            className={({ isActive }) =>
              `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`
            }
          >
            ✅ Missions
          </NavLink>

          <NavLink
            to="/governance"
            onClick={onClose}
            className={({ isActive }) =>
              `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`
            }
          >
            🗳️ Governance
          </NavLink>

          <NavLink
            to="/leaderboard"
            onClick={onClose}
            className={({ isActive }) =>
              `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`
            }
          >
            🏆 Leaderboard
          </NavLink>

          <NavLink
            to="/wallet"
            onClick={onClose}
            className={({ isActive }) =>
              `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`
            }
          >
            💰 Wallet
          </NavLink>

          {(isAdmin || isModerator) && (
            <>
              <div className="border-t border-slate-700 my-4 pt-4">
                <p className="text-xs font-semibold text-slate-500 uppercase px-2 mb-3">
                  Moderation
                </p>

                {isAdmin && (
                  <NavLink
                    to="/admin"
                    onClick={onClose}
                    className={({ isActive }) =>
                      `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`
                    }
                  >
                    ⚙️ Admin Panel
                  </NavLink>
                )}

                <NavLink
                  to="/moderation"
                  onClick={onClose}
                  className={({ isActive }) =>
                    `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`
                  }
                >
                  🛡️ Moderation
                </NavLink>
              </div>
            </>
          )}
        </nav>
      </div>
    </div>
  )
}

export default Sidebar
