import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ChevronDown, Loader2 } from 'lucide-react';
import axios from 'axios';

const API = 'http://localhost:8000';

const LANGUAGES = [
  { code: 'Hindi', flag: '🇮🇳', label: 'हिन्दी (Hindi)' },
  { code: 'Tamil', flag: '🇮🇳', label: 'தமிழ் (Tamil)' },
  { code: 'Telugu', flag: '🇮🇳', label: 'తెలుగు (Telugu)' },
  { code: 'Bengali', flag: '🇮🇳', label: 'বাংলা (Bengali)' },
  { code: 'Marathi', flag: '🇮🇳', label: 'मराठी (Marathi)' },
];

export default function VernacularPanel({ actions }) {
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState('');
  const [translated, setTranslated] = useState('');
  const [loading, setLoading] = useState(false);

  if (!actions) return null;

  const handleTranslate = async (lang) => {
    setLanguage(lang);
    setLoading(true);
    setTranslated('');
    try {
      const allText = [
        `Who's Affected:\n${actions.affected || ''}`,
        `What It Means:\n${actions.meaning || ''}`,
        `What To Do:\n${actions.actions || ''}`,
        `Risks If Ignored:\n${actions.risks || ''}`,
      ].join('\n\n');

      const { data } = await axios.post(`${API}/translate`, { text: allText, language: lang });
      setTranslated(data.translated_text);
    } catch (err) {
      setTranslated(`Translation error: ${err.response?.data?.detail || err.message}`);
    } finally { setLoading(false); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
      className="glass-card relative p-5 mt-5">

      <button onClick={() => setOpen(v => !v)}
        className="flex items-center justify-between w-full text-left" aria-expanded={open}>
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Globe size={16} className="text-orange-400" /> Vernacular News Engine — Read in Your Language
        </h3>
        <ChevronDown size={16} className={`text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="mt-4 border-t border-white/5 pt-4">

              {/* Language selector */}
              <div className="flex flex-wrap gap-2 mb-4" role="radiogroup" aria-label="Select translation language">
                {LANGUAGES.map(l => (
                  <button key={l.code} onClick={() => handleTranslate(l.code)}
                    disabled={loading}
                    className={`tab-pill text-xs ${language === l.code ? 'active' : ''}`}
                    role="radio" aria-checked={language === l.code}>
                    {l.flag} {l.label}
                  </button>
                ))}
              </div>

              {/* Loading */}
              {loading && (
                <div className="flex items-center gap-2 text-sm text-orange-300/70 py-4">
                  <Loader2 size={16} className="animate-spin" /> Translating to {language}…
                </div>
              )}

              {/* Translated content */}
              {translated && !loading && (
                <div aria-live="polite">
                  <div className="bg-white/3 rounded-lg p-4 border border-white/5">
                    <div className="flex justify-between items-center mb-2">
                      <span className="badge bg-orange-500/10 text-orange-300 border border-orange-500/20">
                        {language}
                      </span>
                    </div>
                    <div className="text-sm text-slate-300/90 leading-relaxed whitespace-pre-line">{translated}</div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
