import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

/** Blocks admins from user trading pages — management only on /admin/* */
export default function UserRoute() {
  const { isAdmin } = useAuth()

  if (isAdmin) {
    return <Navigate to="/admin" replace />
  }

  return <Outlet />
}
