import { useEffect, useRef, useState } from 'react';
import Markdown from '../Markdown.jsx';
import { LESSONS, LEVELS, buildQuiz, scoreSpeech } from './lessons.js';
import * as P from './progress.js';
import { speak, listen, canListen, canSpeak, englishOnly } from './speech.js';

const BASE = '/english';
const go = path => { history.pushState(null, '', BASE + path); dispatchEvent(new PopStateEvent('popstate')); window.scrollTo(0, 0); };
const route = () => { const p = location.pathname.slice(BASE.length).replace(/\/+$/, ''); const m = p.match(/^\/lesson\/(\d+)/); return m ? { name: 'lesson', id: +m[1] } : p === '/teacher' ? { name: 'teacher' } : p === '/revise' ? { name: 'revise' } : { name: 'home' }; };

function useProgress() {
  const [p, setP] = useState(() => P.load());
  const update = f => setP(old => P.save(f(old)));
  return [p, update];
}

export default function English() {
  const [r, setR] = useState(route);
  const [p, update] = useProgress();
  useEffect(() => {
    document.title = 'English Seekho by Aditya Solanki AI';
    const on = () => setR(route()); addEventListener('popstate', on);
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js', { scope: '/english' }).catch(() => {});
    return () => removeEventListener('popstate', on);
  }, []);
  return (
    <div className="min-h-[100dvh] bg-amber-50 text-slate-800 text-[17px]">
      <div className={`max-w-xl mx-auto ${r.name === 'teacher' ? '' : 'pb-10'}`}>
        {r.name === 'lesson' ? <Lesson key={r.id} id={r.id} p={p} update={update} />
          : r.name === 'teacher' ? <Teacher update={update} />
          : r.name === 'revise' ? <Revise p={p} update={update} />
          : <Home p={p} />}
      </div>
    </div>
  );
}

function Top({ title, back = true }) {
  return (
    <header className="sticky top-0 z-10 bg-gradient-to-r from-orange-500 to-pink-500 text-white px-3 py-3 flex items-center gap-3 shadow">
      {back ? <button onClick={() => go('')} className="text-2xl w-10 h-10 rounded-full bg-white/20 active:bg-white/40" aria-label="Back">←</button>
        : <div className="w-10 h-10 rounded-full bg-white grid place-items-center text-2xl">📚</div>}
      <div className="flex-1 min-w-0">
        <div className="font-bold text-lg leading-tight truncate">{title}</div>
        <div className="text-[11px] opacity-90">English Seekho by Aditya Solanki AI · 🤖 AI</div>
      </div>
    </header>
  );
}

const Btn = ({ className = '', ...a }) => <button {...a} className={`rounded-2xl font-semibold active:scale-[.98] transition disabled:opacity-50 ${className}`} />;
const Listen = ({ text, slow, small }) => <button onClick={() => speak(text, { slow })} aria-label="Suno"
  className={`${small ? 'text-sm px-2 py-1' : 'px-3 py-2'} rounded-full bg-sky-100 text-sky-800 active:bg-sky-200 shrink-0`}>{slow ? '🐢' : '🔊'}</button>;

function Home({ p }) {
  const [install, setInstall] = useState(null);
  useEffect(() => { const h = e => { e.preventDefault(); setInstall(e); }; addEventListener('beforeinstallprompt', h); return () => removeEventListener('beforeinstallprompt', h); }, []);
  const next = LESSONS.find(l => !p.done[l.id]) || LESSONS[LESSONS.length - 1];
  const doneN = Object.keys(p.done).length;
  return (<>
    <Top title="English Seekho" back={false} />
    <div className="p-4 space-y-4">
      <div className="bg-white rounded-3xl p-4 shadow-sm">
        <div className="text-xl font-bold">Namaste Aditya 🙏</div>
        <div className="text-slate-600">Roz 10-15 minute, aur English aa jayegi. Zero se shuru, Hindi mein samjhaake 💪</div>
        <div className="grid grid-cols-4 gap-2 mt-3 text-center">
          <Stat icon="🔥" v={P.liveStreak(p)} l="Din streak" />
          <Stat icon="⭐" v={p.xp} l="XP" />
          <Stat icon="📗" v={`${doneN}/${LESSONS.length}`} l="Lessons" />
          <Stat icon="🧠" v={P.wordsLearned(p)} l="Words" />
        </div>
      </div>
      <Btn onClick={() => go(`/lesson/${next.id}`)} className="w-full bg-orange-500 text-white p-4 text-left shadow">
        <div className="text-sm opacity-90">{doneN ? '▶️ Aaj ka lesson' : '▶️ Pehla lesson shuru karo'}</div>
        <div className="text-xl">{next.emoji} Lesson {next.id}: {next.title}</div>
      </Btn>
      <div className="grid grid-cols-2 gap-3">
        <Btn onClick={() => go('/teacher')} className="bg-violet-600 text-white p-4 text-left"><div className="text-3xl">🤖</div>AI Teacher se baat karo</Btn>
        <Btn onClick={() => go('/revise')} className="bg-emerald-600 text-white p-4 text-left"><div className="text-3xl">🃏</div>Words revise karo</Btn>
      </div>
      {install && <Btn onClick={async () => { install.prompt(); await install.userChoice; setInstall(null); }} className="w-full bg-sky-600 text-white p-3">📲 Phone mein app install karo</Btn>}
      {(!canSpeak() || !canListen()) && <div className="text-sm bg-amber-100 border border-amber-300 rounded-xl p-3">ℹ️ Is browser mein {!canSpeak() ? 'awaaz (🔊)' : ''}{!canSpeak() && !canListen() ? ' aur ' : ''}{!canListen() ? 'mic se bolne ki practice (🎤)' : ''} nahi chalega. Android par <b>Google Chrome</b> mein kholo. Baaki sab chalega.</div>}
      {LEVELS.map((lv, i) => (
        <section key={lv}>
          <h2 className="font-bold text-slate-700 mt-2 mb-2">{lv}</h2>
          <div className="space-y-2">
            {LESSONS.filter(l => l.level === i).map(l => {
              const d = p.done[l.id];
              return <button key={l.id} onClick={() => go(`/lesson/${l.id}`)} className={`w-full flex items-center gap-3 bg-white rounded-2xl p-3 text-left shadow-sm active:bg-orange-50 ${l.id === next.id && !d ? 'ring-2 ring-orange-400' : ''}`}>
                <span className="text-3xl">{l.emoji}</span>
                <span className="flex-1"><span className="block text-xs text-slate-500">Lesson {l.id}</span><span className="font-semibold">{l.title}</span></span>
                {d ? <span className="text-emerald-600 font-bold text-sm">✅ {d.best}/{d.total}</span> : <span className="text-slate-300 text-2xl">›</span>}
              </button>;
            })}
          </div>
        </section>
      ))}
      <a href="/" className="block text-center text-sm text-violet-700 underline pt-2">← Aditya Solanki AI par wapas jao</a>
      <p className="text-center text-xs text-slate-500">Lifetime free · Progress isi phone mein save hota hai · Yeh ek AI app hai, galti ho sakti hai</p>
    </div>
  </>);
}
const Stat = ({ icon, v, l }) => <div className="bg-amber-50 rounded-2xl py-2"><div className="text-xl">{icon}</div><div className="font-bold">{v}</div><div className="text-[10px] text-slate-500">{l}</div></div>;

function SpeakCheck({ target, onGood }) {
  const [st, setSt] = useState(null); const [on, setOn] = useState(false);
  const start = () => {
    setOn(true); setSt(null);
    listen({ onResult: alts => {
      const best = alts.map(a => ({ said: a, ...scoreSpeech(target, a) })).sort((a, b) => b.score - a.score)[0] || { said: '', ...scoreSpeech(target, '') };
      setSt(best); if (best.score >= 70) onGood?.();
    }, onError: msg => setSt({ error: msg }), onEnd: () => setOn(false) });
  };
  return (<div className="mt-2">
    <button onClick={start} disabled={on} className={`px-3 py-2 rounded-full text-sm font-semibold ${on ? 'bg-red-500 text-white animate-pulse' : 'bg-rose-100 text-rose-800 active:bg-rose-200'}`}>{on ? '🎙️ Sun raha hu... bolo' : '🎤 Bolke dekho'}</button>
    {st && (st.error ? <div className="text-sm text-red-700 mt-1">{st.error}</div> : <div className="mt-2 text-sm bg-slate-50 rounded-xl p-2">
      <div>Aapne bola: <b>{st.said || '—'}</b></div>
      <div className="h-2 bg-slate-200 rounded-full my-1"><div className={`h-2 rounded-full ${st.score >= 70 ? 'bg-emerald-500' : st.score >= 40 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${st.score}%` }} /></div>
      <div><b>{st.score}%</b> · {st.feedback}</div>
    </div>)}
  </div>);
}

function Lesson({ id, p, update }) {
  const l = LESSONS.find(x => x.id === id);
  const [quiz, setQuiz] = useState(null);
  if (!l) return <><Top title="Lesson nahi mila" /><div className="p-4">Yeh lesson nahi hai. <button className="underline" onClick={() => go('')}>Home</button></div></>;
  const good = () => update(o => P.addXp(o, 5));
  if (quiz) return <Quiz l={l} qs={quiz} p={p} update={update} onBack={() => setQuiz(null)} />;
  return (<>
    <Top title={`${l.emoji} Lesson ${l.id}: ${l.title}`} />
    <div className="p-4 space-y-4">
      <section className="bg-white rounded-3xl p-4 shadow-sm">
        <h3 className="font-bold text-lg mb-2">📝 Aaj ke 5 words</h3>
        <div className="divide-y">
          {l.words.map(w => <div key={w.en} className="py-3">
            <div className="flex items-center gap-2">
              <div className="flex-1"><div className="text-2xl font-bold text-orange-600">{w.en}</div>
                <div className="text-slate-600">🗣️ {w.say} · <b>{w.hi}</b></div></div>
              <Listen text={w.en} /><Listen text={w.en} slow />
            </div>
            <SpeakCheck target={w.en} onGood={good} />
          </div>)}
        </div>
      </section>
      <section className="bg-white rounded-3xl p-4 shadow-sm">
        <h3 className="font-bold text-lg mb-2">💬 Sentences</h3>
        <div className="divide-y">
          {l.sentences.map(s => <div key={s.en} className="py-3">
            <div className="flex items-start gap-2">
              <div className="flex-1"><div className="text-xl font-semibold">{s.en}</div>
                <div className="text-sm text-sky-700">🗣️ {s.say}</div>
                <div className="text-sm text-slate-600">👉 {s.hi}</div></div>
              <Listen text={s.en} /><Listen text={s.en} slow />
            </div>
            <SpeakCheck target={s.en} onGood={good} />
          </div>)}
        </div>
      </section>
      <section className="bg-yellow-100 border border-yellow-300 rounded-3xl p-4">
        <h3 className="font-bold mb-1">💡 Tip</h3><p>{l.tip}</p>
      </section>
      <Btn onClick={() => setQuiz(buildQuiz(l, l.id + (p.done[l.id] ? Date.now() % 1000 : 0)))} className="w-full bg-orange-500 text-white p-4 text-xl shadow">🎯 Quiz shuru karo</Btn>
    </div>
  </>);
}

function Quiz({ l, qs, p, update, onBack }) {
  const [i, setI] = useState(0); const [pick, setPick] = useState(null); const [score, setScore] = useState(0); const [fin, setFin] = useState(null);
  const q = qs[i];
  const choose = o => { if (pick) return; setPick(o); const ok = o === q.answer; if (ok) setScore(s => s + 1); speak(q.full || (q.type === 'mcq' ? q.q.match(/"(.+?)"/)[1] : q.answer)); };
  const next = () => {
    if (i + 1 < qs.length) { setI(i + 1); setPick(null); return; }
    const before = p.xp; update(o => P.completeLesson(o, l.id, score, qs.length));
    setFin({ score, gained: score * 10 + (p.done[l.id] ? 0 : 20), before });
  };
  if (fin) {
    const nextL = LESSONS.find(x => x.id === l.id + 1);
    return (<><Top title={`🎯 Quiz: ${l.title}`} />
      <div className="p-6 text-center space-y-4">
        <div className="text-7xl">{fin.score === qs.length ? '🏆' : fin.score >= qs.length / 2 ? '🎉' : '💪'}</div>
        <div className="text-2xl font-bold">{fin.score}/{qs.length} sahi!</div>
        <div className="text-lg">+{fin.gained} XP ⭐ · Lesson pura ✅</div>
        <div className="text-slate-600">{fin.score === qs.length ? 'Ekdum perfect, bhai! 👏' : 'Achha kiya! Galat wale dobara padh lo, phir quiz do.'}</div>
        {nextL && <Btn onClick={() => go(`/lesson/${nextL.id}`)} className="w-full bg-orange-500 text-white p-4 text-lg">Agla lesson: {nextL.emoji} {nextL.title} ›</Btn>}
        <Btn onClick={onBack} className="w-full bg-white border p-3">🔁 Lesson dobara dekho</Btn>
        <Btn onClick={() => go('')} className="w-full bg-white border p-3">🏠 Home</Btn>
      </div></>);
  }
  const label = { mcq: '🔤 Matlab batao', blank: '✏️ Khaali jagah', hi2en: '🔁 Hindi se English' }[q.type];
  return (<><Top title={`🎯 Quiz: ${l.title}`} />
    <div className="p-4 space-y-4">
      <div className="flex justify-between text-sm text-slate-600"><span>Sawaal {i + 1}/{qs.length}</span><span>{label}</span><span>✅ {score}</span></div>
      <div className="h-2 bg-amber-200 rounded-full"><div className="h-2 bg-orange-500 rounded-full" style={{ width: `${(i / qs.length) * 100}%` }} /></div>
      <div className="bg-white rounded-3xl p-5 shadow-sm text-xl font-semibold">{q.q}{q.hint && <div className="text-sm font-normal text-slate-500 mt-1">👉 {q.hint}</div>}</div>
      <div className="space-y-2">
        {q.options.map(o => {
          const st = !pick ? 'bg-white' : o === q.answer ? 'bg-emerald-100 border-emerald-500' : o === pick ? 'bg-red-100 border-red-500' : 'bg-white opacity-60';
          return <button key={o} onClick={() => choose(o)} className={`w-full text-left p-4 rounded-2xl border-2 border-transparent shadow-sm text-lg ${st}`}>{o}</button>;
        })}
      </div>
      {pick && <div className={`rounded-2xl p-3 ${pick === q.answer ? 'bg-emerald-100' : 'bg-red-100'}`}>
        {pick === q.answer ? '🎉 Sahi jawab! Shabaash!' : <>😅 Galat. Sahi jawab: <b>{q.answer}</b></>}
        {q.full && <div className="text-sm mt-1">Poora sentence: <b>{q.full}</b></div>}
      </div>}
      {pick && <Btn onClick={next} className="w-full bg-orange-500 text-white p-4 text-lg">{i + 1 < qs.length ? 'Agla sawaal ›' : 'Result dekho 🏁'}</Btn>}
    </div></>);
}

function Revise({ p, update }) {
  const [deck, setDeck] = useState(() => P.reviseDeck(p));
  const [i, setI] = useState(0); const [flip, setFlip] = useState(false); const [known, setKnown] = useState(0);
  const w = deck[i];
  const rate = k => { update(o => P.rateCard(o, w.en, k)); if (k) setKnown(n => n + 1); setFlip(false); setI(i + 1); };
  return (<><Top title="🃏 Words revise karo" />
    <div className="p-4 space-y-4">
      {!Object.keys(p.cards).length && i === 0 && <div className="text-sm bg-amber-100 rounded-xl p-3">Abhi koi lesson pura nahi hua, isliye Lesson 1 ke words dikha raha hu. Lesson ka quiz poora karoge toh uske words yahan aa jayenge.</div>}
      {w ? (<>
        <div className="text-sm text-slate-600 text-center">Card {i + 1}/{deck.length} · Card par tap karke matlab dekho</div>
        <button onClick={() => { setFlip(!flip); if (!flip) speak(w.en); }} className="w-full min-h-[240px] bg-white rounded-3xl shadow p-6 grid place-items-center text-center">
          {!flip ? <div><div className="text-4xl font-bold text-orange-600">{w.en}</div><div className="text-slate-400 mt-3">👆 Tap karo</div></div>
            : <div><div className="text-2xl font-bold">{w.hi}</div><div className="text-sky-700 mt-2">🗣️ {w.say}</div><div className="text-slate-500 mt-2">{w.en}</div></div>}
        </button>
        <div className="flex justify-center"><Listen text={w.en} /></div>
        <div className="grid grid-cols-2 gap-3">
          <Btn onClick={() => rate(false)} className="bg-rose-100 text-rose-800 p-4">😕 Bhool gaya</Btn>
          <Btn onClick={() => rate(true)} className="bg-emerald-600 text-white p-4">😃 Yaad hai</Btn>
        </div>
      </>) : (<div className="text-center space-y-4 pt-6">
        <div className="text-6xl">🧠</div><div className="text-2xl font-bold">{known}/{deck.length} yaad the!</div>
        <div className="text-slate-600">Jo bhool gaye woh agli baar pehle aayenge.</div>
        <Btn onClick={() => { setDeck(P.reviseDeck(P.load())); setI(0); setKnown(0); setFlip(false); }} className="w-full bg-emerald-600 text-white p-4">🔁 Phir se revise karo</Btn>
        <Btn onClick={() => go('')} className="w-full bg-white border p-3">🏠 Home</Btn>
      </div>)}
    </div></>);
}

const MODES = [['free', '💬 Normal baat'], ['shop', '🛍️ Dukaan'], ['phone', '📞 Phone call'], ['meeting', '🏛️ Meeting'], ['interview', '💼 Interview']];
const OPEN = {
  free: 'Hello Aditya! 👋 I am your English teacher. Aap English mein kuch bhi likho, galti ho toh main pyaar se theek karunga.\n\nHow are you today? (Aaj aap kaise ho?)',
  shop: '🛍️ Welcome to my shop! (Meri dukaan mein swagat hai)\n\nWhat do you want to buy today? (Aaj kya khareedna hai?)',
  phone: '📞 Ring ring... Hello! This is Ramesh. Who is speaking? (Kaun bol raha hai?)',
  meeting: '🏛️ Good evening, Secretary sir. All members are here. (Sab sadasya aa gaye hain)\n\nPlease start the meeting. (Meeting shuru kijiye)',
  interview: '💼 Good morning! Please sit down. (Baithiye)\n\nTell me about yourself. (Apne baare mein batao)',
};
const chatKey = m => `englishSeekho.chat.${m}`;
const loadChat = m => { try { const a = JSON.parse(localStorage.getItem(chatKey(m)) || 'null'); if (Array.isArray(a) && a.length) return a; } catch {} return [{ role: 'assistant', content: OPEN[m] }]; };

function TeacherText({ text }) {
  const lines = text.split('\n');
  return <div className="space-y-1">{lines.map((ln, i) => {
    const t = ln.trim();
    const box = t.startsWith('❌') ? 'bg-red-50 border-l-4 border-red-400' : t.startsWith('✅') ? 'bg-emerald-50 border-l-4 border-emerald-500' : t.startsWith('💡') ? 'bg-amber-50 border-l-4 border-amber-400' : t.startsWith('🗣️') ? 'bg-sky-50 border-l-4 border-sky-400' : '';
    return box ? <div key={i} className={`${box} rounded px-2 py-1`}><Markdown text={t} /></div> : t ? <Markdown key={i} text={ln} /> : <div key={i} className="h-1" />;
  })}</div>;
}

function Teacher({ update }) {
  const [mode, setMode] = useState('free');
  const [msgs, setMsgs] = useState(() => loadChat('free'));
  const [input, setInput] = useState(''); const [busy, setBusy] = useState(false); const [mic, setMic] = useState(false); const [err, setErr] = useState('');
  const end = useRef();
  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, busy]);
  useEffect(() => { try { localStorage.setItem(chatKey(mode), JSON.stringify(msgs.slice(-30))); } catch {} }, [msgs, mode]);
  const switchMode = m => { setMode(m); setMsgs(loadChat(m)); setErr(''); };
  const reset = () => { localStorage.removeItem(chatKey(mode)); setMsgs([{ role: 'assistant', content: OPEN[mode] }]); };
  async function send() {
    const text = input.trim(); if (!text || busy) return;
    const hist = [...msgs, { role: 'user', content: text }]; setMsgs(hist); setInput(''); setBusy(true); setErr('');
    try {
      const r = await fetch('/api/english/teacher', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ mode, messages: hist }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.reply) throw new Error(j.error || 'Teacher abhi busy hai 🙏 dobara bhejo.');
      setMsgs([...hist, { role: 'assistant', content: j.reply }]); update(o => P.addXp(o, 3));
    } catch (e) { setErr(e.message.includes('fetch') ? 'Internet check karo, phir dobara bhejo.' : e.message); }
    finally { setBusy(false); }
  }
  const dictate = () => { setMic(true); listen({ onResult: a => a[0] && setInput(v => (v ? v + ' ' : '') + a[0]), onError: setErr, onEnd: () => setMic(false) }); };
  return (<div className="flex flex-col h-[100dvh]">
    <Top title="🤖 AI English Teacher" />
    <div className="flex gap-2 overflow-x-auto px-3 py-2 bg-white border-b">
      {MODES.map(([k, lab]) => <button key={k} onClick={() => switchMode(k)} className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-semibold ${k === mode ? 'bg-violet-600 text-white' : 'bg-violet-50 text-violet-800'}`}>{lab}</button>)}
    </div>
    <main className="flex-1 overflow-y-auto p-3 space-y-3">
      {msgs.map((m, i) => m.role === 'assistant'
        ? <div key={i} className="flex gap-2"><div className="w-9 h-9 shrink-0 rounded-full bg-violet-600 text-white grid place-items-center">🤖</div>
            <div className="max-w-[85%] bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm"><TeacherText text={m.content} />
              <div className="mt-1"><button onClick={() => speak(englishOnly(m.content))} className="text-xs text-sky-700">🔊 English suno</button></div></div></div>
        : <div key={i} className="flex justify-end"><div className="max-w-[85%] bg-orange-500 text-white rounded-2xl rounded-tr-sm p-3 whitespace-pre-wrap">{m.content}</div></div>)}
      {busy && <div className="text-sm text-slate-500 pl-11 animate-pulse">Teacher likh raha hai...</div>}
      {err && <div className="text-sm text-red-700 bg-red-50 rounded-xl p-2">⚠️ {err}</div>}
      <div ref={end} />
    </main>
    <div className="px-3 pt-1 text-[11px] text-slate-500 flex justify-between"><span>English mein likho ya 🎤 dabake bolo. Hindi mein bhi pooch sakte ho.</span><button onClick={reset} className="underline">Nayi baat</button></div>
    <form onSubmit={e => { e.preventDefault(); send(); }} className="p-3 flex gap-2 bg-amber-50">
      {canListen() && <button type="button" onClick={dictate} className={`w-12 h-12 rounded-full text-xl ${mic ? 'bg-red-500 animate-pulse' : 'bg-rose-100'}`} aria-label="Mic">🎤</button>}
      <input value={input} onChange={e => setInput(e.target.value)} placeholder="Type in English..." className="flex-1 min-w-0 bg-white rounded-full px-4 border border-amber-200 outline-none text-lg" />
      <button disabled={busy || !input.trim()} className="w-12 h-12 rounded-full bg-violet-600 text-white text-xl disabled:opacity-50">➤</button>
    </form>
  </div>);
}
