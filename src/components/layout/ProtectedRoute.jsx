import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import LoadingSpinner from '../ui/LoadingSpinner'
import BannedScreen from './BannedScreen'

export default function ProtectedRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (user.user_metadata?.is_banned === true) {
    return <BannedScreen />
  }

  return <Outlet />
}
