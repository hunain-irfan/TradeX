import { useEffect, useState } from 'react'
import { AVAILABLE_STOCK_LIST } from '../../data/stocks'
import { ALERT_CONDITIONS, ALERT_FREQUENCIES, createAlert } from '../../lib/alerts'
import { X } from '../../lib/navIcons'

const LABEL = 'block text-gray-400 text-xs font-medium uppercase tracking-wide mb-2'

function resolveStock(symbol) {
  return AVAILABLE_STOCK_LIST.find((s) => s.symbol === symbol) ?? AVAILABLE_STOCK_LIST[0]
}

export default function PriceAlertModal({
  open,
  onClose,
  userId,
  stockSymbol,
  onCreated,
}) {
  const [alertName, setAlertName] = useState('')
  const [selectedSymbol, setSelectedSymbol] = useState(AVAILABLE_STOCK_LIST[0]?.symbol ?? 'AAPL')
  const [condition, setCondition] = useState('ABOVE')
  const [threshold, setThreshold] = useState('')
  const [frequency, setFrequency] = useState('once_per_day')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const selectedStock = resolveStock(selectedSymbol)

  useEffect(() => {
    if (!open) return
    const initial = stockSymbol && AVAILABLE_STOCK_LIST.some((s) => s.symbol === stockSymbol)
      ? stockSymbol
      : AVAILABLE_STOCK_LIST[0]?.symbol
    setSelectedSymbol(initial ?? 'AAPL')
    setAlertName(initial ? `${initial} alert` : '')
    setCondition('ABOVE')
    setThreshold('')
    setFrequency('once_per_day')
    setError(null)
  }, [open, stockSymbol])

  if (!open) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    const price = Number(threshold)
    if (!price || price <= 0) {
      setError('Enter a valid threshold price.')
      return
    }
    if (!userId || !selectedStock) {
      setError('Missing stock or user.')
      return
    }

    setLoading(true)
    const { error: err } = await createAlert({
      userId,
      alertName: alertName.trim() || `${selectedStock.symbol} alert`,
      stockSymbol: selectedStock.symbol,
      stockName: selectedStock.name,
      condition,
      targetPrice: price,
      frequency,
    })
    setLoading(false)

    if (err) {
      setError(err.message)
      return
    }
    onCreated?.()
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/85 px-4 py-8"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-lg rounded-xl border border-gray-600 bg-gray-800 shadow-2xl max-h-[min(90vh,720px)] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4 border-b border-gray-600/80 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-white">Price Alert</h2>
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-primary-500/15 text-primary-400 border border-primary-500/25">
                Price
              </span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              We&apos;ll email you when the live price hits your target.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="icon-btn shrink-0"
            aria-label="Close"
          >
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>

        <form id="price-alert-form" onSubmit={handleSubmit} className="overflow-y-auto px-6 py-6 space-y-6 flex-1">
          <div>
            <label className={LABEL} htmlFor="alert-name">
              Alert name
            </label>
            <input
              id="alert-name"
              className="form-input w-full"
              value={alertName}
              onChange={(e) => setAlertName(e.target.value)}
              placeholder="e.g. Apple at discount"
              required
            />
          </div>

          <div>
            <label className={LABEL} htmlFor="alert-stock">
              Stock
            </label>
            <select
              id="alert-stock"
              className="form-input w-full"
              value={selectedSymbol}
              onChange={(e) => {
                const sym = e.target.value
                setSelectedSymbol(sym)
                setAlertName(`${sym} alert`)
              }}
            >
              {AVAILABLE_STOCK_LIST.map((s) => (
                <option key={s.symbol} value={s.symbol}>
                  {s.name} ({s.symbol})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={LABEL} htmlFor="alert-condition">
                Condition
              </label>
              <select
                id="alert-condition"
                className="form-input w-full"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
              >
                {ALERT_CONDITIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={LABEL} htmlFor="alert-threshold">
                Threshold
              </label>
              <div className="form-input w-full flex items-center gap-3 min-h-10">
                <span className="w-5 text-center text-primary-400 font-mono text-sm shrink-0 select-none">
                  $
                </span>
                <input
                  id="alert-threshold"
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="flex-1 min-w-0 bg-transparent border-0 outline-none text-white text-sm placeholder:text-gray-500"
                  placeholder="140.00"
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className={LABEL} htmlFor="alert-frequency">
              Frequency
            </label>
            <select
              id="alert-frequency"
              className="form-input w-full"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
            >
              {ALERT_FREQUENCIES.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
            <p className="text-gray-600 text-xs mt-2 leading-relaxed">
              Controls how often you get emailed while the condition stays true.
            </p>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" className="secondary-btn flex-1" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" disabled={loading} className="primary-btn flex-1">
              {loading ? 'Creating…' : 'Create Alert'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
