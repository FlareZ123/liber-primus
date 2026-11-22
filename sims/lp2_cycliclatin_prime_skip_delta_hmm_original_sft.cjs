'use strict';

/**
 * Source-pinned ciphertext-only test of a hidden-skip cyclic/Latin GP29 table.
 *
 * Hypothetical encoder at each rune i:
 *  B_i = pi(P_i), C_i = B_i + phi(prime_{i+drift}) (mod 29).
 *  If an attempted emission repeats the immediately preceding C, reject
 *  with probability q=.81, consuming an extra prime key and retrying.
 *  pi is ANY fixed unknown GP29 permutation. Every source-native synthetic
 *  positive uses a fresh random secret pi withheld from this decoder.
 *
 * The crucial key-independent identity: if the first output of a rune is
 * rejected, the accepted ciphertext delta equals the difference between
 * successive key rows. Thus a drift HMM can score C without knowing P or pi.
 * This is a conditional mechanistic test, not an assertion that LP2 uses H2.
 *
 * Read-only, Windows Node.js 22/CommonJS, no external dependencies.
 * Usage: node sims/lp2_cycliclatin_prime_skip_delta_hmm_original_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');

/** @param {string} file @returns {string} */
function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const source = read('resources/control/gibran_prophet_58585.txt');
const Q = 0.81;
const M = 29;
const lengths = [729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308];
assert.equal(lengths.reduce((a, b) => a + b, 0), 12956);
const original = gp.pages.filter(p => p.page <= 55 && p.indices.length)
  .flatMap(p => p.indices);
assert.equal(original.length, 12956);

/** Generate the authentic phi(prime) key rows, modulo 29. */
function phiPrimeKey() {
  const sieve = new Uint8Array(180000);
  const key = [];
  for (let p = 2; p < sieve.length; p++) {
    if (sieve[p]) continue;
    key.push((p - 1) % M);
    if (p * p < sieve.length)
      for (let j = p * p; j < sieve.length; j += p) sieve[j] = 1;
  }
  assert(key.length > 13900);
  return key;
}
const key = phiPrimeKey();
const tokens = gp.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);

/** Native source GP29 transliteration, with the ING/IO multi-rune spelling. */
function encodeWord(value) {
  const s = value.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const out = [];
  for (let i = 0; i < s.length;) {
    if (s.startsWith('ING', i)) {
      out.push(21);
      i += 3;
    } else {
      const token = tokens.find(t => s.startsWith(t.s, i));
      assert(token, 'Unmapped reference word ' + s);
      out.push(token.i);
      i += token.s.length;
    }
  }
  return out;
}
const book = source.split('*** START OF').at(-1)
  .split('*** END OF')[0];
const native = (book.match(/[A-Za-z]+/g) || []).flatMap(encodeWord);
assert(native.length > 45000);

/** @param {number} seed @returns {()=>number} */
function random(seed) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

/** @param {()=>number} draw @returns {number[]} */
function hiddenPermutation(draw) {
  const arr = Array.from({length: M}, (_, i) => i);
  for (let i = M - 1; i > 0; i--) {
    const j = Math.floor(draw() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  assert.equal(new Set(arr).size, M);
  return arr;
}

/** Plant a cyclic table ciphertext without passing the secret pi to scoring. */
function encrypt(plain, draw, pi) {
  const cipher = [];
  let drift = 0;
  for (let i = 0; i < plain.length; i++) {
    const b = pi[plain[i]];
    let out = (b + key[i + drift]) % M;
    if (i) {
      while (out === cipher[i - 1] && draw() < Q) {
        drift++;
        out = (b + key[i + drift]) % M;
      }
    }
    cipher.push(out);
  }
  return {cipher, drift};
}

/** Null has the same single-rune repeat probability as the model. */
function nullCipher(n, draw) {
  const cipher = [Math.floor(draw() * M)];
  for (let i = 1; i < n; i++) {
    const delta = draw() < (1 - Q) / M
      ? 0 : 1 + Math.floor(draw() * (M - 1));
    cipher.push((cipher[i - 1] + delta) % M);
  }
  return cipher;
}

/**
 * Forward HMM marginal likelihood ratio vs a stationary difference-null.
 * Hidden drift is number of rejected key advances. The first emitted rune
 * initializes the key without prior collision testing.
 * For each drift z and attempt m, a rejected output must match the previous
 * ciphertext. In the cyclic table this is exactly an observable delta
 * equality involving only key[j+m] - key[j], not the secret pi or P.
 *
 * @param {number[]} cipher
 * @returns {number}
 */
function logRatio(cipher) {
  const cap = Math.floor(cipher.length * 0.065) + 50;
  let before = new Float64Array(cap + 1);
  const after = new Float64Array(cap + 1);
  before[0] = 1;
  let score = 0;
  for (let i = 1; i < cipher.length; i++) {
    const delta = (cipher[i] + M - cipher[i - 1]) % M;
    after.fill(0);
    for (let drift = 0; drift <= cap; drift++) {
      const weight = before[drift];
      if (!weight) continue;
      const j = i + drift;
      after[drift] += weight * (delta === 0 ? (1 - Q) / M : 1 / M);
      let skipped = Q;
      for (let attempts = 1; attempts <= 4 && drift + attempts <= cap;
        attempts++) {
        const shift = (key[j + attempts] + M - key[j]) % M;
        if (shift === 0) {
          if (delta === 0)
            after[drift + attempts] += weight * skipped * (1 - Q) / M;
        } else {
          if (delta === shift)
            after[drift + attempts] += weight * skipped / M;
          break;
        }
        skipped *= Q;
      }
    }
    let norm = 0;
    for (const value of after) norm += value;
    assert(norm > 0, 'HMM probability underflow');
    const nullProbability = delta === 0 ? (1 - Q) / M
      : (M - 1 + Q) / (M * (M - 1));
    score += Math.log(norm) - Math.log(nullProbability);
    for (let d = 0; d < before.length; d++)
      before[d] = after[d] / norm;
  }
  return score;
}

/** @param {number[]} a */
function stats(a) {
  return {
    min: +Math.min(...a).toFixed(4),
    mean: +(a.reduce((x, y) => x + y, 0) / a.length).toFixed(4),
    max: +Math.max(...a).toFixed(4)
  };
}

const originalScores = [];
let offset = 0;
for (const len of lengths) {
  originalScores.push(logRatio(original.slice(offset, offset + len)));
  offset += len;
}
const originalTotal = originalScores.reduce((a, b) => a + b, 0);
const positiveScores = [];
const nullScores = [];
const positiveP40 = [];
const nullP40 = [];
const hiddenSkips = [];
for (let test = 1; test <= 50; test++) {
  const draw = random(test * 43205 + 967);
  const pi = hiddenPermutation(draw);
  const start = (test * 677) % (native.length - 12957);
  const manuscript = native.slice(start, start + 12956);
  let i = 0, sumPositive = 0, sumNull = 0, nSkips = 0;
  for (let section = 0; section < lengths.length; section++) {
    const len = lengths[section];
    const planted = encrypt(manuscript.slice(i, i + len), draw, pi);
    const decoy = nullCipher(len, draw);
    const p = logRatio(planted.cipher);
    const n = logRatio(decoy);
    sumPositive += p;
    sumNull += n;
    nSkips += planted.drift;
    if (section === 7) {
      positiveP40.push(p);
      nullP40.push(n);
    }
    i += len;
  }
  positiveScores.push(sumPositive);
  nullScores.push(sumNull);
  hiddenSkips.push(nSkips);
}
assert.equal(originalScores.length, 9);
assert.equal(positiveScores.length, 50);
assert.equal(nullScores.length, 50);

console.log(JSON.stringify({
  model: 'cyclic Latin GP29, phi(prime) row, q=0.81 repeat reject',
  scope: 'nine physical red-heading chapters, prime clock resets at each',
  originalN: original.length,
  nativeReferenceRunes: native.length,
  originalPerChapter: originalScores.map(x => +x.toFixed(4)),
  originalTotal: +originalTotal.toFixed(4),
  plantedNativeEnglishSecretPi: stats(positiveScores),
  matchedDifferenceNull: stats(nullScores),
  heldoutP40SourceP: +originalScores[7].toFixed(4),
  heldoutP40Planted: stats(positiveP40),
  heldoutP40Null: stats(nullP40),
  plantedHiddenSkips: stats(hiddenSkips),
  positiveScoresAtOrBelowOriginal: positiveScores.filter(x => x <= originalTotal).length,
  nullScoresAtOrBelowOriginal: nullScores.filter(x => x <= originalTotal).length,
  trials: 50
}, null, 2));
