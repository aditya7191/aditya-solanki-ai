import { readdir, readFile, writeFile, mkdir, unlink } from 'node:fs/promises';
import path from 'node:path';
export const SAMAJ = 'Shree Sant Shiromani Rohidas Vanshi Vadhiyara Chamar Samaj, Mumbai Sthanik Panchayats 1-28';
const dir = () => process.env.KNOWLEDGE_DIR || new URL('../knowledge/', import.meta.url).pathname;
export const safeName = n => (path.basename(String(n)).replace(/[^\w.\-]/g, '_').replace(/\.(md|txt)$/i, '') || 'doc').slice(0, 80) + '.md';
const tok = s => s.toLowerCase().normalize('NFKC').match(/[\p{L}\p{N}]+/gu) || [];

export async function listDocs() {
  await mkdir(dir(), { recursive: true });
  const names = (await readdir(dir())).filter(f => /\.(md|txt)$/i.test(f));
  return Promise.all(names.map(async name => ({ name, content: await readFile(path.join(dir(), name), 'utf8') })));
}
export async function saveDoc(name, content) { await mkdir(dir(), { recursive: true }); const n = safeName(name); await writeFile(path.join(dir(), n), String(content)); return n; }
export async function deleteDoc(name) { await unlink(path.join(dir(), path.basename(name))); }

// BM25 over paragraph chunks; placeholder README excluded from answers
export async function searchKB(query, k = 4) {
  const docs = (await listDocs()).filter(d => d.name !== 'README.md');
  const chunks = docs.flatMap(d => d.content.split(/\n\s*\n/).filter(c => c.trim()).map(text => ({ doc: d.name, text, t: tok(text) })));
  const q = [...new Set(tok(query))];
  if (!chunks.length || !q.length) return [];
  const N = chunks.length, avg = chunks.reduce((a, c) => a + c.t.length, 0) / N, k1 = 1.5, b = 0.75;
  const df = Object.fromEntries(q.map(w => [w, chunks.filter(c => c.t.includes(w)).length]));
  return chunks.map(c => {
    let s = 0;
    for (const w of q) { const f = c.t.filter(x => x === w).length; if (!f) continue;
      const idf = Math.log(1 + (N - df[w] + 0.5) / (df[w] + 0.5)); s += idf * f * (k1 + 1) / (f + k1 * (1 - b + b * c.t.length / avg)); }
    return { doc: c.doc, text: c.text.slice(0, 1500), score: +s.toFixed(3) };
  }).filter(r => r.score > 0).sort((a, b) => b.score - a.score).slice(0, k);
}
