#!/usr/bin/env node
"use strict";

// Source-fixed test of LP1 p05's literal MOBIUS word as arithmetic mu(n)
// on its 5x5 square, used as a GP29 additive key for LP2 p53's moth-linked
// red tail. Phase is page-start 128 mod25=3. Test both possible masks for
// the sole ciphertext F; no phase/order/sign/key fitting.

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const mod29 = (n) => ((n % 29) + 29) % 29;
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const annotations = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const lp1 = read("resources/transcriptions/lp1_wulfic_canonical.txt");

const anchorAt = lp1.indexOf("272-138-");
assert.ok(anchorAt >= 0);
const rows = lp1.slice(anchorAt).split(/\r?\n/u).slice(0, 5)
  .map((line) => line.replace(/\/$/u, "").split("-"));
assert.deepEqual(rows.map((row) => row.length), [5, 5, 5, 5, 5]);
const runeIndex = (rune) => corpus.runes.indexOf(rune);
const primeSum = (word) => [...word].reduce((sum, rune) => {
  const i = runeIndex(rune);
  assert.ok(i >= 0 && i < 29);
  return sum + corpus.prime[i];
}, 0);
const square = rows.map((row) => row.map((cell) =>
  /^\d+$/u.test(cell) ? Number(cell) : primeSum(cell)));
const expected = [
  [272, 138, 341, 131, 151], [366, 199, 130, 320, 18],
  [226, 245, 91, 245, 226], [18, 320, 130, 199, 366],
  [151, 131, 341, 138, 272]
];
assert.deepEqual(square, expected);
assert.equal([...rows[2][4]].map((r) => corpus.translit[runeIndex(r)]).join(""), "MOBIUS");
assert.equal(square[2][4], 226);

function mobius(n) {
  let sign = 1;
  for (let p = 2; p * p <= n; p += 1) {
    if (n % p !== 0) continue;
    n /= p; sign = -sign;
    if (n % p === 0) return 0;
    while (n % p === 0) n /= p;
  }
  if (n > 1) sign = -sign;
  return sign;
}
const muValues = square.flat().map(mobius);
const key = muValues.map(mod29);
assert.deepEqual(key, [
  0, 28, 1, 28, 28, 28, 28, 28, 0, 0,
  1, 0, 1, 0, 1, 0, 0, 28, 28, 28,
  28, 28, 1, 28, 0
]);

const page = corpus.pages.find((p) => p.page === 53);
const annotation = annotations.pages.find((p) => p.page === 53);
assert.ok(page && annotation);
assert.deepEqual(annotation.red_spans.map((s) => [s.start, s.length]), [[128, 51]]);
const red = page.indices.slice(128, 179);
assert.equal(page.indices.length, 179);
assert.equal(red.length, 51);
const cipherFPositions = red.flatMap((v, i) => v === 0 ? [i] : []);
assert.deepEqual(cipherFPositions, [38]);
const phase = 128 % 25;
assert.equal(phase, 3);

function decode(ciphertext, skipMask) {
  let clock = 0; const out = [];
  for (let i = 0; i < ciphertext.length; i += 1) {
    if (skipMask.has(i)) { assert.equal(ciphertext[i], 0); out.push(0); }
    else { out.push(mod29(ciphertext[i] - key[(phase + clock) % 25])); clock += 1; }
  }
  return { out, consumed: clock };
}
function encodeP56(plaintext) {
  let clock = 0; const out = [];
  for (const value of plaintext) {
    if (value === 0) out.push(0);
    else { out.push(mod29(value + key[(phase + clock) % 25])); clock += 1; }
  }
  return out;
}
function ioc(values) {
  const counts = Array(29).fill(0);
  values.forEach((v) => counts[v] += 1);
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (values.length * (values.length - 1));
}

const variants = [];
for (const skipMask of [new Set(), new Set([38])]) {
  const decoded = decode(red, skipMask);
  const fPositions = decoded.out.flatMap((v, i) => v === 0 ? [i] : []);
  const replay = encodeP56(decoded.out);
  const mismatches = replay.flatMap((v, i) => v !== red[i] ? [i] : []);
  variants.push({
    assumedTransparentCipherF: [...skipMask],
    decodedFPositions: fPositions,
    decoded: decoded.out.map((v) => corpus.translit[v]).join(""),
    decodedIoC: ioc(decoded.out),
    keySymbolsConsumed: decoded.consumed,
    forwardReplayMismatchPositions: mismatches,
    forwardReplayMismatchCount: mismatches.length
  });
}
assert.deepEqual(variants.map((v) => v.decodedFPositions), [[25, 38], [25, 38]]);
assert.deepEqual(variants.map((v) => v.forwardReplayMismatchCount), [15, 14]);
assert.ok(variants.every((v) => v.decodedFPositions.includes(25) &&
  !cipherFPositions.includes(25)));

// Positive control: solved p57 first 50 runes plus F at local38. Its
// original F and inserted F both bypass; the source-fixed rule round-trips.
const p57 = corpus.pages.find((p) => p.page === 57).indices;
const plant = p57.slice(0, 50); plant.splice(38, 0, 0);
const plantMask = new Set(plant.flatMap((v, i) => v === 0 ? [i] : []));
const plantCipher = encodeP56(plant);
let plantClock = 0;
const plantRecovered = plantCipher.map((value, i) => {
  if (plantMask.has(i)) return 0;
  const out = mod29(value - key[(phase + plantClock) % 25]);
  plantClock += 1; return out;
});
assert.deepEqual(plantRecovered, plant);
assert.equal(plantRecovered.length, 51);

console.log(JSON.stringify({
  hypothesis: "mu(LP1 p05 square cells) mod29, row-major, p53 red tail, page-start phase3",
  square, mobiusCell: { row: 3, column: 5, value: 226 }, muValues, key,
  keyCounts: {
    zero: key.filter((v) => v === 0).length,
    one: key.filter((v) => v === 1).length,
    minusOne: key.filter((v) => v === 28).length
  },
  receiver: { pageLength: page.indices.length, redStart: 128, redLength: red.length, phase, cipherFPositions },
  exhaustiveFMaskVariants: variants,
  positiveControl: { skipPositions: [...plantMask], exactRoundTrip: true, recoveredRunes: 51 },
  conclusion: "Both possible F masks decode an F at local25 where original ciphertext is not F; authentic p56 F transparency makes this fixed direct mu-key inverse impossible."
}, null, 2));
