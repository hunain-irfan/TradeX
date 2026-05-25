import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Logo from '../components/layout/Logo'

export default function NotFound() {
  const { user, loading, isAdmin } = useAuth()

  const homeTo = user ? (isAdmin ? '/admin' : '/dashboard') : '/'
  const homeLabel = user ? 'Go to dashboard' : 'Back to home'

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-gray-900 px-4">
      <Logo to="/" link={false} className="h-7 w-auto max-w-[120px]" />
      <p className="text-[#666666] text-[11px] font-semibold uppercase tracking-wider font-mono">
        Error
      </p>
      <h1 className="text-7xl md:text-8xl font-bold text-white font-mono tracking-tight">404</h1>
      <p className="text-gray-500 text-center max-w-md">
        This page does not exist or may have been moved.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs sm:max-w-none sm:w-auto">
        <Link to={homeTo} className="primary-btn min-w-[160px]">
          {homeLabel}
        </Link>
        {!loading && !user && (
          <Link to="/login" className="secondary-btn min-w-[160px]">
            Sign in
          </Link>
        )}
      </div>

      <Link to="/" className="text-gray-500 text-sm hover:text-white transition-colors">
        TradeX home
      </Link>
    </div>
  )
}
