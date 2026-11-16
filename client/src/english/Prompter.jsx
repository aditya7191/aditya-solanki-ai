import { useEffect, useMemo, useRef, useState } from 'react';
import { PASSAGES, textToPassage, tokens, followWords, readingScore } from './passages.js';
import { DIALOGUES } from './dialogues.js';
import { loadCustom } from './Conversation.jsx';
import * as P from './progress.js';
import { speak, stopSpeaking, follow, canListen, canSpeak } from './speech.js';
import { go, Top, Btn } from './ui.jsx';

const TKEY = 'englishSeekho.customTexts';
const loadTexts = () => { try { const a = JSON.parse(localStorage.getItem(TKEY) || '[]'); return Array.isArray(a) ? a : []; } catch { return []; } };
const saveText = t => { const id = 't' + Date.now().toString(36); try { localStorage.setItem(TKEY, JSON.stringify([{ ...t, id }, ...loadTexts()].slice(0, 10))); } catch {} return id; };
export function getSource(id) {
  const c = id.match(/^conv-(.+?)(?:-(A|B))?$/);
  if (c) {
    const d = DIALOGUES.find(x => x.id === c[1]) || loadCustom().find(x => x.id === c[1]); if (!d) return null;
    const role = c[2] || 'A';
    return { id, emoji: d.emoji, title: `${d.title} (${role === 'A' ? d.me : d.other} ki lines)`, sentences: d.lines.filter(l => l.who === role).map(l => ({ en: l.en, hi: l.hi })) };
  }
  return PASSAGES.find(p => p.id === id) || loadTexts().find(p => p.id === id) || null;
}
const SPEEDS = [['🐢 Slow', 60], ['🚶 Medium', 90], ['🏃 Fast', 120]];

export function PrompterList({ p }) {
  const [text, setText] = useState(''); const [topic, setTopic] = useState(''); const [busy, setBusy] = useState(false); const [err, setErr] = useState('');
  const mine = loadTexts();
  const useText = () => { const t = textToPassage(text); if (!t) return setErr('English mein kuch text likho ya paste karo.'); go(`/prompter/${saveText(t)}`); };
  async function ai() {
    const t = topic.trim(); if (t.length < 3 || busy) return; setBusy(true); setErr('');
    try {
      const r = await fetch('/api/english/passage', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ topic: t }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.passage) throw new Error(j.error || 'Passage nahi ban paya, dobara try karo.');
      go(`/prompter/${saveText(j.passage)}`);
    } catch (e) { setErr(/fetch/i.test(e.message) ? 'Internet check karo, phir dobara try karo.' : e.message); }
    finally { setBusy(false); }
  }
  const Row = ({ s }) => { const b = p.reads?.[s.id]; return <button onClick={() => go(`/prompter/${s.id}`)} className="w-full flex items-center gap-3 bg-white rounded-2xl p-3 text-left shadow-sm active:bg-sky-50">
    <span className="text-3xl">{s.emoji}</span><span className="flex-1 min-w-0"><span className="block font-semibold truncate">{s.title}</span><span className="block text-xs text-slate-500">{s.sentences.length} sentences</span></span>
    {b ? <span className="text-emerald-600 font-bold text-sm">✅{b.best != null ? ` ${b.best}%` : ''}</span> : <span className="text-slate-300 text-2xl">›</span>}</button>; };
  return (<>
    <Top title="📺 Teleprompter" />
    <div className="p-4 space-y-4">
      <div className="bg-slate-900 text-white rounded-3xl p-4">TV news-reader jaisa: bade akshar screen par khud aage badhte hain, jo word bolna hai woh <span className="bg-yellow-300 text-slate-900 px-1 rounded">peela</span> hota hai. 🎤 Mic on karoge toh highlight aapki awaaz ke saath chalega aur end mein score milega.</div>
      <section><h2 className="font-bold text-slate-700 mb-2">📰 Padhne ke passages</h2><div className="space-y-2">{PASSAGES.map(s => <Row key={s.id} s={s} />)}</div></section>
      <section className="bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-3xl p-4 text-white space-y-2">
        <div className="font-bold text-lg">✨ AI se passage banao</div>
        <div className="text-sm opacity-90">Koi bhi topic: "Ganpati festival", "samaj ka blood donation camp", "meri dukaan"</div>
        <form onSubmit={e => { e.preventDefault(); ai(); }} className="flex gap-2">
          <input value={topic} onChange={e => setTopic(e.target.value)} maxLength={200} placeholder="Topic likho..." className="flex-1 min-w-0 rounded-full px-4 py-3 text-slate-800 outline-none" />
          <button disabled={busy || topic.trim().length < 3} className="rounded-full bg-white text-violet-700 font-bold px-4 disabled:opacity-60">{busy ? '⏳' : 'Banao'}</button>
        </form>
        {busy && <div className="text-sm animate-pulse">🤖 AI passage likh raha hai... (10-40 second)</div>}
      </section>
      <section className="bg-white rounded-3xl p-4 shadow-sm space-y-2">
        <div className="font-bold text-lg">📝 Apna text daalo</div>
        <textarea value={text} onChange={e => setText(e.target.value)} rows={4} maxLength={3000} placeholder="English text yahan likho ya paste karo..." className="w-full rounded-2xl border border-slate-200 p-3 outline-none" />
        <Btn onClick={useText} disabled={!text.trim()} className="w-full bg-sky-600 text-white p-3">📺 Teleprompter mein padho</Btn>
      </section>
      {err && <div className="text-sm bg-red-50 text-red-700 rounded-xl p-2">⚠️ {err}</div>}
      {mine.length > 0 && <section><h2 className="font-bold text-slate-700 mb-2">🗂️ Aapke text / AI passages</h2><div className="space-y-2">{mine.map(s => <Row key={s.id} s={s} />)}</div></section>}
      <section><h2 className="font-bold text-slate-700 mb-2">🗣️ Conversation ki apni (Aditya) lines</h2><div className="space-y-2">{DIALOGUES.map(d => <Row key={d.id} s={getSource(`conv-${d.id}`)} />)}</div></section>
    </div>
  </>);
}

export function Prompter({ id, update }) {
  const src = useMemo(() => getSource(id), [id]);
  const words = useMemo(() => (src ? src.sentences.flatMap((s, si) => s.en.split(/\s+/).filter(Boolean).map(w => ({ w, si, t: tokens(w).join('') }))) : []), [src]);
  const target = useMemo(() => words.map(x => x.t), [words]);
  const [wpm, setWpm] = useState(() => +(localStorage.getItem('englishSeekho.wpm') || 70));
  const [font, setFont] = useState(() => +(localStorage.getItem('englishSeekho.font') || 34));
  const [showHi, setShowHi] = useState(true); const [mic, setMic] = useState(false);
  const [playing, setPlaying] = useState(false); const [idx, setIdx] = useState(0);
  const [matched, setMatched] = useState(() => new Set()); const [err, setErr] = useState(''); const [done, setDone] = useState(null);
  const wordRefs = useRef([]), ptr = useRef(0), sess = useRef(0), fol = useRef(null), usedMic = useRef(false), fin = useRef(false), matchedRef = useRef(new Set());
  useEffect(() => { localStorage.setItem('englishSeekho.wpm', wpm); localStorage.setItem('englishSeekho.font', font); }, [wpm, font]);
  useEffect(() => { wordRefs.current[idx]?.scrollIntoView({ block: 'center', behavior: 'smooth' }); }, [idx, font]);
  useEffect(() => () => { fol.current?.stop(); stopSpeaking(); }, []);

  // Bina mic: speed ke hisaab se auto aage
  useEffect(() => {
    if (!playing || mic || done) return;
    if (idx >= words.length) { finish(); return; }
    const w = words[idx].w, k = /[.!?]$/.test(w) ? 2.4 : /[,;:]$/.test(w) ? 1.5 : 1;
    const t = setTimeout(() => setIdx(i => i + 1), (60000 / wpm) * k);
    return () => clearTimeout(t);
  }, [playing, mic, idx, wpm, done]);

  function startMic() {
    setErr(''); usedMic.current = true; ptr.current = idx; sess.current = idx;
    fol.current = follow({
      onText: (t, isNew) => {
        if (isNew) sess.current = ptr.current;
        const r = followWords(target, sess.current, tokens(t), 4);
        if (r.matched.length) { const m = new Set(matchedRef.current); r.matched.forEach(j => m.add(j)); matchedRef.current = m; setMatched(m); }
        if (r.pointer > ptr.current) { ptr.current = r.pointer; setIdx(r.pointer); if (r.pointer >= target.length) finish(); }
      },
      onError: m => { setErr(m); setMic(false); setPlaying(false); },
    });
  }
  function play() {
    if (done) return;
    if (idx >= words.length) restart();
    setPlaying(true); if (mic) startMic();
  }
  function pause() { setPlaying(false); fol.current?.stop(); fol.current = null; stopSpeaking(); }
  function restart() { pause(); setIdx(0); ptr.current = 0; matchedRef.current = new Set(); setMatched(new Set()); usedMic.current = false; fin.current = false; setDone(null); }
  function toggleMic() { const on = !mic; if (playing) pause(); setMic(on); }
  function jump(d) { const si = words[Math.min(idx, words.length - 1)]?.si ?? 0; const ns = Math.max(0, Math.min(src.sentences.length - 1, si + d)); const ni = words.findIndex(w => w.si === ns); pause(); setIdx(ni); ptr.current = ni; }
  function finish() {
    if (fin.current) return; fin.current = true;
    fol.current?.stop(); fol.current = null; setPlaying(false);
    const pct = usedMic.current ? readingScore(target.filter(Boolean).length, new Set([...matchedRef.current].filter(j => target[j]))) : null;
    const missed = usedMic.current ? [...new Set(words.filter((w, j) => w.t && !matchedRef.current.has(j)).map(w => w.w.replace(/[^\w']/g, '')))].slice(0, 25) : [];
    setDone({ pct, missed, xp: P.readingXp(pct) });
    update(o => P.completeReading(o, id, pct));
  }
  const listenSentence = () => { const si = words[Math.min(idx, words.length - 1)]?.si ?? 0; pause(); speak(src.sentences[si].en, { slow: wpm < 75 }); };

  if (!src) return <><Top title="Text nahi mila" to="/prompter" /><div className="p-4">Yeh text is phone mein nahi hai. <button className="underline" onClick={() => go('/prompter')}>Teleprompter list</button></div></>;
  if (done) return (<>
    <Top title={`🏁 ${src.title}`} to="/prompter" />
    <div className="p-4 space-y-4">
      <div className="bg-white rounded-3xl p-5 shadow-sm text-center">
        <div className="text-6xl">{done.pct == null ? '📺' : done.pct >= 80 ? '🏆' : done.pct >= 50 ? '🎉' : '💪'}</div>
        <div className="text-2xl font-bold mt-1">{done.pct == null ? 'Poora padh liya!' : `Score: ${done.pct}%`}</div>
        <div className="text-lg">+{done.xp} XP ⭐</div>
        <div className="text-sm text-slate-600 mt-1">{done.pct == null ? 'Agli baar 🎤 Mic on karke padho, score milega.' : done.pct >= 80 ? 'Ekdum news reader jaisa! 👏' : 'Achha kiya! Neeche wale words dhyan se bolo.'}</div>
      </div>
      {done.missed.length > 0 && <div className="bg-white rounded-3xl p-4 shadow-sm"><div className="font-bold mb-2">😅 Yeh words mic ne nahi pakde</div>
        <div className="flex flex-wrap gap-2">{done.missed.map(w => <button key={w} onClick={() => speak(w, { slow: true })} className="bg-red-50 text-red-700 rounded-full px-3 py-1">🔊 {w}</button>)}</div></div>}
      <Btn onClick={restart} className="w-full bg-slate-900 text-white p-4 text-lg">🔁 Phir se padho</Btn>
      <Btn onClick={() => go('/prompter')} className="w-full bg-white border p-3">📋 Doosra text</Btn>
    </div>
  </>);

  const cur = words[Math.min(idx, words.length - 1)]; const curSent = src.sentences[cur?.si ?? 0];
  return (<div className="flex flex-col h-[100dvh] bg-black">
    <Top title={`📺 ${src.title}`} to="/prompter" />
    <div className="bg-slate-900 text-white px-3 py-2 space-y-2 text-sm">
      <div className="flex gap-2 items-center">
        {SPEEDS.map(([l, v]) => <button key={v} onClick={() => setWpm(v)} className={`rounded-full px-2 py-1 ${wpm === v ? 'bg-yellow-400 text-slate-900 font-bold' : 'bg-slate-700'}`}>{l}</button>)}
        <span className="ml-auto text-xs opacity-80">{wpm} words/min</span>
      </div>
      <input type="range" min="40" max="180" step="5" value={wpm} onChange={e => setWpm(+e.target.value)} className="w-full accent-yellow-400" aria-label="Speed" disabled={mic} />
      <div className="flex gap-2 items-center">
        <button onClick={() => setFont(f => Math.max(22, f - 4))} className="rounded-full bg-slate-700 px-3 py-1">A−</button>
        <button onClick={() => setFont(f => Math.min(64, f + 4))} className="rounded-full bg-slate-700 px-3 py-1 text-base">A+</button>
        <button onClick={() => setShowHi(!showHi)} className={`rounded-full px-3 py-1 ${showHi ? 'bg-sky-500' : 'bg-slate-700'}`}>👉 Hindi {showHi ? 'ON' : 'OFF'}</button>
        {canListen() && <button onClick={toggleMic} className={`rounded-full px-3 py-1 ml-auto ${mic ? 'bg-red-500 font-bold' : 'bg-slate-700'}`}>🎤 Mic {mic ? 'ON' : 'OFF'}</button>}
      </div>
      {mic && <div className="text-xs text-yellow-200">🎤 Mic on: highlight aapki awaaz ke saath aage badhega. Play dabao aur padhna shuru karo.</div>}
      {err && <div className="text-xs text-red-300">⚠️ {err}</div>}
    </div>
    <main className="flex-1 overflow-y-auto px-5 py-[35vh] text-white font-semibold leading-snug" style={{ fontSize: font }}>
      {src.sentences.map((s, si) => <p key={si} className="mb-[0.6em]">{words.map((w, j) => w.si !== si ? null : (
        <span key={j} ref={el => (wordRefs.current[j] = el)} onClick={() => { pause(); setIdx(j); ptr.current = j; }}
          className={`rounded px-[0.1em] transition-colors ${j === idx ? 'bg-yellow-300 text-black' : j < idx ? (mic || usedMic.current ? (matched.has(j) ? 'text-emerald-400' : 'text-slate-500') : 'text-slate-500') : ''}`}>{w.w} </span>))}</p>)}
    </main>
    {showHi && curSent?.hi && <div className="bg-slate-800 text-sky-200 px-4 py-2 text-base">👉 {curSent.hi}</div>}
    <div className="bg-slate-900 p-3 flex gap-2 items-center">
      <button onClick={() => jump(-1)} className="w-12 h-12 rounded-full bg-slate-700 text-white text-xl" aria-label="Pichhla">⏮</button>
      <button onClick={playing ? pause : play} className={`flex-1 h-14 rounded-full text-xl font-bold ${playing ? 'bg-amber-400 text-black' : 'bg-emerald-500 text-white'}`}>{playing ? '⏸ Pause' : idx > 0 ? '▶️ Aage padho' : '▶️ Play'}</button>
      <button onClick={() => jump(1)} className="w-12 h-12 rounded-full bg-slate-700 text-white text-xl" aria-label="Agla">⏭</button>
      {canSpeak() && <button onClick={listenSentence} className="w-12 h-12 rounded-full bg-sky-600 text-white text-xl" aria-label="Suno">🔊</button>}
      <button onClick={finish} className="w-12 h-12 rounded-full bg-rose-600 text-white text-sm font-bold" aria-label="Khatam">🏁</button>
    </div>
  </div>);
}
