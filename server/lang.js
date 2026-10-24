// Language detection: explicit request (Roman ya native script) > script of message. Conversation mein persist.
export const LANGS = {
  gu: { name: 'Gujarati', native: 'ગુજરાતી', rule: 'Reply ONLY in Gujarati language using Gujarati script (ગુજરાતી લિપિ). Do NOT use Hindi or Devanagari. Tool calls stay in the normal <tool> JSON format.' },
  hi: { name: 'Hindi', native: 'हिन्दी', rule: 'Reply ONLY in Hindi using Devanagari script (हिन्दी).' },
  mr: { name: 'Marathi', native: 'मराठी', rule: 'Reply ONLY in Marathi using Devanagari script (मराठी). Do NOT reply in Hindi.' },
  en: { name: 'English', native: 'English', rule: 'Reply ONLY in English.' },
  hinglish: { name: 'Hinglish', native: 'Hinglish', rule: 'Reply in Hinglish (Hindi words written in Roman/English letters).' },
};
const ASK = '(?:માં|મા|में|मध्ये|मधे|mein|me|main|ma|maa|man|madhe|madhye|language|bhasha|bhasa|bhashama|in|ma[a]?\\s*j)';
const WRITE = '(?:likho|likh|likhna|likhiye|lakho|lakhjo|lakhi|lakh|lakhvu|lihi|liha|lihun|bolo|bol|batao|jawab|reply|write|answer|respond|speak|talk|translate)';
const NAMES = {
  gu: '(?:gujarati|gujrati|gujarathi|gujju|ગુજરાતી)',
  hi: '(?:hindi|हिंदी|हिन्दी)',
  mr: '(?:marathi|मराठी)',
  en: '(?:english|angrezi|angreji|इंग्लिश)',
  hinglish: '(?:hinglish)',
};
export function explicitRequest(text = '') {
  const t = text.toLowerCase();
  let best = null, pos = -1;
  for (const [code, n] of Object.entries(NAMES)) {
    const re = new RegExp(`${n}\\s*${ASK}?\\s*(?:\\S+\\s+){0,4}?${WRITE}|${WRITE}\\s*(?:\\S+\\s+){0,3}?(?:in\\s+)?${n}|(?:in|into|to)\\s+${n}|${n}\\s*${ASK}`, 'giu');
    let m; while ((m = re.exec(t))) if (m.index > pos) { pos = m.index; best = code; }
  }
  return best;
}
export function scriptLang(text = '') {
  const gu = (text.match(/[\u0A80-\u0AFF]/g) || []).length, dev = (text.match(/[\u0900-\u097F]/g) || []).length;
  const latin = (text.match(/[a-z]/gi) || []).length;
  if (gu && gu >= dev && gu * 2 >= latin * 0.3) return 'gu';
  if (dev && dev * 2 >= latin * 0.3) return /(आहे|आहेत|काय|मला|तुम्ही|करा|नाही|आणि)/.test(text) ? 'mr' : 'hi';
  return null;
}
// history: user messages ke order mein; last explicit/native signal jeetta hai
export function conversationLanguage(history = []) {
  let lang = null;
  for (const m of history) if (m.role === 'user') lang = explicitRequest(m.content) || scriptLang(m.content) || lang;
  return lang;
}
export const hasScript = (lang, text) => lang === 'gu' ? /[\u0A80-\u0AFF]/.test(text) : (lang === 'hi' || lang === 'mr') ? /[\u0900-\u097F]/.test(text) : true;
