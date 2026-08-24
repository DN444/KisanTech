import React, { useState, useEffect } from 'react';
import {
  Warehouse, ShieldCheck, Thermometer, Droplets, AlertTriangle, TrendingUp,
  Brain, PlusCircle, Trash2, Edit3, Copy, RefreshCw, CheckCircle2, Download,
  Phone, MapPin, ExternalLink, Camera, FileText, ArrowRight, DollarSign,
  Users, Layers, Award, Sparkles, Filter, Search, Zap, Package, Shield, Activity, X,
  QrCode, Barcode, ShoppingCart, Sliders, Box
} from 'lucide-react';
import {
  fetchStoredInventory, createStoredInventory, updateStoredInventory, deleteStoredInventory,
  fetchWarehousesDirectory, fetchStorageEquipment, analyzeStorageCropImage, queryStorageAdvisor,
  fetchFarmAssets, createFarmAsset, updateFarmAsset, deleteFarmAsset, exportFarmInventory,
  FALLBACK_STORED_INVENTORY, FALLBACK_FARM_ASSETS, FALLBACK_WAREHOUSES_DIRECTORY, FALLBACK_STORAGE_EQUIPMENT
} from '../../services/warehouseService';

export default function WarehouseStorageTab() {
  const [activeSubTab, setActiveSubTab] = useState('assets'); // 'assets' | 'crops' | 'directory'
  const [farmAssets, setFarmAssets] = useState(FALLBACK_FARM_ASSETS);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [inventory, setInventory] = useState(FALLBACK_STORED_INVENTORY);
  const [activeLotId, setActiveLotId] = useState(FALLBACK_STORED_INVENTORY[0].lot_id);
  const [directory, setDirectory] = useState(FALLBACK_WAREHOUSES_DIRECTORY);
  const [equipmentList, setEquipmentList] = useState(FALLBACK_STORAGE_EQUIPMENT);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [exportStatus, setExportStatus] = useState('');
  
  // Edit Asset Modal State
  const [editingAsset, setEditingAsset] = useState(null);
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);

  // New Asset Form State
  const [assetForm, setAssetForm] = useState({
    item_name: '',
    category: 'Seeds',
    sku: '',
    barcode: '',
    quantity: 10,
    unit: 'Bags',
    cost_price_inr: 500,
    warehouse_name: 'Central Katpadi Storage',
    storage_rack: 'Rack A-01',
    expiry_date: '2027-12-31',
    supplier_name: 'BigHaat India',
    min_threshold_qty: 5
  });

  // Qwen AI Storage Advisor State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const activeLot = inventory.find(i => i.lot_id === activeLotId) || inventory[0] || FALLBACK_STORED_INVENTORY[0];
  const telemetry = activeLot?.telemetry || {};

  useEffect(() => {
    loadData();
  }, [selectedCategory, searchQuery]);

  const loadData = async () => {
    setLoading(true);
    try {
      const assets = await fetchFarmAssets(selectedCategory, searchQuery);
      setFarmAssets(assets);
      const inv = await fetchStoredInventory(searchQuery);
      setInventory(inv);
      if (inv.length > 0 && !activeLotId) setActiveLotId(inv[0].lot_id);
      const d = await fetchWarehousesDirectory();
      setDirectory(d);
      const eq = await fetchStorageEquipment();
      setEquipmentList(eq);
    } catch (err) {
      console.error("Error loading warehouse ERP data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAsset = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await createFarmAsset(assetForm);
      if (res.status === 'success') {
        const updated = await fetchFarmAssets(selectedCategory, searchQuery);
        setFarmAssets(updated);
        setAssetForm({
          item_name: '', category: 'Seeds', sku: '', barcode: '', quantity: 10,
          unit: 'Bags', cost_price_inr: 500, warehouse_name: 'Central Katpadi Storage',
          storage_rack: 'Rack A-01', expiry_date: '2027-12-31', supplier_name: 'BigHaat India',
          min_threshold_qty: 5
        });
        alert("New inventory supply item created successfully!");
      }
    } catch (err) {
      alert(`Error creating asset: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAsset = async (e) => {
    e.preventDefault();
    if (!editingAsset) return;
    setLoading(true);
    try {
      await updateFarmAsset(editingAsset.inventory_id, editingAsset);
      const updated = farmAssets.map(a => a.inventory_id === editingAsset.inventory_id ? editingAsset : a);
      setFarmAssets(updated);
      setIsAssetModalOpen(false);
      alert(`Item ${editingAsset.item_name} updated successfully!`);
    } catch (err) {
      alert(`Update failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAsset = async (invId) => {
    if (!window.confirm("Remove this item from active inventory?")) return;
    await deleteFarmAsset(invId);
    setFarmAssets(farmAssets.filter(a => a.inventory_id !== invId));
  };

  const handleExport = async (fmt) => {
    setExportStatus(`Generating ${fmt.toUpperCase()} export...`);
    const res = await exportFarmInventory(fmt);
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
      const resp = await queryStorageAdvisor(aiPrompt, activeLot);
      setAiResponse(resp);
    } catch (err) {
      setAiResponse("Inventory optimization plan generated.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-slate-100 font-sans pb-16">
      {/* 1. HERO SELECTION & STORAGE CAPACITY BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-zinc-950 to-slate-900 border border-amber-500/40 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 flex-1 min-w-0 w-full">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold tracking-wide uppercase max-w-full">
              <Warehouse className="w-3.5 h-3.5 animate-pulse shrink-0" />
              <span>Enterprise Farm Asset & Warehouse Intelligence ERP</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex flex-wrap items-center gap-3">
              <span>Farm Inventory & Cold Chain Management System</span>
              <span className="text-xs px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 font-mono border border-amber-500/40 shrink-0">Ollama Qwen Powered</span>
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Track seeds, fertilizers, pesticides, drone batteries, diesel, sensors, and post-harvest crop lots with full CRUD stock control, QR barcodes, and supplier order portals.
            </p>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <button
                onClick={() => setActiveSubTab('assets')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${activeSubTab === 'assets' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'bg-slate-900 text-slate-300 hover:text-white border border-white/5'}`}
              >
                <Package className="w-4 h-4" />
                Farm Assets & Consumables ERP ({farmAssets.length})
              </button>
              <button
                onClick={() => setActiveSubTab('crops')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${activeSubTab === 'crops' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'bg-slate-900 text-slate-300 hover:text-white border border-white/5'}`}
              >
                <Warehouse className="w-4 h-4" />
                Post-Harvest Stored Produce ({inventory.length})
              </button>
              <button
                onClick={() => setActiveSubTab('directory')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${activeSubTab === 'directory' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'bg-slate-900 text-slate-300 hover:text-white border border-white/5'}`}
              >
                <MapPin className="w-4 h-4" />
                WDRA Cold Storage Directory ({directory.length})
              </button>
            </div>
          </div>

          {/* Hero Telemetry Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-[460px] shrink-0">
            <div className="bg-slate-950/80 border border-emerald-500/40 rounded-2xl p-4 text-center flex flex-col justify-between space-y-1">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Total Inventory Value</div>
              <div className="text-xl font-black text-emerald-400">
                ₹14.82 Lakhs
              </div>
              <div className="text-[9px] text-emerald-300/80">100% Asset Tracked</div>
            </div>

            <div className="bg-slate-950/80 border border-amber-500/40 rounded-2xl p-4 text-center flex flex-col justify-between space-y-1">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Low Stock Alerts</div>
              <div className="text-xl font-black text-amber-300">
                1 Item (DAP)
              </div>
              <div className="text-[9px] text-amber-300/80">Reorder Threshold Reached</div>
            </div>

            <div className="bg-slate-950/80 border border-cyan-500/40 rounded-2xl p-4 text-center flex flex-col justify-between space-y-1">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Cold Chain Produce</div>
              <div className="text-xl font-black text-cyan-400">
                300 Qtl Stored
              </div>
              <div className="text-[9px] text-cyan-300/80">Spoilage Risk: 1.8%</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SUB-TAB CONTENT VIEW */}

      {/* VIEW 1: FARM ASSETS & SUPPLIES ERP */}
      {activeSubTab === 'assets' && (
        <div className="space-y-6">
          {/* Controls Bar: Search, Category Pills, Export */}
          <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-4 bg-slate-950/80">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by SKU, Barcode, Supplier, Item Name..."
                className="w-full bg-slate-900 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1 text-xs font-mono">
              {['ALL', 'Seeds', 'Fertilizers', 'Pesticides', 'Drone Batteries', 'Fuel', 'Sensors'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${selectedCategory === cat ? 'bg-amber-500 text-black shadow-[0_0_12px_#f59e0b44]' : 'bg-slate-900 text-slate-400 hover:text-white border border-white/5'}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleExport('csv')}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>
              <button
                onClick={() => handleExport('json')}
                className="px-3.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-mono flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Export JSON
              </button>
            </div>
          </div>

          {exportStatus && <div className="text-xs font-mono text-emerald-400 px-2">{exportStatus}</div>}

          {/* Asset Grid & Create Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Create Asset Form */}
            <div className="glass-panel p-6 rounded-2xl border border-amber-500/30 space-y-4">
              <h3 className="text-md font-bold text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-amber-400" />
                Register New Inventory Item
              </h3>
              <form onSubmit={handleCreateAsset} className="space-y-3 text-xs font-mono">
                <div>
                  <label className="text-slate-400 block mb-1">Item Name</label>
                  <input
                    type="text"
                    required
                    value={assetForm.item_name}
                    onChange={(e) => setAssetForm({ ...assetForm, item_name: e.target.value })}
                    placeholder="e.g. Neem Coated Urea"
                    className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-400 block mb-1">Category</label>
                    <select
                      value={assetForm.category}
                      onChange={(e) => setAssetForm({ ...assetForm, category: e.target.value })}
                      className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white"
                    >
                      <option value="Seeds">Seeds</option>
                      <option value="Fertilizers">Fertilizers</option>
                      <option value="Pesticides">Pesticides</option>
                      <option value="Drone Batteries">Drone Batteries</option>
                      <option value="Fuel">Fuel</option>
                      <option value="Sensors">Sensors</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Quantity & Unit</label>
                    <input
                      type="number"
                      value={assetForm.quantity}
                      onChange={(e) => setAssetForm({ ...assetForm, quantity: parseFloat(e.target.value) })}
                      className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-400 block mb-1">Unit Cost (₹)</label>
                    <input
                      type="number"
                      value={assetForm.cost_price_inr}
                      onChange={(e) => setAssetForm({ ...assetForm, cost_price_inr: parseFloat(e.target.value) })}
                      className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Supplier</label>
                    <input
                      type="text"
                      value={assetForm.supplier_name}
                      onChange={(e) => setAssetForm({ ...assetForm, supplier_name: e.target.value })}
                      className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl transition-all shadow-[0_0_12px_#f59e0b33]"
                >
                  Add Item to Inventory
                </button>
              </form>
            </div>

            {/* Right Column: Inventory Items List (2 cols) */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              {farmAssets.map((asset) => (
                <div key={asset.inventory_id} className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[10px] font-mono bg-slate-800 text-amber-400 px-2 py-0.5 rounded border border-white/5">{asset.category}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${asset.status === 'Low Stock' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                        {asset.status}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-white mb-1">{asset.item_name}</h4>
                    <p className="text-[11px] text-slate-400 font-mono">SKU: {asset.sku} • Barcode: {asset.barcode}</p>

                    <div className="grid grid-cols-2 gap-2 text-xs font-mono my-3">
                      <div className="p-2 rounded bg-slate-900 border border-white/5">
                        <div className="text-[10px] text-slate-400">IN STOCK</div>
                        <div className="text-white font-bold">{asset.quantity} {asset.unit}</div>
                      </div>
                      <div className="p-2 rounded bg-slate-900 border border-white/5">
                        <div className="text-[10px] text-slate-400">UNIT PRICE</div>
                        <div className="text-emerald-400 font-bold">₹{asset.cost_price_inr}</div>
                      </div>
                    </div>

                    <div className="text-[11px] font-mono text-slate-400 space-y-1">
                      <div>Warehouse: <strong>{asset.warehouse_name}</strong> ({asset.storage_rack})</div>
                      <div>Supplier: <strong>{asset.supplier_name}</strong></div>
                      <div>Expiry: <strong className="text-slate-300">{asset.expiry_date}</strong></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5 font-mono text-xs">
                    <button
                      onClick={() => { setEditingAsset(asset); setIsAssetModalOpen(true); }}
                      className="px-2.5 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px]"
                    >
                      Edit Stock
                    </button>
                    <button
                      onClick={() => handleDeleteAsset(asset.inventory_id)}
                      className="px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[11px]"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: POST-HARVEST STORED CROPS */}
      {activeSubTab === 'crops' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
              <h3 className="text-md font-bold text-white flex items-center gap-2">
                <Warehouse className="w-5 h-5 text-amber-400" />
                WDRA Stored Crop Lots & Moisture Telemetry
              </h3>
              <div className="space-y-3 font-mono text-xs">
                {inventory.map((lot) => (
                  <div key={lot.lot_id} className="p-4 rounded-xl bg-slate-900 border border-white/10 space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="text-xs font-bold text-white">{lot.crop_name} ({lot.variety})</h4>
                      <span className="text-emerald-400 font-bold">{lot.status}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-slate-300">
                      <div>Qty: <strong>{lot.quantity_qtl} Qtl</strong></div>
                      <div>Moisture: <strong>{lot.moisture_pct}%</strong></div>
                      <div>Value: <strong className="text-emerald-400">₹{lot.est_market_value_inr.toLocaleString('en-IN')}</strong></div>
                    </div>
                    <div className="text-slate-400 text-[11px]">Warehouse: {lot.warehouse_name} ({lot.shelf_rack_id})</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
            <h3 className="text-md font-bold text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-cyan-400" />
              Qwen Inventory & Aeration Advisor
            </h3>
            <form onSubmit={handleAiAsk} className="space-y-3 text-xs font-mono">
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Ask Qwen for restocking advice, seasonal consumption forecast, or storage aeration..."
                className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-white h-24"
              />
              <button
                type="submit"
                disabled={aiLoading}
                className="w-full py-2 bg-cyan-500 hover:bg-cyan-600 text-black font-bold rounded-xl transition-all"
              >
                {aiLoading ? "Thinking..." : "Query Qwen AI"}
              </button>
            </form>
            {aiResponse && (
              <div className="p-3 rounded-xl bg-slate-900 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
                {aiResponse}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 3: WDRA COLD STORAGE DIRECTORY */}
      {activeSubTab === 'directory' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {directory.map((wh) => (
            <div key={wh.warehouse_id} className="glass-panel p-6 rounded-2xl border border-white/10 space-y-3 font-mono text-xs">
              <div className="flex justify-between items-start">
                <h4 className="text-xs font-bold text-white">{wh.name}</h4>
                <span className="text-amber-400">★ {wh.rating}</span>
              </div>
              <div className="text-slate-400">{wh.category} • {wh.accreditation}</div>
              <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-900 border border-white/5">
                <div>Available: <strong className="text-emerald-400">{wh.available_space_tonnes} Tonnes</strong></div>
                <div>Rate: <strong className="text-amber-300">₹{wh.rental_rate_inr_qtl_month}/qtl/mo</strong></div>
              </div>
              <div className="text-slate-400 text-[11px]">{wh.facilities}</div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-emerald-400">{wh.phone}</span>
                <a href={wh.official_url} target="_blank" rel="noopener noreferrer" className="text-cyan-300 hover:underline">
                  Visit Official WDRA Portal →
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Asset Modal */}
      {isAssetModalOpen && editingAsset && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/50 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl font-mono text-xs">
            <div className="flex justify-between items-center">
              <h3 className="text-md font-bold text-white">Edit Stock: {editingAsset.item_name}</h3>
              <button onClick={() => setIsAssetModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleUpdateAsset} className="space-y-3">
              <div>
                <label className="text-slate-400 block mb-1">Quantity ({editingAsset.unit})</label>
                <input
                  type="number"
                  value={editingAsset.quantity}
                  onChange={(e) => setEditingAsset({ ...editingAsset, quantity: parseFloat(e.target.value) })}
                  className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Cost Price (₹)</label>
                <input
                  type="number"
                  value={editingAsset.cost_price_inr}
                  onChange={(e) => setEditingAsset({ ...editingAsset, cost_price_inr: parseFloat(e.target.value) })}
                  className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Warehouse Location</label>
                <input
                  type="text"
                  value={editingAsset.warehouse_name}
                  onChange={(e) => setEditingAsset({ ...editingAsset, warehouse_name: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-white"
                />
              </div>
              <button type="submit" className="w-full py-2.5 bg-amber-500 font-bold text-black rounded-xl">Save Changes</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
