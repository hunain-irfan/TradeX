import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const { signIn, signUp, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error: err } = isRegister
      ? await signUp(email, password)
      : await signIn(email, password)

    if (err) setError(err.message)
    else navigate('/dashboard')

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="dashboard-card w-full max-w-md">
        <h1 className="text-2xl font-bold text-primary-400 mb-1">TradeX</h1>
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

        <p className="text-gray-500 text-sm text-center mt-4">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            className="text-primary-400 hover:underline"
            onClick={() => setIsRegister((r) => !r)}
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
