// Provider abstraction: har provider ka ek hi interface -> chat(messages) => text
// messages: [{role:'system'|'user'|'assistant', content}]
async function postJSON(url, body, headers = {}) {
  const r = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: JSON.stringify(body), signal: AbortSignal.timeout(60000) });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`${r.status} ${data?.error?.message || 'provider error'}`);
  return data;
}

export function geminiProvider(key, model = process.env.GEMINI_MODEL || 'gemini-2.0-flash') {
  return {
    name: 'gemini',
    async chat(messages) {
      const system = messages.filter(m => m.role === 'system').map(m => m.content).join('\n');
      const contents = messages.filter(m => m.role !== 'system').map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }));
      // key header mein jaati hai, URL/log mein nahi
      const d = await postJSON(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        { systemInstruction: { parts: [{ text: system }] }, contents }, { 'x-goog-api-key': key });
      return d?.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('') || '';
    },
  };
}

export function groqProvider(key, model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile') {
  return {
    name: 'groq',
    async chat(messages) {
      const d = await postJSON('https://api.groq.com/openai/v1/chat/completions', { model, messages }, { authorization: `Bearer ${key}` });
      return d?.choices?.[0]?.message?.content || '';
    },
  };
}

// Tests ke liye: pehle se likhe jawab ek-ek karke deta hai
export function mockProvider(replies) {
  const queue = [...replies];
  return { name: 'mock', calls: [], async chat(messages) { this.calls.push([...messages]); const r = queue.shift(); if (r instanceof Error) throw r; return r ?? 'done'; } };
}

export function fallbackProvider(list) {
  return {
    name: list.map(p => p.name).join('+'),
    async chat(messages) {
      let last;
      for (const p of list) { try { return await p.chat(messages); } catch (e) { last = e; console.warn(`[provider] ${p.name} failed: ${e.message}`); } }
      throw last;
    },
  };
}

export class MissingKeyError extends Error {}

export function providerFromEnv(env = process.env) {
  const list = [];
  if (env.GEMINI_API_KEY) list.push(geminiProvider(env.GEMINI_API_KEY));
  if (env.GROQ_API_KEY) list.push(groqProvider(env.GROQ_API_KEY));
  if (!list.length) return null;
  return list.length === 1 ? list[0] : fallbackProvider(list);
}
