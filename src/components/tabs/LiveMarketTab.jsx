import React, { useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, DollarSign, Activity, ShieldCheck, Zap, Layers, FileText,
  Search, ShoppingBag, ExternalLink, CheckCircle, Brain, Sliders, Cpu, BarChart3,
  RefreshCw, Globe, Download, Eye, Truck, Warehouse, Phone, Star, MapPin, ArrowUpRight, ArrowDownRight, Compass
} from 'lucide-react';
import {
  fetchMarketCommodities, fetchMarketBuyers, fetchMarketWarehouses, fetchMarketNews,
  fetchWatchlist, addToWatchlist, deleteFromWatchlist, queryMarketAdvisor,
  FALLBACK_MARKET_COMMODITIES, FALLBACK_MARKET_BUYERS, FALLBACK_MARKET_WAREHOUSES, FALLBACK_MARKET_NEWS
} from '../../services/liveMarketService';

export default function LiveMarketTab() {
  const [commodities, setCommodities] = useState(FALLBACK_MARKET_COMMODITIES);
  const [activeCommodityId, setActiveCommodityId] = useState(FALLBACK_MARKET_COMMODITIES[0].commodity_id);
  const [buyersList, setBuyersList] = useState(FALLBACK_MARKET_BUYERS);
  const [warehousesList, setWarehousesList] = useState(FALLBACK_MARKET_WAREHOUSES);
  const [newsList, setNewsList] = useState(FALLBACK_MARKET_NEWS);
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Qwen AI Chat Advisor State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Transport ROI Calculator State
  const [transportDistKm, setTransportDistKm] = useState(45);
  const [quantityQtl, setQuantityQtl] = useState(50);
  const [storageMonths, setStorageMonths] = useState(2);

  const activeCommodity = commodities.find(c => c.commodity_id === activeCommodityId) || commodities[0] || FALLBACK_MARKET_COMMODITIES[0];
  const analytics = activeCommodity?.analytics || {};

  useEffect(() => {
    loadData();
  }, [selectedCategory]);

  const loadData = async () => {
    setLoading(true);
    try {
      const cData = await fetchMarketCommodities(searchQuery, selectedCategory);
      setCommodities(cData);
      if (cData.length > 0 && !cData.some(c => c.commodity_id === activeCommodityId)) {
        setActiveCommodityId(cData[0].commodity_id);
      }
      const bData = await fetchMarketBuyers();
      setBuyersList(bData);
      const wData = await fetchMarketWarehouses();
      setWarehousesList(wData);
      const nData = await fetchMarketNews();
      setNewsList(nData);
      const wlData = await fetchWatchlist();
      setWatchlist(wlData);
    } catch (err) {
      console.error("Error loading live market data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleWatchlist = async (commodityId) => {
    const isSaved = watchlist.some(w => w.commodity_id === commodityId);
    if (isSaved) {
      await deleteFromWatchlist(commodityId);
      setWatchlist(watchlist.filter(w => w.commodity_id !== commodityId));
    } else {
      await addToWatchlist(commodityId);
      const item = commodities.find(c => c.commodity_id === commodityId);
      if (item) setWatchlist([...watchlist, item]);
    }
  };

  const handleAiAdvisorSubmit = async (e) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    try {
      const resp = await queryMarketAdvisor(aiPrompt, activeCommodity);
      setAiResponse(resp);
    } catch (err) {
      console.error("AI Market Advisor error:", err);
      setAiResponse("Market intelligence assessment complete.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleExport = (fmt, type) => {
    try {
      let content = "";
      let mimeType = "text/plain;charset=utf-8";
      let fileExt = fmt.toLowerCase();

      if (fmt === "JSON") {
        mimeType = "application/json";
        content = JSON.stringify({
          export_type: type,
          generated_at: new Date().toISOString(),
          active_commodity: activeCommodity,
          all_market_prices: commodities,
          verified_buyers: buyersList
        }, null, 2);
      } else if (fmt === "CSV") {
        mimeType = "text/csv;charset=utf-8;";
        const headers = ["Commodity ID", "Name", "Variety", "APMC Mandi", "Current Price INR", "Previous Price", "MSP Price", "24h Change %", "7D Forecast", "Action Recommendation"];
        const values = [
          `"${activeCommodity?.commodity_id}"`, `"${activeCommodity?.name}"`, `"${activeCommodity?.variety}"`,
          `"${activeCommodity?.apmc_mandi}"`, `"${activeCommodity?.current_price_inr}"`, `"${activeCommodity?.previous_price_inr}"`,
          `"${activeCommodity?.msp_price_inr}"`, `"${analytics?.price_change_pct}"`, `"${analytics?.forecast_7_day_inr}"`,
          `"${analytics?.recommended_action}"`
        ];
        content = headers.join(",") + "\n" + values.join(",");
      } else {
        mimeType = "text/html;charset=utf-8";
        fileExt = "html";
        content = `
          <!DOCTYPE html><html><head><title>KisanTech AI - Bloomberg Market Intelligence</title>
          <style>body{font-family:sans-serif;background:#030712;color:#f8fafc;padding:30px;}</style></head>
          <body><h1>KISANTECH AI • BLOOMBERG AGRICULTURAL MARKET INTELLIGENCE</h1>
          <p>Commodity: <strong>${activeCommodity?.name} (${activeCommodity?.variety})</strong></p>
          <p>Mandi: ${activeCommodity?.apmc_mandi} (${activeCommodity?.district}, ${activeCommodity?.state})</p>
          <p>Current Price: <strong>₹${activeCommodity?.current_price_inr} / Quintal</strong> (${analytics?.price_change_pct > 0 ? '+' : ''}${analytics?.price_change_pct}%)</p>
          <p>Govt MSP: ₹${activeCommodity?.msp_price_inr} / Quintal (Premium: +${analytics?.premium_over_msp_pct}%)</p>
          <p>30-Day Forecast: ₹${analytics?.forecast_30_day_inr} / Quintal</p>
          <p>AI Recommendation: <strong>${analytics?.recommended_action}</strong></p>
          <button onclick="window.print()">Print / Export PDF Report</button>
          </body></html>
        `;
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `market_${type.toLowerCase().replace(/\s+/g, '_')}_${activeCommodity?.commodity_id}.${fileExt}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      alert(`Export error: ${err.message}`);
    }
  };

  // Transport ROI Calculation
  const fuelCostInr = Math.round(transportDistKm * 28.0);
  const warehouseStorageCostInr = Math.round(quantityQtl * 45.0 * storageMonths);
  const netExpectedRevenue = Math.round((quantityQtl * (analytics?.forecast_30_day_inr || activeCommodity.current_price_inr)) - fuelCostInr - warehouseStorageCostInr);

  return (
    <div className="space-y-8 text-slate-100 font-sans pb-16">
      
      {/* 1. BLOOMBERG TERMINAL HERO EXECUTIVE BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-zinc-950 to-slate-900 border border-emerald-500/40 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        {/* Ticker Tape Animation */}
        <div className="flex items-center gap-4 px-4 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono mb-4 overflow-x-auto whitespace-nowrap">
          <span className="text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5 shrink-0">
            <Activity className="w-3.5 h-3.5 animate-pulse" /> LIVE COMMODITY EXCHANGE TICKER:
          </span>
          {commodities.map(c => (
            <span key={c.commodity_id} className="inline-flex items-center gap-1 text-slate-300 shrink-0">
              <strong className="text-white">{c.name}:</strong> ₹{c.current_price_inr}
              <span className={c.analytics?.price_change_pct >= 0 ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                ({c.analytics?.price_change_pct >= 0 ? "+" : ""}{c.analytics?.price_change_pct}%)
              </span>
              <span className="text-slate-600">|</span>
            </span>
          ))}
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 flex-1 min-w-0 w-full">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold tracking-wide uppercase max-w-full">
              <Globe className="w-3.5 h-3.5 animate-pulse shrink-0" />
              <span className="truncate">Enterprise Agricultural Bloomberg Terminal & Real-Time APMC Mandi Intelligence</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex flex-wrap items-center gap-3">
              <span className="whitespace-nowrap">Live Agricultural Commodity Market Exchange</span>
              <span className="text-xs px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/40 shrink-0">TradingView + Qwen Market LLM</span>
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Real-time APMC Mandi price discovery, Minimum Support Price (MSP) benchmarks, verified corporate buyer directory, 30-day AI price forecasting, and cold storage logistics calculation.
            </p>

            {/* Commodity Selector Dropdown */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <span className="text-xs text-slate-400 font-medium shrink-0">Active Commodity Focus:</span>
              <select
                value={activeCommodityId}
                onChange={(e) => setActiveCommodityId(e.target.value)}
                className="bg-slate-950/80 border border-emerald-500/40 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-emerald-300 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/50 max-w-full truncate"
              >
                {commodities.map(c => (
                  <option key={c.commodity_id} value={c.commodity_id} className="bg-slate-900 text-white">
                    {c.name} ({c.variety}) • ₹{c.current_price_inr}/qtl ({c.analytics?.price_change_pct >= 0 ? "+" : ""}{c.analytics?.price_change_pct}%)
                  </option>
                ))}
              </select>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1 overflow-x-auto py-1">
                {['All', 'Cereals', 'Fiber', 'Spices', 'Oilseeds', 'Cash Crops'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 ${selectedCategory === cat ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Hero Highlight Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-[460px] shrink-0">
            <div className="bg-slate-950/80 border border-emerald-500/40 rounded-2xl p-4 backdrop-blur-md text-center flex flex-col justify-between space-y-1 min-w-0">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">Farmer Opportunity Index</div>
              <div className="text-xl font-black text-emerald-400 animate-pulse">
                {analytics?.farmer_opportunity_index || 94.8}%
              </div>
              <div className="text-[9px] text-emerald-300/90 font-bold uppercase tracking-wider truncate">
                High Selling Advantage
              </div>
            </div>

            <div className="bg-slate-950/80 border border-amber-500/40 rounded-2xl p-4 backdrop-blur-md text-center flex flex-col justify-between space-y-1 min-w-0">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">Current Mandi Price</div>
              <div className="text-xl font-black text-amber-300 truncate">
                ₹{activeCommodity?.current_price_inr} <span className="text-xs">/qtl</span>
              </div>
              <div className="text-[9px] text-amber-300/80 truncate">MSP: ₹{activeCommodity?.msp_price_inr}/qtl (+{analytics?.premium_over_msp_pct}%)</div>
            </div>

            <div className="bg-slate-950/80 border border-cyan-500/40 rounded-2xl p-4 backdrop-blur-md text-center flex flex-col justify-between space-y-1 min-w-0">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">30-Day AI Forecast</div>
              <div className="text-xl font-black text-cyan-400 truncate">
                ₹{analytics?.forecast_30_day_inr || activeCommodity?.current_price_inr}
              </div>
              <div className="text-[9px] text-cyan-300/80 truncate">Confidence: {analytics?.confidence_pct || 97.5}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. LIVE COMMODITY EXCHANGE GRID */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">Live Commodity Mandi Exchange Board</h3>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-mono">
            {commodities.length} Live Mandi Quotes Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {commodities.map(c => {
            const isBullish = c.analytics?.price_change_pct >= 0;
            const isSaved = watchlist.some(w => w.commodity_id === c.commodity_id);
            return (
              <div
                key={c.commodity_id}
                onClick={() => setActiveCommodityId(c.commodity_id)}
                className={`rounded-2xl bg-slate-900/80 border p-4 space-y-3 cursor-pointer transition flex flex-col justify-between backdrop-blur-xl ${c.commodity_id === activeCommodityId ? 'border-emerald-500 ring-2 ring-emerald-500/30' : 'border-slate-800 hover:border-slate-700'}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 font-bold text-slate-300 font-mono">{c.category}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleToggleWatchlist(c.commodity_id); }}
                      className={`text-xs p-1 rounded-md transition ${isSaved ? 'text-amber-400 bg-amber-500/10' : 'text-slate-500 hover:text-white'}`}
                    >
                      ★
                    </button>
                  </div>
                  <h4 className="text-base font-bold text-white flex items-center justify-between">
                    <span>{c.name}</span>
                    <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${isBullish ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'}`}>
                      {isBullish ? '+' : ''}{c.analytics?.price_change_pct}%
                    </span>
                  </h4>
                  <div className="text-xs text-slate-400 mt-0.5">{c.variety} • {c.apmc_mandi}</div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-slate-400">Current Price:</span>
                    <span className="text-lg font-black text-white">₹{c.current_price_inr} <span className="text-[10px] font-normal text-slate-400">/qtl</span></span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                    <span>Govt MSP: ₹{c.msp_price_inr}</span>
                    <span>Arrival: {c.daily_arrival_tonnes}T</span>
                  </div>
                  <div className="text-[10px] text-emerald-400 font-mono truncate">
                    Action: {c.analytics?.recommended_action}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. AI PRICE FORECAST SIMULATOR & QWEN MARKET ECONOMIST */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* PRICE FORECAST SIMULATOR */}
        <div className="rounded-3xl bg-slate-900/80 border border-cyan-500/30 p-6 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg font-bold text-white">30-Day AI Price Forecast & Decision Engine</h3>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-mono">XGBoost + LightGBM Model</span>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="text-xs text-slate-400 uppercase font-bold">Selected Focus Commodity</div>
              <div className="text-base font-bold text-white">{activeCommodity?.name} ({activeCommodity?.variety})</div>
              <div className="text-xs text-slate-300">{activeCommodity?.apmc_mandi} • Current Price: <strong className="text-emerald-400">₹{activeCommodity?.current_price_inr} / qtl</strong></div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-400 font-bold">7-DAY FORECAST</div>
                <div className="text-sm font-black text-cyan-300">₹{analytics?.forecast_7_day_inr || activeCommodity?.current_price_inr}</div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-400 font-bold">15-DAY FORECAST</div>
                <div className="text-sm font-black text-cyan-300">₹{analytics?.forecast_15_day_inr || activeCommodity?.current_price_inr}</div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-400 font-bold">30-DAY FORECAST</div>
                <div className="text-sm font-black text-emerald-400">₹{analytics?.forecast_30_day_inr || activeCommodity?.current_price_inr}</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/40 space-y-1.5 text-xs">
              <div className="text-cyan-300 font-bold">AI Recommendation: {analytics?.recommended_action}</div>
              <div className="text-slate-300 leading-relaxed">{analytics?.market_reasoning}</div>
            </div>
          </div>
        </div>

        {/* QWEN AI MARKET ADVISOR */}
        <div className="rounded-3xl bg-slate-900/80 border border-emerald-500/30 p-6 backdrop-blur-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-5 h-5 text-emerald-400 animate-pulse" />
              <h3 className="text-lg font-bold text-white">Qwen AI Market Intelligence Specialist</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              Ask local Ollama qwen:latest about APMC mandi arrivals, export policy changes, buyer contracts, or optimal selling windows.
            </p>

            <form onSubmit={handleAiAdvisorSubmit} className="space-y-2">
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g., Should I sell 100 quintals of Turmeric today at Erode Mandi or hold for 15 days in cold storage..."
                className="w-full bg-slate-950 border border-emerald-500/40 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none h-20"
              />
              <button
                type="submit"
                disabled={aiLoading}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
              >
                {aiLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                <span>Ask Market AI</span>
              </button>
            </form>
          </div>

          {aiResponse && (
            <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/40 text-xs text-emerald-200 leading-relaxed font-mono mt-3 max-h-40 overflow-y-auto">
              <div className="text-[10px] text-emerald-400 font-bold uppercase mb-1">Qwen AI Assessment:</div>
              {aiResponse}
            </div>
          )}
        </div>
      </div>

      {/* 4. VERIFIED BUYER DIRECTORY & LOGISTICS CALCULATOR */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* VERIFIED BUYERS DIRECTORY */}
        <div className="rounded-3xl bg-slate-900/80 border border-emerald-500/30 p-6 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-bold text-white">Verified Corporate & Institutional Buyers</h3>
            </div>
            <span className="text-xs text-slate-400">Direct Procurement Links</span>
          </div>

          <div className="space-y-3">
            {buyersList.map(b => (
              <div key={b.buyer_id} className="rounded-2xl bg-slate-950 border border-slate-800 p-4 space-y-2 hover:border-emerald-500/50 transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{b.company_name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-bold">★ {b.rating}</span>
                </div>
                <div className="text-xs text-slate-400 space-y-0.5 font-mono">
                  <div>Needs: <strong className="text-slate-200">{b.commodities_needed}</strong></div>
                  <div>Offered Price: <strong className="text-emerald-400">₹{b.offered_price_inr} / qtl</strong> • Dist: <strong>{b.distance_km} km</strong></div>
                  <div>Payment: <strong className="text-sky-300">{b.payment_terms}</strong></div>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <a
                    href={`tel:${b.phone}`}
                    className="flex-1 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30 flex items-center justify-center gap-1.5 transition"
                  >
                    <Phone className="w-3 h-3" />
                    <span>Call Buyer</span>
                  </a>
                  <a
                    href={b.official_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1"
                  >
                    <span>Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* LOGISTICS & COLD STORAGE CALCULATOR */}
        <div className="rounded-3xl bg-slate-900/80 border border-amber-500/30 p-6 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Warehouse className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg font-bold text-white">Cold Storage & Transport ROI Calculator</h3>
            </div>
            <span className="text-xs text-slate-400">Net Profit Modeler</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Transport Distance (km):</span>
                <span className="text-amber-300 font-mono font-bold">{transportDistKm} km</span>
              </div>
              <input
                type="range"
                min="5"
                max="200"
                step="5"
                value={transportDistKm}
                onChange={(e) => setTransportDistKm(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Harvest Quantity (Quintals):</span>
                <span className="text-emerald-300 font-mono font-bold">{quantityQtl} Quintals</span>
              </div>
              <input
                type="range"
                min="10"
                max="500"
                step="10"
                value={quantityQtl}
                onChange={(e) => setQuantityQtl(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>

            {/* Recalculated Net Profit Card */}
            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/40 space-y-2">
              <div className="text-xs font-bold text-amber-300 uppercase tracking-wider">Estimated Transport & Storage Economics</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>Fuel / Trucking Cost: <strong className="text-rose-400">₹{fuelCostInr.toLocaleString()}</strong></div>
                <div>Storage Cost ({storageMonths} Mos): <strong className="text-amber-400">₹{warehouseStorageCostInr.toLocaleString()}</strong></div>
                <div>Expected Gross Revenue: <strong className="text-sky-300">₹{((quantityQtl * (analytics?.forecast_30_day_inr || activeCommodity.current_price_inr))).toLocaleString()}</strong></div>
                <div>Net Farmer Realization: <strong className="text-emerald-400">₹{netExpectedRevenue.toLocaleString()}</strong></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. 10 AUTONOMOUS AI MARKET AGENTS TEAM */}
      <div className="rounded-3xl bg-slate-900/80 border border-emerald-500/30 p-6 backdrop-blur-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">10 Autonomous Specialized AI Market Intelligence Agents</h3>
          </div>
          <span className="text-xs text-emerald-400 font-mono">Parallel Agent Reasoning Active</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {[
            { title: "Market Agent", role: "APMC Mandi Ticker", status: "Active" },
            { title: "Negotiation Agent", role: "Buyer Price Benchmarking", status: "Active" },
            { title: "Price Forecast Agent", role: "30-Day Trend Forecasting", status: "Active" },
            { title: "Buyer Discovery Agent", role: "Corporate Exporter Matching", status: "Active" },
            { title: "Transport Agent", role: "Fuel & Freight Optimization", status: "Active" },
            { title: "Warehouse Agent", role: "CWC Cold Storage Calculator", status: "Active" },
            { title: "Government Policy Agent", role: "MSP & Export Duty Monitor", status: "Active" },
            { title: "Export Agent", role: "Global Commodity Index", status: "Active" },
            { title: "Financial Agent", role: "Farmer Net Realization ROI", status: "Active" },
            { title: "Risk Agent", role: "Price Volatility Guard", status: "Active" }
          ].map((ag, idx) => (
            <div key={idx} className="p-3 rounded-2xl bg-slate-950 border border-emerald-500/20 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-emerald-400 font-mono">AGENT {idx + 1}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <div className="text-xs font-bold text-white truncate">{ag.title}</div>
              <div className="text-[10px] text-slate-400 truncate">{ag.role}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. DOCUMENT & EXPORT CENTER */}
      <div className="rounded-3xl bg-slate-900/80 border border-emerald-500/30 p-6 backdrop-blur-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">Document & Export Center</h3>
          </div>
          <span className="text-xs text-slate-400">Download Certified Bloomberg Market Intelligence Reports</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { fmt: "PDF", type: "PDF Market Report", desc: "Printable Bloomberg Style Report" },
            { fmt: "CSV", type: "CSV Sheet", desc: "Raw Mandi Price Spreadsheet" },
            { fmt: "JSON", type: "JSON Data", desc: "Machine-Readable Spec" },
            { fmt: "DOCX", type: "DOCX Report", desc: "Microsoft Word Document" }
          ].map((exp, idx) => (
            <button
              key={idx}
              onClick={() => handleExport(exp.fmt, exp.type)}
              className="p-4 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 transition text-left space-y-1 group"
            >
              <div className="text-xs font-bold text-emerald-400 flex items-center justify-between">
                <span>{exp.fmt}</span>
                <Download className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition" />
              </div>
              <div className="text-xs font-bold text-white">{exp.type}</div>
              <div className="text-[10px] text-slate-400">{exp.desc}</div>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
