'use strict';

// An adversarial two-time-pad positive control drawn from *genuine solved Cicada*
// prose, rather than synthetic English transliterated into GP runes.
// Two authentic LP1 pages are re-encrypted with the same artificial additive pad.
// The original LP2 page-28/42 puzzle remains unresolved.

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const solved = require('./authentic_lp1_p03_p04_vigenere_recovery.cjs');
const probe = require('./relative_key_trigram_probe.cjs');
const base = require('./relative_key_english_probe.cjs');

const ROOT = path.resolve(__dirname, '..');
const source = (file) => fs.readFileSync(path.join(ROOT, file), 'utf8');
const corpus = JSON.parse(source('resources/liber-primus/lp2-corpus.json'));
const raw = source('resources/transcriptions/lp1_wulfic_canonical.txt')
  .split('%').slice(1, 3).join('%');
const runeIndices = new Map(corpus.runes.map((rune, i) => [rune, i]));

/** @type {{xs:number[],start:boolean[],end:boolean[]}} */
const realGp = { xs: [], start: [], end: [] };
let active = false;
for (const rune of raw) {
  if (runeIndices.has(rune)) {
    realGp.xs.push(solved.plaintext[realGp.xs.length]);
    realGp.start.push(!active);
    realGp.end.push(false);
    active = true;
  } else if ('-.$&§%'.includes(rune)) {
    if (realGp.end.length) realGp.end[realGp.end.length - 1] = true;
    active = false;
  }
}
assert.deepEqual(realGp.xs, solved.plaintext);
assert.equal(realGp.xs.length, 515);

/** @param {number} a @param {number} b */
function slice(a, b) {
  return {xs: realGp.xs.slice(a, b), start: realGp.start.slice(a, b),
    end: realGp.end.slice(a, b)};
}
const p = slice(0, 251), q = slice(251, 515);
assert.equal(p.xs.length, 251);
assert.equal(q.xs.length, 264);

/** @param {number} seed @returns {() => number} */
function rng(seed) {
  let state = seed >>> 0;
  return () => {state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;};
}
const rand = rng(0x3301a17);
const key = p.xs.map(() => Math.floor(rand() * 29));
const mod = (x) => ((x % 29) + 29) % 29;
const ca = {...p, xs: p.xs.map((value, i) => mod(value + key[i]))};
const cb = {...q, xs: q.xs.map((value, i) => mod(value + key[i % key.length]))};
const text = source('resources/control/shakespeare_first300k.txt');
const lm = probe.trainTrigram(base.corpusWords(text.slice(0, 240000)));
const decoded = probe.solve(ca, cb, lm, 0, true);
const correctA = decoded.p.filter((value, i) => value === p.xs[i]).length;
const correctB = decoded.q.filter((value, i) => value === q.xs[i]).length;

/** @param {{xs:number[],start:boolean[],end:boolean[]}} a
 * @param {{xs:number[],start:boolean[],end:boolean[]}} b */
function rankAlignments(a, b) {
  const scores = [];
  for (let shift = 0; shift < b.xs.length; shift++) {
    scores.push({shift, score: probe.solve(a, b, lm, shift).score});
  }
  scores.sort((x, y) => y.score - x.score);
  return {rank: scores.findIndex((x) => x.shift === 0) + 1,
    first: scores[0], unshifted: scores.find((x) => x.shift === 0),
    middle: scores[Math.floor(scores.length / 2)]};
}
const alignment = rankAlignments(ca, cb);
const actual = rankAlignments(base.lp2Page(28), base.lp2Page(42));
assert.ok(correctA >= 0 && correctB >= 0);
assert.ok(alignment.rank >= 1);
console.log(JSON.stringify({
  experiment: 'Shared-pad trigram decoder calibrated on authentic solved LP1 GP register',
  realCicadaTrainingPlaintext: 'LP1 pages 03-04, first 251 vs next 264 runes',
  authenticControl: {runeAccuracyP03: correctA / 251,
    runeAccuracyP04: correctB / 251, exactRunesP03: correctA,
    exactRunesP04: correctB, alignment},
  unsolvedTarget: {pages: [28, 42], alignment: actual},
  caveat: 'Synthetic masking of real Cicada solved plaintext is not an LP2 decryption'
}, null, 2));
