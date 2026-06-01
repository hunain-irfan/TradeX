export default function WatchlistStarButton({
  inWatchlist,
  loading,
  onClick,
  className = 'absolute !top-2.5 !right-2.5 z-20',
}) {
  return (
    <button
      type="button"
      className={`${className} p-1 rounded border transition-colors duration-150 flex items-center justify-center ${
        inWatchlist
          ? 'bg-[#2a2410] border-yellow-500/50 text-yellow-500 hover:bg-[#332c12]'
          : 'bg-[#161616] border-[#1E1E1E] text-gray-500 hover:text-white hover:bg-[#1c1c1c]'
      }`}
      onClick={onClick}
      disabled={loading}
      title={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
      aria-label={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
    >
      <svg className="w-4.5 h-4.5" fill={inWatchlist ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.253.588 1.81l-3.97 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.971-2.888a1 1 0 00-1.176 0l-3.97 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.97-2.888c-.772-.557-.373-1.81.588-1.81h4.907a1 1 0 00.95-.69l1.519-4.674z"
        />
      </svg>
    </button>
  )
}
