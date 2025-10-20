import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './auth'

const RequireAuth: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { session, loading } = useAuth()
  const location = useLocation()

  if (loading) return <div /> // or a spinner

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

export default RequireAuth
