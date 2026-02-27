import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Login } from './pages/Login'
import { Totalita } from './pages/Totalita'
import { Forum } from './pages/Forum'
import { Viaggio } from './pages/Viaggio'
import { Premi } from './pages/Premi'
import { Profile } from './pages/Profile'
import { Wallet } from './pages/Wallet'
import { Users } from './pages/Users'
import { Search } from './pages/Search'
import { Balance } from './pages/Balance'
import { ProtectedRoute } from './components/common/ProtectedRoute'
import { MainLayout } from './components/layout/MainLayout'

export const AppRouter: React.FC = () => (
    <Routes>
      <Route path="/login" element={<Login />} />
      {/* catch-all protected routes */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Routes>
                <Route path="dashboard" element={<Navigate to="/totalita" replace />} />
                <Route path="totalita" element={<Totalita />} />
                <Route path="forum" element={<Forum />} />
                <Route path="viaggio" element={<Viaggio />} />
                <Route path="premi" element={<Premi />} />
                <Route path="profile" element={<Profile />} />
                <Route path="wallet" element={<Wallet />} />
                <Route path="users" element={<Users />} />
                <Route path="search" element={<Search />} />
                <Route path="balance" element={<Balance />} />
                <Route path="*" element={<Navigate to="/totalita" replace />} />
              </Routes>
            </MainLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
)

export default AppRouter
