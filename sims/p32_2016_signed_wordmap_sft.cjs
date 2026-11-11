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

// The final 22-word address is also an original-file structural boundary:
// ASCII LF immediately before the PGP signature's first base64 symbol.
assert.equal(steps.length, 22);
assert.equal(steps.reduce((n, step) => n + step, 0), 6045);
assert.equal(6045, 5 * signature.length + walk.at(-1));
assert.equal(signature[365], 10);
assert.equal(signature.subarray(366, 370).toString('ascii'), 'iQIc');
const decimalReverse = n => Number(String(n).split('').reverse().join(''));
assert.equal(decimalReverse(top), 365);
assert.equal(365, 5 * primes[0]);
const grid = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-grid-256.json'), 'utf8'));
const table50 = grid.pages.find(p => p.page === 50);
assert(table50);
assert.equal(table50.bytes[3], 193);
assert.equal(decimalReverse(left), 5 * table50.bytes[3]);

// The signed RSA signature is one possible key source under the source walk.
// Freeze complete packet/MPI and their natural octet/mod29 or 2013 BASE29
// encodings. No key phase, clock offset, secret alphabet, or candidate
// plaintext is fitted to the unknown book.
const armored = signature.toString('utf8').match(
  /-----BEGIN PGP SIGNATURE-----\r?\nVersion: [^\r\n]+\r?\n\r?\n([\s\S]*?)\r?\n-----END PGP SIGNATURE-----/u);
assert(armored);
const packet = Buffer.from(armored[1].split(/\r?\n/u)
  .filter(line => line && !line.startsWith('=')).join(''), 'base64');
assert.equal(packet.length, 543);
assert.equal(packet.readUInt16BE(1), 540);
const rsaMpi = packet.subarray(-512);
assert.equal(rsaMpi.length, 512);
/** @param {Buffer} bytes @returns {number[]} */
function numeral29(bytes) {
  let number = BigInt('0x' + bytes.toString('hex'));
  const digits = [];
  while (number > 0n) {
    digits.unshift(Number(number % 29n));
    number /= 29n;
  }
  return digits;
}
/** @param {number[]} input @returns {number} */
function ioc(input) {
  const counts = Array(29).fill(0);
  for (const value of input) counts[value]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (input.length * (input.length - 1));
}
const fullUnknown = corpus.pages.filter(p => p.page < 56 && p.indices.length);
const sourceCipher = fullUnknown.flatMap(p => p.indices);
assert.equal(sourceCipher.length, 12956);
const keySources = [
  ['packet-octet-remainder', [...packet].map(x => x % 29)],
  ['packet-whole-base29', numeral29(packet)],
  ['rsa-mpi-octet-remainder', [...rsaMpi].map(x => x % 29)],
  ['rsa-mpi-whole-base29', numeral29(rsaMpi)]
];
assert.deepEqual(keySources.map(([, key]) => key.length), [543, 895, 512, 843]);
const to29 = value => (value % 29 + 29) % 29;
const directSignatureTests = [];
for (const [keyName, key] of keySources) {
  for (const sign of [-1, 1]) {
    for (const clock of ['global', 'page']) {
      const decoded = [];
      let keyPosition = 0;
      for (const original of fullUnknown) {
        if (clock === 'page') keyPosition = 0;
        for (const ciphertext of original.indices) {
          const k = key[keyPosition % key.length];
          const plaintext = to29(ciphertext + sign * k);
          assert.equal(to29(plaintext - sign * k), ciphertext);
          decoded.push(plaintext);
          keyPosition++;
        }
      }
      assert.equal(decoded.length, sourceCipher.length);
      directSignatureTests.push({
        keyName, period: key.length, sign, clock, ioc: ioc(decoded),
        prefix: decoded.slice(0, 24).map(i => corpus.translit[i]).join('')
      });
    }
  }
}
const signatureIocRange = [
  Math.min(...directSignatureTests.map(x => x.ioc)),
  Math.max(...directSignatureTests.map(x => x.ioc))
];
assert(signatureIocRange[0] > 0.03445 && signatureIocRange[1] < 0.03453);
assert.equal(directSignatureTests.length, 16);


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
  allWordFinalPosition: walk.at(-1), signatureBase64Start: 366,
  reversedDimensions: {width: decimalReverse(top), height: decimalReverse(left),
    p32FirstPrime: primes[0], signedLiesTableByte: table50.bytes[3]},
  directSignatureTests: {sourceCipherIoC: ioc(sourceCipher),
    nativeSolvedP57IoC: ioc(corpus.pages[57].indices),
    variants: directSignatureTests.length, range: signatureIocRange,
    candidates: directSignatureTests},
  conditionalNull: { trials, count },
  status: 'Source-based navigation candidate, no LP2 plaintext or key recovered'
}, null, 2));
