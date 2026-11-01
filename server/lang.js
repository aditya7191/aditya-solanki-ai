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

// ---- Quality self-check: galat script / Hindi mixing pakdo ----
const HI_MARKERS = /(?:^|[\s,।.(])(है|हैं|हूँ|हूं|था|थे|और|नहीं|लिए|के लिए|के|को|से|में|आप|आपका|आपकी|आपके|हम|हमारा|हमारी|करें|कीजिए|सभी|होगा|होगी|रहें|रहेगा)(?=$|[\s,।.!?)])/g;
const MR_MARKERS = /(आहे|आहेत|होते|होता|मध्ये|साठी|आणि|तुम्ही|आपण|कृपया|कळवि|करावे|नाही|आपली|आपले|आपला|आम्ही|यांना|यांच्या|मला|त्यांना|वेळी)/g;
const HINGLISH = /\b(hai|hain|aap|aapka|aapki|kripya|kijiye|karein|hum|humare|hamare|mein|ko|ka|ki|ke|nahi|bahut|zaroor|aur|toh|yeh|woh|sabhi|aapko)\b/gi;
const cnt = (t, re) => (t.match(re) || []).length;
// null = theek; warna issue ka string
export function langIssue(lang, text = '') {
  const t = text.replace(/```[\s\S]*?```/g, '').replace(/\[Source:[^\]]*\]/g, '');
  const gu = cnt(t, /[\u0A80-\u0AFF]/g), dev = cnt(t, /[\u0900-\u097F]/g), lat = cnt(t, /[A-Za-z]/g);
  const words = (t.match(/\S+/g) || []).length;
  if (lang === 'gu') {
    if (!gu) return 'no Gujarati script';
    if (dev > 0) return 'contains Devanagari/Hindi characters';
    if (lat > gu * 0.5 && lat > 40) return 'too much Latin text';
  } else if (lang === 'mr') {
    if (!dev) return 'no Devanagari script';
    if (gu > 0) return 'contains Gujarati script';
    if (cnt(t, HI_MARKERS) >= 3 && cnt(t, HI_MARKERS) > cnt(t, MR_MARKERS)) return 'mixes Hindi words/grammar (है/का/की/के/में/और/आप...) into Marathi';
    if (lat > dev * 0.5 && lat > 40) return 'too much Latin text';
  } else if (lang === 'hi') {
    if (!dev) return 'no Devanagari script';
    if (gu > 0) return 'contains Gujarati script';
  } else if (lang === 'en') {
    if (gu + dev > 3) return 'contains non-English script';
    if (words > 8 && cnt(t, HINGLISH) >= 4 && cnt(t, HINGLISH) / words > 0.04) return 'contains Hindi/Hinglish words';
  }
  return null;
}
