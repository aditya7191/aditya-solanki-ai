import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp } from 'node:fs/promises'; import { tmpdir } from 'node:os'; import path from 'node:path';
process.env.FILES_DIR = await mkdtemp(path.join(tmpdir(), 'karta-files-')) + '/';
const { runAgent, parseTool, systemPrompt } = await import('../server/agent.js');
const { mockProvider, fallbackProvider, providerFromEnv } = await import('../server/providers.js');
const { run_code, create_file, fetch_url } = await import('../server/tools.js');
const { createApp } = await import('../server/app.js');

test('parseTool', () => {
  assert.deepEqual(parseTool('<tool>{"name":"web_search","args":{"query":"x"}}</tool>'), { name: 'web_search', args: { query: 'x' } });
  assert.equal(parseTool('Namaste'), null);
  assert.equal(parseTool('<tool>{bad</tool>').name, '__bad__');
});

test('system prompt is AI persona, same language', () => {
  const p = systemPrompt(); assert.match(p, /Aditya Solanki AI/); assert.match(p, /AI ho/); assert.match(p, /Hinglish/);
});

test('agent loop: tool call then answer', async () => {
  const provider = mockProvider(['<tool>{"name":"web_search","args":{"query":"mausam"}}</tool>', 'Aaj dhoop hai']);
  const events = [];
  const tools = { web_search: async ({ query }) => [{ title: 'r', snippet: query }] };
  const out = await runAgent({ provider, history: [{ role: 'user', content: 'mausam?' }], sessionId: 't', tools, onEvent: e => events.push(e) });
  assert.equal(out, 'Aaj dhoop hai');
  assert.deepEqual(events.map(e => e.type), ['step', 'step_done', 'answer']);
  assert.match(provider.calls[1].at(-1).content, /tool result: web_search[\s\S]*mausam/);
});

test('unknown tool and tool error are fed back, not crash', async () => {
  const provider = mockProvider(['<tool>{"name":"nope","args":{}}</tool>', '<tool>{"name":"boom","args":{}}</tool>', 'ok']);
  const out = await runAgent({ provider, history: [], sessionId: 't', tools: { boom: async () => { throw new Error('fail'); } } });
  assert.equal(out, 'ok');
  assert.match(provider.calls[1].at(-1).content, /nahi hai/);
  assert.match(provider.calls[2].at(-1).content, /Error: fail/);
});

test('max steps stops loop', async () => {
  const provider = mockProvider(Array(10).fill('<tool>{"name":"t","args":{}}</tool>'));
  const out = await runAgent({ provider, history: [], sessionId: 't', tools: { t: async () => 'x' }, maxSteps: 3 });
  assert.match(out, /steps/); assert.equal(provider.calls.length, 3);
});

test('fallback provider uses second when first fails', async () => {
  const p = fallbackProvider([mockProvider([new Error('down')]), mockProvider(['hi'])]);
  assert.equal(await p.chat([]), 'hi');
});

test('providerFromEnv null without keys', () => { assert.equal(providerFromEnv({}), null); });

test('run_code js + python', async () => {
  assert.match(await run_code({ language: 'javascript', code: 'console.log(2+3)' }), /5/);
  assert.match(await run_code({ language: 'python', code: 'print(6*7)' }), /42/);
});

test('run_code timeout', async () => {
  assert.match(await run_code({ language: 'python', code: 'while True: pass' }), /timeout|killed/);
});

test('run_code no network', async () => {
  const r = await run_code({ language: 'python', code: 'import socket\ntry:\n  socket.create_connection(("1.1.1.1",80),3); print("NET_OK")\nexcept Exception as e: print("NET_BLOCKED")' });
  assert.match(r, /NET_BLOCKED/);
});

test('run_code js cannot read outside fs', async () => {
  const r = await run_code({ code: 'import fs from "node:fs"; try{fs.readFileSync("/etc/passwd");console.log("READ")}catch{console.log("DENIED")}' });
  assert.match(r, /DENIED/);
});

test('create_file sanitizes name', async () => {
  const files = []; const r = await create_file({ filename: '../../evil name.txt', content: 'hi' }, { sessionId: 's1', onFile: f => files.push(f) });
  assert.equal(files[0].name, 'evil_name.txt'); assert.match(r, /\/api\/files\/s1\//);
});

test('fetch_url blocks private', async () => { await assert.rejects(fetch_url({ url: 'http://127.0.0.1/' })); });

async function withServer(app, fn) {
  const s = app.listen(0); const base = `http://127.0.0.1:${s.address().port}`;
  try { await fn(base); } finally { s.close(); }
}

test('API: key missing message', async () => {
  await withServer(createApp({ provider: null }), async base => {
    const info = await (await fetch(base + '/api/info')).json();
    assert.equal(info.keyConfigured, false); assert.match(info.greeting, /Namaste 🙏 Main Aditya Solanki AI/);
    const t = await (await fetch(base + '/api/chat', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{"messages":[{"role":"user","content":"hi"}]}' })).text();
    assert.match(t, /API key missing/);
  });
});

test('API: streams steps, file, answer', async () => {
  const provider = mockProvider(['<tool>{"name":"create_file","args":{"filename":"a.txt","content":"hello"}}</tool>', 'File ready hai']);
  await withServer(createApp({ provider }), async base => {
    const t = await (await fetch(base + '/api/chat', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ sessionId: 'abc', messages: [{ role: 'user', content: 'file bana' }] }) })).text();
    const ev = t.trim().split('\n\n').map(l => JSON.parse(l.slice(6)));
    assert.deepEqual([...new Set(ev.map(e => e.type))], ['step', 'file', 'step_done', 'delta', 'done']);
    assert.equal(ev.filter(e => e.type === 'delta').map(e => e.text).join(''), 'File ready hai');
    assert.equal(await (await fetch(base + '/api/files/abc/a.txt')).text(), 'hello');
  });
});
