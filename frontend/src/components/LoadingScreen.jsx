import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2 } from 'lucide-react';

const STEPS = [
  { icon: '📥', text: 'Extracting article content...' },
  { icon: '🧩', text: 'Chunking and embedding...' },
  { icon: '🔍', text: 'Building knowledge index...' },
  { icon: '🤖', text: 'Generating insights...' },
];

export default function LoadingScreen() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timers = STEPS.map((_, i) =>
      setTimeout(() => setActiveStep(i + 1), (i + 1) * 1800)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-16 gap-8" role="status" aria-busy="true" aria-label="Processing article">
      {/* Logo */}
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="text-center">
        <span className="text-4xl">⚡</span>
        <h2 className="text-lg font-bold bg-gradient-to-r from-orange-300 to-yellow-200 bg-clip-text text-transparent mt-2">
          ET NewsAction AI
        </h2>
      </motion.div>

      {/* Steps */}
      <div className="flex flex-col gap-3 w-full max-w-sm">
        {STEPS.map((step, i) => {
          const done = i < activeStep;
          const current = i === activeStep;
          return (
            <motion.div key={i}
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.2 }}
              className={`flex items-center gap-3 py-2 px-4 rounded-lg transition-all ${
                done ? 'bg-green-500/8 text-green-300' : current ? 'bg-orange-500/8 text-orange-200' : 'text-slate-500'
              }`}>
              {done ? <CheckCircle2 size={18} className="text-green-400" /> :
               current ? <Loader2 size={18} className="animate-spin text-orange-400" /> :
               <span className="w-[18px] h-[18px] rounded-full border border-slate-600 flex-shrink-0" />}
              <span className="text-sm">{step.icon} {step.text}</span>
            </motion.div>
          );
        })}
      </div>

      {/* Shimmer */}
      <div className="flex flex-col gap-2 w-48">
        <div className="shimmer w-full" />
        <div className="shimmer w-3/4" />
      </div>
    </div>
  );
}
