'use strict';
/**
 * Standalone original-LP2 GP29 source test for the first-difference cipher
 * with completely independent affine keys on every printed word.
 *
 * For each word of length L >= 7, test whether
 *   (C[i]-C[i-1]) mod 29 = a_word * P[i] + b_word (mod 29), 1 <= i < L.
 * The unknown first plaintext rune is ignored. a_word can be any 1..28,
 * b_word any 0..28, and there are no shared-key constraints.
 *
 * Two fixed input registers: raw original ciphertext throughout p0..p55,
 * and the historically witnessed 2015 minus-successive-primes operation
 * on original p0..p2 with first real rune using prime3.
 *
 * Run from the repository: node sims/lp2_wordwise_firstdifference_affine_sft.cjs
 *
 * @typedef {{name:string,gp:number[]}} NativeWord
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} name @returns {string} */
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const cipher = corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
assert.equal(cipher.length, 12956);

const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
/** @type {number[][]} */
const words = [];
/** @type {number[]} */
const offsets = [];
let current = [], counted = 0;
for (const char of read('resources/liber-primus/lp2-transcription.txt')) {
  if (runeIndex.has(char)) {
    if (counted + current.length === cipher.length) break;
    current.push(runeIndex.get(char));
  } else if ('- .&$§'.includes(char) && current.length) {
    offsets.push(counted);
    words.push(current);
    counted += current.length;
    current = [];
  }
}
if (current.length) {
  offsets.push(counted);
  words.push(current);
  counted += current.length;
}
assert.equal(counted, cipher.length);
assert.equal(words.length, 2896);
assert.deepEqual(words.flat(), cipher);

const tokens = corpus.translit.map((value, index) => ({value, index}))
  .sort((a, b) => b.value.length - a.value.length);
/**
 * Native GP orthography, including the original single-rune ING and IO.
 * @param {string} spelling
 * @returns {number[]}
 */
function encode(spelling) {
  const s = spelling.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const result = [];
  for (let i = 0; i < s.length;) {
    if (s.startsWith('ING', i)) {
      result.push(21);
      i += 3;
    } else if (s.startsWith('IO', i)) {
      result.push(27);
      i += 2;
    } else {
      const token = tokens.find(t => s.startsWith(t.value, i));
      assert(token, 'Missing GP spelling for ' + spelling);
      result.push(token.index);
      i += token.value.length;
    }
  }
  return result;
}
assert.deepEqual(encode('FOLLOWING'), [0, 3, 20, 20, 3, 7, 21]);
assert.deepEqual(encode('FUNCTION'), [0, 1, 9, 5, 16, 27, 9]);

const lexicon = read('resources/control/english_wordfreq_textblob.txt')
  .split(/\r?\n/).filter(s => /^[a-z]+ \d+$/.test(s))
  .map(s => {
    const name = s.split(' ')[0];
    return {name, gp: encode(name)};
  });
assert.equal(lexicon.length, 29157);
/** @param {number} n @returns {number} */
const mod = n => ((n % 29) + 29) % 29;
/** @type {number[]} */
const inverses = Array.from({length: 29}, (_, v) => {
  for (let n = 1; n < 29; n++) if ((v * n) % 29 === 1) return n;
  return 0;
});
/**
 * Complete affine-equivalence invariant over GP29. The first symbol is
 * the origin and the first nonzero displacement is normalized to 1.
 * @param {number[]} seq
 * @returns {string}
 */
function signature(seq) {
  assert(seq.length >= 3);
  const differences = seq.slice(1).map(v => mod(v - seq[0]));
  const first = differences.find(v => v !== 0);
  const scalar = first === undefined ? 1 : inverses[first];
  return seq.length + ':' + differences.map(v => mod(v * scalar)).join(',');
}

/** @type {Map<string, string[]>} */
const reference = new Map();
for (const row of lexicon) {
  if (row.gp.length < 7) continue;
  const key = signature(row.gp.slice(1));
  if (!reference.has(key)) reference.set(key, []);
  reference.get(key).push(row.name);
}
/**
 * The exact source rule uses prime2 for an imagined preceding F and
 * prime3 for the first actual ciphertext symbol.
 * @param {number} count
 * @returns {number[]}
 */
function primesThrough(count) {
  const limit = 200000;
  const sieve = new Uint8Array(limit + 1).fill(1);
  sieve[0] = sieve[1] = 0;
  for (let p = 2; p * p <= limit; p++)
    if (sieve[p]) for (let j = p * p; j <= limit; j += p) sieve[j] = 0;
  const found = [];
  for (let i = 2; i <= limit && found.length < count; i++)
    if (sieve[i]) found.push(i);
  assert.equal(found.length, count);
  return found;
}
const primes = primesThrough(cipher.length + 1);
const primeShifted = cipher.map((v, i) => mod(v - primes[i + 1]));

/**
 * @param {number[]} tape
 * @param {(start:number,len:number)=>boolean} accept
 * @returns {{total:number,matches:number,byLength:Record<string,{total:number,matches:number}>}}
 */
function evaluate(tape, accept) {
  const byLength = {};
  let total = 0, matches = 0;
  for (let w = 0; w < words.length; w++) {
    const start = offsets[w], len = words[w].length;
    if (len < 7 || !accept(start, len)) continue;
    total++;
    if (!byLength[len]) byLength[len] = {total: 0, matches: 0};
    byLength[len].total++;
    const steps = [];
    for (let j = 1; j < len; j++)
      steps.push(mod(tape[start + j] - tape[start + j - 1]));
    if (reference.has(signature(steps))) {
      matches++;
      byLength[len].matches++;
    }
  }
  return {total, matches, byLength};
}
const raw = evaluate(cipher, () => true);
const historical = evaluate(primeShifted, (start, len) => start + len <= 729);
assert.deepEqual([raw.total, raw.matches], [559, 0]);
assert.deepEqual([historical.total, historical.matches], [38, 0]);

// Source-native planted positives with independent word keys and arbitrary
// first ciphertext rune. No original-ciphertext key inference occurs.
const plants = lexicon.filter(row => row.gp.length >= 7).slice(0, 200);
assert.equal(plants.length, 200);
for (const word of plants) {
  const result = [11];
  for (let i = 1; i < word.gp.length; i++)
    result.push(mod(result[i - 1] + 7 * word.gp[i] + 9));
  const steps = result.slice(1).map((v, i) => mod(v - result[i]));
  assert((reference.get(signature(steps)) || []).includes(word.name));
}
console.log(JSON.stringify({
  originalRunes: cipher.length,
  originalWords: words.length,
  sourceLexiconWords: lexicon.length,
  sourceLongWords: lexicon.filter(x => x.gp.length >= 7).length,
  raw,
  original2015PrimeDifferenceFirstChapter: historical,
  plantedPositive: plants.length
}, null, 2));
console.log('PASS: source-fixed original-input differential-affine English-register exclusion');
