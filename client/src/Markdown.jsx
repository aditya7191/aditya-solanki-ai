import { parseMd } from './md.js';
const Inl = ({ nodes }) => nodes.map((n, i) => n.t === 'b' ? <strong key={i}>{n.v}</strong> : n.t === 'i' ? <em key={i}>{n.v}</em>
  : n.t === 'code' ? <code key={i} className="bg-slate-900 px-1 rounded">{n.v}</code>
  : n.t === 'a' ? <a key={i} href={n.href} target="_blank" rel="noopener noreferrer" className="text-cyan-300 underline">{n.v}</a> : <span key={i}>{n.v}</span>);
export default function Markdown({ text }) {
  return parseMd(text).map((b, i) => b.t === 'ul' ? <ul key={i} className="list-disc pl-5">{b.items.map((it, j) => <li key={j}><Inl nodes={it} /></li>)}</ul>
    : b.t === 'ol' ? <ol key={i} className="list-decimal pl-5">{b.items.map((it, j) => <li key={j}><Inl nodes={it} /></li>)}</ol>
    : b.t === 'h' ? <div key={i} className="font-semibold mt-1"><Inl nodes={b.v} /></div>
    : b.t === 'hr' ? <hr key={i} className="border-slate-600 my-1" /> : b.t === 'br' ? <div key={i} className="h-2" />
    : <div key={i}><Inl nodes={b.v} /></div>);
}
