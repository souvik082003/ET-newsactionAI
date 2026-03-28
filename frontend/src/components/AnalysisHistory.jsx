import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, Trash2, ExternalLink, X } from 'lucide-react';

const STORAGE_KEY = 'et_newsaction_history';

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch { return []; }
}

export function saveToHistory(articleInfo) {
  const history = loadHistory();
  const entry = {
    id: Date.now(),
    title: articleInfo.title,
    wordCount: articleInfo.word_count,
    summary: articleInfo.summary,
    timestamp: new Date().toISOString(),
  };
  const updated = [entry, ...history].slice(0, 10); // keep last 10
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export default function AnalysisHistory({ onSelectArticle }) {
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => { setHistory(loadHistory()); }, [open]);

  const clearHistory = () => {
    localStorage.removeItem(STORAGE_KEY);
    setHistory([]);
  };

  const deleteItem = (id) => {
    const updated = history.filter(h => h.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setHistory(updated);
  };

  if (history.length === 0 && !open) return null;

  return (
    <>
      {/* Toggle button */}
      <button onClick={() => setOpen(true)} className="btn-ghost text-xs" aria-label="View analysis history">
        <History size={13} /> History ({history.length})
      </button>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card relative p-6 w-full max-w-lg max-h-[70vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <History size={16} className="text-orange-400" /> Analysis History
                </h3>
                <div className="flex gap-2">
                  {history.length > 0 && (
                    <button onClick={clearHistory} className="btn-ghost text-xs text-red-300"
                      aria-label="Clear all history"><Trash2 size={12} /> Clear All</button>
                  )}
                  <button onClick={() => setOpen(false)} className="btn-ghost text-xs" aria-label="Close">
                    <X size={14} />
                  </button>
                </div>
              </div>

              {history.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">No analysis history yet.</p>
              ) : (
                <div className="space-y-2">
                  {history.map((item) => (
                    <div key={item.id}
                      className="bg-white/3 rounded-lg p-3 border border-white/5 hover:border-orange-500/20 transition group">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-semibold text-slate-200 truncate">{item.title}</h4>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            {new Date(item.timestamp).toLocaleDateString('en-IN', {
                              day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                            })} • {item.wordCount} words
                          </p>
                          {item.summary && (
                            <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{item.summary}</p>
                          )}
                        </div>
                        <button onClick={() => deleteItem(item.id)}
                          className="opacity-0 group-hover:opacity-100 transition btn-ghost text-xs p-1"
                          aria-label="Delete entry"><Trash2 size={11} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
