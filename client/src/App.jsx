import { useEffect, useRef, useState } from 'react';
import Admin from './Admin.jsx';

const sid = localStorage.sid || (localStorage.sid = crypto.randomUUID());
const Avatar = () => <div className="w-9 h-9 shrink-0 rounded-full bg-gradient-to-br from-cyan-400 to-violet-600 grid place-items-center text-lg">🤖</div>;
const toolLabel = { web_search: '🔎 Search kar raha hu', fetch_url: '🌐 Page padh raha hu', run_code: '💻 Code chala raha hu', create_file: '📄 File bana raha hu', search_knowledge: '📚 Samaj KB dekh raha hu', generate_image: '🎨 Image bana raha hu', generate_logo: '✏️ Logo bana raha hu', generate_music: '🎵 Music bana raha hu' };

export default function App() {
  return location.pathname.startsWith('/admin') ? <Admin /> : <Chat />;
}

function Chat() {
  const [info, setInfo] = useState({ name: 'Aditya Solanki AI', developer: 'Aditya Solanki', greeting: '' });
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const end = useRef();
  useEffect(() => { fetch('/api/info').then(r => r.json()).then(setInfo).catch(() => {}); }, []);
  useEffect(() => end.current?.scrollIntoView({ behavior: 'smooth' }), [msgs]);

  async function send() {
    const text = input.trim(); if (!text || busy) return;
    const history = [...msgs, { role: 'user', content: text }];
    setMsgs([...history, { role: 'assistant', content: '', steps: [], files: [], media: [] }]); setInput(''); setBusy(true);
    const upd = f => setMsgs(m => { const c = [...m]; c[c.length - 1] = f({ ...c[c.length - 1] }); return c; });
    try {
      const r = await fetch('/api/chat', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ sessionId: sid, messages: history.map(({ role, content }) => ({ role, content })) }) });
      if (r.status === 429) { const j = await r.json(); upd(a => ({ ...a, content: j.error })); return; }
      const reader = r.body.getReader(), dec = new TextDecoder(); let buf = '';
      for (;;) {
        const { value, done } = await reader.read(); if (done) break;
        buf += dec.decode(value, { stream: true });
        const parts = buf.split('\n\n'); buf = parts.pop();
        for (const p of parts) {
          if (!p.startsWith('data: ')) continue; const e = JSON.parse(p.slice(6));
          if (e.type === 'step') upd(a => ({ ...a, steps: [...a.steps, { tool: e.tool, args: e.args, done: false }] }));
          if (e.type === 'step_done') upd(a => ({ ...a, steps: a.steps.map((s, i) => i === a.steps.length - 1 ? { ...s, done: true } : s) }));
          if (e.type === 'media') upd(a => ({ ...a, media: [...a.media, e] }));
          if (e.type === 'file') upd(a => ({ ...a, files: [...a.files, e] }));
          if (e.type === 'delta') upd(a => ({ ...a, content: a.content + e.text }));
          if (e.type === 'error') upd(a => ({ ...a, content: '⚠️ ' + e.text }));
        }
      }
    } catch { upd(a => ({ ...a, content: '⚠️ Network problem, dobara try karo.' })); }
    finally { setBusy(false); }
  }

  return (
    <div className="h-[100dvh] flex flex-col max-w-2xl mx-auto text-slate-100">
      <header className="flex items-center gap-3 p-3 border-b border-slate-800">
        <Avatar /><div><div className="font-semibold">{info.name}</div>
        <span className="text-[10px] uppercase tracking-wide bg-violet-600/30 text-violet-300 px-2 py-0.5 rounded-full">🤖 AI Assistant</span></div>
      </header>
      <main className="flex-1 overflow-y-auto p-3 space-y-3">
        <Bubble ai text={info.greeting || `Namaste 🙏 Main ${info.name}, aapki kya help kar sakta hu?`} />
        {info.keyConfigured === false && <div className="text-xs text-amber-300 bg-amber-900/30 p-2 rounded">⚠️ API key missing — server pe GEMINI_API_KEY set karni hai.</div>}
        {msgs.map((m, i) => <Bubble key={i} ai={m.role === 'assistant'} text={m.content} steps={m.steps} files={m.files} media={m.media} typing={busy && i === msgs.length - 1} />)}
        <div ref={end} />
      </main>
      <form onSubmit={e => { e.preventDefault(); send(); }} className="p-3 flex gap-2 border-t border-slate-800">
        <input value={input} onChange={e => setInput(e.target.value)} placeholder="Kuch bhi pucho ya kaam do..." className="flex-1 bg-slate-800 rounded-full px-4 py-2 outline-none" />
        <button disabled={busy} className="bg-violet-600 disabled:opacity-50 rounded-full px-4">➤</button>
      </form>
      <footer className="text-center text-[11px] text-slate-500 pb-2">Developer: {info.developer} · Yeh ek AI hai, galti kar sakta hai</footer>
    </div>
  );
}

function Bubble({ ai, text, steps = [], files = [], media = [], typing }) {
  return (
    <div className={`flex gap-2 ${ai ? '' : 'justify-end'}`}>
      {ai && <Avatar />}
      <div className={`max-w-[80%] rounded-2xl px-3 py-2 whitespace-pre-wrap break-words ${ai ? 'bg-slate-800' : 'bg-violet-600'}`}>
        {steps.length > 0 && <div className="mb-2 text-xs text-cyan-300 space-y-1 border-l-2 border-cyan-700 pl-2">
          <div className="font-semibold">⚙️ Kaam ho raha hai...</div>
          {steps.map((s, i) => <div key={i}>{s.done ? '✅' : '⏳'} {toolLabel[s.tool] || s.tool}{s.args?.query ? `: ${s.args.query}` : s.args?.url ? `: ${s.args.url}` : ''}</div>)}
        </div>}
        {text || (typing && <span className="animate-pulse">...</span>)}
        {media.map(m => <div key={m.url} className="mt-2">{m.kind === 'image' ? <img src={m.url} alt={m.name} className="rounded-lg w-full" /> : <audio controls src={m.url} className="w-full" />}<a href={m.url} download className="text-xs text-cyan-300 underline">⬇️ Download</a></div>)}
        {files.map(f => <a key={f.url} href={f.url} className="block mt-2 text-cyan-300 underline">⬇️ {f.name}</a>)}
      </div>
    </div>
  );
}
