import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Logo from '../components/layout/Logo'

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
    else setMessage('Confirmation email sent. Open your inbox and click the blue button.')

    setLoading(false)
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="dashboard-card w-full max-w-md">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 font-mono mb-2">
          Verification
        </p>
        <div className="flex justify-center mb-4">
          <Logo to="/" link={false} className="h-9 w-auto max-w-[180px]" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">Check your email</h1>
        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
          We sent a confirmation link to your inbox. Click <strong className="text-white">Confirm email address</strong> in
          that email, then sign in here.
        </p>

        <div className="bg-gray-700/40 border border-gray-600 rounded-lg p-4 mb-6 text-sm text-gray-300 space-y-2">
          <p>1. Open the email from TradeX (check spam)</p>
          <p>2. Click the blue button — you will return to TradeX</p>
          <p>3. Sign in with your email and password</p>
        </div>

        <form onSubmit={handleResend} className="space-y-4">
          <label className="block text-gray-500 text-xs uppercase tracking-wider font-mono">
            Resend to
          </label>
          <input
            type="email"
            className="form-input w-full"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {message && <p className="text-green-500 text-sm">{message}</p>}
          <button type="submit" className="secondary-btn w-full" disabled={loading}>
            {loading ? 'Sending...' : 'Resend confirmation email'}
          </button>
        </form>

        <Link to="/login" className="primary-btn w-full text-center mt-4">
          Go to sign in
        </Link>

        {user && (
          <button
            type="button"
            onClick={handleSignOut}
            className="block w-full text-center text-gray-500 text-sm mt-4 hover:text-white"
          >
            Sign out
          </button>
        )}
      </div>
    </div>
  )
}
