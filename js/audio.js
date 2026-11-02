/* Speech (recorded Eastern Armenian clips + device voice) and sound effects. */
(function () {
  'use strict';
  const AT = window.AT;
  const MANIFEST = window.AUDIO_MANIFEST || {};

  /* ---------------- Speech ---------------- */
  const player = new Audio();
  player.preload = 'auto';
  let hyVoice = null;
  let pending = null; // resolve function of the current playback
  let playId = 0;

  function pickVoice() {
    if (!('speechSynthesis' in window)) return;
    const voices = window.speechSynthesis.getVoices() || [];
    const hy = voices.filter((v) => /^hy(\b|[-_])/i.test(v.lang) || /armenian/i.test(v.name));
    // Prefer natural/online voices, which sound far better.
    hy.sort((a, b) => (/natural|online|neural/i.test(b.name) ? 1 : 0) - (/natural|online|neural/i.test(a.name) ? 1 : 0));
    hyVoice = hy[0] || null;
    AT.emit('voices');
  }
  if ('speechSynthesis' in window) {
    pickVoice();
    window.speechSynthesis.addEventListener?.('voiceschanged', pickVoice);
  }

  function finish(ok) {
    if (pending) {
      const p = pending;
      pending = null;
      p(ok);
    }
  }

  const Speech = {
    hasDeviceVoice: () => !!hyVoice,
    deviceVoiceName: () => (hyVoice ? hyVoice.name : ''),
    hasClip: (text) => !!MANIFEST[String(text).toLowerCase()],
    useDevice() {
      const mode = AT.state.settings.voice;
      return !!hyVoice && (mode === 'device' || mode === 'auto');
    },
    stop() {
      try { player.pause(); } catch (e) { /* ignore */ }
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      finish(false);
    },
    // Speak Armenian text. Resolves when finished (true) or interrupted (false).
    play(text, opts = {}) {
      Speech.stop();
      const id = ++playId;
      const key = String(text).toLowerCase();
      const clip = MANIFEST[key];
      return new Promise((resolve) => {
        pending = resolve;
        const done = (ok) => { if (id === playId) finish(ok); };
        if (Speech.useDevice() || (!clip && hyVoice)) {
          const u = new SpeechSynthesisUtterance(text);
          u.voice = hyVoice;
          u.lang = hyVoice.lang;
          u.rate = opts.slow ? 0.6 : 0.85;
          u.onend = () => done(true);
          u.onerror = (e) => {
            if (id !== playId || (e && e.error === 'interrupted') || (e && e.error === 'canceled')) return;
            // Fall back to the recording if the device voice fails.
            if (clip) playClip(clip, opts, done); else done(false);
          };
          window.speechSynthesis.speak(u);
          return;
        }
        if (clip) { playClip(clip, opts, done); return; }
        done(false);
      });
    }
  };

  function playClip(file, opts, done) {
    player.src = 'audio/' + file;
    const rate = opts.slow ? 0.7 : 1;
    player.defaultPlaybackRate = rate;
    player.playbackRate = rate;
    player.onended = () => done(true);
    player.onerror = () => done(false);
    const p = player.play();
    if (p && p.catch) p.catch(() => done(false));
  }

  // Browsers only allow sound after a user gesture: wake the effects engine on the first tap.
  const wake = () => SFX.ctx();
  window.addEventListener('pointerdown', wake, { once: true, capture: true });
  window.addEventListener('keydown', wake, { once: true, capture: true });

  /* ---------------- Sound effects (synthesized, no files) ---------------- */
  let actx = null;
  const SFX = {
    ctx() {
      if (!actx) {
        const C = window.AudioContext || window.webkitAudioContext;
        if (!C) return null;
        try { actx = new C(); } catch (e) { return null; }
      }
      if (actx.state === 'suspended') actx.resume();
      return actx;
    },
    tone(freq, start, dur, type = 'sine', vol = 0.18) {
      const c = SFX.ctx();
      if (!c) return;
      const t = c.currentTime + start;
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = type;
      o.frequency.setValueAtTime(freq, t);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(c.destination);
      o.start(t);
      o.stop(t + dur + 0.05);
    },
    on: () => AT.state.settings.sfx,
    correct() { if (!SFX.on()) return; SFX.tone(784, 0, 0.14); SFX.tone(1175, 0.09, 0.22); },
    wrong() { if (!SFX.on()) return; SFX.tone(220, 0, 0.18, 'triangle', 0.2); SFX.tone(165, 0.12, 0.25, 'triangle', 0.2); },
    match() { if (!SFX.on()) return; SFX.tone(988, 0, 0.1, 'sine', 0.12); },
    complete() {
      if (!SFX.on()) return;
      [523, 659, 784, 1047].forEach((f, i) => SFX.tone(f, i * 0.11, 0.3, 'sine', 0.16));
      SFX.tone(1319, 0.48, 0.5, 'sine', 0.12);
    },
    pop() { if (!SFX.on()) return; SFX.tone(600, 0, 0.06, 'sine', 0.08); }
  };

  AT.speech = Speech;
  AT.sfx = SFX;
  AT.say = (text, opts) => Speech.play(text, opts);
})();
