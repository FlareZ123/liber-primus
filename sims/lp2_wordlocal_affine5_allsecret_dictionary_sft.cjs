'use strict';
/**
 * Original LP2 word-local five-phase affine dictionary inverse gate.
 * Source: canonical complete 2,896 original printed words.
 * Candidate direct cipher: C[w,j] = a[w,j mod5]*P[w,j] + b[w,j mod5]
 * over GF(29), each a nonzero, even when slopes/offsets are all secret,
 * different for every word and phase. This is more permissive than a
 * globally fixed phase-wise affine key, and has exact necessary conditions
 * on every length-11 to 14 source word.
 *
 * SFT: node sims/lp2_wordlocal_affine5_allsecret_dictionary_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {encodeSourceNativeGP} = require('./lp2_native_gp_source_orthography_sft.cjs');
const root = path.resolve(__dirname, '..');
/** @param {string} p @returns {string} */
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ids = new Map(gp.runes.map((r, i) => [r, i]));
const source = read('resources/liber-primus/lp2-transcription.txt')
  .split('%').slice(0, 55).join('%');
const printed = [];
let word = [], start = 0, runes = 0;
for (const ch of source) {
  if (ids.has(ch)) {
    if (!word.length) start = runes;
    word.push(ids.get(ch)); runes++;
  } else if (ch !== '/' && ch !== '%' && !/\s/u.test(ch)) {
    if (word.length) printed.push({word, start});
    word = [];
  }
}
if (word.length) printed.push({word, start});
assert.equal(printed.length, 2896);
assert.equal(runes, 12956);
const long = printed.map((w, i) => ({...w, ordinal: i + 1}))
  .filter(w => w.word.length >= 11 && w.word.length <= 14);
assert.deepEqual([11, 12, 13, 14].map(n =>
  long.filter(w => w.word.length === n).length), [32, 18, 4, 3]);
const pageRanges = [];
let base = 0;
for (const p of gp.pages.filter(p => p.page < 56 && p.indices.length)) {
  pageRanges.push({page: p.page, start: base, end: base + p.indices.length});
  base += p.indices.length;
}
assert.equal(base, 12956);
const dictionary = read('resources/control/english_wordfreq_textblob.txt')
  .split(/\r?\n/u).filter(line => /^[a-z]+ \d+$/u.test(line))
  .map(line => line.slice(0, line.indexOf(' ')));
assert.equal(dictionary.length, 29157);
const native = new Map();
for (const w of dictionary) {
  const seq = encodeSourceNativeGP(w);
  if (seq.length < 11 || seq.length > 14) continue;
  if (!native.has(seq.length)) native.set(seq.length, []);
  native.get(seq.length).push({text: w, seq});
}
const mod = x => ((x % 29) + 29) % 29;
/** @param {number} d @returns {number} */
function inverse(d) {
  for (let a = 1; a < 29; a++) if (d * a % 29 === 1) return a;
  throw Error('zero field element has no inverse');
}
/**
 * Unique affine transform for each phase where there are two distinct values.
 * @param {number[]} c
 * @param {number[]} p
 * @returns {{slope:number,offset:number}[]|null}
 */
function keyFor(c, p) {
  if (c.length !== p.length) return null;
  const key = [];
  for (let phase = 0; phase < 5; phase++) {
    const sites = [];
    for (let j = phase; j < c.length; j += 5) sites.push(j);
    if (!sites.length) {key.push({slope:1, offset:0});continue;}
    const first = sites[0];
    const second = sites.find(j => p[j] !== p[first]);
    let slope = 1;
    if (second !== undefined) {
      if (c[second] === c[first]) return null;
      slope = mod((c[second] - c[first]) * inverse(mod(p[second] - p[first])));
    }
    if (slope === 0) return null;
    const offset = mod(c[first] - slope * p[first]);
    if (sites.some(j => mod(slope * p[j] + offset) !== c[j])) return null;
    key.push({slope, offset});
  }
  return key;
}
/** @param {number[]} p @param {{slope:number,offset:number}[]} key */
function encode(p, key) {
  return p.map((v, j) => mod(key[j % 5].slope * v + key[j % 5].offset));
}
/** @param {number[]} c @param {{slope:number,offset:number}[]} key */
function decode(c, key) {
  return c.map((v, j) => mod((v - key[j % 5].offset) *
    inverse(key[j % 5].slope)));
}
let seed = 0x13a5c023;
/** @param {number} n @returns {number} */
function rand(n) {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return Math.floor(seed / 4294967296 * n);
}
let positive = 0;
for (const [length, bucket] of native) {
  for (let trial = 0; trial < 100; trial++) {
    const p = bucket[rand(bucket.length)].seq;
    const k = Array.from({length: 5}, () => ({
      slope: 1 + rand(28), offset: rand(29)
    }));
    const c = encode(p, k);
    const recovered = keyFor(c, p);
    assert.ok(recovered, 'native encrypted word should have affine inverse');
    assert.deepEqual(encode(p, recovered), c);
    assert.deepEqual(decode(c, recovered), p);
    positive++;
  }
}
assert.equal(positive, 400);
const rows = [], full = [];
for (const r of long) {
  const matches = [];
  for (const candidate of native.get(r.word.length) || []) {
    const key = keyFor(r.word, candidate.seq);
    if (key) matches.push(candidate.text);
  }
  const page = pageRanges.find(p => r.start >= p.start && r.start < p.end);
  assert.ok(page);
  const rec = {
    word: r.ordinal,
    page: page.page,
    offset: r.start - page.start,
    length: r.word.length,
    candidateCount: matches.length,
    candidatePreview: matches.slice(0, 8)
  };
  rows.push(rec);
  full.push({...rec, matches});
}
/* Independently sourced Latin Vulgate words are already GP29-encoded
 * one word per line, source alphabet 0..9A..S. Keep that register separate
 * from the English lexicon and deduplicate identical candidate rune forms. */
const latinAlphabet = '0123456789ABCDEFGHIJKLMNOPQRS';
const latinLines = read('resources/control/latin-vulgate-gp-wholewords.txt')
  .split(/\r?\n/u).filter(line => /^[0-9A-S]+$/u.test(line));
const latin = new Map(), latinSeen = new Set();
for (const line of latinLines) {
  if (line.length < 11 || line.length > 14 || latinSeen.has(line)) continue;
  latinSeen.add(line);
  if (!latin.has(line.length)) latin.set(line.length, []);
  latin.get(line.length).push(Array.from(line, ch =>
    latinAlphabet.indexOf(ch)));
}
const latinRows = long.map(r => ({
  word: r.ordinal,
  length: r.word.length,
  matches: (latin.get(r.word.length) || [])
    .filter(candidate => keyFor(r.word, candidate) !== null).length
}));
const latinSummary = [11, 12, 13, 14].map(n => {
  const w = latinRows.filter(x => x.length === n);
  return {
    length: n,
    words: w.length,
    dictionary: (latin.get(n) || []).length,
    noMatches: w.filter(x => x.matches === 0).length,
    unique: w.filter(x => x.matches === 1).length
  };
});
const summary = [11,12,13,14].map(n => {
  const w = rows.filter(x => x.length === n);
  return {
    length: n,
    words: w.length,
    dictionary: (native.get(n) || []).length,
    noMatches: w.filter(x => !x.candidateCount).length,
    unique: w.filter(x => x.candidateCount === 1).length,
    min: Math.min(...w.map(x => x.candidateCount)),
    max: Math.max(...w.map(x => x.candidateCount))
  };
});
assert.deepEqual(summary.map(x => x.noMatches), [1, 6, 4, 3]);
assert.deepEqual(latinSummary.map(x => x.noMatches), [1, 13, 4, 3]);
console.log(JSON.stringify({
  originalWords: printed.length,originalRunes: runes, positives: positive,
  model: 'independent secret affine GP29 slope and shift per word and phase',
  englishSummary: summary,
  latinSummary,
  originalDetails: rows
}, null, 2));
