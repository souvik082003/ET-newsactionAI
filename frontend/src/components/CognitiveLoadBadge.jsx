import { motion } from 'framer-motion';
import { Brain, Clock, HelpCircle, UserCheck } from 'lucide-react';
import { useState } from 'react';
import axios from 'axios';

const API = 'http://localhost:8000';

export default function CognitiveLoadBadge({ cognitiveLoad }) {
  const [jargonDefs, setJargonDefs] = useState({});

  if (!cognitiveLoad) return null;

  const { score, level, reading_time_mins, jargon_count, recommended_for, simplification_needed, key_jargon_terms } = cognitiveLoad;

  const levelColor = 
    level === 'Easy' ? 'bg-green-500 text-black' :
    level === 'Moderate' ? 'bg-yellow-500 text-black' :
    level === 'Complex' ? 'bg-orange-500 text-white' :
    'bg-red-500 text-white';

  const fetchDef = async (term) => {
    if (jargonDefs[term]) return; // already loaded
    setJargonDefs(prev => ({...prev, [term]: 'Loading...'}));
    try {
      const res = await axios.post(`${API}/define-term`, { term, context: 'from an Economic Times news article' });
      setJargonDefs(prev => ({...prev, [term]: res.data.definition}));
    } catch {
      setJargonDefs(prev => ({...prev, [term]: 'Could not load definition.'}));
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-5 space-y-2">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase flex items-center gap-1 ${levelColor}`}>
          <Brain size={12} /> Complexity: {level} ({score}/10)
        </span>
        <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-[10px] flex items-center gap-1">
          <Clock size={12} /> {reading_time_mins} min read
        </span>
        <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-[10px] flex items-center gap-1">
          <HelpCircle size={12} /> {jargon_count} jargon terms
        </span>
        <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-[10px] flex items-center gap-1 capitalize">
          <UserCheck size={12} /> Best for: {recommended_for?.join(', ')}
        </span>
      </div>

      {simplification_needed && (
        <div className="bg-blue-500/10 border border-blue-500/20 text-blue-200 text-xs p-2 rounded text-center">
          💡 This article uses complex language. The AI Action Cards below will help simplify it for your role.
        </div>
      )}

      {key_jargon_terms?.length > 0 && (
        <div className="flex flex-wrap justify-center gap-1.5 pt-2">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest mr-1 self-center">Jargon:</span>
          {key_jargon_terms.map((term, i) => (
            <div key={i} className="group relative">
              <button 
                onMouseEnter={() => fetchDef(term)}
                className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-orange-200 hover:bg-orange-500/20 transition cursor-help"
              >
                {term}
              </button>
              {jargonDefs[term] && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-48 p-2 bg-slate-800 border border-slate-600 rounded shadow-xl text-[10px] text-slate-200 opacity-0 group-hover:opacity-100 pointer-events-none transition z-50">
                  {jargonDefs[term]}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
