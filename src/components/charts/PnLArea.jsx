import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

export default function PnLArea({ transactions = [] }) {
  let cumulative = 0
  const data = transactions
    .slice()
    .reverse()
    .map((tx, i) => {
      if (tx.action === 'SELL' && tx.realizedPnl != null) {
        cumulative += Number(tx.realizedPnl)
      }
      return {
        label: new Date(tx.created_at).toLocaleDateString(undefined, { month: '2-digit', day: '2-digit' }),
        pnl: cumulative,
        idx: i,
      }
    })

  if (data.length === 0) {
    return (
      <div className="bg-[#111111] border border-[#1E1E1E] rounded-lg p-5 flex items-center justify-center py-12 text-[#555555] text-xs font-mono uppercase">
        No realized P&L history available
      </div>
    )
  }

  return (
    <div className="bg-[#111111] border border-[#1E1E1E] rounded-lg p-5">
      <h3 className="text-[#888888] uppercase tracking-wider text-xs font-semibold font-mono mb-6">
        Cumulative Realized P&L
      </h3>
      
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="pnlGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2962FF" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#2962FF" stopOpacity={0.0}/>
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="label" 
            stroke="#333333" 
            tick={{ fontSize: 10, fontFamily: 'Roboto Mono, monospace', fill: '#555555' }} 
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            stroke="#333333" 
            tick={{ fontSize: 10, fontFamily: 'Roboto Mono, monospace', fill: '#555555' }} 
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: '#111111',
              border: '1px solid #1E1E1E',
              borderRadius: '8px',
              padding: '8px 12px',
            }}
            itemStyle={{
              color: '#FFFFFF',
              fontSize: '12px',
              fontFamily: 'Inter, sans-serif',
            }}
            labelStyle={{
              color: '#888888',
              fontSize: '10px',
              fontFamily: 'Roboto Mono, monospace',
              marginBottom: '4px',
            }}
            formatter={(v) => [`$${Number(v).toFixed(2)}`, 'P&L']}
          />
          <Area 
            type="monotone" 
            dataKey="pnl" 
            stroke="#2962FF" 
            strokeWidth={2}
            fill="url(#pnlGradient)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
