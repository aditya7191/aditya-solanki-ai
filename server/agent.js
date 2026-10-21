import { APP_NAME, DEVELOPER, config } from './config.js';
import { tools as defaultTools, toolDocs } from './tools.js';

export const systemPrompt = () => `Tum "${APP_NAME}" ho, ek AI assistant (developer: ${DEVELOPER}). Tum AI ho, insaan nahi — yeh kabhi mat chhupao.
User jis bhasha mein likhe (Hindi, English, Hinglish) usi mein jawab do.
Kaam karne ke liye tools hain:${toolDocs}
Tool chalana ho toh SIRF yeh likho, aur kuch nahi:
<tool>{"name":"web_search","args":{"query":"..."}}</tool>
Tool ka result agle message mein milega. Jab kaam ho jaye, normal text mein final jawab do (koi <tool> tag nahi).`;

export function parseTool(text) {
  const m = text.match(/<tool>([\s\S]*?)<\/tool>/);
  if (!m) return null;
  try { const j = JSON.parse(m[1].trim()); return { name: j.name, args: j.args || {} }; } catch { return { name: '__bad__', args: {} }; }
}

// onEvent({type:'step'|'step_done'|'file'|'answer', ...})
export async function runAgent({ provider, history, sessionId, onEvent = () => {}, tools = defaultTools, maxSteps = config.maxSteps }) {
  const messages = [{ role: 'system', content: systemPrompt() }, ...history];
  const ctx = { sessionId, onFile: f => onEvent({ type: 'file', ...f }) };
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
