// Drafting mode: letter/notice/speech/application/invitation/message/email/poster likhne ya edit karne ke requests pehchano.
const KW = [
  // Roman (Hindi/Gujarati/Marathi/English)
  'likho', 'likh do', 'likh de', 'likhna', 'likhiye', 'lakho', 'lakhi aapo', 'lakhi do', 'liha', 'lihun', 'draft', 'write', 'compose', 'rewrite', 'rephrase', 'proofread',
  'letter', 'patra', 'patr', 'notice', 'suchana', 'soochna', 'application', 'arji', 'arz', 'avedan', 'nivedan', 'invitation', 'invite', 'nimantran', 'nimantran patrika', 'aamantran', 'speech', 'bhashan', 'bhasan', 'email', 'e-mail', 'mail', 'message', 'sandesh', 'poster text', 'poster ka text', 'poster ka matter', 'pamphlet text', 'shubhechha', 'wishes', 'condolence', 'shradhanjali', 'resolution', 'minutes', 'agenda', 'ahwal', 'report', 'certificate', 'recommendation',
  // native
  'લખો', 'લખ', 'અરજી', 'પત્ર', 'નોટિસ', 'સૂચના', 'આમંત્રણ', 'ભાષણ', 'સંદેશ', 'लिखो', 'लिख', 'लिहा', 'अर्ज', 'पत्र', 'सूचना', 'निमंत्रण', 'आमंत्रण', 'भाषण', 'संदेश', 'नोटिस', 'पोस्टर लिख',
];
const EDIT = /(chh?ota|chhoti|chota|short(er)?|lamba|lamb[ao]|bada|bigger|longer|detail|formal|informal|friendly|polite|simple|saral|sudhar|sudhaar|improve|fix|change|badal|edit|revise|rewrite|shorten|expand|translate|anuvad|isko|iske|is (?:ko|me|mein)|ye wala|yeh wala|usko|ise\b|isme|2 version|do version|(?:gujarati|gujrati|marathi|hindi|english|hinglish)\s*(?:mein|me|ma|madhe|maa)?\s*(?:kar|likh|bana|lakh|liha)|ગુજરાતી|મરાઠી|हिंदी|हिन्दी|मराठी|छोटा|छोटी|औपचारिक|લાંબુ|ટૂંકું|ટુંકું|लहान|मोठे|मोठा|अनौपचारिक)/i;
const kwRe = new RegExp(KW.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'iu');
const looksLikeDraft = t => /(^|\n)\s*---\s*(\n|$)/.test(t) || /(vishay|subject|विषय|વિષય|dear |respected|माननीय|માનનીય|सादर|સાદર)/i.test(t);

// history: [{role,content}]
export function isDrafting(history = []) {
  const last = [...history].reverse().find(m => m.role === 'user');
  if (!last) return false;
  const t = last.content || '';
  if (kwRe.test(t)) return true;
  // follow-up edit: pichhla assistant jawab draft jaisa tha
  const prevAi = [...history].reverse().find(m => m.role === 'assistant');
  return !!(prevAi && looksLikeDraft(prevAi.content || '') && EDIT.test(t) && t.length < 400);
}
export const isRevision = (history = []) => {
  const last = [...history].reverse().find(m => m.role === 'user');
  const prevAi = [...history].reverse().find(m => m.role === 'assistant');
  return !!(last && prevAi && looksLikeDraft(prevAi.content || '') && EDIT.test(last.content || '') && !/^\s*(ek|ak|a|an)\s/i.test(last.content));
};
export const isLetterheadRequest = t => /letter\s*head|letterhead|लेटरहेड|લેટરહેડ/i.test(t || '');

const LANG_STYLE = {
  gu: `GUJARATI DRAFTING STYLE: Use pure, natural, formal Gujarati in Gujarati script only. Formal vocabulary: "વિષય:", "માનનીય શ્રી/શ્રીમતી", "સવિનય જણાવવાનું કે", "આપ સૌને જણાવવાનું કે", "આપની ઉપસ્થિતિ અનિવાર્ય છે", "આભાર સહ", "આપનો વિશ્વાસુ", "તારીખ:", "સ્થળ:", "સમય:", "સૂચના". Use Gujarati postpositions (નો/ની/નું, માં, ને, થી, માટે, છે/છો/હતો), NEVER Hindi forms (का/की/के/है/में/को/और/आप/करें). Do not use Hindi words written in Gujarati script when a proper Gujarati word exists (use "અને" not "ઔર", "કૃપા કરીને" ok, "બેઠક" for meeting, "સભા" for assembly, "કાર્યક્રમ", "આમંત્રણ").`,
  mr: `MARATHI DRAFTING STYLE: Use pure, natural, formal Marathi in Devanagari only — NOT Hindi. Formal vocabulary: "विषय:", "प्रति,", "महोदय/महोदया", "सविनय नम्र निवेदन की", "कळविण्यात येते की", "आपली उपस्थिती अनिवार्य आहे", "आपला नम्र / आपला विश्वासू", "दिनांक:", "स्थळ:", "वेळ:", "सूचना". Use Marathi grammar (आहे/आहेत/होते, चा/ची/चे, मध्ये, ला, साठी, आणि, तुम्ही/आपण, करावे/कराल), NEVER Hindi forms (है/हैं/का/की/के/में/को/और/आप/करें/नहीं/लिए/सभी लोग). Use "बैठक" for meeting, "सभा", "कार्यक्रम", "निमंत्रण", "अर्ज".`,
  hi: `HINDI DRAFTING STYLE: Pure formal Hindi in Devanagari: "विषय:", "महोदय/महोदया", "सादर निवेदन है कि", "आपकी उपस्थिति अनिवार्य है", "धन्यवाद सहित", "भवदीय", "दिनांक:", "स्थान:", "समय:". No Marathi/Gujarati forms.`,
  en: `ENGLISH DRAFTING STYLE: Natural, polished, formal English with correct grammar and standard formats ("Subject:", "Dear Sir/Madam,", "Yours sincerely,", "Date:", "Venue:", "Time:"). Zero Hindi/Hinglish words anywhere (including the intro and the closing offer).`,
};

export const draftingPrompt = (lang) => `

DRAFTING MODE (ACTIVE) — behave exactly like ChatGPT when drafting:
1. Draft IMMEDIATELY. Ask at most ONE short clarifying question, and ONLY if critical info is truly missing and cannot be a placeholder. Otherwise use sensible [placeholders] like [तारीख]/[Date], [Venue], [Name] for unknown details (date, time, venue, names, phone, amount).
2. Reply layout (markdown, always this order):
   a) ONE short intro line (e.g. "Zaroor! Yeh raha aapka notice:") — in the SAME language as the reply.
   b) a line containing only --- 
   c) the complete ready-to-use draft with proper format: for letters/notices/applications: Date, (To / प्रति), Subject, salutation, body in short paragraphs, closing, signature block (name, designation, "Mira Road Sthanik Panchayat-28" if the user is the samaj secretary/sender context — otherwise [Name]). Use **bold** for Subject/headings and bullet or numbered lists for agenda/details (date, time, venue). For speech: opening, key points, close. For WhatsApp/short messages: short, natural, emojis only if friendly tone. For invitations: warm heading, event details block, closing request, host names.
   d) a line containing only ---
   e) ONE short offer line in the same language, like ChatGPT: e.g. "Chahein toh main ise chhota, aur formal, ya doosri bhasha (Gujarati/Marathi/English) mein kar sakta hu, ya Letterhead par bana sakta hu." (In Gujarati/Marathi/English replies translate this offer fully into that language.)
3. TONE: default formal & respectful for letters/notices/applications/speeches; friendly for WhatsApp/invitations among friends/family. If user says formal/friendly/short, follow it. When it is genuinely useful (e.g. tone is ambiguous), give "Version 1 (Formal)" and "Version 2 (Short)" — each one inside the --- blocks; otherwise one version.
4. REVISIONS ("chhota karo", "formal karo", "Gujarati mein karo", "date badlo", "isme X add karo"): take the PREVIOUS draft from the conversation, apply ONLY the requested change, keep everything else, and output the FULL revised draft in the same layout (short intro like "Ho gaya, yeh raha chhota version:"). Never start from scratch, never ask what to change. If translating, translate the previous draft faithfully.
5. Never add slogans, greetings or taglines the user did not ask for (e.g. no "Jai Guru Ravidas", no "Jai Hind"). Never invent facts (names, dates, numbers, bank details) — use placeholders. Samaj facts only from search_knowledge.
6. The draft text itself must be clean: no explanations, no notes inside the --- block.
${LANG_STYLE[lang] ? '\n' + LANG_STYLE[lang] : '\nLANGUAGE FOR DRAFT: if the user did not name a language, write letters/notices/applications/speeches in formal Hindi (Devanagari) and the intro/offer lines in the user\'s own style; WhatsApp messages follow the user\'s language style.'}`;

// Draft block nikalo ('---' ke beech), warna poora text
export function extractDraft(text = '') {
  const parts = text.split(/\n\s*---+\s*\n/);
  if (parts.length >= 3) return parts.slice(1, -1).join('\n\n---\n\n').trim();
  if (parts.length === 2 && /^\s*---+\s*$/m.test(text)) return parts[1].trim();
  return text.trim();
}
