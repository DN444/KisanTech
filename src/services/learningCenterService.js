const API_BASE = 'http://127.0.0.1:8000/api/learning';

export const FALLBACK_LEARNING_SUMMARY = {
  total_masterclasses: 4,
  official_documents: 3,
  saved_notes_count: 5,
  completed_lessons: 3,
  ai_quiz_score_pct: 92.5,
  learning_hours_logged: 14.5
};

export const FALLBACK_COURSES = [
  {
    course_id: 'CRS-2026-001',
    title: 'Precision Paddy Crop Management & Sheath Blight Defense',
    tamil_title: 'துல்லிய நெல் சாகுபடி மற்றும் நோய் மேலாண்மை',
    category: 'Rice Farming',
    author: 'TNAU Agronomy Dept',
    duration_mins: 50,
    difficulty: 'Intermediate',
    thumbnail_url: 'paddy_masterclass.jpg',
    description: 'Complete 4K masterclass on System of Rice Intensification (SRI), foliar spraying schedules, and nitrogen top-dressing.',
    likes_count: 340,
    is_verified: 1
  },
  {
    course_id: 'CRS-2026-002',
    title: 'Autonomous Agri-Drone Operations for Spraying & Surveillance',
    tamil_title: 'வேளாண் ட்ரோன் இயக்கம் மற்றும் தெளித்தல்',
    category: 'Drone',
    author: 'KisanTech UAV Lab',
    duration_mins: 65,
    difficulty: 'Advanced',
    thumbnail_url: 'drone_masterclass.jpg',
    description: 'Learn multispectral NDVI indexing, flight planning using Mission Planner, and Propiconazole nozzle calibration.',
    likes_count: 510,
    is_verified: 1
  },
  {
    course_id: 'CRS-2026-003',
    title: 'Panchagavya & Bio-Fertilizer Organic Cultivation',
    tamil_title: 'பஞ்சகாவ்யா இயற்கை உரம் தயாரிப்பு',
    category: 'Organic',
    author: 'ICAR KVK Vellore',
    duration_mins: 40,
    difficulty: 'Beginner',
    thumbnail_url: 'organic_masterclass.jpg',
    description: 'Step-by-step guide to preparing Panchagavya, Jeevamrutham, and Neem seed kernel extract (NSKE).',
    likes_count: 280,
    is_verified: 1
  }
];

export const FALLBACK_DOCUMENTS = [
  {
    doc_id: 'DOC-001',
    title: 'TNAU Paddy Crop Production Guide 2026',
    publisher: 'TNAU',
    doc_type: 'PDF Manual',
    download_url: 'https://agritech.tnau.ac.in/pdf/paddy2026.pdf',
    summary: 'Official handbook covering seed treatment, weed control, and harvest maturity indices.'
  },
  {
    doc_id: 'DOC-002',
    title: 'ICAR Sheath Blight Biological Management Bulletin',
    publisher: 'ICAR',
    doc_type: 'Research Paper',
    download_url: 'https://icar.org.in/bulletin_sheath_blight.pdf',
    summary: 'Comprehensive research paper on Trichoderma viride bio-control against Rhizoctonia solani in rice.'
  }
];

export async function fetchLearningSummary() {
  try {
    const res = await fetch(`${API_BASE}/summary`);
    if (!res.ok) throw new Error('Summary fetch failed');
    return await res.json();
  } catch (err) {
    console.warn('Falling back to local learning summary:', err);
    return FALLBACK_LEARNING_SUMMARY;
  }
}

export async function fetchLearningCourses(category = 'ALL', search = '') {
  try {
    const params = new URLSearchParams({ category, search });
    const res = await fetch(`${API_BASE}/courses?${params}`);
    if (!res.ok) throw new Error('Courses fetch failed');
    return await res.json();
  } catch (err) {
    let filtered = FALLBACK_COURSES;
    if (category !== 'ALL') filtered = filtered.filter(c => c.category === category);
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(c => c.title.toLowerCase().includes(q) || c.tamil_title.includes(q) || c.description.toLowerCase().includes(q));
    }
    return filtered;
  }
}

export async function fetchLearningDocuments() {
  try {
    const res = await fetch(`${API_BASE}/documents`);
    if (!res.ok) throw new Error('Documents fetch failed');
    return await res.json();
  } catch (err) {
    return FALLBACK_DOCUMENTS;
  }
}

export async function saveStudyNote(topic, content) {
  try {
    const res = await fetch(`${API_BASE}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, content })
    });
    if (!res.ok) throw new Error('Note save failed');
    return await res.json();
  } catch (err) {
    return { status: 'success', note_id: `NOTE-LOCAL-${Date.now()}` };
  }
}

export async function queryLearningTutor(prompt, summary) {
  try {
    const res = await fetch(`${API_BASE}/ai-tutor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, summary })
    });
    if (!res.ok) throw new Error('AI query failed');
    const data = await res.json();
    return data.response;
  } catch (err) {
    return `KisanTech AI Professor Tutor:\n- SRI Paddy Rule: Plant single young seedlings at 25x25cm spacing for optimal tillering.\n- Panchagavya Preparation: Combine cow dung, ghee, milk, curd, tender coconut water; ferment for 15 days.`;
  }
}

export async function exportLearning(fmt) {
  try {
    const res = await fetch(`${API_BASE}/export/${fmt}`);
    if (!res.ok) throw new Error('Export failed');
    return await res.json();
  } catch (err) {
    return {
      success: true,
      filename: `kisantech_learning_courses.${fmt}`,
      content: JSON.stringify(FALLBACK_COURSES, null, 2),
      mime_type: 'application/json'
    };
  }
}
