'use strict';

/**
 * Historical 464-prime family gate for original LP2 visual chapters.
 * Read-only single-file test; Node.js 22, CommonJS, built-in modules only.
 *
 * Scope: fully branch-exhausted literal-plaintext-F bypass under Cicada's
 * authentically solved p56 prime-totient rule, with every possible starting
 * prime ordinal in the 2013 464-prime (2 through 3301) source register.
 * This is a necessary-condition test, not an unknown-key decipherment.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, '../resources/liber-primus/lp2-corpus.json'), 'utf8'
));
const pages = corpus.pages;
const sections = [0, 3, 8, 15, 23, 27, 33, 40, 54, 56];
const expectedLengths = [729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308];
const expected = [
  [[0, 565, 306], [0, 497, 393]],
  [[0, 332, 331], [0, 355, 237]],
  [[0, 271, 144], [0, 277, 43]],
  [[0, 249, 221], [0, 369, 75]],
  [[0, 495, 387], [0, 282, 366]],
  [[0, 505, 265], [0, 531, 11]],
  [[0, 594, 423], [0, 420, 98]],
  [[0, 628, 283], [0, 329, 393]],
  [[2, 308, 167], [0, 213, 222]]
];
const labels = 'F U TH O R C G W H N I J EO P X S T B E M L NG OE D A AE Y IA EA'.split(' ');

/** @returns {number[]} First 4000 ordinary primes in ascending order. */
function primes4000() {
  /** @type {number[]} */
  const out = [];
  for (let n = 2; out.length < 4000; n++) {
    let prime = true;
    for (const p of out) {
      if (p * p > n) break;
      if (n % p === 0) { prime = false; break; }
    }
    if (prime) out.push(n);
  }
  return out;
}
const primes = primes4000();
assert.equal(primes[0], 2);
assert.equal(primes[463], 3301);

/**
 * Branch-exhaustive exact F-skip viability, with no language scoring.
 * @param {number[]} cipher Original unaltered GP29 ciphertext.
 * @param {number} start Zero-based starting prime ordinal.
 * @param {1|-1} sign Forward sign in C = P + sign * (prime-1).
 * @returns {number} Original prefix length admitting at least one legal state.
 */
function reach(cipher, start, sign) {
  /** @type {Set<number>} */
  let consumed = new Set([0]);
  for (let i = 0; i < cipher.length; i++) {
    const next = new Set();
    for (const k of consumed) {
      const delta = (primes[start + k] - 1) % 29;
      const plain = (cipher[i] - sign * delta + 29) % 29;
      if (plain !== 0) next.add(k + 1);
      if (cipher[i] === 0) next.add(k);
    }
    if (next.size === 0) return i;
    consumed = next;
  }
  return cipher.length;
}

/**
 * Enumerate all complete legal plaintext branches for one short chapter.
 * @param {number[]} cipher
 * @param {number} start
 * @param {1|-1} sign
 * @returns {{consumed:number, plain:number[], skips:number[]}[]}
 */
function decodeFull(cipher, start, sign) {
  let states = [{ consumed: 0, plain: [], skips: [] }];
  for (let i = 0; i < cipher.length; i++) {
    const next = [];
    for (const state of states) {
      const delta = (primes[start + state.consumed] - 1) % 29;
      const plain = (cipher[i] - sign * delta + 29) % 29;
      if (plain !== 0) next.push({
        consumed: state.consumed + 1,
        plain: [...state.plain, plain],
        skips: state.skips
      });
      if (cipher[i] === 0) next.push({
        consumed: state.consumed,
        plain: [...state.plain, 0],
        skips: [...state.skips, i]
      });
    }
    states = next;
  }
  return states;
}

/**
 * Authentic p56-style forward cipher. Literal plaintext F never consumes key.
 * @param {number[]} plain
 * @param {number} start
 * @param {1|-1} sign
 * @returns {number[]}
 */
function encrypt(plain, start, sign) {
  let used = 0;
  return plain.map(p => {
    if (p === 0) return 0;
    const delta = (primes[start + used++] - 1) % 29;
    return (p + sign * delta + 29) % 29;
  });
}

/** @param {number[]} a @returns {number} */
function ioc(a) {
  const counts = Array(29).fill(0);
  for (const x of a) counts[x]++;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0)
    / (a.length * (a.length - 1));
}

assert.equal(pages.length, 58);
assert.equal(pages.slice(0, 56).reduce((n, p) => n + p.indices.length, 0), 12956);
const chapterTapes = [];
for (let chapter = 0; chapter < 9; chapter++) {
  const cipher = pages.slice(sections[chapter], sections[chapter + 1])
    .flatMap(p => p.indices);
  assert.equal(cipher.length, expectedLengths[chapter]);
  chapterTapes.push(cipher);
}

// Solved original p56 control. Its historical actual literal-F bypass is local56.
const known = pages[56].indices;
const solved = decodeFull(known, 0, 1).find(x =>
  x.skips.length === 1 && x.skips[0] === 56
);
assert.ok(solved, 'known p56 path with its authentic literal F at 56');
assert.deepEqual(solved.plain.slice(0, 5), [24, 9, 18, 9, 23]); // AN END
assert.equal(solved.plain[56], 0);
assert.deepEqual(encrypt(solved.plain, 0, 1), known);
assert.equal(reach(known, 0, 1), 85);

// Blind source-native full-length plant with a hidden historical start.
const plantPlain = Array.from({ length: 308 },
  (_, i) => pages[57].indices[i % pages[57].indices.length]);
const plantCipher = encrypt(plantPlain, 167, 1);
assert.equal(reach(plantCipher, 167, 1), 308);
assert.ok(decodeFull(plantCipher, 167, 1)
  .some(x => x.plain.every((v, i) => v === plantPlain[i])));
console.log('p56 genuine solved-source control: 85/85; 308-rune native plant: 308/308');

for (let chapter = 0; chapter < 9; chapter++) {
  const cipher = chapterTapes[chapter];
  for (const [s, sign] of /** @type {[number,1|-1][]} */ ([[0, 1], [1, -1]])) {
    let maxReach = -1;
    let bestStart = -1;
    const survivors = [];
    for (let start = 0; start < 464; start++) {
      const end = reach(cipher, start, sign);
      if (end > maxReach) { maxReach = end; bestStart = start; }
      if (end === cipher.length) survivors.push(start);
    }
    assert.deepEqual([survivors.length, maxReach, bestStart], expected[chapter][s]);
    console.log('pp' + sections[chapter] + '-' + (sections[chapter + 1] - 1),
      'N=' + cipher.length, 'sign=' + sign,
      'survivors=' + JSON.stringify(survivors),
      'furthest=' + maxReach, 'at start=' + bestStart);
  }
}

const last = chapterTapes[8];
for (const start of [167, 168]) {
  const states = decodeFull(last, start, 1);
  assert.equal(states.length, start === 167 ? 2 : 1);
  for (const state of states) {
    assert.deepEqual(encrypt(state.plain, start, 1), last);
    const output = state.plain.map(x => labels[x]).join('');
    const coincidence = ioc(state.plain);
    assert.ok(coincidence > 0.034 && coincidence < 0.036);
    console.log('final source-original candidate start=' + start,
      'F-skip-at=' + JSON.stringify(state.skips),
      'IoC=' + coincidence.toFixed(9),
      'preview=' + output.slice(0, 100));
  }
}
console.log('RESULT: 8/9 unknown visual chapters have zero legal prime-F inverses');
console.log('All tested starting ranks are 0..463 from the 2013 2..3301 prime register.');
