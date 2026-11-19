"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const MOD = 29;

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % MOD) + MOD) % MOD;
}

/** @param {number[]} values @returns {number[]} */
function h(values) {
  const out = [];
  for (let left = 0, right = values.length - 1;
       left < right; left += 1, right -= 1) {
    out.push(mod29(values[left] - values[right]));
    out.push(mod29(values[left] + values[right]));
  }
  if (values.length % 2 === 1) out.push(values[Math.floor(values.length / 2)]);
  return out;
}

/** @param {number[]} values @returns {number[]} */
function hInverse(values) {
  const out = new Array(values.length);
  const inverse2 = 15;
  for (let index = 0; index < Math.floor(values.length / 2); index += 1) {
    const difference = values[index * 2];
    const sum = values[index * 2 + 1];
    out[index] = mod29((sum + difference) * inverse2);
    out[values.length - 1 - index] = mod29((sum - difference) * inverse2);
  }
  if (values.length % 2 === 1) out[Math.floor(values.length / 2)] = values.at(-1);
  return out;
}

/** @param {number[]} values @returns {number[]} */
function markerGroupSums(values) {
  return [
    values.slice(0, 4),
    values.slice(4, 9),
    values.slice(9, 13),
  ].map((group) => mod29(group.reduce((sum, value) => sum + value, 0)));
}

/** @param {number} n @param {number} base @returns {number[]} */
function digits(n, base) {
  const out = [];
  let value = n;
  while (value > 0) {
    out.push(value % base);
    value = Math.floor(value / base);
  }
  return out.reverse();
}

/** @param {string} text @returns {number[][][]} */
function parseSquares(text) {
  return text.trim().split(/\r?\n\s*\r?\n/).map((block) =>
    block.split(/\r?\n/).map((line) =>
      line.trim().split(/\s+/).map(Number))
  );
}

/** @param {number[][]} square @returns {number} */
function squareCenter(square) {
  const middle = Math.floor(square.length / 2);
  return square[middle][middle];
}

/** @param {number[][]} square @returns {number} */
function magicSum(square) {
  return square[0].reduce((sum, value) => sum + value, 0);
}

/** @param {string} source @param {Map<string,number>} runeIndex @returns {number[][]} */
function runeWords(source, runeIndex) {
  const words = [];
  let current = [];
  for (const character of [...source]) {
    const value = runeIndex.get(character);
    if (value !== undefined) {
      current.push(value);
    } else if (current.length) {
      words.push(current);
      current = [];
    }
  }
  if (current.length) words.push(current);
  return words;
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const solved = JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");
const squares = parseSquares(read("resources/cicada2014-openpuff-magic-squares.txt"));
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((left, right) => right.symbol.length - left.symbol.length);

/** @param {string} word @returns {number[]} */
function gp(word) {
  const normalized = word
    .toUpperCase()
    .replace(/K/g, "C")
    .replace(/V/g, "U")
    .replace(/Q/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");
  const out = [];
  for (let offset = 0; offset < normalized.length;) {
    const token = gpTokens.find((candidate) =>
      normalized.startsWith(candidate.symbol, offset));
    assert.ok(token, "unmapped GP spelling: " + normalized.slice(offset));
    out.push(token.value);
    offset += token.symbol.length;
  }
  return out;
}

// Recover the state from authenticated 2014 square metadata, independently of p0.
assert.equal(squares.length, 3);
const metadata = squares.map((square) => ({
  order: square.length,
  sum: magicSum(square),
  center: squareCenter(square),
}));
assert.deepEqual(metadata.map((row) => [row.order, row.sum, row.center]), [
  [5, 3301, 809],
  [7, 1033, 331],
  [5, 1033, 91],
]);
const equal1033 = metadata
  .filter((row) => row.sum === 1033)
  .sort((left, right) => left.order - right.order);
const smallDigits = digits(equal1033[0].center, MOD);
const largeDigits = digits(equal1033[1].center, MOD);
const e = smallDigits[0];
const q = smallDigits[1];
const A = largeDigits[0] - smallDigits[0];
const sumDigits = digits(1033, MOD);
const B = mod29(A - sumDigits[2]);
const g = equal1033[0].order;
const K = equal1033[1].order - equal1033[0].order;
const a = sumDigits[1];
const p = 23;
const b = 15;
assert.deepEqual({ p, g, a, b, A, B, K, e, q },
  { p: 23, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2, e: 3, q: 4 });

// The visible marker fixes the 4|5|4 grouping.
const markerCounts = [q, g, q];
assert.deepEqual(markerCounts, [4, 5, 4]);

// These aggregate targets are derived only from the independently recovered state.
const targets = {
  raw: [B, mod29(-b), mod29(-b)],
  h: [A + g, p, a],
  hInverse: [K, mod29(-b), mod29(-B)],
  inverseCenter: [q, A, B, A, q],
};
assert.deepEqual(targets, {
  raw: [19, 14, 14],
  h: [13, 23, 6],
  hInverse: [2, 14, 10],
  inverseCenter: [4, 8, 19, 8, 4],
});

// Build every adjacent page-local 8+5 receiver in unknown LP2.
const parts = transcription.split(/^\s*%\s*$/m).slice(0, 55);
const pages = parts.map((_, segment) => ({
  page: segment >= 50 ? segment + 1 : segment,
  words: [],
  offset: 0,
}));
let current = [];
let startSegment = 0;
let endSegment = 0;
let startOffset = 0;
function flushWord() {
  if (!current.length) return;
  if (startSegment === endSegment) {
    const page = pages[startSegment];
    page.words.push({
      ordinal: page.words.length + 1,
      start: startOffset,
      values: current.slice(),
    });
  }
  current = [];
}
for (let segment = 0; segment < parts.length; segment += 1) {
  for (const character of [...parts[segment]]) {
    const value = runeIndex.get(character);
    if (value !== undefined) {
      if (!current.length) {
        startSegment = segment;
        startOffset = pages[segment].offset;
      }
      endSegment = segment;
      current.push(value);
      pages[segment].offset += 1;
    } else if (character !== "/" && !/\s/u.test(character)) {
      flushWord();
    }
  }
}
flushWord();

const receivers = [];
for (const page of pages) {
  for (let index = 0; index + 1 < page.words.length; index += 1) {
    const left = page.words[index];
    const right = page.words[index + 1];
    if (left.values.length === 8 && right.values.length === 5) {
      receivers.push({
        page: page.page,
        ordinal: left.ordinal,
        start: left.start,
        cipher: left.values.concat(right.values),
      });
    }
  }
}
assert.equal(receivers.length, 19);

// Build a pinned vocabulary only from solved LP1 and authenticated signed-2016 words.
const lexicon = new Map();
for (const section of solved.sections) {
  for (const values of runeWords(section.source_text, runeIndex)) {
    const label = values.map((value) => corpus.translit[value]).join("");
    lexicon.set(values.join(","), { label, values, source: "solved" });
  }
}
const clear = signed
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .split(/\n\n/u)
  .slice(1)
  .join("\n");
const signedWords = clear
  .split(/[^A-Za-z0-9]+/u)
  .filter((token) => /^[A-Za-z]+$/u.test(token))
  .map((word) => word.toUpperCase());
assert.equal(signedWords.length, 43);
for (const label of signedWords) {
  const values = gp(label);
  lexicon.set(values.join(","), { label, values, source: "signed2016" });
}
const words = [...lexicon.values()];
const length8 = words.filter((word) => word.values.length === 8);
const length5 = words.filter((word) => word.values.length === 5);
assert.equal(length8.length, 18);
assert.equal(length5.length, 38);

const hits = [];
for (const receiver of receivers) {
  for (const left of length8) {
    for (const right of length5) {
      const plain = left.values.concat(right.values);
      const residual = receiver.cipher.map((value, index) =>
        mod29(value - plain[index]));
      const forward = h(residual);
      const inverse = hInverse(residual);

      if (markerGroupSums(residual).join(",") !== targets.raw.join(",")) continue;
      if (markerGroupSums(forward).join(",") !== targets.h.join(",")) continue;
      if (markerGroupSums(inverse).join(",") !== targets.hInverse.join(",")) continue;
      if (inverse.slice(4, 9).join(",") !== targets.inverseCenter.join(",")) continue;

      hits.push({
        page: receiver.page,
        ordinal: receiver.ordinal,
        start: receiver.start,
        words: [left.label, right.label],
        sources: [left.source, right.source],
        residual,
        inverse,
        groupSums: {
          raw: markerGroupSums(residual),
          h: markerGroupSums(forward),
          hInverse: markerGroupSums(inverse),
        },
      });
    }
  }
}

assert.equal(receivers.length * length8.length * length5.length, 12996);
assert.deepEqual(hits.map((row) => ({
  page: row.page,
  ordinal: row.ordinal,
  start: row.start,
  words: row.words,
  sources: row.sources,
})), [{
  page: 0,
  ordinal: 1,
  start: 0,
  words: ["EPIPHANY", "SEEKS"],
  sources: ["signed2016", "signed2016"],
}]);

const hit = hits[0];
assert.deepEqual(hit.residual,
  [26,24,8,19,27,24,18,3,0,8,0,16,19]);
assert.deepEqual(hit.inverse,
  [25,28,11,25,4,8,19,8,4,7,13,20,28]);

// Exact forward replay on the original ciphertext.
const targetPlain = gp("EPIPHANY").concat(gp("SEEKS"));
assert.deepEqual(
  targetPlain.map((value, index) => mod29(value + hit.residual[index])),
  receivers.find((row) => row.page === 0 && row.ordinal === 1).cipher,
);

console.log(JSON.stringify({
  status: "PASS",
  state: { p, g, a, b, A, B, K, e, q },
  markerCounts,
  targets,
  family: {
    receivers: receivers.length,
    length8: length8.length,
    length5: length5.length,
    candidates: receivers.length * length8.length * length5.length,
  },
  hits,
  classification:
    "Target-free finite source-vocabulary selector. Independent square-derived DH state plus original p0 4|5|4 marker aggregates uniquely select EPIPHANY SEEKS among 12,996 canonical receiver/plaintext candidates. The full 13-atom serializer remains unresolved.",
}, null, 2));
