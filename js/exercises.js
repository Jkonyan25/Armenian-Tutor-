/* Exercise generators and lesson recipes. */
(function () {
  'use strict';
  const AT = window.AT;
  const { esc, hl, shuffle, sample, pick, uniq } = AT;
  const L = (id) => AT.letter(id);
  const W = (id) => AT.word(id);
  const G = (AT.gen = {});

  // Letters that are easy to confuse by ear: never offered together in a
  // listening question, except in the "tricky pairs" lessons.
  const CONFUSE = { tyun: 'to', to: 'tyun', pe: 'pyur', pyur: 'pe', ken: 'ke', ke: 'ken', tsa: 'tso', tso: 'tsa',
    che: 'cha', cha: 'che', re: 'ra', ra: 're', yech: 'e', e: 'yech', vo: 'o', o: 'vo', khe: 'ghat', ghat: 'khe' };

  const canSound = (id) => !L(id).noSoundQuiz;
  const canCase = (id) => !L(id).noCaseQuiz;

  /* ---------------- HTML snippets shared with the renderer ---------------- */
  AT.soundHTML = (Lt) =>
    `<span class="snd">${esc(Lt.snd)}</span> <span class="anchor">as in <b>${hl(Lt.eng)}</b>${Lt.note ? ` <em>${esc(Lt.note)}</em>` : ''}</span>`;
  AT.pairHTML = (Lt) => `<span class="arm">${esc(Lt.up)} ${esc(Lt.lo)}</span>`;

  function letterDistractors(target, pool, n, { avoidConfusable = false, filter = () => true } = {}) {
    const ok = (id) => id !== target && filter(id) && !(avoidConfusable && CONFUSE[target] === id);
    let out = sample(uniq(pool).filter(ok), n);
    if (out.length < n) {
      const more = AT.LETTERS.map((x) => x.id).filter((id) => ok(id) && !out.includes(id));
      out = out.concat(sample(more, n - out.length));
    }
    return out;
  }

  const norm = (s) => AT.stripPunct(String(s)).toLowerCase().trim();
  // pools: array of arrays of word ids, most preferred first
  function wordDistractors(id, pools, n, field) {
    const target = W(id);
    const seen = new Set([norm(target[field])]);
    const out = [];
    const tryAdd = (c) => {
      if (out.length >= n || c === id) return;
      const w = W(c);
      if (!w || !!w.phrase !== !!target.phrase) return;
      const v = norm(w[field]);
      if (seen.has(v)) return;
      seen.add(v);
      out.push(c);
    };
    for (const pool of pools) shuffle(pool).forEach(tryAdd);
    if (out.length < n) shuffle(AT.WORDS.map((w) => w.id)).forEach(tryAdd);
    return out;
  }

  /* ---------------- Intro cards ---------------- */
  G.introLetter = (id) => ({ type: 'introLetter', id, key: 'L:' + id });
  G.introWord = (id) => ({ type: 'introWord', id, key: 'W:' + id });
  G.introPair = (a, b) => ({ type: 'introPair', a, b });
  G.introPhrase = (id) => ({ type: 'introPhrase', id, key: 'W:' + id });

  /* ---------------- Letter questions ---------------- */
  G.letterToSound = (id, pool, opts = {}) => {
    const Lt = L(id);
    const ds = opts.options ? opts.options.filter((x) => x !== id) : letterDistractors(id, pool, 3, { filter: canSound });
    return {
      type: 'mcq', key: 'L:' + id, prompt: 'What sound does this letter make?',
      stim: { kind: 'glyph', text: Math.random() < 0.5 ? Lt.up : Lt.lo },
      options: [id, ...ds].map((x) => ({ value: x, html: AT.soundHTML(L(x)), kind: 'sound' })),
      answer: id, after: AT.letterSoundText(Lt), reveal: AT.soundHTML(Lt), tip: Lt.tip
    };
  };

  G.soundToLetter = (id, pool, opts = {}) => {
    const Lt = L(id);
    const up = Math.random() < 0.5;
    const ds = opts.options ? opts.options.filter((x) => x !== id) : letterDistractors(id, pool, 3, { filter: canSound });
    return {
      type: 'mcq', key: 'L:' + id, prompt: `Which letter sounds like “${Lt.snd}”?`,
      sub: `as in <b>${hl(Lt.eng)}</b>${Lt.note ? ` <em>(${esc(Lt.note)})</em>` : ''}`,
      options: [id, ...ds].map((x) => ({ value: x, glyph: up ? L(x).up : L(x).lo, kind: 'glyph' })),
      answer: id, after: AT.letterSoundText(Lt), reveal: AT.pairHTML(Lt), tip: Lt.tip
    };
  };

  G.listenLetter = (id, pool, opts = {}) => {
    const Lt = L(id);
    const up = Math.random() < 0.5;
    const ds = opts.options ? opts.options.filter((x) => x !== id)
      : letterDistractors(id, pool, 3, { avoidConfusable: true, filter: canSound });
    return {
      type: 'mcq', key: 'L:' + id, prompt: 'Which letter do you hear?', listen: true,
      stim: { kind: 'listen', audio: AT.letterSoundText(Lt) },
      options: [id, ...ds].map((x) => ({ value: x, glyph: up ? L(x).up : L(x).lo, kind: 'glyph' })),
      answer: id, reveal: `${AT.pairHTML(Lt)} · “${esc(Lt.snd)}” as in ${hl(Lt.eng)}`, tip: Lt.tip
    };
  };

  G.caseMatch = (id, pool, dir) => {
    const Lt = L(id);
    dir = dir || (Math.random() < 0.5 ? 'up' : 'lo');
    const ds = letterDistractors(id, pool, 3, { filter: canCase });
    return {
      type: 'mcq', key: 'L:' + id,
      prompt: dir === 'up' ? 'Find the lowercase (small) form of this letter' : 'Find the capital (big) form of this letter',
      stim: { kind: 'glyph', text: dir === 'up' ? Lt.up : Lt.lo },
      options: [id, ...ds].map((x) => ({ value: x, glyph: dir === 'up' ? L(x).lo : L(x).up, kind: 'glyph' })),
      answer: id, after: AT.letterSoundText(Lt), reveal: AT.pairHTML(Lt), tip: `${Lt.up} and ${Lt.lo} are the same letter: ${Lt.name} (${Lt.nameRom}).`
    };
  };

  G.matchCase = (ids) => ({
    type: 'match', prompt: 'Match each capital letter with its lowercase partner',
    pairs: ids.filter(canCase).slice(0, 5).map((id) => ({
      key: id, left: { glyph: L(id).up, audio: AT.letterSoundText(L(id)) }, right: { glyph: L(id).lo, audio: AT.letterSoundText(L(id)) }
    }))
  });

  G.matchSound = (ids) => ({
    type: 'match', prompt: 'Match each letter with its sound',
    pairs: ids.filter(canSound).slice(0, 5).map((id) => ({
      key: id, left: { glyph: L(id).lo, audio: AT.letterSoundText(L(id)) }, right: { html: `<span class="snd">${esc(L(id).snd)}</span><span class="anchor">${hl(L(id).eng)}</span>` }
    }))
  });

  G.randomLetterQ = (id, pool) => {
    const fns = [];
    if (canSound(id)) fns.push(() => G.letterToSound(id, pool), () => G.soundToLetter(id, pool), () => G.listenLetter(id, pool));
    if (canCase(id)) fns.push(() => G.caseMatch(id, pool));
    return pick(fns)();
  };

  /* ---------------- Word questions ---------------- */
  G.wordRead = (id, pools) => {
    const w = W(id);
    return {
      type: 'mcq', key: 'W:' + id, prompt: 'How do you read this?',
      stim: { kind: 'arm', text: w.arm },
      options: [id, ...wordDistractors(id, pools, 3, 'rom')].map((x) => ({ value: x, text: W(x).rom, kind: 'text' })),
      answer: id, after: w.arm, reveal: `<span class="arm">${esc(w.arm)}</span> = ${esc(w.rom)}`, tip: w.note
    };
  };

  G.wordMeaning = (id, pools) => {
    const w = W(id);
    return {
      type: 'mcq', key: 'W:' + id, prompt: 'What does this mean?',
      stim: { kind: 'arm', text: w.arm, rom: w.rom, audio: w.arm },
      options: [id, ...wordDistractors(id, pools, 3, 'en')].map((x) => ({ value: x, text: W(x).en, kind: 'text' })),
      answer: id, reveal: `<span class="arm">${esc(w.arm)}</span> = ${esc(w.en)}`, tip: w.note
    };
  };

  G.meaningWord = (id, pools) => {
    const w = W(id);
    return {
      type: 'mcq', key: 'W:' + id, prompt: `Which one means “${w.en}”?`,
      options: [id, ...wordDistractors(id, pools, 3, 'arm')].map((x) => ({ value: x, arm: W(x).arm, audio: W(x).arm, kind: 'arm' })),
      answer: id, after: w.arm, reveal: `<span class="arm">${esc(w.arm)}</span> (${esc(w.rom)})`, tip: w.note
    };
  };

  G.listenWord = (id, pools) => {
    const w = W(id);
    return {
      type: 'mcq', key: 'W:' + id, prompt: 'What do you hear?', listen: true,
      stim: { kind: 'listen', audio: w.arm },
      options: [id, ...wordDistractors(id, pools, 3, 'arm')].map((x) => ({ value: x, arm: W(x).arm, kind: 'arm' })),
      answer: id, reveal: `<span class="arm">${esc(w.arm)}</span> (${esc(w.rom)}) · ${esc(w.en)}`, tip: w.note
    };
  };

  G.buildWord = (id, letterPool) => {
    const w = W(id);
    const toks = AT.tokenize(w.arm);
    const inWord = new Set(toks.map((t) => t.id));
    const extra = letterDistractors('', letterPool.filter((x) => !inWord.has(x)), toks.length > 5 ? 3 : 2,
      { filter: (x) => !inWord.has(x) && x !== 'vyun' && x !== 'ev' }).map((x) => L(x).lo);
    return {
      type: 'build', mode: 'letters', key: 'W:' + id, prompt: 'Spell the word',
      stim: { kind: 'text', text: w.en, rom: w.rom, audio: w.arm },
      tiles: [...toks.map((t) => t.ch), ...extra], answer: toks.map((t) => t.ch),
      after: w.arm, reveal: `<span class="arm">${esc(w.arm)}</span>`, tip: w.note
    };
  };

  G.buildPhrase = (id, wordPool = []) => {
    const w = W(id);
    const words = AT.phraseWords(w);
    const lower = new Set(words.map((x) => x.toLowerCase()));
    const extra = sample(uniq(wordPool.map(W).filter((x) => x && !x.phrase).map((x) => AT.stripPunct(x.arm))
      .filter((x) => !lower.has(x.toLowerCase()) && !x.includes(' '))), words.length > 6 ? 2 : Math.min(2, words.length - 1));
    return {
      type: 'build', mode: 'words', key: 'W:' + id, prompt: 'Put the words in order',
      stim: { kind: 'text', text: w.en, audio: w.arm },
      tiles: [...words, ...extra], answer: words,
      after: w.arm, reveal: `<span class="arm">${esc(w.arm)}</span>`, tip: w.note
    };
  };

  G.fillBlank = (id, wordPool = [], blank) => {
    const w = W(id);
    const parts = w.arm.split(/\s+/);
    const words = AT.phraseWords(w);
    const i = blank ?? Math.floor(Math.random() * words.length);
    const answer = words[i];
    const display = parts.map((p, k) => (k === i ? '____' + ((p.match(/[,.։՝՜!?]+$/) || [''])[0]) : p)).join(' ');
    const seen = new Set([answer.toLowerCase()]);
    const cands = shuffle(uniq([...words.filter((x, k) => k !== i), ...wordPool.map(W).filter((x) => x && !x.phrase).map((x) => AT.stripPunct(x.arm))]));
    const opts = [answer];
    for (const c of cands) {
      if (opts.length >= 4) break;
      if (seen.has(c.toLowerCase()) || c.includes(' ')) continue;
      seen.add(c.toLowerCase());
      opts.push(c);
    }
    return {
      type: 'mcq', key: 'W:' + id, prompt: 'Fill in the missing word',
      stim: { kind: 'arm', text: display, en: w.en, blank: true },
      options: opts.map((x) => ({ value: x, arm: x, audio: AT.speech.hasClip(x) ? x : null, kind: 'arm' })),
      answer, after: w.arm, reveal: `<span class="arm">${esc(w.arm)}</span>`, tip: w.note
    };
  };

  G.listenPhrase = (id, phrasePool = []) => {
    const w = W(id);
    const words = AT.phraseWords(w);
    const target = words.join(' ');
    const variants = new Set([target]);
    const opts = [{ value: target, arm: target, kind: 'arm' }];
    for (let tries = 0; tries < 20 && opts.length < 3 && words.length > 1; tries++) {
      const v = shuffle(words).join(' ');
      if (!variants.has(v)) { variants.add(v); opts.push({ value: v, arm: v, kind: 'arm' }); }
    }
    for (const pid of shuffle(phrasePool)) {
      if (opts.length >= 4) break;
      const v = AT.phraseWords(W(pid)).join(' ');
      if (!variants.has(v)) { variants.add(v); opts.push({ value: v, arm: v, kind: 'arm' }); }
    }
    return {
      type: 'mcq', key: 'W:' + id, prompt: 'What do you hear?', listen: true,
      stim: { kind: 'listen', audio: w.arm }, options: opts, answer: target,
      reveal: `<span class="arm">${esc(w.arm)}</span> · ${esc(w.en)}`, tip: w.note
    };
  };

  G.matchWords = (ids) => ({
    type: 'match', prompt: 'Tap the matching pairs',
    pairs: uniq(ids).slice(0, 5).map((id) => ({ key: id, left: { arm: W(id).arm, audio: W(id).arm }, right: { text: W(id).en } }))
  });

  G.randomWordQ = (id, pools, letterPool) => {
    const w = W(id);
    if (w.phrase) {
      return pick([() => G.wordMeaning(id, pools), () => G.meaningWord(id, pools), () => G.buildPhrase(id, pools.flat()),
        () => G.listenWord(id, pools), () => G.fillBlank(id, pools.flat())])();
    }
    const fns = [() => G.wordMeaning(id, pools), () => G.meaningWord(id, pools), () => G.listenWord(id, pools), () => G.wordRead(id, pools)];
    if (AT.tokenize(w.arm).length <= 9) fns.push(() => G.buildWord(id, letterPool));
    return pick(fns)();
  };

  /* ---------------- Lesson recipes ---------------- */
  const ALL_LETTER_IDS = AT.LETTERS.map((x) => x.id);
  const prayerWords = AT.PRAYER.words.map(([id]) => id);
  const partWords = (part) => uniq(part.units.flatMap(AT.unitWords));

  function lettersLesson(newIds, known, knownBefore) {
    const seq = [];
    for (const id of newIds) {
      seq.push(G.introLetter(id));
      seq.push(canSound(id) ? G.letterToSound(id, known) : G.caseMatch(id, known, 'up'));
    }
    const practice = [];
    for (const id of newIds) {
      const fns = [];
      if (canSound(id)) fns.push(() => G.soundToLetter(id, known), () => G.listenLetter(id, known));
      if (canCase(id)) fns.push(() => G.caseMatch(id, known));
      sample(fns, 2).forEach((f) => practice.push(f()));
    }
    sample(knownBefore, Math.min(3, knownBefore.length)).forEach((id) => practice.push(G.randomLetterQ(id, known)));
    const caseIds = uniq([...newIds.filter(canCase), ...shuffle(knownBefore.filter(canCase))]).slice(0, 5);
    if (caseIds.length >= 3) practice.push(G.matchCase(caseIds));
    return seq.concat(shuffle(practice));
  }

  function wordLesson(ids, letterPool, pools) {
    const seq = [];
    const practice = [];
    for (const id of ids) {
      seq.push(G.introWord(id));
      seq.push(G.wordRead(id, pools));
    }
    for (const id of ids) {
      practice.push(G.buildWord(id, letterPool));
      const extra = [() => G.listenWord(id, pools), () => (Math.random() < 0.5 ? G.wordMeaning(id, pools) : G.meaningWord(id, pools))];
      sample(extra, ids.length >= 3 ? 1 : 2).forEach((f) => practice.push(f()));
    }
    const wl = uniq(ids.flatMap((id) => AT.tokenize(W(id).arm).map((t) => t.id))).filter(canSound);
    sample(wl, 2).forEach((x) => practice.push(G.soundToLetter(x, letterPool)));
    const older = pools[0].filter((x) => !ids.includes(x) && !W(x).phrase);
    sample(older, 2).forEach((x) => practice.push(G.wordMeaning(x, pools)));
    const matchSet = uniq([...ids, ...sample(older, 4)]).slice(0, 5);
    if (matchSet.length >= 3) practice.push(G.matchWords(matchSet));
    return seq.concat(shuffle(practice));
  }

  function phraseLesson(ids, wordPool, phrasePool) {
    const seq = [];
    const practice = [];
    for (const id of ids) {
      seq.push(G.introPhrase(id));
      seq.push(G.buildPhrase(id, wordPool));
      const n = AT.phraseWords(W(id)).length;
      sample([...Array(n).keys()], Math.min(2, n)).forEach((b) => practice.push(G.fillBlank(id, wordPool, b)));
      practice.push(G.listenPhrase(id, phrasePool));
    }
    const comp = uniq(ids.flatMap((id) => AT.phraseWords(W(id)).map((x) => AT.lookupWord(x)?.id).filter(Boolean)));
    sample(comp, 3).forEach((x) => practice.push(G.wordMeaning(x, [comp, wordPool])));
    if (comp.length >= 3) practice.push(G.matchWords(sample(comp, 5)));
    return seq.concat(shuffle(practice), [G.buildPhrase(ids[ids.length - 1], wordPool)]);
  }

  function prayerLesson() {
    const pools = [prayerWords];
    const practice = [G.buildPhrase('ph_half', prayerWords), G.buildPhrase('ph_mercy2', prayerWords)];
    sample([...Array(8).keys()], 3).forEach((b) => practice.push(G.fillBlank('ph_prayer', prayerWords, b)));
    sample(prayerWords, 2).forEach((x) => practice.push(G.listenWord(x, pools)));
    sample(prayerWords, 2).forEach((x) => practice.push(G.wordMeaning(x, pools)));
    practice.push(G.matchWords(sample(prayerWords, 5)));
    return [G.introPhrase('ph_prayer'), ...shuffle(practice), G.buildPhrase('ph_prayer', [])];
  }

  function pairsLesson(pairs) {
    const out = [];
    for (const [a, b] of pairs) {
      out.push(G.introPair(a, b));
      const drills = [
        G.listenLetter(a, null, { options: [a, b] }),
        G.listenLetter(b, null, { options: [a, b] }),
        G.soundToLetter(pick([a, b]), null, { options: [a, b] }),
        G.letterToSound(pick([a, b]), null, { options: [a, b] })
      ];
      out.push(...shuffle(drills));
    }
    const all = pairs.flat();
    out.push(G.matchSound(sample(all, 5)));
    pairs.forEach(([a, b]) => { const t = pick([a, b]); out.push(G.listenLetter(t, null, { options: [a, b] })); });
    return out;
  }

  function reviewLesson({ letters = [], words = [], letterPool, wordPools, n = 12 }) {
    const qs = [];
    const nl = words.length ? (letters.length ? Math.round(n * 0.55) : 0) : n;
    const nw = n - nl;
    if (letters.length) {
      const picks = [];
      while (picks.length < nl) picks.push(...shuffle(letters));
      picks.slice(0, nl).forEach((id) => qs.push(G.randomLetterQ(id, letterPool)));
      const c = shuffle(letters.filter(canCase)).slice(0, 5);
      if (c.length >= 3) qs.push(G.matchCase(c));
    }
    if (words.length) {
      const picks = [];
      while (picks.length < nw) picks.push(...shuffle(words));
      picks.slice(0, nw).forEach((id) => qs.push(G.randomWordQ(id, wordPools, letterPool)));
      const singles = words.filter((x) => !W(x).phrase);
      if (singles.length >= 3) qs.push(G.matchWords(sample(singles, 5)));
    }
    return shuffle(qs);
  }

  AT.buildLesson = (lesson) => {
    const idx = lesson.index;
    const known = AT.lettersUpTo(idx);
    const knownBefore = AT.lettersUpTo(idx - 1);
    const letterPool = known.filter((x) => AT.letter(x) && !AT.letter(x).special);
    const knownWords = AT.wordsUpTo(idx);
    const pools = [knownWords, partWords(lesson.part)];
    switch (lesson.kind) {
      case 'letters': return lettersLesson(lesson.letters, known, knownBefore);
      case 'word': return wordLesson(lesson.words, letterPool, pools);
      case 'phrase': return phraseLesson(lesson.words, knownWords, ['ph_ljc', 'ph_sog', 'ph_half', 'ph_mercy', 'ph_mercy2', 'ph_prayer']);
      case 'prayer': return prayerLesson();
      case 'pairs': return pairsLesson(lesson.pairs);
      case 'vocab': return vocabLesson(lesson.words, pools, ALL_LETTER_IDS, lesson);
      case 'review':
      case 'checkpoint': {
        const n = lesson.kind === 'checkpoint' ? 16 : 12;
        const p = lesson.pool;
        if (p === 'part1') return reviewLesson({ letters: AT.COURSE[0].units.flatMap(AT.unitLetters).filter((x) => !L(x).special), words: prayerWords, letterPool, wordPools: [prayerWords], n });
        if (p === 'alpha1') return reviewLesson({ letters: ALL_LETTER_IDS.slice(0, 20), letterPool: ALL_LETTER_IDS, n });
        if (p === 'alpha2') return reviewLesson({ letters: ALL_LETTER_IDS.slice(20), letterPool: ALL_LETTER_IDS, n });
        if (p === 'alphabet') return reviewLesson({ letters: ALL_LETTER_IDS, letterPool: ALL_LETTER_IDS, n });
        if (p === 'unit') { const u = AT.unitWords(lesson.unit); return reviewLesson({ words: u, letterPool: ALL_LETTER_IDS, wordPools: [u, knownWords], n }); }
        if (p === 'part3') { const pw = AT.wordsUpTo(idx).filter((x) => partWords(lesson.part).includes(x)); return reviewLesson({ words: pw, letterPool: ALL_LETTER_IDS, wordPools: [pw], n }); }
        return [];
      }
      default: return [];
    }
  };

  function vocabLesson(ids, pools, letterPool, lesson) {
    const seq = [];
    const practice = [];
    for (const id of ids) {
      seq.push(G.introWord(id));
      seq.push(G.wordMeaning(id, [ids, ...pools]));
    }
    for (const id of ids) {
      const w = W(id);
      const fns = [() => G.meaningWord(id, [ids, ...pools]), () => G.listenWord(id, [ids, ...pools])];
      if (w.phrase) fns.push(() => G.buildPhrase(id, pools[0]), () => G.fillBlank(id, pools[0]));
      else {
        fns.push(() => G.wordRead(id, [ids, ...pools]));
        if (AT.tokenize(w.arm).length <= 9) fns.push(() => G.buildWord(id, letterPool));
      }
      sample(fns, ids.length >= 5 ? 1 : 2).forEach((f) => practice.push(f()));
    }
    if (ids.length >= 3) practice.push(G.matchWords(ids));
    const older = AT.wordsUpTo(lesson.index - 1).filter((x) => partWords(lesson.part).includes(x) && !ids.includes(x));
    sample(older, 2).forEach((x) => practice.push(G.randomWordQ(x, [older, ...pools], letterPool)));
    return seq.concat(shuffle(practice));
  }

  /* ---------------- Letter-set practice: 4 letters inside real words ---------------- */
  // Positions (by character) where a letter appears in a word. Ո inside ու doesn't count as Ո.
  AT.letterPositions = (arm, id) => {
    const Lt = L(id);
    const chars = [...arm];
    const out = [];
    chars.forEach((c, i) => {
      if (c.toLowerCase() !== Lt.lo) return;
      if (id === 'vo' && chars[i + 1] && chars[i + 1].toLowerCase() === 'ւ') return;
      out.push(i);
    });
    return out;
  };
  // Single words (no phrases), one entry per spelling.
  const SINGLE_WORDS = (() => {
    const seen = new Set();
    return AT.WORDS.filter((w) => {
      if (w.phrase || /\s/.test(w.arm.trim())) return false;
      const k = w.arm.toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  })();
  AT.wordsWithLetters = (ids) => SINGLE_WORDS.filter((w) => ids.some((id) => AT.letterPositions(w.arm, id).length));

  G.introSet = (ids) => ({ type: 'introSet', ids });

  G.missingLetter = (wordId, id, setIds) => {
    const w = W(wordId);
    const Lt = L(id);
    const chars = [...w.arm];
    const pos = pick(AT.letterPositions(w.arm, id));
    const upper = chars[pos] !== chars[pos].toLowerCase();
    const display = chars.slice(0, pos).join('') + '____' + chars.slice(pos + 1).join('');
    return {
      type: 'mcq', key: 'L:' + id, prompt: 'Which letter is missing?',
      stim: { kind: 'arm', text: display, rom: w.rom, en: w.en, audio: w.arm, blankLetter: true },
      options: uniq([id, ...setIds]).slice(0, 4).map((x) => ({ value: x, glyph: upper ? L(x).up : L(x).lo, kind: 'glyph' })),
      answer: id, after: w.arm,
      reveal: `<span class="arm">${esc(w.arm)}</span> · ${AT.pairHTML(Lt)} says “${esc(Lt.snd)}”`, tip: Lt.tip
    };
  };

  // Vowel twins sound alike inside words, so ask for those by shape only.
  const SOUND_TWINS = new Set(['yech', 'e', 'vo', 'o']);
  G.pickLetter = (wordId, id) => {
    const w = W(wordId);
    const Lt = L(id);
    const bySound = canSound(id) && !SOUND_TWINS.has(id) && Math.random() < 0.5;
    return {
      type: 'pick', key: 'L:' + id,
      prompt: bySound ? `Tap the letter that sounds like “${Lt.snd}”` : `Tap the letter ${Lt.up} ${Lt.lo} in this word`,
      sub: bySound ? `as in <b>${hl(Lt.eng)}</b>` : '',
      word: w.arm, en: w.en, rom: w.rom, answers: AT.letterPositions(w.arm, id),
      after: AT.letterSoundText(Lt),
      reveal: `${AT.pairHTML(Lt)} in <span class="arm">${esc(w.arm)}</span>`, tip: Lt.tip
    };
  };

  AT.buildLetterSet = (ids) => {
    const known = new Set([...AT.learnedLetters(), ...ids]);
    const readable = (w) => AT.tokenize(w.arm).every((t) => known.has(t.id) || (t.id === 'u' && known.has('vyun')));
    // Words the learner can fully read come first.
    const ordered = (ws) => [...shuffle(ws.filter(readable)), ...shuffle(ws.filter((w) => !readable(w)))];
    const tasks = [];
    for (const id of ids) {
      const ws = ordered(AT.wordsWithLetters([id]));
      if (!ws.length) continue;
      tasks.push(G.missingLetter(ws[0].id, id, ids));
      tasks.push(G.pickLetter((ws[1] || ws[0]).id, id));
    }
    const all = AT.wordsWithLetters(ids);
    const pool = [all.map((w) => w.id)];
    ordered(all).slice(0, 4).forEach((w) => {
      const fns = [() => G.wordRead(w.id, pool), () => G.listenWord(w.id, pool), () => G.wordMeaning(w.id, pool)];
      if (AT.tokenize(w.arm).length <= 8) fns.push(() => G.buildWord(w.id, ids));
      tasks.push(pick(fns)());
    });
    tasks.push(ids.filter(canSound).length >= 3 && Math.random() < 0.5 ? G.matchSound(ids) : G.matchCase(ids));
    return [G.introSet(ids), ...shuffle(tasks)];
  };

  /* ---------------- Practice sessions (Practice tab) ---------------- */
  AT.PAIRS =[['tyun', 'to'], ['pe', 'pyur'], ['ken', 'ke'], ['tsa', 'tso'], ['che', 'cha'], ['re', 'ra'], ['yech', 'e'], ['vo', 'o'], ['khe', 'ghat']];

  AT.buildPractice = (type) => {
    const learned = [...AT.learnedLetters()].filter((x) => !L(x).special);
    const letterPool = learned.length >= 4 ? learned : ALL_LETTER_IDS;
    const words = [...AT.learnedWords()];
    const pools = [words];
    switch (type) {
      case 'letters':
        return reviewLesson({ letters: learned, letterPool, n: 12 });
      case 'case': {
        const c = learned.filter(canCase);
        const out = [G.matchCase(sample(c, 5)), ...sample(c, 5).map((id) => G.caseMatch(id, c)), G.matchCase(sample(c, 5))];
        if (c.length >= 8) out.push(G.matchCase(sample(c, 5)));
        return out;
      }
      case 'listen': {
        const s = learned.filter(canSound);
        const picks = [];
        while (picks.length < 10) picks.push(...shuffle(s));
        return picks.slice(0, 10).map((id) => G.listenLetter(id, s));
      }
      case 'words':
        return reviewLesson({ words, letterPool, wordPools: pools, n: 12 });
      case 'mistakes': {
        const out = [];
        for (const key of AT.weakItems().slice(0, 10)) {
          const [kind, id] = key.split(':');
          if (kind === 'L' && L(id)) out.push(G.randomLetterQ(id, letterPool));
          else if (kind === 'W' && W(id)) out.push(G.randomWordQ(id, [words, AT.WORDS.map((w) => w.id)], letterPool));
        }
        return out;
      }
      case 'pairs': {
        const ps = AT.PAIRS.filter(([a, b]) => learned.includes(a) && learned.includes(b));
        return ps.length ? pairsLesson(sample(ps, 3)) : [];
      }
      case 'prayer':
        return prayerLesson();
      default:
        return [];
    }
  };
})();
