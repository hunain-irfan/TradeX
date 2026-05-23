export default function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div
        className="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent"
        role="status"
        aria-label="Loading"
      />
    </div>
  )
}
