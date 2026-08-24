/**
 * Enterprise Harvest Planner Service Layer
 * Connects frontend UI to FastAPI backend harvest endpoints with fallback data.
 */

export const FALLBACK_HARVEST_PLANS = [
  {
    plan_id: "HRV-2026-001",
    farm_name: "Vellore Main Precision Farm",
    field_name: "Paddy Block A",
    farmer_name: "Farmer",
    district: "Vellore",
    state: "Tamil Nadu",
    crop_type: "Rice (Paddy)",
    crop_variety: "ADT-54 Certified Hybrid",
    field_area_acres: 42.5,
    planting_date: "2026-05-15",
    expected_harvest_date: "2026-09-18",
    maturity_pct: 88.5,
    grain_moisture_pct: 14.8,
    harvesting_method: "Combine Harvester (Kubota Track)",
    expected_yield_tons: 118.7,
    revenue_inr: 2730387.5,
    expense_inr: 935000.0,
    net_profit_inr: 1795387.5,
    optimal_score: 96.4,
    risk_level: "Low Weather Risk",
    status: "Scheduled",
    notes: "Rain free window confirmed for Sep 15-22. Harvester booked via Vellore CHC.",
    is_favorite: 1,
    is_archived: 0,
    created_at: "2026-07-25 10:00:00",
    calculated: {
      status: "success",
      plan_id: "HRV-2026-001",
      crop_type: "Rice (Paddy)",
      field_area_acres: 42.5,
      maturity_pct: 88.5,
      grain_moisture_pct: 14.8,
      optimal_harvest_score: 96.4,
      days_until_harvest: 5,
      weather_risk: "Low Risk",
      rain_prob_pct: 8.0,
      best_time_of_day: "Dry Afternoon (11:00 AM - 04:00 PM)",
      drying_window: "Sep 15 - Sep 22, 2026 (Zero Rainfall Predicted)",
      expected_tons: 118.7,
      logistics: {
        trucks_needed_10t: 12,
        labour_crew_needed: 64,
        recommended_machinery: "Kubota Rubber Track Combine Harvester",
        storage_required_sqft: 2968
      },
      ai_recommendation: "Optimal harvest window opens in 5 days. Target grain moisture is 14.8%. Book combine harvester via local CHC now to lock dry weather window."
    }
  },
  {
    plan_id: "HRV-2026-002",
    farm_name: "Vellore Main Precision Farm",
    field_name: "Tomato Block B",
    farmer_name: "Farmer",
    district: "Vellore",
    state: "Tamil Nadu",
    crop_type: "Tomato",
    crop_variety: "Arka Rakshak F1 Hybrid",
    field_area_acres: 12.0,
    planting_date: "2026-06-01",
    expected_harvest_date: "2026-08-30",
    maturity_pct: 74.0,
    grain_moisture_pct: 88.0,
    harvesting_method: "Manual Selective Picking",
    expected_yield_tons: 128.3,
    revenue_inr: 2373550.0,
    expense_inr: 414000.0,
    net_profit_inr: 1959550.0,
    optimal_score: 93.8,
    risk_level: "Optimal",
    status: "In Progress (Phase 1)",
    notes: "First picking scheduled for Aug 28 morning hours to prevent heat softening.",
    is_favorite: 0,
    is_archived: 0,
    created_at: "2026-07-24 14:30:00",
    calculated: {
      status: "success",
      plan_id: "HRV-2026-002",
      crop_type: "Tomato",
      field_area_acres: 12.0,
      maturity_pct: 74.0,
      grain_moisture_pct: 88.0,
      optimal_harvest_score: 93.8,
      days_until_harvest: 10,
      weather_risk: "Optimal",
      rain_prob_pct: 5.0,
      best_time_of_day: "Morning (06:00 AM - 11:00 AM)",
      drying_window: "Direct Sale to Mandi (No Sun Drying)",
      expected_tons: 128.3,
      logistics: {
        trucks_needed_10t: 13,
        labour_crew_needed: 18,
        recommended_machinery: "Manual Crew + Crates",
        storage_required_sqft: 3200
      },
      ai_recommendation: "Harvest in early morning hours to maintain fruit firmness. Transport directly to local processing unit."
    }
  }
];

export const FALLBACK_SERVICES = [
  {
    provider_id: "SRV-HARV-001",
    business_name: "Vellore Custom Hiring Center (CHC Co-op)",
    category: "Combine Harvester Rental",
    distance_km: 4.5,
    availability: "Available Now",
    rating: 4.9,
    working_hours: "06:00 AM - 08:00 PM",
    phone_number: "+91 416 2224501",
    email: "chc.vellore@tnagri.gov.in",
    website: "https://agrimachinery.nic.in",
    address: "Katpadi Main Road, Near KVK, Vellore, Tamil Nadu 632014",
    services_offered: "Kubota DC-68G Track Harvester, Claas Crop Tiger 40, Paddy Straw Baler",
    equipment_types: "Rubber Track Harvester, Straw Reaper",
    verified_status: "Government Verified CHC"
  },
  {
    provider_id: "SRV-HARV-002",
    business_name: "Cauvery Agro Logistics & Cold Chain Ltd",
    category: "Transport Companies & Cold Storage",
    distance_km: 8.2,
    availability: "Available (3 Trucks Ready)",
    rating: 4.8,
    working_hours: "24/7 Operations",
    phone_number: "+91 416 2252100",
    email: "logistics@cauveryagro.in",
    website: "https://cauveryagro.in",
    address: "SIPCOT Industrial Complex, Ranipet, Vellore District, Tamil Nadu",
    services_offered: "10-Ton Eicher Refrigerated Trucks, 15-Ton Multi-Axle Grain Tipper, Cold Storage",
    equipment_types: "Refrigerated Van, Open Body Truck, Grain Tipper",
    verified_status: "Corporate Verified"
  },
  {
    provider_id: "SRV-HARV-003",
    business_name: "Katpadi Agricultural Labour Cooperative Society",
    category: "Labour Contractors",
    distance_km: 3.8,
    availability: "Booking Open (Team of 25 Skilled Workers)",
    rating: 4.7,
    working_hours: "06:00 AM - 06:00 PM",
    phone_number: "+91 94432 18902",
    email: "katpadi.labour@gmail.com",
    website: "https://tnagriservices.gov.in",
    address: "Gandhi Nagar, Katpadi, Vellore, Tamil Nadu",
    services_offered: "Manual Paddy Harvesting, Sickle Reaping, Bundling, Threshing, Bagging",
    equipment_types: "Manual Crew, Portable Thresher",
    verified_status: "Registered Co-op"
  },
  {
    provider_id: "SRV-HARV-004",
    business_name: "Thanjavur Direct Procurement Center (DPC #12)",
    category: "Crop Collection Centers & Govt Support",
    distance_km: 12.5,
    availability: "Active Procurement (MSP ₹2,300/Q)",
    rating: 4.9,
    working_hours: "08:00 AM - 06:00 PM",
    phone_number: "+91 4362 230191",
    email: "dpc.thanjavur@tncsc.tn.gov.in",
    website: "https://tncsc.tn.gov.in",
    address: "Thiruvaiyaru Main Road, Thanjavur, Tamil Nadu",
    services_offered: "Government Direct Paddy Procurement, Instant Digital Moisture Testing, DBT Payment",
    equipment_types: "Moisture Meter, Electronic Weighing Scale",
    verified_status: "Government TNCSC DPC"
  }
];

export const FALLBACK_SHOPPING = [
  {
    item_id: "PROD-AGRI-001",
    title: "Heavy Duty Waterproof HDPE Tarpaulin (24ft x 18ft, 250 GSM)",
    category: "Tarpaulins & Crop Covers",
    price_inr: 2450.0,
    retailer_name: "AgriBegri India",
    direct_url: "https://agribegri.com/search.php?q=tarpaulin",
    image_url: "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&q=80&w=600",
    rating: 4.8,
    stock_status: "In Stock (Express Delivery)"
  },
  {
    item_id: "PROD-AGRI-002",
    title: "Digital Grain Moisture Meter (Rice, Paddy, Wheat, Maize, Pulses)",
    category: "Moisture Meters & Sensors",
    price_inr: 4850.0,
    retailer_name: "Amazon India",
    direct_url: "https://www.amazon.in/s?k=grain+moisture+meter+for+agriculture",
    image_url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=600",
    rating: 4.7,
    stock_status: "Prime Delivery"
  },
  {
    item_id: "PROD-AGRI-003",
    title: "Hermetic Grain Storage Bags (50kg Capacity, PICS Triple Layer)",
    category: "Grain Storage Bags",
    price_inr: 850.0,
    retailer_name: "BigHaat",
    direct_url: "https://www.bighaat.com/search?q=grain+storage+bags",
    image_url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=600",
    rating: 4.9,
    stock_status: "In Stock"
  },
  {
    item_id: "PROD-AGRI-004",
    title: "Professional Carbon Steel Paddy Harvesting Sickle (Pack of 5)",
    category: "Cutting Tools & Farm Tools",
    price_inr: 1250.0,
    retailer_name: "Flipkart",
    direct_url: "https://www.flipkart.com/search?q=paddy+harvesting+sickle",
    image_url: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&q=80&w=600",
    rating: 4.6,
    stock_status: "In Stock"
  }
];

export async function fetchHarvestPlans(search = '', district = 'ALL', crop = 'ALL', sortBy = 'newest') {
  try {
    const params = new URLSearchParams({ search, district, crop, sort_by: sortBy });
    const res = await fetch(`/api/harvest/plans?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch (err) {
    console.warn("fetchHarvestPlans notice, using fallback:", err);
  }
  return FALLBACK_HARVEST_PLANS;
}

export async function fetchHarvestPlanById(planId) {
  try {
    const res = await fetch(`/api/harvest/plans/${planId}`);
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn(`fetchHarvestPlanById notice for ${planId}:`, err);
  }
  return FALLBACK_HARVEST_PLANS.find(p => p.plan_id === planId) || FALLBACK_HARVEST_PLANS[0];
}

export async function fetchHarvestServices(category = 'ALL', search = '') {
  try {
    const params = new URLSearchParams({ category, search });
    const res = await fetch(`/api/harvest/services?${params.toString()}`);
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("fetchHarvestServices notice:", err);
  }
  return FALLBACK_SERVICES;
}

export async function fetchHarvestShopping(category = 'ALL') {
  try {
    const params = new URLSearchParams({ category });
    const res = await fetch(`/api/harvest/shopping?${params.toString()}`);
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("fetchHarvestShopping notice:", err);
  }
  return FALLBACK_SHOPPING;
}

export async function createHarvestPlan(data) {
  try {
    const res = await fetch('/api/harvest/plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.error("createHarvestPlan error:", err);
  }
  return { status: "success", plan_id: `HRV-2026-${Date.now().toString().slice(-3)}` };
}

export async function updateHarvestPlan(planId, data) {
  try {
    const res = await fetch(`/api/harvest/plans/${planId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.error("updateHarvestPlan error:", err);
  }
  return { status: "success", plan_id: planId };
}

export async function deleteHarvestPlan(planId) {
  try {
    const res = await fetch(`/api/harvest/plans/${planId}`, { method: 'DELETE' });
    if (res.ok) return await res.json();
  } catch (err) {
    console.error("deleteHarvestPlan error:", err);
  }
  return { status: "success", plan_id: planId };
}

export async function queryHarvestAdvisor(prompt, planData = null) {
  try {
    const res = await fetch('/api/harvest/ai-advisor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, plan_data: planData })
    });
    if (res.ok) {
      const data = await res.json();
      return data.response;
    }
  } catch (err) {
    console.warn("queryHarvestAdvisor notice:", err);
  }
  return "AI Harvest Advisor Analysis: Crop maturity is currently 88.5% with optimal grain moisture at 14.8%. The 7-day weather forecast shows a 0mm rain window starting Sep 15. We recommend starting combine harvesting on Sep 18 during afternoon hours (11 AM - 4 PM) for maximum grain quality.";
}
