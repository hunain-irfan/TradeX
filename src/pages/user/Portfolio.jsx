import { useEffect, useMemo, useState } from 'react'

import { useAuth } from '../../hooks/useAuth'

import { usePortfolio } from '../../hooks/usePortfolio'

import { useFinnhubSocket } from '../../hooks/useFinnhubSocket'
import { useAlertChecker } from '../../hooks/useAlertChecker'

import { sortByField } from '../../lib/dsa'

import BuySellModal from '../../components/trading/BuySellModal'

import PnLArea from '../../components/charts/PnLArea'

import { useTransactions } from '../../hooks/useTransactions'

import StockSymbolCell from '../../components/ui/StockSymbolCell'

import { PageLoader, EmptyState } from '../../components/ui/PageState'

import {

  buildSellCostBasisByTxId,

  computeRealizedPnl,

  pnlTableCellClass,

  pnlToneClass,

} from '../../lib/portfolioMetrics'



export default function Portfolio() {

  const { user, isFrozen } = useAuth()

  const { holdings, loading, refresh, updateLivePrices } = usePortfolio()

  const { transactions, loading: txLoading, refresh: refreshTx } = useTransactions()

  const [sort, setSort] = useState('value')

  const [modal, setModal] = useState(null)

  const symbols = useMemo(() => holdings.map((h) => h.symbol), [holdings])

  const { prices, loading: priceLoading } = useFinnhubSocket(symbols)
  useAlertChecker(prices)

  useEffect(() => {

    if (Object.keys(prices).length > 0) updateLivePrices(prices)

  }, [prices, updateLivePrices])

  const enriched = useMemo(() => {

    return holdings.map((h) => {

      const current = Number(h.currentPrice ?? h.buy_price)

      const invested = Number(h.quantity) * Number(h.buy_price)

      const market = Number(h.quantity) * current

      const pnl = market - invested

      const pnlPct = invested > 0 ? (pnl / invested) * 100 : 0

      return { ...h, current, invested, market, pnl, pnlPct }

    })

  }, [holdings])



  const sorted = useMemo(() => {

    if (sort === 'name') return sortByField(enriched, 'symbol', 'asc')

    if (sort === 'profit') return sortByField(enriched, 'pnl', 'desc')

    if (sort === 'loss') return sortByField(enriched, 'pnl', 'asc')

    return sortByField(enriched, 'market', 'desc')

  }, [enriched, sort])



  const totalValue = enriched.reduce((s, h) => s + h.market, 0)

  const totalInvested = enriched.reduce((s, h) => s + h.invested, 0)

  const unrealizedPnl = totalValue - totalInvested

  const sellCostBasis = useMemo(

    () => buildSellCostBasisByTxId(transactions),

    [transactions],

  )



  const txWithPnl = useMemo(

    () =>

      transactions.map((tx) => {

        const pnl = computeRealizedPnl(tx, sellCostBasis)

        return { ...tx, realizedPnl: pnl == null ? null : pnl }

      }),

    [transactions, sellCostBasis],

  )



  const handleSuccess = () => {

    refresh()

    refreshTx()

    setModal(null)

  }



  const pageLoading = loading || txLoading



  return (

    <div className="container pt-6 pb-16 space-y-6">

      {pageLoading ? (

        <PageLoader />

      ) : (

        <>

          <div className="flex flex-wrap items-center justify-between gap-2">

            <h1 className="text-2xl font-bold text-white">Portfolio</h1>

            {priceLoading && (

              <span className="text-gray-500 text-sm">Updating live prices…</span>

            )}

          </div>



          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            <div className="bg-[#111111] border border-[#1E1E1E] rounded-lg p-4">

              <span className="text-[#666666] text-[11px] font-semibold uppercase tracking-wider block font-mono">

                Total Value

              </span>

              <span className="text-[24px] font-bold text-white block mt-1 font-mono tracking-tight">

                ${totalValue.toFixed(2)}

              </span>

            </div>

            <div className="bg-[#111111] border border-[#1E1E1E] rounded-lg p-4">

              <span className="text-[#666666] text-[11px] font-semibold uppercase tracking-wider block font-mono">

                Total Invested

              </span>

              <span className="text-[24px] font-bold text-white block mt-1 font-mono tracking-tight">

                ${totalInvested.toFixed(2)}

              </span>

            </div>

            <div className="bg-[#111111] border border-[#1E1E1E] rounded-lg p-4">

              <span className="text-[#666666] text-[11px] font-semibold uppercase tracking-wider block font-mono">

                Unrealized P&L

              </span>

              <span

                className={`text-[24px] font-bold block mt-1 font-mono tracking-tight ${pnlToneClass(unrealizedPnl, { zeroClass: 'text-gray-400' })}`}

              >

                {unrealizedPnl >= 0 ? '▲ ' : '▼ '}

                ${Math.abs(unrealizedPnl).toFixed(2)}

              </span>

            </div>

          </div>



          <div className="flex gap-2 flex-wrap items-center">

            <span className="text-[#555555] text-xs font-semibold uppercase font-mono mr-2">

              Sort by:

            </span>

            {['name', 'profit', 'loss', 'value'].map((s) => {

              const isActive = sort === s

              return (

                <button

                  key={s}

                  type="button"

                  className={`h-8 px-4 text-xs font-semibold rounded-full tracking-wider uppercase transition-all duration-150 ${

                    isActive

                      ? 'bg-white text-[#222222]'

                      : 'bg-transparent text-gray-400 hover:text-white border border-[#1E1E1E] hover:bg-[#161616]'

                  }`}

                  onClick={() => setSort(s)}

                >

                  {s === 'name'

                    ? 'Name'

                    : s === 'profit'

                      ? 'Profit'

                      : s === 'loss'

                        ? 'Loss'

                        : 'Value'}

                </button>

              )

            })}

          </div>



          <div className="bg-[#111111] border border-[#1E1E1E] rounded-lg overflow-hidden">

            <div className="overflow-x-auto">

              <table className="holdings-table w-full">

                <thead>

                  <tr className="border-b border-[#222222]">

                    <th className="py-3 px-4 font-mono text-[11px] text-[#555555] uppercase !text-left">

                      Stock

                    </th>

                    <th className="py-3 px-4 font-mono text-[11px] text-[#555555] uppercase !text-right">

                      Qty

                    </th>

                    <th className="py-3 px-4 font-mono text-[11px] text-[#555555] uppercase !text-right">

                      Avg Buy

                    </th>

                    <th className="py-3 px-4 font-mono text-[11px] text-[#555555] uppercase !text-right">

                      Total Buy

                    </th>

                    <th className="py-3 px-4 font-mono text-[11px] text-[#555555] uppercase !text-right">

                      Current

                    </th>

                    <th className="py-3 px-4 font-mono text-[11px] text-[#555555] uppercase !text-right">

                      P&L

                    </th>

                    <th className="py-3 px-4 font-mono text-[11px] text-[#555555] uppercase !text-right">

                      P&L%

                    </th>

                    <th className="py-3 px-4 font-mono text-[11px] text-[#555555] uppercase !text-right">

                      Actions

                    </th>

                  </tr>

                </thead>

                <tbody>

                  {sorted.length === 0 ? (

                    <tr>

                      <td colSpan="7" className="py-8 border-none">

                        <EmptyState

                          title="No holdings"

                          message="Search stocks and buy shares to build your portfolio."

                        />

                      </td>

                    </tr>

                  ) : (

                    sorted.map((h) => (

                      <tr

                        key={h.symbol}

                        className="border-b border-[#111111]/30 hover:bg-[#161616] h-[52px]"

                      >

                        <td className="py-3 px-4">

                          <StockSymbolCell symbol={h.symbol} name={h.stock_name} />

                        </td>

                        <td className="py-3 px-4 !text-right font-mono text-sm text-white whitespace-nowrap">

                          {h.quantity}

                        </td>

                        <td className="py-3 px-4 !text-right font-mono text-sm text-gray-300 whitespace-nowrap">

                          ${Number(h.buy_price).toFixed(2)}

                        </td>

                        <td className="py-3 px-4 !text-right font-mono text-sm text-gray-300 whitespace-nowrap">

                          ${h.invested.toFixed(2)}

                        </td>

                        <td className="py-3 px-4 !text-right font-mono text-sm text-white whitespace-nowrap">

                          ${h.current.toFixed(2)}

                        </td>

                        <td

                          className={`py-3 px-4 !text-right font-mono text-sm font-semibold whitespace-nowrap ${pnlTableCellClass(h.pnl)}`}

                        >

                          {h.pnl > 0 ? '▲ ' : h.pnl < 0 ? '▼ ' : ''}${Math.abs(h.pnl).toFixed(2)}

                        </td>

                        <td

                          className={`py-3 px-4 !text-right font-mono text-sm font-semibold whitespace-nowrap ${pnlTableCellClass(h.pnlPct)}`}

                        >

                          {h.pnlPct > 0 ? '▲ ' : h.pnlPct < 0 ? '▼ ' : ''}

                          {Math.abs(h.pnlPct).toFixed(2)}%

                        </td>

                        <td className="py-3 px-4 !text-right">

                          <div className="flex gap-2 justify-end">

                            <button

                              type="button"

                              className="h-[28px] px-3 bg-transparent text-[#2962FF] hover:bg-[#2962FF]/10 text-xs font-semibold rounded-sm border border-transparent transition-all duration-150"

                              onClick={() =>

                                setModal({ mode: 'buy', symbol: h.symbol, name: h.stock_name })

                              }

                            >

                              Buy

                            </button>

                            <button

                              type="button"

                              className="h-[28px] px-3 bg-transparent text-[#FF3B30] hover:bg-[#FF3B30]/10 text-xs font-semibold rounded-sm border border-[#FF3B30]/30 hover:border-[#FF3B30] transition-all duration-150"

                              onClick={() =>

                                setModal({

                                  mode: 'sell',

                                  symbol: h.symbol,

                                  name: h.stock_name,

                                  maxQty: h.quantity,

                                  avgBuy: h.buy_price,

                                })

                              }

                            >

                              Sell

                            </button>

                          </div>

                        </td>

                      </tr>

                    ))

                  )}

                </tbody>

              </table>

            </div>

          </div>



          <PnLArea transactions={txWithPnl} />

        </>

      )}



      <BuySellModal

        open={!!modal}

        onClose={() => setModal(null)}

        mode={modal?.mode}

        symbol={modal?.symbol}

        stockName={modal?.name}

        userId={user?.id}

        maxQuantity={modal?.maxQty}

        avgBuyPrice={modal?.avgBuy}

        onSuccess={handleSuccess}

        isFrozen={isFrozen}

      />

    </div>

  )

}


