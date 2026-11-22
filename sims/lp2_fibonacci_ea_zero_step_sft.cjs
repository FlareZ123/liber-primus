'use strict';
/**
 * Single-file test of Director #576's fixed Fibonacci GP28/EA transducer.
 * Run: node sims/lp2_fibonacci_ea_zero_step_sft.cjs
 * Native control and source codec live in ea_zero_step_reversible.cjs.
 * No key, phase, page-reset, or marker-location parameter is fitted.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { encrypt, decrypt, samplePlain, markerIndices } =
  require('./ea_zero_step_reversible.cjs');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root,
  'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const sourcePages = corpus.pages.filter(p => p.page < 56 && p.indices.length);
const original = sourcePages.map(p => p.indices);
const n = original.reduce((s, page) => s + page.length, 0);
assert.equal(n, 12956);
assert.equal(original.length, 55);

const flatten = pages => pages.flat();
/** @param {number[]} symbols @returns {number} */
function ioc(symbols) {
  const counts = new Uint32Array(29);
  for (const value of symbols) counts[value]++;
  return counts.reduce((sum, c) => sum + c * (c - 1), 0) /
    (symbols.length * (symbols.length - 1));
}

/** 
 * Book-continuous Fibonacci key, one clock tick per emitted rune, including
 * all physical page initials and literal zero-step markers.
 * @param {number} first
 * @param {number} second
 * @returns {number[][]} Exact per-page key arrays.
 */
function fibonacciKeys(first, second) {
  const stream = [first, second];
  for (let i = 2; i < n; i++)
    stream[i] = (stream[i - 2] + stream[i - 1]) % 28;
  let at = 0;
  const output = original.map(page => stream.slice(at, at += page.length));
  assert.equal(at, n);
  return output;
}

const keys = fibonacciKeys(1, 1);
const sequence = flatten(keys);
assert.deepEqual(sequence.slice(0, 10), [1,1,2,3,5,8,13,21,6,27]);
for (let i = 0; i < sequence.length - 48; i++)
  assert.equal(sequence[i], sequence[i + 48]);
assert.equal(new Set(sequence.slice(0, 48)).size, 21);
for (let p = 1; p < 48; p++)
  assert.ok(sequence.slice(0, 48 - p).some((x, i) => x !== sequence[i + p]));

const originalDecoded = decrypt(original, keys);
assert.deepEqual(encrypt(originalDecoded, keys), original);
assert.equal(markerIndices(original).positions.length, 86);
const decodedAll = flatten(originalDecoded);
const actualSections = [729,1145,1738,1894,1021,1433,1680,3316];
assert.equal(actualSections.reduce((a,b)=>a+b,0), n);
let at = 0;
const sections = actualSections.map((length, i) => {
  const a = decodedAll.slice(at, at += length);
  return { section: i + 1, runes: length,
    indexOfCoincidence: ioc(a),
    first40GP: a.slice(0,40).map(j=>corpus.translit[j]).join(''),
    transparentEA: a.filter(j=>j===28).length };
});
const firstGP = decodedAll.slice(0,100).map(j=>corpus.translit[j]).join('');
const lastGP = decodedAll.slice(-100).map(j=>corpus.translit[j]).join('');

/** Deterministic, noncryptographic test fixture generator. */
let state = 0x5763301;
function next() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return state >>> 0;
}
const nativePlant = samplePlain(next);
assert.equal(flatten(nativePlant).length, n);
const plantCipher = encrypt(nativePlant, keys);
const recovered = decrypt(plantCipher, keys);
assert.deepEqual(recovered, nativePlant);
assert.deepEqual(encrypt(recovered, keys), plantCipher);
// The wrong second Fibonacci seed is a fixed negative control, not a search.
const wrongKeys = fibonacciKeys(1, 2);
const wrongPlain = decrypt(plantCipher, wrongKeys);
const wrongMatches = flatten(wrongPlain).filter((p, i) =>
  p === flatten(nativePlant)[i]).length;
assert.ok(wrongMatches < n / 2);

const result = {
  hypothesis: 'Transparent EA GP28 root15-step codec; book-continuous Fibonacci mod28 key K0=K1=1',
  originalSource: { runes:n, pages:original.length, doublets:86,
    rawIoC:ioc(flatten(original)), keyPeriod:48 },
  decoded: { recoveredRunes:n, indexOfCoincidence:ioc(decodedAll),
    totalEA:decodedAll.filter(x=>x===28).length,
    sections, first100GP:firstGP, last100GP:lastGP },
  sourceNativePositive: { runes:n, plaintextIoC:ioc(flatten(nativePlant)),
    encryptedIoC:ioc(flatten(plantCipher)), recoveredExactly:n,
    wrongSeedMatches:wrongMatches },
  decision:'No identifiable original plaintext or independently authenticated key; do not extend with tuned seeds or phases.'
};
assert.equal(result.decoded.totalEA, 87);
assert.ok(result.decoded.indexOfCoincidence < 0.045);
assert.ok(result.sourceNativePositive.plaintextIoC > 0.045);
console.log(JSON.stringify(result, null, 2));
