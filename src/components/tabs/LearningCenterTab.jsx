import React, { useState, useEffect } from 'react';
import {
  GraduationCap, BookOpen, Video, Award, Brain, Download, Search, Filter,
  FileText, ExternalLink, Play, CheckCircle2, Sparkles, X, ChevronRight, Activity,
  Clock, ThumbsUp, HelpCircle
} from 'lucide-react';
import {
  fetchLearningSummary, fetchLearningCourses, fetchLearningDocuments,
  saveStudyNote, queryLearningTutor, exportLearning,
  FALLBACK_LEARNING_SUMMARY, FALLBACK_COURSES, FALLBACK_DOCUMENTS
} from '../../services/learningCenterService';

export default function LearningCenterTab() {
  const [activeSubTab, setActiveSubTab] = useState('courses'); // 'courses' | 'docs' | 'quiz' | 'tutor'
  const [summary, setSummary] = useState(FALLBACK_LEARNING_SUMMARY);
  const [courses, setCourses] = useState(FALLBACK_COURSES);
  const [documents, setDocuments] = useState(FALLBACK_DOCUMENTS);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [exportStatus, setExportStatus] = useState('');

  // Interactive Quiz State
  const [quizScore, setQuizScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // AI Tutor State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedCategory, searchQuery]);

  const loadData = async () => {
    setLoading(true);
    try {
      const sum = await fetchLearningSummary();
      setSummary(sum);
      const crs = await fetchLearningCourses(selectedCategory, searchQuery);
      setCourses(crs);
      const docs = await fetchLearningDocuments();
      setDocuments(docs);
    } catch (err) {
      console.error("Error loading learning data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (fmt) => {
    setExportStatus(`Generating ${fmt.toUpperCase()} learning export...`);
    const res = await exportLearning(fmt);
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
      const resp = await queryLearningTutor(aiPrompt, summary);
      setAiResponse(resp);
    } catch (err) {
      setAiResponse("AI Tutor session complete.");
    } finally {
      setAiLoading(false);
    }
  };

  const sampleQuiz = {
    question: "What is the recommended age of seedlings for transplanting in System of Rice Intensification (SRI)?",
    options: [
      "25-30 days old seedlings",
      "10-12 days young seedlings",
      "40-45 days old mature seedlings",
      "Direct sowing only without nursery"
    ],
    correct: 1,
    explanation: "SRI techniques recommend transplanting young 10-12 day seedlings with single plant per hill to maximize tillering capacity and root aeration."
  };

  return (
    <div className="space-y-6 text-slate-100 font-sans pb-16">
      {/* 1. HERO LEARNING CENTER COMMAND CENTER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-cyan-950 to-slate-900 border border-cyan-500/40 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 flex-1 min-w-0 w-full">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold tracking-wide uppercase max-w-full">
              <GraduationCap className="w-3.5 h-3.5 animate-pulse shrink-0" />
              <span>Enterprise AI Agriculture University & Masterclasses</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex flex-wrap items-center gap-3">
              <span>KisanTech Learning Center & Tutor</span>
              <span className="text-xs px-2.5 py-1 rounded-md bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/40 shrink-0">Ollama Qwen Professor</span>
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Master 4K video masterclasses, ICAR & TNAU research papers, organic farming recipes, drone spraying tutorials, and interactive AI quizzes.
            </p>
          </div>

          {/* Hero KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-[560px] shrink-0">
            <div className="bg-slate-950/80 border border-cyan-500/40 rounded-2xl p-4 text-center space-y-1">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Masterclasses</div>
              <div className="text-xl font-black text-cyan-400">{summary.total_masterclasses} Courses</div>
              <div className="text-[9px] text-cyan-300/80">4K Video</div>
            </div>

            <div className="bg-slate-950/80 border border-emerald-500/40 rounded-2xl p-4 text-center space-y-1">
              <div className="text-[10px] text-slate-400 font-bold uppercase">ICAR Documents</div>
              <div className="text-xl font-black text-emerald-400">{summary.official_documents} Manuals</div>
              <div className="text-[9px] text-emerald-300/80">PDF Library</div>
            </div>

            <div className="bg-slate-950/80 border border-amber-500/40 rounded-2xl p-4 text-center space-y-1">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Lessons Completed</div>
              <div className="text-xl font-black text-amber-300">{summary.completed_lessons} Done</div>
              <div className="text-[9px] text-amber-300/80">{summary.learning_hours_logged} Hrs</div>
            </div>

            <div className="bg-slate-950/80 border border-purple-500/40 rounded-2xl p-4 text-center space-y-1">
              <div className="text-[10px] text-slate-400 font-bold uppercase">AI Mastery Score</div>
              <div className="text-xl font-black text-purple-300">{summary.ai_quiz_score_pct}%</div>
              <div className="text-[9px] text-purple-300/80">Expert Tier</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. CONTROLS & SUB-TAB NAVIGATION */}
      <div className="glass-panel p-2 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-2 bg-slate-950/80">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveSubTab('courses')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeSubTab === 'courses' ? 'bg-cyan-500 text-black shadow-[0_0_12px_#06b6d444]' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
          >
            <Video className="w-4 h-4" />
            <span>4K Masterclasses & Tutorials</span>
          </button>
          <button
            onClick={() => setActiveSubTab('docs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeSubTab === 'docs' ? 'bg-cyan-500 text-black shadow-[0_0_12px_#06b6d444]' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
          >
            <BookOpen className="w-4 h-4" />
            <span>ICAR & TNAU Document Library</span>
          </button>
          <button
            onClick={() => setActiveSubTab('quiz')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeSubTab === 'quiz' ? 'bg-cyan-500 text-black shadow-[0_0_12px_#06b6d444]' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Farmer Daily Quiz & Flashcards</span>
          </button>
          <button
            onClick={() => setActiveSubTab('tutor')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeSubTab === 'tutor' ? 'bg-cyan-500 text-black shadow-[0_0_12px_#06b6d444]' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
          >
            <Brain className="w-4 h-4" />
            <span>Qwen AI Agriculture Tutor</span>
          </button>
        </div>

        <div className="flex items-center gap-2 font-mono">
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

      {/* 3. 4K VIDEO MASTERCLASSES VIEW */}
      {activeSubTab === 'courses' && (
        <div className="space-y-4">
          <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-4 bg-slate-950/80">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search masterclasses by title, Tamil title, topic..."
                className="w-full bg-slate-900 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1 text-xs font-mono">
              {['ALL', 'Rice Farming', 'Organic', 'Drone', 'IoT'].map((cat) => (
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
            {courses.map((c) => (
              <div key={c.course_id} className="glass-panel p-6 rounded-2xl border border-cyan-500/30 space-y-4 hover:border-cyan-400 transition">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-bold text-white">{c.title}</h3>
                    {c.tamil_title && <div className="text-[11px] text-cyan-300 font-sans">{c.tamil_title}</div>}
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold">
                    {c.difficulty}
                  </span>
                </div>

                <p className="text-slate-300 text-xs font-sans">{c.description}</p>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center text-slate-400 text-[10px]">
                  <span>Instructor: <strong className="text-white">{c.author}</strong></span>
                  <span>Duration: <strong className="text-amber-300">{c.duration_mins} mins</strong></span>
                </div>

                <div className="flex justify-between items-center border-t border-white/10 pt-3">
                  <span className="text-emerald-400 font-bold">♥ {c.likes_count} Likes</span>
                  <button className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-black font-bold text-xs flex items-center gap-1.5 shadow-[0_0_12px_#06b6d433]">
                    <Play className="w-3.5 h-3.5" />
                    <span>Watch Masterclass</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. DOCUMENT LIBRARY VIEW */}
      {activeSubTab === 'docs' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
            {documents.map((d) => (
              <div key={d.doc_id} className="glass-panel p-6 rounded-2xl border border-emerald-500/40 space-y-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-sm font-bold text-white">{d.title}</h3>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                    {d.publisher}
                  </span>
                </div>
                <p className="text-slate-300 text-xs font-sans">{d.summary}</p>
                <div className="border-t border-white/10 pt-3 flex justify-between items-center">
                  <span className="text-[10px] text-cyan-300">{d.doc_type}</span>
                  <a href={d.download_url} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[11px] flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Open PDF</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. FARMER DAILY QUIZ VIEW */}
      {activeSubTab === 'quiz' && (
        <div className="glass-panel p-6 rounded-2xl border border-cyan-500/30 space-y-4 font-mono text-xs">
          <h3 className="text-md font-bold text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-cyan-400" />
            KisanTech Daily Farmer Knowledge Challenge
          </h3>

          <div className="p-4 rounded-xl bg-slate-900 border border-white/10 space-y-3">
            <div className="text-sm font-bold text-white">{sampleQuiz.question}</div>
            <div className="space-y-2">
              {sampleQuiz.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => { setSelectedAnswer(idx); setQuizSubmitted(true); }}
                  className={`w-full p-3 rounded-xl text-left text-xs transition border ${selectedAnswer === idx ? (idx === sampleQuiz.correct ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50' : 'bg-rose-500/20 text-rose-300 border-rose-500/50') : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-cyan-500/30'}`}
                >
                  {opt}
                </button>
              ))}
            </div>

            {quizSubmitted && (
              <div className="p-3 rounded-xl bg-slate-950 border border-cyan-500/40 text-cyan-200 text-xs">
                <strong>{selectedAnswer === sampleQuiz.correct ? "✓ Correct Answer!" : "✗ Incorrect."}</strong> {sampleQuiz.explanation}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. QWEN AI TUTOR VIEW */}
      {activeSubTab === 'tutor' && (
        <div className="glass-panel p-6 rounded-2xl border border-cyan-500/30 space-y-4">
          <h3 className="text-md font-bold text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-cyan-400" />
            Qwen AI Agriculture Professor & Research Simplifier
          </h3>
          <form onSubmit={handleAiAsk} className="space-y-3 text-xs font-mono">
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Ask Qwen Professor to explain System of Rice Intensification (SRI), Panchagavya recipes, or drone NDVI indexing..."
              className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-white h-28 placeholder-slate-500"
            />
            <button
              type="submit"
              disabled={aiLoading}
              className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-600 text-black font-bold rounded-xl transition-all shadow-[0_0_12px_#06b6d433]"
            >
              {aiLoading ? "Generating AI Lesson..." : "Query Qwen AI Professor"}
            </button>
          </form>

          {aiResponse && (
            <div className="p-4 rounded-xl bg-slate-900 border border-cyan-500/40 text-cyan-200 text-xs font-mono whitespace-pre-line">
              {aiResponse}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
