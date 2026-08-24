export const TAB_CATEGORIES = [
  {
    id: 'core',
    name: 'CORE MODULES',
    icon: 'LayoutDashboard',
    tabs: [
      { id: 'dashboard', name: 'Dashboard', icon: 'LayoutDashboard', badge: 'Live', desc: 'The Command Center' },
      { id: 'live-weather', name: 'Live Weather', icon: 'CloudSun', badge: 'Hyperlocal', desc: 'Real-time Radar & Wind' },
      { id: 'ai-crop-doctor', name: 'AI Crop Doctor', icon: 'Stethoscope', badge: 'AI', desc: 'Instant Diagnostic Chat' },
      { id: 'disease-detection', name: 'Disease Detection', icon: 'Scan', badge: 'AI Scan', desc: 'Leaf & Crop Pathology' },
      { id: 'crop-health', name: 'Crop Health', icon: 'Activity', badge: '94%', desc: 'Chlorophyll & Stress Index' },
      { id: 'weather-intel', name: 'Weather Intelligence', icon: 'CloudSun', badge: 'Radar', desc: 'Rain, Wind & Calendar' },
      { id: 'satellite-analytics', name: 'Satellite Analytics', icon: 'Globe', badge: 'GIS', desc: 'Google Earth & NDVI Map' },
      { id: 'soil-health', name: 'Soil Health', icon: 'Layers', badge: 'NPK 3D', desc: 'NPK & pH 3D Simulator' },
      { id: 'seed-recommendation', name: 'Seed Recommendation', icon: 'Sprout', badge: '98% Match', desc: 'AI Season & Soil Match' },
      { id: 'fertilizer-planner', name: 'Fertilizer Planner', icon: 'FlaskConical', badge: 'Gantt', desc: 'Stage-wise Application' },
      { id: 'irrigation-planner', name: 'Irrigation Planner', icon: 'Droplets', badge: 'Auto Pump', desc: '24h Moisture Clock' },
    ]
  },
  {
    id: 'farm-intel',
    name: 'FARM INTELLIGENCE',
    icon: 'BrainCircuit',
    tabs: [
      { id: 'farm-map', name: 'Farm Map', icon: 'MapPin', badge: 'Draw', desc: 'Polygon Boundary Tool' },
      { id: 'land-history', name: 'Land History', icon: 'History', badge: 'Timeline', desc: 'Multi-year Yield Records' },
      { id: 'ndvi-analysis', name: 'NDVI Analysis', icon: 'Compass', badge: 'Heatmap', desc: 'Vegetation Heat Scale' },
      { id: 'yield-prediction', name: 'Yield Prediction', icon: 'TrendingUp', badge: '+18%', desc: 'AI Future Harvest Cone' },
      { id: 'harvest-planner', name: 'Harvest Planner', icon: 'Calendar', badge: 'Optimal', desc: 'Best Harvesting Windows' },
      { id: 'crop-rotation', name: 'Crop Rotation', icon: 'RotateCw', badge: '3-Year Wheel', desc: 'Legume Soil Cycles' },
      { id: 'pest-prediction', name: 'Pest Prediction', icon: 'Bug', badge: 'Alert', desc: 'Proximity Outbreak Map' },
      { id: 'weed-detection', name: 'Weed Detection', icon: 'Scissors', badge: 'Slider', desc: 'Before/After Bounding Boxes' },
      { id: 'nutrient-analysis', name: 'Nutrient Analysis', icon: 'PieChart', badge: 'Radar', desc: '6-Axis N-P-K-Ca-Mg Radar' },
      { id: 'water-management', name: 'Water Management', icon: 'Waves', badge: 'Fluid UI', desc: 'Reservoir & Groundwater' },
    ]
  },
  {
    id: 'market',
    name: 'MARKET INTELLIGENCE',
    icon: 'Store',
    tabs: [
      { id: 'live-market', name: 'Live Market', icon: 'TrendingUp', badge: 'Bloomberg', desc: 'Mandi Ticker & Candles' },
      { id: 'buyer-marketplace', name: 'Buyer Marketplace', icon: 'Users', badge: 'Tinder UI', desc: 'Swipe Distributors' },
      { id: 'sell-produce', name: 'Sell Produce', icon: 'DollarSign', badge: 'Wizard', desc: 'Multi-step Listing Form' },
      { id: 'price-prediction', name: 'Price Prediction', icon: 'LineChart', badge: 'Cone', desc: 'Forecast & Trend Bands' },
      { id: 'storage-warehouse', name: 'Storage & Warehouse', icon: 'Warehouse', badge: '75% Full', desc: 'Nearby Cold Chain Map' },
      { id: 'transport-planning', name: 'Transport Planning', icon: 'Truck', badge: 'GPS Route', desc: 'Logistics Profit Margin' },
    ]
  },
  {
    id: 'government',
    name: 'GOVERNMENT & FINANCE',
    icon: 'Landmark',
    tabs: [
      { id: 'govt-schemes', name: 'Govt Schemes', icon: 'FileText', badge: 'PM-KISAN', desc: 'Central & State Grants' },
      { id: 'subsidies', name: 'Subsidies Tracker', icon: 'CheckCircle', badge: 'Stepper', desc: 'Equipment & Fertilizer' },
      { id: 'crop-insurance', name: 'Crop Insurance', icon: 'ShieldAlert', badge: 'SOS Claim', desc: 'Pradhan Mantri Fasal Bima' },
      { id: 'loan-assistant', name: 'Loan Assistant', icon: 'Calculator', badge: 'KCC EMI', desc: 'Kisan Credit Card' },
      { id: 'document-center', name: 'Document Center', icon: 'Lock', badge: 'Vault', desc: 'Encrypted Land Records' },
    ]
  },
  {
    id: 'ai-automation',
    name: 'AI & AUTOMATION',
    icon: 'Cpu',
    tabs: [
      { id: 'ai-chat', name: 'AI Chat', icon: 'MessageSquare', badge: 'Multimodal', desc: 'Markdown & Camera Dock' },
      { id: 'ai-voice-assistant', name: 'AI Voice Assistant', icon: 'Mic', badge: 'Liquid Orb', desc: 'Voice Frequency Agent' },
      { id: 'ai-agents-center', name: 'AI Agents Center', icon: 'Bot', badge: '12 Active', desc: 'Pathologist & Weather Experts' },
      { id: 'ai-automation', name: 'AI Automation', icon: 'Workflow', badge: 'Blueprints', desc: 'Node-Based Logic Canvas' },
      { id: 'ai-reports', name: 'AI Reports', icon: 'FileSpreadsheet', badge: 'PDF Gen', desc: 'Export Smart Insights' },
    ]
  },
  {
    id: 'iot-smart',
    name: 'IOT & DRONES',
    icon: 'Radio',
    tabs: [
      { id: 'iot-dashboard', name: 'IoT Dashboard', icon: 'Sliders', badge: '12ms Latency', desc: 'Pumps, Lights & Relay Sw' },
      { id: 'drone-management', name: 'Drone Operations', icon: 'Plane', badge: 'HUD Feed', desc: 'UAV Telemetry & Spray' },
      { id: 'sensor-monitor', name: 'Sensor Monitor', icon: 'Gauge', badge: 'Waterfall', desc: 'Live Soil Telemetry' },
      { id: 'smart-equipment', name: 'Smart Equipment', icon: 'Tractor', badge: 'GPS Dots', desc: 'Fleet Automation Tracking' },
    ]
  },
  {
    id: 'farm-management',
    name: 'FARM MANAGEMENT',
    icon: 'Briefcase',
    tabs: [
      { id: 'inventory', name: 'Inventory', icon: 'Boxes', badge: 'Stock Alert', desc: 'Seeds, Pesticides & Fuel' },
      { id: 'expenses', name: 'Expenses', icon: 'Receipt', badge: 'Donut', desc: 'Cost Breakdown Slices' },
      { id: 'finance', name: 'Finance P&L', icon: 'DollarSign', badge: 'P&L Table', desc: 'Net Profit & Balance' },
      { id: 'employees', name: 'Employees', icon: 'UserCheck', badge: '6 Workers', desc: 'Attendance & Payroll' },
      { id: 'calendar', name: 'Farm Calendar', icon: 'Calendar', badge: 'Schedule', desc: 'Sowing & Spraying Schedule' },
      { id: 'task-planner', name: 'Task Planner', icon: 'Kanban', badge: 'Kanban', desc: 'Drag-and-Drop Tasks' },
    ]
  },
  {
    id: 'community',
    name: 'COMMUNITY & PROFILE',
    icon: 'HeartHandshake',
    tabs: [
      { id: 'farmer-community', name: 'Farmer Community', icon: 'Share2', badge: 'Feed', desc: 'Social Forum & Advice' },
      { id: 'learning-center', name: 'Learning Center', icon: 'GraduationCap', badge: '4K Video', desc: 'Masterclass Guides' },
      { id: 'settings', name: 'Settings', icon: 'Settings', badge: 'API & Local', desc: 'Ollama & System Config' },
      { id: 'profile-account', name: 'Profile & Account', icon: 'Award', badge: 'Gold Tier', desc: 'Farmer Mastery Radar' },
    ]
  }
];

export const MOCK_USER = {
  name: 'Farmer',
  title: 'Premium Farmer',
  badge: '👑 Elite Tier',
  location: 'Vellore, Tamil Nadu',
  farmSize: '12.45 Acres',
  cropPrimary: 'Paddy (Rice - ADT 54)',
  aiTokens: '48,250 / 100,000',
  localModel: 'Qwen 2.5 7B (GGUF Q4_K_M)',
  mcpConnected: 18,
  systemStatus: 'Optimal ⚡ (0.4ms)'
};
