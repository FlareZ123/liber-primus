'use strict';

/**
 * LP2 original-source sparse F-marker / order<=4 GF(29) recurrence gate.
 *
 * A deliberately permissive, unproven marker rule says that when the current
 * ciphertext rune repeats its same-page predecessor, the plaintext rune is
 * GP F (index zero). If encryption is C=P+K mod29 with a per-rune clock,
 * then these observed locations reveal K[i]=C[i].
 *
 * Exhaust all 29^4 homogeneous fourth-order linear recurrences, allowing any
 * initial four GP values, on the single original p40-p53 visual chapter.
 * Any homogeneous linear recurrence of lower order embeds in this family.
 *
 * This is a conditional mechanism exclusion, never an LP2 decryption.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const FIELD = 29;
const DEGREE = 4;
const COEFFICIENTS = FIELD ** DEGREE;
const CHAPTER_START = 9640;
const CHAPTER_END = 12648;
const EXPECTED_FIRST_NINE = [
  [277, 10], [500, 22], [526, 7], [868, 28], [929, 9],
  [972, 22], [1110, 10], [1121, 25], [1202, 22]
];

const EXPECTED_SURVIVORS = [
  { coefficients: [18, 5, 27, 1], seed: [17, 21, 24, 23], ninthPrediction: 6 },
  { coefficients: [22, 18, 10, 3], seed: [20, 25, 4, 5], ninthPrediction: 13 },
  { coefficients: [10, 5, 27, 27], seed: [1, 2, 0, 0], ninthPrediction: 25 }
];

const MOD = (n) => ((n % FIELD) + FIELD) % FIELD;
const INVERSE = Array.from({ length: FIELD }, (_, x) => {
  for (let n = 1; n < FIELD; n++) if (x * n % FIELD === 1) return n;
  return 0;
});

/** Polynomial product modulo x^4 - a3*x^3 - a2*x^2 - a1*x - a0. */
function product4(x, y, a) {
  const b = [0, 0, 0, 0, 0, 0, 0];
  for (let i = 0; i < DEGREE; i++) {
    for (let j = 0; j < DEGREE; j++) b[i + j] += x[i] * y[j];
  }
  for (let i = 6; i >= 4; i--) {
    const z = MOD(b[i]);
    if (z === 0) continue;
    b[i - 4] += z * a[0];
    b[i - 3] += z * a[1];
    b[i - 2] += z * a[2];
    b[i - 1] += z * a[3];
  }
  return [MOD(b[0]), MOD(b[1]), MOD(b[2]), MOD(b[3])];
}

/** Frozen exponent bit lists avoid per-polynomial exponent parsing. */
function bitPositions(n) {
  const bits = [];
  let i = 0;
  while (n > 0) {
    if (n % 2 === 1) bits.push(i);
    n = Math.floor(n / 2);
    i++;
  }
  return bits;
}

function powers4(coefficients, nPowers) {
  const powers = [[0, 1, 0, 0]];
  for (let i = 1; i < nPowers; i++) {
    powers.push(product4(powers[i - 1], powers[i - 1], coefficients));
  }
  return powers;
}

/** Coefficients of K[n] as a linear functional on secret K[0..3]. */
function atExponent(bits, powers, coefficients) {
  let row = [1, 0, 0, 0];
  for (const i of bits) row = product4(row, powers[i], coefficients);
  return row;
}

function recoverSeed(basis) {
  const seed = Array(DEGREE).fill(0);
  for (let i = DEGREE - 1; i >= 0; i--) {
    if (!basis[i]) return null;
    let rhs = basis[i][DEGREE];
    for (let j = i + 1; j < DEGREE; j++) rhs -= basis[i][j] * seed[j];
    seed[i] = MOD(rhs);
  }
  return seed;
}

/**
 * Row-reduce sparse equations K[n] = observedValue over GF29.
 * After rank 4, any further contradictory marker is decisive.
 */
function evaluate(observations, coefficientVector, frozenBits, nPowers, stopAt = observations.length) {
  const powers = powers4(coefficientVector, nPowers);
  const basis = Array(DEGREE).fill(null);
  let matched = 0;
  let rank = 0;
  for (let i = 0; i < stopAt; i++) {
    const row = atExponent(frozenBits[i], powers, coefficientVector);
    row.push(observations[i][1]);
    let inserted = false;
    for (let col = 0; col < DEGREE; col++) {
      const pivot = row[col];
      if (pivot === 0) continue;
      if (basis[col]) {
        const known = basis[col];
        for (let k = col; k <= DEGREE; k++) {
          row[k] = MOD(row[k] - pivot * known[k]);
        }
      } else {
        const scale = INVERSE[pivot];
        for (let k = col; k <= DEGREE; k++) row[k] = MOD(row[k] * scale);
        basis[col] = row;
        rank++;
        inserted = true;
        break;
      }
    }
    if (!inserted && row[DEGREE] !== 0) break;
    matched++;
  }
  return { matched, rank, seed: recoverSeed(basis), powers };
}

function readChapterMarkers() {
  const sourcePath = path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json');
  const source = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
  const pages = source.pages.filter((p) => p.page <= 55);
  assert.equal(pages.length, 56);
  assert.equal(pages.reduce((s, p) => s + p.indices.length, 0), 12956);
  assert.equal(pages.filter((p) => p.indices.length > 0).length, 55);
  assert.equal(pages.find((p) => p.page === 50).indices.length, 0);

  const allMarkers = [];
  let offset = 0;
  for (const page of pages) {
    assert.equal(page.page, pages.indexOf(page));
    for (let i = 1; i < page.indices.length; i++) {
      if (page.indices[i] === page.indices[i - 1]) {
        allMarkers.push([offset + i, page.indices[i]]);
      }
    }
    offset += page.indices.length;
  }
  assert.equal(allMarkers.length, 86);
  assert.equal(pages.filter((p) => p.page < 40)
    .reduce((s, p) => s + p.indices.length, 0), CHAPTER_START);
  assert.equal(pages.filter((p) => p.page < 54)
    .reduce((s, p) => s + p.indices.length, 0), CHAPTER_END);

  const chapter = allMarkers
    .filter(([i]) => i >= CHAPTER_START && i < CHAPTER_END)
    .map(([i, value]) => [i - CHAPTER_START, value]);
  assert.equal(chapter.length, 18);
  assert.deepEqual(chapter.slice(0, 9), EXPECTED_FIRST_NINE);
  return chapter;
}

/**
 * Full-length, lossless positive plant: all 18 marked positions decrypt to F
 * under a seeded order-4 key, and exactly those positions repeat ciphertext.
 */
function testPlant(markers, bits, nPowers) {
  const coefficients = [9, 4, 10, 6];
  const seed = [7, 1, 12, 23];
  const n = CHAPTER_END - CHAPTER_START;
  const key = seed.slice();
  for (let i = 0; i + DEGREE < n; i++) {
    key.push(MOD(coefficients.reduce((s, a, j) => s + a * key[i + j], 0)));
  }
  assert.equal(key.length, n);
  const plantedMarkers = markers.map(([i]) => [i, key[i]]);
  const detected = evaluate(plantedMarkers, coefficients, bits, nPowers);
  assert.equal(detected.matched, markers.length);
  assert.equal(detected.rank, DEGREE);
  assert.deepEqual(detected.seed, seed);

  const ciphertext = Array(n).fill(-1);
  for (const [at] of markers) {
    assert.equal(ciphertext[at - 1], -1);
    assert.equal(ciphertext[at], -1);
    ciphertext[at - 1] = key[at];
    ciphertext[at] = key[at];
  }
  for (let i = 0; i < n; i++) {
    if (ciphertext[i] !== -1) continue;
    let c = MOD(17 * i + 7);
    while ((i > 0 && c === ciphertext[i - 1]) ||
           (i + 1 < n && c === ciphertext[i + 1])) c = MOD(c + 1);
    ciphertext[i] = c;
  }
  const repeated = [];
  for (let i = 1; i < n; i++) {
    if (ciphertext[i] === ciphertext[i - 1]) repeated.push(i);
  }
  assert.deepEqual(repeated, markers.map(([at]) => at));
  const plaintext = ciphertext.map((c, i) => MOD(c - key[i]));
  for (const [at] of markers) assert.equal(plaintext[at], 0);
  const reencrypted = plaintext.map((p, i) => MOD(p + key[i]));
  assert.deepEqual(reencrypted, ciphertext);
  return { runes: n, exactMarkers: repeated.length, recoveredSeed: detected.seed };
}

function main() {
  const markers = readChapterMarkers();
  const frozenBits = markers.map(([i]) => bitPositions(i));
  const nPowers = Math.max(...frozenBits.flat()) + 1;
  const positive = testPlant(markers, frozenBits, nPowers);

  const started = Date.now();
  const survivors = [];
  let best = 0;
  let fitNine = 0;
  let full = 0;
  for (let code = 0; code < COEFFICIENTS; code++) {
    let t = code;
    const coefficients = [];
    for (let i = 0; i < DEGREE; i++) {
      coefficients.push(t % FIELD);
      t = Math.floor(t / FIELD);
    }
    const candidate = evaluate(markers, coefficients, frozenBits, nPowers);
    best = Math.max(best, candidate.matched);
    if (candidate.matched >= 9) fitNine++;
    if (candidate.matched === markers.length) full++;
    if (candidate.matched >= 8) {
      const next = atExponent(frozenBits[8], candidate.powers, coefficients);
      assert.ok(candidate.seed);
      const prediction = MOD(next.reduce((s, x, j) => s + x * candidate.seed[j], 0));
      survivors.push({ coefficients, seed: candidate.seed, ninthPrediction: prediction });
    }
  }

  assert.equal(best, 8);
  assert.equal(fitNine, 0);
  assert.equal(full, 0);
  assert.deepEqual(survivors, EXPECTED_SURVIVORS);
  console.log(JSON.stringify({
    source: 'resources/liber-primus/lp2-corpus.json',
    scope: 'Original physical pages 40-53, one visual chapter',
    chapterRuneCount: CHAPTER_END - CHAPTER_START,
    originalDoubletMarkers: markers.length,
    firstNine: EXPECTED_FIRST_NINE,
    candidateRecurrences: COEFFICIENTS,
    coefficientsAndSeedUnrestricted: true,
    fitsFirstEight: survivors,
    ninthOriginalValue: markers[8][1],
    fitsFirstNine: fitNine,
    fitsAllEighteen: full,
    bestConsecutiveFit: best,
    positive,
    elapsedMs: Date.now() - started
  }, null, 2));
}
main();
