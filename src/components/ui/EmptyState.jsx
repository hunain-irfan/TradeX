export default function EmptyState({ title = 'No data', message, action }) {
  return (
    <div className="dashboard-card flex flex-col items-center justify-center py-12 text-center">
      <p className="text-lg font-semibold text-white mb-2">{title}</p>
      {message && <p className="text-gray-500 text-sm max-w-sm">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
