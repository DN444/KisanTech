import React, { useState, useEffect } from 'react';
import {
  TrendingUp, Users, DollarSign, LineChart, Warehouse, Truck,
  ArrowUpRight, ArrowDownRight, MapPin, CheckCircle, Search, Phone, ExternalLink,
  Sliders, Activity, ShieldCheck, Zap, Layers, FileText, Download, Eye, Star,
  PlusCircle, RefreshCw, Globe, ChevronRight, AlertCircle, ShoppingBag, Calculator
} from 'lucide-react';
import LiveMarketTab from './LiveMarketTab';
import SellProduceTab from './SellProduceTab';
import WarehouseStorageTab from './WarehouseStorageTab';
import {
  fetchMarketCommodities, fetchMarketBuyers, fetchMarketWarehouses, fetchMarketNews,
  fetchWatchlist, addToWatchlist, deleteFromWatchlist, queryMarketAdvisor,
  FALLBACK_MARKET_COMMODITIES, FALLBACK_MARKET_BUYERS, FALLBACK_MARKET_WAREHOUSES, FALLBACK_MARKET_NEWS
} from '../../services/liveMarketService';

export const MarketTabs = ({ subTab }) => {
  const [commodities, setCommodities] = useState(FALLBACK_MARKET_COMMODITIES);
  const [buyers, setBuyers] = useState(FALLBACK_MARKET_BUYERS);
  const [warehouses, setWarehouses] = useState(FALLBACK_MARKET_WAREHOUSES);
  const [news, setNews] = useState(FALLBACK_MARKET_NEWS);
  const [watchlist, setWatchlist] = useState([]);
  const [distanceKm, setDistanceKm] = useState(185);
  const [truckType, setTruckType] = useState('Heavy Truck (10 Tonne)');
  const [origin, setOrigin] = useState('Vellore Precision Farm Plot #1');
  const [destination, setDestination] = useState('Erode Mandi Hub');

  useEffect(() => {
    loadMarketData();
  }, []);

  const loadMarketData = async () => {
    try {
      const c = await fetchMarketCommodities();
      setCommodities(c);
      const b = await fetchMarketBuyers();
      setBuyers(b);
      const w = await fetchMarketWarehouses();
      setWarehouses(w);
      const n = await fetchMarketNews();
      setNews(n);
      const wl = await fetchWatchlist();
      setWatchlist(wl);
    } catch (err) {
      console.error("Market data load error:", err);
    }
  };

  const handleToggleWatchlist = async (id) => {
    const isSaved = watchlist.some(w => w.commodity_id === id);
    if (isSaved) {
      await deleteFromWatchlist(id);
      setWatchlist(watchlist.filter(w => w.commodity_id !== id));
    } else {
      await addToWatchlist(id);
      const item = commodities.find(c => c.commodity_id === id);
      if (item) setWatchlist([...watchlist, item]);
    }
  };

  // 1. LIVE MARKET SUB-TAB VIEW
  if (subTab === 'live-market' || !subTab) {
    return <LiveMarketTab />;
  }

  // 2. BUYER MARKETPLACE SUB-TAB VIEW
  if (subTab === 'buyer-marketplace') {
    return (
      <div className="space-y-6 text-slate-100 font-sans pb-12">
        <div className="rounded-3xl bg-slate-900/80 border border-emerald-500/30 p-6 backdrop-blur-xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            <Users className="w-3.5 h-3.5" /> B2B Verified Buyer Directory
          </div>
          <h2 className="text-2xl font-black text-white">Verified Wholesale Corporate & Exporter Directory</h2>
          <p className="text-xs text-slate-300 max-w-xl">
            Direct bulk procurement buyers, food processing industries, and accredited exporters offering premium price contracts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {buyers.map(b => (
            <div key={b.buyer_id} className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-3 hover:border-emerald-500/50 transition">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-white">{b.company_name}</h4>
                  <span className="text-[10px] text-slate-400">{b.category} • {b.district}, {b.state}</span>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-bold">
                  ★ {b.rating} Rating
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
                <div className="text-slate-300">Commodities Needed: <strong className="text-emerald-400">{b.commodities_needed}</strong></div>
                <div className="text-slate-300">Offered Rate: <strong className="text-amber-300">₹{b.offered_price_inr} / Quintal</strong></div>
                <div className="text-slate-300">Payment Terms: <strong className="text-cyan-300">{b.payment_terms}</strong></div>
                <div className="text-slate-400">Distance from Farm: <strong>{b.distance_km} km</strong></div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <a
                  href={`tel:${b.phone}`}
                  className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Buyer Direct</span>
                </a>
                <a
                  href={b.official_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1"
                >
                  <span>Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 3. SELL PRODUCE SUB-TAB VIEW
  if (subTab === 'sell-produce') {
    return <SellProduceTab />;
  }

  // 4. PRICE PREDICTION SUB-TAB VIEW
  if (subTab === 'price-prediction') {
    return (
      <div className="space-y-6 text-slate-100 font-sans pb-12">
        <div className="rounded-3xl bg-slate-900/80 border border-cyan-500/30 p-6 backdrop-blur-xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
            <LineChart className="w-3.5 h-3.5" /> Time Series Forecasting Engine
          </div>
          <h2 className="text-2xl font-black text-white">AI Commodity Price Forecast & Trend Analytics</h2>
          <p className="text-xs text-slate-300 max-w-xl">
            Predictive price curves trained on 10 years of APMC mandi historical arrivals, weather patterns, and export policies.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {commodities.map(c => (
            <div key={c.commodity_id} className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-base font-bold text-white">{c.name}</h4>
                <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 font-mono font-bold">
                  {c.analytics?.confidence_pct}% AI Confidence
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Current APMC Rate:</span>
                  <strong className="text-white">₹{c.current_price_inr} / Qtl</strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>7-Day Projection:</span>
                  <strong className="text-cyan-300">₹{c.analytics?.forecast_7_day_inr} / Qtl</strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>15-Day Projection:</span>
                  <strong className="text-cyan-300">₹{c.analytics?.forecast_15_day_inr} / Qtl</strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>30-Day Peak Target:</span>
                  <strong className="text-emerald-400">₹{c.analytics?.forecast_30_day_inr} / Qtl</strong>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/30 text-xs text-cyan-200">
                <strong>Recommendation:</strong> {c.analytics?.recommended_action}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 5. STORAGE & WAREHOUSE SUB-TAB VIEW
  if (subTab === 'storage-warehouse') {
    return <WarehouseStorageTab />;
  }

  // 6. TRANSPORT PLANNING SUB-TAB VIEW
  if (subTab === 'transport-planning') {
    return (
      <div className="space-y-6 text-slate-100 font-sans pb-12">
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 backdrop-blur-xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold">
            <Truck className="w-3.5 h-3.5" /> Logistics Freight Engine
          </div>
          <h2 className="text-2xl font-black text-white">Logistics & Truck Transport Route Planner</h2>
          <p className="text-xs text-slate-300 max-w-xl">
            Calculate freight trucking costs (₹/km), optimize road transport routes from farm gate to APMC Mandis, and model net profit margins.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 space-y-4 text-xs">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-400" />
              <span>Route & Vehicle Parameters</span>
            </h3>

            <div>
              <label className="text-slate-400 block mb-1">Pick Up Point:</label>
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Destination Mandi Hub:</label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Distance (km):</span>
                <span className="text-amber-300 font-mono font-bold">{distanceKm} km</span>
              </div>
              <input
                type="range"
                min="10"
                max="500"
                step="5"
                value={distanceKm}
                onChange={(e) => setDistanceKm(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Select Transport Vehicle:</label>
              <select
                value={truckType}
                onChange={(e) => setTruckType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
              >
                <option value="Mini Truck (1.5 Tonne)">Mini Truck (1.5 Tonne)</option>
                <option value="Heavy Truck (10 Tonne)">Heavy Truck (10 Tonne)</option>
                <option value="Cold Chain Reefer Truck">Cold Chain Reefer Truck</option>
              </select>
            </div>
          </div>

          <div className="rounded-3xl bg-slate-900/80 border border-emerald-500/30 p-6 space-y-4 text-xs flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-white mb-3">Freight & Profit Margin Model</h3>
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Estimated Fuel & Driver Cost:</span>
                  <strong className="text-rose-400">₹{(distanceKm * 28).toLocaleString()}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Loading / Unloading Charges:</span>
                  <strong className="text-amber-400">₹ 1,500</strong>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-2">
                  <span className="text-slate-300 font-bold">Total Freight Investment:</span>
                  <strong className="text-white text-sm">₹{(distanceKm * 28 + 1500).toLocaleString()}</strong>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/40 space-y-1">
              <div className="text-emerald-300 font-bold">Estimated Net Realization:</div>
              <div className="text-lg font-black text-emerald-400">₹{(100 * 2380 - (distanceKm * 28 + 1500)).toLocaleString()}</div>
              <div className="text-[10px] text-slate-400">Based on 100 Qtl sale @ ₹2,380/Qtl after logistics deduction.</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
