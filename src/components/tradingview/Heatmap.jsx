import React, { useEffect, useRef, memo } from 'react';

function HeatmapWidget() {
  const container = useRef();

  useEffect(() => {
    container.current.innerHTML = '';
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-stock-heatmap.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
      {
        "exchanges": [],
        "dataSource": "SPX500",
        "grouping": "sector",
        "blockSize": "market_cap_basic",
        "blockColor": "change",
        "locale": "en",
        "symbolUrl": "",
        "colorTheme": "dark",
        "hasTopBar": true,
        "isDataSetEnabled": false,
        "isZoomEnabled": false,
        "hasSymbolTooltip": true,
        "isMonoSize": false,
        "width": "100%",
        "height": "100%"
      }`;
    container.current.appendChild(script);
  }, []);

  return (
    <div
      className="tradingview-widget-container w-full"
      ref={container}
      style={{ height: '600px' }}
    />
  );
}

export default memo(HeatmapWidget);
