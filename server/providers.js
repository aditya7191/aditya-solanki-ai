// Provider abstraction: har provider ka ek hi interface -> chat(messages) => text
// messages: [{role:'system'|'user'|'assistant', content}]
export class ProviderError extends Error { constructor(msg, status) { super(msg); this.status = status; } }
export const retryable = e => !e.status || e.status === 429 || e.status >= 500;
async function postJSON(url, body, headers = {}, timeoutMs = 25000, signal) {
  const sig = signal ? AbortSignal.any([signal, AbortSignal.timeout(timeoutMs)]) : AbortSignal.timeout(timeoutMs);
  const r = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: JSON.stringify(body), signal: sig });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new ProviderError(`${r.status} ${String(data?.error?.message || 'provider error').slice(0, 120)}`, r.status);
  return data;
}

export const DEFAULT_GEMINI_MODELS = 'gemini-3.5-flash-lite,gemini-flash-lite-latest,gemini-3.5-flash,gemini-3.8-flash';
export function geminiProvider(key, models = process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODELS) {
  const list = String(models).split(',').map(m => m.trim()).filter(Boolean);
  return fallbackProvider(list.map(m => withRetry(geminiModel(key, m))));
}
// 429/503 pe ek baar backoff ke saath retry; timeout pe seedha agla model
export function withRetry(p, { tries = 2, baseMs = 800 } = {}) {
  return { name: p.name, async chat(messages, opts) {
    for (let i = 1; ; i++) {
      try { return await p.chat(messages, opts); }
      catch (e) { if (i >= tries || !e.status || !retryable(e) || opts?.signal?.aborted) throw e; await new Promise(r => setTimeout(r, baseMs * i)); }
    }
  } };
}
function geminiModel(key, model) {
  return {
    name: 'gemini:' + model,
    async chat(messages, opts = {}) {
      const system = messages.filter(m => m.role === 'system').map(m => m.content).join('\n');
      const contents = messages.filter(m => m.role !== 'system').map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }));
      // key header mein jaati hai, URL/log mein nahi
      const d = await postJSON(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        { systemInstruction: { parts: [{ text: system }] }, contents }, { 'x-goog-api-key': key }, 25000, opts.signal);
      const out = d?.candidates?.[0]?.content?.parts?.map(p => (p.thought ? '' : p.text || '')).join('') || '';
      if (!out.trim()) throw new ProviderError('empty reply', 502);
      return out;
    },
  };
}

export function groqProvider(key, model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile') {
  return {
    name: 'groq',
    async chat(messages, opts = {}) {
      const d = await postJSON('https://api.groq.com/openai/v1/chat/completions', { model, messages }, { authorization: `Bearer ${key}` }, 25000, opts.signal);
      const out = d?.choices?.[0]?.message?.content || '';
      if (!out.trim()) throw new ProviderError('empty reply', 502);
      return out;
    },
  };
}

// Bina key ka free backup (Pollinations, OpenAI-compatible)
export function pollinationsTextProvider(model = process.env.POLLINATIONS_TEXT_MODEL || 'openai') {
  return withRetry({
    name: 'pollinations-text',
    async chat(messages, opts = {}) {
      const d = await postJSON('https://text.pollinations.ai/openai', { model, messages, private: true }, {}, 45000, opts.signal);
      const out = d?.choices?.[0]?.message?.content || '';
      if (!out.trim()) throw new ProviderError('empty reply', 502);
      return out;
    },
  });
}

// Primary (Gemini) chalao; agar hedgeMs tak jawab nahi aaya ya fail hua toh backup bhi start; jo pehle sahi jawab de woh jeete.
export function hedgedProvider(primary, backup, hedgeMs = Number(process.env.HEDGE_MS) || 9000) {
  return {
    name: `${primary.name}|${backup.name}`,
    chat(messages) {
      return new Promise((resolve, reject) => {
        const ac = new AbortController(); let done = false, backupStarted = false, fails = 0, lastErr;
        const win = r => { if (done) return; done = true; clearTimeout(t); ac.abort(); resolve(r); };
        const lose = e => { lastErr = e; if (++fails >= 2 && !done) { done = true; reject(lastErr); } else startBackup(); };
        const startBackup = () => { if (backupStarted || done) return; backupStarted = true; backup.chat(messages, { signal: ac.signal }).then(win, lose); };
        const t = setTimeout(startBackup, hedgeMs);
        primary.chat(messages, { signal: ac.signal }).then(win, lose);
      });
    },
  };
}

// Tests ke liye: pehle se likhe jawab ek-ek karke deta hai
export function mockProvider(replies) {
  const queue = [...replies];
  return { name: 'mock', calls: [], async chat(messages) { this.calls.push([...messages]); const r = queue.shift(); if (typeof r === 'function') return r(); if (r instanceof Error) throw r; return r ?? 'done'; } };
}

export function fallbackProvider(list) {
  return {
    name: list.map(p => p.name).join('+'),
    async chat(messages, opts) {
      let last;
      for (const p of list) {
        if (opts?.signal?.aborted) break;
        try { return await p.chat(messages, opts); } catch (e) { last = e; if (!opts?.signal?.aborted) console.warn(`[provider] ${p.name} failed: ${String(e.message).slice(0, 120)}`); }
      }
      throw last;
    },
  };
}

export class MissingKeyError extends Error {}

// Order: Gemini -> (hedge) Groq -> Pollinations text (free, no key). DISABLE_FREE_FALLBACK=1 se band.
export function providerFromEnv(env = process.env) {
  const backups = [];
  if (env.GROQ_API_KEY) backups.push(withRetry(groqProvider(env.GROQ_API_KEY)));
  if (env.DISABLE_FREE_FALLBACK !== '1') backups.push(pollinationsTextProvider());
  if (!env.GEMINI_API_KEY) return backups.length && env.GROQ_API_KEY ? fallbackProvider(backups) : null;
  const gemini = geminiProvider(env.GEMINI_API_KEY);
  return backups.length ? hedgedProvider(gemini, fallbackProvider(backups)) : gemini;
}
