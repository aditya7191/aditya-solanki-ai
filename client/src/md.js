// Tiny safe markdown -> AST (no HTML ever). Supports **bold**, *italic*, `code`, [text](url), lists, headings.
export function parseInline(s) {
  const out = []; const re = /\*\*(.+?)\*\*|`([^`]+)`|\[([^\]]+)\]\(([^)\s]+)\)|\*(?!\s)([^*]+?)\*/g;
  let last = 0, m;
  while ((m = re.exec(s))) {
    if (m.index > last) out.push({ t: 'text', v: s.slice(last, m.index) });
    if (m[1] != null) out.push({ t: 'b', v: m[1] });
    else if (m[2] != null) out.push({ t: 'code', v: m[2] });
    else if (m[3] != null) { const href = safeHref(m[4]); out.push(href ? { t: 'a', v: m[3], href } : { t: 'text', v: m[3] }); }
    else out.push({ t: 'i', v: m[5] });
    last = re.lastIndex;
  }
  if (last < s.length) out.push({ t: 'text', v: s.slice(last) });
  return out;
}
export function safeHref(u) { return /^(https?:\/\/|\/api\/files\/)/i.test(u) ? u : null; }
export function parseMd(src = '') {
  const blocks = [];
  for (const line of src.split('\n')) {
    let m;
    if ((m = line.match(/^\s*[-*•]\s+(.*)/))) push('ul', m[1]);
    else if ((m = line.match(/^\s*\d+[.)]\s+(.*)/))) push('ol', m[1]);
    else if ((m = line.match(/^#{1,6}\s+(.*)/))) blocks.push({ t: 'h', v: parseInline(m[1]) });
    else if (/^\s*-{3,}\s*$/.test(line)) blocks.push({ t: 'hr' });
    else if (!line.trim()) blocks.push({ t: 'br' });
    else blocks.push({ t: 'p', v: parseInline(line) });
  }
  function push(t, text) { const b = blocks.at(-1); if (b?.t === t) b.items.push(parseInline(text)); else blocks.push({ t, items: [parseInline(text)] }); }
  return blocks;
}
