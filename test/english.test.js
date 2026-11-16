import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LESSONS, LEVELS, buildQuiz, scoreSpeech, normalize } from '../client/src/english/lessons.js';
import * as P from '../client/src/english/progress.js';
import { teacherPrompt, teacherReply, TEACHER_MODES } from '../server/english.js';
import { mockProvider } from '../server/providers.js';
import { createApp } from '../server/app.js';

const DEVANAGARI = /[\u0900-\u097F]/;

test('lessons: 30+ lessons, unique ids in order, valid levels', () => {
  assert.ok(LESSONS.length >= 30, `only ${LESSONS.length} lessons`);
  LESSONS.forEach((l, i) => assert.equal(l.id, i + 1));
  for (const l of LESSONS) assert.ok(l.level >= 0 && l.level < LEVELS.length && l.title && l.emoji);
  const titles = LESSONS.map(l => l.title).join(' | ').toLowerCase();
  for (const topic of ['introduction', 'greetings', 'numbers', 'din', 'family', 'routine', 'present', 'past', 'will', 'sawaal', 'phone', 'whatsapp', 'meeting', 'cricket', 'shopping'])
    assert.ok(titles.includes(topic), `topic missing: ${topic}`);
});

test('lessons: each has 5 words (en/hi/say), 3-5 sentences, Hinglish tip, Roman script only', () => {
  for (const l of LESSONS) {
    assert.equal(l.words.length, 5, `lesson ${l.id} words`);
    assert.ok(l.sentences.length >= 3 && l.sentences.length <= 5, `lesson ${l.id} sentences`);
    for (const w of l.words) assert.ok(w.en && w.hi && w.say, `lesson ${l.id} word ${w.en}`);
    for (const s of l.sentences) assert.ok(s.en && s.say && s.hi && /[.?!]$/.test(s.en), `lesson ${l.id} sentence ${s.en}`);
    assert.ok(l.tip.length > 20);
    assert.ok(!DEVANAGARI.test(JSON.stringify(l)), `lesson ${l.id} has Devanagari`);
  }
  const allWords = LESSONS.flatMap(l => l.words.map(w => w.en.toLowerCase()));
  assert.equal(new Set(allWords).size, allWords.length, 'duplicate words across lessons');
});

test('quiz: every lesson gets MCQ + fill-blank + Hindi-to-English, answer always among 4 unique options', () => {
  for (const l of LESSONS) {
    const qs = buildQuiz(l);
    const types = qs.map(q => q.type);
    assert.ok(types.includes('mcq') && types.includes('blank') && types.includes('hi2en'), `lesson ${l.id}: ${types}`);
    assert.ok(qs.length >= 4, `lesson ${l.id} has ${qs.length} questions`);
    for (const q of qs) {
      assert.equal(q.options.length, 4, `lesson ${l.id} ${q.type} options`);
      assert.equal(new Set(q.options.map(o => o.toLowerCase())).size, 4);
      assert.ok(q.options.includes(q.answer));
      if (q.type === 'blank') { assert.match(q.q, /____/); assert.equal(q.q.replace('Khaali jagah bharo: ', '').replace('____', q.answer), q.full); }
    }
  }
  assert.deepEqual(buildQuiz(LESSONS[0]), buildQuiz(LESSONS[0]), 'deterministic per seed');
});

test('speech score: perfect, partial, empty, numbers and punctuation', () => {
  assert.equal(scoreSpeech('My name is Aditya.', 'my name is aditya').score, 100);
  assert.equal(scoreSpeech('I have two brothers.', 'I have 2 brothers').score, 100);
  assert.equal(scoreSpeech("I don't know.", 'I dont know').score, 100);
  const part = scoreSpeech('I live in Mira Road.', 'I live Mira');
  assert.ok(part.score >= 40 && part.score < 90); assert.deepEqual(part.missing, ['in', 'road']);
  const none = scoreSpeech('Hello', ''); assert.equal(none.score, 0); assert.match(none.feedback, /sunai nahi/);
  assert.ok(scoreSpeech('Good morning', 'good morning good morning good morning').score < 100, 'extra words reduce score');
  assert.equal(normalize('  Hello,   SIR! '), 'hello sir');
});

test('progress: XP, streak continues/resets, words learned, flashcards', () => {
  let p = P.empty();
  p = P.completeLesson(p, 1, 4, 5, '2026-11-14');
  assert.equal(p.xp, 60); assert.equal(p.streak, 1); assert.equal(P.wordsLearned(p), 5);
  p = P.completeLesson(p, 1, 5, 5, '2026-11-15');
  assert.equal(p.xp, 110, 'no first-time bonus on repeat'); assert.equal(p.streak, 2); assert.equal(p.done[1].best, 5);
  p = P.addXp(p, 5, '2026-11-15'); assert.equal(p.streak, 2);
  assert.equal(P.liveStreak(p, '2026-11-16'), 2); assert.equal(P.liveStreak(p, '2026-11-18'), 0);
  p = P.addXp(p, 1, '2026-11-18'); assert.equal(p.streak, 1, 'gap resets streak');
  assert.equal(P.touch({ ...P.empty(), lastDay: '2026-12-31', streak: 3 }, '2027-01-01').streak, 4, 'year boundary');
  p = P.rateCard(p, 'name', true, '2026-11-18'); p = P.rateCard(p, 'name', true, '2026-11-18');
  assert.equal(p.cards.name, 2); assert.equal(P.reviseDeck(p).at(-1).en, 'name', 'known words go last');
  p = P.rateCard(p, 'name', false, '2026-11-18'); assert.equal(p.cards.name, 0);
  assert.equal(P.reviseDeck(P.empty()).length, 5, 'empty progress -> lesson 1 words');
  const store = new Map(); const s = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, v) };
  P.save(p, s); assert.deepEqual(P.load(s), p);
  assert.deepEqual(P.load({ getItem: () => '{bad json' }), P.empty());
});

test('teacher prompt: simple English, Hinglish Roman, correction format, role-play modes', () => {
  const t = teacherPrompt('free');
  assert.match(t, /Aapne likha/); assert.match(t, /Sahi hai/); assert.match(t, /Kyun/);
  assert.match(t, /ROMAN script/); assert.match(t, /Never use Devanagari/); assert.match(t, /AI/);
  for (const m of ['shop', 'phone', 'meeting', 'interview']) { assert.ok(TEACHER_MODES[m]); assert.match(teacherPrompt(m), /ROLE-PLAY/); }
  assert.equal(teacherPrompt('nonsense'), teacherPrompt('free'));
});

test('teacherReply: opening message moved to system, last user msg gets check note, note stripped', async () => {
  const provider = mockProvider(['❌ **Aapne likha:** I am go to market yesterday\n✅ **Sahi hai:** I went to the market yesterday.\n💡 **Kyun:** Past ki baat hai.\n\nWhat did you buy?']);
  const r = await teacherReply(provider, { mode: 'shop', messages: [{ role: 'assistant', content: 'Welcome to my shop!' }, { role: 'user', content: 'I am go to market yesterday' }] });
  assert.match(r.reply, /Sahi hai:\*\* I went to the market yesterday/);
  const sent = provider.calls[0];
  assert.equal(sent[0].role, 'system'); assert.match(sent[0].content, /shopkeeper/); assert.match(sent[0].content, /Welcome to my shop/);
  assert.equal(sent[1].role, 'user'); assert.match(sent[1].content, /^I am go to market yesterday/); assert.match(sent[1].content, /Teacher note/);
  assert.equal(sent.length, 2);
  await assert.rejects(teacherReply(provider, { messages: [{ role: 'assistant', content: 'hi' }] }), e => e.status === 400);
});

test('API /api/english/teacher: replies JSON, validates input, no-key message', async () => {
  const provider = mockProvider(['Very good! 👍 Sahi likha.\n\nWhat is your name?']);
  const s = createApp({ provider }).listen(0), base = `http://127.0.0.1:${s.address().port}`;
  const post = body => fetch(base + '/api/english/teacher', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  try {
    const r = await post({ mode: 'free', messages: [{ role: 'user', content: 'I am happy.' }] });
    assert.equal(r.status, 200); assert.match((await r.json()).reply, /Very good/);
    assert.equal((await post({ messages: [] })).status, 400);
    const modes = await (await fetch(base + '/api/english/modes')).json();
    assert.deepEqual(Object.keys(modes), ['free', 'shop', 'phone', 'meeting', 'interview']);
  } finally { s.close(); }
  const s2 = createApp({ provider: null }).listen(0);
  try {
    const r = await fetch(`http://127.0.0.1:${s2.address().port}/api/english/teacher`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ messages: [{ role: 'user', content: 'hi' }] }) });
    assert.equal(r.status, 503); assert.match((await r.json()).error, /Lessons aur quiz chalte/);
  } finally { s2.close(); }
  const bad = mockProvider([new Error('down')]);
  const s3 = createApp({ provider: bad }).listen(0);
  try {
    const r = await fetch(`http://127.0.0.1:${s3.address().port}/api/english/teacher`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ messages: [{ role: 'user', content: 'hi' }] }) });
    assert.equal(r.status, 502); assert.match((await r.json()).error, /busy/);
  } finally { s3.close(); }
});

test('/english serves PWA html with manifest; manifest + sw valid', async () => {
  const { existsSync, readFileSync } = await import('node:fs');
  if (!existsSync(new URL('../dist/index.html', import.meta.url))) return; // build ke baad hi
  const s = createApp({ provider: null }).listen(0), base = `http://127.0.0.1:${s.address().port}`;
  try {
    for (const u of ['/english', '/english/lesson/3', '/english/teacher']) {
      const h = await (await fetch(base + u)).text();
      assert.match(h, /rel="manifest" href="\/es\/manifest.webmanifest"/); assert.match(h, /English Seekho by Aditya Solanki AI/);
    }
    assert.doesNotMatch(await (await fetch(base + '/')).text(), /manifest/, 'main app untouched');
    const m = await (await fetch(base + '/es/manifest.webmanifest')).json();
    assert.equal(m.start_url, '/english'); assert.equal(m.display, 'standalone');
    for (const ic of m.icons) assert.equal((await fetch(base + ic.src)).status, 200);
    const sw = await fetch(base + '/sw.js'); assert.equal(sw.status, 200); assert.match(await sw.text(), /\/api\//);
  } finally { s.close(); }
  assert.ok(readFileSync(new URL('../client/public/sw.js', import.meta.url), 'utf8').includes("startsWith('/api/')"));
});
