import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Volume2, VolumeX } from 'lucide-react';
import { useVoice } from '../hooks/useVoice';

const SENTIMENT_MAP = {
  Positive: { cls: 'badge-positive', emoji: '📈' },
  Negative: { cls: 'badge-negative', emoji: '📉' },
  Mixed: { cls: 'badge-mixed', emoji: '📊' },
};

export default function StoryArcTracker({ storyArc }) {
  const [open, setOpen] = useState(false);
  const { speak, stopSpeaking, isSpeaking } = useVoice();

  if (!storyArc) return null;

  const sentiment = SENTIMENT_MAP[storyArc.sentiment] || SENTIMENT_MAP.Mixed;

  const sections = [
    { label: '📜 Background', content: storyArc.background },
    { label: '📍 What\'s Happening Now', content: storyArc.current },
    { label: '🔮 Watch Next', content: storyArc.watch_next },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
      className="glass-card relative p-5 mt-5">

      <button onClick={() => setOpen(v => !v)}
        className="flex items-center justify-between w-full text-left" aria-expanded={open}>
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          📰 Story Arc — Full Context
        </h3>
        <ChevronDown size={16} className={`text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="mt-4 space-y-4 border-t border-white/5 pt-4">

              {/* Sentiment Badge */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Sentiment:</span>
                <span className={`badge ${sentiment.cls}`}>{sentiment.emoji} {storyArc.sentiment}</span>
              </div>

              {/* Sections */}
              {sections.map((s, i) => (
                <div key={i}>
                  <h4 className="text-xs font-semibold text-slate-400 mb-1">{s.label}</h4>
                  <p className="text-sm text-slate-300/80 leading-relaxed">{s.content}</p>
                </div>
              ))}

              {/* Key Players */}
              {storyArc.players?.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 mb-1.5">🎭 Key Players</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {storyArc.players.map((p, i) => (
                      <span key={i} className="badge bg-slate-700/50 text-slate-300 border border-slate-600/30">{p}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Read Aloud */}
              <button onClick={() => isSpeaking ? stopSpeaking() : speak(
                `Background: ${storyArc.background}. Currently: ${storyArc.current}. Watch next: ${storyArc.watch_next}`
              )} className={`btn-ghost text-xs ${isSpeaking ? 'mic-pulse' : ''}`}
                aria-label={isSpeaking ? 'Stop' : 'Read story arc aloud'}>
                {isSpeaking ? <><VolumeX size={12}/> Stop</> : <><Volume2 size={12}/> Read All</>}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
