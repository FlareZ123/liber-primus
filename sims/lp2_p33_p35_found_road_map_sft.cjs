"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number} a @param {number} b @returns {[number, number]} */
function H(a, b) {
  return [mod29(a - b), mod29(a + b)];
}

/** @param {number} a @param {number} b @returns {[number, number]} */
function Hinv(a, b) {
  const inv2 = 15;
  return [mod29((a + b) * inv2), mod29((b - a) * inv2)];
}

/** @param {number} count @returns {number[]} */
function firstPrimes(count) {
  const out = [];
  for (let candidate = 2; out.length < count; candidate += 1) {
    let prime = true;
    for (let divisor = 2; divisor * divisor <= candidate; divisor += 1) {
      if (candidate % divisor === 0) {
        prime = false;
        break;
      }
    }
    if (prime) out.push(candidate);
  }
  return out;
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const grid = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({symbol, value}))
  .sort((a, b) => b.symbol.length - a.symbol.length);
const parts = transcription.split(/^\s*%\s*$/m);
const primes = firstPrimes(130);
const tableTokens = grid.rows.flat();
const alpha60 = grid.alphabet;

/** @param {number} ordinal @returns {number} */
function totientPrimeOrdinal(ordinal) {
  assert.ok(Number.isInteger(ordinal) && ordinal >= 1 && ordinal <= primes.length);
  return mod29(primes[ordinal - 1] - 1);
}

/** @param {number[]} ordinals @returns {string} */
function cardinalText(ordinals) {
  return ordinals
    .map(totientPrimeOrdinal)
    .map((value) => corpus.translit[value])
    .join("");
}

/** @param {string} word @returns {number[]} */
function gp(word) {
  const normalized = word
    .toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/[KQ]/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");
  const out = [];
  for (let index = 0; index < normalized.length;) {
    if (normalized.startsWith("ING", index)) {
      out.push(21);
      index += 3;
      continue;
    }
    if (normalized.startsWith("IO", index)) {
      out.push(27);
      index += 2;
      continue;
    }
    const token = gpTokens.find((row) => normalized.startsWith(row.symbol, index));
    assert.ok(token, "unmapped GP spelling at " + normalized.slice(index));
    out.push(token.value);
    index += token.symbol.length;
  }
  return out;
}

/** @param {number} page @returns {string} */
function physicalPart(page) {
  assert.notEqual(page, 50);
  return parts[page <= 49 ? page : page - 1];
}

/** @param {number} page @returns {{values:number[],start:number,end:number,length:number,gp0:number}[]} */
function pageWords(page) {
  const text = physicalPart(page);
  const words = [];
  let offset = 0;
  let start = 0;
  let current = [];

  const flush = () => {
    if (!current.length) return;
    words.push({
      values: current.slice(),
      start,
      end: offset - 1,
      length: current.length,
      gp0: current.reduce((sum, value) => sum + value, 0),
    });
    current = [];
  };

  for (const ch of text) {
    const value = runeIndex.get(ch);
    if (value !== undefined) {
      if (!current.length) start = offset;
      current.push(value);
      offset += 1;
    } else if (ch === "-" || ch === ".") {
      flush();
    }
  }
  flush();
  return words;
}

/**
 * @param {{start:number,end:number,length:number}[]} rows
 * @param {number} start
 * @param {number} end
 * @returns {number[]}
 */
function lengthsInside(rows, start, end) {
  return rows
    .filter((row) => row.start >= start && row.end < end)
    .map((row) => row.length);
}

/** @param {number[]} lengths @param {("H"|"Hinv")[]} modes @returns {number[]} */
function extendPairs(lengths, modes) {
  assert.equal(lengths.length, modes.length * 2);
  const out = [];
  for (let pair = 0; pair < modes.length; pair += 1) {
    const a = lengths[pair * 2];
    const b = lengths[(pair * 2) + 1];
    out.push(a, b, ...(modes[pair] === "H" ? H(a, b) : Hinv(a, b)));
  }
  return out;
}

// Authenticated 43-word carrier.
const clear = signed2016.split("-----BEGIN PGP SIGNATURE-----")[0];
const signedWords = clear
  .slice(clear.indexOf("Hello."))
  .split(/[^A-Za-z0-9]+/u)
  .filter((token) => /^[A-Za-z]+$/u.test(token))
  .map((word) => word.toUpperCase());
assert.equal(signedWords.length, 43);
assert.equal(signedWords[23], "ROAD");
assert.equal(signedWords[35], "FOUND");
assert.equal(signedWords[40], "PATHS");

// P33 hidden text: THEIR RISE.
const p33Rows = pageWords(33);
const p33Ink = ink.pages.find((page) => page.page === 33);
assert.ok(p33Ink);
assert.deepEqual(
  p33Ink.red_spans.map((span) => [span.start, span.length]),
  [[0, 10], [91, 8]]
);
const p33Upper = lengthsInside(p33Rows, 0, 10);
const p33Lower = lengthsInside(p33Rows, 91, 99);
assert.deepEqual(p33Upper, [2, 8]);
assert.deepEqual(p33Lower, [3, 5]);
assert.equal(cardinalText(extendPairs(p33Upper, ["Hinv"])), "THEIR");
assert.equal(cardinalText(extendPairs(p33Lower, ["H"])), "RISE");

// The numbers that generate RISE give a literal +2 physical-page move.
const rise = p33Lower[1] - p33Lower[0];
assert.equal(rise, 2);
const foundPage = 33 + rise;
assert.equal(foundPage, 35);
assert.equal(signedWords[foundPage], "FOUND");

// P35 held-out word-level structure: exact adjacent 36 <-> 54 p50-low cycle.
const p35 = pageWords(foundPage);
assert.deepEqual(p35.slice(6, 8).map((row) => ({
  start: row.start,
  end: row.end,
  values: row.values,
  gp0: row.gp0,
})), [
  {start: 25, end: 26, values: [19, 17], gp0: 36},
  {start: 27, end: 29, values: [19, 24, 11], gp0: 54},
]);

function low60At(address) {
  assert.ok(address >= 0 && address < tableTokens.length);
  return alpha60.indexOf(tableTokens[address][1]);
}
assert.equal(low60At(36), 54);
assert.equal(low60At(54), 36);

// Exhaustive page-local adjacency census over every unsolved rune-bearing page.
const unknownRunePages = [
  ...Array.from({length: 50}, (_, index) => index),
  ...Array.from({length: 5}, (_, index) => index + 51),
];
let adjacentWindows = 0;
const mutualPairs = [];
for (const page of unknownRunePages) {
  const rows = pageWords(page);
  for (let index = 0; index + 1 < rows.length; index += 1) {
    adjacentWindows += 1;
    const left = rows[index];
    const right = rows[index + 1];
    if (
      left.gp0 < tableTokens.length &&
      right.gp0 < tableTokens.length &&
      low60At(left.gp0) === right.gp0 &&
      low60At(right.gp0) === left.gp0
    ) {
      mutualPairs.push({
        page,
        leftOrdinal: index,
        leftStart: left.start,
        leftEnd: left.end,
        leftGp0: left.gp0,
        rightOrdinal: index + 1,
        rightStart: right.start,
        rightEnd: right.end,
        rightGp0: right.gp0,
      });
    }
  }
}
assert.equal(adjacentWindows, 2873);
assert.deepEqual(mutualPairs, [{
  page: 35,
  leftOrdinal: 6,
  leftStart: 25,
  leftEnd: 26,
  leftGp0: 36,
  rightOrdinal: 7,
  rightStart: 27,
  rightEnd: 29,
  rightGp0: 54,
}]);

// Source semantics for the two GP0 states.
const sourceGp0 = Object.fromEntries(["FOUND", "ROAD", "PATHS"].map((word) => [
  word,
  gp(word).reduce((sum, value) => sum + value, 0),
]));
assert.deepEqual(sourceGp0, {FOUND: 36, ROAD: 54, PATHS: 54});

// The already selected source direction graph resolves the 54 collision.
const direction = signedWords.map((word, index) =>
  mod29(low60At(index) - index - gp(word).length)
);
const foundRoute = [];
let cursor = 35;
for (let step = 0; step < 5; step += 1) {
  foundRoute.push(cursor);
  cursor = direction[cursor];
}
assert.deepEqual(foundRoute, [35, 28, 0, 18, 23]);
assert.deepEqual(foundRoute.map((index) => signedWords[index]), [
  "FOUND", "THE", "HELLO", "MAP", "ROAD",
]);

const pathsRoute = [];
cursor = 40;
for (let step = 0; step < 12; step += 1) {
  pathsRoute.push(cursor);
  cursor = direction[cursor];
}
assert.ok(!pathsRoute.includes(23));

// The first direction step points from physical p35 to p28. Original p28 line6
// begins with literal GP runes D,H, independently matching the source-derived DH state.
const p28Lines = physicalPart(28)
  .split("/")
  .filter((line) => /[\u16A0-\u16FF]/u.test(line));
assert.equal(p28Lines.length, 12);
const p28Line6Runes = [...p28Lines[5]]
  .map((rune) => runeIndex.get(rune))
  .filter((value) => value !== undefined);
assert.deepEqual(p28Line6Runes.slice(0, 2), [23, 8]);
assert.equal(p28Line6Runes.slice(0, 2).map((value) => corpus.translit[value]).join(""), "DH");

// The ROAD page itself has a second hidden cardinal instruction.
const p23Rows = pageWords(23);
const p23Ink = ink.pages.find((page) => page.page === 23);
assert.ok(p23Ink);
assert.deepEqual(
  p23Ink.red_spans.map((span) => [span.start, span.length]),
  [[0, 16]]
);
const p23Title = lengthsInside(p23Rows, 0, 16);
assert.deepEqual(p23Title, [2, 6, 3, 5]);
const p23Hidden = cardinalText(extendPairs(p23Title, ["H", "H"]));
assert.equal(p23Hidden, "THEONERISE");

// Charge every comparable red span under every pairwise H/Hinv polarity.
// THEONERISE must be isolated rather than selected from a large plaintext sweep.
const pairwiseVariants = [];
for (const page of ink.pages) {
  const rows = pageWords(page.page);
  for (const span of page.red_spans || []) {
    const lengths = lengthsInside(rows, span.start, span.start + span.length);
    if (
      lengths.length === 0 ||
      lengths.length % 2 !== 0 ||
      lengths.reduce((sum, value) => sum + value, 0) !== span.length ||
      lengths.length > 12
    ) continue;
    const pairCount = lengths.length / 2;
    for (let mask = 0; mask < (1 << pairCount); mask += 1) {
      const modes = Array.from({length: pairCount}, (_, pair) =>
        (mask & (1 << pair)) ? "Hinv" : "H"
      );
      const ordinals = extendPairs(lengths, modes);
      if (!ordinals.every((value) => value >= 1 && value <= primes.length)) continue;
      pairwiseVariants.push({
        page: page.page,
        start: span.start,
        lengths,
        modes,
        text: cardinalText(ordinals),
      });
    }
  }
}
const oneRiseHits = pairwiseVariants.filter((row) => row.text === "THEONERISE");
assert.deepEqual(oneRiseHits, [{
  page: 23,
  start: 0,
  lengths: [2, 6, 3, 5],
  modes: ["H", "H"],
  text: "THEONERISE",
}]);

// The selected p35 pair's raw runes also compress under the already frozen H
// into simple reconstructed-state expressions. These are corroboration only.
const p35LeftShell = H(p35[6].values[0], p35[6].values[1]);
const p35RightShell = [
  ...H(p35[7].values[0], p35[7].values[2]),
  p35[7].values[1],
];
assert.deepEqual(p35LeftShell, [2, 7]);
assert.deepEqual(p35RightShell, [8, 1, 24]);

console.log(JSON.stringify({
  status: "PASS",
  p33: {
    hidden: "THEIR RISE",
    riseSourceNumbers: p33Lower,
    rise,
    destinationPage: foundPage,
    destinationWord: signedWords[foundPage],
  },
  p35: {
    uniqueMutualLowDigitPair: mutualPairs[0],
    manuscriptAdjacentWindows: adjacentWindows,
    sourceGp0,
    rawPair: [p35[6].values, p35[7].values],
    hShells: [p35LeftShell, p35RightShell],
  },
  directionGraph: {
    foundToRoad: foundRoute.map((index) => ({index, word: signedWords[index]})),
    pathsControl: pathsRoute.map((index) => ({index, word: signedWords[index]})),
    firstPhysicalStep: "p35 -> p28",
    p28Literal: "DH",
  },
  p23: {
    signedWord: signedWords[23],
    titleLengths: p23Title,
    hidden: p23Hidden,
    chargedPairwiseVariants: pairwiseVariants.length,
    exactHiddenHits: oneRiseHits.length,
  },
  interpretation:
    "P33 RISE selects p35=FOUND by its own printed 3->5 rise. Without fitting a new cipher, p35 contains the manuscript's sole adjacent mutual p50-low GP0 pair 36<->54, matching FOUND<->ROAD/PATHS. The frozen source direction graph puts FOUND in ROAD's basin and PATHS in the other basin, resolving the pair to ROAD and giving physical route p35->p28->p0->p18->p23. P28 exposes literal DH; p23=ROAD independently hides THE ONE RISE under the same cardinal/H mechanism.",
}, null, 2));
