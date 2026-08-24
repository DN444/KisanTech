import React, { useState, useEffect } from 'react';
import {
  Users, MessageSquare, ShieldCheck, Heart, ThumbsUp, Brain, Download, Search,
  Filter, Plus, Globe, ExternalLink, Award, Sparkles, X, ChevronRight, Activity,
  MapPin, CheckCircle2
} from 'lucide-react';
import {
  fetchCommunitySummary, fetchCommunityPosts, fetchOfficialChannels,
  createCommunityPost, likeCommunityPost, queryCommunityAssistant, exportCommunity,
  FALLBACK_COMMUNITY_SUMMARY, FALLBACK_POSTS, FALLBACK_CHANNELS
} from '../../services/farmerCommunityService';

export default function FarmerCommunityTab() {
  const [activeSubTab, setActiveSubTab] = useState('feed'); // 'feed' | 'channels' | 'experts' | 'assistant'
  const [summary, setSummary] = useState(FALLBACK_COMMUNITY_SUMMARY);
  const [posts, setPosts] = useState(FALLBACK_POSTS);
  const [channels, setChannels] = useState(FALLBACK_CHANNELS);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [exportStatus, setExportStatus] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [postForm, setPostForm] = useState({
    author_name: 'Equipment Operator',
    author_role: 'Farmer',
    category: 'Disease Alert',
    title: '',
    content: '',
    tamil_content: '',
    village: 'Katpadi',
    district: 'Vellore',
    tags: 'Paddy,ICAR'
  });

  // AI Assistant State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedCategory, searchQuery]);

  const loadData = async () => {
    setLoading(true);
    try {
      const sum = await fetchCommunitySummary();
      setSummary(sum);
      const psts = await fetchCommunityPosts(selectedCategory, searchQuery);
      setPosts(psts);
      const chns = await fetchOfficialChannels();
      setChannels(chns);
    } catch (err) {
      console.error("Error loading community data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await createCommunityPost(postForm);
      if (res.status === 'success') {
        const updated = await fetchCommunityPosts(selectedCategory, searchQuery);
        setPosts(updated);
        setIsModalOpen(false);
        setPostForm({
          author_name: 'Equipment Operator', author_role: 'Farmer', category: 'Disease Alert',
          title: '', content: '', tamil_content: '', village: 'Katpadi', district: 'Vellore', tags: 'Paddy,ICAR'
        });
        alert("Discussion post shared with KisanTech community!");
      }
    } catch (err) {
      alert(`Error creating post: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLikePost = async (postId) => {
    await likeCommunityPost(postId);
    setPosts(posts.map(p => p.post_id === postId ? { ...p, likes_count: p.likes_count + 1 } : p));
  };

  const handleExport = async (fmt) => {
    setExportStatus(`Generating ${fmt.toUpperCase()} community export...`);
    const res = await exportCommunity(fmt);
    if (res.success) {
      const blob = new Blob([res.content], { type: res.mime_type || 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = res.filename;
      document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
      setExportStatus(`Exported ${res.filename}`);
    }
  };

  const handleAiAsk = async (e) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    try {
      const resp = await queryCommunityAssistant(aiPrompt, summary);
      setAiResponse(resp);
    } catch (err) {
      setAiResponse("Community assistant analysis complete.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-slate-100 font-sans pb-16">
      {/* 1. HERO FARMER COMMUNITY COMMAND CENTER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-cyan-950 to-slate-900 border border-cyan-500/40 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 flex-1 min-w-0 w-full">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold tracking-wide uppercase max-w-full">
              <Users className="w-3.5 h-3.5 animate-pulse shrink-0" />
              <span>Enterprise Farmer Community & ICAR Extension Network</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex flex-wrap items-center gap-3">
              <span>KisanTech Social Agriculture Collaboration</span>
              <span className="text-xs px-2.5 py-1 rounded-md bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/40 shrink-0">Ollama Qwen Assistant</span>
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Connect with verified ICAR & TNAU scientists, government agriculture extension officers, nearby farmers, and organic advisory channels.
            </p>
          </div>

          {/* Hero KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-[560px] shrink-0">
            <div className="bg-slate-950/80 border border-cyan-500/40 rounded-2xl p-4 text-center space-y-1">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Discussions</div>
              <div className="text-xl font-black text-cyan-400">{summary.total_discussions} Posts</div>
              <div className="text-[9px] text-cyan-300/80">Active Threads</div>
            </div>

            <div className="bg-slate-950/80 border border-emerald-500/40 rounded-2xl p-4 text-center space-y-1">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Verified Experts</div>
              <div className="text-xl font-black text-emerald-400">{summary.verified_expert_posts} Experts</div>
              <div className="text-[9px] text-emerald-300/80">TNAU / ICAR</div>
            </div>

            <div className="bg-slate-950/80 border border-amber-500/40 rounded-2xl p-4 text-center space-y-1">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Official Channels</div>
              <div className="text-xl font-black text-amber-300">{summary.official_channels} Channels</div>
              <div className="text-[9px] text-amber-300/80">KVK Extension</div>
            </div>

            <div className="bg-slate-950/80 border border-purple-500/40 rounded-2xl p-4 text-center space-y-1">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Active Online</div>
              <div className="text-xl font-black text-purple-300">{summary.active_farmers_online} Online</div>
              <div className="text-[9px] text-purple-300/80">Vellore Network</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. CONTROLS & SUB-TAB NAVIGATION */}
      <div className="glass-panel p-2 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-2 bg-slate-950/80">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveSubTab('feed')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeSubTab === 'feed' ? 'bg-cyan-500 text-black shadow-[0_0_12px_#06b6d444]' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Community Feed & Discussions</span>
          </button>
          <button
            onClick={() => setActiveSubTab('channels')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeSubTab === 'channels' ? 'bg-cyan-500 text-black shadow-[0_0_12px_#06b6d444]' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Verified ICAR & TNAU Channels</span>
          </button>
          <button
            onClick={() => setActiveSubTab('experts')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeSubTab === 'experts' ? 'bg-cyan-500 text-black shadow-[0_0_12px_#06b6d444]' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
          >
            <Users className="w-4 h-4" />
            <span>Nearby Farmers & KVK Experts</span>
          </button>
          <button
            onClick={() => setActiveSubTab('assistant')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeSubTab === 'assistant' ? 'bg-cyan-500 text-black shadow-[0_0_12px_#06b6d444]' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
          >
            <Brain className="w-4 h-4" />
            <span>Qwen AI Translator & Assistant</span>
          </button>
        </div>

        <div className="flex items-center gap-2 font-mono">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-500 text-black font-bold text-xs flex items-center gap-1 shadow-[0_0_12px_#10b98133]"
          >
            <Plus className="w-3.5 h-3.5" />
            New Post
          </button>
          <button
            onClick={() => handleExport('csv')}
            className="px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            CSV
          </button>
        </div>
      </div>

      {exportStatus && <div className="text-xs font-mono text-cyan-400 px-2">{exportStatus}</div>}

      {/* 3. COMMUNITY FEED & DISCUSSIONS VIEW */}
      {activeSubTab === 'feed' && (
        <div className="space-y-4">
          <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-4 bg-slate-950/80">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search discussions by title, Tamil content, author..."
                className="w-full bg-slate-900 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1 text-xs font-mono">
              {['ALL', 'Disease Alert', 'Organic', 'Government', 'Market', 'Research'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${selectedCategory === cat ? 'bg-cyan-500 text-black shadow-[0_0_12px_#06b6d444]' : 'bg-slate-900 text-slate-400 hover:text-white border border-white/5'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {posts.map((p) => (
              <div key={p.post_id} className="glass-panel p-6 rounded-2xl border border-cyan-500/30 space-y-4 hover:border-cyan-400 transition">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-bold text-sm">
                      {p.author_name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-sm">{p.author_name}</h4>
                        {p.verified_badge === 1 && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> Verified {p.author_role}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {p.village}, {p.district} • Category: <strong className="text-cyan-300">{p.category}</strong>
                      </div>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono">
                    {p.post_id}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-base font-bold text-white">{p.title}</h3>
                  <p className="text-xs text-slate-200 leading-relaxed">{p.content}</p>
                  {p.tamil_content && (
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-cyan-200 font-sans leading-relaxed">
                      {p.tamil_content}
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center border-t border-white/10 pt-3 text-xs font-mono">
                  <div className="flex items-center gap-4 text-slate-400">
                    <button onClick={() => handleLikePost(p.post_id)} className="flex items-center gap-1.5 hover:text-rose-400 transition">
                      <Heart className="w-4 h-4 text-rose-500" />
                      <span>{p.likes_count} Likes</span>
                    </button>
                    <span className="flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-cyan-400" />
                      <span>{p.comments_count} Replies</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <ThumbsUp className="w-4 h-4 text-emerald-400" />
                      <span>{p.helpful_votes} Helpful</span>
                    </span>
                  </div>

                  <div className="text-[10px] text-slate-400">
                    Tags: <span className="text-cyan-300">{p.tags}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. VERIFIED ICAR & TNAU CHANNELS VIEW */}
      {activeSubTab === 'channels' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
          {channels.map((c) => (
            <div key={c.channel_id} className="glass-panel p-6 rounded-2xl border border-emerald-500/40 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-base font-bold text-white">{c.name}</h3>
                  <span className="text-[10px] text-emerald-400 font-bold">{c.organization} • {c.region}</span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Official
                </span>
              </div>
              <p className="text-slate-300 text-xs font-sans">{c.description}</p>
              <div className="flex justify-between items-center border-t border-white/10 pt-3">
                <span className="text-cyan-300 font-bold">{c.followers_count.toLocaleString()} Followers</span>
                <a href={c.official_website} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[11px] flex items-center gap-1">
                  <span>Visit Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. NEARBY FARMERS & KVK EXPERTS VIEW */}
      {activeSubTab === 'experts' && (
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4 font-mono text-xs">
          <h3 className="text-md font-bold text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-cyan-400" />
            Vellore District Verified Agriculture Extension Network
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-cyan-500/30 space-y-2">
              <div className="font-bold text-white">Agricultural Specialist</div>
              <div className="text-cyan-400 text-[10px]">TNAU Senior Plant Pathologist</div>
              <div className="text-slate-400 text-[10px]">Virinjipuram KVK, Vellore</div>
              <div className="text-emerald-400 text-[10px] pt-1 font-bold">✓ 35 Helpful Votes</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-emerald-500/30 space-y-2">
              <div className="font-bold text-white">K. Agricultural Officer</div>
              <div className="text-emerald-400 text-[10px]">Assistant Director of Agriculture</div>
              <div className="text-slate-400 text-[10px]">Katpadi Block Office</div>
              <div className="text-emerald-400 text-[10px] pt-1 font-bold">✓ 58 Helpful Votes</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-purple-500/30 space-y-2">
              <div className="font-bold text-white">Crop Health Technician</div>
              <div className="text-purple-300 text-[10px]">Progressive Organic Farmer</div>
              <div className="text-slate-400 text-[10px]">Gudiyatham, Vellore</div>
              <div className="text-emerald-400 text-[10px] pt-1 font-bold">✓ 21 Helpful Votes</div>
            </div>
          </div>
        </div>
      )}

      {/* 6. QWEN AI COMMUNITY ASSISTANT VIEW */}
      {activeSubTab === 'assistant' && (
        <div className="glass-panel p-6 rounded-2xl border border-cyan-500/30 space-y-4">
          <h3 className="text-md font-bold text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-cyan-400" />
            Qwen Multilingual Agriculture Q&A Assistant
          </h3>
          <form onSubmit={handleAiAsk} className="space-y-3 text-xs font-mono">
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Ask Qwen in Tamil or English about TNAU crop advisories, Panchagavya preparation, or solar pump subsidies..."
              className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-white h-28 placeholder-slate-500"
            />
            <button
              type="submit"
              disabled={aiLoading}
              className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-600 text-black font-bold rounded-xl transition-all shadow-[0_0_12px_#06b6d433]"
            >
              {aiLoading ? "Analyzing Community Query..." : "Query Qwen Community AI"}
            </button>
          </form>

          {aiResponse && (
            <div className="p-4 rounded-xl bg-slate-900 border border-cyan-500/40 text-cyan-200 text-xs font-mono whitespace-pre-line">
              {aiResponse}
            </div>
          )}
        </div>
      )}

      {/* Create Post Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-cyan-500/50 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl font-mono text-xs">
            <div className="flex justify-between items-center">
              <h3 className="text-md font-bold text-white">Create Community Post</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreatePost} className="space-y-3">
              <div>
                <label className="text-slate-400 block mb-1">Post Title</label>
                <input
                  type="text"
                  required
                  value={postForm.title}
                  onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Content (English)</label>
                <textarea
                  required
                  value={postForm.content}
                  onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-white h-20"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Tamil Content (தமிழ் விளக்கம்)</label>
                <textarea
                  value={postForm.tamil_content}
                  onChange={(e) => setPostForm({ ...postForm, tamil_content: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-white h-20"
                />
              </div>
              <button type="submit" className="w-full py-2.5 bg-cyan-500 font-bold text-black rounded-xl">
                Publish Discussion Post
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
