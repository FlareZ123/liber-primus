#!/usr/bin/env node
'use strict';

/**
 * Five numbered LP2 paragraphs vs. source-derived projective order-five action.
 * Run from the repository root with: node sims/lp2_b5_numbered_paragraph_transducer_sft.cjs
 * Uses only versioned, local source resources and Node.js built-ins.
 * The model is an explicit candidate, not an authenticated Cicada decoder.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const originalLines = read('resources/lp2-transcription.txt').split('%');
const english = read('resources/control/shakespeare_first300k.txt');
const mod = (x) => ((x % 29) + 29) % 29;
const inverse = (x) => {
  for (let i = 1; i < 29; i++) if (mod(i * x) === 1) return i;
  throw Error('No multiplicative inverse: ' + x);
};
const projectiveStep = (x) => {
  const num = x === null ? 1 : mod(x + 7);
  const den = x === null ? 25 : mod(25 * x + 10);
  return den === 0 ? null : mod(num * inverse(den));
};
const orbit = [];
let x = 24;
do {
  orbit.push(x);
  x = projectiveStep(x);
} while (x !== 24 && orbit.length < 30);
assert.deepEqual(orbit, [24, 2, 19, 4, 3]);

const runeCount = (line) => (line.match(/[\u16a0-\u16ff]/g) || []).length;
const lines = (n) => originalLines[n].split('\n')
  .map(s => s.trim()).filter(s => s && !['&', '$', '%'].includes(s));
const pages = new Map(corpus.pages.map(p => [p.page, p.indices]));
for (const page of [36, 37, 38]) {
  assert.equal(lines(page).reduce((n, line) => n + runeCount(line), 0),
    pages.get(page).length);
}
const p36 = lines(36), p37 = lines(37), p38 = lines(38);
const offset36 = p36.slice(0, 5).reduce((n, l) => n + runeCount(l), 0);
const offset37b = p37.slice(0, 4).reduce((n, l) => n + runeCount(l), 0);
const offset37c = p37.slice(0, 9).reduce((n, l) => n + runeCount(l), 0);
const offset38 = p38.slice(0, 3).reduce((n, l) => n + runeCount(l), 0);
assert.deepEqual([offset36, offset37b, offset37c, offset38], [99, 91, 189, 57]);
const ciphertext = [
  ...pages.get(36).slice(offset36), ...pages.get(37), ...pages.get(38).slice(0, 186)
];
assert.equal(ciphertext.length, 553);
const boundaries = [0, pages.get(36).length - offset36,
  pages.get(36).length - offset36 + offset37b,
  pages.get(36).length - offset36 + offset37c,
  pages.get(36).length - offset36 + pages.get(37).length + offset38,
  ciphertext.length];
assert.deepEqual(boundaries, [0, 139, 230, 328, 424, 553]);
const phase = (i) => {
  for (let j = 0; j < 5; j++) if (i >= boundaries[j] && i < boundaries[j + 1]) return j;
  throw Error('Phase outside source span: ' + i);
};

const PATIENCE = [6, 5, 3, 0, 2, 4, 7, 1];
const bytes = grid.pages.flatMap(p => p.bytes);
assert.equal(bytes.length, 256);
const table = Array.from({ length: 32 }, (_, i) => bytes.slice(i * 8, i * 8 + 8));
const maps = table.map(row => {
  let rank = 0;
  const forward = Array(29);
  const columns = Array.from({ length: 8 }, (_, c) => c)
    .sort((a, b) => row[PATIENCE[a]] - row[PATIENCE[b]]);
  for (const col of columns) {
    if (col === 7) forward[28] = rank++;
    else for (let j = 0; j < 4; j++) forward[4 * col + j] = rank++;
  }
  const backward = Array(29);
  forward.forEach((value, index) => { backward[value] = index; });
  assert.equal(new Set(forward).size, 29);
  return { forward, backward };
});
const predecessorRank = (c, p) => c === p ? 28 : c - Number(c > p);
const predecessorUnrank = (r, p) => r === 28 ? p : r + Number(r >= p);
const crypt = (values, mode, decrypt) => {
  const out = [];
  let prev = mode === 'rune-continuous' ? pages.get(36)[98] : 0;
  for (let i = 0; i < values.length; i++) {
    if (mode === 'paragraph-reset' && boundaries.includes(i)) prev = 0;
    const stateIndex = mode === 'rune-continuous' ? i % 5 : phase(i);
    const state = orbit[stateIndex];
    if (decrypt) {
      const c = values[i], r = predecessorRank(c, prev);
      out.push(maps[state].forward[r]);
      prev = c;
    } else {
      const r = maps[state].backward[values[i]];
      const c = predecessorUnrank(r, prev);
      out.push(c);
      prev = c;
    }
  }
  return out;
};
const tokens = corpus.translit.map((value, i) => ({ value, i }))
  .sort((a, b) => b.value.length - a.value.length);
const gp = (txt) => {
  const out = [];
  const words = txt.toUpperCase().replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/K/g, 'C').replace(/Z/g, 'S').match(/[A-Z]+/g) || [];
  for (const w of words) {
    let i = 0;
    while (i < w.length) {
      const t = tokens.find(o => w.startsWith(o.value, i));
      if (!t) break;
      out.push(t.i);
      i += t.value.length;
    }
  }
  return out;
};
const native = gp(english);
assert.ok(native.length > 100553);
const train = native.slice(0, 100000), held = native.slice(100000, 100553);
const trigrams = new Uint32Array(29 ** 3), contexts = new Uint32Array(29 ** 2);
for (let i = 2; i < train.length; i++) {
  const k = train[i - 2] * 29 + train[i - 1];
  trigrams[k * 29 + train[i]]++;
  contexts[k]++;
}
const metrics = a => {
  const freq = Array(29).fill(0);
  for (const item of a) freq[item]++;
  let score = 0;
  for (let i = 2; i < a.length; i++) {
    const k = a[i - 2] * 29 + a[i - 1];
    score += Math.log((trigrams[k * 29 + a[i]] + .1) / (contexts[k] + 2.9));
  }
  return {
    ioc: freq.reduce((n, f) => n + f * (f - 1), 0) / (a.length * (a.length - 1)),
    trigramLogMean: score / (a.length - 2),
    top12: freq.slice().sort((a, b) => b - a).slice(0, 12)
      .reduce((n, x) => n + x, 0) / a.length
  };
};
const modes = ['rune-continuous', 'paragraph-continuous', 'paragraph-reset'];
const runs = modes.map(mode => {
  const decoded = crypt(ciphertext, mode, true);
  assert.deepEqual(crypt(decoded, mode, false), ciphertext);
  assert.deepEqual(crypt(crypt(held, mode, false), mode, true), held);
  return {
    mode, metrics: metrics(decoded),
    prefix: decoded.slice(0, 100).map(i => corpus.translit[i]).join(''),
    originalReencryptsExactly: true, nativePlantRecoveredExactly: true
  };
});
console.log(JSON.stringify({
  status: 'original-cipher negative for these three fixed, speculative readouts',
  candidate: 'B=[[1,7],[25,10]]; x -> (x+7)/(25*x+10), seed 24; projective order 5',
  orbit, page36Start: offset36, paragraphBoundaries: boundaries,
  raw: metrics(ciphertext), nativeControl: metrics(held), runs
}, null, 2));
