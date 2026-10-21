import express from 'express';
import path from 'node:path';
import { existsSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { APP_NAME, DEVELOPER, GREETING, config } from './config.js';
import { runAgent } from './agent.js';
import { providerFromEnv } from './providers.js';

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

export function createApp({ provider = providerFromEnv(), tools } = {}) {
  const app = express();
  app.set('trust proxy', 1);
  app.use(express.json({ limit: '200kb' }));
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
    try {
      await runAgent({ provider, history, sessionId, tools, onEvent: e => {
        if (e.type !== 'answer') return send(e);
        // jawab ko tukdon mein stream karo
        for (const chunk of e.text.match(/[\s\S]{1,40}/g) || ['']) send({ type: 'delta', text: chunk });
      } });
      send({ type: 'done' });
    } catch (e) {
      console.error('[chat] error:', e.message);
      send({ type: 'error', text: 'AI se baat nahi ho payi, thodi der baad try karo.' });
    }
    res.end();
  });
  const dist = new URL('../dist/', import.meta.url).pathname;
  if (existsSync(dist)) { app.use(express.static(dist)); app.get('*', (_q, r) => r.sendFile(path.join(dist, 'index.html'))); }
  return app;
}
