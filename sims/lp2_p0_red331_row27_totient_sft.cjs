'use strict';
/**
 * Original LP2 p0 red-title -> row27 -> phi(151) closed-loop candidate.
 * SFT: node sims/lp2_p0_red331_row27_totient_sft.cjs
 *
 * This is a source-linked hypothesis audit, not a decipherment.
 * Requires only canonical repository resources; no external packages.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), 'utf8');
}
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const ink = JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const transcript = read('resources/liber-primus/lp2-transcription.txt');
const lp1 = read('resources/liber-primus/lp1-plaintext-reference.txt');
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const mod = (x, m) => ((x % m) + m) % m;

/** @param {number} n @returns {number} */
function totient(n) {
  let remaining = n;
  let result = n;
  for (let p = 2; p * p <= remaining; p++) {
    if (remaining % p === 0) {
      while (remaining % p === 0) remaining /= p;
      result = result / p * (p - 1);
    }
  }
  if (remaining > 1) result = result / remaining * (remaining - 1);
  return result;
}

/** @returns {{indices:number[],primeSum:number,start:number}[]} */
function parseWords() {
  // Exactly as the canonical word parser: '%' is a physical page
  // boundary, '/' is a line wrap. Both may occur inside a printed word.
  const text = transcript.split('%').slice(0, 55).join('%');
  /** @type {{indices:number[],primeSum:number,start:number}[]} */
  const words = [];
  /** @type {number[]} */
  let current = [];
  let global = 0;
  const flush = () => {
    if (current.length) {
      words.push({
        indices: current,
        primeSum: current.reduce((sum, i) => sum + corpus.prime[i], 0),
        start: global - current.length
      });
      current = [];
    }
  };
  for (const char of text) {
    const index = runeIndex.get(char);
    if (index !== undefined) {
      current.push(index);
      global++;
    } else if (char === '/' || char === '%' || /\s/u.test(char)) {
      // Visual wraps and page carries do not divide printed words.
    } else {
      flush();
    }
  }
  flush();
  assert.equal(global, 12956);
  assert.equal(words.length, 2896);
  assert.deepEqual(
    words.flatMap(w => w.indices),
    corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices)
  );
  return words;
}

/** @param {number[]} symbols @returns {number} */
function indexOfCoincidence(symbols) {
  const histogram = Array(29).fill(0);
  for (const symbol of symbols) histogram[symbol]++;
  return histogram.reduce((s, n) => s + n * (n - 1), 0) /
    (symbols.length * (symbols.length - 1));
}

const words = parseWords();
const page0 = corpus.pages.find(p => p.page === 0);
assert.equal(page0.indices.length, 262);
assert.deepEqual(words[0].indices, [15, 8, 18, 3, 6, 19, 27, 0]);
assert.deepEqual(words[1].indices, [15, 26, 18, 21, 5]);
assert.equal(words[0].start, 0);
assert.equal(words[1].start, 8);
assert.equal(ink.pages.find(p => p.page === 0).red_spans[0].length, 13);
assert.deepEqual(ink.pages.find(p => p.page === 0).large_punctuation[0],
  [13, 13, 'red']);
const a = words[0].primeSum;
const b = words[1].primeSum;
assert.deepEqual([a, b], [347, 315]);
assert.equal(a - b, 32);
assert.equal((a + b) / 2, 331);
assert.equal(grid.bytes.length, 256);
const row = a % 32;
assert.equal(row, b % 32);
assert.equal(row, 27);
const rowBytes = grid.bytes.slice(row * 8, row * 8 + 8);
assert.deepEqual(rowBytes, [142, 219, 148, 59, 58, 52, 51, 151]);
assert.equal(rowBytes[7], 151);
assert.equal(grid.bytes.filter(x => x === 151).length, 1);
assert.match(lp1, /151\s+131\s+341\s+138\s+272/u);
assert.equal(totient(rowBytes[7]), 150);
assert.equal(a + b, 2 * grid.bytes.length + totient(rowBytes[7]));

// Competing published radix-59 reading of the same printed token 2V.
// This independent byte-codec ambiguity is documented by
// sims/base60_base59_source_ambiguity.cjs. The same arithmetic
// identity misses by two under radix 59, conditional on our row grammar.
const alphabet59 = grid.alphabet.replace('f', '');
assert.equal(alphabet59.length, 59);
const token151 = grid.pages.flatMap(p => p.tokens)[8 * row + 7];
assert.equal(token151, '2V');
const byte59 = alphabet59.indexOf(token151[0]) * 59 +
  alphabet59.indexOf(token151[1]);
assert.equal(byte59, 149);
assert.equal(totient(byte59), 148);
assert.equal(2 * grid.bytes.length + totient(byte59), 660);
assert.notEqual(a + b, 2 * grid.bytes.length + totient(byte59));


/** @typedef {{position:number,a:number,b:number,row:number,last:number,phi:number,lengths:number[]}} Match */
const matches = [];
let matchingLengths = 0;
for (let i = 0; i < words.length - 1; i++) {
  const left = words[i], right = words[i + 1];
  if (left.indices.length === 8 && right.indices.length === 5) matchingLengths++;
  const candidateRow = left.primeSum % 32;
  const last = grid.bytes[8 * candidateRow + 7];
  if (left.primeSum - right.primeSum === 32 &&
      left.primeSum + right.primeSum === 2 * grid.bytes.length + totient(last)) {
    matches.push({
      position: i,
      a: left.primeSum,
      b: right.primeSum,
      row: candidateRow,
      last,
      phi: totient(last),
      lengths: [left.indices.length, right.indices.length]
    });
  }
}
assert.equal(matchingLengths, 19);
assert.deepEqual(matches, [{
  position: 0, a: 347, b: 315, row: 27, last: 151,
  phi: 150, lengths: [8, 5]
}]);

// The minimal source-selected decoder is a direct repeating additive GP29
// key from the selected row, aligned after the 13 red heading runes.
// Both historical signs are checked. They fail a basic language screen.
const body = page0.indices.slice(13);
const reading = [];
for (const sign of [-1, 1]) {
  const decoded = body.map((c, i) => mod(c + sign * rowBytes[i % 8], 29));
  const encrypted = decoded.map((p, i) => mod(p - sign * rowBytes[i % 8], 29));
  assert.deepEqual(encrypted, body);
  reading.push({
    sign,
    ioc: indexOfCoincidence(decoded),
    head: decoded.slice(0, 70).map(i => corpus.translit[i]).join(' ')
  });
}
assert(Math.max(...reading.map(x => x.ioc)) < 0.04);

// A second literal consumer uses the uniquely selected prime 151 as the
// first value in p56's authenticated consecutive-prime/totient key.
// The true solved-page F transparency requires P=F to print C=F and
// consume no prime. This candidate becomes impossible at body rune 1.
assert.deepEqual(body.slice(0, 4), [2, 11, 6, 25]); // TH J G AE
const prime151First = mod(body[0] - totient(151), 29);
const prime157Second = mod(body[1] - totient(157), 29);
assert.equal(prime151First, 26); // Y, a legal first plaintext rune.
assert.equal(prime157Second, 0); // F would have to be printed literally.
assert.notEqual(body[1], 0); // Actual second ciphertext rune is J.


// RSA is a historical Cicada operation, so p=151, q=331 and e=13
// (the count of red title runes and dots in its terminal marker)
// specify one exploratory, complete private inverse. No original clue
// directly instructs using RSA or selecting its block framing.
const rsaN = 151n * 331n;
const rsaPhi = 150n * 330n;
const rsaE = 13n;
const rsaD = 38077n;
assert.equal(rsaN, 49981n);
assert.equal(rsaPhi, 49500n);
/** @param {bigint} x @param {bigint} power @returns {bigint} */
function powmod(x, power) {
  let result = 1n;
  let base = x % rsaN;
  while (power > 0n) {
    if (power & 1n) result = result * base % rsaN;
    base = base * base % rsaN;
    power >>= 1n;
  }
  return result;
}
assert.equal(rsaE * rsaD % rsaPhi, 1n);
const radix29Cubed = 29 ** 3;
/**
 * Cycle-walk textbook RSA until its output fits 3 GP29 runes.
 * @param {number[]} input
 * @param {bigint} exponent
 * @param {boolean} resetAtPage
 * @returns {number[]}
 */
function rsaTriplets(input, exponent, resetAtPage) {
  const output = [];
  const sections = resetAtPage
    ? corpus.pages.filter(p => p.page < 56).map(p => p.indices)
    : [input];
  for (const section of sections) {
    for (let i = 0; i + 2 < section.length; i += 3) {
      const packed = section[i] * 841 + section[i + 1] * 29 +
        section[i + 2];
      let value = BigInt(packed);
      do {
        value = powmod(value, exponent);
      } while (value >= BigInt(radix29Cubed));
      const n = Number(value);
      output.push(Math.floor(n / 841), Math.floor(n / 29) % 29, n % 29);
    }
    output.push(...section.slice(Math.floor(section.length / 3) * 3));
  }
  return output;
}
// Without cyclewalking, RSA P=(C^d modN) directly decodes into three
// base29 runes only when P<29^3. Already the first p0 black triplet
// fails, as does 46 of 83 complete source black-body triplets.
let outsideBase29Triples = 0;
for (let i = 0; i < body.length; i += 3) {
  const val = body[i] * 841 + body[i + 1] * 29 + body[i + 2];
  if (powmod(BigInt(val), rsaD) >= BigInt(radix29Cubed)) outsideBase29Triples++;
}
assert.equal(body.length, 249);
assert.equal(outsideBase29Triples, 46);
const firstTriplet = body[0] * 841 + body[1] * 29 + body[2];
assert.equal(firstTriplet, 2007);
assert.equal(powmod(BigInt(firstTriplet), rsaD), 28814n);

// A literal 2-byte table RSA ciphertext block must be strictly <n.
// Exactly 32/128 unmodified big-endian grid blocks are outside that
// legal domain, independent of exponent and any plaintext hypothesis.
let tableRsaInvalid = 0;
for (let i = 0; i < grid.bytes.length; i += 2) {
  if (256 * grid.bytes[i] + grid.bytes[i + 1] >= Number(rsaN)) {
    tableRsaInvalid++;
  }
}
assert.equal(tableRsaInvalid, 32);

const fullUnknown = corpus.pages.filter(p => p.page < 56)
  .flatMap(p => p.indices);
assert.equal(fullUnknown.length, 12956);
const rsaOutcomes = [];
for (const exponent of [rsaE, rsaD]) {
  for (const pageReset of [false, true]) {
    const decoded = rsaTriplets(fullUnknown, exponent, pageReset);
    // All source positions are exactly returned by the opposite
    // transformation. This validates bijectivity only, not its key.
    const reverse = exponent === rsaE ? rsaD : rsaE;
    assert.deepEqual(rsaTriplets(decoded, reverse, pageReset), fullUnknown);
    rsaOutcomes.push({
      exponent: exponent.toString(),
      pageReset,
      ioc: indexOfCoincidence(decoded)
    });
  }
}
const control = corpus.pages.find(p => p.page === 57).indices
  .slice(0, 93);
const planted = rsaTriplets(control, rsaE, false);
assert.deepEqual(rsaTriplets(planted, rsaD, false), control);
assert.deepEqual(rsaOutcomes.map(x => Number(x.ioc.toFixed(10))),
  [0.0344670302, 0.0344917197, 0.0344992981, 0.0344840102]);

console.log(JSON.stringify({
  status: 'cross-artifact candidate; no recovered plaintext',
  redTitleWordPrimeSums: [a, b],
  signedDifference: a - b,
  sourceMean331: (a + b) / 2,
  sharedTableRow: row,
  selectedRowBytes: rowBytes,
  unique151Count: 1,
  terminalByteTotient: totient(rowBytes[7]),
  competingRadix59: { terminalToken: token151, byte: byte59, totient: totient(byte59), predictedRedSum: 660 },
  exactIdentity: '347+315=2*256+phi(151)=662',
  adjacentPairsTested: words.length - 1,
  length8Then5Pairs: matchingLengths,
  exactMatches: matches,
  blackBodyDirectDecoder: reading,
  phi151PrimeStream: 'rejected at black-body rune 1: ciphertext J would require nonliteral plaintext F',
  rsa151x331e13: { modulus: rsaN.toString(), privateExponent: rsaD.toString(),
    p0BlackOutOfThreeRuneRange: outsideBase29Triples, grid16BitPacketsOutOfRange: tableRsaInvalid,
    cyclewalkFullOriginal: rsaOutcomes }
}, null, 2));
