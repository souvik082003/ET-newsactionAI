import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Shield, Users, Mic, Newspaper, Globe, Film, TrendingUp } from 'lucide-react';
import ArticleInput from '../components/ArticleInput';
import MyETNewsroom from '../components/MyETNewsroom';

const FEATURES = [
  { icon: <Newspaper size={22} />, title: 'My ET — Personalized Newsroom', desc: 'A fundamentally different news experience per role. Investors get portfolio-relevant stories, students get explainer-first content.' },
  { icon: <Shield size={22} />, title: 'News Navigator — AI Briefings', desc: 'Instead of reading 8 articles on Union Budget, interact with one AI-powered deep briefing with follow-up questions.' },
  { icon: <TrendingUp size={22} />, title: 'Story Arc Tracker', desc: 'AI builds a complete visual narrative — timeline, key players, sentiment tracking, and "what to watch next" predictions.' },
  { icon: <Globe size={22} />, title: 'Vernacular News Engine', desc: 'Context-aware translation into Hindi, Tamil, Telugu, Bengali — culturally adapted explanations, not literal translation.' },
  { icon: <Film size={22} />, title: 'AI News Video Studio', desc: 'Transform any article into a 60–120 second video with AI narration, animated data visuals, and contextual overlays.' },
  { icon: <Mic size={22} />, title: 'Voice-First Experience', desc: 'Full voice I/O: speak your questions, hear AI answers read aloud. Browser-native, zero install required.' },
];

const HIGHLIGHTS = [
  { icon: <Shield size={18} />, title: 'No Hallucination', desc: 'RAG ensures answers come only from the article' },
  { icon: <Users size={18} />, title: '5 User Roles', desc: 'Student, Investor, Job Seeker, Business Owner, Reader' },
  { icon: <Mic size={18} />, title: 'Voice I/O', desc: 'Speak questions, hear answers — fully accessible' },
];

export default function Home({ onSubmit, isLoading }) {
  const [selectedRole, setSelectedRole] = useState('');

  return (
    <div className="fade-up">
      {/* Hero */}
      <div className="text-center mb-10">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center gap-2 bg-orange-500/8 border border-orange-500/15 rounded-full px-4 py-1.5 text-xs text-orange-200/80 font-medium mb-5">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          ET Hackathon 2026 — PS8: AI-Native News Experience
        </motion.div>

        <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
          <span className="bg-gradient-to-r from-orange-200 to-yellow-100 bg-clip-text text-transparent">
            Turn News Into Action.
          </span>
          <br />
          <span className="bg-gradient-to-r from-orange-400 to-orange-200 bg-clip-text text-transparent">
            For Everyone.
          </span>
        </motion.h2>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="text-slate-400 max-w-lg mx-auto text-sm leading-relaxed">
          Paste an ET article, select your role, and get personalized action steps — 
          powered by Gemini AI with RAG. Zero hallucination. Fully accessible.
        </motion.p>
      </div>

      {/* Quick highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto mb-8">
        {HIGHLIGHTS.map((f, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="text-center py-3 px-4 rounded-xl bg-white/2 border border-white/5">
            <div className="text-orange-400 flex justify-center mb-1.5">{f.icon}</div>
            <p className="text-xs font-semibold text-slate-200 mb-0.5">{f.title}</p>
            <p className="text-[11px] text-slate-500">{f.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Input */}
      <ArticleInput onSubmit={onSubmit} isLoading={isLoading} onRoleSelect={setSelectedRole} />

      {/* Dynamic Newsroom Dashboard - Shown only when role is selected */}
      {selectedRole && <MyETNewsroom role={selectedRole} />}

      {/* ── WHAT WE BUILD ── */}
      <div className="mt-16 mb-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="text-center mb-8">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-orange-400/70 mb-2">What We Build</h3>
          <p className="text-xl font-bold bg-gradient-to-r from-orange-200 to-yellow-100 bg-clip-text text-transparent">
            AI-Native News Features
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {FEATURES.map((f, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + i * 0.1 }}
              className="glass-card relative p-5 group"
            >
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400 mb-3 group-hover:bg-orange-500/20 transition">
                {f.icon}
              </div>
              <h4 className="text-sm font-semibold text-slate-200 mb-1.5">{f.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
