import { useState, useEffect } from 'react';
import axios from 'axios';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import ArticleSummaryBar from '../components/ArticleSummaryBar';
import QuickStatsDashboard from '../components/QuickStatsDashboard';
import ActionCards from '../components/ActionCards';
import BriefingPanel from '../components/BriefingPanel';
import StoryArcTracker from '../components/StoryArcTracker';
import VernacularPanel from '../components/VernacularPanel';
import CustomQuery from '../components/CustomQuery';
import ShareButton from '../components/ShareButton';

// Smart Feature Imports
import SentimentMeter from '../components/SentimentMeter';
import ImpactDashboard from '../components/ImpactDashboard';
import ActionPriorityRanker from '../components/ActionPriorityRanker';
import CognitiveLoadBadge from '../components/CognitiveLoadBadge';
import QuestionSuggester from '../components/QuestionSuggester';
import BiasDetector from '../components/BiasDetector';
import CredibilityChecker from '../components/CredibilityChecker';

import { Download, Copy, Target, Loader2 } from 'lucide-react';

const API = 'http://localhost:8000';

export default function Results({ articleInfo, actions, storyArc, role, sessionId, onReset }) {
  // Auto-loaded states
  const [cognitiveLoad, setCognitiveLoad] = useState(null);
  const [sentiment, setSentiment] = useState(null);
  const [impactScores, setImpactScores] = useState(null);
  const [rankedActions, setRankedActions] = useState(null);
  
  // Follow-up questions state
  const [questions, setQuestions] = useState(null);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  
  // On-demand states
  const [biasData, setBiasData] = useState(null);
  const [loadingBias, setLoadingBias] = useState(false);
  const [credibilityData, setCredibilityData] = useState(null);
  const [loadingCredibility, setLoadingCredibility] = useState(false);

  // CustomQuery external trigger
  const [customQueryInput, setCustomQueryInput] = useState("");
  
  // PDF Export state
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (!sessionId) return;

    // 1. Cognitive Load
    axios.get(`${API}/cognitive-load/${sessionId}`)
      .then(res => setCognitiveLoad(res.data)).catch(() => {});

    // 2. Sentiment
    axios.post(`${API}/sentiment`, { session_id: sessionId, role })
      .then(res => setSentiment(res.data)).catch(() => {});

    // 3. Impact Dashboard
    axios.post(`${API}/impact-scores`, { session_id: sessionId, role })
      .then(res => setImpactScores(res.data)).catch(() => {});

  }, [sessionId, role]);

  // Rank Actions needs `actions` dependency because it relies on the text of the generated actions
  useEffect(() => {
    if (!sessionId || !actions) return;
    const actionsText = `${actions.affected} ${actions.meaning} ${actions.actions} ${actions.risks}`;
    axios.post(`${API}/rank-actions`, { session_id: sessionId, role, actions_text: actionsText })
      .then(res => setRankedActions(res.data)).catch(() => {});
  }, [sessionId, role, actions]);

  // Load Questions initially and on refresh
  const loadQuestions = () => {
    if (!sessionId || !actions) return;
    setLoadingQuestions(true);
    axios.post(`${API}/suggest-questions`, { session_id: sessionId, role, existing_answers: actions })
      .then(res => setQuestions(res.data.questions))
      .catch(() => {})
      .finally(() => setLoadingQuestions(false));
  };

  useEffect(() => {
    if (actions && !questions && !loadingQuestions) loadQuestions();
  }, [actions]);

  // On-demand fetchers
  const fetchBias = () => {
    setLoadingBias(true);
    axios.post(`${API}/bias-detect`, { session_id: sessionId })
      .then(res => setBiasData(res.data)).catch(() => {}).finally(() => setLoadingBias(false));
  };

  const fetchCredibility = () => {
    setLoadingCredibility(true);
    axios.post(`${API}/credibility`, { session_id: sessionId, source_url: "" })
      .then(res => setCredibilityData(res.data)).catch(() => {}).finally(() => setLoadingCredibility(false));
  };
  
  const handleCopy = () => {
    navigator.clipboard.writeText(`ET Analysis: ${articleInfo?.title}`);
    alert("Copied to clipboard!");
  };

  const handleQuestionClick = (q) => {
    setCustomQueryInput(q);
    setTimeout(() => {
      document.getElementById("custom-query-section")?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Generate Rich PDF using html2canvas + jspdf
  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const element = document.getElementById('pdf-export-area');
      // Hide interactive elements during capture
      const exportHideElements = document.querySelectorAll('.no-pdf');
      exportHideElements.forEach(el => { el.style.opacity = '0'; });

      const canvas = await html2canvas(element, { 
        scale: 1.5, 
        backgroundColor: '#0a0a1a', 
        useCORS: true,
        windowWidth: element.scrollWidth
      });
      
      exportHideElements.forEach(el => { el.style.opacity = '1'; });

      const imgData = canvas.toDataURL('image/jpeg', 0.9);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      let position = 0;
      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
      
      let heightLeft = pdfHeight - pageHeight;
      while (heightLeft > 0) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`ET-Analysis-${Date.now()}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to export PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fade-up space-y-0 relative" id="pdf-export-area">
      
      {/* 1. ArticleSummaryBar */}
      <ArticleSummaryBar
        title={articleInfo?.title} wordCount={articleInfo?.word_count}
        summary={articleInfo?.summary} role={role} onReset={onReset}
      />

      {/* Toolbar (Top Right) */}
      <div className="flex flex-wrap justify-end gap-2 my-4 no-pdf">
        {!biasData && <button onClick={fetchBias} disabled={loadingBias} className="btn-ghost text-xs">🔍 Bias Analysis</button>}
        {!credibilityData && <button onClick={fetchCredibility} disabled={loadingCredibility} className="btn-ghost text-xs">🛡️ Check Credibility</button>}
        <ShareButton articleInfo={articleInfo} actions={actions} />
        <button onClick={handleCopy} className="btn-ghost text-xs" aria-label="Copy">📋 Copy</button>
      </div>

      {/* Render Bias / Credibility if fetched */}
      {(loadingBias || biasData) && <BiasDetector biasData={biasData} loading={loadingBias} onAnalyze={fetchBias} />}
      {(loadingCredibility || credibilityData) && <CredibilityChecker credibilityData={credibilityData} loading={loadingCredibility} onCheck={fetchCredibility} />}

      {/* 2. CognitiveLoadBadge */}
      <div className="mt-6">
        <CognitiveLoadBadge cognitiveLoad={cognitiveLoad} />
      </div>

      {/* 3. SentimentMeter */}
      <div className="mt-2 mb-6 max-w-sm mx-auto">
        <SentimentMeter sentiment={sentiment} />
      </div>

      {/* 4. ImpactDashboard */}
      <ImpactDashboard scores={impactScores} role={role} />

      {/* 5. ActionCards */}
      <ActionCards actions={actions} />

      {/* 6. ActionPriorityRanker */}
      <ActionPriorityRanker rankedActions={rankedActions} role={role} />

      {/* 7. QuestionSuggester */}
      <div className="no-pdf">
        <QuestionSuggester questions={questions} role={role} onQuestionClick={handleQuestionClick} onRefresh={loadQuestions} loading={loadingQuestions}/>
      </div>

      {/* 8. StoryArcTracker, Vernacular, Briefing */}
      <div className="space-y-4">
        <BriefingPanel sessionId={sessionId} role={role} />
        <StoryArcTracker storyArc={storyArc} />
        <div className="no-pdf">
          <VernacularPanel actions={actions} />
        </div>
      </div>

      {/* 9. CustomQuery */}
      <div id="custom-query-section" className="pt-6 no-pdf">
        <CustomQuery sessionId={sessionId} role={role} initialQuery={customQueryInput} />
      </div>

      {/* Footer Actions */}
      <div className="flex justify-center gap-3 pt-8 pb-4 border-t border-white/5 mt-8 no-pdf">
        <button onClick={handleExportPDF} disabled={isExporting}
          className="btn-primary text-xs flex items-center gap-1.5" aria-label="Export PDF report">
          {isExporting ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />} 
          {isExporting ? "Generating PDF..." : "Export to PDF"}
        </button>
        <button onClick={onReset} className="btn-ghost text-xs text-orange-400 hover:text-orange-300">
          ⚡ Analyze New Article
        </button>
      </div>
    </div>
  );
}
