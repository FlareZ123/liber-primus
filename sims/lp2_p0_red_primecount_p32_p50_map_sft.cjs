"use strict";
/**
 * Source-only candidate p0 red heading -> p32 11x11 map -> p50 archive 67.
 * Verifies finite adjacent-word population and one direct p32 ring / p33 body
 * GP29 inverse. This is an exploratory selector, not a recovered LP2 cipher.
 *
 * Run as a CommonJS single-file test with Node.js.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = name => fs.readFileSync(path.join(root, name), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const transcript = read("resources/liber-primus/lp2-transcription.txt");
const physical = corpus.pages.filter(p => p.page < 56);
const runes = new Map(corpus.runes.map((value, i) => [value, i]));
const words = transcript.split("%").slice(0, 55).join("%")
  .split(/[-.&$§]/u)
  .map(chunk => [...chunk].filter(v => runes.has(v)).map(v => runes.get(v)))
  .filter(w => w.length);
assert.equal(words.length, 2896);
assert.deepEqual(words.flat(), physical.flatMap(p => p.indices));
const p32 = physical.find(p => p.page === 32).indices;
const p33 = physical.find(p => p.page === 33).indices;
const p50 = physical.find(p => p.page === 50).indices;
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
assert.equal(p32.length, 121);
assert.equal(p50.length, 0);
assert.equal(grid.bytes.length, 256);
// Signed image's 563 and 569 pixels are primes #103 and #104.
// Original grid addresses #103/#104 are the last two bytes of row 13.
const row13 = grid.bytes.slice(96, 104);
assert.deepEqual(row13, [222, 150, 72, 34, 83, 229, 32, 206]);
assert.equal(grid.bytes[102] % 58, 32);
assert.equal(grid.bytes[103] % 58, 32);
const six = grid.bytes.filter(v => v % 58 === 32).length;
assert.equal(six, 6);
const adjacentMatchingPage = grid.bytes.slice(0, -1)
  .filter((v, i) => v % 58 === grid.bytes[i + 1] % 58).length;
assert.equal(adjacentMatchingPage, 8);
/** @param {number} max */
function primeCountTable(max) {
  const prime = new Uint8Array(max + 1).fill(1);
  prime[0] = prime[1] = 0;
  for (let d = 2; d * d <= max; d++) {
    if (!prime[d]) continue;
    for (let n = d * d; n <= max; n += d) prime[n] = 0;
  }
  const pi = new Uint16Array(max + 1);
  for (let n = 1; n <= max; n++) pi[n] = pi[n - 1] + prime[n];
  return { pi, prime };
}
const sum = w => w.reduce((acc, x) => acc + corpus.prime[x], 0);
const totals = words.map(sum);
const { pi, prime } = primeCountTable(2000);
assert.equal(pi[315], 65);
assert.equal(pi[331], 67);
assert.equal(pi[347], 69);
assert.equal(pi[662], 121);
assert.equal(prime[661], 1);
const heading = ink.pages.find(p => p.page === 0).red_spans[0];
assert.equal(heading.start, 0);
assert.equal(heading.length, 13);
assert.deepEqual(words.slice(0, 2).map(w => w.length), [8, 5]);
assert.deepEqual(totals.slice(0, 2), [347, 315]);
assert.equal(totals[0] - totals[1], 32);
assert.equal((totals[0] + totals[1]) / 2, 331);
assert.equal(pi[totals[0] + totals[1]], p32.length);
assert.equal(pi[331], 17 + 50); // archive 67.jpg is LP2 physical p50
// All adjacent printed words, including physical-page joins, as one corpus.
let runeOffset = 0;
const bounds = [];
for (const p of physical) {
  bounds.push({ page: p.page, begin: runeOffset, end: runeOffset + p.indices.length });
  runeOffset += p.indices.length;
}
const hits = [];
let start = 0;
for (let i = 0; i + 1 < words.length; i++) {
  const d = Math.abs(totals[i] - totals[i + 1]);
  if (d < physical.length && pi[totals[i] + totals[i + 1]] === physical[d].indices.length) {
    const sourcePage = bounds.find(p => start >= p.begin && start < p.end).page;
    hits.push({ wordIndex: i, sourcePage, firstPrimeSum: totals[i],
      secondPrimeSum: totals[i + 1], targetPage: d,
      targetRunes: pi[totals[i] + totals[i + 1]] });
  }
  start += words[i].length;
}
assert.equal(hits.length, 3);
assert.deepEqual(hits.map(h => [h.sourcePage, h.targetPage]), [[0, 32], [30, 51], [41, 51]]);
const topRow = p32.slice(0, 11).reduce((acc, x) => acc + corpus.prime[x], 0);
const leftCol = Array.from({ length: 11 }, (_, i) => p32[i * 11])
  .reduce((acc, x) => acc + corpus.prime[x], 0);
assert.deepEqual([topRow, leftCol], [563, 569]);
const ring = [];
for (let col = 0; col < 11; col++) ring.push(p32[col]);
for (let row = 1; row < 11; row++) ring.push(p32[row * 11 + 10]);
for (let col = 9; col >= 0; col--) ring.push(p32[110 + col]);
for (let row = 9; row >= 1; row--) ring.push(p32[row * 11]);
const interior = [];
for (let row = 1; row < 10; row++)
  for (let col = 1; col < 10; col++) interior.push(p32[row * 11 + col]);
assert.equal(ring.length, 40);
assert.equal(interior.length, 81);
assert.equal(words[0].length * words[1].length, ring.length);
// The source-annotated p33 red-heading/13-dot body is exactly 81 runes.
const p33Body = p33.slice(10, 91);
assert.equal(p33Body.length, 81);
const mod29 = x => (x % 29 + 29) % 29;
const ioc = array => {
  const hist = Array(29).fill(0);
  for (const v of array) hist[v]++;
  return hist.reduce((acc, n) => acc + n * (n - 1), 0) / (array.length * (array.length - 1));
};
const inverse = sign => {
  const plain = p33Body.map((c, i) => mod29(c + sign * ring[i % 40]));
  // Exact recipher is implementation consistency, not a key-authentication test.
  assert.deepEqual(plain.map((p, i) => mod29(p - sign * ring[i % 40])), p33Body);
  return { ioc: ioc(plain), first31: plain.slice(0, 31).map(i => corpus.translit[i]).join("") };
};
const rowKey = row13.map(v => v % 29);
const directRow = ciphertext => {
  const decrypt = sign => {
    const plain = ciphertext.map((c, i) => mod29(c + sign * rowKey[i % 8]));
    assert.deepEqual(plain.map((p, i) => mod29(p - sign * rowKey[i % 8])), ciphertext);
    return { ioc: ioc(plain), prefix: plain.slice(0, 31)
      .map(i => corpus.translit[i]).join("") };
  };
  return { rawIoc: ioc(ciphertext), minus: decrypt(-1), plus: decrypt(1) };
};
const output = {
  p0Red: { firstWordLength: 8, secondWordLength: 5,
    firstPrimeSum: 347, secondPrimeSum: 315, difference: 32,
    total: 662, primeCountOfTotal: pi[662], mean: 331,
    primeRankOfMean: pi[331], firstPrimeAfterTotalMinusOne: 661 },
  target: { p32Runes: 121, p32GridWidth: 11, firstRowPrimeSum: topRow,
    firstColumnPrimeSum: leftCol, circumference: ring.length,
    p32InteriorRunes: interior.length, p33BoundedBodyRunes: p33Body.length,
    p50Runglyphs: p50.length, originalImageNumber: 67, base60GridBytes: grid.bytes.length },
  signedPrimeRankTableClosure: {
    width: 563, height: 569, widthPrimeRank: 103, heightPrimeRank: 104,
    byte103: grid.bytes[102], byte104: grid.bytes[103], physicalPages: 58,
    bothPointToPhysicalPage: 32, selectedRow: 13, columns: [7, 8],
    bytesWithPage32Residue: six, adjacentPairsSameMod58: adjacentMatchingPage,
    fixedInventoryPairProbability: six * (six - 1) / (256 * 255) },
  directRow13ByteKey: { originalBytes: row13, gp29Residues: rowKey,
    originalP32: directRow(p32), originalP33Body: directRow(p33Body),
    verdict: "Neither direct source-selected GP29 key sign yields plaintext." },
  finitePopulation: { adjacentPrintedWordPairs: words.length - 1,
    exactMatches: hits },
  directP32RingToP33: { rawIoc: ioc(p33Body), subtraction: inverse(-1), addition: inverse(+1),
    finding: "Both exact 81-symbol source-ring keys remain ciphertext-like. No plaintext." }
};
console.log(JSON.stringify(output, null, 2));
