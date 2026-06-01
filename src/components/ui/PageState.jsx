import EmptyState from './EmptyState'

export function PageLoader() {
  return (
    <div className="py-20 flex justify-center" role="status" aria-label="Loading">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
    </div>
  )
}

export function PageError({ message, onRetry }) {
  return (
    <div className="dashboard-card py-8 text-center">
      <p className="text-red-500 font-semibold mb-2">Something went wrong</p>
      <p className="text-gray-500 text-sm mb-4">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="secondary-btn">
          Try Again
        </button>
      )}
    </div>
  )
}

export { EmptyState }
