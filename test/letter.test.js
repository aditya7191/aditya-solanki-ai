import { test } from 'node:test'; import assert from 'node:assert/strict';
import { cleanInput, bodyHtml, buildHtml, makeDocx, DEFAULT_ORG } from '../server/letter.js';
import { createApp } from '../server/app.js';
import { spawnSync } from 'node:child_process';

test('cleanInput: rejects non-image data URLs, clamps margins, keeps default org', () => {
  const c = cleanInput({ text: 'hi', letterheadImage: 'https://evil.example/x.png', marginTop: 9999, org: { name: 'X'.repeat(500) } });
  assert.equal(c.img, null); assert.equal(c.top, 120); assert.equal(c.org.name.length, 200); assert.equal(c.org.sub, DEFAULT_ORG.sub);
  assert.equal(cleanInput({ text: 'hi', letterheadImage: 'data:image/png;base64,AAAA', marginTop: 9999 }).top, 120);
  assert.equal(cleanInput({ text: 'x', letterheadImage: 'data:image/svg+xml;base64,AAAA' }).img, null);
});
test('html is escaped (no injection)', () => {
  const h = buildHtml(cleanInput({ text: '<script>alert(1)</script> **b**', org: { name: '<img src=x>' } }));
  assert.ok(!h.includes('<script>')); assert.ok(!h.includes('<img src=x>')); assert.match(bodyHtml('**b**'), /<b>b<\/b>/);
});
test('docx export builds a valid zip (gu/mr/en)', async () => {
  for (const [lang, text] of [['gu', 'સવિનય જણાવવાનું કે'], ['mr', 'कळविण्यात येते की'], ['en', 'Dear Sir']]) {
    const b = await makeDocx(cleanInput({ text: `**Subject:** ${text}\n- a\n- b`, lang }));
    assert.equal(b.subarray(0, 2).toString(), 'PK');
  }
});
test('export endpoint: docx works, empty text 400, pdf if weasyprint present', async () => {
  const app = createApp({ provider: null }).listen(0); const base = `http://127.0.0.1:${app.address().port}`;
  try {
    const post = (b) => fetch(base + '/api/letterhead/export', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(b) });
    assert.equal((await post({ text: '' })).status, 400);
    const r = await post({ format: 'docx', text: 'Hello', lang: 'en' }); assert.equal(r.status, 200); assert.match(r.headers.get('content-type'), /wordprocessingml/);
    if (!spawnSync(process.env.WEASYPRINT_BIN || 'weasyprint', ['--version']).error) {
      const p = await post({ format: 'pdf', text: 'સવિનય', lang: 'gu' }); assert.equal(p.status, 200); assert.equal(Buffer.from(await p.arrayBuffer()).subarray(0, 4).toString(), '%PDF');
    }
  } finally { app.close(); }
});
