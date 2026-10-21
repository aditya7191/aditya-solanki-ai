import { APP_NAME, DEVELOPER, config } from './config.js';
import { tools as defaultTools, toolDocs } from './tools.js';
import { SAMAJ } from './kb.js';

export const systemPrompt = () => `Tum "${APP_NAME}" ho, ek AI assistant (developer: ${DEVELOPER}). Tum AI ho, insaan nahi — yeh kabhi mat chhupao.
User jis bhasha mein likhe (Hindi, English, Hinglish) usi mein jawab do.
Kaam karne ke liye tools hain:${toolDocs}
Samaj (${SAMAJ}) ke baare mein koi bhi sawaal ho toh PEHLE search_knowledge chalao. Jawab sirf KB ke text se do aur doc ka naam cite karo, jaise [Source: naam.md]. Agar KB mein nahi mila toh saaf bolo "Yeh jaankari mere knowledge base mein abhi nahi hai" — samaj ke baare mein kabhi apne se facts, naam, tareekh ya number mat banao, aur web se samaj facts mat do.
Images/logo/music tools ke result user ko screen pe dikhte hain; link dobara likhne ki zarurat nahi.
Tool chalana ho toh SIRF yeh likho, aur kuch nahi:
<tool>{"name":"web_search","args":{"query":"..."}}</tool>
Tool ka result agle message mein milega. Jab kaam ho jaye, normal text mein final jawab do (koi <tool> tag nahi).`;

export function parseTool(text) {
  const m = text.match(/<tool>([\s\S]*?)<\/tool>/);
  if (!m) return null;
  try { const j = JSON.parse(m[1].trim()); return { name: j.name, args: j.args || {} }; } catch { return { name: '__bad__', args: {} }; }
}

// onEvent({type:'step'|'step_done'|'file'|'answer', ...})
export async function runAgent({ provider, history, sessionId, ip, env, fetchImpl, onEvent = () => {}, tools = defaultTools, maxSteps = config.maxSteps }) {
  const messages = [{ role: 'system', content: systemPrompt() }, ...history];
  const ctx = { sessionId, ip, env, fetch: fetchImpl, onFile: f => onEvent({ type: 'file', ...f }), onMedia: m => onEvent({ type: 'media', ...m }) };
  for (let i = 0; i < maxSteps; i++) {
    const reply = await provider.chat(messages);
    const call = parseTool(reply);
    if (!call) { onEvent({ type: 'answer', text: reply }); return reply; }
    messages.push({ role: 'assistant', content: reply });
    let result;
    if (!tools[call.name]) result = `Error: tool "${call.name}" nahi hai`;
    else {
      onEvent({ type: 'step', tool: call.name, args: call.args });
      try { result = await tools[call.name](call.args, ctx); } catch (e) { result = 'Error: ' + e.message; }
      onEvent({ type: 'step_done', tool: call.name });
    }
    const text = typeof result === 'string' ? result : JSON.stringify(result);
    messages.push({ role: 'user', content: `[tool result: ${call.name}]\n${text.slice(0, 8000)}` });
  }
  const msg = 'Bahut steps ho gaye, yahin rukta hu. Thoda simple karke dobara puchho.';
  onEvent({ type: 'answer', text: msg });
  return msg;
}
