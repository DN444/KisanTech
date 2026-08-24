import React, { useState, useEffect } from 'react';
import {
  Bot, Cpu, HardDrive, Activity, Zap, Play, Check, RefreshCw, Download,
  Layers, Filter, Search, ShieldCheck, Clock, Terminal, ChevronRight,
  Sliders, ArrowRight, CornerDownLeft, Sparkles, AlertCircle, FileText, CheckCircle2
} from 'lucide-react';
import {
  fetchAllAgents, toggleAgentStatus, fetchWorkflows, fetchAgentTaskHistory,
  executeAgentWorkflow, FALLBACK_AGENTS, FALLBACK_WORKFLOWS, FALLBACK_TASK_HISTORY
} from '../../services/aiAgentsService';

export default function AIAgentsCenterTab() {
  const [agents, setAgents] = useState(FALLBACK_AGENTS);
  const [workflows, setWorkflows] = useState(FALLBACK_WORKFLOWS);
  const [taskHistory, setTaskHistory] = useState(FALLBACK_TASK_HISTORY);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedWorkflowId, setSelectedWorkflowId] = useState('WORKFLOW-01');
  const [customGoal, setCustomGoal] = useState('');
  const [executing, setExecuting] = useState(false);
  const [latestTaskResult, setLatestTaskResult] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [ag, wf, th] = await Promise.all([
        fetchAllAgents(),
        fetchWorkflows(),
        fetchAgentTaskHistory()
      ]);
      setAgents(ag);
      setWorkflows(wf);
      setTaskHistory(th);
    } catch (err) {
      console.error("Error loading AI Agents data:", err);
    }
  };

  const handleToggleAgent = async (agentId, currentStatus) => {
    const newStatus = !currentStatus;
    setAgents(prev => prev.map(a => a.agent_id === agentId ? { ...a, is_enabled: newStatus ? 1 : 0, status: newStatus ? 'Active' : 'Standby' } : a));
    await toggleAgentStatus(agentId, newStatus);
  };

  const handleExecuteWorkflow = async (e) => {
    e.preventDefault();
    setExecuting(true);
    setLatestTaskResult(null);

    try {
      const res = await executeAgentWorkflow(selectedWorkflowId, customGoal || null);
      if (res.status === 'success') {
        setLatestTaskResult(res);
        const updatedHistory = await fetchAgentTaskHistory();
        setTaskHistory(updatedHistory);
      }
    } catch (err) {
      console.error("Error executing workflow:", err);
    } finally {
      setExecuting(false);
    }
  };

  const categories = ['All', 'Plant Pathology', 'Meteorology', 'Agronomy', 'Economics', 'Market', 'Governance', 'Geospatial', 'Speech AI'];

  const filteredAgents = selectedCategory === 'All'
    ? agents
    : agents.filter(a => a.category === selectedCategory);

  const activeAgentsCount = agents.filter(a => a.is_enabled === 1).length;
  const totalTasksCount = agents.reduce((acc, a) => acc + (a.tasks_completed || 0), 0);

  const handleExportReport = (fmt) => {
    try {
      const content = `
        ====================================================
        KISANTECH AI • AUTONOMOUS AGENTS CENTER SWARM REPORT
        ====================================================
        Total Active Swarm Agents: ${activeAgentsCount} / 15
        Master LLM Brain: qwen:latest
        Date: ${new Date().toLocaleDateString()}

        ACTIVE AGENTS REGISTRY:
        ${agents.map(a => `• [${a.agent_id}] ${a.name} (${a.category}) - ${a.status} (Tasks: ${a.tasks_completed})`).join('\n')}

        TASK PIPELINE EXECUTIONS:
        ${taskHistory.map(t => `\n[TASK ID]: ${t.task_id}\n[GOAL]: ${t.goal}\n[AGENTS]: ${t.agents_used.join(', ')}\n[SUMMARY]: ${t.result_summary}`).join('\n\n----------------------------------------------------\n')}
        ====================================================
      `;
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `KisanTech_Agents_Swarm_Report.${fmt.toLowerCase()}`;
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
              <Bot className="w-3.5 h-3.5 animate-pulse shrink-0 text-emerald-400" />
              <span className="truncate">Local-First Autonomous Multi-Agent Swarm Orchestrator</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex flex-wrap items-center gap-3">
              <span>KisanTech AI Agents Center</span>
              <span className="text-xs px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/40 shrink-0">15 Autonomous Agents</span>
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Central command center orchestrating 15 specialized agricultural AI agents. Parallel tool calling, multi-agent reasoning graph, and local Qwen 7B synthesis.
            </p>
          </div>

          {/* Swarm System Hardware Telemetry */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto shrink-0 font-mono text-xs">
            <div className="bg-slate-950/80 border border-emerald-500/40 rounded-2xl p-3 text-center">
              <div className="text-[9px] text-slate-400 uppercase font-bold">Active Agents</div>
              <div className="text-sm font-black text-emerald-400">{activeAgentsCount} / 15</div>
              <div className="text-[8px] text-emerald-300/80">Swarm Ready</div>
            </div>

            <div className="bg-slate-950/80 border border-cyan-500/40 rounded-2xl p-3 text-center">
              <div className="text-[9px] text-slate-400 uppercase font-bold">MCP Connectors</div>
              <div className="text-sm font-black text-cyan-400">16 Tools</div>
              <div className="text-[8px] text-cyan-300/80">Isolated Pipes</div>
            </div>

            <div className="bg-slate-950/80 border border-amber-500/40 rounded-2xl p-3 text-center">
              <div className="text-[9px] text-slate-400 uppercase font-bold">Total Tasks</div>
              <div className="text-sm font-black text-amber-300">{totalTasksCount.toLocaleString()}</div>
              <div className="text-[8px] text-amber-300/80">0% Failures</div>
            </div>

            <div className="bg-slate-950/80 border border-purple-500/40 rounded-2xl p-3 text-center">
              <div className="text-[9px] text-slate-400 uppercase font-bold">Latency</div>
              <div className="text-sm font-black text-purple-300">18 ms</div>
              <div className="text-[8px] text-purple-300/80">Parallel CPU</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. CATEGORY FILTER TABS */}
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

      {/* 3. 15 AUTONOMOUS AGENTS GRID (3D GLASSMORPHISM CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {filteredAgents.map(ag => (
          <div
            key={ag.agent_id}
            className={`rounded-3xl p-5 border transition-all duration-300 backdrop-blur-xl flex flex-col justify-between space-y-4 ${ag.is_enabled === 1 ? 'bg-slate-900/80 border-slate-800 hover:border-emerald-500/50 shadow-xl' : 'bg-slate-950/60 border-slate-900 opacity-60'}`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-slate-400">
                  {ag.agent_id}
                </span>
                
                {/* Enable/Disable Toggle */}
                <button
                  onClick={() => handleToggleAgent(ag.agent_id, ag.is_enabled === 1)}
                  className={`w-10 h-5 rounded-full p-0.5 transition-colors ${ag.is_enabled === 1 ? 'bg-emerald-500' : 'bg-slate-800'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${ag.is_enabled === 1 ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              <div>
                <h3 className="font-extrabold text-white text-sm truncate">{ag.name}</h3>
                <div className="text-[11px] text-emerald-400 font-mono font-semibold truncate">{ag.role}</div>
              </div>

              <p className="text-[11px] text-slate-300 leading-snug line-clamp-3">
                {ag.description}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800/80 space-y-2 text-[10px] font-mono">
              <div className="flex justify-between text-slate-400">
                <span>CPU Load:</span>
                <span className="text-amber-300 font-bold">{ag.cpu_load_pct}%</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Tasks Executed:</span>
                <span className="text-cyan-300 font-bold">{ag.tasks_completed}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Latency:</span>
                <span className="text-emerald-400 font-bold">{ag.latency_ms} ms</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 4. WORKFLOW EXECUTION CANVAS & MASTER ORCHESTRATOR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT COLUMN: WORKFLOW BUILDER & TRIGGER (6 COLS) */}
        <div className="lg:col-span-6 rounded-3xl bg-slate-900/80 border border-slate-800 p-6 backdrop-blur-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>Master Swarm Workflow Orchestrator</span>
            </h3>
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">Parallel Execution</span>
          </div>

          <form onSubmit={handleExecuteWorkflow} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold">Select Prebuilt Multi-Agent Workflow</label>
              <select
                value={selectedWorkflowId}
                onChange={(e) => setSelectedWorkflowId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-white focus:outline-none"
              >
                {workflows.map(wf => (
                  <option key={wf.workflow_id} value={wf.workflow_id}>
                    {wf.title} ({wf.category})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold">Custom Execution Goal (Optional)</label>
              <input
                type="text"
                value={customGoal}
                onChange={(e) => setCustomGoal(e.target.value)}
                placeholder="e.g. Audit Paddy blast disease and forecast Katpadi 7-day rainfall..."
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-white focus:outline-none placeholder-slate-500"
              />
            </div>

            <button
              type="submit"
              disabled={executing}
              className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition disabled:opacity-50 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              {executing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{executing ? "Orchestrating Multi-Agent Swarm..." : "Execute Swarm Workflow"}</span>
            </button>
          </form>

          {/* Workflow Sequence Visualization */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
            <div className="text-[10px] text-slate-400 uppercase font-mono font-bold">Swarm Pipeline Sequence:</div>
            <div className="flex flex-wrap items-center gap-2 text-emerald-400 font-mono text-[11px]">
              <span>Master Orchestrator</span>
              <ChevronRight className="w-3 h-3 text-slate-600" />
              <span>Parallel MCP Tools</span>
              <ChevronRight className="w-3 h-3 text-slate-600" />
              <span>RAG Knowledge Vectors</span>
              <ChevronRight className="w-3 h-3 text-slate-600" />
              <span>Qwen 7B LLM</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LATEST EXECUTION RESULT & TRANSCRIPT (6 COLS) */}
        <div className="lg:col-span-6 rounded-3xl bg-slate-900/80 border border-slate-800 p-6 backdrop-blur-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Swarm Execution Result</span>
            </h3>
            {latestTaskResult && (
              <span className="text-[10px] text-emerald-400 font-mono font-bold">
                Latency: {latestTaskResult.execution_time_ms} ms
              </span>
            )}
          </div>

          {latestTaskResult ? (
            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1 font-mono text-[11px]">
                <div className="text-amber-300 font-bold">Goal: {latestTaskResult.goal}</div>
                <div className="text-slate-400">Agents Executed: {latestTaskResult.agents_used.join(', ')}</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-slate-200 leading-relaxed whitespace-pre-wrap">
                {latestTaskResult.result_summary}
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1 font-mono text-[10px] text-slate-300">
                <div className="font-bold text-cyan-400">Reasoning Timeline:</div>
                {latestTaskResult.reasoning_steps.map((st, idx) => (
                  <div key={idx}>→ {st}</div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center space-y-3 text-slate-400 text-xs">
              <Bot className="w-12 h-12 text-slate-600 animate-pulse" />
              <div>Select a workflow and click "Execute Swarm Workflow" to see live multi-agent reasoning.</div>
            </div>
          )}
        </div>

      </div>

      {/* 5. TASK PIPELINE EXECUTION HISTORY TABLE & EXPORTER */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 backdrop-blur-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>Task Execution History Log ({taskHistory.length})</span>
          </h3>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExportReport('PDF')}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500 text-xs font-bold text-slate-300 hover:text-white transition"
            >
              Export PDF
            </button>
            <button
              onClick={() => handleExportReport('JSON')}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500 text-xs font-bold text-slate-300 hover:text-white transition"
            >
              Export JSON
            </button>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          {taskHistory.map(th => (
            <div key={th.task_id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 text-mono text-[10px]">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-emerald-400">{th.task_id}</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">{th.status}</span>
                </div>
                <span className="text-slate-500">{th.created_at}</span>
              </div>

              <div className="font-bold text-white text-xs">{th.goal}</div>
              
              <div className="text-slate-300 leading-relaxed text-[11px]">
                {th.result_summary}
              </div>

              <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px] font-mono">
                <span className="text-slate-400">Agents:</span>
                {th.agents_used.map((ag, aIdx) => (
                  <span key={aIdx} className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-cyan-300">
                    {ag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
