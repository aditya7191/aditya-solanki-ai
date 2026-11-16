// Teleprompter: padhne ke chhote passages (news-reader jaisa). sentence: [english, hinglish matlab]
import { normalize } from './lessons.js';
const T = (id, emoji, title, sentences) => ({ id, emoji, title, sentences: sentences.map(([en, hi]) => ({ en, hi })) });

export const PASSAGES = [
  T('intro', '🙋', 'Apna introduction', [
    ['Good morning, everyone.', 'Sabko suprabhat.'],
    ['My name is Aditya Solanki.', 'Mera naam Aditya Solanki hai.'],
    ['I live in Mira Road, Mumbai.', 'Main Mira Road, Mumbai mein rehta hu.'],
    ['I am the secretary of our samaj panchayat.', 'Main apni samaj panchayat ka secretary hu.'],
    ['I like cricket and I love my family.', 'Mujhe cricket pasand hai aur main apne parivaar se pyaar karta hu.'],
    ['Now I am learning English every day.', 'Ab main roz English seekh raha hu.'],
    ['Thank you.', 'Dhanyavaad.']]),
  T('news', '📺', 'News bulletin', [
    ['Good evening. Here is the news.', 'Shubh sandhya. Yeh hain aaj ki khabrein.'],
    ['Heavy rain fell in Mumbai today.', 'Aaj Mumbai mein bhaari baarish hui.'],
    ['Local trains are running late by twenty minutes.', 'Local trains bees minute der se chal rahi hain.'],
    ['Schools will remain open tomorrow.', 'Kal school khule rahenge.'],
    ['In sports, Mira Road Panchayat won the cricket final.', 'Khel mein, Mira Road Panchayat ne cricket final jeeta.'],
    ['The captain scored seventy runs.', 'Captain ne sattar run banaye.'],
    ['That is all for now. Thank you for watching.', 'Abhi ke liye itna hi. Dekhne ke liye dhanyavaad.']]),
  T('panchayat-speech', '🏛️', 'Panchayat meeting speech', [
    ['Respected elders and dear members, good evening.', 'Aadarniya bade-buzurg aur pyaare sadasya, namaste.'],
    ['I welcome you all to this meeting.', 'Main aap sabka is meeting mein swagat karta hu.'],
    ['Today we will discuss three important points.', 'Aaj hum teen zaroori baaton par charcha karenge.'],
    ['First, the education fund for our children.', 'Pehli, hamare bachchon ke liye shiksha fund.'],
    ['Second, the cricket tournament next month.', 'Doosri, agle mahine ka cricket tournament.'],
    ['Third, help for poor families in our samaj.', 'Teesri, samaj ke garib parivaaron ki madad.'],
    ['Please share your ideas freely.', 'Kripya apne vichaar khulkar batayein.'],
    ['Together we can make our samaj strong.', 'Milkar hum apne samaj ko majboot bana sakte hain.']]),
  T('commentary', '🏏', 'Cricket commentary', [
    ['Welcome to the final match of the tournament.', 'Tournament ke final match mein swagat hai.'],
    ['The bowler runs in and bowls.', 'Bowler daudta hai aur gend daalta hai.'],
    ['Oh, that is a big shot!', 'Arre, yeh bada shot hai!'],
    ['The ball goes over the boundary. It is a six!', 'Gend boundary ke paar. Chhakka!'],
    ['The crowd is very happy.', 'Darshak bahut khush hain.'],
    ['Now they need ten runs from six balls.', 'Ab chhe gend mein das run chahiye.'],
    ['What an exciting match this is!', 'Kya romanchak match hai!']]),
  T('weather', '🌦️', 'Weather report', [
    ['Here is today\'s weather report.', 'Yeh hai aaj ka mausam samachar.'],
    ['The sky will be cloudy in the morning.', 'Subah aasmaan mein baadal rahenge.'],
    ['There may be light rain in the afternoon.', 'Dopahar mein halki baarish ho sakti hai.'],
    ['The temperature will be thirty degrees.', 'Taapmaan tees degree rahega.'],
    ['Please carry an umbrella when you go out.', 'Bahar jaate samay chhaata le jaayein.'],
    ['Tomorrow will be sunny and hot.', 'Kal dhoop aur garmi rahegi.']]),
  T('festival', '🪔', 'Festival greeting speech', [
    ['Dear friends and family, happy Diwali to all of you.', 'Pyaare doston aur parivaar, aap sabko Diwali ki shubhkamnayein.'],
    ['Diwali is the festival of lights.', 'Diwali roshni ka tyohaar hai.'],
    ['It brings joy, peace and hope.', 'Yeh khushi, shaanti aur ummeed laata hai.'],
    ['Let us share sweets and help those in need.', 'Aaiye mithai baantein aur zarooratmandon ki madad karein.'],
    ['Please celebrate safely and keep our city clean.', 'Suraksha se manaiye aur shehar saaf rakhiye.'],
    ['May this new year bring you happiness and success.', 'Yeh naya saal aapke liye khushi aur safalta laaye.']]),
  T('thanks', '🙏', 'Thank-you speech', [
    ['Thank you all for coming today.', 'Aaj aane ke liye aap sabka dhanyavaad.'],
    ['This event was a big success because of you.', 'Yeh karyakram aapki wajah se safal hua.'],
    ['I thank our elders for their blessings.', 'Main bade-buzurgon ka unke aashirvaad ke liye dhanyavaad karta hu.'],
    ['I thank our youth for their hard work.', 'Main yuvaon ka unki mehnat ke liye dhanyavaad karta hu.'],
    ['A special thanks to our sponsors.', 'Hamare sponsors ka khaas dhanyavaad.'],
    ['Please have dinner before you leave.', 'Jaane se pehle kripya khana khaakar jaayein.'],
    ['Good night and take care.', 'Shubh raatri, apna khayal rakhein.']]),
  T('my-day', '☀️', 'Mera din', [
    ['I wake up at six in the morning.', 'Main subah chhe baje uthta hu.'],
    ['I drink tea and read the newspaper.', 'Main chai peeta hu aur akhbaar padhta hu.'],
    ['At nine, I go to work.', 'Nau baje main kaam par jaata hu.'],
    ['In the evening, I meet my friends.', 'Shaam ko main doston se milta hu.'],
    ['We talk about cricket and samaj work.', 'Hum cricket aur samaj ke kaam ki baat karte hain.'],
    ['At night, I eat dinner with my family.', 'Raat ko main parivaar ke saath khana khata hu.'],
    ['I sleep at eleven.', 'Main gyarah baje sota hu.']]),
  T('announcement', '📢', 'Tournament announcement', [
    ['Attention, please. This is an important announcement.', 'Kripya dhyan dein. Yeh zaroori soochna hai.'],
    ['The cricket tournament will start on Sunday.', 'Cricket tournament Ravivaar ko shuru hoga.'],
    ['Sixteen teams will play this year.', 'Is saal solah teams khelengi.'],
    ['The entry fee is one thousand rupees per team.', 'Entry fees har team ki ek hazaar rupaye hai.'],
    ['The last date to register is Friday.', 'Registration ki aakhri tareekh Shukravaar hai.'],
    ['Please contact the secretary for more details.', 'Zyada jaankari ke liye secretary se sampark karein.']]),
  T('birthday-wish', '🎂', 'Birthday wish speech', [
    ['Today is a very special day.', 'Aaj bahut khaas din hai.'],
    ['It is the birthday of my dear friend Suresh.', 'Aaj mere pyaare dost Suresh ka janamdin hai.'],
    ['He is kind, honest and always ready to help.', 'Woh dayalu, imaandaar aur hamesha madad ke liye taiyar rehta hai.'],
    ['Suresh, we are lucky to have you.', 'Suresh, hum kismat wale hain ki tum hamare saath ho.'],
    ['May God give you a long and happy life.', 'Bhagwan tumhe lambi aur khushhaal zindagi de.'],
    ['Happy birthday, my friend!', 'Janamdin mubarak, mere dost!']]),
  T('health', '🏃', 'Health tips', [
    ['Good health is real wealth.', 'Achhi sehat hi asli daulat hai.'],
    ['Drink eight glasses of water every day.', 'Roz aath glass paani piyo.'],
    ['Walk for thirty minutes in the morning.', 'Subah tees minute chalo.'],
    ['Eat fresh fruits and green vegetables.', 'Taaze phal aur hari sabziyan khao.'],
    ['Sleep for seven to eight hours at night.', 'Raat ko saat se aath ghante so.'],
    ['Stay happy and keep smiling.', 'Khush raho aur muskurate raho.']]),
  T('mumbai', '🌆', 'Mera shehar Mumbai', [
    ['Mumbai is a big and busy city.', 'Mumbai ek bada aur vyast shehar hai.'],
    ['People come here from all over India.', 'Yahan poore Bharat se log aate hain.'],
    ['Local trains are the lifeline of Mumbai.', 'Local trains Mumbai ki jaan hain.'],
    ['We have the sea, the beaches and tasty vada pav.', 'Yahan samundar, beach aur swadisht vada pav hai.'],
    ['Life here is fast, but people are helpful.', 'Yahan zindagi tez hai, par log madad karte hain.'],
    ['I am proud to live in Mumbai.', 'Mujhe Mumbai mein rehne par garv hai.']]),
];

// Koi bhi text -> sentences (apna text paste karne ke liye)
export function textToPassage(text, title = 'Mera text') {
  const clean = String(text || '').replace(/\s+/g, ' ').trim().slice(0, 3000);
  const parts = clean.match(/[^.!?]+[.!?]*/g)?.map(s => s.trim()).filter(s => /[a-z]/i.test(s)) || [];
  return parts.length ? { id: 'custom', emoji: '📝', title, sentences: parts.map(en => ({ en, hi: '' })), custom: true } : null;
}
// AI se aaya passage validate
export function normalizePassage(obj, topic = '') {
  if (!obj || typeof obj !== 'object' || !Array.isArray(obj.sentences)) return null;
  const s = (x, n) => (typeof x === 'string' ? x.replace(/\s+/g, ' ').trim().slice(0, n) : '');
  const sentences = obj.sentences.map(x => (typeof x === 'string' ? { en: s(x, 220), hi: '' } : { en: s(x?.en || x?.english, 220), hi: s(x?.hi || x?.hindi || x?.meaning, 260) }))
    .filter(x => x.en && /[a-z]/i.test(x.en) && !/[\u0900-\u097F]/.test(x.en + x.hi));
  if (sentences.length < 3) return null;
  return { id: 'custom', emoji: Array.from(s(obj.emoji, 12)).slice(0, 3).join('') || '📰', title: s(obj.title, 60) || s(topic, 60) || 'AI passage', sentences: sentences.slice(0, 12), custom: true };
}

// ---------- Mic follow: suna hua text target words se milao ----------
const NUMS = { '1': 'one', '2': 'two', '3': 'three', '4': 'four', '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine', '10': 'ten', '20': 'twenty', '30': 'thirty', '70': 'seventy', '100': 'hundred' };
export const tokens = s => normalize(s).split(' ').filter(Boolean).map(w => NUMS[w] || w);
function near(a, b) {
  if (a === b) return true;
  if (a.length < 4 || b.length < 4 || Math.abs(a.length - b.length) > 1) return false;
  let i = 0, j = 0, diff = 0;
  while (i < a.length && j < b.length) { if (a[i] === b[j]) { i++; j++; continue; } if (++diff > 1) return false; if (a.length > b.length) i++; else if (b.length > a.length) j++; else { i++; j++; } }
  return diff + (a.length - i) + (b.length - j) <= 1;
}
// target: normalized words; start: pointer; heard: words. window ke andar match mile toh aage badho.
export function followWords(target, start, heard, win = 4) {
  let p = start; const matched = [];
  for (const h of heard) {
    for (let j = p; j < Math.min(target.length, p + win); j++) if (near(target[j], h)) { matched.push(j); p = j + 1; break; }
  }
  return { pointer: p, matched };
}
export function readingScore(total, matchedSet) {
  return total ? Math.round((100 * matchedSet.size) / total) : 0;
}
