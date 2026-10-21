# Aditya Solanki AI 🤖

Ek AI assistant jo peeche kaam karta hai: web search, website padhna, code chalana, files banana. Chat mein live dikhta hai "⚙️ Kaam ho raha hai...".
Developer: Aditya Solanki

> Naam badalna ho toh sirf `server/config.js` mein `APP_NAME` badlo.

## Free Gemini key kaise le (card nahi chahiye)
1. https://aistudio.google.com/apikey kholo
2. Gmail se login karo
3. **Create API key** dabao, key copy karo
4. `.env` file mein `GEMINI_API_KEY=...` daalo (ya Render pe Environment mein)

Optional backup: https://console.groq.com/keys se free key → `GROQ_API_KEY`.
Key na ho toh app chalega, bas "API key missing" bolega.

## Chalana
```
npm install
cp .env.example .env   # key daalo
npm run build && node --env-file=.env server/index.js   # http://localhost:3000
npm test
```

## Render (free)
Docker web service banao, env mein `GEMINI_API_KEY` daalo. Dockerfile ready hai.

## Safety
- Code sandbox: temp folder, 10s timeout, network band (`unshare -n`), JS ko sirf apne folder ka access.
- Har IP: 20 msg/minute. Keys logs mein kabhi print nahi hoti.
- Note: Render pe `unshare` allow na ho toh network block nahi hoga — public launch se pehle proper sandbox (container) lagana.
