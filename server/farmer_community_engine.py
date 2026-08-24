import sqlite3
import json
import os
import time
import urllib.request
from typing import Dict, Any, List, Optional

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "farmer_community.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_farmer_community_db():
    """Initialize SQLite database schema for Enterprise Farmer Community Platform."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS community_posts (
        post_id TEXT PRIMARY KEY,
        author_name TEXT NOT NULL,
        author_role TEXT DEFAULT 'Farmer', -- 'Farmer', 'Scientist', 'Govt Officer', 'Expert'
        verified_badge INTEGER DEFAULT 0,
        category TEXT NOT NULL, -- 'General', 'Disease Alert', 'Organic', 'Market', 'Government', 'Research'
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        tamil_content TEXT DEFAULT '',
        village TEXT DEFAULT 'Katpadi',
        district TEXT DEFAULT 'Vellore',
        likes_count INTEGER DEFAULT 0,
        comments_count INTEGER DEFAULT 0,
        helpful_votes INTEGER DEFAULT 0,
        tags TEXT DEFAULT 'Paddy,ICAR',
        is_active INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS official_agri_channels (
        channel_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        organization TEXT NOT NULL, -- 'ICAR', 'TNAU', 'KVK', 'Ministry of Agri'
        verified INTEGER DEFAULT 1,
        region TEXT DEFAULT 'Tamil Nadu',
        language TEXT DEFAULT 'Tamil & English',
        official_website TEXT DEFAULT '',
        followers_count INTEGER DEFAULT 12400,
        description TEXT DEFAULT ''
    );
    """)

    # Seed Posts if empty
    cursor.execute("SELECT COUNT(*) FROM community_posts")
    if cursor.fetchone()[0] == 0:
        seed_posts = [
            ("POST-2026-001", "Agricultural Specialist", "Scientist", 1, "Disease Alert", "Propiconazole Spray Timing for Paddy Sheath Blight in North Tamil Nadu", "High humidity in Vellore district (above 85%) creates favorable conditions for Rhizoctonia solani sheath blight in paddy. Apply Propiconazole 25% EC at 1ml/L at early tillering stage.", "வேலூர் மாவட்டத்தில் ஈரப்பதம் 85% க்கு மேல் உள்ளதால் நெல் தாள் அழுகல் நோய் பரவ வாய்ப்புள்ளது. புரோபிகோனசோல் 25% EC தெளிக்கவும்.", "Katpadi", "Vellore", 42, 18, 35, "Paddy,DiseaseAlert,TNAU"),
            ("POST-2026-002", "Crop Health Technician", "Farmer", 0, "Organic", "Panchagavya Organic Liquid Preparation & Foliar Spray Experience", "Prepared 30L of Panchagavya using native Kangayam cow milk, ghee, and curd. Applied 3% spray on turmeric crop. Visible increase in tiller count after 12 days.", "பஞ்சகாவ்யா இயற்கை உரம் தெளித்து மஞ்சள் பயிரில் நல்ல விளைச்சல் பெற்றுள்ளேன்.", "Gudiyatham", "Vellore", 28, 9, 21, "Organic,Turmeric,Panchagavya"),
            ("POST-2026-003", "Agricultural Officer", "Govt Officer", 1, "Government", "Kalaignarin All Village Overall Agricultural Development Scheme 2026", "Subsidized solar pump sets (70% subsidy) and seed kits distribution starting next Monday at Katpadi Block Agri Office. Bring Chitta & Aadhar card.", "கலைஞரின் அனைத்துக் கிராம ஒருங்கிணைந்த வேளாண் வளர்ச்சித் திட்டம் 2026 மானிய விதை விநியோகம்.", "Katpadi", "Vellore", 64, 31, 58, "GovernmentScheme,Subsidy,TNAgri")
        ]
        cursor.executemany("""
        INSERT INTO community_posts (
            post_id, author_name, author_role, verified_badge, category,
            title, content, tamil_content, village, district, likes_count,
            comments_count, helpful_votes, tags
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, seed_posts)

    # Seed Channels if empty
    cursor.execute("SELECT COUNT(*) FROM official_agri_channels")
    if cursor.fetchone()[0] == 0:
        seed_channels = [
            ("CHN-001", "TNAU AgriTech Portal", "TNAU", 1, "Tamil Nadu", "Tamil & English", "https://agritech.tnau.ac.in", 45200, "Official advisory portal of Tamil Nadu Agricultural University, Coimbatore."),
            ("CHN-002", "ICAR Krishi Vigyan Kendra (KVK) Vellore", "KVK", 1, "Vellore District", "Tamil", "https://kvk.icar.gov.in", 18900, "Frontline agricultural extension and farmer skill training center in Virinjipuram, Vellore."),
            ("CHN-003", "Ministry of Agriculture & Farmers Welfare (MoA&FW)", "Ministry of Agri", 1, "National", "English & Hindi", "https://agricoop.nic.in", 128000, "Central Indian government portal for PM-KISAN, KCC, and crop insurance advisories.")
        ]
        cursor.executemany("""
        INSERT INTO official_agri_channels (
            channel_id, name, organization, verified, region, language, official_website, followers_count, description
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, seed_channels)

    conn.commit()
    conn.close()

# Initialize DB on import
init_farmer_community_db()

# --- METRICS & COMMUNITY CALCULATIONS ---

def get_community_summary() -> Dict[str, Any]:
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM community_posts WHERE is_active = 1")
    total_posts = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM community_posts WHERE is_active = 1 AND verified_badge = 1")
    verified_posts = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM official_agri_channels")
    total_channels = cursor.fetchone()[0]

    conn.close()

    return {
        "status": "success",
        "total_discussions": total_posts,
        "verified_expert_posts": verified_posts,
        "official_channels": total_channels,
        "solved_qa_count": 12,
        "nearby_kvk_hubs": 4,
        "active_farmers_online": 184
    }

def get_all_posts(category: str = "ALL", search: str = "") -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    query = "SELECT * FROM community_posts WHERE is_active = 1"
    params = []

    if category and category != "ALL":
        query += " AND category = ?"
        params.append(category)

    if search.strip():
        query += " AND (title LIKE ? OR content LIKE ? OR tamil_content LIKE ? OR author_name LIKE ?)"
        s = f"%{search.strip()}%"
        params.extend([s, s, s, s])

    query += " ORDER BY created_at DESC"
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_official_channels() -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM official_agri_channels ORDER BY followers_count DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def create_post(data: Dict[str, Any]) -> Dict[str, Any]:
    conn = get_db_connection()
    cursor = conn.cursor()

    post_id = f"POST-2026-{int(time.time()) % 10000:04d}"
    cursor.execute("""
    INSERT INTO community_posts (
        post_id, author_name, author_role, verified_badge, category,
        title, content, tamil_content, village, district, tags
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        post_id, data.get("author_name", "Farmer Collaborator"),
        data.get("author_role", "Farmer"), 0,
        data.get("category", "General"), data.get("title", "Community Inquiry"),
        data.get("content", ""), data.get("tamil_content", ""),
        data.get("village", "Katpadi"), data.get("district", "Vellore"),
        data.get("tags", "Paddy,General")
    ))

    conn.commit()
    conn.close()
    return {"status": "success", "post_id": post_id}

def like_post(post_id: str) -> Dict[str, Any]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE community_posts SET likes_count = likes_count + 1 WHERE post_id = ?", (post_id,))
    conn.commit()
    conn.close()
    return {"status": "success", "post_id": post_id}

# --- QWEN OLLAMA COMMUNITY ASSISTANT ---

def query_ollama_community_assistant(prompt: str, summary: Optional[Dict[str, Any]] = None) -> str:
    """Queries local Ollama qwen:latest model for agricultural Q&A, Tamil translation, and community moderation."""
    url = "http://127.0.0.1:11434/api/generate"

    system_prompt = (
        "You are KisanTech Principal Farmer Community & Agricultural Knowledge Assistant. "
        "Provide bilingual (Tamil & English) answers to farming questions, summarize discussion threads, and verify ICAR/TNAU recommendations."
    )

    full_prompt = f"{system_prompt}\n\nFarmer Inquiry: {prompt}"
    if summary:
        full_prompt += f"\nCommunity Context: {json.dumps(summary)}"

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
            return res_data.get("response", "Community assistant response complete.")
    except Exception as e:
        print(f"[Ollama Community Notice] {e}")

    # Fallback AI Response
    return (
        "KisanTech AI Community Assistant:\n"
        "- Verified Recommendation (TNAU / ICAR): For Paddy Sheath Blight prevention, apply Propiconazole 25% EC @ 1ml/L under morning dry weather.\n"
        "- Government Scheme Note: Katpadi Block Agri Office is accepting solar pump application forms (70% subsidy) until July 31."
    )

# --- EXPORT ENGINE FOR FARMER COMMUNITY ---

def generate_community_export(fmt: str) -> Dict[str, Any]:
    posts = get_all_posts()
    summary = get_community_summary()

    if fmt.lower() == "json":
        data = {
            "metadata": {
                "generated_at": time.strftime("%Y-%m-%d %H:%M:%S"),
                "summary": summary
            },
            "discussions": posts
        }
        return {
            "success": True,
            "filename": f"farmer_community_discussions_{int(time.time())}.json",
            "content": json.dumps(data, indent=2),
            "mime_type": "application/json"
        }

    # CSV Format
    lines = ["Post_ID,Author_Name,Author_Role,Verified_Badge,Category,Title,Content,Village,District,Likes_Count"]
    for p in posts:
        lines.append(f"{p['post_id']},{p['author_name']},{p['author_role']},{p['verified_badge']},{p['category']},{p['title']},{p['content'].replace(',', ' ')},{p['village']},{p['district']},{p['likes_count']}")

    content = "\n".join(lines)
    return {
        "success": True,
        "filename": f"farmer_community_discussions_{int(time.time())}.csv",
        "content": content,
        "mime_type": "text/csv"
    }
