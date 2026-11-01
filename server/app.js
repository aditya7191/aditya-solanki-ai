import express from 'express';
import path from 'node:path';
import { existsSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { APP_NAME, DEVELOPER, GREETING, config } from './config.js';
import { runAgent } from './agent.js';
import { providerFromEnv } from './providers.js';
import { listDocs, saveDoc, deleteDoc } from './kb.js';
import { timingSafeEqual } from 'node:crypto';
import { cleanInput, makePdf, makeDocx, pdfToPng, DEFAULT_ORG } from './letter.js';

export function rateLimiter({ windowMs, max }) {
  const hits = new Map();
  return (req, res, next) => {
    const now = Date.now(), ip = req.ip;
    const h = hits.get(ip) || { n: 0, t: now };
    if (now - h.t > windowMs) { h.n = 0; h.t = now; }
    h.n++; hits.set(ip, h);
    if (h.n > max) return res.status(429).json({ error: 'Thoda ruko bhai, bahut requests aa gayi. 1 minute baad try karo.' });
    next();
  };
}

export function createApp({ provider = providerFromEnv(), tools, fetchImpl } = {}) {
  const app = express();
  app.set('trust proxy', 1);
  const big = express.json({ limit: '12mb' }), small = express.json({ limit: '2mb' }); // big: letterhead image / PDF routes
  app.use((q, r, n) => (q.path.startsWith('/api/letterhead') ? big : small)(q, r, n));
  const admin = (req, res, next) => {
    const want = process.env.ADMIN_PASSWORD, got = String(req.get('x-admin-password') || '');
    if (!want) return res.status(503).json({ error: 'ADMIN_PASSWORD set nahi hai' });
    const a = Buffer.from(got), b = Buffer.from(want);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return res.status(401).json({ error: 'Galat password' });
    next();
  };
  app.get('/api/admin/docs', rateLimiter(config.rateLimit), admin, async (_q, r) => r.json(await listDocs()));
  app.post('/api/admin/docs', rateLimiter(config.rateLimit), admin, async (q, r) => {
    if (!q.body?.name || typeof q.body.content !== 'string') return r.status(400).json({ error: 'name aur content chahiye' });
    r.json({ name: await saveDoc(q.body.name, q.body.content) });
  });
  app.delete('/api/admin/docs/:name', rateLimiter(config.rateLimit), admin, async (q, r) => { try { await deleteDoc(q.params.name); r.json({ ok: true }); } catch { r.status(404).end(); } });
  app.get('/api/letterhead/defaults', (_q, r) => r.json(DEFAULT_ORG));
  app.post('/api/letterhead/export', rateLimiter({ windowMs: 60_000, max: 10 }), async (q, r) => {
    const inp = cleanInput(q.body), fmt = q.body?.format === 'docx' ? 'docx' : 'pdf';
    if (!inp.text.trim()) return r.status(400).json({ error: 'text chahiye' });
    try {
      const buf = fmt === 'pdf' ? await makePdf(inp) : await makeDocx(inp);
      r.set({ 'content-type': fmt === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'content-disposition': `attachment; filename="letter.${fmt}"` }).send(buf);
    } catch (e) { console.error('[letterhead]', e.message); r.status(500).json({ error: 'File nahi ban payi, dobara try karo.' }); }
  });
  app.post('/api/letterhead/pdf-to-image', rateLimiter({ windowMs: 60_000, max: 10 }), async (q, r) => {
    const b64 = String(q.body?.data || '').replace(/^data:application\/pdf;base64,/, '');
    if (!/^[A-Za-z0-9+/=]+$/.test(b64) || b64.length > 9e6) return r.status(400).json({ error: 'Galat PDF' });
    try { r.json({ image: await pdfToPng(Buffer.from(b64, 'base64')) }); } catch (e) { r.status(422).json({ error: 'PDF padh nahi paya. Image (PNG/JPG) upload karo.' }); }
  });
  app.get('/api/health', (_q, r) => r.json({ ok: true }));
  app.get('/api/info', (_q, r) => r.json({ name: APP_NAME, developer: DEVELOPER, greeting: GREETING, keyConfigured: !!provider }));
  app.get('/api/files/:sid/:name', (req, res) => {
    const sid = req.params.sid.replace(/[^\w-]/g, ''), name = path.basename(req.params.name);
    const f = path.join(config.filesDir, sid, name);
    existsSync(f) ? res.download(f) : res.status(404).end();
  });
  app.post('/api/chat', rateLimiter(config.rateLimit), async (req, res) => {
    const history = (Array.isArray(req.body?.messages) ? req.body.messages : [])
      .filter(m => ['user', 'assistant'].includes(m.role) && typeof m.content === 'string').slice(-20)
      .map(m => ({ role: m.role, content: m.content.slice(0, 8000) }));
    const sessionId = String(req.body?.sessionId || randomUUID()).replace(/[^\w-]/g, '').slice(0, 64);
    res.set({ 'content-type': 'text/event-stream', 'cache-control': 'no-cache', connection: 'keep-alive' });
    const send = e => res.write(`data: ${JSON.stringify(e)}\n\n`);
    if (!provider) { send({ type: 'error', text: 'API key missing: server pe GEMINI_API_KEY set nahi hai. README dekho (free key aistudio.google.com se).' }); return res.end(); }
    let lastBy;
    try {
      await runAgent({ provider, history, sessionId, tools, ip: req.ip, fetchImpl, onEvent: e => {
        if (e.provider) lastBy = e.provider;
        if (e.type !== 'answer') return send(e);
        if (e.provider) console.log(`[chat] answered by ${e.provider}`);
        // jawab ko tukdon mein stream karo
        for (const chunk of e.text.match(/[\s\S]{1,40}/g) || ['']) send({ type: 'delta', text: chunk });
      } });
      send({ type: 'done', provider: lastBy });
    } catch (e) {
      console.error('[chat] error:', e.message);
      send({ type: 'error', text: 'Abhi saare AI servers busy hain 🙏 1 minute baad dobara bhejo.' });
    }
    res.end();
  });
  const dist = new URL('../dist/', import.meta.url).pathname;
  if (existsSync(dist)) { app.use(express.static(dist)); app.get('*', (_q, r) => r.sendFile(path.join(dist, 'index.html'))); }
  return app;
}
