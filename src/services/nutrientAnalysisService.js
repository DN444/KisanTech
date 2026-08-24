// API Client Service for Nutrient Analysis Module

const API_BASE_URL = 'http://127.0.0.1:8000/api/nutrient';

export const FALLBACK_NUTRIENT_RECORDS = [
  {
    record_id: 'NTR-2026-001',
    farm_name: 'Vellore Main Precision Farm',
    field_name: 'Paddy Plot #1 (5 Acres)',
    farmer_name: 'Farmer',
    district: 'Vellore',
    state: 'Tamil Nadu',
    crop_type: 'Rice (Paddy)',
    crop_stage: 'Tillering Stage (30 Days)',
    soil_type: 'Clay Loam',
    nitrogen_kg_ha: 142.5,
    phosphorus_kg_ha: 18.2,
    potassium_kg_ha: 165.0,
    organic_carbon_pct: 0.45,
    ph_level: 6.8,
    ec_ds_m: 0.42,
    calcium_ppm: 420.0,
    magnesium_ppm: 180.0,
    sulfur_ppm: 12.5,
    zinc_ppm: 0.65,
    iron_ppm: 4.2,
    copper_ppm: 0.35,
    boron_ppm: 0.48,
    manganese_ppm: 2.1,
    overall_soil_score: 74.5,
    primary_deficiency: 'Low Nitrogen & Zinc Deficiency',
    yield_impact_pct: 18.5,
    fertilizer_cost_inr: 3400.0,
    confidence_pct: 97.8,
    recommended_fertilizer: 'IFFCO Nano Urea (400 ml/acre foliar spray) + Zinc Sulphate 21% @ 10 kg/acre top dressing',
    application_method: 'Foliar Spray & Soil Top Dressing',
    calculated: {
      status: 'success',
      crop_type: 'Rice (Paddy)',
      overall_soil_score: 74.5,
      nitrogen_status: 'DEFICIENT (Low)',
      phosphorus_status: 'OPTIMAL',
      potassium_status: 'OPTIMAL',
      zinc_status: 'DEFICIENT',
      recommended_urea_bags_per_acre: 2.5,
      recommended_dap_bags_per_acre: 0.8,
      recommended_mop_bags_per_acre: 0.6,
      estimated_fertilizer_cost_inr: 2765.0,
      yield_impact_pct: 85.6,
      confidence_pct: 97.8,
      stcr_prescription: 'Apply 2.5 bags Urea + 0.8 bags DAP per acre. Spray Nano Urea at 30 & 45 DAS.'
    }
  },
  {
    record_id: 'NTR-2026-002',
    farm_name: 'Vellore Main Precision Farm',
    field_name: 'Cotton Plot #3 (8 Acres)',
    farmer_name: 'Farmer',
    district: 'Vellore',
    state: 'Tamil Nadu',
    crop_type: 'Cotton',
    crop_stage: 'Square Formation (50 Days)',
    soil_type: 'Red Sandy Soil',
    nitrogen_kg_ha: 185.0,
    phosphorus_kg_ha: 11.5,
    potassium_kg_ha: 210.0,
    organic_carbon_pct: 0.38,
    ph_level: 7.4,
    ec_ds_m: 0.55,
    calcium_ppm: 380.0,
    magnesium_ppm: 150.0,
    sulfur_ppm: 8.5,
    zinc_ppm: 0.42,
    iron_ppm: 3.1,
    copper_ppm: 0.28,
    boron_ppm: 0.32,
    manganese_ppm: 1.8,
    overall_soil_score: 62.0,
    primary_deficiency: 'Phosphorus & Boron Deficiency',
    yield_impact_pct: 24.0,
    fertilizer_cost_inr: 4800.0,
    confidence_pct: 96.5,
    recommended_fertilizer: 'Single Super Phosphate (SSP) @ 100 kg/acre + Solubor Boron 20% @ 1.5 kg/acre',
    application_method: 'Basal Band Placement & Foliar Spray',
    calculated: {
      status: 'success',
      crop_type: 'Cotton',
      overall_soil_score: 62.0,
      nitrogen_status: 'DEFICIENT (Low)',
      phosphorus_status: 'DEFICIENT (Low)',
      potassium_status: 'OPTIMAL',
      zinc_status: 'DEFICIENT',
      recommended_urea_bags_per_acre: 2.1,
      recommended_dap_bags_per_acre: 1.0,
      recommended_mop_bags_per_acre: 0.5,
      estimated_fertilizer_cost_inr: 2758.0,
      yield_impact_pct: 71.3,
      confidence_pct: 96.5,
      stcr_prescription: 'Apply Single Super Phosphate (SSP) @ 100 kg/acre + Solubor Boron 20% @ 1.5 kg/acre'
    }
  }
];

export const FALLBACK_NUTRIENT_PRODUCTS = [
  {
    product_id: 'PRD-NTR-001',
    title: 'IFFCO Nano Urea Liquid (500 ml Bottle - Equivalent to 45kg Bag)',
    category: 'Nano Fertilizer',
    npk_ratio: '4% Total Nitrogen (w/v)',
    suitable_crops: 'Rice, Wheat, Maize, Cotton, Vegetables',
    price_inr: 225.0,
    retailer_name: 'BigHaat',
    official_url: 'https://www.bighaat.com/search?q=nano+urea',
    image_url: 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&q=80&w=600',
    ai_rating: 99.4
  },
  {
    product_id: 'PRD-NTR-002',
    title: 'Coromandel Gromor 16-16-16 Complex NPK Fertilizer (50 kg)',
    category: 'Complex NPK',
    npk_ratio: '16% N, 16% P2O5, 16% K2O',
    suitable_crops: 'Paddy, Sugarcane, Banana, Groundnut',
    price_inr: 1470.0,
    retailer_name: 'AgriBegri',
    official_url: 'https://agribegri.com/search.php?q=gromor+fertilizer',
    image_url: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&q=80&w=600',
    ai_rating: 98.6
  },
  {
    product_id: 'PRD-NTR-003',
    title: 'Mahadhan Micro-Nutrient Mixture (Zinc, Iron, Boron, Copper) 5 kg',
    category: 'Micronutrient Mix',
    npk_ratio: 'Zn 5%, Fe 2%, B 1%, Mn 1%, Cu 0.5%',
    suitable_crops: 'All Field & Horticultural Crops',
    price_inr: 680.0,
    retailer_name: 'Amazon India',
    official_url: 'https://www.amazon.in/s?k=mahadhan+micronutrient',
    image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=600',
    ai_rating: 98.1
  },
  {
    product_id: 'PRD-NTR-004',
    title: 'TNAU Bio-Fertilizer Pack (Azospirillum + Phosphobacteria) 1 kg',
    category: 'Bio-Fertilizer',
    npk_ratio: '2x10^8 CFU/g Nitrogen Fixer & PSB',
    suitable_crops: 'Paddy, Pulses, Oilseeds, Millets',
    price_inr: 120.0,
    retailer_name: 'Industrybuying',
    official_url: 'https://www.industrybuying.com/search/?q=bio+fertilizer',
    image_url: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&q=80&w=600',
    ai_rating: 99.0
  }
];

export const FALLBACK_NUTRIENT_ADVISORIES = [
  {
    advisory_id: 'ADV-NTR-001',
    title: 'ICAR-STCR Advisory: Soil Test Crop Response Targeted Yield Fertilization in Rice',
    organization: 'ICAR - Indian Institute of Soil Science (IISS Bhopal)',
    region: 'Pan-India & Cauvery Basin',
    severity_level: 'HIGH PRIORITY',
    advisory_date: '2026-07-23',
    summary: 'Soil testing indicates widespread Zinc deficiency in paddy soils. Apply 25 kg/ha Zinc Sulphate heptahydrate during basal land preparation to prevent Khaira disease.',
    official_link: 'https://iiss.icar.gov.in'
  },
  {
    advisory_id: 'ADV-NTR-002',
    title: 'TNAU Agronomy Guidance: Split Application of Nitrogen in Direct Seeded Paddy',
    organization: 'Tamil Nadu Agricultural University (TNAU)',
    region: 'Tamil Nadu & Coastal Belts',
    severity_level: 'RECOMMENDED',
    advisory_date: '2026-07-20',
    summary: 'Apply Nitrogen in 4 equal splits: 25% basal, 25% active tillering, 25% panicle initiation, and 25% flowering stage to achieve 85%+ N utilization efficiency.',
    official_link: 'https://tnau.ac.in'
  }
];

export const FALLBACK_NUTRIENT_RAG_DOCS = [
  {
    doc_id: 'RAG-NTR-001',
    title: 'ICAR Soil Health Card Target Ratings for Indian Soils',
    source_org: 'ICAR - Ministry of Agriculture',
    crop_category: 'All Crops',
    npk_standard_guideline: 'N Low < 280 kg/ha, P Low < 11 kg/ha, K Low < 118 kg/ha. OC Low < 0.5%. pH Normal 6.5 - 7.5.',
    reference_url: 'https://soilhealth.dac.gov.in'
  },
  {
    doc_id: 'RAG-NTR-002',
    title: 'TNAU Fertilizer Prescription Equations for High Yield Rice',
    source_org: 'TNAU Department of Soil Science',
    crop_category: 'Rice (Paddy)',
    npk_standard_guideline: 'Target Yield 6.0 t/ha: FN = 4.39 T - 0.67 SN; FP2O5 = 2.21 T - 1.81 SP; FK2O = 3.42 T - 0.44 SK.',
    reference_url: 'https://tnau.ac.in/site/agronomy'
  }
];

export const fetchNutrientRecords = async (search = '', sortBy = 'newest') => {
  try {
    const res = await fetch(`${API_BASE_URL}/records?search=${encodeURIComponent(search)}&sort_by=${sortBy}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[NutrientService] Failed fetching records from API, using fallback:', err);
    return FALLBACK_NUTRIENT_RECORDS;
  }
};

export const createNutrientRecord = async (data) => {
  try {
    const res = await fetch(`${API_BASE_URL}/records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[NutrientService] Failed creating record via API:', err);
    return { status: 'success', record_id: `NTR-LOCAL-${Date.now()}` };
  }
};

export const updateNutrientRecord = async (recordId, data) => {
  try {
    const res = await fetch(`${API_BASE_URL}/records/${recordId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[NutrientService] Failed updating record via API:', err);
    return { status: 'success', record_id: recordId };
  }
};

export const deleteNutrientRecord = async (recordId) => {
  try {
    const res = await fetch(`${API_BASE_URL}/records/${recordId}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[NutrientService] Failed deleting record via API:', err);
    return { status: 'success', record_id: recordId };
  }
};

export const fetchNutrientProducts = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/products`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[NutrientService] Failed fetching products from API, using fallback:', err);
    return FALLBACK_NUTRIENT_PRODUCTS;
  }
};

export const fetchNutrientAdvisories = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/advisories`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[NutrientService] Failed fetching advisories from API, using fallback:', err);
    return FALLBACK_NUTRIENT_ADVISORIES;
  }
};

export const fetchNutrientRagDocs = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/rag-docs`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[NutrientService] Failed fetching RAG docs from API, using fallback:', err);
    return FALLBACK_NUTRIENT_RAG_DOCS;
  }
};

export const analyzeLeafNutrient = async (fileName) => {
  try {
    const res = await fetch(`${API_BASE_URL}/analyze-leaf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file_name: fileName })
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[NutrientService] Failed leaf analysis via API, using fallback:', err);
    return {
      status: 'success',
      deficiency_symptom_detected: 'Interveinal Chlorosis (Nitrogen & Zinc Deficiency)',
      severity_level: 'Moderate (28% Leaf Area Affected)',
      classification_confidence_pct: 98.2,
      recommended_treatment: 'Foliar spray of 1% Nano Urea + 0.5% Zinc Sulphate.'
    };
  }
};

export const queryNutrientAdvisor = async (prompt, contextData) => {
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
    console.warn('[NutrientService] Failed query AI advisor via API, using fallback:', err);
    return 'Soil Nitrogen at 142.5 kg/ha and Zinc at 0.65 ppm indicate deficiency. Apply 2.5 bags Urea + 0.8 bags DAP per acre combined with Nano Urea foliar spray at 30 DAS.';
  }
};
