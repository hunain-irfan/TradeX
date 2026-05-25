import React, { useEffect, useRef, memo } from 'react';

function FinancialNews() {
  const container = useRef();

  useEffect(() => {
    container.current.innerHTML = '';
    
    const widgetDiv = document.createElement("div");
    widgetDiv.className = "tradingview-widget-container__widget";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-timeline.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
      {
        "feedMode": "all_symbols",
        "isTransparent": true,
        "displayMode": "regular",
        "width": "100%",
        "height": "547",
        "colorTheme": "dark",
        "locale": "en"
      }`;
    
    container.current.appendChild(widgetDiv);
    container.current.appendChild(script);
  }, []);

  return (
    <div
      className="tradingview-widget-container tv-financial-news"
      ref={container}
      style={{ width: '100%', height: 547}}
    >
    </div>
  );
}

export default memo(FinancialNews);
