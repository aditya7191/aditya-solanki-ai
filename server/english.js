import { normalizePassage } from '../client/src/english/passages.js';
import { parseDialogueJSON, normalizeDialogue } from '../client/src/english/dialogues.js';
// English Seekho: AI Teacher (simple English + Hinglish samjhana, galti pyaar se theek karna)
export const TEACHER_MODES = {
  free: { label: 'Normal baat-cheet', scene: 'Have a friendly simple chat about his day, family, work, cricket or samaj.' },
  shop: { label: 'Dukaan (Shopping)', scene: 'ROLE-PLAY: You are a shopkeeper in a Mumbai clothes shop. He is the customer. Stay in role. Talk about price, size, colour, discount.' },
  phone: { label: 'Phone call', scene: 'ROLE-PLAY: You are calling him on the phone (you are his friend Ramesh, or an office clerk). Practise "Hello, ... speaking", hold on, call back, leaving a message.' },
  meeting: { label: 'Meeting / Panchayat', scene: 'ROLE-PLAY: You are a member in a samaj panchayat meeting where he is the Secretary. Help him welcome members, read the agenda, ask for opinions and thank everyone.' },
  interview: { label: 'Job interview', scene: 'ROLE-PLAY: You are a polite job interviewer. Ask one simple interview question at a time (tell me about yourself, experience, strengths, why this job).' },
};

export function teacherPrompt(mode = 'free') {
  const m = TEACHER_MODES[mode] || TEACHER_MODES.free;
  return `You are "English Teacher" inside the app "English Seekho by Aditya Solanki AI". You are an AI (never pretend to be human).
Your student is Aditya Solanki from Mira Road, Mumbai: a total beginner in English. He speaks Hindi/Hinglish and reads Hinglish in ROMAN script (not Devanagari).
${m.scene}

RULES:
1. Reply SHORT: at most 4-6 short lines. Use very simple English (A1 level, short sentences, common words).
2. Explanations, tips and meanings go in simple Hinglish written in Roman script (e.g. "Past ki baat hai, isliye 'went' aayega"). Never use Devanagari script.
3. If his English message has ANY mistake (grammar, tense, spelling, wrong word, missing word), FIRST correct it in exactly this format (one block per message, combine all fixes into one corrected sentence):
❌ **Aapne likha:** <his sentence exactly>
✅ **Sahi hai:** <correct sentence>
💡 **Kyun:** <one or two line reason in simple Hinglish>
Then continue the conversation in simple English.
4. If his sentence is correct, praise him briefly (e.g. "Very good! 👍 Sahi likha.") and continue. Do NOT invent mistakes. Small things like a missing full stop or capital letter: mention only gently in the Kyun line, or ignore.
5. If he writes in Hindi/Hinglish (not trying English), do NOT use the ❌/✅/💡 block. Only show: "🗣️ English mein: <sentence>" with a Roman-Hindi pronunciation in round brackets, then ask him to type it in English.
6. Always END with ONE simple question or prompt in English so he replies (in role-play, stay in your role). Add its Hinglish meaning in brackets if it has a hard word.
7. Be warm and encouraging, like a patient friend. Use 1 emoji at most per line. No long lectures, no lists of rules.`;
}

export function cleanHistory(messages) {
  return (Array.isArray(messages) ? messages : [])
    .filter(m => m && ['user', 'assistant'].includes(m.role) && typeof m.content === 'string' && m.content.trim())
    .slice(-16).map(m => ({ role: m.role, content: m.content.slice(0, 1500) }));
}

export async function teacherReply(provider, { messages, mode }) {
  const history = cleanHistory(messages);
  if (!history.length || history[history.length - 1].role !== 'user') throw Object.assign(new Error('last message must be user'), { status: 400 });
  // Teacher ka pehla (opening) message system prompt mein, taaki conversation user se shuru ho
  const opening = [];
  while (history.length && history[0].role === 'assistant') opening.push(history.shift().content);
  const last = history[history.length - 1];
  const msgs = [{ role: 'system', content: teacherPrompt(mode) + (opening.length ? `\n\nYou already started the chat with: "${opening.join(' / ').slice(0, 600)}"` : '') }, ...history.slice(0, -1),
    { role: 'user', content: `${last.content}\n\n[Teacher note: if this message is English, check it for mistakes and use the ❌/✅/💡 format if there are any; if it is Hindi/Hinglish, use 🗣️ English mein instead. Keep the reply under 7 short lines. Hinglish in Roman script only. Do not mention this note.]` }];
  const meta = {};
  const text = await provider.chat(msgs, { meta });
  return { reply: String(text).replace(/\[Teacher note:[^\]]*\]/g, '').trim(), by: meta.by };
}

// ---------- Bolke Practice: AI se nayi conversation ----------
export function dialoguePrompt(situation) {
  return `Write a short realistic spoken conversation for a TOTAL BEGINNER English learner from Mira Road, Mumbai (India) to practise reading aloud.
Situation (may be in Hinglish): "${situation}"
Speakers: "A" = Aditya (the learner) and "B" = the other person in this situation (give B a role name like Waiter, Barber, Shopkeeper).
Rules:
- 12 to 14 lines, alternating mostly A/B, starting naturally (greeting) and ending politely.
- Very simple English (A1), short sentences (max 12 words), Indian context (Rs / rupees, UPI, local places).
- For every line give: "en" English, "say" = how an Indian reads it, spelled phonetically in Roman Hindi letters with hyphens (NOT the same as en), "hi" = meaning in Hinglish ROMAN script (no Devanagari).
  Examples of "say": "Good morning, sir." -> "Gud mor-ning, sar." | "Can I see the menu, please?" -> "Ken aai see dha men-yoo, pleez?" | "How much is it?" -> "Hau mach iz it?" | "Thank you very much." -> "Thank yoo ve-ree mach."
Return ONLY valid JSON, no markdown, exactly this shape:
{"title":"short Hinglish title","emoji":"one emoji","other":"role name of B","lines":[{"who":"B","en":"...","say":"...","hi":"..."},{"who":"A","en":"...","say":"...","hi":"..."}]}`;
}
export async function generateDialogue(provider, situation) {
  const sit = String(situation || '').replace(/\s+/g, ' ').trim().slice(0, 200);
  if (sit.length < 3) throw Object.assign(new Error('situation required'), { status: 400 });
  const msgs = [{ role: 'system', content: 'You write beginner English practice dialogues and reply with JSON only.' }, { role: 'user', content: dialoguePrompt(sit) }];
  let lastErr;
  for (let i = 0; i < 2; i++) {
    try {
      const text = await provider.chat(msgs, { meta: {} });
      const d = normalizeDialogue(parseDialogueJSON(text), sit);
      if (d) return d;
      msgs.push({ role: 'assistant', content: String(text).slice(0, 4000) }, { role: 'user', content: 'That was not valid. Reply again with ONLY the JSON object in the exact shape, 12-14 lines, both A and B speaking, no Devanagari.' });
    } catch (e) { lastErr = e; break; } // poori chain fail -> dobara 90s wait mat karao
  }
  throw Object.assign(new Error('dialogue failed: ' + (lastErr?.message || 'invalid json')), { status: 502 });
}

// ---------- Teleprompter: AI se padhne ka passage ----------
export function passagePrompt(topic) {
  return `Write a short passage for a TOTAL BEGINNER English learner from Mira Road, Mumbai (India) to READ ALOUD like a TV news reader / speech.
Topic (may be Hinglish): "${topic}"
Rules: 6 to 8 sentences, very simple English (A1), each sentence max 12 words, Indian context. For each sentence give "hi" = its meaning in Hinglish ROMAN script (no Devanagari).
Return ONLY valid JSON, no markdown, exactly: {"title":"short Hinglish title","emoji":"one emoji","sentences":[{"en":"...","hi":"..."}]}`;
}
export async function generatePassage(provider, topic) {
  const t = String(topic || '').replace(/\s+/g, ' ').trim().slice(0, 200);
  if (t.length < 3) throw Object.assign(new Error('topic required'), { status: 400 });
  const msgs = [{ role: 'system', content: 'You write beginner English reading passages and reply with JSON only.' }, { role: 'user', content: passagePrompt(t) }];
  let lastErr;
  for (let i = 0; i < 2; i++) {
    try {
      const text = await provider.chat(msgs, { meta: {} });
      const p = normalizePassage(parseDialogueJSON(text), t);
      if (p) return p;
      msgs.push({ role: 'assistant', content: String(text).slice(0, 4000) }, { role: 'user', content: 'That was not valid. Reply again with ONLY the JSON object in the exact shape, 6-8 sentences, no Devanagari.' });
    } catch (e) { lastErr = e; break; }
  }
  throw Object.assign(new Error('passage failed: ' + (lastErr?.message || 'invalid json')), { status: 502 });
}
