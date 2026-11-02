/* Core helpers, course indexing and saved progress. */
(function () {
  'use strict';
  const D = window.ARM_DATA;
  const AT = (window.AT = {});

  /* ---------------- Utilities ---------------- */
  AT.esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  AT.shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  AT.sample = (arr, n) => AT.shuffle(arr).slice(0, n);
  AT.pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  AT.uniq = (arr) => [...new Set(arr)];
  // "f[a]ther" -> f<u>a</u>ther (escaped)
  AT.hl = (s) => AT.esc(s).replace(/\[(.+?)\]/g, '<u>$1</u>');
  AT.plain = (s) => String(s).replace(/[[\]]/g, '');
  AT.dayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  AT.dayDiff = (a, b) => Math.round((new Date(b + 'T12:00:00') - new Date(a + 'T12:00:00')) / 86400000);

  /* ---------------- Letters ---------------- */
  AT.LETTERS = D.LETTERS;
  AT.SPECIALS = D.SPECIALS;
  AT.ALL_LETTERS = [...D.LETTERS, ...D.SPECIALS];
  const letterById = new Map(AT.ALL_LETTERS.map((L) => [L.id, L]));
  const letterByChar = new Map(D.LETTERS.map((L) => [L.lo, L]));
  AT.letter = (id) => letterById.get(id);
  AT.letterSoundText = (L) => L.soundText || (L.vowel ? L.lo : L.lo + 'ա');
  AT.alphaIndex = (id) => D.LETTERS.findIndex((L) => L.id === id);

  // Split one Armenian word into letter tokens. ու and և are single tokens.
  AT.tokenize = (word) => {
    const chars = [...word];
    const out = [];
    for (let i = 0; i < chars.length; i++) {
      const ch = chars[i];
      const lo = ch.toLowerCase();
      if (lo === 'ո' && chars[i + 1] && chars[i + 1].toLowerCase() === 'ւ') {
        out.push({ ch: ch + chars[i + 1], id: 'u' });
        i++;
      } else if (lo === 'և') {
        out.push({ ch, id: 'ev' });
      } else if (letterByChar.has(lo)) {
        out.push({ ch, id: letterByChar.get(lo).id });
      }
    }
    return out;
  };

  // The sound a token makes in its position (Ե, Ո and և change at the start of a word).
  AT.tokenSound = (tok, index) => {
    const first = index === 0;
    switch (tok.id) {
      case 'yech': return first ? 'ye' : 'e';
      case 'vo': return first ? 'vo' : 'o';
      case 'ev': return first ? 'yev' : 'ev';
      case 'u': return 'u';
      case 'et': return 'ə';
      case 'ini': return 'i';
      default: return AT.letter(tok.id).snd.replace(/ \(.*\)$/, '');
    }
  };
  AT.tokenAudio = (tok, index) => {
    if (tok.id === 'yech') return index === 0 ? 'ե' : 'է';
    if (tok.id === 'vo') return index === 0 ? 'ո' : 'օ';
    return AT.letterSoundText(AT.letter(tok.id));
  };
  AT.lettersOfText = (text) => AT.uniq(text.split(/\s+/).flatMap((w) => AT.tokenize(w).map((t) => t.id)));

  /* ---------------- Words ---------------- */
  const wordById = new Map(D.WORD_LIST.map((W) => [W.id, W]));
  AT.word = (id) => wordById.get(id);
  AT.WORDS = D.WORD_LIST;
  AT.PRAYER = D.PRAYER;
  AT.PRAISE = D.PRAISE;
  AT.stripPunct = (s) => s.replace(/[,.։՝՞՜՛!?«»]/g, '');
  AT.phraseWords = (W) => AT.stripPunct(W.arm).split(/\s+/).filter(Boolean);
  // Find a dictionary entry for a single word inside a phrase.
  AT.lookupWord = (text) => {
    const t = AT.stripPunct(text).toLowerCase();
    return D.WORD_LIST.find((W) => !W.phrase && AT.stripPunct(W.arm).toLowerCase() === t);
  };

  /* ---------------- Course ---------------- */
  AT.COURSE = D.COURSE;
  AT.FLAT = [];
  D.COURSE.forEach((part, pi) => {
    part.units.forEach((unit, ui) => {
      unit.part = part;
      unit.lessons.forEach((lesson, li) => {
        lesson.unit = unit;
        lesson.part = part;
        lesson.index = AT.FLAT.length;
        lesson.indexInUnit = li;
        AT.FLAT.push(lesson);
      });
    });
  });
  let n = 0;
  D.COURSE.forEach((p) => p.units.forEach((u) => (u.number = ++n)));
  AT.lessonById = (id) => AT.FLAT.find((l) => l.id === id);

  // Letters taught in lessons [0, index] (inclusive).
  AT.lettersUpTo = (index) => {
    const out = [];
    for (let i = 0; i <= index && i < AT.FLAT.length; i++) out.push(...(AT.FLAT[i].letters || []));
    return out;
  };
  AT.wordsUpTo = (index) => {
    const out = [];
    for (let i = 0; i <= index && i < AT.FLAT.length; i++) {
      const L = AT.FLAT[i];
      if (L.kind === 'word' || L.kind === 'vocab') out.push(...L.words);
    }
    return AT.uniq(out);
  };
  AT.unitLetters = (unit) => unit.lessons.flatMap((l) => l.letters || []);
  AT.unitWords = (unit) => AT.uniq(unit.lessons.flatMap((l) => (l.kind === 'word' || l.kind === 'vocab' ? l.words : [])));

  AT.lessonTitle = (lesson) => {
    if (lesson.title) return lesson.title;
    if (lesson.kind === 'letters') {
      const g = lesson.letters.map((id) => AT.letter(id).up);
      return 'Meet ' + (g.length > 1 ? g.slice(0, -1).join(', ') + ' & ' + g[g.length - 1] : g[0]);
    }
    if (lesson.kind === 'word') {
      if (lesson.words.length === 1) return `Read “${AT.word(lesson.words[0]).arm}”`;
      return 'Read ' + lesson.words.map((id) => AT.word(id).arm).join(', ');
    }
    if (lesson.kind === 'vocab') {
      const en = lesson.words.map((id) => AT.word(id).en.replace(/ \(.*\)$/, ''));
      return en.slice(0, 2).join(', ') + (en.length > 2 ? ' & more' : '');
    }
    return 'Lesson';
  };
  AT.lessonIcon = (lesson) => {
    if (lesson.kind === 'checkpoint') return 'trophy';
    if (lesson.kind === 'review') return 'dumbbell';
    if (lesson.kind === 'prayer' || lesson.kind === 'phrase') return 'cross';
    if (lesson.kind === 'pairs') return 'pairs';
    if (lesson.kind === 'letters') return 'letter';
    return 'book';
  };
  AT.lessonDesc = (lesson) => {
    switch (lesson.kind) {
      case 'letters': return `${lesson.letters.length} new letter${lesson.letters.length > 1 ? 's' : ''} · upper & lowercase`;
      case 'word': return 'Read, hear and spell new words';
      case 'phrase': return 'Put prayer words together';
      case 'prayer': return 'Read the full Jesus Prayer';
      case 'pairs': return 'Hear the difference between look-alike sounds';
      case 'review': return 'Mixed practice';
      case 'checkpoint': return 'A bigger test of everything so far';
      case 'vocab': return `${lesson.words.length} new words & phrases`;
      default: return '';
    }
  };

  /* ---------------- Saved state ---------------- */
  const KEY = 'armenianTutor.v1';
  const DEFAULT_SETTINGS = { goal: 20, sfx: true, autoplay: true, voice: 'auto', rom: true, hearts: true, unlockAll: false, theme: 'auto' };
  function fresh() {
    return { v: 1, xp: 0, xpByDay: {}, streak: 0, bestStreak: 0, lastDay: null, done: {}, items: {}, settings: { ...DEFAULT_SETTINGS }, onboarded: false, created: Date.now() };
  }
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return fresh();
      const s = JSON.parse(raw);
      const base = fresh();
      return { ...base, ...s, settings: { ...base.settings, ...(s.settings || {}) } };
    } catch (e) {
      return fresh();
    }
  }
  AT.state = load();
  AT.save = () => {
    try { localStorage.setItem(KEY, JSON.stringify(AT.state)); } catch (e) { /* private mode: progress lasts this session */ }
    AT.emit('state');
  };
  AT.resetProgress = () => {
    const settings = AT.state.settings;
    AT.state = fresh();
    AT.state.settings = settings;
    AT.state.onboarded = true;
    AT.save();
  };

  // Tiny event bus
  const listeners = {};
  AT.on = (ev, fn) => (listeners[ev] = listeners[ev] || []).push(fn);
  AT.emit = (ev, data) => (listeners[ev] || []).forEach((fn) => fn(data));

  /* ---------------- XP & streak ---------------- */
  AT.currentStreak = () => {
    const s = AT.state;
    if (!s.lastDay) return 0;
    const diff = AT.dayDiff(s.lastDay, AT.dayKey());
    return diff <= 1 ? s.streak : 0;
  };
  AT.todayXP = () => AT.state.xpByDay[AT.dayKey()] || 0;
  // Returns true when this XP started a new streak day.
  AT.addXP = (amount) => {
    const s = AT.state;
    const today = AT.dayKey();
    let newDay = false;
    if (s.lastDay !== today) {
      const diff = s.lastDay ? AT.dayDiff(s.lastDay, today) : 99;
      s.streak = diff === 1 ? s.streak + 1 : 1;
      s.lastDay = today;
      s.bestStreak = Math.max(s.bestStreak, s.streak);
      newDay = true;
    }
    s.xp += amount;
    s.xpByDay[today] = (s.xpByDay[today] || 0) + amount;
    // keep the last 60 days
    const keys = Object.keys(s.xpByDay).sort();
    while (keys.length > 60) delete s.xpByDay[keys.shift()];
    AT.save();
    return newDay;
  };

  /* ---------------- Item strength (for “fix mistakes”) ---------------- */
  AT.markItem = (key, ok) => {
    if (!key) return;
    const it = AT.state.items[key] || (AT.state.items[key] = { c: 0, w: 0, t: 0 });
    if (ok) it.c++; else it.w++;
    it.t = Date.now();
  };
  AT.weakItems = () => Object.entries(AT.state.items)
    .filter(([, v]) => v.w > 0)
    .map(([k, v]) => ({ key: k, score: v.w * 2 - v.c }))
    .filter((x) => x.score > -2)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.key);

  /* ---------------- Lesson progress ---------------- */
  AT.isDone = (id) => !!AT.state.done[id];
  AT.currentIndex = () => {
    const i = AT.FLAT.findIndex((l) => !AT.isDone(l.id));
    return i === -1 ? AT.FLAT.length : i;
  };
  AT.isUnlocked = (lesson) => AT.state.settings.unlockAll || lesson.index <= AT.currentIndex() || AT.isDone(lesson.id);
  AT.completeLesson = (lesson, accuracy) => {
    const d = AT.state.done[lesson.id] || { times: 0, best: 0 };
    d.times++;
    d.best = Math.max(d.best, Math.round(accuracy * 100));
    d.at = Date.now();
    AT.state.done[lesson.id] = d;
    AT.save();
  };
  AT.learnedLetters = () => {
    const out = new Set();
    for (const l of AT.FLAT) if (AT.isDone(l.id)) (l.letters || []).forEach((id) => out.add(id));
    return out;
  };
  AT.learnedWords = () => {
    const out = new Set();
    for (const l of AT.FLAT) if (AT.isDone(l.id) && (l.kind === 'word' || l.kind === 'vocab')) l.words.forEach((id) => out.add(id));
    return out;
  };
  AT.coreLetterCount = () => [...AT.learnedLetters()].filter((id) => !AT.letter(id).special).length;
})();
