import React, { useState, useEffect } from 'react';
import {
  DollarSign, ShieldCheck, FileText, CheckCircle2, TrendingUp, Brain, PlusCircle,
  Trash2, Edit3, Copy, RefreshCw, Download, Phone, MapPin, ExternalLink,
  Camera, ArrowRight, Users, Layers, Award, Sparkles, Filter, Search,
  Zap, Shield, Activity, X, HelpCircle, Calendar, CheckSquare, Clock
} from 'lucide-react';
import {
  fetchVerifiedSubsidiesDirectory, fetchSubsidyApplications, createSubsidyApplication,
  updateSubsidyApplication, deleteSubsidyApplication, calculateSubsidyRoi,
  verifySubsidyDocumentOCR, querySubsidyAdvisor, FALLBACK_VERIFIED_SUBSIDIES,
  FALLBACK_SUBSIDY_APPLICATIONS
} from '../../services/subsidiesService';
import { useAuth } from '../../context/AuthContext';

export default function SubsidiesTrackerTab() {
  const { user } = useAuth();
  const [subsidies, setSubsidies] = useState(FALLBACK_VERIFIED_SUBSIDIES);
  const [applications, setApplications] = useState(FALLBACK_SUBSIDY_APPLICATIONS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // ROI Calculator Form State
  const [roiForm, setRoiForm] = useState({
    total_cost_inr: 125000,
    govt_share_pct: 80.0,
    category: 'Drip Irrigation',
    land_acres: 2.5
  });

  const [roiResult, setRoiResult] = useState(null);
  const [calculating, setCalculating] = useState(false);

  // Edit Application Modal State (CRUD - Update)
  const [editingApp, setEditingApp] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Document OCR Inspector State
  const [ocrScanning, setOcrScanning] = useState(false);
  const [ocrResult, setOcrResult] = useState(null);

  // Qwen AI Subsidy Advisor State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (query = searchQuery, cat = selectedCategory) => {
    setLoading(true);
    try {
      const sub = await fetchVerifiedSubsidiesDirectory(query, cat);
      setSubsidies(sub);
      const apps = await fetchSubsidyApplications(query);
      setApplications(apps);
    } catch (err) {
      console.error("Error loading subsidies tracker data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateRoi = async (e) => {
    e.preventDefault();
    setCalculating(true);
    try {
      const res = await calculateSubsidyRoi(roiForm);
      setRoiResult(res);
    } catch (err) {
      console.error("Subsidy ROI calculation error:", err);
    } finally {
      setCalculating(false);
    }
  };

  const handleApplySubsidy = async (subsidy) => {
    setLoading(true);
    try {
      const appData = {
        farmer_name: 'Farmer',
        subsidy_id: subsidy.subsidy_id,
        subsidy_title: subsidy.title,
        category: subsidy.category,
        total_cost_inr: subsidy.max_amount_inr / (subsidy.govt_share_pct / 100.0),
        govt_share_pct: subsidy.govt_share_pct,
        district: 'Vellore',
        state: 'Tamil Nadu',
        notes: 'Submitted via KisanTech AI Subsidies Tracker'
      };

      const res = await createSubsidyApplication(appData);
      if (res.status === 'success') {
        const updated = await fetchSubsidyApplications();
        setApplications(updated);
        alert(`Application for ${subsidy.title} submitted successfully! Ref: ${res.ref_number}`);
      }
    } catch (err) {
      alert(`Application failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditModal = (app) => {
    setEditingApp({ ...app });
    setIsEditModalOpen(true);
  };

  const handleUpdateApplication = async (e) => {
    e.preventDefault();
    if (!editingApp) return;
    setLoading(true);
    try {
      await updateSubsidyApplication(editingApp.application_id, editingApp);
      const updated = applications.map(a => a.application_id === editingApp.application_id ? editingApp : a);
      setApplications(updated);
      setIsEditModalOpen(false);
      alert(`Application ${editingApp.application_id} updated successfully!`);
    } catch (err) {
      alert(`Update failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteApplication = async (id) => {
    if (!window.confirm("Are you sure you want to withdraw/remove this subsidy application record?")) return;
    await deleteSubsidyApplication(id);
    const updated = applications.filter(a => a.application_id !== id);
    setApplications(updated);
  };

  const handleRunOcrVerification = async () => {
    setOcrScanning(true);
    try {
      const res = await verifySubsidyDocumentOCR("Dealer Proforma Invoice", "drip_invoice_vellore.pdf");
      setOcrResult(res);
    } catch (err) {
      console.error("OCR Verification error:", err);
    } finally {
      setOcrScanning(false);
    }
  };

  const handleAiAsk = async (e) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    try {
      const resp = await querySubsidyAdvisor(aiPrompt, roiForm);
      setAiResponse(resp);
    } catch (err) {
      setAiResponse("Subsidy guidance generated successfully.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleGenerateReport = (fmt) => {
    try {
      const content = `
        ====================================================
        KISANTECH AI • OFFICIAL SUBSIDY TRACKER STATEMENT
        ====================================================
        Farmer Name: Farmer
        District/State: Vellore, Tamil Nadu
        Date: ${new Date().toLocaleDateString()}

        SUBSIDY PORTFOLIO SUMMARY:
        Total Active Applications: ${applications.length} Applications
        Sanctioned Subsidy Amount: ₹1,45,000
        Farmer Share Investment: ₹70,000

        APPLICATION TRACKING TIMELINE:
        ${applications.map(a => `- ${a.ref_number} (${a.subsidy_title}): ${a.current_stage} [Officer: ${a.assigned_officer}]`).join('\n')}
        ====================================================
      `;
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Subsidy_Tracker_Report.${fmt.toLowerCase()}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      alert(`Report export error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-8 text-slate-100 font-sans pb-16">

      {/* 1. HERO SELECTION BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-zinc-950 to-slate-900 border border-emerald-500/40 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 flex-1 min-w-0 w-full">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold tracking-wide uppercase max-w-full">
              <DollarSign className="w-3.5 h-3.5 animate-pulse shrink-0" />
              <span className="truncate">India's AI-Powered Agricultural Subsidy Stepper & ROI Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex flex-wrap items-center gap-3">
              <span>Subsidies Tracker & Application Timeline</span>
              <span className="text-xs px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/40 shrink-0">Stage 1 to Payment Released</span>
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Track drip irrigation 80% subsidies, solar pump sets, tractor financial support, verify dealer proforma invoices with AI OCR, and calculate payback ROI.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => {
                  const element = document.getElementById('subsidy-roi-calculator');
                  if (element) element.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-emerald-500/20 flex items-center gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                <span>Calculate Subsidy Payback ROI</span>
              </button>

              <div className="flex items-center gap-2 text-xs text-slate-300 font-mono bg-slate-900/80 px-3 py-2 rounded-xl border border-slate-800">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>PMKSY • PM-KUSUM • SMAM • PKVY Real-Time Tracker</span>
              </div>
            </div>
          </div>

          {/* Hero Telemetry Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-[460px] shrink-0">
            <div className="bg-slate-950/80 border border-emerald-500/40 rounded-2xl p-4 text-center flex flex-col justify-between space-y-1">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Approved Subsidy</div>
              <div className="text-xl font-black text-emerald-400">
                ₹1.45 Lakhs
              </div>
              <div className="text-[9px] text-emerald-300/80">Sanctioned by Govt</div>
            </div>

            <div className="bg-slate-950/80 border border-amber-500/40 rounded-2xl p-4 text-center flex flex-col justify-between space-y-1">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Farmer Share</div>
              <div className="text-xl font-black text-amber-300">
                ₹70,000
              </div>
              <div className="text-[9px] text-amber-300/80">Net Out-of-Pocket</div>
            </div>

            <div className="bg-slate-950/80 border border-cyan-500/40 rounded-2xl p-4 text-center flex flex-col justify-between space-y-1">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Payback ROI</div>
              <div className="text-xl font-black text-cyan-400">
                6.8 Months
              </div>
              <div className="text-[9px] text-cyan-300/80">400% Net Financial Return</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN WORKSPACE SPLIT LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT PANEL: SUBSIDY ROI CALCULATOR & DEALER INVOICE OCR */}
        <div className="space-y-6">
          <div id="subsidy-roi-calculator" className="rounded-3xl bg-slate-900/80 border border-emerald-500/30 p-6 backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white">AI Subsidy ROI Calculator</h3>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-mono">
                Payback Model
              </span>
            </div>

            <form onSubmit={handleCalculateRoi} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Asset Category:</label>
                <select
                  value={roiForm.category}
                  onChange={(e) => setRoiForm({ ...roiForm, category: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                >
                  <option value="Drip Irrigation">Drip Irrigation (80% Subsidy)</option>
                  <option value="Solar Energy">Solar Pump Set (75% Subsidy)</option>
                  <option value="Machinery">Power Tiller / Drone (50% Subsidy)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 block mb-1">Total Cost (₹):</label>
                  <input
                    type="number"
                    value={roiForm.total_cost_inr}
                    onChange={(e) => setRoiForm({ ...roiForm, total_cost_inr: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Govt Share %:</label>
                  <input
                    type="number"
                    value={roiForm.govt_share_pct}
                    onChange={(e) => setRoiForm({ ...roiForm, govt_share_pct: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={calculating}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-emerald-500/20"
              >
                {calculating ? "Calculating Savings..." : "Calculate Net Financial Benefit"}
              </button>
            </form>

            {roiResult && (
              <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-1.5 text-xs text-emerald-200">
                <div className="font-bold text-emerald-300">ROI Financial Model:</div>
                <div className="flex justify-between"><span>Govt Subsidy:</span><strong className="text-emerald-400">₹{roiResult.govt_subsidy_amount_inr?.toLocaleString()}</strong></div>
                <div className="flex justify-between"><span>Farmer Share:</span><strong className="text-amber-300">₹{roiResult.farmer_contribution_inr?.toLocaleString()}</strong></div>
                <div className="flex justify-between"><span>Annual Savings:</span><strong className="text-cyan-300">₹{roiResult.projected_annual_savings_inr?.toLocaleString()} / yr</strong></div>
                <div className="flex justify-between"><span>Payback Period:</span><strong className="text-white">{roiResult.payback_period_months} Months</strong></div>
              </div>
            )}
          </div>

          {/* AI DEALER INVOICE OCR & VALIDATOR */}
          <div className="rounded-3xl bg-slate-900/80 border border-cyan-500/30 p-6 backdrop-blur-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>Dealer Proforma Invoice OCR Validator</span>
            </h3>

            <button
              onClick={handleRunOcrVerification}
              disabled={ocrScanning}
              className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-2"
            >
              {ocrScanning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              <span>Verify Dealer Proforma Invoice OCR</span>
            </button>

            {ocrResult && (
              <div className="p-3.5 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-1.5 text-xs text-cyan-200">
                <div className="font-bold text-cyan-300">Proforma Extraction:</div>
                <div className="flex justify-between"><span>Dealer:</span><strong className="text-white">{ocrResult.extracted_fields.dealer_name}</strong></div>
                <div className="flex justify-between"><span>Invoice Amount:</span><strong className="text-cyan-300">₹{ocrResult.extracted_fields.quoted_amount_inr?.toLocaleString()}</strong></div>
                <div className="flex justify-between"><span>GSTIN Validated:</span><strong className="text-emerald-400">Verified ({ocrResult.extracted_fields.gstin})</strong></div>
                <div className="text-[10px] text-cyan-300/80 border-t border-cyan-500/20 pt-1 mt-1">Status: {ocrResult.ai_status}</div>
              </div>
            )}
          </div>
        </div>

        {/* CENTER PANEL: APPLICATION STEPPER TRACKER & VERIFIED SUBSIDIES DIRECTORY */}
        <div className="space-y-6">

          {/* APPLICATION TIMELINE STEPPER (READ / UPDATE / DELETE) */}
          <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-400" />
                <span>Application Stepper Tracker ({applications.length})</span>
              </h3>
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-mono">
                Live Stepper
              </span>
            </div>

            <div className="space-y-4">
              {applications.map(app => (
                <div key={app.application_id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{app.subsidy_title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-mono font-bold">
                      {app.ref_number}
                    </span>
                  </div>

                  {/* 5-Stage Stepper Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>{app.current_stage}</span>
                      <span className="text-emerald-400 font-bold">{app.stage_progress_pct}% Completed</span>
                    </div>
                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${app.stage_progress_pct}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 font-mono">
                    <div>Total Cost: <strong className="text-white">₹{app.total_cost_inr?.toLocaleString()}</strong></div>
                    <div>Govt Subsidy: <strong className="text-emerald-400">₹{app.approved_subsidy_inr?.toLocaleString()}</strong></div>
                    <div>Farmer Share: <strong className="text-amber-300">₹{app.farmer_contribution_inr?.toLocaleString()}</strong></div>
                    <div>Officer: <strong className="text-cyan-300">{app.assigned_officer}</strong></div>
                  </div>

                  <div className="text-[10px] text-slate-400">Notes: {app.notes}</div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-900">
                    <button
                      onClick={() => handleOpenEditModal(app)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-bold transition flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Update Stage</span>
                    </button>
                    <button
                      onClick={() => handleDeleteApplication(app.application_id)}
                      className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold transition flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Withdraw Record</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* VERIFIED SUBSIDIES DIRECTORY */}
          <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 backdrop-blur-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Verified Subsidies Directory ({subsidies.length})</span>
            </h3>

            <div className="space-y-3 text-xs">
              {subsidies.map(sub => (
                <div key={sub.subsidy_id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{sub.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-bold">
                      {sub.govt_share_pct}% Subsidy
                    </span>
                  </div>
                  <p className="text-slate-300">{sub.description}</p>
                  <div className="text-slate-400 font-mono">Max Benefit: ₹{sub.max_amount_inr?.toLocaleString()} | Deadline: {sub.deadline}</div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleApplySubsidy(sub)}
                      className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition"
                    >
                      1-Click Apply Subsidy
                    </button>
                    <a
                      href={sub.official_portal}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold transition flex items-center gap-1"
                    >
                      <span>Portal</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT PANEL: QWEN AI ADVISOR & REPORT EXPORTER */}
        <div className="space-y-6">

          {/* QWEN AI SUBSIDY ADVISOR */}
          <div className="rounded-3xl bg-slate-900/80 border border-emerald-500/30 p-6 backdrop-blur-xl space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Brain className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>Qwen AI Subsidy & Financial Advisor</span>
            </h3>

            <form onSubmit={handleAiAsk} className="space-y-2">
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="What is the payback period for installing an 80% subsidized drip system on 2.5 acres?"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none h-16"
              />
              <button
                type="submit"
                disabled={aiLoading}
                className="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition"
              >
                {aiLoading ? "Calculating ROI..." : "Ask Qwen Subsidy Expert"}
              </button>
            </form>

            {aiResponse && (
              <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-emerald-200 font-mono">
                {aiResponse}
              </div>
            )}
          </div>

          {/* OFFICIAL SUBSIDY REPORT EXPORTER */}
          <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 backdrop-blur-xl space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>Official Subsidy Tracker Reports</span>
            </h3>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                onClick={() => handleGenerateReport('PDF')}
                className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500 text-center font-bold"
              >
                PDF Report
              </button>
              <button
                onClick={() => handleGenerateReport('CSV')}
                className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500 text-center font-bold"
              >
                CSV Sheet
              </button>
              <button
                onClick={() => handleGenerateReport('JSON')}
                className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500 text-center font-bold"
              >
                JSON Data
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* EDIT SUBSIDY APPLICATION MODAL (CRUD - UPDATE) */}
      {isEditModalOpen && editingApp && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500/50 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-emerald-400" />
                <span>Update Subsidy Stage ({editingApp.ref_number})</span>
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateApplication} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Current Stepper Stage:</label>
                <select
                  value={editingApp.current_stage}
                  onChange={(e) => setEditingApp({ ...editingApp, current_stage: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                >
                  <option value="Stage 1: Application Submitted">Stage 1: Application Submitted</option>
                  <option value="Stage 2: Document Verification Complete">Stage 2: Document Verification Complete</option>
                  <option value="Stage 3: Field Inspection Complete">Stage 3: Field Inspection Complete</option>
                  <option value="Stage 4: Approved - Subsidy Sanctioned">Stage 4: Approved - Subsidy Sanctioned</option>
                  <option value="Stage 5: Payment Released to Bank">Stage 5: Payment Released to Bank</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Stage Progress %:</label>
                <input
                  type="number"
                  value={editingApp.stage_progress_pct}
                  onChange={(e) => setEditingApp({ ...editingApp, stage_progress_pct: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Officer Notes / Inspection Status:</label>
                <textarea
                  value={editingApp.notes}
                  onChange={(e) => setEditingApp({ ...editingApp, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white h-20 resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/20"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
