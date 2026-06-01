import { useState, useEffect, useRef } from 'react'
import { Sun, Moon, Sunrise, Clock } from 'lucide-react'

export default function MarketStatus() {
  const [open, setOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState(getTimes())
  const containerRef = useRef(null)

  function getTimes() {
    const now = new Date()
    const nyString = now.toLocaleString('en-US', { timeZone: 'America/New_York' })
    const nyDate = new Date(nyString)
    const pktString = now.toLocaleString('en-US', { timeZone: 'Asia/Karachi' })
    const pktDate = new Date(pktString)
    return { nyDate, pktDate }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(getTimes())
    }, 15000) // update clock every 15s
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const { nyDate, pktDate } = currentTime
  const day = nyDate.getDay()
  const hrs = nyDate.getHours()
  const mins = nyDate.getMinutes()
  const currentMin = hrs * 60 + mins

  const PRE_START = 4 * 60 // 4:00 AM
  const REG_START = 9 * 60 + 30 // 9:30 AM
  const POST_START = 16 * 60 // 4:00 PM
  const POST_END = 20 * 60 // 8:00 PM

  let status = 'Closed'
  let title = 'Closed'
  let description = ''
  let colorClass = 'bg-red-500'
  let toneClass = 'text-red-400'
  let Icon = Moon
  const isWeekend = day === 0 || day === 6

  const diffTime = (targetMin) => {
    const diff = targetMin - currentMin
    const h = Math.floor(diff / 60)
    const m = diff % 60
    return { h, m }
  }

  if (isWeekend) {
    status = 'Closed'
    title = 'Market Closed'
    colorClass = 'bg-red-500/80'
    toneClass = 'text-red-400'
    Icon = Moon

    // Mon 4:00 AM NY
    const daysToWait = day === 0 ? 1 : 2
    const totalMinLeft = (daysToWait * 24 * 60 - currentMin) + PRE_START
    const h = Math.floor(totalMinLeft / 60)
    const m = totalMinLeft % 60
    description = `Weekend. NYSE/NASDAQ closed. Pre-market opens in ${h}h ${m}m (Monday).`
  } else {
    if (currentMin < PRE_START) {
      status = 'Closed'
      title = 'Market Closed'
      colorClass = 'bg-red-500/80'
      toneClass = 'text-red-400'
      Icon = Moon
      const { h, m } = diffTime(PRE_START)
      description = `Overnight. Trading closed. Pre-market session opens in ${h}h ${m}m.`
    } else if (currentMin < REG_START) {
      status = 'Pre-market'
      title = 'Pre-Market Open'
      colorClass = 'bg-amber-500'
      toneClass = 'text-amber-400'
      Icon = Sunrise
      const { h, m } = diffTime(REG_START)
      description = `Morning. Pre-market trading is active. Regular market session opens in ${h}h ${m}m.`
    } else if (currentMin < POST_START) {
      status = 'Open'
      title = 'Regular Session'
      colorClass = 'bg-emerald-500'
      toneClass = 'text-emerald-400'
      Icon = Sun
      const { h, m } = diffTime(POST_START)
      description = `Day. Regular market is open for trading. Regular session will close in ${h}h ${m}m.`
    } else if (currentMin < POST_END) {
      status = 'Post-market'
      title = 'Post-Market Open'
      colorClass = 'bg-sky-500'
      toneClass = 'text-sky-400'
      Icon = Moon // standard icon for post-market
      const { h, m } = diffTime(POST_END)
      description = `Evening. Post-market trading is active. Post-market session will close in ${h}h ${m}m.`
    } else {
      status = 'Closed'
      title = 'Market Closed'
      colorClass = 'bg-red-500/80'
      toneClass = 'text-red-400'
      Icon = Moon
      
      const daysToWait = day === 5 ? 3 : 1
      const totalMinLeft = (daysToWait * 24 * 60 - currentMin) + PRE_START
      const h = Math.floor(totalMinLeft / 60)
      const m = totalMinLeft % 60
      description = `Night. Trading closed. Pre-market session opens in ${h}h ${m}m${day === 5 ? ' (Monday)' : ''}.`
    }
  }

  const daysShort = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
  const currentDayName = daysShort[day]

  const nyTimeStr = nyDate.toLocaleDateString('en-US', { weekday: 'short' }) + ' ' + nyDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
  const pktTimeStr = pktDate.toLocaleDateString('en-US', { weekday: 'short' }) + ' ' + pktDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-gray-800 border border-gray-600 hover:bg-gray-700 hover:border-gray-500 transition-all cursor-pointer select-none text-[11px] font-mono font-medium text-gray-300"
      >
        <span className={`w-2 h-2 rounded-full ${colorClass} shrink-0`} />
        <span>{status}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2.5 w-[330px] bg-gray-800 border border-gray-600 rounded-lg shadow-xl p-5 z-50 text-left font-sans select-none animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2.5">
            <Icon className={`w-5 h-5 ${toneClass} shrink-0`} />
            <span className="text-sm font-bold text-white tracking-wide">{title}</span>
          </div>

          {/* Description */}
          <p className="text-[12px] text-gray-400 leading-relaxed mb-4 font-normal">
            {description}
          </p>

          {/* Timeline Wrapper */}
          <div className="relative mb-6.5 mt-2 px-0.5">
            <div className="flex gap-[3px] h-2.5 rounded-full overflow-hidden bg-gray-900/60">
              {/* 00:00 - 04:00 (Closed) */}
              <div className="w-[16.67%] bg-gray-700/30" title="Closed (00:00 - 04:00)" />
              {/* 04:00 - 09:30 (Pre-market) */}
              <div className={`w-[22.92%] ${isWeekend ? 'bg-gray-700/30' : 'bg-amber-500/60'}`} title="Pre-market (04:00 - 09:30)" />
              {/* 09:30 - 16:00 (Regular Session) */}
              <div className={`w-[27.08%] ${isWeekend ? 'bg-gray-700/30' : 'bg-emerald-500/70'}`} title="Regular Session (09:30 - 16:00)" />
              {/* 16:00 - 20:00 (Post-market) */}
              <div className={`w-[16.67%] ${isWeekend ? 'bg-gray-700/30' : 'bg-sky-500/70'}`} title="Post-market (16:00 - 20:00)" />
              {/* 20:00 - 24:00 (Closed) */}
              <div className="w-[16.67%] bg-gray-700/30" title="Closed (20:00 - 24:00)" />
            </div>

            {/* Current Position Marker */}
            {!isWeekend && (
              <div
                className="absolute top-[-2px] bottom-[-2px] w-[2px] bg-white pointer-events-none"
                style={{ left: `${(currentMin / 1440) * 100}%` }}
              >
                <div className="absolute -top-1 -left-1.5 w-3.5 h-3.5 rounded-full bg-white border border-gray-900 shadow-md flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                </div>
              </div>
            )}

            {/* Timeline Tick Labels */}
            <div className="absolute top-full mt-2.5 left-0 right-0 flex justify-between text-[10px] text-gray-500 font-mono">
              <span className="font-semibold text-gray-400">{currentDayName}</span>
              <span style={{ position: 'absolute', left: '66.67%', transform: 'translateX(-50%)' }}>16:00</span>
              <span style={{ position: 'absolute', left: '83.33%', transform: 'translateX(-50%)' }}>20:00</span>
            </div>
          </div>

          {/* Timezone Info */}
          <div className="border-t border-gray-600/40 my-3.5 pt-3.5 space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500 font-medium">New York (EST/EDT)</span>
              <span className="font-mono text-gray-300 font-semibold">{nyTimeStr}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500 font-medium">Pakistan (PKT)</span>
              <span className="font-mono text-gray-300 font-semibold">{pktTimeStr}</span>
            </div>
          </div>

          <div className="text-[10px] text-gray-400 font-mono text-center mt-2.5">
            Exchange Timezone: New York (UTC-4 / UTC-5)
          </div>
        </div>
      )}

    </div>
  )
}
