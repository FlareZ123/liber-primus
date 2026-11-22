'use strict';

/**
 * Original LP2 fixed T6-S and repeat-EA bijection gate on whole GP-English
 * source words. SFT for Node.js 22; no file writes or network calls.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const read = s => fs.readFileSync(path.join(root, s), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const alpha = new Map(gp.runes.map((g, i) => [g, i]));
const words = [];
let word = [];
for (const part of read('resources/liber-primus/lp2-transcription.txt').split('%').slice(0, 55)) {
  for (const char of part.replace(/[\/\s]/g, '')) {
    if (alpha.has(char)) word.push(alpha.get(char));
    else if (word.length) { words.push(word); word = []; }
  }
}
if (word.length) words.push(word);
assert.equal(words.length, 2896);
assert.deepEqual(words.flat(), gp.pages.filter(p => p.page <= 55).flatMap(p => p.indices));
const mod = n => ((n % 29) + 29) % 29;
const original = {eligible: 0, target: 0, distinct: 0, conflicts: 0, startRepeat: 0, insideRepeat: 0};
let prev = -1;
for (const w of words) for (let j = 0; j < w.length; j++) {
  if (w[j] === prev) {
    if (j === 0) original.startRepeat++; else original.insideRepeat++;
  }
  if (j >= 6) {
    original.eligible++;
    const t = mod(24 - 2 * w[j - 6]);
    if (t === w[j - 1]) original.conflicts++;
    if (w[j] === t) {
      original.target++;
      if (t !== w[j - 1]) original.distinct++;
    }
  }
  prev = w[j];
}
assert.deepEqual(original, {eligible: 1290, target: 80, distinct: 79,
  conflicts: 33, startRepeat: 23, insideRepeat: 63});
const tokens = gp.translit.map((s, i) => ({s, i})).sort((a, b) => b.s.length - a.s.length);

/**
 * The native orthography is calibrated to independently solved LP1 pages.
 * @param {string} s
 * @returns {number[]}
 */
function encode(s) {
  s = s.toUpperCase().replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const out = [];
  for (let i = 0; i < s.length;) {
    if (s.startsWith('ING', i)) { out.push(21); i += 3; }
    else if (s.startsWith('IO', i)) { out.push(27); i += 2; }
    else {
      const t = tokens.find(v => s.startsWith(v.s, i));
      assert(t, 'unmapped native word');
      out.push(t.i);
      i += t.s.length;
    }
  }
  return out;
}

/** @param {number[][]} input */
function census(input) {
  const res = {sDeep: 0, rDeep: 0, sTerminal: 0, rTerminal: 0, eaFirst: 0, eaInside: 0};
  for (const w of input) for (let j = 0; j < w.length; j++) {
    if (w[j] === 28) {
      if (j === 0) res.eaFirst++; else res.eaInside++;
    }
    if (j >= 6) {
      if (w[j] === 15) {
        res.sDeep++;
        if (j === w.length - 1) res.sTerminal++;
      }
      if (w[j] === 4) {
        res.rDeep++;
        if (j === w.length - 1) res.rTerminal++;
      }
    }
  }
  return res;
}
const sources = [
  ['Gibran', 'resources/control/gibran_prophet_58585.txt', 0x33010331],
  ['Emerson', 'resources/control/emerson_essays_2944.txt', 0x33010332],
  ['Shakespeare', 'resources/control/shakespeare_first300k.txt', 0x33010333]
];
const repetitions = 500;
const results = {};
for (const [name, file, startSeed] of sources) {
  const bins = new Map();
  for (const match of read(file).match(/[A-Za-z]+/g) || []) {
    const v = encode(match);
    if (!bins.has(v.length)) bins.set(v.length, []);
    bins.get(v.length).push(v);
  }
  for (const w of words) assert(bins.get(w.length)?.length > 0);
  let seed = startSeed;
  const rand = () => {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return seed >>> 0;
  };
  const samples = [];
  for (let i = 0; i < repetitions; i++) {
    samples.push(census(words.map(w => {
      const b = bins.get(w.length);
      return b[rand() % b.length];
    })));
  }
  const stats = {};
  for (const key of Object.keys(samples[0])) {
    const vals = samples.map(x => x[key]);
    const mean = vals.reduce((a, b) => a + b, 0) / repetitions;
    const sd = Math.sqrt(vals.reduce((a, b) => a + (b - mean) ** 2, 0) / (repetitions - 1));
    stats[key] = {mean: +mean.toFixed(2), sd: +sd.toFixed(2),
      min: Math.min(...vals), max: Math.max(...vals)};
  }
  const sFits = samples.filter(x => x.sDeep >= 79 && x.sDeep <= 112).length;
  const eaFits = samples.filter(x => x.eaFirst >= 23 && x.eaInside <= 63).length;
  assert.equal(sFits, 0);
  assert.equal(eaFits, 0);
  results[name] = {stats, sFits, eaFits};
}
console.log(JSON.stringify({original, sourceSRange: [79, 112], repetitions, results}, null, 2));
console.log('PASS: literal S-T6 and EA-repeat marker shapes fail native GP-English word controls.');
