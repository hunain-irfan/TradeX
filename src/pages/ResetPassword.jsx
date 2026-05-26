import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { getAppHomePath } from '../lib/authPaths'
import AuthCard from '../components/layout/AuthCard'
import AuthField from '../components/layout/AuthField'

export default function ResetPassword() {
  const { updatePassword, session, loading: authLoading, isAdmin } = useAuth()
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
      setError('Use at least 6 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
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
    navigate(getAppHomePath(isAdmin), { replace: true })
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    )
  }

  if (!ready) {
    return (
      <AuthCard
        backTo="/login"
        title="Link expired"
        subtitle="This reset link is invalid or has already been used."
      >
        <Link to="/forgot-password" className="primary-btn w-full text-center block">
          Request a new link
        </Link>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      backTo="/login"
      title="Set new password"
      subtitle="Choose a secure password, then sign in to continue trading."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthField
          label="New password"
          type="password"
          placeholder="Enter new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          autoComplete="new-password"
        />
        <AuthField
          label="Confirm password"
          type="password"
          placeholder="Confirm new password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          minLength={6}
          autoComplete="new-password"
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" className="primary-btn w-full mt-2" disabled={loading}>
          {loading ? 'Saving...' : 'Save password'}
        </button>
      </form>
    </AuthCard>
  )
}
