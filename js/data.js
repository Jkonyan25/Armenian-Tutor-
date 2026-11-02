/* =========================================================================
   Armenian Tutor: course content
   Eastern Armenian (Yerevan) pronunciation, modern (reformed) spelling.
   ========================================================================= */
(function () {
  'use strict';

  /* ---------------------------------------------------------------------
     THE ALPHABET (Այբուբեն)
     snd   : short sound label
     eng   : English (or other) anchor word; the [bracketed] part is the sound
     note  : extra hint shown next to the anchor word
     tip   : a friendly explanation
     ex    : id of an example word (see WORDS)
     vowel : vowel letters are spoken on their own, consonants with "ա" (a)
     ------------------------------------------------------------------- */
  const LETTERS = [
    { id: 'ayb',  up: 'Ա', lo: 'ա', name: 'Այբ',   nameRom: 'ayb',   snd: 'a',      eng: 'f[a]ther',            vowel: true,
      tip: 'An open “ah” sound, the same every time.', ex: 'astso' },
    { id: 'ben',  up: 'Բ', lo: 'բ', name: 'Բեն',   nameRom: 'ben',   snd: 'b',      eng: '[b]oy',
      tip: 'Just like English b.', ex: 'barev' },
    { id: 'gim',  up: 'Գ', lo: 'գ', name: 'Գիմ',   nameRom: 'gim',   snd: 'g',      eng: '[g]o',
      tip: 'Always a hard g, as in “go” (never as in “gem”).', ex: 'gini' },
    { id: 'da',   up: 'Դ', lo: 'դ', name: 'Դա',    nameRom: 'da',    snd: 'd',      eng: '[d]og',
      tip: 'Just like English d.', ex: 'vordi' },
    { id: 'yech', up: 'Ե', lo: 'ե', name: 'Եչ',    nameRom: 'yech',  snd: 'ye / e', eng: '[ye]s · b[e]d',       vowel: true,
      tip: 'At the START of a word it says “ye” (as in “yes”). Everywhere else it says “e” (as in “bed”).', ex: 'ter' },
    { id: 'za',   up: 'Զ', lo: 'զ', name: 'Զա',    nameRom: 'za',    snd: 'z',      eng: '[z]oo',
      tip: 'Just like English z.', ex: 'zatik' },
    { id: 'e',    up: 'Է', lo: 'է', name: 'Է',     nameRom: 'e',     snd: 'e',      eng: 'b[e]d',               vowel: true,
      tip: 'Always “e” as in “bed”, never “ye”. You will usually see it at the start of a word.', ex: 'ej' },
    { id: 'et',   up: 'Ը', lo: 'ը', name: 'Ըթ',    nameRom: 'ət',    snd: 'ə (uh)', eng: '[a]bout',             vowel: true,
      tip: 'A short, relaxed “uh”. Armenians also slip this sound between consonants even when it isn’t written.', ex: 'enker' },
    { id: 'to',   up: 'Թ', lo: 'թ', name: 'Թո',    nameRom: 't’o',   snd: 't’',     eng: '[t]op',     note: 'with a puff of air',
      tip: 'A “t” with a little puff of air, like the t in “top”. Compare Տ, which has no puff.', ex: 'trchun' },
    { id: 'zhe',  up: 'Ժ', lo: 'ժ', name: 'Ժե',    nameRom: 'zhe',   snd: 'zh',     eng: 'mea[s]ure',
      tip: 'The soft “zh” sound in “measure” or “vision”.', ex: 'zham' },
    { id: 'ini',  up: 'Ի', lo: 'ի', name: 'Ինի',   nameRom: 'ini',   snd: 'i (ee)', eng: 's[ee]',               vowel: true,
      tip: 'Always “ee” as in “see”.', ex: 'hisus' },
    { id: 'lyun', up: 'Լ', lo: 'լ', name: 'Լյուն', nameRom: 'lyun',  snd: 'l',      eng: '[l]ove',
      tip: 'Just like English l.', ex: 'luys' },
    { id: 'khe',  up: 'Խ', lo: 'խ', name: 'Խե',    nameRom: 'khe',   snd: 'kh',     eng: 'Ba[ch]',    note: 'German / Scottish “loch”',
      tip: 'A raspy sound from the back of the throat, like the “ch” in German “Bach” or Scottish “loch”.', ex: 'khach' },
    { id: 'tsa',  up: 'Ծ', lo: 'ծ', name: 'Ծա',    nameRom: 'tsa',   snd: 'ts',     eng: 'ca[ts]',    note: 'no puff of air',
      tip: 'A sharp “ts” with no puff of air, like the end of “cats”. Compare Ց, which has a puff.', ex: 'astso' },
    { id: 'ken',  up: 'Կ', lo: 'կ', name: 'Կեն',   nameRom: 'ken',   snd: 'k',      eng: 's[k]ate',   note: 'no puff of air',
      tip: 'A “k” with no puff of air, like the k in “skate” (not “kite”). Compare Ք, which has a puff.', ex: 'kyank' },
    { id: 'ho',   up: 'Հ', lo: 'հ', name: 'Հո',    nameRom: 'ho',    snd: 'h',      eng: '[h]at',
      tip: 'Just like English h.', ex: 'hisus' },
    { id: 'dza',  up: 'Ձ', lo: 'ձ', name: 'Ձա',    nameRom: 'dza',   snd: 'dz',     eng: 'ki[ds]',
      tip: 'The “dz” sound at the end of “kids”.', ex: 'indz' },
    { id: 'ghat', up: 'Ղ', lo: 'ղ', name: 'Ղատ',   nameRom: 'ghat',  snd: 'gh',     eng: 'Pa[r]is',   note: 'French r',
      tip: 'A soft gargle in the back of the throat, like the French “r” in “Paris”. Compare Խ, which is raspier.', ex: 'voghormir' },
    { id: 'che',  up: 'Ճ', lo: 'ճ', name: 'Ճե',    nameRom: 'che',   snd: 'ch',     eng: 'i[tch]y',   note: 'no puff of air',
      tip: 'A crisp “ch” with no puff of air. Compare Չ, which has a puff.', ex: 'chanaparh' },
    { id: 'men',  up: 'Մ', lo: 'մ', name: 'Մեն',   nameRom: 'men',   snd: 'm',      eng: '[m]om',
      tip: 'Just like English m.', ex: 'voghormir' },
    { id: 'hi',   up: 'Յ', lo: 'յ', name: 'Յի',    nameRom: 'hi',    snd: 'y',      eng: '[y]es',     tts: 'Հի',
      tip: 'Its name is “hi”, but it sounds like English “y”.', ex: 'yot' },
    { id: 'nu',   up: 'Ն', lo: 'ն', name: 'Նու',   nameRom: 'nu',    snd: 'n',      eng: '[n]o',
      tip: 'Just like English n.', ex: 'indz' },
    { id: 'sha',  up: 'Շ', lo: 'շ', name: 'Շա',    nameRom: 'sha',   snd: 'sh',     eng: '[sh]ip',
      tip: 'Just like English sh.', ex: 'shnorh' },
    { id: 'vo',   up: 'Ո', lo: 'ո', name: 'Ո',     nameRom: 'vo',    snd: 'vo / o', eng: '[vo]te · m[o]re',     vowel: true,
      tip: 'At the START of a word it says “vo”. Everywhere else it says “o” (as in “more”).', ex: 'vordi' },
    { id: 'cha',  up: 'Չ', lo: 'չ', name: 'Չա',    nameRom: 'ch’a',  snd: 'ch’',    eng: '[ch]urch',  note: 'with a puff of air',
      tip: 'A “ch” with a puff of air, like the ch in “church”. Compare Ճ, which has no puff.', ex: 'khach' },
    { id: 'pe',   up: 'Պ', lo: 'պ', name: 'Պե',    nameRom: 'pe',    snd: 'p',      eng: 's[p]in',    note: 'no puff of air',
      tip: 'A “p” with no puff of air, like the p in “spin” (not “pin”). Compare Փ, which has a puff.', ex: 'patarag' },
    { id: 'je',   up: 'Ջ', lo: 'ջ', name: 'Ջե',    nameRom: 'je',    snd: 'j',      eng: '[j]am',
      tip: 'Just like English j.', ex: 'jur' },
    { id: 'ra',   up: 'Ռ', lo: 'ռ', name: 'Ռա',    nameRom: 'rra',   snd: 'rr',     eng: 'pe[rr]o',   note: 'Spanish rolled r',
      tip: 'A strong, rolled r, like Spanish “perro”. Compare Ր, which is a light tap.', ex: 'park' },
    { id: 'se',   up: 'Ս', lo: 'ս', name: 'Սե',    nameRom: 'se',    snd: 's',      eng: '[s]un',
      tip: 'Always “s” as in “sun” (never a z sound).', ex: 'hisus' },
    { id: 'vev',  up: 'Վ', lo: 'վ', name: 'Վեվ',   nameRom: 'vev',   snd: 'v',      eng: '[v]an',
      tip: 'Just like English v.', ex: 'meghavoris' },
    { id: 'tyun', up: 'Տ', lo: 'տ', name: 'Տյուն', nameRom: 'tyun',  snd: 't',      eng: 's[t]op',    note: 'no puff of air',
      tip: 'A “t” with no puff of air, like the t in “stop” (not “top”). Compare Թ, which has a puff.', ex: 'ter' },
    { id: 're',   up: 'Ր', lo: 'ր', name: 'Րե',    nameRom: 're',    snd: 'r',      eng: 'bu[tt]er',  note: 'American English',
      tip: 'A light, quick tap of the tongue, like the “tt” in American “butter”. Compare Ռ, which is rolled.', ex: 'ter' },
    { id: 'tso',  up: 'Ց', lo: 'ց', name: 'Ցո',    nameRom: 'ts’o',  snd: 'ts’',    eng: 'ca[ts]',    note: 'with a puff of air',
      tip: 'Like the “ts” in “cats”, but with a puff of air after it. Compare Ծ, which has no puff.', ex: 'hats' },
    { id: 'vyun', up: 'Ւ', lo: 'ւ', name: 'Վյուն', nameRom: 'vyun',  snd: '(in ու)', eng: 'm[oo]n',  note: 'as part of ու', vowel: true, noSoundQuiz: true, soundText: 'ու',
      tip: 'This letter almost never appears alone. Written after Ո, it makes ու, which says “oo” as in “moon”.', ex: 'hisus' },
    { id: 'pyur', up: 'Փ', lo: 'փ', name: 'Փյուր', nameRom: 'p’yur', snd: 'p’',     eng: '[p]ot',     note: 'with a puff of air',
      tip: 'A “p” with a puff of air, like the p in “pot”. Compare Պ, which has no puff.', ex: 'park' },
    { id: 'ke',   up: 'Ք', lo: 'ք', name: 'Քե',    nameRom: 'k’e',   snd: 'k’',     eng: '[k]ite',    note: 'with a puff of air',
      tip: 'A “k” with a puff of air, like the k in “kite”. Compare Կ, which has no puff.', ex: 'kristos' },
    { id: 'o',    up: 'Օ', lo: 'օ', name: 'Օ',     nameRom: 'o',     snd: 'o',      eng: 'm[o]re',              vowel: true,
      tip: 'Always “o”, never “vo”. You will usually see it at the start of a word.', ex: 'or' },
    { id: 'fe',   up: 'Ֆ', lo: 'ֆ', name: 'Ֆե',    nameRom: 'fe',    snd: 'f',      eng: '[f]un',
      tip: 'Just like English f. It mostly appears in borrowed words.', ex: 'futbol' }
  ];

  // Two special combinations every reader needs.
  const SPECIALS = [
    { id: 'u',  up: 'Ու', lo: 'ու', name: 'ու', nameRom: 'u', snd: 'u (oo)', eng: 'm[oo]n', vowel: true, special: true, noCaseQuiz: true,
      tip: 'Two letters, one sound: Ո + Ւ written together always say “oo” as in “moon”.', ex: 'hisus' },
    { id: 'ev', up: 'ԵՎ', lo: 'և', name: 'և', nameRom: 'yev', snd: 'yev / ev', eng: '[ev]er', vowel: true, special: true, noCaseQuiz: true,
      tip: 'A joined letter: ե + վ. On its own it is the word “and”. It says “yev” at the start of a word and “ev” in the middle. Capital form: ԵՎ.', ex: 'yerevan' }
  ];

  /* ---------------------------------------------------------------------
     WORDS & PHRASES
     arm  : Armenian (as displayed)
     rom  : romanization (Eastern / Yerevan pronunciation)
     en   : English meaning
     say  : optional English-style "sounds like" (stress in CAPS)
     tts  : optional text for the speech engine when spelling ≠ pronunciation
     note : optional "good to know"
     ------------------------------------------------------------------- */
  const WORD_LIST = [
    // --- The Jesus Prayer ---
    { id: 'ter',        arm: 'Տեր',        rom: 'Ter',        en: 'Lord',           say: 'tehr' },
    { id: 'hisus',      arm: 'Հիսուս',     rom: 'Hisus',      en: 'Jesus',          say: 'hee-SOOS' },
    { id: 'kristos',    arm: 'Քրիստոս',    rom: 'Kristos',    en: 'Christ',         say: 'kree-STOHS' },
    { id: 'astso',      arm: 'Աստծո',      rom: 'Astso',      en: 'of God',         say: 'ahst-SOH',
      note: 'Աստծո means “of God”. Armenian puts it before the noun: Աստծո Որդի = “God’s Son”.' },
    { id: 'vordi',      arm: 'Որդի',       rom: 'Vordi',      en: 'Son',            say: 'vohr-DEE',
      note: 'Ո at the start of a word says “vo”. That is why Որդի sounds like “vordi”.' },
    { id: 'voghormir',  arm: 'ողորմիր',    rom: 'voghormir',  en: 'have mercy',     say: 'voh-ghohr-MEER' },
    { id: 'indz',       arm: 'ինձ',        rom: 'indz',       en: 'on me',          say: 'eendz' },
    { id: 'meghavoris', arm: 'մեղավորիս',  rom: 'meghavoris', en: 'a sinner',       say: 'meh-ghah-voh-REES',
      note: 'մեղավոր = sinner. The ending -ս means “my / me”, so մեղավորիս ≈ “me, the sinner”.' },

    // --- Beyond the prayer: the remaining letters ---
    { id: 'barev',      arm: 'Բարև',       rom: 'Barev',      en: 'Hello',          say: 'bah-REV' },
    { id: 'bari',       arm: 'բարի',       rom: 'bari',       en: 'Kind, good-hearted', say: 'bah-REE' },
    { id: 'lav',        arm: 'լավ',        rom: 'lav',        en: 'Good, fine',     say: 'lahv' },
    { id: 'astvats',    arm: 'Աստված',     rom: 'Astvats',    en: 'God',            say: 'ahst-VAHTS' },
    { id: 'yerevan',    arm: 'Երևան',      rom: 'Yerevan',    en: 'Yerevan (capital of Armenia)', say: 'yeh-reh-VAHN',
      note: 'Ե at the start says “ye”, and և in the middle says “ev”: Ye-r-ev-an.' },
    { id: 'khach',      arm: 'խաչ',        rom: 'khach',      en: 'Cross',          say: 'khahch' },
    { id: 'char',       arm: 'չար',        rom: 'char',       en: 'Evil',           say: 'chahr' },
    { id: 'zatik',      arm: 'Զատիկ',      rom: 'Zatik',      en: 'Easter',         say: 'zah-TEEK' },
    { id: 'kamk',       arm: 'կամք',       rom: 'kamk',       en: 'Will (as in “Thy will”)', say: 'kahmk' },
    { id: 'park',       arm: 'փառք',       rom: 'park',       en: 'Glory',          say: 'pahrrk' },
    { id: 'aravot',     arm: 'առավոտ',     rom: 'aravot',     en: 'Morning',        say: 'ah-rrah-VOHT' },
    { id: 'trchun',     arm: 'թռչուն',     rom: 'trchun',     en: 'Bird',           say: 'tuhrr-CHOON' },
    { id: 'ator',       arm: 'աթոռ',       rom: 'ator',       en: 'Chair',          say: 'ah-TOHRR' },
    { id: 'hats',       arm: 'հաց',        rom: 'hats',       en: 'Bread',          say: 'hahts' },
    { id: 'jur',        arm: 'ջուր',       rom: 'jur',        en: 'Water',          say: 'joor' },
    { id: 'gini',       arm: 'գինի',       rom: 'gini',       en: 'Wine',           say: 'gee-NEE' },
    { id: 'yekeghetsi', arm: 'եկեղեցի',    rom: 'yekeghetsi', en: 'Church',         say: 'yeh-keh-gheh-TSEE' },
    { id: 'tagavor',    arm: 'թագավոր',    rom: 'tagavor',    en: 'King',           say: 'tah-gah-VOHR' },
    { id: 'zham',       arm: 'ժամ',        rom: 'zham',       en: 'Hour; church service', say: 'zhahm' },
    { id: 'patarag',    arm: 'Պատարագ',    rom: 'Patarag',    en: 'Divine Liturgy (the Badarak)', say: 'pah-tah-RAHG' },
    { id: 'shnorh',     arm: 'շնորհ',      rom: 'shnorh',     en: 'Grace',          say: 'shnohrh' },
    { id: 'pahk',       arm: 'պահք',       rom: 'pahk',       en: 'Fasting, Lent',  say: 'pahhk' },
    { id: 'luys',       arm: 'լույս',      rom: 'luys',       en: 'Light',          say: 'looys' },
    { id: 'kyank',      arm: 'կյանք',      rom: 'kyank',      en: 'Life',           say: 'kyahnk' },
    { id: 'yot',        arm: 'յոթ',        rom: 'yot',        en: 'Seven',          say: 'yoht' },
    { id: 'chanaparh',  arm: 'ճանապարհ',   rom: 'chanaparh',  en: 'Way, road',      say: 'chah-nah-PAHRH' },
    { id: 'or',         arm: 'օր',         rom: 'or',         en: 'Day',            say: 'ohr' },
    { id: 'orhnutyun',  arm: 'օրհնություն', rom: 'orhnutyun', en: 'Blessing',       say: 'ohrh-noo-TYOON' },
    { id: 'enker',      arm: 'ընկեր',      rom: 'ənker',      en: 'Friend',         say: 'uhn-KEHR' },
    { id: 'ej',         arm: 'էջ',         rom: 'ej',         en: 'Page',           say: 'ehj' },
    { id: 'futbol',     arm: 'ֆուտբոլ',    rom: 'futbol',     en: 'Soccer (football)', say: 'foot-BOHL' },

    // --- Phrases from the prayer & scripture ---
    { id: 'ph_ljc',     arm: 'Տեր Հիսուս Քրիստոս',  rom: 'Ter Hisus Kristos', en: 'Lord Jesus Christ', phrase: true },
    { id: 'ph_sog',     arm: 'Աստծո Որդի',          rom: 'Astso Vordi',       en: 'Son of God', phrase: true },
    { id: 'ph_half',    arm: 'Տեր Հիսուս Քրիստոս, Աստծո Որդի', rom: 'Ter Hisus Kristos, Astso Vordi', en: 'Lord Jesus Christ, Son of God', phrase: true },
    { id: 'ph_mercy',   arm: 'ողորմիր ինձ',         rom: 'voghormir indz',    en: 'have mercy on me', phrase: true },
    { id: 'ph_mercy2',  arm: 'ողորմիր ինձ՝ մեղավորիս', rom: 'voghormir indz, meghavoris', en: 'have mercy on me, a sinner', phrase: true },
    { id: 'ph_prayer',  arm: 'Տեր Հիսուս Քրիստոս, Աստծո Որդի, ողորմիր ինձ՝ մեղավորիս', rom: 'Ter Hisus Kristos, Astso Vordi, voghormir indz, meghavoris',
      en: 'Lord Jesus Christ, Son of God, have mercy on me, a sinner', phrase: true },
    { id: 'ph_way',     arm: 'Ես եմ ճանապարհը, ճշմարտությունը և կյանքը', rom: 'Yes em chanaparhə, chshmartutyunə yev kyankə',
      en: 'I am the way, the truth, and the life', phrase: true, gloss: ['I', 'am', 'the way', 'the truth', 'and', 'the life'], tts: 'Ես էմ ճանապարհը, ճշմարտությունը և կյանքը',
      note: 'John 14:6. Fun fact: the little word եմ (“am”) is pronounced “em”, not “yem”.' },

    // --- Vocabulary: Greetings ---
    { id: 'bari_luys',   arm: 'Բարի լույս',        rom: 'Bari luys',        en: 'Good morning', note: 'Literally “good light”.' },
    { id: 'bari_yereko', arm: 'Բարի երեկո',        rom: 'Bari yereko',      en: 'Good evening' },
    { id: 'bari_gisher', arm: 'Բարի գիշեր',        rom: 'Bari gisher',      en: 'Good night' },
    { id: 'tstesutyun',  arm: 'Ցտեսություն',       rom: 'Tstesutyun',       en: 'Goodbye' },
    { id: 'shnorhakal',  arm: 'Շնորհակալություն',  rom: 'Shnorhakalutyun',  en: 'Thank you', note: 'It shares a root with շնորհ (grace).' },
    { id: 'khndrem',     arm: 'Խնդրեմ',            rom: 'Khndrem',          en: 'You’re welcome / please' },
    { id: 'neroghutyun', arm: 'Ներողություն',      rom: 'Neroghutyun',      en: 'Sorry' },
    { id: 'ayo',         arm: 'Այո',               rom: 'Ayo',              en: 'Yes' },
    { id: 'voch',        arm: 'Ոչ',                rom: 'Voch',             en: 'No' },
    { id: 'inchpes_es',  arm: 'Ինչպե՞ս ես',        rom: 'Inchpes es?',      en: 'How are you?', tts: 'Ինչպես էս', note: 'The mark ՞ is the Armenian question mark. It sits over the stressed vowel.' },
    { id: 'lav_em',      arm: 'Լավ եմ',            rom: 'Lav em',           en: 'I’m fine', tts: 'Լավ էմ' },

    // --- Family ---
    { id: 'entanik',  arm: 'ընտանիք', rom: 'əntanik',  en: 'Family' },
    { id: 'mayr',     arm: 'մայր',    rom: 'mayr',     en: 'Mother' },
    { id: 'hayr',     arm: 'հայր',    rom: 'hayr',     en: 'Father' },
    { id: 'vordi_f',  arm: 'որդի',    rom: 'vordi',    en: 'Son' },
    { id: 'dustr',    arm: 'դուստր',  rom: 'dustr',    en: 'Daughter' },
    { id: 'yeghbayr', arm: 'եղբայր',  rom: 'yeghbayr', en: 'Brother' },
    { id: 'kuyr',     arm: 'քույր',   rom: 'kuyr',     en: 'Sister' },
    { id: 'yerekha',  arm: 'երեխա',   rom: 'yerekha',  en: 'Child' },
    { id: 'tatik',    arm: 'տատիկ',   rom: 'tatik',    en: 'Grandmother' },
    { id: 'papik',    arm: 'պապիկ',   rom: 'papik',    en: 'Grandfather' },
    { id: 'kin',      arm: 'կին',     rom: 'kin',      en: 'Wife; woman' },
    { id: 'amusin',   arm: 'ամուսին', rom: 'amusin',   en: 'Husband' },

    // --- Numbers ---
    { id: 'mek',   arm: 'մեկ',   rom: 'mek',   en: 'One (1)' },
    { id: 'yerku', arm: 'երկու', rom: 'yerku', en: 'Two (2)' },
    { id: 'yerek', arm: 'երեք',  rom: 'yerek', en: 'Three (3)', note: 'Ends in Ք. Don’t mix it up with երեկ (yesterday), which ends in Կ!' },
    { id: 'chors', arm: 'չորս',  rom: 'chors', en: 'Four (4)' },
    { id: 'hing',  arm: 'հինգ',  rom: 'hing',  en: 'Five (5)' },
    { id: 'vets',  arm: 'վեց',   rom: 'vets',  en: 'Six (6)' },
    { id: 'yot_n', arm: 'յոթ',   rom: 'yot',   en: 'Seven (7)' },
    { id: 'ut',    arm: 'ութ',   rom: 'ut',    en: 'Eight (8)' },
    { id: 'ine',   arm: 'ինը',   rom: 'inə',   en: 'Nine (9)' },
    { id: 'tase',  arm: 'տասը',  rom: 'tasə',  en: 'Ten (10)' },

    // --- Food & drink ---
    { id: 'surch',   arm: 'սուրճ',  rom: 'surch',   en: 'Coffee' },
    { id: 'tey',     arm: 'թեյ',    rom: 'tey',     en: 'Tea' },
    { id: 'kat',     arm: 'կաթ',    rom: 'kat',     en: 'Milk' },
    { id: 'panir',   arm: 'պանիր',  rom: 'panir',   en: 'Cheese' },
    { id: 'mis',     arm: 'միս',    rom: 'mis',     en: 'Meat' },
    { id: 'dzuk',    arm: 'ձուկ',   rom: 'dzuk',    en: 'Fish' },
    { id: 'khndzor', arm: 'խնձոր',  rom: 'khndzor', en: 'Apple' },
    { id: 'tsiran',  arm: 'ծիրան',  rom: 'tsiran',  en: 'Apricot', note: 'The apricot is a symbol of Armenia.' },
    { id: 'nur',     arm: 'նուռ',   rom: 'nur',     en: 'Pomegranate' },
    { id: 'lavash',  arm: 'լավաշ',  rom: 'lavash',  en: 'Lavash (thin flatbread)' },

    // --- Colors ---
    { id: 'guyn',        arm: 'գույն',       rom: 'guyn',        en: 'Color' },
    { id: 'karmir',      arm: 'կարմիր',      rom: 'karmir',      en: 'Red' },
    { id: 'kapuyt',      arm: 'կապույտ',     rom: 'kapuyt',      en: 'Blue' },
    { id: 'tsiranaguyn', arm: 'ծիրանագույն', rom: 'tsiranaguyn', en: 'Apricot / orange', note: 'Red, blue and apricot are the colors of the Armenian flag.' },
    { id: 'deghin',      arm: 'դեղին',       rom: 'deghin',      en: 'Yellow' },
    { id: 'kanach',      arm: 'կանաչ',       rom: 'kanach',      en: 'Green' },
    { id: 'spitak',      arm: 'սպիտակ',      rom: 'spitak',      en: 'White' },
    { id: 'sev',         arm: 'սև',          rom: 'sev',         en: 'Black' },

    // --- Days & time ---
    { id: 'yerkushabti',  arm: 'երկուշաբթի',  rom: 'yerkushabti',  en: 'Monday', note: 'Literally “second (day after) Sabbath”.' },
    { id: 'yerekshabti',  arm: 'երեքշաբթի',   rom: 'yerekshabti',  en: 'Tuesday' },
    { id: 'chorekshabti', arm: 'չորեքշաբթի',  rom: 'chorekshabti', en: 'Wednesday' },
    { id: 'hingshabti',   arm: 'հինգշաբթի',   rom: 'hingshabti',   en: 'Thursday' },
    { id: 'urbat',        arm: 'ուրբաթ',      rom: 'urbat',        en: 'Friday' },
    { id: 'shabat',       arm: 'շաբաթ',       rom: 'shabat',       en: 'Saturday; week' },
    { id: 'kiraki',       arm: 'կիրակի',      rom: 'kiraki',       en: 'Sunday' },
    { id: 'aysor',        arm: 'այսօր',       rom: 'aysor',        en: 'Today' },
    { id: 'vaghe',        arm: 'վաղը',        rom: 'vaghə',        en: 'Tomorrow' },
    { id: 'yerek_y',      arm: 'երեկ',        rom: 'yerek',        en: 'Yesterday', note: 'Ends in Կ. Three (երեք) ends in Ք.' },

    // --- Faith & church ---
    { id: 'aghotk',        arm: 'աղոթք',        rom: 'aghotk',        en: 'Prayer' },
    { id: 'amen',          arm: 'ամեն',         rom: 'amen',          en: 'Amen' },
    { id: 'surb',          arm: 'սուրբ',        rom: 'surb',          en: 'Holy; saint' },
    { id: 'hogi',          arm: 'հոգի',         rom: 'hogi',          en: 'Spirit; soul' },
    { id: 'prkich',        arm: 'Փրկիչ',        rom: 'Prkich',        en: 'Savior' },
    { id: 'havat',         arm: 'հավատ',        rom: 'havat',         en: 'Faith' },
    { id: 'ser',           arm: 'սեր',          rom: 'ser',           en: 'Love' },
    { id: 'huys',          arm: 'հույս',        rom: 'huys',          en: 'Hope' },
    { id: 'mom',           arm: 'մոմ',          rom: 'mom',           en: 'Candle' },
    { id: 'kahana',        arm: 'քահանա',       rom: 'kahana',        en: 'Priest' },
    { id: 'avetaran',      arm: 'Ավետարան',     rom: 'Avetaran',      en: 'Gospel' },
    { id: 'astvatsashunch', arm: 'Աստվածաշունչ', rom: 'Astvatsashunch', en: 'Bible', note: 'Literally “God-breathed”.' },
    { id: 'park_astso',    arm: 'Փառք Աստծո',   rom: 'Park Astso',    en: 'Glory to God; thank God', phrase: true },

    // --- Useful phrases ---
    { id: 'im_anune',     arm: 'Իմ անունը Դավիթ է',        rom: 'Im anunə Davit e',          en: 'My name is Davit', phrase: true },
    { id: 'ko_anune',     arm: 'Քո անունն ի՞նչ է',         rom: 'Ko anunn inch e?',          en: 'What is your name?', phrase: true, tts: 'Քո անունն ինչ է' },
    { id: 'sovorum',      arm: 'Ես հայերեն եմ սովորում',   rom: 'Yes hayeren em sovorum',    en: 'I am learning Armenian', phrase: true, tts: 'Ես հայերեն էմ սովորում' },
    { id: 'haskanum',     arm: 'Ես չեմ հասկանում',         rom: 'Yes chem haskanum',         en: 'I don’t understand', phrase: true },
    { id: 'sirum_em',     arm: 'Ես քեզ սիրում եմ',         rom: 'Yes kez sirum em',          en: 'I love you', phrase: true, tts: 'Ես քեզ սիրում էմ' },
    { id: 'shat_lav',     arm: 'Շատ լավ',                  rom: 'Shat lav',                  en: 'Very good', phrase: true },
    { id: 'vortegh_e',    arm: 'Որտե՞ղ է եկեղեցին',        rom: 'Vortegh e yekeghetsin?',    en: 'Where is the church?', phrase: true, tts: 'Որտեղ է եկեղեցին' },
    { id: 'inchkan',      arm: 'Ինչքա՞ն արժե',             rom: 'Inchkan arzhe?',            en: 'How much does it cost?', phrase: true, tts: 'Ինչքան արժե' },
    { id: 'dandagh',      arm: 'Խնդրում եմ, դանդաղ խոսեք', rom: 'Khndrum em, dandagh khosek', en: 'Please speak slowly', phrase: true, tts: 'Խնդրում էմ, դանդաղ խոսեք' },
    { id: 'knerek',       arm: 'Կներեք',                   rom: 'Knerek',                    en: 'Excuse me (polite)' },

    // --- Common verbs ---
    { id: 'linel',   arm: 'լինել',   rom: 'linel',   en: 'To be' },
    { id: 'unenal',  arm: 'ունենալ', rom: 'unenal',  en: 'To have' },
    { id: 'gnal',    arm: 'գնալ',    rom: 'gnal',    en: 'To go' },
    { id: 'gal',     arm: 'գալ',     rom: 'gal',     en: 'To come' },
    { id: 'utel',    arm: 'ուտել',   rom: 'utel',    en: 'To eat' },
    { id: 'khmel',   arm: 'խմել',    rom: 'khmel',   en: 'To drink' },
    { id: 'khosel',  arm: 'խոսել',   rom: 'khosel',  en: 'To speak' },
    { id: 'sirel',   arm: 'սիրել',   rom: 'sirel',   en: 'To love' },
    { id: 'aghotel', arm: 'աղոթել',  rom: 'aghotel', en: 'To pray' },
    { id: 'kardal',  arm: 'կարդալ',  rom: 'kardal',  en: 'To read' },
    { id: 'grel',    arm: 'գրել',    rom: 'grel',    en: 'To write' },
    { id: 'tesnel',  arm: 'տեսնել',  rom: 'tesnel',  en: 'To see' },

    // --- Around Armenia ---
    { id: 'hayastan', arm: 'Հայաստան', rom: 'Hayastan', en: 'Armenia' },
    { id: 'hay',      arm: 'հայ',      rom: 'hay',      en: 'An Armenian (person)' },
    { id: 'hayeren',  arm: 'հայերեն',  rom: 'hayeren',  en: 'Armenian (language)' },
    { id: 'ararat',   arm: 'Արարատ',   rom: 'Ararat',   en: 'Mount Ararat' },
    { id: 'ler',      arm: 'լեռ',      rom: 'ler',      en: 'Mountain' },
    { id: 'kaghak',   arm: 'քաղաք',    rom: 'kaghak',   en: 'City' },
    { id: 'poghots',  arm: 'փողոց',    rom: 'poghots',  en: 'Street' },
    { id: 'shuka',    arm: 'շուկա',    rom: 'shuka',    en: 'Market' },
    { id: 'tun',      arm: 'տուն',     rom: 'tun',      en: 'House, home' },
    { id: 'dprots',   arm: 'դպրոց',    rom: 'dprots',   en: 'School' },
    { id: 'khanut',   arm: 'խանութ',   rom: 'khanut',   en: 'Shop, store' }
  ];

  /* ---------------------------------------------------------------------
     THE JESUS PRAYER
     ------------------------------------------------------------------- */
  const PRAYER = {
    arm: 'Տեր Հիսուս Քրիստոս, Աստծո Որդի, ողորմիր ինձ՝ մեղավորիս։',
    rom: 'Ter Hisus Kristos, Astso Vordi, voghormir indz, meghavoris.',
    en: 'Lord Jesus Christ, Son of God, have mercy on me, a sinner.',
    // word ids in order, with the punctuation that follows each word
    words: [['ter', ''], ['hisus', ''], ['kristos', ','], ['astso', ''], ['vordi', ','], ['voghormir', ''], ['indz', '՝'], ['meghavoris', '։']],
    classical: 'Տէր Յիսուս Քրիստոս, Որդի Աստուծոյ, ողորմեա ինձ մեղաւորիս',
    about: [
      'The Jesus Prayer is one of the oldest and simplest Christian prayers. It is prayed slowly, often many times in a row, with every breath.',
      'In this course the prayer is your map to the alphabet: each word introduces a few new letters, until you can read the whole prayer yourself.',
      'The text here uses modern Eastern Armenian, the spelling and pronunciation of Yerevan.'
    ],
    punctuation: [
      ['՝', 'but', 'A pause mark, like a light comma.'],
      ['։', 'verjaket', 'The Armenian full stop. It looks like a colon!'],
      ['՞', 'hartsakan', 'The question mark. It sits on top of the stressed vowel.'],
      ['՜', 'batsakanchakan', 'The exclamation mark. It also sits on a vowel.']
    ]
  };

  /* ---------------------------------------------------------------------
     THE COURSE
     kind: letters | word | phrase | prayer | pairs | review | vocab | checkpoint
     ------------------------------------------------------------------- */
  const COURSE = [
    {
      id: 'part1', title: 'Part 1 · The Jesus Prayer',
      desc: 'Learn 17 letters, one word of the prayer at a time. By the end you’ll read the whole prayer on your own.',
      units: [
        { id: 'u1', arm: 'Տեր', en: 'Lord', lessons: [
          { id: 'u1-1', kind: 'letters', letters: ['tyun', 'yech', 're'] },
          { id: 'u1-2', kind: 'word', words: ['ter'] } ] },
        { id: 'u2', arm: 'Հիսուս', en: 'Jesus', lessons: [
          { id: 'u2-1', kind: 'letters', letters: ['ho', 'ini', 'se'] },
          { id: 'u2-2', kind: 'letters', letters: ['vyun', 'u'] },
          { id: 'u2-3', kind: 'word', words: ['hisus'] } ] },
        { id: 'u3', arm: 'Քրիստոս', en: 'Christ', lessons: [
          { id: 'u3-1', kind: 'letters', letters: ['ke', 'vo'] },
          { id: 'u3-2', kind: 'word', words: ['kristos'] },
          { id: 'u3-3', kind: 'phrase', words: ['ph_ljc'], title: 'Lord Jesus Christ' } ] },
        { id: 'u4', arm: 'Աստծո', en: 'of God', lessons: [
          { id: 'u4-1', kind: 'letters', letters: ['ayb', 'tsa'] },
          { id: 'u4-2', kind: 'word', words: ['astso'] } ] },
        { id: 'u5', arm: 'Որդի', en: 'Son', lessons: [
          { id: 'u5-1', kind: 'letters', letters: ['da'] },
          { id: 'u5-2', kind: 'word', words: ['vordi'] },
          { id: 'u5-3', kind: 'phrase', words: ['ph_sog', 'ph_half'], title: 'Son of God' } ] },
        { id: 'u6', arm: 'ողորմիր', en: 'have mercy', lessons: [
          { id: 'u6-1', kind: 'letters', letters: ['ghat', 'men'] },
          { id: 'u6-2', kind: 'word', words: ['voghormir'] } ] },
        { id: 'u7', arm: 'ինձ', en: 'on me', lessons: [
          { id: 'u7-1', kind: 'letters', letters: ['nu', 'dza'] },
          { id: 'u7-2', kind: 'word', words: ['indz'] },
          { id: 'u7-3', kind: 'phrase', words: ['ph_mercy'], title: 'Have mercy on me' } ] },
        { id: 'u8', arm: 'մեղավորիս', en: 'a sinner', lessons: [
          { id: 'u8-1', kind: 'letters', letters: ['vev'] },
          { id: 'u8-2', kind: 'word', words: ['meghavoris'] },
          { id: 'u8-3', kind: 'phrase', words: ['ph_mercy2'], title: 'Have mercy on me, a sinner' } ] },
        { id: 'u9', arm: 'Աղոթքը', en: 'The whole prayer', icon: 'cross', lessons: [
          { id: 'u9-1', kind: 'prayer', title: 'Read the whole prayer' },
          { id: 'u9-2', kind: 'review', title: 'Prayer letters review', pool: 'part1' },
          { id: 'u9-3', kind: 'checkpoint', title: 'Prayer checkpoint', pool: 'part1' } ] }
      ]
    },
    {
      id: 'part2', title: 'Part 2 · The Rest of the Alphabet',
      desc: 'Learn the other 21 letters with words from church and everyday life.',
      units: [
        { id: 'u10', arm: 'Բարև', en: 'Hello', lessons: [
          { id: 'u10-1', kind: 'letters', letters: ['ben', 'lyun'] },
          { id: 'u10-2', kind: 'letters', letters: ['ev'] },
          { id: 'u10-3', kind: 'word', words: ['barev', 'bari', 'lav'] },
          { id: 'u10-4', kind: 'word', words: ['astvats', 'yerevan'] } ] },
        { id: 'u11', arm: 'Խաչ', en: 'Cross', lessons: [
          { id: 'u11-1', kind: 'letters', letters: ['khe', 'cha'] },
          { id: 'u11-2', kind: 'letters', letters: ['ken', 'za'] },
          { id: 'u11-3', kind: 'word', words: ['khach', 'char'] },
          { id: 'u11-4', kind: 'word', words: ['zatik', 'kamk'] } ] },
        { id: 'u12', arm: 'Փառք', en: 'Glory', lessons: [
          { id: 'u12-1', kind: 'letters', letters: ['pyur', 'ra'] },
          { id: 'u12-2', kind: 'letters', letters: ['to'] },
          { id: 'u12-3', kind: 'word', words: ['park', 'aravot'] },
          { id: 'u12-4', kind: 'word', words: ['trchun', 'ator'] } ] },
        { id: 'u13', arm: 'Հաց', en: 'Bread', lessons: [
          { id: 'u13-1', kind: 'letters', letters: ['tso', 'je'] },
          { id: 'u13-2', kind: 'letters', letters: ['gim'] },
          { id: 'u13-3', kind: 'word', words: ['hats', 'jur', 'gini'] },
          { id: 'u13-4', kind: 'word', words: ['yekeghetsi', 'tagavor'] } ] },
        { id: 'u14', arm: 'Պատարագ', en: 'Liturgy', lessons: [
          { id: 'u14-1', kind: 'letters', letters: ['zhe', 'pe'] },
          { id: 'u14-2', kind: 'letters', letters: ['sha'] },
          { id: 'u14-3', kind: 'word', words: ['zham', 'patarag'] },
          { id: 'u14-4', kind: 'word', words: ['shnorh', 'pahk'] } ] },
        { id: 'u15', arm: 'Լույս', en: 'Light', lessons: [
          { id: 'u15-1', kind: 'letters', letters: ['hi', 'che'] },
          { id: 'u15-2', kind: 'letters', letters: ['o'] },
          { id: 'u15-3', kind: 'word', words: ['luys', 'kyank', 'yot'] },
          { id: 'u15-4', kind: 'word', words: ['chanaparh', 'or', 'orhnutyun'] } ] },
        { id: 'u16', arm: 'Ընկեր', en: 'Friend', lessons: [
          { id: 'u16-1', kind: 'letters', letters: ['et', 'e'] },
          { id: 'u16-2', kind: 'letters', letters: ['fe'] },
          { id: 'u16-3', kind: 'word', words: ['enker', 'ej', 'futbol'] },
          { id: 'u16-4', kind: 'phrase', words: ['ph_way'], title: 'I am the way' } ] },
        { id: 'u17', arm: 'Զույգեր', en: 'Tricky pairs', icon: 'pairs', lessons: [
          { id: 'u17-1', kind: 'pairs', title: 'Puff or no puff?', pairs: [['tyun', 'to'], ['pe', 'pyur'], ['ken', 'ke']] },
          { id: 'u17-2', kind: 'pairs', title: 'Sharp sounds & two r’s', pairs: [['tsa', 'tso'], ['che', 'cha'], ['re', 'ra']] },
          { id: 'u17-3', kind: 'pairs', title: 'Look-alikes & throat sounds', pairs: [['yech', 'e'], ['vo', 'o'], ['khe', 'ghat']] } ] },
        { id: 'u18', arm: 'Այբուբեն', en: 'Alphabet master', icon: 'trophy', lessons: [
          { id: 'u18-1', kind: 'review', title: 'Letters Ա to Մ', pool: 'alpha1' },
          { id: 'u18-2', kind: 'review', title: 'Letters Յ to Ֆ', pool: 'alpha2' },
          { id: 'u18-3', kind: 'checkpoint', title: 'Alphabet checkpoint', pool: 'alphabet' } ] }
      ]
    },
    {
      id: 'part3', title: 'Part 3 · Vocabulary (Intermediate)',
      desc: 'You can read! Now build everyday vocabulary and useful phrases.',
      units: [
        { id: 'u19', arm: 'Ողջույն', en: 'Greetings', lessons: [
          { id: 'u19-1', kind: 'vocab', words: ['barev', 'bari_luys', 'bari_yereko', 'bari_gisher'] },
          { id: 'u19-2', kind: 'vocab', words: ['tstesutyun', 'shnorhakal', 'khndrem', 'neroghutyun'] },
          { id: 'u19-3', kind: 'vocab', words: ['ayo', 'voch', 'inchpes_es', 'lav_em'] },
          { id: 'u19-4', kind: 'review', title: 'Greetings review', pool: 'unit' } ] },
        { id: 'u20', arm: 'Ընտանիք', en: 'Family', lessons: [
          { id: 'u20-1', kind: 'vocab', words: ['entanik', 'mayr', 'hayr', 'vordi_f'] },
          { id: 'u20-2', kind: 'vocab', words: ['dustr', 'yeghbayr', 'kuyr', 'yerekha'] },
          { id: 'u20-3', kind: 'vocab', words: ['tatik', 'papik', 'kin', 'amusin'] },
          { id: 'u20-4', kind: 'review', title: 'Family review', pool: 'unit' } ] },
        { id: 'u21', arm: 'Թվեր', en: 'Numbers 1–10', lessons: [
          { id: 'u21-1', kind: 'vocab', words: ['mek', 'yerku', 'yerek', 'chors', 'hing'] },
          { id: 'u21-2', kind: 'vocab', words: ['vets', 'yot_n', 'ut', 'ine', 'tase'] },
          { id: 'u21-3', kind: 'review', title: 'Numbers review', pool: 'unit' } ] },
        { id: 'u22', arm: 'Սնունդ', en: 'Food & drink', lessons: [
          { id: 'u22-1', kind: 'vocab', words: ['hats', 'jur', 'surch', 'tey'] },
          { id: 'u22-2', kind: 'vocab', words: ['kat', 'gini', 'panir', 'mis'] },
          { id: 'u22-3', kind: 'vocab', words: ['dzuk', 'khndzor', 'tsiran', 'nur', 'lavash'] },
          { id: 'u22-4', kind: 'review', title: 'Food review', pool: 'unit' } ] },
        { id: 'u23', arm: 'Գույներ', en: 'Colors', lessons: [
          { id: 'u23-1', kind: 'vocab', words: ['guyn', 'karmir', 'kapuyt', 'tsiranaguyn'] },
          { id: 'u23-2', kind: 'vocab', words: ['deghin', 'kanach', 'spitak', 'sev'] },
          { id: 'u23-3', kind: 'review', title: 'Colors review', pool: 'unit' } ] },
        { id: 'u24', arm: 'Օրեր', en: 'Days & time', lessons: [
          { id: 'u24-1', kind: 'vocab', words: ['yerkushabti', 'yerekshabti', 'chorekshabti', 'hingshabti'] },
          { id: 'u24-2', kind: 'vocab', words: ['urbat', 'shabat', 'kiraki'] },
          { id: 'u24-3', kind: 'vocab', words: ['aysor', 'vaghe', 'yerek_y'] },
          { id: 'u24-4', kind: 'review', title: 'Days review', pool: 'unit' } ] },
        { id: 'u25', arm: 'Հավատ', en: 'Faith & church', lessons: [
          { id: 'u25-1', kind: 'vocab', words: ['astvats', 'yekeghetsi', 'aghotk', 'amen'] },
          { id: 'u25-2', kind: 'vocab', words: ['surb', 'hogi', 'prkich', 'havat'] },
          { id: 'u25-3', kind: 'vocab', words: ['ser', 'huys', 'mom', 'kahana'] },
          { id: 'u25-4', kind: 'vocab', words: ['avetaran', 'astvatsashunch', 'park_astso'] },
          { id: 'u25-5', kind: 'review', title: 'Faith review', pool: 'unit' } ] },
        { id: 'u26', arm: 'Արտահայտություններ', en: 'Useful phrases', lessons: [
          { id: 'u26-1', kind: 'vocab', words: ['im_anune', 'ko_anune', 'sovorum'] },
          { id: 'u26-2', kind: 'vocab', words: ['haskanum', 'sirum_em', 'shat_lav'] },
          { id: 'u26-3', kind: 'vocab', words: ['vortegh_e', 'inchkan', 'dandagh', 'knerek'] },
          { id: 'u26-4', kind: 'review', title: 'Phrases review', pool: 'unit' } ] },
        { id: 'u27', arm: 'Բայեր', en: 'Common verbs', lessons: [
          { id: 'u27-1', kind: 'vocab', words: ['linel', 'unenal', 'gnal', 'gal'] },
          { id: 'u27-2', kind: 'vocab', words: ['utel', 'khmel', 'khosel', 'sirel'] },
          { id: 'u27-3', kind: 'vocab', words: ['aghotel', 'kardal', 'grel', 'tesnel'] },
          { id: 'u27-4', kind: 'review', title: 'Verbs review', pool: 'unit' } ] },
        { id: 'u28', arm: 'Հայաստան', en: 'Around Armenia', lessons: [
          { id: 'u28-1', kind: 'vocab', words: ['hayastan', 'hay', 'hayeren', 'yerevan'] },
          { id: 'u28-2', kind: 'vocab', words: ['ararat', 'ler', 'kaghak', 'poghots'] },
          { id: 'u28-3', kind: 'vocab', words: ['shuka', 'tun', 'dprots', 'khanut'] },
          { id: 'u28-4', kind: 'checkpoint', title: 'Vocabulary checkpoint', pool: 'part3' } ] }
      ]
    }
  ];

  // Encouraging words shown after a correct answer (with pronunciation).
  const PRAISE = [
    ['Ապրե՛ս', 'Apres!', 'Well done!'],
    ['Կեցցե՛ս', 'Ketstses!', 'Bravo!'],
    ['Հիանալի է', 'Hianali e!', 'Excellent!'],
    ['Շատ լավ', 'Shat lav!', 'Very good!'],
    ['Ճիշտ է', 'Chisht e!', 'That’s right!'],
    ['Սքանչելի է', 'Skancheli e!', 'Wonderful!']
  ];

  window.ARM_DATA = { LETTERS, SPECIALS, WORD_LIST, PRAYER, COURSE, PRAISE };
})();
