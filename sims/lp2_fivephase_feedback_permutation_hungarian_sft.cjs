'use strict';
/**
 * Original-LP2 GP29 five-phase ciphertext-feedback permutation decoder.
 *
 * Frozen reversible architecture: C[i] = permutation[i % 5][
 *   (P[i] + C[i - 1]) % 29
 * ], with C[-1] = 0. Every one of the five 29-entry phase permutations is
 * independently secret. This is intentionally an exploratory architecture;
 * the original Cicada material does not authenticate its transition.
 *
 * Recover all five secret inverse permutations with a 29x29 Hungarian
 * maximum-likelihood matching per phase. Training requires only ciphertext
 * and fixed Shakespeare GP29 unigram probabilities, never known plaintext.
 * Test withheld native-language and original-LP2 intervals without refitting.
 *
 * Run: node sims/lp2_fivephase_feedback_permutation_hungarian_sft.cjs
 * Windows 11 / Node 22 / CommonJS builtins / source-read-only.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} name @returns {string} */
function read(name) {
  return fs.readFileSync(path.join(root, name), 'utf8');
}
const source = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const GP = source.translit.map(token => token.toUpperCase());
const byToken = new Map(GP.map((token, i) => [token, i]));
assert.equal(GP.length, 29);
/** @param {string} text @returns {number[]} */
function toGP(text) {
  const words = text.toUpperCase().replace(/V/g, 'U').replace(/K/g, 'C')
    .replace(/Q/g, 'C').replace(/Z/g, 'S').match(/[A-Z]+/g) || [];
  const runes = [];
  for (const word of words) {
    for (let i = 0; i < word.length;) {
      let token = '';
      for (const candidate of ['ING', 'TH', 'NG', 'EO', 'OE', 'AE', 'IA', 'EA']) {
        if (word.startsWith(candidate, i)) {
          token = candidate === 'ING' ? 'NG' : candidate;
          i += candidate.length;
          break;
        }
      }
      if (!token) token = word[i++];
      const code = byToken.get(token);
      if (code !== undefined) runes.push(code);
    }
  }
  return runes;
}
const shakespeare = toGP(read('resources/control/shakespeare_first300k.txt'));
const frequencies = Array(29).fill(1);
for (const symbol of shakespeare) frequencies[symbol]++;
const logPrior = frequencies.map(n => Math.log(n / (shakespeare.length + 29)));
/**
 * Hungarian algorithm, minimum-cost 29x29 assignment.
 * The result maps row index (ciphertext output) to column index (precursor).
 * @param {number[][]} a @returns {number[]}
 */
function assignment(a) {
  const n = a.length;
  const u = Array(n + 1).fill(0);
  const v = Array(n + 1).fill(0);
  const p = Array(n + 1).fill(0);
  const way = Array(n + 1).fill(0);
  for (let i = 1; i <= n; i++) {
    p[0] = i;
    let j0 = 0;
    const best = Array(n + 1).fill(Infinity);
    const used = Array(n + 1).fill(false);
    do {
      used[j0] = true;
      const i0 = p[j0];
      let delta = Infinity;
      let j1 = 0;
      for (let j = 1; j <= n; j++) {
        if (used[j]) continue;
        const reduced = a[i0 - 1][j - 1] - u[i0] - v[j];
        if (reduced < best[j]) {
          best[j] = reduced;
          way[j] = j0;
        }
        if (best[j] < delta) {
          delta = best[j];
          j1 = j;
        }
      }
      for (let j = 0; j <= n; j++) {
        if (used[j]) {
          u[p[j]] += delta;
          v[j] -= delta;
        } else best[j] -= delta;
      }
      j0 = j1;
    } while (p[j0] !== 0);
    do {
      const j1 = way[j0];
      p[j0] = p[j1];
      j0 = j1;
    } while (j0 !== 0);
  }
  const result = Array(n);
  for (let j = 1; j <= n; j++) result[p[j] - 1] = j - 1;
  assert.equal(new Set(result).size, n);
  return result;
}
/**
 * @param {number[]} cipher @param {number} trainEnd
 * @param {number} phases @returns {number[][]}
 */
function recover(cipher, trainEnd, phases) {
  const counts = Array.from({length: phases},
    () => Array.from({length: 29}, () => Array(29).fill(0)));
  for (let i = 1; i < trainEnd; i++) {
    counts[i % phases][cipher[i]][cipher[i - 1]]++;
  }
  return counts.map(rows => assignment(rows.map(previousHistogram =>
    Array.from({length: 29}, (_, precursor) =>
      -previousHistogram.reduce((sum, count, previous) =>
        sum + count * logPrior[(precursor - previous + 29) % 29], 0)))));
}
/** @param {number[]} cipher @param {number[][]} key
 *  @param {number} start @param {number} end @returns {number[]} */
function decode(cipher, key, start, end) {
  return Array.from({length: end - start}, (_, j) => {
    const i = start + j;
    return (key[i % key.length][cipher[i]] - cipher[i - 1] + 29) % 29;
  });
}
/** @param {number[]} runes @returns {{n:number,ioc:number,avgLog:number,top1:number}} */
function stats(runes) {
  const histogram = Array(29).fill(0);
  let log = 0;
  for (const value of runes) {
    histogram[value]++;
    log += logPrior[value];
  }
  const n = runes.length;
  return {n, ioc: histogram.reduce((s, f) => s + f * (f - 1), 0) /
    (n * (n - 1)), avgLog: log / n, top1: Math.max(...histogram) / n};
}
const phases = 5;
const known = toGP(read('resources/control/gibran_prophet_58585.txt')).slice(0, 12000);
assert.equal(known.length, 12000);
let seed = 0x33012014;
/** @returns {number} */
function rand() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
}
const secret = Array.from({length: phases}, () => {
  const row = Array.from({length: 29}, (_, i) => i);
  for (let i = 28; i > 0; i--) {
    const j = rand() % (i + 1);
    [row[i], row[j]] = [row[j], row[i]];
  }
  return row;
});
const solvedP57 = source.pages.find(page => page.page === 57).indices;
assert.equal(solvedP57.length, 95);
const plantPlain = known.concat(solvedP57);
const plantCipher = [];
for (let i = 0; i < plantPlain.length; i++) {
  const previous = i ? plantCipher[i - 1] : 0;
  plantCipher.push(secret[i % phases][(plantPlain[i] + previous) % 29]);
}
const plantKey = recover(plantCipher, 9000, phases);
let correctKeySlots = 0;
for (let phase = 0; phase < phases; phase++) {
  for (let symbol = 0; symbol < 29; symbol++) {
    correctKeySlots += Number(secret[phase][plantKey[phase][symbol]] === symbol);
  }
}
assert.equal(correctKeySlots, 145);
const plantHoldout = decode(plantCipher, plantKey, 9000, plantPlain.length);
assert.deepEqual(plantHoldout, plantPlain.slice(9000));
const plantedSolved = plantHoldout.slice(-95);
assert.deepEqual(plantedSolved, solvedP57);

const pages = source.pages.filter(page =>
  page.status === 'unsolved' && page.indices.length > 0);
const real = pages.flatMap(page => page.indices);
assert.equal(real.length, 12956);
const trainEnd = pages.filter(page => page.page < 40)
  .reduce((sum, page) => sum + page.indices.length, 0);
assert.equal(trainEnd, 9640);
const realKey = recover(real, trainEnd, phases);
const realTrain = decode(real, realKey, 1, trainEnd);
const realHoldout = decode(real, realKey, trainEnd, real.length);
const originalStats = stats(realHoldout);
assert.equal(realHoldout.length, 3316);
// A native GP29 text has IoC ~0.06 under this tokenizer. The unchanged
// original holdout remains near 1/29; no decipherment has been identified.
assert.ok(originalStats.ioc < 0.045);
console.log(JSON.stringify({
  status: 'Bounded negative: five-phase unknown-permutation feedback has no ' +
    'native-GP plaintext on independent original holdout',
  model: 'C[i]=permutation[i%5][(P[i]+C[i-1])%29]',
  trainedOn: 'original LP2 p0-p39',
  heldout: 'original LP2 p40-p55, all 3316 runes',
  sourcePriorRunes: shakespeare.length,
  positive: {secretKeyEntriesRecovered: correctKeySlots,
    keyEntries: 145, GPPlaintextRecovered: plantHoldout.length,
    exactNativeP57Plant: plantedSolved.length,
    statistics: stats(plantHoldout)},
  original: {train: stats(realTrain), holdout: originalStats,
    uniformBaselineAvgLog: logPrior.reduce((a, b) => a + b, 0) / 29},
  sourceNative: {gibranHeldout: stats(plantPlain.slice(9000, 12000)),
    shakespeare: stats(shakespeare.slice(3000, 6000))},
  originalHoldoutStart: realHoldout.slice(0, 80).map(i => GP[i]).join(' ')
}, null, 2));
