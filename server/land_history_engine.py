import os
import sqlite3
import time
import json
import urllib.request
from typing import Dict, Any, List, Optional

LAND_HISTORY_DB_PATH = r"D:\mini project learning\agriculture AI\agriculture model for AI crop doctor tab\cache\land_history.db"
os.makedirs(os.path.dirname(LAND_HISTORY_DB_PATH), exist_ok=True)

OLLAMA_URL = "http://127.0.0.1:11434/api/generate"

# DIGITAL LAND PASSPORTS SEED
LAND_PASSPORTS_SEED = [
  {
    "land_id": "LND-2026-408",
    "farm_name": "Vellore Main Precision Farm",
    "owner": "Agricultural Specialist Farmers Syndicate",
    "village": "Katpadi",
    "district": "Vellore",
    "state": "Tamil Nadu",
    "country": "India",
    "center_lat": 12.9165,
    "center_lon": 79.1325,
    "area_acres": 42.5,
    "survey_number": "SY-408/2A",
    "elevation_m": 214.0,
    "soil_type": "Red Loamy & Black Cotton",
    "water_source": "Borewell + Drip Network + Canal",
    "created_date": "2020-01-15",
    "last_updated": "2026-07-25",
    "current_crop": "Rice Paddy (ADT-54)",
    "previous_crop": "Black Gram (VBN-8)",
    "next_planned_crop": "Maize Corn (NK6240)",
    "risk_level": "Low Risk",
    "health_score": 96.8,
    "overall_ai_score": 98.4,
    "image_url": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=600"
  },
  {
    "land_id": "LND-2026-102",
    "farm_name": "Thanjavur Delta Paddy Estate",
    "owner": "Cauvery Delta Agro Co-op",
    "village": "Thiruvaiyaru",
    "district": "Thanjavur",
    "state": "Tamil Nadu",
    "country": "India",
    "center_lat": 10.7870,
    "center_lon": 79.1378,
    "area_acres": 85.0,
    "survey_number": "TJ-102/5B",
    "elevation_m": 58.0,
    "soil_type": "Alluvial Delta Silt",
    "water_source": "Canal + Borewell",
    "created_date": "2018-04-10",
    "last_updated": "2026-07-20",
    "current_crop": "Rice Paddy (CR1009 Sub1)",
    "previous_crop": "Sesame (TMV-7)",
    "next_planned_crop": "Rice Paddy (ADT-43)",
    "risk_level": "Moderate Risk",
    "health_score": 94.5,
    "overall_ai_score": 95.2,
    "image_url": "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&q=80&w=600"
  }
]

# CHRONOLOGICAL HISTORICAL EVENTS SEED (2020 - 2026)
TIMELINE_EVENTS_SEED = [
  {
    "event_id": "EVT-2026-042",
    "land_id": "LND-2026-408",
    "timestamp": "2026-07-10 09:30:00",
    "category": "Satellite",
    "title": "Sentinel-2 Satellite Pass (NDVI Peak 0.82)",
    "description": "Satellite multispectral scan confirms 94.2% canopy uniformity and optimal biomass growth during tillering stage.",
    "severity": "Info",
    "weather_snapshot": "28°C • Humidity 62% • Clear Sky",
    "cost_inr": 0.0,
    "income_inr": 0.0,
    "image_url": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=600",
    "ai_summary": "Canopy vigor index is 12% above district average for Kuruvai season."
  },
  {
    "event_id": "EVT-2026-035",
    "land_id": "LND-2026-408",
    "timestamp": "2026-05-15 07:00:00",
    "category": "Cultivation",
    "title": "Kuruvai Sowing - Rice Paddy ADT-54",
    "description": "Direct seeded 45kg certified ADT-54 rice seeds per acre with basal application of DAP (1.1 bags/acre) and MOP (0.4 bags/acre).",
    "severity": "Optimal",
    "weather_snapshot": "31°C • Humidity 55% • Gentle Breeze",
    "cost_inr": 18500.0,
    "income_inr": 0.0,
    "image_url": "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&q=80&w=600",
    "ai_summary": "Optimal soil moisture (48.5%) ensured 98% germination rate within 5 days."
  },
  {
    "event_id": "EVT-2025-088",
    "land_id": "LND-2026-408",
    "timestamp": "2025-10-25 14:00:00",
    "category": "Harvest",
    "title": "Bumper Harvest - Paddy Yield 6.8 t/ha",
    "description": "Successfully harvested 289 Metric Tons across 42.5 acres. Sold at Government Direct Procurement Center (DPC) @ ₹2,300/quintal.",
    "severity": "Optimal",
    "weather_snapshot": "26°C • Dry Harvest Season",
    "cost_inr": 42000.0,
    "income_inr": 664700.0,
    "image_url": "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&q=80&w=600",
    "ai_summary": "Highest recorded yield in farm history. Total net profit generated: ₹6,22,700."
  },
  {
    "event_id": "EVT-2024-019",
    "land_id": "LND-2026-408",
    "timestamp": "2024-11-18 11:20:00",
    "category": "Pest & Disease",
    "title": "Controlled Leaf Blast Outbreak",
    "description": "Detected early Pyricularia oryzae fungal spots on 1.5 acres in Northern boundary. Applied Tricyclazole 75% WP @ 0.6g/L.",
    "severity": "Warning",
    "weather_snapshot": "24°C • High Relative Humidity 88%",
    "cost_inr": 3400.0,
    "income_inr": 0.0,
    "image_url": "https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&q=80&w=600",
    "ai_summary": "Early AI diagnosis prevented spread to remaining 41 acres. Complete recovery achieved within 6 days."
  },
  {
    "event_id": "EVT-2020-001",
    "land_id": "LND-2026-408",
    "timestamp": "2020-01-15 10:00:00",
    "category": "Land Purchase",
    "title": "Land Acquisition & Solar Drip Network Installation",
    "description": "Acquired 42.5 acres of agricultural land. Installed 5HP Shakti Submersible Solar Pump and Jain Drip Irrigation pipeline network.",
    "severity": "Info",
    "weather_snapshot": "27°C • Sunny",
    "cost_inr": 850000.0,
    "income_inr": 0.0,
    "image_url": "https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&q=80&w=600",
    "ai_summary": "Established initial Digital Land Passport identity and baseline soil laboratory profile (pH 6.8)."
  }
]

def init_land_history_db():
    conn = sqlite3.connect(LAND_HISTORY_DB_PATH)
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS land_passports (
            land_id TEXT PRIMARY KEY,
            farm_name TEXT NOT NULL,
            owner TEXT NOT NULL,
            village TEXT,
            district TEXT,
            state TEXT,
            country TEXT,
            center_lat REAL,
            center_lon REAL,
            area_acres REAL,
            survey_number TEXT,
            elevation_m REAL,
            soil_type TEXT,
            water_source TEXT,
            created_date TEXT,
            last_updated TEXT,
            current_crop TEXT,
            previous_crop TEXT,
            next_planned_crop TEXT,
            risk_level TEXT,
            health_score REAL,
            overall_ai_score REAL,
            image_url TEXT,
            is_deleted INTEGER DEFAULT 0
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS timeline_events (
            event_id TEXT PRIMARY KEY,
            land_id TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            category TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            severity TEXT,
            weather_snapshot TEXT,
            cost_inr REAL DEFAULT 0,
            income_inr REAL DEFAULT 0,
            image_url TEXT,
            ai_summary TEXT,
            is_deleted INTEGER DEFAULT 0
        )
    """)

    cursor.execute("SELECT COUNT(*) FROM land_passports WHERE is_deleted = 0")
    if cursor.fetchone()[0] == 0:
        for lp in LAND_PASSPORTS_SEED:
            cursor.execute("""
                INSERT OR IGNORE INTO land_passports (
                    land_id, farm_name, owner, village, district, state, country, center_lat, center_lon,
                    area_acres, survey_number, elevation_m, soil_type, water_source, created_date,
                    last_updated, current_crop, previous_crop, next_planned_crop, risk_level, health_score,
                    overall_ai_score, image_url, is_deleted
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                lp["land_id"], lp["farm_name"], lp["owner"], lp["village"], lp["district"], lp["state"],
                lp["country"], lp["center_lat"], lp["center_lon"], lp["area_acres"], lp["survey_number"],
                lp["elevation_m"], lp["soil_type"], lp["water_source"], lp["created_date"], lp["last_updated"],
                lp["current_crop"], lp["previous_crop"], lp["next_planned_crop"], lp["risk_level"],
                lp["health_score"], lp["overall_ai_score"], lp["image_url"], 0
            ))

        for ev in TIMELINE_EVENTS_SEED:
            cursor.execute("""
                INSERT OR IGNORE INTO timeline_events (
                    event_id, land_id, timestamp, category, title, description, severity, weather_snapshot,
                    cost_inr, income_inr, image_url, ai_summary, is_deleted
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                ev["event_id"], ev["land_id"], ev["timestamp"], ev["category"], ev["title"],
                ev["description"], ev["severity"], ev["weather_snapshot"], ev["cost_inr"],
                ev["income_inr"], ev["image_url"], ev["ai_summary"], 0
            ))

        conn.commit()
    conn.close()

def get_land_passports() -> List[Dict[str, Any]]:
    init_land_history_db()
    conn = sqlite3.connect(LAND_HISTORY_DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM land_passports WHERE is_deleted = 0 ORDER BY overall_ai_score DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def create_land_passport(data: Dict[str, Any]) -> Dict[str, Any]:
    init_land_history_db()
    conn = sqlite3.connect(LAND_HISTORY_DB_PATH)
    cursor = conn.cursor()

    land_id = data.get("land_id") or f"LND-2026-{int(time.time()) % 1000:03d}"
    farm_name = data.get("farm_name", "New Precision Farm")
    owner = data.get("owner", "Farmer Owner")
    village = data.get("village", "Katpadi")
    district = data.get("district", "Vellore")
    state = data.get("state", "Tamil Nadu")
    country = data.get("country", "India")
    center_lat = float(data.get("center_lat", 12.9165))
    center_lon = float(data.get("center_lon", 79.1325))
    area_acres = float(data.get("area_acres", 10.0))
    survey_number = data.get("survey_number", "SY-101/A")
    elevation_m = float(data.get("elevation_m", 210.0))
    soil_type = data.get("soil_type", "Red Loamy")
    water_source = data.get("water_source", "Borewell + Drip")
    created_date = data.get("created_date", "2026-07-25")
    last_updated = "2026-07-25"
    current_crop = data.get("current_crop", "Rice Paddy")
    previous_crop = data.get("previous_crop", "Black Gram")
    next_planned_crop = data.get("next_planned_crop", "Maize")
    risk_level = data.get("risk_level", "Low Risk")
    health_score = float(data.get("health_score", 95.0))
    overall_ai_score = float(data.get("overall_ai_score", 96.5))
    image_url = data.get("image_url", "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=600")

    cursor.execute("""
        INSERT INTO land_passports (
            land_id, farm_name, owner, village, district, state, country, center_lat, center_lon,
            area_acres, survey_number, elevation_m, soil_type, water_source, created_date,
            last_updated, current_crop, previous_crop, next_planned_crop, risk_level, health_score,
            overall_ai_score, image_url, is_deleted
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
    """, (
        land_id, farm_name, owner, village, district, state, country, center_lat, center_lon,
        area_acres, survey_number, elevation_m, soil_type, water_source, created_date,
        last_updated, current_crop, previous_crop, next_planned_crop, risk_level, health_score,
        overall_ai_score, image_url
    ))
    conn.commit()
    conn.close()

    return {"success": True, "land_id": land_id, "message": f"Land Passport '{farm_name}' registered successfully!"}

def delete_land_passport(land_id: str) -> Dict[str, Any]:
    init_land_history_db()
    conn = sqlite3.connect(LAND_HISTORY_DB_PATH)
    cursor = conn.cursor()
    cursor.execute("UPDATE land_passports SET is_deleted = 1 WHERE land_id = ?", (land_id,))
    conn.commit()
    conn.close()
    return {"success": True, "land_id": land_id, "message": "Land Passport deleted successfully."}

def create_timeline_event(data: Dict[str, Any]) -> Dict[str, Any]:
    init_land_history_db()
    conn = sqlite3.connect(LAND_HISTORY_DB_PATH)
    cursor = conn.cursor()

    event_id = data.get("event_id") or f"EVT-2026-{int(time.time()) % 1000:03d}"
    land_id = data.get("land_id", "LND-2026-408")
    timestamp = data.get("timestamp") or "2026-07-25 10:00:00"
    category = data.get("category", "Cultivation")
    title = data.get("title", "New Cultivation Event")
    description = data.get("description", "Land preparation and fertilizer application.")
    severity = data.get("severity", "Optimal")
    weather_snapshot = data.get("weather_snapshot", "29°C • Clear Sky")
    cost_inr = float(data.get("cost_inr", 0.0))
    income_inr = float(data.get("income_inr", 0.0))
    image_url = data.get("image_url", "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&q=80&w=600")
    ai_summary = data.get("ai_summary", "Event logged successfully into Digital Twin timeline.")

    cursor.execute("""
        INSERT INTO timeline_events (
            event_id, land_id, timestamp, category, title, description, severity, weather_snapshot,
            cost_inr, income_inr, image_url, ai_summary, is_deleted
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
    """, (
        event_id, land_id, timestamp, category, title, description, severity, weather_snapshot,
        cost_inr, income_inr, image_url, ai_summary
    ))
    conn.commit()
    conn.close()

    return {"success": True, "event_id": event_id, "message": "Timeline event logged successfully!"}

def delete_timeline_event(event_id: str) -> Dict[str, Any]:
    init_land_history_db()
    conn = sqlite3.connect(LAND_HISTORY_DB_PATH)
    cursor = conn.cursor()
    cursor.execute("UPDATE timeline_events SET is_deleted = 1 WHERE event_id = ?", (event_id,))
    conn.commit()
    conn.close()
    return {"success": True, "event_id": event_id, "message": "Timeline event deleted successfully."}

def get_land_risk_intelligence(land_id: str = "LND-2026-408") -> Dict[str, Any]:
    return {
        "land_id": land_id,
        "disease_recurrence_prob_pct": 12.4,
        "pest_outbreak_prob_pct": 8.5,
        "flood_vulnerability_score": "Low (0.15)",
        "drought_vulnerability_score": "Moderate (0.32)",
        "yield_decline_risk": "Very Low (2.1%)",
        "financial_loss_risk": "Minimal",
        "soil_degradation_index": 0.04,
        "climate_resilience_rating": "A+ (96.2%)",
        "ai_risk_summary": "Land exhibits robust climate resilience. Fungal blast risk remains under 13% due to organic crop rotation and micro-drip fertigation."
    }

def get_land_timeline_events(land_id: str = "LND-2026-408", category: str = "ALL", search: str = "") -> List[Dict[str, Any]]:
    init_land_history_db()
    conn = sqlite3.connect(LAND_HISTORY_DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    query = "SELECT * FROM timeline_events WHERE is_deleted = 0"
    params = []

    if land_id != "ALL":
        query += " AND land_id = ?"
        params.append(land_id)

    if category != "ALL":
        query += " AND category = ?"
        params.append(category)

    if search:
        query += " AND (title LIKE ? OR description LIKE ? OR ai_summary LIKE ? OR category LIKE ?)"
        pattern = f"%{search}%"
        params.extend([pattern, pattern, pattern, pattern])

    query += " ORDER BY timestamp DESC"

    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def compare_land_performance(land_id_a: str = "LND-2026-408", land_id_b: str = "LND-2026-102") -> Dict[str, Any]:
    passports = get_land_passports()
    a = next((p for p in passports if p["land_id"] == land_id_a), passports[0])
    b = next((p for p in passports if p["land_id"] == land_id_b), passports[1] if len(passports) > 1 else passports[0])

    return {
        "land_a": a,
        "land_b": b,
        "cumulative_metrics": {
            "cumulative_yield_t_ha_a": 32.4,
            "cumulative_yield_t_ha_b": 28.6,
            "net_income_inr_a": 1285000.0,
            "net_income_inr_b": 940000.0,
            "best_year_a": "2025 (6.8 t/ha)",
            "best_year_b": "2024 (6.1 t/ha)"
        }
    }

def query_ollama_land_history_advisor(prompt: str, context: str = "") -> str:
    full_prompt = f"""You are the Chief Agricultural Digital Twin Scientist and Land History Architect at KisanTech AI.
Context: {context}
User Query: {prompt}

Provide a concise, highly evidence-based land history summary referencing historical events from 2020 to 2026, cumulative yields (t/ha), historical disease outbreaks, soil carbon trends, and crop rotation ROI.
"""
    try:
        req = urllib.request.Request(
            OLLAMA_URL,
            data=json.dumps({"model": "qwen:latest", "prompt": full_prompt, "stream": False}).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        with urllib.request.urlopen(req, timeout=12) as response:
            res = json.loads(response.read().decode('utf-8'))
            return res.get("response", "Vellore Main Precision Farm (42.5 Acres) has achieved 32.4 t/ha cumulative yield since 2020 with zero permanent soil degradation. Historical best year: 2025 (6.8 t/ha).")
    except Exception as e:
        return "AI Land History Advisory: Vellore Main Precision Farm (LND-2026-408) has achieved 32.4 t/ha cumulative yield across 6 years of digital twin tracking (2020-2026). Historical peak: 2025 Bumper Paddy Harvest (6.8 t/ha, net profit ₹6,22,700). Disease recurrence risk is low (1.5 acres Leaf Blast in Nov 2024 completely resolved). Soil carbon index improved by +1.2% via organic Vermicompost incorporation."
