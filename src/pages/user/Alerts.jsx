import { useEffect, useMemo, useState } from 'react'
import { useAlerts } from '../../hooks/useAlerts'
import { useFinnhub } from '../../hooks/useFinnhub'
import { PageLoader, PageError, EmptyState } from '../../components/ui/PageState'

export default function Alerts() {
  const { alerts, loading, addAlert, removeAlert, checkAlerts } = useAlerts()
  const [symbol, setSymbol] = useState('')
  const [targetPrice, setTargetPrice] = useState('')
  const [condition, setCondition] = useState('ABOVE')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)

  const active = alerts.filter((a) => !a.is_triggered)
  const triggered = alerts.filter((a) => a.is_triggered)

  const symbols = useMemo(() => active.map((a) => a.stock_symbol), [active])
  const { prices } = useFinnhub(symbols, 30000)

  useEffect(() => {
    if (Object.keys(prices).length > 0) {
      checkAlerts(prices)
    }
  }, [prices, checkAlerts])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setFormError(null)
    const { error: err } = await addAlert({
      stock_symbol: symbol.trim().toUpperCase(),
      target_price: Number(targetPrice),
      condition,
    })
    if (err) setFormError(err.message)
    else {
      setSymbol('')
      setTargetPrice('')
    }
    setSubmitting(false)
  }

  if (loading) return <div className="container pt-6"><PageLoader /></div>

  return (
    <div className="container pt-6 pb-10 space-y-6">
      <h1 className="text-2xl font-bold text-white">Price Alerts</h1>

      <form onSubmit={handleSubmit} className="dashboard-card grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label className="text-gray-500 text-sm block mb-1">Symbol</label>
          <input
            className="form-input w-full"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            placeholder="AAPL"
            required
          />
        </div>
        <div>
          <label className="text-gray-500 text-sm block mb-1">Target Price</label>
          <input
            type="number"
            step="0.01"
            className="form-input w-full"
            value={targetPrice}
            onChange={(e) => setTargetPrice(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="text-gray-500 text-sm block mb-1">Condition</label>
          <div className="flex gap-2">
            <button
              type="button"
              className={condition === 'ABOVE' ? 'primary-btn h-12 flex-1' : 'secondary-btn h-12 flex-1'}
              onClick={() => setCondition('ABOVE')}
            >
              Above
            </button>
            <button
              type="button"
              className={condition === 'BELOW' ? 'primary-btn h-12 flex-1' : 'secondary-btn h-12 flex-1'}
              onClick={() => setCondition('BELOW')}
            >
              Below
            </button>
          </div>
        </div>
        <button type="submit" className="primary-btn" disabled={submitting}>
          Set Alert
        </button>
        {formError && <p className="text-red-500 text-sm md:col-span-4">{formError}</p>}
      </form>

      <section>
        <h2 className="text-lg font-semibold text-white mb-3">Active Alerts (FIFO)</h2>
        {active.length === 0 ? (
          <EmptyState title="No active alerts" message="Create an alert above." />
        ) : (
          <div className="space-y-3">
            {active.map((a) => (
              <div key={a.id} className="dashboard-card flex justify-between items-center">
                <div>
                  <p className="font-bold text-white">{a.stock_symbol}</p>
                  <p className="text-gray-400 text-sm">
                    {a.condition} ${Number(a.target_price).toFixed(2)}
                  </p>
                  {prices[a.stock_symbol] && (
                    <p className="text-gray-500 text-xs mt-1">
                      Current: ${Number(prices[a.stock_symbol]?.c ?? 0).toFixed(2)}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  className="text-red-500 hover:underline text-sm"
                  onClick={() => removeAlert(a.id)}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-500 mb-3">Triggered</h2>
        {triggered.length === 0 ? (
          <p className="text-gray-600 text-sm">No triggered alerts yet.</p>
        ) : (
          <div className="space-y-2 opacity-60">
            {triggered.map((a) => (
              <div key={a.id} className="dashboard-card flex justify-between">
                <span className="text-gray-400">
                  {a.stock_symbol} — {a.condition} ${Number(a.target_price).toFixed(2)}
                </span>
                <button
                  type="button"
                  className="text-gray-500 text-sm hover:underline"
                  onClick={() => removeAlert(a.id)}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
