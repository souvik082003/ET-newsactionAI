import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ShieldAlert, ShieldCheck, ChevronDown, CheckCircle2, XCircle, Search, HelpCircle } from 'lucide-react';

export default function CredibilityChecker({ credibilityData, loading, onCheck }) {
  const [open, setOpen] = useState(false);

  if (!credibilityData && !open && !loading) {
    return (
      <button onClick={() => { setOpen(true); onCheck(); }} className="btn-ghost flex items-center gap-1.5 text-xs w-full justify-center mt-2">
        <Shield size={14} /> Check Fact Credibility
      </button>
    );
  }

  if (loading) {
    return <div className="text-center p-4 text-xs text-blue-400 animate-pulse mt-2">🛡️ Verifying internal consistency & facts...</div>;
  }

  const { credibility_score, credibility_label, source_cited, numbers_present, expert_quotes, internal_consistency, red_flags, green_flags, claims_to_verify, verdict, disclaimer } = credibilityData;

  const scoreColor = credibility_score >= 71 ? 'text-green-400 stroke-green-500' : credibility_score >= 41 ? 'text-yellow-400 stroke-yellow-500' : 'text-red-400 stroke-red-500';

  const CheckBadge = ({ label, active }) => (
    <div className={`flex flex-col items-center p-2 rounded border text-center ${active ? 'bg-green-500/10 border-green-500/20 text-green-300' : 'bg-red-500/10 border-red-500/20 text-red-300'}`}>
      {active ? <CheckCircle2 size={16} className="mb-1" /> : <XCircle size={16} className="mb-1" />}
      <span className="text-[9px] uppercase tracking-widest">{label}</span>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card mt-2 p-5 border-l-4 border-l-blue-500">
      <button onClick={() => setOpen(!open)} className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-slate-200">🛡️ Credibility Analysis</h3>
        </div>
        <ChevronDown size={16} className={`text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="pt-4 mt-4 border-t border-white/10">
              
              {/* Score SVG */}
              <div className="flex items-center justify-center gap-6 mb-6">
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <svg className="absolute w-full h-full transform -rotate-90">
                    <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="6" fill="none" className="text-white/5" />
                    <motion.circle 
                      initial={{ strokeDasharray: "0, 300" }} animate={{ strokeDasharray: `${(credibility_score / 100) * 226.2}, 300` }} transition={{ duration: 1.5 }}
                      cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="6" fill="none" className={scoreColor.split(' ')[1]} strokeLinecap="round"
                    />
                  </svg>
                  <div className={`text-2xl font-black ${scoreColor.split(' ')[0]}`}>{credibility_score}</div>
                </div>
                <div className="flex flex-col">
                  <span className={`text-sm font-black uppercase tracking-widest ${scoreColor.split(' ')[0]}`}>{credibility_label}</span>
                  <span className="text-xs text-slate-400 mt-1 max-w-[200px] leading-snug">{verdict}</span>
                </div>
              </div>

              {/* 4 Badges */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                <CheckBadge label="Sources" active={source_cited} />
                <CheckBadge label="Data" active={numbers_present} />
                <CheckBadge label="Quotes" active={expert_quotes} />
                <CheckBadge label="Consistent" active={internal_consistency === 'Consistent'} />
              </div>

              {/* Red & Green Flags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                {red_flags?.length > 0 && (
                  <div className="bg-red-500/10 border border-red-500/20 p-3 rounded">
                    <h4 className="text-[10px] uppercase tracking-widest font-bold text-red-300 mb-2 flex items-center gap-1"><ShieldAlert size={12}/> Red Flags</h4>
                    <ul className="text-xs text-red-200/80 space-y-1 list-disc pl-4">
                      {red_flags.map((r, i) => <li key={i}>{r}</li>)}
                    </ul>
                  </div>
                )}
                {green_flags?.length > 0 && (
                  <div className="bg-green-500/10 border border-green-500/20 p-3 rounded h-full">
                    <h4 className="text-[10px] uppercase tracking-widest font-bold text-green-300 mb-2 flex items-center gap-1"><ShieldCheck size={12}/> Credibility Signals</h4>
                    <ul className="text-xs text-green-200/80 space-y-1 list-disc pl-4">
                      {green_flags.map((g, i) => <li key={i}>{g}</li>)}
                    </ul>
                  </div>
                )}
              </div>

              {/* Verify Claims Table */}
              {claims_to_verify?.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-[11px] font-bold text-blue-300 uppercase tracking-widest mb-2 flex items-center gap-1"><Search size={12}/> Verify These Claims</h4>
                  <div className="bg-[#0a0a1a]/40 rounded border border-white/5 text-[10px]">
                    {claims_to_verify.map((c, i) => (
                      <div key={i} className={`flex border-b border-white/5 p-2 ${i%2===0?'bg-white/5':''}`}>
                        <div className="w-1/2 pr-2 text-slate-300 font-medium">"{c.claim}"</div>
                        <div className="w-1/2 pl-2 text-blue-300 flex items-start gap-1"><HelpCircle size={10} className="mt-0.5 shrink-0"/> {c.how_to_verify}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-[9px] text-slate-500 italic text-center border-t border-white/5 pt-2">
                {disclaimer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
