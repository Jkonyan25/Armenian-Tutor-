// Sanity-checks the course: ids exist, every Part 1 & 2 word only uses
// letters already taught, every letter is taught once, audio exists.
//   node tools/validate.mjs
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { ROOT, loadData, speechItems } from './load-data.mjs';

const D = loadData();
const errors = [];
const letters = new Map([...D.LETTERS, ...D.SPECIALS].map((L) => [L.id, L]));
const words = new Map();
for (const W of D.WORD_LIST) {
  if (words.has(W.id)) errors.push(`Duplicate word id: ${W.id}`);
  words.set(W.id, W);
}
const charToLetter = new Map();
for (const L of D.LETTERS) charToLetter.set(L.lo, L.id);

function lettersIn(text) {
  const out = [];
  const s = text.toLowerCase();
  for (const ch of s) {
    if (ch === 'և') { out.push('ev'); continue; }
    if (charToLetter.has(ch)) out.push(charToLetter.get(ch));
  }
  return out;
}

const known = new Set();
const taught = [];
const lessonIds = new Set();
for (const part of D.COURSE) {
  for (const unit of part.units) {
    for (const lesson of unit.lessons) {
      if (lessonIds.has(lesson.id)) errors.push(`Duplicate lesson id: ${lesson.id}`);
      lessonIds.add(lesson.id);
      for (const id of lesson.letters || []) {
        if (!letters.has(id)) errors.push(`${lesson.id}: unknown letter ${id}`);
        if (taught.includes(id)) errors.push(`${lesson.id}: letter ${id} taught twice`);
        taught.push(id);
        known.add(id);
        if (id === 'u') known.add('vo'), known.add('vyun');
      }
      for (const id of lesson.words || []) {
        const W = words.get(id);
        if (!W) { errors.push(`${lesson.id}: unknown word ${id}`); continue; }
        if (part.id !== 'part3') {
          const missing = lettersIn(W.arm).filter((l) => !known.has(l) && !(l === 'vo' && known.has('u')));
          if (missing.length) errors.push(`${lesson.id}: “${W.arm}” uses letters not taught yet: ${[...new Set(missing)].join(', ')}`);
        }
      }
    }
  }
}
for (const L of [...D.LETTERS, ...D.SPECIALS]) {
  if (!taught.includes(L.id)) errors.push(`Letter never taught: ${L.up} (${L.id})`);
  if (L.ex && !words.has(L.ex)) errors.push(`Letter ${L.id}: example word ${L.ex} missing`);
}
for (const [id] of D.PRAYER.words) if (!words.has(id)) errors.push(`Prayer word missing: ${id}`);

// Audio manifest coverage
const manifestFile = path.join(ROOT, 'js/audio-manifest.js');
if (fs.existsSync(manifestFile)) {
  const ctx = { window: {} };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(manifestFile, 'utf8'), ctx);
  const man = ctx.window.AUDIO_MANIFEST;
  for (const [key] of speechItems(D)) {
    if (!man[key]) errors.push(`No audio for “${key}” (run node tools/build-audio.mjs)`);
    else if (!fs.existsSync(path.join(ROOT, 'audio', man[key]))) errors.push(`Audio file missing: ${man[key]}`);
  }
} else errors.push('js/audio-manifest.js missing (run node tools/build-audio.mjs)');

const lessonCount = D.COURSE.reduce((n, p) => n + p.units.reduce((m, u) => m + u.lessons.length, 0), 0);
if (errors.length) {
  console.error(errors.map((e) => '✗ ' + e).join('\n'));
  process.exit(1);
}
console.log(`✓ Course OK: ${D.COURSE.length} parts, ${lessonCount} lessons, ${taught.length} letters taught, ${words.size} words.`);
