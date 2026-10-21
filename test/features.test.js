import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile } from 'node:fs/promises'; import { tmpdir } from 'node:os'; import path from 'node:path';
process.env.FILES_DIR = await mkdtemp(path.join(tmpdir(), 'kf-files-')) + '/';
process.env.KNOWLEDGE_DIR = await mkdtemp(path.join(tmpdir(), 'kf-kb-'));
const { searchKB, saveDoc } = await import('../server/kb.js');
const { generate_image, generate_logo, generate_music, _resetQuota } = await import('../server/media.js');
const { tools } = await import('../server/tools.js');
const { systemPrompt, runAgent } = await import('../server/agent.js');
const { mockProvider } = await import('../server/providers.js');
const { createApp } = await import('../server/app.js');
beforeEach(() => _resetQuota());

const imgFetch = (calls = []) => async (url, o) => { calls.push({ url, o }); return new Response(Buffer.from([0xff, 0xd8, 1, 2]), { headers: { 'content-type': 'image/jpeg' } }); };

test('KB: BM25 ranks right doc, ignores placeholder README', async () => {
  await writeFile(path.join(process.env.KNOWLEDGE_DIR, 'README.md'), 'Panchayat placeholder Panchayat');
  await saveDoc('panchayat-5', 'Test fact: Panchayat 5 ki meeting ravivar ko hoti hai.\n\nAlag para: kuch aur.');
  await saveDoc('other.md', 'Cricket tournament details.');
  const r = await searchKB('panchayat 5 meeting kab');
  assert.equal(r[0].doc, 'panchayat-5.md'); assert.match(r[0].text, /ravivar/);
  assert.ok(!r.some(x => x.doc === 'README.md'));
  assert.deepEqual(await searchKB('xyzunknown'), []);
  assert.match(await tools.search_knowledge({ query: 'xyzunknown' }), /nahi mila/);
});

test('system prompt: KB first, cite, never invent samaj facts', () => {
  const p = systemPrompt();
  assert.match(p, /Rohidas Vanshi Vadhiyara Chamar Samaj/); assert.match(p, /PEHLE search_knowledge/);
  assert.match(p, /Source:/); assert.match(p, /kabhi apne se facts/);
});

test('admin API: password required, add/list/delete', async () => {
  process.env.ADMIN_PASSWORD = 'secret123';
  const s = createApp({ provider: null }).listen(0), base = `http://127.0.0.1:${s.address().port}`;
  try {
    assert.equal((await fetch(base + '/api/admin/docs')).status, 401);
    assert.equal((await fetch(base + '/api/admin/docs', { headers: { 'x-admin-password': 'wrong' } })).status, 401);
    const h = { 'x-admin-password': 'secret123', 'content-type': 'application/json' };
    const j = await (await fetch(base + '/api/admin/docs', { method: 'POST', headers: h, body: JSON.stringify({ name: '../hack.txt', content: 'x' }) })).json();
    assert.equal(j.name, 'hack.md');
    assert.ok((await (await fetch(base + '/api/admin/docs', { headers: h })).json()).some(d => d.name === 'hack.md'));
    assert.equal((await fetch(base + '/api/admin/docs/hack.md', { method: 'DELETE', headers: h })).status, 200);
    delete process.env.ADMIN_PASSWORD;
    assert.equal((await fetch(base + '/api/admin/docs', { headers: h })).status, 503);
  } finally { s.close(); }
});

test('generate_image: pollinations URL, saved file, media event', async () => {
  const calls = [], media = [];
  const r = await generate_image({ prompt: 'red fort sunset' }, { sessionId: 's', ip: '1', fetch: imgFetch(calls), onMedia: m => media.push(m) });
  assert.match(calls[0].url, /^https:\/\/image\.pollinations\.ai\/prompt\/red%20fort%20sunset\?/);
  assert.equal(media[0].kind, 'image'); assert.match(r, /Image ban gayi/);
});

test('generate_image: safety refusal, no fetch', async () => {
  const calls = [];
  assert.match(await generate_image({ prompt: 'nude person' }, { sessionId: 's', ip: '1', fetch: imgFetch(calls) }), /Refused/);
  assert.equal(calls.length, 0);
});

test('generate_image: per-IP daily limit', async () => {
  const ctx = { sessionId: 's', ip: '9.9.9.9', fetch: imgFetch() };
  for (let i = 0; i < 20; i++) await generate_image({ prompt: 'cat' }, ctx);
  assert.match(await generate_image({ prompt: 'cat' }, ctx), /limit/);
  assert.match(await generate_image({ prompt: 'cat' }, { ...ctx, ip: 'other' }), /ban gayi/);
});

test('generate_logo: 2-4 variants clamp, distinct styles', async () => {
  for (const [ask, want] of [[1, 2], [3, 3], [9, 4]]) {
    const calls = [], media = [];
    await generate_logo({ name: 'ChatPulse', variants: ask }, { sessionId: 's', ip: 'L' + ask, fetch: imgFetch(calls), onMedia: m => media.push(m) });
    assert.equal(media.length, want); assert.equal(new Set(calls.map(c => c.url.split('?')[0])).size, want);
  }
});

test('generate_music: graceful without HF_TOKEN', async () => {
  assert.match(await generate_music({ prompt: 'dhol' }, { sessionId: 's', env: {} }), /HF_TOKEN set nahi/);
});

test('generate_music: calls MusicGen with token, inline audio', async () => {
  const calls = [], media = [];
  const f = async (url, o) => { calls.push({ url, o }); return new Response(Buffer.from('fLaC'), { headers: { 'content-type': 'audio/flac' } }); };
  const r = await generate_music({ prompt: 'dhol beat', seconds: 8 }, { sessionId: 's', ip: 'm', env: { HF_TOKEN: 'hf_x' }, fetch: f, onMedia: m => media.push(m) });
  assert.match(calls[0].url, /musicgen-small/); assert.equal(calls[0].o.headers.authorization, 'Bearer hf_x');
  assert.match(JSON.parse(calls[0].o.body).inputs, /instrumental/);
  assert.equal(media[0].kind, 'audio'); assert.match(media[0].url, /\.flac$/); assert.match(r, /Music ban gaya/);
});

test('generate_music: service error handled', async () => {
  const f = async () => new Response('busy', { status: 503 });
  assert.match(await generate_music({ prompt: 'x' }, { sessionId: 's', ip: 'e', env: { HF_TOKEN: 't' }, fetch: f }), /busy/);
});

test('agent emits media event via image tool', async () => {
  const provider = mockProvider(['<tool>{"name":"generate_image","args":{"prompt":"diya"}}</tool>', 'Yeh rahi image']);
  const ev = [];
  await runAgent({ provider, history: [{ role: 'user', content: 'diya ki image' }], sessionId: 'a', ip: 'z', fetchImpl: imgFetch(), onEvent: e => ev.push(e) });
  assert.deepEqual(ev.map(e => e.type), ['step', 'media', 'step_done', 'answer']);
});
