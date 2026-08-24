import React, { useState } from 'react';
import { FarmStateProvider } from './context/FarmStateContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthModal } from './components/ui/AuthModal';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { AIDrawer } from './components/layout/AIDrawer';
import { CommandPalette } from './components/layout/CommandPalette';
import { AIShimmerSkeleton } from './components/ui/AIShimmerSkeleton';

import { DashboardTab } from './components/tabs/DashboardTab';
import { 
  LiveWeatherTab, AICropDoctorTab, DiseaseDetectionTab, CropHealthTab, WeatherIntelTab, 
  SatelliteAnalyticsTab, SoilHealthTab, SeedRecommendationTab, FertilizerPlannerTab, IrrigationPlannerTab, FarmMapTab, LandHistoryTab, NdviAnalysisTab 
} from './components/tabs/CoreTabs';
import { FarmIntelTabs } from './components/tabs/FarmIntelTabs';
import { MarketTabs } from './components/tabs/MarketTabs';
import { GovtTabs } from './components/tabs/GovtTabs';
import { AITabs } from './components/tabs/AITabs';
import { IoTTabs } from './components/tabs/IoTTabs';
import { ManagementTabs } from './components/tabs/ManagementTabs';
import { CommunityTabs } from './components/tabs/CommunityTabs';

function MainContent() {
  const { showAuthModal, setShowAuthModal, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isAIDrawerOpen, setIsAIDrawerOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isLoadingTab, setIsLoadingTab] = useState(false);

  const handleTabChange = (tabId) => {
    setIsLoadingTab(true);
    setActiveTab(tabId);
    setTimeout(() => {
      setIsLoadingTab(false);
    }, 400);
  };

  const renderActiveTabContent = () => {
    if (isLoadingTab) {
      return <AIShimmerSkeleton title={`Loading ${activeTab.toUpperCase()} Data...`} />;
    }

    switch (activeTab) {
      // Category 1: Core
      case 'dashboard':
        return <DashboardTab onSelectTab={handleTabChange} toggleAIDrawer={() => setIsAIDrawerOpen(true)} />;
      case 'live-weather':
        return <LiveWeatherTab />;
      case 'ai-crop-doctor':
        return <AICropDoctorTab />;
      case 'disease-detection':
        return <DiseaseDetectionTab />;
      case 'crop-health':
        return <CropHealthTab />;
      case 'weather-intel':
        return <WeatherIntelTab />;
      case 'satellite-analytics':
        return <SatelliteAnalyticsTab />;
      case 'soil-health':
        return <SoilHealthTab />;
      case 'seed-recommendation':
        return <SeedRecommendationTab />;
      case 'fertilizer-planner':
        return <FertilizerPlannerTab />;
      case 'irrigation-planner':
        return <IrrigationPlannerTab />;
      case 'farm-map':
        return <FarmMapTab />;
      case 'land-history':
        return <LandHistoryTab />;
      case 'ndvi-analysis':
        return <NdviAnalysisTab />;

      // Category 2: Farm Intel
      case 'yield-prediction':
      case 'harvest-planner':
      case 'crop-rotation':
      case 'pest-prediction':
      case 'weed-detection':
      case 'nutrient-analysis':
      case 'water-management':
        return <FarmIntelTabs subTab={activeTab} />;

      // Category 3: Market
      case 'live-market':
      case 'buyer-marketplace':
      case 'sell-produce':
      case 'price-prediction':
      case 'storage-warehouse':
      case 'transport-planning':
        return <MarketTabs subTab={activeTab} />;

      // Category 4: Govt
      case 'govt-schemes':
      case 'subsidies':
      case 'crop-insurance':
      case 'loan-assistant':
      case 'document-center':
        return <GovtTabs subTab={activeTab} />;

      // Category 5: AI & Automation
      case 'ai-chat':
      case 'ai-voice-assistant':
      case 'ai-agents-center':
      case 'ai-automation':
      case 'ai-reports':
        return <AITabs subTab={activeTab} />;

      // Category 6: IoT & Smart
      case 'iot-dashboard':
      case 'drone-management':
      case 'sensor-monitor':
      case 'smart-equipment':
        return <IoTTabs subTab={activeTab} />;

      // Category 7: Management
      case 'inventory':
      case 'expenses':
      case 'finance':
      case 'employees':
      case 'calendar':
      case 'task-planner':
        return <ManagementTabs subTab={activeTab} />;

      // Category 8: Community
      case 'farmer-community':
      case 'learning-center':
      case 'settings':
      case 'profile-account':
      default:
        return <CommunityTabs subTab={activeTab} />;
    }
  };

  return (
    <FarmStateProvider>
      <div className="min-h-screen bg-[#02040a] text-slate-100 aurora-bg flex flex-col font-sans selection:bg-emerald-500 selection:text-black relative">
        
        {/* Top Header */}
        <Header 
          onOpenCommand={() => setIsCommandOpen(true)}
          toggleAIDrawer={() => setIsAIDrawerOpen(!isAIDrawerOpen)}
          isAIDrawerOpen={isAIDrawerOpen}
        />

        {/* Main Workspace */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left 50-Tab Dock */}
          <Sidebar 
            activeTab={activeTab}
            setActiveTab={handleTabChange}
            collapsed={sidebarCollapsed}
            setCollapsed={setSidebarCollapsed}
          />

          {/* Center Active Tab Content Viewport */}
          <main className="flex-1 p-4 md:p-6 overflow-y-auto custom-scrollbar h-[calc(100vh-4rem)]">
            {renderActiveTabContent()}
          </main>
        </div>

        {/* Slide-over Right AI Assistant Drawer */}
        <AIDrawer 
          isOpen={isAIDrawerOpen}
          onClose={() => setIsAIDrawerOpen(false)}
          activeTab={activeTab}
        />

        {/* Ctrl+K Global Command Palette */}
        <CommandPalette 
          isOpen={isCommandOpen}
          onClose={() => setIsCommandOpen(false)}
          onSelectTab={handleTabChange}
        />

        <AuthModal 
          isOpen={showAuthModal}
          onClose={() => { if (isAuthenticated) setShowAuthModal(false); }}
        />

      </div>
    </FarmStateProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}
