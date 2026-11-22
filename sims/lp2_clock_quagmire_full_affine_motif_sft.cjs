'use strict';

/**
 * Source-original, familywise-forward-model test for the 2016/2026 proposed
 * clock-dependent word-Quagmire with one zero schedule step and a doublet dodge.
 *
 * Unlike the independent odometer variant, its word disk is cumulative:
 * base_w+1 = base_w o alpha[(clock-1)%5] o sigma.
 *
 * Reads only committed LP2 ciphertext and independently translated English
 * corpora. Generates authentic keyed *forward* plants. No cipher key is fitted
 * to the original, no original plaintext is proposed or inferred.
 *
 * Reproduce on Windows 11, Node.js 22: node sims/lp2_clock_quagmire_full_affine_motif_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const letters = new Map(gp.runes.map((glyph, i) => [glyph, i]));
const runePattern = new RegExp('[' + gp.runes.join('') + ']+', 'gu');
const words = (read('resources/lp2-transcription.txt')
  .split('%').slice(0, 55).join('%')
  .replace(/\/\r?\n/g, '').replace(/[\/\r\n%]/g, '')
  .match(runePattern) || [])
  .map((word) => Array.from(word, (rune) => letters.get(rune)));
assert.equal(words.length, 2896);
assert.equal(words.reduce((sum, word) => sum + word.length, 0), 12956);

const tokens = gp.translit.map((s, i) => ({ s, i }))
  .sort((a, b) => b.s.length - a.s.length);

/** Source-native orthography pinned in lp2_native_gp_source_orthography_sft.cjs.
 * @param {string} raw
 * @returns {number[]}
 */
function nativeGP(raw) {
  const word = raw.toUpperCase().replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const out = [];
  for (let i = 0; i < word.length;) {
    if (word.startsWith('ING', i)) {
      out.push(21);
      i += 3;
    } else if (word.startsWith('IO', i)) {
      out.push(27);
      i += 2;
    } else {
      const tok = tokens.find((candidate) => word.startsWith(candidate.s, i));
      assert(tok, 'Unmapped GP English spelling: ' + word.slice(i));
      out.push(tok.i);
      i += tok.s.length;
    }
  }
  return out;
}
assert.equal(nativeGP('FOLLOWING').map((n) => gp.runes[n]).join(''), 'ᚠᚩᛚᛚᚩᚹᛝ');
assert.equal(nativeGP('FUNCTION').map((n) => gp.runes[n]).join(''), 'ᚠᚢᚾᚳᛏᛡᚾ');

let seed = 0x34c93301;
/** @returns {number} */
function random32() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
}
/** @param {number} n @returns {number} */
const pick = (n) => random32() % n;
/** @returns {number[]} */
function permutation() {
  const out = Array.from({ length: 29 }, (_, i) => i);
  for (let j = 28; j > 0; j--) {
    const k = pick(j + 1);
    [out[j], out[k]] = [out[k], out[j]];
  }
  return out;
}
/**
 * Conjugate the additive rotation x -> x+d by an unknown 29-symbol K.
 * @param {number[]} K
 * @param {number} d
 * @returns {number[]}
 */
function shift(K, d) {
  const inv = Array(29);
  for (let i = 0; i < 29; i++) inv[K[i]] = i;
  return Array.from({ length: 29 }, (_, i) => K[(inv[i] + d) % 29]);
}
/** @returns {number[]} Exactly one zero, and sum steps = 0 modulo 29. */
function schedule() {
  for (;;) {
    const vals = [0, pick(28) + 1, pick(28) + 1, pick(28) + 1];
    const last = (29 - (vals[1] + vals[2] + vals[3]) % 29) % 29;
    if (!last) continue;
    vals.push(last);
    for (let i = 4; i > 0; i--) {
      const j = pick(i + 1);
      [vals[i], vals[j]] = [vals[j], vals[i]];
    }
    assert.equal(vals.reduce((a, b) => a + b, 0) % 29, 0);
    assert.equal(vals.filter((x) => x === 0).length, 1);
    return vals;
  }
}
/** @param {number[][]} source
 * @returns {number[][]} True upstream Quagmire clock-dodge forward encryption.
 */
function clockDodge(source) {
  const K = permutation();
  const offsets = schedule();
  const sigma = shift(permutation(), pick(28) + 1);
  let total = 0;
  const alpha = offsets.map((step) => {
    total = (total + step) % 29;
    return shift(K, total);
  });
  let base = permutation();
  let clock = 0;
  let previous = -1;
  const output = [];
  for (const word of source) {
    const encrypted = [];
    for (const p of word) {
      let c = base[alpha[clock % 5][p]];
      if (c === previous) {
        clock++;
        c = base[alpha[clock % 5][p]];
      }
      encrypted.push(c);
      previous = c;
      clock++;
    }
    output.push(encrypted);
    const phase = (clock - 1) % 5;
    const next = Array(29);
    for (let y = 0; y < 29; y++) {
      next[y] = base[alpha[phase][sigma[y]]];
    }
    base = next;
  }
  return output;
}

/** @param {number[][]} source
 * @returns {{doublets:number,lag5:number,pairs5:number,s5:number,maxS5:number,
 *   lag6:number,affine6fixed:number,affine6max:number,affine6winners:number[][]}}
 */
function metrics(source) {
  let doublets = 0;
  let previous = -1;
  let lag5 = 0;
  let pairs5 = 0;
  let lag6 = 0;
  const hitGlyphs = Array(29).fill(0);
  const pairCounts = Array.from({ length: 29 }, () => Array(29).fill(0));
  for (const word of source) {
    for (let i = 0; i < word.length; i++) {
      const current = word[i];
      if (current === previous) doublets++;
      previous = current;
      if (i >= 5 && current === word[i - 5]) {
        lag5++;
        hitGlyphs[current]++;
        if (i >= 6 && word[i - 1] === word[i - 6]) pairs5++;
      }
      if (i >= 6) {
        if (current === word[i - 6]) lag6++;
        pairCounts[word[i - 6]][current]++;
      }
    }
  }
  let affine6max = -1;
  const affine6winners = [];
  let affine6fixed = -1;
  // All 28*29 invertible GF29 maps, so the selected 24-2*x rule
  // is evaluated against the entire historical affine search family.
  for (let a = 1; a <= 28; a++) for (let b = 0; b < 29; b++) {
    let hits = 0;
    for (let x = 0; x < 29; x++) hits += pairCounts[x][(a * x + b) % 29];
    if (a === 27 && b === 24) affine6fixed = hits;
    if (hits > affine6max) {
      affine6max = hits;
      affine6winners.length = 0;
      affine6winners.push([a, b]);
    } else if (hits === affine6max) {
      affine6winners.push([a, b]);
    }
  }
  return {
    doublets, lag5, pairs5, s5: hitGlyphs[15],
    maxS5: Math.max(...hitGlyphs),
    lag6, affine6fixed, affine6max, affine6winners,
  };
}
const original = metrics(words);
assert.deepEqual(
  Object.fromEntries(['doublets', 'lag5', 'pairs5', 's5', 'lag6', 'affine6fixed', 'affine6max']
    .map((key) => [key, original[key]])),
  { doublets: 86, lag5: 104, pairs5: 9, s5: 11,
    lag6: 32, affine6fixed: 80, affine6max: 80 }
);
assert.deepEqual(original.affine6winners, [[27, 24]]);

const corpusFiles = [
  ['Shakespeare', 'resources/control/shakespeare_first300k.txt'],
  ['Gibran', 'resources/control/gibran_prophet_58585.txt'],
  ['Emerson', 'resources/control/emerson_essays_2944.txt'],
];
const runsPerSource = 1000;
const relevant = ['doublets', 'lag5', 'pairs5', 's5', 'maxS5',
  'lag6', 'affine6fixed', 'affine6max'];
const result = [];
for (const [name, filename] of corpusFiles) {
  const pool = new Map();
  for (const value of read(filename).match(/[A-Za-z]+/g) || []) {
    const word = nativeGP(value);
    if (!pool.has(word.length)) pool.set(word.length, []);
    pool.get(word.length).push(word);
  }
  for (const word of words) assert(pool.get(word.length)?.length,
    name + ': no source-native English word of length ' + word.length);
  const observed = Object.fromEntries(relevant.map((key) => [key, {
    sum: 0, sum2: 0, min: Number.POSITIVE_INFINITY,
    max: Number.NEGATIVE_INFINITY, atLeastOriginal: 0,
    atMostOriginal: 0,
  }]));
  for (let run = 0; run < runsPerSource; run++) {
    const planted = words.map((word) => {
      const options = pool.get(word.length);
      return options[pick(options.length)];
    });
    const cipher = clockDodge(planted);
    assert.equal(cipher.length, words.length);
    const observedOne = metrics(cipher);
    for (const key of relevant) {
      const n = observedOne[key], acc = observed[key];
      acc.sum += n;
      acc.sum2 += n * n;
      acc.min = Math.min(acc.min, n);
      acc.max = Math.max(acc.max, n);
      acc.atLeastOriginal += Number(n >= original[key]);
      acc.atMostOriginal += Number(n <= original[key]);
    }
  }
  const summary = Object.fromEntries(relevant.map((key) => {
    const acc = observed[key];
    const mean = acc.sum / runsPerSource;
    const sd = Math.sqrt(acc.sum2 / runsPerSource - mean ** 2);
    return [key, {
      original: original[key],
      mean: Number(mean.toFixed(4)),
      sd: Number(sd.toFixed(4)),
      min: acc.min,
      max: acc.max,
      upperTailPlusOne: (acc.atLeastOriginal + 1) / (runsPerSource + 1),
      lowerTailPlusOne: (acc.atMostOriginal + 1) / (runsPerSource + 1),
      upperExceedances: acc.atLeastOriginal,
    }];
  }));
  result.push({ corpus: name, plants: runsPerSource, metrics: summary });
}
console.log(JSON.stringify({
  model: 'quagmire_dodge.encipher, cumulative 29-symbol word disk, five-phase exactly-one-zero schedule, nontrivial 29-cycle sigma, one-step doublet dodge',
  rng: 'xorshift32', seed: '0x34c93301',
  originalSource: 'canonical LP2 p0..55, 2896 words, 12956 runes',
  original, simulated: result,
  criterion: 'original six-back winner is unique among 812 invertible affine GF29 maps; plants scan the SAME entire family',
  recoveredUnknownPlaintextRunes: 0,
}, null, 2));

/* In every source group, an authentic keyed clock-dodge plant must demonstrate
 * that ordinary LP2-level doublet suppression is possible. The discriminating
 * original clue is the six-back affine maximum, evaluated familywise.
 * No fixed p threshold is an assert, to keep negative results reproducible.
 */
