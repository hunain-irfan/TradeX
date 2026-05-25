import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Logo from '../components/layout/Logo'
import './landing.css'

const TICKER = [
  { sym: 'AAPL', price: '$213.50', chg: '▲ +1.54%', up: true },
  { sym: 'NVDA', price: '$138.85', chg: '▲ +2.21%', up: true },
  { sym: 'MSFT', price: '$520.42', chg: '▼ −0.24%', up: false },
  { sym: 'TSLA', price: '$339.62', chg: '▲ +1.72%', up: true },
  { sym: 'GOOGL', price: '$201.56', chg: '▲ +2.65%', up: true },
  { sym: 'META', price: '$762.96', chg: '▼ −2.54%', up: false },
  { sym: 'AMZN', price: '$244.16', chg: '▼ −1.53%', up: false },
  { sym: 'JPM', price: '$275.30', chg: '▲ +0.88%', up: true },
]

const FEATURES = [
  {
    icon: 'chart',
    color: 'fi-blue',
    title: 'TradingView charts',
    desc: 'Candlestick charts and symbol overview on every stock — the same tools professionals use.',
    tag: 'Stock detail',
    tagClass: 'tag-blue',
  },
  {
    icon: 'activity',
    color: 'fi-green',
    title: 'Live WebSocket prices',
    desc: 'Real-time tick updates on your watchlist. Up to 50 symbols via Finnhub WebSocket.',
    tag: 'Watchlist',
    tagClass: 'tag-green',
  },
  {
    icon: 'dashboard',
    color: 'fi-purple',
    title: 'Market overview',
    desc: 'TradingView market overview and financial news widgets on your dashboard.',
    tag: 'Dashboard',
    tagClass: 'tag-blue',
  },
  {
    icon: 'trophy',
    color: 'fi-teal',
    title: 'Leaderboard',
    desc: 'Compete with other traders. Rankings use live portfolio valuations.',
    tag: 'Live',
    tagClass: 'tag-green',
  },
  {
    icon: 'undo',
    color: 'fi-red',
    title: 'Undo last trade',
    desc: 'Made a mistake? Undo your last transaction — powered by a Stack (LIFO).',
    tag: 'DSA',
    tagClass: 'tag-purple',
  },
]

function FeatureIcon({ name }) {
  const stroke = 'currentColor'
  const props = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke, strokeWidth: 2 }

  switch (name) {
    case 'chart':
      return (
        <svg {...props}>
          <path d="M4 19h16M6 16l4-6 4 3 4-8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'activity':
      return (
        <svg {...props}>
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'dashboard':
      return (
        <svg {...props}>
          <rect x="3" y="3" width="7" height="9" rx="1" />
          <rect x="14" y="3" width="7" height="5" rx="1" />
          <rect x="14" y="12" width="7" height="9" rx="1" />
          <rect x="3" y="16" width="7" height="5" rx="1" />
        </svg>
      )
    case 'trophy':
      return (
        <svg {...props}>
          <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 01-10 0V4zM5 4H3v2a4 4 0 004 4M19 4h2v2a4 4 0 01-4 4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'undo':
      return (
        <svg {...props}>
          <path d="M9 14L4 9l5-5M4 9h10a6 6 0 010 12h-2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    default:
      return null
  }
}

function ShieldIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function Landing() {
  const { user, loading, isAdmin } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  const appHome = user ? (isAdmin ? '/admin' : '/dashboard') : '/login'
  const signupLink = { pathname: '/login', state: { register: true } }
  const leaderboardLink = user ? '/leaderboard' : '/login'

  const primaryCta = user ? 'Open dashboard →' : 'Get $10,000 free →'
  const secondaryCta = user ? 'View leaderboard' : 'Create free account →'

  return (
    <div className="lp">
      <nav className="nav">
        <Logo
          to="/"
          className="nav-logo-img h-7 w-auto max-w-[120px]"
          onClick={() => setMenuOpen(false)}
        />

        <div className={`nav-links${menuOpen ? '' : ''}`}>
          <a href="#features" onClick={() => setMenuOpen(false)}>
            Features
          </a>
          <a href="#how-it-works" onClick={() => setMenuOpen(false)}>
            How it works
          </a>
          <a href="#leaderboard" onClick={() => setMenuOpen(false)}>
            Leaderboard
          </a>
          <a href="#dsa" onClick={() => setMenuOpen(false)}>
            DSA
          </a>
        </div>

        <div className="nav-cta">
          {!loading && !user && (
            <Link to="/login" className="btn-ghost">
              Log in
            </Link>
          )}
          <Link to={appHome} className="btn-primary">
            {user ? 'Open app →' : 'Start trading →'}
          </Link>
          <button
            type="button"
            className="nav-mobile-toggle"
            aria-label="Menu"
            onClick={() => setMenuOpen((o) => !o)}
          >
            ☰
          </button>
        </div>

        <div className={`nav-links-mobile${menuOpen ? ' open' : ''}`}>
          <a href="#features" onClick={() => setMenuOpen(false)}>
            Features
          </a>
          <a href="#how-it-works" onClick={() => setMenuOpen(false)}>
            How it works
          </a>
          <a href="#leaderboard" onClick={() => setMenuOpen(false)}>
            Leaderboard
          </a>
          <a href="#dsa" onClick={() => setMenuOpen(false)}>
            DSA
          </a>
          {!user && (
            <Link to="/login" onClick={() => setMenuOpen(false)}>
              Log in
            </Link>
          )}
        </div>
      </nav>

      <div className="ticker-bar">
        <div className="ticker-inner">
          {[...TICKER, ...TICKER].map((t, i) => (
            <span key={`${t.sym}-${i}`} className="tick-item">
              <span className="tick-sym">{t.sym}</span>
              <span className="tick-price">{t.price}</span>
              <span className={t.up ? 'tick-up' : 'tick-dn'}>{t.chg}</span>
            </span>
          ))}
        </div>
      </div>

      <section className="hero">
        <div>
          <div className="hero-eyebrow">
            <div className="hero-dot" />
            <span>Live US market data · Paper trading</span>
          </div>
          <h1>
            Trade stocks.
            <br />
            Risk <em>nothing.</em>
            <br />
            Learn everything.
          </h1>
          <p className="hero-sub">
            Practice trading 100+ US stocks with $10,000 virtual money. Live Finnhub prices,
            TradingView charts, and a leaderboard to compete with other traders.
          </p>
          <div className="hero-actions">
            <Link to={user ? appHome : signupLink} className="btn-lg-primary">
              {primaryCta}
            </Link>
            <Link to={leaderboardLink} className="btn-lg-ghost">
              View leaderboard
            </Link>
          </div>
          <div className="hero-note">
            <ShieldIcon />
            No credit card · No real money · Email confirmation on signup
          </div>
        </div>

        <div className="dashboard-preview">
          <div className="preview-topbar">
            <div className="preview-dot" style={{ background: '#FF5F57' }} />
            <div className="preview-dot" style={{ background: '#FEBC2E' }} />
            <div className="preview-dot" style={{ background: '#28C840' }} />
            <span className="preview-title">tradex — dashboard</span>
          </div>
          <div className="preview-body">
            <div className="preview-stats">
              <div className="preview-stat">
                <div className="preview-stat-label">Wallet</div>
                <div className="preview-stat-val" style={{ color: '#fff' }}>
                  $7,842
                </div>
              </div>
              <div className="preview-stat">
                <div className="preview-stat-label">Portfolio</div>
                <div className="preview-stat-val" style={{ color: '#fff' }}>
                  $2,391
                </div>
              </div>
              <div className="preview-stat">
                <div className="preview-stat-label">Total P&L</div>
                <div className="preview-stat-val" style={{ color: '#00C853' }}>
                  +$391
                </div>
              </div>
            </div>
            <div className="preview-chart">
              <div className="preview-chart-label">Portfolio value</div>
              <svg className="sparkline" width="100%" height="52" viewBox="0 0 300 52" preserveAspectRatio="none">
                <polyline
                  points="0,45 30,42 60,38 90,40 120,30 150,32 180,20 210,24 240,14 270,10 300,8"
                  fill="none"
                  stroke="#2962FF"
                  strokeWidth="1.5"
                />
                <polyline
                  points="0,52 0,45 30,42 60,38 90,40 120,30 150,32 180,20 210,24 240,14 270,10 300,8 300,52"
                  fill="#0D1B3E"
                  stroke="none"
                />
              </svg>
            </div>
            <div className="preview-table">
              <div className="preview-th">
                <span>Symbol</span>
                <span>Name</span>
                <span style={{ textAlign: 'right' }}>Price</span>
                <span style={{ textAlign: 'right' }}>Change</span>
              </div>
              <div className="preview-tr">
                <span className="preview-sym">AAPL</span>
                <span className="preview-name">Apple Inc</span>
                <span className="preview-price">$213.50</span>
                <span className="preview-chg up-chg">▲1.54%</span>
              </div>
              <div className="preview-tr">
                <span className="preview-sym">NVDA</span>
                <span className="preview-name">NVIDIA</span>
                <span className="preview-price">$138.85</span>
                <span className="preview-chg up-chg">▲2.21%</span>
              </div>
              <div className="preview-tr">
                <span className="preview-sym">MSFT</span>
                <span className="preview-name">Microsoft</span>
                <span className="preview-price">$520.42</span>
                <span className="preview-chg dn-chg">▼0.24%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="stats-bar">
        <div className="stat-item">
          <div className="stat-num">100+</div>
          <div className="stat-label">US stocks available</div>
        </div>
        <div className="stat-item">
          <div className="stat-num">$10K</div>
          <div className="stat-label">Virtual money on signup</div>
        </div>
        <div className="stat-item">
          <div className="stat-num">Live</div>
          <div className="stat-label">Finnhub market data</div>
        </div>
        <div className="stat-item">
          <div className="stat-num">5</div>
          <div className="stat-label">DSA structures in app</div>
        </div>
      </div>

      <section id="features" className="features">
        <div className="section-label">Features</div>
        <div className="section-title">Everything a real trader needs</div>
        <p className="section-sub">
          Professional tools — TradingView widgets, live WebSocket prices, and full portfolio
          management with Supabase backend.
        </p>
        <div className="features-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="feature-card">
              <div className={`feature-icon ${f.color}`}>
                <FeatureIcon name={f.icon} />
              </div>
              <div className="feature-title">{f.title}</div>
              <div className="feature-desc">{f.desc}</div>
              <span className={`feature-tag ${f.tagClass}`}>{f.tag}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="how">
        <div className="section-label">How it works</div>
        <div className="section-title">Start trading in 60 seconds</div>
        <div className="steps">
          <div className="step">
            <div className="step-num">01 ——</div>
            <div className="step-title">Create your account</div>
            <div className="step-desc">
              Sign up with email. Confirm via the link we send you, then get $10,000 virtual cash
              automatically — no card needed.
            </div>
          </div>
          <div className="step">
            <div className="step-num">02 ——</div>
            <div className="step-title">Search & analyze stocks</div>
            <div className="step-desc">
              Search 100+ US stocks with binary search, view live charts, news, and indicators
              before you trade.
            </div>
          </div>
          <div className="step">
            <div className="step-num">03 ——</div>
            <div className="step-title">Trade & compete</div>
            <div className="step-desc">
              Buy and sell at market prices. Track P&L and climb the leaderboard.
            </div>
          </div>
        </div>
      </section>

      <section id="leaderboard" className="features" style={{ paddingTop: 48 }}>
        <div className="section-label">Leaderboard</div>
        <div className="section-title">Compete with real rankings</div>
        <p className="section-sub">
          See how your paper portfolio stacks up. Account value uses live Finnhub quotes when the
          market is open.
        </p>
        <Link to={leaderboardLink} className="btn-lg-primary">
          {user ? 'Open leaderboard →' : 'Sign up to compete →'}
        </Link>
      </section>

      <section id="dsa" className="dsa-section">
        <div className="dsa-inner">
          <div className="section-label">DSA Implementation</div>
          <div className="section-title">Real algorithms, real performance</div>
          <p className="section-sub" style={{ marginBottom: 0 }}>
            Core features use real data structures — running live in the app, not just on slides.
          </p>
          <div className="dsa-grid">
            <div className="dsa-cards">
              <div className="dsa-card">
                <div className="dsa-badge">Map</div>
                <div>
                  <div className="dsa-info-title">HashMap — Portfolio storage</div>
                  <div className="dsa-info-desc">O(1) symbol lookup across all holdings</div>
                  <div className="dsa-complexity">O(1) get · O(1) set</div>
                </div>
              </div>
              <div className="dsa-card">
                <div className="dsa-badge">Stack</div>
                <div>
                  <div className="dsa-info-title">Stack — Transaction undo</div>
                  <div className="dsa-info-desc">LIFO — undo your last trade from History</div>
                  <div className="dsa-complexity">O(1) push · O(1) pop</div>
                </div>
              </div>
              <div className="dsa-card">
                <div className="dsa-badge">Sort</div>
                <div>
                  <div className="dsa-info-title">Sort — Leaderboard rankings</div>
                  <div className="dsa-info-desc">sortByField on portfolio value, asc or desc</div>
                  <div className="dsa-complexity">O(n log n) compare</div>
                </div>
              </div>
              <div className="dsa-card">
                <div className="dsa-badge">B.S.</div>
                <div>
                  <div className="dsa-info-title">Binary search — Stock lookup</div>
                  <div className="dsa-info-desc">Sorted symbol list, O(log n) exact match</div>
                  <div className="dsa-complexity">O(log n) on 100 stocks</div>
                </div>
              </div>
            </div>
            <div className="code-block">
              <div className="code-header">
                <span>src/lib/dsa.js</span>
                <span className="code-lang">JavaScript</span>
              </div>
              <pre className="code-body">
                <code>
                  <span className="c-cm">{'// HashMap — O(1) portfolio lookup'}</span>
                  {'\n'}
                  <span className="c-kw">class</span> <span className="c-fn">PortfolioMap</span> {'{'}
                  {'\n'}
                  {'  '}
                  <span className="c-fn">get</span>(sym) {'{'} <span className="c-kw">return</span>{' '}
                  <span className="c-kw">this</span>._map.get(sym); {'}'}
                  {'\n'}
                  {'}\n\n'}
                  <span className="c-cm">{'// Stack — undo last trade (LIFO)'}</span>
                  {'\n'}
                  <span className="c-kw">class</span> <span className="c-fn">TransactionStack</span> {'{'}
                  {'\n'}
                  {'  '}
                  <span className="c-fn">pop</span>() {'{'} <span className="c-kw">return</span>{' '}
                  <span className="c-kw">this</span>._stack.pop(); {'}'}
                  {'\n'}
                  {'}'}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-inner">
          <h2>Ready to start trading?</h2>
          <p>
            Join TradeX and practice with $10,000 virtual money on real US stock prices. No risk,
            full experience.
          </p>
          <div className="cta-actions">
            <Link to={user ? appHome : signupLink} className="btn-lg-primary">
              {secondaryCta}
            </Link>
            <Link to={leaderboardLink} className="btn-lg-ghost">
              View leaderboard
            </Link>
          </div>
          <div className="cta-note">Free for learning · No real money · Finnhub & TradingView</div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-left">
          <Logo to="/" link={false} className="h-7 w-auto max-w-[110px] opacity-90" />
          <span className="footer-text">Paper Trading Platform</span>
        </div>
        <span className="footer-right">React · Supabase · Finnhub</span>
      </footer>
    </div>
  )
}
