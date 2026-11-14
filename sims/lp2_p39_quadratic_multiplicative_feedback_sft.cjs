'use strict';

/**
 * p39 red quadratic as a multiplicative ciphertext-feedback key.
 * Run from repository root:
 *   node sims/lp2_p39_quadratic_multiplicative_feedback_sft.cjs
 * Node 22, built-ins only. This is a bounded negative, not a recovered cipher.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {parseLP2Words} = require('./lp2_word_pages.cjs');

const root = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcript = read('resources/liber-primus/lp2-transcription.txt');
const lexiconText = read('resources/control/english_wordfreq_textblob.txt');
const shakespeare = read('resources/control/shakespeare_first300k.txt');
const gibran = read('resources/control/gibran_prophet_58585.txt');

const mod = (n) => ((n % 29) + 29) % 29;
function inverse(a) {
  a = mod(a);
  assert.notEqual(a, 0, 'multiplicative key must be nonzero');
  for (let x = 1; x < 29; x++) if (mod(a * x) === 1) return x;
  throw new Error('GF(29) inverse missing');
}
function pow29(base, exponent) {
  let e = ((exponent % 28) + 28) % 28;
  let b = mod(base);
  let out = 1;
  while (e) {
    if (e & 1) out = mod(out * b);
    b = mod(b * b);
    e = Math.floor(e / 2);
  }
  return out;
}
function stateSequence(a, b, length) {
  const s = [mod(a), mod(b)];
  for (let i = 2; i < length; i++) {
    s.push(mod(19 * s[i - 1] + 4 * s[i - 2]));
  }
  return s.slice(0, length);
}

const redTriad = corpus.pages.find((p) => p.page === 39).indices.slice(119, 122);
assert.deepEqual(redTriad, [27, 5, 15]);
const inverse15 = inverse(15);
assert.equal(mod(5 * inverse15), 10);
assert.equal(mod(27 * inverse15), 25);
assert.equal(mod(-10), 19);
assert.equal(mod(-25), 4);
for (let x = 0; x < 29; x++) {
  assert.equal(mod(27 + 5 * x + 15 * x * x),
    mod(15 * (x - 24) * (x - 24)));
}
assert.equal(pow29(24, 7), 1);
assert.notEqual(pow29(24, 1), 1);
assert.equal(pow29(15, 28), 1);
for (const d of [1, 2, 4, 7, 14]) assert.notEqual(pow29(15, d), 1);

const chapter = corpus.pages
  .filter((p) => p.page >= 40 && p.page <= 53)
  .flatMap((p) => p.indices);
assert.equal(chapter.length, 3008);
const heading = chapter.slice(0, 8);
const iv = heading[7];
assert.equal(iv, 8);
const cipher = chapter.slice(8);
assert.equal(cipher.length, 3000);

const parsed = parseLP2Words(transcript);
assert.equal(parsed.words.length, 2896);
assert.equal(parsed.runeCount, 12956);
const targetWords = parsed.words
  .filter((w) => w.startPage >= 40 && w.startPage <= 52)
  .slice(2);
const lengths = targetWords.map((w) => w.length);
assert.equal(lengths.length, 667);
assert.equal(lengths.reduce((a, b) => a + b, 0), cipher.length);

const tokens = corpus.translit.map((token, i) => ({token, i}))
  .sort((a, b) => b.token.length - a.token.length);
function encode(word) {
  const w = word.toUpperCase()
    .replace(/QU/g, 'CW')
    .replace(/V/g, 'U')
    .replace(/K/g, 'C')
    .replace(/Z/g, 'S')
    .replace(/ING/g, 'NG')
    .replace(/IO/g, 'IA');
  const out = [];
  for (let p = 0; p < w.length;) {
    const hit = tokens.find((t) => w.startsWith(t.token, p));
    if (!hit) return null;
    out.push(hit.i);
    p += hit.token.length;
  }
  return out;
}

const lexicon = new Set();
for (const m of lexiconText.matchAll(/^([a-z]+) (\d+)$/gm)) {
  const encoded = encode(m[1]);
  if (encoded) lexicon.add(encoded.join(','));
}
assert.equal(lexicon.size, 29058);

const bigrams = Array.from({length: 29}, () => new Float64Array(29));
const bigramTotals = new Float64Array(29);
for (const word of shakespeare.match(/[A-Za-z]+/g) || []) {
  const encoded = encode(word);
  if (!encoded) continue;
  for (let i = 1; i < encoded.length; i++) {
    bigrams[encoded[i - 1]][encoded[i]]++;
    bigramTotals[encoded[i - 1]]++;
  }
}

function scorePlain(plain) {
  let offset = 0;
  let wordMatches = 0;
  let longMatches = 0;
  let logScore = 0;
  let transitions = 0;
  for (const length of lengths) {
    const word = plain.slice(offset, offset + length);
    offset += length;
    if (lexicon.has(word.join(','))) {
      wordMatches++;
      if (length >= 6) longMatches++;
    }
    for (let i = 1; i < word.length; i++) {
      const previous = word[i - 1];
      logScore += Math.log((bigrams[previous][word[i]] + 0.1) /
        (bigramTotals[previous] + 2.9));
      transitions++;
    }
  }
  assert.equal(offset, plain.length);
  return {wordMatches, longMatches, bigram: logScore / transitions};
}

function encrypt(plain, initialCipher, key) {
  let previous = initialCipher;
  const out = [];
  for (let i = 0; i < plain.length; i++) {
    const c = mod(previous + key[i % key.length] * (plain[i] + 1));
    out.push(c);
    previous = c;
  }
  return out;
}
function decrypt(ciphertext, initialCipher, key) {
  let previous = initialCipher;
  const out = [];
  for (let i = 0; i < ciphertext.length; i++) {
    const c = ciphertext[i];
    const delta = mod(c - previous);
    out.push(mod(delta * inverse(key[i % key.length]) - 1));
    previous = c;
  }
  return out;
}
function sameArray(a, b) {
  assert.equal(a.length, b.length);
  for (let i = 0; i < a.length; i++) assert.equal(a[i], b[i], 'rune ' + i);
}
function summarize(values) {
  const sorted = [...values].sort((a, b) => a - b);
  return {min: sorted[0], median: sorted[Math.floor(sorted.length / 2)],
    max: sorted[sorted.length - 1]};
}
function bestBy(results, field) {
  return results.reduce((best, item) =>
    item.score[field] > best.score[field] ? item : best);
}
function bestMatches(results) {
  return [...results].sort((a, b) =>
    b.score.wordMatches - a.score.wordMatches ||
    b.score.bigram - a.score.bigram)[0];
}

// Every direct state sequence must be nonzero to define an invertible
// multiplier. The repeated-root recurrence has only 28 such seed pairs.
const directSeeds = [];
for (let a = 0; a < 29; a++) {
  for (let b = 0; b < 29; b++) {
    const state = stateSequence(a, b, 203);
    if (state.every((x) => x !== 0)) directSeeds.push([a, b]);
  }
}
assert.equal(directSeeds.length, 28);
sameArray(directSeeds.flat(), Array.from({length: 28}, (_, i) =>
  [i + 1, mod(24 * (i + 1))]).flat());

// Direct state multipliers K_i=s_i: all and only the 28 lossless seeds.
const directResults = [];
for (const [a, b] of directSeeds) {
  const key = stateSequence(a, b, 203);
  const plain = decrypt(cipher, iv, key);
  sameArray(encrypt(plain, iv, key), cipher);
  directResults.push({seed: [a, b], score: scorePlain(plain)});
}

// The printed leading coefficient 15 is a primitive root modulo 29.
// Exponentiating every possible secret state gives a nonzero multiplier,
// so all 841 initial state pairs and both group directions are admissible.
const exponentResults = [];
for (let a = 0; a < 29; a++) {
  for (let b = 0; b < 29; b++) {
    const state = stateSequence(a, b, 203);
    for (const direction of [1, -1]) {
      const key = state.map((s) => pow29(15, direction * s));
      const plain = decrypt(cipher, iv, key);
      sameArray(encrypt(plain, iv, key), cipher);
      exponentResults.push({seed: [a, b], direction, score: scorePlain(plain)});
    }
  }
}
assert.equal(exponentResults.length, 1682);
const exponentMaxMatches = Math.max(...exponentResults.map((x) => x.score.wordMatches));
const exponentMaxLong = Math.max(...exponentResults.map((x) => x.score.longMatches));
const exponentBestByMatches = bestMatches(exponentResults);
const exponentBestByBigram = bestBy(exponentResults, 'bigram');
assert.equal(exponentMaxMatches, 56);
assert.equal(exponentMaxLong, 0);
assert(Math.abs(exponentBestByBigram.score.bigram - (-6.0516846999)) < 0.00002);

const directMaxMatches = Math.max(...directResults.map((x) => x.score.wordMatches));
const directMaxLong = Math.max(...directResults.map((x) => x.score.longMatches));
const directBestByBigram = bestBy(directResults, 'bigram');
assert.equal(directMaxMatches, 50);
assert.equal(directMaxLong, 0);

const rawScore = scorePlain(cipher);
assert.equal(rawScore.wordMatches, 39);
assert.equal(rawScore.longMatches, 0);

// Independent positive plant: solved p57 plus EACH (which includes GP-EA).
const each = encode('EACH');
assert.deepEqual(each, [28, 5, 8]);
const plant = corpus.pages.find((p) => p.page === 57).indices.concat(each);
assert.equal(plant.length, 98);
const plantState = stateSequence(8, 0, plant.length);
const plantExponentKey = plantState.map((s) => pow29(15, s));
const exponentPlantCipher = encrypt(plant, iv, plantExponentKey);
sameArray(decrypt(exponentPlantCipher, iv, plantExponentKey), plant);
const directPlantKey = stateSequence(1, 24, plant.length);
const directPlantCipher = encrypt(plant, iv, directPlantKey);
sameArray(decrypt(directPlantCipher, iv, directPlantKey), plant);
function zeroStepCount(ciphertext, initialCipher) {
  let previous = initialCipher;
  let count = 0;
  for (const c of ciphertext) {
    if (c === previous) count++;
    previous = c;
  }
  return count;
}
const expectedZeroSteps = plant.filter((p) => p === 28).length;
assert.equal(zeroStepCount(exponentPlantCipher, iv), expectedZeroSteps);
assert.equal(zeroStepCount(directPlantCipher, iv), expectedZeroSteps);

// Exact original-word-length native controls, selected without ciphertext data.
const pools = Array.from({length: 40}, () => []);
for (const word of gibran.match(/[A-Za-z]+/g) || []) {
  const encoded = encode(word);
  if (encoded && encoded.length < pools.length) pools[encoded.length].push(encoded);
}
let randomState = 0x290203;
function random32() {
  randomState ^= randomState << 13;
  randomState ^= randomState >>> 17;
  randomState ^= randomState << 5;
  randomState >>>= 0;
  return randomState;
}
const controls = [];
for (let trial = 0; trial < 300; trial++) {
  const native = [];
  for (const length of lengths) {
    const pool = pools[length];
    assert(pool.length > 0, 'missing native word-length pool ' + length);
    native.push(...pool[random32() % pool.length]);
  }
  controls.push(scorePlain(native));
}
assert.equal(controls.length, 300);
const controlMatches = summarize(controls.map((x) => x.wordMatches));
const controlLongMatches = summarize(controls.map((x) => x.longMatches));
const controlBigram = summarize(controls.map((x) => x.bigram));
assert.deepEqual(controlMatches, {min: 638, median: 650, max: 658});
assert.deepEqual(controlLongMatches, {min: 158, median: 169, max: 176});
assert(Math.abs(controlBigram.min - (-2.42088)) < 0.00002);
assert(Math.abs(controlBigram.median - (-2.36479)) < 0.00002);
assert(Math.abs(controlBigram.max - (-2.29610)) < 0.00002);

console.log(JSON.stringify({
  source: {
    redTriad: redTriad,
    polynomial: '27 + 5x + 15x^2 = 15(x-24)^2 over GF(29)',
    recurrence: 's[n+2] = 19*s[n+1] + 4*s[n] mod 29',
    primitiveRoot: 15,
    primitiveRootOrder: 28,
    target: 'original p40-p53 black body after the eight-rune red heading',
    runes: cipher.length,
    words: lengths.length,
    initialCipherIV: iv,
    formula: 'C[i] = C[i-1] + K[i]*(P[i]+1) mod 29'
  },
  directStateMultipliers: {
    seedPairs: directSeeds.length,
    maxExactDictionaryWords: directMaxMatches,
    maxWordsLengthAtLeastSix: directMaxLong,
    bestBigramCandidate: directBestByBigram
  },
  primitiveRootExponentMultipliers: {
    seedPairs: 841,
    directions: 2,
    completeInverses: exponentResults.length,
    maxExactDictionaryWords: exponentMaxMatches,
    maxWordsLengthAtLeastSix: exponentMaxLong,
    bestByDictionary: exponentBestByMatches,
    bestByBigram: exponentBestByBigram
  },
  rawCiphertext: rawScore,
  nativeControls: {
    count: controls.length,
    exactDictionaryWords: controlMatches,
    wordsLengthAtLeastSix: controlLongMatches,
    bigram: controlBigram
  },
  positivePlant: {
    input: 'solved original p57 plus EACH',
    runes: plant.length,
    containsEA: true,
    exponentModelExact: true,
    directModelExact: true,
    zeroStepsEqualEAcount: true
  },
  decision: 'No unknown plaintext or authentic key. Both exact p39-derived multiplicative-feedback mappings are rejected for direct GP29 English on original p40-p53; this does not exclude other uses of the p39 clue or a different symbol transport.'
}, null, 2));
