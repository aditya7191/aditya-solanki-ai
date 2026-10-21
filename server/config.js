// App ka naam yahin badlo — poore app mein yahi use hota hai.
export const APP_NAME = 'Aditya Solanki AI';
export const GREETING = `Namaste 🙏 Main ${APP_NAME}, aapki kya help kar sakta hu?`;
export const DEVELOPER = 'Aditya Solanki';
export const config = {
  port: Number(process.env.PORT) || 3000,
  maxSteps: 8,
  codeTimeoutMs: 10000,
  rateLimit: { windowMs: 60_000, max: 20 },
  filesDir: process.env.FILES_DIR || new URL('../data/files/', import.meta.url).pathname,
};
