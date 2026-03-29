import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';
import axios from 'axios';

const API = 'http://localhost:8000';

export default function MyETNewsroom({ role }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!role) return;
    
    setLoading(true);
    setArticles([]);
    setError('');

    axios.get(`${API}/newsroom/${role}`)
      .then(res => setArticles(res.data.articles || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [role]);

  if (!role) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 w-full max-w-7xl mx-auto mt-2">
      <div className="flex items-center justify-between mb-4 px-2">
        <div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-yellow-200 bg-clip-text text-transparent flex items-center gap-2">
            📰 My ET — Dynamic Newsroom
          </h2>
          <p className="text-xs text-slate-400 uppercase tracking-widest mt-0.5">Live Feed Personalized for {role.replace('_', ' ')}</p>
        </div>
      </div>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card p-6 min-h-[160px] flex flex-col justify-center items-center border border-white/5 opacity-50">
              <Loader2 className="animate-spin text-orange-500/50 mb-2" size={24} />
              <p className="text-xs text-orange-200/50">Curating for {role.replace('_', ' ')}...</p>
            </div>
          ))}
        </div>
      )}

      {error && !loading && (
        <div className="glass-card p-4 text-sm text-red-300 border-red-500/20 flex gap-2 items-center justify-center">
          <AlertCircle size={16} /> Error loading personalized news feed.
        </div>
      )}

      {!loading && articles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {articles.map((article, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
              className="glass-card p-5 group hover:border-orange-500/30 transition-all cursor-pointer relative overflow-hidden flex flex-col h-full"
            >
              {/* Subtle gradient background flair based on sentiment */}
              <div className={`absolute -right-20 -top-20 w-40 h-40 blur-3xl opacity-10 rounded-full transition-opacity group-hover:opacity-20
                ${article.sentiment === 'Bullish' ? 'bg-green-500' : article.sentiment === 'Bearish' ? 'bg-red-500' : 'bg-orange-500'}`} />
              
              <div className="flex justify-between items-start mb-2 relative z-10">
                <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded border 
                  ${article.sentiment === 'Bullish' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                    article.sentiment === 'Bearish' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                    'bg-slate-500/10 text-slate-300 border-slate-500/20'}`}>
                  {article.sentiment}
                </span>
                <span className="text-[10px] text-slate-500 flex items-center gap-1">⌚ {article.read_time}</span>
              </div>

              <h3 className="text-lg font-bold text-slate-200 mb-2 leading-snug group-hover:text-orange-300 transition-colors relative z-10">
                {article.headline}
              </h3>
              
              <p className="text-sm text-slate-400 mb-4 line-clamp-2 relative z-10 flex-1">
                {article.summary}
              </p>

              <div className="bg-[#0a0a1a]/40 p-3 rounded-lg border border-white/5 relative z-10 mt-auto">
                <div className="flex items-center gap-1.5 text-xs font-bold text-orange-400 mb-1 uppercase tracking-widest">
                  <TrendingUp size={12} /> Why You Should Care
                </div>
                <p className="text-xs text-slate-300 leading-relaxed italic">
                  "{article.focus_area}"
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
