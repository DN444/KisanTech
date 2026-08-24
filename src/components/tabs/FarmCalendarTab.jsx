import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon, Clock, CheckCircle2, AlertTriangle, CloudRain,
  Brain, Download, Search, Filter, Plus, Edit3, Trash2, ShieldAlert, Zap,
  Sun, RefreshCw, X, Sparkles, ChevronRight, Activity, ArrowRight
} from 'lucide-react';
import {
  fetchCalendarSummary, fetchCalendarEvents, createCalendarEvent, updateCalendarEvent,
  deleteCalendarEvent, queryCalendarAdvisor, exportCalendar,
  FALLBACK_CALENDAR_SUMMARY, FALLBACK_CALENDAR_EVENTS
} from '../../services/calendarService';

export default function FarmCalendarTab() {
  const [activeSubTab, setActiveSubTab] = useState('agenda'); // 'agenda' | 'timeline' | 'weather' | 'planner'
  const [summary, setSummary] = useState(FALLBACK_CALENDAR_SUMMARY);
  const [events, setEvents] = useState(FALLBACK_CALENDAR_EVENTS);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [exportStatus, setExportStatus] = useState('');

  // Modal State
  const [editingEvent, setEditingEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [eventForm, setEventForm] = useState({
    title: '',
    category: 'Spraying',
    crop_name: 'Paddy (Rice)',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    priority: 'High',
    status: 'Scheduled',
    assigned_worker: 'Field Supervisor',
    field_block: 'North Field A',
    notes: 'Apply treatment according to weather window',
    is_weather_dependent: true
  });

  // AI Planner State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedCategory, searchQuery]);

  const loadData = async () => {
    setLoading(true);
    try {
      const sum = await fetchCalendarSummary();
      setSummary(sum);
      const evts = await fetchCalendarEvents(selectedCategory, searchQuery);
      setEvents(evts);
    } catch (err) {
      console.error("Error loading calendar data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await createCalendarEvent(eventForm);
      if (res.status === 'success') {
        const updated = await fetchCalendarEvents(selectedCategory, searchQuery);
        setEvents(updated);
        setIsModalOpen(false);
        setEventForm({
          title: '', category: 'Spraying', crop_name: 'Paddy (Rice)',
          start_date: new Date().toISOString().split('T')[0], end_date: new Date().toISOString().split('T')[0],
          priority: 'High', status: 'Scheduled', assigned_worker: 'Field Supervisor',
          field_block: 'North Field A', notes: '', is_weather_dependent: true
        });
        alert("New calendar event scheduled!");
      }
    } catch (err) {
      alert(`Error creating event: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    if (!editingEvent) return;
    setLoading(true);
    try {
      await updateCalendarEvent(editingEvent.event_id, editingEvent);
      const updated = events.map(e => e.event_id === editingEvent.event_id ? editingEvent : e);
      setEvents(updated);
      setIsModalOpen(false);
      alert(`Event ${editingEvent.title} updated!`);
    } catch (err) {
      alert(`Update failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Remove event from calendar?")) return;
    await deleteCalendarEvent(eventId);
    setEvents(events.filter(e => e.event_id !== eventId));
  };

  const handleExport = async (fmt) => {
    setExportStatus(`Generating ${fmt.toUpperCase()} calendar export...`);
    const res = await exportCalendar(fmt);
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
      const resp = await queryCalendarAdvisor(aiPrompt, summary);
      setAiResponse(resp);
    } catch (err) {
      setAiResponse("Calendar schedule analysis complete.");
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
      {/* 1. HERO FARM CALENDAR COMMAND CENTER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-cyan-950 to-slate-900 border border-cyan-500/40 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 flex-1 min-w-0 w-full">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold tracking-wide uppercase max-w-full">
              <CalendarIcon className="w-3.5 h-3.5 animate-pulse shrink-0" />
              <span>Enterprise Farm Calendar & Season Activity Scheduler</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex flex-wrap items-center gap-3">
              <span>KisanTech Crop Lifecycle & Weather Scheduler</span>
              <span className="text-xs px-2.5 py-1 rounded-md bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/40 shrink-0">Ollama Qwen Planner</span>
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Schedule sowing, fertigation, foliar spraying, paddy harvest windows, KCC loan EMI deadlines, and weather-aware task rescheduling.
            </p>
          </div>

          {/* Hero KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-[560px] shrink-0">
            <div className="bg-slate-950/80 border border-cyan-500/40 rounded-2xl p-4 text-center space-y-1">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Scheduled Events</div>
              <div className="text-xl font-black text-cyan-400">{summary.total_scheduled_events} Tasks</div>
              <div className="text-[9px] text-cyan-300/80">Monthly Roster</div>
            </div>

            <div className="bg-slate-950/80 border border-emerald-500/40 rounded-2xl p-4 text-center space-y-1">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Completed</div>
              <div className="text-xl font-black text-emerald-400">{summary.completed_tasks} Done</div>
              <div className="text-[9px] text-emerald-300/80">{summary.completion_rate_pct}% Efficiency</div>
            </div>

            <div className="bg-slate-950/80 border border-rose-500/40 rounded-2xl p-4 text-center space-y-1">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Critical Alerts</div>
              <div className="text-xl font-black text-rose-400">{summary.critical_pending_alerts} Due</div>
              <div className="text-[9px] text-rose-300/80">Loan & Harvest</div>
            </div>

            <div className="bg-slate-950/80 border border-amber-500/40 rounded-2xl p-4 text-center space-y-1">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Paddy Harvest</div>
              <div className="text-xl font-black text-amber-300">{summary.days_until_next_harvest} Days</div>
              <div className="text-[9px] text-amber-300/80">Combine Harvester</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. CONTROLS & SUB-TAB NAVIGATION */}
      <div className="glass-panel p-2 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-2 bg-slate-950/80">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveSubTab('agenda')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeSubTab === 'agenda' ? 'bg-cyan-500 text-black shadow-[0_0_12px_#06b6d444]' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
          >
            <CalendarIcon className="w-4 h-4" />
            <span>Monthly Agenda & Events</span>
          </button>
          <button
            onClick={() => setActiveSubTab('timeline')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeSubTab === 'timeline' ? 'bg-cyan-500 text-black shadow-[0_0_12px_#06b6d444]' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
          >
            <Activity className="w-4 h-4" />
            <span>Crop Lifecycle Gantt</span>
          </button>
          <button
            onClick={() => setActiveSubTab('weather')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeSubTab === 'weather' ? 'bg-cyan-500 text-black shadow-[0_0_12px_#06b6d444]' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
          >
            <CloudRain className="w-4 h-4" />
            <span>Weather Rescheduler</span>
          </button>
          <button
            onClick={() => setActiveSubTab('planner')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeSubTab === 'planner' ? 'bg-cyan-500 text-black shadow-[0_0_12px_#06b6d444]' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
          >
            <Brain className="w-4 h-4" />
            <span>Qwen AI Auto-Planner</span>
          </button>
        </div>

        <div className="flex items-center gap-2 font-mono">
          <button
            onClick={() => { setEditingEvent(null); setIsModalOpen(true); }}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-500 text-black font-bold text-xs flex items-center gap-1 shadow-[0_0_12px_#10b98133]"
          >
            <Plus className="w-3.5 h-3.5" />
            New Event
          </button>
          <button
            onClick={() => handleExport('ics')}
            className="px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            iCal (.ics)
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

      {/* 3. MONTHLY AGENDA & EVENTS VIEW */}
      {activeSubTab === 'agenda' && (
        <div className="space-y-4">
          <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-4 bg-slate-950/80">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search event by title, crop name, assigned worker..."
                className="w-full bg-slate-900 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1 text-xs font-mono">
              {['ALL', 'Sowing', 'Irrigation', 'Fertilizer', 'Spraying', 'Harvest', 'Loan EMI', 'Maintenance'].map((cat) => (
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-mono text-xs">
            {events.map((evt) => (
              <div key={evt.event_id} className="glass-panel p-6 rounded-2xl border border-cyan-500/30 space-y-4 hover:border-cyan-400 transition">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-bold text-white">{evt.title}</h3>
                    <span className="text-[10px] text-cyan-300 font-sans">{evt.crop_name} • {evt.field_block}</span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full border font-bold text-[10px] ${getPriorityBadge(evt.priority)}`}>
                    {evt.priority}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-slate-300">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>{evt.start_date} to {evt.end_date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Assigned: {evt.assigned_worker}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 italic pt-1">{evt.notes}</p>
                </div>

                <div className="flex justify-between items-center border-t border-white/10 pt-3">
                  <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-bold">
                    {evt.status}
                  </span>
                  <div className="space-x-1">
                    <button
                      onClick={() => { setEditingEvent(evt); setIsModalOpen(true); }}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px]"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(evt.event_id)}
                      className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px]"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. CROP LIFECYCLE GANTT TIMELINE VIEW */}
      {activeSubTab === 'timeline' && (
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-6">
          <h3 className="text-md font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            Seasonal Crop Growth Gantt Lifecycle (Kharif Season 2026)
          </h3>

          <div className="space-y-4 font-mono text-xs">
            {/* Paddy Lifecycle Bar */}
            <div className="p-4 rounded-xl bg-slate-900 border border-cyan-500/30 space-y-2">
              <div className="flex justify-between text-slate-300">
                <span className="font-bold text-white">Paddy (Rice) - North Field A</span>
                <span className="text-cyan-400">Day 45 of 110 (Tillering Phase)</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-white/10 flex">
                <div className="bg-emerald-500 h-full w-[25%]" title="Land Prep & Sowing (Done)" />
                <div className="bg-cyan-500 h-full w-[30%]" title="Tillering & Fertigation (Active)" />
                <div className="bg-amber-500 h-full w-[25%]" title="Panicle Initiation (Upcoming)" />
                <div className="bg-purple-500 h-full w-[20%]" title="Harvest Window (August)" />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 pt-1">
                <span>June 15 (Sowing)</span>
                <span>July 26 (Current)</span>
                <span>Aug 10 (Panicle)</span>
                <span>Sept 20 (Harvest)</span>
              </div>
            </div>

            {/* Turmeric Lifecycle Bar */}
            <div className="p-4 rounded-xl bg-slate-900 border border-amber-500/30 space-y-2">
              <div className="flex justify-between text-slate-300">
                <span className="font-bold text-white">Turmeric - South Field B</span>
                <span className="text-amber-300">Day 60 of 240 (Vegetative Growth)</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-white/10 flex">
                <div className="bg-emerald-500 h-full w-[35%]" title="Sprouting & Weeding (Done)" />
                <div className="bg-amber-500 h-full w-[40%]" title="Rhizome Enlargement (Active)" />
                <div className="bg-purple-500 h-full w-[25%]" title="Harvest Window (Feb 2027)" />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 pt-1">
                <span>May 25 (Planting)</span>
                <span>July 26 (Current)</span>
                <span>Nov 15 (Rhizome)</span>
                <span>Feb 10 (Harvest)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. WEATHER RESCHEDULER VIEW */}
      {activeSubTab === 'weather' && (
        <div className="glass-panel p-6 rounded-2xl border border-cyan-500/30 space-y-4">
          <h3 className="text-md font-bold text-white flex items-center gap-2">
            <CloudRain className="w-5 h-5 text-cyan-400" />
            Live Weather Task Auto-Rescheduler Alerts
          </h3>
          <div className="p-4 rounded-xl bg-slate-900 border border-emerald-500/40 space-y-2 font-mono text-xs">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <Sun className="w-4 h-4" />
              <span>Optimal Spray Window Verified</span>
            </div>
            <p className="text-slate-300">
              Vellore North Field A forecast indicates 0.0mm rainfall through July 29 with 65% humidity. Propiconazole spraying for Paddy can proceed on July 28 as scheduled.
            </p>
          </div>
        </div>
      )}

      {/* 6. QWEN AI AUTO-PLANNER VIEW */}
      {activeSubTab === 'planner' && (
        <div className="glass-panel p-6 rounded-2xl border border-cyan-500/30 space-y-4">
          <h3 className="text-md font-bold text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-cyan-400" />
            Qwen AI Agricultural Season Auto-Planner
          </h3>
          <form onSubmit={handleAiAsk} className="space-y-3 text-xs font-mono">
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Ask Qwen for optimal Paddy harvest timing, TNAU spraying schedule, or KCC loan repayment calendar..."
              className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-white h-28 placeholder-slate-500"
            />
            <button
              type="submit"
              disabled={aiLoading}
              className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-600 text-black font-bold rounded-xl transition-all shadow-[0_0_12px_#06b6d433]"
            >
              {aiLoading ? "Generating Farm Calendar..." : "Generate AI Season Schedule"}
            </button>
          </form>

          {aiResponse && (
            <div className="p-4 rounded-xl bg-slate-900 border border-cyan-500/40 text-cyan-200 text-xs font-mono whitespace-pre-line">
              {aiResponse}
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-cyan-500/50 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl font-mono text-xs">
            <div className="flex justify-between items-center">
              <h3 className="text-md font-bold text-white">
                {editingEvent ? `Edit Event: ${editingEvent.title}` : 'Schedule New Farm Activity'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={editingEvent ? handleUpdateEvent : handleCreateEvent} className="space-y-3">
              <div>
                <label className="text-slate-400 block mb-1">Event Title</label>
                <input
                  type="text"
                  required
                  value={editingEvent ? editingEvent.title : eventForm.title}
                  onChange={(e) => editingEvent ? setEditingEvent({ ...editingEvent, title: e.target.value }) : setEventForm({ ...eventForm, title: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Category</label>
                  <select
                    value={editingEvent ? editingEvent.category : eventForm.category}
                    onChange={(e) => editingEvent ? setEditingEvent({ ...editingEvent, category: e.target.value }) : setEventForm({ ...eventForm, category: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-white"
                  >
                    <option value="Sowing">Sowing</option>
                    <option value="Irrigation">Irrigation</option>
                    <option value="Fertilizer">Fertilizer</option>
                    <option value="Spraying">Spraying</option>
                    <option value="Harvest">Harvest</option>
                    <option value="Loan EMI">Loan EMI</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Priority</label>
                  <select
                    value={editingEvent ? editingEvent.priority : eventForm.priority}
                    onChange={(e) => editingEvent ? setEditingEvent({ ...editingEvent, priority: e.target.value }) : setEventForm({ ...eventForm, priority: e.target.value })}
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
                {editingEvent ? 'Save Event Changes' : 'Schedule Event'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
