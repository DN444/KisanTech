import React, { useState, useEffect } from 'react';
import {
  fetchSoilSamples,
  createSoilSample,
  getSoilSample,
  updateSoilSample,
  deleteSoilSample,
  duplicateSoilSample,
  getSoilScore,
  getSoilPrediction,
  runSoilDoctor,
  exportSoilReport,
} from '../../services/soilService';
import { AIBadgePanel } from '../ui/AIBadgePanel';
import { Search, ChevronDown, Send, Trash2, Edit3, Plus, RefreshCw, BarChart3, Gauge } from 'lucide-react';

/**
 * SoilIntelligenceTab – a premium AI Soil Intelligence Center.
 * It demonstrates hero information, health score, metric cards, AI Doctor chat,
 * risk overview and basic CRUD actions.
 * Styling follows the existing glass-panel and glassmorphism classes.
 */
export const SoilIntelligenceTab = () => {
  // State for sample list and selected sample
  const [samples, setSamples] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [sampleDetails, setSampleDetails] = useState(null);
  const [score, setScore] = useState(null);
  const [chatPrompt, setChatPrompt] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'ai', text: 'Hello! I am your Soil Doctor AI (powered by Ollama qwen:latest). Ask any soil‑health question.' },
  ]);

  // Load samples list on mount
  useEffect(() => {
    fetchSoilSamples()
      .then((data) => {
        setSamples(data);
        if (data.length > 0) setSelectedId(data[0].id);
      })
      .catch(console.error);
  }, []);

  // Load selected sample details and score whenever selectedId changes
  useEffect(() => {
    if (!selectedId) return;
    getSoilSample(selectedId)
      .then((s) => setSampleDetails(s))
      .catch(console.error);
    getSoilScore(selectedId)
      .then((s) => setScore(s.overall_score))
      .catch(console.error);
  }, [selectedId]);

  const handleSendChat = async () => {
    if (!chatPrompt.trim()) return;
    const userMsg = { id: Date.now(), sender: 'user', text: chatPrompt };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatPrompt('');
    try {
      const res = await runSoilDoctor({ sample_id: selectedId });
      const aiText = res.response || JSON.stringify(res);
      setChatMessages((prev) => [...prev, { id: Date.now() + 1, sender: 'ai', text: aiText }]);
    } catch (e) {
      setChatMessages((prev) => [...prev, { id: Date.now() + 1, sender: 'ai', text: 'Error: ' + e.message }]);
    }
  };

  const handleExport = (format) => {
    exportSoilReport(format, { sample: sampleDetails, score });
  };

  // Render metric cards if sample details are available
  const renderMetrics = () => {
    if (!sampleDetails) return null;
    const metrics = [
      { label: 'pH', value: sampleDetails.ph, ideal: '6.5', unit: '' },
      { label: 'N', value: sampleDetails.nitrogen, unit: 'kg/ha' },
      { label: 'P', value: sampleDetails.phosphorus, unit: 'kg/ha' },
      { label: 'K', value: sampleDetails.potassium, unit: 'kg/ha' },
      { label: 'Moisture', value: sampleDetails.moisture, unit: '%' },
      { label: 'Salinity', value: sampleDetails.salinity, unit: 'dS/m' },
    ];
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {metrics.map((m) => (
          <div key={m.label} className="p-3 rounded-xl bg-white/5 border border-white/10">
            <span className="text-xs text-slate-400 block">{m.label}</span>
            <strong className="text-emerald-400 text-base">
              {m.value !== null && m.value !== undefined ? `${m.value}${m.unit || ''}` : '—'}
            </strong>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in font-mono text-xs">
      {/* Hero Section */}
      <AIBadgePanel tabId="soil-intel" tabName="AI Soil Intelligence Center" defaultPrompt="Analyze soil sample and recommend amendments." />

      <div className="glass-panel rounded-2xl p-6 border border-emerald-500/40 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-cyan-950/30">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-slate-100">{sampleDetails?.farm_name || 'Select a Soil Sample'}</h2>
            <p className="text-slate-300 text-xs">
              Field: {sampleDetails?.field_name || '--'} • Crop: {sampleDetails?.crop || '--'} • Season: {sampleDetails?.season || '--'}
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-emerald-400">{score !== null ? `${score}%` : '--'}</div>
            <span className="text-slate-300 text-xs">Overall Soil Health Score</span>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="glass-panel rounded-2xl p-4 border border-white/10 bg-black/30">
        {renderMetrics()}
      </div>

      {/* AI Soil Doctor Chat */}
      <div className="glass-panel rounded-2xl p-5 border border-white/10 bg-black/20">
        <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs">
          <span className="text-emerald-400 font-bold flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4" /> Soil Doctor AI
          </span>
          <span className="text-slate-500 text-[10px]">AI‑Powered Recommendations</span>
        </div>
        <div className="h-44 overflow-y-auto space-y-2 text-xs">
          {chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={`p-2.5 rounded-xl border ${
                msg.sender === 'user' ? 'bg-emerald-600/20 border-emerald-500/30 text-emerald-200 text-right ml-8' : 'bg-white/5 border-white/10 text-slate-200 mr-8'
              }`}
            >
              {msg.text}
            </div>
          ))}
        </div>
        <div className="relative mt-2">
          <input
            type="text"
            placeholder="Ask a soil health question..."
            value={chatPrompt}
            onChange={(e) => setChatPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
            className="w-full h-10 pl-3 pr-12 bg-white/5 border border-white/10 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
          />
          <button onClick={handleSendChat} className="absolute right-2 top-1.5 p-1.5 rounded-lg bg-emerald-500 text-black font-bold">
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Export Buttons */}
      <div className="flex gap-2 justify-end">
        <button onClick={() => handleExport('pdf')} className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30">
          Export PDF
        </button>
        <button onClick={() => handleExport('docx')} className="px-3 py-1 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/40 hover:bg-blue-500/30">
          Export DOCX
        </button>
        <button onClick={() => handleExport('txt')} className="px-3 py-1 rounded-xl bg-slate-500/20 text-slate-300 border border-slate-500/40 hover:bg-slate-500/30">
          Export TXT
        </button>
      </div>
    </div>
  );
};
