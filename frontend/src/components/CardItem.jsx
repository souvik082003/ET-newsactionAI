import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Copy, Check, ChevronDown } from 'lucide-react';
import { useVoice } from '../hooks/useVoice';

const BORDER_COLORS = { blue: 'border-l-blue', orange: 'border-l-orange', green: 'border-l-green', red: 'border-l-red' };

export default function CardItem({ icon, title, answer, color = 'blue', delay = 0 }) {
  const [expanded, setExpanded] = useState(true);
  const [copied, setCopied] = useState(false);
  const { speak, stopSpeaking, isSpeaking } = useVoice();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => isSpeaking ? stopSpeaking() : speak(answer);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`glass-card relative p-5 ${BORDER_COLORS[color] || ''}`}
      role="region" aria-label={title}
    >
      <button onClick={() => setExpanded(v => !v)}
        className="flex items-center justify-between w-full text-left group" aria-expanded={expanded}>
        <div className="flex items-center gap-2.5">
          <span className="text-xl">{icon}</span>
          <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
        </div>
        <ChevronDown size={16} className={`text-slate-500 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}>
            <div className="mt-3 pt-3 border-t border-white/5" aria-live="polite">
              <div className="text-sm text-slate-300/90 leading-relaxed whitespace-pre-line">{answer}</div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 italic">Based on the article provided.</span>
                <div className="flex gap-1.5">
                  <button onClick={handleSpeak} className={`btn-ghost text-xs ${isSpeaking ? 'mic-pulse' : ''}`}
                    aria-label={isSpeaking ? 'Stop reading' : 'Read aloud'}>
                    {isSpeaking ? <><VolumeX size={12}/> Stop</> : <><Volume2 size={12}/> Read</>}
                  </button>
                  <button onClick={handleCopy} className="btn-ghost text-xs" aria-label="Copy text">
                    {copied ? <><Check size={12}/> Copied</> : <><Copy size={12}/> Copy</>}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
