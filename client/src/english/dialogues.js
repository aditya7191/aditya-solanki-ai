// Bolke Practice: scripted conversations. A = Aditya (user), B = doosra character.
// line: [who, english, bolne ka tareeka (Roman Hindi), hindi matlab]
const D = (id, emoji, title, other, lines) => ({ id, emoji, title, me: 'Aditya', other, lines: lines.map(([who, en, say, hi]) => ({ who, en, say, hi })) });

export const DIALOGUES = [
  D('hotel-order', '🍽️', 'Hotel mein khana order', 'Waiter', [
    ['B', 'Good evening, sir. Welcome to Sagar Hotel.', 'Gud eev-ning, sar. Wel-kam tu Sagar ho-tel.', 'Namaste sir, Sagar Hotel mein aapka swagat hai.'],
    ['A', 'Good evening. A table for four, please.', 'Gud eev-ning. A tay-bal for for, pleez.', 'Namaste. Chaar logon ke liye table chahiye.'],
    ['B', 'Sure, sir. Please come this way.', 'Shor, sar. Pleez kam dhis way.', 'Zaroor sir, idhar aaiye.'],
    ['A', 'Can I see the menu, please?', 'Ken aai see dha men-yoo, pleez?', 'Kya main menu dekh sakta hu?'],
    ['B', 'Here is the menu, sir. What would you like to order?', 'Heer iz dha men-yoo, sar. Vot wud yoo laaik tu or-dar?', 'Yeh raha menu sir. Aap kya order karenge?'],
    ['A', 'Two plates of paneer butter masala, please.', 'Too playts of pa-neer ba-tar ma-saa-la, pleez.', 'Do plate paneer butter masala dijiye.'],
    ['B', 'Okay. Anything else, sir?', 'O-kay. E-nee-thing els, sar?', 'Theek hai. Aur kuch sir?'],
    ['A', 'Eight butter rotis and one jeera rice.', 'Ayt ba-tar ro-teez end van jee-ra raais.', 'Aath butter roti aur ek jeera rice.'],
    ['B', 'Would you like anything to drink?', 'Wud yoo laaik e-nee-thing tu drink?', 'Peene ke liye kuch lenge?'],
    ['A', 'Four sweet lassi, please. Not too cold.', 'For sweet las-see, pleez. Not too kold.', 'Chaar meethi lassi, zyada thandi nahi.'],
    ['B', 'Sure. Your food will be ready in fifteen minutes.', 'Shor. Yor food vil bee re-dee in fif-teen mi-nits.', 'Zaroor. Aapka khana pandrah minute mein taiyar hoga.'],
    ['A', 'Thank you. Please make it less spicy.', 'Thank yoo. Pleez mayk it les spaai-see.', 'Dhanyavaad. Kripya kam teekha banana.'],
    ['B', 'Here is your food, sir. Enjoy your meal.', 'Heer iz yor food, sar. En-joy yor meel.', 'Yeh raha aapka khana sir. Mazze se khaiye.'],
    ['A', 'The food is very tasty. Can I have the bill, please?', 'Dha food iz ve-ree tays-tee. Ken aai hev dha bil, pleez?', 'Khana bahut swadisht hai. Bill de dijiye.'],
    ['B', 'Your bill is eight hundred and forty rupees.', 'Yor bil iz ayt han-dred end for-tee roo-peez.', 'Aapka bill aath sau chaalis rupaye hai.'],
    ['A', 'Can I pay by UPI? Thank you, the service was very good.', 'Ken aai pay baai yoo-pee-aai? Thank yoo, dha ser-vis voz ve-ree gud.', 'Kya UPI se de sakta hu? Dhanyavaad, service bahut achhi thi.'],
  ]),
  D('shop', '👕', 'Kapde ki dukaan', 'Shopkeeper', [
    ['B', 'Hello sir, what are you looking for?', 'He-lo sar, vot aar yoo lu-king for?', 'Namaste sir, aap kya dhoondh rahe ho?'],
    ['A', 'I want a white shirt for a wedding.', 'Aai vont a waait shart for a ve-ding.', 'Mujhe shaadi ke liye safed shirt chahiye.'],
    ['B', 'What is your size, sir?', 'Vot iz yor saaiz, sar?', 'Aapka size kya hai sir?'],
    ['A', 'My size is forty.', 'Maai saaiz iz for-tee.', 'Mera size chaalis hai.'],
    ['B', 'Please see these shirts. This one is cotton.', 'Pleez see dheez sharts. Dhis van iz ko-tan.', 'Yeh shirts dekhiye. Yeh wali cotton ki hai.'],
    ['A', 'This is nice. How much is it?', 'Dhis iz naais. Hau mach iz it?', 'Yeh achhi hai. Kitne ki hai?'],
    ['B', 'It is twelve hundred rupees.', 'It iz twelv han-dred roo-peez.', 'Yeh baarah sau rupaye ki hai.'],
    ['A', 'That is too expensive. Can you give a discount?', 'Dhet iz too iks-pen-siv. Ken yoo giv a dis-kaunt?', 'Yeh bahut mehenga hai. Thoda kam karoge?'],
    ['B', 'Okay, I can give it for one thousand rupees.', 'O-kay, aai ken giv it for van thau-zand roo-peez.', 'Theek hai, hazaar rupaye mein de sakta hu.'],
    ['A', 'Can I try it first?', 'Ken aai traai it farst?', 'Kya pehle pehen ke dekh sakta hu?'],
    ['B', 'Yes, the trial room is on the left.', 'Yes, dha traa-yal room iz on dha left.', 'Haan, trial room baayein taraf hai.'],
    ['A', 'It fits well. I will take it. Please give me a bag.', 'It fits vel. Aai vil tayk it. Pleez giv mee a beg.', 'Ekdum fit hai. Main le lunga. Ek thaila de do.'],
  ]),
  D('doctor', '🩺', 'Doctor ke paas', 'Doctor', [
    ['B', 'Good morning. Please sit down. What happened?', 'Gud mor-ning. Pleez sit daun. Vot ha-pend?', 'Suprabhat. Baithiye. Kya hua?'],
    ['A', 'Good morning, doctor. I have a fever since yesterday.', 'Gud mor-ning, dok-tar. Aai hev a fee-var sins yes-tar-day.', 'Suprabhat doctor. Mujhe kal se bukhaar hai.'],
    ['B', 'Do you have a cough or cold?', 'Doo yoo hev a kof or kold?', 'Khaansi ya sardi hai?'],
    ['A', 'Yes, I have a cough and a headache.', 'Yes, aai hev a kof end a hed-ayk.', 'Haan, khaansi aur sar dard hai.'],
    ['B', 'Let me check your temperature.', 'Let mee chek yor tem-pra-char.', 'Main aapka bukhaar check karta hu.'],
    ['B', 'It is one hundred and one. Did you take any medicine?', 'It iz van han-dred end van. Did yoo tayk e-nee me-di-sin?', 'Ek sau ek hai. Koi dawai li?'],
    ['A', 'No, I did not take any medicine.', 'No, aai did not tayk e-nee me-di-sin.', 'Nahi, maine koi dawai nahi li.'],
    ['B', 'Take this tablet twice a day after food.', 'Tayk dhis tab-let twaais a day aaf-tar food.', 'Yeh goli din mein do baar khaane ke baad lo.'],
    ['A', 'For how many days?', 'For hau me-nee dayz?', 'Kitne din tak?'],
    ['B', 'For three days. Drink warm water and take rest.', 'For three dayz. Drink worm vo-tar end tayk rest.', 'Teen din. Garam paani piyo aur aaram karo.'],
    ['A', 'Okay doctor. How much is the fee?', 'O-kay dok-tar. Hau mach iz dha fee?', 'Theek hai doctor. Fees kitni hai?'],
    ['B', 'Three hundred rupees. Get well soon.', 'Three han-dred roo-peez. Get vel soon.', 'Teen sau rupaye. Jaldi theek ho jao.'],
  ]),
  D('auto', '🛺', 'Auto / taxi', 'Auto driver', [
    ['A', 'Excuse me, will you go to Mira Road station?', 'Iks-kyooz mee, vil yoo go tu Mira Road stay-shan?', 'Suniye, Mira Road station chaloge?'],
    ['B', 'Yes, sir. Please sit.', 'Yes, sar. Pleez sit.', 'Haan sir, baithiye.'],
    ['A', 'Please go by meter.', 'Pleez go baai mee-tar.', 'Meter se chalna.'],
    ['B', 'Okay, sir. Which side of the station?', 'O-kay, sar. Vich saaid of dha stay-shan?', 'Theek hai sir. Station ki kaun si taraf?'],
    ['A', 'East side, near the bus stop.', 'Eest saaid, neer dha bas stop.', 'East side, bus stop ke paas.'],
    ['B', 'There is a lot of traffic today.', 'Dheyr iz a lot of tra-fik tu-day.', 'Aaj bahut traffic hai.'],
    ['A', 'No problem. Please take the short route.', 'No prob-lam. Pleez tayk dha short root.', 'Koi baat nahi. Chhote raaste se le lo.'],
    ['B', 'Sure. We will reach in ten minutes.', 'Shor. Wee vil reech in ten mi-nits.', 'Zaroor. Das minute mein pahunch jayenge.'],
    ['A', 'Please stop here, on the left.', 'Pleez stop heer, on dha left.', 'Yahan baayein taraf rok do.'],
    ['B', 'The meter shows sixty-two rupees.', 'Dha mee-tar shoz siks-tee too roo-peez.', 'Meter mein baasath rupaye hain.'],
    ['A', 'Here is seventy rupees. Keep the change.', 'Heer iz se-ven-tee roo-peez. Keep dha chaynj.', 'Yeh lo sattar rupaye. Chhutta rakh lo.'],
    ['B', 'Thank you, sir. Have a nice day.', 'Thank yoo, sar. Hev a naais day.', 'Dhanyavaad sir. Aapka din achha ho.'],
  ]),
  D('railway', '🚆', 'Railway ticket', 'Ticket clerk', [
    ['A', 'Good morning. One ticket to Churchgate, please.', 'Gud mor-ning. Van ti-ket tu Charch-gayt, pleez.', 'Suprabhat. Churchgate ka ek ticket dijiye.'],
    ['B', 'Single or return?', 'Sing-gal or ri-tarn?', 'Ek taraf ka ya aana-jaana?'],
    ['A', 'Return ticket, please.', 'Ri-tarn ti-ket, pleez.', 'Aane-jaane ka ticket.'],
    ['B', 'First class or second class?', 'Farst klaas or se-kand klaas?', 'First class ya second class?'],
    ['A', 'Second class. How much is it?', 'Se-kand klaas. Hau mach iz it?', 'Second class. Kitne ka hai?'],
    ['B', 'It is forty rupees.', 'It iz for-tee roo-peez.', 'Chaalis rupaye.'],
    ['A', 'Can I pay by UPI?', 'Ken aai pay baai yoo-pee-aai?', 'Kya UPI se de sakta hu?'],
    ['B', 'Yes, please scan this code.', 'Yes, pleez sken dhis kod.', 'Haan, yeh code scan karo.'],
    ['A', 'Done. Which platform is the fast train on?', 'Dan. Vich plat-form iz dha faast trayn on?', 'Ho gaya. Fast train kaun se platform par hai?'],
    ['B', 'Platform number four. It comes at ten fifteen.', 'Plat-form nam-bar for. It kamz at ten fif-teen.', 'Platform number chaar. Sava das baje aati hai.'],
    ['A', 'Is it a crowded train?', 'Iz it a krau-ded trayn?', 'Kya usme bheed hoti hai?'],
    ['B', 'Yes, it is office time. Please be careful.', 'Yes, it iz o-fis taaim. Pleez bee keyr-ful.', 'Haan, office ka time hai. Dhyan rakhna.'],
    ['A', 'Thank you for your help.', 'Thank yoo for yor help.', 'Madad ke liye dhanyavaad.'],
  ]),
  D('bank', '🏦', 'Bank mein', 'Bank staff', [
    ['B', 'Good morning, sir. How can I help you?', 'Gud mor-ning, sar. Hau ken aai help yoo?', 'Suprabhat sir. Main aapki kya madad karu?'],
    ['A', 'Good morning. I want to open a savings account.', 'Gud mor-ning. Aai vont tu o-pan a say-vingz a-kaunt.', 'Suprabhat. Mujhe savings account kholna hai.'],
    ['B', 'Sure. Do you have your Aadhaar card and PAN card?', 'Shor. Doo yoo hev yor Aadhaar kaard end pen kaard?', 'Zaroor. Aadhaar aur PAN card hai?'],
    ['A', 'Yes, I have both. Here they are.', 'Yes, aai hev both. Heer dhey aar.', 'Haan, dono hain. Yeh lijiye.'],
    ['B', 'Please fill this form and give two photos.', 'Pleez fil dhis form end giv too fo-toz.', 'Yeh form bharo aur do photo do.'],
    ['A', 'Where should I sign?', 'Veyr shud aai saain?', 'Sign kahan karna hai?'],
    ['B', 'Please sign here and here.', 'Pleez saain heer end heer.', 'Yahan aur yahan sign kijiye.'],
    ['A', 'What is the minimum balance?', 'Vot iz dha mi-ni-mam be-lans?', 'Minimum balance kitna rakhna hai?'],
    ['B', 'It is one thousand rupees.', 'It iz van thau-zand roo-peez.', 'Ek hazaar rupaye.'],
    ['A', 'When will I get my ATM card?', 'Ven vil aai get maai ay-tee-em kaard?', 'ATM card kab milega?'],
    ['B', 'You will get it by post in seven days.', 'Yoo vil get it baai post in se-ven dayz.', 'Saat din mein post se aa jayega.'],
    ['A', 'Thank you very much.', 'Thank yoo ve-ree mach.', 'Bahut dhanyavaad.'],
  ]),
  D('phone', '📞', 'Phone call', 'Ramesh', [
    ['B', 'Hello?', 'He-lo?', 'Hello?'],
    ['A', 'Hello, Aditya speaking. Is this Ramesh?', 'He-lo, Aditya spee-king. Iz dhis Ramesh?', 'Hello, main Aditya bol raha hu. Ramesh bol rahe ho?'],
    ['B', 'Yes, Aditya bhai! How are you?', 'Yes, Aditya bhai! Hau aar yoo?', 'Haan Aditya bhai! Kaise ho?'],
    ['A', 'I am fine. Are you free now?', 'Aai em faain. Aar yoo free nau?', 'Main theek hu. Abhi free ho?'],
    ['B', 'Sorry, I am driving. Can I call you back?', 'So-ree, aai em draai-ving. Ken aai kol yoo bek?', 'Sorry, gaadi chala raha hu. Baad mein phone karu?'],
    ['A', 'Okay. Please call me after ten minutes.', 'O-kay. Pleez kol mee aaf-tar ten mi-nits.', 'Theek hai. Das minute baad phone karna.'],
    ['B', 'Hello Aditya, now I am free. Tell me.', 'He-lo Aditya, nau aai em free. Tel mee.', 'Hello Aditya, ab free hu. Bolo.'],
    ['A', 'There is a samaj meeting on Sunday.', 'Dheyr iz a samaj mee-ting on san-day.', 'Ravivaar ko samaj ki meeting hai.'],
    ['B', 'What time is the meeting?', 'Vot taaim iz dha mee-ting?', 'Meeting kitne baje hai?'],
    ['A', 'At five in the evening, at the community hall.', 'At faaiv in dha eev-ning, at dha ka-myoo-ni-tee hol.', 'Shaam paanch baje, community hall mein.'],
    ['B', 'Okay, I will come. Should I bring anything?', 'O-kay, aai vil kam. Shud aai bring e-nee-thing?', 'Theek hai, aaunga. Kuch laana hai?'],
    ['A', 'No, just come on time. See you on Sunday.', 'No, jast kam on taaim. See yoo on san-day.', 'Nahi, bas time par aana. Ravivaar ko milte hain.'],
  ]),
  D('panchayat', '🏛️', 'Panchayat meeting', 'Member', [
    ['A', 'Good evening, everyone. Welcome to the meeting.', 'Gud eev-ning, ev-ree-van. Wel-kam tu dha mee-ting.', 'Sabko namaste. Meeting mein swagat hai.'],
    ['B', 'Good evening, Secretary sir.', 'Gud eev-ning, se-kre-te-ree sar.', 'Namaste Secretary sahab.'],
    ['A', 'Today we have three points on the agenda.', 'Tu-day wee hev three points on dha a-jen-da.', 'Aaj agenda mein teen baatein hain.'],
    ['A', 'First, the cricket tournament next month.', 'Farst, dha kri-ket toor-na-ment nekst manth.', 'Pehli, agle mahine ka cricket tournament.'],
    ['B', 'How many teams will play?', 'Hau me-nee teemz vil play?', 'Kitni teams khelengi?'],
    ['A', 'Sixteen teams from all panchayats.', 'Siks-teen teemz from ol panchayats.', 'Sabhi panchayaton se solah teams.'],
    ['B', 'That is a good idea. What about the cost?', 'Dhet iz a gud aai-dee-a. Vot a-baut dha kost?', 'Achha idea hai. Kharcha kitna?'],
    ['A', 'Each team will pay one thousand rupees.', 'Eech teem vil pay van thau-zand roo-peez.', 'Har team hazaar rupaye degi.'],
    ['B', 'I agree. Who will manage the ground?', 'Aai a-gree. Hoo vil me-nej dha graund?', 'Main sehmat hu. Ground kaun sambhalega?'],
    ['A', 'Our youth members will manage it. Second point is the education fund.', 'Aawar yooth mem-barz vil me-nej it. Se-kand point iz dha e-ju-kay-shan fand.', 'Hamare yuva sadasya sambhalenge. Doosri baat shiksha fund hai.'],
    ['B', 'We should help poor students with books.', 'Wee shud help poor stoo-dents vith buks.', 'Garib bachchon ko kitabon se madad karni chahiye.'],
    ['A', 'Yes. All in favour, please raise your hands.', 'Yes. Ol in fay-var, pleez rayz yor hendz.', 'Haan. Jo sehmat hain, haath uthaiye.'],
    ['B', 'Everyone agrees.', 'Ev-ree-van a-greez.', 'Sab sehmat hain.'],
    ['A', 'Thank you all for coming. The meeting is over.', 'Thank yoo ol for ka-ming. Dha mee-ting iz o-var.', 'Aane ke liye sabka dhanyavaad. Meeting khatam.'],
  ]),
  D('cricket', '🏏', 'Cricket match ki baat', 'Friend', [
    ['B', 'Aditya, did you watch the match yesterday?', 'Aditya, did yoo voch dha match yes-tar-day?', 'Aditya, kal match dekha?'],
    ['A', 'Yes! It was a great match.', 'Yes! It voz a grayt match.', 'Haan! Bahut badhiya match tha.'],
    ['B', 'Who won the match?', 'Hoo van dha match?', 'Match kaun jeeta?'],
    ['A', 'Our team won by five wickets.', 'Aawar teem van baai faaiv vi-kets.', 'Hamari team paanch wicket se jeeti.'],
    ['B', 'Who was the man of the match?', 'Hoo voz dha men of dha match?', 'Man of the match kaun tha?'],
    ['A', 'Our captain. He scored sixty runs.', 'Aawar kep-tan. Hee skord siks-tee ranz.', 'Hamara captain. Usne saath run banaye.'],
    ['B', 'Wow! How many sixes did he hit?', 'Vau! Hau me-nee sik-siz did hee hit?', 'Wah! Kitne chhakke maare?'],
    ['A', 'He hit four sixes and five fours.', 'Hee hit for sik-siz end faaiv forz.', 'Chaar chhakke aur paanch chauke.'],
    ['B', 'When is the next match?', 'Ven iz dha nekst match?', 'Agla match kab hai?'],
    ['A', 'Next Sunday at nine in the morning.', 'Nekst san-day at naain in dha mor-ning.', 'Agle Ravivaar subah nau baje.'],
    ['B', 'Can I join your team?', 'Ken aai joyn yor teem?', 'Kya main tumhari team mein aa sakta hu?'],
    ['A', 'Sure! Come to the ground for practice on Saturday.', 'Shor! Kam tu dha graund for prak-tis on sa-tur-day.', 'Zaroor! Shanivaar ko practice ke liye ground aao.'],
  ]),
  D('interview', '💼', 'Job interview', 'Interviewer', [
    ['B', 'Good morning. Please have a seat.', 'Gud mor-ning. Pleez hev a seet.', 'Suprabhat. Baithiye.'],
    ['A', 'Good morning, sir. Thank you.', 'Gud mor-ning, sar. Thank yoo.', 'Suprabhat sir. Dhanyavaad.'],
    ['B', 'Please tell me about yourself.', 'Pleez tel mee a-baut yor-self.', 'Apne baare mein bataiye.'],
    ['A', 'My name is Aditya Solanki. I live in Mira Road.', 'Maai naym iz Aditya Solanki. Aai liv in Mira Road.', 'Mera naam Aditya Solanki hai. Main Mira Road mein rehta hu.'],
    ['A', 'I am the secretary of our samaj panchayat.', 'Aai em dha se-kre-te-ree of aawar samaj panchayat.', 'Main apni samaj panchayat ka secretary hu.'],
    ['B', 'What is your work experience?', 'Vot iz yor werk iks-pee-ree-ans?', 'Aapka kaam ka anubhav kya hai?'],
    ['A', 'I have five years of experience in office work.', 'Aai hev faaiv yeerz of iks-pee-ree-ans in o-fis werk.', 'Mujhe office ke kaam ka paanch saal ka anubhav hai.'],
    ['B', 'What are your strengths?', 'Vot aar yor strengths?', 'Aapki khoobiyan kya hain?'],
    ['A', 'I am hard-working and I can manage people.', 'Aai em haard-wer-king end aai ken me-nej pee-pal.', 'Main mehnati hu aur logon ko sambhal sakta hu.'],
    ['B', 'Why do you want this job?', 'Vaai doo yoo vont dhis job?', 'Aapko yeh naukri kyun chahiye?'],
    ['A', 'I want to learn and grow with your company.', 'Aai vont tu lern end gro vith yor kam-pa-nee.', 'Main aapki company ke saath seekhna aur aage badhna chahta hu.'],
    ['B', 'Very good. We will call you next week.', 'Ve-ree gud. Wee vil kol yoo nekst week.', 'Bahut achha. Hum agle hafte phone karenge.'],
    ['A', 'Thank you for your time, sir.', 'Thank yoo for yor taaim, sar.', 'Aapke samay ke liye dhanyavaad sir.'],
  ]),
  D('checkin', '🏨', 'Hotel check-in', 'Receptionist', [
    ['B', 'Good afternoon, sir. Welcome to Hotel Sea View.', 'Gud aaf-tar-noon, sar. Wel-kam tu ho-tel see vyoo.', 'Namaste sir, Hotel Sea View mein swagat hai.'],
    ['A', 'Good afternoon. I have a booking in the name of Aditya Solanki.', 'Gud aaf-tar-noon. Aai hev a bu-king in dha naym of Aditya Solanki.', 'Namaste. Aditya Solanki ke naam se booking hai.'],
    ['B', 'Yes, sir. One double room for two nights.', 'Yes, sar. Van da-bal room for too naaits.', 'Haan sir. Do raat ke liye ek double room.'],
    ['B', 'May I see your ID card, please?', 'May aai see yor aai-dee kaard, pleez?', 'Aapka ID card dikhayenge?'],
    ['A', 'Here is my Aadhaar card.', 'Heer iz maai Aadhaar kaard.', 'Yeh raha mera Aadhaar card.'],
    ['A', 'What time is breakfast?', 'Vot taaim iz brek-fast?', 'Naashta kitne baje hai?'],
    ['B', 'Breakfast is from seven to ten in the morning.', 'Brek-fast iz from se-ven tu ten in dha mor-ning.', 'Naashta subah saat se das baje tak.'],
    ['A', 'Is Wi-Fi free?', 'Iz waai-faai free?', 'Kya Wi-Fi free hai?'],
    ['B', 'Yes, the password is on your room card.', 'Yes, dha pas-ward iz on yor room kaard.', 'Haan, password room card par hai.'],
    ['A', 'What is the check-out time?', 'Vot iz dha chek-aut taaim?', 'Check-out kitne baje hai?'],
    ['B', 'Check-out is at twelve noon. Your room number is two zero five.', 'Chek-aut iz at twelv noon. Yor room nam-bar iz too zee-ro faaiv.', 'Check-out dopahar baarah baje. Aapka room number 205 hai.'],
    ['A', 'Thank you. Please send one bottle of water to my room.', 'Thank yoo. Pleez send van bo-tal of vo-tar tu maai room.', 'Dhanyavaad. Mere room mein ek paani ki bottle bhej dijiye.'],
  ]),
  D('directions', '🧭', 'Raasta poochna', 'Stranger', [
    ['A', 'Excuse me, can you help me?', 'Iks-kyooz mee, ken yoo help mee?', 'Suniye, meri madad karenge?'],
    ['B', 'Yes, of course.', 'Yes, of kors.', 'Haan, zaroor.'],
    ['A', 'Where is the post office?', 'Veyr iz dha post o-fis?', 'Post office kahan hai?'],
    ['B', 'Go straight and take the second left.', 'Go strayt end tayk dha se-kand left.', 'Seedha jao aur doosra left lo.'],
    ['A', 'Is it far from here?', 'Iz it faar from heer?', 'Kya yahan se door hai?'],
    ['B', 'No, it is only five minutes walk.', 'No, it iz on-lee faaiv mi-nits vok.', 'Nahi, bas paanch minute paidal.'],
    ['A', 'Is there any landmark?', 'Iz dheyr e-nee land-maark?', 'Koi pehchaan wali jagah hai?'],
    ['B', 'Yes, it is opposite the big temple.', 'Yes, it iz o-po-zit dha big tem-pal.', 'Haan, bade mandir ke saamne hai.'],
    ['A', 'Is there a medical shop near it?', 'Iz dheyr a me-di-kal shop neer it?', 'Uske paas koi medical hai?'],
    ['B', 'Yes, there is one next to the post office.', 'Yes, dheyr iz van nekst tu dha post o-fis.', 'Haan, post office ke bagal mein hai.'],
    ['A', 'Thank you so much.', 'Thank yoo so mach.', 'Bahut bahut dhanyavaad.'],
    ['B', 'You are welcome.', 'Yoo aar wel-kam.', 'Koi baat nahi.'],
  ]),
  D('birthday', '🎂', 'Birthday party', 'Friend Suresh', [
    ['A', 'Happy birthday, Suresh! Many happy returns of the day.', 'Hai-pee barth-day, Suresh! Me-nee hai-pee ri-tarnz of dha day.', 'Janamdin mubarak Suresh! Yeh din baar-baar aaye.'],
    ['B', 'Thank you, Aditya! Please come in.', 'Thank yoo, Aditya! Pleez kam in.', 'Dhanyavaad Aditya! Andar aao.'],
    ['A', 'This is a small gift for you.', 'Dhis iz a smol gift for yoo.', 'Yeh tumhare liye chhota sa tohfa.'],
    ['B', 'Oh, thank you! You did not need to.', 'O, thank yoo! Yoo did not need tu.', 'Arre, dhanyavaad! Iski zarurat nahi thi.'],
    ['A', 'How old are you today?', 'Hau old aar yoo tu-day?', 'Aaj kitne saal ke hue?'],
    ['B', 'I am thirty-five today.', 'Aai em thar-tee faaiv tu-day.', 'Aaj paintees saal ka ho gaya.'],
    ['A', 'The decoration is very beautiful.', 'Dha de-ko-ray-shan iz ve-ree byoo-ti-ful.', 'Sajawat bahut sundar hai.'],
    ['B', 'Thanks. My wife did it. Please have some cake.', 'Thanks. Maai waaif did it. Pleez hev sam kayk.', 'Thanks. Meri patni ne kiya. Thoda cake lo.'],
    ['A', 'The cake is delicious!', 'Dha kayk iz di-li-shas!', 'Cake bahut swadisht hai!'],
    ['B', 'Dinner will start at nine. Please stay.', 'Di-nar vil start at naain. Pleez stay.', 'Khana nau baje shuru hoga. Ruko zaroor.'],
    ['A', 'Sure. Let us take a photo together.', 'Shor. Let as tayk a fo-to tu-ge-dhar.', 'Zaroor. Saath mein photo lete hain.'],
    ['B', 'Yes! Everyone, come for the photo.', 'Yes! Ev-ree-van, kam for dha fo-to.', 'Haan! Sab log photo ke liye aao.'],
  ]),
  D('school', '🏫', 'School: parent-teacher meeting', 'Teacher', [
    ['B', 'Good morning. Are you Rohan\'s father?', 'Gud mor-ning. Aar yoo Rohan-z faa-dhar?', 'Suprabhat. Aap Rohan ke pitaji hain?'],
    ['A', 'Yes, madam. Good morning.', 'Yes, ma-dam. Gud mor-ning.', 'Haan madam. Suprabhat.'],
    ['A', 'How is Rohan doing in class?', 'Hau iz Rohan doo-ing in klaas?', 'Rohan class mein kaisa kar raha hai?'],
    ['B', 'He is a good boy. He is very good in maths.', 'Hee iz a gud boy. Hee iz ve-ree gud in maths.', 'Woh achha ladka hai. Maths mein bahut achha hai.'],
    ['B', 'But his English is weak.', 'Bat hiz ing-lish iz week.', 'Lekin uski English kamzor hai.'],
    ['A', 'How can I help him at home?', 'Hau ken aai help him at hom?', 'Main ghar par uski madad kaise karu?'],
    ['B', 'Please make him read one English story every day.', 'Pleez mayk him reed van ing-lish sto-ree ev-ree day.', 'Use roz ek English kahani padhwaiye.'],
    ['A', 'Okay. I am also learning English with him.', 'O-kay. Aai em ol-so ler-ning ing-lish vith him.', 'Theek hai. Main bhi uske saath English seekh raha hu.'],
    ['B', 'That is wonderful! He will learn fast.', 'Dhet iz wan-dar-ful! Hee vil lern faast.', 'Yeh toh bahut achha hai! Woh jaldi seekhega.'],
    ['A', 'Does he do his homework?', 'Daz hee doo hiz hom-werk?', 'Kya woh homework karta hai?'],
    ['B', 'Yes, but sometimes he is late.', 'Yes, bat sam-taaimz hee iz layt.', 'Haan, par kabhi-kabhi der karta hai.'],
    ['A', 'I will check it every day. Thank you, madam.', 'Aai vil chek it ev-ree day. Thank yoo, ma-dam.', 'Main roz check karunga. Dhanyavaad madam.'],
  ]),
  D('mobile-repair', '📱', 'Mobile repair shop', 'Mechanic', [
    ['B', 'Yes sir, what is the problem?', 'Yes sar, vot iz dha prob-lam?', 'Haan sir, kya problem hai?'],
    ['A', 'My phone screen is broken.', 'Maai fon skreen iz bro-kan.', 'Mere phone ki screen toot gayi.'],
    ['B', 'Which model is it?', 'Vich mo-dal iz it?', 'Kaun sa model hai?'],
    ['A', 'It is a Samsung phone, two years old.', 'It iz a Sam-sang fon, too yeerz old.', 'Samsung phone hai, do saal purana.'],
    ['B', 'The battery is also weak. It drains fast.', 'Dha be-ta-ree iz ol-so week. It draynz faast.', 'Battery bhi kamzor hai. Jaldi khatam hoti hai.'],
    ['A', 'How much will it cost for both?', 'Hau mach vil it kost for both?', 'Dono ka kitna kharcha hoga?'],
    ['B', 'Screen is two thousand and battery is eight hundred.', 'Skreen iz too thau-zand end be-ta-ree iz ayt han-dred.', 'Screen do hazaar aur battery aath sau.'],
    ['A', 'Is it original? Is there any warranty?', 'Iz it o-ri-ji-nal? Iz dheyr e-nee vo-ran-tee?', 'Original hai? Koi warranty hai?'],
    ['B', 'Yes, original, with three months warranty.', 'Yes, o-ri-ji-nal, vith three manths vo-ran-tee.', 'Haan, original, teen mahine ki warranty.'],
    ['A', 'When will it be ready?', 'Ven vil it bee re-dee?', 'Kab tak ready hoga?'],
    ['B', 'Come in the evening, at six o\'clock.', 'Kam in dha eev-ning, at siks o-klok.', 'Shaam chhe baje aaiye.'],
    ['A', 'Okay. Please do not delete my photos.', 'O-kay. Pleez doo not di-leet maai fo-toz.', 'Theek hai. Meri photos delete mat karna.'],
    ['B', 'Do not worry, sir. Your data is safe.', 'Doo not wa-ree, sar. Yor day-ta iz sayf.', 'Chinta mat kijiye sir. Aapka data safe hai.'],
  ]),
];

// ---------- AI wale dialogue ke liye: JSON parse + repair + validate ----------
const str = (x, n = 300) => (typeof x === 'string' ? x.replace(/\s+/g, ' ').trim().slice(0, n) : '');
export function parseDialogueJSON(text) {
  let t = String(text || '').replace(/```(?:json)?/gi, '').trim();
  const a = t.indexOf('{'), b = t.lastIndexOf('}');
  if (a < 0 || b <= a) return null;
  t = t.slice(a, b + 1);
  const tries = [t, t.replace(/,\s*([}\]])/g, '$1'), t.replace(/,\s*([}\]])/g, '$1').replace(/[“”]/g, '"').replace(/[‘’]/g, "'")];
  for (const x of tries) { try { return JSON.parse(x); } catch {} }
  return null;
}
// AI se aaya object -> app ka dialogue (ya null). Speaker naam/role flexible.
export function normalizeDialogue(obj, situation = '') {
  if (!obj || typeof obj !== 'object') return null;
  const other = str(obj.other || obj.otherCharacter || obj.character, 40) || 'Friend';
  const raw = Array.isArray(obj.lines) ? obj.lines : Array.isArray(obj.dialogue) ? obj.dialogue : [];
  const lines = [];
  for (const l of raw) {
    if (!l || typeof l !== 'object') continue;
    const sp = str(l.who || l.speaker || l.role, 40).toLowerCase();
    const who = sp === 'a' || sp.includes('aditya') || sp === 'me' || sp === 'user' ? 'A' : 'B';
    const en = str(l.en || l.english), say = str(l.say || l.pronunciation), hi = str(l.hi || l.hindi || l.meaning);
    if (!en || !/[a-z]/i.test(en) || /[\u0900-\u097F]/.test(en + say + hi)) continue;
    lines.push({ who, en, say: say || en, hi: hi || '' });
  }
  if (lines.length < 6 || !lines.some(l => l.who === 'A') || !lines.some(l => l.who === 'B')) return null;
  return { id: 'custom', emoji: Array.from(str(obj.emoji, 12)).slice(0, 3).join('') || '✨', title: str(obj.title, 60) || str(situation, 60) || 'Nayi conversation', me: 'Aditya', other, lines: lines.slice(0, 18), custom: true };
}
