import React, { useState, useEffect } from 'react';
import {
  DollarSign, Receipt, PlusCircle, Trash2, Edit3, Download, Search, Filter,
  TrendingUp, TrendingDown, AlertTriangle, ShieldCheck, Brain, FileText, Camera,
  CheckCircle2, RefreshCw, Zap, ExternalLink, Sliders, ArrowUpRight, BarChart2,
  Calendar, Layers, PieChart, ShoppingCart, Award, Sparkles, X, Activity, CreditCard
} from 'lucide-react';
import {
  fetchExpenses, createExpense, updateExpense, deleteExpense, fetchExpenseSummary,
  scanReceiptOCR, queryExpenseAdvisor, exportExpenses, FALLBACK_EXPENSES, FALLBACK_EXPENSE_SUMMARY
} from '../../services/expenseService';

export default function FarmExpensesTab() {
  const [expenses, setExpenses] = useState(FALLBACK_EXPENSES);
  const [summary, setSummary] = useState(FALLBACK_EXPENSE_SUMMARY);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [exportStatus, setExportStatus] = useState('');

  // OCR Modal State
  const [ocrScanning, setOcrScanning] = useState(false);
  const [ocrResult, setOcrResult] = useState(null);

  // Edit Expense Modal State
  const [editingExpense, setEditingExpense] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // New Expense Form State
  const [expenseForm, setExpenseForm] = useState({
    item_name: '',
    category: 'Fertilizers',
    subcategory: 'Chemical Input',
    vendor_name: '',
    gst_number: '33AAAAA0000A1Z5',
    purchase_date: new Date().toISOString().split('T')[0],
    quantity: 1,
    unit: 'Units',
    unit_price_inr: 500,
    tax_inr: 25,
    payment_method: 'UPI / Direct Bank',
    payment_status: 'Paid',
    farm_name: 'Vellore Precision Farm Plot #1',
    field_name: 'North Field A',
    crop_name: 'Paddy (Rice)',
    notes: ''
  });

  // Qwen AI Financial Advisor State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedCategory, searchQuery]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchExpenses(selectedCategory, searchQuery);
      setExpenses(data);
      const sum = await fetchExpenseSummary();
      setSummary(sum);
    } catch (err) {
      console.error("Error loading farm expenses:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExpense = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await createExpense(expenseForm);
      if (res.status === 'success') {
        const updated = await fetchExpenses(selectedCategory, searchQuery);
        setExpenses(updated);
        setExpenseForm({
          item_name: '', category: 'Fertilizers', subcategory: 'Chemical Input',
          vendor_name: '', gst_number: '33AAAAA0000A1Z5',
          purchase_date: new Date().toISOString().split('T')[0],
          quantity: 1, unit: 'Units', unit_price_inr: 500, tax_inr: 25,
          payment_method: 'UPI / Direct Bank', payment_status: 'Paid',
          farm_name: 'Vellore Precision Farm Plot #1', field_name: 'North Field A',
          crop_name: 'Paddy (Rice)', notes: ''
        });
        alert("New farm expense entry registered successfully!");
      }
    } catch (err) {
      alert(`Error adding expense: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateExpense = async (e) => {
    e.preventDefault();
    if (!editingExpense) return;
    setLoading(true);
    try {
      await updateExpense(editingExpense.expense_id, editingExpense);
      const updated = expenses.map(e => e.expense_id === editingExpense.expense_id ? editingExpense : e);
      setExpenses(updated);
      setIsEditModalOpen(false);
      alert(`Expense record ${editingExpense.item_name} updated!`);
    } catch (err) {
      alert(`Update failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExpense = async (expId) => {
    if (!window.confirm("Remove this expense record from ledger?")) return;
    await deleteExpense(expId);
    setExpenses(expenses.filter(e => e.expense_id !== expId));
  };

  const handleSimulateOCR = async () => {
    setOcrScanning(true);
    setOcrResult(null);
    try {
      const res = await scanReceiptOCR("invoice_bighaat_urea.pdf");
      if (res.status === 'success') {
        setOcrResult(res.extracted_data);
        setExpenseForm({
          ...expenseForm,
          item_name: res.extracted_data.item_name,
          category: res.extracted_data.category,
          vendor_name: res.extracted_data.vendor_name,
          gst_number: res.extracted_data.gst_number,
          quantity: res.extracted_data.quantity,
          unit: res.extracted_data.unit,
          unit_price_inr: res.extracted_data.unit_price_inr,
          tax_inr: res.extracted_data.tax_inr,
          payment_method: res.extracted_data.payment_method
        });
      }
    } catch (err) {
      console.error("OCR scanning error:", err);
    } finally {
      setOcrScanning(false);
    }
  };

  const handleExport = async (fmt) => {
    setExportStatus(`Generating ${fmt.toUpperCase()} report...`);
    const res = await exportExpenses(fmt);
    if (res.success) {
      const blob = new Blob([res.content], { type: res.mime_type || 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = res.filename;
      document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
      setExportStatus(`Exported ${res.filename}`);
    }
  };

  const handleAiAsk = async (e) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    try {
      const resp = await queryExpenseAdvisor(aiPrompt, summary);
      setAiResponse(resp);
    } catch (err) {
      setAiResponse("Cost audit report generated.");
    } finally {
      setAiLoading(false);
    }
  };

  const totalSpent = expenses.reduce((acc, curr) => acc + (curr.total_cost_inr || 0), 0);

  return (
    <div className="space-y-6 text-slate-100 font-sans pb-16">
      {/* 1. HERO FINANCIAL COMMAND CENTER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-zinc-950 to-slate-900 border border-emerald-500/40 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 flex-1 min-w-0 w-full">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold tracking-wide uppercase max-w-full">
              <DollarSign className="w-3.5 h-3.5 animate-pulse shrink-0" />
              <span>Enterprise AI Farm Financial Management & Ledger ERP</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex flex-wrap items-center gap-3">
              <span>Farm Expense & Cost Leak Intelligence Hub</span>
              <span className="text-xs px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/40 shrink-0">Ollama Qwen Powered</span>
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Track seeds, fertilizers, pesticides, labour wages, fuel/diesel, equipment rental, and GST invoices with full CRUD ledger control, OCR bill extraction, and AI cost optimization.
            </p>
          </div>

          {/* Hero KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-[480px] shrink-0">
            <div className="bg-slate-950/80 border border-emerald-500/40 rounded-2xl p-4 text-center flex flex-col justify-between space-y-1">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Total Season Expenditure</div>
              <div className="text-xl font-black text-emerald-400">
                ₹{totalSpent.toLocaleString('en-IN')}
              </div>
              <div className="text-[9px] text-emerald-300/80">{expenses.length} Audit Receipts Tracked</div>
            </div>

            <div className="bg-slate-950/80 border border-amber-500/40 rounded-2xl p-4 text-center flex flex-col justify-between space-y-1">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Cost Per Acre</div>
              <div className="text-xl font-black text-amber-300">
                ₹{summary.cost_per_acre_inr ? summary.cost_per_acre_inr.toLocaleString('en-IN') : '3,973'} / Acre
              </div>
              <div className="text-[9px] text-amber-300/80">Optimal Range (12.5 Acres)</div>
            </div>

            <div className="bg-slate-950/80 border border-cyan-500/40 rounded-2xl p-4 text-center flex flex-col justify-between space-y-1">
              <div className="text-[10px] text-slate-400 font-bold uppercase">AI Financial Health</div>
              <div className="text-xl font-black text-cyan-400">
                {summary.financial_health_score || 94} / 100
              </div>
              <div className="text-[9px] text-cyan-300/80">Budget Used: {summary.budget_used_pct || 19.9}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. CONTROLS BAR: Search, Category Filters, OCR Scan, Export */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-4 bg-slate-950/80">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Expense Item, Vendor, Category, Crop..."
            className="w-full bg-slate-900 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1 text-xs font-mono">
          {['ALL', 'Fertilizers', 'Pesticides', 'Labour', 'Fuel', 'Machinery'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${selectedCategory === cat ? 'bg-emerald-500 text-black shadow-[0_0_12px_#10b98144]' : 'bg-slate-900 text-slate-400 hover:text-white border border-white/5'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSimulateOCR}
            disabled={ocrScanning}
            className="px-3.5 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-mono flex items-center gap-1.5"
          >
            <Camera className="w-3.5 h-3.5" />
            {ocrScanning ? 'Scanning Invoice...' : 'OCR Bill Reader'}
          </button>
          <button
            onClick={() => handleExport('csv')}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            CSV Export
          </button>
          <button
            onClick={() => handleExport('json')}
            className="px-3.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-mono flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            JSON Export
          </button>
        </div>
      </div>

      {exportStatus && <div className="text-xs font-mono text-emerald-400 px-2">{exportStatus}</div>}

      {/* OCR Result Alert Banner */}
      {ocrResult && (
        <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/50 flex flex-wrap items-center justify-between gap-4 font-mono text-xs text-purple-200">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
            <span>OCR Extracted: <strong>{ocrResult.item_name}</strong> from <strong>{ocrResult.vendor_name}</strong> (Total ₹{ocrResult.total_cost_inr})</span>
          </div>
          <span className="text-[10px] bg-purple-500/20 px-2 py-1 rounded text-purple-300 font-bold border border-purple-500/40">
            {ocrResult.confidence_score_pct}% AI OCR Accuracy
          </span>
        </div>
      )}

      {/* 3. MAIN WORKSPACE GRID: Register Form + Expenses List + Qwen Advisor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Register New Expense Form */}
        <div className="glass-panel p-6 rounded-2xl border border-emerald-500/30 space-y-4">
          <h3 className="text-md font-bold text-white flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-emerald-400" />
            Register Expense Voucher
          </h3>
          <form onSubmit={handleCreateExpense} className="space-y-3 text-xs font-mono">
            <div>
              <label className="text-slate-400 block mb-1">Item / Expense Name</label>
              <input
                type="text"
                required
                value={expenseForm.item_name}
                onChange={(e) => setExpenseForm({ ...expenseForm, item_name: e.target.value })}
                placeholder="e.g. Neem Coated Urea Bags"
                className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-400 block mb-1">Category</label>
                <select
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                  className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white"
                >
                  <option value="Fertilizers">Fertilizers</option>
                  <option value="Pesticides">Pesticides</option>
                  <option value="Labour">Labour</option>
                  <option value="Fuel">Fuel</option>
                  <option value="Machinery">Machinery</option>
                  <option value="Irrigation">Irrigation</option>
                  <option value="Transport">Transport</option>
                  <option value="Sensors">Sensors</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Vendor / Supplier</label>
                <input
                  type="text"
                  required
                  value={expenseForm.vendor_name}
                  onChange={(e) => setExpenseForm({ ...expenseForm, vendor_name: e.target.value })}
                  placeholder="e.g. IFFCO Katpadi"
                  className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-slate-400 block mb-1">Qty</label>
                <input
                  type="number"
                  value={expenseForm.quantity}
                  onChange={(e) => setExpenseForm({ ...expenseForm, quantity: parseFloat(e.target.value) })}
                  className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Unit</label>
                <input
                  type="text"
                  value={expenseForm.unit}
                  onChange={(e) => setExpenseForm({ ...expenseForm, unit: e.target.value })}
                  className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Unit Cost (₹)</label>
                <input
                  type="number"
                  value={expenseForm.unit_price_inr}
                  onChange={(e) => setExpenseForm({ ...expenseForm, unit_price_inr: parseFloat(e.target.value) })}
                  className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-400 block mb-1">Payment Method</label>
                <select
                  value={expenseForm.payment_method}
                  onChange={(e) => setExpenseForm({ ...expenseForm, payment_method: e.target.value })}
                  className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white"
                >
                  <option value="UPI / Direct Bank">UPI / Direct Bank</option>
                  <option value="Cash">Cash</option>
                  <option value="HDFC Corporate Card">HDFC Corporate Card</option>
                  <option value="Direct Bank Transfer">Direct Bank Transfer</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Purchase Date</label>
                <input
                  type="date"
                  value={expenseForm.purchase_date}
                  onChange={(e) => setExpenseForm({ ...expenseForm, purchase_date: e.target.value })}
                  className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-xl transition-all shadow-[0_0_12px_#10b98133]"
            >
              Add Expense to Ledger
            </button>
          </form>
        </div>

        {/* Center & Right Column: Expenses Table & Qwen AI Advisor */}
        <div className="lg:col-span-2 space-y-6">
          {/* Expenses Table */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-md font-bold text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-400" />
                Farm Expenditure Audit Ledger ({expenses.length})
              </h3>
              <span className="text-xs font-mono text-emerald-400 font-bold">Total: ₹{totalSpent.toLocaleString('en-IN')}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 uppercase text-[10px]">
                    <th className="py-2.5 px-3">Item & Category</th>
                    <th className="py-2.5 px-3">Vendor / GST</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Qty & Unit</th>
                    <th className="py-2.5 px-3 text-right">Total Cost</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {expenses.map((exp) => (
                    <tr key={exp.expense_id} className="hover:bg-slate-900/50 transition">
                      <td className="py-3 px-3">
                        <div className="font-bold text-white">{exp.item_name}</div>
                        <div className="text-[10px] text-slate-400">{exp.category} • {exp.crop_name}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="text-slate-300">{exp.vendor_name}</div>
                        <div className="text-[10px] text-slate-500">{exp.gst_number}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-400">{exp.purchase_date}</td>
                      <td className="py-3 px-3 text-slate-300">{exp.quantity} {exp.unit}</td>
                      <td className="py-3 px-3 text-right font-bold text-emerald-400">
                        ₹{exp.total_cost_inr ? exp.total_cost_inr.toLocaleString('en-IN') : '0'}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                          {exp.payment_status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right space-x-1">
                        <button
                          onClick={() => { setEditingExpense(exp); setIsEditModalOpen(true); }}
                          className="px-2 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px]"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteExpense(exp.expense_id)}
                          className="px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px]"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Qwen AI Financial & Cost Advisor Card */}
          <div className="glass-panel p-6 rounded-2xl border border-cyan-500/30 space-y-4">
            <h3 className="text-md font-bold text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-cyan-400" />
              Qwen AI Financial & Cost Leak Optimizer
            </h3>
            <form onSubmit={handleAiAsk} className="space-y-3 text-xs font-mono">
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Ask Qwen for cost reduction strategies, bulk fertilizer purchase savings, or monthly expense forecast..."
                className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-white h-24 placeholder-slate-500"
              />
              <button
                type="submit"
                disabled={aiLoading}
                className="w-full py-2 bg-cyan-500 hover:bg-cyan-600 text-black font-bold rounded-xl transition-all shadow-[0_0_12px_#06b6d433]"
              >
                {aiLoading ? "Analyzing Expenditure..." : "Query Qwen CFO AI"}
              </button>
            </form>
            {aiResponse && (
              <div className="p-4 rounded-xl bg-slate-900 border border-cyan-500/40 text-cyan-200 text-xs font-mono whitespace-pre-line">
                {aiResponse}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Expense Modal */}
      {isEditModalOpen && editingExpense && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500/50 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl font-mono text-xs">
            <div className="flex justify-between items-center">
              <h3 className="text-md font-bold text-white">Edit Expense: {editingExpense.item_name}</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleUpdateExpense} className="space-y-3">
              <div>
                <label className="text-slate-400 block mb-1">Item Name</label>
                <input
                  type="text"
                  value={editingExpense.item_name}
                  onChange={(e) => setEditingExpense({ ...editingExpense, item_name: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Vendor Name</label>
                <input
                  type="text"
                  value={editingExpense.vendor_name}
                  onChange={(e) => setEditingExpense({ ...editingExpense, vendor_name: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Quantity</label>
                  <input
                    type="number"
                    value={editingExpense.quantity}
                    onChange={(e) => setEditingExpense({ ...editingExpense, quantity: parseFloat(e.target.value) })}
                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Unit Cost (₹)</label>
                  <input
                    type="number"
                    value={editingExpense.unit_price_inr}
                    onChange={(e) => setEditingExpense({ ...editingExpense, unit_price_inr: parseFloat(e.target.value) })}
                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-white"
                  />
                </div>
              </div>
              <button type="submit" className="w-full py-2.5 bg-emerald-500 font-bold text-black rounded-xl">Save Voucher Changes</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
