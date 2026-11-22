'use strict';
/**
 * Exact all-secret-alphabet exclusion for a two-square bookend source-pad model.
 *
 * Source geometry: the repeated 3+3-rune bookend ends first at 6561=81^2,
 * leaving 6395=80^2-5 original unsolved LP2 symbols. The 80x80 second
 * image's five unspecified cells are NEVER guessed or scored.
 *
 * Hypothesis under test, for fixed first/second-square dihedral views and
 * one of four 80x80 crops from the first 81x81 square:
 *
 *   P[i] = gamma((alpha(B[i]) + beta(A[i])) mod 29)
 *
 * alpha, beta, gamma are arbitrary independent bijections of all 29 runes.
 * They need not be derived from the first square. For any fixed plaintext
 * symbol, its preimage under gamma is a fixed residue; consequently its
 * occurrence sites correspond exactly to a perfect matching in the 29x29
 * contingency matrix of source A and ciphertext B. A maximum-weight
 * assignment gives the SHARP global occurrence ceiling across every possible
 * secret alphabet, with no fitted language model and no 29! enumeration.
 *
 * Node.js CommonJS, read-only. Run at repository root with:
 *   node sims/bookend_dual_square_allalphabet_capacity.cjs
 *
 * Classification: bounded source-original negative, not a decipherment.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {createHash} = require('node:crypto');

const ROOT = path.join(__dirname, '..');
const read = name => fs.readFileSync(path.join(ROOT, name), 'utf8');
const corpusRaw = read('resources/liber-primus/lp2-corpus.json');
const corpus = JSON.parse(corpusRaw);
const original = corpus.pages.filter(p => p.page <= 55 && p.indices.length)
  .flatMap(p => p.indices);
assert.equal(original.length, 12956);
assert.deepEqual(original.slice(6555, 6561), original.slice(-6));
assert.equal(6561, 81 ** 2);
assert.equal(original.length - 6561, 80 ** 2 - 5);
const FIRST = original.slice(0, 6561);
const SECOND = original.slice(6561);
const N = 80, S = 81, MOD = 29;
assert.equal(FIRST.length, S * S);
assert.equal(SECOND.length, N * N - 5);

/**
 * D4 reading of a square: four rotations and four reflections.
 * @param {number} t orientation 0..7
 * @param {number} r row
 * @param {number} c column
 * @param {number} n width
 * @returns {[number,number]}
 */
function orient(t, r, c, n) {
  switch (t) {
    case 0: return [r, c];
    case 1: return [c, n - 1 - r];
    case 2: return [n - 1 - r, n - 1 - c];
    case 3: return [n - 1 - c, r];
    case 4: return [r, n - 1 - c];
    case 5: return [n - 1 - r, c];
    case 6: return [c, r];
    case 7: return [n - 1 - c, n - 1 - r];
    default: throw new RangeError('bad orientation ' + t);
  }
}

/**
 * Exact maximum-weight perfect assignment by Hungarian minimization.
 * @param {number[][]} weights 29x29 joint appearance counts
 * @returns {{count:number,matching:number[]}}
 */
function maximumMatching(weights) {
  const n = weights.length;
  assert.equal(n, MOD);
  assert.ok(weights.every(row => row.length === n));
  const u = Array(n + 1).fill(0), v = Array(n + 1).fill(0);
  const p = Array(n + 1).fill(0), way = Array(n + 1).fill(0);
  for (let i = 1; i <= n; i++) {
    p[0] = i;
    let j0 = 0;
    const minValue = Array(n + 1).fill(Infinity);
    const used = Array(n + 1).fill(false);
    do {
      used[j0] = true;
      const i0 = p[j0];
      let delta = Infinity, j1 = 0;
      for (let j = 1; j <= n; j++) {
        if (used[j]) continue;
        const cost = -weights[i0 - 1][j - 1] - u[i0] - v[j];
        if (cost < minValue[j]) {
          minValue[j] = cost;
          way[j] = j0;
        }
        if (minValue[j] < delta) {
          delta = minValue[j];
          j1 = j;
        }
      }
      for (let j = 0; j <= n; j++) {
        if (used[j]) {
          u[p[j]] += delta;
          v[j] -= delta;
        } else {
          minValue[j] -= delta;
        }
      }
      j0 = j1;
    } while (p[j0] !== 0);
    do {
      const j1 = way[j0];
      p[j0] = p[j1];
      j0 = j1;
    } while (j0 !== 0);
  }
  const matching = Array(n).fill(-1);
  for (let j = 1; j <= n; j++) matching[p[j] - 1] = j - 1;
  assert.equal(new Set(matching).size, n);
  return {
    count: matching.reduce((total, j, i) => total + weights[i][j], 0),
    matching
  };
}

/** @typedef {{cropRow:number,cropCol:number,firstView:number,secondView:number}} Layout */

/**
 * Construct an exact 29x29 joint histogram from original ciphertext.
 * Each of the 6400 conceptual cells is inspected; the five original
 * nonexistent tail cells are always excluded AFTER the second orientation.
 * @param {number[]} second 6395 physical second-block original runes
 * @param {Layout} layout
 * @returns {number[][]}
 */
function joint(second, layout) {
  const {cropRow, cropCol, firstView, secondView} = layout;
  const counts = Array.from({length: MOD}, () => Array(MOD).fill(0));
  let included = 0;
  for (let display = 0; display < N * N; display++) {
    const row = Math.floor(display / N), col = display % N;
    const [br, bc] = orient(secondView, row, col, N);
    const secondAt = br * N + bc;
    if (secondAt >= second.length) continue;
    const [ar, ac] = orient(firstView, row, col, N);
    const firstAt = (ar + cropRow) * S + ac + cropCol;
    counts[FIRST[firstAt]][second[secondAt]]++;
    included++;
  }
  assert.equal(included, SECOND.length);
  return counts;
}

/**
 * Standard greedy-longest Gematria Primus tokenizer, matching the existing
 * source-native controls. Ordinary source punctuation is not a rune.
 * @param {string} text
 * @returns {number[]}
 */
function encodeGP(text) {
  const lex = corpus.translit.map((token, index) => ({token, index}))
    .sort((a, b) => b.token.length - a.token.length);
  const out = [];
  for (let word of text.toUpperCase().match(/[A-Z]+/g) || []) {
    word = word.replace(/QU/g, 'CW').replace(/V/g, 'U')
      .replace(/K/g, 'C').replace(/Z/g, 'S');
    for (let i = 0; i < word.length;) {
      const found = lex.find(({token}) => word.startsWith(token, i));
      if (found) {
        out.push(found.index);
        i += found.token.length;
      } else i++;
    }
  }
  return out;
}

/**
 * Independent GP prose windows; 1598-symbol stride, no parameter tuning.
 * @param {number[]} source
 */
function controls(source) {
  const every = Math.floor(SECOND.length / 4);
  const rows = [];
  for (let i = 0; i + SECOND.length <= source.length; i += every) {
    const block = source.slice(i, i + SECOND.length);
    const hist = Array(MOD).fill(0);
    for (const rune of block) hist[rune]++;
    rows.push({eCount: hist[18], maxRuneCount: Math.max(...hist)});
  }
  assert.ok(rows.length);
  return {
    gpRunes: source.length, windows: rows.length,
    minimumE: Math.min(...rows.map(x => x.eCount)),
    minimumMostFrequentRune: Math.min(...rows.map(x => x.maxRuneCount))
  };
}

/** @param {number} seed */
function random32(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}

/** @param {() => number} next */
function permutation(next) {
  const p = Array.from({length: MOD}, (_, i) => i);
  for (let i = MOD - 1; i > 0; i--) {
    const j = next() % (i + 1);
    [p[i], p[j]] = [p[j], p[i]];
  }
  return p;
}

/**
 * Source-blind native GP plant with three hidden independent 29! alphabets.
 * Encode with the actual first 81^2 ciphertext acting as source key, then
 * decode with planted secrets and verify the all-key ceiling is achievable
 * above the original genuine-prose frequency.
 * @param {number[]} source
 */
function plant(source) {
  const expected = source.slice(-SECOND.length);
  assert.equal(expected.length, SECOND.length);
  const layout = {cropRow: 1, cropCol: 0, firstView: 0, secondView: 3};
  const next = random32(0x11c33015);
  const alpha = permutation(next), beta = permutation(next), gamma = permutation(next);
  const invAlpha = Array(MOD), invGamma = Array(MOD);
  for (let i = 0; i < MOD; i++) {
    invAlpha[alpha[i]] = i;
    invGamma[gamma[i]] = i;
  }
  const ciphertext = Array(SECOND.length).fill(-1);
  let recovered = 0;
  for (let display = 0; display < N * N; display++) {
    const r = Math.floor(display / N), c = display % N;
    const [br, bc] = orient(layout.secondView, r, c, N);
    const secondAt = br * N + bc;
    if (secondAt >= SECOND.length) continue;
    const [ar, ac] = orient(layout.firstView, r, c, N);
    const key = FIRST[(ar + layout.cropRow) * S + ac + layout.cropCol];
    const x = (invGamma[expected[secondAt]] - beta[key] + MOD) % MOD;
    ciphertext[secondAt] = invAlpha[x];
    const decoded = gamma[(alpha[ciphertext[secondAt]] + beta[key]) % MOD];
    recovered += Number(decoded === expected[secondAt]);
  }
  assert.ok(ciphertext.every(r => r >= 0 && r < MOD));
  assert.equal(recovered, SECOND.length);
  const best = maximumMatching(joint(ciphertext, layout));
  const h = Array(MOD).fill(0);
  for (const x of expected) h[x]++;
  assert.ok(best.count >= Math.max(...h),
    'all-alphabet capacity must accept the native GP plant');
  return {
    layout, exactRecoveredRunes: recovered,
    matchingUpperBound: best.count,
    truePlaintextE: h[18],
    truePlaintextMostFrequent: Math.max(...h)
  };
}

/** Complete original-source 256-layout test and independent controls. */
function run() {
  const variants = [];
  for (let cropRow = 0; cropRow < 2; cropRow++)
    for (let cropCol = 0; cropCol < 2; cropCol++)
      for (let firstView = 0; firstView < 8; firstView++)
        for (let secondView = 0; secondView < 8; secondView++) {
          const layout = {cropRow, cropCol, firstView, secondView};
          variants.push({...layout, maxAnySingleRune: maximumMatching(joint(SECOND, layout)).count});
        }
  variants.sort((a, b) => b.maxAnySingleRune - a.maxAnySingleRune);
  assert.equal(variants.length, 256);
  assert.equal(variants[0].maxAnySingleRune, 395);
  const sha = createHash('sha256').update(corpusRaw).digest('hex');
  const shakespeare = encodeGP(read('resources/control/shakespeare_first300k.txt'));
  const gibran = encodeGP(read('resources/control/gibran_prophet_58585.txt'));
  const native = {
    Shakespeare: controls(shakespeare),
    Gibran: controls(gibran)
  };
  assert.equal(native.Shakespeare.windows, 133);
  assert.equal(native.Gibran.windows, 36);
  assert.equal(native.Shakespeare.minimumE, 657);
  assert.equal(native.Gibran.minimumE, 676);
  const planted = plant(shakespeare);
  return {
    source: 'LP2 0..55; global 0..6560 source, 6561..12955 target',
    sourceCorpusSha256: sha,
    originalCipherRunes: original.length,
    sourceSquare: [81, 81],
    targetPrintedRunes: SECOND.length,
    squareMissingTail: 5,
    originalViews: variants.length,
    maximumPossibleRuneCopies: variants[0].maxAnySingleRune,
    upperFraction: variants[0].maxAnySingleRune / SECOND.length,
    best: variants.slice(0, 8),
    worstBound: variants.at(-1),
    nativeControls: native,
    minimumOutputOverridesForShakespeareFloor:
      native.Shakespeare.minimumE - variants[0].maxAnySingleRune,
    positive: planted,
    interpretation: 'Exact conditional exclusion of native GP-English under static alphabet-permuted additive combination of these two square source blocks. No plaintext/key; no claim that square framing is authentic. Position-changing alphabets and intermediate binary codes remain open.'
  };
}

if (require.main === module) console.log(JSON.stringify(run(), null, 2));
module.exports = {orient, maximumMatching, joint, encodeGP, controls, plant, run};
