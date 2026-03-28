import { motion } from 'framer-motion';

export default function SentimentMeter({ sentiment }) {
  if (!sentiment) return null;

  const { overall, score, role_impact, confidence, reason } = sentiment;
  const rotation = ((score + 100) / 200) * 180 - 90;

  const getColor = (type) => {
    if (['Bullish', 'Positive'].includes(type)) return 'text-green-500';
    if (['Bearish', 'Negative'].includes(type)) return 'text-red-500';
    if (['Neutral'].includes(type)) return 'text-gray-400';
    return 'text-yellow-500'; // Mixed
  };

  const badgeColor = 
    role_impact === 'Positive' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
    role_impact === 'Negative' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
    'bg-gray-500/10 text-gray-300 border-gray-500/20';

  const confDots = {'High': 3, 'Medium': 2, 'Low': 1}[confidence] || 0;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 flex flex-col items-center">
      
      {/* SVG Auto-Scaling Gauge */}
      <div className="w-full max-w-[200px] mb-2 relative">
        <svg viewBox="0 0 200 110" className="w-full drop-shadow-md">
          {/* Background Arc */}
          <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#ffffff10" strokeWidth="20" strokeLinecap="round" />
          {/* Colored Gradient Arc */}
          <defs>
            <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="50%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>
          </defs>
          <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="url(#gaugeGrad)" strokeWidth="20" strokeLinecap="round" />
          
          {/* Needle */}
          <g transform={`translate(100, 100)`}>
            <motion.line
              initial={{ rotate: -90 }}
              animate={{ rotate: rotation }}
              transition={{ type: 'spring', damping: 20, stiffness: 100, delay: 0.3 }}
              x1="0" y1="0" x2="0" y2="-70" stroke="#fff" strokeWidth="3" strokeLinecap="round"
              className="origin-bottom"
            />
            <circle cx="0" cy="0" r="6" fill="#fff" />
          </g>
        </svg>
      </div>

      <h2 className={`text-2xl font-black uppercase tracking-widest ${getColor(overall)}`}>
        {overall}
      </h2>
      
      <div className="flex items-center gap-3 mt-3 mb-2">
        <span className={`badge border ${badgeColor}`}>
          Impact: {role_impact}
        </span>
        <span className="text-xs text-slate-400 flex items-center gap-1">
          {confidence} Confidence
          <span className="flex gap-0.5 ml-1">
            {[...Array(3)].map((_, i) => (
              <span key={i} className={`text-[8px] ${i < confDots ? 'text-blue-400' : 'text-slate-700'}`}>●</span>
            ))}
          </span>
        </span>
      </div>

      <p className="text-sm text-slate-400 italic text-center max-w-sm">"{reason}"</p>
    </motion.div>
  );
}
