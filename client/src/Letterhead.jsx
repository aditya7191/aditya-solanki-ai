import { useState } from 'react';
import { guessLang } from './draft.js';

const DEF = { name: 'Mira Road Sthanik Panchayat-28', sub: 'Shree Sant Shiromani Rohidas Vanshi Vadhiyara Chamar Samaj', address: 'Mira Road, Thane, Maharashtra', contact: '' };
const load = (k, d) => { try { return JSON.parse(localStorage[k]) ?? d; } catch { return d; } };
const readFile = f => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(f); });
// Letterhead ko A4 (1240x1754) white canvas par rakho, upar se full-width — JPEG, chhota size
async function toA4(dataUrl) {
  const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = dataUrl; });
  const W = 1240, H = 1754, c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, W, H);
  const s = Math.min(W / img.width, H / img.height), w = img.width * s, h = img.height * s;
  g.drawImage(img, (W - w) / 2, 0, w, h);
  return c.toDataURL('image/jpeg', 0.85);
}

export default function Letterhead({ draft, onClose }) {
  const [text, setText] = useState(draft);
  const [org, setOrg] = useState(() => ({ ...DEF, ...load('lh_org', {}) }));
  const [img, setImg] = useState(() => localStorage.lh_img || '');
  const [mt, setMt] = useState(() => localStorage.lh_mt || '');
  const [mb, setMb] = useState(() => localStorage.lh_mb || '');
  const [busy, setBusy] = useState('');
  const [err, setErr] = useState('');
  const lang = guessLang(text);

  async function upload(e) {
    const f = e.target.files?.[0]; if (!f) return; setErr('');
    try {
      let url = await readFile(f);
      if (f.type === 'application/pdf') {
        const r = await fetch('/api/letterhead/pdf-to-image', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ data: url }) });
        const j = await r.json(); if (!r.ok) throw new Error(j.error); url = j.image;
      } else if (!/^data:image\/(png|jpeg|webp)/.test(url)) throw new Error('PNG, JPG ya PDF upload karo');
      const a4 = await toA4(url); setImg(a4); localStorage.lh_img = a4;
    } catch (x) { setErr(x.message || 'Upload nahi hua'); }
    e.target.value = '';
  }
  const removeImg = () => { setImg(''); delete localStorage.lh_img; };
  async function download(format) {
    setBusy(format); setErr('');
    localStorage.lh_org = JSON.stringify(org); localStorage.lh_mt = mt; localStorage.lh_mb = mb;
    try {
      const r = await fetch('/api/letterhead/export', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ format, text, org, lang, letterheadImage: img || undefined, marginTop: mt === '' ? undefined : Number(mt), marginBottom: mb === '' ? undefined : Number(mb) }) });
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || 'Error');
      const a = document.createElement('a'); a.href = URL.createObjectURL(await r.blob()); a.download = `letter.${format}`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    } catch (x) { setErr(x.message); } finally { setBusy(''); }
  }
  const inp = 'w-full bg-slate-800 rounded px-2 py-1 text-sm outline-none';
  const F = (k, label) => <label className="block text-xs text-slate-400">{label}<input className={inp} value={org[k]} onChange={e => setOrg({ ...org, [k]: e.target.value })} /></label>;
  return (
    <div className="fixed inset-0 z-50 bg-black/70 grid place-items-center p-3" onClick={onClose}>
      <div className="bg-slate-900 rounded-2xl w-full max-w-lg max-h-[92dvh] overflow-y-auto p-4 space-y-3" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center"><div className="font-semibold">📄 Letterhead par banao</div><button onClick={onClose} className="text-slate-400">✕</button></div>
        <label className="block text-xs text-slate-400">Draft (yahin edit kar sakte ho)
          <textarea className={inp + ' h-40'} value={text} onChange={e => setText(e.target.value)} /></label>
        <div className="border border-slate-700 rounded-lg p-2 space-y-2">
          <div className="text-xs font-semibold">Apna letterhead (image/PDF)</div>
          {img ? <div className="flex gap-2 items-center"><img src={img} alt="letterhead" className="h-24 rounded border border-slate-600" /><div className="text-xs space-y-1"><div className="text-emerald-300">✅ Saved (is browser mein)</div><button onClick={removeImg} className="text-amber-300 underline">Hatao / default template use karo</button></div></div>
            : <div className="text-xs text-slate-400">Koi upload nahi — niche ka default template use hoga.</div>}
          <input type="file" accept="image/png,image/jpeg,image/webp,application/pdf" onChange={upload} className="text-xs" />
          {img && <div className="grid grid-cols-2 gap-2"><label className="text-xs text-slate-400">Upar ka khali (mm)<input type="number" className={inp} placeholder="45" value={mt} onChange={e => setMt(e.target.value)} /></label><label className="text-xs text-slate-400">Neeche ka khali (mm)<input type="number" className={inp} placeholder="30" value={mb} onChange={e => setMb(e.target.value)} /></label></div>}
        </div>
        {!img && <div className="space-y-2">{F('name', 'Organisation ka naam')}{F('sub', 'Sub-title')}{F('address', 'Address')}{F('contact', 'Phone / email')}</div>}
        {err && <div className="text-xs text-amber-300">⚠️ {err}</div>}
        <div className="flex gap-2">
          <button disabled={!!busy} onClick={() => download('pdf')} className="flex-1 bg-violet-600 disabled:opacity-50 rounded-full py-2 text-sm">{busy === 'pdf' ? '...' : '⬇️ PDF'}</button>
          <button disabled={!!busy} onClick={() => download('docx')} className="flex-1 bg-cyan-700 disabled:opacity-50 rounded-full py-2 text-sm">{busy === 'docx' ? '...' : '⬇️ Word (DOCX)'}</button>
        </div>
      </div>
    </div>
  );
}
