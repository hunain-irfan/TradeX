import { toTradingViewSymbol } from '../data/stocks'

export { toTradingViewSymbol }

let widgetCounter = 0

/**
 * TradingView embed scripts use document.currentScript to find their container.
 * async=true breaks that (currentScript is null → querySelector fails).
 */
export function mountTradingViewWidget(container, scriptSrc, config) {
  if (!container) return () => {}

  const instanceId = `tv-embed-${++widgetCounter}`
  container.id = instanceId
  container.innerHTML = ''

  const widgetEl = document.createElement('div')
  widgetEl.className = 'tradingview-widget-container__widget'
  container.appendChild(widgetEl)

  const script = document.createElement('script')
  script.type = 'text/javascript'
  script.src = scriptSrc
  script.innerHTML = JSON.stringify(config)
  container.appendChild(script)

  return () => {
    container.innerHTML = ''
    container.removeAttribute('id')
  }
}
