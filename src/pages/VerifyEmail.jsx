import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import AuthCard from '../components/layout/AuthCard'
import AuthField from '../components/layout/AuthField'

export default function VerifyEmail() {
  const location = useLocation()
  const navigate = useNavigate()
  const { resendSignupConfirmation, signOut, user } = useAuth()

  const emailFromState = location.state?.email ?? ''
  const [email, setEmail] = useState(emailFromState)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  const handleResend = async (e) => {
    e.preventDefault()
    const target = email.trim()
    if (!target) {
      setError('Enter your email address')
      return
    }

    setLoading(true)
    setError(null)
    setMessage(null)

    const { error: err } = await resendSignupConfirmation(target)
    if (err) setError(err.message)
    else setMessage('Confirmation email sent — check your inbox.')

    setLoading(false)
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <AuthCard
      backTo="/login"
      title="Verify your email"
      subtitle="We sent a confirmation link. Open it, then sign in to start trading."
    >
      <div className="bg-gray-800/60 border border-gray-600 rounded-lg p-4 mb-4 text-sm text-gray-400">
        <p>Check your spam folder if you do not see the email within a few minutes.</p>
      </div>

      <form onSubmit={handleResend} className="space-y-4">
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
        {message && <p className="text-green-500 text-sm">{message}</p>}
        <button type="submit" className="secondary-btn w-full" disabled={loading}>
          {loading ? 'Sending...' : 'Resend confirmation email'}
        </button>
      </form>

      <Link to="/login" className="primary-btn w-full text-center block mt-4">
        Go to sign in
      </Link>

      {user && (
        <button
          type="button"
          onClick={handleSignOut}
          className="text-gray-500 text-sm mt-4 hover:text-white"
        >
          Sign out
        </button>
      )}
    </AuthCard>
  )
}
