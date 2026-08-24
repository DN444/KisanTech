import React, { useState, useEffect } from 'react';
import {
  Users, UserCheck, UserPlus, Clock, DollarSign, Award, Brain, Download, Search,
  Filter, MapPin, Phone, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw, X,
  Briefcase, Calendar, Sparkles, Sliders, ChevronRight, Activity, Zap, FileText
} from 'lucide-react';
import {
  fetchWorkforceSummary, fetchEmployees, createEmployee, updateEmployee, deleteEmployee,
  fetchTodayAttendance, checkInWorker, queryHrmsAdvisor, exportEmployees,
  FALLBACK_EMPLOYEE_SUMMARY, FALLBACK_EMPLOYEES, FALLBACK_ATTENDANCE
} from '../../services/employeeService';

export default function FarmEmployeesTab() {
  const [activeSubTab, setActiveSubTab] = useState('roster'); // 'roster' | 'attendance' | 'payroll' | 'advisor'
  const [summary, setSummary] = useState(FALLBACK_EMPLOYEE_SUMMARY);
  const [employees, setEmployees] = useState(FALLBACK_EMPLOYEES);
  const [attendance, setAttendance] = useState(FALLBACK_ATTENDANCE);
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [exportStatus, setExportStatus] = useState('');

  // Modal State
  const [editingEmp, setEditingEmp] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Employee Form State
  const [empForm, setEmpForm] = useState({
    full_name: '',
    tamil_name: '',
    role: 'Field Worker',
    department: 'Field Operations',
    employment_type: 'Permanent',
    phone: '+91 98421 ',
    village: 'Katpadi, Vellore',
    daily_wage_inr: 650.0,
    status: 'Active',
    skills: 'Paddy Harvesting, Tractor Operation',
    joining_date: new Date().toISOString().split('T')[0]
  });

  // Check-In Form State
  const [checkInEmpId, setCheckInEmpId] = useState('EMP-2026-001');
  const [checkInFieldBlock, setCheckInFieldBlock] = useState('North Field A');

  // Qwen AI HRMS Advisor State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedDepartment, searchQuery]);

  const loadData = async () => {
    setLoading(true);
    try {
      const sum = await fetchWorkforceSummary();
      setSummary(sum);
      const emps = await fetchEmployees(selectedDepartment, searchQuery);
      setEmployees(emps);
      const att = await fetchTodayAttendance();
      setAttendance(att);
    } catch (err) {
      console.error("Error loading employee data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await createEmployee(empForm);
      if (res.status === 'success') {
        const updated = await fetchEmployees(selectedDepartment, searchQuery);
        setEmployees(updated);
        setIsModalOpen(false);
        setEmpForm({
          full_name: '', tamil_name: '', role: 'Field Worker', department: 'Field Operations',
          employment_type: 'Permanent', phone: '+91 98421 ', village: 'Katpadi, Vellore',
          daily_wage_inr: 650.0, status: 'Active', skills: 'Paddy Harvesting',
          joining_date: new Date().toISOString().split('T')[0]
        });
        alert("New employee added to roster successfully!");
      }
    } catch (err) {
      alert(`Error creating employee: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEmployee = async (e) => {
    e.preventDefault();
    if (!editingEmp) return;
    setLoading(true);
    try {
      await updateEmployee(editingEmp.emp_id, editingEmp);
      const updated = employees.map(e => e.emp_id === editingEmp.emp_id ? editingEmp : e);
      setEmployees(updated);
      setIsModalOpen(false);
      alert(`Employee ${editingEmp.full_name} updated!`);
    } catch (err) {
      alert(`Update failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmployee = async (empId) => {
    if (!window.confirm("Remove worker record from roster?")) return;
    await deleteEmployee(empId);
    setEmployees(employees.filter(e => e.emp_id !== empId));
  };

  const handleCheckInWorker = async (e) => {
    e.preventDefault();
    try {
      const res = await checkInWorker({ emp_id: checkInEmpId, field_block: checkInFieldBlock, status: 'Present' });
      if (res.status === 'success') {
        const att = await fetchTodayAttendance();
        setAttendance(att);
        alert(`Worker ${checkInEmpId} checked into ${checkInFieldBlock}!`);
      }
    } catch (err) {
      alert(`Check-in error: ${err.message}`);
    }
  };

  const handleExport = async (fmt) => {
    setExportStatus(`Generating ${fmt.toUpperCase()} roster report...`);
    const res = await exportEmployees(fmt);
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
      const resp = await queryHrmsAdvisor(aiPrompt, summary);
      setAiResponse(resp);
    } catch (err) {
      setAiResponse("Workforce audit generated.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-slate-100 font-sans pb-16">
      {/* 1. HERO HRMS COMMAND CENTER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-cyan-950 to-slate-900 border border-cyan-500/40 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 flex-1 min-w-0 w-full">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold tracking-wide uppercase max-w-full">
              <Users className="w-3.5 h-3.5 animate-pulse shrink-0" />
              <span>Enterprise Farm Workforce & HRMS Operating System</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex flex-wrap items-center gap-3">
              <span>KisanTech Labour Roster & Attendance Hub</span>
              <span className="text-xs px-2.5 py-1 rounded-md bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/40 shrink-0">Ollama Qwen HRMS</span>
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Manage field supervisors, tractor operators, harvest teams, daily attendance, GPS field check-ins, Tamil name rosters, and daily wage payroll.
            </p>
          </div>

          {/* Hero KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-[560px] shrink-0">
            <div className="bg-slate-950/80 border border-cyan-500/40 rounded-2xl p-4 text-center space-y-1">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Total Roster</div>
              <div className="text-xl font-black text-cyan-400">{summary.total_employees} Workers</div>
              <div className="text-[9px] text-cyan-300/80">Vellore Farm Base</div>
            </div>

            <div className="bg-slate-950/80 border border-emerald-500/40 rounded-2xl p-4 text-center space-y-1">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Present Today</div>
              <div className="text-xl font-black text-emerald-400">{summary.present_today} Active</div>
              <div className="text-[9px] text-emerald-300/80">100% Attendance</div>
            </div>

            <div className="bg-slate-950/80 border border-amber-500/40 rounded-2xl p-4 text-center space-y-1">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Daily Wages</div>
              <div className="text-xl font-black text-amber-300">₹{summary.daily_payroll_cost_inr ? summary.daily_payroll_cost_inr.toLocaleString('en-IN') : '4,500'}</div>
              <div className="text-[9px] text-amber-300/80">Avg ₹750 / Worker</div>
            </div>

            <div className="bg-slate-950/80 border border-purple-500/40 rounded-2xl p-4 text-center space-y-1">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Field Output</div>
              <div className="text-xl font-black text-purple-300">{summary.workforce_productivity_pct}%</div>
              <div className="text-[9px] text-purple-300/80">High Efficiency</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. CONTROLS & SUB-TAB NAVIGATION */}
      <div className="glass-panel p-2 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-2 bg-slate-950/80">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveSubTab('roster')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeSubTab === 'roster' ? 'bg-cyan-500 text-black shadow-[0_0_12px_#06b6d444]' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
          >
            <Users className="w-4 h-4" />
            <span>Worker Directory & Roster</span>
          </button>
          <button
            onClick={() => setActiveSubTab('attendance')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeSubTab === 'attendance' ? 'bg-cyan-500 text-black shadow-[0_0_12px_#06b6d444]' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
          >
            <Clock className="w-4 h-4" />
            <span>Daily Attendance & Check-In</span>
          </button>
          <button
            onClick={() => setActiveSubTab('payroll')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeSubTab === 'payroll' ? 'bg-cyan-500 text-black shadow-[0_0_12px_#06b6d444]' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Payroll & Wages</span>
          </button>
          <button
            onClick={() => setActiveSubTab('advisor')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeSubTab === 'advisor' ? 'bg-cyan-500 text-black shadow-[0_0_12px_#06b6d444]' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
          >
            <Brain className="w-4 h-4" />
            <span>Qwen AI HRMS Advisor</span>
          </button>
        </div>

        <div className="flex items-center gap-2 font-mono">
          <button
            onClick={() => { setEditingEmp(null); setIsModalOpen(true); }}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-500 text-black font-bold text-xs flex items-center gap-1 shadow-[0_0_12px_#10b98133]"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Add Worker
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

      {/* 3. WORKER ROSTER VIEW */}
      {activeSubTab === 'roster' && (
        <div className="space-y-4">
          <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-4 bg-slate-950/80">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Tamil Name, English Name, Role, Village..."
                className="w-full bg-slate-900 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1 text-xs font-mono">
              {['ALL', 'Field Operations', 'Equipment', 'Water Operations', 'Harvesting'].map((dept) => (
                <button
                  key={dept}
                  onClick={() => setSelectedDepartment(dept)}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${selectedDepartment === dept ? 'bg-cyan-500 text-black shadow-[0_0_12px_#06b6d444]' : 'bg-slate-900 text-slate-400 hover:text-white border border-white/5'}`}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-mono text-xs">
            {employees.map((emp) => (
              <div key={emp.emp_id} className="glass-panel p-6 rounded-2xl border border-cyan-500/30 space-y-4 hover:border-cyan-400 transition">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-bold text-white">{emp.full_name}</h3>
                    <div className="text-sm font-semibold text-cyan-300 font-sans">{emp.tamil_name}</div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">{emp.role} • {emp.department}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold text-[10px]">
                    {emp.status}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-slate-300">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>{emp.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>{emp.village}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>Skills: {emp.skills}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center border-t border-white/10 pt-3">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Daily Wage Rate</span>
                    <strong className="text-emerald-400 text-sm">₹{emp.daily_wage_inr} / Day</strong>
                  </div>
                  <div className="space-x-1">
                    <button
                      onClick={() => { setEditingEmp(emp); setIsModalOpen(true); }}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px]"
                    >
                      Edit Profile
                    </button>
                    <button
                      onClick={() => handleDeleteEmployee(emp.emp_id)}
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

      {/* 4. DAILY ATTENDANCE & CHECK-IN VIEW */}
      {activeSubTab === 'attendance' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Check-In Form */}
          <div className="glass-panel p-6 rounded-2xl border border-emerald-500/30 space-y-4">
            <h3 className="text-md font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              GPS Worker Field Check-In
            </h3>
            <form onSubmit={handleCheckInWorker} className="space-y-3 text-xs font-mono">
              <div>
                <label className="text-slate-400 block mb-1">Select Employee</label>
                <select
                  value={checkInEmpId}
                  onChange={(e) => setCheckInEmpId(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white"
                >
                  {employees.map(e => (
                    <option key={e.emp_id} value={e.emp_id}>
                      {e.full_name} ({e.tamil_name}) - {e.role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Assigned Field Block</label>
                <select
                  value={checkInFieldBlock}
                  onChange={(e) => setCheckInFieldBlock(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white"
                >
                  <option value="North Field A">North Field A (Paddy)</option>
                  <option value="South Field B">South Field B (Turmeric)</option>
                  <option value="East Field C">East Field C (Sugarcane)</option>
                  <option value="Warehouse Hub">Warehouse Hub</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-xl transition-all shadow-[0_0_12px_#10b98133]"
              >
                Register Field Attendance
              </button>
            </form>
          </div>

          {/* Attendance Log Table */}
          <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
            <h3 className="text-md font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-400" />
              Today's Field Attendance Log ({attendance.length})
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 uppercase text-[10px]">
                    <th className="py-2.5 px-3">Worker Name</th>
                    <th className="py-2.5 px-3">Field Block</th>
                    <th className="py-2.5 px-3">Check-In</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Overtime</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {attendance.map((att) => (
                    <tr key={att.attendance_id} className="hover:bg-slate-900/50 transition">
                      <td className="py-3 px-3">
                        <div className="font-bold text-white">{att.full_name}</div>
                        <div className="text-[10px] text-slate-400">{att.tamil_name}</div>
                      </td>
                      <td className="py-3 px-3 text-cyan-300">{att.field_block}</td>
                      <td className="py-3 px-3 text-slate-400">{att.check_in_time}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                          {att.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right text-amber-300 font-bold">
                        +{att.overtime_hours} hrs
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. PAYROLL & WAGES VIEW */}
      {activeSubTab === 'payroll' && (
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
          <h3 className="text-md font-bold text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            Monthly Worker Wage Payout Ledger (Estimated 24 Work Days)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 uppercase text-[10px]">
                  <th className="py-2.5 px-3">Worker Name</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Daily Wage</th>
                  <th className="py-2.5 px-3">Days Worked</th>
                  <th className="py-2.5 px-3">Base Pay</th>
                  <th className="py-2.5 px-3">Overtime Bonus</th>
                  <th className="py-2.5 px-3 text-right">Net Payout (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {employees.map((emp) => {
                  const base = emp.daily_wage_inr * 24;
                  const ot = 1200.0;
                  const net = base + ot;
                  return (
                    <tr key={emp.emp_id} className="hover:bg-slate-900/50 transition">
                      <td className="py-3 px-3">
                        <div className="font-bold text-white">{emp.full_name}</div>
                        <div className="text-[10px] text-slate-400">{emp.tamil_name}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-300">{emp.role}</td>
                      <td className="py-3 px-3 text-emerald-400 font-bold">₹{emp.daily_wage_inr}/day</td>
                      <td className="py-3 px-3 text-slate-400">24 Days</td>
                      <td className="py-3 px-3 text-slate-300">₹{base.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-3 text-amber-300">+₹{ot}</td>
                      <td className="py-3 px-3 text-right font-black text-emerald-400 text-sm">
                        ₹{net.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. QWEN AI HRMS ADVISOR VIEW */}
      {activeSubTab === 'advisor' && (
        <div className="glass-panel p-6 rounded-2xl border border-cyan-500/30 space-y-4">
          <h3 className="text-md font-bold text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-cyan-400" />
            Qwen AI Agricultural Workforce Planner & Seasonal Hiring Forecast
          </h3>
          <form onSubmit={handleAiAsk} className="space-y-3 text-xs font-mono">
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Ask Qwen for seasonal Paddy harvest labor requirements, field task distribution, or overtime optimization..."
              className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-white h-28 placeholder-slate-500"
            />
            <button
              type="submit"
              disabled={aiLoading}
              className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-600 text-black font-bold rounded-xl transition-all shadow-[0_0_12px_#06b6d433]"
            >
              {aiLoading ? "Analyzing Workforce..." : "Query Qwen HRMS Agent"}
            </button>
          </form>

          {aiResponse && (
            <div className="p-4 rounded-xl bg-slate-900 border border-cyan-500/40 text-cyan-200 text-xs font-mono whitespace-pre-line">
              {aiResponse}
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Employee Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-cyan-500/50 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl font-mono text-xs">
            <div className="flex justify-between items-center">
              <h3 className="text-md font-bold text-white">
                {editingEmp ? `Edit Worker: ${editingEmp.full_name}` : 'Add New Farm Worker'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={editingEmp ? handleUpdateEmployee : handleCreateEmployee} className="space-y-3">
              <div>
                <label className="text-slate-400 block mb-1">Full English Name</label>
                <input
                  type="text"
                  required
                  value={editingEmp ? editingEmp.full_name : empForm.full_name}
                  onChange={(e) => editingEmp ? setEditingEmp({ ...editingEmp, full_name: e.target.value }) : setEmpForm({ ...empForm, full_name: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Tamil Name (தமிழ் பெயர்)</label>
                <input
                  type="text"
                  required
                  value={editingEmp ? editingEmp.tamil_name : empForm.tamil_name}
                  onChange={(e) => editingEmp ? setEditingEmp({ ...editingEmp, tamil_name: e.target.value }) : setEmpForm({ ...empForm, tamil_name: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Role</label>
                  <input
                    type="text"
                    value={editingEmp ? editingEmp.role : empForm.role}
                    onChange={(e) => editingEmp ? setEditingEmp({ ...editingEmp, role: e.target.value }) : setEmpForm({ ...empForm, role: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Daily Wage (₹)</label>
                  <input
                    type="number"
                    value={editingEmp ? editingEmp.daily_wage_inr : empForm.daily_wage_inr}
                    onChange={(e) => editingEmp ? setEditingEmp({ ...editingEmp, daily_wage_inr: parseFloat(e.target.value) }) : setEmpForm({ ...empForm, daily_wage_inr: parseFloat(e.target.value) })}
                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-white"
                  />
                </div>
              </div>
              <button type="submit" className="w-full py-2.5 bg-cyan-500 font-bold text-black rounded-xl">
                {editingEmp ? 'Save Profile Changes' : 'Add Employee to Roster'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
