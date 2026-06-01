import { useEffect, useState } from 'react'

import { useParams } from 'react-router-dom'

import { useAuth } from '../../hooks/useAuth'

import { useFinnhub } from '../../hooks/useFinnhub'

import { usePortfolio } from '../../hooks/usePortfolio'

import { getCompanyNews } from '../../lib/finnhub'

import { STOCK_LIST } from '../../data/stocks'

import { supabase } from '../../lib/supabase'

import AdvancedChart from '../../components/tradingview/AdvancedChart'

import SymbolInfo from '../../components/tradingview/SymbolInfo'

import FundamentalData from '../../components/tradingview/FundamentalData'

import CompanyProfile from '../../components/tradingview/CompanyProfile'

import BuySellModal from '../../components/trading/BuySellModal'
import WatchlistStarButton from '../../components/trading/WatchlistStarButton'
import PriceAlertModal from '../../components/alerts/PriceAlertModal'
import { Bell } from '../../lib/navIcons'

import { PageLoader, PageError, EmptyState } from '../../components/ui/PageState'



const SYMBOL_INFO_HEIGHT = 178

const CHART_HEIGHT = 535

const SIDEBAR_TV_HEIGHT = 460

/** News card — same slot as former Company Profile on sidebar */

const NEWS_FEED_HEIGHT = 440

/** Company Profile — below chart on the left */

const PROFILE_HEIGHT = 334



export default function StockDetail() {

  const { symbol } = useParams()

  const { user, isFrozen } = useAuth()

  const { holdings, refresh } = usePortfolio()

  const { loading, error } = useFinnhub(symbol ? [symbol] : [], 30000)



  const [news, setNews] = useState([])

  const [newsLoading, setNewsLoading] = useState(true)

  const [newsError, setNewsError] = useState(null)



  const [modal, setModal] = useState(null)
  const [alertOpen, setAlertOpen] = useState(false)



  const [inWatchlist, setInWatchlist] = useState(false)

  const [watchlistLoading, setWatchlistLoading] = useState(false)



  const stock = STOCK_LIST.find((s) => s.symbol === symbol)

  const holding = holdings.find((h) => h.symbol === symbol)



  useEffect(() => {

    if (!user || !symbol) return

    supabase

      .from('watchlist')

      .select('id')

      .eq('user_id', user.id)

      .eq('stock_symbol', symbol)

      .maybeSingle()

      .then(({ data }) => {

        setInWatchlist(!!data)

      })

  }, [user, symbol])



  const toggleWatchlist = async () => {

    if (!user || !symbol) return

    setWatchlistLoading(true)

    if (inWatchlist) {

      const { error: err } = await supabase

        .from('watchlist')

        .delete()

        .eq('user_id', user.id)

        .eq('stock_symbol', symbol)

      if (!err) setInWatchlist(false)

    } else {

      const { error: err } = await supabase.from('watchlist').insert({

        user_id: user.id,

        stock_symbol: symbol,

        stock_name: stock?.name ?? symbol,

      })

      if (!err) setInWatchlist(true)

    }

    setWatchlistLoading(false)

  }



  useEffect(() => {

    if (!symbol) return

    setNewsLoading(true)

    getCompanyNews(symbol)

      .then((data) => {

        setNews(Array.isArray(data) ? data.slice(0, 8) : [])

        setNewsError(null)

      })

      .catch((err) => setNewsError(err.message))

      .finally(() => setNewsLoading(false))

  }, [symbol])



  if (loading) return <div className="container pt-12"><PageLoader /></div>

  if (error) return <div className="container pt-12"><PageError message={error} /></div>



  return (

    <div className="container pt-6 pb-20 font-tv">

      <div className="flex flex-col lg:flex-row gap-6 items-stretch">



        {/* Left: symbol, chart, company profile */}

        <div className="w-full lg:w-[64%] shrink-0 flex flex-col gap-6">

          <div className="bg-[#111111] p-4 border border-[3px] border-[#1E1E1E] rounded-lg overflow-hidden relative shrink-0">

            <SymbolInfo symbol={symbol} height={SYMBOL_INFO_HEIGHT} />

            <WatchlistStarButton
              className="absolute top-4.5 right-4.5 z-10"
              inWatchlist={inWatchlist}
              loading={watchlistLoading}
              onClick={toggleWatchlist}
            />

          </div>



          <div className="bg-[#111111] border border-[#1E1E1E] rounded-lg overflow-hidden shrink-0">

            <AdvancedChart symbol={symbol} height={CHART_HEIGHT} />

          </div>



          <div className="bg-[#111111] border border-[#1E1E1E] rounded-lg overflow-hidden shrink-0">

            <CompanyProfile symbol={symbol} height={PROFILE_HEIGHT} />

          </div>

        </div>



        {/* Right: orders, financials, news feed */}

        <div className="w-full lg:w-[34.5%] shrink-0 flex flex-col gap-6">

          <div className="bg-[#111111] border border-[3px] border-[#1E1E1E] rounded-lg p-5 space-y-3 shrink-0 border-[3px]">

            <button

              type="button"

              className="primary-btn w-full font-bold !h-12 tracking-wider uppercase !text-[12px]"
         

              onClick={() => setModal({ mode: 'buy' })}

            >

              Execute Buy Order

            </button>

            <button

              type="button"

              className="secondary-btn w-full font-bold !h-12 tracking-wider uppercase text-red-500 hover:text-red-400 border-red-500/20 hover:border-red-500/50 !text-[12px]"

              onClick={() => setModal({ mode: 'sell', maxQty: holding?.quantity })}

              disabled={!holding}

            >

              Execute Sell Order {holding && `(${holding.quantity} Held)`}

            </button>

            <button
              type="button"
              className="secondary-btn w-full font-bold !h-12 tracking-wider uppercase !text-[12px] text-primary-400 border-primary-500/30 hover:border-primary-500/50 hover:bg-primary-500/10 flex items-center justify-center gap-2"
              onClick={() => setAlertOpen(true)}
            >
              <Bell className="w-4 h-4" strokeWidth={2} />
              Create Price Alert
            </button>

          </div>



          <div className="bg-[#111111] border border-[#1E1E1E] rounded-lg overflow-hidden shrink-0">

            <FundamentalData symbol={symbol} height={SIDEBAR_TV_HEIGHT} />

          </div>



          <div

            className="bg-[#111111] border border-[#1E1E1E] border-[3px] rounded-lg p-5 flex flex-col overflow-hidden shrink-0"

            style={{ height: NEWS_FEED_HEIGHT, minHeight: NEWS_FEED_HEIGHT }}

          >

            <h3 className="tv-widget-title mb-4 shrink-0">

              <span>Recent</span> News Feed

            </h3>



            {newsLoading && <PageLoader />}

            {newsError && <PageError message={newsError} />}

            {!newsLoading && !newsError && news.length === 0 && (

              <EmptyState title="No articles" message="No recent company news." />

            )}



            {!newsLoading && !newsError && news.length > 0 && (

              <div className="space-y-3 divide-y divide-[#1E1E1E]/40 overflow-y-auto flex-1 min-h-0 scrollbar-hide-default pr-1">

                {news.map((item, idx) => (

                  <a

                    key={item.id ?? item.url}

                    href={item.url}

                    target="_blank"

                    rel="noreferrer"

                    className={`block hover:opacity-85 ${idx === 0 ? 'pt-0 border-none' : 'pt-3'}`}

                  >

                    <div className="flex justify-between items-center text-[10image.pngpx] text-gray-500 font-semibold uppercase gap-2">

                      <span className="truncate">{item.source}</span>

                      <span className="shrink-0">

                        {new Date(item.datetime * 1000).toLocaleTimeString([], {

                          hour: '2-digit',

                          minute: '2-digit',

                        })}

                      </span>

                    </div>

                    <h4 className="text-[#dbdbdb] text-[13px] font-semibold mt-1 leading-snug line-clamp-2 hover:text-white">

                      {item.headline}

                    </h4>

                  </a>

                ))}

              </div>

            )}

          </div>

        </div>



      </div>



      <PriceAlertModal
        open={alertOpen}
        onClose={() => setAlertOpen(false)}
        userId={user?.id}
        stockSymbol={symbol}
        stockName={stock?.name ?? symbol}
      />

      <BuySellModal

        open={!!modal}

        onClose={() => setModal(null)}

        mode={modal?.mode}

        symbol={symbol}

        stockName={stock?.name ?? symbol}

        userId={user?.id}

        maxQuantity={modal?.maxQty}

        avgBuyPrice={holding?.buy_price}

        onSuccess={refresh}

        isFrozen={isFrozen}

      />

    </div>

  )

}


