// AI jawab = intro, '---', draft, '---', offer. Draft block alag nikalo (copy/letterhead ke liye).
export function splitDraft(text = '') {
  const parts = text.split(/\n[ \t]*-{3,}[ \t]*\n/);
  if (parts.length >= 3) return { intro: parts[0].trim(), draft: parts.slice(1, -1).join('\n\n---\n\n').trim(), outro: parts.at(-1).trim() };
  return null;
}
export const isLetterheadRequest = t => /letter\s*head|letterhead|लेटरहेड|લેટરહેડ/i.test(t || '');
export function guessLang(t = '') {
  const gu = (t.match(/[\u0A80-\u0AFF]/g) || []).length, dev = (t.match(/[\u0900-\u097F]/g) || []).length;
  return gu > dev && gu > 5 ? 'gu' : dev > 5 ? 'hi' : 'en';
}
