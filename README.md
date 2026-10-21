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

## Samaj Knowledge Base (Shree Sant Shiromani Rohidas Vanshi Vadhiyara Chamar Samaj, Mumbai Sthanik Panchayats 1-28)
- Docs `knowledge/` folder mein (.md/.txt). Abhi sirf placeholder README hai — koi samaj fact nahi.
- `ADMIN_PASSWORD` env set karo, phir `/admin` kholo: add / edit / delete / upload.
- AI samaj sawaal pe pehle KB search (BM25) karta hai, `[Source: doc.md]` cite karta hai, KB mein na ho toh saaf bolta hai — apne se facts nahi banata.
- Note: Render free pe disk temporary hai; permanent docs ke liye unhe git mein `knowledge/` mein commit karo.

## Image / Logo / Music
- Image + logo (2-4 variants): Pollinations.ai, key nahi chahiye. Limit: `IMAGE_DAILY_LIMIT` (default 20/IP/din). Unsafe prompts refuse.
- Music: Hugging Face MusicGen, `HF_TOKEN` chahiye (free: huggingface.co/settings/tokens). Na ho toh app bata deta hai. Limit `MUSIC_DAILY_LIMIT` (default 5).
