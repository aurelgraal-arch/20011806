import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const isAuth = localStorage.getItem('auth')
  const location = useLocation()

  if (!isAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  return <>{children}</>
}
