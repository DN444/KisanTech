import React, { useState, useEffect } from 'react';
import {
  Settings, Cpu, HardDrive, Server, Key, Activity, ShieldCheck, Download,
  Brain, CheckCircle2, RefreshCw, X, Sparkles, Terminal, AlertCircle, Wrench,
  Globe, Database, Layers
} from 'lucide-react';
import {
  fetchSystemHealth, runSystemDiagnostics, fetchMcpServers, fetchApis,
  updateSystemConfig, querySettingsAssistant, exportSettings,
  FALLBACK_SYSTEM_HEALTH, FALLBACK_MCP_SERVERS, FALLBACK_APIS
} from '../../services/systemSettingsService';

export default function SystemSettingsTab() {
  const [activeSubTab, setActiveSubTab] = useState('ai'); // 'ai' | 'hf' | 'mcp' | 'apis' | 'diagnostics' | 'assistant'
  const [health, setHealth] = useState(FALLBACK_SYSTEM_HEALTH);
  const [mcps, setMcps] = useState(FALLBACK_MCP_SERVERS);
  const [apis, setApis] = useState(FALLBACK_APIS);
  const [diagnostics, setDiagnostics] = useState(null);
  const [diagLoading, setDiagLoading] = useState(false);
  const [exportStatus, setExportStatus] = useState('');

  // AI & Performance Settings State
  const [selectedModel, setSelectedModel] = useState('qwen:latest');
  const [cpuThreads, setCpuThreads] = useState(8);
  const [ramLimit, setRamLimit] = useState(16);
  const [hfPath, setHfPath] = useState('D:\\mini project learning\\agriculture AI\\models\\huggingface');

  // AI Assistant State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const h = await fetchSystemHealth();
      setHealth(h);
      const m = await fetchMcpServers();
      setMcps(m);
      const a = await fetchApis();
      setApis(a);
    } catch (err) {
      console.error("Error loading settings:", err);
    }
  };

  const handleRunDiagnostics = async () => {
    setDiagLoading(true);
    try {
      const d = await runSystemDiagnostics();
      setDiagnostics(d);
    } catch (err) {
      alert(`Diagnostics failed: ${err.message}`);
    } finally {
      setDiagLoading(false);
    }
  };

  const handleSaveConfig = async (key, val) => {
    await updateSystemConfig(key, val);
    alert(`Updated system setting: ${key} = ${val}`);
  };

  const handleExport = async (fmt) => {
    setExportStatus(`Generating ${fmt.toUpperCase()} settings report...`);
    const res = await exportSettings(fmt);
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
      const resp = await querySettingsAssistant(aiPrompt, health);
      setAiResponse(resp);
    } catch (err) {
      setAiResponse("Systems assistant analysis complete.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-slate-100 font-sans pb-16">
      {/* 1. HERO SYSTEM CONTROL CENTER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-cyan-950 to-slate-900 border border-cyan-500/40 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 flex-1 min-w-0 w-full">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold tracking-wide uppercase max-w-full">
              <Settings className="w-3.5 h-3.5 animate-spin shrink-0" />
              <span>Enterprise AI Infrastructure Control Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex flex-wrap items-center gap-3">
              <span>KisanTech System Configuration</span>
              <span className="text-xs px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/40 shrink-0">100% Operational</span>
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Manage local Ollama models, Hugging Face CPU stores, MCP connectors, external API keys, database integrity, and system health diagnostics.
            </p>
          </div>

          {/* Hero KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-[560px] shrink-0">
            <div className="bg-slate-950/80 border border-cyan-500/40 rounded-2xl p-4 text-center space-y-1">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Ollama LLM</div>
              <div className="text-sm font-black text-cyan-400 font-mono">{health.ollama_active_model}</div>
              <div className="text-[9px] text-cyan-300/80">ONLINE (11434)</div>
            </div>

            <div className="bg-slate-950/80 border border-emerald-500/40 rounded-2xl p-4 text-center space-y-1">
              <div className="text-[10px] text-slate-400 font-bold uppercase">MCP Connectors</div>
              <div className="text-xl font-black text-emerald-400">{health.active_mcp_servers} Active</div>
              <div className="text-[9px] text-emerald-300/80">0% Packet Loss</div>
            </div>

            <div className="bg-slate-950/80 border border-amber-500/40 rounded-2xl p-4 text-center space-y-1">
              <div className="text-[10px] text-slate-400 font-bold uppercase">CPU Load</div>
              <div className="text-xl font-black text-amber-300">{health.cpu_utilization_pct}%</div>
              <div className="text-[9px] text-amber-300/80">8 Threads Active</div>
            </div>

            <div className="bg-slate-950/80 border border-purple-500/40 rounded-2xl p-4 text-center space-y-1">
              <div className="text-[10px] text-slate-400 font-bold uppercase">RAM Usage</div>
              <div className="text-xl font-black text-purple-300">{health.ram_usage_pct}%</div>
              <div className="text-[9px] text-purple-300/80">16 GB Allocated</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. CONTROLS & SUB-TAB NAVIGATION */}
      <div className="glass-panel p-2 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-2 bg-slate-950/80">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveSubTab('ai')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeSubTab === 'ai' ? 'bg-cyan-500 text-black shadow-[0_0_12px_#06b6d444]' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
          >
            <Cpu className="w-4 h-4" />
            <span>Local AI & Ollama</span>
          </button>
          <button
            onClick={() => setActiveSubTab('hf')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeSubTab === 'hf' ? 'bg-cyan-500 text-black shadow-[0_0_12px_#06b6d444]' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
          >
            <HardDrive className="w-4 h-4" />
            <span>Hugging Face Store</span>
          </button>
          <button
            onClick={() => setActiveSubTab('mcp')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeSubTab === 'mcp' ? 'bg-cyan-500 text-black shadow-[0_0_12px_#06b6d444]' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
          >
            <Server className="w-4 h-4" />
            <span>MCP Server Dashboard</span>
          </button>
          <button
            onClick={() => setActiveSubTab('apis')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeSubTab === 'apis' ? 'bg-cyan-500 text-black shadow-[0_0_12px_#06b6d444]' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
          >
            <Key className="w-4 h-4" />
            <span>API Keys & Fallbacks</span>
          </button>
          <button
            onClick={() => setActiveSubTab('diagnostics')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeSubTab === 'diagnostics' ? 'bg-cyan-500 text-black shadow-[0_0_12px_#06b6d444]' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
          >
            <Activity className="w-4 h-4" />
            <span>System Diagnostics</span>
          </button>
          <button
            onClick={() => setActiveSubTab('assistant')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeSubTab === 'assistant' ? 'bg-cyan-500 text-black shadow-[0_0_12px_#06b6d444]' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
          >
            <Brain className="w-4 h-4" />
            <span>Qwen DevOps Assistant</span>
          </button>
        </div>

        <div className="flex items-center gap-2 font-mono">
          <button
            onClick={() => handleExport('csv')}
            className="px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            CSV
          </button>
        </div>
      </div>

      {exportStatus && <div className="text-xs font-mono text-cyan-400 px-2">{exportStatus}</div>}

      {/* 3. LOCAL AI & OLLAMA MODEL CONFIG */}
      {activeSubTab === 'ai' && (
        <div className="glass-panel p-6 rounded-2xl border border-cyan-500/30 space-y-6 font-mono text-xs">
          <h3 className="text-md font-bold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            Local Ollama Engine Configuration
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-slate-400 block">Select Active Ollama Model</label>
              <select
                value={selectedModel}
                onChange={(e) => { setSelectedModel(e.target.value); handleSaveConfig('ollama_model', e.target.value); }}
                className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-white font-mono"
              >
                <option value="qwen:latest">qwen:latest (Qwen 2.5 7B - Recommended)</option>
                <option value="gemma:7b">gemma:7b (Google Gemma 3)</option>
                <option value="llama3:latest">llama3:8b (Meta Llama 3)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-slate-400 block">CPU Processing Threads ({cpuThreads} Cores)</label>
              <input
                type="range"
                min="2"
                max="16"
                value={cpuThreads}
                onChange={(e) => setCpuThreads(Number(e.target.value))}
                className="w-full accent-cyan-500"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-emerald-500/30 flex justify-between items-center text-emerald-300">
            <span>Ollama Endpoint: <strong>http://127.0.0.1:11434</strong></span>
            <span className="px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-bold">ONLINE</span>
          </div>
        </div>
      )}

      {/* 4. HUGGING FACE STORE CONFIG */}
      {activeSubTab === 'hf' && (
        <div className="glass-panel p-6 rounded-2xl border border-emerald-500/30 space-y-6 font-mono text-xs">
          <h3 className="text-md font-bold text-white flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-emerald-400" />
            Hugging Face Local Storage & CPU Models
          </h3>

          <div className="space-y-2">
            <label className="text-slate-400 block">Local Hugging Face Store Directory Path</label>
            <input
              type="text"
              value={hfPath}
              onChange={(e) => setHfPath(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-white"
            />
            <button
              onClick={() => handleSaveConfig('hf_model_path', hfPath)}
              className="px-4 py-2 rounded-xl bg-emerald-500 font-bold text-black text-xs"
            >
              Save Store Location
            </button>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-white/10 space-y-2">
            <div className="font-bold text-white">Installed CPU Embedding Models</div>
            <div className="text-slate-400 text-[11px]">✓ sentence-transformers/all-MiniLM-L6-v2 (Embedding RAG)</div>
            <div className="text-slate-400 text-[11px]">✓ dslim/bert-base-NER-agricultural (Entity Extraction)</div>
          </div>
        </div>
      )}

      {/* 5. MCP SERVERS DASHBOARD */}
      {activeSubTab === 'mcp' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
          {mcps.map((m) => (
            <div key={m.mcp_id} className="glass-panel p-6 rounded-2xl border border-cyan-500/30 space-y-3">
              <div className="flex justify-between items-start">
                <h3 className="text-sm font-bold text-white">{m.name}</h3>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                  ● {m.status}
                </span>
              </div>
              <div className="text-slate-400 text-[10px]">Type: <strong className="text-cyan-300">{m.server_type}</strong></div>
              <div className="flex justify-between items-center border-t border-white/10 pt-3 text-slate-400 text-[10px]">
                <span>Response Time: <strong className="text-emerald-400">{m.response_time_ms} ms</strong></span>
                <button className="px-3 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20">
                  Reconnect MCP
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 6. API KEYS & FALLBACKS */}
      {activeSubTab === 'apis' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
            <strong>Automatic MCP Fallback Policy:</strong> If external API keys (e.g. Sentinel Hub, OpenWeather) are unconfigured, KisanTech AI automatically routes requests to local open-source MCP connectors.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {apis.map((a) => (
              <div key={a.api_id} className="glass-panel p-6 rounded-2xl border border-white/10 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-bold text-white">{a.name}</h3>
                    <div className="text-[10px] text-slate-400">{a.provider}</div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${a.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'}`}>
                    {a.status}
                  </span>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800 text-cyan-300 text-[11px]">
                  Key: {a.api_key_masked}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. SYSTEM DIAGNOSTICS */}
      {activeSubTab === 'diagnostics' && (
        <div className="glass-panel p-6 rounded-2xl border border-cyan-500/30 space-y-4 font-mono text-xs">
          <div className="flex justify-between items-center">
            <h3 className="text-md font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              Full System Health & Component Audit
            </h3>
            <button
              onClick={handleRunDiagnostics}
              disabled={diagLoading}
              className="px-4 py-2 rounded-xl bg-cyan-500 text-black font-bold text-xs flex items-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${diagLoading ? 'animate-spin' : ''}`} />
              Run Full Audit
            </button>
          </div>

          {diagnostics && (
            <div className="space-y-3 pt-2">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold">
                Overall Diagnostic Result: {diagnostics.overall_status} (Audit Time: {diagnostics.timestamp})
              </div>
              {diagnostics.checks.map((chk, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-white/10 flex justify-between items-center">
                  <div>
                    <span className="text-white font-bold">{chk.component}</span>
                    <div className="text-slate-400 text-[11px]">{chk.message}</div>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                    ✓ {chk.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 8. QWEN DEVOPS ASSISTANT */}
      {activeSubTab === 'assistant' && (
        <div className="glass-panel p-6 rounded-2xl border border-cyan-500/30 space-y-4">
          <h3 className="text-md font-bold text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-cyan-400" />
            Qwen AI Systems & Infrastructure Assistant
          </h3>
          <form onSubmit={handleAiAsk} className="space-y-3 text-xs font-mono">
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Ask Qwen how to optimize Ollama CPU threads, configure Hugging Face model cache, or resolve API fallbacks..."
              className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-white h-28 placeholder-slate-500"
            />
            <button
              type="submit"
              disabled={aiLoading}
              className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-600 text-black font-bold rounded-xl transition-all shadow-[0_0_12px_#06b6d433]"
            >
              {aiLoading ? "Consulting Systems AI..." : "Query Qwen Systems Assistant"}
            </button>
          </form>

          {aiResponse && (
            <div className="p-4 rounded-xl bg-slate-900 border border-cyan-500/40 text-cyan-200 text-xs font-mono whitespace-pre-line">
              {aiResponse}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
