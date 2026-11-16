// Browser ki free awaaz: speechSynthesis (sunna) + SpeechRecognition (bolna). Koi API key nahi.
export const canSpeak = () => typeof window !== 'undefined' && 'speechSynthesis' in window;
export const SR = () => (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)) || null;
export const canListen = () => !!SR();

function pickVoice() {
  const vs = window.speechSynthesis.getVoices() || [];
  return vs.find(v => v.lang === 'en-IN') || vs.find(v => /en[-_]IN/i.test(v.lang)) || vs.find(v => v.lang === 'en-US') || vs.find(v => /^en/i.test(v.lang)) || null;
}
if (canSpeak()) { window.speechSynthesis.getVoices(); window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices(); }

export function speak(text, { slow = false, onEnd } = {}) {
  if (!canSpeak()) { alert('Is phone/browser mein awaaz wala feature nahi hai. Chrome browser use karo.'); return; }
  const s = window.speechSynthesis; s.cancel();
  const u = new SpeechSynthesisUtterance(String(text).replace(/[*_#`]/g, ''));
  const v = pickVoice(); if (v) u.voice = v; u.lang = v?.lang || 'en-IN';
  u.rate = slow ? 0.65 : 0.85; u.onend = onEnd || null; u.onerror = onEnd || null;
  s.speak(u);
}

// Ek baar sunta hai; onResult(alternatives[]) ya onError(message)
export function listen({ onResult, onError, onEnd }) {
  const C = SR();
  if (!C) { onError?.('Is browser mein mic se English check nahi hota 😔 Android par Google Chrome mein kholo.'); onEnd?.(); return null; }
  const rec = new C(); rec.lang = 'en-IN'; rec.interimResults = false; rec.maxAlternatives = 3; rec.continuous = false;
  let got = false;
  rec.onresult = e => { got = true; const r = e.results[0]; onResult?.(Array.from({ length: r.length }, (_, i) => r[i].transcript)); };
  rec.onerror = e => (got = true) && onError?.(e.error === 'not-allowed' || e.error === 'service-not-allowed' ? 'Mic ki permission do: address bar ke 🔒 par tap karke Microphone "Allow" karo.'
    : e.error === 'no-speech' ? 'Kuch sunai nahi diya 🙉 Mic ke paas thoda zor se bolo.' : e.error === 'network' ? 'Internet chahiye mic check ke liye.' : 'Mic mein dikkat aayi, dobara try karo.');
  rec.onend = () => { if (!got) onResult?.([]); onEnd?.(); };
  try { rec.start(); } catch { onError?.('Mic shuru nahi hua, dobara dabao.'); onEnd?.(); }
  return rec;
}

// AI teacher ke jawab se sirf English hissa bolne ke liye
export function englishOnly(text) {
  return String(text).split('\n').filter(l => !/^\s*(❌|💡)/.test(l))
    .map(l => l.replace(/^\s*✅\s*\**Sahi hai:?\**:?/i, '').replace(/^\s*🗣️\s*\**English mein:?\**:?/i, ''))
    .join('. ').replace(/\([^)]*\)/g, '').replace(/[*_#`]/g, '').replace(/\p{Extended_Pictographic}/gu, '').replace(/(\.\s*){2,}/g, '. ').trim();
}
