import React, { useState, useEffect } from 'react';
import {
  Workflow, Cpu, Zap, Activity, RefreshCw, Play, CheckCircle2, ShieldCheck,
  Download, Clock, Sliders, ChevronRight, AlertTriangle, Layers, Radio,
  Droplets, Sun, Wind, CloudRain, Shield, Trash2, ArrowRight, CornerDownLeft, Sparkles
} from 'lucide-react';
import {
  fetchAutomationRules, toggleAutomationRule, fetchIotDevices, fetchAutomationLogs,
  triggerAutomationRule, FALLBACK_AUTOMATION_RULES, FALLBACK_IOT_DEVICES, FALLBACK_AUTOMATION_LOGS
} from '../../services/aiAutomationService';

export default function AIAutomationTab() {
  const [rules, setRules] = useState(FALLBACK_AUTOMATION_RULES);
  const [iotDevices, setIotDevices] = useState(FALLBACK_IOT_DEVICES);
  const [logs, setLogs] = useState(FALLBACK_AUTOMATION_LOGS);
  const [selectedRuleId, setSelectedRuleId] = useState('RULE-01');
  const [customTrigger, setCustomTrigger] = useState('');
  const [executing, setExecuting] = useState(false);
  const [latestLogResult, setLatestLogResult] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [rl, iot, lg] = await Promise.all([
        fetchAutomationRules(),
        fetchIotDevices(),
        fetchAutomationLogs()
      ]);
      setRules(rl);
      setIotDevices(iot);
      setLogs(lg);
    } catch (err) {
      console.error("Error loading AI Automation data:", err);
    }
  };

  const handleToggleRule = async (ruleId, currentStatus) => {
    const newStatus = !currentStatus;
    setRules(prev => prev.map(r => r.rule_id === ruleId ? { ...r, is_active: newStatus ? 1 : 0 } : r));
    await toggleAutomationRule(ruleId, newStatus);
  };

  const handleTriggerRule = async (e, rId = null) => {
    if (e) e.preventDefault();
    const targetRuleId = rId || selectedRuleId;
    setExecuting(true);
    setLatestLogResult(null);

    try {
      const res = await triggerAutomationRule(targetRuleId, customTrigger || null);
      if (res.status === 'success') {
        setLatestLogResult(res);
        const updatedLogs = await fetchAutomationLogs();
        setLogs(updatedLogs);
        const updatedRules = await fetchAutomationRules();
        setRules(updatedRules);
      }
    } catch (err) {
      console.error("Error triggering automation rule:", err);
    } finally {
      setExecuting(false);
    }
  };

  const activeRulesCount = rules.filter(r => r.is_active === 1).length;
  const totalExecutionsCount = rules.reduce((acc, r) => acc + (r.executions_count || 0), 0);

  const handleExportReport = (fmt) => {
    try {
      const content = `
        ====================================================
        KISANTECH AI • AUTOMATION ENGINE EXECUTION REPORT
        ====================================================
        Total Active Rules: ${activeRulesCount} / ${rules.length}
        Connected IoT Hardware Nodes: ${iotDevices.length}
        Date: ${new Date().toLocaleDateString()}

        AUTOMATION RULES REGISTRY:
        ${rules.map(r => `• [${r.rule_id}] ${r.title} - ${r.is_active ? 'ACTIVE' : 'INACTIVE'} (Executions: ${r.executions_count})\n  Trigger: ${r.trigger_condition}\n  Action: ${r.action_execution}`).join('\n\n')}

        EXECUTION LOGS:
        ${logs.map(l => `\n[LOG ID]: ${l.log_id}\n[RULE]: ${l.rule_title}\n[CAUSE]: ${l.trigger_cause}\n[SUMMARY]: ${l.reasoning_summary}`).join('\n\n----------------------------------------------------\n')}
        ====================================================
      `;
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `KisanTech_Automation_Report.${fmt.toLowerCase()}`;
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
              <Workflow className="w-3.5 h-3.5 animate-pulse shrink-0 text-emerald-400" />
              <span className="truncate">Event-Driven Intelligent Automation & IoT Rule Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex flex-wrap items-center gap-3">
              <span>KisanTech AI Automation Engine</span>
              <span className="text-xs px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/40 shrink-0">Continuous Event Monitor</span>
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Automates manual farming decisions. Continuously monitors weather risks, soil moisture sensors, mandi price spikes, and subsidy deadlines to execute instant IoT actions.
            </p>
          </div>

          {/* System Hardware & Automation Telemetry */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto shrink-0 font-mono text-xs">
            <div className="bg-slate-950/80 border border-emerald-500/40 rounded-2xl p-3 text-center">
              <div className="text-[9px] text-slate-400 uppercase font-bold">Active Rules</div>
              <div className="text-sm font-black text-emerald-400">{activeRulesCount} / {rules.length}</div>
              <div className="text-[8px] text-emerald-300/80">100% Online</div>
            </div>

            <div className="bg-slate-950/80 border border-cyan-500/40 rounded-2xl p-3 text-center">
              <div className="text-[9px] text-slate-400 uppercase font-bold">IoT Nodes</div>
              <div className="text-sm font-black text-cyan-400">{iotDevices.length} Hardware</div>
              <div className="text-[8px] text-cyan-300/80">ESP32 / RPi / Arduino</div>
            </div>

            <div className="bg-slate-950/80 border border-amber-500/40 rounded-2xl p-3 text-center">
              <div className="text-[9px] text-slate-400 uppercase font-bold">Executions Today</div>
              <div className="text-sm font-black text-amber-300">{totalExecutionsCount.toLocaleString()}</div>
              <div className="text-[8px] text-amber-300/80">Zero Lag</div>
            </div>

            <div className="bg-slate-950/80 border border-purple-500/40 rounded-2xl p-3 text-center">
              <div className="text-[9px] text-slate-400 uppercase font-bold">Resource Savings</div>
              <div className="text-sm font-black text-purple-300">32% Saved</div>
              <div className="text-[8px] text-purple-300/80">Water & Electricity</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. CONNECTED SMART IOT HARDWARE NODES */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <Radio className="w-3.5 h-3.5 text-cyan-400" />
          <span>Connected Smart Farming IoT Hardware Nodes ({iotDevices.length})</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {iotDevices.map(dev => (
            <div key={dev.device_id} className="rounded-3xl bg-slate-900/80 border border-slate-800 p-5 backdrop-blur-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-slate-400">
                  {dev.device_id}
                </span>
                <span className="inline-flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  {dev.status} ({dev.battery_pct}%)
                </span>
              </div>

              <div>
                <h4 className="font-extrabold text-white text-sm">{dev.name}</h4>
                <div className="text-[11px] text-slate-400 font-mono">{dev.hardware_type} • {dev.location}</div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-400 space-y-1">
                {Object.entries(dev.sensor_values).map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-slate-400 uppercase text-[10px]">{k.replace('_', ' ')}:</span>
                    <span className="font-bold">{String(v)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. EVENT-DRIVEN AUTOMATION RULES GRID */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-emerald-400" />
          <span>Configured Event-Driven Automation Rules ({rules.length})</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rules.map(r => (
            <div key={r.rule_id} className={`rounded-3xl p-5 border transition backdrop-blur-xl space-y-4 ${r.is_active === 1 ? 'bg-slate-900/80 border-slate-800 hover:border-emerald-500/50 shadow-xl' : 'bg-slate-950/60 border-slate-900 opacity-60'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-slate-400">
                    {r.rule_id}
                  </span>
                  <span className="text-xs font-mono text-cyan-400 font-bold">{r.category}</span>
                </div>

                {/* Enable/Disable Toggle */}
                <button
                  onClick={() => handleToggleRule(r.rule_id, r.is_active === 1)}
                  className={`w-10 h-5 rounded-full p-0.5 transition-colors ${r.is_active === 1 ? 'bg-emerald-500' : 'bg-slate-800'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${r.is_active === 1 ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              <h4 className="font-extrabold text-white text-sm">{r.title}</h4>

              <div className="space-y-2 text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-rose-500/30 text-rose-300">
                  <span className="font-bold text-rose-400">TRIGGER:</span> {r.trigger_condition}
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-emerald-500/30 text-emerald-300">
                  <span className="font-bold text-emerald-400">ACTION:</span> {r.action_execution}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-400">
                <span>Frequency: {r.frequency}</span>
                <button
                  onClick={(e) => handleTriggerRule(e, r.rule_id)}
                  disabled={executing}
                  className="px-3 py-1 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold transition flex items-center gap-1"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Trigger Now</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. WORKFLOW EXECUTION CANVAS & MANUAL TESTER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT COLUMN: MANUAL TRIGGER FORM (6 COLS) */}
        <div className="lg:col-span-6 rounded-3xl bg-slate-900/80 border border-slate-800 p-6 backdrop-blur-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Event Simulation & Rule Execution Canvas</span>
            </h3>
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">Live Event Dispatch</span>
          </div>

          <form onSubmit={(e) => handleTriggerRule(e)} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold">Select Configured Rule</label>
              <select
                value={selectedRuleId}
                onChange={(e) => setSelectedRuleId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-white focus:outline-none"
              >
                {rules.map(r => (
                  <option key={r.rule_id} value={r.rule_id}>
                    {r.title} ({r.category})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold">Simulated Trigger Event Cause (Optional)</label>
              <input
                type="text"
                value={customTrigger}
                onChange={(e) => setCustomTrigger(e.target.value)}
                placeholder="e.g. Rain probability reached 85% at Katpadi Station..."
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-white focus:outline-none placeholder-slate-500"
              />
            </div>

            <button
              type="submit"
              disabled={executing}
              className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition disabled:opacity-50 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              {executing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{executing ? "Executing Automated Rule..." : "Trigger AI Automation Rule"}</span>
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: EXECUTION RESULT (6 COLS) */}
        <div className="lg:col-span-6 rounded-3xl bg-slate-900/80 border border-slate-800 p-6 backdrop-blur-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Automated Execution Log</span>
            </h3>
            {latestLogResult && (
              <span className="text-[10px] text-emerald-400 font-mono font-bold">
                Latency: {latestLogResult.execution_time_ms} ms
              </span>
            )}
          </div>

          {latestLogResult ? (
            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1 font-mono text-[11px]">
                <div className="text-amber-300 font-bold">Rule: {latestLogResult.rule_title}</div>
                <div className="text-slate-400">Trigger Cause: {latestLogResult.trigger_cause}</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-slate-200 leading-relaxed whitespace-pre-wrap">
                {latestLogResult.reasoning_summary}
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center space-y-3 text-slate-400 text-xs">
              <Workflow className="w-12 h-12 text-slate-600 animate-pulse" />
              <div>Click "Trigger AI Automation Rule" to see real-time IoT relay actions and decision summary.</div>
            </div>
          )}
        </div>

      </div>

      {/* 5. AUTOMATION EXECUTION LOGS TABLE & EXPORTER */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 backdrop-blur-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>Automation Execution Logs ({logs.length})</span>
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
          {logs.map(l => (
            <div key={l.log_id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 text-mono text-[10px]">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-emerald-400">{l.log_id}</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">{l.status}</span>
                </div>
                <span className="text-slate-500">{l.created_at}</span>
              </div>

              <div className="font-bold text-white text-xs">{l.rule_title}</div>
              
              <div className="text-slate-300 leading-relaxed text-[11px]">
                {l.reasoning_summary}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
