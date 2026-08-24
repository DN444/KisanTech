import React, { useState, useEffect } from 'react';
import {
  FileText, Download, Sparkles, RefreshCw, Calendar, Filter, Search,
  CheckCircle2, AlertTriangle, ShieldCheck, Cpu, Activity, Clock, Zap,
  TrendingUp, BarChart3, PieChart, Layers, Trash2, ArrowUpRight, Share2
} from 'lucide-react';
import {
  fetchAllReports, fetchReportSchedules, generateAIReport, deleteAIReport,
  FALLBACK_AI_REPORTS, FALLBACK_REPORT_SCHEDULES
} from '../../services/aiReportsService';

export default function AIReportsTab() {
  const [reports, setReports] = useState(FALLBACK_AI_REPORTS);
  const [schedules, setSchedules] = useState(FALLBACK_REPORT_SCHEDULES);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [customCategory, setCustomCategory] = useState('Crop & Soil Intelligence');
  const [customTitle, setCustomTitle] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [rep, sch] = await Promise.all([
        fetchAllReports(),
        fetchReportSchedules()
      ]);
      setReports(rep);
      setSchedules(sch);
    } catch (err) {
      console.error("Error loading AI Reports data:", err);
    }
  };

  const handleGenerateReport = async (e) => {
    e.preventDefault();
    setGenerating(true);

    try {
      const res = await generateAIReport(customCategory, customTitle || null);
      if (res.status === 'success') {
        const updatedReports = await fetchAllReports();
        setReports(updatedReports);
        setCustomTitle('');
      }
    } catch (err) {
      console.error("Error generating AI report:", err);
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteReport = async (reportId) => {
    setReports(prev => prev.filter(r => r.report_id !== reportId));
    await deleteAIReport(reportId);
  };

  const categories = ['All', 'Crop & Soil Intelligence', 'Market & Economics', 'Hydrology & Irrigation', 'Governance & Governance'];

  const filteredReports = selectedCategory === 'All'
    ? reports
    : reports.filter(r => r.category === selectedCategory);

  const handleExportSingleReport = (rep, fmt) => {
    try {
      const content = `
        ====================================================
        KISANTECH AI • EXECUTIVE FARM AUDIT REPORT
        ====================================================
        Report ID: ${rep.report_id}
        Title: ${rep.title}
        Category: ${rep.category}
        Health Score: ${rep.health_score} / 100
        Risk Level: ${rep.risk_level}
        Date: ${rep.created_at}

        EXECUTIVE SUMMARY:
        ${rep.executive_summary}

        TECHNICAL BREAKDOWN:
        ${rep.technical_breakdown}

        RECOMMENDATIONS:
        ${rep.recommendations.map(rc => `• ${rc}`).join('\n')}

        LOCAL RAG CITATIONS:
        ${rep.rag_citations.map(c => `• [${c.ref}] ${c.title} (Confidence: ${c.confidence}%)`).join('\n')}
        ====================================================
      `;
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${rep.report_id}_Report.${fmt.toLowerCase()}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      alert(`Export error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 text-slate-100 font-sans pb-16">

      {/* 1. HERO SYSTEM TELEMETRY BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-zinc-950 to-slate-900 border border-emerald-500/40 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 flex-1 min-w-0 w-full">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold tracking-wide uppercase max-w-full">
              <FileText className="w-3.5 h-3.5 animate-pulse shrink-0 text-emerald-400" />
              <span className="truncate">Enterprise Agricultural Business Intelligence & AI Report Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex flex-wrap items-center gap-3">
              <span>KisanTech AI Reports</span>
              <span className="text-xs px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/40 shrink-0">Local RAG Grounded</span>
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Consolidates multi-module telemetry into executive farming reports, NPK audits, mandi arbitrage analytics, and government compliance documents.
            </p>
          </div>

          {/* Business Intelligence Telemetry */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto shrink-0 font-mono text-xs">
            <div className="bg-slate-950/80 border border-emerald-500/40 rounded-2xl p-3 text-center">
              <div className="text-[9px] text-slate-400 uppercase font-bold">Total Reports</div>
              <div className="text-sm font-black text-emerald-400">2,840 Audits</div>
              <div className="text-[8px] text-emerald-300/80">99.4% Confidence</div>
            </div>

            <div className="bg-slate-950/80 border border-cyan-500/40 rounded-2xl p-3 text-center">
              <div className="text-[9px] text-slate-400 uppercase font-bold">Today's Reports</div>
              <div className="text-sm font-black text-cyan-400">14 Generated</div>
              <div className="text-[8px] text-cyan-300/80">Auto Scheduled</div>
            </div>

            <div className="bg-slate-950/80 border border-amber-500/40 rounded-2xl p-3 text-center">
              <div className="text-[9px] text-slate-400 uppercase font-bold">Farm Health</div>
              <div className="text-sm font-black text-amber-300">96 / 100</div>
              <div className="text-[8px] text-amber-300/80">Optimal Vigor</div>
            </div>

            <div className="bg-slate-950/80 border border-purple-500/40 rounded-2xl p-3 text-center">
              <div className="text-[9px] text-slate-400 uppercase font-bold">Latency</div>
              <div className="text-sm font-black text-purple-300">18 ms</div>
              <div className="text-[8px] text-purple-300/80">Qwen 7B Brain</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. CUSTOM REPORT GENERATOR TOOLBAR */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 backdrop-blur-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Generate Dynamic AI Farm Intelligence Report</span>
          </h3>
          <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">Local RAG Synthesis</span>
        </div>

        <form onSubmit={handleGenerateReport} className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
          <div className="md:col-span-4">
            <label className="text-slate-300 font-bold block mb-1">Select Report Category</label>
            <select
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-white focus:outline-none"
            >
              <option value="Crop & Soil Intelligence">Crop & Soil Intelligence</option>
              <option value="Market & Economics">Market & Economics</option>
              <option value="Hydrology & Irrigation">Hydrology & Irrigation</option>
              <option value="Governance & Governance">Governance & Subsidies</option>
            </select>
          </div>

          <div className="md:col-span-5">
            <label className="text-slate-300 font-bold block mb-1">Custom Report Title (Optional)</label>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="e.g. Katpadi Kharif Paddy Disease & NPK Soil Audit..."
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-white focus:outline-none placeholder-slate-500"
            />
          </div>

          <div className="md:col-span-3 flex items-end">
            <button
              type="submit"
              disabled={generating}
              className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition disabled:opacity-50 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{generating ? "Generating..." : "Generate AI Report"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* 3. CATEGORY FILTERS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-2xl font-bold transition shrink-0 border ${selectedCategory === cat ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/20' : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 4. GENERATED AI REPORTS CARDS */}
      <div className="space-y-4">
        {filteredReports.map(rep => (
          <div key={rep.report_id} className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 backdrop-blur-xl space-y-4 hover:border-emerald-500/40 transition">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-slate-400">
                  {rep.report_id}
                </span>
                <span className="text-xs font-mono text-cyan-400 font-bold">{rep.category}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold">
                  Health: {rep.health_score}/100
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={() => handleExportSingleReport(rep, 'PDF')}
                  className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500 text-slate-300 hover:text-white transition font-bold flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PDF</span>
                </button>
                <button
                  onClick={() => handleDeleteReport(rep.report_id)}
                  className="p-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-rose-500/50 text-slate-400 hover:text-rose-400 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div>
              <h3 className="font-extrabold text-white text-base">{rep.title}</h3>
              <p className="text-slate-300 text-xs mt-2 leading-relaxed">
                {rep.executive_summary}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-amber-300">
              {rep.technical_breakdown}
            </div>

            <div className="space-y-1 text-xs">
              <div className="font-bold text-slate-300">AI Action Recommendations:</div>
              {rep.recommendations.map((rec, idx) => (
                <div key={idx} className="flex items-start gap-2 text-slate-300 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 5. AUTONOMOUS REPORT SCHEDULES TABLE */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 backdrop-blur-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <Calendar className="w-4 h-4 text-emerald-400" />
          <span>Configured Autonomous Report Schedules ({schedules.length})</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {schedules.map(sch => (
            <div key={sch.schedule_id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="font-bold text-emerald-400">{sch.schedule_id}</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-900 text-slate-300 font-bold">{sch.frequency}</span>
              </div>
              <div className="font-bold text-white text-xs">{sch.title}</div>
              <div className="text-slate-400 text-[11px] font-mono">{sch.category}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
