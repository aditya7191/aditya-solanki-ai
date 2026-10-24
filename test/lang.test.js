import { test } from 'node:test'; import assert from 'node:assert/strict';
import { explicitRequest, scriptLang, conversationLanguage } from '../server/lang.js';
const { runAgent } = await import('../server/agent.js');
const { mockProvider, fallbackProvider, hedgedProvider } = await import('../server/providers.js');

test('explicit requests (Roman + native)', () => {
  for (const s of ['gujarati mein likho', 'Mane gujarati ma meeting no message lakhi aapo', 'gujrati me likhna', 'write in Gujarati', 'ગુજરાતી માં લખો', 'Gujarati ma lakho'])
    assert.equal(explicitRequest(s), 'gu', s);
  assert.equal(explicitRequest('marathi madhe liha'), 'mr');
  assert.equal(explicitRequest('hindi mein batao'), 'hi');
  assert.equal(explicitRequest('reply in english please'), 'en');
  assert.equal(explicitRequest('hinglish mein bolo'), 'hinglish');
  assert.equal(explicitRequest('chai ke fayde batao'), null);
  assert.equal(explicitRequest('pehle hindi mein tha, ab gujarati mein likho'), 'gu');
});
test('script detection', () => {
  assert.equal(scriptLang('તમે કેમ છો?'), 'gu');
  assert.equal(scriptLang('आप कैसे हो?'), 'hi');
  assert.equal(scriptLang('तुम्ही काय करत आहात?'), 'mr');
  assert.equal(scriptLang('hello bhai'), null);
});
test('persists until changed', () => {
  const h = [{ role: 'user', content: 'gujarati mein likho' }, { role: 'assistant', content: 'x' }, { role: 'user', content: 'ab meeting ka message do' }];
  assert.equal(conversationLanguage(h), 'gu');
  assert.equal(conversationLanguage([...h, { role: 'user', content: 'ab english mein likho' }]), 'en');
  assert.equal(conversationLanguage([{ role: 'user', content: 'hi' }]), null);
});
test('instruction goes to system + last user msg (every provider sees it)', async () => {
  const p = mockProvider(['નમસ્તે']);
  await runAgent({ provider: p, history: [{ role: 'user', content: 'gujarati ma lakho' }], sessionId: 'l' });
  assert.match(p.calls[0][0].content, /Gujarati script/); assert.match(p.calls[0].at(-1).content, /\[Instruction: Reply ONLY in Gujarati/);
});
test('post-check: Hindi reply for Gujarati -> one strict retry', async () => {
  const p = mockProvider(['नमस्ते, दिवाली की शुभकामनाएं', 'દિવાળીની શુભકામનાઓ']);
  const out = await runAgent({ provider: p, history: [{ role: 'user', content: 'gujarati mein likho: Diwali ki shubhkamnaye' }], sessionId: 'l' });
  assert.equal(out, 'દિવાળીની શુભકામનાઓ'); assert.equal(p.calls.length, 2); assert.match(p.calls[1].at(-1).content, /not in Gujarati/);
});
test('post-check retry only once; keeps original if still wrong', async () => {
  const p = mockProvider(['hindi 1', 'hindi 2', 'never']);
  assert.equal(await runAgent({ provider: p, history: [{ role: 'user', content: 'ગુજરાતી માં જવાબ આપો' }], sessionId: 'l' }), 'hindi 1');
  assert.equal(p.calls.length, 2);
});
test('no retry when language not requested', async () => {
  const p = mockProvider(['ok']); await runAgent({ provider: p, history: [{ role: 'user', content: 'hi' }], sessionId: 'l' });
  assert.equal(p.calls.length, 1);
});
test('provider name reported through fallback + hedge', async () => {
  const ev = [];
  const prov = hedgedProvider(fallbackProvider([Object.assign(mockProvider([new Error('x')]), { name: 'gemini:a' })]), fallbackProvider([Object.assign(mockProvider(['ok']), { name: 'pollinations-text' })]), 5);
  await runAgent({ provider: prov, history: [{ role: 'user', content: 'hi' }], sessionId: 'l', onEvent: e => ev.push(e) });
  assert.equal(ev.find(e => e.type === 'answer').provider, 'pollinations-text');
});
