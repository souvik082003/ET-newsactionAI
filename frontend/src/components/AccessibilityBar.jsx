import { useAccessibility } from '../hooks/useAccessibility';
import { Volume2, VolumeX, Zap } from 'lucide-react';

export default function AccessibilityBar() {
  const a11y = useAccessibility();

  return (
    <div className="flex items-center gap-1.5" role="toolbar" aria-label="Accessibility options">
      <button
        onClick={a11y.toggleVoiceEnabled}
        className={`btn-ghost text-xs ${a11y.voiceEnabled ? 'active' : ''}`}
        aria-label={a11y.voiceEnabled ? 'Disable voice' : 'Enable voice'}
        aria-pressed={a11y.voiceEnabled}
      >
        {a11y.voiceEnabled ? <Volume2 size={14}/> : <VolumeX size={14}/>}
        <span className="hidden sm:inline">{a11y.voiceEnabled ? 'Voice on' : 'Voice off'}</span>
      </button>

      <button
        onClick={a11y.toggleReducedMotion}
        className={`btn-ghost text-xs ${a11y.reducedMotion ? 'active' : ''}`}
        aria-label="Toggle reduced motion"
        aria-pressed={a11y.reducedMotion}
      >
        <Zap size={14}/> <span className="hidden sm:inline">Reduce motion</span>
      </button>
    </div>
  );
}
