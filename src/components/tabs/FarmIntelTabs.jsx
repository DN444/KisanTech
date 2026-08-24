import React, { useState } from 'react';
import { 
  MapPin, History, Compass, TrendingUp, Calendar, RotateCw, Bug, Scissors, PieChart, Waves,
  MousePointer, PenTool, AlertTriangle, Layers, Play, CheckCircle2, Sparkles, Activity, ShieldCheck, Download
} from 'lucide-react';
import { AIBadgePanel } from '../ui/AIBadgePanel';
import { LandHistoryTab } from './LandHistoryTab';
import { FarmMapTab } from './FarmMapTab';
import { YieldPredictionTab } from './YieldPredictionTab';
import { HarvestPlannerTab } from './HarvestPlannerTab';
import CropRotationTab from './CropRotationTab';
import PestPredictionTab from './PestPredictionTab';
import WeedDetectionTab from './WeedDetectionTab';
import WaterManagementTab from './WaterManagementTab';
import NutrientAnalysisTab from './NutrientAnalysisTab';

export const FarmIntelTabs = ({ subTab }) => {
  switch (subTab) {
    case 'farm-map':
      return <FarmMapTab />;

    case 'land-history':
      return <LandHistoryTab />;

    case 'yield-prediction':
      return <YieldPredictionTab />;

    case 'harvest-planner':
      return <HarvestPlannerTab />;

    case 'crop-rotation':
      return <CropRotationTab />;

    case 'pest-prediction':
      return <PestPredictionTab />;

    case 'weed-detection':
      return <WeedDetectionTab />;

    case 'water-management':
      return <WaterManagementTab />;

    case 'nutrient-analysis':
      return <NutrientAnalysisTab />;

    default:
      return (
        <div className="space-y-6 animate-in fade-in duration-300 font-mono text-xs">
          <AIBadgePanel tabId={subTab} tabName="Precision Farm Intelligence Engine" defaultPrompt="Run high resolution AI analytics on field sensor nodes and satellite telemetry." />
          
          <div className="glass-panel rounded-2xl p-6 border border-emerald-500/40 bg-black/40 space-y-4">
            <h3 className="text-base font-extrabold text-slate-100 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" /> Precision Farm Intelligence • {subTab.toUpperCase().replace('-', ' ')}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[10px] text-slate-400 block">System Status</span>
                <strong className="text-sm font-bold text-emerald-400">Optimal (Zero Alerts)</strong>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[10px] text-slate-400 block">AI Accuracy Confidence</span>
                <strong className="text-sm font-bold text-cyan-300">97.8% Confidence</strong>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[10px] text-slate-400 block">Last Model Sync</span>
                <strong className="text-sm font-bold text-slate-200">Just Now (Local Qwen)</strong>
              </div>
            </div>
          </div>
        </div>
      );
  }
};
