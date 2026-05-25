import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Logo from '../components/layout/Logo'

export default function ForgotPassword() {
  const { resetPasswordForEmail } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error: err } = await resetPasswordForEmail(email.trim())
    if (err) setError(err.message)
    else setSent(true)

    setLoading(false)
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
        <h1 className="text-2xl font-bold text-white mb-1">Forgot password</h1>
        <p className="text-gray-500 text-sm mb-6">
          We will email you a link to reset your password.
        </p>

        {sent ? (
          <div className="space-y-4">
            <p className="text-gray-300 text-sm leading-relaxed">
              If an account exists for <span className="text-white font-mono">{email}</span>, you
              will receive a <strong className="text-white">Reset password</strong> email shortly.
              Click the button in that email — it opens TradeX where you can set a new password.
            </p>
            <p className="text-gray-500 text-xs">Check spam if you do not see it within a few minutes.</p>
            <Link to="/login" className="primary-btn w-full text-center">
              Back to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              className="form-input w-full"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button type="submit" className="primary-btn w-full" disabled={loading}>
              {loading ? 'Sending...' : 'Send reset link'}
            </button>
          </form>
        )}

        <Link to="/login" className="block text-center text-gray-500 text-sm mt-6 hover:text-white">
          Back to sign in
        </Link>
      </div>
    </div>
  )
}
