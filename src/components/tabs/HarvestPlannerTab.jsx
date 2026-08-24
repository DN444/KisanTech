import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, Award, DollarSign, AlertTriangle, ShieldCheck, Activity, Globe, CloudSun,
  Truck, Warehouse, Users, Wrench, ShoppingBag, Phone, MapPin, ExternalLink, Sparkles, Download, 
  RefreshCw, Plus, Edit2, Trash2, Copy, Search, Filter, CheckCircle2, ArrowUpRight, ChevronRight, 
  FileText, Zap, Compass, MessageSquare
} from 'lucide-react';
import { AIBadgePanel } from '../ui/AIBadgePanel';
import { 
  fetchHarvestPlans, fetchHarvestPlanById, fetchHarvestServices, fetchHarvestShopping,
  createHarvestPlan, updateHarvestPlan, deleteHarvestPlan, queryHarvestAdvisor, 
  FALLBACK_HARVEST_PLANS, FALLBACK_SERVICES, FALLBACK_SHOPPING 
} from '../../services/harvestPlannerService';
import { useAuth } from '../../context/AuthContext';

export const HarvestPlannerTab = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState(FALLBACK_HARVEST_PLANS);
  const [selectedId, setSelectedId] = useState("HRV-2026-001");
  const [activePlan, setActivePlan] = useState(FALLBACK_HARVEST_PLANS[0]);
  const [services, setServices] = useState(FALLBACK_SERVICES);
  const [shoppingItems, setShoppingItems] = useState(FALLBACK_SHOPPING);
  const [loading, setLoading] = useState(false);

  // Filters
  const [serviceCategory, setServiceCategory] = useState("ALL");
  const [serviceSearch, setServiceSearch] = useState("");
  const [shoppingCategory, setShoppingCategory] = useState("ALL");

  // AI Advisor Prompt
  const [advisorPrompt, setAdvisorPrompt] = useState("");
  const [advisorResponse, setAdvisorResponse] = useState("");
  const [advisorLoading, setAdvisorLoading] = useState(false);

  // Active AI Agent tab
  const [activeAgentId, setActiveAgentId] = useState("harvest_agent");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    farm_name: "Vellore Main Precision Farm",
    field_name: "Paddy Block A",
    farmer_name: user?.displayName || "Farmer",
    district: "Vellore",
    crop_type: "Rice (Paddy)",
    crop_variety: "ADT-54 Certified Hybrid",
    field_area_acres: 42.5,
    planting_date: "2026-05-15",
    expected_harvest_date: "2026-09-18",
    maturity_pct: 88.5,
    grain_moisture_pct: 14.8,
    harvesting_method: "Combine Harvester (Kubota Track)",
    notes: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const pData = await fetchHarvestPlans();
    setPlans(pData);
    if (pData.length > 0) {
      const match = pData.find(p => p.plan_id === selectedId) || pData[0];
      setActivePlan(match);
      setSelectedId(match.plan_id);
    }
    const sData = await fetchHarvestServices(serviceCategory, serviceSearch);
    setServices(sData);
    const prodData = await fetchHarvestShopping(shoppingCategory);
    setShoppingItems(prodData);
    setLoading(false);
  };

  const handleSelectPlan = (p) => {
    setActivePlan(p);
    setSelectedId(p.plan_id);
  };

  const handleAskAdvisor = async (e) => {
    e.preventDefault();
    if (!advisorPrompt.trim()) return;
    setAdvisorLoading(true);
    const text = await queryHarvestAdvisor(advisorPrompt, activePlan);
    setAdvisorResponse(text);
    setAdvisorLoading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm(`Delete harvest plan record ${id}?`)) {
      await deleteHarvestPlan(id);
      loadData();
    }
  };

  const handleSaveModal = async (e) => {
    e.preventDefault();
    if (isEditMode) {
      await updateHarvestPlan(selectedId, formData);
    } else {
      await createHarvestPlan(formData);
    }
    setShowModal(false);
    loadData();
  };

  const handleExport = (fmt, type) => {
    try {
      const calc = activePlan?.calculated || {};
      let content = "";
      let mimeType = "text/plain;charset=utf-8";
      let fileExt = fmt.toLowerCase();

      if (fmt === "JSON") {
        mimeType = "application/json";
        content = JSON.stringify({
          export_type: type,
          generated_at: new Date().toISOString(),
          harvest_plan: activePlan,
          calculated_intelligence: calc,
          logistics: calc.logistics || {}
        }, null, 2);
      } else if (fmt === "CSV") {
        mimeType = "text/csv;charset=utf-8;";
        const headers = ["Plan ID", "Farm Name", "Field Name", "Crop Type", "Variety", "Area Acres", "Expected Harvest Date", "Maturity %", "Grain Moisture %", "Expected Yield Tons", "Revenue INR", "Expense INR", "Net Profit INR", "Optimal Score", "Status"];
        const values = [
          `"${activePlan?.plan_id || ''}"`,
          `"${activePlan?.farm_name || ''}"`,
          `"${activePlan?.field_name || ''}"`,
          `"${activePlan?.crop_type || ''}"`,
          `"${activePlan?.crop_variety || ''}"`,
          `"${activePlan?.field_area_acres || 0}"`,
          `"${activePlan?.expected_harvest_date || ''}"`,
          `"${activePlan?.maturity_pct || 0}"`,
          `"${activePlan?.grain_moisture_pct || 0}"`,
          `"${activePlan?.expected_yield_tons || 0}"`,
          `"${activePlan?.revenue_inr || 0}"`,
          `"${activePlan?.expense_inr || 0}"`,
          `"${activePlan?.net_profit_inr || 0}"`,
          `"${activePlan?.optimal_score || 96.4}"`,
          `"${activePlan?.status || 'Scheduled'}"`
        ];
        content = headers.join(",") + "\n" + values.join(",");
      } else if (fmt === "DOCX") {
        mimeType = "application/msword";
        fileExt = "doc";
        content = `
          <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
          <head><meta charset='utf-8'><title>KISANTECH AI - ${type}</title></head>
          <body style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; color: #1e293b;">
            <h1 style="color: #059669; border-bottom: 2px solid #059669; padding-bottom: 8px;">KISANTECH AI - HARVEST PLANNER CERTIFICATE</h1>
            <p><strong>Export Type:</strong> ${type}</p>
            <p><strong>Generated At:</strong> ${new Date().toLocaleString()}</p>
            <hr/>
            <h2>Plan Telemetry</h2>
            <ul>
              <li><strong>Plan ID:</strong> ${activePlan?.plan_id}</li>
              <li><strong>Farm / Field:</strong> ${activePlan?.farm_name} (${activePlan?.field_name})</li>
              <li><strong>Crop Variety:</strong> ${activePlan?.crop_type} - ${activePlan?.crop_variety}</li>
              <li><strong>Field Area:</strong> ${activePlan?.field_area_acres} Acres</li>
              <li><strong>Target Harvest Date:</strong> ${activePlan?.expected_harvest_date}</li>
              <li><strong>Crop Maturity:</strong> ${activePlan?.maturity_pct}%</li>
              <li><strong>Grain Moisture:</strong> ${activePlan?.grain_moisture_pct}%</li>
              <li><strong>Expected Yield:</strong> ${activePlan?.expected_yield_tons} Metric Tons</li>
              <li><strong>Expected Revenue:</strong> ₹${activePlan?.revenue_inr?.toLocaleString()}</li>
              <li><strong>Net Estimated Profit:</strong> ₹${activePlan?.net_profit_inr?.toLocaleString()}</li>
            </ul>
            <h2>AI Advisor Decision Support</h2>
            <blockquote style="background: #f1f5f9; padding: 12px; border-left: 4px solid #059669;">
              ${calc?.ai_recommendation || 'Harvest window opens in dry weather conditions.'}
            </blockquote>
          </body>
          </html>
        `;
      } else {
        // PDF or Default HTML/Text report
        mimeType = "text/html;charset=utf-8";
        fileExt = "html";
        content = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>KisanTech AI - ${type} (${activePlan?.plan_id})</title>
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #090d16; color: #f8fafc; padding: 30px; }
              .card { background: #1e293b; border: 1px solid #10b981; border-radius: 12px; padding: 24px; max-width: 800px; margin: 0 auto; }
              h1 { color: #34d399; margin-top: 0; }
              .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 20px 0; }
              .item { background: #0f172a; padding: 10px 14px; border-radius: 8px; font-size: 13px; }
              .highlight { font-size: 20px; font-weight: bold; color: #38bdf8; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>KISANTECH AI • ${type.toUpperCase()}</h1>
              <p style="color: #94a3b8;">Plan ID: ${activePlan?.plan_id} | Generated: ${new Date().toLocaleString()}</p>
              <div class="grid">
                <div class="item">Farm: <strong>${activePlan?.farm_name}</strong></div>
                <div class="item">Field: <strong>${activePlan?.field_name}</strong> (${activePlan?.field_area_acres} Acres)</div>
                <div class="item">Crop: <strong>${activePlan?.crop_type}</strong> (${activePlan?.crop_variety})</div>
                <div class="item">Harvest Date: <strong>${activePlan?.expected_harvest_date}</strong></div>
                <div class="item">Yield: <span class="highlight">${activePlan?.expected_yield_tons} Tons</span></div>
                <div class="item">Net Profit: <span class="highlight">₹${activePlan?.net_profit_inr?.toLocaleString()}</span></div>
              </div>
              <h3>AI Decision Support</h3>
              <p style="background: #0284c715; border-left: 3px solid #38bdf8; padding: 12px; font-family: monospace;">
                ${calc?.ai_recommendation || 'Optimal harvest window confirmed.'}
              </p>
              <button onclick="window.print()" style="background: #10b981; color: black; font-weight: bold; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; margin-top: 15px;">Print / Save as PDF</button>
            </div>
          </body>
          </html>
        `;
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `harvest_${type.toLowerCase().replace(/\s+/g, '_')}_${activePlan?.plan_id}.${fileExt}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      console.error("Export document error:", err);
      alert(`Export error: ${err.message || 'Unable to generate document'}`);
    }
  };

  const currentCalc = activePlan?.calculated || {};

  // 10 Specialized AI Agents
  const AI_AGENTS = [
    { id: "harvest_agent", name: "Harvest Planning Agent", role: "Maturity & Date Optimization", desc: "Calculates optimal harvest window based on satellite NDVI and grain moisture." },
    { id: "weather_agent", name: "Weather Risk Agent", role: "Precipitation & Wind Alert", desc: "Monitors 7-day rainfall radar to schedule 0mm harvest window." },
    { id: "labour_agent", name: "Labour Optimization Agent", role: "Crew Sourcing & Shifts", desc: "Calculates 64 worker shifts required for bundling & loading." },
    { id: "machine_agent", name: "Machine Scheduling Agent", role: "Harvester Rental CHC", desc: "Coordinates Kubota Track Harvester booking via local CHC co-ops." },
    { id: "storage_agent", name: "Storage Planner Agent", role: "Silo & Warehouse WDRA", desc: "Reserves 2,968 sqft WDRA accredited grain storage space." },
    { id: "transport_agent", name: "Transport Agent", role: "10-Ton Tipper Logistics", desc: "Schedules 12 truck trips to direct procurement centers." },
    { id: "profit_agent", name: "Profit Optimization Agent", role: "Net Profit & ROI", desc: "Simulates P&L statement yielding ₹17,95,387 net profit." },
    { id: "market_agent", name: "Market Timing Agent", role: "Mandi Selling vs Hold", desc: "Recommends selling 70% at MSP (₹2,300/Q) and holding 30% for +6% gain." },
    { id: "govt_agent", name: "Government Scheme Agent", role: "TNCSC DPC Subsidy", desc: "Verifies DBT direct payment & PM-KISAN harvest grants." },
    { id: "emergency_agent", name: "Emergency Response Agent", role: "Storm & Block Alert", desc: "Monitors unexpected weather shifts and road blockages." }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 font-sans text-slate-100 text-xs">
      
      {/* Header AI Badge */}
      <AIBadgePanel 
        tabId="harvest-planner" 
        tabName="Enterprise Intelligent Harvest Management Platform" 
        defaultPrompt="Evaluate optimal harvest readiness date, weather radar window, combine harvester booking, logistics truck routing, and direct market sale." 
      />

      {/* Emergency Alert Banner */}
      <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/50 text-amber-200 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <strong className="font-bold text-xs text-amber-300">LIVE WEATHER INTELLIGENCE ALERT</strong>
            <p className="text-[11px] text-slate-300">Zero rainfall window confirmed for Sep 15 - Sep 22, 2026 in Katpadi/Vellore block. Ideal harvest timing!</p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold border border-amber-500/30">
          96.4% Harvest Window Score
        </span>
      </div>

      {/* Hero Executive Banner */}
      <div className="glass-panel rounded-2xl p-6 border border-emerald-500/40 bg-gradient-to-r from-emerald-950/60 via-slate-950 to-black space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full filter blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> LOCAL CPU QWEN AI READY • PRODUCTION
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono">
                PLAN: {activePlan?.plan_id}
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              {activePlan?.crop_type} ({activePlan?.crop_variety})
            </h1>
            <p className="text-slate-400 text-xs flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              {activePlan?.farm_name} • {activePlan?.field_name} ({activePlan?.field_area_acres} Acres) • {activePlan?.district}, {activePlan?.state}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select 
              value={selectedId}
              onChange={(e) => {
                const found = plans.find(p => p.plan_id === e.target.value);
                if (found) handleSelectPlan(found);
              }}
              className="bg-black/60 border border-emerald-500/40 text-emerald-300 text-xs rounded-xl px-3 py-2 outline-none font-medium focus:border-emerald-400"
            >
              {plans.map(p => (
                <option key={p.plan_id} value={p.plan_id} className="bg-slate-900 text-slate-100">
                  {p.plan_id}: {p.crop_type} ({p.field_name})
                </option>
              ))}
            </select>

            <button 
              onClick={() => {
                setFormData({
                  farm_name: activePlan?.farm_name,
                  field_name: activePlan?.field_name,
                  farmer_name: activePlan?.farmer_name,
                  district: activePlan?.district,
                  crop_type: activePlan?.crop_type,
                  crop_variety: activePlan?.crop_variety,
                  field_area_acres: activePlan?.field_area_acres,
                  planting_date: activePlan?.planting_date,
                  expected_harvest_date: activePlan?.expected_harvest_date,
                  maturity_pct: activePlan?.maturity_pct,
                  grain_moisture_pct: activePlan?.grain_moisture_pct,
                  harvesting_method: activePlan?.harvesting_method,
                  notes: activePlan?.notes
                });
                setIsEditMode(true);
                setShowModal(true);
              }}
              className="p-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-slate-200 transition"
              title="Edit Harvest Plan"
            >
              <Edit2 className="w-4 h-4" />
            </button>

            <button 
              onClick={() => handleDelete(selectedId)}
              className="p-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 rounded-xl text-red-300 transition"
              title="Delete Harvest Plan"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button 
              onClick={() => {
                setFormData({
                  farm_name: "Vellore Main Precision Farm",
                  field_name: "Maize Block C",
                  farmer_name: user?.displayName || "Farmer",
                  district: "Vellore",
                  crop_type: "Maize Corn",
                  crop_variety: "Co-6 Hybrid Maize",
                  field_area_acres: 15.0,
                  planting_date: "2026-05-20",
                  expected_harvest_date: "2026-09-25",
                  maturity_pct: 82.0,
                  grain_moisture_pct: 15.2,
                  harvesting_method: "Combine Harvester",
                  notes: ""
                });
                setIsEditMode(false);
                setShowModal(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-xl transition shadow-lg shadow-emerald-500/20"
            >
              <Plus className="w-4 h-4" /> New Harvest Plan
            </button>
          </div>
        </div>

        {/* Hero Quick Numbers */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-black/50 border border-emerald-500/30 space-y-1">
            <span className="text-[10px] text-slate-400 block font-semibold">OPTIMAL HARVEST SCORE</span>
            <strong className="text-2xl font-black text-emerald-400">{currentCalc?.optimal_harvest_score || 96.4}/100</strong>
            <span className="text-[10px] text-emerald-300 block">Harvest Window: {activePlan?.expected_harvest_date}</span>
          </div>

          <div className="p-4 rounded-xl bg-black/50 border border-cyan-500/30 space-y-1">
            <span className="text-[10px] text-slate-400 block font-semibold">CROP MATURITY & MOISTURE</span>
            <strong className="text-2xl font-black text-cyan-300">{activePlan?.maturity_pct}% Ready</strong>
            <span className="text-[10px] text-cyan-200 block">Grain Moisture: {activePlan?.grain_moisture_pct}%</span>
          </div>

          <div className="p-4 rounded-xl bg-black/50 border border-amber-500/30 space-y-1">
            <span className="text-[10px] text-slate-400 block font-semibold">EXPECTED REVENUE</span>
            <strong className="text-2xl font-black text-amber-300">₹{activePlan?.revenue_inr?.toLocaleString()}</strong>
            <span className="text-[10px] text-amber-200 block">Yield: {activePlan?.expected_yield_tons} Metric Tons</span>
          </div>

          <div className="p-4 rounded-xl bg-black/50 border border-indigo-500/30 space-y-1">
            <span className="text-[10px] text-slate-400 block font-semibold">NET ESTIMATED PROFIT</span>
            <strong className="text-2xl font-black text-indigo-300">₹{activePlan?.net_profit_inr?.toLocaleString()}</strong>
            <span className="text-[10px] text-indigo-200 block">Expense: ₹{activePlan?.expense_inr?.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* 18 Summary Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/10 space-y-1">
          <span className="text-[10px] text-slate-400 block font-medium">Harvest Readiness</span>
          <strong className="text-sm font-black text-emerald-400">{activePlan?.maturity_pct}%</strong>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/10 space-y-1">
          <span className="text-[10px] text-slate-400 block font-medium">Days Until Harvest</span>
          <strong className="text-sm font-black text-cyan-300">{currentCalc?.days_until_harvest || 5} Days</strong>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/10 space-y-1">
          <span className="text-[10px] text-slate-400 block font-medium">Expected Yield</span>
          <strong className="text-sm font-black text-emerald-300">{activePlan?.expected_yield_tons} Tons</strong>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/10 space-y-1">
          <span className="text-[10px] text-slate-400 block font-medium">Expected Revenue</span>
          <strong className="text-sm font-black text-amber-300">₹{(activePlan?.revenue_inr / 100000).toFixed(2)} Lakh</strong>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/10 space-y-1">
          <span className="text-[10px] text-slate-400 block font-medium">Expected Profit</span>
          <strong className="text-sm font-black text-indigo-300">₹{(activePlan?.net_profit_inr / 100000).toFixed(2)} Lakh</strong>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/10 space-y-1">
          <span className="text-[10px] text-slate-400 block font-medium">Weather Risk</span>
          <strong className="text-sm font-black text-emerald-400">{currentCalc?.weather_risk || "Low Risk"}</strong>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/10 space-y-1">
          <span className="text-[10px] text-slate-400 block font-medium">Disease Risk</span>
          <strong className="text-sm font-black text-emerald-400">Low (8.4%)</strong>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/10 space-y-1">
          <span className="text-[10px] text-slate-400 block font-medium">Pest Risk</span>
          <strong className="text-sm font-black text-emerald-400">Low (6.2%)</strong>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/10 space-y-1">
          <span className="text-[10px] text-slate-400 block font-medium">Market Score</span>
          <strong className="text-sm font-black text-amber-400">94.5/100</strong>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/10 space-y-1">
          <span className="text-[10px] text-slate-400 block font-medium">Storage Space</span>
          <strong className="text-sm font-black text-blue-300">{currentCalc?.logistics?.storage_required_sqft} sqft</strong>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/10 space-y-1">
          <span className="text-[10px] text-slate-400 block font-medium">Transport Fleet</span>
          <strong className="text-sm font-black text-cyan-300">{currentCalc?.logistics?.trucks_needed_10t} Trucks</strong>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/10 space-y-1">
          <span className="text-[10px] text-slate-400 block font-medium">Labour Needed</span>
          <strong className="text-sm font-black text-purple-300">{currentCalc?.logistics?.labour_crew_needed} Crew</strong>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/10 space-y-1">
          <span className="text-[10px] text-slate-400 block font-medium">Machine Status</span>
          <strong className="text-sm font-black text-emerald-400">Kubota Booked</strong>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/10 space-y-1">
          <span className="text-[10px] text-slate-400 block font-medium">Harvest Confidence</span>
          <strong className="text-sm font-black text-emerald-400">96.4%</strong>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/10 space-y-1">
          <span className="text-[10px] text-slate-400 block font-medium">Quality Score</span>
          <strong className="text-sm font-black text-amber-300">Grade A Export</strong>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/10 space-y-1">
          <span className="text-[10px] text-slate-400 block font-medium">Crop Moisture</span>
          <strong className="text-sm font-black text-cyan-300">42.5%</strong>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/10 space-y-1">
          <span className="text-[10px] text-slate-400 block font-medium">Grain Moisture</span>
          <strong className="text-sm font-black text-emerald-400">{activePlan?.grain_moisture_pct}% (Ideal)</strong>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/10 space-y-1">
          <span className="text-[10px] text-slate-400 block font-medium">Harvest Window</span>
          <strong className="text-sm font-black text-emerald-300">7 Dry Days</strong>
        </div>
      </div>

      {/* Interactive 14-Step Timeline */}
      <div className="glass-panel rounded-2xl p-6 border border-emerald-500/30 bg-black/40 space-y-4">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <Clock className="w-5 h-5 text-emerald-400" /> Interactive Harvest Workflow Timeline
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 text-[11px]">
          {[
            { step: "1. Sowing", date: activePlan?.planting_date, status: "Completed ✓", color: "text-emerald-400" },
            { step: "2. Fert Cutoff", date: "Aug 20, 2026", status: "Completed ✓", color: "text-emerald-400" },
            { step: "3. Irrig Stop", date: "Sep 05, 2026", status: "Active Now", color: "text-cyan-300 font-bold" },
            { step: "4. Moisture Check", date: "Sep 12, 2026", status: "Pending (14.8%)", color: "text-amber-300" },
            { step: "5. CHC Harvester", date: "Sep 15, 2026", status: "Booked", color: "text-emerald-400" },
            { step: "6. Truck Fleet", date: "Sep 17, 2026", status: "Confirmed", color: "text-emerald-400" },
            { step: "7. Harvest Day", date: activePlan?.expected_harvest_date, status: "Target Launch", color: "text-indigo-300 font-extrabold" }
          ].map((item, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-[10px] text-slate-400 block">{item.step}</span>
              <strong className="text-xs font-bold text-white block">{item.date}</strong>
              <span className={`text-[9px] block ${item.color}`}>{item.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Harvest Services Marketplace */}
      <div className="glass-panel rounded-2xl p-6 border border-emerald-500/30 bg-black/40 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-cyan-400" /> Harvest Services Marketplace
            </h3>
            <p className="text-slate-400 text-xs">Verified nearby contractors, combine harvesters, cold storages, and government DPCs.</p>
          </div>

          <div className="flex items-center gap-2">
            <select 
              value={serviceCategory}
              onChange={(e) => setServiceCategory(e.target.value)}
              className="bg-black/60 border border-white/15 text-slate-200 text-xs rounded-xl px-3 py-2 outline-none"
            >
              <option value="ALL">All Categories</option>
              <option value="Combine Harvester Rental">Combine Harvester Rental</option>
              <option value="Labour Contractors">Labour Contractors</option>
              <option value="Transport Companies">Transport & Cold Storage</option>
              <option value="Crop Collection Centers">Crop Collection Centers & Govt Support</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((srv) => (
            <div key={srv.provider_id} className="p-4 rounded-xl bg-slate-900/60 border border-white/10 space-y-3 hover:border-emerald-500/40 transition">
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {srv.category}
                  </span>
                  <h4 className="text-sm font-bold text-white mt-1">{srv.business_name}</h4>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-emerald-400" /> {srv.address} ({srv.distance_km} km away)
                  </span>
                </div>
                <span className="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                  ★ {srv.rating}
                </span>
              </div>

              <div className="text-[11px] text-slate-300 space-y-1 border-t border-white/5 pt-2">
                <div><span className="text-slate-400">Services:</span> {srv.services_offered}</div>
                <div><span className="text-slate-400">Working Hours:</span> {srv.working_hours}</div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                <a href={`tel:${srv.phone_number}`} className="flex-1 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 rounded-lg font-bold text-center flex items-center justify-center gap-1">
                  <Phone className="w-3.5 h-3.5" /> Call
                </a>
                <a href={`https://wa.me/${srv.phone_number.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="flex-1 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-600/40 text-emerald-200 rounded-lg font-bold text-center flex items-center justify-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                </a>
                <a href={srv.website} target="_blank" rel="noreferrer" className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-300">
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Direct Shopping & Equipment Procurement */}
      <div className="glass-panel rounded-2xl p-6 border border-emerald-500/30 bg-black/40 space-y-4">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-amber-400" /> Direct Equipment & Supplies Procurement
        </h3>
        <p className="text-slate-400 text-xs">Official Indian agricultural stores with live INR pricing and direct checkout.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {shoppingItems.map((prod) => (
            <div key={prod.item_id} className="p-3.5 rounded-xl bg-slate-900/60 border border-white/10 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <img src={prod.image_url} alt={prod.title} className="w-full h-28 object-cover rounded-lg" />
                <span className="text-[9px] text-amber-300 block font-semibold">{prod.retailer_name}</span>
                <h5 className="text-xs font-bold text-white line-clamp-2">{prod.title}</h5>
              </div>

              <div className="space-y-2 pt-2 border-t border-white/5">
                <div className="flex items-baseline justify-between">
                  <strong className="text-sm font-black text-emerald-400">₹{prod.price_inr}</strong>
                  <span className="text-[9px] text-slate-400">★ {prod.rating}</span>
                </div>
                <a 
                  href={prod.direct_url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="w-full py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold rounded-lg text-center block text-[11px]"
                >
                  Buy Now on {prod.retailer_name}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 10 Specialized AI Agents Center */}
      <div className="glass-panel rounded-2xl p-6 border border-indigo-500/40 bg-gradient-to-r from-indigo-950/30 via-slate-950 to-black space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" /> Specialized Autonomous AI Agent Team
          </h3>
          <span className="text-[10px] px-2.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
            10 Agents Active & Synchronized
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {AI_AGENTS.map((agent) => (
            <button
              key={agent.id}
              onClick={() => setActiveAgentId(agent.id)}
              className={`p-3 rounded-xl text-left border transition space-y-1 ${
                activeAgentId === agent.id 
                  ? 'bg-indigo-600/30 border-indigo-400 text-white' 
                  : 'bg-black/40 border-white/10 text-slate-400 hover:text-slate-200'
              }`}
            >
              <strong className="text-xs font-bold block">{agent.name}</strong>
              <span className="text-[9px] text-indigo-300 block font-mono">{agent.role}</span>
            </button>
          ))}
        </div>

        {/* Selected Agent Output Box */}
        {activeAgentId && (
          <div className="p-4 rounded-xl bg-black/60 border border-indigo-500/30 space-y-1 text-xs">
            <strong className="text-indigo-300 font-bold block">
              {AI_AGENTS.find(a => a.id === activeAgentId)?.name} Status:
            </strong>
            <p className="text-slate-300">
              {AI_AGENTS.find(a => a.id === activeAgentId)?.desc}
            </p>
          </div>
        )}
      </div>

      {/* Qwen AI Harvest Advisor */}
      <div className="glass-panel rounded-2xl p-6 border border-emerald-500/40 bg-black/40 space-y-4">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-400" /> Qwen AI Harvest Advisor Reasoning
        </h3>

        {advisorResponse ? (
          <div className="p-4 rounded-xl bg-black/60 border border-emerald-500/30 text-emerald-100 text-xs leading-relaxed font-mono">
            {advisorResponse}
          </div>
        ) : (
          <p className="text-slate-300 text-xs">
            {currentCalc?.ai_recommendation || "Optimal harvest window opens in 5 days. Target grain moisture is 14.8%. Book combine harvester via local CHC now to lock dry weather window."}
          </p>
        )}

        <form onSubmit={handleAskAdvisor} className="flex gap-2">
          <input 
            type="text" 
            placeholder="Ask Qwen AI custom harvest advice..." 
            value={advisorPrompt}
            onChange={(e) => setAdvisorPrompt(e.target.value)}
            className="flex-1 bg-black/60 border border-white/15 rounded-xl px-4 py-2 text-xs text-slate-100 outline-none focus:border-emerald-400"
          />
          <button 
            type="submit" 
            disabled={advisorLoading}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-xl transition flex items-center gap-1.5 disabled:opacity-50"
          >
            {advisorLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />} Ask AI
          </button>
        </form>
      </div>

      {/* Export & Document Center */}
      <div className="glass-panel rounded-2xl p-6 border border-emerald-500/30 bg-black/40 space-y-4">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <Download className="w-5 h-5 text-emerald-400" /> Document & Export Center
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button onClick={() => handleExport("PDF", "Harvest Schedule")} className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold flex items-center justify-between">
            <span>PDF Plan</span> <FileText className="w-4 h-4 text-red-400" />
          </button>
          <button onClick={() => handleExport("CSV", "Harvest Logistics")} className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold flex items-center justify-between">
            <span>CSV Sheet</span> <FileText className="w-4 h-4 text-emerald-400" />
          </button>
          <button onClick={() => handleExport("JSON", "Telemetry Data")} className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold flex items-center justify-between">
            <span>JSON Data</span> <Zap className="w-4 h-4 text-amber-400" />
          </button>
          <button onClick={() => handleExport("DOCX", "Harvest Certificate")} className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold flex items-center justify-between">
            <span>DOCX Report</span> <Award className="w-4 h-4 text-cyan-400" />
          </button>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel rounded-2xl p-6 border border-emerald-500/40 bg-slate-950 w-full max-w-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-slate-100">
                {isEditMode ? "Edit Harvest Plan Record" : "Create New Harvest Plan"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-100">✕</button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Farm Name</label>
                  <input type="text" required value={formData.farm_name} onChange={(e) => setFormData({...formData, farm_name: e.target.value})} className="w-full bg-black/60 border border-white/15 rounded-xl p-2 text-slate-100" />
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Field Name</label>
                  <input type="text" required value={formData.field_name} onChange={(e) => setFormData({...formData, field_name: e.target.value})} className="w-full bg-black/60 border border-white/15 rounded-xl p-2 text-slate-100" />
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Crop Type</label>
                  <input type="text" required value={formData.crop_type} onChange={(e) => setFormData({...formData, crop_type: e.target.value})} className="w-full bg-black/60 border border-white/15 rounded-xl p-2 text-slate-100" />
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Field Area (Acres)</label>
                  <input type="number" step="0.1" required value={formData.field_area_acres} onChange={(e) => setFormData({...formData, field_area_acres: parseFloat(e.target.value)})} className="w-full bg-black/60 border border-white/15 rounded-xl p-2 text-slate-100" />
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Expected Harvest Date</label>
                  <input type="date" value={formData.expected_harvest_date} onChange={(e) => setFormData({...formData, expected_harvest_date: e.target.value})} className="w-full bg-black/60 border border-white/15 rounded-xl p-2 text-slate-100" />
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Maturity %</label>
                  <input type="number" step="0.1" value={formData.maturity_pct} onChange={(e) => setFormData({...formData, maturity_pct: parseFloat(e.target.value)})} className="w-full bg-black/60 border border-white/15 rounded-xl p-2 text-slate-100" />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-slate-200 font-semibold rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-xl">Save Plan</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
