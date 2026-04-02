import { useState } from 'react';
import axios from 'axios';
import AccessibilityBar from './components/AccessibilityBar';
import AnalysisHistory, { saveFullHistory } from './components/AnalysisHistory';
import LoadingScreen from './components/LoadingScreen';
import Home from './pages/Home';
import Results from './pages/Results';

const API = 'http://localhost:8000';

export default function App() {
  const [view, setView] = useState('home');
  const [articleInfo, setArticleInfo] = useState(null);
  const [actions, setActions] = useState(null);
  const [storyArc, setStoryArc] = useState(null);
  const [role, setRole] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (formData, selectedRole) => {
    setView('loading');
    setError('');
    setRole(selectedRole);

    try {
      const { data: processData } = await axios.post(`${API}/process`, formData);
      setArticleInfo(processData);
      setSessionId(processData.session_id);

      const [{ data: actionsData }, { data: arcData }] = await Promise.all([
        axios.post(`${API}/actions`, { session_id: processData.session_id, role: selectedRole }),
        axios.post(`${API}/story-arc`, { session_id: processData.session_id }).catch(() => ({ data: null }))
      ]);
      setActions(actionsData);
      setStoryArc(arcData);

      // Save full generation state to history
      saveFullHistory({
        articleInfo: processData,
        actions: actionsData,
        storyArc: arcData,
        role: selectedRole
      });

      setView('results');
    } catch (err) {
      const msg = err.response?.data?.detail || err.message;
      setError(msg);
      setView('home');
    }
  };

  const handleReset = () => {
    if (sessionId) axios.delete(`${API}/session/${sessionId}`).catch(() => {});
    setView('home');
    setArticleInfo(null);
    setActions(null);
    setStoryArc(null);
    setSessionId('');
    setError('');
  };

  return (
    <div className="relative min-h-screen">
      <div className="cosmic-bg" />

      <div className="relative z-10">
        <a href="#main-content" className="sr-only focus:not-sr-only">Skip to main content</a>

        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0a0a1a]/75 border-b border-orange-500/8">
          <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between">
            <h1 onClick={handleReset} className="text-base font-bold cursor-pointer flex items-center gap-2 group"
              role="button" aria-label="Go home">
              <span className="text-xl">⚡</span>
              <span className="bg-gradient-to-r from-orange-300 to-yellow-200 bg-clip-text text-transparent">
                ET NewsAction AI
              </span>
              <span className="text-[9px] font-mono bg-orange-500/10 text-orange-300/60 px-1.5 py-0.5 rounded-full border border-orange-500/15">
                v2.0
              </span>
            </h1>
            <div className="flex items-center gap-2">
              <AnalysisHistory onSelectArticle={(item) => {
                setArticleInfo(item.articleInfo);
                setActions(item.actions);
                setStoryArc(item.storyArc);
                setRole(item.role);
                setView('results');
              }} />
              <AccessibilityBar />
            </div>
          </div>
        </header>

        <main id="main-content" className="max-w-7xl mx-auto px-4 py-8" role="main">
          {error && (
            <div className="glass-card bg-red-950/20 border-red-500/20 p-3 mb-5 text-sm text-red-200 flex justify-between items-center" role="alert">
              <span>⚠️ {error}</span>
              <button onClick={() => setError('')} className="btn-ghost text-xs">Dismiss</button>
            </div>
          )}

          {view === 'home' && <Home onSubmit={handleSubmit} isLoading={false} />}
          {view === 'loading' && <LoadingScreen />}
          {view === 'results' && (
            <Results articleInfo={articleInfo} actions={actions} storyArc={storyArc}
              role={role} sessionId={sessionId} onReset={handleReset} />
          )}
        </main>
      </div>
    </div>
  );
}
