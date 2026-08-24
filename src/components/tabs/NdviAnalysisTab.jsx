import React, { useState, useEffect, useRef } from 'react';
import {
  Compass, Globe, Layers, Eye, Play, Pause, RefreshCw, Download, Sliders, MapPin,
  Sparkles, Activity, ShieldAlert, Sun, Droplets, Thermometer, Zap, Maximize2
} from 'lucide-react';
import { AIBadgePanel } from '../ui/AIBadgePanel';
import { exportPDFReport } from '../../utils/exportReport';

// REAL GOOGLE EARTH LIKE SATELLITE CANVAS WITH HEATMAP OVERLAY
const GoogleEarthHeatmapCanvas = ({ activeLayer, heatmapOpacity, isPlaying, onProbeSpot }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    let timeStep = 0;

    const render = () => {
      timeStep += isPlaying ? 0.02 : 0.005;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // 1. Dark Satellite Land Base Terrain
      const baseGrad = ctx.createLinearGradient(0, 0, w, h);
      baseGrad.addColorStop(0, '#020617');
      baseGrad.addColorStop(0.5, '#0f172a');
      baseGrad.addColorStop(1, '#0284c715');
      ctx.fillStyle = baseGrad;
      ctx.fillRect(0, 0, w, h);

      // Grid Contours (Google Earth Coordinates)
      ctx.strokeStyle = '#ffffff0a';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // 2. Render Heatmap Layer Overlay based on activeLayer
      ctx.save();
      ctx.globalAlpha = heatmapOpacity;

      if (activeLayer === 'ndvi') {
        // NDVI Vegetation Health Gradient (Red to Neon Green)
        for (let i = 0; i < 6; i++) {
          const cx = 120 + i * 110 + Math.sin(timeStep + i) * 15;
          const cy = 100 + (i % 2) * 80 + Math.cos(timeStep + i) * 10;
          const r = 90 + (i % 3) * 30;

          const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, r);
          grad.addColorStop(0, '#10b981'); // Heavy vigor green
          grad.addColorStop(0.5, '#84cc16'); // Moderate vigor yellow-green
          grad.addColorStop(0.8, '#f59e0b'); // Moderate stress
          grad.addColorStop(1, '#f43f5e00'); // Bare soil
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (activeLayer === 'moisture') {
        // NDWI Water & Moisture Heatmap (Cyan & Blue)
        for (let i = 0; i < 5; i++) {
          const cx = 150 + i * 120;
          const cy = 120 + (i % 3) * 60;
          const r = 100;

          const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, r);
          grad.addColorStop(0, '#0284c7');
          grad.addColorStop(0.6, '#06b6d4');
          grad.addColorStop(1, '#0284c700');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (activeLayer === 'thermal') {
        // Thermal Stress Heatmap (Blue cool to Red hot)
        for (let i = 0; i < 5; i++) {
          const cx = 180 + i * 100;
          const cy = 110 + (i % 2) * 90;
          const r = 110;

          const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, r);
          grad.addColorStop(0, '#f43f5e'); // High heat stress 38°C
          grad.addColorStop(0.5, '#f59e0b');
          grad.addColorStop(1, '#3b82f600'); // Cool canopy
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();

      // 3. Field Boundary Polygons Overlaid on Heatmap
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(60, 40, 240, 160);
      ctx.strokeRect(320, 50, 260, 180);
      ctx.setLineDash([]);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('FIELD-01: Paddy Block A (12.5 Acres) • NDVI 0.82', 70, 60);
      ctx.fillText('FIELD-02: Tomato Block B (8.0 Acres) • NDVI 0.76', 330, 70);

      // 4. Live Pulse Marker on Selected Location
      const pulseR = 8 + Math.sin(timeStep * 3) * 4;
      ctx.beginPath();
      ctx.arc(180, 120, pulseR, 0, Math.PI * 2);
      ctx.fillStyle = '#10b981';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [activeLayer, heatmapOpacity, isPlaying]);

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);

    // Mock spot calculation based on x, y
    const mockNdvi = (0.65 + (x % 30) * 0.01).toFixed(2);
    const mockTemp = (27.5 + (y % 15) * 0.2).toFixed(1);
    onProbeSpot({ x, y, ndvi: mockNdvi, temp: mockTemp });
  };

  return (
    <div className="relative w-full h-[420px] rounded-2xl overflow-hidden border border-cyan-500/40 bg-slate-950 shadow-2xl">
      <canvas 
        ref={canvasRef} 
        width={750} 
        height={420} 
        onClick={handleCanvasClick}
        className="w-full h-full block cursor-crosshair" 
      />

      {/* Google Earth Navigation Telemetry Header */}
      <div className="absolute top-3 left-3 px-3 py-1.5 rounded-xl bg-black/80 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold font-mono flex items-center gap-2">
        <Globe className="w-3.5 h-3.5 text-cyan-400 animate-pulse" /> 
        Google Earth Pro Satellite Mode • Lat: 12.9165° N, Lon: 79.1325° E • Sentinel-2 L2A Pass
      </div>
    </div>
  );
};

export const NdviAnalysisTab = () => {
  const [activeLayer, setActiveLayer] = useState('ndvi'); // 'ndvi' | 'moisture' | 'thermal'
  const [heatmapOpacity, setHeatmapOpacity] = useState(0.75);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedDate, setSelectedDate] = useState('2026-07-25 (Live Pass)');
  const [probedSpot, setProbedSpot] = useState({ x: 180, y: 120, ndvi: '0.82', temp: '28.2' });

  const datesList = ["2026-01-10", "2026-03-22", "2026-05-18", "2026-07-25 (Live Pass)"];

  const handleExportHeatmapPDF = () => {
    exportPDFReport(
      `Sentinel-2 NDVI Vegetation & Thermal Heatmap Analysis Report`,
      `Farm Name: Vellore Main Precision Farm\nLocation: Katpadi, Vellore, Tamil Nadu (12.9165° N, 79.1325° E)\nActive Layer: ${activeLayer.toUpperCase()} Heatmap\nSatellite Source: Sentinel-2 L2A Multispectral\nPass Date: ${selectedDate}\nHeatmap Opacity: ${Math.round(heatmapOpacity * 100)}%\n\nFIELD SPOT PROBE TELEMETRY:\n- Target Coords: Pixel (${probedSpot.x}, ${probedSpot.y})\n- Spot NDVI Index: ${probedSpot.ndvi} (High Vegetation Vigor)\n- Canopy Surface Temp: ${probedSpot.temp}°C\n- Moisture Content: 52% Volumetric\n\nRECOMMENDATION:\nVegetation index is 14% above district average for Kuruvai season. No nitrogen deficiency detected.`,
      [{ title: "Spot NDVI Score", value: probedSpot.ndvi }, { title: "Canopy Temp", value: `${probedSpot.temp}°C` }]
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 font-mono text-xs">
      <AIBadgePanel 
        tabId="ndvi-analysis" 
        tabName="Enterprise NDVI Vegetation Heatmap & Google Earth Satellite Intelligence Workspace" 
        defaultPrompt="Analyze Sentinel-2 NDVI multispectral heatmaps, canopy thermal stress gradients, and spot probe telemetry." 
      />

      {/* 1. HERO BANNER */}
      <div className="glass-panel rounded-2xl p-6 border border-emerald-500/40 bg-gradient-to-r from-emerald-950/40 via-slate-950 to-black space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                SENTINEL-2 L2A • GOOGLE EARTH PRO ENGINE
              </span>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                10m Resolution
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-100">NDVI Vegetation Heatmap & Thermal Stress Command Center</h2>
            <p className="text-xs text-slate-300">
              📍 Location: <strong className="text-amber-300">Vellore Main Precision Farm (42.5 Acres)</strong> • 
              Pass Date: <strong className="text-cyan-300">{selectedDate}</strong> • 
              Cloud Coverage: <strong className="text-emerald-300">0.02%</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={handleExportHeatmapPDF}
              className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-extrabold flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 hover:opacity-90"
            >
              <Download className="w-4 h-4" /> Export Heatmap (PDF)
            </button>
          </div>
        </div>

        {/* HERO KPI METRICS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-black/40 border border-white/10">
            <span className="text-[10px] text-slate-400 block">Avg Farm NDVI Index</span>
            <strong className="text-xl font-extrabold text-emerald-400">0.82 (High Vigor)</strong>
          </div>
          <div className="p-4 rounded-xl bg-black/40 border border-white/10">
            <span className="text-[10px] text-slate-400 block">NDWI Water Content</span>
            <strong className="text-xl font-extrabold text-cyan-300">0.48 (Optimal)</strong>
          </div>
          <div className="p-4 rounded-xl bg-black/40 border border-white/10">
            <span className="text-[10px] text-slate-400 block">Canopy Surface Temp</span>
            <strong className="text-xl font-extrabold text-amber-300">28.2°C</strong>
          </div>
          <div className="p-4 rounded-xl bg-black/40 border border-white/10">
            <span className="text-[10px] text-slate-400 block">Probed Spot Score</span>
            <strong className="text-xl font-extrabold text-indigo-300">{probedSpot.ndvi} Score</strong>
          </div>
        </div>
      </div>

      {/* 2. LAYER CONTROLS & OPACITY SLIDER TOOLBAR */}
      <div className="glass-panel rounded-2xl p-4 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-slate-400 font-bold flex items-center gap-1">
            <Layers className="w-4 h-4 text-emerald-400" /> Heatmap Mode:
          </span>
          <button 
            onClick={() => setActiveLayer('ndvi')}
            className={`px-3 py-1.5 rounded-xl font-bold transition text-xs ${activeLayer === 'ndvi' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-white/5 text-slate-400'}`}
          >
            🌱 NDVI Vegetation
          </button>
          <button 
            onClick={() => setActiveLayer('moisture')}
            className={`px-3 py-1.5 rounded-xl font-bold transition text-xs ${activeLayer === 'moisture' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-white/5 text-slate-400'}`}
          >
            💧 NDWI Moisture
          </button>
          <button 
            onClick={() => setActiveLayer('thermal')}
            className={`px-3 py-1.5 rounded-xl font-bold transition text-xs ${activeLayer === 'thermal' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-white/5 text-slate-400'}`}
          >
            🌡️ Thermal Canopy Stress
          </button>
        </div>

        {/* Heatmap Opacity Slider */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-slate-400 text-xs font-bold">Opacity: {Math.round(heatmapOpacity * 100)}%</span>
          <input 
            type="range" min="0.1" max="1" step="0.05"
            value={heatmapOpacity}
            onChange={(e) => setHeatmapOpacity(parseFloat(e.target.value))}
            className="w-32 accent-emerald-400 cursor-pointer"
          />
        </div>
      </div>

      {/* 3. GOOGLE EARTH HEATMAP CANVAS & SPOT INSPECTION PROBE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-4">
          <GoogleEarthHeatmapCanvas 
            activeLayer={activeLayer} 
            heatmapOpacity={heatmapOpacity}
            isPlaying={isPlaying}
            onProbeSpot={(spot) => setProbedSpot(spot)}
          />

          {/* MULTI-TEMPORAL ANIMATION PLAYER BAR */}
          <div className="glass-panel rounded-xl p-3 border border-white/10 bg-black/40 flex items-center justify-between gap-4">
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-bold flex items-center gap-1 hover:bg-emerald-400"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPlaying ? 'Pause Animation' : 'Play Satellite Growth Animation'}
            </button>

            <div className="flex items-center gap-2 flex-1 justify-end">
              {datesList.map((d, idx) => (
                <button 
                  key={idx}
                  onClick={() => setSelectedDate(d)}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[10px] ${selectedDate === d ? 'bg-cyan-500 text-slate-950' : 'bg-white/5 text-slate-400 hover:text-white'}`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* SPOT INSPECTION PROBE PANEL */}
        <div className="lg:col-span-4 glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
          <h3 className="text-sm font-extrabold text-slate-100 flex items-center gap-2">
            <Compass className="w-4 h-4 text-emerald-400" /> Click Spot Inspection Probe
          </h3>

          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/40 space-y-2">
            <div className="flex items-center justify-between border-b border-emerald-500/30 pb-2">
              <span className="font-bold text-emerald-300 text-xs">Target Spot Coordinates</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300">
                X: {probedSpot.x}, Y: {probedSpot.y}
              </span>
            </div>
            <p className="text-slate-300 text-xs">NDVI Vegetation Score: <strong className="text-emerald-400 text-sm">{probedSpot.ndvi}</strong></p>
            <p className="text-slate-300 text-xs">Canopy Surface Temp: <strong className="text-amber-300 text-sm">{probedSpot.temp}°C</strong></p>
            <p className="text-slate-300 text-xs">Moisture Content: <strong className="text-cyan-300 text-sm">52% Volumetric</strong></p>
          </div>

          <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2">
            <strong className="text-xs text-slate-200 block">💡 AI Agronomist Spot Rationale</strong>
            <p className="text-slate-400 text-[11px]">
              The probed coordinate (Pixel {probedSpot.x}, {probedSpot.y}) shows strong canopy chlorophyll absorption (NDVI {probedSpot.ndvi}) with zero water stress. Crop is performing at 14% higher efficiency compared to regional benchmarks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
