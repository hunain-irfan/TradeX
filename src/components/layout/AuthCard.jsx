import { Link } from 'react-router-dom'
import { ArrowLeft, Quote } from 'lucide-react'
import Logo from './Logo'

export const AUTH_LOGO_CLASS = 'h-8 w-auto max-w-[150px]'

/**
 * Optional hero image on the auth left panel (desktop).
 * 1. Add file to public/ e.g. public/auth-hero.jpg
 * 2. Set: export const AUTH_PANEL_BG_IMAGE = '/auth-hero.jpg'
 * Image shows under gradients; text stays readable via dark overlay.
 */
export const AUTH_PANEL_BG_IMAGE = null

function AuthMarketingPanel() {
  return (
    <aside className="relative hidden lg:flex lg:w-1/2 flex-col justify-between overflow-hidden bg-[#050508] border-r border-[#1E1E1E] p-10 xl:p-14">
      {AUTH_PANEL_BG_IMAGE && (
        <img
          src={AUTH_PANEL_BG_IMAGE}
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          aria-hidden
        />
      )}

      {/* Base + brand gradient (stronger) */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary-500/55 via-[#0A1628]/90 to-[#050508]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-primary-500/20"
        aria-hidden
      />
      {/* Glow orbs */}
      <div
        className="pointer-events-none absolute -right-20 top-[15%] h-96 w-96 rounded-full bg-primary-500/35 blur-[100px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-16 bottom-[10%] h-64 w-64 rounded-full bg-primary-400/20 blur-[80px]"
        aria-hidden
      />
      {/* Vignette — keeps text readable if you add a photo later */}
      <div
        className="pointer-events-none absolute inset-0 bg-[#0A0A0A]/40"
        aria-hidden
      />

      <div className="relative z-10">
        <Logo to="/" className={AUTH_LOGO_CLASS} />
      </div>

      <div className="relative z-10 max-w-lg">
        <h2 className="text-3xl xl:text-3xl font-bold text-white leading-tight">
             Sharpen your edge on live markets — before real money is on the line.
        </h2>
        <figure className="relative mt-10 pl-11">
          <Quote
            className="absolute left-0 top-0 h-7 w-7 text-primary-500/50"
            strokeWidth={1.5}
            aria-hidden
          />
          <blockquote className="text-gray-300 text-base sm:text-lg leading-relaxed italic">
            &ldquo;An investment in knowledge pays the best interest.&rdquo;
          </blockquote>
          <figcaption className="mt-3 text-sm text-gray-500 not-italic">
            — Benjamin Franklin
          </figcaption>
        </figure>
      </div>

      <p className="relative z-10 text-xs text-gray-600 font-mono uppercase tracking-wider">
        Simulated trading · Real market data
      </p>
    </aside>
  )
}

/** Split auth layout (reference-style): marketing left, form right — dark theme */
export default function AuthCard({ title, subtitle, children, backTo }) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#0A0A0A]">
      <AuthMarketingPanel />

      <main className="flex flex-1 flex-col justify-center px-6 py-10 sm:px-10 lg:px-14 xl:px-20 bg-[#111111]">
        <div className="w-full max-w-md mx-auto text-left">
          <div className="lg:hidden mb-8">
            <Logo to="/" className={AUTH_LOGO_CLASS} />
          </div>

          {backTo && (
            <Link
              to={backTo}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors mb-6 -ml-1"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" strokeWidth={2} aria-hidden />
            </Link>
          )}

          {title && (
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{title}</h1>
          )}
          {subtitle && (
            <p className="text-gray-500 text-sm mt-3 mb-6 leading-relaxed max-w-sm">{subtitle}</p>
          )}
          {!subtitle && title && <div className="mb-6" />}

          {children}
        </div>
      </main>
    </div>
  )
}
