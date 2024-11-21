import { Navigate } from '@remix-run/react'
import { useAuthStore } from '~/stores/auth.store'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin } = useAuthStore(state => ({
    isAuthenticated: state.isAuthenticated(),
    isAdmin: state.isAdmin(),
  }))

  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" />
  }

  return <>{children}</>
}
