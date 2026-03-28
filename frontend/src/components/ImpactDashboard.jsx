import { motion } from 'framer-motion';
import { Target, TrendingUp, TrendingDown, AlertTriangle, Lightbulb, Clock, Focus } from 'lucide-react';

export default function ImpactDashboard({ scores, role }) {
  if (!scores) return null;

  const { urgency, financial_impact, risk_level, opportunity_score, relevance_to_role, time_sensitivity, overall_action_score, headline } = scores;

  const ringColor = 
    overall_action_score > 75 ? 'stroke-red-500' :
    overall_action_score > 50 ? 'stroke-orange-500' :
    overall_action_score > 30 ? 'stroke-yellow-500' :
    'stroke-slate-500';

  const ScoreBar = ({ score, color }) => (
    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mt-2 mb-1">
      <motion.div initial={{ width: 0 }} animate={{ width: `${score * 10}%` }} className={`h-full ${color}`} />
    </div>
  );

  return (
    <div className="mb-8 mt-4">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-200">
          📊 Impact Intelligence Dashboard
        </h2>
        <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest">Personalized for {role?.replace('_', ' ')}</p>
      </div>

      {/* Hero Circular Score */}
      <div className="flex flex-col items-center justify-center mb-8">
        <div className="relative w-24 h-24 flex items-center justify-center drop-shadow-lg mb-3">
          <svg className="absolute w-full h-full transform -rotate-90">
            <circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="6" fill="none" className="text-white/5" />
            <motion.circle 
              initial={{ strokeDasharray: "0, 300" }}
              animate={{ strokeDasharray: `${(overall_action_score / 100) * 276.4}, 300` }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="6" fill="none" 
              className={ringColor} strokeLinecap="round"
            />
          </svg>
          <div className="text-3xl font-black text-white">{overall_action_score}</div>
        </div>
        <h3 className="text-sm font-bold text-slate-200 text-center max-w-md">"{headline}"</h3>
      </div>

      {/* 6 Metric Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Urgency */}
        <div className="glass-card p-4 border-l-2 border-l-red-500">
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 uppercase tracking-wider"><Target size={14}/> Urgency</div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 font-bold tracking-widest uppercase">{urgency.label}</span>
          </div>
          <ScoreBar score={urgency.score} color="bg-red-500" />
          <p className="text-[10px] text-slate-400 italic">"{urgency.reason}"</p>
        </div>

        {/* Financial Impact */}
        <div className="glass-card p-4 border-l-2 border-l-green-500">
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 uppercase tracking-wider">
              {financial_impact.direction === 'Negative' ? <TrendingDown size={14} className="text-red-400"/> : <TrendingUp size={14} className="text-green-400"/>} 
              Financial
            </div>
            <div className="flex gap-1">
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-slate-300 uppercase">{financial_impact.direction}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/20 text-green-300 uppercase">{financial_impact.magnitude}</span>
            </div>
          </div>
          <ScoreBar score={financial_impact.score} color="bg-green-500" />
          <p className="text-[10px] text-slate-400 italic">"{financial_impact.reason}"</p>
        </div>

        {/* Risk Level */}
        <div className="glass-card p-4 border-l-2 border-l-orange-500">
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 uppercase tracking-wider"><AlertTriangle size={14}/> Risk</div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-orange-300 uppercase">{risk_level.label}</span>
          </div>
          <ScoreBar score={risk_level.score} color="bg-orange-500" />
          <p className="text-[10px] text-slate-400 italic">[{risk_level.type}] "{risk_level.reason}"</p>
        </div>

        {/* Opportunity Score */}
        <div className="glass-card p-4 border-l-2 border-l-blue-500">
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 uppercase tracking-wider"><Lightbulb size={14}/> Opportunity</div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 uppercase">{opportunity_score.window}</span>
          </div>
          <ScoreBar score={opportunity_score.score} color="bg-blue-500" />
          <p className="text-[10px] text-slate-400 italic">"{opportunity_score.reason}"</p>
        </div>

        {/* Role Relevance */}
        <div className="glass-card p-4 border-l-2 border-l-purple-500">
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 uppercase tracking-wider"><Focus size={14}/> Relevance</div>
            {relevance_to_role.direct_impact && <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 uppercase">Direct Impact</span>}
          </div>
          <ScoreBar score={relevance_to_role.score} color="bg-purple-500" />
          <p className="text-[10px] text-slate-400 italic">"{relevance_to_role.reason}"</p>
        </div>

        {/* Time Sensitivity */}
        <div className="glass-card p-4 border-l-2 border-l-yellow-500">
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 uppercase tracking-wider"><Clock size={14}/> Timeline</div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-yellow-300 uppercase">{time_sensitivity.deadline}</span>
          </div>
          <ScoreBar score={time_sensitivity.score} color="bg-yellow-500" />
          <p className="text-[10px] text-slate-400 italic">"{time_sensitivity.reason}"</p>
        </div>
      </div>
    </div>
  );
}
