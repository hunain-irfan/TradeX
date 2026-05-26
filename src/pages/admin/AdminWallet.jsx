import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { approveFundRequest, rejectFundRequest } from '../../lib/admin'
import Badge from '../../components/ui/Badge'
import { PageLoader, PageError, EmptyState } from '../../components/ui/PageState'

function shouldShowAdminNote(status, note) {
  const n = note?.trim()
  if (!n) return false
  const s = (status ?? '').toLowerCase()
  if (n.toLowerCase() === s) return false
  if (s === 'approved' && n.toLowerCase() === 'approved') return false
  return true
}

export default function AdminWallet() {
  const [pending, setPending] = useState([])
  const [resolved, setResolved] = useState([])
  const [userEmails, setUserEmails] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tab, setTab] = useState('pending')
  const [rejectId, setRejectId] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [processing, setProcessing] = useState(null)

  const load = async () => {
    setLoading(true)
    setError(null)

    const [pendingRes, resolvedRes, usersRes] = await Promise.all([
      supabase
        .from('fund_requests')
        .select('*')
        .eq('status', 'pending')
        .order('requested_at', { ascending: true }),
      supabase
        .from('fund_requests')
        .select('*')
        .in('status', ['approved', 'rejected'])
        .order('resolved_at', { ascending: false })
        .limit(50),
      supabase.rpc('admin_list_users'),
    ])

    if (pendingRes.error || resolvedRes.error) {
      setError(pendingRes.error?.message ?? resolvedRes.error?.message)
    } else {
      setPending(pendingRes.data ?? [])
      setResolved(resolvedRes.data ?? [])
    }

    const emailMap = {}
    ;(usersRes.data ?? []).forEach((u) => {
      emailMap[u.user_id] = u.email
    })
    setUserEmails(emailMap)

    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const handleApprove = async (req) => {
    setProcessing(req.id)
    const { error: err } = await approveFundRequest(req)
    if (err) setError(err.message)
    else await load()
    setProcessing(null)
  }

  const handleReject = async (req) => {
    if (!rejectReason.trim()) return
    setProcessing(req.id)
    const { error: err } = await rejectFundRequest(req.id, req.user_id, rejectReason)
    if (err) setError(err.message)
    else {
      setRejectId(null)
      setRejectReason('')
      await load()
    }
    setProcessing(null)
  }

  if (loading) {
    return (
      <div className="container pt-6">
        <PageLoader />
      </div>
    )
  }

  const rows = tab === 'pending' ? pending : resolved

  return (
    <div className="container pt-6 pb-10 space-y-6">
      <h1 className="text-2xl font-bold text-white">Fund Requests</h1>

      {error && (
        <div className="dashboard-card">
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          className={tab === 'pending' ? 'primary-btn h-10 px-4' : 'secondary-btn h-10 px-4'}
          onClick={() => setTab('pending')}
        >
          Pending ({pending.length})
        </button>
        <button
          type="button"
          className={tab === 'resolved' ? 'primary-btn h-10 px-4' : 'secondary-btn h-10 px-4'}
          onClick={() => setTab('resolved')}
        >
          Resolved
        </button>
      </div>

      <div className="watchlist-table overflow-x-auto">
        <div className="table-header-row grid grid-cols-5 gap-2 px-4 py-3 text-sm font-medium">
          <span>User</span>
          <span>Amount</span>
          <span>Reason</span>
          <span>{tab === 'pending' ? 'Requested At' : 'Status / Note'}</span>
          <span>Actions</span>
        </div>
        {rows.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title={tab === 'pending' ? 'No pending requests' : 'No resolved requests'}
            />
          </div>
        ) : (
          rows.map((req) => (
            <div
              key={req.id}
              className="data-row grid grid-cols-5 gap-2 px-4 py-3 text-sm items-center"
            >
              <span className="truncate">{userEmails[req.user_id] ?? req.user_id.slice(0, 8)}</span>
              <span>${Number(req.amount).toFixed(2)}</span>
              <span className="truncate">{req.reason || '—'}</span>
              <span>
                {tab === 'pending' ? (
                  new Date(req.requested_at).toLocaleString()
                ) : (
                  <span className="flex flex-col items-start gap-1">
                    <Badge variant={req.status}>{req.status}</Badge>
                    {shouldShowAdminNote(req.status, req.admin_note) && (
                      <span className="text-gray-500 text-xs">{req.admin_note}</span>
                    )}
                  </span>
                )}
              </span>
              <span>
                {tab === 'pending' ? (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="primary-btn h-9 px-3 text-xs"
                      disabled={processing === req.id}
                      onClick={() => handleApprove(req)}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      className="secondary-btn h-9 px-3 text-xs"
                      onClick={() => setRejectId(req.id)}
                    >
                      Reject
                    </button>
                  </div>
                ) : (
                  <span className="text-gray-500 text-xs">
                    {req.resolved_at ? new Date(req.resolved_at).toLocaleDateString() : '—'}
                  </span>
                )}
              </span>
            </div>
          ))
        )}
      </div>

      {rejectId && (
        <div className="dashboard-card space-y-3">
          <p className="text-white font-medium">Rejection reason</p>
          <textarea
            className="form-input w-full min-h-20"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Reason for rejection..."
          />
          <div className="flex gap-2">
            <button
              type="button"
              className="primary-btn"
              onClick={() => {
                const req = pending.find((r) => r.id === rejectId)
                if (req) handleReject(req)
              }}
            >
              Confirm Reject
            </button>
            <button type="button" className="secondary-btn" onClick={() => setRejectId(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
