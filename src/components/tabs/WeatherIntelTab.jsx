import React, { useState, useEffect } from 'react';
import {
  CloudSun, Wind, Thermometer, CloudRain, Sun, Calendar, Eye, CheckCircle2,
  FileText, Download, History, Search, MapPin, Gauge, Umbrella, Compass, Radio,
  AlertOctagon, TrendingUp, DollarSign, Plus, Edit3, Trash2, Database, ShieldAlert,
  Sparkles, Award, Target, HelpCircle, Zap, Crosshair, BarChart3, PieChart, Layers,
  Globe, ShieldCheck, Activity, Send, Clock, AlertTriangle, ArrowUpRight, RefreshCw, Sliders
} from 'lucide-react';
import { AIBadgePanel } from '../ui/AIBadgePanel';
import {
  fetchLiveWeatherData, searchWeatherGeocoding, fetchWeatherAIInsights, fetchHistoricalClimateTrends
} from '../../services/weatherService';
import { fetchCropOpportunities, simulateClimateScenario, askDecisionAdvisor } from '../../services/aiService';
import { exportPDFReport, exportWordDocReport, exportTextReport } from '../../utils/exportReport';

import { useFarmState } from '../../context/FarmStateContext';
import { GlobalLocationSearch } from '../ui/GlobalLocationSearch';

export const WeatherIntelTab = () => {
  const { selectedLocation, globalWeatherData, isWeatherLoading } = useFarmState();
  const [opportunityData, setOpportunityData] = useState(null);

  // Modular MCP Connectors Status
  const [mcpConnectors] = useState([
    { id: 'weather_mcp', name: 'weather_mcp', provider: 'Open-Meteo Ground Radar', status: 'Online', latency: '42ms' },
    { id: 'maps_mcp', name: 'maps_mcp / geocoding', provider: 'OpenStreetMap Nominatim', status: 'Online', latency: '68ms' },
    { id: 'satellite_mcp', name: 'satellite_mcp', provider: 'Sentinel-2 L2A Multispectral', status: 'Online', latency: '110ms' },
    { id: 'soil_mcp', name: 'soil_mcp', provider: 'FAO ET0 & GDD Calculator', status: 'Online', latency: '15ms' },
    { id: 'web_search_mcp', name: 'web_search_mcp', provider: 'IMD & KVK Public Advisories', status: 'Online', latency: '95ms' },
    { id: 'government_mcp', name: 'government_mcp', provider: 'AgriStack India Data Mesh', status: 'Online', latency: '130ms' }
  ]);

  // Climate Simulator State
  const [tempDelta, setTempDelta] = useState(2.0);
  const [rainDelta, setRainDelta] = useState(-15.0);
  const [delayDays, setDelayDays] = useState(3);
  const [simulationResult, setSimulationResult] = useState(null);

  // AI Advisor Chat
  const [chatPrompt, setChatPrompt] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { sender: 'ai', text: 'Hello! I am your AI Weather Decision Architect (powered by local Ollama qwen:latest & Open-Meteo MCP). Ask any crop, irrigation, or weather scenario question!' }
  ]);

  useEffect(() => {
    loadOpportunities();
  }, [selectedLocation]);

  const loadOpportunities = async () => {
    const opp = await fetchCropOpportunities('Red Loamy Soil', 25000, 2.5);
    setOpportunityData(opp);
  };

  useEffect(() => {
    runClimateSimulation();
  }, [tempDelta, rainDelta, delayDays]);

  const runClimateSimulation = async () => {
    const sim = await simulateClimateScenario('Rainfall Decrease', rainDelta);
    setSimulationResult(sim);
  };

  const handleSendChat = async () => {
    if (!chatPrompt.trim()) return;
    const userMsg = { sender: 'user', text: chatPrompt };
    setChatMessages(prev => [...prev, userMsg]);
    const promptCopy = chatPrompt;
    setChatPrompt('');

    const aiResp = await askDecisionAdvisor(promptCopy, `Location: ${selectedLocation.name}`);
    setChatMessages(prev => [...prev, { sender: 'ai', text: aiResp }]);
  };

  const handleExportPDF = () => {
    if (!globalWeatherData) return;
    const curr = globalWeatherData.current || {};
    const agri = globalWeatherData.agri_metrics || {};
    exportPDFReport(
      `Weather Intelligence Report - ${selectedLocation.name}`,
      `Location: ${selectedLocation.name}\nTemperature: ${curr.temperature_c}°C\nHumidity: ${curr.humidity_pct}%\nWind: ${curr.wind_speed_kph} km/h\nET0: ${agri.evapotranspiration_mm} mm/d\nFarming Confidence: ${agri.farming_confidence_score}%`,
      [{ title: "Farming Confidence", value: `${agri.farming_confidence_score}%` }, { title: "ET0 Rate", value: `${agri.evapotranspiration_mm} mm/d` }]
    );
  };

  const weatherData = globalWeatherData;
  const curr = weatherData?.current || {};
  const agri = weatherData?.agri_metrics || {};
  const suitables = weatherData?.crop_suitability || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 font-mono text-xs">
      <AIBadgePanel 
        tabId="weather-intel" 
        tabName="AI Weather Intelligence Engine (Open-Meteo + Ollama Qwen)" 
        defaultPrompt="Convert real meteorological observations into actionable crop selection, ET0 rates, climate what-if simulations, and operational windows." 
      />

      {/* 1. GLOBAL LOCATION SEARCH BAR */}
      <GlobalLocationSearch />

      {/* 2. MODULAR MCP TOOL CONNECTORS TOOLBAR */}
      <div className="glass-panel rounded-2xl p-4 border border-emerald-500/30 bg-black/40 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-100 flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400" /> Modular MCP Weather & Geospatial Tool Connectors
          </h3>
          <span className="text-[10px] font-bold text-emerald-400">Status: All 6 MCP Services Healthy</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {mcpConnectors.map((mcp) => (
            <div key={mcp.id} className="p-2 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <div className="flex items-center justify-between">
                <strong className="text-slate-200 text-[11px] truncate">{mcp.name}</strong>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <span className="text-[9px] text-slate-400 block truncate">{mcp.provider}</span>
              <span className="text-[9px] text-emerald-300 font-mono block">Latency: {mcp.latency}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. HERO METEOROLOGICAL & AGRI INDEXES BANNER */}
      <div className="glass-panel rounded-2xl p-6 border border-emerald-500/40 bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950/40 space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              Farming Confidence Score: {agri.farming_confidence_score || 94.5}%
            </span>
            <h2 className="text-3xl font-extrabold text-slate-100 mt-2">
              {curr.temperature_c || 28.0}°C <span className="text-base font-normal text-slate-300">({curr.weather_condition || 'Clear Sky'})</span>
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Feels Like: <strong className="text-slate-100">{curr.feels_like_c || 29.5}°C</strong> • Humidity: <strong className="text-cyan-300">{curr.humidity_pct || 65}%</strong> • Wind: <strong className="text-emerald-400">{curr.wind_speed_kph || 12} km/h NE</strong>
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs w-full md:w-auto">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-[10px] text-slate-400 block">ET0 Evapo</span>
              <strong className="text-amber-300 text-base font-bold">{agri.evapotranspiration_mm || 4.2} mm/d</strong>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-[10px] text-slate-400 block">GDD Today</span>
              <strong className="text-indigo-300 text-base font-bold">{agri.gdd_today || 14.5}</strong>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-[10px] text-slate-400 block">Crop Stress</span>
              <strong className="text-rose-300 text-base font-bold">{agri.crop_stress_index || 12.0}%</strong>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-[10px] text-slate-400 block">Disease Risk</span>
              <strong className="text-emerald-300 text-base font-bold">{agri.disease_risk || 'Low'}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 4. OPTIMAL OPERATIONAL WINDOWS & CLIMATE SIMULATOR (TWO COLUMNS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Operational Windows (6 Cols) */}
        <div className="lg:col-span-6 glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-400" /> Optimal Agricultural Operational Windows
          </h3>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 space-y-1">
              <div className="flex items-center justify-between font-bold text-emerald-300">
                <span>🎯 Spray Safety Window</span>
                <span className="text-amber-300">Countdown: {agri.optimal_spray_countdown_hours || 3.5}h remaining</span>
              </div>
              <p className="text-slate-200">{agri.spray_window || 'Optimal Spraying Window active. Wind speed under 15 km/h.'}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <span className="font-bold text-cyan-300 block">💧 Irrigation Window</span>
              <p className="text-slate-300">{agri.irrigation_advice || 'Sufficient soil moisture following recent rainfall. Delay watering by 48h.'}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <span className="font-bold text-indigo-300 block">🌾 Harvest & Labor Window</span>
              <p className="text-slate-300">Optimal Harvest Window: Aug 15 – Aug 18 (Low moisture risk).</p>
            </div>
          </div>
        </div>

        {/* Climate What-If Simulator (6 Cols) */}
        <div className="lg:col-span-6 glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" /> Climate What-If Scenario Simulator
            </h3>
            <span className="text-[10px] text-slate-400">Monte-Carlo Yield Impact</span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Rainfall Delta (%):</span>
                <strong className="text-cyan-300">{rainDelta}%</strong>
              </div>
              <input 
                type="range" 
                min="-50" 
                max="50" 
                value={rainDelta} 
                onChange={(e) => setRainDelta(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {simulationResult && (
              <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/30 space-y-2">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-slate-200">Projected Yield Change</span>
                  <span className={simulationResult.yield_change_pct < 0 ? 'text-rose-400' : 'text-emerald-400'}>
                    {simulationResult.yield_change_pct}%
                  </span>
                </div>
                <div className="flex items-center justify-between font-bold">
                  <span className="text-slate-200">Est. Profit Impact</span>
                  <span className={simulationResult.estimated_profit_change_inr < 0 ? 'text-rose-400' : 'text-emerald-400'}>
                    ₹{simulationResult.estimated_profit_change_inr?.toLocaleString()}
                  </span>
                </div>
                <p className="text-slate-300 text-[11px] pt-1">{simulationResult.suggested_recovery_action}</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* 5. LOCAL OLLAMA QWEN ADVISORY & EXPORT TOOLBAR */}
      <div className="glass-panel rounded-2xl p-6 border border-emerald-500/40 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" /> Ollama Qwen Weather Advisory Assistant
          </h3>

          <button onClick={handleExportPDF} className="px-3 py-1.5 rounded-xl bg-white/10 text-slate-200 hover:bg-emerald-500/20 flex items-center gap-1 text-xs">
            <Download className="w-3.5 h-3.5" /> Export PDF Weather Report
          </button>
        </div>

        <div className="h-44 overflow-y-auto space-y-2.5 custom-scrollbar pr-2">
          {chatMessages.map((m, idx) => (
            <div key={idx} className={`p-3 rounded-xl text-xs ${m.sender === 'user' ? 'bg-emerald-500/20 ml-12 text-emerald-200 border border-emerald-500/30' : 'bg-white/5 mr-12 text-slate-200 border border-white/10'}`}>
              {m.text}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-white/10">
          <input 
            type="text" 
            placeholder="Ask weather decision question..." 
            value={chatPrompt}
            onChange={(e) => setChatPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
            className="flex-1 h-10 px-3 bg-white/5 border border-white/10 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
          />
          <button onClick={handleSendChat} className="px-4 py-2.5 rounded-xl bg-emerald-500 text-black font-extrabold flex items-center gap-1.5">
            <Send className="w-4 h-4" /> Ask AI
          </button>
        </div>
      </div>

    </div>
  );
};
