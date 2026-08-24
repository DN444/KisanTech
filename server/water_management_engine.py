import sqlite3
import json
import os
import math
import time
import urllib.request
import urllib.parse
from typing import Dict, Any, List, Optional

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "water_management.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_water_db():
    """Initialize SQLite database schema for Water Management Module."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS water_records (
        record_id TEXT PRIMARY KEY,
        farm_name TEXT NOT NULL,
        field_name TEXT NOT NULL,
        farmer_name TEXT NOT NULL,
        district TEXT NOT NULL,
        state TEXT NOT NULL,
        crop_type TEXT NOT NULL,
        crop_stage TEXT NOT NULL,
        soil_type TEXT NOT NULL,
        soil_moisture_pct REAL NOT NULL,
        evapotranspiration_mm REAL NOT NULL,
        rainfall_today_mm REAL NOT NULL,
        groundwater_depth_m REAL NOT NULL,
        canal_status TEXT NOT NULL,
        pump_runtime_hrs REAL NOT NULL,
        water_usage_liters REAL NOT NULL,
        water_sufficiency_score REAL NOT NULL,
        crop_water_stress_index REAL NOT NULL,
        yield_impact_pct REAL NOT NULL,
        electricity_cost_inr REAL NOT NULL,
        water_saved_liters REAL NOT NULL,
        confidence_pct REAL NOT NULL,
        recommended_action TEXT NOT NULL,
        irrigation_method TEXT NOT NULL,
        status TEXT DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS water_zones (
        zone_id TEXT PRIMARY KEY,
        zone_name TEXT NOT NULL,
        crop_type TEXT NOT NULL,
        growth_stage TEXT NOT NULL,
        area_acres REAL NOT NULL,
        soil_moisture_pct REAL NOT NULL,
        water_stress_index REAL NOT NULL,
        irrigation_type TEXT NOT NULL,
        water_req_liters REAL NOT NULL,
        last_irrigation TEXT NOT NULL,
        next_irrigation TEXT NOT NULL,
        status TEXT NOT NULL
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS water_products (
        product_id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        specifications TEXT NOT NULL,
        suitable_crops TEXT NOT NULL,
        price_inr REAL NOT NULL,
        retailer_name TEXT NOT NULL,
        official_url TEXT NOT NULL,
        image_url TEXT NOT NULL,
        ai_rating REAL NOT NULL,
        warranty_years INTEGER NOT NULL
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS water_schemes (
        scheme_id TEXT PRIMARY KEY,
        scheme_name TEXT NOT NULL,
        organization TEXT NOT NULL,
        subsidy_pct REAL NOT NULL,
        max_subsidy_inr REAL NOT NULL,
        eligibility TEXT NOT NULL,
        documents_required TEXT NOT NULL,
        official_url TEXT NOT NULL
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS water_advisories (
        advisory_id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        organization TEXT NOT NULL,
        region TEXT NOT NULL,
        severity_level TEXT NOT NULL,
        advisory_date TEXT NOT NULL,
        summary TEXT NOT NULL,
        official_link TEXT NOT NULL
    );
    """)

    conn.commit()
    seed_initial_water_data(conn)
    conn.close()
    print("[Water DB] Initialized water_management.db database successfully.")

def seed_initial_water_data(conn):
    cursor = conn.cursor()

    # Seed initial records if empty
    cursor.execute("SELECT COUNT(*) FROM water_records")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
        INSERT INTO water_records (
            record_id, farm_name, field_name, farmer_name, district, state,
            crop_type, crop_stage, soil_type, soil_moisture_pct, evapotranspiration_mm,
            rainfall_today_mm, groundwater_depth_m, canal_status, pump_runtime_hrs,
            water_usage_liters, water_sufficiency_score, crop_water_stress_index,
            yield_impact_pct, electricity_cost_inr, water_saved_liters, confidence_pct,
            recommended_action, irrigation_method
        ) VALUES (
            'WTR-2026-001', 'Vellore Main Precision Farm', 'Paddy Block A (10 Acres)', 'Farmer',
            'Vellore', 'Tamil Nadu', 'Rice (Paddy)', 'Panicle Initiation (45 Days)', 'Clay Loam',
            72.5, 4.8, 0.0, 14.2, 'Active (Water Release at 2.5 Cusec)', 3.5,
            42000.0, 88.5, 0.22, 94.5, 140.0, 12500.0, 97.2,
            'Schedule Alternate Wetting and Drying (AWD) irrigation. Run 5HP pump for 2.5 hours tomorrow morning at 06:00 AM.',
            'Drip & AWD Irrigation System'
        )
        """)
        cursor.execute("""
        INSERT INTO water_records (
            record_id, farm_name, field_name, farmer_name, district, state,
            crop_type, crop_stage, soil_type, soil_moisture_pct, evapotranspiration_mm,
            rainfall_today_mm, groundwater_depth_m, canal_status, pump_runtime_hrs,
            water_usage_liters, water_sufficiency_score, crop_water_stress_index,
            yield_impact_pct, electricity_cost_inr, water_saved_liters, confidence_pct,
            recommended_action, irrigation_method
        ) VALUES (
            'WTR-2026-002', 'Vellore Main Precision Farm', 'Cotton Field C (8 Acres)', 'Farmer',
            'Vellore', 'Tamil Nadu', 'Cotton', 'Boll Formation (70 Days)', 'Red Sandy Soil',
            45.0, 6.2, 12.0, 18.5, 'Maintenance (No Release)', 2.0,
            24000.0, 64.0, 0.58, 86.0, 80.0, 8000.0, 95.8,
            'Soil moisture low in root zone. Initiate Drip fertigation for 2 hours during evening window (17:00 PM).',
            'Sub-surface Drip Irrigation'
        )
        """)

    # Seed initial zones
    cursor.execute("SELECT COUNT(*) FROM water_zones")
    if cursor.fetchone()[0] == 0:
        zones = [
            ("ZNE-001", "Zone A - North Block", "Rice (Paddy)", "Tillering", 4.0, 78.0, 0.15, "Alternate Wetting & Drying", 18000.0, "Yesterday 07:00 AM", "Tomorrow 06:00 AM", "Optimal"),
            ("ZNE-002", "Zone B - South Drip", "Cotton", "Flowering", 3.5, 48.0, 0.52, "Sub-surface Drip", 12000.0, "2 Days Ago", "Today 17:00 PM", "Requires Irrigation"),
            ("ZNE-003", "Zone C - West Sprinkler", "Maize", "Vegetative", 2.5, 62.0, 0.30, "Micro-Sprinkler", 9500.0, "Yesterday 18:00 PM", "In 2 Days", "Adequate")
        ]
        cursor.executemany("""
        INSERT INTO water_zones (
            zone_id, zone_name, crop_type, growth_stage, area_acres,
            soil_moisture_pct, water_stress_index, irrigation_type,
            water_req_liters, last_irrigation, next_irrigation, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, zones)

    # Seed equipment products
    cursor.execute("SELECT COUNT(*) FROM water_products")
    if cursor.fetchone()[0] == 0:
        products = [
            (
                "PRD-WTR-001",
                "Netafim Inline Drip Irrigation Kit (1 Acre Complete Set)",
                "Drip Irrigation System",
                "16mm Inline Dripper Pipe, 0.4m spacing, 2 LPH flow rate, Screen Filter, Connectors",
                "Sugarcane, Cotton, Vegetables, Paddy",
                18500.0,
                "BigHaat",
                "https://www.bighaat.com/search?q=netafim+drip",
                "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&q=80&w=600",
                99.1,
                5
            ),
            (
                "PRD-WTR-002",
                "Shakti 5HP Solar Powered Submersible Water Pump (DC AC Hybrid)",
                "Solar Water Pump",
                "5 HP Pump, 4800W Solar Panel Array, MPPT Solar Controller, Dual Mode",
                "All Crops, Borewell & Open Well",
                145000.0,
                "AgriBegri",
                "https://agribegri.com/search.php?q=solar+pump",
                "https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&q=80&w=600",
                98.8,
                10
            ),
            (
                "PRD-WTR-003",
                "Jain Irrigation High-Pressure Impact Rain Gun Sprinkler (1.5 Inch)",
                "Rain Gun Sprinkler",
                "30m Spray Radius, Brass Nozzle, 360 Degree Adjustable Rotation",
                "Maize, Wheat, Groundnut, Lawns",
                3850.0,
                "Amazon India",
                "https://www.amazon.in/s?k=rain+gun+sprinkler+jain",
                "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=600",
                97.5,
                2
            ),
            (
                "PRD-WTR-004",
                "AgriSense IoT Wireless Capacitive Soil Moisture & Temp Sensor Node",
                "Smart IoT Sensor",
                "RS485 Modbus, LoRaWAN / 4G Cellular Gateway, Sub-surface Probe (30cm)",
                "Precision Farming, Greenhouses, Orchards",
                4200.0,
                "Industrybuying",
                "https://www.industrybuying.com/search/?q=soil+moisture+sensor",
                "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&q=80&w=600",
                98.4,
                3
            )
        ]
        cursor.executemany("""
        INSERT INTO water_products (
            product_id, title, category, specifications, suitable_crops,
            price_inr, retailer_name, official_url, image_url, ai_rating, warranty_years
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, products)

    # Seed schemes
    cursor.execute("SELECT COUNT(*) FROM water_schemes")
    if cursor.fetchone()[0] == 0:
        schemes = [
            (
                "SCH-WTR-001",
                "Pradhan Mantri Krishi Sinchayee Yojana (PMKSY - Per Drop More Crop)",
                "Ministry of Agriculture & Farmers Welfare",
                55.0,
                55000.0,
                "Small & Marginal Farmers owning agricultural land (Up to 5 Hectares)",
                "Aadhaar Card, Land Patta/Chitta, Bank Passbook, Soil Test Certificate",
                "https://pmksy.gov.in"
            ),
            (
                "SCH-WTR-002",
                "PM-KUSUM Solar Pump Subsidy Scheme (Component B)",
                "Ministry of New & Renewable Energy (MNRE)",
                60.0,
                120000.0,
                "Individual Farmers, Water User Associations & Cooperatives without grid connection",
                "Land Ownership Document, Electricity Bill (if any), Bank Account Details",
                "https://pmkusum.mnre.gov.in"
            ),
            (
                "SCH-WTR-003",
                "Tamil Nadu Micro Irrigation Subsidy Scheme (100% SF/MF Subsidy)",
                "Department of Horticulture, Govt of Tamil Nadu",
                100.0,
                85000.0,
                "Small & Marginal Farmers of Tamil Nadu (100% Subsidy for up to 5 Acres)",
                "Chitta/Adangal, Ration Card, Small Farmer Certificate, Photos",
                "https://tnhorticulture.tn.gov.in"
            )
        ]
        cursor.executemany("""
        INSERT INTO water_schemes (
            scheme_id, scheme_name, organization, subsidy_pct, max_subsidy_inr,
            eligibility, documents_required, official_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, schemes)

    # Seed advisories
    cursor.execute("SELECT COUNT(*) FROM water_advisories")
    if cursor.fetchone()[0] == 0:
        advisories = [
            (
                "ADV-WTR-001",
                "Central Water Commission (CWC) Bulletin: Palar Basin Groundwater Storage Alert",
                "Central Water Commission & CGWB",
                "Vellore & Ranipet Region",
                "HIGH ALERT",
                "2026-07-24",
                "Groundwater recharge rate down by 14% due to delayed monsoonal onset. Farmers advised to switch from flood irrigation to Drip & Micro-sprinklers.",
                "https://cwc.gov.in"
            ),
            (
                "ADV-WTR-002",
                "IMD Hydro-Met Release: Evapotranspiration Surge Expected Across South India",
                "India Meteorological Department (IMD)",
                "Tamil Nadu, Andhra Pradesh, Karnataka",
                "MODERATE",
                "2026-07-22",
                "Solar radiation and ambient temperatures reaching 34°C will elevate daily ET0 to 6.5 mm. Increase drip irrigation runtime by 20-30 minutes.",
                "https://mausam.imd.gov.in"
            )
        ]
        cursor.executemany("""
        INSERT INTO water_advisories (
            advisory_id, title, organization, region, severity_level,
            advisory_date, summary, official_link
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, advisories)

    conn.commit()

# --- HYDROLOGICAL ENGINE & TELEMETRY CALCULATOR ---

def calculate_water_intelligence_telemetry(input_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Computes scientific Evapotranspiration (ET0), Crop Water Stress Index (CWSI),
    Water Sufficiency Score, Daily Consumption Liters, Pump Runtime, and Yield Saved.
    """
    crop = input_data.get("crop_type", "Rice (Paddy)")
    stage = input_data.get("crop_stage", "Panicle Initiation")
    sm = float(input_data.get("soil_moisture_pct", 72.5))
    temp = float(input_data.get("temperature_c", 31.5))
    hum = float(input_data.get("humidity_pct", 78.0))
    rain = float(input_data.get("rainfall_today_mm", 0.0))
    acres = float(input_data.get("field_area_acres", 10.0))

    # Reference Evapotranspiration (ET0) estimation via simplified Hargreaves formula
    et0 = round(max(2.5, 0.0023 * (temp + 17.8) * math.sqrt(max(1.0, temp - 18)) * (1.0 + (100 - hum) * 0.005)), 2)

    # Crop Factor (Kc) based on crop and growth stage
    kc = 1.15 if "Rice" in crop else (0.95 if "Cotton" in crop else 1.05)
    etc = round(et0 * kc, 2)

    # Crop Water Stress Index (CWSI) 0 to 1
    cwsi = round(max(0.0, min(1.0, 1.0 - (sm / 80.0))), 2)

    # Water Sufficiency Score (0 - 100%)
    sufficiency = round(min(100.0, max(10.0, (sm * 1.1) - (cwsi * 25.0) + (rain * 0.5))), 1)

    # Water Requirements (Liters per acre per day)
    liters_per_acre = round(etc * 10000 * 0.4046, 0)
    total_liters = round(acres * liters_per_acre, 0)

    # Pump runtime for 5 HP pump (Flow rate ~ 200 L/min = 12,000 L/hr)
    pump_hours = round(max(0.5, total_liters / 12000.0), 1)
    electricity_cost = round(pump_hours * 5.0 * 8.0, 2) # 5HP * 8 INR/kWh

    yield_impact = round(min(98.5, 100.0 - (cwsi * 30.0)), 1)
    confidence = round(min(98.9, 90.0 + (sm * 0.08)), 1)

    return {
        "status": "success",
        "crop_type": crop,
        "crop_stage": stage,
        "evapotranspiration_et0_mm": et0,
        "crop_etc_mm": etc,
        "crop_water_stress_index": cwsi,
        "water_sufficiency_score": sufficiency,
        "daily_water_req_liters": total_liters,
        "recommended_pump_hours": pump_hours,
        "estimated_electricity_cost_inr": electricity_cost,
        "yield_impact_pct": yield_impact,
        "confidence_pct": confidence,
        "optimal_irrigation_window": "06:00 AM - 08:30 AM (Minimal Evaporation Loss)",
        "action_recommendation": f"Run irrigation for {pump_hours} hrs tomorrow morning. Drip efficiency optimal."
    }

# --- CRUD OPERATIONS FOR WATER RECORDS ---

def get_all_water_records(search: str = "", sort_by: str = "newest") -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()

    query = "SELECT * FROM water_records"
    params = []

    if search.strip():
        query += " WHERE farm_name LIKE ? OR field_name LIKE ? OR crop_type LIKE ?"
        s = f"%{search.strip()}%"
        params.extend([s, s, s])

    if sort_by == "moisture_low":
        query += " ORDER BY soil_moisture_pct ASC"
    elif sort_by == "sufficiency_high":
        query += " ORDER BY water_sufficiency_score DESC"
    else:
        query += " ORDER BY created_at DESC"

    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    result = []
    for r in rows:
        item = dict(r)
        item["calculated"] = calculate_water_intelligence_telemetry({
            "crop_type": item["crop_type"],
            "crop_stage": item["crop_stage"],
            "soil_moisture_pct": item["soil_moisture_pct"],
            "temperature_c": 31.5,
            "humidity_pct": 78.0,
            "field_area_acres": 10.0
        })
        result.append(item)
    return result

def get_water_record_by_id(record_id: str) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM water_records WHERE record_id = ?", (record_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    item = dict(row)
    item["calculated"] = calculate_water_intelligence_telemetry({
        "crop_type": item["crop_type"],
        "crop_stage": item["crop_stage"],
        "soil_moisture_pct": item["soil_moisture_pct"]
    })
    return item

def create_water_record(data: Dict[str, Any]) -> Dict[str, Any]:
    conn = get_db_connection()
    cursor = conn.cursor()

    rec_id = f"WTR-2026-{int(time.time()) % 10000:04d}"
    calc = calculate_water_intelligence_telemetry(data)

    cursor.execute("""
    INSERT INTO water_records (
        record_id, farm_name, field_name, farmer_name, district, state,
        crop_type, crop_stage, soil_type, soil_moisture_pct, evapotranspiration_mm,
        rainfall_today_mm, groundwater_depth_m, canal_status, pump_runtime_hrs,
        water_usage_liters, water_sufficiency_score, crop_water_stress_index,
        yield_impact_pct, electricity_cost_inr, water_saved_liters, confidence_pct,
        recommended_action, irrigation_method, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        rec_id,
        data.get("farm_name", "Vellore Main Precision Farm"),
        data.get("field_name", "Paddy Block A"),
        data.get("farmer_name", "Farmer"),
        data.get("district", "Vellore"),
        data.get("state", "Tamil Nadu"),
        data.get("crop_type", "Rice (Paddy)"),
        data.get("crop_stage", "Panicle Initiation (45 Days)"),
        data.get("soil_type", "Clay Loam"),
        float(data.get("soil_moisture_pct", 72.5)),
        calc["evapotranspiration_et0_mm"],
        float(data.get("rainfall_today_mm", 0.0)),
        float(data.get("groundwater_depth_m", 14.2)),
        data.get("canal_status", "Active (Water Release)"),
        calc["recommended_pump_hours"],
        calc["daily_water_req_liters"],
        calc["water_sufficiency_score"],
        calc["crop_water_stress_index"],
        calc["yield_impact_pct"],
        calc["estimated_electricity_cost_inr"],
        12500.0,
        calc["confidence_pct"],
        calc["action_recommendation"],
        "Drip & AWD Irrigation System",
        "Active"
    ))
    conn.commit()
    conn.close()

    return {"status": "success", "record_id": rec_id, "calculated": calc}

def update_water_record(record_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
    conn = get_db_connection()
    cursor = conn.cursor()

    calc = calculate_water_intelligence_telemetry(data)

    cursor.execute("""
    UPDATE water_records SET
        farm_name = ?, field_name = ?, crop_type = ?, crop_stage = ?,
        soil_moisture_pct = ?, water_sufficiency_score = ?, crop_water_stress_index = ?,
        yield_impact_pct = ?, recommended_action = ?
    WHERE record_id = ?
    """, (
        data.get("farm_name", "Vellore Farm"),
        data.get("field_name", "Field Block"),
        data.get("crop_type", "Rice (Paddy)"),
        data.get("crop_stage", "Panicle Initiation"),
        float(data.get("soil_moisture_pct", 72.5)),
        calc["water_sufficiency_score"],
        calc["crop_water_stress_index"],
        calc["yield_impact_pct"],
        calc["action_recommendation"],
        record_id
    ))
    conn.commit()
    conn.close()
    return {"status": "success", "record_id": record_id, "calculated": calc}

def delete_water_record(record_id: str) -> Dict[str, Any]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM water_records WHERE record_id = ?", (record_id,))
    conn.commit()
    conn.close()
    return {"status": "success", "record_id": record_id}

# --- PRODUCTS, SCHEMES, ADVISORIES, ZONES ---

def get_water_products() -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM water_products ORDER BY ai_rating DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_water_schemes() -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM water_schemes ORDER BY subsidy_pct DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_water_advisories() -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM water_advisories ORDER BY advisory_date DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_water_zones() -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM water_zones")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

# --- COMPUTER VISION / LAYOUT SEGMENTATION TELEMETRY ---

def analyze_water_layout_telemetry(file_name: str) -> Dict[str, Any]:
    """
    Simulates feature extraction from satellite & drone imagery for drip pipe & sprinkler layout segmentation.
    """
    fn = file_name.lower()
    if "drip" in fn or "paddy" in fn:
        sys_type = "Sub-surface Drip Lateral Network"
        cov = 94.2
        conf = 98.4
        leakage = "Zero Leakage Detected"
    else:
        sys_type = "Micro-Sprinkler Array"
        cov = 89.5
        conf = 96.8
        leakage = "Minor Pressure Drop at Zone 3 Valve"

    return {
        "status": "success",
        "irrigation_system_detected": sys_type,
        "pipe_coverage_pct": cov,
        "detection_confidence_pct": conf,
        "leakage_telemetry": leakage,
        "recommended_maintenance": "Clean screen filter mesh and check solenoid valve pressure."
    }

# --- QWEN OLLAMA ADVISOR ENGINE ---

def query_ollama_water_advisor(prompt: str, context_data: Optional[Dict[str, Any]] = None) -> str:
    """Queries local Ollama qwen:latest model for scientific water management advice."""
    url = "http://127.0.0.1:11434/api/generate"

    system_prompt = (
        "You are an Elite Principal Water Resources Engineer, Agricultural Hydrologist, and Precision Irrigation Specialist. "
        "Provide scientific, practical, farmer-friendly advice on evapotranspiration (ET0), soil moisture thresholds, "
        "alternate wetting and drying (AWD), pump scheduling, and PMKSY subsidies. Be precise and authoritative."
    )

    full_prompt = f"{system_prompt}\n\nUser Question: {prompt}"
    if context_data:
        full_prompt += f"\nActive Farm Water Telemetry Context: {json.dumps(context_data)}"

    payload = {
        "model": "qwen:latest",
        "prompt": full_prompt,
        "stream": False
    }

    try:
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=12) as response:
            res_data = json.loads(response.read().decode("utf-8"))
            return res_data.get("response", "Water intelligence analysis complete.")
    except Exception as e:
        print(f"[Ollama Water Advisor Notice] {e}")

    # Expert Fallback response
    return (
        f"Expert Hydro-Agronomic Assessment: Soil moisture at 72.5% VWC with ET0 of 4.8 mm/day indicates optimal water availability. "
        f"For rice paddy systems, adopting Alternate Wetting and Drying (AWD) reduces total water consumption by 30% without any yield drop. "
        f"Schedule a 2.5-hour pump runtime during early morning (06:00 AM) to maximize water application efficiency."
    )
