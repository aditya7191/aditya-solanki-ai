import { speak, canSpeak } from './speech.js';

export const BASE = '/english';
export const go = path => { history.pushState(null, '', BASE + path); dispatchEvent(new PopStateEvent('popstate')); window.scrollTo(0, 0); };

export function Top({ title, back = true, to = '' }) {
  return (
    <header className="sticky top-0 z-10 bg-gradient-to-r from-orange-500 to-pink-500 text-white px-3 py-3 flex items-center gap-3 shadow">
      {back ? <button onClick={() => go(to)} className="text-2xl w-10 h-10 rounded-full bg-white/20 active:bg-white/40" aria-label="Back">←</button>
        : <div className="w-10 h-10 rounded-full bg-white grid place-items-center text-2xl">📚</div>}
      <div className="flex-1 min-w-0">
        <div className="font-bold text-lg leading-tight truncate">{title}</div>
        <div className="text-[11px] opacity-90">English Seekho by Aditya Solanki AI · 🤖 AI</div>
      </div>
    </header>
  );
}

export const Btn = ({ className = '', ...a }) => <button {...a} className={`rounded-2xl font-semibold active:scale-[.98] transition disabled:opacity-50 ${className}`} />;
export const Listen = ({ text, slow, small }) => <button onClick={() => canSpeak() ? speak(text, { slow }) : alert('Is phone/browser mein awaaz wala feature nahi hai. Google Chrome use karo.')} aria-label="Suno"
  className={`${small ? 'text-sm px-2 py-1' : 'px-3 py-2'} rounded-full bg-sky-100 text-sky-800 active:bg-sky-200 shrink-0`}>{slow ? '🐢' : '🔊'}</button>;

