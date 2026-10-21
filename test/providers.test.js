import { test } from 'node:test'; import assert from 'node:assert/strict';
import { hedgedProvider, withRetry, fallbackProvider, providerFromEnv, ProviderError, mockProvider } from '../server/providers.js';
const delay = (ms, v, err) => new Promise((res, rej) => setTimeout(() => err ? rej(err) : res(v), ms));

test('withRetry retries 503/429 then succeeds, not 400', async () => {
  const p = mockProvider([new ProviderError('busy', 503), 'ok']);
  assert.equal(await withRetry(p, { baseMs: 1 }).chat([]), 'ok');
  const q = mockProvider([new ProviderError('bad', 400), 'never']);
  await assert.rejects(withRetry(q, { baseMs: 1 }).chat([]), /bad/); assert.equal(q.calls.length, 1);
});

test('fallback chain: all Gemini fail -> backup answers', async () => {
  const g = fallbackProvider([mockProvider([new ProviderError('429 quota', 429)]), mockProvider([new Error('timeout')])]);
  const h = hedgedProvider(g, mockProvider(['backup jawab']), 50);
  assert.equal(await h.chat([]), 'backup jawab');
});

test('hedge: slow primary -> backup starts and wins fast', async () => {
  const h = hedgedProvider({ name: 'slow', chat: () => delay(500, 'slow') }, { name: 'fast', chat: () => delay(10, 'fast') }, 30);
  const t = Date.now(); assert.equal(await h.chat([]), 'fast'); assert.ok(Date.now() - t < 200);
});

test('hedge: fast primary wins, backup never called', async () => {
  const b = mockProvider(['b']);
  assert.equal(await hedgedProvider(mockProvider(['g']), b, 50).chat([]), 'g');
  await delay(80); assert.equal(b.calls.length, 0);
});

test('hedge: both fail -> rejects', async () => {
  await assert.rejects(hedgedProvider(mockProvider([new Error('a')]), mockProvider([new Error('b')]), 10).chat([]));
});

test('providerFromEnv wiring', () => {
  assert.equal(providerFromEnv({}), null);
  assert.match(providerFromEnv({ GEMINI_API_KEY: 'x' }).name, /gemini.*\|pollinations-text/);
  assert.match(providerFromEnv({ GEMINI_API_KEY: 'x', GROQ_API_KEY: 'y' }).name, /groq\+pollinations-text/);
  assert.doesNotMatch(providerFromEnv({ GEMINI_API_KEY: 'x', DISABLE_FREE_FALLBACK: '1' }).name, /pollinations/);
});
