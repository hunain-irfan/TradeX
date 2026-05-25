import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import Logo from '../components/layout/Logo'

export default function ResetPassword() {
  const { updatePassword, session, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (session) {
      setReady(true)
      return
    }

    const hash = window.location.hash
    if (hash.includes('type=recovery') || hash.includes('access_token')) {
      supabase.auth.getSession().then(({ data: { session: s } }) => {
        setReady(Boolean(s))
      })
    } else {
      setReady(false)
    }
  }, [authLoading, session])

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, s) => {
      if (event === 'PASSWORD_RECOVERY' || s) setReady(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    const { error: err } = await updatePassword(password)
    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    window.history.replaceState(null, '', '/reset-password')
    navigate('/dashboard', { replace: true })
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <p className="text-gray-500 text-sm font-mono">Loading...</p>
      </div>
    )
  }

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
        <div className="dashboard-card w-full max-w-md text-center">
          <h1 className="text-xl font-bold text-white mb-2">Link expired or invalid</h1>
          <p className="text-gray-500 text-sm mb-6">
            Request a new password reset email and open the link from your inbox.
          </p>
          <Link to="/forgot-password" className="primary-btn inline-flex">
            Request new link
          </Link>
          <Link to="/login" className="block text-gray-500 text-sm mt-4 hover:text-white">
            Back to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="dashboard-card w-full max-w-md">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 font-mono mb-2">
          Account
        </p>
        <div className="flex justify-center mb-4">
          <Logo to="/" link={false} className="h-9 w-auto max-w-[180px]" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">Set new password</h1>
        <p className="text-gray-500 text-sm mb-6">Choose a password for your TradeX account.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            className="form-input w-full"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          <input
            type="password"
            className="form-input w-full"
            placeholder="Confirm password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            minLength={6}
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" className="primary-btn w-full" disabled={loading}>
            {loading ? 'Saving...' : 'Update password'}
          </button>
        </form>

        <Link to="/login" className="block text-center text-gray-500 text-sm mt-6 hover:text-white">
          Back to sign in
        </Link>
      </div>
    </div>
  )
}
