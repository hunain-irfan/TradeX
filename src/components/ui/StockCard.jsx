import { Link } from 'react-router-dom'
import PriceTag from './PriceTag'

export default function StockCard({ symbol, name, quote, onAddWatchlist, adding }) {
  const price = quote?.c ?? 0
  const change = quote?.d ?? 0
  const changePct = quote?.dp ?? 0

  return (
    <div className="dashboard-card flex flex-col gap-3">
      <Link to={`/stock/${symbol}`} className="flex justify-between items-start hover:opacity-90">
        <div>
          <p className="font-bold text-white text-lg">{symbol}</p>
          <p className="text-gray-500 text-sm truncate">{name}</p>
        </div>
        <PriceTag price={price} change={change} changePercent={changePct} />
      </Link>
      <button
        type="button"
        className="watchlist-btn"
        onClick={() => onAddWatchlist?.(symbol, name)}
        disabled={adding}
      >
        {adding ? 'Adding...' : 'Add to Watchlist'}
      </button>
    </div>
  )
}
