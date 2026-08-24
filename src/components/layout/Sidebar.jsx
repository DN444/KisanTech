import React, { useState } from 'react';
import { 
  ChevronRight, Search, Crown, Cpu, Zap, Activity, LayoutDashboard, Stethoscope, Scan, CloudSun, Globe, Layers, Sprout, FlaskConical, Droplets, MapPin, History, Compass, TrendingUp, RotateCw, Bug, Scissors, PieChart, Waves, Users, DollarSign, LineChart, Warehouse, Truck, Landmark, FileText, CheckCircle, ShieldAlert, Calculator, Lock, MessageSquare, Mic, Bot, Workflow, FileSpreadsheet, Sliders, Plane, Gauge, Tractor, Boxes, Receipt, UserCheck, Calendar, Kanban, Share2, GraduationCap, Settings, Award
} from 'lucide-react';
import { TAB_CATEGORIES } from '../../constants/tabs';
import { useAuth } from '../../context/AuthContext';

const iconMap = {
  LayoutDashboard, Stethoscope, Scan, Activity, CloudSun, Globe, Layers, Sprout, FlaskConical, Droplets,
  MapPin, History, Compass, TrendingUp, RotateCw, Bug, Scissors, PieChart, Waves,
  Users, DollarSign, LineChart, Warehouse, Truck, Landmark, FileText, CheckCircle, ShieldAlert, Calculator, Lock,
  MessageSquare, Mic, Bot, Workflow, FileSpreadsheet, Sliders, Plane, Gauge, Tractor,
  Boxes, Receipt, UserCheck, Calendar, Kanban, Share2, GraduationCap, Settings, Award
};

export const Sidebar = ({ activeTab, setActiveTab, collapsed, setCollapsed }) => {
  const { user, setShowAuthModal } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState({
    'core': true,
    'farm-intel': true,
    'market': false,
    'government': false,
    'ai-automation': false,
    'iot-smart': false,
    'farm-management': false,
    'community': false
  });

  const toggleCategory = (catId) => {
    setExpandedCategories(prev => ({ ...prev, [catId]: !prev[catId] }));
  };

  const getIconComponent = (iconName) => {
    const IconComp = iconMap[iconName] || LayoutDashboard;
    return <IconComp className="w-4 h-4" />;
  };

  return (
    <aside className={`h-[calc(100vh-4rem)] glass-panel border-r border-white/10 flex flex-col justify-between transition-all duration-300 z-20 select-none bg-black/80 ${
      collapsed ? 'w-20' : 'w-72'
    }`}>
      
      {/* Top User Header Card */}
      <div className="p-3 border-b border-white/10">
        <div 
          onClick={() => setShowAuthModal(true)}
          className="flex items-center gap-3 p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 cursor-pointer transition group"
        >
          <div className="relative">
            <img 
              src={user?.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120"} 
              alt={user?.displayName || "Farmer"} 
              className="w-10 h-10 rounded-xl object-cover border border-emerald-500/40 shadow-md group-hover:scale-105 transition-transform"
            />
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-black flex items-center justify-center text-[8px] text-black font-bold">
              ✓
            </span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-100 truncate group-hover:text-emerald-300">
                  {user?.displayName || "Sign In"}
                </span>
                <span className="text-[10px] font-semibold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">
                  {user?.badge || "👑 Elite Tier"}
                </span>
              </div>
              <p className="text-[11px] text-emerald-400 font-medium truncate">{user?.email || "Click to Authenticate"}</p>
            </div>
          )}
        </div>

        {/* Tab Search Filter */}
        {!collapsed && (
          <div className="relative mt-2.5">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Filter 50 modules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 pl-8 pr-3 bg-white/5 border border-white/10 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
            />
          </div>
        )}
      </div>

      {/* Accordion Categories & Tab Buttons */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-3 custom-scrollbar">
        {TAB_CATEGORIES.map((cat) => {
          const filteredTabs = cat.tabs.filter(t => 
            t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.desc.toLowerCase().includes(searchQuery.toLowerCase())
          );

          if (searchQuery && filteredTabs.length === 0) return null;

          const isExpanded = searchQuery ? true : expandedCategories[cat.id];

          return (
            <div key={cat.id} className="space-y-1">
              {!collapsed && (
                <button
                  onClick={() => toggleCategory(cat.id)}
                  className="w-full px-2 py-1.5 flex items-center justify-between text-[11px] font-bold font-mono tracking-wider text-slate-400 hover:text-emerald-400 transition uppercase"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>{cat.name}</span>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90 text-emerald-400' : ''}`} />
                </button>
              )}

              {(isExpanded || collapsed) && (
                <div className="space-y-0.5">
                  {filteredTabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        title={tab.name + ' - ' + tab.desc}
                        className={`w-full px-2.5 py-2 rounded-xl flex items-center justify-between text-xs font-medium transition group relative ${
                          isActive
                            ? 'bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-indigo-500/10 text-emerald-300 border border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`p-1 rounded-lg transition ${
                            isActive ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400 group-hover:text-slate-200'
                          }`}>
                            {getIconComponent(tab.icon)}
                          </div>
                          {!collapsed && (
                            <span className="truncate font-semibold">{tab.name}</span>
                          )}
                        </div>

                        {!collapsed && tab.badge && (
                          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                            isActive
                              ? 'bg-emerald-400 text-black font-bold'
                              : 'bg-white/5 text-slate-400 group-hover:bg-white/10'
                          }`}>
                            {tab.badge}
                          </span>
                        )}

                        {/* Active Bar Indicator */}
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-emerald-400 rounded-r-full shadow-glow" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Upgrade Banner */}
      {!collapsed && (
        <div className="p-3 border-t border-white/10">
          <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/20 via-orange-500/10 to-amber-900/20 border border-amber-500/30 flex items-center justify-between relative overflow-hidden group">
            <div className="flex items-center gap-2.5 z-10">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
                <Crown className="w-4 h-4 animate-bounce" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-amber-200">Upgrade to Elite</h4>
                <p className="text-[10px] text-amber-300/80">Unlock 500+ AI Features</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Hardware & Local AI Status Bar */}
      <div className="p-2 border-t border-white/10 bg-black/40 text-[10px] font-mono text-slate-400 space-y-1">
        {!collapsed ? (
          <>
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-3 h-3 text-emerald-400 animate-pulse" /> AI Models: <strong className="text-emerald-400">12 Active</strong>
              </span>
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400" /> Local LLM
              </span>
            </div>
            <div className="flex items-center justify-between text-[9px] text-slate-500">
              <span>MCP: 18 Connected</span>
              <span className="text-emerald-400">Status: Optimal</span>
            </div>
          </>
        ) : (
          <div className="flex justify-center py-1 text-emerald-400">
            <Activity className="w-4 h-4 animate-pulse" />
          </div>
        )}
      </div>
    </aside>
  );
};
