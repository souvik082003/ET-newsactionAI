import { useState, useEffect, useCallback } from 'react';

const KEYS = ['highContrast', 'largeText', 'reducedMotion', 'dyslexiaFont', 'voiceEnabled', 'focusHighlight'];
const CLASS_MAP = {
  highContrast: 'high-contrast',
  largeText: 'large-text',
  reducedMotion: 'reduced-motion',
  dyslexiaFont: 'dyslexia-font',
  focusHighlight: 'focus-highlight',
};

function loadState() {
  const state = {};
  KEYS.forEach(k => { state[k] = localStorage.getItem(`a11y_${k}`) === 'true'; });
  return state;
}

export function useAccessibility() {
  const [state, setState] = useState(loadState);

  // Apply classes on mount and state change
  useEffect(() => {
    Object.entries(CLASS_MAP).forEach(([key, cls]) => {
      document.documentElement.classList.toggle(cls, !!state[key]);
    });
  }, [state]);

  const toggle = useCallback((key) => {
    setState(prev => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem(`a11y_${key}`, String(next[key]));
      return next;
    });
  }, []);

  return {
    ...state,
    toggleHighContrast: () => toggle('highContrast'),
    toggleLargeText: () => toggle('largeText'),
    toggleReducedMotion: () => toggle('reducedMotion'),
    toggleDyslexiaFont: () => toggle('dyslexiaFont'),
    toggleVoiceEnabled: () => toggle('voiceEnabled'),
    toggleFocusHighlight: () => toggle('focusHighlight'),
  };
}
