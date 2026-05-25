import { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Logo from '../components/layout/Logo'

function isEmailNotConfirmed(err) {
  const msg = err?.message?.toLowerCase() ?? ''
  return msg.includes('email not confirmed') || msg.includes('not confirmed')
}

export default function Login() {
  const { signIn, signUp, session, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(Boolean(location.state?.register))
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!authLoading && session) {
      navigate('/dashboard', { replace: true })
    }
  }, [authLoading, session, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (isRegister) {
      const { data, error: err } = await signUp(email.trim(), password)
      if (err) {
        setError(err.message)
      } else if (data?.user && !data?.session) {
        navigate('/verify-email', { state: { email: email.trim() } })
      } else {
        navigate('/dashboard')
      }
    } else {
      const { error: err } = await signIn(email.trim(), password)
      if (err) {
        if (isEmailNotConfirmed(err)) {
          setError('Please confirm your email first. Check your inbox or resend the link below.')
        } else {
          setError(err.message)
        }
      } else {
        navigate('/dashboard')
      }
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="dashboard-card w-full max-w-md">
        <div className="flex justify-center mb-4">
          <Logo to="/" link={false} className="h-9 w-auto max-w-[180px]" />
        </div>
        <p className="text-gray-500 text-sm mb-6">
          {isRegister ? 'Create your account' : 'Sign in to your account'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            className="form-input w-full"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className="form-input w-full"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" className="primary-btn w-full" disabled={loading}>
            {loading ? 'Please wait...' : isRegister ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        {!isRegister && (
          <p className="text-center mt-3">
            <Link to="/forgot-password" className="text-primary-400 text-sm hover:underline">
              Forgot password?
            </Link>
          </p>
        )}

        {error && isRegister === false && error.includes('confirm') && (
          <p className="text-center mt-2">
            <Link
              to="/verify-email"
              state={{ email: email.trim() }}
              className="text-primary-400 text-sm hover:underline"
            >
              Resend confirmation email
            </Link>
          </p>
        )}

        <p className="text-gray-500 text-sm text-center mt-4">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            className="text-primary-400 hover:underline"
            onClick={() => {
              setIsRegister((r) => !r)
              setError(null)
            }}
          >
            {isRegister ? 'Sign In' : 'Sign Up'}
          </button>
        </p>

        <Link to="/" className="block text-center text-gray-500 text-sm mt-4 hover:text-white">
          Back to home
        </Link>
      </div>
    </div>
  )
}
