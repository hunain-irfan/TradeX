import React from 'react';

export default function RecentTransactions({ transactions }) {
  // Get top 8 recent transactions
  const recent = transactions?.slice(0, 8) || [];

  return (
    <div className="bg-[#111111] border border-[#1E1E1E] rounded-lg overflow-hidden flex flex-col h-[500px]">
      <div className="px-[20px] py-[16px] border-b border-[#1E1E1E] flex items-center justify-between">
        <h2 className="text-[14px] font-medium text-white font-sans tracking-tight">Recent Transactions</h2>
        <span className="text-[#888888] text-[11px] uppercase tracking-wider font-mono">History</span>
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
                    <div className="flex flex-col">
                      <span className="text-white font-semibold text-[13px]">{tx.stock_symbol}</span>
                      <span className="text-[#555555] text-[11px]">
                        {tx.stock_name && tx.stock_name !== tx.stock_symbol ? `${tx.stock_name} • ` : ''}
                        {new Date(tx.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium uppercase tracking-wider font-mono ${tx.action === 'BUY'
                        ? 'bg-[rgba(0,200,83,0.1)] text-[#00C853] border border-[#00C853]'
                        : 'bg-[rgba(255,59,48,0.1)] text-[#FF3B30] border border-[#FF3B30]'
                      }`}>
                      {tx.action}
                    </span>
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
  );
}
