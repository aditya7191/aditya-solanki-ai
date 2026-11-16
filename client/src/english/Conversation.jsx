import { useEffect, useRef, useState } from 'react';
import { DIALOGUES } from './dialogues.js';
import { scoreSpeech, normalize } from './lessons.js';
import * as P from './progress.js';
import { speak, stopSpeaking, listen, canListen, canSpeak } from './speech.js';
import { go, Top, Btn } from './ui.jsx';

const CKEY = 'englishSeekho.customConvs';
export const loadCustom = () => { try { const a = JSON.parse(localStorage.getItem(CKEY) || '[]'); return Array.isArray(a) ? a : []; } catch { return []; } };
const saveCustom = d => { const id = 'c' + Date.now().toString(36); const list = [{ ...d, id }, ...loadCustom()].slice(0, 10); try { localStorage.setItem(CKEY, JSON.stringify(list)); } catch {} return id; };
const getDialogue = id => DIALOGUES.find(d => d.id === id) || loadCustom().find(d => d.id === id) || null;
const nameOf = (d, who) => (who === 'A' ? d.me : d.other);

export function ConvList({ p }) {
  const [sit, setSit] = useState(''); const [busy, setBusy] = useState(false); const [err, setErr] = useState('');
  const custom = loadCustom();
  const [featured, ...rest] = DIALOGUES;
  async function create() {
    const s = sit.trim(); if (s.length < 3 || busy) return;
    setBusy(true); setErr('');
    try {
      const r = await fetch('/api/english/dialogue', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ situation: s }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.dialogue) throw new Error(j.error || 'Conversation nahi ban payi, dobara try karo.');
      go(`/baat/${saveCustom(j.dialogue)}`);
    } catch (e) { setErr(/fetch/i.test(e.message) ? 'Internet check karo, phir dobara try karo.' : e.message); }
    finally { setBusy(false); }
  }
  const Card = ({ d, big }) => { const b = p.convs?.[d.id]; return (
    <button onClick={() => go(`/baat/${d.id}`)} className={`w-full flex items-center gap-3 bg-white rounded-2xl text-left shadow-sm active:bg-rose-50 ${big ? 'p-4 ring-2 ring-rose-400' : 'p-3'}`}>
      <span className={big ? 'text-5xl' : 'text-3xl'}>{d.emoji}</span>
      <span className="flex-1 min-w-0"><span className={`block font-semibold ${big ? 'text-xl' : ''}`}>{d.title}</span>
        <span className="block text-xs text-slate-500">Aditya & {d.other} · {d.lines.length} lines{big ? ' · ⭐ Sabse pehle yeh karo' : ''}</span></span>
      {b ? <span className="text-emerald-600 font-bold text-sm">✅{b.best != null ? ` ${b.best}%` : ''}</span> : <span className="text-slate-300 text-2xl">›</span>}
    </button>); };
  return (<>
    <Top title="🗣️ Bolke Practice" />
    <div className="p-4 space-y-4">
      <div className="bg-white rounded-3xl p-4 shadow-sm text-slate-700">
        Conversation chalegi jaise asli life mein. <b>Doosre ki line app khud bolega 🔊</b>, aur jab <b>aapki (Aditya ki) baari</b> aaye toh line badi dikhegi: padho aur 🎤 se bolo, app score dega.
      </div>
      <Card d={featured} big />
      <section className="bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-3xl p-4 text-white space-y-2">
        <div className="font-bold text-lg">✨ Nayi conversation banao</div>
        <div className="text-sm opacity-90">Koi bhi situation likho, AI conversation bana dega. Jaise: "salon mein baal katwana", "gas cylinder book karna"</div>
        <form onSubmit={e => { e.preventDefault(); create(); }} className="flex gap-2">
          <input value={sit} onChange={e => setSit(e.target.value)} maxLength={200} placeholder="Situation likho..." className="flex-1 min-w-0 rounded-full px-4 py-3 text-slate-800 outline-none" />
          <button disabled={busy || sit.trim().length < 3} className="rounded-full bg-white text-violet-700 font-bold px-4 disabled:opacity-60">{busy ? '⏳' : 'Banao'}</button>
        </form>
        {busy && <div className="text-sm animate-pulse">🤖 AI conversation likh raha hai... (10-40 second)</div>}
        {err && <div className="text-sm bg-white/90 text-red-700 rounded-xl p-2">⚠️ {err}</div>}
      </section>
      {custom.length > 0 && <section><h2 className="font-bold text-slate-700 mb-2">✨ Aapki banayi conversations</h2><div className="space-y-2">{custom.map(d => <Card key={d.id} d={d} />)}</div></section>}
      <section><h2 className="font-bold text-slate-700 mb-2">📋 Sab conversations</h2><div className="space-y-2">{rest.map(d => <Card key={d.id} d={d} />)}</div></section>
    </div>
  </>);
}

// Line ke words, karaoke highlight aur missed words laal
function Words({ text, active = -1, missed }) {
  const toks = text.split(/(\s+)/); let wi = -1;
  return <>{toks.map((t, i) => {
    if (/^\s+$/.test(t)) return t;
    wi++; const miss = missed && missed.has(normalize(t).replace(/\s/g, ''));
    return <span key={i} className={`rounded px-0.5 transition-colors ${wi === active ? 'bg-yellow-300 text-slate-900' : miss ? 'text-red-600 underline decoration-wavy' : ''}`}>{t}</span>;
  })}</>;
}

const MODES = [['mic', '🎤 Bolke', 'Aap bolo, app score dega'], ['auto', '🤖 Auto', 'Mic khud chalega, sahi bola toh aage'], ['read', '📖 Sirf padho', 'Bina mic, zor se padho']];

export function ConvPlay({ id, update }) {
  const d = getDialogue(id);
  const [role, setRole] = useState('A');
  const [mode, setMode] = useState(canListen() ? 'mic' : 'read');
  const [slow, setSlow] = useState(false); const [karaoke, setKaraoke] = useState(true);
  const [phase, setPhase] = useState('setup');
  const [idx, setIdx] = useState(0); const [scores, setScores] = useState([]);
  const [att, setAtt] = useState(null); const [mic, setMic] = useState(false); const [word, setWord] = useState({ i: -1, w: -1 });
  const [result, setResult] = useState(null);
  const tok = useRef(0), timers = useRef([]), rec = useRef(null), end = useRef(), scoresRef = useRef([]);
  const later = (f, ms) => { const t = tok.current; timers.current.push(setTimeout(() => t === tok.current && f(), ms)); };
  const stopAll = () => { tok.current++; timers.current.forEach(clearTimeout); timers.current = []; stopSpeaking(); try { rec.current?.abort(); } catch {} rec.current = null; setMic(false); setWord({ i: -1, w: -1 }); };
  useEffect(() => () => stopAll(), []);
  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [idx, att, phase]);

  const say = (i, opts = {}) => { const t = tok.current; speak(d.lines[i].en, { slow, other: d.lines[i].who !== role, onWord: karaoke ? w => t === tok.current && setWord({ i, w }) : undefined, onEnd: () => t === tok.current && opts.onEnd?.() }); };
  const setScore = (i, v) => { const s = [...scoresRef.current]; s[i] = v; scoresRef.current = s; setScores(s); };

  // Har line par: doosre ki line khud bolo; apni line par (auto mode) mic chalao
  useEffect(() => {
    if (phase !== 'play' || !d) return;
    if (idx >= d.lines.length) { finish(); return; }
    setAtt(null);
    const line = d.lines[idx];
    if (line.who !== role) {
      if (canSpeak()) {
        say(idx, { onEnd: () => later(() => setIdx(i => i + 1), 450) });
        // awaaz atak jaye (voice na ho) toh bhi conversation aage badhe
        later(() => setIdx(i => i + 1), (2500 + line.en.split(' ').length * 650) * (slow ? 1.6 : 1));
      }
      else later(() => setIdx(i => i + 1), 1500 + line.en.length * 40);
    } else if (mode === 'auto' && canListen()) later(startListen, 700);
    return () => { tok.current++; timers.current.forEach(clearTimeout); timers.current = []; stopSpeaking(); try { rec.current?.abort(); } catch {} setMic(false); };
  }, [phase, idx]);

  function startListen() {
    stopSpeaking(); setAtt(null); setMic(true);
    const t = tok.current, i = idx, target = d.lines[i].en;
    rec.current = listen({
      onResult: alts => {
        if (t !== tok.current) return;
        const best = alts.map(a => ({ said: a, ...scoreSpeech(target, a) })).sort((a, b) => b.score - a.score)[0] || { said: '', ...scoreSpeech(target, '') };
        setAtt(best); setScore(i, Math.max(scoresRef.current[i] ?? 0, best.score));
        if (mode === 'auto' && best.score >= 60) later(next, 1400);
      },
      onError: msg => t === tok.current && setAtt({ error: msg }),
      onEnd: () => t === tok.current && setMic(false),
    });
  }
  function next() { if (scoresRef.current[idx] === undefined) setScore(idx, mode === 'read' ? null : 0); setIdx(i => i + 1); }
  function start(r = role) { stopAll(); setRole(r); scoresRef.current = []; setScores([]); setIdx(0); setResult(null); setPhase('play'); }
  function finish() {
    const mine = d.lines.map((l, i) => (l.who === role ? scoresRef.current[i] ?? (mode === 'read' ? null : 0) : undefined)).filter(x => x !== undefined);
    const r = P.conversationResult(mine); setResult(r); setPhase('end');
    update(o => P.completeConversation(o, d.id, mine));
  }

  if (!d) return <><Top title="Conversation nahi mili" to="/baat" /><div className="p-4">Yeh conversation is phone mein nahi hai. <button className="underline" onClick={() => go('/baat')}>Sab conversations</button></div></>;
  const meName = nameOf(d, role), otherName = nameOf(d, role === 'A' ? 'B' : 'A');

  if (phase === 'setup') return (<>
    <Top title={`${d.emoji} ${d.title}`} to="/baat" />
    <div className="p-4 space-y-4">
      <div className="bg-white rounded-3xl p-4 shadow-sm">
        <div className="text-slate-600 text-sm">Is conversation mein</div>
        <div className="text-xl font-bold">🙋 Aap: {meName} · 🧑 App: {otherName}</div>
        <Btn onClick={() => setRole(role === 'A' ? 'B' : 'A')} className="mt-3 w-full bg-amber-100 text-amber-900 p-3">🔄 Role badlo (aap {otherName} bano)</Btn>
      </div>
      <div className="bg-white rounded-3xl p-4 shadow-sm space-y-2">
        <div className="font-bold">Kaise practice karna hai?</div>
        {MODES.map(([k, lab, sub]) => { const off = k !== 'read' && !canListen(); return (
          <button key={k} disabled={off} onClick={() => setMode(k)} className={`w-full text-left p-3 rounded-2xl border-2 ${mode === k ? 'border-rose-500 bg-rose-50' : 'border-slate-100'} disabled:opacity-40`}>
            <div className="font-semibold text-lg">{lab}</div><div className="text-sm text-slate-500">{off ? 'Is browser mein mic nahi chalta (Chrome use karo)' : sub}</div></button>); })}
        <div className="flex gap-2 pt-1">
          <button onClick={() => setSlow(!slow)} className={`flex-1 rounded-full py-2 font-semibold ${slow ? 'bg-sky-600 text-white' : 'bg-sky-100 text-sky-800'}`}>🐢 Dheere awaaz {slow ? 'ON' : 'OFF'}</button>
          <button onClick={() => setKaraoke(!karaoke)} className={`flex-1 rounded-full py-2 font-semibold ${karaoke ? 'bg-yellow-400 text-slate-900' : 'bg-yellow-100 text-yellow-800'}`}>✨ Karaoke {karaoke ? 'ON' : 'OFF'}</button>
        </div>
      </div>
      {!canSpeak() && <div className="text-sm bg-amber-100 rounded-xl p-3">ℹ️ Is browser mein awaaz nahi hai, toh {otherName} ki line sirf dikhegi.</div>}
      <Btn onClick={() => start()} className="w-full bg-rose-600 text-white p-4 text-xl shadow">▶️ Shuru karo</Btn>
      <Btn onClick={() => go(`/prompter/conv-${d.id}-${role}`)} className="w-full bg-slate-900 text-white p-3">📺 Teleprompter mein padho (sirf {meName} ki lines)</Btn>
      <details className="bg-white rounded-2xl p-3 shadow-sm"><summary className="font-semibold">📜 Poori conversation pehle padh lo</summary>
        <div className="mt-2 space-y-2 text-sm">{d.lines.map((l, i) => <div key={i}><b>{nameOf(d, l.who)}:</b> {l.en} <span className="text-slate-500">({l.hi})</span></div>)}</div></details>
    </div>
  </>);

  if (phase === 'end') {
    const mineIdx = d.lines.map((l, i) => i).filter(i => d.lines[i].who === role);
    return (<>
      <Top title={`🏁 ${d.title}`} to="/baat" />
      <div className="p-4 space-y-4">
        <div className="bg-white rounded-3xl p-5 shadow-sm text-center">
          <div className="text-6xl">{result.pct == null ? '📖' : result.pct >= 80 ? '🏆' : result.pct >= 50 ? '🎉' : '💪'}</div>
          <div className="text-2xl font-bold mt-1">{result.pct == null ? 'Conversation poori padh li!' : `Overall: ${result.pct}%`}</div>
          <div className="text-lg">+{result.xp} XP ⭐</div>
          <div className="text-slate-600 text-sm mt-1">{result.pct == null ? 'Ab 🎤 Bolke mode mein karke score dekho.' : result.pct >= 80 ? 'Shaandaar, ekdum asli conversation jaisa! 👏' : 'Achha kiya! Laal wale lines phir se practice karo.'}</div>
        </div>
        <div className="bg-white rounded-3xl p-4 shadow-sm space-y-2">
          <div className="font-bold">Aapki lines ({meName})</div>
          {mineIdx.map(i => { const s = scores[i]; return <div key={i} className="flex items-start gap-2 border-b last:border-0 pb-2">
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-sm font-bold ${s == null ? 'bg-slate-100 text-slate-600' : s >= 70 ? 'bg-emerald-100 text-emerald-700' : s >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>{s == null ? '📖' : `${s}%`}</span>
            <span>{d.lines[i].en}</span></div>; })}
        </div>
        <Btn onClick={() => start()} className="w-full bg-rose-600 text-white p-4 text-lg">🔁 Phir se karo</Btn>
        <Btn onClick={() => start(role === 'A' ? 'B' : 'A')} className="w-full bg-amber-100 text-amber-900 p-3">🔄 Role badlo: ab aap {otherName} bano</Btn>
        <Btn onClick={() => setPhase('setup')} className="w-full bg-white border p-3">⚙️ Mode badlo (Bolke / Auto / Sirf padho)</Btn>
        <Btn onClick={() => go('/baat')} className="w-full bg-white border p-3">📋 Doosri conversation</Btn>
      </div>
    </>);
  }

  const cur = d.lines[idx], myTurn = cur && cur.who === role;
  const shown = d.lines.slice(0, myTurn ? idx : idx + 1);
  const missed = att && !att.error ? new Set(att.missing) : null;
  return (<div className="flex flex-col h-[100dvh]">
    <Top title={`${d.emoji} ${d.title}`} to="/baat" />
    <div className="flex items-center gap-2 px-3 py-2 bg-white border-b text-sm">
      <span className="flex-1 text-slate-600">Line {Math.min(idx + 1, d.lines.length)}/{d.lines.length} · Aap: <b>{meName}</b></span>
      <button onClick={() => setSlow(!slow)} className={`rounded-full px-2 py-1 ${slow ? 'bg-sky-600 text-white' : 'bg-sky-100'}`}>🐢</button>
      <button onClick={() => setKaraoke(!karaoke)} className={`rounded-full px-2 py-1 ${karaoke ? 'bg-yellow-400' : 'bg-yellow-100'}`}>✨</button>
      <button onClick={() => { stopAll(); setPhase('setup'); }} className="rounded-full px-2 py-1 bg-slate-100">⏹️</button>
    </div>
    <div className="h-1.5 bg-amber-200"><div className="h-1.5 bg-rose-500 transition-all" style={{ width: `${(idx / d.lines.length) * 100}%` }} /></div>
    <main className="flex-1 overflow-y-auto p-3 space-y-3">
      {shown.map((l, i) => { const mine = l.who === role, live = i === idx; const s = scores[i]; return (
        <div key={i} className={`flex ${mine ? 'justify-end' : 'gap-2'}`}>
          {!mine && <div className="w-9 h-9 shrink-0 rounded-full bg-slate-700 text-white grid place-items-center text-sm">{otherName[0]}</div>}
          <div className={`max-w-[85%] rounded-2xl p-3 shadow-sm ${mine ? 'bg-rose-100 rounded-tr-sm' : 'bg-white rounded-tl-sm'} ${live ? 'ring-2 ring-sky-400' : ''}`}>
            <div className="text-[11px] font-semibold text-slate-500">{nameOf(d, l.who)}{live && !mine ? ' · 🔊 bol raha hai...' : ''}{mine && s != null ? ` · ${s}%` : ''}</div>
            <div className="text-lg font-semibold leading-snug"><Words text={l.en} active={word.i === i ? word.w : -1} /></div>
            <div className="text-sm text-sky-700">🗣️ {l.say}</div>
            <div className="text-sm text-slate-600">👉 {l.hi}</div>
            {!live && myTurn && <button onClick={() => say(i)} className="text-xs text-sky-700 mt-1">🔊 Phir suno</button>}
          </div>
        </div>); })}
      {!myTurn && cur && !canSpeak() && <div className="text-center text-sm text-slate-500">⏳ Aage badh raha hai...</div>}
      <div ref={end} />
    </main>
    {myTurn && <div className="border-t-4 border-rose-400 bg-white p-4 space-y-3 rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
      <div className="text-xs font-bold text-rose-600 uppercase tracking-wide">👉 Aapki baari ({meName})</div>
      <div className="text-2xl font-bold leading-snug"><Words text={cur.en} active={word.i === idx ? word.w : -1} missed={missed} /></div>
      <div className="text-sky-700">🗣️ {cur.say}</div>
      <div className="text-slate-600 text-sm">👉 {cur.hi}</div>
      {att && (att.error ? <div className="text-sm text-red-700">{att.error}</div> : <div className="text-sm bg-slate-50 rounded-xl p-2">
        <div>Aapne bola: <b>{att.said || '—'}</b></div>
        <div className="h-2 bg-slate-200 rounded-full my-1"><div className={`h-2 rounded-full ${att.score >= 70 ? 'bg-emerald-500' : att.score >= 40 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${att.score}%` }} /></div>
        <div><b>{att.score}%</b> · {att.feedback}</div></div>)}
      <div className="flex gap-2">
        <button onClick={() => say(idx)} className="rounded-2xl bg-sky-100 text-sky-800 font-semibold px-4 py-3">🔊 Pehle suno</button>
        {mode !== 'read' && canListen()
          ? <button onClick={startListen} disabled={mic} className={`flex-1 rounded-2xl font-bold py-3 text-lg ${mic ? 'bg-red-500 text-white animate-pulse' : 'bg-rose-600 text-white'}`}>{mic ? '🎙️ Sun raha hu... boliye' : att ? '🔁 Phir se boliye' : '🎤 Ab aap boliye'}</button>
          : <button onClick={next} className="flex-1 rounded-2xl bg-emerald-600 text-white font-bold py-3 text-lg">✅ Bol diya, aage ›</button>}
      </div>
      {mode !== 'read' && canListen() && <button onClick={next} className={`w-full rounded-2xl py-2 font-semibold ${att && !att.error && att.score >= 60 ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>{att && !att.error ? 'Aage ›' : 'Skip ›'}</button>}
    </div>}
  </div>);
}
