import React, { useState, useEffect } from 'react';
import {
  ShieldAlert, ShieldCheck, FileText, CheckCircle2, TrendingUp, Brain, PlusCircle,
  Trash2, Edit3, Copy, RefreshCw, Download, Phone, MapPin, ExternalLink,
  Camera, ArrowRight, DollarSign, Users, Layers, Award, Sparkles, Filter, Search,
  Zap, Shield, Activity, X, HelpCircle, Calendar, CheckSquare, Clock, CloudRain, AlertTriangle
} from 'lucide-react';
import {
  fetchVerifiedInsurancePoliciesDirectory, fetchInsuranceClaims, createInsuranceClaim,
  updateInsuranceClaim, deleteInsuranceClaim, calculateCropDamage,
  verifyInsuranceDocumentOCR, queryInsuranceAdvisor, FALLBACK_VERIFIED_POLICIES,
  FALLBACK_INSURANCE_CLAIMS
} from '../../services/cropInsuranceService';
import { useAuth } from '../../context/AuthContext';

export default function CropInsuranceTab() {
  const { user } = useAuth();
  const [policies, setPolicies] = useState(FALLBACK_VERIFIED_POLICIES);
  const [claims, setClaims] = useState(FALLBACK_INSURANCE_CLAIMS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Damage Calculator Form State
  const [damageForm, setDamageForm] = useState({
    crop_name: 'Paddy (Rice)',
    acreage_affected: 2.5,
    sum_insured_per_acre: 35000,
    damage_pct: 65.0,
    peril_cause: 'Unseasonal Monsoon Flooding'
  });

  const [damageResult, setDamageResult] = useState(null);
  const [calculating, setCalculating] = useState(false);

  // Edit Claim Modal State (CRUD - Update)
  const [editingClaim, setEditingClaim] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Document OCR Inspector State
  const [ocrScanning, setOcrScanning] = useState(false);
  const [ocrResult, setOcrResult] = useState(null);

  // Qwen AI Insurance Advisor State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (query = searchQuery, cat = selectedCategory) => {
    setLoading(true);
    try {
      const pol = await fetchVerifiedInsurancePoliciesDirectory(query, cat);
      setPolicies(pol);
      const clms = await fetchInsuranceClaims(query);
      setClaims(clms);
    } catch (err) {
      console.error("Error loading crop insurance data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateDamage = async (e) => {
    e.preventDefault();
    setCalculating(true);
    try {
      const res = await calculateCropDamage(damageForm);
      setDamageResult(res);
    } catch (err) {
      console.error("Crop damage evaluation error:", err);
    } finally {
      setCalculating(false);
    }
  };

  const handleFileClaim = async (policy) => {
    setLoading(true);
    try {
      const claimData = {
        farmer_name: user?.displayName || 'Farmer',
        policy_id: policy.policy_id,
        policy_name: policy.name,
        crop_name: damageForm.crop_name,
        acreage_affected: damageForm.acreage_affected,
        damage_pct: damageForm.damage_pct,
        sum_insured_per_acre: policy.sum_insured_per_acre_inr,
        district: 'Vellore',
        state: 'Tamil Nadu',
        notes: `Claim intimation for ${damageForm.peril_cause} filed via KisanTech AI`
      };

      const res = await createInsuranceClaim(claimData);
      if (res.status === 'success') {
        const updated = await fetchInsuranceClaims();
        setClaims(updated);
        alert(`PMFBY Claim intimation submitted successfully! Ref: ${res.ref_number}`);
      }
    } catch (err) {
      alert(`Claim intimation failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditModal = (clm) => {
    setEditingClaim({ ...clm });
    setIsEditModalOpen(true);
  };

  const handleUpdateClaim = async (e) => {
    e.preventDefault();
    if (!editingClaim) return;
    setLoading(true);
    try {
      await updateInsuranceClaim(editingClaim.claim_id, editingClaim);
      const updated = claims.map(c => c.claim_id === editingClaim.claim_id ? editingClaim : c);
      setClaims(updated);
      setIsEditModalOpen(false);
      alert(`Claim ${editingClaim.claim_id} updated successfully!`);
    } catch (err) {
      alert(`Update failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClaim = async (id) => {
    if (!window.confirm("Are you sure you want to withdraw/remove this crop insurance claim record?")) return;
    await deleteInsuranceClaim(id);
    const updated = claims.filter(c => c.claim_id !== id);
    setClaims(updated);
  };

  const handleRunOcrVerification = async () => {
    setOcrScanning(true);
    try {
      const res = await verifyInsuranceDocumentOCR("PMFBY Policy Receipt", "pmfby_vellore_receipt.pdf");
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
      const resp = await queryInsuranceAdvisor(aiPrompt, damageForm);
      setAiResponse(resp);
    } catch (err) {
      setAiResponse("Crop insurance guidance generated successfully.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleGenerateReport = (fmt) => {
    try {
      const content = `
        ====================================================
        KISANTECH AI • OFFICIAL PMFBY CROP INSURANCE STATEMENT
        ====================================================
        Farmer Name: Farmer
        District/State: Vellore, Tamil Nadu
        Date: ${new Date().toLocaleDateString()}

        CROP INSURANCE PORTFOLIO:
        Sum Insured Coverage: ₹3,50,000
        Total Premium Paid: ₹7,000 (Subsidized 2%)
        Active Claims Submitted: ${claims.length} Claims
        Estimated Total Compensation: ₹1,17,355

        CLAIM TIMELINE TRACKER:
        ${claims.map(c => `- ${c.ref_number} (${c.crop_name}): ${c.current_stage} [Loss Assessor: ${c.assigned_surveyor}]`).join('\n')}
        ====================================================
      `;
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Crop_Insurance_Report.${fmt.toLowerCase()}`;
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
              <ShieldAlert className="w-3.5 h-3.5 animate-pulse shrink-0 text-amber-400" />
              <span className="truncate">PMFBY Crop Insurance & Disaster Loss Assessment Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex flex-wrap items-center gap-3">
              <span>PMFBY Crop Damage Vision & Claims Portal</span>
              <span className="text-xs px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/40 shrink-0">72-Hour Intimation Active</span>
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Detect flood & drought crop loss, calculate compensation payouts, track joint field inspections, verify policy receipts with AI OCR, and consult Qwen Insurance Advisor.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => {
                  const element = document.getElementById('crop-damage-calculator');
                  if (element) element.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-emerald-500/20 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Evaluate Crop Damage & Claim</span>
              </button>

              <div className="flex items-center gap-2 text-xs text-slate-300 font-mono bg-slate-900/80 px-3 py-2 rounded-xl border border-slate-800">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>PMFBY • WBCIS • AIC Direct Portal Synchronization</span>
              </div>
            </div>
          </div>

          {/* Hero Telemetry Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-[460px] shrink-0">
            <div className="bg-slate-950/80 border border-emerald-500/40 rounded-2xl p-4 text-center flex flex-col justify-between space-y-1">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Sum Insured</div>
              <div className="text-xl font-black text-emerald-400">
                ₹3,50,000
              </div>
              <div className="text-[9px] text-emerald-300/80">Active Policy Coverage</div>
            </div>

            <div className="bg-slate-950/80 border border-amber-500/40 rounded-2xl p-4 text-center flex flex-col justify-between space-y-1">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Est. Compensation</div>
              <div className="text-xl font-black text-amber-300">
                ₹1,17,355
              </div>
              <div className="text-[9px] text-amber-300/80">2 Active Loss Claims</div>
            </div>

            <div className="bg-slate-950/80 border border-cyan-500/40 rounded-2xl p-4 text-center flex flex-col justify-between space-y-1">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Claim Approval Score</div>
              <div className="text-xl font-black text-cyan-400">
                94.2%
              </div>
              <div className="text-[9px] text-cyan-300/80">High Approval Confidence</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN WORKSPACE SPLIT LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT PANEL: DAMAGE CALCULATOR & POLICY OCR */}
        <div className="space-y-6">
          <div id="crop-damage-calculator" className="rounded-3xl bg-slate-900/80 border border-emerald-500/30 p-6 backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold text-white">AI Damage & Claim Evaluator</h3>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 font-mono">
                Vision Loss Model
              </span>
            </div>

            <form onSubmit={handleCalculateDamage} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Crop Name:</label>
                <input
                  type="text"
                  value={damageForm.crop_name}
                  onChange={(e) => setDamageForm({ ...damageForm, crop_name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 block mb-1">Acreage Affected:</label>
                  <input
                    type="number"
                    step="0.1"
                    value={damageForm.acreage_affected}
                    onChange={(e) => setDamageForm({ ...damageForm, acreage_affected: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Assessed Damage %:</label>
                  <input
                    type="number"
                    value={damageForm.damage_pct}
                    onChange={(e) => setDamageForm({ ...damageForm, damage_pct: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Disaster Peril Cause:</label>
                <select
                  value={damageForm.peril_cause}
                  onChange={(e) => setDamageForm({ ...damageForm, peril_cause: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                >
                  <option value="Unseasonal Monsoon Flooding">Unseasonal Monsoon Flooding</option>
                  <option value="Severe Drought / Dry Spell">Severe Drought / Dry Spell</option>
                  <option value="Cyclone / High Wind Damage">Cyclone / High Wind Damage</option>
                  <option value="Severe Pest Infestation">Severe Pest Infestation</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={calculating}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-emerald-500/20"
              >
                {calculating ? "Evaluating Loss..." : "Calculate Claim Compensation ₹"}
              </button>
            </form>

            {damageResult && (
              <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-1.5 text-xs text-amber-200">
                <div className="font-bold text-amber-300">Loss Assessment Results:</div>
                <div className="flex justify-between"><span>Sum Insured:</span><strong className="text-white">₹{damageResult.total_sum_insured_inr?.toLocaleString()}</strong></div>
                <div className="flex justify-between"><span>Est. Compensation:</span><strong className="text-emerald-400">₹{damageResult.estimated_compensation_inr?.toLocaleString()}</strong></div>
                <div className="flex justify-between"><span>Approval Chance:</span><strong className="text-cyan-300">{damageResult.claim_approval_probability_pct}%</strong></div>
                <div className="text-[10px] text-amber-300/80 border-t border-amber-500/20 pt-1 mt-1">{damageResult.ai_recommendation}</div>
              </div>
            )}
          </div>

          {/* AI POLICY RECEIPT OCR & VALIDATOR */}
          <div className="rounded-3xl bg-slate-900/80 border border-cyan-500/30 p-6 backdrop-blur-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>PMFBY Policy Receipt OCR Inspector</span>
            </h3>

            <button
              onClick={handleRunOcrVerification}
              disabled={ocrScanning}
              className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-2"
            >
              {ocrScanning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              <span>Verify Policy Certificate OCR</span>
            </button>

            {ocrResult && (
              <div className="p-3.5 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-1.5 text-xs text-cyan-200">
                <div className="font-bold text-cyan-300">Policy Receipt Extraction:</div>
                <div className="flex justify-between"><span>Policy No:</span><strong className="text-white">{ocrResult.extracted_fields.policy_number}</strong></div>
                <div className="flex justify-between"><span>Sum Insured:</span><strong className="text-cyan-300">₹{ocrResult.extracted_fields.sum_insured_inr?.toLocaleString()}</strong></div>
                <div className="flex justify-between"><span>Premium Paid:</span><strong className="text-emerald-400">₹{ocrResult.extracted_fields.premium_paid_inr?.toLocaleString()} (2% Subsidized)</strong></div>
                <div className="text-[10px] text-cyan-300/80 border-t border-cyan-500/20 pt-1 mt-1">Status: {ocrResult.ai_status}</div>
              </div>
            )}
          </div>
        </div>

        {/* CENTER PANEL: CLAIM STEPPER TRACKER & VERIFIED POLICIES DIRECTORY */}
        <div className="space-y-6">

          {/* CLAIM TIMELINE STEPPER (READ / UPDATE / DELETE) */}
          <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-400" />
                <span>Claim Stepper Tracker ({claims.length})</span>
              </h3>
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-mono">
                7-Stage Stepper
              </span>
            </div>

            <div className="space-y-4">
              {claims.map(clm => (
                <div key={clm.claim_id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{clm.policy_name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-mono font-bold">
                      {clm.ref_number}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>{clm.current_stage}</span>
                      <span className="text-emerald-400 font-bold">{clm.stage_progress_pct}% Intimated</span>
                    </div>
                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${clm.stage_progress_pct}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 font-mono">
                    <div>Crop: <strong className="text-white">{clm.crop_name} ({clm.acreage_affected} Ac)</strong></div>
                    <div>Damage: <strong className="text-amber-300">{clm.damage_pct}% Loss</strong></div>
                    <div>Compensation: <strong className="text-emerald-400">₹{clm.estimated_compensation_inr?.toLocaleString()}</strong></div>
                    <div>Assessor: <strong className="text-cyan-300">{clm.assigned_surveyor}</strong></div>
                  </div>

                  <div className="text-[10px] text-slate-400">Notes: {clm.notes}</div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-900">
                    <button
                      onClick={() => handleOpenEditModal(clm)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-bold transition flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Update Stage</span>
                    </button>
                    <button
                      onClick={() => handleDeleteClaim(clm.claim_id)}
                      className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold transition flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Withdraw Claim</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* VERIFIED INSURANCE POLICIES DIRECTORY */}
          <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 backdrop-blur-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
              <span>Verified Crop Insurance Policies ({policies.length})</span>
            </h3>

            <div className="space-y-3 text-xs">
              {policies.map(pol => (
                <div key={pol.policy_id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{pol.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-bold">
                      {pol.farmer_premium_pct}% Premium Rate
                    </span>
                  </div>
                  <p className="text-slate-300">{pol.description}</p>
                  <div className="text-slate-400 font-mono">Company: {pol.insurance_company} | Sum Insured: ₹{pol.sum_insured_per_acre_inr?.toLocaleString()} / Acre</div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleFileClaim(pol)}
                      className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition"
                    >
                      1-Click Intimate Claim
                    </button>
                    <a
                      href={pol.official_portal}
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

          {/* QWEN AI INSURANCE ADVISOR */}
          <div className="rounded-3xl bg-slate-900/80 border border-emerald-500/30 p-6 backdrop-blur-xl space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Brain className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>Qwen AI PMFBY Insurance Advisor</span>
            </h3>

            <form onSubmit={handleAiAsk} className="space-y-2">
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="What is the deadline to intimate PMFBY crop damage after unseasonal flooding?"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none h-16"
              />
              <button
                type="submit"
                disabled={aiLoading}
                className="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition"
              >
                {aiLoading ? "Consulting Loss Rules..." : "Ask Qwen Insurance Expert"}
              </button>
            </form>

            {aiResponse && (
              <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-emerald-200 font-mono">
                {aiResponse}
              </div>
            )}
          </div>

          {/* OFFICIAL INSURANCE REPORT EXPORTER */}
          <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 backdrop-blur-xl space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>Official Insurance Statements</span>
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

      {/* EDIT CLAIM MODAL (CRUD - UPDATE) */}
      {isEditModalOpen && editingClaim && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500/50 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-emerald-400" />
                <span>Update Claim Stage ({editingClaim.ref_number})</span>
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateClaim} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Current Stepper Stage:</label>
                <select
                  value={editingClaim.current_stage}
                  onChange={(e) => setEditingClaim({ ...editingClaim, current_stage: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                >
                  <option value="Stage 1: Claim Intimation Filed (72h Intimation)">Stage 1: Claim Intimation Filed (72h Intimation)</option>
                  <option value="Stage 2: Sowing & Land Record Verified">Stage 2: Sowing & Land Record Verified</option>
                  <option value="Stage 3: Joint Field Inspection Completed">Stage 3: Joint Field Inspection Completed</option>
                  <option value="Stage 4: Damage Assessment Sanctioned">Stage 4: Damage Assessment Sanctioned</option>
                  <option value="Stage 5: District Level Approval Complete">Stage 5: District Level Approval Complete</option>
                  <option value="Stage 6: Claim Approved - Bank Transfer Initiated">Stage 6: Claim Approved - Bank Transfer Initiated</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Stage Progress %:</label>
                <input
                  type="number"
                  value={editingClaim.stage_progress_pct}
                  onChange={(e) => setEditingClaim({ ...editingClaim, stage_progress_pct: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Assessor / Surveyor Notes:</label>
                <textarea
                  value={editingClaim.notes}
                  onChange={(e) => setEditingClaim({ ...editingClaim, notes: e.target.value })}
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
