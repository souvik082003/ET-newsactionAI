import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen } from 'lucide-react';

const ROLE_LABELS = {
  student: '🎓 Student', investor: '💼 Investor', job_seeker: '🔍 Job Seeker',
  business_owner: '🏪 Business Owner', general_reader: '👤 General Reader',
};

export default function ArticleSummaryBar({ title, wordCount, summary, role, onReset }) {
  return (
    <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
      className="glass-card relative p-5 mb-5">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
        <div className="flex-1">
          <h2 className="text-base font-semibold text-orange-100 mb-1.5 flex items-center gap-2">
            <BookOpen size={16} className="text-orange-400" /> {title}
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed mb-2">{summary}</p>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="badge bg-orange-500/10 text-orange-300 border border-orange-500/20">
              {wordCount?.toLocaleString()} words
            </span>
            <span className="badge bg-blue-500/10 text-blue-300 border border-blue-500/20">
              {ROLE_LABELS[role] || role}
            </span>
          </div>
        </div>
        <button onClick={onReset} className="btn-ghost text-xs flex items-center gap-1" aria-label="Change article">
          <ArrowLeft size={13} /> Change Article
        </button>
      </div>
    </motion.div>
  );
}
