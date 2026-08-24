import sqlite3
import json
import os
import time
import urllib.request
from typing import Dict, Any, List, Optional

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "learning_center.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_learning_center_db():
    """Initialize SQLite database schema for Enterprise Agriculture Learning Center."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS learning_courses (
        course_id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        tamil_title TEXT DEFAULT '',
        category TEXT NOT NULL, -- 'Rice Farming', 'Organic', 'Drone', 'IoT', 'Pest Management', 'Fertigation'
        author TEXT DEFAULT 'TNAU Extension Wing',
        duration_mins INTEGER DEFAULT 45,
        difficulty TEXT DEFAULT 'Intermediate', -- 'Beginner', 'Intermediate', 'Advanced'
        thumbnail_url TEXT DEFAULT '',
        description TEXT NOT NULL,
        likes_count INTEGER DEFAULT 120,
        is_verified INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS learning_documents (
        doc_id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        publisher TEXT NOT NULL, -- 'ICAR', 'TNAU', 'FAO', 'IRRI'
        doc_type TEXT DEFAULT 'PDF Manual', -- 'PDF Manual', 'Research Paper', 'Government Advisory'
        download_url TEXT DEFAULT '',
        summary TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_learning_notes (
        note_id TEXT PRIMARY KEY,
        topic TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Seed Courses if empty
    cursor.execute("SELECT COUNT(*) FROM learning_courses")
    if cursor.fetchone()[0] == 0:
        seed_courses = [
            ("CRS-2026-001", "Precision Paddy Crop Management & Sheath Blight Defense", "துல்லிய நெல் சாகுபடி மற்றும் நோய் மேலாண்மை", "Rice Farming", "TNAU Agronomy Dept", 50, "Intermediate", "paddy_masterclass.jpg", "Complete 4K masterclass on System of Rice Intensification (SRI), foliar spraying schedules, and nitrogen top-dressing.", 340, 1),
            ("CRS-2026-002", "Autonomous Agri-Drone Operations for Spraying & Surveillance", "வேளாண் ட்ரோன் இயக்கம் மற்றும் தெளித்தல்", "Drone", "KisanTech UAV Lab", 65, "Advanced", "drone_masterclass.jpg", "Learn multispectral NDVI indexing, flight planning using Mission Planner, and Propiconazole nozzle calibration.", 510, 1),
            ("CRS-2026-003", "Panchagavya & Bio-Fertilizer Organic Cultivation", "பஞ்சகாவ்யா இயற்கை உரம் தயாரிப்பு", "Organic", "ICAR KVK Vellore", 40, "Beginner", "organic_masterclass.jpg", "Step-by-step guide to preparing Panchagavya, Jeevamrutham, and Neem seed kernel extract (NSKE).", 280, 1),
            ("CRS-2026-004", "IoT Soil Moisture Sensors & Automated Drip Solenoids", "மண் ஈரப்பதம் சென்சார் பாசனம்", "IoT", "IIT Madras Agri-Tech", 45, "Intermediate", "iot_masterclass.jpg", "Connecting ESP32 LoRaWAN nodes to automatic solenoid valves for water conservation in turmeric.", 190, 1)
        ]
        cursor.executemany("""
        INSERT INTO learning_courses (
            course_id, title, tamil_title, category, author, duration_mins, difficulty, thumbnail_url, description, likes_count, is_verified
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, seed_courses)

    # Seed Documents if empty
    cursor.execute("SELECT COUNT(*) FROM learning_documents")
    if cursor.fetchone()[0] == 0:
        seed_docs = [
            ("DOC-001", "TNAU Paddy Crop Production Guide 2026", "TNAU", "PDF Manual", "https://agritech.tnau.ac.in/pdf/paddy2026.pdf", "Official handbook covering seed treatment, weed control, and harvest maturity indices."),
            ("DOC-002", "ICAR Sheath Blight Biological Management Bulletin", "ICAR", "Research Paper", "https://icar.org.in/bulletin_sheath_blight.pdf", "Comprehensive research paper on Trichoderma viride bio-control against Rhizoctonia solani in rice."),
            ("DOC-003", "PM-KUSUM Solar Pump Installation & Subsidy Manual", "FAO", "Government Advisory", "https://pmkusum.mnre.gov.in/guide.pdf", "Government manual explaining 70% capital subsidy eligibility and technical specs for 7.5HP solar pumps.")
        ]
        cursor.executemany("""
        INSERT INTO learning_documents (
            doc_id, title, publisher, doc_type, download_url, summary
        ) VALUES (?, ?, ?, ?, ?, ?)
        """, seed_docs)

    conn.commit()
    conn.close()

# Initialize DB on import
init_learning_center_db()

# --- METRICS & CALCULATIONS ---

def get_learning_summary() -> Dict[str, Any]:
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM learning_courses")
    total_courses = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM learning_documents")
    total_docs = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM user_learning_notes")
    total_notes = cursor.fetchone()[0]

    conn.close()

    return {
        "status": "success",
        "total_masterclasses": total_courses,
        "official_documents": total_docs,
        "saved_notes_count": total_notes,
        "completed_lessons": 3,
        "ai_quiz_score_pct": 92.5,
        "learning_hours_logged": 14.5
    }

def get_all_courses(category: str = "ALL", search: str = "") -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    query = "SELECT * FROM learning_courses WHERE 1=1"
    params = []

    if category and category != "ALL":
        query += " AND category = ?"
        params.append(category)

    if search.strip():
        query += " AND (title LIKE ? OR tamil_title LIKE ? OR description LIKE ?)"
        s = f"%{search.strip()}%"
        params.extend([s, s, s])

    query += " ORDER BY likes_count DESC"
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_all_documents() -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM learning_documents ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def save_study_note(topic: str, content: str) -> Dict[str, Any]:
    conn = get_db_connection()
    cursor = conn.cursor()
    note_id = f"NOTE-{int(time.time())}"
    cursor.execute("INSERT INTO user_learning_notes (note_id, topic, content) VALUES (?, ?, ?)", (note_id, topic, content))
    conn.commit()
    conn.close()
    return {"status": "success", "note_id": note_id}

# --- QWEN OLLAMA LEARNING TUTOR ---

def query_ollama_learning_tutor(prompt: str, summary: Optional[Dict[str, Any]] = None) -> str:
    """Queries local Ollama qwen:latest model for AI agriculture tutoring, lesson breakdown, and paper simplification."""
    url = "http://127.0.0.1:11434/api/generate"

    system_prompt = (
        "You are KisanTech AI Agriculture Professor & Master Tutor. "
        "Explain complex agronomy concepts in simple farmer-friendly terms (English & Tamil). Create revision flashcards and step-by-step guides."
    )

    full_prompt = f"{system_prompt}\n\nStudent/Farmer Question: {prompt}"
    if summary:
        full_prompt += f"\nLearning Summary Context: {json.dumps(summary)}"

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
        with urllib.request.urlopen(req, timeout=8) as response:
            res_data = json.loads(response.read().decode("utf-8"))
            return res_data.get("response", "Learning tutor session complete.")
    except Exception as e:
        print(f"[Ollama Tutor Notice] {e}")

    # Fallback AI Response
    return (
        "KisanTech AI Professor Tutor:\n"
        "1. System of Rice Intensification (SRI) Core Rule: Plant single 10-12 day young seedlings with wide 25x25cm square spacing to maximize root aeration.\n"
        "2. Panchagavya Preparation: Mix cow dung + ghee (day 1-3), add cow milk + curd + tender coconut water + banana (day 4-15), stir twice daily for 15 days."
    )

# --- EXPORT ENGINE FOR LEARNING CENTER ---

def generate_learning_export(fmt: str) -> Dict[str, Any]:
    courses = get_all_courses()
    summary = get_learning_summary()

    if fmt.lower() == "json":
        data = {
            "metadata": {
                "generated_at": time.strftime("%Y-%m-%d %H:%M:%S"),
                "summary": summary
            },
            "masterclasses": courses
        }
        return {
            "success": True,
            "filename": f"kisantech_learning_courses_{int(time.time())}.json",
            "content": json.dumps(data, indent=2),
            "mime_type": "application/json"
        }

    # CSV Format
    lines = ["Course_ID,Title,Tamil_Title,Category,Author,Duration_Mins,Difficulty,Likes_Count"]
    for c in courses:
        lines.append(f"{c['course_id']},{c['title']},{c['tamil_title']},{c['category']},{c['author']},{c['duration_mins']},{c['difficulty']},{c['likes_count']}")

    content = "\n".join(lines)
    return {
        "success": True,
        "filename": f"kisantech_learning_courses_{int(time.time())}.csv",
        "content": content,
        "mime_type": "text/csv"
    }
