import React, { useState, useEffect, useRef } from 'react';
import {
  FlaskConical, Activity, Layers, Grid, List, Calendar, MapPin, Search, Plus, Filter,
  Trash2, Edit3, ShieldAlert, Sparkles, CheckCircle2, AlertTriangle, AlertOctagon, TrendingUp,
  Download, FileText, Share2, RefreshCw, Eye, Star, Pin, Sliders, CheckSquare, MessageSquare,
  Droplets, Thermometer, ShieldCheck, Database, Award, Zap, BarChart3, HelpCircle, Compass
} from 'lucide-react';
import { AIBadgePanel } from '../ui/AIBadgePanel';
import {
  fetchSoilSamples, fetchSoilSampleById, createSoilSample, updateSoilSample,
  deleteSoilSample, compareSoilSamples, fetchSoilRiskMatrix, fetchNearbySoilLabs, querySoilDoctor
} from '../../services/soilService';
import { exportPDFReport, exportWordDocReport, exportTextReport } from '../../utils/exportReport';

// 3D SOIL LAYER CANVAS VISUALIZATION (CANVAS RENDERER)
const SoilProfileCanvas3D = ({ activeLayer, setActiveLayer }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let particleOffset = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width;
      const h = canvas.height;

      // 1. Top Soil (0 - 25% height)
      ctx.fillStyle = activeLayer === 'topsoil' ? '#3d2514' : '#2d1b0d';
      ctx.fillRect(0, 0, w, h * 0.25);
      ctx.fillStyle = '#85532b';
      ctx.font = '11px monospace';
      ctx.fillText('Topsoil Layer (0 - 15 cm) • Rich Humus & Organic Carbon (0.85%)', 15, 25);

      // 2. Root Zone (25% - 55% height)
      ctx.fillStyle = activeLayer === 'rootzone' ? '#261609' : '#1d1107';
      ctx.fillRect(0, h * 0.25, w, h * 0.30);
      ctx.fillStyle = '#10b981';
      ctx.fillText('Root Zone Substratum (15 - 45 cm) • Active Rhizosphere & Microbial Zone', 15, h * 0.25 + 25);

      // Draw Animated Roots
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(w * 0.3, h * 0.1);
      ctx.quadraticCurveTo(w * 0.35, h * 0.35, w * 0.25, h * 0.5);
      ctx.moveTo(w * 0.3, h * 0.1);
      ctx.quadraticCurveTo(w * 0.25, h * 0.3, w * 0.4, h * 0.45);
      ctx.moveTo(w * 0.7, h * 0.1);
      ctx.quadraticCurveTo(w * 0.65, h * 0.35, w * 0.75, h * 0.52);
      ctx.stroke();

      // 3. Sub Soil (55% - 80% height)
      ctx.fillStyle = activeLayer === 'subsoil' ? '#1c1712' : '#14100c';
      ctx.fillRect(0, h * 0.55, w, h * 0.25);
      ctx.fillStyle = '#38bdf8';
      ctx.fillText('Subsoil & Clay Layer (45 - 90 cm) • Mineral Storage & Moisture Reserve', 15, h * 0.55 + 25);

      // 4. Hard Layer & Groundwater (80% - 100% height)
      ctx.fillStyle = activeLayer === 'groundwater' ? '#071e3d' : '#030e1e';
      ctx.fillRect(0, h * 0.80, w, h * 0.20);
      ctx.fillStyle = '#60a5fa';
      ctx.fillText('Aquifer & Groundwater Table (90 - 120+ cm)', 15, h * 0.80 + 25);

      // Animated Water & Nutrient Flow Particles
      particleOffset = (particleOffset + 0.8) % 40;
      ctx.fillStyle = '#38bdf8';
      for (let x = 30; x < w; x += 60) {
        const y = (h * 0.2) + ((x + particleOffset) % (h * 0.7));
        ctx.beginPath();
        ctx.arc(x, y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [activeLayer]);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-amber-500/30 bg-black/60 shadow-2xl">
      <canvas ref={canvasRef} width={800} height={320} className="w-full h-72 block cursor-pointer" />
      <div className="absolute bottom-3 right-3 flex items-center gap-2">
        {['topsoil', 'rootzone', 'subsoil', 'groundwater'].map((layer) => (
          <button
            key={layer}
            onClick={() => setActiveLayer(layer)}
            className={`px-2.5 py-1 rounded text-[10px] font-bold border transition ${
              activeLayer === layer ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-black/60 text-slate-400 border-white/10'
            }`}
          >
            {layer.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
};

export const SoilHealthTab = () => {
  // Navigation & View Mode State
  const [activeTab, setActiveTab] = useState('gallery'); // 'gallery' | 'profile3d' | 'lab' | 'doctor' | 'risk' | 'compare' | 'crud'
  const [searchQuery, setSearchQuery] = useState('');
  const [farmFilter, setFarmFilter] = useState('ALL');
  const [soilTypeFilter, setSoilTypeFilter] = useState('ALL');

  // Data State
  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSampleId, setSelectedSampleId] = useState('SOIL-2026-001');
  const [sampleDetails, setSampleDetails] = useState(null);

  // 3D Canvas Layer Selection
  const [activeLayer, setActiveLayer] = useState('rootzone');

  // Field Comparison State
  const [compareIdA, setCompareIdA] = useState('SOIL-2026-001');
  const [compareIdB, setCompareIdB] = useState('SOIL-2026-002');
  const [comparisonData, setComparisonData] = useState(null);

  // Risk Matrix Data
  const [riskMatrix, setRiskMatrix] = useState(null);
  const [nearbyLabs, setNearbyLabs] = useState([]);

  // Modals & Floating AI State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFloatingAI, setShowFloatingAI] = useState(false);
  const [doctorPrompt, setDoctorPrompt] = useState('');
  const [doctorMessages, setDoctorMessages] = useState([
    { sender: 'ai', text: 'Greetings! I am your AI Soil Doctor (powered by Ollama qwen:latest). Ask any questions regarding soil chemistry, NPK fertigation, or soil organic carbon restoration!' }
  ]);

  // Form State
  const [formData, setFormData] = useState({
    farm_name: 'Vellore Main Precision Farm',
    field_name: 'Paddy Block A',
    soil_type: 'Red Loamy Soil',
    ph_level: 6.8,
    nitrogen_kg_ha: 140.0,
    phosphorus_kg_ha: 45.0,
    potassium_kg_ha: 210.0,
    organic_carbon_pct: 0.85,
    zinc_ppm: 1.2,
    recommendation: 'Apply balanced organic compost and NPK split.'
  });

  useEffect(() => {
    loadSamples();
    loadRiskAndLabs();
  }, [searchQuery, farmFilter, soilTypeFilter]);

  useEffect(() => {
    if (selectedSampleId) {
      loadSampleDetails(selectedSampleId);
    }
  }, [selectedSampleId]);

  useEffect(() => {
    if (activeTab === 'compare') {
      loadComparison();
    }
  }, [activeTab, compareIdA, compareIdB]);

  const loadSamples = async () => {
    setLoading(true);
    const res = await fetchSoilSamples(searchQuery, farmFilter, soilTypeFilter);
    setSamples(res);
    setLoading(false);
    if (res.length > 0 && !selectedSampleId) {
      setSelectedSampleId(res[0].sample_id);
    }
  };

  const loadSampleDetails = async (id) => {
    const res = await fetchSoilSampleById(id);
    setSampleDetails(res);
  };

  const loadComparison = async () => {
    const res = await compareSoilSamples(compareIdA, compareIdB);
    setComparisonData(res);
  };

  const loadRiskAndLabs = async () => {
    const r = await fetchSoilRiskMatrix();
    const l = await fetchNearbySoilLabs();
    setRiskMatrix(r);
    setNearbyLabs(l);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    await createSoilSample(formData);
    setShowCreateModal(false);
    loadSamples();
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    await updateSoilSample(selectedSampleId, formData);
    setShowEditModal(false);
    loadSamples();
    loadSampleDetails(selectedSampleId);
  };

  const handleDelete = async (id) => {
    if (window.confirm(`Move Soil Sample ${id} to Soft Deleted records?`)) {
      await deleteSoilSample(id);
      loadSamples();
    }
  };

  const handleSendDoctorChat = async () => {
    if (!doctorPrompt.trim()) return;
    const userMsg = { sender: 'user', text: doctorPrompt };
    setDoctorMessages(prev => [...prev, userMsg]);
    const promptCopy = doctorPrompt;
    setDoctorPrompt('');

    const contextText = `Sample: ${selectedSampleId}, Soil: ${sampleDetails?.soil_type}, pH: ${sampleDetails?.ph_level}, NPK: ${sampleDetails?.nitrogen_kg_ha}/${sampleDetails?.phosphorus_kg_ha}/${sampleDetails?.potassium_kg_ha}`;
    const aiResp = await querySoilDoctor(promptCopy, contextText);
    setDoctorMessages(prev => [...prev, { sender: 'ai', text: aiResp }]);
  };

  const handleExportPDF = () => {
    if (!sampleDetails) return;
    exportPDFReport(
      `Soil Intelligence & Laboratory Dossier - ${sampleDetails.sample_id}`,
      `Sample ID: ${sampleDetails.sample_id}\nFarm: ${sampleDetails.farm_name} (${sampleDetails.field_name})\nSoil Type: ${sampleDetails.soil_type}\npH Level: ${sampleDetails.ph_level}\nOrganic Carbon: ${sampleDetails.organic_carbon_pct}%\nNitrogen: ${sampleDetails.nitrogen_kg_ha} kg/ha\nPhosphorus: ${sampleDetails.phosphorus_kg_ha} kg/ha\nPotassium: ${sampleDetails.potassium_kg_ha} kg/ha\nHealth Score: ${sampleDetails.health_score}%\nAI Recommendation: ${sampleDetails.recommendation}`,
      [{ title: "Overall Soil Index", value: `${sampleDetails.health_score}%` }, { title: "pH Status", value: `${sampleDetails.ph_level}` }]
    );
  };

  const currentSample = sampleDetails || samples[0] || {};
  const totalCount = samples.length;
  const avgPH = (samples.reduce((s, x) => s + (x.ph_level || 0), 0) / (totalCount || 1)).toFixed(1);
  const avgOC = (samples.reduce((s, x) => s + (x.organic_carbon_pct || 0), 0) / (totalCount || 1)).toFixed(2);
  const healthyCount = samples.filter(s => (s.health_score || 0) >= 88.0).length;
  const warningCount = samples.filter(s => (s.health_score || 0) < 88.0).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300 font-mono text-xs relative">
      <AIBadgePanel 
        tabId="soil-health" 
        tabName="AI Soil Health Intelligence & Precision Laboratory Center" 
        defaultPrompt="Analyze soil chemistry, 3D layer profile, NPK nutrient balance, 7D-1Y risk matrix, and generate fertilizer prescriptions." 
      />

      {/* 1. HERO BANNER */}
      <div className="glass-panel rounded-2xl p-6 border border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-slate-950 to-black space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                FIELD-102 • {currentSample.sample_id || 'SOIL-2026-001'}
              </span>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                AI Active • Online Sync
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-100">{currentSample.farm_name || 'Vellore Main Precision Farm'}</h2>
            <p className="text-xs text-slate-300">📍 Field: <strong className="text-amber-300">{currentSample.field_name}</strong> • Soil: <strong className="text-cyan-300">{currentSample.soil_type}</strong> • Coordinates: <strong>12.9165 N, 79.1325 E</strong></p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">Overall Soil Health Index</span>
              <strong className="text-2xl font-black text-amber-400">{currentSample.health_score || 92.4}%</strong>
            </div>
            <button 
              onClick={handleExportPDF}
              className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-extrabold flex items-center gap-1.5 shadow-lg shadow-amber-500/20 hover:opacity-90"
            >
              <Download className="w-4 h-4" /> Lab Dossier (PDF)
            </button>
          </div>
        </div>

        {/* HERO KPI CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-black/40 p-3 rounded-xl border border-white/10 flex items-center gap-2.5">
            <FlaskConical className="w-4 h-4 text-amber-400" />
            <div>
              <span className="text-[10px] text-slate-400 block">Total Soil Samples</span>
              <strong className="text-sm font-bold text-slate-100">{totalCount}</strong>
            </div>
          </div>
          <div className="bg-black/40 p-3 rounded-xl border border-white/10 flex items-center gap-2.5">
            <Droplets className="w-4 h-4 text-cyan-400" />
            <div>
              <span className="text-[10px] text-slate-400 block">Average pH</span>
              <strong className="text-sm font-bold text-cyan-300">{avgPH}</strong>
            </div>
          </div>
          <div className="bg-black/40 p-3 rounded-xl border border-white/10 flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <div>
              <span className="text-[10px] text-slate-400 block">Organic Carbon (OC)</span>
              <strong className="text-sm font-bold text-emerald-300">{avgOC}%</strong>
            </div>
          </div>
          <div className="bg-black/40 p-3 rounded-xl border border-white/10 flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <div>
              <span className="text-[10px] text-slate-400 block">Optimal Soil Samples</span>
              <strong className="text-sm font-bold text-emerald-400">{healthyCount}</strong>
            </div>
          </div>
          <div className="bg-black/40 p-3 rounded-xl border border-white/10 flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <div>
              <span className="text-[10px] text-slate-400 block">At-Risk Samples</span>
              <strong className="text-sm font-bold text-amber-300">{warningCount}</strong>
            </div>
          </div>
          <div className="bg-black/40 p-3 rounded-xl border border-white/10 flex items-center gap-2.5">
            <Award className="w-4 h-4 text-indigo-400" />
            <div>
              <span className="text-[10px] text-slate-400 block">Government Soil Tests</span>
              <strong className="text-sm font-bold text-indigo-300">Certified</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SEARCH & WORKSPACE NAVIGATION TOOLBAR */}
      <div className="glass-panel rounded-2xl p-4 border border-white/10 flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <input 
              type="text" 
              placeholder="Search Soil Sample ID, Field, Type..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-3 bg-white/5 border border-white/10 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500/50 placeholder:text-slate-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>

          {/* Farm Filter */}
          <select 
            value={farmFilter} 
            onChange={(e) => setFarmFilter(e.target.value)}
            className="h-10 bg-black/60 border border-white/10 rounded-xl text-xs text-slate-200 px-3 focus:outline-none focus:border-amber-500/50"
          >
            <option value="ALL">All Farms</option>
            <option value="Vellore Main Precision Farm">Vellore Main Precision Farm</option>
            <option value="Kanchipuram Agro Park">Kanchipuram Agro Park</option>
            <option value="Thanjavur Rice Delta Belt">Thanjavur Rice Delta Belt</option>
            <option value="Madurai Horticulture Zone">Madurai Horticulture Zone</option>
            <option value="Coimbatore Cotton & Grain Ranch">Coimbatore Cotton Ranch</option>
          </select>
        </div>

        {/* View Mode Switcher Buttons & Add Record */}
        <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
            <button onClick={() => setActiveTab('gallery')} title="Interactive Soil Gallery" className={`p-1.5 rounded-lg transition ${activeTab === 'gallery' ? 'bg-amber-500/20 text-amber-400' : 'text-slate-400 hover:text-slate-200'}`}>
              <Grid className="w-4 h-4" />
            </button>
            <button onClick={() => setActiveTab('profile3d')} title="3D Soil Layer Profile" className={`p-1.5 rounded-lg transition ${activeTab === 'profile3d' ? 'bg-amber-500/20 text-amber-400' : 'text-slate-400 hover:text-slate-200'}`}>
              <Layers className="w-4 h-4" />
            </button>
            <button onClick={() => setActiveTab('lab')} title="24+ Chemistry & Physics Lab" className={`p-1.5 rounded-lg transition ${activeTab === 'lab' ? 'bg-amber-500/20 text-amber-400' : 'text-slate-400 hover:text-slate-200'}`}>
              <FlaskConical className="w-4 h-4" />
            </button>
            <button onClick={() => setActiveTab('compare')} title="Field Soil Comparison (Field A vs B)" className={`p-1.5 rounded-lg transition ${activeTab === 'compare' ? 'bg-amber-500/20 text-amber-400' : 'text-slate-400 hover:text-slate-200'}`}>
              <Sliders className="w-4 h-4" />
            </button>
            <button onClick={() => setActiveTab('risk')} title="Soil Risk Center (7D - 1Y)" className={`p-1.5 rounded-lg transition ${activeTab === 'risk' ? 'bg-amber-500/20 text-amber-400' : 'text-slate-400 hover:text-slate-200'}`}>
              <ShieldAlert className="w-4 h-4" />
            </button>
          </div>

          <button 
            onClick={() => setShowCreateModal(true)} 
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-extrabold flex items-center gap-1.5 hover:opacity-90 shadow-lg shadow-amber-500/20 text-xs"
          >
            <Plus className="w-4 h-4" /> Add Soil Sample
          </button>
        </div>
      </div>

      {/* 3. WORKSPACE VIEWS */}
      {loading ? (
        <div className="glass-panel rounded-2xl p-12 text-center text-slate-400 flex items-center justify-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin text-amber-400" /> Loading Soil Laboratory Database...
        </div>
      ) : activeTab === 'gallery' ? (
        /* INTERACTIVE SOIL GALLERY */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {samples.map((s) => (
            <div 
              key={s.sample_id} 
              onClick={() => setSelectedSampleId(s.sample_id)}
              className={`glass-panel rounded-2xl border transition p-4 cursor-pointer flex flex-col justify-between hover:border-amber-500/40 ${
                selectedSampleId === s.sample_id ? 'border-amber-500/60 bg-amber-950/20 shadow-lg shadow-amber-950/40' : 'border-white/10 bg-black/40'
              }`}
            >
              <div className="relative h-40 w-full rounded-xl overflow-hidden mb-3 border border-white/10 bg-slate-900">
                <img src={s.image_url} alt={s.soil_type} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-black/80 text-amber-300 border border-amber-500/40">
                  {s.sample_id}
                </div>
                <div className="absolute top-2 right-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {s.health_score}% Index
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-slate-100">{s.soil_type}</h3>
                <p className="text-xs text-slate-300">📍 {s.farm_name} • {s.field_name}</p>
                <p className="text-xs text-slate-400">pH: <strong className="text-amber-300">{s.ph_level}</strong> • Nitrogen: <strong className="text-emerald-300">{s.nitrogen_kg_ha} kg/ha</strong></p>
                <p className="text-xs text-slate-400 line-clamp-2 mt-1">💡 <span className="text-slate-300">{s.recommendation}</span></p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Tested: {s.test_date}</span>
                <div className="flex items-center gap-2">
                  <button onClick={(e) => { e.stopPropagation(); setSelectedSampleId(s.sample_id); setShowEditModal(true); }} className="text-slate-400 hover:text-amber-400">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(s.sample_id); }} className="text-slate-400 hover:text-rose-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : activeTab === 'profile3d' ? (
        /* 3D SOIL PROFILE VISUALIZATION */
        <div className="space-y-4">
          <SoilProfileCanvas3D activeLayer={activeLayer} setActiveLayer={setActiveLayer} />
          <div className="glass-panel rounded-2xl p-4 border border-white/10 space-y-2">
            <h4 className="font-bold text-amber-300 text-xs">Active Layer Deep-Dive Analysis: {activeLayer.toUpperCase()}</h4>
            <p className="text-xs text-slate-300">
              {activeLayer === 'topsoil' && 'Topsoil (0-15cm): Contains 85% of active plant roots and organic matter. High Nitrogen (140 kg/ha) and Organic Carbon (0.85%).'}
              {activeLayer === 'rootzone' && 'Root Zone (15-45cm): Active rhizosphere microflora. Optimal water holding capacity and phosphorus absorption zone.'}
              {activeLayer === 'subsoil' && 'Subsoil (45-90cm): Clay accumulation zone storing potassium reserves (210 kg/ha) and subsoil moisture.'}
              {activeLayer === 'groundwater' && 'Groundwater Aquifer (90-120cm+): Water table depth 1.2m. Low salinity (0.4 dS/m) and optimal recharge rate.'}
            </p>
          </div>
        </div>
      ) : activeTab === 'lab' ? (
        /* 24+ CHEMISTRY & PHYSICS LABORATORY DASHBOARD */
        <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-amber-400" /> 24+ Soil Chemistry & Physics Laboratory Parameters ({currentSample.sample_id})
            </h3>
            <span className="text-xs font-mono text-emerald-400 font-bold">Health Score: {currentSample.health_score}%</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {[
              { label: 'pH Level', value: currentSample.ph_level, ideal: '6.5 - 7.5', status: 'Optimal' },
              { label: 'Nitrogen (N)', value: `${currentSample.nitrogen_kg_ha} kg/ha`, ideal: '120 - 180', status: 'Good' },
              { label: 'Phosphorus (P)', value: `${currentSample.phosphorus_kg_ha} kg/ha`, ideal: '40 - 60', status: 'Optimal' },
              { label: 'Potassium (K)', value: `${currentSample.potassium_kg_ha} kg/ha`, ideal: '180 - 250', status: 'Optimal' },
              { label: 'Organic Carbon', value: `${currentSample.organic_carbon_pct}%`, ideal: '0.75 - 1.2%', status: 'Good' },
              { label: 'Zinc (Zn)', value: `${currentSample.zinc_ppm} ppm`, ideal: '1.0 - 2.5', status: 'Slight Deficit' },
              { label: 'Calcium (Ca)', value: '1,200 ppm', ideal: '1,000 - 1,500', status: 'Optimal' },
              { label: 'Magnesium (Mg)', value: '340 ppm', ideal: '250 - 450', status: 'Optimal' },
              { label: 'Sulfur (S)', value: '24.5 ppm', ideal: '15 - 30', status: 'Good' },
              { label: 'Iron (Fe)', value: '18.2 ppm', ideal: '10 - 25', status: 'Optimal' },
              { label: 'Boron (B)', value: '0.8 ppm', ideal: '0.5 - 1.5', status: 'Good' },
              { label: 'Compaction', value: '140 PSI', ideal: '< 200 PSI', status: 'Low' }
            ].map((param) => (
              <div key={param.label} className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1 text-center">
                <span className="text-[10px] text-slate-400 block">{param.label}</span>
                <strong className="text-sm font-bold text-amber-300 block">{param.value}</strong>
                <span className="text-[9px] text-slate-500 block">Ideal: {param.ideal}</span>
                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 inline-block mt-1">{param.status}</span>
              </div>
            ))}
          </div>
        </div>
      ) : activeTab === 'compare' ? (
        /* SIDE-BY-SIDE FIELD SOIL COMPARISON VIEW */
        <div className="glass-panel rounded-2xl p-6 border border-amber-500/40 space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-white/10 pb-4">
            <h3 className="text-base font-extrabold text-slate-100 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-amber-400" /> Side-by-Side Field Soil Comparison (Sample A vs B)
            </h3>
            <div className="flex items-center gap-3">
              <select value={compareIdA} onChange={(e) => setCompareIdA(e.target.value)} className="bg-black/80 border border-amber-500/50 text-amber-300 text-xs rounded-xl px-2 py-1">
                {samples.map(s => <option key={s.sample_id} value={s.sample_id}>{s.sample_id} - {s.field_name}</option>)}
              </select>
              <span className="text-slate-400 font-bold">VS</span>
              <select value={compareIdB} onChange={(e) => setCompareIdB(e.target.value)} className="bg-black/80 border border-cyan-500/50 text-cyan-300 text-xs rounded-xl px-2 py-1">
                {samples.map(s => <option key={s.sample_id} value={s.sample_id}>{s.sample_id} - {s.field_name}</option>)}
              </select>
            </div>
          </div>

          {comparisonData && comparisonData.sample_a && comparisonData.sample_b && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
              <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/40 space-y-2">
                <h4 className="font-extrabold text-amber-300 text-sm">{comparisonData.sample_a.sample_id} ({comparisonData.sample_a.field_name})</h4>
                <p className="text-slate-300">Soil Type: <strong>{comparisonData.sample_a.soil_type}</strong></p>
                <p className="text-slate-300">pH Level: <strong>{comparisonData.sample_a.ph_level}</strong></p>
                <p className="text-slate-300">Nitrogen: <strong>{comparisonData.sample_a.nitrogen_kg_ha} kg/ha</strong></p>
                <p className="text-slate-300">Organic Carbon: <strong>{comparisonData.sample_a.organic_carbon_pct}%</strong></p>
                <p className="text-slate-300">Health Index: <strong className="text-amber-400">{comparisonData.sample_a.health_score}%</strong></p>
              </div>

              <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/40 space-y-2">
                <h4 className="font-extrabold text-cyan-300 text-sm">{comparisonData.sample_b.sample_id} ({comparisonData.sample_b.field_name})</h4>
                <p className="text-slate-300">Soil Type: <strong>{comparisonData.sample_b.soil_type}</strong></p>
                <p className="text-slate-300">pH Level: <strong>{comparisonData.sample_b.ph_level}</strong></p>
                <p className="text-slate-300">Nitrogen: <strong>{comparisonData.sample_b.nitrogen_kg_ha} kg/ha</strong></p>
                <p className="text-slate-300">Organic Carbon: <strong>{comparisonData.sample_b.organic_carbon_pct}%</strong></p>
                <p className="text-slate-300">Health Index: <strong className="text-cyan-400">{comparisonData.sample_b.health_score}%</strong></p>
              </div>
            </div>
          )}
        </div>
      ) : activeTab === 'risk' ? (
        /* SOIL RISK CENTER */
        <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" /> Soil Degradation & Risk Matrix Projections (7D - 1Y)
          </h3>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-white/10 text-slate-400">
                  <th className="p-3">Risk Factor</th>
                  <th className="p-3">7 Days</th>
                  <th className="p-3">30 Days</th>
                  <th className="p-3">90 Days</th>
                  <th className="p-3">180 Days</th>
                  <th className="p-3">1 Year</th>
                  <th className="p-3">Mitigation Action</th>
                </tr>
              </thead>
              <tbody>
                {riskMatrix?.risks?.map((r, idx) => (
                  <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition">
                    <td className="p-3 font-bold text-amber-300">{r.risk_type}</td>
                    <td className="p-3 text-emerald-400">{r['7d']}</td>
                    <td className="p-3 text-emerald-400">{r['30d']}</td>
                    <td className="p-3 text-amber-300">{r['90d']}</td>
                    <td className="p-3 text-rose-400 font-bold">{r['180d']}</td>
                    <td className="p-3 text-rose-500 font-bold">{r['1y']}</td>
                    <td className="p-3 text-slate-300">{r.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {/* FLOATING AI SOIL DOCTOR TOGGLE BUTTON */}
      <button 
        onClick={() => setShowFloatingAI(!showFloatingAI)}
        className="fixed bottom-6 right-6 z-50 p-3.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold shadow-2xl hover:scale-105 transition flex items-center gap-2 border border-white/20"
      >
        <Sparkles className="w-5 h-5" />
        <span className="hidden sm:inline">AI Soil Doctor</span>
      </button>

      {/* FLOATING AI SOIL DOCTOR CHAT WINDOW */}
      {showFloatingAI && (
        <div className="fixed bottom-20 right-6 z-50 w-96 glass-panel rounded-2xl p-4 border border-amber-500/50 bg-slate-950/95 shadow-2xl space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="font-bold text-amber-300 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-400" /> AI Soil Doctor (Ollama Qwen)
            </span>
            <button onClick={() => setShowFloatingAI(false)} className="text-slate-400 hover:text-white">✕</button>
          </div>

          <div className="h-60 overflow-y-auto custom-scrollbar space-y-2 pr-1">
            {doctorMessages.map((msg, idx) => (
              <div key={idx} className={`p-2.5 rounded-xl ${msg.sender === 'user' ? 'bg-amber-500/10 text-amber-200 border border-amber-500/30' : 'bg-white/5 text-slate-200 border border-white/10'}`}>
                {msg.text}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <input 
              type="text" 
              placeholder="Ask soil doctor..." 
              value={doctorPrompt}
              onChange={(e) => setDoctorPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendDoctorChat()}
              className="flex-1 h-8 px-2 bg-white/5 border border-white/10 rounded-lg text-xs text-slate-200 focus:outline-none"
            />
            <button onClick={handleSendDoctorChat} className="px-3 h-8 bg-amber-500 text-black font-bold rounded-lg hover:bg-amber-400 text-xs">Send</button>
          </div>
        </div>
      )}

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel rounded-2xl p-6 border border-amber-500/40 w-full max-w-lg space-y-4 font-mono text-xs">
            <h3 className="text-base font-extrabold text-slate-100 flex items-center gap-2">
              <Plus className="w-5 h-5 text-amber-400" /> Create Soil Sample Record
            </h3>
            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Field Name</label>
                  <input type="text" value={formData.field_name} onChange={(e) => setFormData({...formData, field_name: e.target.value})} className="w-full h-9 bg-white/5 border border-white/10 rounded-xl px-3 text-slate-200 focus:outline-none" required />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Soil Type</label>
                  <select value={formData.soil_type} onChange={(e) => setFormData({...formData, soil_type: e.target.value})} className="w-full h-9 bg-black border border-white/10 rounded-xl px-3 text-slate-200">
                    <option value="Red Loamy Soil">Red Loamy Soil</option>
                    <option value="Black Cotton Soil">Black Cotton Soil</option>
                    <option value="Alluvial Delta Soil">Alluvial Delta Soil</option>
                    <option value="Sandy Loam Soil">Sandy Loam Soil</option>
                    <option value="Peaty Organic Soil">Peaty Organic Soil</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">pH Level</label>
                  <input type="number" step="0.1" value={formData.ph_level} onChange={(e) => setFormData({...formData, ph_level: parseFloat(e.target.value) || 6.8})} className="w-full h-9 bg-white/5 border border-white/10 rounded-xl px-3 text-slate-200 focus:outline-none" />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Nitrogen (kg/ha)</label>
                  <input type="number" value={formData.nitrogen_kg_ha} onChange={(e) => setFormData({...formData, nitrogen_kg_ha: parseFloat(e.target.value) || 140})} className="w-full h-9 bg-white/5 border border-white/10 rounded-xl px-3 text-slate-200 focus:outline-none" />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 rounded-xl bg-white/5 text-slate-300">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-amber-500 text-black font-extrabold">Save Soil Sample</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
