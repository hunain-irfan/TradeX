import { useEffect, useMemo, useState } from 'react'
import { getQuote } from '../../lib/finnhub'
import { pnlToneClass } from '../../lib/portfolioMetrics'
import { executeBuy, executeSell, fetchWallet } from '../../lib/trading'
import StockLogo from '../ui/StockLogo'
import { X } from '../../lib/navIcons'

const LABEL = 'block text-gray-400 text-xs font-medium uppercase tracking-wide mb-2'

function formatMoney(n) {
  if (n == null || Number.isNaN(n)) return '—'
  return `$${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function BuySellModal({
  open,
  onClose,
  mode,
  symbol,
  stockName,
  userId,
  maxQuantity,
  avgBuyPrice,
  onSuccess,
  isFrozen,
}) {
  const [quantity, setQuantity] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [quote, setQuote] = useState(null)
  const [quoteLoading, setQuoteLoading] = useState(false)
  const [walletBalance, setWalletBalance] = useState(null)

  const isBuy = mode === 'buy'
  const sym = symbol?.toUpperCase() ?? ''

  useEffect(() => {
    if (!open || !sym) return
    setQuantity('')
    setError(null)
    setQuote(null)
    setWalletBalance(null)

    let cancelled = false
    setQuoteLoading(true)

    getQuote(sym)
      .then((q) => {
        if (!cancelled) setQuote(q)
      })
      .catch(() => {
        if (!cancelled) setQuote(null)
      })
      .finally(() => {
        if (!cancelled) setQuoteLoading(false)
      })

    if (userId) {
      fetchWallet(userId).then(({ data }) => {
        if (!cancelled && data) setWalletBalance(Number(data.balance ?? 0))
      })
    }

    return () => {
      cancelled = true
    }
  }, [open, sym, userId])

  const livePrice = Number(quote?.c ?? 0)
  const changePct = quote?.dp != null ? Number(quote.dp) : null
  const qty = Number(quantity) || 0
  const estimatedTotal = livePrice > 0 && qty > 0 ? livePrice * qty : 0

  const maxAffordable = useMemo(() => {
    if (!isBuy || livePrice <= 0 || walletBalance == null) return 0
    return Math.floor(walletBalance / livePrice)
  }, [isBuy, livePrice, walletBalance])

  const sellMax = maxQuantity != null ? Number(maxQuantity) : 0

  const unrealizedOnQty = useMemo(() => {
    if (isBuy || !avgBuyPrice || livePrice <= 0 || qty <= 0) return null
    return (livePrice - Number(avgBuyPrice)) * qty
  }, [isBuy, avgBuyPrice, livePrice, qty])

  const handleConfirm = async () => {
    if (isFrozen) {
      setError('Account is frozen. Trading disabled.')
      return
    }
    if (!livePrice || livePrice <= 0) {
      setError('Live price unavailable. Try again in a moment.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      if (isBuy) {
        await executeBuy({ userId, symbol: sym, stockName, quantity: qty })
      } else {
        await executeSell({ userId, symbol: sym, stockName, quantity: qty })
      }
      setQuantity('')
      onSuccess?.()
      onClose()
    } catch (err) {
      setError(err.message ?? 'Trade failed')
    } finally {
      setLoading(false)
    }
  }

  if (!open || !sym) return null

  const canSubmit =
    qty > 0 &&
    !loading &&
    livePrice > 0 &&
    (isBuy ? qty <= maxAffordable && estimatedTotal <= (walletBalance ?? 0) : qty <= sellMax)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/85 px-4 py-8"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-lg rounded-xl border border-gray-600 bg-gray-800 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4 border-b border-gray-600/80">
          <div className="flex items-center gap-3 min-w-0">
            <StockLogo symbol={sym} size={44} className="shrink-0" />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-white font-mono">{sym}</h2>
                <span
                  className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-semibold ${
                    isBuy
                      ? 'bg-primary-500/15 text-primary-400 border border-primary-500/25'
                      : 'bg-red-500/10 text-red-400 border border-red-500/25'
                  }`}
                >
                  {isBuy ? 'Buy' : 'Sell'}
                </span>
              </div>
              <p className="text-gray-500 text-sm truncate">{stockName}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="icon-btn shrink-0" aria-label="Close">
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-gray-900/60 border border-gray-600/80 p-3">
              <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Live price</p>
              <p className="text-lg font-bold font-mono text-white">
                {quoteLoading ? '…' : formatMoney(livePrice)}
              </p>
            </div>

            <div className="rounded-lg bg-gray-900/60 border border-gray-600/80 p-3">
              {isBuy ? (
                <>
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Available cash</p>
                  <p className="text-lg font-bold font-mono text-white">
                    {walletBalance == null ? '…' : formatMoney(walletBalance)}
                  </p>
                  {maxAffordable > 0 && livePrice > 0 && (
                    <p className="text-xs text-gray-500 mt-0.5">Max ~{maxAffordable} shares</p>
                  )}
                </>
              ) : (
                <>
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">You hold</p>
                  <p className="text-lg font-bold font-mono text-white">
                    {sellMax} <span className="text-sm font-normal text-gray-400">shares</span>
                  </p>
                  {avgBuyPrice != null && (
                    <p className="text-xs text-gray-500 mt-0.5">Avg cost {formatMoney(avgBuyPrice)}</p>
                  )}
                </>
              )}
            </div>
          </div>

          <div>
            <label className={LABEL} htmlFor="trade-qty">
              Quantity
            </label>
            <input
              id="trade-qty"
              type="number"
              min="1"
              max={isBuy ? maxAffordable || undefined : sellMax || undefined}
              className="form-input w-full"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter shares"
            />
          </div>

          {qty > 0 && livePrice > 0 && (
            <div className="rounded-lg border border-gray-600/80 bg-gray-900/40 px-4 py-3 space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-400">
                <span>Est. {isBuy ? 'cost' : 'proceeds'}</span>
                <span className="font-mono text-white font-medium">{formatMoney(estimatedTotal)}</span>
              </div>
              {!isBuy && unrealizedOnQty != null && (
                <div className="flex justify-between text-gray-400">
                  <span>Est. P&L on sale</span>
                  <span className={`font-mono font-medium ${pnlToneClass(unrealizedOnQty)}`}>
                    {unrealizedOnQty >= 0 ? '+' : ''}
                    {formatMoney(unrealizedOnQty)}
                  </span>
                </div>
              )}
              {isBuy && walletBalance != null && estimatedTotal > walletBalance && (
                <p className="text-red-500 text-xs">Insufficient balance for this quantity.</p>
              )}
            </div>
          )}

          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>

        <div className="flex gap-3 px-6 py-5 border-t border-gray-600/80">
          <button type="button" className="secondary-btn flex-1" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button
            type="button"
            className={`flex-1 h-10 px-4 rounded-md font-medium text-sm transition-all disabled:opacity-50 ${
              isBuy
                ? 'primary-btn'
                : 'bg-red-500/90 hover:bg-red-500 text-white'
            }`}
            onClick={handleConfirm}
            disabled={!canSubmit}
          >
            {loading ? 'Processing…' : isBuy ? 'Confirm Buy' : 'Confirm Sell'}
          </button>
        </div>
      </div>
    </div>
  )
}
