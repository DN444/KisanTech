import React, { useState, useEffect } from 'react';
import {
  Cpu, Activity, Zap, Droplets, ShieldAlert, Radio, Server, RefreshCw, Plus, Edit3, Trash2, Copy,
  Download, Play, Pause, AlertTriangle, CheckCircle, Compass, Flame, Thermometer, Wind, Sun,
  BarChart2, MapPin, Eye, FileText, Settings, Sliders, Plane, Gauge, Tractor, Power, Battery, Navigation, Wrench, ExternalLink
} from 'lucide-react';
import { AIBadgePanel } from '../ui/AIBadgePanel';
import {
  fetchIotDevices, fetchIotTelemetry, createIotDevice, updateIotDevice, deleteIotDevice, duplicateIotDevice,
  fetchIotRules, toggleIotRule, fetchIotAlerts, queryIotAiAdvisor, calculateIrrigationRuntime, exportIotDossier, FALLBACK_TELEMETRY
} from '../../services/iotService';
import {
  fetchUavFleet, fetchUavMissions, createUavMission, fetchUavTelemetry, queryUavAiAdvisor, calculateUavCoverage, exportUavDossier, FALLBACK_UAV_TELEMETRY
} from '../../services/droneService';
import {
  fetchSensorsCatalog, querySensorAiAdvisor, fetchSensorMarketplace, exportSensorDossier, FALLBACK_33_SENSORS
} from '../../services/sensorMonitorService';
import {
  fetchEquipmentInventory, queryEquipmentAiAdvisor, calculateEquipmentRoi, fetchEquipmentMarketplace, exportEquipmentDossier, FALLBACK_EQUIPMENT
} from '../../services/smartEquipmentService';

export const IoTTabs = ({ subTab }) => {
  // Global State
  const [mode, setMode] = useState('Simulation'); // Live, Simulation, Historical
  const [scenario, setScenario] = useState('Normal Operations');
  const [autoRefreshSec, setAutoRefreshSec] = useState(5);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Drone Operations Specific State
  const [droneFleet, setDroneFleet] = useState([]);
  const [droneMissions, setDroneMissions] = useState([]);
  const [uavTelemetry, setUavTelemetry] = useState(FALLBACK_UAV_TELEMETRY);
  const [uavCalcAcres, setUavCalcAcres] = useState(12.5);
  const [uavCalcResult, setUavCalcResult] = useState(null);
  const [showNewMissionModal, setShowNewMissionModal] = useState(false);
  const [missionForm, setMissionForm] = useState({
    title: 'Katpadi Block #1 Foliar Spray',
    mission_type: 'Spraying',
    drone_id: 'UAV-AGRAS-01',
    farm_zone: 'Katpadi Field Block #1',
    target_crop: 'Rice (Paddy)',
    target_area_acres: 12.5,
    target_altitude_m: 14.5,
    target_speed_ms: 4.2
  });

  // Sensor Monitor Specific State
  const [sensorCatalog, setSensorCatalog] = useState(FALLBACK_33_SENSORS);
  const [sensorCategory, setSensorCategory] = useState('ALL');
  const [sensorMarketplace, setSensorMarketplace] = useState([]);
  const [selectedSensorDetail, setSelectedSensorDetail] = useState(null);

  // Smart Equipment Specific State
  const [equipmentFleet, setEquipmentFleet] = useState(FALLBACK_EQUIPMENT);
  const [equipmentCategory, setEquipmentCategory] = useState('ALL');
  const [equipmentMarketplace, setEquipmentMarketplace] = useState([]);
  const [eqRoiPrice, setEqRoiPrice] = useState(720000);
  const [eqRoiAcres, setEqRoiAcres] = useState(12.5);
  const [eqRoiResult, setEqRoiResult] = useState(null);

  const [devices, setDevices] = useState([]);
  const [telemetry, setTelemetry] = useState(FALLBACK_TELEMETRY);
  const [rules, setRules] = useState([]);
  const [alerts, setAlerts] = useState([]);
  
  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // AI & Calculator State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Modal States
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [deviceForm, setDeviceForm] = useState({
    device_id: '', name: '', hardware_type: 'ESP32 Node', protocol: 'LoRaWAN',
    farm_name: 'Katpadi Smart Farm', zone: 'Zone A - Paddy', crop: 'Rice (Paddy)', location: 'Field Node 1'
  });

  const [showCalcModal, setShowCalcModal] = useState(false);
  const [calcInputs, setCalcInputs] = useState({ crop: 'Rice (Paddy)', acreage: 2.5, moisture: 32.0, target: 45.0, flow: 14.2 });
  const [calcResult, setCalcResult] = useState(null);

  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState('json');
  const [exportStatus, setExportStatus] = useState(null);

  // Load Data
  const loadData = async () => {
    setIsRefreshing(true);
    const [devData, telData, ruleData, altData, fleetData, msnData, uavTelData, sensorsCat, mktData, eqData, eqMktData] = await Promise.all([
      fetchIotDevices(searchQuery, statusFilter),
      fetchIotTelemetry(mode, scenario),
      fetchIotRules(),
      fetchIotAlerts(),
      fetchUavFleet(),
      fetchUavMissions(),
      fetchUavTelemetry(mode),
      fetchSensorsCatalog(sensorCategory, searchQuery),
      fetchSensorMarketplace(),
      fetchEquipmentInventory(equipmentCategory, searchQuery),
      fetchEquipmentMarketplace()
    ]);
    setDevices(devData);
    setTelemetry(telData);
    setRules(ruleData);
    setAlerts(altData);
    setDroneFleet(fleetData);
    setDroneMissions(msnData);
    setUavTelemetry(uavTelData);
    setSensorCatalog(sensorsCat);
    setSensorMarketplace(mktData);
    setEquipmentFleet(eqData);
    setEquipmentMarketplace(eqMktData);
    setIsRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, [mode, scenario, searchQuery, statusFilter, sensorCategory, equipmentCategory]);

  // Auto Refresh Interval
  useEffect(() => {
    if (autoRefreshSec === 0) return;
    const interval = setInterval(() => {
      loadData();
    }, autoRefreshSec * 1000);
    return () => clearInterval(interval);
  }, [autoRefreshSec, mode, scenario]);

  // CRUD Handlers
  const handleSaveDevice = async (e) => {
    e.preventDefault();
    if (editingDevice) {
      await updateIotDevice(editingDevice.device_id, deviceForm);
    } else {
      await createIotDevice(deviceForm);
    }
    setShowDeviceModal(false);
    setEditingDevice(null);
    loadData();
  };

  const handleDeleteDevice = async (id) => {
    if (window.confirm(`Archive IoT device ${id}?`)) {
      await deleteIotDevice(id);
      loadData();
    }
  };

  const handleDuplicateDevice = async (id) => {
    await duplicateIotDevice(id);
    loadData();
  };

  // Rule Toggle
  const handleToggleRule = async (ruleId, currentStatus) => {
    await toggleIotRule(ruleId, !currentStatus);
    loadData();
  };

  // AI Diagnostic Query
  const handleAskAI = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    const context = `Current Telemetry: Mode=${mode}, Scenario=${scenario}, SoilMoisture=${telemetry.soil_moisture_pct}%, AirTemp=${telemetry.air_temp_c}°C, Pump=${telemetry.pump_status}, MotorCurrent=${telemetry.motor_current_a}A, NPK Nitrogen=${telemetry.nitrogen_ppm}ppm.`;
    const res = await queryIotAiAdvisor(aiPrompt, context);
    setAiResponse(res.response);
    setAiLoading(false);
  };

  // Calculator Run
  const handleRunCalculator = async () => {
    const res = await calculateIrrigationRuntime(
      calcInputs.crop, parseFloat(calcInputs.acreage), parseFloat(calcInputs.moisture),
      parseFloat(calcInputs.target), parseFloat(calcInputs.flow)
    );
    setCalcResult(res);
  };

  // Export File Run
  const handleExecuteExport = async () => {
    setExportStatus('Generating file...');
    const res = await exportIotDossier(exportFormat);
    if (res.success) {
      const blob = new Blob([typeof res.content === 'object' ? JSON.stringify(res.content, null, 2) : res.content], { type: res.mime_type || 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = res.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setExportStatus(`Downloaded ${res.filename} cleanly!`);
    } else {
      setExportStatus(`Export error. Regenerating report...`);
    }
  };

  // Render Sub Tabs
  const renderTabContent = () => {
    switch (subTab) {
      case 'drone-management':
        return renderDroneManagementView();
      case 'sensor-monitor':
        return renderSensorMonitorView();
      case 'smart-equipment':
        return renderSmartEquipmentView();
      case 'iot-dashboard':
      default:
        return renderIotDashboardView();
    }
  };

  // -------------------------------------------------------------
  // SUB TAB 1: IOT DASHBOARD (MAIN COMMAND CENTER)
  // -------------------------------------------------------------
  const renderIotDashboardView = () => (
    <div className="space-y-6">
      {/* 3D Farm Digital Twin Map Simulator */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden bg-gradient-to-b from-slate-900/90 to-black/90">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-emerald-500 animate-ping"></span>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                3D Interactive Digital Twin & Farm Mesh Map
              </h3>
            </div>
            <p className="text-xs text-slate-400">Live spatial position of connected hardware nodes, water pipelines, and UAV flight path</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Mesh Protocol: LoRaWAN 868MHz + MQTT
            </span>
            <span className="px-2.5 py-1 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Latency: 12ms
            </span>
          </div>
        </div>

        {/* 3D Visualizer Simulation Box */}
        <div className="h-72 rounded-xl bg-slate-950 border border-white/10 relative overflow-hidden flex items-center justify-center group">
          <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-20"></div>
          
          {/* Animated Water Flow Line */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-cyan-500/30">
            <div className="h-full bg-cyan-400 shadow-[0_0_12px_#06b6d4] animate-pulse w-full"></div>
          </div>

          {/* Node 1: ESP32 */}
          <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 shadow-[0_0_16px_#10b981] animate-bounce">
              <Radio className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono text-emerald-300 mt-1 bg-black/80 px-2 py-0.5 rounded border border-emerald-500/30">ESP32 Node #1 (Moisture: {telemetry.soil_moisture_pct}%)</span>
          </div>

          {/* Node 2: Submersible Pump */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center text-cyan-400 shadow-[0_0_20px_#06b6d4]">
              <Zap className="w-6 h-6 animate-spin" style={{ animationDuration: '4s' }} />
            </div>
            <span className="text-[10px] font-mono text-cyan-300 mt-1 bg-black/80 px-2 py-0.5 rounded border border-cyan-500/30">Main Pump ({telemetry.pump_status})</span>
          </div>

          {/* Node 3: Drone UAV */}
          <div className="absolute top-1/3 right-1/4 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-indigo-500/20 border-2 border-indigo-400 flex items-center justify-center text-indigo-400 shadow-[0_0_16px_#6366f1]">
              <Plane className="w-5 h-5 animate-pulse" />
            </div>
            <span className="text-[10px] font-mono text-indigo-300 mt-1 bg-black/80 px-2 py-0.5 rounded border border-indigo-500/30">UAV Spraying (Alt: 14.5m)</span>
          </div>

          <div className="absolute bottom-3 left-3 text-[11px] font-mono text-slate-400 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-white/10">
            GPS Grid: 12.9716° N, 79.1584° E • Katpadi Field Block #1
          </div>
        </div>
      </div>

      {/* Real-time Circular Sensor Gauges Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Gauge 1: Soil Moisture */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-emerald-500/30 transition-all">
          <div className="flex justify-between items-center text-xs text-slate-400 mb-2 font-mono">
            <span>SOIL MOISTURE</span>
            <Droplets className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-white">{telemetry.soil_moisture_pct}%</span>
            <span className="text-xs text-emerald-400 font-semibold font-mono">30-50% Target</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
            <div className="bg-emerald-400 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, telemetry.soil_moisture_pct)}%` }}></div>
          </div>
        </div>

        {/* Gauge 2: Air Temperature */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-amber-500/30 transition-all">
          <div className="flex justify-between items-center text-xs text-slate-400 mb-2 font-mono">
            <span>AIR TEMP</span>
            <Thermometer className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-white">{telemetry.air_temp_c}°C</span>
            <span className="text-xs text-amber-400 font-semibold font-mono">Humidity: {telemetry.humidity_pct}%</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
            <div className="bg-amber-400 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (telemetry.air_temp_c / 50) * 100)}%` }}></div>
          </div>
        </div>

        {/* Gauge 3: Motor Current */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-cyan-500/30 transition-all">
          <div className="flex justify-between items-center text-xs text-slate-400 mb-2 font-mono">
            <span>PUMP CURRENT</span>
            <Zap className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-white">{telemetry.motor_current_a} A</span>
            <span className="text-xs text-cyan-400 font-semibold font-mono">{telemetry.motor_voltage_v} V</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
            <div className="bg-cyan-400 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (telemetry.motor_current_a / 20) * 100)}%` }}></div>
          </div>
        </div>

        {/* Gauge 4: Soil Nitrogen (NPK) */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-purple-500/30 transition-all">
          <div className="flex justify-between items-center text-xs text-slate-400 mb-2 font-mono">
            <span>SOIL NITROGEN</span>
            <Cpu className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-white">{telemetry.nitrogen_ppm}</span>
            <span className="text-xs text-purple-400 font-semibold font-mono">ppm (pH: {telemetry.soil_ph})</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
            <div className="bg-purple-400 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (telemetry.nitrogen_ppm / 250) * 100)}%` }}></div>
          </div>
        </div>
      </div>

      {/* Device Management Fleet Table */}
      <div className="glass-panel rounded-2xl border border-white/10 p-6 space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              Registered Hardware Fleet ({devices.length} Nodes)
            </h3>
            <p className="text-xs text-slate-400">ESP32, Raspberry Pi, Arduino, LoRaWAN & Jetson Edge Hardware Nodes</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search devices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
            />
            <button
              onClick={() => { setEditingDevice(null); setDeviceForm({ device_id: `IOT-${Date.now()}`, name: '', hardware_type: 'ESP32 Node', protocol: 'LoRaWAN', farm_name: 'Katpadi Smart Farm', zone: 'Zone A - Paddy', crop: 'Rice (Paddy)', location: 'Field Node 1' }); setShowDeviceModal(true); }}
              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-black font-semibold text-xs flex items-center gap-1.5 transition-all shadow-[0_0_12px_#10b98133]"
            >
              <Plus className="w-3.5 h-3.5" />
              Register Device
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 text-slate-400 font-mono text-[11px] uppercase border-b border-white/10">
              <tr>
                <th className="p-3">Device ID / Name</th>
                <th className="p-3">Hardware Type</th>
                <th className="p-3">Protocol</th>
                <th className="p-3">Zone & Crop</th>
                <th className="p-3">Status</th>
                <th className="p-3">Battery</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {devices.map((dev) => (
                <tr key={dev.device_id} className="hover:bg-white/[0.02]">
                  <td className="p-3 font-semibold text-white">
                    {dev.name}
                    <div className="text-[10px] text-slate-500 font-normal">{dev.device_id}</div>
                  </td>
                  <td className="p-3 text-slate-300">{dev.hardware_type}</td>
                  <td className="p-3"><span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">{dev.protocol}</span></td>
                  <td className="p-3 text-slate-400">{dev.zone} • {dev.crop}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 w-fit">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      {dev.status}
                    </span>
                  </td>
                  <td className="p-3 text-slate-300">{dev.battery_pct}%</td>
                  <td className="p-3 text-right space-x-2">
                    <button onClick={() => { setEditingDevice(dev); setDeviceForm(dev); setShowDeviceModal(true); }} className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white"><Edit3 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDuplicateDevice(dev.device_id)} className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-cyan-400"><Copy className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDeleteDevice(dev.device_id)} className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Smart Automation Rules Engine */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          Smart IF-THEN Rule Engine ({rules.length} Active Rules)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rules.map((rule) => (
            <div key={rule.rule_id} className="p-4 rounded-xl bg-slate-900/80 border border-white/10 hover:border-emerald-500/30 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {rule.category}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rule.is_active === 1}
                      onChange={() => handleToggleRule(rule.rule_id, rule.is_active === 1)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
                <h4 className="text-sm font-semibold text-white mb-1">{rule.title}</h4>
                <p className="text-xs font-mono text-amber-300 bg-amber-500/10 p-2 rounded border border-amber-500/20 mb-2">{rule.trigger_condition}</p>
                <p className="text-xs font-mono text-slate-300 bg-slate-800/80 p-2 rounded">{rule.action_execution}</p>
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 font-mono pt-2 border-t border-white/5">
                <span>Executions: {rule.executions_count}</span>
                <span>Frequency: {rule.frequency}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // -------------------------------------------------------------
  // SUB TAB 2: DRONE MANAGEMENT (ENTERPRISE UAV OPERATIONS CENTER)
  // -------------------------------------------------------------
  const renderDroneManagementView = () => (
    <div className="space-y-6">
      <AIBadgePanel tabId="drone-management" tabName="Enterprise UAV Drone Operations Command Center" defaultPrompt="Run pre-flight safety check for AgriWing T40 spraying 12.5 acres at 14.5m altitude." />

      {/* Pre-Flight Weather & Safety Checklist Banner */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 bg-slate-950/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">Pre-Flight Safety Check: CLEAR TO LAUNCH</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-mono border border-emerald-500/20">DGCA Zone Green</span>
            </div>
            <p className="text-xs text-slate-400 font-mono">Wind: 8.5 km/h (Safe &lt;25 km/h) • Temp: 28.5°C • Rain Probability: 0% • Visibility: 10 km • Satellites: 18 (RTK Fixed)</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={async () => {
              setExportStatus('Generating GeoJSON...');
              const res = await exportUavDossier('geojson');
              if (res.success) {
                const blob = new Blob([res.content], { type: 'application/geo+json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a'); a.href = url; a.download = res.filename;
                document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
                setExportStatus(`Exported ${res.filename}`);
              }
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 text-xs font-mono flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Export GeoJSON / KML
          </button>
          <button
            onClick={() => setShowNewMissionModal(true)}
            className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-semibold text-xs flex items-center gap-1.5 shadow-[0_0_12px_#10b98133]"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Mission
          </button>
        </div>
      </div>

      {/* Main HUD & Aerial View Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live 4K HUD Telemetry Video Feed */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 border border-white/10 relative overflow-hidden bg-black flex flex-col justify-between h-[420px]">
          <img src="https://images.unsplash.com/photo-1524169358666-79f22534bc6e?auto=format&fit=crop&q=80&w=1200" alt="Drone Aerial Feed" className="absolute inset-0 w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60"></div>
          
          {/* Top HUD Overlay */}
          <div className="relative z-10 flex justify-between items-start">
            <div className="bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-emerald-500/40 text-emerald-400 font-mono text-xs flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              {uavTelemetry.drone_name} • LIVE 4K THERMAL STREAM
            </div>
            <div className="bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-white font-mono text-xs flex items-center gap-3">
              <span className="flex items-center gap-1 text-emerald-400"><Battery className="w-3.5 h-3.5" /> {uavTelemetry.battery_pct}%</span>
              <span className="flex items-center gap-1 text-cyan-400"><Radio className="w-3.5 h-3.5" /> {uavTelemetry.signal_dbm} dBm</span>
              <span className="text-amber-300 font-bold">{uavTelemetry.simulation_notice}</span>
            </div>
          </div>

          {/* Center Crosshair & Pitch Indicator */}
          <div className="relative z-10 flex flex-col items-center justify-center my-auto pointer-events-none opacity-80">
            <div className="w-24 h-24 border border-cyan-500/40 rounded-full flex items-center justify-center relative">
              <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
              <div className="absolute left-0 w-4 h-0.5 bg-cyan-400"></div>
              <div className="absolute right-0 w-4 h-0.5 bg-cyan-400"></div>
              <div className="absolute top-0 h-4 w-0.5 bg-cyan-400"></div>
              <div className="absolute bottom-0 h-4 w-0.5 bg-cyan-400"></div>
            </div>
            <span className="text-[10px] font-mono text-cyan-300 mt-1 bg-black/70 px-2 py-0.5 rounded border border-cyan-500/20">
              GPS: {uavTelemetry.latitude}° N, {uavTelemetry.longitude}° E
            </span>
          </div>

          {/* Bottom Telemetry HUD Gauges Bar */}
          <div className="relative z-10 grid grid-cols-4 gap-3 bg-black/85 backdrop-blur-md p-3.5 rounded-xl border border-white/10 font-mono text-xs text-center">
            <div>
              <div className="text-slate-400 text-[10px]">ALTITUDE</div>
              <div className="text-lg font-bold text-cyan-400">{uavTelemetry.altitude_m} m</div>
            </div>
            <div>
              <div className="text-slate-400 text-[10px]">GROUND SPEED</div>
              <div className="text-lg font-bold text-amber-400">{uavTelemetry.speed_ms} m/s</div>
            </div>
            <div>
              <div className="text-slate-400 text-[10px]">SPRAY RATE</div>
              <div className="text-lg font-bold text-emerald-400">{uavTelemetry.spray_rate_lmin} L/min</div>
            </div>
            <div>
              <div className="text-slate-400 text-[10px]">REMAINING FLIGHT</div>
              <div className="text-lg font-bold text-purple-400">{uavTelemetry.remaining_flight_mins} mins</div>
            </div>
          </div>
        </div>

        {/* UAV Fleet & Mission Diagnostics Panel */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plane className="w-4 h-4 text-emerald-400" />
                Active Fleet Inventory
              </h3>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                {droneFleet.length} Registered UAVs
              </span>
            </div>
            <div className="space-y-3 font-mono text-xs max-h-[220px] overflow-y-auto pr-1">
              {droneFleet.map((drone) => (
                <div key={drone.drone_id} className="p-3 rounded-xl bg-slate-900 border border-white/10 hover:border-emerald-500/30 transition-all space-y-1">
                  <div className="flex justify-between text-white font-semibold">
                    <span>{drone.name}</span>
                    <span className="text-emerald-400 text-[10px]">{drone.status}</span>
                  </div>
                  <div className="text-slate-400 text-[11px] flex justify-between">
                    <span>{drone.model}</span>
                    <span>Battery: {drone.battery_pct}%</span>
                  </div>
                  <div className="text-slate-500 text-[10px]">Payload: {drone.camera_payload}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-white/10">
            <button
              onClick={async () => {
                const res = await calculateUavCoverage(uavCalcAcres);
                setUavCalcResult(res);
              }}
              className="w-full py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-xs transition-all shadow-[0_0_12px_#6366f133]"
            >
              Calculate Flight Coverage & Tank Volume
            </button>
            {uavCalcResult && (
              <div className="p-3 rounded-xl bg-slate-900 border border-indigo-500/30 text-indigo-300 font-mono text-xs space-y-1">
                <div>Field: {uavCalcResult.acres} Acres</div>
                <div>Flight Time: <strong>{uavCalcResult.estimated_flight_mins} Mins</strong></div>
                <div>Spray Volume: <strong>{uavCalcResult.spray_needed_liters} Liters</strong></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Waypoint Mission Planner & Computer Vision Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Waypoint Missions List */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-md font-semibold text-white flex items-center gap-2">
              <Navigation className="w-5 h-5 text-cyan-400" />
              Waypoint Missions ({droneMissions.length} Missions)
            </h3>
            <span className="text-xs text-slate-400 font-mono">MAVLink Autonomous Flights</span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {droneMissions.map((msn) => (
              <div key={msn.mission_id} className="p-4 rounded-xl bg-slate-900 border border-white/10 hover:border-cyan-500/30 transition-all space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-emerald-400 text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 mr-2">{msn.mission_type}</span>
                    <strong className="text-white text-xs">{msn.title}</strong>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">{msn.status}</span>
                </div>
                <div className="text-slate-400 text-[11px] grid grid-cols-2 gap-2">
                  <div>Zone: {msn.farm_zone}</div>
                  <div>Area: {msn.target_area_acres} Acres</div>
                  <div>Target Alt: {msn.target_altitude_m}m</div>
                  <div>Speed: {msn.target_speed_ms} m/s</div>
                </div>
                <div className="p-2 rounded bg-slate-950 text-amber-300 text-[11px] border border-white/5">
                  {msn.ai_summary}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hugging Face Aerial AI Vision Analytics */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
          <h3 className="text-md font-semibold text-white flex items-center gap-2">
            <Eye className="w-5 h-5 text-amber-400" />
            Hugging Face Aerial Vision & Thermal AI
          </h3>

          <div className="p-4 rounded-xl bg-slate-900 border border-white/10 text-xs font-mono space-y-3">
            <div className="flex justify-between text-slate-300">
              <span>Computer Vision Pipeline:</span>
              <span className="text-emerald-400 font-semibold">YOLOv8 + OpenCV + Thermal FX</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded bg-slate-950 border border-white/5">
                <div className="text-slate-500 text-[10px]">WEED INFESTATION</div>
                <div className="text-amber-400 font-bold text-sm">4.2 % (Spot Treatment)</div>
              </div>
              <div className="p-2.5 rounded bg-slate-950 border border-white/5">
                <div className="text-slate-500 text-[10px]">FUNGAL PATHOGEN RISK</div>
                <div className="text-emerald-400 font-bold text-sm">0 Anomaly (Clean)</div>
              </div>
              <div className="p-2.5 rounded bg-slate-950 border border-white/5">
                <div className="text-slate-500 text-[10px]">ESTIMATED PLANT COUNT</div>
                <div className="text-cyan-400 font-bold text-sm">14,500 Plants</div>
              </div>
              <div className="p-2.5 rounded bg-slate-950 border border-white/5">
                <div className="text-slate-500 text-[10px]">AI CONFIDENCE</div>
                <div className="text-purple-400 font-bold text-sm">94.8 %</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Mission Creator Modal */}
      {showNewMissionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="glass-panel p-6 rounded-2xl border border-white/10 max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold text-white">Schedule New UAV Mission</h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await createUavMission(missionForm);
                setShowNewMissionModal(false);
                loadData();
              }}
              className="space-y-3 text-xs font-mono"
            >
              <div>
                <label className="text-slate-400">Mission Title</label>
                <input
                  type="text"
                  required
                  value={missionForm.title}
                  onChange={(e) => setMissionForm({ ...missionForm, title: e.target.value })}
                  className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400">Mission Type</label>
                  <select
                    value={missionForm.mission_type}
                    onChange={(e) => setMissionForm({ ...missionForm, mission_type: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white mt-1"
                  >
                    <option value="Spraying">Spraying</option>
                    <option value="Crop Monitoring">Crop Monitoring</option>
                    <option value="Disease Detection">Disease Detection</option>
                    <option value="Weed Mapping">Weed Mapping</option>
                    <option value="Thermal Inspection">Thermal Inspection</option>
                    <option value="Seed Broadcasting">Seed Broadcasting</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400">Target Area (Acres)</label>
                  <input
                    type="number"
                    value={missionForm.target_area_acres}
                    onChange={(e) => setMissionForm({ ...missionForm, target_area_acres: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white mt-1"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowNewMissionModal(false)} className="px-4 py-2 rounded-lg bg-slate-800 text-white">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-emerald-500 text-black font-bold">Launch Mission</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  // -------------------------------------------------------------
  // SUB TAB 3: SENSOR MONITOR (ENTERPRISE INDUSTRIAL SCADA HUB)
  // -------------------------------------------------------------
  const renderSensorMonitorView = () => (
    <div className="space-y-6">
      <AIBadgePanel tabId="sensor-monitor" tabName="Enterprise SCADA Multi-Sensor Telemetry & Diagnostic Center" defaultPrompt="Analyze 33-sensor correlation: Soil moisture (38.5%), NPK Nitrogen (145ppm), Motor Vibration (0.82mm/s²)." />

      {/* Hero SCADA KPI Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="glass-panel p-4 rounded-2xl border border-white/10 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono text-slate-400">TOTAL SENSORS</div>
            <div className="text-2xl font-bold font-mono text-white">33 Active</div>
          </div>
          <Cpu className="w-6 h-6 text-emerald-400" />
        </div>
        <div className="glass-panel p-4 rounded-2xl border border-white/10 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono text-slate-400">FLEET HEALTH</div>
            <div className="text-2xl font-bold font-mono text-emerald-400">96.8 %</div>
          </div>
          <CheckCircle className="w-6 h-6 text-emerald-400" />
        </div>
        <div className="glass-panel p-4 rounded-2xl border border-white/10 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono text-slate-400">CRITICAL ALERTS</div>
            <div className="text-2xl font-bold font-mono text-cyan-400">0 Active</div>
          </div>
          <ShieldAlert className="w-6 h-6 text-cyan-400" />
        </div>
        <div className="glass-panel p-4 rounded-2xl border border-white/10 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono text-slate-400">AVERAGE SIGNAL</div>
            <div className="text-2xl font-bold font-mono text-purple-400">-52 dBm</div>
          </div>
          <Radio className="w-6 h-6 text-purple-400" />
        </div>
        <div className="glass-panel p-4 rounded-2xl border border-white/10 flex items-center justify-between col-span-2 md:col-span-1">
          <div>
            <div className="text-[11px] font-mono text-slate-400">PROTOCOL MESH</div>
            <div className="text-sm font-bold font-mono text-amber-300">LoRaWAN + RS485</div>
          </div>
          <Server className="w-6 h-6 text-amber-400" />
        </div>
      </div>

      {/* Sensor Category Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass-panel p-3 rounded-2xl border border-white/10 bg-slate-950/80">
        <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
          {['ALL', 'Soil', 'Climate', 'Water', 'Plant', 'Power', 'Motor', 'Security'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSensorCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${sensorCategory === cat ? 'bg-emerald-500 text-black shadow-[0_0_12px_#10b98144]' : 'bg-slate-900 text-slate-400 hover:text-white border border-white/5'}`}
            >
              {cat} Sensors
            </button>
          ))}
        </div>
        <button
          onClick={async () => {
            setExportStatus('Generating Sensor SCADA Report...');
            const res = await exportSensorDossier('csv');
            if (res.success) {
              const blob = new Blob([res.content], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a'); a.href = url; a.download = res.filename;
              document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
              setExportStatus(`Exported ${res.filename}`);
            }
          }}
          className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono flex items-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5" />
          Export SCADA Telemetry (CSV)
        </button>
      </div>

      {/* 33 Multi-Sensor Waterfall Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {sensorCatalog.map((sns) => (
          <div
            key={sns.sensor_id}
            onClick={() => setSelectedSensorDetail(sns)}
            className="glass-panel p-4 rounded-2xl border border-white/10 hover:border-emerald-500/40 transition-all cursor-pointer space-y-3 group"
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-mono bg-slate-800 px-2 py-0.5 rounded text-emerald-400 border border-white/5">{sns.category}</span>
                <h4 className="text-xs font-bold text-white mt-1 group-hover:text-emerald-300 transition-colors">{sns.name}</h4>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {sns.status}
              </span>
            </div>

            <div className="flex items-baseline justify-between font-mono">
              <div className="text-2xl font-bold text-white tracking-tight">{sns.current_value} <span className="text-xs text-slate-400 font-normal">{sns.unit}</span></div>
              <div className="text-[10px] text-slate-400">Target: {sns.min_threshold}-{sns.max_threshold}</div>
            </div>

            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${Math.min(100, (sns.current_value / (sns.max_threshold || 100)) * 100)}%` }}></div>
            </div>

            <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 pt-1 border-t border-white/5">
              <span>{sns.farm_zone}</span>
              <span>Bat: {sns.battery_pct}% • {sns.signal_dbm}dBm</span>
            </div>
          </div>
        ))}
      </div>

      {/* Sensor Marketplace & Indian Vendor Guide */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-md font-bold text-white flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-emerald-400" />
              Verified Agricultural Hardware Marketplace (India Vendors)
            </h3>
            <p className="text-xs text-slate-400">RS485 Modbus, NDIR, and Industrial Sensors with pricing in INR (₹)</p>
          </div>
          <span className="text-xs font-mono text-cyan-400">Robu.in • Mouser • ElectronicsComp</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
          {sensorMarketplace.map((item) => (
            <div key={item.id} className="p-4 rounded-xl bg-slate-900 border border-white/10 hover:border-cyan-500/30 transition-all flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1">
                  <span>{item.vendor}</span>
                  <span className="text-amber-400">★ {item.rating}</span>
                </div>
                <h4 className="text-xs font-bold text-white mb-2">{item.name}</h4>
                <div className="text-[11px] text-emerald-400 font-bold mb-2">₹{item.price_inr.toLocaleString('en-IN')}</div>
                <div className="text-[10px] text-slate-400">Protocol: {item.protocol} • Acc: {item.accuracy}</div>
              </div>
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-center font-bold text-[11px] block transition-all"
              >
                View Vendor Docs & Buy
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // -------------------------------------------------------------
  // SUB TAB 4: SMART EQUIPMENT (ENTERPRISE MACHINERY & RENTAL HUB)
  // -------------------------------------------------------------
  const renderSmartEquipmentView = () => (
    <div className="space-y-6">
      <AIBadgePanel tabId="smart-equipment" tabName="Enterprise Smart Machinery, Fleet Telemetry & Rental Hub" defaultPrompt="Calculate ROI and payback period for buying 47 HP Mahindra 575 DI vs custom hiring." />

      {/* Hero Fleet KPI Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="glass-panel p-4 rounded-2xl border border-white/10 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono text-slate-400">TOTAL FLEET</div>
            <div className="text-2xl font-bold font-mono text-white">{equipmentFleet.length} Machines</div>
          </div>
          <Tractor className="w-6 h-6 text-emerald-400" />
        </div>
        <div className="glass-panel p-4 rounded-2xl border border-white/10 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono text-slate-400">ACTIVE UNITS</div>
            <div className="text-2xl font-bold font-mono text-emerald-400">4 In-Use</div>
          </div>
          <Zap className="w-6 h-6 text-emerald-400" />
        </div>
        <div className="glass-panel p-4 rounded-2xl border border-white/10 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono text-slate-400">FLEET HEALTH</div>
            <div className="text-2xl font-bold font-mono text-cyan-400">95.8 %</div>
          </div>
          <Gauge className="w-6 h-6 text-cyan-400" />
        </div>
        <div className="glass-panel p-4 rounded-2xl border border-white/10 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono text-slate-400">TOTAL HOURS</div>
            <div className="text-2xl font-bold font-mono text-purple-400">1,675 hrs</div>
          </div>
          <Activity className="w-6 h-6 text-purple-400" />
        </div>
        <div className="glass-panel p-4 rounded-2xl border border-white/10 flex items-center justify-between col-span-2 md:col-span-1">
          <div>
            <div className="text-[11px] font-mono text-slate-400">GOVT SUBSIDIES</div>
            <div className="text-sm font-bold font-mono text-amber-300">SMAM + KUSUM</div>
          </div>
          <ExternalLink className="w-6 h-6 text-amber-400" />
        </div>
      </div>

      {/* Equipment Category Bar & Export */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass-panel p-3 rounded-2xl border border-white/10 bg-slate-950/80">
        <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
          {['ALL', 'Tractor', 'Harvester', 'Sprayer', 'Pump', 'Implement'].map((cat) => (
            <button
              key={cat}
              onClick={() => setEquipmentCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${equipmentCategory === cat ? 'bg-emerald-500 text-black shadow-[0_0_12px_#10b98144]' : 'bg-slate-900 text-slate-400 hover:text-white border border-white/5'}`}
            >
              {cat}s
            </button>
          ))}
        </div>
        <button
          onClick={async () => {
            setExportStatus('Exporting Fleet Dossier...');
            const res = await exportEquipmentDossier('csv');
            if (res.success) {
              const blob = new Blob([res.content], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a'); a.href = url; a.download = res.filename;
              document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
              setExportStatus(`Exported ${res.filename}`);
            }
          }}
          className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono flex items-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5" />
          Export Fleet Report (CSV)
        </button>
      </div>

      {/* Equipment Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {equipmentFleet.map((eq) => (
          <div key={eq.equipment_id} className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-4">
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-mono bg-slate-800 text-emerald-400 px-2 py-0.5 rounded border border-white/5">{eq.category} • {eq.brand}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${eq.current_status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'}`}>
                  {eq.current_status}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white mb-1">{eq.name}</h3>
              <p className="text-xs text-slate-400 font-mono mb-3">Model: {eq.model} • {eq.hp} HP • Fuel: {eq.fuel_type}</p>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono mb-3">
                <div className="p-2.5 rounded bg-slate-900 border border-white/5">
                  <div className="text-[10px] text-slate-400">ENGINE HOURS</div>
                  <div className="text-white font-bold">{eq.engine_hours} hrs</div>
                </div>
                <div className="p-2.5 rounded bg-slate-900 border border-white/5">
                  <div className="text-[10px] text-slate-400">FUEL LEVEL</div>
                  <div className="text-emerald-400 font-bold">{eq.fuel_level_pct}%</div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-mono flex items-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5" />
                {eq.subsidy_applicable}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-white/5 font-mono text-xs">
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Rental Rate: ₹{eq.rental_rate_per_hr_inr}/hr</span>
                <span>Next Service: {eq.next_service_due}</span>
              </div>
              {eq.vendor_url && (
                <a
                  href={eq.vendor_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-[11px] text-center block transition-all"
                >
                  Official Vendor / Dealer Page
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Equipment Purchase vs Rental ROI Calculator & Dealer Directory */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ROI Payback Calculator */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
          <h3 className="text-md font-bold text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            Equipment Ownership Payback & ROI Calculator
          </h3>
          <div className="space-y-3 text-xs font-mono">
            <div>
              <label className="text-slate-400">Estimated Purchase Cost (₹ INR)</label>
              <input
                type="number"
                value={eqRoiPrice}
                onChange={(e) => setEqRoiPrice(parseFloat(e.target.value))}
                className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white mt-1"
              />
            </div>
            <div>
              <label className="text-slate-400">Total Farm Acreage (Acres)</label>
              <input
                type="number"
                value={eqRoiAcres}
                onChange={(e) => setEqRoiAcres(parseFloat(e.target.value))}
                className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white mt-1"
              />
            </div>
            <button
              onClick={async () => {
                const res = await calculateEquipmentRoi(eqRoiPrice, eqRoiAcres);
                setEqRoiResult(res);
              }}
              className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-600 text-black font-bold rounded-xl transition-all shadow-[0_0_12px_#06b6d433]"
            >
              Calculate Payback & Savings
            </button>
            {eqRoiResult && (
              <div className="p-4 rounded-xl bg-slate-900 border border-cyan-500/30 text-cyan-300 space-y-1.5">
                <div>Annual Hiring Expense Saved: <strong>₹{eqRoiResult.annual_hire_cost_inr.toLocaleString('en-IN')}</strong></div>
                <div>Annual Net Savings: <strong>₹{eqRoiResult.annual_net_savings_inr.toLocaleString('en-IN')}</strong></div>
                <div>Payback Period: <strong className="text-emerald-400">{eqRoiResult.payback_period_years} Years</strong></div>
                <div>Estimated ROI: <strong className="text-purple-400">{eqRoiResult.roi_percentage}%</strong></div>
              </div>
            )}
          </div>
        </div>

        {/* Nearby Verified Equipment Dealers */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
          <h3 className="text-md font-bold text-white flex items-center gap-2">
            <ExternalLink className="w-5 h-5 text-emerald-400" />
            Verified Machinery Dealers & Rental Providers (Vellore Region)
          </h3>
          <div className="space-y-3 text-xs font-mono">
            {equipmentMarketplace.map((dlr) => (
              <div key={dlr.id} className="p-4 rounded-xl bg-slate-900 border border-white/10 hover:border-emerald-500/30 transition-all space-y-2">
                <div className="flex justify-between items-start">
                  <h4 className="text-xs font-bold text-white">{dlr.dealer_name}</h4>
                  <span className="text-amber-400">★ {dlr.rating}</span>
                </div>
                <div className="text-slate-400 text-[11px]">{dlr.location}</div>
                <div className="flex justify-between items-center text-[11px] pt-1">
                  <span className="text-emerald-400 font-semibold">{dlr.phone}</span>
                  <a href={dlr.official_url} target="_blank" rel="noopener noreferrer" className="text-cyan-300 hover:underline">
                    View Dealer Portal →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Top Header Control Toolbar */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-950/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              KisanTech Smart IoT Command Center
            </h1>
            <p className="text-xs text-slate-400 font-mono">Enterprise Real-Time Sensor Telemetry & Automation Hub</p>
          </div>
        </div>

        {/* Mode Switcher & Controls */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setMode('Live')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${mode === 'Live' ? 'bg-emerald-500 text-black' : 'text-slate-400 hover:text-white'}`}
            >
              Live Mode
            </button>
            <button
              onClick={() => setMode('Simulation')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${mode === 'Simulation' ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white'}`}
            >
              Simulation Mode
            </button>
            <button
              onClick={() => setMode('Historical')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${mode === 'Historical' ? 'bg-cyan-500 text-black' : 'text-slate-400 hover:text-white'}`}
            >
              Historical Replay
            </button>
          </div>

          {/* Scenario selector if Simulation mode */}
          {mode === 'Simulation' && (
            <select
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              className="bg-slate-900 border border-amber-500/40 text-amber-300 rounded-xl px-3 py-1.5 text-xs focus:outline-none"
            >
              <option value="Normal Operations">Normal Operations</option>
              <option value="Rain">Monsoon Rain</option>
              <option value="Heatwave">Summer Heatwave</option>
              <option value="Flood">Extreme Flood</option>
              <option value="Drought">Severe Drought</option>
              <option value="Cold Wave">Cold Wave</option>
              <option value="Motor Failure">Motor Current Overload</option>
              <option value="Pump Failure">Pump Failure / Dry Run</option>
              <option value="Low Battery">Low Node Battery</option>
              <option value="High pH">High Alkaline Soil pH</option>
              <option value="Nitrogen Deficiency">Nitrogen Deficiency</option>
              <option value="Pest Alert">Pest Activity Alert</option>
              <option value="Disease Alert">Fungal Pathogen Risk</option>
            </select>
          )}

          {/* Export Button */}
          <button
            onClick={() => setShowExportModal(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-white/10 flex items-center gap-1.5 transition-all"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            Export Log
          </button>

          {/* Calculator Button */}
          <button
            onClick={() => setShowCalcModal(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-white/10 flex items-center gap-1.5 transition-all"
          >
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            Irrigation Calculator
          </button>
        </div>
      </div>

      {/* Mandatory Simulation Mode Indicator Banner */}
      {mode === 'Simulation' && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between text-amber-300 text-xs font-mono shadow-[0_0_20px_#f59e0b1a]">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 animate-pulse" />
            <div>
              <span className="font-bold text-sm text-amber-400">Simulation Mode Enabled</span>
              <span className="ml-2 text-slate-300">Active Physics Model Scenario: <strong className="text-white">{scenario}</strong></span>
            </div>
          </div>
          <span className="bg-amber-500/20 px-2.5 py-1 rounded border border-amber-500/30 text-[11px]">
            No Physical Hardware Override
          </span>
        </div>
      )}

      {/* Main Tab View Rendering */}
      {renderTabContent()}

      {/* Register/Edit Device Modal */}
      {showDeviceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="glass-panel p-6 rounded-2xl border border-white/10 max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold text-white">{editingDevice ? 'Edit Device' : 'Register New IoT Device'}</h3>
            <form onSubmit={handleSaveDevice} className="space-y-3 text-xs font-mono">
              <div>
                <label className="text-slate-400">Device Name</label>
                <input
                  type="text"
                  required
                  value={deviceForm.name}
                  onChange={(e) => setDeviceForm({ ...deviceForm, name: e.target.value })}
                  className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400">Hardware Type</label>
                  <select
                    value={deviceForm.hardware_type}
                    onChange={(e) => setDeviceForm({ ...deviceForm, hardware_type: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white mt-1"
                  >
                    <option value="ESP32 Node">ESP32 Node</option>
                    <option value="ESP8266">ESP8266</option>
                    <option value="Arduino UNO">Arduino UNO</option>
                    <option value="Arduino Mega">Arduino Mega</option>
                    <option value="Raspberry Pi 4">Raspberry Pi 4</option>
                    <option value="Jetson Nano">Jetson Nano</option>
                    <option value="LoRaWAN Node">LoRaWAN Node</option>
                    <option value="UAV Drone">UAV Drone</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400">Protocol</label>
                  <select
                    value={deviceForm.protocol}
                    onChange={(e) => setDeviceForm({ ...deviceForm, protocol: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white mt-1"
                  >
                    <option value="LoRaWAN">LoRaWAN</option>
                    <option value="MQTT Gateway">MQTT Gateway</option>
                    <option value="HTTP / REST">HTTP / REST</option>
                    <option value="Modbus TCP">Modbus TCP</option>
                    <option value="WebSocket">WebSocket</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowDeviceModal(false)} className="px-4 py-2 rounded-lg bg-slate-800 text-white">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-emerald-500 text-black font-bold">Save Device</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Export Dossier Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="glass-panel p-6 rounded-2xl border border-white/10 max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Download className="w-5 h-5 text-emerald-400" />
              Export IoT Sensor Dossier
            </h3>
            <p className="text-xs text-slate-400">Select file format to generate and download telemetry logs</p>
            <div className="grid grid-cols-3 gap-2 font-mono text-xs">
              {['json', 'csv', 'md', 'pdf', 'docx', 'excel'].map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setExportFormat(fmt)}
                  className={`p-2.5 rounded-xl border uppercase font-bold text-center transition-all ${exportFormat === fmt ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500' : 'bg-slate-900 text-slate-400 border-white/10'}`}
                >
                  .{fmt}
                </button>
              ))}
            </div>
            {exportStatus && <div className="text-xs font-mono text-cyan-400">{exportStatus}</div>}
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowExportModal(false)} className="px-4 py-2 rounded-lg bg-slate-800 text-white text-xs">Close</button>
              <button onClick={handleExecuteExport} className="px-4 py-2 rounded-lg bg-emerald-500 text-black font-bold text-xs">Download File</button>
            </div>
          </div>
        </div>
      )}

      {/* Irrigation Calculator Modal */}
      {showCalcModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="glass-panel p-6 rounded-2xl border border-white/10 max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-cyan-400" />
              Quick Irrigation Runtime Calculator
            </h3>
            <div className="space-y-3 text-xs font-mono">
              <div>
                <label className="text-slate-400">Field Acreage (Acres)</label>
                <input
                  type="number"
                  value={calcInputs.acreage}
                  onChange={(e) => setCalcInputs({ ...calcInputs, acreage: e.target.value })}
                  className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white mt-1"
                />
              </div>
              <div>
                <label className="text-slate-400">Current Soil Moisture (%)</label>
                <input
                  type="number"
                  value={calcInputs.moisture}
                  onChange={(e) => setCalcInputs({ ...calcInputs, moisture: e.target.value })}
                  className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white mt-1"
                />
              </div>
              <button onClick={handleRunCalculator} className="w-full py-2 bg-cyan-500 text-black font-bold rounded-lg">Calculate Runtime</button>
              {calcResult && (
                <div className="p-3 rounded-lg bg-slate-900 border border-cyan-500/30 text-cyan-300 space-y-1">
                  <div>Water Needed: <strong>{calcResult.water_needed_liters} Liters</strong></div>
                  <div>Pump Runtime: <strong>{calcResult.pump_runtime_minutes} Mins</strong></div>
                  <div>Power Usage: <strong>{calcResult.estimated_power_kwh} kWh (₹{calcResult.estimated_cost_inr})</strong></div>
                </div>
              )}
            </div>
            <div className="flex justify-end pt-2">
              <button onClick={() => setShowCalcModal(false)} className="px-4 py-2 rounded-lg bg-slate-800 text-white text-xs">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
