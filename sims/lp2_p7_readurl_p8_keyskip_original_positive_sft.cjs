'use strict';
/**
 * Original LP2 p7 red-five-word -> historical 2014 Stage10 fifth-power
 * READURL readout -> p8 original 255/243-rune receiver.
 *
 * All six literal keyword phases, both historical GP29 additive signs,
 * source-visible red-heading boundary and source-p56 F-passthrough option
 * are decoded with a key-skip-aware English-quadgram beam. Unlike rigid
 * alignment, the beam consumes a key symbol when a candidate would repeat
 * the previous ciphertext rune, so it can recover a genuinely encoded
 * original-layout signal even after unknown key-position drift.
 *
 * The actual LP2 anti-repeat mechanism and READURL-key role are hypotheses.
 * A negative here excludes a bounded direct key-skip reader, not an OTP.
 *
 * Read-only Windows 11 / Node22 / CommonJS:
 * node sims/lp2_p7_readurl_p8_keyskip_original_positive_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
/** @param {string} name @returns {string} */
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const c = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const originalSquares = read('resources/cicada2014-openpuff-magic-squares.txt')
  .trim().split(/\r?\n\s*\r?\n/u)
  .map(block => block.trim().split(/\r?\n/u)
    .map(line => line.trim().split(/\s+/u).map(Number)));
const mod = x => (x % 29 + 29) % 29;
assert.deepEqual(originalSquares.map(x => x.length), [5, 7, 5]);
/** @param {number[][]} a @param {number[][]} b */
function matrixProduct(a, b) {
  return a.map(row => b[0].map((_, j) =>
    mod(row.reduce((sum, x, k) => sum + x * b[k][j], 0))));
}
/** @param {number[][]} matrix @param {number} n */
function power(matrix, n) {
  let out = matrix.map((row, i) =>
    row.map((_, j) => Number(i === j)));
  for (let j = 0; j < n; j++) out = matrixProduct(out, matrix);
  return out;
}
/** @param {number[][]} matrix @param {number[]} vector */
function apply(matrix, vector) {
  return matrix.map(row => mod(row.reduce(
    (sum, value, j) => sum + value * vector[j], 0)));
}

// The p7 original last five complete red rune words have lengths 2,4,3,2,3.
// Preserve their source order, rune values, and product arithmetic.
const red = c.pages[7].indices.slice(194);
const lengths = [2, 4, 3, 2, 3];
assert.equal(red.length, 14);
let pos = 0;
const products = lengths.map(n => {
  const out = red.slice(pos, pos + n).reduce(
    (acc, value) => mod(acc * value), 1);
  pos += n;
  return out;
});
assert.deepEqual(products, [11, 26, 8, 15, 2]);
const A5 = apply(power(originalSquares[0], 5), products);
const B5 = apply(power(originalSquares[2], 5), products);
const keyword = [...A5.slice(2), ...B5.slice(0, 3)];
const literal = runeArray => runeArray.map(i => c.translit[i]).join('');
assert.deepEqual(A5, [13, 18, 4, 28, 23]);
assert.deepEqual(B5, [1, 4, 20, 14, 21]);
assert.deepEqual(keyword, [4, 28, 23, 1, 4, 20]);
assert.equal(literal(keyword), 'READURL');
assert.equal(c.pages[8].indices.length, 255);
assert.equal(c.pages[57].indices.length, 95);

const counts = new Map();
let totalCounts = 0;
for (const line of read('resources/control/dukotah_english_quadgrams.txt')
  .split(/\r?\n/u)) {
  const [four, raw] = line.trim().split(/\s+/u);
  const count = Number(raw);
  if (four?.length !== 4 || !Number.isFinite(count)) continue;
  counts.set(four, count);
  totalCounts += count;
}
assert.equal(counts.size, 79495);
const scores = new Map([...counts].map(
  ([four, n]) => [four, Math.log10(n / totalCounts)]));
const floorScore = Math.log10(0.01 / totalCounts);
const gpLetters = c.translit.map(x => x.toUpperCase());

/**
 * Incremental Latin quadgram score of a GP29 rune.
 * Runes with 2-letter transliteration contribute two new Latin characters.
 * @param {string} previous
 * @param {number} rune
 */
function scoreNext(previous, rune) {
  let tail = previous;
  let change = 0;
  for (const letter of gpLetters[rune]) {
    tail += letter;
    if (tail.length >= 4) {
      change += scores.get(tail.slice(-4)) ?? floorScore;
      tail = tail.slice(-3);
    }
  }
  return {tail, change};
}

/**
 * Positive-control implementation of a strict key-skip rejection sampler.
 * On repeat, discard a key position and retry the same original plaintext.
 * @param {number[]} plain
 * @param {number} sign
 * @param {boolean} transparentF
 */
function encode(plain, sign, transparentF = false) {
  const output = [];
  let j = 0;
  let skipped = 0;
  let last = null;
  for (const p of plain) {
    if (transparentF && p === 0) {
      output.push(0);
      last = 0;
      continue;
    }
    for (;;) {
      const n = mod(p + sign * keyword[j++ % keyword.length]);
      if (n === last) {
        skipped++;
        continue;
      }
      output.push(n);
      last = n;
      break;
    }
  }
  return {output, skipped, usedKeys: j};
}

/**
 * One pinned model: exact original source ciphertext and no fitted text.
 * The sole non-rigid branch consumes one rejected key position only when
 * it would have emitted the preceding physical ciphertext rune.
 * READURL has no adjacent identical glyphs, so skipping >=2 successive
 * key cells with the same plaintext is mathematically impossible.
 * @param {number[]} cipher
 * @param {number} sign
 * @param {number} phase
 * @param {boolean} transparentF
 * @param {number} width
 */
function decode(cipher, sign, phase, transparentF, width) {
  let beam = [{j:phase, tail:'', score:0, plain:[], skipped:0}];
  for (let i = 0; i < cipher.length; i++) {
    const next = [];
    const preceding = i ? cipher[i - 1] : null;
    for (const state of beam) {
      for (const skip of [0, 1]) {
        const j = state.j + skip;
        const p = mod(cipher[i] - sign * keyword[j % keyword.length]);
        if (skip && preceding !== mod(
          p + sign * keyword[state.j % keyword.length])) continue;
        const feature = scoreNext(state.tail, p);
        next.push({
          j:j + 1, tail:feature.tail,
          score:state.score + feature.change - (skip ? 1.1 : 0),
          plain:[...state.plain, p],
          skipped:state.skipped + skip
        });
      }
      if (transparentF && cipher[i] === 0) {
        const feature = scoreNext(state.tail, 0);
        next.push({
          j:state.j, tail:feature.tail,
          score:state.score + feature.change,
          plain:[...state.plain, 0], skipped:state.skipped
        });
      }
    }
    assert(next.length > 0);
    next.sort((a, b) => b.score - a.score);
    beam = next.slice(0, width);
  }
  return beam[0];
}

/** @param {number[]} x @param {number[]} y */
const matches = (x, y) =>
  x.reduce((total, v, i) => total + Number(v === y[i]), 0);

const knownP57 = c.pages[57].indices;
const plants = [];
for (const length of [95, 255]) {
  const originalNativeGP = Array.from({length}, (_, i) =>
    knownP57[i % knownP57.length]);
  for (const sign of [-1, 1]) {
    for (const transparency of [false, true]) {
      const synthetic = encode(originalNativeGP, sign, transparency);
      const recovered = decode(synthetic.output, sign, 0, transparency, 1200);
      const hit = matches(recovered.plain, originalNativeGP);
      assert.equal(hit, length,
        'The exact original-layout native-GP positive must be recovered');
      plants.push({length, sign, transparency,
        trueSkippedKeyCells:synthetic.skipped,
        recoveredSkipped:recovered.skipped,
        exactPlainRunes:hit,
        scorePerRune:Number((recovered.score / length).toFixed(6))});
    }
  }
}
const candidates = [];
for (const [receiver, cipher] of [
  ['p8-all255', c.pages[8].indices],
  ['p8-black243', c.pages[8].indices.slice(12)]
]) {
  for (const sign of [-1, 1]) {
    for (let phase = 0; phase < keyword.length; phase++) {
      for (const transparency of [false, true]) {
        const result = decode(cipher, sign, phase, transparency, 600);
        candidates.push({
          receiver, sign, phase, transparency,
          n:result.plain.length, guessedSkippedKeyCells:result.skipped,
          scorePerRune:Number((result.score / cipher.length).toFixed(6)),
          first100GP:literal(result.plain.slice(0, 100))
        });
      }
    }
  }
}
assert.equal(candidates.length, 48);
const byScore = candidates.slice().sort(
  (a, b) => b.scorePerRune - a.scorePerRune);
const bestNative = Math.min(...plants.map(x => x.scorePerRune));
const maxOriginal = byScore[0].scorePerRune;
assert(maxOriginal < bestNative - 1.5,
  'No current source-key model may be declared a negative without a native-control gap');
console.log(JSON.stringify({
  classification:'source-fixed key-skip model fails as a plain READURL-key consumer',
  recoveredUnknownLP2Plaintext:false,
  originalSource:{
    p7RedWords:products, original2014SquareDimensions:[5,7,5],
    fifthPowerA:literal(A5), fifthPowerB:literal(B5),
    originalReadout:literal(keyword),
    p8PhysicalRunes:255, p8RedHeaderRunes:12, p8BlackRunes:243
  },
  testedModels:48,
  sourceNativeSignalPlants:plants,
  originalBest:byScore.slice(0, 8),
  originalWorst:byScore.slice(-2),
  bestOriginalScorePerRune:maxOriginal,
  worstNativePositiveScorePerRune:bestNative,
  limitations:'Conditional key use and anti-repeat model; original operation is unknown.'
}, null, 2));
