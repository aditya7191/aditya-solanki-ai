import { test } from 'node:test'; import assert from 'node:assert/strict';
import { parseMd, parseInline, safeHref } from '../client/src/md.js';
test('bold/italic/code/link', () => {
  assert.deepEqual(parseInline('a **b** *c* `d` [e](https://x.com)').map(n => n.t), ['text', 'b', 'text', 'i', 'text', 'code', 'text', 'a']);
});
test('lists grouped', () => {
  const b = parseMd('- one\n- two\n1. x\n2. y');
  assert.equal(b[0].t, 'ul'); assert.equal(b[0].items.length, 2); assert.equal(b[1].t, 'ol');
});
test('unsafe links become text; raw HTML stays text', () => {
  assert.equal(safeHref('javascript:alert(1)'), null);
  assert.deepEqual(parseInline('[x](javascript:alert(1))')[0].t, 'text');
  const b = parseMd('<img src=x onerror=alert(1)>'); assert.equal(b[0].v[0].t, 'text');
  assert.equal(safeHref('/api/files/s/a.jpg'), '/api/files/s/a.jpg');
});
