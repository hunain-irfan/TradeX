import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

export default function LeaderboardBar({ data = [] }) {
  const top10 = data.slice(0, 10)

  if (top10.length === 0) {
    return (
      <div className="dashboard-card flex items-center justify-center py-12 text-gray-500">
        No leaderboard data
      </div>
    )
  }

  return (
    <div className="dashboard-card">
      <h3 className="text-white font-semibold mb-4">Top 10 by Portfolio Value</h3>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={top10} layout="vertical" margin={{ left: 80 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2A2F3A" />
          <XAxis type="number" stroke="#9095A1" tick={{ fontSize: 11 }} />
          <YAxis type="category" dataKey="name" stroke="#9095A1" tick={{ fontSize: 11 }} width={75} />
          <Tooltip
            contentStyle={{ background: '#1A1D23', border: '1px solid #2A2F3A' }}
            formatter={(v) => [`$${Number(v).toLocaleString()}`, 'Value']}
          />
          <Bar dataKey="portfolioValue" fill="#5865F2" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
