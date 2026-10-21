import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { config } from './config.js';

const UNSAFE = /\b(nude|naked|nsfw|porn|sex|sexual|gore|behead|child abuse|minor|nangi|nanga|terror|bomb making)\b/i;
const daily = new Map();
export function takeQuota(ip = 'local', kind, n = 1, limit = config.imageDailyLimit) {
  const day = new Date().toISOString().slice(0, 10), key = `${day}|${kind}|${ip}`;
  const used = daily.get(key) || 0;
  if (used + n > limit) return false;
  daily.set(key, used + n); return true;
}
export const _resetQuota = () => daily.clear();

async function save(ctx, name, buf) {
  const d = path.join(config.filesDir, ctx.sessionId); await mkdir(d, { recursive: true });
  await writeFile(path.join(d, name), buf);
  return `/api/files/${ctx.sessionId}/${name}`;
}

async function pollinate(prompt, ctx, seed, tries = 3) {
  for (let i = 1; ; i++) {
    try { return await pollinateOnce(prompt, ctx, seed); }
    catch (e) { if (i >= tries) throw e; await new Promise(r => setTimeout(r, (ctx.retryDelayMs ?? 3000) * i)); }
  }
}
async function pollinateOnce(prompt, ctx, seed) {
  const f = ctx.fetch || fetch;
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=768&height=768&nologo=true&seed=${seed}`;
  const r = await f(url, { signal: AbortSignal.timeout(90000) });
  if (!r.ok) throw new Error(`image service ${r.status}`);
  const type = r.headers.get('content-type') || '';
  if (!type.startsWith('image/')) throw new Error('image nahi mili');
  return Buffer.from(await r.arrayBuffer());
}

export async function generate_image({ prompt }, ctx) {
  prompt = String(prompt || '').slice(0, 500);
  if (!prompt) return 'Error: prompt khaali hai';
  if (UNSAFE.test(prompt)) return 'Refused: yeh image safe nahi hai, nahi bana sakta.';
  if (!takeQuota(ctx.ip, 'image')) return `Aaj ki image limit (${config.imageDailyLimit}) khatam. Kal try karo.`;
  const seed = Math.floor(Math.random() * 1e6);
  const url = await save(ctx, `image-${seed}.jpg`, await pollinate(prompt, ctx, seed));
  ctx.onMedia?.({ kind: 'image', url, name: `image-${seed}.jpg` });
  return `Image ban gayi: ${url} (user ko screen pe dikh rahi hai)`;
}

const LOGO_STYLES = [
  'minimal flat vector logo, simple geometric icon, solid background',
  'modern gradient emblem logo, centered icon, clean',
  'badge style circular logo with bold text, vintage',
  'monogram lettermark logo, elegant, high contrast',
];
export async function generate_logo({ name, idea = '', variants = 3 }, ctx) {
  name = String(name || '').slice(0, 60); if (!name) return 'Error: logo ka naam do';
  const n = Math.min(4, Math.max(2, Number(variants) || 3));
  const base = `"${name}" ${idea}`.slice(0, 300);
  if (UNSAFE.test(base)) return 'Refused: yeh logo safe nahi hai.';
  if (!takeQuota(ctx.ip, 'image', n)) return `Aaj ki image limit (${config.imageDailyLimit}) khatam. Kal try karo.`;
  const urls = [];
  for (let i = 0; i < n; i++) {
    const seed = Math.floor(Math.random() * 1e6), file = `logo-${i + 1}-${seed}.jpg`;
    try {
      const url = await save(ctx, file, await pollinate(`${LOGO_STYLES[i]}, brand name ${base}, text "${name}", professional logo design`, ctx, seed));
      ctx.onMedia?.({ kind: 'image', url, name: file }); urls.push(url);
    } catch (e) { console.warn('[logo] variant failed:', e.message); }
  }
  if (!urls.length) return 'Error: image service abhi busy hai, logo nahi ban paye. User ko baad mein try karne bolo.';
  return `${urls.length}/${n} logo variants ban gaye aur user ko screen pe dikh rahe hain: ${urls.join(', ')}. Inhe dobara mat banao.`;
}

export async function generate_music({ prompt, seconds = 10 }, ctx) {
  const token = (ctx.env || process.env).HF_TOKEN;
  if (!token) return 'Music abhi band hai: server pe HF_TOKEN set nahi hai (huggingface.co/settings/tokens se free milta hai).';
  prompt = String(prompt || '').slice(0, 300);
  if (UNSAFE.test(prompt)) return 'Refused: yeh safe nahi hai.';
  if (!takeQuota(ctx.ip, 'music', 1, config.musicDailyLimit)) return 'Aaj ki music limit khatam.';
  const f = ctx.fetch || fetch;
  const r = await f('https://api-inference.huggingface.co/models/facebook/musicgen-small', {
    method: 'POST', headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({ inputs: `instrumental, no vocals, ${prompt}`, parameters: { max_new_tokens: Math.min(512, Math.round(Math.min(15, seconds) * 50)) } }),
    signal: AbortSignal.timeout(120000),
  });
  if (!r.ok) return `Music service abhi busy hai (${r.status}), thodi der baad try karo.`;
  const type = r.headers.get('content-type') || 'audio/flac';
  const ext = type.includes('wav') ? 'wav' : type.includes('mpeg') ? 'mp3' : 'flac';
  const name = `music-${Date.now()}.${ext}`;
  const url = await save(ctx, name, Buffer.from(await r.arrayBuffer()));
  ctx.onMedia?.({ kind: 'audio', url, name });
  return `Music ban gaya: ${url}`;
}
