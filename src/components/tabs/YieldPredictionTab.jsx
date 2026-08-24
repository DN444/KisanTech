import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Award, DollarSign, Calendar, AlertTriangle, ShieldCheck, Activity, Globe, CloudSun,
  Layers, Droplets, Bug, Sparkles, Download, RefreshCw, Plus, Edit2, Trash2, Copy, Search, Filter,
  CheckCircle2, ArrowUpRight, ArrowDownRight, Sliders, ChevronRight, PieChart, FileText, Zap, Compass
} from 'lucide-react';
import { AIBadgePanel } from '../ui/AIBadgePanel';
import { 
  fetchYieldPredictions, fetchYieldPredictionById, calculateYieldSimulation, 
  createYieldPrediction, updateYieldPrediction, deleteYieldPrediction, duplicateYieldPrediction,
  fetchMCPStatus, queryYieldAdvisor, FALLBACK_PREDICTIONS 
} from '../../services/yieldPredictionService';
import { useAuth } from '../../context/AuthContext';

export const YieldPredictionTab = () => {
  const { user } = useAuth();
  const [predictions, setPredictions] = useState(FALLBACK_PREDICTIONS);
  const [selectedId, setSelectedId] = useState("YLD-2026-001");
  const [activePrediction, setActivePrediction] = useState(FALLBACK_PREDICTIONS[0]);
  const [mcpList, setMcpList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [advisorPrompt, setAdvisorPrompt] = useState("");
  const [advisorResponse, setAdvisorResponse] = useState("");
  const [advisorLoading, setAdvisorLoading] = useState(false);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [districtFilter, setDistrictFilter] = useState("ALL");
  const [cropFilter, setCropFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("newest");

  // What-If Simulator State
  const [simIrrig, setSimIrrig] = useState(0);
  const [simFert, setSimFert] = useState(0);
  const [simClimate, setSimClimate] = useState("Optimal");
  const [simFarmingMode, setSimFarmingMode] = useState("Precision");
  const [simResult, setSimResult] = useState(null);

  // Modal State for New/Edit Prediction
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    farm_name: "Vellore Main Precision Farm",
    field_name: "Paddy Block A",
    farmer_name: user?.displayName || "Farmer",
    district: "Vellore",
    crop_type: "Rice (Paddy)",
    crop_variety: "ADT-54 Certified Hybrid",
    field_area_acres: 10.0,
    planting_date: "2026-05-15",
    expected_harvest_date: "2026-09-18",
    soil_type: "Red Loamy Soil",
    npk_n_kg_ha: 140.0,
    organic_carbon_pct: 0.85,
    soil_ph: 6.8,
    ndvi_score: 0.78,
    farmer_notes: ""
  });

  // Load predictions & MCP status
  useEffect(() => {
    loadData();
  }, [searchTerm, districtFilter, cropFilter, sortBy]);

  const loadData = async () => {
    setLoading(true);
    const data = await fetchYieldPredictions(searchTerm, districtFilter, cropFilter, sortBy);
    setPredictions(data);
    if (data.length > 0) {
      const match = data.find(p => p.prediction_id === selectedId) || data[0];
      setActivePrediction(match);
      setSelectedId(match.prediction_id);
    }
    const mcps = await fetchMCPStatus();
    setMcpList(mcps);
    setLoading(false);
  };

  // Handle selected prediction change
  const handleSelectPrediction = (p) => {
    setActivePrediction(p);
    setSelectedId(p.prediction_id);
    setSimIrrig(p.calculated?.what_if_parameters?.irrigation_adj_pct || 0);
    setSimFert(p.calculated?.what_if_parameters?.fertilizer_adj_pct || 0);
    setSimClimate(p.calculated?.what_if_parameters?.climate_scenario || "Optimal");
    setSimFarmingMode(p.calculated?.what_if_parameters?.farming_mode || "Precision");
    setSimResult(null);
  };

  // Run What-If recalculation
  useEffect(() => {
    if (activePrediction) {
      runSimulation();
    }
  }, [simIrrig, simFert, simClimate, simFarmingMode, activePrediction]);

  const runSimulation = async () => {
    if (!activePrediction) return;
    const input = {
      ...activePrediction,
      sim_irrigation_adj: simIrrig,
      sim_fertilizer_adj: simFert,
      sim_climate_scenario: simClimate,
      sim_farming_mode: simFarmingMode
    };
    const res = await calculateYieldSimulation(input);
    setSimResult(res);
  };

  // AI Advisor query
  const handleAskAdvisor = async (e) => {
    e.preventDefault();
    if (!advisorPrompt.trim()) return;
    setAdvisorLoading(true);
    const text = await queryYieldAdvisor(advisorPrompt, activePrediction);
    setAdvisorResponse(text);
    setAdvisorLoading(false);
  };

  // CRUD actions
  const handleDelete = async (id) => {
    if (window.confirm(`Are you sure you want to delete prediction record ${id}?`)) {
      await deleteYieldPrediction(id);
      loadData();
    }
  };

  const handleDuplicate = async (id) => {
    await duplicateYieldPrediction(id);
    loadData();
  };

  const handleSaveModal = async (e) => {
    e.preventDefault();
    if (!formData.crop_type || !formData.field_area_acres || formData.field_area_acres <= 0) {
      alert("Missing required fields: Crop Type and Field Area in Acres.");
      return;
    }
    if (isEditMode) {
      await updateYieldPrediction(selectedId, formData);
    } else {
      await createYieldPrediction(formData);
    }
    setShowModal(false);
    loadData();
  };

  // Export report handler
  const handleExport = (fmt, type) => {
    const calc = simResult || activePrediction?.calculated;
    const content = `KISANTECH AI - ${type.toUpperCase()} REPORT\nPrediction ID: ${activePrediction?.prediction_id}\nCrop: ${activePrediction?.crop_type}\nPredicted Yield: ${calc?.predicted_yield_t_ha} t/ha (${calc?.predicted_yield_tons} Tons)\nExpected Revenue: ₹${calc?.financials?.expected_revenue_inr}\nExpected Net Profit: ₹${calc?.financials?.expected_net_profit_inr}\nConfidence: ${calc?.confidence_pct}%\nDate: ${new Date().toLocaleDateString()}`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kisantech_${type.toLowerCase().replace(/\s+/g, '_')}_${activePrediction?.prediction_id}.${fmt.toLowerCase()}`;
    link.click();
  };

  const currentCalc = simResult || activePrediction?.calculated || {};
  const isDataValid = currentCalc?.is_valid !== false;

  return (
    <div className="space-y-6 animate-in fade-in duration-300 font-sans text-slate-100 text-xs">
      
      {/* Header Badge */}
      <AIBadgePanel 
        tabId="yield-prediction" 
        tabName="Enterprise Hybrid AI Yield Decision Platform" 
        defaultPrompt="Analyze predicted crop yield tonnage, satellite NDVI canopy index, historical weather risk, and financial profitability cone." 
      />

      {/* Hero Executive Banner */}
      <div className="glass-panel rounded-2xl p-6 border border-emerald-500/40 bg-gradient-to-r from-emerald-950/60 via-slate-950 to-black space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full filter blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> HYBRID ML ENGINE • LOCAL CPU READY
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono">
                ID: {activePrediction?.prediction_id}
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              {activePrediction?.crop_type} ({activePrediction?.crop_variety})
            </h1>
            <p className="text-slate-400 text-xs flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              {activePrediction?.farm_name} • {activePrediction?.field_name} ({activePrediction?.field_area_acres} Acres / {currentCalc?.field_area_ha} ha) • {activePrediction?.district}, {activePrediction?.state}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select 
              value={selectedId}
              onChange={(e) => {
                const found = predictions.find(p => p.prediction_id === e.target.value);
                if (found) handleSelectPrediction(found);
              }}
              className="bg-black/60 border border-emerald-500/40 text-emerald-300 text-xs rounded-xl px-3 py-2 outline-none font-medium focus:border-emerald-400"
            >
              {predictions.map(p => (
                <option key={p.prediction_id} value={p.prediction_id} className="bg-slate-900 text-slate-100">
                  {p.prediction_id}: {p.crop_type} ({p.field_name})
                </option>
              ))}
            </select>

            <button 
              onClick={() => {
                setFormData({
                  farm_name: activePrediction?.farm_name || "Vellore Main Precision Farm",
                  field_name: activePrediction?.field_name || "Paddy Block A",
                  farmer_name: activePrediction?.farmer_name || "Farmer",
                  district: activePrediction?.district || "Vellore",
                  crop_type: activePrediction?.crop_type || "Rice (Paddy)",
                  crop_variety: activePrediction?.crop_variety || "ADT-54 Certified Hybrid",
                  field_area_acres: activePrediction?.field_area_acres || 10.0,
                  planting_date: activePrediction?.planting_date || "2026-05-15",
                  expected_harvest_date: activePrediction?.expected_harvest_date || "2026-09-18",
                  soil_type: activePrediction?.soil_type || "Red Loamy Soil",
                  npk_n_kg_ha: activePrediction?.npk_n_kg_ha || 140.0,
                  organic_carbon_pct: activePrediction?.organic_carbon_pct || 0.85,
                  soil_ph: activePrediction?.soil_ph || 6.8,
                  ndvi_score: activePrediction?.ndvi_score || 0.78,
                  farmer_notes: activePrediction?.farmer_notes || ""
                });
                setIsEditMode(true);
                setShowModal(true);
              }}
              className="p-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-slate-200 transition"
              title="Edit Prediction"
            >
              <Edit2 className="w-4 h-4" />
            </button>

            <button 
              onClick={() => handleDuplicate(selectedId)}
              className="p-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-slate-200 transition"
              title="Duplicate Prediction"
            >
              <Copy className="w-4 h-4" />
            </button>

            <button 
              onClick={() => handleDelete(selectedId)}
              className="p-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 rounded-xl text-red-300 transition"
              title="Delete Prediction"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button 
              onClick={() => {
                setFormData({
                  farm_name: "Vellore Main Precision Farm",
                  field_name: "Field Block #5",
                  farmer_name: user?.displayName || "Farmer",
                  district: "Vellore",
                  crop_type: "Rice (Paddy)",
                  crop_variety: "ADT-54 Certified Hybrid",
                  field_area_acres: 15.0,
                  planting_date: "2026-06-01",
                  expected_harvest_date: "2026-09-28",
                  soil_type: "Red Loamy Soil",
                  npk_n_kg_ha: 140.0,
                  organic_carbon_pct: 0.85,
                  soil_ph: 6.8,
                  ndvi_score: 0.78,
                  farmer_notes: ""
                });
                setIsEditMode(false);
                setShowModal(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-xl transition shadow-lg shadow-emerald-500/20"
            >
              <Plus className="w-4 h-4" /> New Prediction
            </button>
          </div>
        </div>

        {/* Data Honesty Policy Warning if Invalid */}
        {!isDataValid && (
          <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/50 text-amber-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold text-sm text-amber-300">{currentCalc?.error_message}</strong>
              <p className="text-slate-300 mt-1">{currentCalc?.guidance}</p>
              {currentCalc?.missing_fields && (
                <ul className="list-disc list-inside text-amber-400 mt-1 font-mono">
                  {currentCalc.missing_fields.map((mf, i) => <li key={i}>{mf}</li>)}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* Top Tonnage & Financial Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-black/50 border border-emerald-500/30 space-y-1">
            <span className="text-[10px] text-slate-400 block font-semibold">PREDICTED YIELD (T/HA)</span>
            <div className="flex items-baseline gap-2">
              <strong className="text-2xl font-black text-emerald-400">{currentCalc?.predicted_yield_t_ha || 0} t/ha</strong>
              <span className="text-[10px] text-emerald-300 font-bold flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3" /> +{currentCalc?.benchmarks?.diff_vs_district_pct || 0}%
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block">vs District Avg ({currentCalc?.benchmarks?.district_avg_t_ha} t/ha)</span>
          </div>

          <div className="p-4 rounded-xl bg-black/50 border border-cyan-500/30 space-y-1">
            <span className="text-[10px] text-slate-400 block font-semibold">EXPECTED HARVEST TONNAGE</span>
            <strong className="text-2xl font-black text-cyan-300">{currentCalc?.predicted_yield_tons || 0} Metric Tons</strong>
            <span className="text-[10px] text-cyan-200 block">({currentCalc?.predicted_yield_kg?.toLocaleString()} kg total)</span>
          </div>

          <div className="p-4 rounded-xl bg-black/50 border border-amber-500/30 space-y-1">
            <span className="text-[10px] text-slate-400 block font-semibold">EXPECTED GROSS REVENUE</span>
            <strong className="text-2xl font-black text-amber-300">₹{currentCalc?.financials?.expected_revenue_inr?.toLocaleString() || 0}</strong>
            <span className="text-[10px] text-amber-200 block">@ ₹{currentCalc?.financials?.market_price_per_q}/Q Mandi Rate</span>
          </div>

          <div className="p-4 rounded-xl bg-black/50 border border-indigo-500/30 space-y-1">
            <span className="text-[10px] text-slate-400 block font-semibold">PREDICTED NET PROFIT</span>
            <strong className="text-2xl font-black text-indigo-300">₹{currentCalc?.financials?.expected_net_profit_inr?.toLocaleString() || 0}</strong>
            <span className="text-[10px] text-indigo-200 block">ROI: {currentCalc?.financials?.roi_pct}% • Margin: {currentCalc?.financials?.profit_margin_pct}%</span>
          </div>
        </div>
      </div>

      {/* 18 Summary Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/10 space-y-1">
          <span className="text-[10px] text-slate-400 block font-medium">Predicted Yield (kg)</span>
          <strong className="text-sm font-black text-emerald-400">{currentCalc?.predicted_yield_kg?.toLocaleString()} kg</strong>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/10 space-y-1">
          <span className="text-[10px] text-slate-400 block font-medium">Yield / Acre</span>
          <strong className="text-sm font-black text-slate-100">{currentCalc?.predicted_yield_kg_acre} kg/ac</strong>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/10 space-y-1">
          <span className="text-[10px] text-slate-400 block font-medium">Yield / Hectare</span>
          <strong className="text-sm font-black text-emerald-300">{currentCalc?.predicted_yield_t_ha} t/ha</strong>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/10 space-y-1">
          <span className="text-[10px] text-slate-400 block font-medium">Expected Harvest</span>
          <strong className="text-sm font-black text-cyan-300">{activePrediction?.expected_harvest_date}</strong>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/10 space-y-1">
          <span className="text-[10px] text-slate-400 block font-medium">Confidence %</span>
          <strong className="text-sm font-black text-amber-300">{currentCalc?.confidence_pct}% (±{currentCalc?.error_margin_pct}%)</strong>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/10 space-y-1">
          <span className="text-[10px] text-slate-400 block font-medium">Expected Revenue</span>
          <strong className="text-sm font-black text-emerald-400">₹{(currentCalc?.financials?.expected_revenue_inr / 100000).toFixed(2)} Lakh</strong>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/10 space-y-1">
          <span className="text-[10px] text-slate-400 block font-medium">Expected Net Profit</span>
          <strong className="text-sm font-black text-indigo-300">₹{(currentCalc?.financials?.expected_net_profit_inr / 100000).toFixed(2)} Lakh</strong>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/10 space-y-1">
          <span className="text-[10px] text-slate-400 block font-medium">Risk Score & Level</span>
          <strong className="text-sm font-black text-emerald-400">{currentCalc?.scores?.risk_score} (Low Risk)</strong>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/10 space-y-1">
          <span className="text-[10px] text-slate-400 block font-medium">Crop Health Score</span>
          <strong className="text-sm font-black text-cyan-300">{currentCalc?.scores?.crop_health_score}/100</strong>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/10 space-y-1">
          <span className="text-[10px] text-slate-400 block font-medium">Weather Score</span>
          <strong className="text-sm font-black text-sky-300">{currentCalc?.scores?.weather_score}/100</strong>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/10 space-y-1">
          <span className="text-[10px] text-slate-400 block font-medium">Soil Fertility Index</span>
          <strong className="text-sm font-black text-amber-300">{currentCalc?.scores?.soil_score}/100</strong>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/10 space-y-1">
          <span className="text-[10px] text-slate-400 block font-medium">Water Score</span>
          <strong className="text-sm font-black text-blue-300">{currentCalc?.scores?.water_score}/100</strong>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/10 space-y-1">
          <span className="text-[10px] text-slate-400 block font-medium">Disease Safety</span>
          <strong className="text-sm font-black text-emerald-400">{currentCalc?.scores?.disease_score}/100</strong>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/10 space-y-1">
          <span className="text-[10px] text-slate-400 block font-medium">Pest Safety</span>
          <strong className="text-sm font-black text-emerald-400">{currentCalc?.scores?.pest_score}/100</strong>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/10 space-y-1">
          <span className="text-[10px] text-slate-400 block font-medium">Growth Vigor</span>
          <strong className="text-sm font-black text-indigo-300">{currentCalc?.scores?.growth_score}/100</strong>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/10 space-y-1">
          <span className="text-[10px] text-slate-400 block font-medium">Harvest Readiness</span>
          <strong className="text-sm font-black text-purple-300">{currentCalc?.scores?.harvest_readiness_pct}%</strong>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/10 space-y-1">
          <span className="text-[10px] text-slate-400 block font-medium">Carbon Footprint</span>
          <strong className="text-sm font-black text-teal-300">{currentCalc?.scores?.carbon_footprint_kg_co2_ton} kg CO2e/t</strong>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/10 space-y-1">
          <span className="text-[10px] text-slate-400 block font-medium">Sustainability Index</span>
          <strong className="text-sm font-black text-emerald-400">{currentCalc?.scores?.sustainability_score}/100</strong>
        </div>
      </div>

      {/* Main Grid: AI Prediction Cone + Benchmarks & What-If Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7 Columns: Yield Cone & Benchmark Comparison */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* AI Prediction Panel */}
          <div className="glass-panel rounded-2xl p-6 border border-emerald-500/30 space-y-5 bg-black/40">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" /> AI Prediction Cone & Forecast Spectrum
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                ML Confidence: {currentCalc?.confidence_pct}%
              </span>
            </div>

            {/* Yield Cone Visual representation */}
            <div className="grid grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-center space-y-1">
                <span className="text-[10px] text-emerald-300 font-semibold block">BEST CASE YIELD</span>
                <strong className="text-lg font-black text-emerald-400 block">{currentCalc?.best_case_yield_t_ha} t/ha</strong>
                <span className="text-[9px] text-slate-400 block">+18.0% Upside</span>
              </div>
              <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-400 text-center space-y-1 shadow-lg shadow-emerald-500/10">
                <span className="text-[10px] text-emerald-300 font-extrabold block">EXPECTED YIELD</span>
                <strong className="text-xl font-black text-white block">{currentCalc?.predicted_yield_t_ha} t/ha</strong>
                <span className="text-[9px] text-emerald-200 block font-bold">Baseline AI Model</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/10 text-center space-y-1">
                <span className="text-[10px] text-slate-400 font-semibold block">AVERAGE SCENARIO</span>
                <strong className="text-lg font-black text-slate-200 block">{currentCalc?.average_yield_t_ha} t/ha</strong>
                <span className="text-[9px] text-slate-400 block">Historical Avg</span>
              </div>
              <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/40 text-center space-y-1">
                <span className="text-[10px] text-amber-300 font-semibold block">WORST CASE</span>
                <strong className="text-lg font-black text-amber-400 block">{currentCalc?.worst_case_yield_t_ha} t/ha</strong>
                <span className="text-[9px] text-slate-400 block">-24.0% Downside</span>
              </div>
            </div>

            {/* Regional & Global Benchmarks */}
            <div className="space-y-3 border-t border-white/10 pt-4">
              <h4 className="text-xs font-bold text-slate-300">Regional & Global Yield Benchmarks (t/ha)</h4>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-300 font-medium">Your Predicted Yield ({activePrediction?.field_name})</span>
                  <strong className="text-emerald-400 font-bold">{currentCalc?.predicted_yield_t_ha} t/ha</strong>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${Math.min((currentCalc?.predicted_yield_t_ha / 8.0) * 100, 100)}%` }} />
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1">
                  <span className="text-slate-400">Vellore District Average</span>
                  <span className="text-slate-200">{currentCalc?.benchmarks?.district_avg_t_ha} t/ha</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-cyan-500 h-1.5 rounded-full" style={{ width: `${Math.min((currentCalc?.benchmarks?.district_avg_t_ha / 8.0) * 100, 100)}%` }} />
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1">
                  <span className="text-slate-400">Tamil Nadu State Average</span>
                  <span className="text-slate-200">{currentCalc?.benchmarks?.state_avg_t_ha} t/ha</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${Math.min((currentCalc?.benchmarks?.state_avg_t_ha / 8.0) * 100, 100)}%` }} />
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1">
                  <span className="text-slate-400">Global Benchmark Target</span>
                  <span className="text-slate-200">{currentCalc?.benchmarks?.global_benchmark_t_ha} t/ha</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${Math.min((currentCalc?.benchmarks?.global_benchmark_t_ha / 8.0) * 100, 100)}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Financial P&L & Break-even Analysis */}
          <div className="glass-panel rounded-2xl p-6 border border-emerald-500/30 space-y-4 bg-black/40">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-amber-400" /> Financial Analytics & P&L Statement
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-0.5">
                <span className="text-[10px] text-slate-400 block">Total Cultivation Expense</span>
                <strong className="text-sm font-bold text-amber-300">₹{currentCalc?.financials?.total_expense_inr?.toLocaleString()}</strong>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-0.5">
                <span className="text-[10px] text-slate-400 block">Expected Revenue</span>
                <strong className="text-sm font-bold text-emerald-400">₹{currentCalc?.financials?.expected_revenue_inr?.toLocaleString()}</strong>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-0.5">
                <span className="text-[10px] text-slate-400 block">Net Expected Profit</span>
                <strong className="text-sm font-bold text-indigo-300">₹{currentCalc?.financials?.expected_net_profit_inr?.toLocaleString()}</strong>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-0.5">
                <span className="text-[10px] text-slate-400 block">Return on Investment (ROI)</span>
                <strong className="text-sm font-bold text-emerald-400">{currentCalc?.financials?.roi_pct}%</strong>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-0.5">
                <span className="text-[10px] text-slate-400 block">Net Profit Margin</span>
                <strong className="text-sm font-bold text-cyan-300">{currentCalc?.financials?.profit_margin_pct}%</strong>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-0.5">
                <span className="text-[10px] text-slate-400 block">Break-even Tonnage</span>
                <strong className="text-sm font-bold text-amber-400">{(currentCalc?.financials?.breakeven_kg / 1000.0).toFixed(2)} Tons</strong>
              </div>
            </div>

            {/* Itemized Cost Breakdown */}
            <div className="border-t border-white/10 pt-3 space-y-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Itemized Expense Breakdown</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                <div className="flex justify-between p-2 rounded bg-black/40 border border-white/5">
                  <span className="text-slate-400">Seed Cost:</span>
                  <span className="text-slate-200 font-semibold">₹{currentCalc?.financials?.itemized_cost?.seed_cost_inr?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-black/40 border border-white/5">
                  <span className="text-slate-400">Fertilizer:</span>
                  <span className="text-slate-200 font-semibold">₹{currentCalc?.financials?.itemized_cost?.fertilizer_cost_inr?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-black/40 border border-white/5">
                  <span className="text-slate-400">Pesticide:</span>
                  <span className="text-slate-200 font-semibold">₹{currentCalc?.financials?.itemized_cost?.pesticide_cost_inr?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-black/40 border border-white/5">
                  <span className="text-slate-400">Labour:</span>
                  <span className="text-slate-200 font-semibold">₹{currentCalc?.financials?.itemized_cost?.labour_cost_inr?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-black/40 border border-white/5">
                  <span className="text-slate-400">Water/Elec:</span>
                  <span className="text-slate-200 font-semibold">₹{currentCalc?.financials?.itemized_cost?.water_elec_cost_inr?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-black/40 border border-white/5">
                  <span className="text-slate-400">Equipment:</span>
                  <span className="text-slate-200 font-semibold">₹{currentCalc?.financials?.itemized_cost?.equipment_cost_inr?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 5 Columns: What-If Yield Simulator & Satellite / Weather */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* What-If Interactive Simulator */}
          <div className="glass-panel rounded-2xl p-6 border border-cyan-500/40 bg-gradient-to-br from-cyan-950/20 via-black to-slate-950 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-cyan-400" /> Interactive Yield "What-If" Simulator
              </h3>
              <button 
                onClick={() => {
                  setSimIrrig(0);
                  setSimFert(0);
                  setSimClimate("Optimal");
                  setSimFarmingMode("Precision");
                }}
                className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1 font-mono"
              >
                <RefreshCw className="w-3 h-3" /> Reset
              </button>
            </div>

            <div className="space-y-4">
              {/* Irrigation Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">Irrigation Supply Adjustment</span>
                  <strong className="text-cyan-300 font-mono">{simIrrig > 0 ? `+${simIrrig}%` : `${simIrrig}%`}</strong>
                </div>
                <input 
                  type="range" min="-30" max="30" value={simIrrig} 
                  onChange={(e) => setSimIrrig(parseInt(e.target.value))}
                  className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer" 
                />
              </div>

              {/* Fertilizer Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">Fertilizer Dosage Adjustment</span>
                  <strong className="text-emerald-300 font-mono">{simFert > 0 ? `+${simFert}%` : `${simFert}%`}</strong>
                </div>
                <input 
                  type="range" min="-30" max="30" value={simFert} 
                  onChange={(e) => setSimFert(parseInt(e.target.value))}
                  className="w-full accent-emerald-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer" 
                />
              </div>

              {/* Climate Scenario Selection */}
              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-medium block">Climate Scenario Simulation</label>
                <div className="grid grid-cols-2 gap-2">
                  {["Optimal", "Heatwave", "Heavy Monsoon", "Drought"].map((scen) => (
                    <button
                      key={scen}
                      onClick={() => setSimClimate(scen)}
                      className={`p-2 rounded-xl text-xs font-semibold border transition ${
                        simClimate === scen 
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200' 
                          : 'bg-black/40 border-white/10 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {scen}
                    </button>
                  ))}
                </div>
              </div>

              {/* Farming Mode */}
              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-medium block">Farming Practice Mode</label>
                <div className="grid grid-cols-3 gap-2">
                  {["Precision", "Conventional", "Organic"].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setSimFarmingMode(mode)}
                      className={`p-2 rounded-xl text-[11px] font-semibold border transition ${
                        simFarmingMode === mode 
                          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200' 
                          : 'bg-black/40 border-white/10 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Simulation Output Box */}
              <div className="p-4 rounded-xl bg-black/60 border border-cyan-500/30 space-y-2">
                <span className="text-[10px] text-cyan-400 font-bold block">SIMULATED YIELD RESULT</span>
                <div className="flex items-baseline justify-between">
                  <strong className="text-xl font-black text-white">{currentCalc?.predicted_yield_t_ha} t/ha</strong>
                  <span className="text-xs font-bold text-emerald-400">
                    ₹{currentCalc?.financials?.expected_net_profit_inr?.toLocaleString()} Net Profit
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Instant prediction recalculated based on {simClimate} scenario and {simFarmingMode} farming mode.
                </p>
              </div>
            </div>
          </div>

          {/* Satellite & Environmental Intelligence */}
          <div className="glass-panel rounded-2xl p-6 border border-emerald-500/30 space-y-4 bg-black/40">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Globe className="w-5 h-5 text-emerald-400" /> Satellite & Environmental Impact
            </h3>

            <div className="grid grid-cols-2 gap-3 text-[11px]">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-slate-400 block">NDVI Vegetation Index</span>
                <strong className="text-sm font-bold text-emerald-400">{currentCalc?.satellite?.ndvi} (Optimal Vigor)</strong>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-slate-400 block">Enhanced Veg Index (EVI)</span>
                <strong className="text-sm font-bold text-cyan-300">{currentCalc?.satellite?.evi}</strong>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-slate-400 block">Soil Moisture Index (NDMI)</span>
                <strong className="text-sm font-bold text-blue-300">{currentCalc?.satellite?.ndmi}</strong>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-slate-400 block">Leaf Area Index (LAI)</span>
                <strong className="text-sm font-bold text-purple-300">{currentCalc?.satellite?.leaf_area_index}</strong>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* AI Qwen Ollama Explanation & Farmer Recommendations */}
      <div className="glass-panel rounded-2xl p-6 border border-indigo-500/40 bg-gradient-to-r from-indigo-950/30 via-slate-950 to-black space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" /> Qwen AI Yield Insights & Agronomist Reasoning
          </h3>
          <span className="text-[10px] px-2.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
            Model: Qwen 2.5 7B (Local CPU)
          </span>
        </div>

        {advisorResponse ? (
          <div className="p-4 rounded-xl bg-black/50 border border-indigo-500/30 text-indigo-100 text-xs leading-relaxed font-mono">
            {advisorResponse}
          </div>
        ) : (
          <p className="text-slate-300 text-xs">
            {activePrediction?.calculated?.disease_pest_impact?.prevention_action || "Predicted yield is supported by high NDVI canopy density (0.78) and balanced root-zone soil nitrogen (140 kg/ha). Recommended split NPK dosing."}
          </p>
        )}

        <form onSubmit={handleAskAdvisor} className="flex gap-2 pt-2">
          <input 
            type="text" 
            placeholder="Ask Qwen AI for custom yield optimization advice..." 
            value={advisorPrompt}
            onChange={(e) => setAdvisorPrompt(e.target.value)}
            className="flex-1 bg-black/60 border border-white/15 rounded-xl px-4 py-2 text-xs text-slate-100 outline-none focus:border-indigo-400"
          />
          <button 
            type="submit"
            disabled={advisorLoading}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition flex items-center gap-1.5 disabled:opacity-50"
          >
            {advisorLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />} Ask AI
          </button>
        </form>
      </div>

      {/* Report Export Center & Modular MCP Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Export Center */}
        <div className="glass-panel rounded-2xl p-6 border border-emerald-500/30 space-y-4 bg-black/40">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Download className="w-5 h-5 text-emerald-400" /> Export Enterprise Yield Reports
          </h3>
          <p className="text-slate-400 text-xs">Download complete multi-factor predictive analysis for banks, co-ops, and crop insurance claims.</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button onClick={() => handleExport("PDF", "Yield Report")} className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold flex items-center justify-between">
              <span>PDF Report</span> <FileText className="w-4 h-4 text-red-400" />
            </button>
            <button onClick={() => handleExport("CSV", "Yield Data")} className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold flex items-center justify-between">
              <span>CSV Spreadsheet</span> <PieChart className="w-4 h-4 text-emerald-400" />
            </button>
            <button onClick={() => handleExport("JSON", "Raw Telemetry")} className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold flex items-center justify-between">
              <span>JSON Data</span> <Zap className="w-4 h-4 text-amber-400" />
            </button>
            <button onClick={() => handleExport("MD", "AI Summary")} className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold flex items-center justify-between">
              <span>Markdown Summary</span> <FileText className="w-4 h-4 text-indigo-400" />
            </button>
            <button onClick={() => handleExport("DOCX", "Farm Certificate")} className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold flex items-center justify-between">
              <span>DOCX Certificate</span> <Award className="w-4 h-4 text-cyan-400" />
            </button>
          </div>
        </div>

        {/* Modular MCP Connectors Status */}
        <div className="glass-panel rounded-2xl p-6 border border-emerald-500/30 space-y-4 bg-black/40">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Compass className="w-5 h-5 text-cyan-400" /> Modular MCP Server Connectors
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
            {mcpList.map((mcp) => (
              <div key={mcp.id} className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-slate-200 font-semibold">{mcp.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-emerald-400 font-mono text-[10px] block">{mcp.status} ({mcp.latency_ms}ms)</span>
                  <span className="text-slate-500 text-[9px] block">{mcp.source}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Modal Form for Create / Edit Prediction */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel rounded-2xl p-6 border border-emerald-500/40 bg-slate-950 w-full max-w-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-slate-100">
                {isEditMode ? "Edit Yield Prediction Record" : "Create New Yield Prediction"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-100">✕</button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Farm Name *</label>
                  <input type="text" required value={formData.farm_name} onChange={(e) => setFormData({...formData, farm_name: e.target.value})} className="w-full bg-black/60 border border-white/15 rounded-xl p-2 text-slate-100" />
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Field Name *</label>
                  <input type="text" required value={formData.field_name} onChange={(e) => setFormData({...formData, field_name: e.target.value})} className="w-full bg-black/60 border border-white/15 rounded-xl p-2 text-slate-100" />
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Crop Type *</label>
                  <input type="text" required value={formData.crop_type} onChange={(e) => setFormData({...formData, crop_type: e.target.value})} className="w-full bg-black/60 border border-white/15 rounded-xl p-2 text-slate-100" placeholder="e.g. Rice (Paddy)" />
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Field Area (Acres) *</label>
                  <input type="number" step="0.1" required value={formData.field_area_acres} onChange={(e) => setFormData({...formData, field_area_acres: parseFloat(e.target.value)})} className="w-full bg-black/60 border border-white/15 rounded-xl p-2 text-slate-100" />
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Planting Date</label>
                  <input type="date" value={formData.planting_date} onChange={(e) => setFormData({...formData, planting_date: e.target.value})} className="w-full bg-black/60 border border-white/15 rounded-xl p-2 text-slate-100" />
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Expected Harvest Date</label>
                  <input type="date" value={formData.expected_harvest_date} onChange={(e) => setFormData({...formData, expected_harvest_date: e.target.value})} className="w-full bg-black/60 border border-white/15 rounded-xl p-2 text-slate-100" />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-slate-200 font-semibold rounded-xl">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-xl">Save & Calculate Yield</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
