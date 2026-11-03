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
    return {
      v: 1, xp: 0, xpByDay: {}, streak: 0, bestStreak: 0, lastDay: null, done: {}, items: {},
      settings: { ...DEFAULT_SETTINGS }, settingsAt: 0, practiceLetters: null,
      onboarded: false, created: Date.now(),
      owner: null // account id this progress belongs to (null = not signed in)
    };
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
  AT.freshState = fresh;
  // Swap in new progress while keeping the same objects other code holds on to.
  AT.replaceState = (next) => {
    const s = AT.state;
    const settings = s.settings;
    Object.keys(s).forEach((k) => delete s[k]);
    Object.assign(s, next);
    s.settings = Object.assign(settings, next.settings || {});
    AT.save();
  };
  AT.resetProgress = () => {
    const next = fresh();
    next.settings = { ...AT.state.settings };
    next.settingsAt = AT.state.settingsAt || 0;
    next.onboarded = true;
    AT.replaceState(next);
  };
  // Call after changing a setting so the newest choice wins when devices sync.
  AT.touchSettings = () => { AT.state.settingsAt = Date.now(); };

  /* ---------------- Merging progress from two devices ----------------
     Used by account sync. Nothing learned on either side is lost:
     lessons, mistakes and XP per day are combined. additive = true when
     adding guest progress (made before signing in) to an account. */
  const DEVICE_ONLY_SETTINGS = ['voice'];
  AT.mergeState = (local, remote, { additive = false } = {}) => {
    if (!remote) return { ...local };
    const base = fresh();
    const out = { ...base, ...remote, ...local };
    const max = (a, b) => Math.max(a || 0, b || 0);
    const keysOf = (a, b) => AT.uniq([...Object.keys(a || {}), ...Object.keys(b || {})]);

    out.done = {};
    for (const k of keysOf(local.done, remote.done)) {
      const a = (local.done || {})[k] || {}, b = (remote.done || {})[k] || {};
      out.done[k] = { times: additive ? (a.times || 0) + (b.times || 0) : max(a.times, b.times), best: max(a.best, b.best), at: max(a.at, b.at) };
    }
    out.items = {};
    for (const k of keysOf(local.items, remote.items)) {
      const a = (local.items || {})[k] || {}, b = (remote.items || {})[k] || {};
      out.items[k] = additive ? { c: (a.c || 0) + (b.c || 0), w: (a.w || 0) + (b.w || 0), t: max(a.t, b.t) } : { c: max(a.c, b.c), w: max(a.w, b.w), t: max(a.t, b.t) };
    }
    out.xpByDay = {};
    for (const k of keysOf(local.xpByDay, remote.xpByDay)) {
      const a = (local.xpByDay || {})[k], b = (remote.xpByDay || {})[k];
      out.xpByDay[k] = additive ? (a || 0) + (b || 0) : max(a, b);
    }
    out.xp = additive ? (local.xp || 0) + (remote.xp || 0) : max(local.xp, remote.xp);

    // Streak: the side that practiced most recently knows the current streak.
    const la = local.lastDay || '', ra = remote.lastDay || '';
    if (la > ra) { out.lastDay = la; out.streak = local.streak; }
    else if (ra > la) { out.lastDay = ra; out.streak = remote.streak; }
    else { out.lastDay = la || null; out.streak = max(local.streak, remote.streak); }
    out.bestStreak = Math.max(max(local.bestStreak, remote.bestStreak), out.streak || 0);
    out.onboarded = !!(local.onboarded || remote.onboarded);
    out.created = Math.min(local.created || Date.now(), remote.created || Date.now());

    // Settings: the most recently changed side wins (voice stays per device).
    const newer = (remote.settingsAt || 0) > (local.settingsAt || 0) ? remote : local;
    out.settings = { ...base.settings, ...(local.settings || {}), ...(newer.settings || {}) };
    DEVICE_ONLY_SETTINGS.forEach((k) => { if (local.settings && k in local.settings) out.settings[k] = local.settings[k]; });
    out.settingsAt = max(local.settingsAt, remote.settingsAt);
    out.practiceLetters = newer.practiceLetters || local.practiceLetters || remote.practiceLetters || null;
    return out;
  };
  AT.hasProgress = (s = AT.state) => (s.xp || 0) > 0 || Object.keys(s.done || {}).length > 0;

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
