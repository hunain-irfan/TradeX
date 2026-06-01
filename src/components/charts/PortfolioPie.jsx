import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

const COLORS = [
  '#2779BD', // Corporate Blue
  '#38A89D', // Muted Teal
  '#9561E2', // Elegant Violet
  '#F66D9B', // Deep Rose
  '#F6993F', // Corporate Amber
  '#4F758C', // Steel Blue
  '#6574CD', // Muted Indigo
  '#1C3D5A', // Navy Slate
]

export default function PortfolioPie({ holdings = [] }) {
  const data = holdings
    .map((h) => ({
      name: h.symbol,
      value: Number(h.quantity) * Number(h.currentPrice ?? h.buy_price ?? 0),
    }))
    .filter((d) => d.value > 0)

  if (data.length === 0) {
    return (
      <div className="bg-[#111111] border border-[#1E1E1E] rounded-lg p-5 h-full min-h-[320px] flex items-center justify-center text-[#555555] text-xs uppercase font-mono">
        No portfolio allocation data
      </div>
    )
  }

  return (
    <div className="bg-[#111111] border border-[#1E1E1E] rounded-lg p-5 h-full min-h-[320px] flex flex-col justify-between">
      <div>
        <h3 className="text-[#888888] uppercase tracking-wider text-xs font-semibold font-mono mb-6">Portfolio Allocation</h3>
      </div>
      
      <div className="flex-1 flex items-center justify-center">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={75}
              stroke="#111111"
              strokeWidth={2}
              paddingAngle={2}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#111111',
                border: '1px solid #1E1E1E',
                borderRadius: '8px',
                padding: '8px 12px',
              }}
              itemStyle={{
                color: '#FFFFFF',
                fontSize: '12px',
                fontFamily: 'Inter, sans-serif',
              }}
              labelStyle={{ display: 'none' }}
              formatter={(v) => [`$${Number(v).toFixed(2)}`]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 justify-center">
        {data.map((d, i) => (
          <div key={d.name} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-sm block"
              style={{ backgroundColor: COLORS[i % COLORS.length] }}
            />
            <span className="text-white text-xs font-mono font-semibold">{d.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
