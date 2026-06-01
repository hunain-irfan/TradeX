import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle,
  ArrowRight,
  BarChart2,
  BarChart3,
  Lightbulb,
  Menu,
  Minus,
  Plus,
  Sparkles,
  X,
} from 'lucide-react'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'

const PAGE_STYLES = `
  .homepage-landing .text-gray-400 {
    color: #99a1af;
  }

  .section-shell {
    margin-left: auto;
    margin-right: auto;
    max-width: 80rem;
    padding: 5rem 1.5rem;
  }

  .section-block {
    margin-bottom: 3rem;
  }

  .section-title {
    font-size: 1.875rem;
    line-height: 1.15;
    font-weight: 800;
    letter-spacing: -0.025em;
    color: #0b0f19;
  }

  .section-title-lg {
    font-size: 1.875rem;
    line-height: 1.2;
    font-weight: 800;
    letter-spacing: -0.025em;
    color: #0b0f19;
  }

  .btn-md {
    display: inline-flex;
    height: 2.75rem;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    border-radius: 9999px;
    padding-left: 1.25rem;
    padding-right: 1.25rem;
    font-size: 0.875rem;
    font-weight: 700;
    transition: box-shadow 300ms ease-out, background-color 300ms ease-out, color 300ms ease-out;
  }

  .btn-cta {
    position: relative;
    display: inline-flex;
    height: 2.75rem;
    align-items: center;
    overflow: hidden;
    border-radius: 9999px;
    padding-left: 1.25rem;
    padding-right: 0.375rem;
    font-size: 0.875rem;
    font-weight: 700;
    transition: box-shadow 300ms ease-out, background-color 300ms ease-out;
  }

  .btn-cta-icon {
    margin-left: 0.625rem;
    display: flex;
    height: 2rem;
    width: 2rem;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    border-radius: 9999px;
    transition: all 300ms ease-out;
  }

  .btn-ghost {
    display: inline-flex;
    height: 2.5rem;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    border-radius: 9999px;
    padding-left: 1rem;
    padding-right: 1rem;
    font-size: 0.75rem;
    font-weight: 700;
    transition: color 200ms, background-color 200ms, border-color 200ms;
  }

  .problems-slider .swiper-wrapper {
    align-items: stretch;
  }

  .problems-slider .swiper-slide {
    height: auto;
    display: flex;
  }

  @media (min-width: 768px) {
    .section-shell {
      padding-top: 6rem;
      padding-bottom: 6rem;
    }

    .section-block {
      margin-bottom: 3.5rem;
    }

    .section-title {
      font-size: 2.25rem;
    }

    .section-title-lg {
      font-size: 2.75rem;
    }
  }
`

function PageStyles() {
  return <style>{PAGE_STYLES}</style>
}

/** Section label chip — pill style, icon + uppercase label */
function SectionBadge({ icon: Icon, children, className = '' }) {
  return (
    <span
      className={`inline-flex w-fit items-center gap-2 rounded-md bg-blue-50 px-3 py-1.5 text-[11px] font-extrabold tracking-[0.12em] text-brand uppercase md:text-xs ${className}`}
    >
      {Icon && <Icon className="h-3.5 w-3.5 shrink-0 stroke-[2.5]" aria-hidden />}
      {children}
    </span>
  )
}

/**
 * Badge → title: explicit margin (not flex gap) so spacing stays consistent
 * with large heading line-heights.
 */
function SectionHeader({
  badge,
  title,
  align = 'left',
  className = '',
  children,
}) {
  const alignClass =
    align === 'center'
      ? 'items-center text-center'
      : align === 'right'
        ? 'items-end text-right'
        : 'items-start'

  return (
    <div className={`flex flex-col ${alignClass} ${className}`}>
      {badge && (
        <SectionBadge icon={badge.icon} className={align === 'center' ? '' : 'self-start'}>
          {badge.label}
        </SectionBadge>
      )}
      {title && (
        <h2
          className={`section-title max-w-xl ${badge ? 'mt-5 md:mt-6' : ''} ${
            align === 'center' ? 'mx-auto' : ''
          }`}
        >
          {title}
        </h2>
      )}
      {children && <div className="mt-6 w-full">{children}</div>}
    </div>
  )
}

const skins = {
  hero: {
    wrap: 'bg-white text-brand shadow-[0_4px_20px_rgba(0,0,0,0.12)] hover:shadow-[0_8px_28px_rgba(0,0,0,0.16)]',
    icon: 'bg-brand text-white group-hover:bg-ink',
    shine: 'via-white/30',
  },
  dark: {
    wrap: 'bg-ink text-white shadow-sm hover:bg-black hover:shadow-md',
    icon: 'bg-white/15 text-white group-hover:bg-white/25',
    shine: 'via-white/10',
  },
  light: {
    wrap: 'bg-white text-ink shadow-md hover:shadow-lg',
    icon: 'bg-ink text-white group-hover:bg-brand',
    shine: 'via-white/40',
  },
  footer: {
    wrap: 'bg-white text-ink shadow-md hover:shadow-lg',
    icon: 'bg-ink text-white group-hover:bg-brand',
    shine: 'via-white/40',
  },
}

function CTAButton({ href, children, variant = 'dark', className = '' }) {
  const skin = skins[variant] ?? skins.dark
  const isInternalRoute = href?.startsWith('/')
  const Component = isInternalRoute ? Link : 'a'
  const navigationProps = isInternalRoute ? { to: href } : { href }

  return (
    <Component {...navigationProps} className={`btn-cta group ${skin.wrap} ${className}`}>
      <span className="relative z-10 leading-none">{children}</span>
      <span className={`btn-cta-icon relative z-10 ${skin.icon}`}>
        <ArrowRight
          className="h-3.5 w-3.5 transition-transform duration-300 ease-out group-hover:translate-x-0.5"
          strokeWidth={2.5}
          aria-hidden
        />
      </span>
      <span
        className={`absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent ${skin.shine} to-transparent transition-transform duration-500 ease-out group-hover:translate-x-full`}
        aria-hidden
      />
    </Component>
  )
}

function SparkleDecor({ className = '' }) {
  return (
    <svg
      className={`absolute -left-14 -top-10 hidden h-12 w-12 text-lime md:block ${className}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
      />
    </svg>
  )
}

function ArrowDecor({ className = '' }) {
  return (
    <svg
      className={`absolute -right-16 bottom-2 hidden h-14 w-14 text-lime md:block ${className}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  )
}

function ScrollArrow() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  )
}

function FaqChevron({ active }) {
  return (
    <svg
      className={`h-5 w-5 shrink-0 ${active ? 'text-lime' : 'text-gray-400'}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2.5"
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  )
}

function InlineSparkle() {
  return (
    <Sparkles
      className="mx-0.5 inline-block h-[1em] w-[1em] align-[-0.15em] text-brand"
      strokeWidth={2.25}
      aria-hidden
    />
  )
}

function InlineX() {
  return (
    <X
      className="mx-0.5 inline-block h-[1em] w-[1em] align-[-0.15em] text-lime"
      strokeWidth={2.75}
      aria-hidden
    />
  )
}

function BrandMarks() {
  return (
    <span className="inline-flex items-center gap-1 align-middle">
      <Sparkles className="h-5 w-5 text-lime" strokeWidth={2} aria-hidden />
      <X className="h-5 w-5 text-lime" strokeWidth={2.75} aria-hidden />
    </span>
  )
}

function HeroSection() {
  const { user, isAdmin } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const appPath = user ? (isAdmin ? '/admin' : '/dashboard') : '/login'
  const navCtaText = user ? 'Open App' : 'Login'

  return (
    <section className="relative flex h-[93vh] items-center justify-center overflow-hidden rounded-b-[48px] bg-brand px-4 text-white md:px-6">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent opacity-10" />

      <nav className="absolute left-4 right-4 top-5 z-20 mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 rounded-lg border border-white/25 bg-white/18 px-4 py-2.5 shadow-[0_10px_30px_rgba(0,36,145,0.18)] backdrop-blur-xl sm:px-4 md:left-6 md:right-6">
        <div>
          <img src="/logo.png" alt="TradeX" className="h-7 w-auto" />
        </div>

        <div className="hidden items-center gap-7 text-sm font-semibold text-white/80 md:flex mt-1">
          <a href="#features" className="transition-colors hover:text-white">Features</a>
          <a href="#problem" className="transition-colors hover:text-white">Why Us</a>
          <a href="#workflow" className="transition-colors hover:text-white">Workflow</a>
          <a href="#faq" className="transition-colors hover:text-white">FAQs</a>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
          <CTAButton href={appPath} variant="hero">
            {navCtaText}
          </CTAButton>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/20 md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="flex w-full basis-full flex-col gap-1 border-t border-white/10 pt-3 md:hidden">
            {['#features', '#problem', '#workflow', '#faq'].map((href, i) => (
              <a
                key={href}
                href={href}
                className="rounded-lg px-2 py-2.5 text-sm font-medium hover:bg-white/10"
                onClick={() => setMenuOpen(false)}
              >
                {['Features', 'Why Us', 'Workflow', 'FAQs'][i]}
              </a>
            ))}
          </div>
        )}
      </nav>

      <div className="relative z-10 mx-auto max-w-5xl pt-16 text-center md:pt-20">
        <h1 className="relative inline-block text-[2.5rem] leading-[1.08] font-extrabold tracking-tight md:text-6xl lg:text-7xl">
          <SparkleDecor />
          Master Market Moves,
          <br />
          Before You Risk Capital.
          <ArrowDecor />
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed font-medium text-white/85 md:mt-6 md:text-base">
          TradeX gives you a realistic paper trading environment with live prices, virtual capital,
          clean portfolio insights, watchlists, alerts, and competitive rankings.
        </p>

        <div className="mt-8 flex justify-center md:mt-9">
          <CTAButton href="/login" variant="hero">
            Start Trading
          </CTAButton>
        </div>
      </div>
    </section>
  )
}

function FeaturesSection() {
  return (
    <section id="features" className="section-shell">
      <div className="section-block mx-auto max-w-4xl text-center">
        <h2 className="section-title-lg">
          TradeX helps retail traders build market confidence through{' '}
          <span className="mx-1 inline-block align-middle rounded-md border-2 border-gray-200 bg-white px-2.5 py-1 text-[10px] font-bold tracking-widest text-gray-400 uppercase shadow-xs md:text-xs">
            Practice &amp; Precision
          </span>
          combining virtual {' '}
          <InlineSparkle /> <InlineX />{' '} capital,  live prices, portfolio insights, alerts, and competition in one focused experience.
        </h2>
      </div>

      <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-3 md:gap-8">
        <div className="flex flex-col justify-center rounded-[32px] border border-gray-100 bg-white p-7 text-center shadow-sm transition-shadow hover:shadow-md md:p-8 md:text-left">
          <h3 className="font-mono text-5xl font-extrabold tracking-tight text-ink md:text-6xl">$10K</h3>
          <p className="mt-2 text-xs font-bold tracking-widest text-gray-400 uppercase">
            Virtual starting capital
          </p>
          <div className="mt-5 flex items-center justify-center -space-x-2.5 md:justify-start">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-brand text-[10px] font-bold text-white">
              TR
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-profit text-[10px] font-bold text-white">
              AD
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-ink text-[10px] font-extrabold text-white shadow-sm">
              EX
            </div>
          </div>
        </div>

        <div className="relative flex min-h-[220px] flex-col justify-between overflow-hidden rounded-[32px] bg-slate-900 p-7 shadow-sm md:min-h-[240px] md:p-8">
          <div className="absolute inset-0 z-[1] bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="relative z-10 flex w-max items-center gap-2 rounded-full bg-white/90 px-3.5 py-1.5 text-xs font-bold text-ink shadow-xs backdrop-blur-md">
            <BarChart3 className="h-3.5 w-3.5 text-brand" strokeWidth={2.25} aria-hidden />
            Market Coverage
          </div>
          <div className="relative z-10">
            <h4 className="font-mono text-4xl font-extrabold text-lime">100+</h4>
            <p className="mt-1 text-xs font-bold tracking-widest text-white/70 uppercase">
              US stocks to track and trade
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-[32px] border border-gray-100 bg-white p-7 shadow-sm transition-shadow hover:shadow-md md:p-8">
          <div className="text-profit">
            <BarChart2 className="h-7 w-7 md:h-8 md:w-8" strokeWidth={2.25} aria-hidden />
          </div>
          <div className="mt-6 md:mt-8">
            <span className="text-[10px] font-extrabold tracking-widest text-gray-400 uppercase">
              Trader Leaderboard
            </span>
            <p className="mt-1.5 text-sm leading-relaxed font-medium text-gray-600">
              Benchmark your performance against other traders and make practice measurable.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

const cards = [
  {
    type: 'risk',
    label: 'Unclear Decisions',
    text: 'Without clear portfolio context, it is easy to misread your average entry, position size, and current gain or loss.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    ),
  },
  {
    type: 'solution',
    label: 'Risk-Free Repetition',
    text: 'Practice buying and selling with virtual capital so you can refine your process before real money is involved.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    ),
  },
  {
    type: 'risk',
    label: 'Missed Opportunities',
    text: 'Markets move quickly. Price alerts help you stay aware of important levels without staring at charts all day.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
  },
  {
    type: 'solution',
    label: 'Cleaner Tracking',
    text: 'Track cash, holdings, trade history, open performance, and closed results in one organized view.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17h6M9 13h6M9 9h2m-5 12h12a2 2 0 002-2V5a2 2 0 00-2-2H6a2 2 0 00-2 2v14a2 2 0 002 2z" />
    ),
  },
  {
    type: 'risk',
    label: 'No Benchmark',
    text: 'Without a ranking or performance view, it is harder to know whether your strategy is actually improving.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 21h8M12 17v4M7 4h10v5a5 5 0 01-10 0V4zM5 4H3v2a4 4 0 004 4M19 4h2v2a4 4 0 01-4 4" />
    ),
  },
]

function ProblemCard({ card, isActive }) {
  if (card.type === 'solution') {
    return (
      <div
        className={`relative flex h-[20rem] w-full flex-col justify-between overflow-hidden rounded-[32px] bg-brand p-7 text-white transition-shadow duration-300 md:h-[22rem] md:p-8 ${
          isActive ? 'shadow-xl' : 'shadow-md opacity-95'
        }`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-white/10 to-transparent" />
        <div className="relative z-10 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-lime md:h-12 md:w-12">
          <svg className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden>
            {card.icon}
          </svg>
        </div>
        <p className="relative z-10 text-base leading-relaxed font-bold text-white md:text-lg">{card.text}</p>
        <span className="relative z-10 text-xs font-extrabold tracking-widest text-white/60 uppercase">
          {card.label}
        </span>
      </div>
    )
  }

  return (
    <div
      className={`flex h-[20rem] w-full flex-col justify-between rounded-[32px] border border-gray-100 bg-page p-7 transition-all duration-300 md:h-[22rem] md:p-8 ${
        isActive ? 'border-gray-200 shadow-sm' : 'opacity-90'
      }`}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-500 md:h-12 md:w-12">
        <svg className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden>
          {card.icon}
        </svg>
      </div>
      <p className="text-base leading-relaxed font-semibold text-gray-700">{card.text}</p>
      <span className="text-xs font-extrabold tracking-widest text-gray-400 uppercase">{card.label}</span>
    </div>
  )
}

function ProblemsSection() {
  const swiperRef = useRef(null)
  const [progress, setProgress] = useState(0)
  const [activeIndex, setActiveIndex] = useState(1)

  return (
    <section id="problem" className="border-y border-gray-100 bg-white">
      <div className="section-shell !py-20 md:!py-24">
        <div className="section-block flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeader
            badge={{ icon: AlertTriangle, label: 'Market Obstacles' }}
            title="Why serious practice matters before real capital."
          />
          <button
            type="button"
            onClick={() => swiperRef.current?.slideNext()}
            className="btn-ghost shrink-0 self-start border border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200 hover:text-gray-700 md:self-auto"
          >
            <ScrollArrow />
            Scroll Right
          </button>
        </div>

        <div className="relative -mx-6 overflow-hidden px-6 md:mx-0 md:px-0">
          <Swiper
            onSwiper={(swiper) => {
              swiperRef.current = swiper
            }}
            grabCursor
            centeredSlides
            centerInsufficientSlides
            slidesPerView="auto"
            spaceBetween={20}
            initialSlide={1}
            speed={450}
            slideToClickedSlide
            resistanceRatio={0.85}
            watchSlidesProgress
            onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
            onProgress={(swiper) => setProgress(swiper.progress)}
            onSetTranslate={(swiper) => setProgress(swiper.progress)}
            className="problems-slider !overflow-visible pb-2"
          >
            {cards.map((card, i) => (
              <SwiperSlide
                key={`${card.label}-${i}`}
                className="!w-[min(100%,300px)] sm:!w-[360px] md:!w-[400px]"
              >
                <ProblemCard card={card} isActive={activeIndex === i} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <div className="mx-auto mt-8 h-1 max-w-2xl overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-brand transition-[width] duration-300 ease-out"
            style={{ width: `${Math.max(8, progress * 100)}%` }}
          />
        </div>
      </div>
    </section>
  )
}

const tabs = [
  {
    id: 'tab1',
    num: '01',
    title: 'Live Market Prices',
    content:
      'Practice with prices that move with the market, so your buy, sell, and watchlist decisions feel realistic.',
  },
  {
    id: 'tab2',
    num: '02',
    title: 'Professional Portfolio Tracking',
    content:
      'Monitor virtual cash, holdings, average entry, open performance, closed results, and total account value from one clean view.',
  },
  {
    id: 'tab3',
    num: '03',
    title: 'Target-Based Price Alerts',
    content:
      'Set the price levels that matter to your strategy and get notified when a stock reaches your target.',
  },
]

function WorkflowSection() {
  const [openId, setOpenId] = useState('tab2')

  return (
    <section id="workflow" className="section-shell">
      <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <SectionHeader
            badge={{ icon: Lightbulb, label: 'Trading Toolkit' }}
            title="A sharper way to build trading discipline"
          >
            <CTAButton href="/login" variant="dark">
              Build Your Strategy
            </CTAButton>
          </SectionHeader>
        </div>

        <div className="space-y-1 lg:col-span-7">
          {tabs.map((tab) => {
            const isOpen = openId === tab.id
            return (
              <div
                key={tab.id}
                className="cursor-pointer border-b border-gray-100 pb-4"
                onClick={() => setOpenId(tab.id)}
                onKeyDown={(e) => e.key === 'Enter' && setOpenId(tab.id)}
                role="button"
                tabIndex={0}
              >
                <div className="flex items-center justify-between py-3">
                  <h3
                    className={`flex items-center gap-3 text-lg font-extrabold transition-colors md:gap-4 md:text-xl ${
                      isOpen ? 'text-ink' : 'text-gray-300'
                    }`}
                  >
                    <span className={`font-mono text-xs font-bold ${isOpen ? 'text-brand' : 'text-gray-400'}`}>
                      {tab.num}
                    </span>
                    {tab.title}
                  </h3>
                  <span className={isOpen ? 'text-ink' : 'text-gray-400'}>
                    {isOpen ? (
                      <Minus className="h-5 w-5" strokeWidth={2.5} aria-hidden />
                    ) : (
                      <Plus className="h-5 w-5" strokeWidth={2.5} aria-hidden />
                    )}
                  </span>
                </div>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-2">
                        <p className="max-w-2xl text-sm leading-relaxed font-medium text-gray-500">
                          {tab.content}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

const faqs = [
  {
    q: 'How are Unrealized and Realized P&L calculated?',
    a: 'Unrealized P&L shows the current gain or loss on positions you still hold. Realized P&L shows the result of positions you have already sold.',
  },
  {
    q: 'How do price alerts work?',
    a: 'Choose a stock, set the price level you care about, and TradeX will notify you when that level is reached.',
  },
  {
    q: 'Is TradeX for beginners or experienced traders?',
    a: 'TradeX supports both. New traders can learn safely, while experienced traders can test ideas, monitor watchlists, and measure performance without using real capital.',
  },
  {
    q: 'What can I track inside my portfolio?',
    a: 'You can track virtual cash, holdings, average buy prices, current value, open gains or losses, closed trade results, and overall account performance.',
  },
  {
    q: 'How does the leaderboard help me improve?',
    a: 'The leaderboard gives you a performance benchmark, making it easier to see whether your strategy is improving compared with other traders.',
  },
]

function FAQSection() {
  const [active, setActive] = useState(0)

  return (
    <section id="faq" className="section-shell">
      <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-6">
          <SectionHeader title="Frequently Asked Questions" className="mb-8 md:mb-10" />

          <div className="flex flex-col gap-2.5">
            {faqs.map((faq, index) => {
              const isActive = active === index
              return (
                <button
                  key={faq.q}
                  type="button"
                  onClick={() => setActive(index)}
                  className={`flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-4 text-left transition-all duration-200 md:px-5 ${
                    isActive
                      ? 'border-transparent bg-ink text-white shadow-xs'
                      : 'border-gray-100 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="text-sm font-bold md:text-base">{faq.q}</span>
                  <FaqChevron active={isActive} />
                </button>
              )
            })}
          </div>
        </div>

        <div className="relative flex min-h-[340px] flex-col justify-between overflow-hidden rounded-[32px] border border-white/5 bg-[#040812] p-8 text-white shadow-xl md:min-h-[360px] md:rounded-[40px] md:p-10 lg:col-span-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent" />
          <div className="absolute top-6 right-6 text-lime opacity-40 md:top-8 md:right-8">
            <svg className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M5 3v4M3 5h4" />
            </svg>
          </div>

          <div className="relative z-10">
            <div className="mb-6 md:mb-8">
              <BrandMarks />
            </div>
            <AnimatePresence mode="wait">
              <motion.p
                key={active}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="text-xl leading-[1.35] font-extrabold tracking-tight text-white/95 md:text-2xl lg:text-3xl"
              >
                {faqs[active].a}
              </motion.p>
            </AnimatePresence>
          </div>

          <div className="relative z-10 mt-6 font-mono text-[10px] font-bold tracking-widest text-white/30 uppercase md:mt-8">
            TradeX Docs
          </div>
        </div>
      </div>
    </section>
  )
}

function FooterSection() {
  return (
    <footer className="relative overflow-hidden rounded-t-[48px] bg-[#030712] px-6 pt-20 pb-10 text-white md:pt-24">
      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="section-block relative flex flex-col items-center justify-between gap-8 overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-brand to-[#012BB3] p-8 shadow-2xl md:flex-row md:gap-10 md:rounded-[36px] md:p-12 lg:p-14">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent" />
          <div className="relative z-10">
            <h2 className="text-center text-3xl leading-[1.15] font-extrabold tracking-tight text-white md:text-4xl lg:text-left">
              Build Better Trading
              <br />
              Habits Today
            </h2>
          </div>
          <div className="relative z-10 flex flex-col items-center gap-4 text-center lg:items-end lg:text-right">
            <p className="max-w-xs text-sm font-medium text-white/75">
              Test strategies, track your progress, and learn the market without risking real money.
            </p>
            <CTAButton href="/login" variant="footer">
              Start Trading
            </CTAButton>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 border-b border-white/10 pb-12 text-sm md:grid-cols-4 md:gap-10 md:pb-14">
          <div className="space-y-3">
            <h4 className="text-[11px] font-extrabold tracking-widest text-white/40 uppercase">Platform</h4>
            <ul className="space-y-2 font-medium text-white/60">
              <li>Paper trading dashboard</li>
              <li>Portfolio leaderboard</li>
              <li>Price alert panels</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="text-[11px] font-extrabold tracking-widest text-white/40 uppercase">Learning Scope</h4>
            <ul className="space-y-2 font-medium text-white/60">
              <li>Virtual capital only</li>
              <li>No real-money execution</li>
              <li>Strategy practice mode</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="text-[11px] font-extrabold tracking-widest text-white/40 uppercase">Market Data</h4>
            <ul className="space-y-2 font-medium text-white/60">
              <li>Live price tracking</li>
              <li>Interactive charts</li>
              <li>Market watchlists</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="text-[11px] font-extrabold tracking-widest text-white/40 uppercase">Built For</h4>
            <span className="inline-block rounded-md border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-xs text-white/60">
              Practice-first trading
            </span>
            <p className="text-sm font-medium text-white/60">Cleaner decisions</p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-4 pt-8 text-xs font-medium text-white/40 sm:flex-row">
          <p>© 2026 TradeX. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default function HomePage() {
  useEffect(() => {
    document.title = 'TradeX - Practice Trading Risk-Free'
  }, [])

  return (
    <div className="homepage-landing min-h-screen bg-page text-ink">
      <PageStyles />
      <HeroSection />
      <FeaturesSection />
      <ProblemsSection />
      <WorkflowSection />
      <FAQSection />
      <FooterSection />
    </div>
  )
}
