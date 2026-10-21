import { spawn, spawnSync } from 'node:child_process';
import { mkdtemp, writeFile, rm, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { config } from './config.js';
import { searchKB } from './kb.js';
import { generate_image, generate_logo, generate_music } from './media.js';

const strip = html => html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ')
  .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();

function safeUrl(u) {
  const url = new URL(u);
  if (!/^https?:$/.test(url.protocol)) throw new Error('sirf http/https allowed');
  if (/^(localhost|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|0\.|\[::1\])/i.test(url.hostname)) throw new Error('private address blocked');
  return url;
}

export async function web_search({ query }) {
  const r = await fetch('https://html.duckduckgo.com/html/?q=' + encodeURIComponent(query), { headers: { 'user-agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(15000) });
  const html = await r.text();
  const out = [];
  const re = /<a[^>]*class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g;
  let m;
  while ((m = re.exec(html)) && out.length < 6) {
    let link = m[1]; const u = link.match(/uddg=([^&]+)/); if (u) link = decodeURIComponent(u[1]);
    out.push({ title: strip(m[2]), url: link, snippet: strip(m[3]) });
  }
  return out.length ? out : 'Koi result nahi mila';
}

export async function fetch_url({ url }) {
  const r = await fetch(safeUrl(url), { headers: { 'user-agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(15000), redirect: 'follow' });
  return strip(await r.text()).slice(0, 8000);
}

let canUnshare;
function sandboxPrefix() {
  if (canUnshare === undefined) canUnshare = spawnSync('unshare', ['-rn', 'true']).status === 0;
  return canUnshare ? ['unshare', '-rn'] : []; // -n = no network
}

export async function run_code({ language = 'javascript', code }) {
  const dir = await mkdtemp(path.join(tmpdir(), 'karta-run-'));
  try {
    const py = /^py/i.test(language);
    const file = path.join(dir, py ? 'main.py' : 'main.mjs');
    await writeFile(file, code);
    const cmd = py ? ['python3', '-I', file]
      : ['node', '--experimental-permission', `--allow-fs-read=${dir}`, `--allow-fs-write=${dir}`, '--max-old-space-size=128', file];
    const full = [...sandboxPrefix(), ...cmd];
    return await new Promise(resolve => {
      const p = spawn(full[0], full.slice(1), { cwd: dir, env: { PATH: process.env.PATH, HOME: dir }, timeout: config.codeTimeoutMs, killSignal: 'SIGKILL' });
      let out = '';
      const add = d => { if (out.length < 10000) out += d; };
      p.stdout.on('data', add); p.stderr.on('data', add);
      p.on('close', (code, sig) => resolve(`${sig ? `[timeout/killed ${sig}] ` : ''}exit ${code}\n${out.slice(0, 10000)}`));
      p.on('error', e => resolve('error: ' + e.message));
    });
  } finally { await rm(dir, { recursive: true, force: true }); }
}

export async function create_file({ filename, content }, ctx) {
  const name = path.basename(String(filename)).replace(/[^\w.\-]/g, '_').slice(0, 80) || 'file.txt';
  const dir = path.join(config.filesDir, ctx.sessionId);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), String(content ?? ''));
  const url = `/api/files/${ctx.sessionId}/${encodeURIComponent(name)}`;
  ctx.onFile?.({ name, url });
  return `File ban gayi: ${url}`;
}

export async function search_knowledge({ query }) {
  const r = await searchKB(String(query || ''));
  return r.length ? r : 'KB mein is baare mein kuch nahi mila.';
}

export const tools = { search_knowledge, web_search, fetch_url, run_code, create_file, generate_image, generate_logo, generate_music };
export const toolDocs = `
- search_knowledge {"query": string} : samaj knowledge base mein dhundo (samaj ke sawaal pe SABSE PEHLE)
- web_search {"query": string} : internet pe search
- fetch_url {"url": string} : webpage ka text padho
- run_code {"language": "javascript"|"python", "code": string} : code chalao (no network, 10s limit), print/console.log se output
- create_file {"filename": string, "content": string} : user ke download ke liye file banao
- generate_image {"prompt": string (English mein)} : image banao
- generate_logo {"name": string, "idea": string, "variants": 2-4} : logo designs banao
- generate_music {"prompt": string, "seconds": number<=15} : chhota instrumental music banao`;
