/* Shared UI helpers + the lesson player. */
(function () {
  'use strict';
  const AT = window.AT;
  const { esc } = AT;
  const $ = (sel, el = document) => el.querySelector(sel);

  /* =====================================================================
     Shared UI helpers
     ===================================================================== */
  const SPEAKER = '<svg class="ico-speaker" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9v6h4l5 4V5L7 9H3z" fill="currentColor"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>';
  AT.SPEAKER = SPEAKER;
  AT.speakBtn = (text, label = 'Listen', cls = '') =>
    `<button class="speak ${cls}" data-say="${esc(text)}" aria-label="${esc(label)}" title="${esc(label)}">${SPEAKER}</button>`;

  // Any element with data-say="…" speaks when tapped.
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-say]');
    if (!el || el.disabled) return;
    document.querySelectorAll('.playing').forEach((x) => x.classList.remove('playing'));
    const text = el.dataset.say;
    el.classList.add('playing');
    AT.say(text, { slow: el.hasAttribute('data-slow') }).then((ok) => {
      el.classList.remove('playing');
      if (ok === false && !AT.speech.hasClip(text) && !AT.speech.hasDeviceVoice()) AT.toast('No audio for this one yet');
    });
  });

  AT.autoplay = (text) => {
    if (!text) return;
    AT.say(text);
  };

  let mascotN = 0;
  AT.mascot = (mood = 'happy', size = 120) => {
    const id = 'mg' + ++mascotN;
    const mouth = mood === 'sad'
      ? '<path d="M49 92 q11 -9 22 0" stroke="#4b2e16" stroke-width="3.5" fill="none" stroke-linecap="round"/>'
      : '<path d="M47 83 q13 13 26 0" stroke="#4b2e16" stroke-width="3.5" fill="#c4451c" stroke-linecap="round"/>';
    const brows = mood === 'sad'
      ? '<path d="M38 56 l10 -3M82 56 l-10 -3" stroke="#4b2e16" stroke-width="3" stroke-linecap="round"/>' : '';
    return `<svg class="mascot ${mood}" width="${size}" height="${size}" viewBox="0 0 120 120" aria-hidden="true">
      <defs><radialGradient id="${id}" cx="38%" cy="34%" r="72%"><stop offset="0" stop-color="#ffd890"/><stop offset=".55" stop-color="#ffa63c"/><stop offset="1" stop-color="#ee7a18"/></radialGradient></defs>
      <ellipse cx="60" cy="112" rx="30" ry="5" fill="#000" opacity=".08"/>
      <path d="M60 31 q-3 -9 3 -17" stroke="#7a4a1a" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <path d="M63 22 C68 10 80 6 92 8 C88 20 76 26 63 22Z" fill="#58cc02"/>
      <path d="M66 20 C74 15 82 12 89 11" stroke="#3f9a00" stroke-width="1.5" fill="none"/>
      <ellipse cx="60" cy="70" rx="42" ry="40" fill="url(#${id})"/>
      <path d="M62 31 C86 40 96 76 80 106" stroke="#e46e12" stroke-width="2.5" fill="none" opacity=".35"/>
      <ellipse cx="46" cy="66" rx="7.5" ry="9.5" fill="#fff"/><ellipse cx="74" cy="66" rx="7.5" ry="9.5" fill="#fff"/>
      <circle cx="47.5" cy="68" r="4.6" fill="#3c2a1a"/><circle cx="75.5" cy="68" r="4.6" fill="#3c2a1a"/>
      <circle cx="49" cy="66" r="1.6" fill="#fff"/><circle cx="77" cy="66" r="1.6" fill="#fff"/>
      ${brows}
      <ellipse cx="34" cy="80" rx="6" ry="4" fill="#ff6b6b" opacity=".45"/><ellipse cx="86" cy="80" rx="6" ry="4" fill="#ff6b6b" opacity=".45"/>
      ${mouth}
    </svg>`;
  };

  AT.confetti = () => {
    const wrap = document.createElement('div');
    wrap.className = 'confetti';
    const colors = ['#58cc02', '#1cb0f6', '#ffc800', '#ff4b4b', '#ce82ff', '#ff9600', '#D90012', '#0033A0', '#F2A800'];
    for (let i = 0; i < 70; i++) {
      const s = document.createElement('span');
      s.style.left = Math.random() * 100 + '%';
      s.style.background = colors[i % colors.length];
      s.style.animationDelay = Math.random() * 0.6 + 's';
      s.style.animationDuration = 2 + Math.random() * 1.6 + 's';
      s.style.setProperty('--x', (Math.random() * 160 - 80).toFixed(0) + 'px');
      s.style.setProperty('--r', (Math.random() * 720 - 360).toFixed(0) + 'deg');
      wrap.appendChild(s);
    }
    document.body.appendChild(wrap);
    setTimeout(() => wrap.remove(), 4200);
  };

  let toastTimer = null;
  AT.toast = (msg, ms = 2400) => {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), ms);
  };

  /* ---------------- Modal ---------------- */
  let modalClose = null;
  let modalReturnFocus = null;
  AT.modal = {
    open(html, { className = '', onClose } = {}) {
      const m = $('#modal');
      modalReturnFocus = document.activeElement;
      m.innerHTML = `<div class="modal-backdrop" data-close></div>
        <div class="modal-card ${className}" role="dialog" aria-modal="true">
          <button class="modal-x" data-close aria-label="Close">${AT.ICON_X}</button>
          <div class="modal-content">${html}</div>
        </div>`;
      m.hidden = false;
      requestAnimationFrame(() => m.classList.add('open'));
      modalClose = onClose || null;
      m.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', () => AT.modal.close()));
      setTimeout(() => $('.modal-x', m)?.focus({ preventScroll: true }), 30);
      return $('.modal-content', m);
    },
    close() {
      const m = $('#modal');
      if (m.hidden) return;
      m.classList.remove('open');
      m.hidden = true;
      m.innerHTML = '';
      AT.speech.stop();
      const fn = modalClose;
      modalClose = null;
      if (fn) fn();
      if (modalReturnFocus && document.contains(modalReturnFocus)) modalReturnFocus.focus({ preventScroll: true });
    },
    isOpen: () => !$('#modal').hidden
  };
  AT.ICON_X = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>';

  AT.confirm = (title, text, ok = 'OK', cancel = 'Cancel', danger = false) => new Promise((resolve) => {
    let answered = false;
    const c = AT.modal.open(`
      <div class="confirm">
        <h2>${esc(title)}</h2>
        <p>${esc(text)}</p>
        <div class="confirm-btns">
          <button class="btn ${danger ? 'btn-red' : 'btn-blue'}" data-ok>${esc(ok)}</button>
          <button class="btn btn-ghost" data-cancel>${esc(cancel)}</button>
        </div>
      </div>`, { className: 'small', onClose: () => { if (!answered) resolve(false); } });
    $('[data-ok]', c).addEventListener('click', () => { answered = true; AT.modal.close(); resolve(true); });
    $('[data-cancel]', c).addEventListener('click', () => { answered = true; AT.modal.close(); resolve(false); });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && AT.modal.isOpen()) { e.stopPropagation(); AT.modal.close(); }
  }, true);

  /* ---------------- Reusable snippets ---------------- */
  AT.exampleHTML = (w, letterId) => {
    if (!w) return '';
    const parts = w.arm.split(/(\s+)/).map((chunk) => {
      if (/^\s+$/.test(chunk)) return chunk;
      return AT.tokenize(chunk).map((t) => {
        const hit = t.id === letterId || (letterId === 'vyun' && t.id === 'u');
        return hit ? `<mark>${esc(t.ch)}</mark>` : esc(t.ch);
      }).join('');
    }).join('');
    return `<button class="example" data-say="${esc(w.arm)}">
      <span class="ex-label">Example</span>
      <span class="arm ex-arm">${parts}</span>
      <span class="ex-meta">${esc(w.rom)} · ${esc(w.en)}</span>
      <span class="ex-play">${SPEAKER}</span>
    </button>`;
  };

  AT.letterCardHTML = (Lt) => {
    const st = AT.letterSoundText(Lt);
    const w = AT.word(Lt.ex);
    return `
      <div class="glyph-pair">
        <button class="glyph-card" data-say="${esc(st)}" aria-label="Capital ${esc(Lt.up)}"><span class="g arm">${esc(Lt.up)}</span><span class="cap">Capital</span></button>
        <button class="glyph-card" data-say="${esc(st)}" aria-label="Lowercase ${esc(Lt.lo)}"><span class="g arm">${esc(Lt.lo)}</span><span class="cap">Lowercase</span></button>
      </div>
      <div class="info-rows">
        <div class="info-row">
          <span class="info-label">Sound</span>
          <span class="info-val">${AT.soundHTML(Lt)}${!Lt.vowel ? `<small class="muted played">Played with “a” so you can hear it: <span class="arm">${esc(st)}</span></small>` : ''}</span>
          ${AT.speakBtn(st, 'Hear the sound')}
        </div>
        <div class="info-row">
          <span class="info-label">Name</span>
          <span class="info-val"><span class="arm">${esc(Lt.name)}</span> <i>(${esc(Lt.nameRom)})</i></span>
          ${AT.speakBtn(Lt.name, 'Hear the letter name')}
        </div>
      </div>
      <p class="tip">💡 ${esc(Lt.tip)}</p>
      ${AT.exampleHTML(w, Lt.id)}`;
  };

  AT.chipsHTML = (arm) => {
    const toks = AT.tokenize(arm);
    return `<div class="letter-chips">${toks.map((t, i) => `<button class="lchip" data-say="${esc(AT.tokenAudio(t, i))}" aria-label="${esc(t.ch)}: ${esc(AT.tokenSound(t, i))}"><span class="arm">${esc(t.ch)}</span><small>${esc(AT.tokenSound(t, i))}</small></button>`).join('')}</div>`;
  };

  /* =====================================================================
     Exercise renderers
     ===================================================================== */
  const R = {};
  const rom = () => AT.state.settings.rom;

  function stimHTML(stim) {
    if (!stim) return '';
    switch (stim.kind) {
      case 'glyph':
        return `<div class="stim-glyph arm">${esc(stim.text)}</div>`;
      case 'arm': {
        const text = esc(stim.text).replace('____', '<span class="blank-slot">?</span>');
        return `<div class="stim-arm">${stim.audio ? AT.speakBtn(stim.audio, 'Listen', 'speak-lg') : ''}
          <div class="stim-arm-body"><div class="arm stim-arm-text">${text}</div>
          ${stim.rom && rom() ? `<div class="stim-rom">${esc(stim.rom)}</div>` : ''}
          ${stim.en ? `<div class="stim-en">${esc(stim.en)}</div>` : ''}</div></div>`;
      }
      case 'text':
        return `<div class="stim-arm">${stim.audio ? AT.speakBtn(stim.audio, 'Listen', 'speak-lg') : ''}
          <div class="stim-arm-body"><div class="stim-en-big">“${esc(stim.text)}”</div>
          ${stim.rom && rom() ? `<div class="stim-rom">${esc(stim.rom)}</div>` : ''}</div></div>`;
      case 'listen':
        return `<div class="stim-listen">
          <button class="listen-btn" data-say="${esc(stim.audio)}" aria-label="Play again">${SPEAKER}</button>
          <button class="listen-slow" data-say="${esc(stim.audio)}" data-slow aria-label="Play slowly" title="Play slowly">🐢</button>
        </div>`;
      default: return '';
    }
  }

  function optInner(o) {
    switch (o.kind) {
      case 'glyph': return `<span class="arm og">${esc(o.glyph)}</span>`;
      case 'sound': return `<span class="osound">${o.html}</span>`;
      case 'arm': return `<span class="arm oarm">${esc(o.arm)}</span>`;
      default: return `<span class="otext">${esc(o.text)}</span>`;
    }
  }

  R.introLetter = (ex, el) => {
    const Lt = AT.letter(ex.id);
    el.innerHTML = `<div class="ex ex-intro">
      <div class="ex-badge">${Lt.special ? 'Letter combination' : 'New letter'}</div>
      ${AT.letterCardHTML(Lt)}
    </div>`;
    if (AT.state.settings.autoplay) AT.autoplay(AT.letterSoundText(Lt));
    return { needsCheck: false };
  };

  R.introWord = (ex, el) => {
    const w = AT.word(ex.id);
    const single = !w.arm.trim().includes(' ');
    el.innerHTML = `<div class="ex ex-intro">
      <div class="ex-badge">${w.phrase || !single ? 'New phrase' : 'New word'}</div>
      <button class="big-word" data-say="${esc(w.arm)}"><span class="arm">${esc(w.arm)}</span>${SPEAKER}</button>
      <div class="word-rom">${esc(w.rom)}${w.say ? ` <span class="say">sounds like “${esc(w.say)}”</span>` : ''}</div>
      <div class="word-en">${esc(w.en)}</div>
      ${single ? AT.chipsHTML(w.arm) + '<p class="hint">Tap a letter to hear it</p>' : ''}
      <div class="row-btns"><button class="btn-chip" data-say="${esc(w.arm)}" data-slow>🐢 Slow</button></div>
      ${w.note ? `<p class="tip">💡 ${esc(w.note)}</p>` : ''}
    </div>`;
    if (AT.state.settings.autoplay) AT.autoplay(w.arm);
    return { needsCheck: false };
  };

  function pairTip(a, b) {
    const A = AT.letter(a), B = AT.letter(b);
    const puff = [A, B].find((x) => /with a puff/.test(x.note || ''));
    const noPuff = [A, B].find((x) => x !== puff);
    if (puff && noPuff) return `Hold your hand in front of your mouth. You should feel a puff of air for ${puff.up}, but almost none for ${noPuff.up}.`;
    const ids = [a, b].sort().join('-');
    if (ids === 'ra-re') return 'Ր is one light tap of the tongue. Ռ is a strong roll: let your tongue flutter.';
    if (ids === 'e-yech') return 'Ե says “ye” at the start of a word and “e” inside it. Է always says “e”.';
    if (ids === 'o-vo') return 'Ո says “vo” at the start of a word and “o” inside it. Օ always says “o”.';
    if (ids === 'ghat-khe') return 'Both come from the back of the throat. Խ is a raspy whisper (like German “Bach”). Ղ is softer and voiced, like a gargle or a French r.';
    return 'Listen closely and compare the two sounds.';
  }

  R.introPair = (ex, el) => {
    const cards = [ex.a, ex.b].map((id) => {
      const Lt = AT.letter(id);
      const st = AT.letterSoundText(Lt);
      return `<div class="pair-card">
        <button class="pair-glyph arm" data-say="${esc(st)}">${esc(Lt.up)} ${esc(Lt.lo)}</button>
        <div class="pair-snd">${AT.soundHTML(Lt)}</div>
        <button class="btn-chip" data-say="${esc(st)}">${SPEAKER} Listen</button>
      </div>`;
    }).join('');
    el.innerHTML = `<div class="ex ex-intro">
      <div class="ex-badge">Tricky pair</div>
      <h2 class="prompt">Hear the difference</h2>
      <div class="pair-cards">${cards}</div>
      <p class="tip">💡 ${esc(pairTip(ex.a, ex.b))}</p>
    </div>`;
    return { needsCheck: false };
  };

  AT.interlinearHTML = (w) => {
    const raw = w.arm.split(/\s+/);
    const roms = w.rom.split(/\s+/);
    return `<div class="interlinear">${raw.map((r, i) => {
      const bare = AT.stripPunct(r);
      const entry = AT.lookupWord(bare);
      const canSay = AT.speech.hasClip(bare) || AT.speech.hasDeviceVoice();
      const en = entry ? entry.en : (w.gloss ? w.gloss[i] : '');
      return `<button class="il-word" ${canSay ? `data-say="${esc(bare)}"` : ''}>
        <span class="arm">${esc(r)}</span>
        <span class="il-rom">${esc(entry ? entry.rom : AT.stripPunct(roms[i] || ''))}</span>
        <span class="il-en">${esc(en || '')}</span>
      </button>`;
    }).join('')}</div>`;
  };

  R.introPhrase = (ex, el) => {
    const w = AT.word(ex.id);
    el.innerHTML = `<div class="ex ex-intro">
      <div class="ex-badge">${ex.id === 'ph_prayer' ? 'The Jesus Prayer' : 'New phrase'}</div>
      <h2 class="prompt">${esc(w.en)}</h2>
      ${AT.interlinearHTML(w)}
      <p class="hint">Tap a word to hear it</p>
      <div class="row-btns">
        <button class="btn-chip" data-say="${esc(w.arm)}">${SPEAKER} Listen</button>
        <button class="btn-chip" data-say="${esc(w.arm)}" data-slow>🐢 Slow</button>
      </div>
      ${w.note ? `<p class="tip">💡 ${esc(w.note)}</p>` : ''}
    </div>`;
    if (AT.state.settings.autoplay) AT.autoplay(w.arm);
    return { needsCheck: false };
  };

  R.mcq = (ex, el, api) => {
    const opts = AT.shuffle(ex.options);
    const glyphs = opts[0].kind === 'glyph';
    el.innerHTML = `<div class="ex ex-mcq">
      <h2 class="prompt">${esc(ex.prompt)}</h2>
      ${ex.sub ? `<p class="prompt-sub">${ex.sub}</p>` : ''}
      ${stimHTML(ex.stim)}
      <div class="options ${glyphs ? 'grid' : 'list'} n${opts.length}" role="radiogroup" aria-label="Answers">
        ${opts.map((o, i) => `<button class="option ${o.kind}" role="radio" aria-checked="false" data-i="${i}" data-value="${esc(o.value)}"
          ${o.audio && !ex.listen ? `data-say="${esc(o.audio)}"` : ''}><span class="okey" aria-hidden="true">${i + 1}</span>${optInner(o)}</button>`).join('')}
      </div>
    </div>`;
    let sel = -1;
    const buttons = [...el.querySelectorAll('.option')];
    const choose = (i) => {
      sel = i;
      buttons.forEach((b, k) => { b.classList.toggle('selected', k === i); b.setAttribute('aria-checked', String(k === i)); });
      api.ready(true);
    };
    buttons.forEach((b, i) => b.addEventListener('click', () => choose(i)));
    if (ex.stim && ex.stim.audio && (ex.listen || AT.state.settings.autoplay)) AT.autoplay(ex.stim.audio);
    return {
      check() {
        const ok = opts[sel].value === ex.answer;
        buttons[sel].classList.add(ok ? 'right' : 'wrong');
        if (!ok) buttons[opts.findIndex((o) => o.value === ex.answer)]?.classList.add('right');
        return { ok };
      },
      key(n) { if (n >= 1 && n <= opts.length) choose(n - 1); }
    };
  };

  R.build = (ex, el, api) => {
    const order = AT.shuffle(ex.tiles.map((t, i) => i));
    el.innerHTML = `<div class="ex ex-build">
      <h2 class="prompt">${esc(ex.prompt)}</h2>
      ${stimHTML(ex.stim)}
      <div class="answer-line ${ex.mode}" aria-label="Your answer" aria-live="polite"></div>
      <div class="bank ${ex.mode}">${order.map((i) => `<span class="slot"><button class="tile arm" data-i="${i}">${esc(ex.tiles[i])}</button></span>`).join('')}</div>
      <p class="hint">${ex.mode === 'letters' ? 'Tap the letters in order. Tap a placed letter to remove it.' : 'Tap the words in order. Tap a placed word to remove it.'}</p>
    </div>`;
    const line = $('.answer-line', el);
    const bankBtns = [...el.querySelectorAll('.bank .tile')];
    const placed = [];
    const tileAudio = (i) => {
      const t = ex.tiles[i];
      if (ex.mode === 'letters') {
        const tok = AT.tokenize(t)[0];
        return tok ? AT.letterSoundText(AT.letter(tok.id)) : null;
      }
      return AT.speech.hasClip(t) ? t : null;
    };
    const redraw = () => {
      line.innerHTML = placed.map((i) => `<button class="tile arm placed" data-i="${i}">${esc(ex.tiles[i])}</button>`).join('');
      line.querySelectorAll('.tile').forEach((b) => b.addEventListener('click', () => {
        const i = Number(b.dataset.i);
        placed.splice(placed.indexOf(i), 1);
        bankBtns.find((x) => Number(x.dataset.i) === i).classList.remove('used');
        redraw();
      }));
      api.ready(placed.length > 0);
    };
    bankBtns.forEach((b) => b.addEventListener('click', () => {
      if (b.classList.contains('used')) return;
      const i = Number(b.dataset.i);
      placed.push(i);
      b.classList.add('used');
      const a = tileAudio(i);
      if (a) AT.say(a);
      redraw();
    }));
    if (ex.stim && ex.stim.audio && AT.state.settings.autoplay) AT.autoplay(ex.stim.audio);
    return {
      check() {
        const got = placed.map((i) => ex.tiles[i]);
        const ok = got.join('\u0001') === ex.answer.join('\u0001');
        line.classList.add(ok ? 'right' : 'wrong');
        return { ok };
      },
      key(n) { const free = order.map((i) => bankBtns.find((x) => Number(x.dataset.i) === i)).filter((b) => !b.classList.contains('used')); free[n - 1]?.click(); },
      backspace() { const last = line.querySelector('.tile:last-child'); last?.click(); }
    };
  };

  function matchSide(item) {
    if (item.glyph) return `<span class="arm mg">${esc(item.glyph)}</span>`;
    if (item.arm) return `<span class="arm ma">${esc(item.arm)}</span>`;
    if (item.html) return `<span class="osound">${item.html}</span>`;
    return `<span class="mt">${esc(item.text)}</span>`;
  }

  R.match = (ex, el, api) => {
    const left = AT.shuffle(ex.pairs);
    const right = AT.shuffle(ex.pairs);
    el.innerHTML = `<div class="ex ex-match">
      <h2 class="prompt">${esc(ex.prompt)}</h2>
      <div class="match-grid">
        <div class="match-col">${left.map((p, i) => `<button class="mitem" data-side="L" data-key="${esc(p.key)}" ${p.left.audio ? `data-say="${esc(p.left.audio)}"` : ''}><span class="okey">${i + 1}</span>${matchSide(p.left)}</button>`).join('')}</div>
        <div class="match-col">${right.map((p, i) => `<button class="mitem" data-side="R" data-key="${esc(p.key)}" ${p.right.audio ? `data-say="${esc(p.right.audio)}"` : ''}><span class="okey">${left.length + i + 1}</span>${matchSide(p.right)}</button>`).join('')}</div>
      </div>
    </div>`;
    const items = [...el.querySelectorAll('.mitem')];
    let selL = null, selR = null, matched = 0, busy = false;
    const pickItem = (b) => {
      if (busy || b.classList.contains('matched')) return;
      if (b.dataset.side === 'L') { selL?.classList.remove('selected'); selL = selL === b ? null : b; }
      else { selR?.classList.remove('selected'); selR = selR === b ? null : b; }
      b.classList.toggle('selected', b === selL || b === selR);
      if (selL && selR) {
        const a = selL, c = selR;
        selL = selR = null;
        if (a.dataset.key === c.dataset.key) {
          [a, c].forEach((x) => { x.classList.remove('selected'); x.classList.add('matched'); x.disabled = true; x.removeAttribute('data-say'); });
          AT.sfx.match();
          matched++;
          if (matched === ex.pairs.length) setTimeout(() => api.complete(), 350);
        } else {
          busy = true;
          [a, c].forEach((x) => x.classList.add('nope'));
          api.mistake();
          setTimeout(() => { [a, c].forEach((x) => x.classList.remove('nope', 'selected')); busy = false; }, 650);
        }
      }
    };
    items.forEach((b) => b.addEventListener('click', () => pickItem(b)));
    return { matchMode: true, key(n) { items[n - 1] && !items[n - 1].disabled && items[n - 1].click(); } };
  };

  AT.renderers = R;

  /* =====================================================================
     Lesson player
     ===================================================================== */
  const ICON_HEART = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7.5-4.6-9.5-9.3C1 8 3.4 4.5 7 4.5c2 0 3.6 1.1 5 2.8 1.4-1.7 3-2.8 5-2.8 3.6 0 6 3.5 4.5 7.2C19.5 16.4 12 21 12 21z" fill="currentColor"/></svg>';

  AT.runLesson = function ({ title, build, lesson = null, practice = false, onExit }) {
    const root = $('#lesson');
    const settings = AT.state.settings;
    let queue, pos, done, total, hearts, mistakes, answered, correct, ctrl, phase, startedAt, noListen, closed = false;

    function reset() {
      queue = build();
      pos = 0; done = 0; total = queue.length;
      hearts = settings.hearts ? 5 : Infinity;
      mistakes = 0; answered = 0; correct = 0; phase = 'answer'; noListen = false;
      startedAt = Date.now();
    }

    function frame() {
      root.innerHTML = `<div class="lesson-wrap">
        <header class="lesson-head">
          <button class="icon-btn lesson-close" aria-label="Quit lesson">${AT.ICON_X}</button>
          <div class="progress" role="progressbar" aria-label="Lesson progress" aria-valuemin="0" aria-valuemax="100"><div class="progress-fill"></div></div>
          <div class="hearts ${settings.hearts ? '' : 'off'}" title="Hearts">${ICON_HEART}<b>${settings.hearts ? hearts : '∞'}</b></div>
        </header>
        <main class="lesson-body"><div class="lesson-inner" id="ex-root"></div></main>
        <footer class="lesson-foot">
          <div class="foot-inner">
            <div class="feedback" id="feedback" aria-live="assertive"></div>
            <div class="foot-btns">
              <button class="btn btn-ghost" id="skip-btn" hidden>Can’t listen now</button>
              <button class="btn btn-green" id="main-btn" disabled>Check</button>
            </div>
          </div>
        </footer>
      </div>`;
      $('.lesson-close', root).addEventListener('click', quit);
      $('#main-btn', root).addEventListener('click', onMain);
      $('#skip-btn', root).addEventListener('click', () => { noListen = true; skipCurrent(); });
    }

    function updateBar() {
      const pct = total ? Math.round((done / total) * 100) : 0;
      const fill = $('.progress-fill', root);
      if (fill) fill.style.width = Math.max(pct, 3) + '%';
      $('.progress', root)?.setAttribute('aria-valuenow', String(pct));
      const h = $('.hearts b', root);
      if (h) h.textContent = settings.hearts ? hearts : '∞';
    }

    const api = {
      ready(on) { if (phase === 'answer') $('#main-btn', root).disabled = !on; },
      complete() { feedback(true, true); },
      mistake() { AT.sfx.wrong(); }
    };

    function show() {
      while (noListen && queue[pos] && queue[pos].listen) markDone(queue[pos++]);
      if (pos >= queue.length) return finish();
      const ex = queue[pos];
      phase = 'answer';
      const foot = $('.lesson-foot', root);
      foot.classList.remove('ok', 'bad');
      $('#feedback', root).innerHTML = '';
      const btn = $('#main-btn', root);
      const exRoot = $('#ex-root', root);
      exRoot.classList.remove('locked');
      exRoot.innerHTML = '';
      $('.lesson-body', root).scrollTop = 0;
      ctrl = AT.renderers[ex.type](ex, exRoot, api);
      const intro = ctrl.needsCheck === false;
      btn.className = 'btn ' + (intro ? 'btn-blue' : 'btn-green');
      btn.textContent = intro ? 'Continue' : 'Check';
      btn.disabled = !intro;
      btn.hidden = !!ctrl.matchMode;
      $('#skip-btn', root).hidden = !ex.listen;
      updateBar();
      if (intro) setTimeout(() => btn.focus({ preventScroll: true }), 50);
    }

    function markDone(ex) {
      if (!ex._done) { ex._done = true; done++; }
    }

    function skipCurrent() {
      AT.speech.stop();
      markDone(queue[pos]);
      pos++;
      show();
    }

    function onMain() {
      if (phase === 'answer') {
        if (ctrl.needsCheck === false) { markDone(queue[pos]); next(); return; }
        const res = ctrl.check();
        feedback(res.ok);
      } else next();
    }

    function feedback(ok, auto = false) {
      const ex = queue[pos];
      phase = 'feedback';
      $('#ex-root', root).classList.add('locked');
      $('#skip-btn', root).hidden = true;
      const foot = $('.lesson-foot', root);
      const btn = $('#main-btn', root);
      btn.hidden = false;
      btn.disabled = false;
      answered++;
      if (ok) {
        correct++;
        markDone(ex);
        AT.markItem(ex.key, true);
        AT.sfx.correct();
        const [arm, r, en] = AT.pick(AT.PRAISE);
        foot.classList.add('ok');
        $('#feedback', root).innerHTML = `<div class="fb"><div class="fb-icon">✓</div><div class="fb-text">
          <div class="fb-title">${auto ? 'All matched!' : `<span class="arm">${esc(arm)}</span>!`}</div>
          <div class="fb-sub">${auto ? `<span class="arm">${esc(arm)}</span> · ${esc(r)} ${esc(en)}` : `${esc(r)} · ${esc(en)}`}</div></div></div>`;
        btn.className = 'btn btn-green';
        btn.textContent = 'Continue';
        if (ex.after && settings.autoplay) AT.say(ex.after);
      } else {
        mistakes++;
        if (settings.hearts) hearts--;
        AT.markItem(ex.key, false);
        AT.sfx.wrong();
        queue.push(ex); // try it again at the end, Duolingo-style
        foot.classList.add('bad');
        $('#feedback', root).innerHTML = `<div class="fb"><div class="fb-icon">✕</div><div class="fb-text">
          <div class="fb-title">Correct answer:</div>
          <div class="fb-sub">${ex.reveal || ''}</div>
          ${ex.tip ? `<div class="fb-tip">💡 ${esc(ex.tip)}</div>` : ''}</div></div>`;
        btn.className = 'btn btn-red';
        btn.textContent = 'Got it';
        const a = ex.after || (ex.stim && ex.stim.audio);
        if (a) AT.say(a);
        const h = $('.hearts', root);
        h.classList.remove('hit'); void h.offsetWidth; h.classList.add('hit');
      }
      updateBar();
      setTimeout(() => btn.focus({ preventScroll: true }), 30);
    }

    function next() {
      AT.speech.stop();
      pos++;
      if (settings.hearts && hearts <= 0) return outOfHearts();
      if (pos >= queue.length) return finish();
      show();
    }

    function finish() {
      phase = 'done';
      const accuracy = answered ? correct / answered : 1;
      const perfect = mistakes === 0;
      const replay = lesson && AT.isDone(lesson.id);
      const base = practice ? 5 : replay ? 5 : 10;
      const xp = base + (perfect ? 5 : 0);
      const goal = settings.goal;
      const before = AT.todayXP();
      const newDay = AT.addXP(xp);
      const goalHit = before < goal && before + xp >= goal;
      if (lesson) AT.completeLesson(lesson, accuracy);
      const secs = Math.round((Date.now() - startedAt) / 1000);
      const time = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;
      const learned = lesson && lesson.kind === 'letters' ? lesson.letters.map(AT.letter) : [];
      const streak = AT.currentStreak();
      root.innerHTML = `<div class="lesson-wrap end-screen">
        <main class="lesson-body"><div class="lesson-inner center">
          <div class="end-mascot">${AT.mascot('happy', 150)}</div>
          <h1 class="end-title">${perfect ? 'Perfect lesson!' : 'Lesson complete!'}</h1>
          <p class="end-sub">${esc(title)}</p>
          <div class="end-stats">
            <div class="end-stat gold"><div class="es-label">Total XP</div><div class="es-val">⭐ ${xp}</div></div>
            <div class="end-stat green"><div class="es-label">Accuracy</div><div class="es-val">🎯 ${Math.round(accuracy * 100)}%</div></div>
            <div class="end-stat blue"><div class="es-label">Time</div><div class="es-val">⏱ ${time}</div></div>
          </div>
          ${learned.length ? `<div class="end-learned"><div class="es-label">Letters learned</div><div class="end-glyphs">${learned.map((Lt) => `<button class="end-glyph arm" data-say="${esc(AT.letterSoundText(Lt))}">${esc(Lt.up)}${esc(Lt.lo)}</button>`).join('')}</div></div>` : ''}
          ${newDay ? `<p class="end-note">🔥 ${streak} day streak${streak > 1 ? '! Keep it going!' : ' started!'}</p>` : ''}
          ${goalHit ? '<p class="end-note">🎯 Daily goal reached. Ապրե՛ս!</p>' : ''}
        </div></main>
        <footer class="lesson-foot"><div class="foot-inner"><div class="foot-btns"><button class="btn btn-green" id="end-btn">Continue</button></div></div></footer>
      </div>`;
      AT.sfx.complete();
      AT.confetti();
      $('#end-btn', root).addEventListener('click', () => close(true));
      setTimeout(() => $('#end-btn', root)?.focus({ preventScroll: true }), 60);
    }

    function outOfHearts() {
      phase = 'done';
      root.innerHTML = `<div class="lesson-wrap end-screen">
        <main class="lesson-body"><div class="lesson-inner center">
          <div class="end-mascot">${AT.mascot('sad', 150)}</div>
          <h1 class="end-title">Out of hearts</h1>
          <p class="end-sub">Mistakes are how we learn. Try the lesson again. You’ve got this!</p>
          <p class="end-note muted">Tip: you can turn hearts off in Profile → Settings.</p>
        </div></main>
        <footer class="lesson-foot"><div class="foot-inner"><div class="foot-btns">
          <button class="btn btn-ghost" id="oh-quit">Quit</button>
          <button class="btn btn-blue" id="oh-retry">Try again</button>
        </div></div></footer>
      </div>`;
      $('#oh-quit', root).addEventListener('click', () => close(false));
      $('#oh-retry', root).addEventListener('click', start);
    }

    async function quit() {
      if (phase === 'done' || (pos === 0 && phase === 'answer')) return close(false);
      const yes = await AT.confirm('Quit this lesson?', 'You’ll lose your progress in this lesson.', 'Quit', 'Keep learning', true);
      if (yes) close(false);
    }

    function onKey(e) {
      if (AT.modal.isOpen() || closed) return;
      if (e.key === 'Escape') { e.preventDefault(); quit(); return; }
      const btn = $('#main-btn', root) || $('#end-btn', root);
      if (e.key === 'Enter') {
        if (document.activeElement && document.activeElement.matches('.option, .tile, .mitem, [data-say]') && phase === 'answer' && !(btn && !btn.disabled)) return;
        if (btn && !btn.disabled && !btn.hidden) { e.preventDefault(); btn.click(); }
        return;
      }
      if (phase !== 'answer' || !ctrl) return;
      if (/^[1-9]$/.test(e.key) && ctrl.key) { e.preventDefault(); ctrl.key(Number(e.key)); }
      if (e.key === 'Backspace' && ctrl.backspace) { e.preventDefault(); ctrl.backspace(); }
    }

    function close(completed) {
      closed = true;
      AT.speech.stop();
      document.removeEventListener('keydown', onKey);
      root.hidden = true;
      root.innerHTML = '';
      document.body.classList.remove('lesson-open');
      if (onExit) onExit({ completed });
    }

    function start() {
      reset();
      if (!queue.length) { AT.toast('Nothing to practice yet. Learn a few more letters first!'); close(false); return; }
      frame();
      show();
    }

    AT._current = () => (queue ? queue[pos] : null); // used by the automated browser test
    closed = false;
    root.hidden = false;
    document.body.classList.add('lesson-open');
    document.addEventListener('keydown', onKey);
    start();
  };
})();
