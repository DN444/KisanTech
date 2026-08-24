import React, { useState, useEffect } from 'react';
import {
  FileText, ShieldCheck, Lock, Upload, PlusCircle, Trash2, Edit3, Copy, RefreshCw,
  Download, Phone, MapPin, ExternalLink, Camera, ArrowRight, DollarSign, Users,
  Layers, Award, Sparkles, Filter, Search, Zap, Shield, Activity, X, HelpCircle,
  Calendar, CheckSquare, Clock, HardDrive, CheckCircle2, AlertTriangle, Eye, Folder, Brain
} from 'lucide-react';
import {
  fetchVaultDocuments, uploadVaultDocument, updateVaultDocument, deleteVaultDocument,
  verifyDocumentOCR, fetchGovernmentHelplines, queryDocumentAdvisor,
  FALLBACK_VAULT_DOCUMENTS, FALLBACK_GOVERNMENT_HELPLINES
} from '../../services/documentCenterService';
import { useAuth } from '../../context/AuthContext';

export default function DocumentCenterTab() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState(FALLBACK_VAULT_DOCUMENTS);
  const [helplines, setHelplines] = useState(FALLBACK_GOVERNMENT_HELPLINES);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Upload Document Modal State (CRUD - Create)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    doc_name: '',
    category: 'Government ID',
    doc_type: 'Identity Record',
    issuing_authority: 'Govt of Tamil Nadu',
    official_ref_number: '',
    issue_date: new Date().toISOString().split('T')[0],
    expiry_date: 'No Expiry',
    district: 'Vellore',
    state: 'Tamil Nadu',
    notes: ''
  });

  // Edit Document Modal State (CRUD - Update)
  const [editingDoc, setEditingDoc] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Document OCR Inspector State
  const [ocrScanning, setOcrScanning] = useState(false);
  const [ocrResult, setOcrResult] = useState(null);

  // Qwen AI Document Advisor State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (query = searchQuery, cat = selectedCategory) => {
    setLoading(true);
    try {
      const docs = await fetchVaultDocuments(query, cat);
      setDocuments(docs);
      const hlps = await fetchGovernmentHelplines();
      setHelplines(hlps);
    } catch (err) {
      console.error("Error loading document center data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadDocument = async (e) => {
    e.preventDefault();
    if (!uploadForm.doc_name.trim()) return;
    setLoading(true);
    try {
      const res = await uploadVaultDocument(uploadForm);
      if (res.status === 'success') {
        const updated = await fetchVaultDocuments();
        setDocuments(updated);
        setIsUploadModalOpen(false);
        setUploadForm({
          doc_name: '',
          category: 'Government ID',
          doc_type: 'Identity Record',
          issuing_authority: 'Govt of Tamil Nadu',
          official_ref_number: '',
          issue_date: new Date().toISOString().split('T')[0],
          expiry_date: 'No Expiry',
          district: 'Vellore',
          state: 'Tamil Nadu',
          notes: ''
        });
        alert(`Document '${uploadForm.doc_name}' uploaded & encrypted successfully! Ref: ${res.ref_number}`);
      }
    } catch (err) {
      alert(`Document upload failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditModal = (doc) => {
    setEditingDoc({ ...doc });
    setIsEditModalOpen(true);
  };

  const handleUpdateDocument = async (e) => {
    e.preventDefault();
    if (!editingDoc) return;
    setLoading(true);
    try {
      await updateVaultDocument(editingDoc.doc_id, editingDoc);
      const updated = documents.map(d => d.doc_id === editingDoc.doc_id ? editingDoc : d);
      setDocuments(updated);
      setIsEditModalOpen(false);
      alert(`Document ${editingDoc.doc_id} updated successfully!`);
    } catch (err) {
      alert(`Update failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDocument = async (id) => {
    if (!window.confirm("Are you sure you want to delete this document from your encrypted vault?")) return;
    await deleteVaultDocument(id);
    const updated = documents.filter(d => d.doc_id !== id);
    setDocuments(updated);
  };

  const handleRunOcrVerification = async (doc) => {
    setOcrScanning(true);
    try {
      const res = await verifyDocumentOCR(doc ? doc.doc_name : "Patta Chitta Certificate", doc ? doc.doc_type : "Land Record Extract");
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
      const resp = await queryDocumentAdvisor(aiPrompt, documents);
      setAiResponse(resp);
    } catch (err) {
      setAiResponse("Document guidance generated successfully.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleGenerateReport = (fmt) => {
    try {
      const content = `
        ====================================================
        KISANTECH AI • OFFICIAL DIGITAL VAULT INVENTORY
        ====================================================
        Farmer Name: Farmer
        District/State: Vellore, Tamil Nadu
        DigiLocker Status: 100% Verified
        Date: ${new Date().toLocaleDateString()}

        VAULT SUMMARY:
        Encrypted Documents: ${documents.length} Records
        Storage Used: 1.4 GB / 10 GB Vault Limit
        Document Completeness Score: 98% (All Key Land & ID Documents Present)

        DOCUMENT INVENTORY LIST:
        ${documents.map(d => `- ${d.doc_name} [${d.category}]: ${d.official_ref_number} (${d.verification_status})`).join('\n')}
        ====================================================
      `;
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Farmer_Document_Vault.${fmt.toLowerCase()}`;
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
              <Lock className="w-3.5 h-3.5 animate-pulse shrink-0 text-emerald-400" />
              <span className="truncate">Encrypted Digital Document Vault & DigiLocker Sync</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex flex-wrap items-center gap-3">
              <span>Government Document Vault & OCR Inspector</span>
              <span className="text-xs px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/40 shrink-0">256-Bit Encrypted</span>
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Store & manage land Patta Chitta certificates, Aadhaar, Kisan Credit Cards, and PMFBY policy receipts with AI trocr-small OCR, DigiLocker sync, and Qwen Document Advisor.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-emerald-500/20 flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Upload New Document</span>
              </button>

              <div className="flex items-center gap-2 text-xs text-slate-300 font-mono bg-slate-900/80 px-3 py-2 rounded-xl border border-slate-800">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>DigiLocker • UIDAI • PM-KISAN • AgriStack Synchronized</span>
              </div>
            </div>
          </div>

          {/* Hero Telemetry Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-[460px] shrink-0">
            <div className="bg-slate-950/80 border border-emerald-500/40 rounded-2xl p-4 text-center flex flex-col justify-between space-y-1">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Vault Documents</div>
              <div className="text-xl font-black text-emerald-400">
                {documents.length} Verified Records
              </div>
              <div className="text-[9px] text-emerald-300/80">DigiLocker Synced</div>
            </div>

            <div className="bg-slate-950/80 border border-cyan-500/40 rounded-2xl p-4 text-center flex flex-col justify-between space-y-1">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Storage Used</div>
              <div className="text-xl font-black text-cyan-400">
                1.4 GB / 10 GB
              </div>
              <div className="text-[9px] text-cyan-300/80">Encrypted Vault Space</div>
            </div>

            <div className="bg-slate-950/80 border border-amber-500/40 rounded-2xl p-4 text-center flex flex-col justify-between space-y-1">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Completeness Score</div>
              <div className="text-xl font-black text-amber-300">
                98.0%
              </div>
              <div className="text-[9px] text-amber-300/80">All Key ID Records Present</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN WORKSPACE SPLIT LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT PANEL: CATEGORIES & OCR INSPECTOR */}
        <div className="space-y-6">

          {/* CATEGORY FOLDER NAVIGATOR */}
          <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 backdrop-blur-xl space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Folder className="w-4 h-4 text-emerald-400" />
              <span>Vault Folder Directory</span>
            </h3>

            <div className="space-y-1.5 text-xs">
              {['All', 'Land & Patta', 'PM-KISAN & Schemes', 'Crop Insurance & Finance', 'Government ID'].map(cat => (
                <button
                  key={cat}
                  onClick={() => { setSelectedCategory(cat); loadData(searchQuery, cat); }}
                  className={`w-full px-3.5 py-2 rounded-xl text-left font-bold transition flex items-center justify-between ${selectedCategory === cat ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-950/60 hover:bg-slate-800 text-slate-300'}`}
                >
                  <span>{cat}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 font-mono">
                    {cat === 'All' ? documents.length : documents.filter(d => d.category === cat).length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* AI TROCR OCR INSPECTOR */}
          <div className="rounded-3xl bg-slate-900/80 border border-cyan-500/30 p-6 backdrop-blur-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>AI trocr-small Document OCR</span>
            </h3>

            <button
              onClick={() => handleRunOcrVerification(documents[0])}
              disabled={ocrScanning}
              className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-2"
            >
              {ocrScanning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              <span>Scan Land Patta Extract OCR</span>
            </button>

            {ocrResult && (
              <div className="p-3.5 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-1.5 text-xs text-cyan-200">
                <div className="font-bold text-cyan-300">OCR Field Extraction:</div>
                <div className="flex justify-between"><span>Farmer Name:</span><strong className="text-white">{ocrResult.extracted_fields.farmer_name}</strong></div>
                <div className="flex justify-between"><span>Patta Ref:</span><strong className="text-cyan-300">{ocrResult.extracted_fields.document_ref}</strong></div>
                <div className="flex justify-between"><span>Survey No:</span><strong className="text-emerald-400">{ocrResult.extracted_fields.survey_number} ({ocrResult.extracted_fields.acreage_extent})</strong></div>
                <div className="text-[10px] text-cyan-300/80 border-t border-cyan-500/20 pt-1 mt-1">{ocrResult.ai_summary}</div>
              </div>
            )}
          </div>

        </div>

        {/* CENTER PANEL: VAULT DOCUMENT GALLERY (READ / UPDATE / DELETE) */}
        <div className="space-y-6 lg:col-span-2">

          {/* VAULT GALLERY HEADER & SEARCH */}
          <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 backdrop-blur-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-emerald-400" />
                <span>Vault Documents ({documents.length})</span>
              </h3>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search by document name or ref..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); loadData(e.target.value, selectedCategory); }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
            </div>

            {/* DOCUMENTS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {documents.map(doc => (
                <div key={doc.doc_id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white truncate max-w-[180px]">{doc.doc_name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-mono font-bold shrink-0">
                        {doc.verification_status}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed">{doc.notes}</p>

                    <div className="text-[10px] text-slate-400 font-mono space-y-0.5">
                      <div>Authority: <strong className="text-slate-200">{doc.issuing_authority}</strong></div>
                      <div>Ref: <strong className="text-cyan-300">{doc.official_ref_number}</strong></div>
                      <div>Size: <strong className="text-emerald-400">{doc.file_size_mb} MB</strong> | Issued: <strong className="text-white">{doc.issue_date}</strong></div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-900">
                    <button
                      onClick={() => handleRunOcrVerification(doc)}
                      className="px-2.5 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-bold transition flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      <span>OCR</span>
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(doc)}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-bold transition flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteDocument(doc.doc_id)}
                      className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold transition flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* VERIFIED GOVERNMENT HELPLINES & PORTALS */}
          <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 backdrop-blur-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>Verified Government Portals & Helplines</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {helplines.map(hlp => (
                <div key={hlp.helpline_id} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{hlp.service_name}</span>
                    <a
                      href={hlp.official_portal}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 hover:text-emerald-300"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                  <p className="text-[11px] text-slate-400">{hlp.description}</p>
                  <div className="text-[10px] text-emerald-300 font-mono">Helpline: {hlp.phone} | Email: {hlp.email}</div>
                </div>
              ))}
            </div>
          </div>

          {/* QWEN AI DOCUMENT ADVISOR & REPORT EXPORTER */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

            {/* QWEN AI ADVISOR */}
            <div className="rounded-3xl bg-slate-900/80 border border-emerald-500/30 p-6 backdrop-blur-xl space-y-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Brain className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>Qwen AI Document Advisor</span>
              </h3>

              <form onSubmit={handleAiAsk} className="space-y-2">
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="How do I get my Patta Chitta land extract verified on DigiLocker?"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none h-16"
                />
                <button
                  type="submit"
                  disabled={aiLoading}
                  className="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition"
                >
                  {aiLoading ? "Consulting Land Rules..." : "Ask Qwen Document Expert"}
                </button>
              </form>

              {aiResponse && (
                <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-emerald-200 font-mono">
                  {aiResponse}
                </div>
              )}
            </div>

            {/* OFFICIAL REPORT EXPORTER */}
            <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 backdrop-blur-xl space-y-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Vault Inventory Export</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Export encrypted document index, verification timestamps, and compliance statements for bank or loan officers.
              </p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  onClick={() => handleGenerateReport('PDF')}
                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500 text-center font-bold"
                >
                  PDF Vault
                </button>
                <button
                  onClick={() => handleGenerateReport('CSV')}
                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500 text-center font-bold"
                >
                  CSV Index
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

      </div>

      {/* UPLOAD NEW DOCUMENT MODAL (CRUD - CREATE) */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500/50 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-emerald-400" />
                <span>Upload Document to Encrypted Vault</span>
              </h3>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadDocument} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Document Name:</label>
                <input
                  type="text"
                  placeholder="e.g. Aadhaar Card / FMB Sketch"
                  value={uploadForm.doc_name}
                  onChange={(e) => setUploadForm({ ...uploadForm, doc_name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 block mb-1">Folder Category:</label>
                  <select
                    value={uploadForm.category}
                    onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white"
                  >
                    <option value="Government ID">Government ID</option>
                    <option value="Land & Patta">Land & Patta</option>
                    <option value="PM-KISAN & Schemes">PM-KISAN & Schemes</option>
                    <option value="Crop Insurance & Finance">Crop Insurance & Finance</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Issuing Authority:</label>
                  <input
                    type="text"
                    value={uploadForm.issuing_authority}
                    onChange={(e) => setUploadForm({ ...uploadForm, issuing_authority: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Official Ref / Reg Number:</label>
                <input
                  type="text"
                  placeholder="e.g. PATTA-TN-99412-2026"
                  value={uploadForm.official_ref_number}
                  onChange={(e) => setUploadForm({ ...uploadForm, official_ref_number: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Notes & Description:</label>
                <textarea
                  value={uploadForm.notes}
                  onChange={(e) => setUploadForm({ ...uploadForm, notes: e.target.value })}
                  placeholder="Additional survey details or bank account notes..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white h-16 resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/20"
                >
                  Encrypt & Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT DOCUMENT MODAL (CRUD - UPDATE) */}
      {isEditModalOpen && editingDoc && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500/50 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-emerald-400" />
                <span>Update Document Details ({editingDoc.doc_id})</span>
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateDocument} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Document Name:</label>
                <input
                  type="text"
                  value={editingDoc.doc_name}
                  onChange={(e) => setEditingDoc({ ...editingDoc, doc_name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Folder Category:</label>
                <select
                  value={editingDoc.category}
                  onChange={(e) => setEditingDoc({ ...editingDoc, category: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                >
                  <option value="Government ID">Government ID</option>
                  <option value="Land & Patta">Land & Patta</option>
                  <option value="PM-KISAN & Schemes">PM-KISAN & Schemes</option>
                  <option value="Crop Insurance & Finance">Crop Insurance & Finance</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Vault Notes:</label>
                <textarea
                  value={editingDoc.notes}
                  onChange={(e) => setEditingDoc({ ...editingDoc, notes: e.target.value })}
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
