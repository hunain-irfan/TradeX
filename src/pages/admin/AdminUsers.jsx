import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'
import {
  adminListUsers,
  adminUpdateUserMetadata,
  adminResetWallet,
  adminDeleteUser,
  logAdminAction,
} from '../../lib/admin'
import Badge from '../../components/ui/Badge'
import { PageLoader, PageError, EmptyState } from '../../components/ui/PageState'

function userStatus(u) {
  if (u.is_banned) return { label: 'Banned', variant: 'rejected' }
  if (u.is_frozen) return { label: 'Frozen', variant: 'pending' }
  return { label: 'Active', variant: 'approved' }
}

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [portfolioUser, setPortfolioUser] = useState(null)
  const [portfolioRows, setPortfolioRows] = useState([])
  const [actionLoading, setActionLoading] = useState(null)

  const load = async () => {
    setLoading(true)
    const { data, error: err } = await adminListUsers()
    if (err) {
      setError(
        err.message?.includes('function')
          ? 'Run supabase/phase11-admin-rpc.sql in SQL Editor first'
          : err.message,
      )
    } else {
      setUsers(data ?? [])
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return users
    return users.filter((u) => u.email?.toLowerCase().includes(q))
  }, [users, search])

  const runAction = async (key, fn) => {
    setActionLoading(key)
    await fn()
    await load()
    setActionLoading(null)
  }

  const toggleBan = (u) =>
    runAction(`ban-${u.user_id}`, async () => {
      await adminUpdateUserMetadata(u.user_id, { is_banned: !u.is_banned })
      await logAdminAction(u.is_banned ? 'UNBAN_USER' : 'BAN_USER', u.user_id)
    })

  const toggleFreeze = (u) =>
    runAction(`freeze-${u.user_id}`, async () => {
      await adminUpdateUserMetadata(u.user_id, { is_frozen: !u.is_frozen })
      await logAdminAction(u.is_frozen ? 'UNFREEZE_USER' : 'FREEZE_USER', u.user_id)
    })

  const toggleAdmin = (u) =>
    runAction(`role-${u.user_id}`, async () => {
      const newRole = u.role === 'admin' ? 'user' : 'admin'
      await adminUpdateUserMetadata(u.user_id, { role: newRole })
      await logAdminAction(newRole === 'admin' ? 'MAKE_ADMIN' : 'REMOVE_ADMIN', u.user_id)
    })

  const viewPortfolio = async (u) => {
    setPortfolioUser(u)
    const { data } = await supabase.from('portfolios').select('*').eq('user_id', u.user_id)
    setPortfolioRows(data ?? [])
  }

  const handleResetWallet = (u) => {
    if (!window.confirm(`Reset wallet for ${u.email} to $10,000?`)) return
    runAction(`wallet-${u.user_id}`, () => adminResetWallet(u.user_id))
  }

  const handleDelete = (u) => {
    if (!window.confirm(`Delete account ${u.email}? This cannot be undone.`)) return
    runAction(`del-${u.user_id}`, () => adminDeleteUser(u.user_id))
  }

  if (loading) {
    return (
      <div className="container pt-6">
        <PageLoader />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container pt-6">
        <PageError message={error} onRetry={load} />
      </div>
    )
  }

  return (
    <div className="container pt-6 pb-10 space-y-6">
      <h1 className="text-2xl font-bold text-white">User Management</h1>

      <input
        type="text"
        className="search-input w-full max-w-md"
        placeholder="Search by email"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="watchlist-table overflow-x-auto">
        <div className="table-header-row grid grid-cols-7 gap-2 px-4 py-3 text-sm font-medium min-w-225">
          <span>Email</span>
          <span>Role</span>
          <span>Status</span>
          <span>Balance</span>
          <span>Joined</span>
          <span className="col-span-2">Actions</span>
        </div>
        {filtered.length === 0 ? (
          <div className="p-8">
            <EmptyState title="No users found" />
          </div>
        ) : (
          filtered.map((u) => {
            const status = userStatus(u)
            const busy = actionLoading?.includes(u.user_id)
            return (
              <div
                key={u.user_id}
                className="table-row grid grid-cols-7 gap-2 px-4 py-3 text-sm items-start min-w-225"
              >
                <span className="truncate">{u.email}</span>
                <span className="capitalize">{u.role}</span>
                <Badge variant={status.variant}>{status.label}</Badge>
                <span>${Number(u.balance).toFixed(2)}</span>
                <span>{new Date(u.created_at).toLocaleDateString()}</span>
                <div className="col-span-2 flex flex-wrap gap-1">
                  <button
                    type="button"
                    className="secondary-btn h-8 px-2 text-xs"
                    disabled={busy}
                    onClick={() => toggleBan(u)}
                  >
                    {u.is_banned ? 'Unban' : 'Ban'}
                  </button>
                  <button
                    type="button"
                    className="secondary-btn h-8 px-2 text-xs"
                    disabled={busy}
                    onClick={() => toggleFreeze(u)}
                  >
                    {u.is_frozen ? 'Unfreeze' : 'Freeze'}
                  </button>
                  <button
                    type="button"
                    className="secondary-btn h-8 px-2 text-xs"
                    disabled={busy}
                    onClick={() => toggleAdmin(u)}
                  >
                    {u.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                  </button>
                  <button
                    type="button"
                    className="secondary-btn h-8 px-2 text-xs"
                    onClick={() => viewPortfolio(u)}
                  >
                    View Portfolio
                  </button>
                  <button
                    type="button"
                    className="secondary-btn h-8 px-2 text-xs"
                    disabled={busy}
                    onClick={() => handleResetWallet(u)}
                  >
                    Reset Wallet
                  </button>
                  <button
                    type="button"
                    className="text-red-500 text-xs px-2 h-8 border border-red-500 rounded-xl hover:bg-red-500/10"
                    disabled={busy}
                    onClick={() => handleDelete(u)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {portfolioUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/80 px-4">
          <div className="dashboard-card w-full max-w-lg max-h-96 overflow-y-auto">
            <div className="flex justify-between mb-4">
              <h2 className="text-lg font-bold text-white">
                Portfolio — {portfolioUser.email}
              </h2>
              <button
                type="button"
                className="secondary-btn h-9 px-3"
                onClick={() => setPortfolioUser(null)}
              >
                Close
              </button>
            </div>
            {portfolioRows.length === 0 ? (
              <p className="text-gray-500">No holdings</p>
            ) : (
              <ul className="space-y-2">
                {portfolioRows.map((p) => (
                  <li key={p.id} className="text-gray-300 text-sm">
                    {p.stock_symbol} — {p.quantity} @ ${Number(p.buy_price).toFixed(2)}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
