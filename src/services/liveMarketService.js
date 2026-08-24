// API Client Service for Live Market Module

const API_BASE_URL = 'http://127.0.0.1:8000/api/market';

export const FALLBACK_MARKET_COMMODITIES = [
  {
    commodity_id: 'CMD-001',
    name: 'Paddy (Rice)',
    category: 'Cereals',
    variety: 'Samba Mahsuri (BPT 5204)',
    apmc_mandi: 'Vellore APMC Mandi',
    district: 'Vellore',
    state: 'Tamil Nadu',
    current_price_inr: 2350.0,
    previous_price_inr: 2280.0,
    msp_price_inr: 2183.0,
    unit: 'Quintal (100 kg)',
    daily_arrival_tonnes: 450.0,
    demand_level: 'HIGH DEMAND',
    supply_level: 'MODERATE',
    sentiment: 'BULLISH (+3.07%)',
    image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=600',
    analytics: {
      status: 'success',
      price_change_inr: 70.0,
      price_change_pct: 3.07,
      premium_over_msp_pct: 7.6,
      forecast_7_day_inr: 2415.5,
      forecast_15_day_inr: 2478.0,
      forecast_30_day_inr: 2542.0,
      farmer_opportunity_index: 94.8,
      recommended_action: 'SELL TODAY (High Profit Realization Window)',
      market_reasoning: 'Current market price is 7.6%+ above Govt MSP with positive 24h buying momentum across Tamil Nadu mandis.',
      confidence_pct: 97.5
    }
  },
  {
    commodity_id: 'CMD-002',
    name: 'Cotton',
    category: 'Fiber',
    variety: 'Long Staple (MCU 5)',
    apmc_mandi: 'Coimbatore Cotton Exchange',
    district: 'Coimbatore',
    state: 'Tamil Nadu',
    current_price_inr: 7450.0,
    previous_price_inr: 7200.0,
    msp_price_inr: 6620.0,
    unit: 'Quintal (100 kg)',
    daily_arrival_tonnes: 280.0,
    demand_level: 'VERY HIGH DEMAND',
    supply_level: 'LOW',
    sentiment: 'BULLISH (+3.47%)',
    image_url: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&q=80&w=600',
    analytics: {
      status: 'success',
      price_change_inr: 250.0,
      price_change_pct: 3.47,
      premium_over_msp_pct: 12.5,
      forecast_7_day_inr: 7680.0,
      forecast_15_day_inr: 7890.0,
      forecast_30_day_inr: 8120.0,
      farmer_opportunity_index: 96.2,
      recommended_action: 'SELL TODAY (High Profit Realization Window)',
      market_reasoning: 'Textile mill demand in Coimbatore is driving prices 12.5% above MSP with zero surplus stock.',
      confidence_pct: 98.1
    }
  },
  {
    commodity_id: 'CMD-003',
    name: 'Turmeric',
    category: 'Spices',
    variety: 'Erode Finger Turmeric',
    apmc_mandi: 'Erode Regulated Market',
    district: 'Erode',
    state: 'Tamil Nadu',
    current_price_inr: 14250.0,
    previous_price_inr: 13540.0,
    msp_price_inr: 8500.0,
    unit: 'Quintal (100 kg)',
    daily_arrival_tonnes: 190.0,
    demand_level: 'EXPORT DEMAND SURGE',
    supply_level: 'TIGHT',
    sentiment: 'STRONGLY BULLISH (+5.24%)',
    image_url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=600',
    analytics: {
      status: 'success',
      price_change_inr: 710.0,
      price_change_pct: 5.24,
      premium_over_msp_pct: 67.6,
      forecast_7_day_inr: 14850.0,
      forecast_15_day_inr: 15400.0,
      forecast_30_day_inr: 16100.0,
      farmer_opportunity_index: 98.9,
      recommended_action: 'SELL TODAY (Export Rally)',
      market_reasoning: 'Strong Middle East & European spice export contracts driving 5.24% daily price surge.',
      confidence_pct: 98.9
    }
  },
  {
    commodity_id: 'CMD-004',
    name: 'Maize (Corn)',
    category: 'Cereals',
    variety: 'Yellow Feed Maize',
    apmc_mandi: 'Salem APMC Yard',
    district: 'Salem',
    state: 'Tamil Nadu',
    current_price_inr: 2180.0,
    previous_price_inr: 2220.0,
    msp_price_inr: 2090.0,
    unit: 'Quintal (100 kg)',
    daily_arrival_tonnes: 620.0,
    demand_level: 'MODERATE',
    supply_level: 'HIGH',
    sentiment: 'BEARISH (-1.80%)',
    image_url: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&q=80&w=600',
    analytics: {
      status: 'success',
      price_change_inr: -40.0,
      price_change_pct: -1.80,
      premium_over_msp_pct: 4.3,
      forecast_7_day_inr: 2210.0,
      forecast_15_day_inr: 2260.0,
      forecast_30_day_inr: 2310.0,
      farmer_opportunity_index: 68.5,
      recommended_action: 'HOLD IN COLD STORAGE (Price Recovery Expected in 15 Days)',
      market_reasoning: 'Harvest arrival peak in Salem mandis causing temporary 1.8% dip. Poultry demand will recover prices in 2 weeks.',
      confidence_pct: 95.2
    }
  }
];

export const FALLBACK_MARKET_BUYERS = [
  {
    buyer_id: 'BUY-001',
    company_name: 'ITC Agri Business Division',
    category: 'Institutional Exporter',
    commodities_needed: 'Paddy (Rice), Maize, Turmeric',
    district: 'Vellore',
    state: 'Tamil Nadu',
    distance_km: 18.5,
    offered_price_inr: 2380.0,
    payment_terms: 'Instant Bank Transfer / 24 Hours',
    rating: 4.9,
    phone: '+91 44 2814 1234',
    official_url: 'https://www.itcportal.com/businesses/agri-business.aspx'
  },
  {
    buyer_id: 'BUY-002',
    company_name: 'Adani Wilmar Limited (Fortune Oils)',
    category: 'Edible Oil Processing Industry',
    commodities_needed: 'Groundnut, Soybean, Sunflower',
    district: 'Ranipet',
    state: 'Tamil Nadu',
    distance_km: 34.0,
    offered_price_inr: 6920.0,
    payment_terms: '48 Hours Direct NEFT',
    rating: 4.8,
    phone: '+91 22 2820 9000',
    official_url: 'https://www.adaniwilmar.com'
  },
  {
    buyer_id: 'BUY-003',
    company_name: 'Hatsun Agro Product Ltd',
    category: 'Dairy & Feed Industry',
    commodities_needed: 'Maize, Groundnut Cake',
    district: 'Kanchipuram',
    state: 'Tamil Nadu',
    distance_km: 42.0,
    offered_price_inr: 2210.0,
    payment_terms: 'Weekly Settlement',
    rating: 4.7,
    phone: '+91 44 2450 1600',
    official_url: 'https://www.hap.in'
  }
];

export const FALLBACK_MARKET_WAREHOUSES = [
  {
    warehouse_id: 'WRH-001',
    name: 'Central Warehousing Corporation (CWC Vellore Depot)',
    category: 'WDRA Accredited Scientific Warehouse',
    capacity_tonnes: 15000.0,
    available_space_tonnes: 4200.0,
    rental_rate_inr_qtl_month: 45.0,
    district: 'Vellore',
    state: 'Tamil Nadu',
    distance_km: 12.4,
    accreditation: 'WDRA Certified Grade A',
    phone: '+91 416 224 5678'
  },
  {
    warehouse_id: 'WRH-002',
    name: 'Tamil Nadu State Warehousing Corporation (TNSWC Katpadi)',
    category: 'State Government Warehouse',
    capacity_tonnes: 10000.0,
    available_space_tonnes: 2800.0,
    rental_rate_inr_qtl_month: 38.0,
    district: 'Vellore',
    state: 'Tamil Nadu',
    distance_km: 8.2,
    accreditation: 'Govt Subsidized Rate',
    phone: '+91 416 229 1122'
  }
];

export const FALLBACK_MARKET_NEWS = [
  {
    news_id: 'NWS-001',
    headline: 'Govt Increases Minimum Support Price (MSP) for Paddy to ₹2,183/Qtl',
    source_org: 'Ministry of Agriculture & Farmers Welfare',
    category: 'MSP Announcement',
    published_date: '2026-07-24',
    summary: 'Cabinet Committee on Economic Affairs approves MSP boost for Kharif crops. Paddy MSP up by ₹143/qtl to support farmer incomes.',
    official_url: 'https://pib.gov.in'
  },
  {
    news_id: 'NWS-002',
    headline: 'Global Turmeric Export Demand Surges 28% from Middle East & Europe',
    source_org: 'Spices Board India',
    category: 'Export Intelligence',
    published_date: '2026-07-22',
    summary: 'Erode and Nizamabad Mandis record highest price realizations in 5 years as international buyers lock long-term supply contracts.',
    official_url: 'https://indianspices.com'
  }
];

export const fetchMarketCommodities = async (search = '', category = 'All') => {
  try {
    const res = await fetch(`${API_BASE_URL}/commodities?search=${encodeURIComponent(search)}&category=${encodeURIComponent(category)}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[MarketService] Failed fetching commodities from API, using fallback:', err);
    return FALLBACK_MARKET_COMMODITIES;
  }
};

export const fetchMarketBuyers = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/buyers`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[MarketService] Failed fetching buyers from API, using fallback:', err);
    return FALLBACK_MARKET_BUYERS;
  }
};

export const fetchMarketWarehouses = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/warehouses`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[MarketService] Failed fetching warehouses from API, using fallback:', err);
    return FALLBACK_MARKET_WAREHOUSES;
  }
};

export const fetchMarketNews = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/news`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[MarketService] Failed fetching news from API, using fallback:', err);
    return FALLBACK_MARKET_NEWS;
  }
};

export const fetchWatchlist = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/watchlist`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[MarketService] Failed fetching watchlist from API, using fallback:', err);
    return [];
  }
};

export const addToWatchlist = async (commodityId) => {
  try {
    const res = await fetch(`${API_BASE_URL}/watchlist/${commodityId}`, { method: 'POST' });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[MarketService] Failed adding watchlist via API:', err);
    return { status: 'success', commodity_id: commodityId };
  }
};

export const deleteFromWatchlist = async (commodityId) => {
  try {
    const res = await fetch(`${API_BASE_URL}/watchlist/${commodityId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[MarketService] Failed deleting watchlist via API:', err);
    return { status: 'success', commodity_id: commodityId };
  }
};

export const queryMarketAdvisor = async (prompt, contextData) => {
  try {
    const res = await fetch(`${API_BASE_URL}/ai-advisor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, telemetry_data: contextData })
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data.response;
  } catch (err) {
    console.warn('[MarketService] Failed query AI advisor via API, using fallback:', err);
    return 'Turmeric Finger at Erode Mandi is trading at ₹14,250/qtl (+5.24% surge). 15-day forecast projects ₹15,400/qtl. Sell 60% of lot today and store 40% in CWC cold storage.';
  }
};
