import { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { usePortfolio } from '../../hooks/usePortfolio'
import { supabase } from '../../lib/supabase'
import { fetchWallet } from '../../lib/trading'
import { computeHoldingsCostBasis } from '../../lib/portfolioMetrics'
import Badge from '../../components/ui/Badge'
import { PageLoader, PageError, EmptyState } from '../../components/ui/PageState'

const MAX_REQUEST = 5000

export default function Wallet() {
  const { user } = useAuth()
  const { holdings, totalValue, loading: portLoading } = usePortfolio()
  const [balance, setBalance] = useState(0)
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')
  const [formError, setFormError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const load = async () => {
    if (!user) return
    setLoading(true)
    setError(null)

    const [walletRes, reqRes] = await Promise.all([
      fetchWallet(user.id),
      supabase
        .from('fund_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('requested_at', { ascending: false }),
    ])

    if (walletRes.error) setError(walletRes.error.message)
    else setBalance(Number(walletRes.data?.balance ?? 0))

    if (reqRes.error) setError(reqRes.error.message)
    else setRequests(reqRes.data ?? [])

    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError(null)

    const amt = Number(amount)
    if (!amt || amt <= 0) {
      setFormError('Enter a valid amount')
      return
    }
    if (amt > MAX_REQUEST) {
      setFormError('Maximum $5,000 per request')
      return
    }

    const last = requests[0]
    if (last) {
      const lastDate = new Date(last.requested_at).toDateString()
      if (lastDate === new Date().toDateString()) {
        setFormError('Only one request allowed per day')
        return
      }
    }

    setSubmitting(true)
    const { error: err } = await supabase.from('fund_requests').insert({
      user_id: user.id,
      amount: amt,
      reason: reason.trim(),
    })

    if (err) setFormError(err.message)
    else {
      setAmount('')
      setReason('')
      setShowForm(false)
      load()
    }
    setSubmitting(false)
  }

  const totalInvested = computeHoldingsCostBasis(holdings)

  if (loading || portLoading) return <div className="container pt-6"><PageLoader /></div>
  if (error) return <div className="container pt-6"><PageError message={error} onRetry={load} /></div>

  return (
    <div className="container pt-6 pb-10 space-y-6">
      <h1 className="text-2xl font-bold text-white">Wallet</h1>

      <div className="dashboard-card text-center py-10">
        <p className="text-gray-500 text-sm mb-2">Available Balance</p>
        <p className="text-5xl font-bold text-primary-400">
          ${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="dashboard-card">
          <p className="text-gray-500 text-sm">Total Invested</p>
          <p className="text-xl font-bold text-white">${totalInvested.toFixed(2)}</p>
        </div>
        <div className="dashboard-card">
          <p className="text-gray-500 text-sm">Portfolio Value</p>
          <p className="text-xl font-bold text-white">${totalValue.toFixed(2)}</p>
        </div>
        <div className="dashboard-card">
          <p className="text-gray-500 text-sm">Available Cash</p>
          <p className="text-xl font-bold text-white">${balance.toFixed(2)}</p>
        </div>
      </div>

      <button type="button" className="primary-btn" onClick={() => setShowForm((s) => !s)}>
        Request Funds
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="dashboard-card space-y-4">
          <div>
            <label className="text-gray-500 text-sm">Amount (max $5,000)</label>
            <input
              type="number"
              max={MAX_REQUEST}
              className="form-input w-full mt-1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-gray-500 text-sm">Reason</label>
            <textarea
              className="form-input w-full mt-1 min-h-24"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why do you need additional funds?"
            />
          </div>
          {formError && <p className="text-red-500 text-sm">{formError}</p>}
          <button type="submit" className="primary-btn" disabled={submitting}>
            Submit Request
          </button>
        </form>
      )}

      <h2 className="text-lg font-semibold text-white">My Requests</h2>
      <div className="watchlist-table">
        <div className="table-header-row grid grid-cols-5 gap-2 px-4 py-3 text-sm font-medium">
          <span>Amount</span>
          <span>Reason</span>
          <span>Status</span>
          <span>Admin Note</span>
          <span>Date</span>
        </div>
        {requests.length === 0 ? (
          <div className="p-8">
            <EmptyState title="No fund requests" />
          </div>
        ) : (
          requests.map((r) => (
            <div key={r.id} className="data-row grid grid-cols-5 gap-2 px-4 py-3 text-sm items-center">
              <span>${Number(r.amount).toFixed(2)}</span>
              <span className="truncate">{r.reason || '—'}</span>
              <Badge variant={r.status}>{r.status}</Badge>
              <span className="text-gray-500 truncate">{r.admin_note || '—'}</span>
              <span>{new Date(r.requested_at).toLocaleDateString()}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
