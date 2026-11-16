import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PASSAGES, textToPassage, normalizePassage, tokens, followWords, readingScore } from '../client/src/english/passages.js';
import * as P from '../client/src/english/progress.js';
import { generatePassage } from '../server/english.js';
import { mockProvider } from '../server/providers.js';
import { createApp } from '../server/app.js';

test('passages: 10+, required topics, sentences with Hinglish meaning, Roman only', () => {
  assert.ok(PASSAGES.length >= 10);
  const ids = PASSAGES.map(p => p.id); assert.equal(new Set(ids).size, ids.length);
  for (const want of ['intro', 'news', 'panchayat-speech', 'commentary', 'weather', 'festival', 'thanks']) assert.ok(ids.includes(want), want);
  for (const p of PASSAGES) {
    assert.ok(/^[\w-]+$/.test(p.id) && !p.id.startsWith('conv-') && p.title && p.emoji);
    assert.ok(p.sentences.length >= 5 && p.sentences.length <= 9, p.id);
    for (const s of p.sentences) { assert.ok(s.en && s.hi && /[.!?]$/.test(s.en), s.en); assert.ok(s.en.split(' ').length <= 14, s.en); }
    assert.ok(!/[\u0900-\u097F]/.test(JSON.stringify(p)), p.id);
  }
});

test('textToPassage: splits sentences, ignores junk, empty -> null', () => {
  const t = textToPassage('Hello friends.   Today is Monday! Are you ready?  ...');
  assert.deepEqual(t.sentences.map(s => s.en), ['Hello friends.', 'Today is Monday!', 'Are you ready?']);
  assert.equal(textToPassage('Good morning').sentences.length, 1);
  assert.equal(textToPassage('   '), null); assert.equal(textToPassage('१२३ ...'), null);
});

test('normalizePassage: accepts strings/objects, drops Devanagari, needs 3+', () => {
  const p = normalizePassage({ title: 'Ganpati', sentences: [{ en: 'Ganpati is here.', hi: 'Ganpati aa gaye.' }, 'We are happy.', { english: 'Let us dance.', hindi: 'Naache.' }, { en: 'गणपति' }] });
  assert.equal(p.sentences.length, 3); assert.equal(p.sentences[2].hi, 'Naache.'); assert.equal(p.custom, true);
  assert.equal(normalizePassage({ sentences: ['One.', 'Two.'] }), null); assert.equal(normalizePassage(null), null);
});

test('followWords: advances on matches, tolerates small errors/skips, ignores noise', () => {
  const target = tokens('Good evening. Here is the news.');
  assert.deepEqual(target, ['good', 'evening', 'here', 'is', 'the', 'news']);
  let r = followWords(target, 0, tokens('good evening'));
  assert.equal(r.pointer, 2); assert.deepEqual(r.matched, [0, 1]);
  r = followWords(target, 2, tokens('umm here the newz'));
  assert.equal(r.pointer, 6); assert.deepEqual(r.matched, [2, 4, 5], 'skipped "is", fuzzy "newz"');
  r = followWords(target, 0, tokens('news'));
  assert.equal(r.pointer, 0, 'too far ahead -> no jump');
  assert.equal(followWords(tokens('I have 2 brothers'), 0, tokens('I have two brothers')).pointer, 4);
  assert.equal(readingScore(6, new Set([0, 1, 2])), 50); assert.equal(readingScore(0, new Set()), 0);
});

test('reading progress: XP and best', () => {
  let p = P.completeReading(P.empty(), 'news', 80, '2026-11-16');
  assert.equal(p.xp, 18); assert.equal(p.reads.news.best, 80);
  p = P.completeReading(p, 'news', null, '2026-11-16'); assert.equal(p.xp, 33); assert.equal(p.reads.news.best, 80); assert.equal(p.reads.news.times, 2);
});

test('generatePassage + API: ok with fenced JSON, retry on bad, 400/502/503', async () => {
  const good = JSON.stringify({ title: 'Ganpati', emoji: '🐘', sentences: [{ en: 'Ganpati is coming.', hi: 'Ganpati aa rahe hain.' }, { en: 'We clean the house.', hi: 'Ghar saaf karte hain.' }, { en: 'We make modak.', hi: 'Modak banate hain.' }] });
  const pr = mockProvider(['oops', '```json\n' + good + '\n```']);
  const p = await generatePassage(pr, 'Ganpati festival');
  assert.equal(p.sentences.length, 3); assert.match(pr.calls[0][1].content, /Ganpati festival/); assert.equal(pr.calls.length, 2);
  await assert.rejects(generatePassage(pr, ''), e => e.status === 400);
  const s = createApp({ provider: mockProvider([good, 'bad', 'bad']) }).listen(0), base = `http://127.0.0.1:${s.address().port}`;
  const post = (b, u = base) => fetch(u + '/api/english/passage', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(b) });
  try {
    const r = await post({ topic: 'Ganpati' }); assert.equal(r.status, 200); assert.equal((await r.json()).passage.title, 'Ganpati');
    assert.equal((await post({})).status, 400);
    assert.equal((await post({ topic: 'Ganpati' })).status, 502);
  } finally { s.close(); }
  const s2 = createApp({ provider: null }).listen(0);
  try { assert.equal((await post({ topic: 'x y z' }, `http://127.0.0.1:${s2.address().port}`)).status, 503); } finally { s2.close(); }
});
