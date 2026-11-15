'use strict';

/**
 * Source-conditioned, all-29 fixed-marker test for the 2013 DH6 affine echo.
 * Node 22, built-in modules. All positions and simulated words are source-fixed.
 *
 * Hypothesis: for every within-word i >= 6, C[i] = (24 - 2*C[i-6]) mod 29
 * if and only if P[i] is one particular fixed GP29 symbol. A secret reversible
 * output permutation can implement that condition without fixing any of its
 * other 28 alphabet assignments.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} file @returns {string} */
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const runeIndex = new Map(gp.runes.map((r, i) => [r, i]));
const gpIndex = new Map(gp.translit.map((r, i) => [r, i]));
let words = [];
let curr = [];
for (const glyph of read('resources/lp2-transcription.txt').split('%').slice(0, 55).join('%')) {
  const r = runeIndex.get(glyph);
  if (r !== undefined) curr.push(r);
  else if ('-.$&§0123456789'.includes(glyph) && curr.length) {
    words.push(curr);
    curr = [];
  }
}
if (curr.length) words.push(curr);
assert.equal(words.length, 2896);
assert.deepEqual(words.flat(), gp.pages.filter(p => p.page <= 55).flatMap(p => p.indices));
assert.equal(words.flat().length, 12956);
const eligible = words.filter(w => w.length >= 7);
/** @param {number} x @returns {number} */
const affine = (x) => (24 - 2*x + 58) % 29;
const observations = eligible.map(w => w.slice(6).map((v, j) =>
  v === affine(w[j]) ? 1 : 0));
assert.equal(eligible.length, 559);
assert.equal(observations.flat().length, 1290);
assert.equal(observations.flat().reduce((s, x) => s+x, 0), 80);
assert.equal(observations.filter((hits) => hits[hits.length-1]).length, 32);

/**
 * Encode actual English word spelling into the 2013 GP29 convention.
 * @param {string} token
 * @returns {number[]|null}
 */
function encodeGP(token) {
  const s = token.toUpperCase().replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/K/g, 'C').replace(/Z/g, 'S');
  const output = [];
  for (let i = 0; i < s.length;) {
    const dg = gpIndex.get(s.slice(i, i+2));
    if (dg !== undefined) { output.push(dg); i += 2; }
    else {
      const one = gpIndex.get(s[i]);
      if (one === undefined) return null;
      output.push(one); i++;
    }
  }
  return output;
}

/** @param {string} source @returns {Map<number,number[][]>} */
function sourcePool(source) {
  const result = new Map();
  for (const token of source.match(/[A-Za-z]+/g) || []) {
    const word = encodeGP(token);
    if (!word) continue;
    if (!result.has(word.length)) result.set(word.length, []);
    result.get(word.length).push(word);
  }
  return result;
}
let state = 0x33012026;
/** @returns {number} */
function random32() {
  state ^= state << 13; state ^= state >>> 17; state ^= state << 5;
  return state >>> 0;
}

/**
 * Exact reversibility sanity plant: a marker produces precisely the affine
 * echo and all other native-GP symbols are assigned to the 28 other outputs.
 * @param {number[]} plaintext
 * @param {number} marker
 * @returns {number[]}
 */
function encryptWord(plaintext, marker) {
  const ciphertext = [];
  for (let i = 0; i < plaintext.length; i++) {
    const p = plaintext[i];
    if (i < 6) ciphertext.push(p);
    else {
      const special = affine(ciphertext[i-6]);
      const rank = p < marker ? p : p - 1;
      ciphertext.push(p === marker ? special : rank + Number(rank >= special));
    }
  }
  return ciphertext;
}

/** @param {number[]} ciphertext @param {number} marker @returns {number[]} */
function decryptWord(ciphertext, marker) {
  return ciphertext.map((c, i) => {
    if (i < 6) return c;
    const special = affine(ciphertext[i-6]);
    if (c === special) return marker;
    const rank = c - Number(c > special);
    return rank + Number(rank >= marker);
  });
}
for (const marker of [0, 4, 9, 15, 16, 18, 20, 28]) {
  const planted = [
    ...encodeGP('UNDERSTANDING'), ...encodeGP('PILGRIMAGE')
  ];
  const cipher = encryptWord(planted, marker);
  assert.deepEqual(decryptWord(cipher, marker), planted);
  for (let i = 6; i < planted.length; i++)
    assert.equal(cipher[i] === affine(cipher[i-6]), planted[i] === marker);
}

const sources = [
  ['Shakespeare', 'resources/control/shakespeare_first300k.txt'],
  ['Gibran', 'resources/control/gibran_prophet_58585.txt'],
  ['Emerson', 'resources/control/emerson_essays_2944.txt']
];
const trials = 2000;
const reports = [];
for (const [name, file] of sources) {
  const pool = sourcePool(read(file));
  const model = new Map();
  for (const [n, candidates] of pool) {
    const counts = Array.from({length:n}, () => new Uint32Array(29));
    for (const w of candidates)
      for (let i = 6; i < n; i++) counts[i][w[i]]++;
    const base = new Float64Array(29);
    const delta = Array.from({length:n}, () => new Float64Array(29));
    for (let i = 6; i < n; i++) for (let r = 0; r < 29; r++) {
      // Jeffreys-like smoothing; each length and position has 29 outcomes.
      const p = (counts[i][r] + 0.5) / (candidates.length + 14.5);
      base[r] += Math.log1p(-p);
      delta[i][r] = Math.log(p) - Math.log1p(-p);
    }
    model.set(n, {candidates, base, delta});
  }
  const original = new Float64Array(29);
  for (let j = 0; j < eligible.length; j++) {
    const w = eligible[j], m = model.get(w.length);
    assert(m && m.candidates.length);
    for (let r = 0; r < 29; r++) original[r] += m.base[r];
    for (let i = 6; i < w.length; i++)
      if (observations[j][i-6])
        for (let r = 0; r < 29; r++) original[r] += m.delta[i][r];
  }

  const below = new Uint32Array(29);
  const nativeMeans = new Float64Array(29);
  const nativeMin = new Float64Array(29).fill(Infinity);
  const nativeMax = new Float64Array(29).fill(-Infinity);
  for (let trial = 0; trial < trials; trial++) {
    const ll = new Float64Array(29);
    for (const word of eligible) {
      const m = model.get(word.length);
      const sample = m.candidates[random32() % m.candidates.length];
      for (let r = 0; r < 29; r++) ll[r] += m.base[r];
      for (let i = 6; i < sample.length; i++)
        ll[sample[i]] += m.delta[i][sample[i]];
    }
    for (let r = 0; r < 29; r++) {
      if (ll[r] <= original[r]) below[r]++;
      nativeMeans[r] += ll[r]/trials;
      nativeMin[r] = Math.min(nativeMin[r], ll[r]);
      nativeMax[r] = Math.max(nativeMax[r], ll[r]);
    }
  }
  const rows = gp.translit.map((symbol, r) => ({
    symbol, r, originalLL: Number(original[r].toFixed(2)),
    controlMeanLL: Number(nativeMeans[r].toFixed(2)),
    controlMinLL: Number(nativeMin[r].toFixed(2)),
    controlMaxLL: Number(nativeMax[r].toFixed(2)),
    controlsAtOrBelowOriginal: below[r],
    controlsAboveOriginal: trials - below[r]
  }));
  rows.sort((a,b) => b.originalLL - a.originalLL);
  reports.push({source:name, leading:rows.slice(0,10),
    candidatesWithTwoSidedCountsInside5percent:rows
      .filter(row => row.controlsAtOrBelowOriginal >= 100
                  && row.controlsAboveOriginal >= 100)
      .map(row => row.symbol),
    all:rows});
}
console.log(JSON.stringify({
  source:'original LP2 2013 DH6 source equation, original GP29 word boundaries',
  fixedMarkerHypothesis:'six-back affine match iff one fixed plaintext rune',
  observed:{words:words.length, runes:12956, eligible:1290,
    matches:80, matchedWordFinals:32},
  matchedNativeWordControls:trials,
  sourceResults:reports,
  originalPlaintextRecovered:false,
  authorSelectedFixedMarker:false
},null,2));
