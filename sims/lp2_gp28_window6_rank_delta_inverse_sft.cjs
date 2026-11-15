'use strict';

/**
 * Original-LP2 GP28 no-repeat window-six inverse. This is a finite
 * source-motivated candidate, not an identified Cicada cipher.
 *
 * Run: node sims/lp2_gp28_window6_rank_delta_inverse_sft.cjs
 *
 * Hypothesis: each nonrepeat ciphertext step encodes one of 28 ranks
 * R_t = (P_t + P_(t-1) + ... + P_(t-5)) mod 28.
 * Equal steps represent an explicit EA/GP-index28 interruption and do not
 * advance the 28-symbol sum register. At each chapter start the first five
 * rank outputs are unrestricted visible IVs.
 *
 * Subtract consecutive ranks: P_t - P_(t-6) = R_t - R_(t-1) (mod 28).
 * Therefore the 28^5 unknown equivalent states reduce to six independent
 * Caesar shifts and a single modular checksum. Solve the shifts exactly
 * by dynamic programming with one fixed independently sourced English
 * unigram likelihood. Native GP positive plant tests actual key recovery.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const wordfreq = fs.readFileSync(path.join(ROOT, 'resources', 'control', 'english_wordfreq_textblob.txt'), 'utf8');
const runeToIndex = new Map(corpus.translit.map((name, i) => [name, i]));
const GP = [...corpus.translit].sort((a, b) => b.length - a.length);
const mod = (n, x) => ((x % n) + n) % n;
const chapters = [[0, 2], [3, 7], [8, 14], [15, 22], [23, 26], [27, 32], [33, 39], [40, 53], [54, 55]];
const W = 6;

/**
 * @param {string} raw
 * @returns {number[] | null}
 */
function encodeWord(raw) {
  const text = raw.toUpperCase().replace(/QU/g, 'CW').replace(/[KQ]/g, 'C')
    .replace(/V/g, 'U').replace(/Z/g, 'S');
  const out = [];
  for (let i = 0; i < text.length;) {
    const token = GP.find((x) => text.startsWith(x, i));
    if (!token) return null;
    const symbol = runeToIndex.get(token);
    if (symbol === 28) return null;
    out.push(symbol);
    i += token.length;
  }
  return out;
}

/** Pseudocount 0.1 per symbol, training independent of the LP cipher.
 * @returns {Float64Array}
 */
function trainingLogMarginal() {
  const counts = new Float64Array(28).fill(0.1);
  for (const ln of wordfreq.split(/\r?\n/)) {
    const match = /^([a-z]+) (\d+)$/.exec(ln.trim());
    if (!match) continue;
    const ix = encodeWord(match[1]);
    if (!ix) continue;
    const weight = Math.min(100000, Number(match[2]));
    for (const x of ix) counts[x] += weight;
  }
  const total = counts.reduce((a, x) => a + x, 0);
  return Float64Array.from(counts, (x) => Math.log(x / total));
}

/**
 * @param {number[]} ciphertext
 * @returns {{ranks:number[],escapes:number[]}}
 */
function extractRanks(ciphertext) {
  const ranks = [];
  const escapes = [];
  for (let i = 1; i < ciphertext.length; i++) {
    const difference = mod(29, ciphertext[i] - ciphertext[i - 1]);
    if (difference === 0) escapes.push(i);
    else ranks.push(difference - 1);
  }
  return { ranks, escapes };
}

/**
 * @param {number[]} ranks
 * @param {Float64Array} logProb
 * @returns {{plaintext:number[],seed:number[],score:number,ioc:number}}
 */
function inverseRanks(ranks, logProb) {
  assert.ok(ranks.length >= W);
  const off = new Uint8Array(ranks.length);
  for (let i = W; i < ranks.length; i++)
    off[i] = mod(28, off[i - W] + ranks[i] - ranks[i - 1]);

  const scores = Array.from({ length: W }, () => new Float64Array(28));
  for (let i = 0; i < ranks.length; i++)
    for (let key = 0; key < 28; key++) scores[i % W][key] += logProb[(off[i] + key) % 28];

  let dp = new Float64Array(28).fill(-Infinity);
  dp[0] = 0;
  const parent = Array.from({ length: W + 1 }, () => new Int8Array(28));
  for (let j = 0; j < W; j++) {
    const next = new Float64Array(28).fill(-Infinity);
    for (let state = 0; state < 28; state++) {
      for (let key = 0; key < 28; key++) {
        const residue = (state + key) % 28;
        const value = dp[state] + scores[j][key];
        if (value > next[residue]) {
          next[residue] = value;
          parent[j + 1][residue] = key;
        }
      }
    }
    dp = next;
  }
  const seed = new Array(W);
  let residue = ranks[W - 1];
  for (let j = W; j > 0; j--) {
    seed[j - 1] = parent[j][residue];
    residue = mod(28, residue - seed[j - 1]);
  }
  assert.equal(seed.reduce((a, x) => a + x, 0) % 28, ranks[W - 1]);
  const plaintext = Array.from(off, (x, i) => (x + seed[i % W]) % 28);
  let score = 0;
  const counts = new Array(28).fill(0);
  for (const x of plaintext) { score += logProb[x]; counts[x]++; }
  const n = plaintext.length;
  const ioc = counts.reduce((s, x) => s + x * (x - 1), 0) / (n * (n - 1));
  return { plaintext, seed, score: score / n, ioc };
}

/**
 * Re-emit exact ciphertext through the hypothesized forward mechanism,
 * using source-visible first W-1 rank outputs as unconstrained IV.
 *
 * @param {number} firstCipher
 * @param {number[]} rankPlaintext
 * @param {number[]} firstIV
 * @param {number[]} originalEscapes
 * @param {number} outputLength
 * @returns {number[]}
 */
function reemit(firstCipher, rankPlaintext, firstIV, originalEscapes, outputLength) {
  const ivLen = W - 1;
  assert.equal(firstIV.length, ivLen);
  const out = [firstCipher];
  const escapeSet = new Set(originalEscapes);
  let next = 0;
  for (let i = 1; i < outputLength; i++) {
    if (escapeSet.has(i)) { out.push(out[i - 1]); continue; }
    let step = next < ivLen ? firstIV[next] :
      mod(28, rankPlaintext.slice(next + 1 - W, next + 1).reduce((a, x) => a + x, 0));
    out.push(mod(29, out[i - 1] + 1 + step));
    next++;
  }
  assert.equal(next, rankPlaintext.length);
  return out;
}

/** Generate an independently solvable complete GP-native example.
 * @param {number[]} plain - native GP indices including EA escapes
 * @param {number} initialCipher - arbitrary cipher IV rune
 * @returns {number[]}
 */
function forwardPlant(plain, initialCipher) {
  const out = [initialCipher];
  const last = [];
  for (const x of plain) {
    if (x === 28) { out.push(out.at(-1)); continue; }
    last.push(x);
    if (last.length > W) last.shift();
    const rank = mod(28, last.reduce((a, v) => a + v, 0));
    out.push(mod(29, out.at(-1) + 1 + rank));
  }
  return out;
}

const logProb = trainingLogMarginal();
const original = [];
const positives = [];
let runeTotal = 0, escapedTotal = 0, rankTotal = 0;
const solved = corpus.pages.find((p) => p.page === 57).indices;

for (let chapter = 0; chapter < chapters.length; chapter++) {
  const [start, end] = chapters[chapter];
  const ciphertext = corpus.pages.filter((p) => p.page >= start && p.page <= end).flatMap((p) => p.indices);
  const { ranks, escapes } = extractRanks(ciphertext);
  const decoded = inverseRanks(ranks, logProb);
  assert.deepEqual(reemit(ciphertext[0], decoded.plaintext, ranks.slice(0, W - 1),
    escapes, ciphertext.length), ciphertext);
  runeTotal += ciphertext.length;
  escapedTotal += escapes.length;
  rankTotal += ranks.length;
  original.push({ pages: [start, end], runes: ciphertext.length,
    escapes: escapes.length, decodedRankIoC: decoded.ioc, scorePerRune: decoded.score,
    initialRecovered: decoded.plaintext.slice(0, 18).map((x) => corpus.translit[x]).join('-') });

  // Genuine known p57 prose is distinct from these nine original unknown pages.
  // Repeat it only to match source chapter lengths and keep any EA interrupts.
  const native = Array.from({ length: ciphertext.length - 1 }, (_, i) =>
    i % 97 === 63 ? 28 : solved[(i + chapter * 7) % solved.length]);
  const plant = forwardPlant(native, ciphertext[0]);
  assert.equal(plant.length, ciphertext.length);
  const extracted = extractRanks(plant);
  assert.equal(extracted.escapes.length, native.filter((x) => x === 28).length);
  const solvedPlant = inverseRanks(extracted.ranks, logProb);
  assert.deepEqual(reemit(plant[0], solvedPlant.plaintext, extracted.ranks.slice(0, W - 1),
    extracted.escapes, plant.length), plant);
  let i = 0, correct = 0;
  for (const x of native) if (x !== 28) { if (solvedPlant.plaintext[i] === x) correct++; i++; }
  positives.push({ pages: [start, end], nativeRankCount: i, literalEscapes: extracted.escapes.length,
    recovered: correct, fraction: correct / i, rankIoC: solvedPlant.ioc, scorePerRune: solvedPlant.score });
}
assert.equal(runeTotal, 12956);
assert.equal(escapedTotal, 86);
assert.equal(rankTotal, 12861);
const origWeighted = original.reduce((sum, x) => sum + x.scorePerRune * (x.runes - x.escapes - 1), 0) / rankTotal;
const positiveWeighted = positives.reduce((sum, x) => sum + x.scorePerRune * x.nativeRankCount, 0) /
  positives.reduce((sum, x) => sum + x.nativeRankCount, 0);
assert.ok(positives.every((p) => p.fraction > 0.9), 'The heldout genuine solved-prose key recovery must work');
assert.ok(origWeighted < positiveWeighted - 0.4);
console.log(JSON.stringify({
  hypothesis: 'six-position moving GP28 plaintext sum, exact 28-state predecessor-rank with EA doublet escape',
  original, originalWeightedLogPrior: origWeighted, nativeSolvedPagePlants: positives,
  positiveWeightedLogPrior: positiveWeighted,
  conclusion: 'No original unknown-page plaintext: native register likelihood remains poor under all nine source-resets.'
}, null, 2));
