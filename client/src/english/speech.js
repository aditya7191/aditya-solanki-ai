// Browser ki free awaaz: speechSynthesis (sunna) + SpeechRecognition (bolna). Koi API key nahi.
export const canSpeak = () => typeof window !== 'undefined' && 'speechSynthesis' in window;
export const SR = () => (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)) || null;
export const canListen = () => !!SR();

const enVoices = () => (window.speechSynthesis.getVoices() || []).filter(v => /^en/i.test(v.lang));
function pickVoice(other = false) {
  const vs = enVoices();
  const main = vs.find(v => v.lang === 'en-IN') || vs.find(v => /en[-_]IN/i.test(v.lang)) || vs.find(v => v.lang === 'en-US') || vs[0] || null;
  if (!other) return main;
  // doosre character ke liye alag awaaz (agar phone mein ho)
  return vs.find(v => v !== main && /en[-_]IN/i.test(v.lang)) || vs.find(v => v !== main && /en[-_](GB|US|AU)/i.test(v.lang)) || main;
}
if (canSpeak()) { window.speechSynthesis.getVoices(); window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices(); }

let active = null;
// onWord(i): i-th word bola ja raha hai (karaoke). Boundary event na aaye toh timer se andaza.
export function speak(text, { slow = false, onEnd, onWord, other = false } = {}) {
  if (!canSpeak()) { onEnd?.(); return; }
  const s = window.speechSynthesis; active?.(); s.cancel();
  const clean = String(text).replace(/[*_#`]/g, '');
  const u = new SpeechSynthesisUtterance(clean);
  const v = pickVoice(other); if (v) u.voice = v; u.lang = v?.lang || 'en-IN';
  u.rate = slow ? 0.65 : 0.85; u.pitch = other ? 1.25 : 1;
  const starts = [...clean.matchAll(/\S+/g)].map(m => m.index);
  let timer, gotBoundary = false, ended = false;
  const finish = () => { if (ended) return; ended = true; clearInterval(timer); onWord?.(-1); onEnd?.(); };
  if (onWord) {
    u.onboundary = e => { if (e.name && e.name !== 'word') return; gotBoundary = true; clearInterval(timer); let i = 0; while (i + 1 < starts.length && starts[i + 1] <= e.charIndex) i++; onWord(i); };
    u.onstart = () => { onWord(0); let i = 0; const per = 60000 / (150 * u.rate); timer = setInterval(() => { if (gotBoundary) return clearInterval(timer); if (++i < starts.length) onWord(i); else clearInterval(timer); }, per); };
  }
  u.onend = finish; u.onerror = finish;
  // naya speak() purane ko chup karata hai, purane ka onEnd nahi chalta
  active = () => { ended = true; clearInterval(timer); onWord?.(-1); };
  s.speak(u);
  return () => { ended = true; clearInterval(timer); s.cancel(); };
}
export const stopSpeaking = () => { try { active?.(); active = null; window.speechSynthesis?.cancel(); } catch {} };

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

// Teleprompter ke liye: lagatar sunta hai (interim bhi). onText(fullSessionTranscript, isNewSession)
// Chrome thodi chuppi par band kar deta hai -> jab tak stop() nahi, khud restart.
export function follow({ onText, onError }) {
  const C = SR(); if (!C) { onError?.('Is browser mein mic follow nahi chalta. Android par Google Chrome use karo.'); return { stop() {} }; }
  let on = true, rec, fails = 0;
  const startOne = () => {
    rec = new C(); rec.lang = 'en-IN'; rec.interimResults = true; rec.continuous = true; rec.maxAlternatives = 1;
    let first = true;
    rec.onresult = e => { fails = 0; let t = ''; for (let i = 0; i < e.results.length; i++) t += ' ' + e.results[i][0].transcript; onText?.(t, first); first = false; };
    rec.onerror = e => { if (e.error === 'not-allowed' || e.error === 'service-not-allowed') { on = false; onError?.('Mic ki permission do: address bar ke 🔒 par tap karke Microphone "Allow" karo.'); } else if (e.error === 'network') { fails++; } };
    rec.onend = () => { if (on && fails < 5) setTimeout(() => on && startOne(), 250); };
    try { rec.start(); } catch { on = false; onError?.('Mic shuru nahi hua, dobara dabao.'); }
  };
  startOne();
  return { stop() { on = false; try { rec?.stop(); } catch {} } };
}
