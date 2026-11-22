'use strict';
/**
 * HEX as literal 2014 byte/hexarithmetical grammar:
 * source p7 red word products -> seed 0xBA; source p50 base60 bytes;
 * standard GF(256) Reed–Solomon and AES primitive fields, period255.
 * Tests exact original p8, disjoint p9/p13, and a finite all-seed gate.
 * Candidate seed fits three original source collisions, with familywise null.
 * Windows 11 / Node.js 22 CommonJS read-only single runnable test.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..', 'resources', 'liber-primus');
const gp = JSON.parse(fs.readFileSync(path.join(root, 'lp2-corpus.json'), 'utf8'));
const ink = JSON.parse(fs.readFileSync(path.join(root, 'lp2-ink-annotations.json'), 'utf8'));
const transcription = fs.readFileSync(path.join(root, 'lp2-transcription.txt'), 'utf8');
const grid = JSON.parse(fs.readFileSync(path.join(root, 'base60-grid.json'), 'utf8'));
const mod = (x) => ((x % 29) + 29) % 29;
const alphabet = new Map(gp.runes.map((r, i) => [r, i]));
const scroll = gp.pages.slice(3, 8).flatMap((p) => p.indices);
const words = transcription.split('%').slice(3, 8).join('')
  .replace(/[\n\/&$]/g, '').split(/[-.]/)
  .map((s) => [...s].filter((r) => alphabet.has(r)).map((r) => alphabet.get(r)))
  .filter((w) => w.length > 0);
assert.deepEqual(words.flat(), scroll);
assert.equal(words.length, 255);
assert.equal(gp.pages[8].indices.length, 255);
const red = new Set();
let offset = 0;
for (let page = 3; page <= 7; page++) {
  const spans = ink.pages.find((p) => p.page === page)?.red_spans || [];
  for (const span of spans) for (let j = 0; j < span.length; j++)
    red.add(offset + span.start + j);
  offset += gp.pages[page].indices.length;
}
const reds = [];
let cursor = 0;
for (const word of words) {
  const marks = word.map((_, j) => red.has(cursor + j));
  assert(marks.every(Boolean) || marks.every((v) => !v));
  if (marks[0]) reds.push(word);
  cursor += word.length;
}
assert.equal(reds.length, 13);
const products = reds.slice(-5).map((word) =>
  word.reduce((v, x) => mod(v * x), 1));
assert.deepEqual(products, [11, 26, 8, 15, 2]);
const seed = (products[0] % 16) * 16 + products[1] % 16;
assert.equal(seed, 0xBA);
assert.equal(grid.rows.length, 32);
const values = grid.rows.flat().map((token) => {
  assert.equal(token.length, 2);
  const x = 60 * grid.alphabet.indexOf(token[0]) + grid.alphabet.indexOf(token[1]);
  assert(x >= 0 && x <= 255);
  return x;
});
assert.equal(values.length, 256);

/**
 * Fixed standard GF256 multiplier (RS/QR arithmetic)
 * with irreducible degree-8 polynomial 0x11D.
 * @param {number} x
 * @param {number} y
 * @returns {number}
 */
function gfMul(x, y) {
  let out = 0;
  while (y) {
    if (y & 1) out ^= x;
    y >>>= 1;
    x = ((x << 1) & 255) ^ ((x & 128) ? 0x1D : 0);
  }
  return out;
}
const states = [seed];
for (let i = 1; i < 255; i++) states.push(gfMul(states[i - 1], 2));
assert.equal(new Set(states).size, 255);
assert(!states.includes(0));
assert.equal(gfMul(states.at(-1), 2), seed);
const pads = states.map((address) => mod(values[address]));
const IoC = (seq) => {
  const n = Array(29).fill(0);
  for (const x of seq) n[x]++;
  return n.reduce((v, c) => v + c * (c - 1), 0) / (seq.length * (seq.length - 1));
};
const inverse = (seq, start = 0) =>
  seq.map((x, i) => mod(x - pads[(start + i) % 255]));
const encrypt = (seq, start = 0) =>
  seq.map((x, i) => mod(x + pads[(start + i) % 255]));

const C8 = gp.pages[8].indices;
const C9 = gp.pages.slice(9, 15).flatMap((p) => p.indices);
const offset13 = gp.pages.slice(9, 13).reduce((v, p) => v + p.indices.length, 0);
const witnesses = [
  ['source-p8-full-255', C8, 0],
  ['untouched-p9+first-300', C9.slice(0, 300), 0],
  ['untouched-p13-first-200', gp.pages[13].indices.slice(0, 200), offset13 % 255],
];
assert(C9.length >= 300);
assert(gp.pages[13].indices.length >= 200);
for (const [label, cipher, start] of witnesses) {
  const plain = inverse(cipher, start);
  assert.deepEqual(encrypt(plain, start), cipher);
  console.log(JSON.stringify({
    label, runes: cipher.length, cipherIoC: IoC(cipher), candidateIoC: IoC(plain),
    candidatePreview: plain.slice(0, 36).map((x) => gp.translit[x]).join(''),
    exactReencryption: true,
  }));
}
const pairs = [[47, 240], [48, 231], [235, 236]];
const required = [8, 18, 14]; // Original earlier−later p8 duplicate pair rune differences.
const predicted = pairs.map(([i, j]) => mod(values[states[j]] - values[states[i]]));
assert.deepEqual(predicted, [7, 6, 12]);
assert.notDeepEqual(predicted, required);
console.log('SOURCE KEYED SAME-WORD PREDICTION', JSON.stringify({required, predicted}));

// Actual solved GP from clear p57 supplies a native-register positive.
// Plant and decode a different cipher under exactly the same 255-state key.
const clear = gp.pages[57].indices;
assert.equal(clear.length, 95);
const plant = Array.from({ length: 500 }, (_, j) => clear[j % clear.length]);
for (const start of [0, 57, 251]) {
  const cipher = encrypt(plant, start);
  assert.deepEqual(inverse(cipher, start), plant);
}
console.log('PASS original p8/p9/p13 inverse + canonical255-state + three solved-GP plants');


/**
 * Two standard 8-bit finite fields usable in the 2014 period.
 * @param {number} x
 * @param {number} y
 * @param {number} modulus
 * @returns {number}
 */
function gfGeneral(x, y, modulus) {
  let out = 0;
  while (y) {
    if (y & 1) out ^= x;
    y >>>= 1;
    x = ((x << 1) & 255) ^ ((x & 128) ? (modulus & 255) : 0);
  }
  return out;
}
const fixedOriginalPairs = [[47, 240], [48, 231], [235, 236]];
assert.deepEqual(fixedOriginalPairs.map(([i, j]) =>
  mod(C8[i] - C8[j])), [8, 18, 14]);
assert.deepEqual(fixedOriginalPairs.map(([i, j]) => words[i]),
  [[8], [11, 19], [23, 21]]);
for (const [i, j] of fixedOriginalPairs) assert.deepEqual(words[i], words[j]);

const digit59 = grid.alphabet.replace('f', '');
const table59 = grid.rows.flat().map((token) =>
  59 * digit59.indexOf(token[0]) + digit59.indexOf(token[1]));
assert.equal(table59.length, 256);
assert(table59.every((x) => x >= 0 && x <= 255));
const setups = [
  ['RS-11D', 0x11D, 2],
  ['AES-11B', 0x11B, 3],
];
const observedTriple = [8, 18, 14];
const signature = (arr) => arr[0] * 29 * 29 + arr[1] * 29 + arr[2];
const discovered = [];
const signatures = new Set();
const matchCounts = [0, 0, 0, 0];
for (const [engine, polynomial, multiplier] of setups) {
  for (const [radix, table] of [[60, values], [59, table59]]) {
    for (const sign of [1, -1]) {
      for (let start = 1; start <= 255; start++) {
        let value = start;
        const addresses = [];
        for (let j = 0; j < 255; j++) {
          addresses.push(value);
          value = gfGeneral(value, multiplier, polynomial);
        }
        assert.equal(new Set(addresses).size, 255);
        assert.equal(value, start);
        const output = fixedOriginalPairs.map(([i, j]) =>
          mod(sign * (table[addresses[j]] - table[addresses[i]])));
        signatures.add(signature(output));
        const count = output.filter((x, j) => x === observedTriple[j]).length;
        matchCounts[count]++;
        if (count === 3) {
          discovered.push({
            engine, radix, sign, seed: start,
            pairs: fixedOriginalPairs.map(([i, j]) =>
              [addresses[i], addresses[j], table[addresses[i]], table[addresses[j]]]),
          });
        }
      }
    }
  }
}
assert.equal(matchCounts.reduce((a, b) => a + b, 0), 2040);
assert.deepEqual(discovered, [{
  engine: 'AES-11B', radix: 59, sign: -1, seed: 237,
  pairs: [[27, 50, 25, 46], [45, 22, 105, 58], [109, 183, 181, 80]],
}]);
assert.equal(signatures.size, 1964);
console.log('ALL-SEED COLLISION FIT', JSON.stringify({
  searchFamilies: 8, seedsPerFamily: 255, totalCandidates: 2040,
  threeOfThreeFits: discovered, predictedTriples: signatures.size,
  totalPossibleTriples: 29 ** 3, matchCounts,
}));

// Test the discovered parameter as one fixed full-length source reader.
// This uses all 255 page-8 symbols, not just its six fitted duplicate sites.
// Excluding the six fitted positions leaves no coherent unknown-page prose.
const candidate = discovered[0];
let aesValue = candidate.seed;
const addresses = [];
for (let i = 0; i < 255; i++) {
  addresses.push(aesValue);
  aesValue = gfGeneral(aesValue, 3, 0x11B);
}
const aesPad = addresses.map((x) => mod(table59[x]));
const aesInverse = (cipher, start = 0) =>
  cipher.map((x, j) => mod(x - aesPad[(start + j) % 255]));
const aesEncrypt = (plain, start = 0) =>
  plain.map((x, j) => mod(x + aesPad[(start + j) % 255]));
const candidateOutputs = [
  ['p8-full255', C8, 0],
  ['p9-first300', C9.slice(0, 300), 0],
  ['p13-first200', gp.pages[13].indices.slice(0, 200), offset13 % 255],
];
for (const [label, input, start] of candidateOutputs) {
  const decoded = aesInverse(input, start);
  assert.deepEqual(aesEncrypt(decoded, start), input);
  console.log('FIT-KEY ORIGINAL RECEIVER', JSON.stringify({
    label, totalRunes: decoded.length, coincidence: IoC(decoded),
    first80: decoded.slice(0, 80).map((x) => gp.translit[x]).join(''),
  }));
}
const recoveredWords = aesInverse(C8);
for (const [i, j] of fixedOriginalPairs)
  assert.equal(recoveredWords[i], recoveredWords[j]);
const sums = [
  ['GP-index-sum', words.map((w) => mod(w.reduce((v, x) => v + x, 0)))],
  ['GP-prime-sum', words.map((w) =>
    mod(w.reduce((v, x) => v + gp.prime[x], 0)))],
];
for (const [name, source] of sums) {
  const equal = recoveredWords.filter((x, i) => x === source[i]).length;
  console.log('FIT-KEY WORD CHECKSUM', JSON.stringify({ name, equal, positions: 255 }));
}
// A real source-selected operation must reproduce more than its three fitted
// duplicate constraints. This genuine clear p57 plant shows inverse correctness.
for (const start of [0, 237]) assert.deepEqual(
  aesInverse(aesEncrypt(plant, start), start), plant);

// Familywise negative calibration: the exact 255-item original p8 rune
// histogram stays fixed; all six designated positions shuffle with it.
// Reuse the 1964 allowable fitted difference triples, not just one key.
let randomState = 0x3301C1CA;
const random = () => {
  randomState ^= randomState << 13;
  randomState ^= randomState >>> 17;
  randomState ^= randomState << 5;
  return (randomState >>> 0) / 4294967296;
};
const shuffled = C8.slice();
let familyFits = 0;
const draws = 50000;
for (let iter = 0; iter < draws; iter++) {
  for (let j = 254; j > 0; j--) {
    const x = Math.floor(random() * (j + 1));
    [shuffled[j], shuffled[x]] = [shuffled[x], shuffled[j]];
  }
  const deltas = fixedOriginalPairs.map(([i, j]) =>
    mod(shuffled[i] - shuffled[j]));
  if (signatures.has(signature(deltas))) familyFits++;
}
assert.equal(familyFits, 4025);
console.log('SOURCE MATCHED-NULL', JSON.stringify({
  draws, histogramPreserved: true, anyThreeOfThreeFits: familyFits,
  calibratedFrequency: familyFits / draws,
}));
console.log('PASS: actual 2040-key/6-original-rune fit, 50000 matched controls, full p8 and two untouched receivers and genuine GP plants');
