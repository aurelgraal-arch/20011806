/**
 * Application Router Configuration
 * Central routing setup with lazy loading and route protection
 */

import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { MainLayout } from './components/layout/MainLayout'
import { ProtectedRoute } from './components/common/ProtectedRoute'
import { RoleProtectedRoute } from './components/common/RoleProtectedRoute'
import { UserRole } from './types'

// Lazy load pages
const LoginPage = lazy(() =>
  import('./pages/auth/LoginPage').then((m) => ({ default: m.LoginPage }))
)
const RegisterPage = lazy(() =>
  import('./pages/auth/RegisterPage').then(
    (m) => ({ default: m.RegisterPage })
  )
)
const DashboardPage = lazy(() =>
  import('./pages/dashboard/DashboardPage').then(
    (m) => ({ default: m.DashboardPage })
  )
)

// Placeholder components for future pages
const MissionsPage = lazy(() =>
  import('./pages/missions/MissionsPage').then((m) => ({ default: m.MissionsPage }))
)

const GovernancePage = lazy(() =>
  import('./pages/governance/GovernancePage').then((m) => ({ default: m.GovernancePage }))
)

const LeaderboardPage = lazy(() =>
  Promise.resolve({
    default: () => (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold text-white mb-2">Leaderboard</h1>
        <p className="text-slate-400">Coming soon...</p>
      </div>
    ),
  })
)

const ProfilePage = lazy(() =>
  import('./pages/profile/ProfilePage').then((m) => ({ default: m.ProfilePage }))
)

const WalletPage = lazy(() =>
  import('./pages/wallet/WalletPage').then((m) => ({ default: m.WalletPage }))
)

const AdminPage = lazy(() =>
  import('./pages/admin/AdminPage').then((m) => ({ default: m.AdminPage }))
)

// Suspense fallback
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <p className="text-slate-400">Loading...</p>
    </div>
  </div>
)

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/auth">
          <Route
            path="login"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <LoginPage />
              </Suspense>
            }
          />
          <Route
            path="register"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <RegisterPage />
              </Suspense>
            }
          />
        </Route>

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route
            index
            element={<Navigate to="/dashboard" replace />}
          />

          <Route
            path="dashboard"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <DashboardPage />
              </Suspense>
            }
          />

          <Route
            path="profile"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <ProfilePage />
              </Suspense>
            }
          />

          <Route
            path="missions"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <MissionsPage />
              </Suspense>
            }
          />

          <Route
            path="governance"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <GovernancePage />
              </Suspense>
            }
          />

          <Route
            path="leaderboard"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <LeaderboardPage />
              </Suspense>
            }
          />

          <Route
            path="wallet"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <WalletPage />
              </Suspense>
            }
          />

          {/* Admin Routes */}
          <Route
            path="admin"
            element={
              <RoleProtectedRoute requiredRoles={[UserRole.ADMIN]}>
                <Suspense fallback={<LoadingFallback />}>
                  <AdminPage />
                </Suspense>
              </RoleProtectedRoute>
            }
          />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter
