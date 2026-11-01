import { test } from 'node:test'; import assert from 'node:assert/strict';
import { isDrafting, isRevision, extractDraft, draftingPrompt, isLetterheadRequest } from '../server/drafting.js';
import { langIssue } from '../server/lang.js';
const { runAgent } = await import('../server/agent.js');
const { mockProvider } = await import('../server/providers.js');
const u = content => ({ role: 'user', content }), a = content => ({ role: 'assistant', content });

test('drafting requests detected', () => {
  for (const s of ['Meeting notice likho', 'Mira Road panchayat ke liye invitation likh do', 'Application likho', 'Speech likho', 'ek letter draft karo', 'मीटिंग की सूचना लिखो', 'નિમંત્રણ પત્ર લખો', 'बैठकीची सूचना लिहा', 'whatsapp message likho', 'write an email to the secretary'])
    assert.equal(isDrafting([u(s)]), true, s);
  for (const s of ['logo banao', 'chai ke fayde batao', 'hi', 'samaj kya hai'])
    assert.equal(isDrafting([u(s)]), false, s);
});
test('follow-up edits revise previous draft', () => {
  const h = [u('meeting notice likho'), a('Zaroor!\n---\n**Vishay:** Meeting\nDear members...\n---\nChahein toh...'), u('isko chhota karo')];
  assert.equal(isDrafting(h), true); assert.equal(isRevision(h), true);
  assert.equal(isDrafting([u('isko chhota karo')]), false);
  assert.equal(isDrafting([...h.slice(0, 2), u('Gujarati mein karo')]), true);
});
test('extractDraft takes text between --- lines', () => {
  assert.equal(extractDraft('intro\n---\nLine1\n\nLine2\n---\noffer'), 'Line1\n\nLine2');
  assert.equal(extractDraft('plain text'), 'plain text');
});
test('letterhead request detection', () => { assert.ok(isLetterheadRequest('Letterhead par banao')); assert.ok(!isLetterheadRequest('notice likho')); });
test('drafting prompt: layout, no slogans, per-language style', () => {
  const p = draftingPrompt('mr'); assert.match(p, /ONE short intro line/); assert.match(p, /no "Jai Guru Ravidas"/); assert.match(p, /MARATHI DRAFTING STYLE/);
  assert.match(draftingPrompt('gu'), /GUJARATI DRAFTING STYLE/); assert.match(draftingPrompt('en'), /Zero Hindi/);
});
test('agent: drafting prompt only on drafting turns, history passed for revisions', async () => {
  const p = mockProvider(['ok']);
  const hist = [u('notice likho'), a('x\n---\nVishay: a\n---\ny'), u('formal karo')];
  await runAgent({ provider: p, history: hist, sessionId: 'd' });
  assert.match(p.calls[0][0].content, /DRAFTING MODE/); assert.equal(p.calls[0].length, 4);
  const q = mockProvider(['ok']); await runAgent({ provider: q, history: [u('hello')], sessionId: 'd' });
  assert.doesNotMatch(q.calls[0][0].content, /DRAFTING MODE/);
});
test('langIssue: wrong script / Hindi mixing', () => {
  assert.equal(langIssue('gu', 'આપ સૌને જણાવવાનું કે બેઠક રવિવારે છે.'), null);
  assert.ok(langIssue('gu', 'आप सभी को सूचित किया जाता है'));
  assert.equal(langIssue('mr', 'सर्व सदस्यांना कळविण्यात येते की बैठक रविवारी आहे.'), null);
  assert.ok(langIssue('mr', 'आप सभी को सूचित किया जाता है कि बैठक रविवार को है और आपकी उपस्थिति अनिवार्य है।'));
  assert.equal(langIssue('en', 'Dear members, the meeting is on Sunday.'), null);
  assert.ok(langIssue('en', 'Aap sabhi ko suchit kiya jata hai ki hum aur aap mein baat hai, yeh zaroor aao toh'));
  assert.ok(langIssue('en', 'सूचना: बैठक'));
});
test('agent: Marathi reply with Hindi mixing gets retried', async () => {
  const bad = 'आप सभी को सूचित किया जाता है कि बैठक रविवार को है और आपकी उपस्थिति अनिवार्य है।', good = 'सर्व सदस्यांना कळविण्यात येते की बैठक रविवारी आहे.';
  const p = mockProvider([bad, good]);
  assert.equal(await runAgent({ provider: p, history: [u('marathi madhe notice liha')], sessionId: 'd' }), good);
});
