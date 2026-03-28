import { useState, useCallback, useRef, useEffect } from 'react';

export function useVoice() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState({ tts: false, stt: false });
  const recognitionRef = useRef(null);

  useEffect(() => {
    setIsSupported({
      tts: 'speechSynthesis' in window,
      stt: !!(window.SpeechRecognition || window.webkitSpeechRecognition),
    });
    // Load voices
    if ('speechSynthesis' in window) window.speechSynthesis.getVoices();
  }, []);

  const speak = useCallback((text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const clean = text.replace(/[*_#`~>]/g, '').replace(/\n{2,}/g, '. ').replace(/\n/g, '. ').replace(/- /g, '').trim();
    const utter = new SpeechSynthesisUtterance(clean);
    utter.rate = 0.9; utter.pitch = 1.0; utter.volume = 1; utter.lang = 'en-IN';
    const voices = window.speechSynthesis.getVoices();
    const pref = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google')) || voices.find(v => v.lang.startsWith('en'));
    if (pref) utter.voice = pref;
    utter.onstart = () => setIsSpeaking(true);
    utter.onend = () => setIsSpeaking(false);
    utter.onerror = () => setIsSpeaking(false);
    // Chrome long-text workaround
    const keepAlive = setInterval(() => {
      if (window.speechSynthesis.speaking) { window.speechSynthesis.pause(); window.speechSynthesis.resume(); }
      else clearInterval(keepAlive);
    }, 10000);
    utter.onend = () => { clearInterval(keepAlive); setIsSpeaking(false); };
    window.speechSynthesis.speak(utter);
  }, []);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis?.cancel(); setIsSpeaking(false);
  }, []);

  const startListening = useCallback((onResult) => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert('Speech recognition not supported. Try Chrome.'); return; }
    if (recognitionRef.current) try { recognitionRef.current.abort(); } catch(e) {}
    const rec = new SR();
    rec.continuous = false; rec.interimResults = true; rec.lang = 'en-IN'; rec.maxAlternatives = 1;
    rec.onstart = () => setIsListening(true);
    rec.onresult = (e) => {
      let final = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript;
      }
      if (final && onResult) onResult(final);
    };
    rec.onerror = (e) => { if (e.error === 'not-allowed') alert('Microphone access denied.'); setIsListening(false); };
    rec.onend = () => setIsListening(false);
    recognitionRef.current = rec;
    try { rec.start(); } catch(e) { setIsListening(false); }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) try { recognitionRef.current.stop(); } catch(e) {}
    setIsListening(false);
  }, []);

  return { speak, stopSpeaking, isSpeaking, startListening, stopListening, isListening, isSupported };
}
