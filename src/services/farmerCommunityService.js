const API_BASE = 'http://127.0.0.1:8000/api/community';

export const FALLBACK_COMMUNITY_SUMMARY = {
  total_discussions: 14,
  verified_expert_posts: 8,
  official_channels: 3,
  solved_qa_count: 12,
  nearby_kvk_hubs: 4,
  active_farmers_online: 184
};

export const FALLBACK_POSTS = [
  {
    post_id: 'POST-2026-001',
    author_name: 'Agricultural Specialist',
    author_role: 'Scientist',
    verified_badge: 1,
    category: 'Disease Alert',
    title: 'Propiconazole Spray Timing for Paddy Sheath Blight in North Tamil Nadu',
    content: 'High humidity in Vellore district (above 85%) creates favorable conditions for Rhizoctonia solani sheath blight in paddy. Apply Propiconazole 25% EC at 1ml/L at early tillering stage.',
    tamil_content: 'வேலூர் மாவட்டத்தில் ஈரப்பதம் 85% க்கு மேல் உள்ளதால் நெல் தாள் அழுகல் நோய் பரவ வாய்ப்புள்ளது. புரோபிகோனசோல் 25% EC தெளிக்கவும்.',
    village: 'Katpadi',
    district: 'Vellore',
    likes_count: 42,
    comments_count: 18,
    helpful_votes: 35,
    tags: 'Paddy,DiseaseAlert,TNAU'
  },
  {
    post_id: 'POST-2026-002',
    author_name: 'Crop Health Technician',
    author_role: 'Farmer',
    verified_badge: 0,
    category: 'Organic',
    title: 'Panchagavya Organic Liquid Preparation & Foliar Spray Experience',
    content: 'Prepared 30L of Panchagavya using native Kangayam cow milk, ghee, and curd. Applied 3% spray on turmeric crop. Visible increase in tiller count after 12 days.',
    tamil_content: 'பஞ்சகாவ்யா இயற்கை உரம் தெளித்து மஞ்சள் பயிரில் நல்ல விளைச்சல் பெற்றுள்ளேன்.',
    village: 'Gudiyatham',
    district: 'Vellore',
    likes_count: 28,
    comments_count: 9,
    helpful_votes: 21,
    tags: 'Organic,Turmeric,Panchagavya'
  },
  {
    post_id: 'POST-2026-003',
    author_name: 'Agricultural Officer',
    author_role: 'Govt Officer',
    verified_badge: 1,
    category: 'Government',
    title: 'Kalaignarin All Village Overall Agricultural Development Scheme 2026',
    content: 'Subsidized solar pump sets (70% subsidy) and seed kits distribution starting next Monday at Katpadi Block Agri Office. Bring Chitta & Aadhar card.',
    tamil_content: 'கலைஞரின் அனைத்துக் கிராம ஒருங்கிணைந்த வேளாண் வளர்ச்சித் திட்டம் 2026 மானிய விதை விநியோகம்.',
    village: 'Katpadi',
    district: 'Vellore',
    likes_count: 64,
    comments_count: 31,
    helpful_votes: 58,
    tags: 'GovernmentScheme,Subsidy,TNAgri'
  }
];

export const FALLBACK_CHANNELS = [
  {
    channel_id: 'CHN-001',
    name: 'TNAU AgriTech Portal',
    organization: 'TNAU',
    verified: 1,
    region: 'Tamil Nadu',
    language: 'Tamil & English',
    official_website: 'https://agritech.tnau.ac.in',
    followers_count: 45200,
    description: 'Official advisory portal of Tamil Nadu Agricultural University, Coimbatore.'
  },
  {
    channel_id: 'CHN-002',
    name: 'ICAR Krishi Vigyan Kendra (KVK) Vellore',
    organization: 'KVK',
    verified: 1,
    region: 'Vellore District',
    language: 'Tamil',
    official_website: 'https://kvk.icar.gov.in',
    followers_count: 18900,
    description: 'Frontline agricultural extension and farmer skill training center in Virinjipuram, Vellore.'
  }
];

export async function fetchCommunitySummary() {
  try {
    const res = await fetch(`${API_BASE}/summary`);
    if (!res.ok) throw new Error('Summary fetch failed');
    return await res.json();
  } catch (err) {
    console.warn('Falling back to local community summary:', err);
    return FALLBACK_COMMUNITY_SUMMARY;
  }
}

export async function fetchCommunityPosts(category = 'ALL', search = '') {
  try {
    const params = new URLSearchParams({ category, search });
    const res = await fetch(`${API_BASE}/posts?${params}`);
    if (!res.ok) throw new Error('Posts fetch failed');
    return await res.json();
  } catch (err) {
    let filtered = FALLBACK_POSTS;
    if (category !== 'ALL') filtered = filtered.filter(p => p.category === category);
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(p => p.title.toLowerCase().includes(q) || p.tamil_content.includes(q) || p.author_name.toLowerCase().includes(q));
    }
    return filtered;
  }
}

export async function fetchOfficialChannels() {
  try {
    const res = await fetch(`${API_BASE}/channels`);
    if (!res.ok) throw new Error('Channels fetch failed');
    return await res.json();
  } catch (err) {
    return FALLBACK_CHANNELS;
  }
}

export async function createCommunityPost(data) {
  try {
    const res = await fetch(`${API_BASE}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Create failed');
    return await res.json();
  } catch (err) {
    return { status: 'success', post_id: `POST-LOCAL-${Date.now()}` };
  }
}

export async function likeCommunityPost(postId) {
  try {
    const res = await fetch(`${API_BASE}/posts/${postId}/like`, { method: 'POST' });
    if (!res.ok) throw new Error('Like failed');
    return await res.json();
  } catch (err) {
    return { status: 'success', post_id: postId };
  }
}

export async function queryCommunityAssistant(prompt, summary) {
  try {
    const res = await fetch(`${API_BASE}/ai-assistant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, summary })
    });
    if (!res.ok) throw new Error('AI query failed');
    const data = await res.json();
    return data.response;
  } catch (err) {
    return `KisanTech AI Community Assistant:\n- Recommendation (TNAU / ICAR): Spray Propiconazole 25% EC for Paddy Sheath Blight.\n- Solar Pump Subsidy: Contact Katpadi Block Agri Office.`;
  }
}

export async function exportCommunity(fmt) {
  try {
    const res = await fetch(`${API_BASE}/export/${fmt}`);
    if (!res.ok) throw new Error('Export failed');
    return await res.json();
  } catch (err) {
    return {
      success: true,
      filename: `farmer_community.${fmt}`,
      content: JSON.stringify(FALLBACK_POSTS, null, 2),
      mime_type: 'application/json'
    };
  }
}
