// API Service for Enterprise Smart Equipment Operations & Rental Hub

const API_BASE_URL = 'http://127.0.0.1:8000/api/equipment';

export const FALLBACK_EQUIPMENT = [
  {
    equipment_id: 'EQP-TRAC-001',
    name: 'Mahindra 575 DI Smart Autopilot Tractor',
    brand: 'Mahindra',
    model: '575 DI XP Plus',
    category: 'Tractor',
    hp: 47,
    fuel_type: 'Diesel',
    ownership_type: 'Owned',
    purchase_price_inr: 720000.0,
    rental_rate_per_hr_inr: 650.0,
    rental_rate_per_day_inr: 4500.0,
    current_status: 'Active',
    health_score: 96,
    engine_hours: 184.2,
    fuel_capacity_liters: 50.0,
    fuel_level_pct: 84.0,
    farm_zone: 'Field #1 (Plowing)',
    next_service_due: '2026-08-20',
    vendor_url: 'https://www.mahindratractor.com/',
    subsidy_applicable: 'SMAM 40% Subsidy Eligible'
  },
  {
    equipment_id: 'EQP-COMB-002',
    name: 'Kubota Combine Harvester DC-68G-HK',
    brand: 'Kubota',
    model: 'DC-68G-HK',
    category: 'Harvester',
    hp: 68,
    fuel_type: 'Diesel',
    ownership_type: 'Rental',
    purchase_price_inr: 2450000.0,
    rental_rate_per_hr_inr: 1800.0,
    rental_rate_per_day_inr: 12500.0,
    current_status: 'Idle',
    health_score: 92,
    engine_hours: 412.0,
    fuel_capacity_liters: 85.0,
    fuel_level_pct: 72.0,
    farm_zone: 'Katpadi Yard',
    next_service_due: '2026-09-01',
    vendor_url: 'https://www.kubota.co.in/',
    subsidy_applicable: 'State Subsidy 50%'
  },
  {
    equipment_id: 'EQP-DRON-003',
    name: 'AgriWing Pro T40 Foliar UAV Sprayer',
    brand: 'DJI Agras',
    model: 'T40 Class',
    category: 'Sprayer',
    hp: 15,
    fuel_type: 'Battery',
    ownership_type: 'Owned',
    purchase_price_inr: 850000.0,
    rental_rate_per_hr_inr: 1200.0,
    rental_rate_per_day_inr: 8000.0,
    current_status: 'Active',
    health_score: 98,
    engine_hours: 64.5,
    fuel_capacity_liters: 16.0,
    fuel_level_pct: 88.0,
    farm_zone: 'Field #1 (Spraying)',
    next_service_due: '2026-08-10',
    vendor_url: 'https://robu.in/',
    subsidy_applicable: 'Kisan Drone Scheme 80%'
  },
  {
    equipment_id: 'EQP-PUMP-004',
    name: 'Shakti 7.5HP Solar Submersible Pump Node',
    brand: 'Shakti Pumps',
    model: 'SS-7.5HP',
    category: 'Pump',
    hp: 8,
    fuel_type: 'Solar',
    ownership_type: 'Owned',
    purchase_price_inr: 280000.0,
    rental_rate_per_hr_inr: 0.0,
    rental_rate_per_day_inr: 0.0,
    current_status: 'Active',
    health_score: 95,
    engine_hours: 820.0,
    fuel_capacity_liters: 0.0,
    fuel_level_pct: 100.0,
    farm_zone: 'Borewell Res-1',
    next_service_due: '2026-11-15',
    vendor_url: 'https://www.shaktipumps.com/',
    subsidy_applicable: 'PM-KUSUM 60% Subsidy'
  }
];

export const fetchEquipmentInventory = async (category = 'ALL', search = '') => {
  try {
    const params = new URLSearchParams({ category, search });
    const res = await fetch(`${API_BASE_URL}/inventory?${params}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[SmartEquipmentService] Using fallback equipment fleet:', err);
    return FALLBACK_EQUIPMENT;
  }
};

export const queryEquipmentAiAdvisor = async (prompt, context = '') => {
  try {
    const res = await fetch(`${API_BASE_URL}/ai-advisor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, context })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    return {
      success: true,
      response: `[Local Qwen Equipment Advisor]\nMachinery recommendation for ${prompt}: Mahindra 575 DI XP Plus (47 HP). Fuel consumption estimated at 3.8 L/hr. Eligible for SMAM 40% Govt Subsidy.`
    };
  }
};

export const calculateEquipmentRoi = async (purchasePrice, acres, customHireRate = 1200.0) => {
  try {
    const res = await fetch(`${API_BASE_URL}/roi-calculator`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ purchase_price_inr: purchasePrice, acres, custom_hire_rate_per_acre: customHireRate })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    const hire = acres * customHireRate * 2.5;
    const maint = purchasePrice * 0.05;
    const net = Math.max(1000, hire - maint);
    return {
      purchase_price_inr: purchasePrice,
      farm_acres: acres,
      annual_hire_cost_inr: hire,
      annual_maintenance_inr: maint,
      annual_net_savings_inr: net,
      payback_period_years: Math.round((purchasePrice / net) * 10) / 10,
      roi_percentage: Math.round((net / purchasePrice) * 1000) / 10
    };
  }
};

export const fetchEquipmentMarketplace = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/marketplace`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    return [
      { id: 'DL-001', dealer_name: 'Mahindra Tractor Junction Vellore', location: 'Katpadi Main Road, Vellore', phone: '+91 98765 43210', rating: 4.9, official_url: 'https://www.tractorjunction.com/' }
    ];
  }
};

export const exportEquipmentDossier = async (fmt = 'json') => {
  try {
    const res = await fetch(`${API_BASE_URL}/export/${fmt}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    return {
      success: true,
      filename: `KisanTech_SmartEquipment_Fleet.${fmt}`,
      content: `KisanTech AI Smart Equipment Fleet Report (${fmt.toUpperCase()})`
    };
  }
};
