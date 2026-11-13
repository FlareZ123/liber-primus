'use strict';

/**
 * Original-cipher all-secret GP29 degree-nine LFSR crib attack.
 *
 * A conventional unenciphered one-rune English word is A, I, or O. Under a
 * stream-additive GF29 cipher, its ciphertext fixes the stream value to one
 * of only three possibilities. Nine independent such positions fix the
 * complete nine-state LFSR seed. Test every one of the 3^9 assignments,
 * then require all nine additional p15-22 one-rune words to be A/I/O too.
 * No phase or source key is searched: the seed spans all possible phases.
 *
 * Node.js 22, CommonJS, read-only, no external dependencies.
 * Original sources: lp2-corpus.json, lp2-transcription.txt, grid-256.json.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {parseLP2Words} = require('./lp2_word_pages.cjs');

const root = path.resolve(__dirname, '..');
const readJSON = name => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const source = readJSON('resources/liber-primus/lp2-corpus.json');
const grid = readJSON('resources/liber-primus/lp2-grid-256.json');
const raw = fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-transcription.txt'), 'utf8');
const parsed = parseLP2Words(raw);
const mod = number => (number % 29 + 29) % 29;

/** @param {number} n */
function inverse(n) {
  for (let i = 1; i < 29; i++) if (mod(i * n) === 1) return i;
  throw new Error('noninvertible pivot');
}

/** @param {number[]} row @param {number[]} vec */
const dot = (row, vec) => mod(row.reduce((sum, x, i) => sum + x * vec[i], 0));

const C = source.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
assert.equal(C.length, 12956);
assert.equal(parsed.runeCount, 12956);
assert.equal(parsed.words.length, 2896);
assert.equal(source.pages.find(p => p.page === 15).indices.length, 159);
assert.equal(grid.bytes.length, 256);
assert.equal(crypto.createHash('sha256').update(Buffer.from(grid.bytes)).digest('hex'),
  '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');

// Exact coefficient order, constant-first, of the grid's degree-nine factor.
const nonic = [11, 15, 0, 9, 1, 5, 10, 20, 12, 1];
assert.equal(nonic.length, 10);
const remainder = grid.bytes.slice().reverse().map(x => x % 29);
for (let i = remainder.length - 1; i >= 9; i--) {
  const lead = remainder[i];
  for (let j = 0; j <= 9; j++)
    remainder[i - 9 + j] = mod(remainder[i - 9 + j] - lead * nonic[j]);
}
assert.deepEqual(remainder.slice(0, 9), Array(9).fill(0));

const start = source.pages.filter(p => p.page < 15).reduce((n, p) => n + p.indices.length, 0) + 9;
const end = source.pages.filter(p => p.page < 23).reduce((n, p) => n + p.indices.length, 0);
const body = C.slice(start, end);
assert.equal(body.length, 1894);
const singletons = [];
let runeStart = 0;
for (const word of parsed.words) {
  if (word.length === 1 && runeStart >= start && runeStart < end)
    singletons.push({at: runeStart - start, ciphertext: C[runeStart]});
  runeStart += word.length;
}
assert.equal(runeStart, C.length);
assert.deepEqual(singletons.map(s => s.at),
  [126, 171, 269, 394, 530, 536, 564, 605, 621,
    746, 862, 1021, 1087, 1139, 1182, 1641, 1707, 1724]);

/**
 * @param {number[]} taps Constant-first recurrence taps for monic degree nine.
 * @param {number} n Number of keystream symbols
 * @returns {number[][]} Coefficients of each symbol in nine arbitrary seed runes
 */
function coefficients(taps, n) {
  const rows = Array.from({length: n}, (_, i) =>
    i < 9 ? Array.from({length: 9}, (_, j) => Number(i === j)) : null);
  for (let i = 9; i < n; i++) {
    rows[i] = Array.from({length: 9}, (_, j) =>
      mod(-taps.reduce((sum, t, k) => sum + t * rows[i - 9 + k][j], 0)));
  }
  return rows;
}

/**
 * Full inverse of 9x9 GF29 matrix using Gaussian elimination.
 * @param {number[][]} mat
 * @returns {number[][]}
 */
function invert9(mat) {
  const m = mat.map((row, i) =>
    [...row, ...Array.from({length: 9}, (_, j) => Number(i === j))]);
  for (let k = 0; k < 9; k++) {
    let pivot = k;
    while (pivot < 9 && m[pivot][k] === 0) pivot++;
    assert.ok(pivot < 9, 'first nine source singletons must have independent clock rows');
    [m[k], m[pivot]] = [m[pivot], m[k]];
    const scale = inverse(m[k][k]);
    for (let j = k; j < 18; j++) m[k][j] = mod(m[k][j] * scale);
    for (let r = 0; r < 9; r++) {
      if (r === k) continue;
      const mul = m[r][k];
      for (let j = k; j < 18; j++) m[r][j] = mod(m[r][j] - mul * m[k][j]);
    }
  }
  return m.map(row => row.slice(9));
}

/** @param {number[]} ciphertext @param {number[][]} rows */
function recover(ciphertext, rows) {
  const alphabet = [24, 10, 3]; // Original GP29: A, I, O
  const matrix = invert9(singletons.slice(0, 9).map(s => rows[s.at]));
  const survivorSeeds = [];
  const mismatches = Array(singletons.length - 8).fill(0);
  let bestMismatch = singletons.length;
  let bestCandidateCount = 0;

  // Every possible 29^9 seed compatible with nine three-valued crib equations
  // is represented uniquely by one of these 3^9 plaintext assignments.
  for (let mask = 0; mask < 19683; mask++) {
    let digits = mask;
    const keyAtCribs = singletons.slice(0, 9).map(s => {
      const plain = alphabet[digits % 3];
      digits = Math.floor(digits / 3);
      return mod(ciphertext[s.at] - plain);
    });
    const seed = matrix.map(row => dot(row, keyAtCribs));
    let miss = 0;
    for (const s of singletons.slice(9)) {
      const plain = mod(ciphertext[s.at] - dot(rows[s.at], seed));
      if (!alphabet.includes(plain)) miss++;
    }
    mismatches[miss]++;
    if (miss < bestMismatch) {
      bestMismatch = miss;
      bestCandidateCount = 1;
    } else if (miss === bestMismatch) {
      bestCandidateCount++;
    }
    if (miss === 0) survivorSeeds.push(seed);
  }
  assert.equal(mismatches.reduce((sum, x) => sum + x, 0), 19683);
  return {survivorSeeds, bestMismatch, bestCandidateCount, mismatchCounts: mismatches};
}

function ioc(a) {
  const count = Array(29).fill(0);
  for (const rune of a) count[rune]++;
  return count.reduce((sum, c) => sum + c * (c - 1), 0) / (a.length * (a.length - 1));
}


const mod28 = number => (number % 28 + 28) % 28;
const exp15 = Array(28);
const log15 = Array(29).fill(-1);
{
  let value = 1;
  for (let i = 0; i < 28; i++) {
    exp15[i] = value;
    log15[value] = i;
    value = mod(value * 15);
  }
  assert.equal(value, 1);
  assert.ok(log15.slice(1).every(i => i >= 0));
}

/**
 * Interpret each nonzero ciphertext step as a GF29 multiplicative-group
 * element. The rare zero step is an explicit GP rune EA (index 28).
 * @param {number[]} ciphertext
 * @param {'every'|'skip-repeat'} clock
 */
function exponentPositions(ciphertext, clock) {
  let previous = 0;
  let t = 0;
  const indices = [];
  const exponents = [];
  let repeats = 0;
  for (const c of ciphertext) {
    const delta = mod(c - previous);
    previous = c;
    indices.push(t);
    exponents.push(delta === 0 ? -1 : log15[delta]);
    if (delta === 0) repeats++;
    if (clock === 'every' || delta !== 0) t++;
  }
  return {indices, exponents, repeats};
}

/**
 * All possible GF29 nonic states compatible with 9 one-rune words become
 * 3^9 GP A/I/O choices times exactly the necessary k=0/28 aliases.
 *
 * No secret state, starting phase, or ciphertext target is optimized.
 * @param {number[]} ciphertext
 * @param {number[][]} rows
 * @param {'every'|'skip-repeat'} clock
 */
function recoverExponent28(ciphertext, rows, clock) {
  const positions = exponentPositions(ciphertext, clock);
  assert.equal(positions.repeats, 10, 'original-aligned repeat landmarks');
  const words = singletons.map(s => ({
    exponent: positions.exponents[s.at],
    vector: rows[positions.indices[s.at]]
  }));
  assert.ok(words.every(word => word.exponent >= 0),
    'none of the original 18 singletons is a repeat-escape event');
  const matrix = invert9(words.slice(0, 9).map(w => w.vector));
  const alphabet = [24, 10, 3];
  const survivorSeeds = [];
  const mismatchCounts = Array(words.length - 8).fill(0);
  let bestMismatch = words.length;
  let bestCandidateCount = 0;
  let seedsChecked = 0;

  for (let mask = 0; mask < 19683; mask++) {
    let digits = mask;
    const sets = words.slice(0, 9).map(word => {
      const plain = alphabet[digits % 3];
      digits = Math.floor(digits / 3);
      const key = mod28(word.exponent - plain);
      return key === 0 ? [0, 28] : [key];
    });
    const variants = sets.reduce((n, choices) => n * choices.length, 1);
    for (let alias = 0; alias < variants; alias++) {
      let value = alias;
      const cribKey = sets.map(set => {
        const item = set[value % set.length];
        value = Math.floor(value / set.length);
        return item;
      });
      const seed = matrix.map(row => dot(row, cribKey));
      seedsChecked++;
      let mismatched = 0;
      for (const word of words.slice(9)) {
        const plain = mod28(word.exponent - (dot(word.vector, seed) % 28));
        if (!alphabet.includes(plain)) mismatched++;
      }
      mismatchCounts[mismatched]++;
      if (mismatched < bestMismatch) {
        bestMismatch = mismatched;
        bestCandidateCount = 1;
      } else if (mismatched === bestMismatch) {
        bestCandidateCount++;
      }
      if (mismatched === 0) survivorSeeds.push(seed);
    }
  }
  assert.equal(mismatchCounts.reduce((sum, count) => sum + count, 0), seedsChecked);
  return {survivorSeeds, seedsChecked, bestMismatch, bestCandidateCount,
    mismatchCounts, repeats: positions.repeats};
}

/**
 * Exact reversible GP28 exponent/EA-escape forward encoder.
 * @param {number[]} plain
 * @param {number[][]} rows
 * @param {number[]} seed
 * @param {'every'|'skip-repeat'} clock
 */
function encodeExponent28(plain, rows, seed, clock) {
  let previous = 0;
  let t = 0;
  const out = [];
  for (const p of plain) {
    assert.ok(Number.isInteger(p) && p >= 0 && p < 29);
    const c = p === 28 ? previous :
      mod(previous + exp15[mod28(p + (dot(rows[t], seed) % 28))]);
    out.push(c);
    if (clock === 'every' || p !== 28) t++;
    previous = c;
  }
  return out;
}

/**
 * Exact inverse under a known secret stream state.
 * @param {number[]} ciphertext
 * @param {number[][]} rows
 * @param {number[]} seed
 * @param {'every'|'skip-repeat'} clock
 */
function decodeExponent28(ciphertext, rows, seed, clock) {
  let previous = 0;
  let t = 0;
  const out = [];
  for (const c of ciphertext) {
    const delta = mod(c - previous);
    const plain = delta === 0 ? 28 :
      mod28(log15[delta] - (dot(rows[t], seed) % 28));
    out.push(plain);
    if (clock === 'every' || delta !== 0) t++;
    previous = c;
  }
  return out;
}

function run() {
  const reciprocal = nonic.slice().reverse().map(x => mod(x * inverse(nonic[0])));
  const candidates = [
    {name: 'source nonic', taps: nonic.slice(0, 9)},
    {name: 'monic reciprocal nonic', taps: reciprocal.slice(0, 9)}
  ];
  const reports = [];
  for (const candidate of candidates) {
    const rows = coefficients(candidate.taps, body.length);
    const found = recover(body, rows);
    assert.equal(found.survivorSeeds.length, 0,
      'the actual source must reject every exact A/I/O-compatible nine-state key');

    // Native solved p57 supplies valid GP29 prose and the source singleton
    // locations are planted A/I/O. Recover an entirely unknown nine-state
    // synthetic key, then decrypt and forward-encrypt every body rune.
    const known = source.pages.find(p => p.page === 57).indices;
    const plantedPlain = Array.from({length: body.length}, (_, i) => known[i % known.length]);
    const oneValues = [24, 10, 3];
    for (let j = 0; j < singletons.length; j++)
      plantedPlain[singletons[j].at] = oneValues[j % 3];
    const plantedSeed = [3, 5, 7, 11, 13, 17, 19, 23, 0];
    const plantedCipher = plantedPlain.map((p, i) => mod(p + dot(rows[i], plantedSeed)));
    const recovered = recover(plantedCipher, rows);
    assert.ok(recovered.survivorSeeds.some(seed =>
      seed.every((n, j) => n === plantedSeed[j])));
    const roundTrip = plantedCipher.map((c, i) =>
      mod(c - dot(rows[i], plantedSeed)));
    assert.deepEqual(roundTrip, plantedPlain);
    assert.deepEqual(roundTrip.map((p, i) => mod(p + dot(rows[i], plantedSeed))), plantedCipher);

    const exponent28 = [];
    for (const clock of ['every', 'skip-repeat']) {
      const found28 = recoverExponent28(body, rows, clock);
      assert.equal(found28.survivorSeeds.length, 0,
        'original exponent/EA decoder must reject every source-compatible seed');

      // Keep exactly the ten original repeat-escape positions while deriving
      // the synthetic GP native source, so both clock rules are exercised.
      const known28 = source.pages.find(p => p.page === 57).indices;
      const plantedPlain28 = Array.from({length: body.length}, (_, i) => {
        const gp = known28[i % known28.length];
        return gp === 28 ? 18 : gp;
      });
      let preceding = 0;
      for (let i = 0; i < body.length; i++) {
        if (body[i] === preceding) plantedPlain28[i] = 28;
        preceding = body[i];
      }
      for (let i = 0; i < singletons.length; i++)
        plantedPlain28[singletons[i].at] = [24, 10, 3][i % 3];
      const plantedCipher28 = encodeExponent28(plantedPlain28, rows, plantedSeed, clock);
      const plantedFound28 = recoverExponent28(plantedCipher28, rows, clock);
      assert.ok(plantedFound28.survivorSeeds.some(seed =>
        seed.every((x, i) => x === plantedSeed[i])),
        'unknown source-state recovered from three-valued one-rune cribs');
      assert.deepEqual(decodeExponent28(plantedCipher28, rows, plantedSeed, clock),
        plantedPlain28, 'whole source-native plaintext recovered');
      exponent28.push({
        clock, sourceRepeatEscapes: found28.repeats,
        allCribConsistentSeedAssignments: found28.seedsChecked,
        sourceSurvivors: found28.survivorSeeds.length,
        minimumHeldoutWordErrors: found28.bestMismatch,
        candidatesAtMinimum: found28.bestCandidateCount,
        heldoutErrorDistribution: found28.mismatchCounts,
        syntheticUnknownSeedRecovered: true,
        syntheticBodySymbolsRecovered: body.length
      });
    }
    reports.push({
      exponent28,
      polynomial: candidate.name,
      sourceOneRuneWords: singletons.length,
      independentSeedConstraints: 9,
      allCribConsistentSeedAssignments: 19683,
      sourceSurvivors: found.survivorSeeds.length,
      minimumHeldoutWordErrors: found.bestMismatch,
      candidatesAtMinimum: found.bestCandidateCount,
      heldoutErrorDistribution: found.mismatchCounts,
      syntheticUnknownSeedRecovered: true,
      syntheticBodySymbolsRecovered: body.length
    });
  }
  return {pageRange: 'original LP2 physical p15-22',
    sourceNonic: nonic,
    bodyRunes: body.length,
    originalBodyIoC: ioc(body),
    oneRuneLocations: singletons.map(s => s.at),
    exactFamily: 'additive GP29 LFSR with every secret nine-rune seed and plaintext one-rune words A/I/O',
    reports};
}

if (require.main === module) console.log(JSON.stringify(run(), null, 2));
module.exports = {run};
