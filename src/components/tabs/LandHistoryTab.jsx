import React, { useState, useEffect } from 'react';
import {
  History, Clock, Calendar, MapPin, Search, Plus, Filter, Trash2, Edit3, ShieldAlert,
  Sparkles, CheckCircle2, AlertTriangle, TrendingUp, Download, FileText, Share2, RefreshCw,
  Eye, Star, Pin, Sliders, MessageSquare, DollarSign, Award, ShieldCheck, Layers, ArrowRight, Image as ImageIcon, X, AlertCircle
} from 'lucide-react';
import { AIBadgePanel } from '../ui/AIBadgePanel';
import {
  fetchLandPassports, fetchLandTimelineEvents, compareLandPerformance, queryLandHistoryAdvisor,
  createLandPassport, deleteLandPassport, createTimelineEvent, deleteTimelineEvent, fetchLandRiskIntelligence
} from '../../services/landHistoryService';
import { exportPDFReport, exportWordDocReport, exportTextReport } from '../../utils/exportReport';

export const LandHistoryTab = () => {
  // Navigation View Mode ('timeline' | 'gallery' | 'compare' | 'risk' | 'documents')
  const [activeTab, setActiveTab] = useState('timeline');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Data State
  const [passports, setPassports] = useState([]);
  const [selectedLandId, setSelectedLandId] = useState('LND-2026-408');
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal Dialog States
  const [showAddLandModal, setShowAddLandModal] = useState(false);
  const [showAddEventModal, setShowAddEventModal] = useState(false);

  // New Land Form State
  const [newLand, setNewLand] = useState({
    farm_name: '',
    survey_number: '',
    owner: 'Agricultural Specialist Farmers Syndicate',
    village: 'Katpadi',
    district: 'Vellore',
    state: 'Tamil Nadu',
    area_acres: '15.0',
    soil_type: 'Red Loamy',
    water_source: 'Borewell + Drip',
    current_crop: 'Rice Paddy (ADT-54)'
  });

  // New Event Form State
  const [newEvent, setNewEvent] = useState({
    category: 'Cultivation',
    title: '',
    description: '',
    severity: 'Optimal',
    weather_snapshot: '29°C • Clear Sky',
    cost_inr: '0',
    income_inr: '0',
    ai_summary: 'Event verified and recorded in Digital Twin.'
  });

  // Side-by-Side Comparison State
  const [compareLandA, setCompareLandA] = useState('LND-2026-408');
  const [compareLandB, setCompareLandB] = useState('LND-2026-102');
  const [comparisonData, setComparisonData] = useState(null);

  // Floating AI Advisor State
  const [showFloatingAI, setShowFloatingAI] = useState(false);
  const [advisorPrompt, setAdvisorPrompt] = useState('');
  const [advisorMessages, setAdvisorMessages] = useState([
    { sender: 'ai', text: 'Greetings! I am your AI Land History & Digital Twin Architect (powered by Ollama qwen:latest). Ask me to analyze 6-year yield trends, historical disease outbreaks, or soil carbon evolution!' }
  ]);

  useEffect(() => {
    loadPassports();
  }, []);

  useEffect(() => {
    loadTimelineEvents();
    loadRiskData();
  }, [selectedLandId, categoryFilter, searchQuery]);

  useEffect(() => {
    if (activeTab === 'compare') {
      loadComparison();
    }
  }, [activeTab, compareLandA, compareLandB]);

  const loadPassports = async () => {
    const res = await fetchLandPassports();
    setPassports(res);
    if (res.length > 0 && !selectedLandId) {
      setSelectedLandId(res[0].land_id);
    }
  };

  const loadTimelineEvents = async () => {
    setLoading(true);
    const res = await fetchLandTimelineEvents(selectedLandId, categoryFilter, searchQuery);
    setTimelineEvents(res);
    setLoading(false);
  };

  const loadRiskData = async () => {
    const r = await fetchLandRiskIntelligence(selectedLandId);
    setRiskData(r);
  };

  const loadComparison = async () => {
    const res = await compareLandPerformance(compareLandA, compareLandB);
    setComparisonData(res);
  };

  const handleCreateLand = async (e) => {
    e.preventDefault();
    if (!newLand.farm_name) return;
    await createLandPassport(newLand);
    setShowAddLandModal(false);
    loadPassports();
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!newEvent.title) return;
    await createTimelineEvent({
      ...newEvent,
      land_id: selectedLandId,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    });
    setShowAddEventModal(false);
    loadTimelineEvents();
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm("Are you sure you want to delete this historical event?")) {
      await deleteTimelineEvent(eventId);
      loadTimelineEvents();
    }
  };

  const handleSendAdvisorChat = async () => {
    if (!advisorPrompt.trim()) return;
    const userMsg = { sender: 'user', text: advisorPrompt };
    setAdvisorMessages(prev => [...prev, userMsg]);
    const promptCopy = advisorPrompt;
    setAdvisorPrompt('');

    const contextText = `Land ID: ${selectedLandId}, Farm Name: Vellore Main Precision Farm (42.5 Acres), Events Count: ${timelineEvents.length}`;
    const aiResp = await queryLandHistoryAdvisor(promptCopy, contextText);
    setAdvisorMessages(prev => [...prev, { sender: 'ai', text: aiResp }]);
  };

  const handleExportPDF = () => {
    const passport = passports.find(p => p.land_id === selectedLandId) || passports[0] || {};
    exportPDFReport(
      `Agricultural Digital Twin Land Passport & History - ${passport.farm_name}`,
      `Land ID: ${passport.land_id}\nFarm Name: ${passport.farm_name}\nSurvey Number: ${passport.survey_number}\nOwner: ${passport.owner}\nVillage: ${passport.village}, ${passport.district}, ${passport.state}\nGPS Coordinates: ${passport.center_lat}° N, ${passport.center_lon}° E\nTotal Acreage: ${passport.area_acres} Acres\nElevation: ${passport.elevation_m}m\nSoil Type: ${passport.soil_type}\nWater Source: ${passport.water_source}\nCreated Date: ${passport.created_date}\nCurrent Crop: ${passport.current_crop}\nPrevious Crop: ${passport.previous_crop}\nOverall AI Score: ${passport.overall_ai_score}%\n\nHISTORICAL TIMELINE SUMMARY:\nTotal Events Tracked: ${timelineEvents.length} Events (2020-2026)\n5-Year Cumulative Yield: 32.4 t/ha\nHistorical Peak: 2025 Bumper Harvest (6.8 t/ha)`,
      [{ title: "Overall AI Score", value: `${passport.overall_ai_score}%` }, { title: "Cumulative Yield", value: "32.4 t/ha" }]
    );
  };

  const activePassport = passports.find(p => p.land_id === selectedLandId) || passports[0] || {};

  return (
    <div className="space-y-6 animate-in fade-in duration-300 font-mono text-xs relative">
      <AIBadgePanel 
        tabId="land-history" 
        tabName="Enterprise Agricultural Digital Twin Land History & Permanent Land Passport Platform" 
        defaultPrompt="Analyze 6-year land cultivation history, historical yields, satellite NDVI trends, disease recurrence, and financial ROI." 
      />

      {/* 1. HERO BANNER & DIGITAL LAND PASSPORT HEADER */}
      <div className="glass-panel rounded-2xl p-6 border border-emerald-500/40 bg-gradient-to-r from-emerald-950/40 via-slate-950 to-black space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                DIGITAL PASSPORT • {activePassport.land_id || 'LND-2026-408'}
              </span>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                Survey No: {activePassport.survey_number || 'SY-408/2A'}
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-100">{activePassport.farm_name || 'Vellore Main Precision Farm'}</h2>
            <p className="text-xs text-slate-300">
              👤 Owner: <strong className="text-amber-300">{activePassport.owner}</strong> • 
              Location: <strong className="text-cyan-300">{activePassport.village}, {activePassport.district} ({activePassport.center_lat}°N, {activePassport.center_lon}°E)</strong> • 
              Area: <strong className="text-emerald-300">{activePassport.area_acres} Acres</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowAddLandModal(true)}
              className="px-3.5 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Register New Land
            </button>

            <button 
              onClick={handleExportPDF}
              className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-extrabold flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 hover:opacity-90"
            >
              <Download className="w-4 h-4" /> Passport PDF
            </button>
          </div>
        </div>

        {/* HERO KPI CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-black/40 p-3 rounded-xl border border-white/10 flex items-center gap-2.5">
            <History className="w-4 h-4 text-emerald-400" />
            <div>
              <span className="text-[10px] text-slate-400 block">Total Events</span>
              <strong className="text-sm font-bold text-slate-100">{timelineEvents.length} Recorded</strong>
            </div>
          </div>
          <div className="bg-black/40 p-3 rounded-xl border border-white/10 flex items-center gap-2.5">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <div>
              <span className="text-[10px] text-slate-400 block">5-Yr Yield Total</span>
              <strong className="text-sm font-bold text-cyan-300">32.4 t/ha</strong>
            </div>
          </div>
          <div className="bg-black/40 p-3 rounded-xl border border-white/10 flex items-center gap-2.5">
            <DollarSign className="w-4 h-4 text-amber-400" />
            <div>
              <span className="text-[10px] text-slate-400 block">Cumulative Profit</span>
              <strong className="text-sm font-bold text-amber-300">₹6,22,700</strong>
            </div>
          </div>
          <div className="bg-black/40 p-3 rounded-xl border border-white/10 flex items-center gap-2.5">
            <Award className="w-4 h-4 text-indigo-400" />
            <div>
              <span className="text-[10px] text-slate-400 block">Peak Yield Year</span>
              <strong className="text-sm font-bold text-indigo-300">2025 (6.8 t/ha)</strong>
            </div>
          </div>
          <div className="bg-black/40 p-3 rounded-xl border border-white/10 flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <div>
              <span className="text-[10px] text-slate-400 block">Disease Recurrence</span>
              <strong className="text-sm font-bold text-emerald-400">Low Risk</strong>
            </div>
          </div>
          <div className="bg-black/40 p-3 rounded-xl border border-white/10 flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <div>
              <span className="text-[10px] text-slate-400 block">Soil Carbon Gain</span>
              <strong className="text-sm font-bold text-cyan-300">+1.2% Gain</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SEARCH & WORKSPACE NAVIGATION TOOLBAR */}
      <div className="glass-panel rounded-2xl p-4 border border-white/10 flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Select Registered Land Passport */}
          <select 
            value={selectedLandId} 
            onChange={(e) => setSelectedLandId(e.target.value)}
            className="h-10 bg-black/60 border border-emerald-500/50 text-emerald-300 rounded-xl text-xs px-3 focus:outline-none"
          >
            {passports.map((p) => (
              <option key={p.land_id} value={p.land_id}>
                📍 {p.farm_name} ({p.area_acres} Acres - {p.survey_number})
              </option>
            ))}
          </select>

          <div className="relative w-full sm:w-56">
            <input 
              type="text" 
              placeholder="Search Event, Year, Disease..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-3 bg-white/5 border border-white/10 rounded-xl text-xs text-slate-200 focus:outline-none placeholder:text-slate-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>

          <select 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-10 bg-black/60 border border-white/10 rounded-xl text-xs text-slate-200 px-3 focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="Cultivation">Cultivation & Sowing</option>
            <option value="Harvest">Harvest & Yield</option>
            <option value="Satellite">Satellite Pass</option>
            <option value="Pest & Disease">Pest & Disease Outbreaks</option>
            <option value="Land Purchase">Land Acquisition</option>
          </select>
        </div>

        {/* View Switcher Buttons */}
        <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
          <button 
            onClick={() => setShowAddEventModal(true)}
            className="px-3 h-9 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-xl font-bold flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Log Event
          </button>
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
            <button onClick={() => setActiveTab('timeline')} title="Chronological Digital Twin Timeline" className={`p-1.5 rounded-lg transition ${activeTab === 'timeline' ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'}`}>
              <History className="w-4 h-4 inline mr-1" /> Timeline
            </button>
            <button onClick={() => setActiveTab('risk')} title="Risk Intelligence Center" className={`p-1.5 rounded-lg transition ${activeTab === 'risk' ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'}`}>
              <AlertCircle className="w-4 h-4 inline mr-1" /> Risk Center
            </button>
            <button onClick={() => setActiveTab('gallery')} title="Before vs After Photo Inspector" className={`p-1.5 rounded-lg transition ${activeTab === 'gallery' ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'}`}>
              <ImageIcon className="w-4 h-4 inline mr-1" /> Photos
            </button>
            <button onClick={() => setActiveTab('compare')} title="Side-by-Side Farm Performance Comparison" className={`p-1.5 rounded-lg transition ${activeTab === 'compare' ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'}`}>
              <Sliders className="w-4 h-4 inline mr-1" /> Compare
            </button>
          </div>
        </div>
      </div>

      {/* 3. WORKSPACE VIEWS */}
      {loading ? (
        <div className="glass-panel rounded-2xl p-12 text-center text-slate-400 flex items-center justify-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin text-emerald-400" /> Loading Agricultural Digital Twin Land History...
        </div>
      ) : activeTab === 'timeline' ? (
        /* CHRONOLOGICAL DIGITAL TWIN TIMELINE VIEW */
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" /> Permanent Chronological Land History ({activePassport.farm_name})
          </h3>

          <div className="relative border-l-2 border-emerald-500/40 ml-4 pl-6 space-y-6">
            {timelineEvents.map((ev) => (
              <div key={ev.event_id} className="relative glass-panel rounded-2xl p-5 border border-white/10 bg-black/40 space-y-3">
                <div className="absolute -left-[31px] top-6 w-4 h-4 rounded-full bg-emerald-500 border-4 border-slate-950" />

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {ev.category}
                    </span>
                    <span className="text-[10px] text-slate-400">📅 {ev.timestamp}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                      ev.severity === 'Optimal' ? 'bg-emerald-500/20 text-emerald-300' : ev.severity === 'Warning' ? 'bg-amber-500/20 text-amber-300' : 'bg-cyan-500/20 text-cyan-300'
                    }`}>
                      {ev.severity}
                    </span>
                    <button onClick={() => handleDeleteEvent(ev.event_id)} title="Delete Event" className="text-slate-500 hover:text-rose-400 p-1">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-8 space-y-1">
                    <h4 className="text-base font-extrabold text-slate-100">{ev.title}</h4>
                    <p className="text-slate-300 text-xs">{ev.description}</p>
                    <p className="text-slate-400 text-[11px]">🌤 Weather Snapshot: <span className="text-cyan-300">{ev.weather_snapshot}</span></p>
                    {ev.ai_summary && (
                      <div className="mt-2 p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-200 text-[11px]">
                        💡 <strong>AI Evidence Summary:</strong> {ev.ai_summary}
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-4 space-y-2">
                    {ev.image_url && (
                      <img src={ev.image_url} alt={ev.title} className="w-full h-28 rounded-xl object-cover border border-white/10" />
                    )}
                    {ev.income_inr > 0 && (
                      <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-center">
                        <span className="text-[10px] text-slate-400 block">Revenue Realized</span>
                        <strong className="text-emerald-400 font-bold text-xs">+₹{ev.income_inr.toLocaleString()}</strong>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : activeTab === 'risk' ? (
        /* RISK INTELLIGENCE CENTER */
        <div className="glass-panel rounded-2xl p-6 border border-amber-500/40 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="text-base font-extrabold text-slate-100 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-400" /> Historical Risk & Climate Vulnerability Intelligence
            </h3>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              Climate Resilience: A+ (96.2%)
            </span>
          </div>

          {riskData && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-black/40 border border-white/10">
                <span className="text-[10px] text-slate-400 block">Disease Recurrence Risk</span>
                <strong className="text-lg font-bold text-emerald-400">{riskData.disease_recurrence_prob_pct}% (Low)</strong>
              </div>
              <div className="p-4 rounded-xl bg-black/40 border border-white/10">
                <span className="text-[10px] text-slate-400 block">Pest Outbreak Risk</span>
                <strong className="text-lg font-bold text-cyan-300">{riskData.pest_outbreak_prob_pct}% (Low)</strong>
              </div>
              <div className="p-4 rounded-xl bg-black/40 border border-white/10">
                <span className="text-[10px] text-slate-400 block">Flood Vulnerability</span>
                <strong className="text-lg font-bold text-slate-100">{riskData.flood_vulnerability_score}</strong>
              </div>
              <div className="p-4 rounded-xl bg-black/40 border border-white/10">
                <span className="text-[10px] text-slate-400 block">Financial Loss Risk</span>
                <strong className="text-lg font-bold text-emerald-400">{riskData.financial_loss_risk}</strong>
              </div>
            </div>
          )}

          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/40 text-emerald-200 text-xs">
            💡 <strong>AI Risk Assessment:</strong> {riskData?.ai_risk_summary}
          </div>
        </div>
      ) : activeTab === 'gallery' ? (
        /* BEFORE VS AFTER PHOTO INSPECTION GALLERY */
        <div className="glass-panel rounded-2xl p-6 border border-emerald-500/40 space-y-6">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-emerald-400" /> Historical Photo Evidence & Before vs After Inspection
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-2xl bg-black/60 border border-rose-500/40 space-y-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                BEFORE (Nov 2024) • Leaf Blast Outbreak
              </span>
              <img src="https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&q=80&w=600" alt="Before" className="w-full h-48 rounded-xl object-cover border border-white/10" />
              <p className="text-slate-300 text-xs">Pyricularia oryzae fungal spots detected on 1.5 acres in Northern boundary.</p>
            </div>

            <div className="p-4 rounded-2xl bg-black/60 border border-emerald-500/40 space-y-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                AFTER (Jul 2026) • Complete Recovery
              </span>
              <img src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=600" alt="After" className="w-full h-48 rounded-xl object-cover border border-white/10" />
              <p className="text-slate-300 text-xs">Healthy canopy growth (NDVI 0.82) following Tricyclazole 75% WP application.</p>
            </div>
          </div>
        </div>
      ) : activeTab === 'compare' ? (
        /* SIDE-BY-SIDE FARM PERFORMANCE COMPARISON */
        <div className="glass-panel rounded-2xl p-6 border border-emerald-500/40 space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-white/10 pb-4">
            <h3 className="text-base font-extrabold text-slate-100 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-emerald-400" /> Side-by-Side Farm Performance Comparison (Farm A vs B)
            </h3>
            <div className="flex items-center gap-3">
              <select value={compareLandA} onChange={(e) => setCompareLandA(e.target.value)} className="bg-black/80 border border-emerald-500/50 text-emerald-300 text-xs rounded-xl px-2 py-1">
                <option value="LND-2026-408">Vellore Main Precision Farm</option>
                <option value="LND-2026-102">Thanjavur Delta Paddy Estate</option>
              </select>
              <span className="text-slate-400 font-bold">VS</span>
              <select value={compareLandB} onChange={(e) => setCompareLandB(e.target.value)} className="bg-black/80 border border-cyan-500/50 text-cyan-300 text-xs rounded-xl px-2 py-1">
                <option value="LND-2026-102">Thanjavur Delta Paddy Estate</option>
                <option value="LND-2026-408">Vellore Main Precision Farm</option>
              </select>
            </div>
          </div>

          {comparisonData && comparisonData.land_a && comparisonData.land_b && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/40 space-y-2">
                <h4 className="font-extrabold text-emerald-300 text-sm">{comparisonData.land_a.farm_name}</h4>
                <p className="text-slate-300">Total Area: <strong>{comparisonData.land_a.area_acres} Acres</strong></p>
                <p className="text-slate-300">Cumulative Yield: <strong>{comparisonData.cumulative_metrics.cumulative_yield_t_ha_a} t/ha</strong></p>
                <p className="text-slate-300">Cumulative Net Income: <strong>₹{comparisonData.cumulative_metrics.net_income_inr_a.toLocaleString()}</strong></p>
                <p className="text-slate-300">AI Score: <strong className="text-emerald-400">{comparisonData.land_a.overall_ai_score}%</strong></p>
              </div>

              <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/40 space-y-2">
                <h4 className="font-extrabold text-cyan-300 text-sm">{comparisonData.land_b.farm_name}</h4>
                <p className="text-slate-300">Total Area: <strong>{comparisonData.land_b.area_acres} Acres</strong></p>
                <p className="text-slate-300">Cumulative Yield: <strong>{comparisonData.cumulative_metrics.cumulative_yield_t_ha_b} t/ha</strong></p>
                <p className="text-slate-300">Cumulative Net Income: <strong>₹{comparisonData.cumulative_metrics.net_income_inr_b.toLocaleString()}</strong></p>
                <p className="text-slate-300">AI Score: <strong className="text-cyan-400">{comparisonData.land_b.overall_ai_score}%</strong></p>
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* REGISTER NEW LAND MODAL */}
      {showAddLandModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-lg rounded-2xl p-6 border border-emerald-500/50 bg-slate-950 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-extrabold text-emerald-300 text-base flex items-center gap-2">
                <Plus className="w-5 h-5" /> Register New Farmland Digital Passport
              </h3>
              <button onClick={() => setShowAddLandModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLand} className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Farm Name</label>
                <input 
                  type="text" required 
                  placeholder="e.g. Coimbatore Cotton Hub" 
                  value={newLand.farm_name}
                  onChange={(e) => setNewLand({...newLand, farm_name: e.target.value})}
                  className="w-full h-9 px-3 bg-white/5 border border-white/10 rounded-xl text-slate-200 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Survey Number</label>
                  <input 
                    type="text" required 
                    placeholder="SY-204/1B" 
                    value={newLand.survey_number}
                    onChange={(e) => setNewLand({...newLand, survey_number: e.target.value})}
                    className="w-full h-9 px-3 bg-white/5 border border-white/10 rounded-xl text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Area (Acres)</label>
                  <input 
                    type="number" step="0.1" required 
                    placeholder="15.0" 
                    value={newLand.area_acres}
                    onChange={(e) => setNewLand({...newLand, area_acres: e.target.value})}
                    className="w-full h-9 px-3 bg-white/5 border border-white/10 rounded-xl text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Village / District</label>
                  <input 
                    type="text" 
                    value={newLand.village}
                    onChange={(e) => setNewLand({...newLand, village: e.target.value})}
                    className="w-full h-9 px-3 bg-white/5 border border-white/10 rounded-xl text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Soil Type</label>
                  <input 
                    type="text" 
                    value={newLand.soil_type}
                    onChange={(e) => setNewLand({...newLand, soil_type: e.target.value})}
                    className="w-full h-9 px-3 bg-white/5 border border-white/10 rounded-xl text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button type="button" onClick={() => setShowAddLandModal(false)} className="px-4 h-9 rounded-xl bg-white/5 text-slate-400">Cancel</button>
                <button type="submit" className="px-5 h-9 rounded-xl bg-emerald-500 text-slate-950 font-extrabold">Save Digital Passport</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LOG TIMELINE EVENT MODAL */}
      {showAddEventModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-lg rounded-2xl p-6 border border-cyan-500/50 bg-slate-950 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-extrabold text-cyan-300 text-base flex items-center gap-2">
                <Plus className="w-5 h-5" /> Log New Historical Event
              </h3>
              <button onClick={() => setShowAddEventModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3 font-mono text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Category</label>
                  <select 
                    value={newEvent.category} 
                    onChange={(e) => setNewEvent({...newEvent, category: e.target.value})}
                    className="w-full h-9 px-3 bg-black/60 border border-white/10 rounded-xl text-slate-200 focus:outline-none"
                  >
                    <option value="Cultivation">Cultivation & Sowing</option>
                    <option value="Harvest">Harvest & Yield</option>
                    <option value="Pest & Disease">Pest & Disease Outbreak</option>
                    <option value="Satellite">Satellite Pass</option>
                    <option value="Land Purchase">Land Infrastructure</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Severity / Status</label>
                  <select 
                    value={newEvent.severity} 
                    onChange={(e) => setNewEvent({...newEvent, severity: e.target.value})}
                    className="w-full h-9 px-3 bg-black/60 border border-white/10 rounded-xl text-slate-200 focus:outline-none"
                  >
                    <option value="Optimal">Optimal</option>
                    <option value="Warning">Warning</option>
                    <option value="Info">Info</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Event Title</label>
                <input 
                  type="text" required 
                  placeholder="e.g. Trichoderma Viride Organic Soil Application" 
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                  className="w-full h-9 px-3 bg-white/5 border border-white/10 rounded-xl text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Description & Field Notes</label>
                <textarea 
                  rows={2} 
                  placeholder="Details of operation, doses, or crop observations..." 
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-slate-200 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Cost Spent (₹)</label>
                  <input 
                    type="number" 
                    value={newEvent.cost_inr}
                    onChange={(e) => setNewEvent({...newEvent, cost_inr: e.target.value})}
                    className="w-full h-9 px-3 bg-white/5 border border-white/10 rounded-xl text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Revenue Realized (₹)</label>
                  <input 
                    type="number" 
                    value={newEvent.income_inr}
                    onChange={(e) => setNewEvent({...newEvent, income_inr: e.target.value})}
                    className="w-full h-9 px-3 bg-white/5 border border-white/10 rounded-xl text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button type="button" onClick={() => setShowAddEventModal(false)} className="px-4 h-9 rounded-xl bg-white/5 text-slate-400">Cancel</button>
                <button type="submit" className="px-5 h-9 rounded-xl bg-cyan-500 text-slate-950 font-extrabold">Log Timeline Event</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FLOATING AI LAND HISTORY ADVISOR TOGGLE BUTTON */}
      <button 
        onClick={() => setShowFloatingAI(!showFloatingAI)}
        className="fixed bottom-6 right-6 z-50 p-3.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold shadow-2xl hover:scale-105 transition flex items-center gap-2 border border-white/20"
      >
        <Sparkles className="w-5 h-5" />
        <span className="hidden sm:inline">AI Land Advisor</span>
      </button>

      {/* FLOATING AI CHAT WINDOW */}
      {showFloatingAI && (
        <div className="fixed bottom-20 right-6 z-50 w-96 glass-panel rounded-2xl p-4 border border-emerald-500/50 bg-slate-950/95 shadow-2xl space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="font-bold text-emerald-300 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-400" /> AI Land Advisor (Ollama Qwen)
            </span>
            <button onClick={() => setShowFloatingAI(false)} className="text-slate-400 hover:text-white">✕</button>
          </div>

          <div className="h-60 overflow-y-auto custom-scrollbar space-y-2 pr-1">
            {advisorMessages.map((msg, idx) => (
              <div key={idx} className={`p-2.5 rounded-xl ${msg.sender === 'user' ? 'bg-emerald-500/10 text-emerald-200 border border-emerald-500/30' : 'bg-white/5 text-slate-200 border border-white/10'}`}>
                {msg.text}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <input 
              type="text" 
              placeholder="Ask land history advisor..." 
              value={advisorPrompt}
              onChange={(e) => setAdvisorPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendAdvisorChat()}
              className="flex-1 h-8 px-2 bg-white/5 border border-white/10 rounded-lg text-xs text-slate-200 focus:outline-none"
            />
            <button onClick={handleSendAdvisorChat} className="px-3 h-8 bg-emerald-500 text-black font-bold rounded-lg hover:bg-emerald-400 text-xs">Send</button>
          </div>
        </div>
      )}

    </div>
  );
};
