import { motion } from 'framer-motion';

const ROLES = [
  { value: 'student', icon: '🎓', label: 'Student' },
  { value: 'investor', icon: '💼', label: 'Investor' },
  { value: 'job_seeker', icon: '🔍', label: 'Job Seeker' },
  { value: 'business_owner', icon: '🏪', label: 'Business Owner' },
  { value: 'general_reader', icon: '👤', label: 'General Reader' },
];

export default function RoleSelector({ selectedRole, onRoleChange }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-widest text-orange-300/60 mb-2">
        Select Your Role
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2" role="radiogroup" aria-label="Select your role">
        {ROLES.map((r, i) => (
          <motion.button
            key={r.value}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => onRoleChange(r.value)}
            className={`role-card ${selectedRole === r.value ? 'selected' : ''}`}
            role="radio"
            aria-checked={selectedRole === r.value}
            aria-label={`Select role: ${r.label}`}
          >
            <span className="text-xl block">{r.icon}</span>
            <span className="text-xs font-medium text-slate-300 mt-1 block">{r.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
