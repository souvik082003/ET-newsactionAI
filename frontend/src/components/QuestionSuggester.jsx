import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, RefreshCw, ChevronDown, CheckCircle, AlertTriangle, Eye, Target, Clock } from 'lucide-react';

export default function QuestionSuggester({ questions, role, onQuestionClick, onRefresh, loading }) {
  if (!questions && !loading) return null;

  const categoryIcons = {
    Risk: <AlertTriangle size={12} className="text-red-400" />,
    Opportunity: <Target size={12} className="text-green-400" />,
    Context: <Eye size={12} className="text-blue-400" />,
    Action: <CheckCircle size={12} className="text-orange-400" />,
    Timeline: <Clock size={12} className="text-purple-400" />
  };

  const getDifficultyBadge = (diff) => {
    const cls = diff === 'Advanced' ? 'bg-red-500/20 text-red-300' :
                diff === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-300' :
                'bg-green-500/20 text-green-300';
    return <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase tracking-widest ml-2 ${cls}`}>{diff}</span>;
  };

  return (
    <div className="mt-8 mb-6 relative">
      <div className="flex justify-between items-end mb-4 border-b border-white/10 pb-2">
        <div>
          <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            🤔 Dig Deeper — Smart Questions
          </h3>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest">AI-suggested based on your role as {role?.replace('_', ' ')}</p>
        </div>
        <button onClick={onRefresh} disabled={loading} className="btn-ghost flex items-center gap-1.5 text-xs text-blue-300 shrink-0">
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} /> {loading ? "Thinking..." : "Refresh"}
        </button>
      </div>

      <div className="space-y-3">
        {loading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white/5 h-16 rounded-xl border border-white/5" />
          ))
        ) : (
          questions?.map((q, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
              className="glass-card p-4 hover:border-blue-500/30 transition group cursor-pointer relative"
              onClick={() => onQuestionClick(q.question)}>
              
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-slate-200 mb-1 leading-snug group-hover:text-blue-200 transition">
                    {q.question}
                  </h4>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-[10px] text-slate-400 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded">
                      {categoryIcons[q.category] || <HelpCircle size={12} />} {q.category}
                    </span>
                    {getDifficultyBadge(q.difficulty)}
                  </div>
                  <p className="text-[10px] text-slate-500 italic mt-2">Why this matters: "{q.why_important}"</p>
                </div>
                <button className="btn-primary text-xs shrink-0 opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                  Ask This →
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
