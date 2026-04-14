import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Square, FastForward, Rewind, Volume2 } from 'lucide-react';
import { useVoice } from '../hooks/useVoice';
import JournalistAvatar from './JournalistAvatar';

export default function VideoStudio({ articleInfo, actions, onClose }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [slide, setSlide] = useState(0);
  const { speak, stopSpeaking } = useVoice();
  const slideTimer = useRef(null);

  const STORYBOARD = [
    {
      type: "intro",
      title: articleInfo.title || "Breaking News",
      script: `Here is your breaking news brief on ${articleInfo.title || "the latest Economic Times story"}.`,
      photo: "/cinematic_studio.png"
    },
    {
      type: "meaning",
      title: "What This Means",
      script: actions.meaning || "The implications are currently being analyzed.",
      photo: "/cinematic_data.png"
    },
    {
      type: "affected",
      title: "Who Is Affected",
      script: actions.affected || "Stakeholder analysis pending.",
      photo: "/cinematic_data.png"
    },
    {
      type: "actions",
      title: "Recommended Actions",
      script: "Here is what you need to do. " + (actions.actions || "Maintain monitoring."),
      photo: "/cinematic_insight.png"
    },
    {
      type: "outro",
      title: "Risks & Outlook",
      script: (actions.risks || "No severe risks identified.") + " This concludes your brief.",
      photo: "/cinematic_risk.png"
    }
  ];

  const currentSlide = STORYBOARD[slide];

  useEffect(() => {
    if (isPlaying) {
      speak(currentSlide.script);
      const holdTimeMs = Math.max(5000, Math.min(18000, (currentSlide.script.length * 80) + 1000));
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-3xl p-4 md:p-10">
      
      {/* Immersive Video Container - Split View Layout */}
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full h-full md:max-w-7xl md:aspect-[21/9] rounded-3xl overflow-hidden shadow-2xl bg-slate-900 border border-slate-700 flex flex-col md:flex-row"
      >
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-800 z-30 flex">
          {STORYBOARD.map((_, i) => (
            <div key={i} className="h-full flex-1 border-r border-slate-900">
              <div 
                className={`h-full bg-orange-500 transition-all ${
                  i < slide ? 'w-full' : i === slide && isPlaying ? 'w-full duration-[18000ms] ease-linear' : 'w-0'
                }`} 
              />
            </div>
          ))}
        </div>

        {/* Left Side: Avatar Journalist */}
        <div className="relative flex-1 md:flex-none md:w-[35%] h-full flex flex-col items-center justify-center bg-slate-800/80 p-8 border-r border-slate-700/50">
           {/* Header Info */}
           <div className="absolute top-6 left-6 z-30 text-white/50 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-red-500 animate-pulse' : 'bg-slate-500'}`} />
            SYNTHETIC ANCHOR
          </div>
          
          <JournalistAvatar isTalking={isPlaying} />
          
          {isPlaying && (
            <div className="mt-8 flex gap-1.5 h-6 items-center justify-center">
              {[...Array(16)].map((_, i) => (
                <div key={i} className="w-1.5 bg-orange-500 rounded-full animate-pulse" 
                  style={{ 
                    height: `${Math.random() * 20 + 8}px`, 
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: '0.4s'
                  }} 
                />
              ))}
            </div>
          )}
          {!isPlaying && (
            <div className="mt-8 text-white/30 uppercase tracking-widest text-sm font-bold">
              Standby Mode
            </div>
          )}
        </div>

        {/* Right Side: Information / Photo Show */}
        <div className="relative flex-1 h-full flex flex-col justify-center p-8 md:p-14 bg-gradient-to-br from-slate-900 to-slate-950 overflow-y-auto">
            <button onClick={handleClose} className="absolute top-6 right-6 p-2 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white transition-all z-40">
              <X size={20} />
            </button>
            
            <AnimatePresence mode="wait">
              <motion.div 
                key={slide}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20, filter: "blur(5px)" }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="max-w-2xl mx-auto w-full pb-16 md:pb-0"
              >
                <div className="inline-block mb-3 px-3 py-1 bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-widest rounded">
                  {currentSlide.type === 'intro' ? 'Breaking Context' : 'Visual Summary'}
                </div>
                
                <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 leading-tight drop-shadow-md">
                  {currentSlide.title}
                </h2>
                
                {/* Dynamically Loaded Photo Viewer */}
                {currentSlide.photo && (
                  <div className="w-full aspect-[21/9] bg-slate-950 rounded-2xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)] mb-6 border border-slate-700/50 relative">
                     <img 
                       src={currentSlide.photo} 
                       alt={currentSlide.title} 
                       className="absolute inset-0 w-full h-full object-cover transition-transform duration-[20000ms] scale-105 hover:scale-125" 
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                  </div>
                )}

                <div className="text-lg md:text-xl text-slate-300 leading-relaxed font-medium bg-slate-800/40 p-6 rounded-xl border border-slate-700/50 shadow-inner">
                  {currentSlide.script}
                </div>
              </motion.div>
            </AnimatePresence>
            
            {/* Playback Controls Footer */}
            <div className="fixed md:absolute bottom-8 right-8 z-50 flex items-center justify-end gap-5 px-6 py-3 bg-slate-800/90 backdrop-blur-xl rounded-full border border-slate-600 shadow-2xl">
              <button onClick={() => setSlide(Math.max(0, slide - 1))} className="text-slate-400 hover:text-white transition-colors">
                <Rewind size={20} />
              </button>
              
              <button onClick={togglePlay} className="text-orange-400 hover:scale-110 hover:text-orange-300 transition-all">
                {isPlaying ? <Square size={28} /> : <Play fill="currentColor" size={28} />}
              </button>
              
              <button onClick={() => setSlide(Math.min(STORYBOARD.length - 1, slide + 1))} className="text-slate-400 hover:text-white transition-colors">
                <FastForward size={20} />
              </button>
            </div>
        </div>
      </motion.div>
    </div>
  );
}
