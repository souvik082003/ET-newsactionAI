import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mic, Send, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { useVoice } from '../hooks/useVoice';
import axios from 'axios';

const API = 'http://localhost:8000';

export default function CustomQuery({ sessionId, role, initialQuery }) {
  const [question, setQuestion] = useState('');
  const [history, setHistory] = useState([]); // last 5 Q&A
  const [loading, setLoading] = useState(false);
  const { startListening, stopListening, isListening, speak, stopSpeaking, isSpeaking } = useVoice();
  const inputRef = useRef(null);

  useEffect(() => {
    if (initialQuery) {
      setQuestion(initialQuery);
      handleAsk(initialQuery);
    }
  }, [initialQuery]);

  const handleAsk = async (queryToAsk) => {
    const q = typeof queryToAsk === 'string' ? queryToAsk : question;
    if (!q.trim() || loading) return;
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/query`, {
        session_id: sessionId, question: q.trim(), role,
      });
      setHistory(prev => [{ q: q.trim(), a: data.answer }, ...prev].slice(0, 5));
      if (q === question) setQuestion('');
    } catch (err) {
      setHistory(prev => [{ q: q.trim(), a: `Error: ${err.response?.data?.detail || err.message}` }, ...prev].slice(0, 5));
    } finally { setLoading(false); }
  };

  const handleKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAsk(); } };

  const handleVoice = () => {
    if (isListening) { stopListening(); return; }
    startListening((result) => { setQuestion(result); inputRef.current?.focus(); });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
      className="glass-card relative p-5 mt-5">
      <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
        💬 Ask Anything About This Article
      </h3>

      <div className="flex gap-2">
        <input ref={inputRef} type="text" value={question} onChange={e => setQuestion(e.target.value)}
          onKeyDown={handleKey} placeholder="Ask a custom question..."
          className="neo-input flex-1" aria-label="Custom question" />
        <button onClick={handleVoice} className={`btn-ghost px-2.5 ${isListening ? 'mic-pulse' : ''}`}
          aria-label={isListening ? 'Stop listening' : 'Voice input'}>
          <Mic size={15} />
        </button>
        <button onClick={handleAsk} disabled={!question.trim() || loading}
          className="btn-et py-2 px-4" aria-label="Ask question">
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
        </button>
      </div>

      {isListening && (
        <div className="mt-2 text-xs text-red-300/80 flex items-center gap-2 animate-pulse">
          <span className="w-2 h-2 bg-red-400 rounded-full" /> Listening… speak now
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="mt-4 space-y-3" aria-live="polite">
          {history.map((item, i) => (
            <div key={i} className="bg-white/3 rounded-lg p-3 border border-white/5">
              <p className="text-xs text-orange-300/70 mb-1 font-medium">Q: {item.q}</p>
              <p className="text-sm text-slate-300/90 whitespace-pre-line leading-relaxed">{item.a}</p>
              <div className="mt-2 flex justify-between items-center">
                <span className="text-[10px] text-slate-500 italic">Based on the article provided.</span>
                <button onClick={() => isSpeaking ? stopSpeaking() : speak(item.a)}
                  className={`btn-ghost text-xs ${isSpeaking ? 'mic-pulse' : ''}`}
                  aria-label="Read answer aloud">
                  {isSpeaking ? <VolumeX size={11} /> : <Volume2 size={11} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
