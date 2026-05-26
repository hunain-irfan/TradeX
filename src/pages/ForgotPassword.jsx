import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import AuthCard from '../components/layout/AuthCard'
import AuthField from '../components/layout/AuthField'

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
    <AuthCard
      backTo="/login"
      title={sent ? 'Check your email' : 'Forgot password?'}
      subtitle={
        sent
          ? 'If that email is registered, a reset link is on its way.'
          : 'Enter your email — we will send a link to choose a new password.'
      }
    >
      {sent ? (
        <p className="text-gray-300 text-sm leading-relaxed">
          Open <span className="text-white font-mono text-xs">{email}</span> (and spam) for an email
          from TradeX, then click the reset button.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <AuthField
            label="Email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" className="primary-btn w-full mt-2" disabled={loading}>
            {loading ? 'Sending...' : 'Send reset link'}
          </button>
        </form>
      )}
    </AuthCard>
  )
}
