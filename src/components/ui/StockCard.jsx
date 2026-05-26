import { Link } from 'react-router-dom'
import MiniChart from '../tradingview/MiniChart'
import WatchlistStarButton from '../trading/WatchlistStarButton'

export default function StockCard({
  symbol,
  inWatchlist,
  onToggleWatchlist,
  watchlistLoading,
}) {
  return (
    <div className="stock-search-card p-4 pe-1 ps-2.5 relative overflow-hidden rounded-lg border border-gray-600 bg-[#111111]">
      <WatchlistStarButton
        className="absolute top-5 right-3 z-20"
        inWatchlist={inWatchlist}
        loading={watchlistLoading}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onToggleWatchlist?.()
        }}
      />
      <div className="relative">
        <MiniChart symbol={symbol} dateRange="1M" />
        <Link
          to={`/stock/${symbol}`}
          className="absolute inset-0 z-10"
          aria-label={`View ${symbol} details`}
        />
      </div>
    </div>
  )
}
