'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const transcript = fs.readFileSync(path.join(root, 'resources/lp2-transcription.txt'), 'utf8');
const signature = fs.readFileSync(path.join(root, 'resources/historical/cicada2016-4gq25-outguess.asc'));
const page = corpus.pages.find((p) => p.page === 32);
const primes = page.indices.map((index) => corpus.prime[index]);
const primeOf = new Map(corpus.runes.map((rune, index) => [rune, corpus.prime[index]]));

/** @param {string} source @returns {string[]} */
function words(source) {
  return source.split('-').map((piece) => (piece.match(/[\u16A0-\u16FF]/gu) || []).join('')).filter(Boolean);
}

/** @param {string} word @returns {number} */
function weight(word) {
  return [...word].reduce((sum, rune) => sum + primeOf.get(rune), 0);
}

const clauses = transcript.split('%')[32].replace(/\/\s*/gu, '').split(/[.&$§]/u).map(words).filter((clause) => clause.length);
assert.deepEqual(clauses.map((clause) => clause.length), [7, 15]);
assert.deepEqual(clauses.map((clause) => clause.reduce((n, word) => n + [...word].length, 0)), [33, 88]);
assert.deepEqual(clauses[0].map((word) => [...word].length), [1, 3, 5, 11, 5, 5, 3]);
assert.equal(page.indices.length, 121);

const ring = [];
for (let c = 3; c <= 7; c++) ring.push(33 + c);
for (let r = 4; r <= 7; r++) ring.push(11 * r + 7);
for (let c = 6; c >= 3; c--) ring.push(77 + c);
for (let r = 6; r >= 4; r--) ring.push(11 * r + 3);

const first33 = primes.slice(0, 33).reduce((a, b) => a + b, 0);
const ringValues = ring.map((i) => primes[i]);
const perimeter = ringValues.reduce((a, b) => a + b, 0);
const top = primes.slice(0, 11).reduce((a, b) => a + b, 0);
const left = Array.from({ length: 11 }, (_, r) => primes[11 * r]).reduce((a, b) => a + b, 0);

const steps = clauses.flat().map(weight);
let state = 0;
const walk = steps.map((step) => state = (state + step) % signature.length);
const header = Buffer.from('-----BEGIN PGP SIGNATURE-----', 'ascii');
const begin = signature.indexOf(header);
const center = begin + Math.floor(header.length / 2);

assert.deepEqual([top, left], [563, 569]);
assert.deepEqual(ringValues, [67, 47, 19, 89, 53, 89, 107, 61, 37, 109, 107, 79, 41, 107, 17, 107]);
assert.deepEqual([first33, perimeter, first33 - perimeter, signature.length], [1467, 1136, 331, 1136]);
assert.deepEqual(steps.slice(0, 7), [73, 125, 267, 613, 191, 184, 14]);
assert.deepEqual(walk.slice(0, 7), [73, 198, 465, 1078, 133, 317, 331]);
assert.deepEqual([begin, header.length, center, signature[center], walk.at(-1)], [317, 29, 331, 32, 365]);

// Exact original-page multiset shuffle, fixing the 21 cells that specify both
// image dimensions. A conditional post-discovery null, not a discovery p-value.
const fixed = new Set([...Array.from({ length: 11 }, (_, i) => i), ...Array.from({ length: 11 }, (_, i) => i * 11)]);
const free = Array.from({ length: 121 }, (_, i) => i).filter((i) => !fixed.has(i));
const ringSet = new Set(ring);
const inner = free.flatMap((position, i) => ringSet.has(position) ? [i] : []);
const initial = free.flatMap((position, i) => position < 33 ? [i] : []);
const base = [...fixed].filter((p) => p < 33).reduce((sum, p) => sum + primes[p], 0);
const perm = free.map((position) => page.indices[position]);

let seed = 0x33011336;
/** @returns {number} Deterministic uniform 32-bit pseudorandom variate. */
function rand() {
  seed = (seed + 0x6D2B79F5) >>> 0;
  let x = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
  return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
}

const trials = 200000;
const count = { ring1136: 0, first1467: 0, difference331: 0, joint: 0, ringHigh: 0 };
for (let trial = 0; trial < trials; trial++) {
  for (let i = perm.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [perm[i], perm[j]] = [perm[j], perm[i]];
  }
  const r = inner.reduce((sum, i) => sum + corpus.prime[perm[i]], 0);
  const f = initial.reduce((sum, i) => sum + corpus.prime[perm[i]], base);
  if (r === 1136) count.ring1136++;
  if (f === 1467) count.first1467++;
  if (f - r === 331) count.difference331++;
  if (r === 1136 && f - r === 331) count.joint++;
  if (r >= 1136) count.ringHigh++;
}
assert.deepEqual(count, { ring1136: 26, first1467: 425, difference331: 31, joint: 1, ringHigh: 708 });

console.log(JSON.stringify({
  source: { page: 32, top, left, first33, ringValues, perimeter, difference: 331 },
  signedMessage: { bytes: signature.length, headerStart: begin, headerLength: header.length, headerCenter: center },
  firstSeven: { steps: steps.slice(0, 7), positions: walk.slice(0, 7) },
  allWordFinalPosition: walk.at(-1), conditionalNull: { trials, count },
  status: 'Source-based navigation candidate, no LP2 plaintext or key recovered'
}, null, 2));
