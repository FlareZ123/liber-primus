"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const grid = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/lp2-grid-256.json"), "utf8"));
const ink = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/lp2-ink-annotations.json"), "utf8"));
const transcription = fs.readFileSync(path.join(root, "resources/liber-primus/lp2-transcription.txt"), "utf8");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const runeSet = new Set(corpus.runes);
const parts = transcription.split(/^\s*%\s*$/m);

function mod(value, modulus) {
  return ((value % modulus) + modulus) % modulus;
}

function powMod(base, exponent, modulus) {
  let out = 1;
  let factor = mod(base, modulus);
  let e = exponent;
  while (e > 0) {
    if (e & 1) out = (out * factor) % modulus;
    factor = (factor * factor) % modulus;
    e = Math.floor(e / 2);
  }
  return out;
}

function inverseMod(value, modulus) {
  for (let candidate = 1; candidate < modulus; candidate += 1) {
    if ((value * candidate) % modulus === 1) return candidate;
  }
  throw new Error("No modular inverse");
}

function H(left, right) {
  return [mod(left - right, 29), mod(left + right, 29)];
}

function base29Integer(values) {
  return values.reduce((number, value) => number * 29n + BigInt(value), 0n);
}

function bigEndianInteger(bytes) {
  return bytes.reduce((number, byte) => (number << 8n) + BigInt(byte), 0n);
}

function valuation(number, prime) {
  let quotient = number;
  let exponent = 0;
  while (quotient % prime === 0n) {
    quotient /= prime;
    exponent += 1;
  }
  return { exponent, quotient };
}

function parsePhysicalPage(page) {
  assert.notEqual(page, 50);
  const source = parts[page < 50 ? page : page - 1];
  assert.ok(source, "Missing transcription page " + page);
  const runes = [];
  const words = [];
  let current = [];
  let start = 0;

  function flush() {
    if (!current.length) return;
    words.push({
      start,
      end: runes.length,
      length: current.length,
      values: current.slice(),
    });
    current = [];
  }

  for (const char of [...source]) {
    const value = runeIndex.get(char);
    if (value !== undefined) {
      if (!current.length) start = runes.length;
      current.push(value);
      runes.push(value);
    } else if (char === "-" || char === ".") {
      flush();
    }
  }
  flush();
  return { runes, words };
}

// Reconstruct the already source-selected p28 DH23 coordinates.
const p28Lines = parts[28].trim().split("/");
const line6 = [...p28Lines[5]]
  .filter((char) => runeSet.has(char))
  .map((char) => runeIndex.get(char));
assert.equal(line6.length, 23);
assert.equal(line6[11], 0);
assert.deepEqual(line6.slice(0, 2), [23, 8]);
const [b, shared] = H(line6[0], line6[1]);
assert.deepEqual([b, shared], [15, 2]);

const p28 = parsePhysicalPage(28);
const g = p28.words[27].length;
const a = 6;
const p = line6.length;
const A = powMod(g, a, p);
const B = powMod(g, b, p);
const K = powMod(B, a, p);
const e = inverseMod(b, p - 1);
assert.equal(g, 5);
assert.deepEqual({ p, g, a, b, A, B, K, e }, {
  p: 23, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2, e: 3,
});
assert.equal((b * e) % (p - 1), 1);

// The DH-coordinate extraction hypothesis is page=b, rune offset=p.
// The 51-rune length comes from the original p53 red-ink span.
const p15 = parsePhysicalPage(15);
const p53 = parsePhysicalPage(53);
assert.equal(p15.runes.length, 159);
assert.equal(p53.runes.length, 179);

const p15Window = p15.runes.slice(p, p + 51);
assert.equal(p15Window.length, 51);
const p15StartWord = p15.words.find((word) => word.start <= p && p < word.end);
const p15EndWord = p15.words.find((word) => word.start <= p + 50 && p + 50 < word.end);
assert.deepEqual([p15StartWord.start, p15StartWord.end], [20, 24]);
assert.deepEqual([p15EndWord.start, p15EndWord.end], [71, 76]);

const p53Ink = ink.pages.find((page) => page.page === 53);
assert.ok(p53Ink);
assert.deepEqual(
  p53Ink.red_spans.map(({ start, length }) => [start, length]),
  [[128, 51]],
);
const p53Red = p53.runes.slice(128, 179);
assert.equal(p53Red.length, 51);
const annotatedRed = [...p53Ink.red_spans[0].runes].map((rune) => runeIndex.get(rune));
assert.deepEqual(annotatedRed, p53Red);

const p53RedWords = p53.words.filter((word) => word.start >= 128 && word.end <= 179);
assert.deepEqual(
  p53RedWords.map((word) => word.length),
  [5, 4, 4, 11, 2, 3, 2, 6, 5, 5, 2, 2],
);

// Convert both 51-rune streams as positional GP29 integers.
const W = base29Integer(p15Window);
const R = base29Integer(p53Red);
const prime = 179n;
const modulus = prime * prime;
const targetRemainder = 29535n;
assert.equal(W % prime, 0n);
assert.equal(R % prime, 0n);
assert.equal(W % modulus, targetRemainder);
assert.equal(R % modulus, targetRemainder);
assert.equal((W / prime) % prime, 165n);
assert.equal((R / prime) % prime, 165n);
assert.equal(targetRemainder, prime * 165n);
assert.equal((BigInt(e) * 55n) % prime, 165n);

// The canonical 256-token table is a 32x8 base60 byte stream across pp49-51.
assert.equal(grid.byte_count, 256);
assert.equal(grid.bytes.length, 256);
assert.equal(grid.alphabet.length, 60);
assert.equal(grid.shape, "32 rows by 8 columns across LP2 pages 49, 50, 51");
const tokens = grid.pages.flatMap((page) => page.tokens);
assert.equal(tokens.length, 256);
assert.deepEqual(grid.pages.flatMap((page) => page.bytes), grid.bytes);

const N60 = bigEndianInteger(grid.bytes);
assert.equal(N60.toString(2).length, 2048);
const n60Valuation = valuation(N60, prime);
assert.equal(n60Valuation.exponent, 2);
assert.equal(n60Valuation.quotient % prime, 55n);

// Charge the drop-f base59 alternative on the same printed token order.
const alphabet59 = grid.alphabet.replace("f", "");
assert.equal(alphabet59.length, 59);
const bytes59 = tokens.map((token) => {
  const high = alphabet59.indexOf(token[0]);
  const low = alphabet59.indexOf(token[1]);
  assert.ok(high >= 0 && low >= 0, "Base59 token contains an excluded symbol");
  return high * 59 + low;
});
const N59 = bigEndianInteger(bytes59);
assert.equal(N59 % modulus, 20664n);
assert.notEqual(N59 % modulus, 0n);
assert.equal(valuation(N59, prime).exponent, 0);

// Charge the eight natural dihedral table orientations and both byte orders.
function transpose(matrix) {
  return matrix[0].map((_, column) => matrix.map((row) => row[column]));
}
function reverseRows(matrix) {
  return matrix.map((row) => row.slice().reverse());
}
function reverseRowOrder(matrix) {
  return matrix.slice().reverse();
}
const matrix = Array.from({ length: 32 }, (_, row) => grid.bytes.slice(row * 8, row * 8 + 8));
const orientations = [
  ["printed", matrix],
  ["mirror-horizontal", reverseRows(matrix)],
  ["mirror-vertical", reverseRowOrder(matrix)],
  ["rotate-180", reverseRows(reverseRowOrder(matrix))],
  ["rotate-90", reverseRows(transpose(matrix))],
  ["rotate-270", reverseRowOrder(transpose(matrix))],
  ["transpose", transpose(matrix)],
  ["anti-transpose", reverseRows(reverseRowOrder(transpose(matrix)))],
];
const orientationHits = [];
for (const [name, oriented] of orientations) {
  for (const endian of ["big", "little"]) {
    const flat = oriented.flat();
    const bytes = endian === "big" ? flat : flat.slice().reverse();
    const result = valuation(bigEndianInteger(bytes), prime);
    if (result.exponent >= 2 && result.quotient % prime === 55n) {
      orientationHits.push([name, endian]);
    }
  }
}
assert.deepEqual(orientationHits, [
  ["printed", "big"],
  ["rotate-180", "little"],
]);

// The 179-adic quotient returns GP0(READ), and its table cell points to p0 offset80.
const readIndices = ["R", "EA", "D"].map((rune) => corpus.translit.indexOf(rune));
assert.deepEqual(readIndices, [4, 28, 23]);
const readGp0 = readIndices.reduce((sum, value) => sum + value, 0);
assert.equal(readGp0, 55);
assert.equal(n60Valuation.quotient % prime, BigInt(readGp0));

const cell55 = tokens[55];
const cell20 = tokens[20];
assert.equal(cell55, "1K");
assert.equal(grid.bytes[55], 80);
assert.equal(cell20, "1g");
assert.equal(grid.bytes[20], 102);

const p0 = parsePhysicalPage(0);
const receiver = p0.runes.slice(80, 103);
assert.equal(receiver.length, 23);
assert.equal(receiver[11], 0);
const receiverWords = p0.words.filter((word) => word.start >= 80 && word.end <= 103);
assert.deepEqual(
  receiverWords.map((word) => [word.start, word.end]),
  [[80, 83], [83, 90], [90, 95], [95, 103]],
);

const receiverInteger = base29Integer(receiver);
assert.equal(receiverInteger % prime, 157n);
assert.equal((BigInt(e) * 55n - BigInt(A)) % prime, 157n);
assert.equal((55n + BigInt(grid.bytes[20])) % prime, 157n);
let p0CenterFWindows = 0;
const p0ResidueMatches = [];
for (let offset = 0; offset + 23 <= p0.runes.length; offset += 1) {
  const window = p0.runes.slice(offset, offset + 23);
  if (window[11] === 0) p0CenterFWindows += 1;
  if (base29Integer(window) % prime === 157n) {
    p0ResidueMatches.push([offset, window[11]]);
  }
}
assert.equal(p0CenterFWindows, 12);
assert.deepEqual(p0ResidueMatches, [[80, 0], [156, 16]]);
assert.equal(p0ResidueMatches.filter((match) => match[1] === 0).length, 1);

// Complete unknown-page scan: only the DH-selected p15 window and marked p53 span
// have the exact 179^2 residue shared by the two source-selected 51-rune objects.
let windowCount = 0;
let divisibleBy179 = 0;
const residueMatches = [];
for (let page = 0; page <= 55; page += 1) {
  const values = corpus.pages[page].indices;
  for (let offset = 0; offset + 51 <= values.length; offset += 1) {
    windowCount += 1;
    const number = base29Integer(values.slice(offset, offset + 51));
    if (number % prime === 0n) divisibleBy179 += 1;
    if (number % modulus === targetRemainder) residueMatches.push([page, offset]);
  }
}
assert.equal(windowCount, 10206);
assert.equal(divisibleBy179, 70);
assert.deepEqual(residueMatches, [[15, 23], [53, 128]]);

// The next 179-adic digit is 96, not GP0(OUT)=20: this is a local READ
// fingerprint, not a recovered multiword stream.
const next179Digit = Number((n60Valuation.quotient / prime) % prime);
assert.equal(next179Digit, 96);
assert.notEqual(next179Digit, 20);

console.log(JSON.stringify({
  classification: "intermediate cross-artifact structural fingerprint; no plaintext recovered",
  dh23: { p, g, a, b, A, B, K, e },
  extraction: { page: b, offset: p, length: 51, p15WordStart: [p15StartWord.start, p15StartWord.end], p15WordEnd: [p15EndWord.start, p15EndWord.end] },
  p53Red: { page: 53, start: 128, length: 51, wordLengths: p53RedWords.map((word) => word.length) },
  gp29Integers: {
    p15Window: W.toString(),
    p53Red: R.toString(),
    modulus: modulus.toString(),
    commonRemainder: String(W % modulus),
    quotientResidue: String((W / prime) % prime),
  },
  p50: {
    byteCount: grid.bytes.length,
    shape: grid.shape,
    base60V179: n60Valuation.exponent,
    base60QuotientMod179: String(n60Valuation.quotient % prime),
    base59RemainderMod1792: String(N59 % modulus),
    orientationHits,
    cell55: { token: cell55, byte: grid.bytes[55] },
    cell20: { token: cell20, byte: grid.bytes[20] },
    next179AdicDigit: next179Digit,
  },
  p0Receiver: { start: 80, endInclusive: 102, length: receiver.length, center: receiver[11], integer: receiverInteger.toString(), mod179: String(receiverInteger % prime), centerFWindows: p0CenterFWindows, residueMatches: p0ResidueMatches, wordSpans: receiverWords.map((word) => [word.start, word.end]) },
  corpusScan: { windows: windowCount, divisibleBy179, exactResidueMatches: residueMatches },
}, null, 2));
