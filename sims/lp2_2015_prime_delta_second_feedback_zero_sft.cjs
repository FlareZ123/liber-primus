'use strict';

/**
 * Original 2015 p0–2 prime-then-difference register, followed by an arbitrary
 * all-nonzero-multiplier fixed-zero GP29 ciphertext-feedback decoder.
 *
 * Node.js 22 CommonJS, read-only, from repository root:
 *   node sims/lp2_2015_prime_delta_second_feedback_zero_sft.cjs
 *
 * Distinct from unkeyed double-differencing: the second stage grants a fully
 * secret reversible nonzero multiplier K[i] at every rune, with ANY zero label
 * s chosen per book, chapter, physical page, or printed word.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {parseLP2Words} = require('./lp2_word_pages.cjs');
const root = path.resolve(__dirname, '..');
/** @param {string} p */
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcription = read('resources/liber-primus/lp2-transcription.txt');
const mod = x => ((x % 29) + 29) % 29;

/** @param {number} a */
function inverse(a) {
  for (let i = 1; i < 29; i++) if (mod(a * i) === 1) return i;
  throw new Error('Expected nonzero GF29 multiplier');
}
/** @param {number} length */
function firstPrimes(length) {
  const result = [];
  for (let n = 2; result.length < length; n++) {
    let prime = true;
    for (let k = 2; k * k <= n; k++)
      if (n % k === 0) { prime = false; break; }
    if (prime) result.push(n);
  }
  return result;
}

/**
 * First-stage historical original-operation D:
 * S[-1] = -2 mod29 (imagined F with prime 2);
 * S[i] = (C[i] - prime[i+1]) mod29;
 * D[i] = S[i] - S[i-1] mod29.
 * @param {number[]} cipher
 * @param {number[]} primes
 */
function firstStage(cipher, primes) {
  let previousShift = 27;
  const result = [];
  for (let i = 0; i < cipher.length; i++) {
    const shifted = mod(cipher[i] - primes[i + 1]);
    result.push(mod(shifted - previousShift));
    previousShift = shifted;
  }
  return result;
}

/** @param {number[]} d @param {number[]} primes */
function inverseFirstStage(d, primes) {
  let shifted = 27;
  return d.map((step, i) => {
    shifted = mod(shifted + step);
    return mod(shifted + primes[i + 1]);
  });
}

const original = corpus.pages.filter(p => p.page <= 2)
  .flatMap(p => p.indices);
assert.equal(original.length, 729);
const primes = firstPrimes(730);
assert.deepEqual(primes.slice(0, 5), [2, 3, 5, 7, 11]);
const transformed = firstStage(original, primes);
assert.deepEqual(inverseFirstStage(transformed, primes), original);
const equalPairs = transformed.slice(1)
  .filter((x, i) => x === transformed[i]).length;
assert.equal(equalPairs, 40);

// Important: '%' and '/' merely mark pages and line wraps. They do not
// terminate the authentic printed words, two of which cross these pages.
const words = parseLP2Words(transcription, 3).words;
assert.equal(words.length, 158);
assert.equal(words.reduce((s, w) => s + w.length, 0), original.length);
assert.equal(words.filter(w => w.startPage !== w.endPage).length, 2);
let offset = 0;
const joined = [];
for (const w of words) {
  joined.push({...w, offset, derived: transformed.slice(offset, offset + w.length)});
  offset += w.length;
}
const witness = joined.find(w => w.offset === 543);
assert.ok(witness);
assert.equal(witness.startPage, 2);
assert.equal(witness.length, 6);
assert.equal(witness.runes, 'ᚾᚻᛒᛖᚷᛇ');
assert.deepEqual(witness.derived, [15, 26, 26, 26, 26, 13]);
assert.deepEqual([2, 3, 4], [2, 3, 4].filter(i =>
  witness.derived[i] === witness.derived[i - 1]));
console.log('Original p2 word (global offset543):', witness.runes,
  'source GP:', [...witness.runes]
    .map(r => corpus.translit[corpus.runes.indexOf(r)]).join(' '),
  'historical D:', witness.derived.map(i => corpus.translit[i]).join(' '));

// This word's D equalities force P[2]=P[3]=P[4]=s for any feedback inverse
// P[i]=s + K[i]^-1 (D[i]-D[i-1]), however K[i] changes and however a
// predecessor/IV is selected at the beginning of a page or a word.
const tokens = corpus.translit.map((token, i) => ({token, i}))
  .sort((a, b) => b.token.length - a.token.length);
/** @param {string} s @returns {number[] | null} */
function encode(s) {
  const w = s.toUpperCase()
    .replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/K/g, 'C').replace(/Z/g, 'S')
    .replace(/ING/g, 'NG').replace(/IO/g, 'IA');
  const out = [];
  for (let i = 0; i < w.length;) {
    const tok = tokens.find(t => w.startsWith(t.token, i));
    if (!tok) return null;
    out.push(tok.i);
    i += tok.token.length;
  }
  return out;
}

let dictionaryEntries = 0;
let encodedEntries = 0;
let length6Entries = 0;
let matched = 0;
const allowed = new Set();
for (const m of read('resources/control/english_wordfreq_textblob.txt')
  .matchAll(/^([a-z]+) (\d+)$/gm)) {
  dictionaryEntries++;
  const w = encode(m[1]);
  if (!w) continue;
  encodedEntries++;
  if (w.length !== 6) continue;
  length6Entries++;
  if (w[2] === w[3] && w[3] === w[4]) {
    matched++;
    allowed.add(w[2]);
  }
}
assert.equal(dictionaryEntries, 29157);
assert.equal(encodedEntries, 29154);
assert.equal(matched, 0);
assert.equal(allowed.size, 0);

// Independent p57 known native-GP plaintext positive for both composed
// transformations: arbitrary changing nonzero K, s and D predecessor,
// fixed source-era prime-then-difference first layer.
const clear = corpus.pages.find(p => p.page === 57).indices;
assert.equal(clear.length, 95);
const plantPrimes = firstPrimes(clear.length + 1);
for (const zeroSymbol of [0, 18, 28]) {
  let dPrev = 3;
  const producedD = clear.map((plain, i) => {
    const key = (i % 28) + 1;
    const next = mod(dPrev + key * (plain - zeroSymbol));
    dPrev = next;
    return next;
  });
  const plantedCipher = inverseFirstStage(producedD, plantPrimes);
  assert.deepEqual(firstStage(plantedCipher, plantPrimes), producedD);
  let previousD = 3;
  const recovered = firstStage(plantedCipher, plantPrimes)
    .map((step, i) => {
      const key = (i % 28) + 1;
      const plain = mod(zeroSymbol + inverse(key) * (step - previousD));
      previousD = step;
      return plain;
    });
  assert.deepEqual(recovered, clear);
  console.log('Two-layer solved p57 native positive:', clear.length,
    'runes, s=', corpus.translit[zeroSymbol]);
}
console.log('ORIGINAL D length:', transformed.length,
  'historical adjacent equals:', equalPairs,
  'word length6 dictionary entries:', length6Entries,
  'matching any triple GP symbol at positions 2,3,4:', matched);
console.log('DECISION: historical prime-delta on original p0–2 followed by',
  'any nonzero-multiplier constant-zero feedback stage cannot directly',
  'produce the tested source-native English register with preserved words.');
