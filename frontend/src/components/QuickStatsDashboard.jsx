import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Clock, BarChart3, Zap, BookOpen } from 'lucide-react';

function AnimatedCounter({ end, duration = 1500, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

export default function QuickStatsDashboard({ wordCount, summary }) {
  const readingTime = Math.max(1, Math.ceil((wordCount || 0) / 200));
  const complexity = wordCount > 800 ? 'Advanced' : wordCount > 400 ? 'Moderate' : 'Simple';
  const complexityColor = wordCount > 800 ? 'text-red-400' : wordCount > 400 ? 'text-yellow-400' : 'text-green-400';
  const savingsMin = Math.max(1, Math.ceil(readingTime * 2.5));

  const stats = [
    {
      icon: <Clock size={18} />,
      label: 'Reading Time',
      value: <AnimatedCounter end={readingTime} suffix=" min" />,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      icon: <BarChart3 size={18} />,
      label: 'Complexity',
      value: complexity,
      color: complexityColor,
      bg: 'bg-yellow-500/10',
    },
    {
      icon: <BookOpen size={18} />,
      label: 'Word Count',
      value: <AnimatedCounter end={wordCount || 0} />,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
    },
    {
      icon: <Zap size={18} />,
      label: 'Time Saved',
      value: <AnimatedCounter end={savingsMin} suffix=" min" />,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
      {stats.map((s, i) => (
        <motion.div key={i}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.1 }}
          className="glass-card relative p-3 text-center"
        >
          <div className={`${s.bg} w-9 h-9 rounded-lg flex items-center justify-center mx-auto mb-2 ${s.color}`}>
            {s.icon}
          </div>
          <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
          <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">{s.label}</div>
        </motion.div>
      ))}
    </div>
  );
}
