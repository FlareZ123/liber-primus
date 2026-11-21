"use strict";
/**
 * Reproduce the source-anchored p0/p6 red-span -> p50 base60 map -> p32 route.
 * Navigation hypothesis only; no LP2 decryption is claimed.
 * Run: node sims/lp2_redspan_181_p50_path_p32_source_gate.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(root, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const base60 = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const transcriptPages = read("resources/lp2-transcription.txt").split("%");
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const mod29 = n => ((n % 29) + 29) % 29;
function prime(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
}
function phi(n) {
  assert.ok(n > 0);
  let rest = n, result = n;
  for (let p = 2; p * p <= rest; p++) {
    if (rest % p) continue;
    while (rest % p === 0) rest /= p;
    result -= result / p;
  }
  if (rest > 1) result -= result / rest;
  return result;
}
function pageWords(pageNo) {
  let offset = 0, current = [];
  const out = [];
  const flush = () => {
    if (current.length) out.push({ start: offset - current.length, end: offset, values: current });
    current = [];
  };
  for (const ch of Array.from(transcriptPages[pageNo])) {
    if (runeIndex.has(ch)) {
      current.push(runeIndex.get(ch));
      offset++;
    } else if (["-", ".", "&", "$", "§"].includes(ch)) flush();
  }
  flush();
  return out;
}
function spanInfo(pageNo, span) {
  const values = Array.from(span.runes).map(r => {
    assert.ok(runeIndex.has(r));
    return runeIndex.get(r);
  });
  assert.equal(values.length, span.length);
  const end = span.start + span.length;
  const selected = pageWords(pageNo).filter(w => w.start >= span.start && w.end <= end);
  const exact = selected.reduce((n, w) => n + w.values.length, 0) === span.length;
  const wordLengths = selected.map(w => w.values.length);
  const sum = values.reduce((a, b) => a + b, 0);
  return {
    page: pageNo, start: span.start, length: span.length, sum,
    prime: prime(sum), phi: phi(sum), wordLengths, exactWords: exact,
    wordLengthProduct: exact ? wordLengths.reduce((a, b) => a * b, 1) : null,
    tableCell: sum < 256 ? grid.bytes[sum] : null
  };
}
function walk(map, start) {
  const seen = new Map(), path = [];
  let x = start;
  while (!seen.has(x)) {
    assert.ok(Number.isInteger(x) && x >= 0 && x < map.length);
    seen.set(x, path.length);
    path.push(x);
    x = map[x];
  }
  const cycleStart = seen.get(x);
  return { path, transient: path.slice(0, cycleStart), cycle: path.slice(cycleStart), cycleStart };
}
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const v of values) counts[v]++;
  return counts.reduce((s, n) => s + n * (n - 1), 0) / (values.length * (values.length - 1));
}
function repeatingAdditive(cipher, key, sign, skipCipherF) {
  let j = 0;
  const plain = [], impossiblePlainF = [];
  for (let i = 0; i < cipher.length; i++) {
    const c = cipher[i];
    if (skipCipherF && c === 0) { plain.push(0); continue; }
    const p = mod29(c + sign * key[j % key.length]);
    if (skipCipherF && p === 0) impossiblePlainF.push(i);
    plain.push(p);
    j++;
  }
  return {
    consumedKeySymbols: j,
    impossiblePlainFPositions: impossiblePlainF,
    ioc: ioc(plain),
    runes: plain.map(v => corpus.runes[v]).join(""),
    transliteration: plain.map(v => corpus.translit[v]).join("")
  };
}

const allSpans = [];
for (const page of ink.pages)
  for (const span of page.red_spans || []) allSpans.push(spanInfo(page.page, span));
assert.equal(allSpans.length, 18);
const p0 = allSpans.find(s => s.page === 0 && s.start === 0);
const p6 = allSpans.find(s => s.page === 6 && s.start === 71);
const p7 = allSpans.find(s => s.page === 7 && s.start === 194);
const p15 = allSpans.find(s => s.page === 15 && s.start === 9);
assert.ok(p0 && p6 && p7 && p15);
assert.deepEqual([p0.length, p6.length], [13, 11]);
assert.deepEqual([p0.sum, p6.sum], [181, 181]);
assert.ok(p0.prime && p6.prime);
assert.deepEqual([p0.phi, p6.phi], [180, 180]);
assert.deepEqual(p0.wordLengths, [8, 5]);
assert.deepEqual(p6.wordLengths, [4, 1, 4, 2]);
assert.deepEqual([p0.wordLengthProduct, p6.wordLengthProduct], [40, 32]);

const bySum = new Map();
for (const s of allSpans) {
  if (!bySum.has(s.sum)) bySum.set(s.sum, []);
  bySum.get(s.sum).push(s);
}
const repeatedPrimeSums = [...bySum.entries()]
  .filter(([sum, spans]) => prime(Number(sum)) && spans.length > 1)
  .map(([sum, spans]) => ({ sum: Number(sum), pages: spans.map(s => s.page).sort((a, b) => a - b) }))
  .sort((a, b) => a.sum - b.sum);
assert.deepEqual(repeatedPrimeSums, [{ sum: 181, pages: [0, 6] }]);
const phi180Spans = allSpans.filter(s => s.phi === 180)
  .map(s => ({ page: s.page, sum: s.sum, prime: s.prime }));
assert.deepEqual(phi180Spans, [
  { page: 0, sum: 181, prime: true },
  { page: 6, sum: 181, prime: true },
  { page: 7, sum: 209, prime: false }
]);
const productMatches = allSpans.filter(s =>
  s.exactWords && s.sum < 256 && grid.bytes[s.sum] === s.wordLengthProduct
).map(s => ({ page: s.page, sum: s.sum, cell: grid.bytes[s.sum], product: s.wordLengthProduct }));
assert.deepEqual(productMatches, [{ page: 0, sum: 181, cell: 40, product: 40 }]);
assert.equal(p7.prime, false);
assert.equal(p7.tableCell, 175);
assert.equal(p15.length, 11);
assert.equal(p15.sum, 120);
assert.equal(p15.prime, false);

const tokens = base60.rows.flat();
assert.equal(base60.alphabet.length, 60);
assert.equal(tokens.length, 256);
assert.equal(grid.bytes.length, 256);
assert.equal(tokens[181], "0e");
assert.equal(grid.bytes[181], 40);
assert.ok(grid.bytes.every(v => Number.isInteger(v) && v >= 0 && v < 256));
let innerCount = 0;
for (let row = 1; row <= 30; row++) for (let col = 1; col <= 6; col++) innerCount++;
assert.equal(innerCount, 180);
assert.equal(256 - innerCount, 76);

const start181 = walk(grid.bytes, 181);
assert.deepEqual(start181.path, [
  181, 40, 80, 142, 160, 233, 234, 196, 176, 235, 121, 237, 32,
  115, 247, 192, 0, 203, 68, 199, 47, 76, 114, 197
]);
assert.equal(start181.transient.length, 13);
assert.equal(start181.transient.at(-1), 32);
assert.deepEqual(start181.cycle, [115, 247, 192, 0, 203, 68, 199, 47, 76, 114, 197]);
const twoCycle = walk(grid.bytes, 249);
assert.equal(twoCycle.cycle.length, 2);
assert.deepEqual([...twoCycle.cycle].sort((a, b) => a - b), [158, 249]);

const p32 = corpus.pages.find(p => p.page === 32).indices;
const p33 = corpus.pages.find(p => p.page === 33).indices;
assert.equal(p32.length, 121);
assert.equal(11 * 11, p32.length);
assert.equal(4 * 11 - 4, 40);
assert.equal(9 * 9, 81);
assert.equal(p33.slice(10, 91).length, 81);
const p6Key = Array.from(ink.pages.find(p => p.page === 6).red_spans.find(s => s.start === 71).runes)
  .map(r => runeIndex.get(r));
assert.deepEqual(p6Key, [24, 16, 14, 17, 19, 6, 27, 15, 17, 14, 12]);
const directKeyTests = [
  { direction: "C-K", result: repeatingAdditive(p32, p6Key, -1, false) },
  { direction: "C+K", result: repeatingAdditive(p32, p6Key, +1, false) },
  { direction: "C-K with ciphertext-F bypass", result: repeatingAdditive(p32, p6Key, -1, true) },
  { direction: "C+K with ciphertext-F bypass", result: repeatingAdditive(p32, p6Key, +1, true) }
];
console.log(JSON.stringify({
  classification: "source-constrained navigation hypothesis; no plaintext or key recovered",
  redSpanPopulation: { count: allSpans.length, repeatedPrimeSums, phi180Spans, uniqueCellProductMatch: productMatches },
  selectedRedSpans: { p0, p6 },
  controls: { p7CompositePhi180: p7, p15ElevenRunesComposite120: p15 },
  p50: {
    base: 60, cells: 256, interior: innerCount, perimeter: 76,
    cell181: { token: tokens[181], value: grid.bytes[181] },
    pathFrom181: start181.path, transientLength: start181.transient.length,
    lastTransientNode: start181.transient.at(-1), elevenCycle: start181.cycle, twoCycle: twoCycle.cycle
  },
  destination: { p32Runes: p32.length, p32Grid: "11x11", p32Perimeter: 40, p32Interior: 81, p33Body81: p33.slice(10, 91).length },
  boundedNegative: { candidate: "p6 red 11-rune span as repeating additive key on p32", key: p6Key, tests: directKeyTests }
}, null, 2));
