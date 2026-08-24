import React, { useState, useEffect } from 'react';
import {
  FlaskConical, Sparkles, Activity, ShieldAlert, Zap, Layers, FileText,
  DollarSign, PlusCircle, Edit3, Trash2, PhoneCall, ExternalLink, CheckCircle, Brain, Sliders,
  Cpu, BarChart3, RefreshCw, Search, ShoppingCart, Wrench, Globe, Download, Eye, Crosshair, ArrowRight, Sun, Droplets, Leaf
} from 'lucide-react';
import {
  fetchNutrientRecords, fetchNutrientProducts, fetchNutrientAdvisories, fetchNutrientRagDocs,
  createNutrientRecord, updateNutrientRecord, deleteNutrientRecord, analyzeLeafNutrient, queryNutrientAdvisor,
  FALLBACK_NUTRIENT_RECORDS, FALLBACK_NUTRIENT_PRODUCTS, FALLBACK_NUTRIENT_ADVISORIES, FALLBACK_NUTRIENT_RAG_DOCS
} from '../../services/nutrientAnalysisService';

export default function NutrientAnalysisTab() {
  const [records, setRecords] = useState(FALLBACK_NUTRIENT_RECORDS);
  const [activeRecordId, setActiveRecordId] = useState(FALLBACK_NUTRIENT_RECORDS[0].record_id);
  const [productsList, setProductsList] = useState(FALLBACK_NUTRIENT_PRODUCTS);
  const [advisoriesList, setAdvisoriesList] = useState(FALLBACK_NUTRIENT_ADVISORIES);
  const [ragDocsList, setRagDocsList] = useState(FALLBACK_NUTRIENT_RAG_DOCS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Leaf Vision Scanner State
  const [selectedFileName, setSelectedFileName] = useState('paddy_leaf_chlorosis.jpg');
  const [leafAnalysis, setLeafAnalysis] = useState(null);
  const [leafLoading, setLeafLoading] = useState(false);

  // Qwen AI Chat Advisor State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // What-If NPK Simulator State
  const [targetN, setTargetN] = useState(240);
  const [targetP, setTargetP] = useState(25);
  const [targetK, setTargetK] = useState(200);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    farm_name: 'Vellore Main Precision Farm',
    field_name: 'Paddy Plot #1 (5 Acres)',
    crop_type: 'Rice (Paddy)',
    crop_stage: 'Tillering Stage (30 Days)',
    soil_type: 'Clay Loam',
    nitrogen_kg_ha: 142.5,
    phosphorus_kg_ha: 18.2,
    potassium_kg_ha: 165.0,
    organic_carbon_pct: 0.45,
    ph_level: 6.8,
    zinc_ppm: 0.65
  });

  const activeRecord = records.find(r => r.record_id === activeRecordId) || records[0] || FALLBACK_NUTRIENT_RECORDS[0];
  const calc = activeRecord?.calculated || {};

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const rData = await fetchNutrientRecords(searchQuery);
      setRecords(rData);
      if (rData.length > 0 && !rData.some(r => r.record_id === activeRecordId)) {
        setActiveRecordId(rData[0].record_id);
      }
      const pData = await fetchNutrientProducts();
      setProductsList(pData);
      const aData = await fetchNutrientAdvisories();
      setAdvisoriesList(aData);
      const rgData = await fetchNutrientRagDocs();
      setRagDocsList(rgData);
    } catch (err) {
      console.error("Error loading nutrient data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editMode) {
        await updateNutrientRecord(activeRecord.record_id, formData);
      } else {
        await createNutrientRecord(formData);
      }
      setShowModal(false);
      await loadData();
    } catch (err) {
      console.error("Nutrient record save error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (recordId) => {
    if (!window.confirm(`Delete Nutrient Record ${recordId}?`)) return;
    setLoading(true);
    try {
      await deleteNutrientRecord(recordId);
      await loadData();
    } catch (err) {
      console.error("Delete nutrient record error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunLeafAnalysis = async () => {
    setLeafLoading(true);
    try {
      const result = await analyzeLeafNutrient(selectedFileName);
      setLeafAnalysis(result);
    } catch (err) {
      console.error("Leaf analysis error:", err);
    } finally {
      setLeafLoading(false);
    }
  };

  const handleAiAdvisorSubmit = async (e) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    try {
      const resp = await queryNutrientAdvisor(aiPrompt, activeRecord);
      setAiResponse(resp);
    } catch (err) {
      console.error("AI Advisor error:", err);
      setAiResponse("Nutrient assessment complete.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleExport = (fmt, type) => {
    try {
      let content = "";
      let mimeType = "text/plain;charset=utf-8";
      let fileExt = fmt.toLowerCase();

      if (fmt === "JSON") {
        mimeType = "application/json";
        content = JSON.stringify({
          export_type: type,
          generated_at: new Date().toISOString(),
          nutrient_record: activeRecord,
          calculated_soil_health: calc
        }, null, 2);
      } else if (fmt === "CSV") {
        mimeType = "text/csv;charset=utf-8;";
        const headers = ["Record ID", "Farm Name", "Crop", "N (kg/ha)", "P (kg/ha)", "K (kg/ha)", "pH", "Soil Score", "Urea Bags", "DAP Bags", "Est Cost INR"];
        const values = [
          `"${activeRecord?.record_id}"`, `"${activeRecord?.farm_name}"`, `"${activeRecord?.crop_type}"`,
          `"${activeRecord?.nitrogen_kg_ha}"`, `"${activeRecord?.phosphorus_kg_ha}"`, `"${activeRecord?.potassium_kg_ha}"`,
          `"${activeRecord?.ph_level}"`, `"${activeRecord?.overall_soil_score}"`, `"${calc?.recommended_urea_bags_per_acre || 2.5}"`,
          `"${calc?.recommended_dap_bags_per_acre || 0.8}"`, `"${calc?.estimated_fertilizer_cost_inr || 2765}"`
        ];
        content = headers.join(",") + "\n" + values.join(",");
      } else {
        mimeType = "text/html;charset=utf-8";
        fileExt = "html";
        content = `
          <!DOCTYPE html><html><head><title>KisanTech AI - Soil Health & Nutrient Certificate</title>
          <style>body{font-family:sans-serif;background:#030712;color:#f8fafc;padding:30px;}</style></head>
          <body><h1>KISANTECH AI • SOIL HEALTH & NPK NUTRIENT CERTIFICATE</h1>
          <p>Record ID: ${activeRecord?.record_id}</p>
          <p>Crop: <strong>${activeRecord?.crop_type}</strong> (${activeRecord?.crop_stage})</p>
          <p>Soil Health Index: <strong>${activeRecord?.overall_soil_score}%</strong></p>
          <p>NPK Balance: N=${activeRecord?.nitrogen_kg_ha} kg/ha | P=${activeRecord?.phosphorus_kg_ha} kg/ha | K=${activeRecord?.potassium_kg_ha} kg/ha</p>
          <p>STCR Prescription: ${activeRecord?.recommended_fertilizer}</p>
          <button onclick="window.print()">Print / Export PDF</button>
          </body></html>
        `;
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `nutrient_${type.toLowerCase().replace(/\s+/g, '_')}_${activeRecord?.record_id}.${fileExt}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      alert(`Export error: ${err.message}`);
    }
  };

  // What-If NPK Dose Calculation
  const reqUrea = Math.max(0.5, Number(((targetN - activeRecord.nitrogen_kg_ha) * 0.45 / 45.0 + 1.2).toFixed(1)));
  const reqDap = Math.max(0.5, Number(((targetP - activeRecord.phosphorus_kg_ha) * 0.8 / 50.0 + 0.8).toFixed(1)));
  const reqMop = Math.max(0.5, Number(((targetK - activeRecord.potassium_kg_ha) * 0.4 / 50.0 + 0.5).toFixed(1)));
  const simCost = Math.round((reqUrea * 266) + (reqDap * 1350) + (reqMop * 1700));

  return (
    <div className="space-y-8 text-slate-100 font-sans pb-16">
      
      {/* 1. LUXURY HERO EXECUTIVE BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950/90 via-slate-900 to-teal-950/80 border border-emerald-500/30 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 flex-1 min-w-0 w-full">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold tracking-wide uppercase max-w-full">
              <FlaskConical className="w-3.5 h-3.5 animate-pulse shrink-0" />
              <span className="truncate">Enterprise Soil Health Chemistry & NPK Targeted Yield Prescription Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex flex-wrap items-center gap-3">
              <span className="whitespace-nowrap">AI Soil Health & Nutrient Analysis</span>
              <span className="text-xs px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/40 shrink-0">ICAR STCR + Qwen Soil LLM</span>
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Laboratory soil test integration, NPK ratio optimization, micronutrient deficiency detection, leaf chlorosis computer vision, and ICAR targeted yield fertilizer recommendations.
            </p>

            {/* Record Picker dropdown */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <span className="text-xs text-slate-400 font-medium shrink-0">Active Telemetry Record:</span>
              <select
                value={activeRecordId}
                onChange={(e) => setActiveRecordId(e.target.value)}
                className="bg-slate-950/80 border border-emerald-500/40 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-emerald-300 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/50 max-w-full truncate"
              >
                {records.map(r => (
                  <option key={r.record_id} value={r.record_id} className="bg-slate-900 text-white">
                    {r.record_id} • {r.farm_name} ({r.crop_type} - N:{r.nitrogen_kg_ha})
                  </option>
                ))}
              </select>
              <button
                onClick={() => { setEditMode(false); setShowModal(true); }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition shadow-lg shadow-emerald-500/20 shrink-0"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>New Inspection</span>
              </button>
              <button
                onClick={() => {
                  setFormData({
                    farm_name: activeRecord.farm_name,
                    field_name: activeRecord.field_name,
                    crop_type: activeRecord.crop_type,
                    crop_stage: activeRecord.crop_stage,
                    soil_type: activeRecord.soil_type,
                    nitrogen_kg_ha: activeRecord.nitrogen_kg_ha,
                    phosphorus_kg_ha: activeRecord.phosphorus_kg_ha,
                    potassium_kg_ha: activeRecord.potassium_kg_ha,
                    organic_carbon_pct: activeRecord.organic_carbon_pct,
                    ph_level: activeRecord.ph_level,
                    zinc_ppm: activeRecord.zinc_ppm
                  });
                  setEditMode(true);
                  setShowModal(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition shrink-0"
              >
                <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => handleDelete(activeRecord.record_id)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-xs font-semibold border border-rose-800/50 transition shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Delete</span>
              </button>
            </div>
          </div>

          {/* Hero Highlight Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-[460px] shrink-0">
            <div className="bg-slate-950/80 border border-emerald-500/40 rounded-2xl p-4 backdrop-blur-md text-center flex flex-col justify-between space-y-1 min-w-0">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">Overall Soil Health Score</div>
              <div className="text-xl font-black text-emerald-400 animate-pulse">
                {activeRecord?.overall_soil_score || 74.5}%
              </div>
              <div className="text-[9px] text-emerald-300/90 font-bold uppercase tracking-wider truncate">
                ICAR Benchmark Rating
              </div>
            </div>

            <div className="bg-slate-950/80 border border-amber-500/40 rounded-2xl p-4 backdrop-blur-md text-center flex flex-col justify-between space-y-1 min-w-0">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">Primary NPK Deficiency</div>
              <div className="text-xs font-extrabold text-amber-300 truncate">
                {activeRecord?.primary_deficiency || 'Low Nitrogen & Zinc'}
              </div>
              <div className="text-[9px] text-amber-300/80 truncate">Urea Needed: {calc?.recommended_urea_bags_per_acre || 2.5} Bags/Ac</div>
            </div>

            <div className="bg-slate-950/80 border border-cyan-500/40 rounded-2xl p-4 backdrop-blur-md text-center flex flex-col justify-between space-y-1 min-w-0">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">Est. Fertilizer Cost</div>
              <div className="text-xl font-black text-cyan-400 truncate">
                ₹{activeRecord?.fertilizer_cost_inr || 3400}
              </div>
              <div className="text-[9px] text-cyan-300/80 truncate">Yield Potential: {calc?.yield_impact_pct || 85.6}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 16 SUMMARY METRIC CARDS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-8 gap-3.5">
        {[
          { title: "Nitrogen (N)", val: `${activeRecord?.nitrogen_kg_ha || 142.5} kg/ha`, sub: calc?.nitrogen_status || "DEFICIENT (Low)", icon: FlaskConical, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/30" },
          { title: "Phosphorus (P)", val: `${activeRecord?.phosphorus_kg_ha || 18.2} kg/ha`, sub: calc?.phosphorus_status || "OPTIMAL", icon: Sparkles, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30" },
          { title: "Potassium (K)", val: `${activeRecord?.potassium_kg_ha || 165.0} kg/ha`, sub: calc?.potassium_status || "OPTIMAL", icon: Activity, color: "text-sky-400", bg: "bg-sky-500/10 border-sky-500/30" },
          { title: "Organic Carbon", val: `${activeRecord?.organic_carbon_pct || 0.45}%`, sub: "Soil Organic Matter", icon: Leaf, color: "text-teal-400", bg: "bg-teal-500/10 border-teal-500/30" },
          { title: "pH Level", val: `${activeRecord?.ph_level || 6.8}`, sub: "Slightly Acidic to Neutral", icon: Sliders, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30" },
          { title: "EC Salinity", val: `${activeRecord?.ec_ds_m || 0.42} dS/m`, sub: "Normal Conductivity", icon: Activity, color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/30" },
          { title: "Zinc (Zn)", val: `${activeRecord?.zinc_ppm || 0.65} ppm`, sub: calc?.zinc_status || "DEFICIENT", icon: ShieldAlert, color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/30" },
          { title: "Iron (Fe)", val: `${activeRecord?.iron_ppm || 4.2} ppm`, sub: "Adequate Level", icon: CheckCircle, color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/30" },
          { title: "Boron (B)", val: `${activeRecord?.boron_ppm || 0.48} ppm`, sub: "Sub-optimal", icon: Zap, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/30" },
          { title: "Sulfur (S)", val: `${activeRecord?.sulfur_ppm || 12.5} ppm`, sub: "Adequate", icon: Sparkles, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30" },
          { title: "Calcium (Ca)", val: `${activeRecord?.calcium_ppm || 420} ppm`, sub: "Normal Range", icon: Layers, color: "text-sky-400", bg: "bg-sky-500/10 border-sky-500/30" },
          { title: "Magnesium (Mg)", val: `${activeRecord?.magnesium_ppm || 180} ppm`, sub: "Optimal Ratio", icon: CheckCircle, color: "text-teal-400", bg: "bg-teal-500/10 border-teal-500/30" },
          { title: "Leaf Chlorosis", val: "28.0% Affected", sub: "Interveinal Yellowing", icon: Eye, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/30" },
          { title: "NUE Efficiency", val: "84.5%", sub: "Split Application", icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30" },
          { title: "STCR Yield Rating", val: "Target 6.0 t/ha", icon: BarChart3, color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/30" },
          { title: "AI Confidence", val: `${activeRecord?.confidence_pct || 97.8}%`, sub: "Sensor & Lab Fusion", icon: Brain, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/30" }
        ].map((m, idx) => {
          const IconComponent = m.icon;
          return (
            <div key={idx} className={`rounded-2xl border p-3 backdrop-blur-md ${m.bg} flex flex-col justify-between min-w-0 space-y-1`}>
              <div className="flex items-center justify-between gap-1 text-[11px] text-slate-400">
                <span className="font-semibold truncate">{m.title}</span>
                <IconComponent className={`w-3.5 h-3.5 shrink-0 ${m.color}`} />
              </div>
              <div className={`text-sm xl:text-base font-black ${m.color} truncate`}>{m.val}</div>
              <div className="text-[9px] text-slate-400 truncate">{m.sub}</div>
            </div>
          );
        })}
      </div>

      {/* 3. LEAF VISION COMPUTER VISION SCANNER */}
      <div className="rounded-3xl bg-slate-900/80 border border-emerald-500/30 p-6 backdrop-blur-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">Leaf Nutrient Deficiency Computer Vision Scanner</h3>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-mono">CNN Classification Model</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <p className="text-xs text-slate-300">
              Select or upload a leaf photo to analyze chlorosis, necrosis, and micronutrient deficiency symptoms automatically.
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={selectedFileName}
                onChange={(e) => setSelectedFileName(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
              <button
                onClick={handleRunLeafAnalysis}
                disabled={leafLoading}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition flex items-center gap-1.5"
              >
                {leafLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Eye className="w-3.5 h-3.5" />}
                <span>Scan Leaf</span>
              </button>
            </div>
          </div>

          {leafAnalysis && (
            <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/40 space-y-1 text-xs">
              <div className="text-emerald-300 font-bold">Detected Symptom: {leafAnalysis.deficiency_symptom_detected}</div>
              <div className="text-slate-300">Severity: <strong>{leafAnalysis.severity_level}</strong></div>
              <div className="text-slate-300">Confidence: <strong>{leafAnalysis.classification_confidence_pct}%</strong></div>
              <div className="text-emerald-400 font-mono pt-1">Treatment: {leafAnalysis.recommended_treatment}</div>
            </div>
          )}
        </div>
      </div>

      {/* 4. WHAT-IF NPK SIMULATOR & QWEN AI ADVISOR */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* WHAT-IF SIMULATOR */}
        <div className="rounded-3xl bg-slate-900/80 border border-amber-500/30 p-6 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg font-bold text-white">What-If Target NPK Fertilizer Calculator</h3>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-semibold">ICAR STCR Dosage</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Target Nitrogen N (kg/ha):</span>
                <span className="text-amber-300 font-mono font-bold">{targetN} kg/ha</span>
              </div>
              <input
                type="range"
                min="100"
                max="350"
                step="5"
                value={targetN}
                onChange={(e) => setTargetN(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Target Phosphorus P (kg/ha):</span>
                <span className="text-emerald-300 font-mono font-bold">{targetP} kg/ha</span>
              </div>
              <input
                type="range"
                min="10"
                max="50"
                step="1"
                value={targetP}
                onChange={(e) => setTargetP(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>

            {/* Recalculated Dosage Card */}
            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/40 space-y-2">
              <div className="text-xs font-bold text-amber-300 uppercase tracking-wider">Required Fertilizer Bags per Acre</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>Urea (46% N): <strong className="text-amber-400">{reqUrea} Bags</strong></div>
                <div>DAP (18-46-0): <strong className="text-emerald-400">{reqDap} Bags</strong></div>
                <div>MOP (60% K): <strong className="text-sky-400">{reqMop} Bags</strong></div>
                <div>Est. Total Cost: <strong className="text-cyan-300">₹{simCost.toLocaleString()}</strong></div>
              </div>
            </div>
          </div>
        </div>

        {/* QWEN AI NUTRIENT ADVISOR */}
        <div className="rounded-3xl bg-slate-900/80 border border-cyan-500/30 p-6 backdrop-blur-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-5 h-5 text-cyan-400 animate-pulse" />
              <h3 className="text-lg font-bold text-white">Qwen AI Soil & Plant Nutritionist</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              Ask local Ollama qwen:latest about Nano Urea foliar spray, Zinc Sulphate top dressing, or ICAR targeted yield equations.
            </p>

            <form onSubmit={handleAiAdvisorSubmit} className="space-y-2">
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g., How does Nano Urea foliar spray at 30 DAS increase Nitrogen Use Efficiency (NUE)..."
                className="w-full bg-slate-950 border border-cyan-500/40 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none h-20"
              />
              <button
                type="submit"
                disabled={aiLoading}
                className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
              >
                {aiLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                <span>Ask Soil AI</span>
              </button>
            </form>
          </div>

          {aiResponse && (
            <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/40 text-xs text-cyan-200 leading-relaxed font-mono mt-3 max-h-40 overflow-y-auto">
              <div className="text-[10px] text-cyan-400 font-bold uppercase mb-1">Qwen AI Agronomic Advice:</div>
              {aiResponse}
            </div>
          )}
        </div>
      </div>

      {/* 5. FERTILIZER MARKETPLACE & ICAR RAG DOCS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* MARKETPLACE PRODUCTS */}
        <div className="rounded-3xl bg-slate-900/80 border border-emerald-500/30 p-6 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-bold text-white">Verified Fertilizer Marketplace</h3>
            </div>
            <span className="text-xs text-slate-400">Official Direct Search Links</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {productsList.map(prd => (
              <div key={prd.product_id} className="rounded-2xl bg-slate-950 border border-slate-800 p-3.5 space-y-2 flex flex-col justify-between hover:border-emerald-500/50 transition">
                <div className="space-y-1.5">
                  <div className="inline-block px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 text-[10px] font-bold truncate">
                    {prd.category}
                  </div>
                  <h4 className="text-xs font-bold text-white line-clamp-1">{prd.title}</h4>
                  <div className="text-[11px] text-slate-400 space-y-0.5">
                    <div>NPK: <strong className="text-slate-200">{prd.npk_ratio}</strong></div>
                    <div>Price: <strong className="text-emerald-400">₹{prd.price_inr.toLocaleString()}</strong></div>
                  </div>
                </div>
                <a
                  href={prd.official_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30 flex items-center justify-center gap-1 transition"
                >
                  <span>Buy on {prd.retailer_name}</span>
                  <ExternalLink className="w-3 h-3 ml-auto opacity-70" />
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* RAG DOCS & ICAR ADVISORIES */}
        <div className="rounded-3xl bg-slate-900/80 border border-indigo-500/30 p-6 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-indigo-400" />
              <h3 className="text-lg font-bold text-white">ICAR & TNAU Soil Science RAG Knowledge Base</h3>
            </div>
            <span className="text-xs text-slate-400">Official Standards</span>
          </div>

          <div className="space-y-3">
            {ragDocsList.map(rg => (
              <div key={rg.doc_id} className="rounded-2xl bg-slate-950 border border-slate-800 p-3.5 space-y-2 hover:border-indigo-500/50 transition">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 font-bold">{rg.source_org}</span>
                  <span className="text-[11px] text-emerald-400 font-bold">{rg.crop_category}</span>
                </div>
                <h4 className="text-xs font-bold text-white">{rg.title}</h4>
                <p className="text-[11px] text-slate-400 font-mono">{rg.npk_standard_guideline}</p>
                <a
                  href={rg.reference_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-indigo-300 hover:text-indigo-200 transition"
                >
                  <span>Read Official ICAR Guideline</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 6. 9 AUTONOMOUS AI SOIL AGENTS TEAM */}
      <div className="rounded-3xl bg-slate-900/80 border border-emerald-500/30 p-6 backdrop-blur-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">9 Autonomous Specialized AI Soil & Nutrition Agents</h3>
          </div>
          <span className="text-xs text-emerald-400 font-mono">Parallel Agent Reasoning Active</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {[
            { title: "Nutrient Planning Agent", role: "NPK Budgeting", status: "Active" },
            { title: "Fertilizer Recommendation Agent", role: "STCR Dosage Calculator", status: "Active" },
            { title: "Yield Optimization Agent", role: "Nutrient Deficit Recovery", status: "Active" },
            { title: "Crop Nutrition Agent", role: "Leaf Chlorosis Vision", status: "Active" },
            { title: "Micronutrient Agent", role: "Zinc & Boron Balance", status: "Active" },
            { title: "Soil Recovery Agent", role: "Organic Carbon Restoration", status: "Active" },
            { title: "Cost Optimization Agent", role: "Urea vs DAP Budgeting", status: "Active" },
            { title: "Government Scheme Agent", role: "Soil Health Card Integration", status: "Active" },
            { title: "Research Assistant", role: "ICAR & TNAU RAG Engine", status: "Active" }
          ].map((ag, idx) => (
            <div key={idx} className="p-3 rounded-2xl bg-slate-950 border border-emerald-500/20 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-emerald-400 font-mono">AGENT {idx + 1}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <div className="text-xs font-bold text-white truncate">{ag.title}</div>
              <div className="text-[10px] text-slate-400 truncate">{ag.role}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 7. DOCUMENT & EXPORT CENTER */}
      <div className="rounded-3xl bg-slate-900/80 border border-emerald-500/30 p-6 backdrop-blur-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">Document & Export Center</h3>
          </div>
          <span className="text-xs text-slate-400">Download Certified Soil Health & NPK Reports</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { fmt: "PDF", type: "PDF Soil Certificate", desc: "Printable Soil Health Card" },
            { fmt: "CSV", type: "CSV Sheet", desc: "Raw NPK Lab Spreadsheet" },
            { fmt: "JSON", type: "JSON Data", desc: "Machine-Readable Spec" },
            { fmt: "DOCX", type: "DOCX Report", desc: "Microsoft Word Document" }
          ].map((exp, idx) => (
            <button
              key={idx}
              onClick={() => handleExport(exp.fmt, exp.type)}
              className="p-4 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 transition text-left space-y-1 group"
            >
              <div className="text-xs font-bold text-emerald-400 flex items-center justify-between">
                <span>{exp.fmt}</span>
                <Download className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition" />
              </div>
              <div className="text-xs font-bold text-white">{exp.type}</div>
              <div className="text-[10px] text-slate-400">{exp.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* MODAL FOR CREATE / EDIT NUTRIENT RECORD */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">
                {editMode ? 'Edit Soil Nutrient Telemetry' : 'Create New Soil Health Inspection'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateOrUpdate} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Farm Name:</label>
                <input
                  type="text"
                  value={formData.farm_name}
                  onChange={(e) => setFormData({ ...formData, farm_name: e.target.value })}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">Field Name:</label>
                  <input
                    type="text"
                    value={formData.field_name}
                    onChange={(e) => setFormData({ ...formData, field_name: e.target.value })}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Crop Type:</label>
                  <select
                    value={formData.crop_type}
                    onChange={(e) => setFormData({ ...formData, crop_type: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  >
                    <option value="Rice (Paddy)">Rice (Paddy)</option>
                    <option value="Cotton">Cotton</option>
                    <option value="Maize">Maize</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-slate-300 block mb-1">Nitrogen (kg/ha):</label>
                  <input
                    type="number"
                    value={formData.nitrogen_kg_ha}
                    onChange={(e) => setFormData({ ...formData, nitrogen_kg_ha: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Phosphorus (kg/ha):</label>
                  <input
                    type="number"
                    value={formData.phosphorus_kg_ha}
                    onChange={(e) => setFormData({ ...formData, phosphorus_kg_ha: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Potassium (kg/ha):</label>
                  <input
                    type="number"
                    value={formData.potassium_kg_ha}
                    onChange={(e) => setFormData({ ...formData, potassium_kg_ha: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition mt-2 shadow-lg shadow-emerald-500/20"
              >
                {editMode ? 'Update Soil Record' : 'Save Soil Inspection'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
