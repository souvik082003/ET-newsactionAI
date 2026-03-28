import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, CheckCircle, AlertOctagon, Info, ArrowRight } from 'lucide-react';

export default function BiasDetector({ biasData, loading, onAnalyze }) {
  const [open, setOpen] = useState(false);

  if (!biasData && !open && !loading) {
    return (
      <button onClick={() => { setOpen(true); onAnalyze(); }} className="btn-ghost flex items-center gap-1.5 text-xs w-full justify-center mt-6">
        <Search size={14} /> Analyze Media Bias
      </button>
    );
  }

  if (loading) {
    return <div className="text-center p-4 text-xs text-orange-400 animate-pulse mt-6">🔍 Running editorial bias analysis...</div>;
  }

  const { perspective_lean, tone, missing_perspectives, language_indicators, recommended_counter_reads, objectivity_score, disclaimer } = biasData;

  const getToneBadge = (t) => {
    if (['Positive'].includes(t)) return 'bg-green-500/20 text-green-300';
    if (['Negative', 'Critical'].includes(t)) return 'bg-red-500/20 text-red-300';
    return 'bg-gray-500/20 text-gray-300';
  };

  const scoreColor = objectivity_score >= 8 ? 'bg-green-500' : objectivity_score >= 5 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card mt-6 p-5 border-l-4 border-l-orange-500">
      <button onClick={() => setOpen(!open)} className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-slate-200">🔍 Editorial Bias Analysis</h3>
          <div className="group relative">
            <Info size={14} className="text-slate-500 hover:text-orange-400 cursor-help" />
            <span className="absolute left-1/2 -top-10 -translate-x-1/2 w-48 p-2 bg-slate-800 text-[10px] text-slate-300 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition text-center z-50 shadow-xl border border-slate-700">
              AI analysis of language framing. Not a political assessment.
            </span>
          </div>
        </div>
        <ChevronDown size={16} className={`text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="pt-4 mt-4 border-t border-white/10 space-y-4">
              
              {/* Perspective Lean Header */}
              <div className="text-center bg-white/5 p-3 rounded-lg border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest block mb-1">Perspective Lean</span>
                <span className="text-lg font-black text-orange-400">{perspective_lean}</span>
                <div className="mt-2 flex items-center justify-center gap-2 text-xs">
                  <span className={`px-2 py-0.5 rounded uppercase tracking-widest text-[10px] ${getToneBadge(tone)}`}>Tone: {tone}</span>
                  <span className="px-2 py-0.5 rounded bg-white/10 text-slate-300 uppercase tracking-widest text-[10px]">Objectivity: {objectivity_score}/10</span>
                </div>
              </div>

              {/* Missing Perspectives */}
              {missing_perspectives?.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold text-red-400 uppercase tracking-widest mb-2 flex items-center gap-1"><AlertOctagon size={12}/> Missing Perspectives</h4>
                  <ul className="space-y-1 pl-4 list-disc text-xs text-slate-300">
                    {missing_perspectives.map((p, i) => <li key={i}>{p}</li>)}
                  </ul>
                </div>
              )}

              {/* Language Indicators Table */}
              {language_indicators?.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-1"><CheckCircle size={12}/> Language Indicators</h4>
                  <div className="bg-[#0a0a1a]/40 rounded overflow-hidden text-[10px] border border-white/5">
                    {language_indicators.map((l, i) => (
                      <div key={i} className={`flex border-b border-white/5 p-2 ${i%2===0?'bg-white/5':''}`}>
                        <div className="w-1/2 text-slate-300 font-mono pr-2 border-r border-white/5 italic">"{l.phrase}"</div>
                        <div className="w-1/2 text-slate-400 pl-2 leading-relaxed">{l.suggests}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Counter-Reads */}
              {recommended_counter_reads?.length > 0 && (
                <div className="pt-2">
                  <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-widest mb-2">🔎 Search for fuller picture:</h4>
                  <div className="flex flex-col gap-1.5">
                    {recommended_counter_reads.map((r, i) => (
                      <a key={i} href={`https://economictimes.indiatimes.com/topic/${encodeURIComponent(r)}`} target="_blank" rel="noreferrer"
                        className="flex items-center justify-between p-2 rounded bg-orange-500/10 hover:bg-orange-500/20 text-orange-300 text-xs transition border border-orange-500/20 group">
                        <span>{r}</span>
                        <ArrowRight size={12} className="opacity-50 group-hover:opacity-100 transition transform group-hover:translate-x-1" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-[9px] text-slate-500 italic text-center pt-2 border-t border-white/5">
                {disclaimer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
