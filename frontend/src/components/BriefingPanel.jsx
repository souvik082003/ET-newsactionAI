import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronDown, Loader2, Volume2, VolumeX, Copy, Check } from 'lucide-react';
import { useVoice } from '../hooks/useVoice';
import axios from 'axios';

const API = 'http://localhost:8000';

export default function BriefingPanel({ sessionId, role }) {
  const [open, setOpen] = useState(false);
  const [briefing, setBriefing] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { speak, stopSpeaking, isSpeaking } = useVoice();

  const handleGenerate = async () => {
    if (briefing) { setOpen(v => !v); return; } // toggle if already generated
    setOpen(true);
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/briefing`, { session_id: sessionId, role });
      setBriefing(data.briefing);
    } catch (err) {
      setBriefing(`Error: ${err.response?.data?.detail || err.message}`);
    } finally { setLoading(false); }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(briefing);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
      className="glass-card relative p-5 mt-5 border-l-blue">

      <button onClick={handleGenerate}
        className="flex items-center justify-between w-full text-left" aria-expanded={open}>
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <BookOpen size={16} className="text-blue-400" /> News Navigator — Intelligence Briefing
        </h3>
        <ChevronDown size={16} className={`text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="mt-4 border-t border-white/5 pt-4" aria-live="polite">
              {loading ? (
                <div className="flex items-center gap-2 text-sm text-blue-300/70 py-4">
                  <Loader2 size={16} className="animate-spin" /> Generating intelligence briefing…
                </div>
              ) : (
                <>
                  <div className="text-sm text-slate-300/90 leading-relaxed whitespace-pre-line">{briefing}</div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 italic">Based on the article provided.</span>
                    <div className="flex gap-1.5">
                      <button onClick={() => isSpeaking ? stopSpeaking() : speak(briefing)}
                        className={`btn-ghost text-xs ${isSpeaking ? 'mic-pulse' : ''}`}
                        aria-label={isSpeaking ? 'Stop reading' : 'Read briefing aloud'}>
                        {isSpeaking ? <><VolumeX size={12}/> Stop</> : <><Volume2 size={12}/> Read</>}
                      </button>
                      <button onClick={handleCopy} className="btn-ghost text-xs" aria-label="Copy briefing">
                        {copied ? <><Check size={12}/> Copied</> : <><Copy size={12}/> Copy</>}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
