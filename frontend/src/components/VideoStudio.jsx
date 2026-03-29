import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Square, FastForward, Rewind, Volume2 } from 'lucide-react';
import { useVoice } from '../hooks/useVoice';

export default function VideoStudio({ articleInfo, actions, onClose }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [slide, setSlide] = useState(0);
  const { speak, stopSpeaking } = useVoice();
  const slideTimer = useRef(null);

  // Construct our "Video Script" storyboard from the RAG data
  const STORYBOARD = [
    {
      type: "intro",
      title: articleInfo.title || "Breaking News",
      subtitle: "AI News Video Studio Brief",
      script: `Here is your breaking news brief on ${articleInfo.title || "the latest Economic Times story"}.`,
      bg: "from-blue-900/40 to-slate-900/90",
    },
    {
      type: "meaning",
      title: "What This Means",
      content: actions.meaning,
      script: actions.meaning || "The implications are currently being analyzed.",
      bg: "from-orange-900/40 to-slate-900/90",
    },
    {
      type: "affected",
      title: "Who Is Affected",
      content: actions.affected,
      script: actions.affected || "Stakeholder analysis pending.",
      bg: "from-purple-900/40 to-slate-900/90",
    },
    {
      type: "actions",
      title: "Recommended Actions",
      content: actions.actions,
      script: "Here is what you need to do. " + (actions.actions || "Maintain monitoring."),
      bg: "from-emerald-900/40 to-slate-900/90",
    },
    {
      type: "outro",
      title: "Risks & Outlook",
      content: actions.risks,
      script: (actions.risks || "No severe risks identified.") + " This concludes your brief.",
      bg: "from-red-900/40 to-slate-900/90",
    }
  ];

  const currentSlide = STORYBOARD[slide];

  // Auto-play orchestrator
  useEffect(() => {
    if (isPlaying) {
      // 1. Speak the script
      speak(currentSlide.script);

      // 2. Estimate time to read (rough heuristic: 150 words per min = 2.5 words/sec -> meaning length / 5 chars per word / 2.5 ~ length * 0.08)
      // Cap at min 4s, max 15s
      const holdTimeMs = Math.max(4000, Math.min(15000, (currentSlide.script.length * 80) + 1000));

      slideTimer.current = setTimeout(() => {
        if (slide < STORYBOARD.length - 1) {
          setSlide(s => s + 1);
        } else {
          setIsPlaying(false);
          setSlide(0);
        }
      }, holdTimeMs);
    } else {
      stopSpeaking();
      clearTimeout(slideTimer.current);
    }

    return () => {
      stopSpeaking();
      clearTimeout(slideTimer.current);
    };
  }, [isPlaying, slide]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  
  const handleClose = () => {
    stopSpeaking();
    clearTimeout(slideTimer.current);
    setIsPlaying(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 md:p-10">
      
      {/* Video Container */}
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-5xl aspect-video rounded-2xl overflow-hidden shadow-2xl shadow-orange-500/20 bg-slate-950 flex flex-col"
      >
        {/* Dynamic Background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${currentSlide.bg} transition-colors duration-1000 opacity-60`} />
        
        {/* Playback Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-white/10 z-20 flex gap-1 px-1 pt-1">
          {STORYBOARD.map((_, i) => (
            <div key={i} className="h-full flex-1 bg-white/10 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-orange-500 transition-all ${
                  i < slide ? 'w-full' : i === slide && isPlaying ? 'w-full duration-[10000ms] ease-linear' : 'w-0'
                }`} 
              />
            </div>
          ))}
        </div>

        {/* Close Button */}
        <button onClick={handleClose} className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/40 hover:bg-black/80 text-white transition-colors">
          <X size={24} />
        </button>

        {/* Studio Branding */}
        <div className="absolute top-6 left-6 z-20 text-white/50 font-bold uppercase tracking-[0.2em] text-xs flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          ET AI Video Studio
        </div>

        {/* Main Content Area */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-12 text-center h-full">
          <AnimatePresence mode="wait">
            <motion.div 
              key={slide}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl"
            >
              <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight drop-shadow-lg">
                {currentSlide.title}
              </h2>
              
              {currentSlide.type === 'intro' && (
                <div className="w-24 h-1 bg-orange-500 mx-auto rounded-full mb-6" />
              )}

              {currentSlide.content && (
                <p className="text-xl md:text-2xl text-slate-200/90 leading-relaxed font-medium">
                  {currentSlide.content}
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Subtitles Overlay */}
        {isPlaying && (
          <div className="absolute bottom-24 left-0 w-full px-12 z-20 text-center pointer-events-none">
            <span className="bg-black/60 text-yellow-300 px-4 py-2 rounded text-lg font-medium drop-shadow-md inline-block">
              {currentSlide.script}
            </span>
          </div>
        )}

        {/* Controls Bar */}
        <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-black/90 to-transparent z-20 flex items-center justify-between px-10">
          <div className="flex gap-4">
            <button onClick={() => setSlide(Math.max(0, slide - 1))} className="text-white/70 hover:text-white transition-colors">
              <Rewind size={24} />
            </button>
            <button onClick={togglePlay} className="text-orange-400 hover:text-orange-300 transition-colors drop-shadow-lg">
              {isPlaying ? <Square size={32} /> : <Play fill="currentColor" size={32} />}
            </button>
            <button onClick={() => setSlide(Math.min(STORYBOARD.length - 1, slide + 1))} className="text-white/70 hover:text-white transition-colors">
              <FastForward size={24} />
            </button>
          </div>

          {/* Audio Visualization mock */}
          <div className="flex items-center gap-3">
            <Volume2 className={isPlaying ? 'text-orange-400 animate-pulse' : 'text-white/30'} size={20} />
            <div className="flex gap-1 h-4 items-center">
              {[...Array(8)].map((_, i) => (
                <div key={i} className={`w-1 bg-orange-500 rounded-full ${isPlaying ? 'animate-bounce' : 'h-1'}`} 
                  style={{ height: isPlaying ? `${Math.random() * 16 + 4}px` : '4px', animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
