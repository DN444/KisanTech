import React, { useState, useEffect, useRef } from 'react';
import {
  Globe, MapPin, Layers, Navigation, Radio, Compass, Eye, Activity, ShieldCheck,
  TrendingUp, Sparkles, Download, Search, Plus, Trash2, Edit3, RefreshCw, Sliders,
  SlidersHorizontal, Plane, Cpu, Droplets, Sun, AlertTriangle, ShieldAlert, CheckCircle2,
  Maximize2, Share2, Grid, Calendar, Clock, BarChart3, MessageSquare, ExternalLink, Zap
} from 'lucide-react';
import { AIBadgePanel } from '../ui/AIBadgePanel';
import {
  fetchFarmsAndFields, fetchMachineryAndDrones, compareFields,
  calculateAiPlantDensity, queryGisAdvisor
} from '../../services/farmMapService';
import { exportPDFReport, exportWordDocReport, exportTextReport } from '../../utils/exportReport';

// MINI INTERACTIVE 3D EARTH GLOBE CANVAS
const Mini3DEarthGlobe = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    let angle = 0;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      const r = Math.min(w, h) * 0.4;
      const cx = w / 2;
      const cy = h / 2;

      ctx.clearRect(0, 0, w, h);

      // Globe Background Sphere
      const grad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.1, cx, cy, r);
      grad.addColorStop(0, '#0284c7');
      grad.addColorStop(0.7, '#0f172a');
      grad.addColorStop(1, '#020617');

      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.strokeStyle = '#38bdf860';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Rotating Longitude/Latitude Grid
      angle += 0.015;
      ctx.strokeStyle = '#38bdf830';
      ctx.lineWidth = 1;

      for (let i = -60; i <= 60; i += 30) {
        ctx.beginPath();
        const rad = (i * Math.PI) / 180;
        const rx = r * Math.cos(rad);
        ctx.ellipse(cx, cy, rx, r, angle, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Farm Target Pin Pulse on Globe
      const pinX = cx + Math.cos(angle) * r * 0.5;
      const pinY = cy + Math.sin(angle) * r * 0.2;

      ctx.beginPath();
      ctx.arc(pinX, pinY, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#10b981';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <div className="relative w-36 h-36 rounded-2xl overflow-hidden border border-cyan-500/40 bg-slate-950/80 shadow-lg flex items-center justify-center">
      <canvas ref={canvasRef} width={144} height={144} className="w-full h-full block" />
      <div className="absolute bottom-1 left-2 text-[9px] font-mono text-cyan-300 font-bold">
        🌍 3D Digital Twin • 12.9165°N
      </div>
    </div>
  );
};

// DIGITAL TWIN 2D/3D GIS VECTOR CANVAS
const DigitalTwinCanvas = ({ activeLayers, machinery, is3DMode }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    let step = 0;

    const render = () => {
      step += 0.02;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Base Grid Lines
      ctx.strokeStyle = '#ffffff08';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Draw Field Polygon 01 (Paddy Block A)
      ctx.beginPath();
      ctx.moveTo(60, 50);
      ctx.lineTo(260, 40);
      ctx.lineTo(240, 190);
      ctx.lineTo(50, 180);
      ctx.closePath();
      ctx.fillStyle = activeLayers.ndvi ? '#10b98140' : activeLayers.moisture ? '#06b6d440' : '#1e293b60';
      ctx.fill();
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('FIELD-01: Paddy Block A (12.5 Acres) • NDVI 0.82', 70, 70);

      // Draw Field Polygon 02 (Tomato Block B)
      ctx.beginPath();
      ctx.moveTo(280, 50);
      ctx.lineTo(520, 60);
      ctx.lineTo(500, 210);
      ctx.lineTo(260, 200);
      ctx.closePath();
      ctx.fillStyle = activeLayers.ndvi ? '#84cc1640' : activeLayers.moisture ? '#0284c740' : '#1e293b60';
      ctx.fill();
      ctx.strokeStyle = '#84cc16';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#84cc16';
      ctx.fillText('FIELD-02: Tomato Block B (8.0 Acres) • Moisture 52%', 290, 80);

      // Draw Irrigation Pipe Overlay Vector Lines
      if (activeLayers.irrigation) {
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(50, 120);
        ctx.lineTo(510, 130);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#06b6d4';
        ctx.fillText('💧 Main Drip Pipeline (Flow: 2,400 L/hr)', 120, 115);
      }

      // Draw AI Pest Risk Heatmap Overlay
      if (activeLayers.pest) {
        const radGrad = ctx.createRadialGradient(400, 130, 10, 400, 130, 80);
        radGrad.addColorStop(0, '#f43f5e80');
        radGrad.addColorStop(1, '#f43f5e00');
        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(400, 130, 80, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f43f5e';
        ctx.fillText('⚠️ Pest Hotspot Risk (Aphids)', 350, 140);
      }

      // Draw Moving Tractor Icon Marker
      if (activeLayers.machinery) {
        const tractorX = 140 + Math.sin(step) * 40;
        const tractorY = 120 + Math.cos(step) * 20;

        ctx.beginPath();
        ctx.arc(tractorX, tractorY, 7, 0, Math.PI * 2);
        ctx.fillStyle = '#f59e0b';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = '#f59e0b';
        ctx.fillText('🚜 Mahindra Tractor (6.4 km/h)', tractorX + 10, tractorY + 4);
      }

      // Draw Drone Mission Flight Waypoints & Animated Position
      const droneX = 180 + Math.cos(step * 1.5) * 80;
      const droneY = 90 + Math.sin(step * 1.5) * 30;

      ctx.strokeStyle = '#38bdf880';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(180, 90, 80, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(droneX, droneY, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#38bdf8';
      ctx.fill();
      ctx.fillStyle = '#38bdf8';
      ctx.fillText('🚁 DJI Agras T40 (25m Alt)', droneX + 10, droneY - 5);

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [activeLayers, machinery, is3DMode]);

  return (
    <div className="relative w-full h-80 rounded-2xl overflow-hidden border border-white/10 bg-slate-950 shadow-2xl">
      <canvas ref={canvasRef} width={700} height={320} className="w-full h-full block" />
      <div className="absolute top-3 left-3 px-3 py-1 rounded-xl bg-black/80 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold font-mono">
        📍 GPS: 12.9165° N, 79.1325° E • Vellore Main Precision Farm (42.5 Acres)
      </div>
    </div>
  );
};

export const FarmMapTab = () => {
  // Navigation View Mode ('map' | 'drone' | 'compare' | 'navigation' | 'fields')
  const [activeTab, setActiveTab] = useState('map');
  const [searchQuery, setSearchQuery] = useState('');

  // Layers State
  const [activeLayers, setActiveLayers] = useState({
    ndvi: true,
    moisture: false,
    pest: false,
    irrigation: true,
    machinery: true
  });

  const [is3DMode, setIs3DMode] = useState(false);
  const [satelliteDateIndex, setSatelliteDateIndex] = useState(3); // Oct 2026

  // Data State
  const [farms, setFarms] = useState([]);
  const [machinery, setMachinery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [plantDensity, setPlantDensity] = useState(null);

  // Side-by-Side Comparison State
  const [compareFieldA, setCompareFieldA] = useState('FIELD-01');
  const [compareFieldB, setCompareFieldB] = useState('FIELD-02');
  const [comparisonData, setComparisonData] = useState(null);

  // Floating AI Advisor State
  const [showFloatingAI, setShowFloatingAI] = useState(false);
  const [advisorPrompt, setAdvisorPrompt] = useState('');
  const [advisorMessages, setAdvisorMessages] = useState([
    { sender: 'ai', text: 'Greetings! I am your AI GIS & Digital Twin Advisor (powered by Ollama qwen:latest). Ask me to analyze satellite NDVI imagery, drone flight paths, soil moisture zoning, or land utilization!' }
  ]);

  useEffect(() => {
    loadAllData();
  }, [searchQuery]);

  useEffect(() => {
    if (activeTab === 'compare') {
      loadComparison();
    }
  }, [activeTab, compareFieldA, compareFieldB]);

  const loadAllData = async () => {
    setLoading(true);
    const f = await fetchFarmsAndFields(searchQuery);
    const m = await fetchMachineryAndDrones();
    const pd = await calculateAiPlantDensity(12.5);
    setFarms(f);
    setMachinery(m);
    setPlantDensity(pd);
    setLoading(false);
  };

  const loadComparison = async () => {
    const res = await compareFields(compareFieldA, compareFieldB);
    setComparisonData(res);
  };

  const toggleLayer = (key) => {
    setActiveLayers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSendAdvisorChat = async () => {
    if (!advisorPrompt.trim()) return;
    const userMsg = { sender: 'user', text: advisorPrompt };
    setAdvisorMessages(prev => [...prev, userMsg]);
    const promptCopy = advisorPrompt;
    setAdvisorPrompt('');

    const contextText = `Farm: Vellore Main Precision Farm (42.5 Acres), Selected Fields: FIELD-01 Paddy (12.5 Acres, NDVI 0.82), FIELD-02 Tomato (8.0 Acres, Moisture 52%)`;
    const aiResp = await queryGisAdvisor(promptCopy, contextText);
    setAdvisorMessages(prev => [...prev, { sender: 'ai', text: aiResp }]);
  };

  const handleExportPDF = () => {
    exportPDFReport(
      `AI Digital Twin & GIS Intelligence Report - Vellore Main Farm`,
      `Farm Name: Vellore Main Precision Farm\nTotal Acreage: 42.5 Acres\nCenter GPS: 12.9165° N, 79.1325° E\nSurvey Number: SY-408/2A\nActive Fields: 6 Fields\nAverage NDVI: 0.78\nCrop Health Score: 96.8%\n\nFIELD SUMMARY:\n- FIELD-01: Paddy Block A (12.5 Acres) - NDVI 0.82 - Soil Moisture 48.5%\n- FIELD-02: Tomato Block B (8.0 Acres) - NDVI 0.76 - Soil Moisture 52.0%\n- FIELD-03: Maize Zone C (10.0 Acres) - NDVI 0.74 - Soil Moisture 42.0%`,
      [{ title: "Avg NDVI", value: "0.78" }, { title: "Crop Health", value: "96.8%" }]
    );
  };

  const datesList = ["Jan 2026", "Mar 2026", "Jun 2026", "Oct 2026 (Live)"];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 font-mono text-xs relative">
      <AIBadgePanel 
        tabId="farm-map" 
        tabName="Enterprise AI Digital Twin & Interactive GIS Intelligence Workspace" 
        defaultPrompt="Analyze 2D/3D field boundaries, satellite NDVI time series, drone flight mission waypoints, and IoT sensors." 
      />

      {/* 1. HERO BANNER */}
      <div className="glass-panel rounded-2xl p-6 border border-emerald-500/40 bg-gradient-to-r from-emerald-950/40 via-slate-950 to-black space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                ACTIVE DIGITAL TWIN • 42.5 ACRES
              </span>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                GPS: 12.9165° N, 79.1325° E
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-100">Vellore Main Precision Farm Workspace</h2>
            <p className="text-xs text-slate-300">
              📍 Location: <strong className="text-amber-300">Katpadi, Vellore, Tamil Nadu (PIN: 632014)</strong> • 
              Survey No: <strong className="text-cyan-300">SY-408/2A</strong> • 
              Active Sensors: <strong className="text-emerald-300">14 Nodes Live</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* MINI INTERACTIVE 3D EARTH GLOBE */}
            <Mini3DEarthGlobe />

            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">Health Score</span>
              <strong className="text-2xl font-black text-emerald-400">96.8%</strong>
            </div>
            <button 
              onClick={handleExportPDF}
              className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-extrabold flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 hover:opacity-90"
            >
              <Download className="w-4 h-4" /> GIS Report (PDF)
            </button>
          </div>
        </div>

        {/* HERO KPI CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-black/40 p-3 rounded-xl border border-white/10 flex items-center gap-2.5">
            <Globe className="w-4 h-4 text-emerald-400" />
            <div>
              <span className="text-[10px] text-slate-400 block">Total Acreage</span>
              <strong className="text-sm font-bold text-slate-100">42.5 Acres</strong>
            </div>
          </div>
          <div className="bg-black/40 p-3 rounded-xl border border-white/10 flex items-center gap-2.5">
            <Grid className="w-4 h-4 text-cyan-400" />
            <div>
              <span className="text-[10px] text-slate-400 block">Active Fields</span>
              <strong className="text-sm font-bold text-cyan-300">6 Polygons</strong>
            </div>
          </div>
          <div className="bg-black/40 p-3 rounded-xl border border-white/10 flex items-center gap-2.5">
            <Plane className="w-4 h-4 text-amber-400" />
            <div>
              <span className="text-[10px] text-slate-400 block">Drone Mission</span>
              <strong className="text-sm font-bold text-amber-300">Active (25m Alt)</strong>
            </div>
          </div>
          <div className="bg-black/40 p-3 rounded-xl border border-white/10 flex items-center gap-2.5">
            <Cpu className="w-4 h-4 text-indigo-400" />
            <div>
              <span className="text-[10px] text-slate-400 block">Machinery Active</span>
              <strong className="text-sm font-bold text-indigo-300">2 Equipment</strong>
            </div>
          </div>
          <div className="bg-black/40 p-3 rounded-xl border border-white/10 flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <div>
              <span className="text-[10px] text-slate-400 block">Avg NDVI Health</span>
              <strong className="text-sm font-bold text-emerald-400">0.78 (High)</strong>
            </div>
          </div>
          <div className="bg-black/40 p-3 rounded-xl border border-white/10 flex items-center gap-2.5">
            <Droplets className="w-4 h-4 text-cyan-400" />
            <div>
              <span className="text-[10px] text-slate-400 block">Soil Moisture</span>
              <strong className="text-sm font-bold text-cyan-300">48.5% Vol.</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SEARCH & WORKSPACE NAVIGATION TOOLBAR */}
      <div className="glass-panel rounded-2xl p-4 border border-white/10 flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="relative w-full sm:w-64">
            <input 
              type="text" 
              placeholder="Search Farm, Village, Survey No..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-3 bg-white/5 border border-white/10 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50 placeholder:text-slate-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>

          {/* LAYER TOGGLE BUTTONS */}
          <div className="flex items-center gap-1.5 bg-black/60 p-1 rounded-xl border border-white/10 text-[10px]">
            <button onClick={() => toggleLayer('ndvi')} className={`px-2.5 py-1 rounded-lg transition font-bold ${activeLayers.ndvi ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-slate-400'}`}>
              NDVI
            </button>
            <button onClick={() => toggleLayer('moisture')} className={`px-2.5 py-1 rounded-lg transition font-bold ${activeLayers.moisture ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400'}`}>
              Moisture
            </button>
            <button onClick={() => toggleLayer('irrigation')} className={`px-2.5 py-1 rounded-lg transition font-bold ${activeLayers.irrigation ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' : 'text-slate-400'}`}>
              Irrigation Lines
            </button>
            <button onClick={() => toggleLayer('pest')} className={`px-2.5 py-1 rounded-lg transition font-bold ${activeLayers.pest ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'text-slate-400'}`}>
              Pest Risk
            </button>
            <button onClick={() => toggleLayer('machinery')} className={`px-2.5 py-1 rounded-lg transition font-bold ${activeLayers.machinery ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-400'}`}>
              Machinery
            </button>
          </div>
        </div>

        {/* View Switcher Buttons */}
        <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
            <button onClick={() => setActiveTab('map')} title="2D & 3D Digital Twin GIS Map" className={`p-1.5 rounded-lg transition ${activeTab === 'map' ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'}`}>
              <Layers className="w-4 h-4 inline mr-1" /> Digital Twin
            </button>
            <button onClick={() => setActiveTab('drone')} title="Drone Mission Planner & Plant Counter" className={`p-1.5 rounded-lg transition ${activeTab === 'drone' ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'}`}>
              <Plane className="w-4 h-4 inline mr-1" /> Drone Flight
            </button>
            <button onClick={() => setActiveTab('compare')} title="Side-by-Side Field Comparison" className={`p-1.5 rounded-lg transition ${activeTab === 'compare' ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'}`}>
              <Sliders className="w-4 h-4 inline mr-1" /> Compare Fields
            </button>
            <button onClick={() => setActiveTab('navigation')} title="Turn-by-Turn Field Navigation" className={`p-1.5 rounded-lg transition ${activeTab === 'navigation' ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'}`}>
              <Navigation className="w-4 h-4 inline mr-1" /> Navigation
            </button>
          </div>
        </div>
      </div>

      {/* 3. WORKSPACE VIEWS */}
      {loading ? (
        <div className="glass-panel rounded-2xl p-12 text-center text-slate-400 flex items-center justify-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin text-emerald-400" /> Loading AI Digital Twin & GIS Intelligence Center...
        </div>
      ) : activeTab === 'map' ? (
        /* DIGITAL TWIN 2D/3D VECTOR MAP VIEW */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-4">
            {/* DIGITAL TWIN CANVAS */}
            <DigitalTwinCanvas activeLayers={activeLayers} machinery={machinery} is3DMode={is3DMode} />

            {/* SATELLITE TIME SLIDER */}
            <div className="glass-panel rounded-xl p-3 border border-white/10 bg-black/40 flex items-center justify-between gap-4 font-mono text-xs">
              <span className="text-slate-400 font-bold flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-cyan-400" /> Satellite Time Slider:
              </span>
              <div className="flex items-center gap-2 flex-1">
                {datesList.map((d, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setSatelliteDateIndex(idx)}
                    className={`flex-1 py-1.5 rounded-lg transition font-bold text-[10px] ${
                      satelliteDateIndex === idx ? 'bg-emerald-500 text-slate-950' : 'bg-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* FIELD SUMMARY & SENSOR NODES PANEL */}
          <div className="lg:col-span-4 glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
            <h3 className="text-base font-extrabold text-slate-100 flex items-center gap-2">
              <Grid className="w-5 h-5 text-emerald-400" /> Field Boundaries & Sensor Nodes
            </h3>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/40 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-300 text-xs">FIELD-01: Paddy Block A</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">12.5 Acres</span>
                </div>
                <p className="text-slate-300 text-xs">Crop: Rice Paddy (ADT-54) • NDVI: 0.82</p>
                <p className="text-slate-400 text-[10px]">Sensors: Soil Moisture (48.5%), Temp (28°C), pH (6.8)</p>
              </div>

              <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/40 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-cyan-300 text-xs">FIELD-02: Tomato Block B</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">8.0 Acres</span>
                </div>
                <p className="text-slate-300 text-xs">Crop: Tomato (Arka Rakshak) • NDVI: 0.76</p>
                <p className="text-slate-400 text-[10px]">Sensors: Subsurface Drip Pressure (2.1 Bar)</p>
              </div>

              <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/40 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-300 text-xs">FIELD-03: Maize Zone C</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30">10.0 Acres</span>
                </div>
                <p className="text-slate-300 text-xs">Crop: Maize (NK6240) • NDVI: 0.74</p>
                <p className="text-slate-400 text-[10px]">Machinery: Mahindra Tractor Active Ploughing</p>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'drone' ? (
        /* DRONE MISSION PLANNER & AI PLANT DENSITY ESTIMATOR */
        <div className="glass-panel rounded-2xl p-6 border border-cyan-500/40 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="text-base font-extrabold text-slate-100 flex items-center gap-2">
              <Plane className="w-5 h-5 text-cyan-400" /> Drone Flight Mission Planner & AI Plant Counter
            </h3>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              DJI Agras T40 • Battery 88%
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
            <div className="p-4 rounded-xl bg-black/40 border border-white/10">
              <span className="text-[10px] text-slate-400 block">Canopy Coverage</span>
              <strong className="text-xl font-extrabold text-emerald-400">{plantDensity?.canopy_coverage_pct}%</strong>
            </div>
            <div className="p-4 rounded-xl bg-black/40 border border-white/10">
              <span className="text-[10px] text-slate-400 block">Est. Plants / Acre</span>
              <strong className="text-xl font-extrabold text-cyan-300">{plantDensity?.estimated_plants_per_acre}</strong>
            </div>
            <div className="p-4 rounded-xl bg-black/40 border border-white/10">
              <span className="text-[10px] text-slate-400 block">Total Field Plants</span>
              <strong className="text-xl font-extrabold text-amber-300">{plantDensity?.total_estimated_plants}</strong>
            </div>
            <div className="p-4 rounded-xl bg-black/40 border border-white/10">
              <span className="text-[10px] text-slate-400 block">Missing Plant Gaps</span>
              <strong className="text-xl font-extrabold text-rose-400">{plantDensity?.missing_plant_gaps_count} Gaps</strong>
            </div>
          </div>
        </div>
      ) : activeTab === 'compare' ? (
        /* SIDE-BY-SIDE FIELD COMPARISON */
        <div className="glass-panel rounded-2xl p-6 border border-emerald-500/40 space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-white/10 pb-4">
            <h3 className="text-base font-extrabold text-slate-100 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-emerald-400" /> Side-by-Side Field GIS Comparison (Field A vs B)
            </h3>
            <div className="flex items-center gap-3">
              <select value={compareFieldA} onChange={(e) => setCompareFieldA(e.target.value)} className="bg-black/80 border border-emerald-500/50 text-emerald-300 text-xs rounded-xl px-2 py-1">
                <option value="FIELD-01">FIELD-01 (Paddy Block A)</option>
                <option value="FIELD-02">FIELD-02 (Tomato Block B)</option>
              </select>
              <span className="text-slate-400 font-bold">VS</span>
              <select value={compareFieldB} onChange={(e) => setCompareFieldB(e.target.value)} className="bg-black/80 border border-cyan-500/50 text-cyan-300 text-xs rounded-xl px-2 py-1">
                <option value="FIELD-02">FIELD-02 (Tomato Block B)</option>
                <option value="FIELD-01">FIELD-01 (Paddy Block A)</option>
              </select>
            </div>
          </div>

          {comparisonData && comparisonData.field_a && comparisonData.field_b && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/40 space-y-2">
                <h4 className="font-extrabold text-emerald-300 text-sm">{comparisonData.field_a.field_name}</h4>
                <p className="text-slate-300">Area: <strong>{comparisonData.field_a.area_acres} Acres</strong></p>
                <p className="text-slate-300">Crop: <strong>{comparisonData.field_a.crop}</strong></p>
                <p className="text-slate-300">NDVI: <strong className="text-emerald-400">{comparisonData.field_a.ndvi}</strong></p>
                <p className="text-slate-300">Moisture: <strong>{comparisonData.field_a.soil_moisture_pct}%</strong></p>
              </div>

              <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/40 space-y-2">
                <h4 className="font-extrabold text-cyan-300 text-sm">{comparisonData.field_b.field_name}</h4>
                <p className="text-slate-300">Area: <strong>{comparisonData.field_b.area_acres} Acres</strong></p>
                <p className="text-slate-300">Crop: <strong>{comparisonData.field_b.crop}</strong></p>
                <p className="text-slate-300">NDVI: <strong className="text-cyan-400">{comparisonData.field_b.ndvi}</strong></p>
                <p className="text-slate-300">Moisture: <strong>{comparisonData.field_b.soil_moisture_pct}%</strong></p>
              </div>
            </div>
          )}
        </div>
      ) : activeTab === 'navigation' ? (
        /* TURN-BY-TURN FARM NAVIGATION MODE */
        <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Navigation className="w-4 h-4 text-emerald-400" /> Turn-by-Turn Field Navigation Mode
          </h3>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/40 flex items-center justify-between">
              <div>
                <span className="text-emerald-400 font-bold">Route 1: Main Gate ➔ Paddy Field A (Pump Station 2)</span>
                <p className="text-slate-300 mt-1">Head North 120m along Main Access Road, then turn Right at Canal Bridge.</p>
              </div>
              <span className="px-2.5 py-1 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">180 Meters</span>
            </div>

            <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/40 flex items-center justify-between">
              <div>
                <span className="text-cyan-300 font-bold">Route 2: Paddy Field A ➔ Tomato Block B (Sensor Hub)</span>
                <p className="text-slate-300 mt-1">Walk East 65m across Drip Pipeline Ridge 3.</p>
              </div>
              <span className="px-2.5 py-1 rounded text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">65 Meters</span>
            </div>
          </div>
        </div>
      ) : null}

      {/* FLOATING AI GIS ADVISOR TOGGLE BUTTON */}
      <button 
        onClick={() => setShowFloatingAI(!showFloatingAI)}
        className="fixed bottom-6 right-6 z-50 p-3.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold shadow-2xl hover:scale-105 transition flex items-center gap-2 border border-white/20"
      >
        <Sparkles className="w-5 h-5" />
        <span className="hidden sm:inline">AI GIS Advisor</span>
      </button>

      {/* FLOATING AI CHAT WINDOW */}
      {showFloatingAI && (
        <div className="fixed bottom-20 right-6 z-50 w-96 glass-panel rounded-2xl p-4 border border-emerald-500/50 bg-slate-950/95 shadow-2xl space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="font-bold text-emerald-300 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-400" /> AI GIS Advisor (Ollama Qwen)
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
              placeholder="Ask GIS advisor..." 
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
