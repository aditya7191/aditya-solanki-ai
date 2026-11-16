// English Seekho: beginner course (Level 0 upward). Pure data + helpers (server tests bhi isko import karte hain).
// word: [english, hindi matlab, bolne ka tareeka (Roman Hindi)]
// sentence: [english, bolne ka tareeka, hindi matlab]
const L = (id, level, emoji, title, words, sentences, tip) => ({ id, level, emoji, title, words: words.map(([en, hi, say]) => ({ en, hi, say })), sentences: sentences.map(([en, say, hi]) => ({ en, say, hi })), tip });

export const LEVELS = ['Level 0: Bilkul shuruaat', 'Level 1: Roz ki baatein', 'Level 2: Time aur tense', 'Level 3: Kaam ki English'];

export const LESSONS = [
  L(1, 0, '🙋', 'Apna introduction', [['name', 'naam', 'naym'], ['I am', 'main hu', 'aai em'], ['live', 'rehna', 'liv'], ['work', 'kaam karna', 'werk'], ['happy', 'khush', 'hai-pee']], [
    ['My name is Aditya.', 'Maai naym iz Aditya', 'Mera naam Aditya hai.'],
    ['I live in Mira Road.', 'Aai liv in Mira Road', 'Main Mira Road mein rehta hu.'],
    ['I am a secretary.', 'Aai em a se-kre-te-ree', 'Main secretary hu.'],
    ['I work in Mumbai.', 'Aai werk in Mumbai', 'Main Mumbai mein kaam karta hu.'],
    ['I am happy.', 'Aai em hai-pee', 'Main khush hu.']],
    'Apne baare mein bolna ho toh "I am" ya "My name is" se shuru karo. "I" (main) hamesha capital likhte hain.'),
  L(2, 0, '👋', 'Greetings: Namaste wali English', [['hello', 'namaste / hello', 'he-lo'], ['good morning', 'suprabhat', 'gud mor-ning'], ['thank you', 'dhanyavaad', 'thank yoo'], ['please', 'kripya', 'pleez'], ['sorry', 'maaf karna', 'so-ree']], [
    ['Hello, how are you?', 'He-lo, hau aar yoo?', 'Namaste, aap kaise ho?'],
    ['Good morning, sir.', 'Gud mor-ning, sar', 'Suprabhat, sir.'],
    ['I am fine, thank you.', 'Aai em faain, thank yoo', 'Main theek hu, dhanyavaad.'],
    ['Please sit down.', 'Pleez sit daun', 'Kripya baithiye.'],
    ['Sorry, I am late.', 'So-ree, aai em layt', 'Maaf karna, mujhe der ho gayi.']],
    'Subah "Good morning", dopahar "Good afternoon", shaam "Good evening". Raat ko jaate waqt "Good night" bolte hain.'),
  L(3, 0, '🔢', 'Numbers 1 se 10', [['one', 'ek (1)', 'van'], ['two', 'do (2)', 'too'], ['three', 'teen (3)', 'three'], ['five', 'paanch (5)', 'faaiv'], ['ten', 'das (10)', 'ten']], [
    ['I have two brothers.', 'Aai hev too bra-dhars', 'Mere do bhai hain.'],
    ['Give me one cup of tea.', 'Giv mee van kap of tee', 'Mujhe ek cup chai do.'],
    ['We need ten chairs.', 'Wee need ten chairs', 'Humein das kursiyan chahiye.'],
    ['The match is at five.', 'Dha match iz at faaiv', 'Match paanch baje hai.'],
    ['Three players are here.', 'Three play-ers aar heer', 'Teen khiladi yahan hain.']],
    'Baaki numbers: four (for)=4, six (siks)=6, seven (se-ven)=7, eight (ayt)=8, nine (naain)=9.'),
  L(4, 0, '💯', 'Bade numbers aur paisa', [['twenty', 'bees (20)', 'twen-tee'], ['hundred', 'sau (100)', 'han-dred'], ['thousand', 'hazaar (1000)', 'thau-zand'], ['rupees', 'rupaye', 'roo-peez'], ['price', 'keemat / daam', 'praais']], [
    ['The price is one hundred rupees.', 'Dha praais iz van han-dred roo-peez', 'Daam sau rupaye hai.'],
    ['I paid twenty rupees.', 'Aai payd twen-tee roo-peez', 'Maine bees rupaye diye.'],
    ['The prize is five thousand rupees.', 'Dha praaiz iz faaiv thau-zand roo-peez', 'Inaam paanch hazaar rupaye hai.'],
    ['What is the price?', 'Vot iz dha praais?', 'Iska daam kya hai?']],
    '"Lakh" ko English mein "one hundred thousand" kehte hain, par India mein log "one lakh" bhi samajh lete hain.'),
  L(5, 0, '📅', 'Hafte ke din', [['Monday', 'Somvaar', 'man-day'], ['Sunday', 'Ravivaar', 'san-day'], ['today', 'aaj', 'tu-day'], ['tomorrow', 'kal (aane wala)', 'tu-mo-ro'], ['week', 'hafta', 'week']], [
    ['Today is Monday.', 'Tu-day iz man-day', 'Aaj Somvaar hai.'],
    ['The meeting is on Sunday.', 'Dha mee-ting iz on san-day', 'Meeting Ravivaar ko hai.'],
    ['See you tomorrow.', 'See yoo tu-mo-ro', 'Kal milte hain.'],
    ['We play every week.', 'Wee play ev-ree week', 'Hum har hafte khelte hain.']],
    'Baaki din: Tuesday (tyooz-day), Wednesday (wenz-day), Thursday (thurz-day), Friday (fraai-day), Saturday (sa-tur-day). Din ka naam hamesha capital letter se.'),
  L(6, 0, '🗓️', 'Mahine aur tareekh', [['January', 'Janvari', 'jan-yu-ree'], ['month', 'mahina', 'manth'], ['year', 'saal', 'yeer'], ['date', 'tareekh', 'dayt'], ['birthday', 'janamdin', 'barth-day']], [
    ['My birthday is in January.', 'Maai barth-day iz in jan-yu-ree', 'Mera janamdin January mein hai.'],
    ['What is the date today?', 'Vot iz dha dayt tu-day?', 'Aaj tareekh kya hai?'],
    ['The tournament is next month.', 'Dha toor-na-ment iz nekst manth', 'Tournament agle mahine hai.'],
    ['This year is very good.', 'Dhis yeer iz ve-ree gud', 'Yeh saal bahut achha hai.']],
    'Tareekh aise bolo: "the fifth of March" ya "March fifth". 1st = first, 2nd = second, 3rd = third, baaki mein "th" lagta hai.'),
  L(7, 0, '👨‍👩‍👧', 'Family', [['father', 'pitaji', 'faa-dhar'], ['mother', 'maa', 'ma-dhar'], ['brother', 'bhai', 'bra-dhar'], ['sister', 'behen', 'sis-tar'], ['son', 'beta', 'san']], [
    ['My father is a farmer.', 'Maai faa-dhar iz a faar-mar', 'Mere pitaji kisaan hain.'],
    ['My mother cooks well.', 'Maai ma-dhar kuks vel', 'Meri maa achha khana banati hain.'],
    ['This is my brother.', 'Dhis iz maai bra-dhar', 'Yeh mera bhai hai.'],
    ['My sister lives in Pune.', 'Maai sis-tar livz in Pune', 'Meri behen Pune mein rehti hai.'],
    ['My son goes to school.', 'Maai san goz tu skool', 'Mera beta school jaata hai.']],
    'Beti = daughter (daa-tar), pati = husband (haz-band), patni = wife (waaif). "He" ladke ke liye, "she" ladki ke liye.'),
  L(8, 0, '🎨', 'Rang aur cheezein', [['red', 'laal', 'red'], ['blue', 'neela', 'bloo'], ['white', 'safed', 'waait'], ['bag', 'thaila', 'beg'], ['phone', 'phone', 'fon']], [
    ['My phone is black.', 'Maai fon iz blek', 'Mera phone kaala hai.'],
    ['This bag is red.', 'Dhis beg iz red', 'Yeh thaila laal hai.'],
    ['Our team wears blue.', 'Aawar teem weyrz bloo', 'Hamari team neela pehenti hai.'],
    ['I like white shirts.', 'Aai laaik waait sharts', 'Mujhe safed shirt pasand hai.']],
    'English mein rang cheez se PEHLE aata hai: "red bag" (laal thaila), "bag red" nahi.'),
  L(9, 1, '☀️', 'Roz ka routine', [['wake up', 'uthna', 'wayk ap'], ['eat', 'khaana', 'eet'], ['go', 'jaana', 'go'], ['sleep', 'sona', 'sleep'], ['every day', 'roz', 'ev-ree day']], [
    ['I wake up at six.', 'Aai wayk ap at siks', 'Main chhe baje uthta hu.'],
    ['I eat breakfast every day.', 'Aai eet brek-fast ev-ree day', 'Main roz naashta karta hu.'],
    ['I go to work at nine.', 'Aai go tu werk at naain', 'Main nau baje kaam par jaata hu.'],
    ['I sleep at eleven.', 'Aai sleep at i-le-ven', 'Main gyarah baje sota hu.']],
    'Roz hone wali baat ke liye simple present: I eat, I go, I sleep. Bas verb ki pehli form.'),
  L(10, 1, '🧍', 'Simple Present: he / she', [['he', 'woh (ladka)', 'hee'], ['she', 'woh (ladki)', 'shee'], ['plays', 'khelta hai', 'playz'], ['goes', 'jaata hai', 'goz'], ['likes', 'pasand karta hai', 'laaiks']], [
    ['He plays cricket.', 'Hee playz kri-ket', 'Woh cricket khelta hai.'],
    ['She goes to the market.', 'Shee goz tu dha maar-ket', 'Woh bazaar jaati hai.'],
    ['He likes tea.', 'Hee laaiks tee', 'Use chai pasand hai.'],
    ['She works in a bank.', 'Shee werks in a benk', 'Woh bank mein kaam karti hai.']],
    'He / She / naam ke saath verb mein "s" ya "es" lagta hai: I play, par he plays. I go, par she goes.'),
  L(11, 1, '🚫', 'Nahi bolna: do not / does not', [['not', 'nahi', 'not'], ['do not', 'nahi karta (I/we/they)', 'doo not'], ['does not', 'nahi karta (he/she)', 'daz not'], ['know', 'jaanna', 'no'], ['understand', 'samajhna', 'an-der-stand']], [
    ['I do not know.', 'Aai doo not no', 'Mujhe nahi pata.'],
    ['I do not understand.', 'Aai doo not an-der-stand', 'Mujhe samajh nahi aaya.'],
    ['He does not drink tea.', 'Hee daz not drink tee', 'Woh chai nahi peeta.'],
    ['We do not play on Monday.', 'Wee doo not play on man-day', 'Hum Somvaar ko nahi khelte.']],
    'Bolne mein chhota roop: do not = don\'t (dont), does not = doesn\'t (da-zent). "Does not" ke baad verb mein "s" nahi lagta.'),
  L(12, 1, '❓', 'Sawaal poochna', [['what', 'kya', 'vot'], ['where', 'kahan', 'veyr'], ['when', 'kab', 'ven'], ['who', 'kaun', 'hoo'], ['why', 'kyun', 'vaai']], [
    ['What is your name?', 'Vot iz yor naym?', 'Aapka naam kya hai?'],
    ['Where do you live?', 'Veyr doo yoo liv?', 'Aap kahan rehte ho?'],
    ['When is the meeting?', 'Ven iz dha mee-ting?', 'Meeting kab hai?'],
    ['Who is the captain?', 'Hoo iz dha kep-tan?', 'Captain kaun hai?'],
    ['Why are you sad?', 'Vaai aar yoo sed?', 'Tum udaas kyun ho?']],
    'Sawaal mein "kya/kahan/kab" wala word sabse pehle aata hai: What... Where... Aur aakhir mein "?" lagao.'),
  L(13, 1, '🙋‍♂️', 'Haan / nahi wale sawaal', [['do you', 'kya tum/aap', 'doo yoo'], ['are you', 'kya tum ho', 'aar yoo'], ['can', 'sakna', 'ken'], ['yes', 'haan', 'yes'], ['no', 'nahi', 'no']], [
    ['Do you like cricket?', 'Doo yoo laaik kri-ket?', 'Kya aapko cricket pasand hai?'],
    ['Are you free today?', 'Aar yoo free tu-day?', 'Kya aap aaj free ho?'],
    ['Can you help me?', 'Ken yoo help mee?', 'Kya aap meri madad kar sakte ho?'],
    ['Yes, I can.', 'Yes, aai ken', 'Haan, main kar sakta hu.'],
    ['No, I am busy.', 'No, aai em bi-zee', 'Nahi, main busy hu.']],
    'Hindi ka "kya" (haan/nahi wala) English mein Do / Are / Can se shuru hota hai: "Do you...?", "Are you...?", "Can you...?"'),
  L(14, 1, '👉', 'This, that, here, there', [['this', 'yeh (paas)', 'dhis'], ['that', 'woh (door)', 'dhet'], ['here', 'yahan', 'heer'], ['there', 'wahan', 'dheyr'], ['come', 'aana', 'kam']], [
    ['This is my house.', 'Dhis iz maai haus', 'Yeh mera ghar hai.'],
    ['That is our ground.', 'Dhet iz aawar graund', 'Woh hamara maidan hai.'],
    ['Come here, please.', 'Kam heer, pleez', 'Kripya yahan aao.'],
    ['Put the bag there.', 'Put dha beg dheyr', 'Thaila wahan rakh do.']],
    '"th" ko halka "dh" bolo: this = dhis, that = dhet. Zubaan daanton ke beech halki si lagao.'),
  L(15, 1, '🍛', 'Khana aur chai', [['water', 'paani', 'vo-tar'], ['food', 'khana', 'food'], ['hungry', 'bhookh lagna', 'han-gree'], ['want', 'chahna', 'vont'], ['tea', 'chai', 'tee']], [
    ['I am hungry.', 'Aai em han-gree', 'Mujhe bhookh lagi hai.'],
    ['I want some water.', 'Aai vont sam vo-tar', 'Mujhe thoda paani chahiye.'],
    ['The food is very tasty.', 'Dha food iz ve-ree tays-tee', 'Khana bahut swadisht hai.'],
    ['Would you like tea?', 'Wud yoo laaik tee?', 'Kya aap chai lenge?']],
    '"Mujhe chahiye" = "I want" (ghar/dost ke saath). Bahar izzat se bolna ho toh "I would like..." (aai wud laaik) bolo.'),
  L(16, 2, '🏃', 'Abhi ho raha hai: -ing', [['am', 'hu', 'em'], ['is', 'hai', 'iz'], ['are', 'hain / ho', 'aar'], ['doing', 'kar raha', 'doo-ing'], ['now', 'abhi', 'nau']], [
    ['I am eating now.', 'Aai em ee-ting nau', 'Main abhi kha raha hu.'],
    ['He is playing cricket.', 'Hee iz play-ing kri-ket', 'Woh cricket khel raha hai.'],
    ['They are coming.', 'Dhey aar ka-ming', 'Woh log aa rahe hain.'],
    ['What are you doing?', 'Vot aar yoo doo-ing?', 'Tum kya kar rahe ho?']],
    'Abhi chal rahi baat = am/is/are + verb+ing. I am, he/she is, we/you/they are.'),
  L(17, 2, '⏪', 'Beeta hua kal: Simple Past', [['yesterday', 'kal (beeta hua)', 'yes-tar-day'], ['went', 'gaya (go ka past)', 'went'], ['played', 'khela', 'playd'], ['ate', 'khaya', 'ayt'], ['saw', 'dekha', 'so']], [
    ['I went to the market yesterday.', 'Aai went tu dha maar-ket yes-tar-day', 'Main kal bazaar gaya tha.'],
    ['We played a match.', 'Wee playd a match', 'Humne ek match khela.'],
    ['I ate rice at night.', 'Aai ayt raais at naait', 'Maine raat ko chawal khaye.'],
    ['I saw a movie.', 'Aai so a moo-vee', 'Maine ek film dekhi.']],
    'Past mein verb badalta hai. Kai verbs mein "ed" lagta hai (play → played). Kuch apne hi hain: go → went, eat → ate, see → saw. "I am go yesterday" galat hai, sahi hai "I went yesterday".'),
  L(18, 2, '📜', 'Past: was / were / did not', [['was', 'tha (I/he/she)', 'voz'], ['were', 'the (we/you/they)', 'ver'], ['did', 'kiya', 'did'], ['did not', 'nahi kiya', 'did not'], ['last', 'pichhla', 'laast']], [
    ['I was at home.', 'Aai voz at hom', 'Main ghar par tha.'],
    ['They were very happy.', 'Dhey ver ve-ree hai-pee', 'Woh bahut khush the.'],
    ['I did not go to work.', 'Aai did not go tu werk', 'Main kaam par nahi gaya.'],
    ['Did you eat?', 'Did yoo eet?', 'Kya tumne khana khaya?'],
    ['We won the last match.', 'Wee van dha laast match', 'Hum pichhla match jeete.']],
    '"Did" ke baad verb apni pehli form mein rehta hai: "I did not go" (sahi), "I did not went" (galat).'),
  L(19, 2, '⏩', 'Aane wala kal: will', [['will', 'karega / hoga', 'vil'], ['next', 'agla', 'nekst'], ['later', 'baad mein', 'lay-tar'], ['call', 'phone karna / bulana', 'kol'], ['soon', 'jaldi', 'soon']], [
    ['I will call you later.', 'Aai vil kol yoo lay-tar', 'Main tumhe baad mein phone karunga.'],
    ['We will win the next match.', 'Wee vil vin dha nekst match', 'Hum agla match jeetenge.'],
    ['The meeting will start soon.', 'Dha mee-ting vil start soon', 'Meeting jaldi shuru hogi.'],
    ['Will you come tomorrow?', 'Vil yoo kam tu-mo-ro?', 'Kya tum kal aaoge?']],
    'Future = will + verb ki pehli form. Sabke saath "will" hi: I will, he will, they will. Chhota roop: I\'ll (aail).'),
  L(20, 2, '🎯', 'Plan batana: going to', [['going to', 'karne wala hu', 'go-ing tu'], ['plan', 'yojana / plan', 'plen'], ['buy', 'khareedna', 'baai'], ['visit', 'milne jaana', 'vi-zit'], ['tonight', 'aaj raat', 'tu-naait']], [
    ['I am going to buy a bat.', 'Aai em go-ing tu baai a bet', 'Main ek bat khareedne wala hu.'],
    ['We are going to visit my uncle.', 'Wee aar go-ing tu vi-zit maai an-kal', 'Hum mere chacha se milne jaane wale hain.'],
    ['What is your plan tonight?', 'Vot iz yor plen tu-naait?', 'Aaj raat tumhara kya plan hai?'],
    ['She is going to cook tonight.', 'Shee iz go-ing tu kuk tu-naait', 'Woh aaj raat khana banane wali hai.']],
    'Pehle se socha hua plan ho toh "going to" bolo. Abhi turant faisla ho toh "will": "I will help you."'),
  L(21, 2, '🕐', 'Time poochna aur batana', [['time', 'samay', 'taaim'], ['o\'clock', 'baje', 'o-klok'], ['half past', 'saadhe', 'haaf paast'], ['early', 'jaldi / pehle', 'er-lee'], ['late', 'der se', 'layt']], [
    ['What time is it?', 'Vot taaim iz it?', 'Kitne baje hain?'],
    ['It is five o\'clock.', 'It iz faaiv o-klok', 'Paanch baje hain.'],
    ['It is half past six.', 'It iz haaf paast siks', 'Saadhe chhe baje hain.'],
    ['Please come early.', 'Pleez kam er-lee', 'Kripya jaldi aana.'],
    ['Sorry, I am late.', 'So-ree, aai em layt', 'Maaf karna, mujhe der ho gayi.']],
    'Sava (¼) = quarter past, Pauna = quarter to. Jaise sava paanch = quarter past five.'),
  L(22, 2, '💪', 'Can / can\'t: kar sakta hu', [['can\'t', 'nahi kar sakta', 'kaant'], ['speak', 'bolna', 'speek'], ['drive', 'gaadi chalana', 'draaiv'], ['English', 'angrezi', 'ing-lish'], ['little', 'thoda', 'li-tal']], [
    ['I can speak a little English.', 'Aai ken speek a li-tal ing-lish', 'Main thodi angrezi bol sakta hu.'],
    ['He can\'t drive a car.', 'Hee kaant draaiv a kaar', 'Woh car nahi chala sakta.'],
    ['Can you speak slowly?', 'Ken yoo speek slo-lee?', 'Kya aap dheere bol sakte ho?'],
    ['I can learn English.', 'Aai ken lern ing-lish', 'Main angrezi seekh sakta hu.']],
    '"Can" ke baad verb seedha: I can speak (sahi), I can speaking (galat). "Can you...?" bolke madad maango, bahut kaam aata hai.'),
  L(23, 3, '📞', 'Phone call', [['speaking', 'bol raha hu', 'spee-king'], ['call back', 'wapas phone karna', 'kol bek'], ['hold on', 'ek minute ruko', 'hold on'], ['busy', 'vyast', 'bi-zee'], ['message', 'sandesh', 'me-sej']], [
    ['Hello, Aditya speaking.', 'He-lo, Aditya spee-king', 'Hello, main Aditya bol raha hu.'],
    ['Can I speak to Ramesh?', 'Ken aai speek tu Ramesh?', 'Kya meri Ramesh se baat ho sakti hai?'],
    ['Please hold on.', 'Pleez hold on', 'Kripya ek minute ruko.'],
    ['I am busy, I will call back.', 'Aai em bi-zee, aai vil kol bek', 'Main busy hu, wapas phone karunga.'],
    ['Can I leave a message?', 'Ken aai leev a me-sej?', 'Kya main message chhod sakta hu?']],
    'Phone uthaate hi "Hello, ___ speaking" bolo. Awaaz na aaye toh: "Sorry, I can\'t hear you" (aai kaant heer yoo).'),
  L(24, 3, '💬', 'WhatsApp message', [['reach', 'pahunchna', 'reech'], ['on the way', 'raaste mein', 'on dha way'], ['send', 'bhejna', 'send'], ['photo', 'photo', 'fo-to'], ['okay', 'theek hai', 'o-kay']], [
    ['I am on the way.', 'Aai em on dha way', 'Main raaste mein hu.'],
    ['I will reach in ten minutes.', 'Aai vil reech in ten mi-nits', 'Main das minute mein pahunchunga.'],
    ['Please send the photo.', 'Pleez send dha fo-to', 'Kripya photo bhejo.'],
    ['Okay, see you soon.', 'O-kay, see yoo soon', 'Theek hai, jaldi milte hain.'],
    ['Happy birthday, have a great day!', 'Hai-pee barth-day, hev a grayt day', 'Janamdin mubarak, din shaandaar ho!']],
    'WhatsApp shortcuts: "pls" = please, "thx" = thank you, "ok" = okay. Par office ya samaj ke group mein poora likhna achha lagta hai.'),
  L(25, 3, '🏛️', 'Meeting aur Panchayat', [['meeting', 'sabha / baithak', 'mee-ting'], ['members', 'sadasya', 'mem-barz'], ['agenda', 'charcha ke vishay', 'a-jen-da'], ['decide', 'faisla karna', 'di-saaid'], ['attend', 'shaamil hona', 'a-tend']], [
    ['Welcome to the meeting.', 'Wel-kam tu dha mee-ting', 'Baithak mein aapka swagat hai.'],
    ['All members, please attend.', 'Ol mem-barz, pleez a-tend', 'Sabhi sadasya kripya shaamil ho.'],
    ['Today\'s agenda has three points.', 'Tu-dayz a-jen-da haz three points', 'Aaj ke agenda mein teen baatein hain.'],
    ['We will decide together.', 'Wee vil di-saaid tu-ge-dhar', 'Hum milkar faisla karenge.'],
    ['Thank you all for coming.', 'Thank yoo ol for ka-ming', 'Aane ke liye aap sabka dhanyavaad.']],
    'Meeting shuru: "Welcome everyone". Khatam: "Thank you all". Kisi ko bolne dena ho: "Please go ahead" (pleez go a-hed).'),
  L(26, 3, '🏏', 'Cricket ki English', [['bat', 'balle se khelna / bat', 'bet'], ['bowl', 'gend daalna', 'bol'], ['wicket', 'wicket', 'vi-ket'], ['score', 'run / score', 'skor'], ['win', 'jeetna', 'vin']], [
    ['We won the toss.', 'Wee van dha tos', 'Humne toss jeeta.'],
    ['We will bat first.', 'Wee vil bet farst', 'Hum pehle batting karenge.'],
    ['What is the score?', 'Vot iz dha skor?', 'Score kya hai?'],
    ['He took two wickets.', 'Hee tuk too vi-kets', 'Usne do wicket liye.'],
    ['Well played, great shot!', 'Vel playd, grayt shot', 'Bahut badhiya khela, shaandaar shot!']],
    'Tareef ke liye: "Well played" (badhiya khela), "Great catch", "Good ball". Haar par bhi: "Good game, well played."'),
  L(27, 3, '🛒', 'Shopping aur mol-bhaav', [['how much', 'kitne ka', 'hau mach'], ['cheap', 'sasta', 'cheep'], ['expensive', 'mehenga', 'iks-pen-siv'], ['discount', 'chhoot', 'dis-kaunt'], ['size', 'naap / size', 'saaiz']], [
    ['How much is this shirt?', 'Hau mach iz dhis shart?', 'Yeh shirt kitne ki hai?'],
    ['It is too expensive.', 'It iz too iks-pen-siv', 'Yeh bahut mehenga hai.'],
    ['Can you give a discount?', 'Ken yoo giv a dis-kaunt?', 'Kya aap thodi chhoot de sakte ho?'],
    ['Do you have a bigger size?', 'Doo yoo hev a bi-gar saaiz?', 'Kya aapke paas bada size hai?'],
    ['I will take this one.', 'Aai vil tayk dhis van', 'Main yeh wala lunga.']],
    'Daam poochna: "How much is this?" Kai cheezein ho toh: "How much are these?" (dheez).'),
  L(28, 3, '🧭', 'Raasta poochna', [['left', 'baayan', 'left'], ['right', 'daayan', 'raait'], ['straight', 'seedha', 'strayt'], ['near', 'paas', 'neer'], ['station', 'station', 'stay-shan']], [
    ['Where is the station?', 'Veyr iz dha stay-shan?', 'Station kahan hai?'],
    ['Go straight and turn left.', 'Go strayt end tarn left', 'Seedha jao aur baayein mudo.'],
    ['It is near the temple.', 'It iz neer dha tem-pal', 'Woh mandir ke paas hai.'],
    ['Turn right at the signal.', 'Tarn raait at dha sig-nal', 'Signal par daayein mudo.']],
    'Anjaan se poochna ho toh "Excuse me" (iks-kyooz mee) se shuru karo: "Excuse me, where is the bus stop?"'),
  L(29, 3, '🏥', 'Doctor aur tabiyat', [['pain', 'dard', 'payn'], ['fever', 'bukhaar', 'fee-var'], ['medicine', 'dawai', 'me-di-sin'], ['doctor', 'doctor', 'dok-tar'], ['feel', 'mehsoos karna', 'feel']], [
    ['I have a fever.', 'Aai hev a fee-var', 'Mujhe bukhaar hai.'],
    ['I have pain in my back.', 'Aai hev payn in maai bek', 'Meri kamar mein dard hai.'],
    ['I do not feel well.', 'Aai doo not feel vel', 'Meri tabiyat theek nahi hai.'],
    ['Take this medicine twice a day.', 'Tayk dhis me-di-sin twaais a day', 'Yeh dawai din mein do baar lo.']],
    'Bimaari batane ke liye "I have a ___": I have a headache (sar dard), I have a cold (sardi), I have a cough (khaansi).'),
  L(30, 3, '💼', 'Job interview', [['experience', 'anubhav', 'iks-pee-ree-ans'], ['job', 'naukri', 'job'], ['strong', 'majboot', 'strong'], ['team', 'team / dal', 'teem'], ['hard-working', 'mehnati', 'haard-wer-king']], [
    ['I have five years of experience.', 'Aai hev faaiv yeerz of iks-pee-ree-ans', 'Mere paas paanch saal ka anubhav hai.'],
    ['I am hard-working and honest.', 'Aai em haard-wer-king end o-nest', 'Main mehnati aur imaandaar hu.'],
    ['I like to work in a team.', 'Aai laaik tu werk in a teem', 'Mujhe team mein kaam karna pasand hai.'],
    ['Why do you want this job?', 'Vaai doo yoo vont dhis job?', 'Aapko yeh naukri kyun chahiye?'],
    ['My strong point is leadership.', 'Maai strong point iz lee-dar-ship', 'Meri khaasiyat netritva (leadership) hai.']],
    '"Tell me about yourself" ka jawab: naam, kahan se ho, kya kaam kiya, aur tumhari khaasiyat. 4-5 line bas.'),
  L(31, 3, '🎉', 'Function aur nyota', [['invite', 'nyota dena', 'in-vaait'], ['wedding', 'shaadi', 've-ding'], ['function', 'samaroh', 'fank-shan'], ['welcome', 'swagat', 'wel-kam'], ['congratulations', 'badhaai ho', 'kon-gra-chu-lay-shanz']], [
    ['You are invited to my son\'s wedding.', 'Yoo aar in-vaai-ted tu maai sanz ve-ding', 'Aap mere bete ki shaadi mein aamantrit hain.'],
    ['Please come to the function.', 'Pleez kam tu dha fank-shan', 'Kripya samaroh mein aaiye.'],
    ['You are most welcome.', 'Yoo aar most wel-kam', 'Aapka hardik swagat hai.'],
    ['Congratulations on your new house!', 'Kon-gra-chu-lay-shanz on yor nyoo haus', 'Naye ghar ki badhaai ho!']],
    'Kisi ki khushi par "Congratulations!" Dukh ki khabar par "I am sorry for your loss" (aai em so-ree for yor los).'),
  L(32, 3, '🌟', 'Apni baat bolna: opinion', [['think', 'sochna', 'think'], ['agree', 'sehmat hona', 'a-gree'], ['idea', 'vichaar / idea', 'aai-dee-a'], ['important', 'zaroori', 'im-por-tant'], ['because', 'kyunki', 'bi-koz']], [
    ['I think this is a good idea.', 'Aai think dhis iz a gud aai-dee-a', 'Mujhe lagta hai yeh achha idea hai.'],
    ['I agree with you.', 'Aai a-gree vith yoo', 'Main aapse sehmat hu.'],
    ['Education is very important.', 'E-ju-kay-shan iz ve-ree im-por-tant', 'Shiksha bahut zaroori hai.'],
    ['I am happy because we won.', 'Aai em hai-pee bi-koz wee van', 'Main khush hu kyunki hum jeete.']],
    'Apni raay: "I think...". Sehmat nahi ho toh izzat se: "Sorry, I don\'t agree" ya "I have a different idea."'),
];

// ---------- Quiz: har lesson se MCQ, fill-blank aur Hindi-to-English sawaal ----------
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1103515245 + 12345) >>> 0) / 2 ** 32); }
function shuffle(arr, r) { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function options(correct, pool, r, n = 4) {
  const seen = new Set([correct.toLowerCase()]), rest = [];
  for (const x of shuffle(pool, r)) { const k = x.toLowerCase(); if (!seen.has(k)) { seen.add(k); rest.push(/^[A-Z]/.test(correct) ? x[0].toUpperCase() + x.slice(1) : x); } }
  return shuffle([correct, ...rest.slice(0, n - 1)], r);
}

export function buildQuiz(lesson, seed = lesson.id) {
  const r = rng(seed * 7919), qs = [];
  const others = LESSONS.filter(l => l.id !== lesson.id);
  const allHi = LESSONS.flatMap(l => l.words.map(w => w.hi)), allEn = LESSONS.flatMap(l => l.words.map(w => w.en));
  // 1) MCQ: word ka matlab
  for (const w of shuffle(lesson.words, r).slice(0, 2)) qs.push({ type: 'mcq', q: `"${w.en}" ka matlab kya hai?`, options: options(w.hi, [...lesson.words.map(x => x.hi), ...allHi], r), answer: w.hi });
  // 2) Fill blank: sentence mein lesson ka word gayab
  let blanks = 0;
  for (const s of shuffle(lesson.sentences, r)) {
    if (blanks >= 2) break;
    const w = lesson.words.find(x => new RegExp(`(^|[^A-Za-z'])${esc(x.en)}([^A-Za-z']|$)`, 'i').test(s.en));
    if (!w) continue;
    const m = s.en.match(new RegExp(`(^|[^A-Za-z'])(${esc(w.en)})(?=[^A-Za-z']|$)`, 'i'));
    const shown = s.en.slice(0, m.index + m[1].length) + '____' + s.en.slice(m.index + m[1].length + m[2].length);
    qs.push({ type: 'blank', q: `Khaali jagah bharo: ${shown}`, hint: s.hi, options: options(m[2], [...lesson.words.map(x => x.en), ...allEn], r), answer: m[2], full: s.en });
    blanks++;
  }
  // 3) Hindi se English
  const s = lesson.sentences[Math.floor(r() * lesson.sentences.length)];
  const wrong = [...lesson.sentences.filter(x => x !== s).map(x => x.en), ...others.flatMap(l => l.sentences.map(x => x.en))];
  qs.push({ type: 'hi2en', q: `Iski English kya hogi? "${s.hi}"`, options: options(s.en, wrong.slice(0, 6), r), answer: s.en });
  return qs;
}

// ---------- Bolne ki practice: kitna sahi bola ----------
export const normalize = s => String(s || '').toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
const NUM = { '1': 'one', '2': 'two', '3': 'three', '4': 'four', '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine', '10': 'ten', '20': 'twenty', '100': 'hundred' };
const words = s => normalize(s).split(' ').filter(Boolean).map(w => NUM[w] || w);
export function scoreSpeech(target, said) {
  const a = words(target), b = words(said);
  if (!a.length) return { score: 0, missing: [], feedback: '' };
  // LCS: kaunse words sahi order mein bole
  const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
  const hit = new Set(); for (let i = a.length, j = b.length; i && j;) { if (a[i - 1] === b[j - 1]) { hit.add(i - 1); i--; j--; } else if (dp[i - 1][j] >= dp[i][j - 1]) i--; else j--; }
  const extra = Math.max(0, b.length - dp[a.length][b.length]);
  const score = Math.max(0, Math.round(100 * (dp[a.length][b.length] - extra * 0.25) / a.length));
  const missing = a.filter((_, i) => !hit.has(i));
  const feedback = !b.length ? 'Kuch sunai nahi diya 🙉 Mic ke paas zor se bolo.'
    : score >= 90 ? 'Ekdum perfect! 🎉 Bahut badhiya bole.'
    : score >= 70 ? `Bahut achha! 👍 Bas in words par dhyan do: ${missing.join(', ')}`
    : score >= 40 ? `Theek hai, thoda aur practice 💪 Yeh words chhoot gaye: ${missing.join(', ')}`
    : 'Koi baat nahi 🙂 Pehle 🔊 Suno dabao, phir dheere-dheere bolo.';
  return { score: Math.min(100, score), missing, feedback };
}
