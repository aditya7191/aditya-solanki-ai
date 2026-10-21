import { useState } from 'react';
export default function Admin() {
  const [pw, setPw] = useState(sessionStorage.adminPw || '');
  const [docs, setDocs] = useState(null), [cur, setCur] = useState({ name: '', content: '' }), [msg, setMsg] = useState('');
  const api = (u, o = {}) => fetch(u, { ...o, headers: { 'content-type': 'application/json', 'x-admin-password': pw } }).then(async r => { const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(j.error || r.status); return j; });
  const load = () => api('/api/admin/docs').then(d => { sessionStorage.adminPw = pw; setDocs(d); setMsg(''); }).catch(e => setMsg(e.message));
  const save = () => api('/api/admin/docs', { method: 'POST', body: JSON.stringify(cur) }).then(() => { setMsg('Save ho gaya ✅'); load(); }).catch(e => setMsg(e.message));
  const del = n => confirm(`${n} delete karna hai?`) && api('/api/admin/docs/' + encodeURIComponent(n), { method: 'DELETE' }).then(load);
  const upload = async e => { for (const f of e.target.files) await api('/api/admin/docs', { method: 'POST', body: JSON.stringify({ name: f.name, content: await f.text() }) }); load(); };
  const inp = 'w-full bg-slate-800 rounded p-2';
  return <div className="max-w-2xl mx-auto p-4 text-slate-100 space-y-3">
    <h1 className="text-xl font-semibold">📚 Samaj Knowledge Base — Admin</h1>
    {!docs ? <div className="flex gap-2"><input type="password" className={inp} value={pw} onChange={e => setPw(e.target.value)} placeholder="Admin password" /><button onClick={load} className="bg-violet-600 px-4 rounded">Login</button></div> : <>
      <label className="block text-sm">Upload .md / .txt: <input type="file" multiple accept=".md,.txt" onChange={upload} /></label>
      <ul className="space-y-1">{docs.map(d => <li key={d.name} className="flex justify-between bg-slate-800 rounded px-2 py-1"><button onClick={() => setCur(d)} className="underline">{d.name}</button><button onClick={() => del(d.name)} className="text-red-400">Delete</button></li>)}</ul>
      <input className={inp} value={cur.name} onChange={e => setCur({ ...cur, name: e.target.value })} placeholder="Doc naam (jaise panchayat-1.md)" />
      <textarea className={inp + ' h-64'} value={cur.content} onChange={e => setCur({ ...cur, content: e.target.value })} placeholder="Sirf verified jaankari likho. Paragraphs ke beech khaali line." />
      <div className="flex gap-2"><button onClick={save} className="bg-violet-600 px-4 py-2 rounded">Save</button><button onClick={() => setCur({ name: '', content: '' })} className="bg-slate-700 px-4 py-2 rounded">Naya doc</button></div>
    </>}
    {msg && <div className="text-sm text-amber-300">{msg}</div>}
  </div>;
}
