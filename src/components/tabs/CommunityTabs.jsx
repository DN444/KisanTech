import React from 'react';
import { Share2, GraduationCap, Settings, Award, Cpu, Key, Crown } from 'lucide-react';
import { AIBadgePanel } from '../ui/AIBadgePanel';
import { useAuth } from '../../context/AuthContext';
import FarmerCommunityTab from './FarmerCommunityTab';
import LearningCenterTab from './LearningCenterTab';
import SystemSettingsTab from './SystemSettingsTab';

export const CommunityTabs = ({ subTab }) => {
  const { user } = useAuth();
  
  switch (subTab) {
    case 'farmer-community':
    case 'discussions':
      return (
        <div className="space-y-4 animate-in fade-in">
          <AIBadgePanel tabId="farmer-community" tabName="Social Community Sentiment AI" defaultPrompt="Analyze trending agriculture forum topics and recommend crop solutions." />
          <FarmerCommunityTab />
        </div>
      );

    case 'learning-center':
      return (
        <div className="space-y-4 animate-in fade-in">
          <AIBadgePanel tabId="learning-center" tabName="4K Masterclass Video Recommendation AI" defaultPrompt="Recommend video tutorials based on current Paddy vegetative stage." />
          <LearningCenterTab />
        </div>
      );

    case 'settings':
      return (
        <div className="space-y-4 animate-in fade-in">
          <AIBadgePanel tabId="settings" tabName="Local AI & Hugging Face System Config" defaultPrompt="Verify local Hugging Face path: D:\\mini project learning\\agriculture AI\\models\\huggingface and local Ollama model qwen:latest." />
          <SystemSettingsTab />
        </div>
      );

    case 'profile-account':
    default:
      return (
        <div className="space-y-4 animate-in fade-in">
          <AIBadgePanel tabId="profile-account" tabName="Farmer Mastery Radar AI" defaultPrompt="Calculate farmer skill level score and AI token consumption." />
          <div className="glass-panel rounded-2xl p-6 border border-white/10 font-mono text-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src={user?.photoUrl || "data:image/svg+xml;charset=UTF-8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128"><rect fill="#059669" width="128" height="128" rx="24"/></svg>')} 
                alt={user?.displayName || "Farmer"} 
                className="w-10 h-10 rounded-xl object-cover border border-emerald-500/40" 
              />
              <div>
                <h4 className="font-bold text-sm text-slate-100">{user?.displayName || "Farmer"}</h4>
                <p className="text-[11px] text-slate-400">{user?.email || "Not signed in"} • {user?.provider || "Email"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-2 py-1 bg-amber-400/10 text-amber-400 border border-amber-400/30 rounded font-semibold text-[11px]">
                {user?.badge || "👑 Elite Tier"}
              </span>
              <span className="text-emerald-400">Tokens: {user?.aiTokens || "100,000 / 100,000"}</span>
            </div>
          </div>
        </div>
      );
  }
};
