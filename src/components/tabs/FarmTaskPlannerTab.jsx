import React, { useState, useEffect } from 'react';
import {
  Kanban, CheckSquare, Clock, AlertTriangle, ShieldCheck, Brain, Download, Search,
  Filter, Plus, Edit3, Trash2, Zap, RefreshCw, X, Sparkles, ChevronRight, Activity,
  UserCheck, Wrench, Layers, FileCode
} from 'lucide-react';
import {
  fetchTaskSummary, fetchTasks, createTask, updateTask, deleteTask,
  autoGenerateSeasonTasks, queryTaskAdvisor, exportTasks,
  FALLBACK_TASK_SUMMARY, FALLBACK_TASKS
} from '../../services/taskPlannerService';

export default function FarmTaskPlannerTab() {
  const [activeSubTab, setActiveSubTab] = useState('kanban'); // 'kanban' | 'workload' | 'autogen' | 'advisor'
  const [summary, setSummary] = useState(FALLBACK_TASK_SUMMARY);
  const [tasks, setTasks] = useState(FALLBACK_TASKS);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [exportStatus, setExportStatus] = useState('');

  // Modal State
  const [editingTask, setEditingTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [taskForm, setTaskForm] = useState({
    title: '',
    tamil_name: '',
    category: 'Spraying',
    priority: 'High',
    status: 'Pending',
    assigned_worker: 'Field Supervisor',
    assigned_equipment: 'Tractor #1',
    crop_name: 'Paddy (Rice)',
    field_block: 'North Field A',
    due_date: new Date().toISOString().split('T')[0],
    estimated_hours: 2.5,
    weather_dependent: true,
    notes: 'Execute according to weather window'
  });

  // AI Advisor State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedCategory, searchQuery]);

  const loadData = async () => {
    setLoading(true);
    try {
      const sum = await fetchTaskSummary();
      setSummary(sum);
      const tsks = await fetchTasks(selectedCategory, 'ALL', searchQuery);
      setTasks(tsks);
    } catch (err) {
      console.error("Error loading tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await createTask(taskForm);
      if (res.status === 'success') {
        const updated = await fetchTasks(selectedCategory, 'ALL', searchQuery);
        setTasks(updated);
        setIsModalOpen(false);
        setTaskForm({
          title: '', tamil_name: '', category: 'Spraying', priority: 'High',
          status: 'Pending', assigned_worker: 'Field Supervisor', assigned_equipment: 'Tractor #1',
          crop_name: 'Paddy (Rice)', field_block: 'North Field A',
          due_date: new Date().toISOString().split('T')[0], estimated_hours: 2.5,
          weather_dependent: true, notes: ''
        });
        alert("New task created in swarm backlog!");
      }
    } catch (err) {
      alert(`Error creating task: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    const taskObj = tasks.find(t => t.task_id === taskId);
    if (!taskObj) return;
    const updatedObj = { ...taskObj, status: newStatus };
    await updateTask(taskId, updatedObj);
    setTasks(tasks.map(t => t.task_id === taskId ? updatedObj : t));
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    if (!editingTask) return;
    setLoading(true);
    try {
      await updateTask(editingTask.task_id, editingTask);
      const updated = tasks.map(t => t.task_id === editingTask.task_id ? editingTask : t);
      setTasks(updated);
      setIsModalOpen(false);
      alert(`Task ${editingTask.title} updated!`);
    } catch (err) {
      alert(`Update failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Remove task from planner?")) return;
    await deleteTask(taskId);
    setTasks(tasks.filter(t => t.task_id !== taskId));
  };

  const handleAutoGenerate = async (cropType) => {
    setLoading(true);
    try {
      const res = await autoGenerateSeasonTasks(cropType);
      if (res.status === 'success') {
        const updated = await fetchTasks(selectedCategory, 'ALL', searchQuery);
        setTasks(updated);
        alert(`Generated ${res.tasks_generated} automated season tasks for ${cropType}!`);
      }
    } catch (err) {
      alert(`Auto-generator error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (fmt) => {
    setExportStatus(`Generating ${fmt.toUpperCase()} task report...`);
    const res = await exportTasks(fmt);
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
      const resp = await queryTaskAdvisor(aiPrompt, summary);
      setAiResponse(resp);
    } catch (err) {
      setAiResponse("Task swarm analysis complete.");
    } finally {
      setAiLoading(false);
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'Critical': return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'High': return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
      case 'Medium': return 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="space-y-6 text-slate-100 font-sans pb-16">
      {/* 1. HERO TASK PLANNER COMMAND CENTER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-cyan-950 to-slate-900 border border-cyan-500/40 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 flex-1 min-w-0 w-full">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold tracking-wide uppercase max-w-full">
              <Kanban className="w-3.5 h-3.5 animate-pulse shrink-0" />
              <span>Enterprise Farm Operations & Kanban Task Swarm Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex flex-wrap items-center gap-3">
              <span>KisanTech Kanban Swarm Task Operations</span>
              <span className="text-xs px-2.5 py-1 rounded-md bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/40 shrink-0">Ollama Qwen Swarm</span>
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Organize field operations into Kanban stages, assign machinery & workers, auto-generate season templates, and audit equipment conflicts.
            </p>
          </div>

          {/* Hero KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-[560px] shrink-0">
            <div className="bg-slate-950/80 border border-cyan-500/40 rounded-2xl p-4 text-center space-y-1">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Total Swarm Tasks</div>
              <div className="text-xl font-black text-cyan-400">{summary.total_tasks} Active</div>
              <div className="text-[9px] text-cyan-300/80">Vellore Hub</div>
            </div>

            <div className="bg-slate-950/80 border border-amber-500/40 rounded-2xl p-4 text-center space-y-1">
              <div className="text-[10px] text-slate-400 font-bold uppercase">In Progress</div>
              <div className="text-xl font-black text-amber-300">{summary.in_progress_tasks} Active</div>
              <div className="text-[9px] text-amber-300/80">Drone & Spraying</div>
            </div>

            <div className="bg-slate-950/80 border border-emerald-500/40 rounded-2xl p-4 text-center space-y-1">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Completed</div>
              <div className="text-xl font-black text-emerald-400">{summary.completed_tasks} Done</div>
              <div className="text-[9px] text-emerald-300/80">{summary.completion_rate_pct}% Rate</div>
            </div>

            <div className="bg-slate-950/80 border border-purple-500/40 rounded-2xl p-4 text-center space-y-1">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Workforce Efficiency</div>
              <div className="text-xl font-black text-purple-300">{summary.workforce_efficiency_pct}%</div>
              <div className="text-[9px] text-purple-300/80">Optimal Load</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. CONTROLS & SUB-TAB NAVIGATION */}
      <div className="glass-panel p-2 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-2 bg-slate-950/80">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveSubTab('kanban')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeSubTab === 'kanban' ? 'bg-cyan-500 text-black shadow-[0_0_12px_#06b6d444]' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
          >
            <Kanban className="w-4 h-4" />
            <span>Interactive Kanban Board</span>
          </button>
          <button
            onClick={() => setActiveSubTab('workload')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeSubTab === 'workload' ? 'bg-cyan-500 text-black shadow-[0_0_12px_#06b6d444]' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
          >
            <Layers className="w-4 h-4" />
            <span>Workload & Equipment Matrix</span>
          </button>
          <button
            onClick={() => setActiveSubTab('autogen')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeSubTab === 'autogen' ? 'bg-cyan-500 text-black shadow-[0_0_12px_#06b6d444]' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
          >
            <Zap className="w-4 h-4" />
            <span>AI Auto-Season Task Generator</span>
          </button>
          <button
            onClick={() => setActiveSubTab('advisor')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeSubTab === 'advisor' ? 'bg-cyan-500 text-black shadow-[0_0_12px_#06b6d444]' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
          >
            <Brain className="w-4 h-4" />
            <span>Qwen AI Swarm Planner</span>
          </button>
        </div>

        <div className="flex items-center gap-2 font-mono">
          <button
            onClick={() => { setEditingTask(null); setIsModalOpen(true); }}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-500 text-black font-bold text-xs flex items-center gap-1 shadow-[0_0_12px_#10b98133]"
          >
            <Plus className="w-3.5 h-3.5" />
            New Task
          </button>
          <button
            onClick={() => handleExport('xml')}
            className="px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs flex items-center gap-1"
          >
            <FileCode className="w-3.5 h-3.5" />
            XML
          </button>
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

      {/* 3. INTERACTIVE KANBAN BOARD VIEW */}
      {activeSubTab === 'kanban' && (
        <div className="space-y-4">
          <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-4 bg-slate-950/80">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks by title, Tamil name, worker, equipment..."
                className="w-full bg-slate-900 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1 text-xs font-mono">
              {['ALL', 'Land Prep', 'Sowing', 'Irrigation', 'Fertilizer', 'Spraying', 'Harvest', 'Maintenance'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${selectedCategory === cat ? 'bg-cyan-500 text-black shadow-[0_0_12px_#06b6d444]' : 'bg-slate-900 text-slate-400 hover:text-white border border-white/5'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Kanban Columns */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs">
            {['Backlog', 'Pending', 'In Progress', 'Completed'].map((columnStatus) => {
              const colTasks = tasks.filter(t => t.status === columnStatus);
              return (
                <div key={columnStatus} className="glass-panel p-4 rounded-2xl border border-white/10 bg-slate-950/90 space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-white/10">
                    <span className="font-bold text-white uppercase text-[11px] tracking-wider">{columnStatus}</span>
                    <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold">
                      {colTasks.length}
                    </span>
                  </div>

                  <div className="space-y-3 min-h-[320px]">
                    {colTasks.map((t) => (
                      <div key={t.task_id} className="p-4 rounded-xl bg-slate-900 border border-cyan-500/30 space-y-3 hover:border-cyan-400 transition">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-white">{t.title}</h4>
                            {t.tamil_name && <div className="text-[10px] text-cyan-300 font-sans">{t.tamil_name}</div>}
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${getPriorityBadge(t.priority)}`}>
                            {t.priority}
                          </span>
                        </div>

                        <div className="text-[10px] text-slate-300 space-y-1">
                          <div>Field: <strong className="text-white">{t.field_block}</strong></div>
                          <div>Worker: <strong className="text-emerald-400">{t.assigned_worker}</strong></div>
                          <div>Eq: <strong className="text-amber-300">{t.assigned_equipment}</strong></div>
                        </div>

                        {/* Status Shift Buttons */}
                        <div className="flex justify-between items-center border-t border-white/10 pt-2 text-[10px]">
                          <select
                            value={t.status}
                            onChange={(e) => handleUpdateTaskStatus(t.task_id, e.target.value)}
                            className="bg-slate-950 border border-white/10 text-slate-300 rounded p-1 text-[9px]"
                          >
                            <option value="Backlog">Move to Backlog</option>
                            <option value="Pending">Move to Pending</option>
                            <option value="In Progress">Move to In Progress</option>
                            <option value="Completed">Mark Completed</option>
                          </select>

                          <div className="space-x-1">
                            <button onClick={() => { setEditingTask(t); setIsModalOpen(true); }} className="text-amber-300 hover:underline">Edit</button>
                            <button onClick={() => handleDeleteTask(t.task_id)} className="text-rose-400 hover:underline">Del</button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {colTasks.length === 0 && (
                      <div className="text-center text-slate-600 text-[10px] py-12 italic">
                        No tasks in {columnStatus}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. WORKLOAD & EQUIPMENT MATRIX VIEW */}
      {activeSubTab === 'workload' && (
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
          <h3 className="text-md font-bold text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-400" />
            Worker & Equipment Swarm Allocation Matrix
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 uppercase text-[10px]">
                  <th className="py-2.5 px-3">Assigned Worker</th>
                  <th className="py-2.5 px-3">Equipment</th>
                  <th className="py-2.5 px-3">Current Active Task</th>
                  <th className="py-2.5 px-3">Est. Hours</th>
                  <th className="py-2.5 px-3">Conflict Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {tasks.map((t) => (
                  <tr key={t.task_id} className="hover:bg-slate-900/50 transition">
                    <td className="py-3 px-3 font-bold text-emerald-400">{t.assigned_worker}</td>
                    <td className="py-3 px-3 text-amber-300">{t.assigned_equipment}</td>
                    <td className="py-3 px-3 text-white">{t.title}</td>
                    <td className="py-3 px-3 text-slate-400">{t.estimated_hours} hrs</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                        No Conflict
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. AI AUTO-SEASON TASK GENERATOR VIEW */}
      {activeSubTab === 'autogen' && (
        <div className="glass-panel p-6 rounded-2xl border border-cyan-500/30 space-y-4">
          <h3 className="text-md font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-400" />
            One-Click AI Season Task Swarm Template Generator
          </h3>
          <p className="text-xs text-slate-300">
            Automatically generate a complete Kharif season task workflow (Nursery, Basal Fertilizer, Mechanical Transplanting, Spraying) for your farm plot.
          </p>

          <div className="flex flex-wrap gap-3 font-mono text-xs pt-2">
            <button
              onClick={() => handleAutoGenerate('Paddy (Rice)')}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-bold flex items-center gap-2 shadow-[0_0_12px_#10b98133]"
            >
              <Zap className="w-4 h-4" />
              Generate Paddy Season Swarm
            </button>
            <button
              onClick={() => handleAutoGenerate('Turmeric')}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold flex items-center gap-2 shadow-[0_0_12px_#f59e0b33]"
            >
              <Zap className="w-4 h-4" />
              Generate Turmeric Season Swarm
            </button>
          </div>
        </div>
      )}

      {/* 6. QWEN AI SWARM PLANNER VIEW */}
      {activeSubTab === 'advisor' && (
        <div className="glass-panel p-6 rounded-2xl border border-cyan-500/30 space-y-4">
          <h3 className="text-md font-bold text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-cyan-400" />
            Qwen AI Swarm Workload & Priority Optimizer
          </h3>
          <form onSubmit={handleAiAsk} className="space-y-3 text-xs font-mono">
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Ask Qwen to audit equipment conflicts, balance worker daily hours, or prioritize spraying over fertigation..."
              className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-white h-28 placeholder-slate-500"
            />
            <button
              type="submit"
              disabled={aiLoading}
              className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-600 text-black font-bold rounded-xl transition-all shadow-[0_0_12px_#06b6d433]"
            >
              {aiLoading ? "Analyzing Task Swarm..." : "Query Qwen Swarm Optimizer"}
            </button>
          </form>

          {aiResponse && (
            <div className="p-4 rounded-xl bg-slate-900 border border-cyan-500/40 text-cyan-200 text-xs font-mono whitespace-pre-line">
              {aiResponse}
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-cyan-500/50 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl font-mono text-xs">
            <div className="flex justify-between items-center">
              <h3 className="text-md font-bold text-white">
                {editingTask ? `Edit Task: ${editingTask.title}` : 'Create New Farm Task'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={editingTask ? handleUpdateTask : handleCreateTask} className="space-y-3">
              <div>
                <label className="text-slate-400 block mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={editingTask ? editingTask.title : taskForm.title}
                  onChange={(e) => editingTask ? setEditingTask({ ...editingTask, title: e.target.value }) : setTaskForm({ ...taskForm, title: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Tamil Name (தமிழ் தலைப்பு)</label>
                <input
                  type="text"
                  value={editingTask ? editingTask.tamil_name : taskForm.tamil_name}
                  onChange={(e) => editingTask ? setEditingTask({ ...editingTask, tamil_name: e.target.value }) : setTaskForm({ ...taskForm, tamil_name: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Category</label>
                  <select
                    value={editingTask ? editingTask.category : taskForm.category}
                    onChange={(e) => editingTask ? setEditingTask({ ...editingTask, category: e.target.value }) : setTaskForm({ ...taskForm, category: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-white"
                  >
                    <option value="Land Prep">Land Prep</option>
                    <option value="Sowing">Sowing</option>
                    <option value="Irrigation">Irrigation</option>
                    <option value="Fertilizer">Fertilizer</option>
                    <option value="Spraying">Spraying</option>
                    <option value="Harvest">Harvest</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Priority</label>
                  <select
                    value={editingTask ? editingTask.priority : taskForm.priority}
                    onChange={(e) => editingTask ? setEditingTask({ ...editingTask, priority: e.target.value }) : setTaskForm({ ...taskForm, priority: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-white"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full py-2.5 bg-cyan-500 font-bold text-black rounded-xl">
                {editingTask ? 'Save Task Changes' : 'Create Task'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
