import React, { useState } from 'react';

export default function OrderEntry() {
  const [orderType, setOrderType] = useState('Market');
  const [symbol, setSymbol] = useState('AAPL');
  const [quantity, setQuantity] = useState('1');

  // Mock data for UI
  const price = 185.92;
  const total = (parseFloat(quantity) || 0) * price;

  return (
    <div className="bg-[#111111] border border-[#1E1E1E] rounded-lg overflow-hidden flex flex-col h-[550px]">
      <div className="px-[20px] py-[16px] border-b border-[#1E1E1E] flex items-center justify-between">
        <h2 className="text-[14px] font-medium text-white font-sans tracking-tight">Order Entry</h2>
      </div>

      <div className="p-5 flex flex-col gap-6 flex-1">
        
        {/* Symbol Input */}
        <div>
          <label className="text-[#888888] text-[11px] font-semibold uppercase tracking-wider block font-mono mb-2">Symbol</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#888888]"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </div>
            <input 
              type="text" 
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              className="w-full bg-[#0A0A0A] border border-[#1E1E1E] text-white rounded-md py-2.5 pl-10 pr-3 focus:outline-none focus:border-[#2962FF] font-mono transition-colors text-[14px]"
              placeholder="e.g. AAPL"
            />
          </div>
        </div>

        {/* Current Price Display */}
        <div className="flex justify-between items-end border border-[#1E1E1E] rounded-md bg-[#0A0A0A] p-4">
          <div>
            <div className="text-[#888888] text-[11px] font-semibold uppercase tracking-wider block font-mono mb-1">Current Price</div>
            <div className="text-[24px] font-bold text-white font-mono tracking-tight">${price.toFixed(2)}</div>
          </div>
          <div className="text-right">
            <div className="text-[#00C853] text-[13px] font-medium font-mono">+1.24 (0.67%)</div>
          </div>
        </div>

        {/* Order Type Tabs */}
        <div className="flex bg-[#0A0A0A] rounded-md p-1 border border-[#1E1E1E]">
          <button 
            className={`flex-1 py-2 text-[12px] font-medium rounded ${orderType === 'Market' ? 'bg-[#1E1E1E] text-white shadow-sm' : 'text-[#888888] hover:text-white'}`}
            onClick={() => setOrderType('Market')}
          >
            Market
          </button>
          <button 
            className={`flex-1 py-2 text-[12px] font-medium rounded ${orderType === 'Limit' ? 'bg-[#1E1E1E] text-white shadow-sm' : 'text-[#888888] hover:text-white'}`}
            onClick={() => setOrderType('Limit')}
          >
            Limit
          </button>
        </div>

        {/* Quantity */}
        <div>
          <label className="text-[#888888] text-[11px] font-semibold uppercase tracking-wider block font-mono mb-2">Quantity (Shares)</label>
          <input 
            type="number" 
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full bg-[#0A0A0A] border border-[#1E1E1E] text-white rounded-md py-2.5 px-3 focus:outline-none focus:border-[#2962FF] font-mono transition-colors text-[14px]"
            min="1"
          />
        </div>

        {/* Order Info & Buttons */}
        <div className="mt-auto pt-5 border-t border-[#1E1E1E]">
          <div className="flex justify-between mb-3">
            <span className="text-[#888888] text-[12px] uppercase font-semibold font-mono">Estimated Cost</span>
            <span className="text-white font-mono text-[14px]">${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between mb-6">
            <span className="text-[#888888] text-[12px] uppercase font-semibold font-mono">Available Balance</span>
            <span className="text-white font-mono text-[14px]">$8,050.66</span>
          </div>

          <div className="flex gap-4">
            <button className="flex-1 bg-[rgba(0,200,83,0.1)] border border-[#00C853] text-[#00C853] hover:bg-[#00C853] hover:text-white font-bold py-3 rounded-md transition-colors uppercase tracking-wider text-[13px]">
              Buy
            </button>
            <button className="flex-1 bg-[rgba(255,59,48,0.1)] border border-[#FF3B30] text-[#FF3B30] hover:bg-[#FF3B30] hover:text-white font-bold py-3 rounded-md transition-colors uppercase tracking-wider text-[13px]">
              Sell
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
