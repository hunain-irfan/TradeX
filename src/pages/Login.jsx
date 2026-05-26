import { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { getAppHomePath } from '../lib/authPaths'
import AuthCard from '../components/layout/AuthCard'
import AuthField from '../components/layout/AuthField'

function isEmailNotConfirmed(err) {
  const msg = err?.message?.toLowerCase() ?? ''
  return msg.includes('email not confirmed') || msg.includes('not confirmed')
}

export default function Login() {
  const { signIn, signUp, session, loading: authLoading, isAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isRegister, setIsRegister] = useState(Boolean(location.state?.register))
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!authLoading && session) {
      navigate(getAppHomePath(isAdmin), { replace: true })
    }
  }, [authLoading, session, isAdmin, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (isRegister) {
      const name = displayName.trim()
      if (name.length < 2) {
        setError('Please enter your name (at least 2 characters).')
        setLoading(false)
        return
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.')
        setLoading(false)
        return
      }
      const { data, error: err } = await signUp(email.trim(), password, name)
      if (err) {
        setError(err.message)
      } else if (data?.user && !data?.session) {
        navigate('/verify-email', { state: { email: email.trim() } })
      } else {
        navigate(getAppHomePath(false))
      }
    } else {
      const { data, error: err } = await signIn(email.trim(), password)
      if (err) {
        if (isEmailNotConfirmed(err)) {
          setError('Confirm your email first — check your inbox, or resend below.')
        } else {
          setError(err.message)
        }
      } else {
        const admin = data?.user?.user_metadata?.role === 'admin'
        navigate(getAppHomePath(admin))
      }
    }

    setLoading(false)
  }

  return (
    <AuthCard
      backTo="/"
      title={isRegister ? 'Create your account' : 'Welcome back!'}
      subtitle={
        isRegister
          ? 'Create your account and start paper trading with live prices in minutes.'
          : 'Sign in to access your portfolio, watchlist, and live market data.'
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {isRegister && (
          <AuthField
            label="Name"
            type="text"
            placeholder="Enter your name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            minLength={2}
            maxLength={40}
            autoComplete="name"
          />
        )}
        <AuthField
          label="Email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <AuthField
          label="Password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          autoComplete={isRegister ? 'new-password' : 'current-password'}
        />
        {isRegister && (
          <AuthField
            label="Confirm password"
            type="password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
          />
        )}
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" className="primary-btn w-full mt-2" disabled={loading}>
          {loading ? 'Please wait...' : isRegister ? 'Create account' : 'Sign in'}
        </button>
      </form>

      {!isRegister && (
        <p className="mt-4 text-right">
          <Link to="/forgot-password" className="text-primary-400 text-sm font-medium hover:underline">
            Forgot password?
          </Link>
        </p>
      )}

      {error && !isRegister && error.includes('inbox') && (
        <p className="mt-2 text-left">
          <Link
            to="/verify-email"
            state={{ email: email.trim() }}
            className="text-primary-400 text-sm hover:underline"
          >
            Resend confirmation email
          </Link>
        </p>
      )}

      <p className="text-gray-500 text-sm mt-6 text-center">
        {isRegister ? (
          <>
            Already have an account?{' '}
            <button
              type="button"
              className="text-primary-400 font-medium hover:underline"
              onClick={() => {
                setIsRegister(false)
                setError(null)
                setConfirmPassword('')
              }}
            >
              Sign in
            </button>
          </>
        ) : (
          <>
            Don&apos;t have an account?{' '}
            <button
              type="button"
              className="text-primary-400 font-medium hover:underline"
              onClick={() => {
                setIsRegister(true)
                setError(null)
                setConfirmPassword('')
              }}
            >
              Sign up
            </button>
          </>
        )}
      </p>
    </AuthCard>
  )
}
