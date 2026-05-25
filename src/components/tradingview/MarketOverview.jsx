import React, { useEffect, useRef, memo } from 'react';

function MarketOverview() {
  const container = useRef();

  useEffect(() => {
    container.current.innerHTML = '';
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-market-quotes.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
      {
        "colorTheme": "dark",
        "locale": "en",
        "largeChartUrl": "",
        "isTransparent": true,
        "showSymbolLogo": true,
        "backgroundColor": "rgba(0,0,0,0)",
        "support_host": "https://www.tradingview.com",
        "width": "100%",
        "height": "100%",
        "symbolsGroups": [
          {
            "name": "Top 50 US Stocks",
            "symbols": [
              { "name": "NASDAQ:AAPL",  "displayName": "Apple" },
              { "name": "NASDAQ:NVDA",  "displayName": "NVIDIA" },
              { "name": "NASDAQ:MSFT",  "displayName": "Microsoft" },
              { "name": "NASDAQ:AMZN",  "displayName": "Amazon" },
              { "name": "NASDAQ:GOOGL", "displayName": "Alphabet" },
              { "name": "NASDAQ:META",  "displayName": "Meta" },
              { "name": "NASDAQ:TSLA",  "displayName": "Tesla" },
              { "name": "NASDAQ:AVGO",  "displayName": "Broadcom" },
              { "name": "NYSE:BRK.B",   "displayName": "Berkshire" },
              { "name": "NYSE:JPM",     "displayName": "JPMorgan" },
              { "name": "NYSE:LLY",     "displayName": "Eli Lilly" },
              { "name": "NYSE:V",       "displayName": "Visa" },
              { "name": "NYSE:XOM",     "displayName": "Exxon Mobil" },
              { "name": "NYSE:UNH",     "displayName": "UnitedHealth" },
              { "name": "NYSE:MA",      "displayName": "Mastercard" },
              { "name": "NASDAQ:COST",  "displayName": "Costco" },
              { "name": "NYSE:HD",      "displayName": "Home Depot" },
              { "name": "NYSE:PG",      "displayName": "P&G" },
              { "name": "NASDAQ:NFLX",  "displayName": "Netflix" },
              { "name": "NYSE:WMT",     "displayName": "Walmart" },
              { "name": "NYSE:BAC",     "displayName": "Bank of America" },
              { "name": "NYSE:KO",      "displayName": "Coca-Cola" },
              { "name": "NYSE:PEP",     "displayName": "PepsiCo" },
              { "name": "NYSE:TMO",     "displayName": "Thermo Fisher" },
              { "name": "NYSE:MRK",     "displayName": "Merck" },
              { "name": "NYSE:ABBV",    "displayName": "AbbVie" },
              { "name": "NYSE:CVX",     "displayName": "Chevron" },
              { "name": "NYSE:CRM",     "displayName": "Salesforce" },
              { "name": "NASDAQ:AMD",   "displayName": "AMD" },
              { "name": "NYSE:MCD",     "displayName": "McDonald's" },
              { "name": "NYSE:ACN",     "displayName": "Accenture" },
              { "name": "NYSE:ABT",     "displayName": "Abbott Labs" },
              { "name": "NYSE:DHR",     "displayName": "Danaher" },
              { "name": "NASDAQ:ADBE",  "displayName": "Adobe" },
              { "name": "NASDAQ:QCOM",  "displayName": "Qualcomm" },
              { "name": "NYSE:TXN",     "displayName": "Texas Instruments" },
              { "name": "NASDAQ:CSCO",  "displayName": "Cisco" },
              { "name": "NYSE:VZ",      "displayName": "Verizon" },
              { "name": "NYSE:T",       "displayName": "AT&T" },
              { "name": "NYSE:NEE",     "displayName": "NextEra Energy" },
              { "name": "NYSE:PM",      "displayName": "Philip Morris" },
              { "name": "NYSE:RTX",     "displayName": "Raytheon" },
              { "name": "NYSE:HON",     "displayName": "Honeywell" },
              { "name": "NYSE:UPS",     "displayName": "UPS" },
              { "name": "NYSE:MS",      "displayName": "Morgan Stanley" },
              { "name": "NYSE:GS",      "displayName": "Goldman Sachs" },
              { "name": "NYSE:BLK",     "displayName": "BlackRock" },
              { "name": "NYSE:SPGI",    "displayName": "S&P Global" },
              { "name": "NASDAQ:GILD",  "displayName": "Gilead Sciences" },
              { "name": "NYSE:CAT",     "displayName": "Caterpillar" }
            ]
          }
        ]
      }`;
    container.current.appendChild(script);
  }, []);

  return (
    <div className="tradingview-widget-container" ref={container} style={{ width: '100%', height: '100%' }}>
    </div>
  );
}

export default memo(MarketOverview);
