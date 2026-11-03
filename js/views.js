/* Main screens: Learn path, Alphabet, Prayer, Practice, Profile. */
(function () {
  'use strict';
  const AT = window.AT;
  const { esc, hl } = AT;
  const $ = (sel, el = document) => el.querySelector(sel);
  const V = (AT.views = {});

  const ICONS = {
    star: '<path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.3 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>',
    lock: '<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" fill="none" stroke="currentColor" stroke-width="2.6"/>',
    book: '<path d="M2 5.2C5 4.2 8.8 4.5 11 6.4V20.5c-2.3-1.7-5.8-2-9-1.1zM22 5.2c-3-1-6.8-.7-9 1.2V20.5c2.3-1.7 5.8-2 9-1.1z"/>',
    cross: '<path d="M10 2h4v6h6v4h-6v10h-4V12H4V8h6z"/>',
    dumbbell: '<path d="M1.5 10h2V7.5h3v9h-3V14h-2zM22.5 10h-2V7.5h-3v9h3V14h2zM7.5 10.8h9v2.4h-9z"/>',
    trophy: '<path d="M7 3h10v2h3v3a4 4 0 0 1-4 4h-.4A5 5 0 0 1 13 14.9V18h3v3H8v-3h3v-3.1A5 5 0 0 1 8.4 12H8a4 4 0 0 1-4-4V5h3zM6 7v1a2 2 0 0 0 1.3 1.9C7.1 9.3 7 8.7 7 8V7zm12 0h-1v1c0 .7-.1 1.3-.3 1.9A2 2 0 0 0 18 8z"/>',
    pairs: '<circle cx="8.5" cy="12" r="6"/><circle cx="15.5" cy="12" r="6" fill-opacity=".55"/>'
  };
  const svg = (name, cls = '') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">${ICONS[name]}</svg>`;
  AT.svgIcon = svg;

  /* =====================================================================
     LEARN — the lesson path
     ===================================================================== */
  const OFFSETS = [0, 48, 76, 48, 0, -48, -76, -48];

  function nodeState(l, cur) {
    if (AT.isDone(l.id)) return 'done';
    if (l.index === cur) return 'current';
    return AT.isUnlocked(l) ? 'open' : 'locked';
  }

  function nodeInner(l, state) {
    if (state === 'locked') return svg('lock');
    if (l.kind === 'letters') return `<span class="node-glyph arm">${esc(AT.letter(l.letters[0]).up)}</span>`;
    const icon = AT.lessonIcon(l);
    return svg(icon === 'letter' ? 'star' : icon);
  }

  V.learn = (el) => {
    const cur = AT.currentIndex();
    const parts = AT.COURSE.map((part, pi) => {
      const units = part.units.map((unit) => {
        const c = (unit.number - 1) % 6;
        const letters = AT.unitLetters(unit).map((id) => AT.letter(id));
        const words = AT.unitWords(unit).slice(0, 4).map((id) => AT.word(id).arm);
        const doneCount = unit.lessons.filter((l) => AT.isDone(l.id)).length;
        const nodes = unit.lessons.map((l, li) => {
          const st = nodeState(l, cur);
          const flip = unit.number % 2 ? 1 : -1;
          return `<div class="node-wrap" style="--x:${OFFSETS[li % 8] * flip}px">
            ${st === 'current' ? '<div class="node-start">START</div>' : ''}
            <button class="node ${st}" data-lesson="${l.id}" aria-label="${esc(AT.lessonTitle(l))}, ${st === 'done' ? 'completed' : st}">
              ${nodeInner(l, st)}
            </button>
          </div>`;
        }).join('');
        return `<section class="unit c${c}" id="unit-${unit.id}">
          <div class="unit-head">
            <div class="uh-text">
              <div class="uh-label">Unit ${unit.number} · ${doneCount}/${unit.lessons.length}${doneCount === unit.lessons.length ? ' ✓' : ''}</div>
              <h2 class="uh-title"><span class="arm">${esc(unit.arm)}</span> <span class="uh-en">${esc(unit.en)}</span></h2>
              ${letters.length ? `<div class="uh-sub">Letters: <span class="arm">${letters.map((x) => esc(x.up)).join(' ')}</span></div>`
                : words.length ? `<div class="uh-sub arm">${words.map(esc).join(' · ')}</div>` : ''}
            </div>
            <button class="uh-guide" data-guide="${unit.id}" aria-label="Unit ${unit.number} guide">${svg('book')}<span>Guide</span></button>
          </div>
          <div class="path">${nodes}</div>
        </section>`;
      }).join('');
      return `<div class="part">
        <div class="part-banner p${pi}">
          <div class="pb-title">${esc(part.title)}</div>
          <div class="pb-desc">${esc(part.desc)}</div>
        </div>
        ${units}
      </div>`;
    }).join('');
    const banner = AT.cloud.enabled && !AT.cloud.signedIn() && AT.hasProgress()
      ? `<div class="save-banner">
          <span class="sb-ico" aria-hidden="true">☁️</span>
          <div class="sb-text"><b>Save your progress</b><span>Create a free account to continue on any device.</span></div>
          <button class="btn btn-green btn-sm" data-account="up">Sign up</button>
        </div>` : '';
    el.innerHTML = `<div class="learn">${banner}${parts}
      <div class="course-end">${AT.mascot('happy', 90)}<p>More units are on the way. Keep practicing!</p></div>
    </div>`;

    el.querySelectorAll('.node').forEach((b) => b.addEventListener('click', (e) => {
      e.stopPropagation();
      openPop(b, AT.lessonById(b.dataset.lesson));
    }));
    el.querySelectorAll('[data-guide]').forEach((b) => b.addEventListener('click', () => openGuide(b.dataset.guide)));
    AT.account.bind(el);
    requestAnimationFrame(() => {
      const target = el.querySelector('.node.current') || el.querySelector('.node.open');
      if (target && AT._scrollToCurrent !== false) target.scrollIntoView({ block: 'center', behavior: AT._smooth ? 'smooth' : 'auto' });
      AT._smooth = false;
    });
  };

  function closePop() {
    document.querySelectorAll('.pop').forEach((p) => p.remove());
    document.querySelectorAll('.has-pop').forEach((w) => w.classList.remove('has-pop'));
  }
  document.addEventListener('click', (e) => { if (!e.target.closest('.pop')) closePop(); });

  function openPop(btn, lesson) {
    const wrap = btn.parentElement;
    const had = wrap.querySelector('.pop');
    closePop();
    if (had) return;
    const st = nodeState(lesson, AT.currentIndex());
    const unit = lesson.unit;
    const total = unit.lessons.length;
    const pop = document.createElement('div');
    pop.className = `pop ${st}`;
    const xp = st === 'done' ? 5 : 10;
    pop.innerHTML = `<div class="pop-arrow"></div>
      <div class="pop-title">${esc(AT.lessonTitle(lesson))}</div>
      <div class="pop-desc">Lesson ${lesson.indexInUnit + 1} of ${total} · ${esc(AT.lessonDesc(lesson))}</div>
      ${st === 'locked'
        ? '<div class="pop-lock">Finish the lessons above to unlock this one.</div>'
        : `<button class="btn ${st === 'done' ? 'btn-gold' : 'btn-white'}" data-start>${st === 'done' ? 'Practice again' : 'Start'} +${xp} XP</button>`}`;
    wrap.appendChild(pop);
    wrap.classList.add('has-pop');
    pop.addEventListener('click', (e) => e.stopPropagation());
    $('[data-start]', pop)?.addEventListener('click', () => { closePop(); AT.startCourseLesson(lesson); });
    const r = pop.getBoundingClientRect();
    if (r.bottom > window.innerHeight - 90) pop.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }

  AT.startCourseLesson = (lesson) => {
    AT.runLesson({
      title: AT.lessonTitle(lesson),
      build: () => AT.buildLesson(lesson),
      lesson,
      onExit: ({ completed }) => {
        if (completed) { AT._smooth = true; AT._scrollToCurrent = true; }
        else AT._scrollToCurrent = false;
        AT.rerender();
        AT._scrollToCurrent = true;
      }
    });
  };

  function openGuide(unitId) {
    const unit = AT.COURSE.flatMap((p) => p.units).find((u) => u.id === unitId);
    const letters = AT.unitLetters(unit).map(AT.letter);
    const words = AT.uniq([...AT.unitWords(unit), ...unit.lessons.filter((l) => l.kind === 'phrase').flatMap((l) => l.words)]).map(AT.word);
    const html = `<div class="guide">
      <div class="guide-head unit c${(unit.number - 1) % 6}">
        <div class="uh-label">Unit ${unit.number} guide</div>
        <h2 class="uh-title"><span class="arm">${esc(unit.arm)}</span> <span class="uh-en">${esc(unit.en)}</span></h2>
      </div>
      ${letters.length ? `<h3>Letters</h3><div class="guide-letters">${letters.map((Lt) => `
        <div class="gl-row">
          <button class="gl-glyph arm" data-say="${esc(AT.letterSoundText(Lt))}">${esc(Lt.up)} ${esc(Lt.lo)}</button>
          <div class="gl-info">${AT.soundHTML(Lt)}<div class="gl-tip">${esc(Lt.tip)}</div></div>
          ${AT.speakBtn(AT.letterSoundText(Lt), 'Hear ' + Lt.up)}
        </div>`).join('')}</div>` : ''}
      ${unit.lessons.some((l) => l.kind === 'pairs') ? `<h3>Pairs</h3><div class="guide-letters">${unit.lessons.flatMap((l) => l.pairs || []).map(([a, b]) => {
          const A = AT.letter(a), B = AT.letter(b);
          return `<div class="gl-row pairs">
            <button class="gl-glyph arm" data-say="${esc(AT.letterSoundText(A))}">${esc(A.up)} ${esc(A.lo)}</button>
            <div class="gl-info small">${AT.soundHTML(A)}</div>
            <button class="gl-glyph arm" data-say="${esc(AT.letterSoundText(B))}">${esc(B.up)} ${esc(B.lo)}</button>
            <div class="gl-info small">${AT.soundHTML(B)}</div>
          </div>`;
        }).join('')}</div>` : ''}
      ${words.length ? `<h3>Words & phrases</h3><div class="guide-words">${words.map((w) => `
        <button class="gw-row" data-say="${esc(w.arm)}">
          <span class="arm gw-arm">${esc(w.arm)}</span>
          <span class="gw-rom">${esc(w.rom)}</span>
          <span class="gw-en">${esc(w.en)}</span>
          <span class="gw-play">${AT.SPEAKER}</span>
        </button>`).join('')}</div>` : ''}
    </div>`;
    AT.modal.open(html, { className: 'wide' });
  }

  /* =====================================================================
     ALPHABET
     ===================================================================== */
  let alphaOrder = 'abc';
  try { alphaOrder = localStorage.getItem('armenianTutor.alphaOrder') || 'abc'; } catch (e) { /* ignore */ }

  V.alphabet = (el) => {
    const learned = AT.learnedLetters();
    const order = alphaOrder === 'prayer'
      ? AT.lettersUpTo(AT.FLAT.length).map(AT.letter).filter((x) => !x.special)
      : AT.LETTERS;
    const tile = (Lt) => `<button class="atile ${learned.has(Lt.id) ? 'learned' : ''}" data-letter="${Lt.id}" aria-label="${esc(Lt.up)} ${esc(Lt.lo)}, sounds like ${esc(Lt.snd)}">
        <span class="arm at-g"><span>${esc(Lt.up)}</span><span>${esc(Lt.lo)}</span></span>
        <span class="at-snd">${esc(Lt.snd.replace(/ \(.*\)$/, ''))}</span>
      </button>`;
    el.innerHTML = `<div class="page">
      <div class="page-head">
        <h1>The Alphabet <span class="arm muted">Այբուբեն</span></h1>
        <p>38 letters, each with a capital and a lowercase form. Tap a letter to hear it, see how to say it with English words, and practice writing it.</p>
      </div>
      <div class="alpha-tools">
        <div class="seg" role="tablist" aria-label="Order">
          <button role="tab" data-order="abc" aria-selected="${alphaOrder === 'abc'}" class="${alphaOrder === 'abc' ? 'on' : ''}">Ա–Ֆ order</button>
          <button role="tab" data-order="prayer" aria-selected="${alphaOrder === 'prayer'}" class="${alphaOrder === 'prayer' ? 'on' : ''}">Course order</button>
        </div>
        <div class="legend"><span class="dot on"></span>Learned · ${AT.coreLetterCount()}/38</div>
      </div>
      <div class="alpha-grid">${order.map(tile).join('')}</div>
      <h2 class="section-title">Letter combinations</h2>
      <div class="alpha-grid combos">${AT.SPECIALS.map(tile).join('')}</div>
      <div class="card guide-card">
        <h2>How to sound Armenian (Yerevan style)</h2>
        <ul class="tips">
          <li><b>Puff or no puff.</b> Armenian has pairs that English mixes up. Say “top” and “stop” with your hand in front of your mouth: “top” has a puff of air (that’s <span class="arm">Թ</span>), “stop” doesn’t (that’s <span class="arm">Տ</span>). The same goes for <span class="arm">Փ/Պ</span>, <span class="arm">Ք/Կ</span>, <span class="arm">Չ/Ճ</span> and <span class="arm">Ց/Ծ</span>.</li>
          <li><b>Two kinds of r.</b> <span class="arm">Ր</span> is a light tap (American “butter”). <span class="arm">Ռ</span> is rolled (Spanish “perro”).</li>
          <li><b>Start-of-word changes.</b> <span class="arm">Ե</span> says “ye” and <span class="arm">Ո</span> says “vo” at the start of a word. Inside a word they say “e” and “o”.</li>
          <li><b>Stress the last syllable.</b> Hi-<b>SUS</b>, Kris-<b>TOS</b>, Ye-re-<b>VAN</b>.</li>
          <li><b>Hidden “uh”.</b> Between some consonants you’ll hear a quick “uh” (<span class="arm">ը</span>) that isn’t written, as in <span class="arm">Քրիստոս</span> “kuh-ris-tos”.</li>
        </ul>
      </div>
    </div>`;
    el.querySelectorAll('[data-order]').forEach((b) => b.addEventListener('click', () => {
      alphaOrder = b.dataset.order;
      try { localStorage.setItem('armenianTutor.alphaOrder', alphaOrder); } catch (e) { /* ignore */ }
      V.alphabet(el);
    }));
    const list = [...order, ...AT.SPECIALS].map((x) => x.id);
    el.querySelectorAll('[data-letter]').forEach((b) => b.addEventListener('click', () => AT.openLetter(b.dataset.letter, list)));
  };

  AT.openLetter = (id, list = AT.ALL_LETTERS.map((x) => x.id)) => {
    const Lt = AT.letter(id);
    const i = list.indexOf(id);
    const prev = list[(i - 1 + list.length) % list.length];
    const next = list[(i + 1) % list.length];
    const c = AT.modal.open(`
      <div class="letter-modal">
        <div class="lm-nav">
          <button class="icon-btn" data-go="${prev}" aria-label="Previous letter">‹</button>
          <div class="lm-count">${i + 1} / ${list.length}</div>
          <button class="icon-btn" data-go="${next}" aria-label="Next letter">›</button>
        </div>
        ${AT.letterCardHTML(Lt)}
        ${Lt.special ? '' : `<div class="trace">
          <div class="trace-head">
            <b>Practice writing</b>
            <div class="seg small">
              <button data-case="up" class="on" aria-label="Capital">${esc(Lt.up)}</button>
              <button data-case="lo" aria-label="Lowercase">${esc(Lt.lo)}</button>
            </div>
            <button class="btn-chip" data-clear>Clear</button>
          </div>
          <canvas class="trace-canvas" aria-label="Drawing area"></canvas>
          <p class="hint">Trace over the gray letter with your finger or mouse.</p>
        </div>`}
      </div>`, { className: 'letter' });
    c.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', () => AT.openLetter(b.dataset.go, list)));
    if (!Lt.special) setupTrace(c, Lt);
    AT.say(AT.letterSoundText(Lt));
  };

  function setupTrace(c, Lt) {
    const canvas = $('.trace-canvas', c);
    const ctx = canvas.getContext('2d');
    let which = 'up';
    let drawing = false;
    let strokes = [];
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const css = () => getComputedStyle(document.documentElement);
    function size() {
      const w = canvas.clientWidth || 320;
      const h = Math.round(w * 0.62);
      canvas.style.height = h + 'px';
      canvas.width = w * dpr;
      canvas.height = h * dpr;
    }
    function paint() {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      const line = css().getPropertyValue('--line').trim() || '#e5e5e5';
      const fs = H * 0.62;
      const base = H * 0.7;
      ctx.strokeStyle = line;
      ctx.lineWidth = 2 * dpr;
      ctx.setLineDash([8 * dpr, 8 * dpr]);
      [base, base - fs * 0.72, base - fs * 0.5].forEach((y, k) => {
        if (which === 'up' && k === 2) return;
        if (which === 'lo' && k === 1) return;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      });
      ctx.setLineDash([]);
      ctx.fillStyle = css().getPropertyValue('--trace-guide').trim() || 'rgba(0,0,0,.12)';
      ctx.font = `600 ${fs}px "Noto Sans Armenian", "Noto Serif Armenian", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(which === 'up' ? Lt.up : Lt.lo, W / 2, base);
      ctx.strokeStyle = css().getPropertyValue('--blue').trim() || '#1cb0f6';
      ctx.lineWidth = 12 * dpr;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      for (const s of strokes) {
        ctx.beginPath();
        s.forEach(([x, y], k) => (k ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
        if (s.length === 1) ctx.lineTo(s[0][0] + 0.1, s[0][1]);
        ctx.stroke();
      }
    }
    const pt = (e) => {
      const r = canvas.getBoundingClientRect();
      return [(e.clientX - r.left) * dpr, (e.clientY - r.top) * dpr];
    };
    canvas.addEventListener('pointerdown', (e) => { drawing = true; canvas.setPointerCapture(e.pointerId); strokes.push([pt(e)]); paint(); });
    canvas.addEventListener('pointermove', (e) => { if (!drawing) return; strokes[strokes.length - 1].push(pt(e)); paint(); });
    const end = () => { drawing = false; };
    canvas.addEventListener('pointerup', end);
    canvas.addEventListener('pointercancel', end);
    c.querySelectorAll('[data-case]').forEach((b) => b.addEventListener('click', () => {
      which = b.dataset.case;
      c.querySelectorAll('[data-case]').forEach((x) => x.classList.toggle('on', x === b));
      strokes = [];
      paint();
    }));
    $('[data-clear]', c).addEventListener('click', () => { strokes = []; paint(); });
    size();
    paint();
    if (document.fonts && document.fonts.load) document.fonts.load('600 100px "Noto Sans Armenian"').then(paint).catch(() => {});
  }

  /* =====================================================================
     PRAYER
     ===================================================================== */
  let prayerOpts = { rom: true, en: true };
  V.prayer = (el) => {
    const P = AT.PRAYER;
    const learned = AT.learnedLetters();
    const words = P.words.map(([id, punct]) => ({ w: AT.word(id), punct }));
    el.innerHTML = `<div class="page">
      <div class="page-head">
        <h1>The Jesus Prayer</h1>
        <p>Your map to the alphabet. Tap any word to hear it.</p>
      </div>
      <div class="prayer-card">
        <div class="prayer-cross" aria-hidden="true">${svg('cross')}</div>
        <div class="prayer-text arm">${words.map(({ w, punct }, i) => `<button class="pw" data-i="${i}" data-say="${esc(w.arm)}">${esc(w.arm)}</button>${esc(punct)}`).join(' ')}</div>
        <div class="prayer-rom" ${prayerOpts.rom ? '' : 'hidden'}>${esc(P.rom)}</div>
        <div class="prayer-en" ${prayerOpts.en ? '' : 'hidden'}>${esc(P.en)}</div>
        <div class="row-btns center">
          <button class="btn btn-blue" id="read-along">▶ Read along</button>
          <button class="btn-chip" data-say="${esc(P.arm)}">${AT.SPEAKER} Whole prayer</button>
          <button class="btn-chip" data-say="${esc(P.arm)}" data-slow>🐢 Slow</button>
        </div>
        <div class="toggles">
          <label class="toggle"><input type="checkbox" id="t-rom" ${prayerOpts.rom ? 'checked' : ''}><span></span>Pronunciation</label>
          <label class="toggle"><input type="checkbox" id="t-en" ${prayerOpts.en ? 'checked' : ''}><span></span>English</label>
        </div>
      </div>

      <h2 class="section-title">Word by word</h2>
      <div class="word-list">
        ${words.map(({ w }, i) => {
          const toks = AT.tokenize(w.arm);
          const known = toks.every((t) => learned.has(t.id) || (t.id === 'u' && learned.has('u')));
          return `<div class="wl-row">
            <div class="wl-num">${i + 1}</div>
            <div class="wl-main">
              <button class="wl-arm arm" data-say="${esc(w.arm)}">${esc(w.arm)} ${AT.SPEAKER}</button>
              <div class="wl-rom">${esc(w.rom)} <span class="say">“${esc(w.say)}”</span></div>
              <div class="wl-en">${esc(w.en)}</div>
              ${AT.chipsHTML(w.arm)}
              ${w.note ? `<p class="tip small">💡 ${esc(w.note)}</p>` : ''}
            </div>
            <div class="wl-badge ${known ? 'ok' : ''}" title="${known ? 'You know all these letters' : 'Some letters still to learn'}">${known ? '✓' : ''}</div>
          </div>`;
        }).join('')}
      </div>

      <div class="card">
        <h2>About this prayer</h2>
        ${P.about.map((p) => `<p>${esc(p)}</p>`).join('')}
        <p>In older church (classical) spelling you may also see it written like this. Notice <span class="arm">Է</span> and <span class="arm">Յ</span>:</p>
        <p class="classical arm">${esc(P.classical)}</p>
        <h3>Armenian punctuation</h3>
        <div class="punct">${P.punctuation.map(([m, name, d]) => `<div class="pu-row"><span class="pu-mark arm">${esc(m)}</span><div><b>${esc(name)}</b><div class="muted">${esc(d)}</div></div></div>`).join('')}</div>
      </div>
      <div class="center-btn"><button class="btn btn-green" id="prayer-practice">Practice the prayer</button></div>
    </div>`;

    $('#t-rom', el).addEventListener('change', (e) => { prayerOpts.rom = e.target.checked; $('.prayer-rom', el).hidden = !prayerOpts.rom; });
    $('#t-en', el).addEventListener('change', (e) => { prayerOpts.en = e.target.checked; $('.prayer-en', el).hidden = !prayerOpts.en; });
    $('#prayer-practice', el).addEventListener('click', () => AT.startPractice('prayer'));
    let reading = false;
    const btn = $('#read-along', el);
    btn.addEventListener('click', async () => {
      if (reading) { reading = false; AT.speech.stop(); return; }
      reading = true;
      btn.textContent = '■ Stop';
      const els = [...el.querySelectorAll('.pw')];
      for (let i = 0; i < els.length && reading; i++) {
        els.forEach((x) => x.classList.toggle('reading', x === els[i]));
        const ok = await AT.say(words[i].w.arm);
        if (!ok) break;
        await new Promise((r) => setTimeout(r, 180));
      }
      els.forEach((x) => x.classList.remove('reading'));
      reading = false;
      if (document.contains(btn)) btn.textContent = '▶ Read along';
    });
  };

  /* =====================================================================
     PRACTICE
     ===================================================================== */
  const PRACTICES = [
    { id: 'letters', icon: 'Աա', title: 'Letter review', desc: 'Sounds, capitals and lowercase of the letters you’ve learned.', need: () => AT.coreLetterCount() >= 3 },
    { id: 'case', icon: 'Բբ', title: 'Big & small', desc: 'Match capital letters with their lowercase partners.', need: () => AT.coreLetterCount() >= 4 },
    { id: 'listen', icon: '🎧', title: 'Listening', desc: 'Hear a sound, find the letter.', need: () => AT.coreLetterCount() >= 3 },
    { id: 'pairs', icon: 'Տթ', title: 'Tricky pairs', desc: 'Puff or no puff? Tap or roll? Train your ear.', need: () => AT.PAIRS.some(([a, b]) => AT.learnedLetters().has(a) && AT.learnedLetters().has(b)) },
    { id: 'words', icon: '📚', title: 'Word review', desc: 'Meanings, reading and spelling of your words.', need: () => AT.learnedWords().size >= 3 },
    { id: 'mistakes', icon: '🩹', title: 'Fix mistakes', desc: 'Practice the letters and words you’ve missed.', need: () => AT.weakItems().length > 0 },
    { id: 'prayer', icon: '✝', title: 'The prayer', desc: 'Build and read the whole Jesus Prayer.', need: () => true }
  ];

  AT.startPractice = (type) => {
    if (type === 'set') return AT.openLetterPicker();
    const p = PRACTICES.find((x) => x.id === type);
    AT.runLesson({ title: p.title, build: () => AT.buildPractice(type), practice: true, onExit: () => AT.rerender() });
  };

  V.practice = (el) => {
    el.innerHTML = `<div class="page">
      <div class="page-head"><h1>Practice</h1><p>Short sessions to keep what you’ve learned fresh. Each one earns XP.</p></div>
      ${setCardHTML()}
      <div class="practice-grid">
        ${PRACTICES.map((p) => {
          const ok = p.need();
          return `<div class="pcard ${ok ? '' : 'disabled'}">
            <div class="pc-icon arm">${p.icon}</div>
            <div class="pc-body"><h3>${esc(p.title)}</h3><p>${esc(p.desc)}</p></div>
            <button class="btn ${ok ? 'btn-blue' : 'btn-ghost'} btn-sm" data-practice="${p.id}" ${ok ? '' : 'disabled'}>${ok ? 'Start' : 'Locked'}</button>
          </div>`;
        }).join('')}
      </div>
      ${AT.coreLetterCount() < 3 ? `<div class="card empty">${AT.mascot('happy', 80)}<p>Finish your first lesson to unlock practice!</p><a class="btn btn-green" href="#/learn">Go to lessons</a></div>` : ''}
    </div>`;
    el.querySelectorAll('[data-practice]').forEach((b) => b.addEventListener('click', () => AT.startPractice(b.dataset.practice)));
    $('[data-set-pick]', el).addEventListener('click', () => AT.openLetterPicker());
    $('[data-set-go]', el)?.addEventListener('click', () => AT.startLetterSet(savedSet()));
  };

  /* ---------------- Pick 4 letters ---------------- */
  const savedSet = () => (AT.state.practiceLetters || []).filter((id) => AT.letter(id) && !AT.letter(id).special).slice(0, 4);

  function setCardHTML() {
    const ids = savedSet();
    const ready = ids.length === 4;
    return `<div class="pcard set-feature">
      <div class="pc-icon set-ico" aria-hidden="true">4</div>
      <div class="pc-body">
        <h3>Pick 4 letters</h3>
        <p>Choose any 4 letters and practice them inside real words: find them, fill them in, read and spell.</p>
        ${ready ? `<div class="set-preview arm" aria-label="Your letters">${ids.map((id) => `<span>${esc(AT.letter(id).up)}${esc(AT.letter(id).lo)}</span>`).join('')}</div>` : ''}
      </div>
      <div class="pc-btns">
        ${ready ? '<button class="btn btn-blue btn-sm" data-set-go>Practice these</button>' : ''}
        <button class="btn ${ready ? 'btn-ghost' : 'btn-blue'} btn-sm" data-set-pick>${ready ? 'Change letters' : 'Choose letters'}</button>
      </div>
    </div>`;
  }

  AT.openLetterPicker = () => {
    const learned = AT.learnedLetters();
    let chosen = savedSet();
    const c = AT.modal.open(`<div class="picker">
      <h2>Pick 4 letters</h2>
      <p class="muted">You’ll practice them inside real words. Green letters are ones you’ve learned.</p>
      <div class="pick-slots" aria-live="polite"></div>
      <div class="pick-grid">${AT.LETTERS.map((Lt) => `<button class="pk ${learned.has(Lt.id) ? 'learned' : ''}" data-id="${Lt.id}" aria-pressed="false" aria-label="${esc(Lt.up)} ${esc(Lt.lo)}, sounds like ${esc(Lt.snd)}">
          <span class="arm">${esc(Lt.up)}${esc(Lt.lo)}</span><small>${esc(Lt.snd.replace(/ \(.*\)$/, ''))}</small><b class="pk-n"></b>
        </button>`).join('')}</div>
      <p class="pick-info" aria-live="polite"></p>
      <div class="pick-actions">
        <button class="btn btn-ghost" data-random>🎲 Surprise me</button>
        <button class="btn btn-green" data-go disabled>Practice</button>
      </div>
    </div>`, { className: 'wide' });
    const btns = [...c.querySelectorAll('.pk')];
    const draw = () => {
      btns.forEach((b) => {
        const i = chosen.indexOf(b.dataset.id);
        b.classList.toggle('on', i >= 0);
        b.setAttribute('aria-pressed', String(i >= 0));
        $('.pk-n', b).textContent = i >= 0 ? i + 1 : '';
      });
      $('.pick-slots', c).innerHTML = [0, 1, 2, 3].map((i) => {
        const Lt = AT.letter(chosen[i]);
        return Lt ? `<button class="pslot on arm" data-remove="${Lt.id}" aria-label="Remove ${esc(Lt.up)}">${esc(Lt.up)}${esc(Lt.lo)}<span aria-hidden="true">×</span></button>`
          : `<span class="pslot">${i + 1}</span>`;
      }).join('');
      c.querySelectorAll('[data-remove]').forEach((b) => b.addEventListener('click', () => { chosen = chosen.filter((x) => x !== b.dataset.remove); draw(); }));
      const left = 4 - chosen.length;
      $('.pick-info', c).textContent = left ? `Choose ${left} more letter${left === 1 ? '' : 's'}.` : `${AT.wordsWithLetters(chosen).length} words use these letters. Ready!`;
      $('[data-go]', c).disabled = left !== 0;
    };
    btns.forEach((b) => b.addEventListener('click', () => {
      const id = b.dataset.id;
      if (chosen.includes(id)) chosen = chosen.filter((x) => x !== id);
      else if (chosen.length >= 4) {
        AT.toast('You can pick 4 letters. Tap a chosen one to remove it.');
        b.classList.remove('nope'); void b.offsetWidth; b.classList.add('nope');
        return;
      } else {
        chosen.push(id);
        AT.say(AT.letterSoundText(AT.letter(id)));
      }
      draw();
    }));
    $('[data-random]', c).addEventListener('click', () => {
      const pool = [...learned].filter((id) => !AT.letter(id).special);
      chosen = AT.sample(pool.length >= 4 ? pool : AT.LETTERS.map((x) => x.id), 4);
      draw();
    });
    $('[data-go]', c).addEventListener('click', () => { const ids = chosen.slice(); AT.modal.close(); AT.startLetterSet(ids); });
    draw();
  };

  AT.startLetterSet = (ids) => {
    AT.state.practiceLetters = ids.slice();
    AT.touchSettings();
    AT.save();
    AT.runLesson({
      title: 'Your letters: ' + ids.map((id) => AT.letter(id).up).join(' '),
      build: () => AT.buildLetterSet(ids), practice: true, onExit: () => AT.rerender()
    });
  };

  /* =====================================================================
     PROFILE & SETTINGS
     ===================================================================== */
  V.profile = (el) => {
    const s = AT.state;
    const set = s.settings;
    const days = [...Array(7).keys()].reverse().map((k) => { const d = new Date(); d.setDate(d.getDate() - k); return d; });
    const xps = days.map((d) => s.xpByDay[AT.dayKey(d)] || 0);
    const max = Math.max(set.goal, ...xps);
    const doneLessons = Object.keys(s.done).length;
    const device = AT.speech.hasDeviceVoice();
    el.innerHTML = `<div class="page">
      <div class="profile-head">
        ${AT.mascot('happy', 84)}
        <div><h1>Your progress</h1><p class="muted">Learning Eastern Armenian (Yerevan)</p></div>
      </div>
      ${AT.account.profileCard()}
      <div class="stat-grid">
        <div class="stat"><div class="st-ico">🔥</div><div><b>${AT.currentStreak()}</b><span>Day streak</span></div></div>
        <div class="stat"><div class="st-ico">⭐</div><div><b>${s.xp}</b><span>Total XP</span></div></div>
        <div class="stat"><div class="st-ico arm">Աա</div><div><b>${AT.coreLetterCount()}/38</b><span>Letters learned</span></div></div>
        <div class="stat"><div class="st-ico">📚</div><div><b>${AT.learnedWords().size}</b><span>Words learned</span></div></div>
        <div class="stat"><div class="st-ico">🏆</div><div><b>${doneLessons}/${AT.FLAT.length}</b><span>Lessons done</span></div></div>
        <div class="stat"><div class="st-ico">🎖️</div><div><b>${s.bestStreak}</b><span>Best streak</span></div></div>
      </div>

      <div class="card">
        <h2>This week</h2>
        <div class="week" role="img" aria-label="XP earned in the last 7 days: ${xps.join(', ')}">
          ${days.map((d, k) => `<div class="wk-col">
            <div class="wk-val">${xps[k] || ''}</div>
            <div class="wk-bar-wrap"><div class="wk-bar ${xps[k] >= set.goal ? 'met' : ''}" style="height:${Math.round((xps[k] / max) * 100)}%"></div>
            <div class="wk-goal" style="bottom:${Math.round((set.goal / max) * 100)}%"></div></div>
            <div class="wk-day">${d.toLocaleDateString(undefined, { weekday: 'short' })}</div>
          </div>`).join('')}
        </div>
        <p class="muted small">Dashed line: your daily goal (${set.goal} XP).</p>
      </div>

      <div class="card settings">
        <h2>Settings</h2>
        <div class="set-row">
          <div><b>Daily goal</b><span>How much XP to aim for each day</span></div>
          <div class="seg small" data-setting="goal">
            ${[[10, 'Casual'], [20, 'Regular'], [30, 'Serious'], [50, 'Intense']].map(([v, n]) => `<button data-v="${v}" class="${set.goal === v ? 'on' : ''}" title="${n}">${v}</button>`).join('')}
          </div>
        </div>
        <div class="set-row">
          <div><b>Voice</b><span>${device ? `Device voice found: ${esc(AT.speech.deviceVoiceName())}` : 'Using the built-in Eastern Armenian recordings'}</span></div>
          <div class="seg small" data-setting="voice">
            <button data-v="auto" class="${set.voice === 'auto' ? 'on' : ''}">Auto</button>
            <button data-v="recorded" class="${set.voice === 'recorded' ? 'on' : ''}">Built-in</button>
            <button data-v="device" class="${set.voice === 'device' ? 'on' : ''}" ${device ? '' : 'disabled title="No Armenian voice on this device"'}>Device</button>
          </div>
        </div>
        <div class="set-row"><div><b>Test the voice</b><span>Բարև (Barev) means “hello”</span></div><button class="btn-chip" data-say="Բարև">${AT.SPEAKER} Play</button></div>
        ${toggleRow('autoplay', 'Play audio automatically', 'Hear letters and words as they appear')}
        ${toggleRow('sfx', 'Sound effects', 'Dings for right and wrong answers')}
        ${toggleRow('rom', 'Show pronunciation hints', 'Latin-letter spelling under Armenian words')}
        ${toggleRow('hearts', 'Hearts', '5 hearts per lesson. Turn off to practice without limits')}
        ${toggleRow('unlockAll', 'Unlock all lessons', 'Jump to any lesson in the course')}
        <div class="set-row">
          <div><b>Theme</b><span>Light or dark colors</span></div>
          <div class="seg small" data-setting="theme">
            <button data-v="auto" class="${set.theme === 'auto' ? 'on' : ''}">Auto</button>
            <button data-v="light" class="${set.theme === 'light' ? 'on' : ''}">Light</button>
            <button data-v="dark" class="${set.theme === 'dark' ? 'on' : ''}">Dark</button>
          </div>
        </div>
        <div class="set-row"><div><b>Reset progress</b><span>Start the course from the beginning</span></div><button class="btn btn-ghost btn-sm danger" id="reset">Reset</button></div>
      </div>

      <div class="card about">
        <h2>About</h2>
        <p>Armenian Tutor teaches <b>Eastern Armenian</b>, the Armenian of Yerevan, in modern spelling. You learn every letter, capital and lowercase, through the words of the Jesus Prayer, then build everyday vocabulary.</p>
        <p class="muted small">Built-in audio is generated with the open-source eSpeak NG Eastern Armenian voice. If your device has a natural Armenian voice (for example in Microsoft Edge), “Auto” uses it instead. ${AT.cloud.signedIn() ? 'Your progress is saved to your account.' : 'Without an account, progress is saved in this browser only.'}</p>
      </div>
    </div>`;

    function toggleRow(key, title, sub) {
      return `<div class="set-row"><div><b>${esc(title)}</b><span>${esc(sub)}</span></div>
        <label class="switch"><input type="checkbox" data-toggle="${key}" ${set[key] ? 'checked' : ''} aria-label="${esc(title)}"><span></span></label></div>`;
    }
    el.querySelectorAll('[data-setting]').forEach((seg) => seg.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
      const k = seg.dataset.setting;
      set[k] = k === 'goal' ? Number(b.dataset.v) : b.dataset.v;
      AT.touchSettings();
      AT.save();
      if (k === 'theme') AT.applyTheme();
      V.profile(el);
    })));
    el.querySelectorAll('[data-toggle]').forEach((inp) => inp.addEventListener('change', () => {
      set[inp.dataset.toggle] = inp.checked;
      AT.touchSettings();
      AT.save();
    }));
    AT.account.bind(el);
    $('#reset', el).addEventListener('click', async () => {
      const where = AT.cloud.signedIn() ? 'in your account and on this device' : 'on this device';
      if (await AT.confirm('Reset all progress?', `This erases your XP, streak and completed lessons ${where}.`, 'Reset', 'Cancel', true)) {
        try { await AT.cloud.resetProgress(); } catch (e) { AT.toast('Reset here, but your account couldn’t be updated: ' + e.message, 5000); }
        AT.toast('Progress reset. Let’s begin again!');
        location.hash = '#/learn';
      }
    });
  };

  /* =====================================================================
     SIDE PANEL (wide screens)
     ===================================================================== */
  V.side = (el) => {
    const goal = AT.state.settings.goal;
    const today = AT.todayXP();
    const pct = Math.min(100, Math.round((today / goal) * 100));
    const n = AT.coreLetterCount();
    const learned = AT.learnedLetters();
    const pool = AT.WORDS.filter((w) => !w.phrase);
    const seed = AT.dayKey().split('-').reduce((a, b) => a * 31 + Number(b), 7);
    const wod = pool[seed % pool.length];
    const acct = !AT.cloud.enabled ? ''
      : AT.cloud.signedIn()
        ? `<div class="side-card acct-mini"><span class="avatar" aria-hidden="true">${esc(AT.account.initial())}</span>
            <div><b class="acct-email">${esc(AT.cloud.user().email)}</b><span class="small sync-line ${esc(AT.cloud.status)}" data-sync-line>${esc(AT.account.statusLine())}</span></div></div>`
        : `<div class="side-card cta"><h3>Save your progress</h3><p class="small">Create a free account to keep learning on any device.</p>
            <div class="acct-btns"><button class="btn btn-green btn-sm" data-account="up">Create account</button><button class="btn btn-ghost btn-sm" data-account="in">Sign in</button></div></div>`;
    el.innerHTML = `${acct}
      <div class="side-card">
        <div class="sc-row"><span class="sc-big">🔥 ${AT.currentStreak()}</span><span class="muted">day streak</span></div>
      </div>
      <div class="side-card">
        <h3>Daily goal</h3>
        <div class="bar"><div class="bar-fill gold" style="width:${pct}%"></div></div>
        <div class="muted small">${today} / ${goal} XP today${today >= goal ? ' · Done! 🎉' : ''}</div>
      </div>
      <div class="side-card">
        <h3>Letters learned</h3>
        <div class="bar"><div class="bar-fill green" style="width:${Math.round((n / 38) * 100)}%"></div></div>
        <div class="mini-alpha arm">${AT.LETTERS.map((L) => `<span class="${learned.has(L.id) ? 'on' : ''}">${esc(L.up)}</span>`).join('')}</div>
        <a class="link" href="#/alphabet">See the alphabet →</a>
      </div>
      <div class="side-card wod">
        <h3>Word of the day</h3>
        <button class="wod-word arm" data-say="${esc(wod.arm)}">${esc(wod.arm)} ${AT.SPEAKER}</button>
        <div class="wod-rom">${esc(wod.rom)}</div>
        <div class="wod-en">${esc(wod.en)}</div>
      </div>`;
    AT.account.bind(el);
  };

  /* =====================================================================
     ONBOARDING
     ===================================================================== */
  AT.onboard = () => {
    let goal = AT.state.settings.goal;
    const c = AT.modal.open(`
      <div class="onboard">
        <div class="ob-step" data-step="1">
          ${AT.mascot('happy', 140)}
          <h1><span class="arm">Բարև</span>! <small>(Barev = Hello!)</small></h1>
          <p>Let’s learn to read and speak <b>Eastern Armenian</b>, the Armenian of Yerevan, one letter at a time.</p>
          <button class="btn btn-green btn-wide" data-next>Get started</button>
          ${AT.cloud.enabled ? '<button class="btn btn-ghost btn-wide" data-have-account>I already have an account</button>' : ''}
        </div>
        <div class="ob-step" data-step="2" hidden>
          <h2>Here’s how it works</h2>
          <ul class="ob-list">
            <li><span class="ob-ico">✝</span><div><b>Learn the alphabet through the Jesus Prayer</b><span>Each word of the prayer teaches you a few new letters, capital and lowercase.</span></div></li>
            <li><span class="ob-ico">🔊</span><div><b>Hear every letter and word</b><span>English sound-alike words show you exactly how to say each letter.</span></div></li>
            <li><span class="ob-ico">📚</span><div><b>Then build your vocabulary</b><span>Greetings, family, food, faith and everyday phrases.</span></div></li>
          </ul>
          <h3>Pick a daily goal</h3>
          <div class="ob-goals">
            ${[[10, 'Casual', '5 min'], [20, 'Regular', '10 min'], [30, 'Serious', '15 min'], [50, 'Intense', '20 min']].map(([v, n, t]) => `<button class="ob-goal ${v === goal ? 'on' : ''}" data-goal="${v}"><b>${n}</b><span>${t} / day</span></button>`).join('')}
          </div>
          <button class="btn btn-green btn-wide" data-begin>Start my first lesson</button>
          <button class="btn btn-ghost btn-wide" data-look>Just look around</button>
        </div>
      </div>`, { className: 'onboard-card', onClose: () => finish() });
    let finished = false;
    function finish() {
      if (finished) return;
      finished = true;
      if (AT.state.settings.goal !== goal) AT.touchSettings();
      AT.state.settings.goal = goal;
      AT.state.onboarded = true;
      AT.save();
    }
    $('[data-have-account]', c)?.addEventListener('click', () => { finish(); AT.account.openAuth('in'); });
    $('[data-next]', c).addEventListener('click', () => { $('[data-step="1"]', c).hidden = true; $('[data-step="2"]', c).hidden = false; });
    c.querySelectorAll('[data-goal]').forEach((b) => b.addEventListener('click', () => {
      goal = Number(b.dataset.goal);
      c.querySelectorAll('[data-goal]').forEach((x) => x.classList.toggle('on', x === b));
    }));
    $('[data-begin]', c).addEventListener('click', () => { finish(); AT.modal.close(); AT.startCourseLesson(AT.FLAT[0]); });
    $('[data-look]', c).addEventListener('click', () => { finish(); AT.modal.close(); });
  };
})();
