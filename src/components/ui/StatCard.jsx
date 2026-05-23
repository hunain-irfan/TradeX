export default function StatCard({ label, value, sub, trend }) {
  const trendClass =
    trend === 'up' ? 'profit-text' : trend === 'down' ? 'loss-text' : 'text-gray-400'

  return (
    <div className="dashboard-card">
      <p className="text-gray-500 text-sm mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
      {sub && <p className={`text-sm mt-1 ${trendClass}`}>{sub}</p>}
    </div>
  )
}
