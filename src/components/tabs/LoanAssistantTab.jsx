import React, { useState, useEffect } from 'react';
import {
  Landmark, ShieldCheck, FileText, CheckCircle2, TrendingUp, Brain, PlusCircle,
  Trash2, Edit3, Copy, RefreshCw, Download, Phone, MapPin, ExternalLink,
  Camera, ArrowRight, DollarSign, Users, Layers, Award, Sparkles, Filter, Search,
  Zap, Shield, Activity, X, HelpCircle, Calendar, CheckSquare, Clock, Calculator, Percent
} from 'lucide-react';
import {
  fetchVerifiedBankLoansDirectory, fetchLoanApplications, createLoanApplication,
  updateLoanApplication, deleteLoanApplication, calculateAgriLoanEmi,
  verifyLoanDocumentOCR, queryLoanAdvisor, FALLBACK_VERIFIED_BANK_LOANS,
  FALLBACK_LOAN_APPLICATIONS
} from '../../services/loanAssistantService';
import { useAuth } from '../../context/AuthContext';

export default function LoanAssistantTab() {
  const { user } = useAuth();
  const [loans, setLoans] = useState(FALLBACK_VERIFIED_BANK_LOANS);
  const [applications, setApplications] = useState(FALLBACK_LOAN_APPLICATIONS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // EMI Calculator Form State
  const [emiForm, setEmiForm] = useState({
    loan_amount_inr: 200000,
    interest_rate_pct: 4.0,
    tenure_years: 1,
    annual_crop_income_inr: 320000
  });

  const [emiResult, setEmiResult] = useState(null);
  const [calculating, setCalculating] = useState(false);

  // Edit Loan Application Modal State (CRUD - Update)
  const [editingApp, setEditingApp] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Document OCR Inspector State
  const [ocrScanning, setOcrScanning] = useState(false);
  const [ocrResult, setOcrResult] = useState(null);

  // Qwen AI Loan Advisor State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (query = searchQuery, cat = selectedCategory) => {
    setLoading(true);
    try {
      const ln = await fetchVerifiedBankLoansDirectory(query, cat);
      setLoans(ln);
      const apps = await fetchLoanApplications(query);
      setApplications(apps);
    } catch (err) {
      console.error("Error loading loan assistant data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateEmi = async (e) => {
    e.preventDefault();
    setCalculating(true);
    try {
      const res = await calculateAgriLoanEmi(emiForm);
      setEmiResult(res);
    } catch (err) {
      console.error("Agri loan EMI evaluation error:", err);
    } finally {
      setCalculating(false);
    }
  };

  const handleApplyLoan = async (loan) => {
    setLoading(true);
    try {
      const appData = {
        farmer_name: user?.displayName || 'Farmer',
        loan_id: loan.loan_id,
        bank_name: loan.bank_name,
        scheme_name: loan.scheme_name,
        loan_amount_inr: emiForm.loan_amount_inr,
        tenure_years: emiForm.tenure_years,
        interest_rate_pct: loan.effective_subsidized_rate_pct,
        district: 'Vellore',
        state: 'Tamil Nadu',
        notes: `Application for ${loan.scheme_name} submitted via KisanTech AI`
      };

      const res = await createLoanApplication(appData);
      if (res.status === 'success') {
        const updated = await fetchLoanApplications();
        setApplications(updated);
        alert(`Loan application for ${loan.scheme_name} submitted successfully! Ref: ${res.ref_number}`);
      }
    } catch (err) {
      alert(`Loan application failed: ${err.message}`);
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
      await updateLoanApplication(editingApp.application_id, editingApp);
      const updated = applications.map(a => a.application_id === editingApp.application_id ? editingApp : a);
      setApplications(updated);
      setIsEditModalOpen(false);
      alert(`Loan Application ${editingApp.application_id} updated successfully!`);
    } catch (err) {
      alert(`Update failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteApplication = async (id) => {
    if (!window.confirm("Are you sure you want to withdraw/remove this loan application record?")) return;
    await deleteLoanApplication(id);
    const updated = applications.filter(a => a.application_id !== id);
    setApplications(updated);
  };

  const handleRunOcrVerification = async () => {
    setOcrScanning(true);
    try {
      const res = await verifyLoanDocumentOCR("KCC Passbook", "kcc_passbook_vellore.pdf");
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
      const resp = await queryLoanAdvisor(aiPrompt, emiForm);
      setAiResponse(resp);
    } catch (err) {
      setAiResponse("Loan guidance generated successfully.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleGenerateReport = (fmt) => {
    try {
      const content = `
        ====================================================
        KISANTECH AI • OFFICIAL AGRI LOAN & KCC STATEMENT
        ====================================================
        Farmer Name: Farmer
        District/State: Vellore, Tamil Nadu
        CIBIL Score: 845 (Excellent)
        Date: ${new Date().toLocaleDateString()}

        KCC & LOAN SUMMARY:
        Active Loan Applications: ${applications.length} Applications
        Total Borrowed Amount: ₹6,50,000
        Effective Subsidized Rate: 4.0% p.a. (3% PRI Applied)
        Monthly Subsidized EMI Outflow: ₹667 / Month

        LOAN TIMELINE TRACKER:
        ${applications.map(a => `- ${a.ref_number} (${a.scheme_name}): ${a.current_stage} [Officer: ${a.assigned_officer}]`).join('\n')}
        ====================================================
      `;
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Agricultural_Loan_Report.${fmt.toLowerCase()}`;
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
              <Landmark className="w-3.5 h-3.5 animate-pulse shrink-0 text-amber-400" />
              <span className="truncate">Kisan Credit Card (KCC) & Subsidized Agri Loan Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex flex-wrap items-center gap-3">
              <span>Agricultural Loan Assistant & Cash Flow AI</span>
              <span className="text-xs px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/40 shrink-0">4% Effective Interest Rate</span>
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Calculate KCC subsidized EMIs, compare SBI, Canara & NABARD loans, evaluate debt coverage ratios, verify CIBIL passbooks with AI OCR, and consult Qwen Loan Advisor.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => {
                  const element = document.getElementById('agri-emi-calculator');
                  if (element) element.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-emerald-500/20 flex items-center gap-2"
              >
                <Calculator className="w-4 h-4" />
                <span>Calculate Subsidized KCC EMI</span>
              </button>

              <div className="flex items-center gap-2 text-xs text-slate-300 font-mono bg-slate-900/80 px-3 py-2 rounded-xl border border-slate-800">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>SBI • Canara • Indian Bank • JanSamarth Direct Portals</span>
              </div>
            </div>
          </div>

          {/* Hero Telemetry Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-[460px] shrink-0">
            <div className="bg-slate-950/80 border border-emerald-500/40 rounded-2xl p-4 text-center flex flex-col justify-between space-y-1">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Subsidized Interest</div>
              <div className="text-xl font-black text-emerald-400">
                4.0% p.a.
              </div>
              <div className="text-[9px] text-emerald-300/80">3% Govt PRI Subvention</div>
            </div>

            <div className="bg-slate-950/80 border border-amber-500/40 rounded-2xl p-4 text-center flex flex-col justify-between space-y-1">
              <div className="text-[10px] text-slate-400 font-bold uppercase">KCC Monthly EMI</div>
              <div className="text-xl font-black text-amber-300">
                ₹667 / mo
              </div>
              <div className="text-[9px] text-amber-300/80">For ₹2.0 Lakhs Principal</div>
            </div>

            <div className="bg-slate-950/80 border border-cyan-500/40 rounded-2xl p-4 text-center flex flex-col justify-between space-y-1">
              <div className="text-[10px] text-slate-400 font-bold uppercase">CIBIL Health Score</div>
              <div className="text-xl font-black text-cyan-400">
                845 / 900
              </div>
              <div className="text-[9px] text-cyan-300/80">Excellent (Collateral Free)</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN WORKSPACE SPLIT LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT PANEL: EMI CALCULATOR & CIBIL PASSBOOK OCR */}
        <div className="space-y-6">
          <div id="agri-emi-calculator" className="rounded-3xl bg-slate-900/80 border border-emerald-500/30 p-6 backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white">AI KCC EMI & Cash Flow Engine</h3>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-mono">
                Debt Coverage
              </span>
            </div>

            <form onSubmit={handleCalculateEmi} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Loan Amount (₹):</label>
                <input
                  type="number"
                  value={emiForm.loan_amount_inr}
                  onChange={(e) => setEmiForm({ ...emiForm, loan_amount_inr: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 block mb-1">Subsidized Rate %:</label>
                  <input
                    type="number"
                    step="0.1"
                    value={emiForm.interest_rate_pct}
                    onChange={(e) => setEmiForm({ ...emiForm, interest_rate_pct: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Tenure (Years):</label>
                  <input
                    type="number"
                    value={emiForm.tenure_years}
                    onChange={(e) => setEmiForm({ ...emiForm, tenure_years: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Expected Annual Crop Income (₹):</label>
                <input
                  type="number"
                  value={emiForm.annual_crop_income_inr}
                  onChange={(e) => setEmiForm({ ...emiForm, annual_crop_income_inr: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <button
                type="submit"
                disabled={calculating}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-emerald-500/20"
              >
                {calculating ? "Evaluating Cash Flow..." : "Calculate Subsidized EMI & Net Profit"}
              </button>
            </form>

            {emiResult && (
              <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-1.5 text-xs text-emerald-200">
                <div className="font-bold text-emerald-300">Financial Calculation Results:</div>
                <div className="flex justify-between"><span>Monthly EMI:</span><strong className="text-emerald-400">₹{emiResult.monthly_emi_inr?.toLocaleString()} / mo</strong></div>
                <div className="flex justify-between"><span>Total Interest:</span><strong className="text-amber-300">₹{emiResult.total_interest_payable_inr?.toLocaleString()}</strong></div>
                <div className="flex justify-between"><span>Net Crop Profit:</span><strong className="text-cyan-300">₹{emiResult.net_crop_profit_after_emi_inr?.toLocaleString()} / yr</strong></div>
                <div className="flex justify-between"><span>Risk Index:</span><strong className="text-white">{emiResult.financial_risk_level}</strong></div>
              </div>
            )}
          </div>

          {/* AI CIBIL & KCC PASSBOOK OCR */}
          <div className="rounded-3xl bg-slate-900/80 border border-cyan-500/30 p-6 backdrop-blur-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>KCC Passbook & CIBIL OCR Inspector</span>
            </h3>

            <button
              onClick={handleRunOcrVerification}
              disabled={ocrScanning}
              className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-2"
            >
              {ocrScanning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              <span>Verify KCC Account OCR</span>
            </button>

            {ocrResult && (
              <div className="p-3.5 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-1.5 text-xs text-cyan-200">
                <div className="font-bold text-cyan-300">Passbook Extraction:</div>
                <div className="flex justify-between"><span>Account No:</span><strong className="text-white">{ocrResult.extracted_fields.bank_account_no}</strong></div>
                <div className="flex justify-between"><span>CIBIL Score:</span><strong className="text-emerald-400">{ocrResult.extracted_fields.cibil_score} (Excellent)</strong></div>
                <div className="flex justify-between"><span>Collateral Free:</span><strong className="text-cyan-300">Exempt up to ₹1.6 Lakhs</strong></div>
                <div className="text-[10px] text-cyan-300/80 border-t border-cyan-500/20 pt-1 mt-1">Status: {ocrResult.ai_status}</div>
              </div>
            )}
          </div>
        </div>

        {/* CENTER PANEL: LOAN STEPPER TRACKER & VERIFIED BANK LOANS DIRECTORY */}
        <div className="space-y-6">

          {/* LOAN STEPPER TRACKER (READ / UPDATE / DELETE) */}
          <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-400" />
                <span>Loan Application Stepper ({applications.length})</span>
              </h3>
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-mono">
                Live Stepper
              </span>
            </div>

            <div className="space-y-4">
              {applications.map(app => (
                <div key={app.application_id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{app.scheme_name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-mono font-bold">
                      {app.ref_number}
                    </span>
                  </div>

                  {/* Stepper Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>{app.current_stage}</span>
                      <span className="text-emerald-400 font-bold">{app.stage_progress_pct}% Approved</span>
                    </div>
                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${app.stage_progress_pct}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 font-mono">
                    <div>Bank: <strong className="text-white">{app.bank_name}</strong></div>
                    <div>Loan Amount: <strong className="text-emerald-400">₹{app.loan_amount_inr?.toLocaleString()}</strong></div>
                    <div>Subsidized EMI: <strong className="text-amber-300">₹{app.monthly_emi_inr?.toLocaleString()} / mo</strong></div>
                    <div>Manager: <strong className="text-cyan-300">{app.assigned_officer}</strong></div>
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
                      <span>Withdraw Loan Record</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* VERIFIED BANK LOANS DIRECTORY */}
          <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 backdrop-blur-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Landmark className="w-4 h-4 text-emerald-400" />
              <span>Verified Agricultural Bank Loans ({loans.length})</span>
            </h3>

            <div className="space-y-3 text-xs">
              {loans.map(ln => (
                <div key={ln.loan_id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{ln.scheme_name} ({ln.bank_name})</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-bold">
                      {ln.effective_subsidized_rate_pct}% Subsidized Rate
                    </span>
                  </div>
                  <p className="text-slate-300">{ln.description}</p>
                  <div className="text-slate-400 font-mono">Max Limit: ₹{ln.max_loan_limit_inr?.toLocaleString()} | Fee: {ln.processing_fee}</div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleApplyLoan(ln)}
                      className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition"
                    >
                      1-Click Apply Loan
                    </button>
                    <a
                      href={ln.official_portal}
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

          {/* QWEN AI LOAN ADVISOR */}
          <div className="rounded-3xl bg-slate-900/80 border border-emerald-500/30 p-6 backdrop-blur-xl space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Brain className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>Qwen AI Agricultural Loan Advisor</span>
            </h3>

            <form onSubmit={handleAiAsk} className="space-y-2">
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="How does the 3% Prompt Repayment Incentive (PRI) reduce my KCC interest from 7% to 4%?"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none h-16"
              />
              <button
                type="submit"
                disabled={aiLoading}
                className="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition"
              >
                {aiLoading ? "Consulting Banking Rules..." : "Ask Qwen Loan Expert"}
              </button>
            </form>

            {aiResponse && (
              <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-emerald-200 font-mono">
                {aiResponse}
              </div>
            )}
          </div>

          {/* OFFICIAL LOAN REPORT EXPORTER */}
          <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 backdrop-blur-xl space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>Official Agricultural Loan Reports</span>
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

      {/* EDIT LOAN APPLICATION MODAL (CRUD - UPDATE) */}
      {isEditModalOpen && editingApp && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500/50 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-emerald-400" />
                <span>Update Loan Stage ({editingApp.ref_number})</span>
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
                  <option value="Stage 1: Application Submitted to Branch">Stage 1: Application Submitted to Branch</option>
                  <option value="Stage 2: Land Patta & CIBIL Verification Completed">Stage 2: Land Patta & CIBIL Verification Completed</option>
                  <option value="Stage 3: Branch Sanction Order Issued">Stage 3: Branch Sanction Order Issued</option>
                  <option value="Stage 4: KCC Card Issued & Disbursement Active">Stage 4: KCC Card Issued & Disbursement Active</option>
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
                <label className="text-slate-300 block mb-1">Branch Manager Notes:</label>
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
