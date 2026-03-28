import { motion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import { useVoice } from '../hooks/useVoice';

export default function ActionPriorityRanker({ rankedActions, role }) {
  const { speak, stopSpeaking, isSpeaking } = useVoice();
  if (!rankedActions) return null;

  const sections = [
    { key: 'do_today', title: '🔴 DO TODAY', bg: 'bg-red-500/10 shadow-[inset_0_0_20px_rgba(239,68,68,0.1)]', border: 'border-red-500/30 text-red-100' },
    { key: 'this_week', title: '🟡 THIS WEEK', bg: 'bg-yellow-500/10 shadow-[inset_0_0_20px_rgba(234,179,8,0.1)]', border: 'border-yellow-500/30 text-yellow-100' },
    { key: 'this_month', title: '🔵 THIS MONTH', bg: 'bg-blue-500/10 shadow-[inset_0_0_20px_rgba(59,130,246,0.1)]', border: 'border-blue-500/30 text-blue-100' },
    { key: 'watch_and_wait', title: '⚪ WATCH & WAIT', bg: 'bg-slate-500/10 shadow-[inset_0_0_20px_rgba(148,163,184,0.1)]', border: 'border-slate-500/30 text-slate-200' },
  ];

  const getEffortBadge = (effort) => {
    if (!effort) return null;
    const colors = { Low: '🟢', Medium: '🟡', High: '🔴' };
    return <span className="text-[10px] ml-2 px-1.5 py-0.5 rounded bg-white/10 uppercase tracking-widest">{colors[effort] || ''} {effort}</span>;
  };

  const handleRead = (item) => {
    if (isSpeaking) stopSpeaking();
    else speak(`${item.action}. ${item.reason}`);
  };

  return (
    <div className="mt-8 mb-6">
      <div className="mb-4 text-center">
        <h3 className="text-lg font-bold text-slate-200 flex items-center justify-center gap-2">
          ⚡ Your Personalized Action Timeline
        </h3>
        <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest">Based on your role as {role?.replace('_', ' ')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {sections.map((sec, i) => (
          <motion.div key={sec.key}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className={`rounded-xl border ${sec.border} ${sec.bg} p-3 flex flex-col`}>
            
            <h4 className="text-[10px] font-black tracking-widest uppercase mb-3 text-center border-b border-white/10 pb-2">
              {sec.title}
            </h4>

            <div className="space-y-2 flex-1">
              {rankedActions[sec.key]?.length > 0 ? (
                rankedActions[sec.key].map((item, j) => (
                  <div key={j} className="bg-[#0a0a1a]/40 backdrop-blur border border-white/5 rounded p-2.5 relative group">
                    <div className="flex gap-2">
                      <input type="checkbox" className="form-checkbox bg-transparent border-white/20 rounded-sm text-orange-500 w-3.5 h-3.5 mt-0.5" />
                      <div className="flex-1 pr-6">
                        <p className="text-xs font-semibold leading-snug">
                          {item.action} {getEffortBadge(item.effort)}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">{item.reason}</p>
                      </div>
                    </div>
                    {/* Read item button */}
                    <button onClick={() => handleRead(item)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition btn-ghost p-1" aria-label="Read item">
                      <Volume2 size={12} className="text-slate-400" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="h-full flex items-center justify-center min-h-[50px]">
                  <p className="text-[10px] text-white/30 italic">No items</p>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
