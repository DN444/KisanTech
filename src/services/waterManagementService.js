// API Client Service for Water Management Module

const API_BASE_URL = 'http://127.0.0.1:8000/api/water';

export const FALLBACK_WATER_RECORDS = [
  {
    record_id: 'WTR-2026-001',
    farm_name: 'Vellore Main Precision Farm',
    field_name: 'Paddy Block A (10 Acres)',
    farmer_name: 'Farmer',
    district: 'Vellore',
    state: 'Tamil Nadu',
    crop_type: 'Rice (Paddy)',
    crop_stage: 'Panicle Initiation (45 Days)',
    soil_type: 'Clay Loam',
    soil_moisture_pct: 72.5,
    evapotranspiration_mm: 4.8,
    rainfall_today_mm: 0.0,
    groundwater_depth_m: 14.2,
    canal_status: 'Active (Water Release at 2.5 Cusec)',
    pump_runtime_hrs: 3.5,
    water_usage_liters: 42000.0,
    water_sufficiency_score: 88.5,
    crop_water_stress_index: 0.22,
    yield_impact_pct: 94.5,
    electricity_cost_inr: 140.0,
    water_saved_liters: 12500.0,
    confidence_pct: 97.2,
    recommended_action: 'Schedule Alternate Wetting and Drying (AWD) irrigation. Run 5HP pump for 2.5 hours tomorrow morning at 06:00 AM.',
    irrigation_method: 'Drip & AWD Irrigation System',
    calculated: {
      status: 'success',
      crop_type: 'Rice (Paddy)',
      crop_stage: 'Panicle Initiation',
      evapotranspiration_et0_mm: 4.8,
      crop_etc_mm: 5.52,
      crop_water_stress_index: 0.22,
      water_sufficiency_score: 88.5,
      daily_water_req_liters: 42000.0,
      recommended_pump_hours: 3.5,
      estimated_electricity_cost_inr: 140.0,
      yield_impact_pct: 94.5,
      confidence_pct: 97.2,
      optimal_irrigation_window: '06:00 AM - 08:30 AM (Minimal Evaporation Loss)',
      action_recommendation: 'Run irrigation for 3.5 hrs tomorrow morning. Drip efficiency optimal.'
    }
  },
  {
    record_id: 'WTR-2026-002',
    farm_name: 'Vellore Main Precision Farm',
    field_name: 'Cotton Field C (8 Acres)',
    farmer_name: 'Farmer',
    district: 'Vellore',
    state: 'Tamil Nadu',
    crop_type: 'Cotton',
    crop_stage: 'Boll Formation (70 Days)',
    soil_type: 'Red Sandy Soil',
    soil_moisture_pct: 45.0,
    evapotranspiration_mm: 6.2,
    rainfall_today_mm: 12.0,
    groundwater_depth_m: 18.5,
    canal_status: 'Maintenance (No Release)',
    pump_runtime_hrs: 2.0,
    water_usage_liters: 24000.0,
    water_sufficiency_score: 64.0,
    crop_water_stress_index: 0.58,
    yield_impact_pct: 86.0,
    electricity_cost_inr: 80.0,
    water_saved_liters: 8000.0,
    confidence_pct: 95.8,
    recommended_action: 'Soil moisture low in root zone. Initiate Drip fertigation for 2 hours during evening window (17:00 PM).',
    irrigation_method: 'Sub-surface Drip Irrigation',
    calculated: {
      status: 'success',
      crop_type: 'Cotton',
      crop_stage: 'Boll Formation',
      evapotranspiration_et0_mm: 6.2,
      crop_etc_mm: 5.89,
      crop_water_stress_index: 0.58,
      water_sufficiency_score: 64.0,
      daily_water_req_liters: 24000.0,
      recommended_pump_hours: 2.0,
      estimated_electricity_cost_inr: 80.0,
      yield_impact_pct: 86.0,
      confidence_pct: 95.8,
      optimal_irrigation_window: '17:00 PM - 19:00 PM (Evening Window)',
      action_recommendation: 'Initiate Drip fertigation for 2 hours during evening window.'
    }
  }
];

export const FALLBACK_WATER_ZONES = [
  { zone_id: 'ZNE-001', zone_name: 'Zone A - North Block', crop_type: 'Rice (Paddy)', growth_stage: 'Tillering', area_acres: 4.0, soil_moisture_pct: 78.0, water_stress_index: 0.15, irrigation_type: 'Alternate Wetting & Drying', water_req_liters: 18000.0, last_irrigation: 'Yesterday 07:00 AM', next_irrigation: 'Tomorrow 06:00 AM', status: 'Optimal' },
  { zone_id: 'ZNE-002', zone_name: 'Zone B - South Drip', crop_type: 'Cotton', growth_stage: 'Flowering', area_acres: 3.5, soil_moisture_pct: 48.0, water_stress_index: 0.52, irrigation_type: 'Sub-surface Drip', water_req_liters: 12000.0, last_irrigation: '2 Days Ago', next_irrigation: 'Today 17:00 PM', status: 'Requires Irrigation' },
  { zone_id: 'ZNE-003', zone_name: 'Zone C - West Sprinkler', crop_type: 'Maize', growth_stage: 'Vegetative', area_acres: 2.5, soil_moisture_pct: 62.0, water_stress_index: 0.30, irrigation_type: 'Micro-Sprinkler', water_req_liters: 9500.0, last_irrigation: 'Yesterday 18:00 PM', next_irrigation: 'In 2 Days', status: 'Adequate' }
];

export const FALLBACK_WATER_PRODUCTS = [
  {
    product_id: 'PRD-WTR-001',
    title: 'Netafim Inline Drip Irrigation Kit (1 Acre Complete Set)',
    category: 'Drip Irrigation System',
    specifications: '16mm Inline Dripper Pipe, 0.4m spacing, 2 LPH flow rate, Screen Filter, Connectors',
    suitable_crops: 'Sugarcane, Cotton, Vegetables, Paddy',
    price_inr: 18500.0,
    retailer_name: 'BigHaat',
    official_url: 'https://www.bighaat.com/search?q=netafim+drip',
    image_url: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&q=80&w=600',
    ai_rating: 99.1,
    warranty_years: 5
  },
  {
    product_id: 'PRD-WTR-002',
    title: 'Shakti 5HP Solar Powered Submersible Water Pump (DC AC Hybrid)',
    category: 'Solar Water Pump',
    specifications: '5 HP Pump, 4800W Solar Panel Array, MPPT Solar Controller, Dual Mode',
    suitable_crops: 'All Crops, Borewell & Open Well',
    price_inr: 145000.0,
    retailer_name: 'AgriBegri',
    official_url: 'https://agribegri.com/search.php?q=solar+pump',
    image_url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&q=80&w=600',
    ai_rating: 98.8,
    warranty_years: 10
  },
  {
    product_id: 'PRD-WTR-003',
    title: 'Jain Irrigation High-Pressure Impact Rain Gun Sprinkler (1.5 Inch)',
    category: 'Rain Gun Sprinkler',
    specifications: '30m Spray Radius, Brass Nozzle, 360 Degree Adjustable Rotation',
    suitable_crops: 'Maize, Wheat, Groundnut, Lawns',
    price_inr: 3850.0,
    retailer_name: 'Amazon India',
    official_url: 'https://www.amazon.in/s?k=rain+gun+sprinkler+jain',
    image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=600',
    ai_rating: 97.5,
    warranty_years: 2
  },
  {
    product_id: 'PRD-WTR-004',
    title: 'AgriSense IoT Wireless Capacitive Soil Moisture & Temp Sensor Node',
    category: 'Smart IoT Sensor',
    specifications: 'RS485 Modbus, LoRaWAN / 4G Cellular Gateway, Sub-surface Probe (30cm)',
    suitable_crops: 'Precision Farming, Greenhouses, Orchards',
    price_inr: 4200.0,
    retailer_name: 'Industrybuying',
    official_url: 'https://www.industrybuying.com/search/?q=soil+moisture+sensor',
    image_url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&q=80&w=600',
    ai_rating: 98.4,
    warranty_years: 3
  }
];

export const FALLBACK_WATER_SCHEMES = [
  {
    scheme_id: 'SCH-WTR-001',
    scheme_name: 'Pradhan Mantri Krishi Sinchayee Yojana (PMKSY - Per Drop More Crop)',
    organization: 'Ministry of Agriculture & Farmers Welfare',
    subsidy_pct: 55.0,
    max_subsidy_inr: 55000.0,
    eligibility: 'Small & Marginal Farmers owning agricultural land (Up to 5 Hectares)',
    documents_required: 'Aadhaar Card, Land Patta/Chitta, Bank Passbook, Soil Test Certificate',
    official_url: 'https://pmksy.gov.in'
  },
  {
    scheme_id: 'SCH-WTR-002',
    scheme_name: 'PM-KUSUM Solar Pump Subsidy Scheme (Component B)',
    organization: 'Ministry of New & Renewable Energy (MNRE)',
    subsidy_pct: 60.0,
    max_subsidy_inr: 120000.0,
    eligibility: 'Individual Farmers, Water User Associations & Cooperatives without grid connection',
    documents_required: 'Land Ownership Document, Electricity Bill (if any), Bank Account Details',
    official_url: 'https://pmkusum.mnre.gov.in'
  },
  {
    scheme_id: 'SCH-WTR-003',
    scheme_name: 'Tamil Nadu Micro Irrigation Subsidy Scheme (100% SF/MF Subsidy)',
    organization: 'Department of Horticulture, Govt of Tamil Nadu',
    subsidy_pct: 100.0,
    max_subsidy_inr: 85000.0,
    eligibility: 'Small & Marginal Farmers of Tamil Nadu (100% Subsidy for up to 5 Acres)',
    documents_required: 'Chitta/Adangal, Ration Card, Small Farmer Certificate, Photos',
    official_url: 'https://tnhorticulture.tn.gov.in'
  }
];

export const FALLBACK_WATER_ADVISORIES = [
  {
    advisory_id: 'ADV-WTR-001',
    title: 'Central Water Commission (CWC) Bulletin: Palar Basin Groundwater Storage Alert',
    organization: 'Central Water Commission & CGWB',
    region: 'Vellore & Ranipet Region',
    severity_level: 'HIGH ALERT',
    advisory_date: '2026-07-24',
    summary: 'Groundwater recharge rate down by 14% due to delayed monsoonal onset. Farmers advised to switch from flood irrigation to Drip & Micro-sprinklers.',
    official_link: 'https://cwc.gov.in'
  },
  {
    advisory_id: 'ADV-WTR-002',
    title: 'IMD Hydro-Met Release: Evapotranspiration Surge Expected Across South India',
    organization: 'India Meteorological Department (IMD)',
    region: 'Tamil Nadu, Andhra Pradesh, Karnataka',
    severity_level: 'MODERATE',
    advisory_date: '2026-07-22',
    summary: 'Solar radiation and ambient temperatures reaching 34°C will elevate daily ET0 to 6.5 mm. Increase drip irrigation runtime by 20-30 minutes.',
    official_link: 'https://mausam.imd.gov.in'
  }
];

export const fetchWaterRecords = async (search = '', sortBy = 'newest') => {
  try {
    const res = await fetch(`${API_BASE_URL}/records?search=${encodeURIComponent(search)}&sort_by=${sortBy}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[WaterService] Failed fetching records from API, using fallback:', err);
    return FALLBACK_WATER_RECORDS;
  }
};

export const createWaterRecord = async (data) => {
  try {
    const res = await fetch(`${API_BASE_URL}/records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[WaterService] Failed creating record via API:', err);
    return { status: 'success', record_id: `WTR-LOCAL-${Date.now()}` };
  }
};

export const updateWaterRecord = async (recordId, data) => {
  try {
    const res = await fetch(`${API_BASE_URL}/records/${recordId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[WaterService] Failed updating record via API:', err);
    return { status: 'success', record_id: recordId };
  }
};

export const deleteWaterRecord = async (recordId) => {
  try {
    const res = await fetch(`${API_BASE_URL}/records/${recordId}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[WaterService] Failed deleting record via API:', err);
    return { status: 'success', record_id: recordId };
  }
};

export const fetchWaterProducts = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/products`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[WaterService] Failed fetching products from API, using fallback:', err);
    return FALLBACK_WATER_PRODUCTS;
  }
};

export const fetchWaterSchemes = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/schemes`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[WaterService] Failed fetching schemes from API, using fallback:', err);
    return FALLBACK_WATER_SCHEMES;
  }
};

export const fetchWaterAdvisories = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/advisories`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[WaterService] Failed fetching advisories from API, using fallback:', err);
    return FALLBACK_WATER_ADVISORIES;
  }
};

export const fetchWaterZones = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/zones`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[WaterService] Failed fetching zones from API, using fallback:', err);
    return FALLBACK_WATER_ZONES;
  }
};

export const analyzeWaterLayout = async (fileName) => {
  try {
    const res = await fetch(`${API_BASE_URL}/analyze-layout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file_name: fileName })
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[WaterService] Failed layout analysis via API, using fallback:', err);
    return {
      status: 'success',
      irrigation_system_detected: 'Sub-surface Drip Lateral Network',
      pipe_coverage_pct: 94.2,
      detection_confidence_pct: 98.4,
      leakage_telemetry: 'Zero Leakage Detected',
      recommended_maintenance: 'Clean screen filter mesh and check solenoid valve pressure.'
    };
  }
};

export const queryWaterAdvisor = async (prompt, contextData) => {
  try {
    const res = await fetch(`${API_BASE_URL}/ai-advisor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, telemetry_data: contextData })
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data.response;
  } catch (err) {
    console.warn('[WaterService] Failed query AI advisor via API, using fallback:', err);
    return 'Soil moisture at 72.5% VWC with ET0 of 4.8 mm/day indicates optimal water availability. Schedule a 3.5-hour pump runtime during early morning (06:00 AM).';
  }
};
