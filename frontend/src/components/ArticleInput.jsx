import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link2, FileText, Upload, Mic } from 'lucide-react';
import { useVoice } from '../hooks/useVoice';
import RoleSelector from './RoleSelector';

const TABS = [
  { label: 'Enter URL', icon: <Link2 size={15}/> },
  { label: 'Paste Text', icon: <FileText size={15}/> },
  { label: 'Upload PDF', icon: <Upload size={15}/> },
];

export default function ArticleInput({ onSubmit, isLoading, onRoleSelect }) {
  const [tab, setTab] = useState(0);
  const [role, setRole] = useState('');
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const fileRef = useRef(null);
  const { startListening, isListening, stopListening } = useVoice();

  const handleSubmit = () => {
    if (isLoading || !role) return;
    const fd = new FormData();
    fd.append('role', role);
    if (tab === 0 && url.trim()) fd.append('url', url.trim());
    else if (tab === 1 && text.trim()) fd.append('text', text.trim());
    else if (tab === 2 && file) fd.append('file', file);
    else return;
    onSubmit(fd, role);
  };

  const handleVoiceInput = () => {
    if (isListening) { stopListening(); return; }
    startListening((result) => {
      if (tab === 0) setUrl(result);
      else if (tab === 1) setText(prev => prev + ' ' + result);
    });
  };

  const canSubmit = role && !isLoading && (
    (tab === 0 && url.trim().length > 5) ||
    (tab === 1 && text.trim().length >= 200) ||
    (tab === 2 && file)
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card relative p-6 md:p-8 max-w-2xl mx-auto"
    >
      {/* Tabs */}
      <div className="flex gap-2 mb-5 flex-wrap" role="tablist">
        {TABS.map((t, i) => (
          <button key={t.label} role="tab" aria-selected={tab === i}
            className={`tab-pill flex items-center gap-1.5 ${tab === i ? 'active' : ''}`}
            onClick={() => setTab(i)}>{t.icon} {t.label}</button>
        ))}
      </div>

      {/* Tab Panels */}
      <div role="tabpanel" className="mb-5">
        {tab === 0 && (
          <div className="flex gap-2">
            <input id="url-input" type="url" value={url} onChange={e => setUrl(e.target.value)}
              placeholder="Paste Economic Times article URL..." className="neo-input flex-1" aria-label="Article URL" />
            <button onClick={handleVoiceInput} className={`btn-ghost px-2.5 ${isListening ? 'mic-pulse' : ''}`}
              aria-label={isListening ? 'Stop voice' : 'Voice input'}><Mic size={16}/></button>
          </div>
        )}
        {tab === 1 && (
          <div>
            <div className="flex gap-2 mb-1">
              <textarea id="text-input" value={text} onChange={e => setText(e.target.value)}
                placeholder="Paste article text here (min 200 characters)..."
                className="neo-input flex-1 min-h-[140px] resize-y" aria-label="Article text" />
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-xs ${text.length >= 200 ? 'text-green-400' : 'text-slate-500'}`}>
                {text.length}/200 characters
              </span>
              <button onClick={handleVoiceInput} className={`btn-ghost text-xs ${isListening ? 'mic-pulse' : ''}`}
                aria-label="Voice input"><Mic size={13}/> Speak</button>
            </div>
          </div>
        )}
        {tab === 2 && (
          <div>
            <input ref={fileRef} type="file" accept=".pdf" className="hidden"
              onChange={e => setFile(e.target.files?.[0] || null)} aria-label="Upload PDF" />
            <button onClick={() => fileRef.current?.click()} aria-label="Choose PDF"
              className="w-full py-6 text-center rounded-xl border-2 border-dashed border-orange-500/15 hover:border-orange-500/30 transition bg-orange-900/5 text-orange-200/60">
              <Upload size={24} className="mx-auto mb-1 opacity-50" />
              {file ? file.name : 'Click to upload a PDF'}
            </button>
          </div>
        )}
      </div>

      {/* Role */}
      <div className="mb-6">
        <RoleSelector selectedRole={role} onRoleChange={(r) => {
          setRole(r);
          if (onRoleSelect) onRoleSelect(r);
        }} />
      </div>

      {/* Submit */}
      <button onClick={handleSubmit} disabled={!canSubmit} className="btn-et w-full" aria-label="Analyze article">
        {isLoading ? <span className="flex items-center justify-center gap-2"><span className="et-spinner w-4 h-4 border-2"></span> Analyzing…</span> : '⚡ Analyze Article'}
      </button>
    </motion.div>
  );
}
