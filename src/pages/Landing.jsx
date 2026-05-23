import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-gray-900">
      <h1 className="text-4xl font-bold text-primary-400">TradeX</h1>
      <p className="text-gray-400">Paper Trading Platform</p>
      <Link to="/login" className="primary-btn inline-flex items-center justify-center">
        Get Started
      </Link>
    </div>
  )
}
