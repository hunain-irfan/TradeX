import StockSymbolCell from '../ui/StockSymbolCell'
import Badge from '../ui/Badge'

export default function RecentTransactions({ transactions }) {
  const recent = transactions?.slice(0, 8) || []

  return (
    <div className="bg-[#111111] border border-[#1E1E1E] rounded-lg overflow-hidden flex flex-col h-[500px]">
      <div className="px-5 pt-5 pb-4 border-b border-[#1E1E1E]">
        <h3 className="text-[#888888] uppercase tracking-wider text-xs font-semibold font-mono">
          Recent Transactions
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto">
        {recent.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[#888888] text-[13px] font-mono">
            No recent transactions
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-[#111111] border-b border-[#1E1E1E] z-10">
              <tr>
                <th className="px-4 py-3 text-[11px] font-semibold text-[#666666] uppercase tracking-wider font-mono">Asset</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-[#666666] uppercase tracking-wider font-mono">Type</th>
                <th className="px-4 py-3 text-[11px] font-semibold text-[#666666] uppercase tracking-wider font-mono text-right">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E1E1E]">
              {recent.map((tx) => (
                <tr key={tx.id} className="hover:bg-[#161616] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-between gap-2">
                      <StockSymbolCell
                        symbol={tx.stock_symbol}
                        name={tx.stock_name}
                        showName={!!tx.stock_name && tx.stock_name !== tx.stock_symbol}
                      />
                      <span className="text-[#555555] text-[11px] font-mono shrink-0">
                        {new Date(tx.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={tx.action === 'BUY' ? 'buy' : 'sell'}>{tx.action}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex flex-col items-end">
                      <span className="text-white font-mono text-[13px]">${Number(tx.price).toFixed(2)}</span>
                      <span className="text-[#888888] text-[11px] font-mono">{tx.quantity} shs</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
