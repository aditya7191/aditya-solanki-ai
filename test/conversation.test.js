import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DIALOGUES, parseDialogueJSON, normalizeDialogue } from '../client/src/english/dialogues.js';
import * as P from '../client/src/english/progress.js';
import { generateDialogue, dialoguePrompt } from '../server/english.js';
import { mockProvider } from '../server/providers.js';
import { createApp } from '../server/app.js';

const sample = (n = 12) => ({ title: 'Salon mein', emoji: '💇', other: 'Barber', lines: Array.from({ length: n }, (_, i) => ({ who: i % 2 ? 'A' : 'B', en: `Line number ${i + 1}.`, say: `Laain nam-bar ${i + 1}`, hi: `Line ${i + 1}` })) });

test('dialogues: 15+ scenarios, hotel first, 10-16 lines, both speakers, Roman script', () => {
  assert.ok(DIALOGUES.length >= 15);
  assert.equal(DIALOGUES[0].id, 'hotel-order'); assert.equal(DIALOGUES[0].other, 'Waiter');
  const ids = DIALOGUES.map(d => d.id); assert.equal(new Set(ids).size, ids.length);
  for (const want of ['shop', 'doctor', 'auto', 'railway', 'bank', 'phone', 'panchayat', 'cricket', 'interview', 'checkin', 'directions', 'birthday', 'school', 'mobile-repair']) assert.ok(ids.includes(want), want);
  for (const d of DIALOGUES) {
    assert.ok(d.lines.length >= 10 && d.lines.length <= 16, `${d.id}: ${d.lines.length}`);
    assert.ok(/^[\w-]+$/.test(d.id) && d.title && d.emoji && d.me === 'Aditya');
    assert.ok(d.lines.filter(l => l.who === 'A').length >= 4 && d.lines.filter(l => l.who === 'B').length >= 4, d.id);
    for (const l of d.lines) {
      assert.ok(['A', 'B'].includes(l.who) && l.en && l.say && l.hi, `${d.id}: ${l.en}`);
      assert.ok(l.en.split(' ').length <= 16, `long line ${l.en}`);
      assert.ok(!/[\u0900-\u097F]/.test(l.en + l.say + l.hi), `Devanagari in ${d.id}`);
    }
  }
});

test('parseDialogueJSON: code fences, extra text, trailing commas, smart quotes', () => {
  const j = JSON.stringify(sample());
  assert.equal(parseDialogueJSON('```json\n' + j + '\n```').lines.length, 12);
  assert.equal(parseDialogueJSON('Here you go: ' + j + ' hope it helps').title, 'Salon mein');
  assert.equal(parseDialogueJSON('{"title":"x","lines":[{"who":"A","en":"Hi.",},],}').lines.length, 1);
  assert.equal(parseDialogueJSON('{“title”:“x”}').title, 'x');
  assert.equal(parseDialogueJSON('no json here'), null);
  assert.equal(parseDialogueJSON('{broken'), null);
});

test('normalizeDialogue: flexible speaker names, drops bad lines, rejects too short / one-sided', () => {
  const o = sample(); o.lines[0].who = 'Barber'; o.lines[1].who = 'Aditya'; o.lines.push({ who: 'A', en: 'मैं' }, { who: 'B' }, 'junk');
  const d = normalizeDialogue(o);
  assert.equal(d.lines.length, 12); assert.equal(d.lines[0].who, 'B'); assert.equal(d.lines[1].who, 'A');
  assert.equal(d.other, 'Barber'); assert.equal(d.custom, true);
  assert.equal(normalizeDialogue(sample(4)), null);
  assert.equal(normalizeDialogue({ lines: sample().lines.map(l => ({ ...l, who: 'A' })) }), null);
  assert.equal(normalizeDialogue(null), null);
  assert.equal(normalizeDialogue({ dialogue: sample().lines }, 'gas booking').title, 'gas booking');
  assert.equal(normalizeDialogue({ ...sample(30) }).lines.length, 18, 'capped');
});

test('generateDialogue: valid first try, repair retry, failure, situation in prompt', async () => {
  const p1 = mockProvider(['```json\n' + JSON.stringify(sample()) + '\n```']);
  assert.equal((await generateDialogue(p1, 'salon mein baal katwana')).lines.length, 12);
  assert.match(p1.calls[0][1].content, /salon mein baal katwana/); assert.match(p1.calls[0][1].content, /Mira Road/);
  const p2 = mockProvider(['sorry, here is a story', JSON.stringify(sample())]);
  assert.equal((await generateDialogue(p2, 'bank')).other, 'Barber'); assert.equal(p2.calls.length, 2);
  assert.match(p2.calls[1].at(-1).content, /ONLY the JSON/);
  await assert.rejects(generateDialogue(mockProvider(['bad', 'still bad']), 'bank'), e => e.status === 502);
  const p3 = mockProvider([new Error('down'), JSON.stringify(sample())]);
  await assert.rejects(generateDialogue(p3, 'bank'), e => e.status === 502); assert.equal(p3.calls.length, 1, 'no second slow try when chain failed');
  await assert.rejects(generateDialogue(p1, ' '), e => e.status === 400);
  assert.match(dialoguePrompt('x'.repeat(5)), /Return ONLY valid JSON/);
});

test('API /api/english/dialogue: ok, 400, 502, 503', async () => {
  const post = (port, body) => fetch(`http://127.0.0.1:${port}/api/english/dialogue`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  const s = createApp({ provider: mockProvider([JSON.stringify(sample()), 'bad', 'bad']) }).listen(0), port = s.address().port;
  try {
    const r = await post(port, { situation: 'salon' }); assert.equal(r.status, 200); assert.equal((await r.json()).dialogue.lines.length, 12);
    assert.equal((await post(port, {})).status, 400);
    const bad = await post(port, { situation: 'salon' }); assert.equal(bad.status, 502); assert.match((await bad.json()).error, /nahi ban payi/);
  } finally { s.close(); }
  const s2 = createApp({ provider: null }).listen(0);
  try { assert.equal((await post(s2.address().port, { situation: 'salon' })).status, 503); } finally { s2.close(); }
});

test('conversation progress: % from scored lines, read mode, XP, best kept', () => {
  assert.deepEqual(P.conversationResult([100, 80, 40]), { pct: 73, xp: 10 + 5 + 5 + 2 });
  assert.deepEqual(P.conversationResult([null, null, null]), { pct: null, xp: 16 });
  let p = P.completeConversation(P.empty(), 'hotel-order', [90, 70], '2026-11-16');
  assert.equal(p.xp, 20); assert.equal(p.convs['hotel-order'].best, 80); assert.equal(p.streak, 1);
  p = P.completeConversation(p, 'hotel-order', [10, 10], '2026-11-16');
  assert.equal(p.convs['hotel-order'].best, 80); assert.equal(p.convs['hotel-order'].times, 2);
  p = P.completeConversation(p, 'hotel-order', [null], '2026-11-16'); assert.equal(p.convs['hotel-order'].best, 80);
  const old = { ...P.empty() }; delete old.convs; assert.ok(P.completeConversation(old, 'bank', [50]).convs.bank, 'old saved progress without convs');
});
