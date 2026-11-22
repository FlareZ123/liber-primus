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

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");
const parts = transcription.split(/^\s*%\s*$/m);
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const gpTokens = corpus.translit
  .map((symbol, value) => ({symbol, value}))
  .sort((a, b) => b.symbol.length - a.symbol.length);
const tableTokens = grid.rows.flat();
const alpha60 = grid.alphabet;

/** @param {number} page @returns {string} */
function physicalPart(page) {
  assert.ok(page >= 0 && page <= 55 && page !== 50);
  return parts[page <= 49 ? page : page - 1];
}

/** @param {number} page @returns {number[][]} */
function pageWords(page) {
  const source = physicalPart(page);
  const out = [];
  let current = [];

  const flush = () => {
    if (!current.length) return;
    out.push(current.slice());
    current = [];
  };

  for (const ch of source) {
    const value = runeIndex.get(ch);
    if (value !== undefined) {
      current.push(value);
    } else if (ch === "-" || ch === "." || ch === "&") {
      flush();
    } else if (ch === "/" || /\s/u.test(ch)) {
      // printed line wraps preserve a word
    } else {
      flush();
    }
  }
  flush();
  return out;
}

/** @param {number} page @returns {number[]} */
function strictInterior(page) {
  return pageWords(page).flatMap((word) =>
    word.length >= 2 ? word.slice(1, -1) : []
  );
}

/** @param {[number,number]} pair @returns {[number,number]} */
function H(pair) {
  return [mod29(pair[0] - pair[1]), mod29(pair[0] + pair[1])];
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

// Upstream Agent10 geometry selected p55 strict interior and its D...D span.
// Reproduce the exact object without using the held-out RISE/WE relation.
const p55Strict = strictInterior(55);
assert.equal(p55Strict.length, 43);
assert.deepEqual([p55Strict[4], p55Strict[22]], [23, 23]);

const span = p55Strict.slice(4, 23);
assert.equal(span.length, 19);
assert.deepEqual([span[0], span[18]], [23, 23]);

// Literal circumference shedding twice leaves a 15-rune object. Its new
// circumference is the original span's positions2 and16.
const shed1 = span.slice(1, -1);
const shed2 = shed1.slice(1, -1);
assert.equal(shed1.length, 17);
assert.equal(shed2.length, 15);
const circumference = [shed2[0], shed2[shed2.length - 1]];
assert.deepEqual(circumference, [27, 20]);

// The untouched circumference names RISE by GP0 and H maps it exactly to WE.
assert.equal(circumference[0] + circumference[1], 47);
assert.deepEqual(H(circumference), [7, 18]);
assert.equal(H(circumference).map((value) => corpus.translit[value]).join(""), "WE");

// Full manuscript control: charge every 19-rune window in the strict-interior
// representation used by the selected p55 geometry. Require only D endpoints
// and the twice-shed RISE->WE consequence. Do not use the p55 center.
let windows = 0;
const hits = [];
for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  const strict = strictInterior(page);

  for (let start = 0; start + 19 <= strict.length; start += 1) {
    windows += 1;
    const candidate = strict.slice(start, start + 19);
    if (candidate[0] !== 23 || candidate[18] !== 23) continue;

    const pair = [candidate[2], candidate[16]];
    const mapped = H(pair);
    if (
      pair[0] + pair[1] === 47 &&
      mapped[0] === 7 &&
      mapped[1] === 18
    ) {
      hits.push({
        page,
        start,
        endpoints: [candidate[0], candidate[18]],
        twiceShedCircumference: pair,
        gp0: pair[0] + pair[1],
        H: mapped,
        text: mapped.map((value) => corpus.translit[value]).join(""),
        center: candidate[9],
      });
    }
  }
}
assert.equal(windows, 6209);
assert.deepEqual(hits, [{
  page: 55,
  start: 4,
  endpoints: [23, 23],
  twiceShedCircumference: [27, 20],
  gp0: 47,
  H: [7, 18],
  text: "WE",
  center: 10,
}]);

// The same WE runes are also authenticated source indices. This consumes the
// already frozen signed-2016 "words are the map / numbers are the direction"
// grammar without changing the p55 result.
const clear = signed2016.split("-----BEGIN PGP SIGNATURE-----")[0];
const signedWords = clear
  .slice(clear.indexOf("Hello."))
  .split(/[^A-Za-z0-9]+/u)
  .filter((token) => /^[A-Za-z]+$/u.test(token))
  .map((word) => word.toUpperCase());
assert.equal(signedWords.length, 43);

const direction = signedWords.map((word, index) =>
  mod29(alpha60.indexOf(tableTokens[index][1]) - index - gp(word).length)
);

const weValues = H(circumference);
assert.deepEqual(weValues.map((index) => signedWords[index]), ["THE", "MAP"]);
assert.deepEqual(weValues.map((index) => direction[index]), [23, 23]);
assert.equal(signedWords[23], "ROAD");

// Family control on solved-p57 two-rune words. WE is the sole member whose
// GP values, interpreted as authenticated source indices, both converge to the
// same direction destination; that destination is ROAD.
const p57TwoRuneWords = [
  {word: "THE", values: gp("THE")},
  {word: "TO", values: gp("TO")},
  {word: "WE", values: gp("WE")},
];
assert.deepEqual(p57TwoRuneWords, [
  {word: "THE", values: [2, 18]},
  {word: "TO", values: [16, 3]},
  {word: "WE", values: [7, 18]},
]);

const convergentTwoRuneWords = p57TwoRuneWords
  .map((row) => ({
    ...row,
    sourceWords: row.values.map((index) => signedWords[index]),
    destinations: row.values.map((index) => direction[index]),
  }))
  .filter((row) => row.destinations.every((value) => value === row.destinations[0]));

assert.deepEqual(convergentTwoRuneWords, [{
  word: "WE",
  values: [7, 18],
  sourceWords: ["THE", "MAP"],
  destinations: [23, 23],
}]);

console.log(JSON.stringify({
  status: "PASS",
  selected: {
    page: 55,
    strictInteriorLength: p55Strict.length,
    spanStart: 4,
    spanLength: span.length,
    endpoints: [span[0], span[18]],
  },
  shedding: {
    lengths: [19, 17, 15],
    circumference,
    circumferenceGp0: 47,
    circumferenceName: "RISE",
    H: H(circumference),
    HText: "WE",
  },
  control: {
    strictInteriorWindows19: windows,
    hits,
  },
  signedMapClosure: {
    values: weValues,
    sourceWords: weValues.map((index) => signedWords[index]),
    destinations: weValues.map((index) => direction[index]),
    destinationWord: signedWords[23],
    solvedP57TwoRuneConvergence: convergentTwoRuneWords,
  },
  interpretation:
    "Held-out consequence on the independently selected p55 DIVINITY span. Literal circumference shedding 19->17->15 exposes [27,20], whose GP0 is 47=RISE and whose fixed H image is [7,18]=WE. Across 6,209 strict-interior 19-rune windows, the conjunction D...D plus twice-shed RISE->WE occurs once, at p55 start4. The recovered WE values are simultaneously authenticated source indices THE/MAP, and both frozen direction edges converge on 23=ROAD; among solved-p57 two-rune words, WE alone has a common signed-direction destination. The p55 result therefore re-enters the source map at ROAD/p23.",
}, null, 2));
