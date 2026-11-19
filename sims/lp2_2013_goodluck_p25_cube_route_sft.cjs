"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");

/** @param {string} relative */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const screen2013 = read("resources/historical/cicada2013-os-original-message.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");

const gpTokens = corpus.translit
  .map((symbol, value) => ({symbol, value}))
  .sort((a, b) => b.symbol.length - a.symbol.length);

/** @param {number} value */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number} base @param {number} exponent @param {number} modulus */
function powmod(base, exponent, modulus) {
  let result = 1 % modulus;
  let value = ((base % modulus) + modulus) % modulus;
  let power = exponent;
  while (power > 0) {
    if (power % 2 === 1) result = (result * value) % modulus;
    value = (value * value) % modulus;
    power = Math.floor(power / 2);
  }
  return result;
}

/** @param {string} word */
function gp(word) {
  const normalized = word.toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/[KQ]/g, "C")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");
  const values = [];
  for (let offset = 0; offset < normalized.length;) {
    if (normalized.startsWith("ING", offset)) {
      values.push(21);
      offset += 3;
      continue;
    }
    if (normalized.startsWith("IO", offset)) {
      values.push(27);
      offset += 2;
      continue;
    }
    const token = gpTokens.find(row =>
      normalized.startsWith(row.symbol, offset)
    );
    assert.ok(token, "unmapped GP spelling " + normalized.slice(offset));
    values.push(token.value);
    offset += token.symbol.length;
  }
  return values;
}

/** @param {string} text */
function gp0(text) {
  return text.split(/[^A-Za-z]+/).filter(Boolean).flatMap(gp)
    .reduce((sum, value) => sum + value, 0);
}

/** @param {number} a @param {number} b */
function H(a, b) {
  return [mod29(a - b), mod29(a + b)];
}

/** @param {number[]} values */
function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

assert.ok(screen2013.includes("Good luck."));
assert.equal(gp0("GOOD LUCK"), 66);

const table = grid.rows.flat();
const alphabet60 = grid.alphabet;
const table60 = table.map(token =>
  60 * alphabet60.indexOf(token[0]) + alphabet60.indexOf(token[1])
);
const table59 = table.map(token =>
  59 * alphabet60.indexOf(token[0]) + alphabet60.indexOf(token[1])
);

assert.equal(table[66], "0P");
assert.equal(table60[66], 25);
assert.equal(table59[66], 25);

const clear2016 = signed2016.split("-----BEGIN PGP SIGNATURE-----")[0];
const body2016 = clear2016.slice(clear2016.indexOf("Hello."));
const sourceWords = body2016
  .split(/[^A-Za-z0-9]+/)
  .filter(token => /^[A-Za-z]+$/.test(token))
  .map(token => token.toUpperCase());

assert.equal(sourceWords[29], "DIRECTION");
assert.equal(sourceWords[30], "SEEK");
assert.equal(sourceWords[36], "GOOD");
assert.equal(sourceWords[37], "LUCK");

const direction = 29;
const e = 3;
const K = 2;
const g = 5;
const wordExponent = powmod(e, e, 28);
assert.equal(wordExponent, 27);

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const parts = transcription.split(/^\s*%\s*$/m);

/** @param {number} page */
function physicalPart(page) {
  assert.notEqual(page, 50);
  return parts[page <= 49 ? page : page - 1];
}

/** @param {string} text */
function parseWords(text) {
  const words = [];
  const runes = [];
  let current = [];
  let start = 0;

  function flush() {
    if (!current.length) return;
    words.push({start, values: current});
    current = [];
  }

  for (const character of [...text]) {
    const value = runeIndex.get(character);
    if (value !== undefined) {
      if (current.length === 0) start = runes.length;
      current.push(value);
      runes.push(value);
    } else if (character === "-" || character === ".") {
      flush();
    }
  }
  flush();
  return {words, runes};
}

/**
 * @param {number[]} runes
 * @param {{start:number,values:number[]}} word
 * @param {"predecessor"|"successor"} side
 */
function boundaryRune(runes, word, side) {
  const position = side === "predecessor"
    ? word.start - 1
    : word.start + word.values.length;
  return position >= 0 && position < runes.length ? runes[position] : null;
}

/** @param {number} state */
function low60Step(state) {
  if (!Number.isInteger(state) || state < 0 || state >= table.length) return null;
  const value = alphabet60.indexOf(table[state][1]);
  return value >= 0 ? value : null;
}

/**
 * The prior source-cube family: one boundary rune gets C(x)=x^3 mod29;
 * the adjacent five-rune word gets x^27 mod29. Successor-side output is rotated
 * so the boundary stays on the selected side.
 */
function cubeSideOutput(parsed, word, side) {
  const boundary = boundaryRune(parsed.runes, word, side);
  assert.notEqual(boundary, null);
  let output = [
    powmod(boundary, e, direction),
    ...word.values.map(value => powmod(value, wordExponent, direction)),
  ];
  if (side === "successor") output = [...output.slice(1), output[0]];
  return {boundary, output};
}

const p25 = parseWords(physicalPart(25));
assert.ok(p25.words.length >= 30);
const p25Word30 = p25.words[29];
assert.equal(p25Word30.start, 145);
assert.deepEqual(p25Word30.values, [3, 20, 10, 11, 16]);
const p25Cube = cubeSideOutput(p25, p25Word30, "predecessor");
assert.equal(p25Cube.boundary, 18);
assert.deepEqual(
  [p25Cube.boundary, ...p25Word30.values],
  [18, 3, 20, 10, 11, 16]
);
assert.deepEqual(p25Cube.output, [3, 10, 16, 3, 8, 20]);

// Candidate consequence under the unselected whole-phrase GP0 -> p50 address grammar.
const p25Source = [p25Cube.boundary, ...p25Word30.values];
const p25Outer = H(p25Source[0], p25Source.at(-1));
assert.deepEqual(p25Outer, [K, g]);

// Charge the same source-outer condition over the complete 627 five-rune
// side-object family.
const kgHits = [];
let sideObjects = 0;
for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  const parsed = parseWords(physicalPart(page));
  for (let wordIndex = 0; wordIndex < parsed.words.length; wordIndex += 1) {
    const word = parsed.words[wordIndex];
    if (word.values.length !== 5) continue;
    for (const side of ["predecessor", "successor"]) {
      const boundary = boundaryRune(parsed.runes, word, side);
      if (boundary === null) continue;
      sideObjects += 1;
      const source = side === "predecessor"
        ? [boundary, ...word.values]
        : [...word.values, boundary];
      const outer = H(source[0], source.at(-1));
      if (outer[0] === K && outer[1] === g) {
        kgHits.push({
          page,
          word: wordIndex + 1,
          start: word.start,
          side,
          boundary,
          wordValues: word.values,
          source,
          outer,
        });
      }
    }
  }
}
assert.equal(sideObjects, 627);
assert.deepEqual(kgHits, [{
  page: 25,
  word: 30,
  start: 145,
  side: "predecessor",
  boundary: 18,
  wordValues: [3, 20, 10, 11, 16],
  source: [18, 3, 20, 10, 11, 16],
  outer: [2, 5],
}]);

// The fresh g=5 state fixes the existing p25 hit's formerly untyped cut5.
const cut = p25Outer[1];
assert.equal(cut, 5);
const left = sum(p25Cube.output.slice(0, cut));
const right = sum(p25Cube.output.slice(cut));
assert.deepEqual([left, right], [40, 20]);
assert.equal(sourceWords[left], "PATHS");
assert.equal(sourceWords[right], "MEANING");

const pointer = [left];
for (let index = 0; index < 3; index += 1) {
  pointer.push(low60Step(pointer.at(-1)));
}
assert.deepEqual(pointer, [40, 20, 42, 28]);
assert.equal(sourceWords[40], "PATHS");
assert.equal(sourceWords[20], "MEANING");
assert.equal(sourceWords[42], "OPENPGP");

// Reproduce the two-hit source-cube pointer census to keep the prior family
// boundary explicit. GOOD LUCK's p25 address is conditional on GP0 -> p50.
const pointerHits = [];
let splitConfigurations = 0;
for (let page = 0; page <= 55; page += 1) {
  if (page === 50) continue;
  const parsed = parseWords(physicalPart(page));
  for (let wordIndex = 0; wordIndex < parsed.words.length; wordIndex += 1) {
    const word = parsed.words[wordIndex];
    if (word.values.length !== 5) continue;
    for (const side of ["predecessor", "successor"]) {
      const boundary = boundaryRune(parsed.runes, word, side);
      if (boundary === null) continue;
      const {output} = cubeSideOutput(parsed, word, side);
      for (let candidateCut = 1; candidateCut < output.length; candidateCut += 1) {
        splitConfigurations += 1;
        const candidateLeft = sum(output.slice(0, candidateCut));
        const candidateRight = sum(output.slice(candidateCut));
        if (
          low60Step(candidateLeft) === candidateRight &&
          low60Step(candidateRight) === 42 &&
          low60Step(42) === 28
        ) {
          pointerHits.push({
            page,
            word: wordIndex + 1,
            start: word.start,
            side,
            cut: candidateCut,
            output,
            left: candidateLeft,
            right: candidateRight,
            latin: output.map(value => corpus.translit[value]).join(""),
          });
        }
      }
    }
  }
}
assert.equal(splitConfigurations, 3135);
assert.deepEqual(pointerHits, [
  {
    page: 25,
    word: 30,
    start: 145,
    side: "predecessor",
    cut: 5,
    output: [3, 10, 16, 3, 8, 20],
    left: 40,
    right: 20,
    latin: "OITOHL",
  },
  {
    page: 28,
    word: 28,
    start: 135,
    side: "predecessor",
    cut: 3,
    output: [4, 28, 23, 3, 1, 16],
    left: 55,
    right: 20,
    latin: "READOUT",
  },
]);

const p28Hit = pointerHits[1];
assert.equal(
  p28Hit.output.map(value => corpus.translit[value]).join(""),
  "READOUT"
);

console.log(JSON.stringify({
  status: "PASS",
  heldOutSourcePointer: {
    phrase: "GOOD LUCK",
    gp0: 66,
    p50Token: table[66],
    base59: table59[66],
    base60: table60[66],
    selectedPhysicalPage: 25,
  },
  sourceAlignment: {
    signed29: sourceWords[29],
    signed30: sourceWords[30],
    signed36: sourceWords[36],
    signed37: sourceWords[37],
    p25Object: kgHits[0],
  },
  freshHoldout: {
    familySize: sideObjects,
    exactKgHits: kgHits.length,
    outerState: p25Outer,
  },
  candidateCubeRoute: {
    output: p25Cube.output,
    stateSelectedCut: cut,
    sums: [left, right],
    signedLabels: [sourceWords[left], sourceWords[right]],
    lowDigitPointer: pointer,
    destination: "p28 READ OUT",
  },
  chargedPriorFamily: {
    splitConfigurations,
    pointerHits,
  },
  decision:
    "Under the candidate whole-phrase GP0 -> p50 address grammar, GOOD LUCK points to p25; that grammar is not yet source-selected. The p25 side-object is the sole one of 627 whose outer H equals [K,g]=[2,5], and g=5 fixes cut5. Its 40 -> 20 -> 42 -> 28 continuation uses the low-digit map whose generalization failed #1787. Preserve this as a structural navigation candidate; OITOHL is not plaintext.",
}, null, 2));
