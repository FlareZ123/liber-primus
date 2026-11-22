'use strict';

/**
 * Original-LP2 GP28 no-repeat window-five/six inverse. This is a finite
 * source-motivated candidate, not an identified Cicada cipher.
 *
 * Run: node sims/lp2_gp28_window6_rank_delta_inverse_sft.cjs
 *
 * Hypothesis: each nonrepeat ciphertext step encodes one of 28 ranks,
 * R_t = sum of the last W plaintext GP28 ranks mod28, W=5 or W=6.
 * Equal steps represent a proposed literal interrupt, either EA/index28
 * (free-form control) or F/index0 (motivated by the solved LP1/p56 F rule),
 * and do not advance the 28-symbol sum register. Normal ranks retain the
 * other 28 rune symbols in their canonical GP order. At each chapter start the first five
 * rank outputs are unrestricted visible IVs.
 *
 * Subtract consecutive ranks: P_t - P_(t-W) = R_t - R_(t-1) (mod 28).
 * Therefore the 28^(W-1) unknown equivalent states reduce to W independent
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
let W = 6;

/**
 * @param {string} raw
 * @param {number} sentinel - excluded GP29 index, either 0 or 28
 * @returns {number[] | null}
 */
function encodeWord(raw, sentinel) {
  const text = raw.toUpperCase().replace(/QU/g, 'CW').replace(/[KQ]/g, 'C')
    .replace(/V/g, 'U').replace(/Z/g, 'S');
  const out = [];
  for (let i = 0; i < text.length;) {
    const token = GP.find((x) => text.startsWith(x, i));
    if (!token) return null;
    const symbol = runeToIndex.get(token);
    if (symbol === sentinel) return null;
    out.push(symbol < sentinel ? symbol : symbol - 1);
    i += token.length;
  }
  return out;
}

/** Pseudocount 0.1 per symbol, training independent of the LP cipher.
 * @param {number} sentinel - excluded GP29 plaintext index
 * @returns {Float64Array}
 */
function trainingLogMarginal(sentinel) {
  const counts = new Float64Array(28).fill(0.1);
  for (const ln of wordfreq.split(/\r?\n/)) {
    const match = /^([a-z]+) (\d+)$/.exec(ln.trim());
    if (!match) continue;
    const ix = encodeWord(match[1], sentinel);
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
 * @param {number} sentinel - literal nonclocking plaintext index
 * @returns {number[]}
 */
function forwardPlant(plain, initialCipher, sentinel) {
  const out = [initialCipher];
  const last = [];
  for (const x of plain) {
    if (x === sentinel) { out.push(out.at(-1)); continue; }
    last.push(x < sentinel ? x : x - 1);
    if (last.length > W) last.shift();
    const rank = mod(28, last.reduce((a, v) => a + v, 0));
    out.push(mod(29, out.at(-1) + 1 + rank));
  }
  return out;
}

const solved = corpus.pages.find((p) => p.page === 57).indices;
const modes = [
  { sentinel: 28, label: 'EA sentinel (no authorial operation selected)' },
  { sentinel: 0, label: 'F sentinel (LP1/p56 historical interrupt candidate)' }
];
const results = [];
for (const width of [5, 6]) {
W = width;
for (const { sentinel, label } of modes) {
  const logProb = trainingLogMarginal(sentinel);
  const original = [], positives = [];
  let runeTotal = 0, escapedTotal = 0, rankTotal = 0;

  for (let chapter = 0; chapter < chapters.length; chapter++) {
    const [start, end] = chapters[chapter];
    const ciphertext = corpus.pages.filter((p) => p.page >= start && p.page <= end)
      .flatMap((p) => p.indices);
    const { ranks, escapes } = extractRanks(ciphertext);
    const decoded = inverseRanks(ranks, logProb);
    assert.deepEqual(reemit(ciphertext[0], decoded.plaintext, ranks.slice(0, W - 1),
      escapes, ciphertext.length), ciphertext);
    runeTotal += ciphertext.length;
    escapedTotal += escapes.length;
    rankTotal += ranks.length;
    original.push({ pages: [start, end], runes: ciphertext.length,
      escapes: escapes.length, decodedRankIoC: decoded.ioc, scorePerRune: decoded.score,
      initialRecovered: decoded.plaintext.slice(0, 18)
        .map((x) => corpus.translit[x < sentinel ? x : x + 1]).join('-') });

    // Actual solved p57 rune prose, with deterministic explicit escape
    // insertions; for the F control, occasional EA tests rank 27 recovery.
    const native = Array.from({ length: ciphertext.length - 1 }, (_, i) => {
      if (i % 97 === 63) return sentinel;
      if (sentinel === 0 && i % 101 === 7) return 28;
      return solved[(i + chapter * 7) % solved.length];
    });
    const plant = forwardPlant(native, ciphertext[0], sentinel);
    assert.equal(plant.length, ciphertext.length);
    const extracted = extractRanks(plant);
    assert.equal(extracted.escapes.length, native.filter((x) => x === sentinel).length);
    const solvedPlant = inverseRanks(extracted.ranks, logProb);
    assert.deepEqual(reemit(plant[0], solvedPlant.plaintext, extracted.ranks.slice(0, W - 1),
      extracted.escapes, plant.length), plant);
    let i = 0, correct = 0;
    for (const x of native) if (x !== sentinel) {
      const rank = x < sentinel ? x : x - 1;
      if (solvedPlant.plaintext[i] === rank) correct++;
      i++;
    }
    positives.push({ pages: [start, end], nativeRankCount: i,
      literalEscapes: extracted.escapes.length, recovered: correct, fraction: correct / i,
      rankIoC: solvedPlant.ioc, scorePerRune: solvedPlant.score });
  }
  assert.equal(runeTotal, 12956);
  assert.equal(escapedTotal, 86);
  assert.equal(rankTotal, 12861);
  const origWeighted = original.reduce((sum, x) =>
    sum + x.scorePerRune * (x.runes - x.escapes - 1), 0) / rankTotal;
  const positiveWeighted = positives.reduce((sum, x) =>
    sum + x.scorePerRune * x.nativeRankCount, 0) /
    positives.reduce((sum, x) => sum + x.nativeRankCount, 0);
  assert.ok(positives.every((p) => p.fraction > 0.99),
    'Heldout genuine solved-prose key recovery must work');
  assert.ok(origWeighted < positiveWeighted - 0.4);
  // The original five-dot stencil at the END of p7 and START of p23
  // independently delimits physical pp8..22. Unlike the nine visual chapter
  // clocks, this is a single unbroken 3,632-rune source-selected interval.
  const dotSource = corpus.pages.filter((p) => p.page >= 8 && p.page <= 22)
    .flatMap((p) => p.indices);
  assert.equal(dotSource.length, 3632);
  const dottedRegions = [];
  for (const direction of ['forward', 'reverse']) {
    const dotCipher = direction === 'forward' ? dotSource : [...dotSource].reverse();
  const dotRanks = extractRanks(dotCipher);
  const dotInverse = inverseRanks(dotRanks.ranks, logProb);
  assert.deepEqual(reemit(dotCipher[0], dotInverse.plaintext,
    dotRanks.ranks.slice(0, W - 1), dotRanks.escapes, dotCipher.length), dotCipher);
  const dotNative = Array.from({ length: dotCipher.length - 1 }, (_, i) => {
    if (i % 97 === 63) return sentinel;
    if (sentinel === 0 && i % 101 === 7) return 28;
    return solved[(i + 23) % solved.length];
  });
  const dotPlant = forwardPlant(dotNative, dotCipher[0], sentinel);
  const dotExtract = extractRanks(dotPlant);
  const dotRecovered = inverseRanks(dotExtract.ranks, logProb);
  assert.deepEqual(reemit(dotPlant[0], dotRecovered.plaintext,
    dotExtract.ranks.slice(0, W - 1), dotExtract.escapes, dotPlant.length), dotPlant);
  let dotIdx = 0, dotCorrect = 0;
  for (const x of dotNative) if (x !== sentinel) {
    const rank = x < sentinel ? x : x - 1;
    if (dotRecovered.plaintext[dotIdx] === rank) dotCorrect++;
    dotIdx++;
  }
  assert.equal(dotCorrect, dotIdx);
  dottedRegions.push({
    direction,
    pages: [8, 22], runes: dotCipher.length,
    originalNonrepeatRankCount: dotRanks.ranks.length, originalEscapes: dotRanks.escapes.length,
    originalIoC: dotInverse.ioc, originalScorePerRune: dotInverse.score,
    recoveredNative: dotCorrect, nativeRankCount: dotIdx,
    nativeEscapes: dotExtract.escapes.length, nativeScorePerRune: dotRecovered.score,
    initialOriginal: dotInverse.plaintext.slice(0, 18)
      .map((x) => corpus.translit[x < sentinel ? x : x + 1]).join('-')
  });
  }
  results.push({
    width, label, literalPlaintextSentinel: corpus.translit[sentinel], dottedRegions, original,
    originalWeightedLogPrior: origWeighted, nativeSolvedPagePlants: positives,
    positiveWeightedLogPrior: positiveWeighted
  });
}
}
console.log(JSON.stringify({
  hypothesis: 'exact five-/six-position GP28 rolling plaintext sum with original 29-way successor rank and one literal escape',
  models: results, conclusion: 'Neither 5 nor 6 positions and neither historically motivated F nor EA sentinel recovers original unknown plaintext.'
}, null, 2));
