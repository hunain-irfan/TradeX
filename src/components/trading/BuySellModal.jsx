import { useState } from 'react'
import { executeBuy, executeSell } from '../../lib/trading'

export default function BuySellModal({
  open,
  onClose,
  mode,
  symbol,
  stockName,
  userId,
  maxQuantity,
  onSuccess,
  isFrozen,
}) {
  const [quantity, setQuantity] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  if (!open) return null

  const handleConfirm = async () => {
    if (isFrozen) {
      setError('Account is frozen. Trading disabled.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      if (mode === 'buy') {
        await executeBuy({ userId, symbol, stockName, quantity: Number(quantity) })
      } else {
        await executeSell({ userId, symbol, stockName, quantity: Number(quantity) })
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/80 px-4">
      <div className="dashboard-card w-full max-w-md">
        <h2 className="text-xl font-bold text-white mb-1">
          {mode === 'buy' ? 'Buy' : 'Sell'} {symbol}
        </h2>
        <p className="text-gray-500 text-sm mb-4">{stockName}</p>

        <label className="block text-gray-400 text-sm mb-2">Quantity</label>
        <input
          type="number"
          min="1"
          max={mode === 'sell' ? maxQuantity : undefined}
          className="form-input w-full mb-2"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="Enter shares"
        />
        {mode === 'sell' && maxQuantity != null && (
          <p className="text-gray-500 text-xs mb-4">Max: {maxQuantity} shares</p>
        )}

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <div className="flex gap-3">
          <button type="button" className="secondary-btn flex-1" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button
            type="button"
            className="primary-btn flex-1"
            onClick={handleConfirm}
            disabled={loading || !quantity}
          >
            {loading ? 'Processing...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  )
}
