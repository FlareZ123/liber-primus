'use strict';
/**
 * Original-source 2016 image (563x569) prime-start and all-secret period gate.
 *
 * The signed-image dimensions are successive ordinary primes p103=563 and p104=569.
 * (A) Transfer the authenticated p56 consecutive-prime totient decoder, starting
 *     at either prime, to unsolved original p0. Exhaust ALL ciphertext-F skips.
 * (B) If the dimensions instead form squaring modulus N=563*569, CRT shows
 *     every secret initial state reaches a period dividing 70 after three steps.
 *     Any fixed bijective GP29 emission keyed only by this state preserves lag-70
 *     plaintext equality, independently of all secret state/output permutations.
 *
 * No original unknown-LP2 plaintext/key has been recovered. Source and theorem
 * restrict only these two explicit and independently motivated hypotheses.
 * Run: node sims/cicada2016_dimensions_prime_state_gate.cjs
 * Node 22, CommonJS, no third-party packages or file writes.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {plaintextWords} = require('./authentic_decryption_regression.cjs');
const {primeTotients, trainNativeGP, exhaustLiteralF} =
  require('./historical_solve_path_transfer.cjs');

const root = path.resolve(__dirname, '..');
/** @param {string} name @returns {string} */
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const originalPages = corpus.pages.filter(page => page.page < 56 && page.indices.length);
const ciphertext = originalPages.flatMap(page => page.indices);
const WIDTH = 563;
const HEIGHT = 569;
const MODULUS = WIDTH * HEIGHT;
const PERIOD = 70;
const TRANSIENT = 3;
const LENGTH = 12956;
assert.equal(ciphertext.length, LENGTH);
assert.equal(originalPages.length, 55);

/** @param {number} x @param {number} exponent @param {number} modulus @returns {number} */
function powMod(x, exponent, modulus) {
  let result = 1;
  let a = x % modulus;
  for (let e = exponent; e; e = Math.floor(e / 2)) {
    if (e % 2) result = result * a % modulus;
    a = a * a % modulus;
  }
  return result;
}

/** @param {number} n @returns {boolean} */
function isPrime(n) {
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return n >= 2;
}

/** @param {number} i @returns {number} */
function nthPrime(i) {
  let seen = 0;
  for (let x = 2; ; x++) if (isPrime(x) && ++seen === i) return x;
}

/** @param {number} state @returns {number} */
const square = state => state * state % MODULUS;

/** @returns {object} */
function proveAllSecretStates() {
  assert.equal(nthPrime(103), WIDTH);
  assert.equal(nthPrime(104), HEIGHT);
  assert.equal(WIDTH - 1, 2 * 281);
  assert.equal(HEIGHT - 1, 8 * 71);
  assert.equal(MODULUS, 320347);
  assert.equal(powMod(2, PERIOD, 281), 1);
  assert.equal(powMod(2, PERIOD, 71), 1);
  // Exhaustive finite certification, including non-coprime and zero states.
  // CRT proof: x^(2^3) has odd order dividing 281 and 71, on either
  // invertible prime component; a zero component stays zero. Thus
  // squaring^70 fixes every post-three-square state.
  for (let seed = 0; seed < MODULUS; seed++) {
    let state = seed;
    for (let i = 0; i < TRANSIENT; i++) state = square(state);
    const initial = state;
    for (let i = 0; i < PERIOD; i++) state = square(state);
    assert.equal(state, initial, 'period failure for seed ' + seed);
  }
  return {width:WIDTH, height:HEIGHT, ordinaryPrimeIndices:[103,104],
    modulus:MODULUS, allInitialStates:MODULUS,
    transientUpperBound:TRANSIENT, periodDivides:PERIOD};
}

/**
 * @param {number[]} values
 * @param {number} [start]
 * @returns {{matches:number,pairs:number,rate:number}}
 */
function lag70(values, start = TRANSIENT) {
  let matches = 0, pairs = 0;
  for (let i = start; i + PERIOD < values.length; i++) {
    pairs++;
    if (values[i] === values[i + PERIOD]) matches++;
  }
  return {matches, pairs, rate:matches / pairs};
}

/**
 * Exact moving-window lag-equality extrema; all overlapping windows are
 * enumerated and the offsets are descriptive, not independent null draws.
 * @param {number[]} source
 */
function allReferenceWindows(source) {
  assert.ok(source.length >= LENGTH);
  const flags = Uint8Array.from({length:source.length-PERIOD},
    (_,i) => Number(source[i] === source[i + PERIOD]));
  const pairs = LENGTH - PERIOD - TRANSIENT;
  const windows = source.length - LENGTH + 1;
  let current = 0;
  for (let k = TRANSIENT; k < TRANSIENT + pairs; k++) current += flags[k];
  let min = current, max = current, sum = current;
  for (let start = 1; start < windows; start++) {
    current += flags[start + TRANSIENT + pairs - 1] -
      flags[start + TRANSIENT - 1];
    min = Math.min(min, current);
    max = Math.max(max, current);
    sum += current;
  }
  return {sourceRunes:source.length, windows, pairs, min, max,
    mean:sum / windows};
}

/** @returns {number[]} */
function pageLagLocations() {
  const locations = [];
  let start = 0;
  for (const page of originalPages) {
    for (let i = TRANSIENT; i + PERIOD < page.indices.length; i++)
      locations.push(start + i);
    start += page.indices.length;
  }
  assert.equal(start, LENGTH);
  return locations;
}

/**
 * @param {number[]} source
 * @param {number[]} locations
 * @param {number} start
 */
function countPageLocal(source, locations, start) {
  let hits = 0;
  for (const i of locations)
    if (source[start + i] === source[start + i + PERIOD]) hits++;
  return hits;
}

/** @param {number[]} source @param {number[]} positions */
function sampledPageWindows(source, positions) {
  const controlRuns = 1000, hits = [];
  for (let j = 0; j < controlRuns; j++) {
    const start = Math.floor((source.length - LENGTH) * j / (controlRuns - 1));
    hits.push(countPageLocal(source, positions, start));
  }
  return {windows:controlRuns, min:Math.min(...hits), max:Math.max(...hits),
    median:hits.slice().sort((a,b) => a-b)[500]};
}

/** @returns {object} */
function originalPeriodGate() {
  const plainSources = [
    ['Emerson', plaintextWords(read('resources/control/emerson_essays_2944.txt')).flat()],
    ['Shakespeare', plaintextWords(read('resources/control/shakespeare_first300k.txt')).flat()]
  ];
  const originalBook = lag70(ciphertext);
  assert.equal(originalBook.matches, 433);
  assert.equal(originalBook.pairs, 12883);
  const locations = pageLagLocations();
  assert.equal(locations.length, 8948);
  const originalPage = countPageLocal(ciphertext, locations, 0);
  assert.equal(originalPage, 293);
  const referenceResults = plainSources.map(([name,plain]) => {
    const allBook = allReferenceWindows(plain);
    const pageLocal = sampledPageWindows(plain, locations);
    assert.ok(allBook.min > originalBook.matches);
    assert.ok(pageLocal.min > originalPage);
    return {name, allBook, pageLocal};
  });
  assert.deepEqual(referenceResults.map(r => r.allBook.windows),
    [310128,204689]);
  assert.deepEqual(referenceResults.map(r => r.allBook.min), [728,693]);
  assert.deepEqual(referenceResults.map(r => r.pageLocal.min), [498,469]);

  // True-source synthetic plant. The entire secret 2016-seed square stream
  // re-encrypts and decrypts exactly, and equality invariance detects it.
  let state = 2016;
  const plain = plainSources[0][1].slice(0,LENGTH);
  const planted = plain.map(v => {
    state = square(state);
    return (v + state % 29) % 29;
  });
  const nativeBook = lag70(plain);
  const plantedBook = lag70(planted);
  assert.equal(nativeBook.matches, 832);
  assert.equal(plantedBook.matches, nativeBook.matches);
  const positions = pageLagLocations();
  assert.equal(countPageLocal(planted,positions,0),
    countPageLocal(plain,positions,0));
  state = 2016;
  const recovered = planted.map(v => {
    state = square(state);
    return (v - state % 29 + 29) % 29;
  });
  assert.deepEqual(recovered, plain);
  return {originalBook, originalPage:{matches:originalPage,pairs:locations.length},
    referenceResults, positive:{nativeMatches:nativeBook.matches,
      ciphertextMatches:plantedBook.matches, exactRecovered:recovered.length}};
}

/** @returns {object} */
function sourcePrimeTotientGate() {
  const model = trainNativeGP(read('resources/control/emerson_essays_2944.txt'));
  const p0 = corpus.pages[0].indices;
  const p56 = corpus.pages[56].indices;
  const known56 = plaintextWords(
    'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT ' +
    'IS THE DUTY OF EVERY PILGRIM TO SEEK OUT THIS PAGE').flat();
  const solved = exhaustLiteralF(p56, primeTotients(p56.length), model, known56);
  assert.equal(solved.correctMask, 8);
  assert.equal(solved.rankOfKnownPlain, 1);
  assert.ok(Math.abs(solved.correctScore + 2.383854012446893) < 1e-10);
  const starts = [1,103,104].map(index => {
    const result = exhaustLiteralF(p0, primeTotients(p0.length,index), model);
    const preview = result.best.plaintext.slice(0,80)
      .map(value => corpus.translit[value]).join('');
    return {primeIndex:index, firstPrime:nthPrime(index),
      masks:result.totalMasks, bestMask:result.best.mask,
      bestScorePerRune:result.best.score, preview};
  });
  assert.deepEqual(starts.map(v => v.firstPrime),[2,WIDTH,HEIGHT]);
  assert.deepEqual(starts.map(v => v.masks),[16384,16384,16384]);
  assert.deepEqual(starts.map(v => v.bestMask),[8901,7025,12288]);
  assert.ok(Math.abs(starts[0].bestScorePerRune + 5.9910298724173465) < 1e-10);
  assert.ok(Math.abs(starts[1].bestScorePerRune + 6.133557894399463) < 1e-10);
  assert.ok(Math.abs(starts[2].bestScorePerRune + 6.158491251646311) < 1e-10);
  return {reference:'authentic LP2 physical p56',authenticKnownScore:solved.correctScore,
    originalP0VisibleF:14, starts,
    inference:'Neither dimension-start direct totient transfer recovers GP-English'};
}

/** @returns {object} */
function main() {
  return {scope:'Original 2016 563x569 source-derived finite cipher gates',
    theorem:proveAllSecretStates(), period:originalPeriodGate(),
    primeTotient:sourcePrimeTotientGate(),
    conclusion:'No unknown LP2 plaintext or authentic key recovered'};
}
if (require.main === module) console.log(JSON.stringify(main(),null,2));
module.exports = {main,proveAllSecretStates,lag70,allReferenceWindows};
