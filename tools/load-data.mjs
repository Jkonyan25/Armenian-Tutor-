// Loads js/data.js (a browser script) into Node for the build tools.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export function loadData() {
  const ctx = { window: {} };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/data.js'), 'utf8'), ctx);
  return ctx.window.ARM_DATA;
}

// Same rule as the app: vowels are spoken alone, consonants with "ա".
export function letterSoundText(L) {
  if (L.soundText) return L.soundText;
  return L.vowel ? L.lo : L.lo + 'ա';
}

// Every piece of Armenian the app can speak: [key, textForSpeechEngine].
export function speechItems(D) {
  const items = new Map();
  const add = (text, tts) => {
    const key = text.toLowerCase();
    if (!items.has(key)) items.set(key, tts || text);
  };
  for (const L of [...D.LETTERS, ...D.SPECIALS]) {
    add(L.name, L.tts);
    add(letterSoundText(L));
  }
  for (const W of D.WORD_LIST) add(W.arm, W.tts);
  add(D.PRAYER.arm);
  for (const P of D.PRAISE) add(P[0]);
  return items;
}
