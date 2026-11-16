// Progress localStorage mein: streak, XP, poore lessons, seekhe words, flashcard boxes
import { LESSONS } from './lessons.js';
export const KEY = 'englishSeekho.v1';
export const empty = () => ({ xp: 0, streak: 0, lastDay: null, done: {}, cards: {} });
export const dayStr = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const prevDay = s => { const [y, m, d] = s.split('-').map(Number); return dayStr(new Date(y, m - 1, d - 1)); };

export function load(store = globalThis.localStorage) {
  try { return { ...empty(), ...JSON.parse(store?.getItem(KEY) || '{}') }; } catch { return empty(); }
}
export function save(p, store = globalThis.localStorage) { try { store?.setItem(KEY, JSON.stringify(p)); } catch {} return p; }

// Aaj kuch practice kiya -> streak update
export function touch(p, today = dayStr()) {
  if (p.lastDay === today) return p;
  return { ...p, streak: p.lastDay && prevDay(today) === p.lastDay ? p.streak + 1 : 1, lastDay: today };
}
// Agar streak toot gaya (kal aur aaj kuch nahi) toh dikhane ke liye 0
export const liveStreak = (p, today = dayStr()) => (p.lastDay === today || (p.lastDay && prevDay(today) === p.lastDay) ? p.streak : 0);

export function completeLesson(p, lessonId, correct, total, today = dayStr()) {
  const l = LESSONS.find(x => x.id === lessonId); if (!l) return p;
  const first = !p.done[lessonId];
  const best = Math.max(p.done[lessonId]?.best || 0, correct);
  const cards = { ...p.cards }; for (const w of l.words) if (!(w.en in cards)) cards[w.en] = 0;
  const xp = p.xp + correct * 10 + (first ? 20 : 0);
  return touch({ ...p, xp, cards, done: { ...p.done, [lessonId]: { best, total, at: today } } }, today);
}
export const addXp = (p, n, today = dayStr()) => touch({ ...p, xp: p.xp + n }, today);
export const wordsLearned = p => Object.keys(p.cards).length;
export const level = p => Math.floor(p.xp / 200) + 1;

// Flashcards: box 0 = naya/bhool gaye ... box 4 = pakka yaad. Kam box wale pehle.
export function reviseDeck(p, n = 10) {
  const all = LESSONS.flatMap(l => l.words.map(w => ({ ...w, lesson: l.id })));
  let deck = all.filter(w => w.en in p.cards);
  if (!deck.length) deck = all.filter(w => w.lesson === 1);
  return deck.sort((a, b) => (p.cards[a.en] || 0) - (p.cards[b.en] || 0)).slice(0, n);
}
export function rateCard(p, en, known, today = dayStr()) {
  const box = p.cards[en] || 0;
  return touch({ ...p, xp: p.xp + (known ? 2 : 0), cards: { ...p.cards, [en]: known ? Math.min(4, box + 1) : 0 } }, today);
}
