import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { PageLoader, PageError, EmptyState } from '../../components/ui/PageState'

export default function AdminLogs() {
  const [logs, setLogs] = useState([])
  const [emails, setEmails] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionFilter, setActionFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const load = async () => {
    setLoading(true)
    setError(null)

    const { data: logData, error: logErr } = await supabase
      .from('admin_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200)

    if (logErr) {
      setError(logErr.message)
      setLoading(false)
      return
    }

    setLogs(logData ?? [])

    const { data: users } = await supabase.rpc('admin_list_users')
    const map = {}
    ;(users ?? []).forEach((u) => {
      map[u.user_id] = u.email
    })
    setEmails(map)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const actionTypes = useMemo(() => {
    const set = new Set(logs.map((l) => l.action?.split(' ')[0] ?? l.action))
    return [...set].filter(Boolean)
  }, [logs])

  const filtered = useMemo(() => {
    return logs.filter((log) => {
      if (actionFilter && !log.action?.includes(actionFilter)) return false
      const d = new Date(log.created_at)
      if (dateFrom && d < new Date(dateFrom)) return false
      if (dateTo && d > new Date(dateTo + 'T23:59:59')) return false
      return true
    })
  }, [logs, actionFilter, dateFrom, dateTo])

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
      <h1 className="text-2xl font-bold text-white">Admin Logs</h1>

      <div className="dashboard-card grid grid-cols-1 md:grid-cols-3 gap-4">
        <select
          className="form-input"
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
        >
          <option value="">All actions</option>
          {actionTypes.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <input
          type="date"
          className="form-input"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
        />
        <input
          type="date"
          className="form-input"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
        />
      </div>

      <div className="watchlist-table overflow-x-auto">
        <div className="table-header-row grid grid-cols-4 gap-2 px-4 py-3 text-sm font-medium">
          <span>Action</span>
          <span>Performed By</span>
          <span>Target User</span>
          <span>Date</span>
        </div>
        {filtered.length === 0 ? (
          <div className="p-8">
            <EmptyState title="No logs" message="Admin actions will appear here." />
          </div>
        ) : (
          filtered.map((log) => (
            <div
              key={log.id}
              className="table-row grid grid-cols-4 gap-2 px-4 py-3 text-sm"
            >
              <span className="text-gray-200">{log.action}</span>
              <span className="truncate">{emails[log.performed_by] ?? log.performed_by?.slice(0, 8)}</span>
              <span className="truncate">
                {log.target_user_id
                  ? emails[log.target_user_id] ?? log.target_user_id.slice(0, 8)
                  : '—'}
              </span>
              <span>{new Date(log.created_at).toLocaleString()}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
