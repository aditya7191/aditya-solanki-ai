import { createApp } from './app.js';
import { APP_NAME, config } from './config.js';
const app = createApp();
app.listen(config.port, () => console.log(`${APP_NAME} on :${config.port} (key ${process.env.GEMINI_API_KEY || process.env.GROQ_API_KEY ? 'set' : 'MISSING'})`));
