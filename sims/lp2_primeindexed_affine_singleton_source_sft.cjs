'use strict';

/**
 * SFT: source-original 83 LP2 singleton GP29 words vs a low-parameter,
 * nonperiodic prime-ordinal affine additive keystream.
 *
 * C[i] = P[i] + a * prime[s+i] + b (mod 29); 0<=s<=3300, a,b in GF29.
 *
 * The initial-prime-position limit uses the first-party number 3301 as a
 * bounded search budget, not evidence for this cipher or for a start phase.
 * Words are intact native English A/I (generous sensitivity: A/I/O).
 * Transparent plaintext-F and key skips are NOT included in this model.
 *
 * Invoke as an SFT with Node.js 22 from the repository; read-only.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const transcript = fs.readFileSync(
  path.join(ROOT, 'resources', 'lp2-transcription.txt'), 'utf8');
const INDEX = new Map(corpus.runes.map((r, i) => [r, i]));
const MODULUS = 29;
const MAX_START = 3300;
const A = 24;
const I = 10;
const O = 3;

/** @param {number} x @returns {number} */
const mod = x => (x % MODULUS + MODULUS) % MODULUS;

/** @param {number} limit @returns {number[]} */
function makePrimes(limit) {
  const bits = new Uint8Array(limit + 1);
  bits.fill(1, 2);
  for (let p = 2; p * p <= limit; p++) {
    if (!bits[p]) continue;
    for (let j = p * p; j <= limit; j += p) bits[j] = 0;
  }
  const values = [];
  for (let p = 2; p <= limit; p++) if (bits[p]) values.push(p);
  return values;
}
const primes = makePrimes(400000);
const inverses = new Uint8Array(MODULUS);
for (let a = 1; a < MODULUS; a++) {
  for (let b = 1; b < MODULUS; b++) {
    if (a * b % MODULUS === 1) inverses[a] = b;
  }
}
for (let a = 1; a < MODULUS; a++) assert.notEqual(inverses[a], 0);

/**
 * Reads 55 rune-bearing unknown page segments. Page wraps and printed line
 * wraps are transparent, but printed hyphens/stops terminate words.
 * @returns {{tape:number[],singletons:Array<{offset:number,cipher:number}>,words:number}}
 */
function readOriginal() {
  const text = transcript.split('%').slice(0, 55).join('%');
  const tape = [];
  const singletons = [];
  let current = [];
  let words = 0;
  const finish = () => {
    if (!current.length) return;
    words++;
    if (current.length === 1) singletons.push(current[0]);
    current = [];
  };
  for (const glyph of text) {
    if (INDEX.has(glyph)) {
      const cipher = INDEX.get(glyph);
      current.push({offset:tape.length, cipher});
      tape.push(cipher);
    } else if (glyph === '%' || glyph === '/' || /\s/u.test(glyph)) {
      // Layout, including cross-page carried words, does not end a word.
    } else {
      finish();
    }
  }
  finish();
  const independent = corpus.pages.filter(p => p.page <= 55)
    .flatMap(p => p.indices);
  assert.deepEqual(tape, independent);
  assert.deepEqual([tape.length, words, singletons.length],
    [12956, 2896, 83]);
  assert.deepEqual(singletons.slice(0, 5), [
    {offset:176, cipher:28},
    {offset:244, cipher:15},
    {offset:350, cipher:9},
    {offset:530, cipher:1},
    {offset:644, cipher:0}
  ]);
  return {tape, singletons, words};
}

/**
 * Exhaustively reconstruct all secret (a,b) from the first two A/I
 * assignments at every candidate prime start. Also handles a singular
 * first-two-prime-difference without dividing by zero.
 *
 * @param {Array<{offset:number,cipher:number}>} observations
 * @param {number[]} vocabulary
 * @param {number} count number of leading anchor observations to verify
 * @returns {{best:number,full:Array<{start:number,a:number,b:number}>,histogram:number[],singularStarts:number}}
 */
function recover(observations, vocabulary, count) {
  assert.ok(count >= 2 && count <= observations.length);
  const [first, second] = observations;
  const histogram = Array(count + 1).fill(0);
  const full = [];
  let best = 0;
  let singularStarts = 0;

  /** @param {number} start @param {number} a @param {number} b */
  function evaluate(start, a, b) {
    let matched = 0;
    for (; matched < count; matched++) {
      const o = observations[matched];
      const plain = mod(o.cipher - a * primes[start + o.offset] - b);
      if (!vocabulary.includes(plain)) break;
    }
    histogram[matched]++;
    best = Math.max(best, matched);
    if (matched === count) full.push({start, a, b});
  }

  for (let start = 0; start <= MAX_START; start++) {
    const q0 = primes[start + first.offset] % 29;
    const q1 = primes[start + second.offset] % 29;
    const delta = mod(q1 - q0);
    if (delta === 0) {
      singularStarts++;
      for (const p0 of vocabulary) for (const p1 of vocabulary) {
        if (mod(second.cipher - first.cipher) !== mod(p1 - p0)) {
          continue;
        }
        for (let a = 0; a < 29; a++) {
          evaluate(start, a, mod(first.cipher - p0 - a * q0));
        }
      }
    } else {
      for (const p0 of vocabulary) for (const p1 of vocabulary) {
        const a = mod((second.cipher - p1 - first.cipher + p0)
          * inverses[delta]);
        const b = mod(first.cipher - p0 - a * q0);
        evaluate(start, a, b);
      }
    }
  }
  return {best, full, histogram, singularStarts};
}

/** @param {number} seed @returns {() => number} */
function xorshift32(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 0x100000000;
  };
}

/** @param {number[]} values @param {() => number} rng */
function fisherYates(values, rng) {
  for (let i = values.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [values[i], values[j]] = [values[j], values[i]];
  }
}

function main() {
  const {tape, singletons} = readOriginal();
  assert.ok(primes.length > MAX_START + tape.length);
  const firstChapter2 = singletons.filter(x => x.offset < 1874);
  assert.equal(firstChapter2.length, 13);

  const actualAI = recover(singletons, [A, I], singletons.length);
  const actualAIO = recover(singletons, [A, I, O], singletons.length);
  assert.deepEqual([actualAI.best, actualAIO.best], [4, 6]);
  assert.deepEqual([actualAI.full.length, actualAIO.full.length], [0, 0]);
  assert.equal(actualAI.singularStarts, 109);
  assert.equal(actualAIO.singularStarts, 109);

  // Explicitly lock the two original first-prime-singularity check values.
  // C[244]-C[176] = 15-28 = 16 mod29, which is not the difference of
  // any two members of {A,I,O}; zero prime difference cannot rescue a key.
  assert.equal(mod(singletons[1].cipher - singletons[0].cipher), 16);
  const differences = new Set([A, I, O]
    .flatMap(x => [A, I, O].map(y => mod(y - x))));
  assert.equal(differences.has(16), false);

  const rand = xorshift32(0x25371411);
  const controlsAI = Array(14).fill(0);
  const controlsAIO = Array(14).fill(0);
  for (let rep = 0; rep < 100; rep++) {
    const shuffled = singletons.map(x => x.cipher);
    fisherYates(shuffled, rand);
    const fake = singletons.map((o, idx) => ({
      offset:o.offset, cipher:shuffled[idx]
    }));
    const ai = recover(fake, [A, I], firstChapter2.length);
    const aio = recover(fake, [A, I, O], firstChapter2.length);
    controlsAI[ai.best]++;
    controlsAIO[aio.best]++;
  }
  assert.deepEqual(controlsAI.slice(0, 9), [0,0,0,0,4,60,33,3,0]);
  assert.deepEqual(controlsAIO.slice(0, 9), [0,0,0,0,0,4,64,28,4]);

  // Full original-size source-native positive plant, hidden affine state.
  // Use known clear p57 runes as filler; exactly 83 genuine plaintext
  // singletons are inserted into the preserved original layout.
  const native = corpus.pages.find(p => p.page === 57).indices;
  assert.equal(native.length, 95);
  const plain = Array.from({length:tape.length}, (_, i) =>
    native[i % native.length]);
  for (let k = 0; k < singletons.length; k++) {
    plain[singletons[k].offset] = k % 2 === 0 ? A : I;
  }
  const key = {start:73, a:7, b:11};
  const plant = plain.map((p, i) =>
    mod(p + key.a * primes[key.start + i] + key.b));
  const plantObs = singletons.map(o => ({
    offset:o.offset, cipher:plant[o.offset]
  }));
  const recovered = recover(plantObs, [A, I], firstChapter2.length);
  assert.deepEqual(recovered.full, [key]);
  const recoveredPlain = plant.map((cipher, i) =>
    mod(cipher - recovered.full[0].a
      * primes[recovered.full[0].start + i] - recovered.full[0].b));
  assert.deepEqual(recoveredPlain, plain);
  const reencryption = recoveredPlain.map((p, i) => mod(
    p + recovered.full[0].a * primes[recovered.full[0].start + i]
      + recovered.full[0].b));
  assert.deepEqual(reencryption, plant);

  console.log(JSON.stringify({
    claim: 'bounded direct prime-ordinal affine singletons, never p56 F skip',
    original: {runes:tape.length, words:2896, singletons:83,
      first13: firstChapter2,
      AI:{bestMatchedLeading:actualAI.best, survivors:actualAI.full.length,
        histogram:actualAI.histogram.slice(0, 8)},
      AIO:{bestMatchedLeading:actualAIO.best,
        survivors:actualAIO.full.length,
        histogram:actualAIO.histogram.slice(0, 9)},
      singularPrimeStartCases:actualAI.singularStarts},
    null: {description:'100 xorshift32 preserved-singleton-histogram shuffles',
      seed:'0x25371411', AI:controlsAI, AIO:controlsAIO},
    sourceNativePlant: {seed:key, recoveredKeys:recovered.full,
      originalCipherReproduced:reencryption.length,
      recoveredPlaintextRunes:recoveredPlain.length,
      fullyUntouchedOriginalP40P53: false},
    conclusion:'No candidate survives first 5 A/I or first 7 A/I/O printed singleton constraints; no unknown plaintext'
  }, null, 2));
}
main();
