"use strict";

/**
 * WE MUST SHED radix-difference circumference gate.
 *
 * This source-exact test begins after the separately established ordered
 * transition from the conventional 60-digit p50 reading to the drop-f
 * 59-digit reading.
 *
 * Define the value actually shed at a printed table cell as
 *
 *   shed(i) = value60(i) - value59(i).
 *
 * The p28 DH23 geometry independently supplies shared K=2, so two complete
 * rectangular circumferences are removed from the physical 32x8 table.
 * The surviving 28x4 core has 112 cells, matching phi(GP-prime(SHED)).
 *
 * This test asks one locked question: what do the source-defined shed values
 * sum to on the two circumferences of that selected 28x4 object?
 *
 * It recovers no unknown LP2 plaintext and defines no ciphertext inverse.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8");
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const solved = JSON.parse(
  read("resources/external/relikd-solved-gp29-native-v1.json")
);
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const tokens = grid.pages.flatMap((page) => page.tokens);
const alphabet60 = grid.alphabet;
const alphabet59 = alphabet60.replace("f", "");

/** @param {string} token @param {string} alphabet */
function decode(token, alphabet) {
  const high = alphabet.indexOf(token[0]);
  const low = alphabet.indexOf(token[1]);
  assert.ok(high >= 0 && low >= 0);
  return high * alphabet.length + low;
}

/** @param {number[]} values */
function gp0(values) {
  return values.reduce((sum, value) => sum + value, 0);
}

/** @param {number[]} values */
function gpPrime(values) {
  return values.reduce((sum, value) => sum + corpus.prime[value], 0);
}

/** @param {number[]} values */
function translit(values) {
  return values.map((value) => corpus.translit[value]).join("");
}

/** @param {string} text */
function runeWords(text) {
  const normalized = text.replace(/\/\s*/gu, "");
  return (normalized.match(/[\u16A0-\u16FF]+/gu) || []).map((word) =>
    [...word].map((rune) => {
      const value = runeIndex.get(rune);
      assert.notEqual(value, undefined);
      return value;
    })
  );
}

/** @param {number} n */
function phi(n) {
  let result = n;
  let value = n;
  for (let factor = 2; factor * factor <= value; factor += 1) {
    if (value % factor !== 0) continue;
    while (value % factor === 0) value /= factor;
    result -= result / factor;
  }
  if (value > 1) result -= result / value;
  return result;
}

/** @param {number} base @param {number} exponent @param {number} modulus */
function powMod(base, exponent, modulus) {
  let result = 1;
  let factor = base % modulus;
  let power = exponent;
  while (power > 0) {
    if (power % 2 === 1) result = (result * factor) % modulus;
    factor = (factor * factor) % modulus;
    power = Math.floor(power / 2);
  }
  return result;
}

/** @param {number} depth */
function shellCells(depth) {
  const cells = [];
  const top = depth;
  const bottom = 31 - depth;
  const left = depth;
  const right = 7 - depth;

  for (let row = top; row <= bottom; row += 1) {
    for (let col = left; col <= right; col += 1) {
      if (
        row === top ||
        row === bottom ||
        col === left ||
        col === right
      ) {
        cells.push(row * 8 + col);
      }
    }
  }
  return cells;
}

/** @param {number[]} values @param {number[]} cells */
function sumAt(values, cells) {
  return cells.reduce((sum, cell) => sum + values[cell], 0);
}

const p57 = solved.sections.find((section) => section.name === "p57_parable");
assert.ok(p57);
const p57Rows = runeWords(p57.source_text).map((word, index) => ({
  position: index + 1,
  text: translit(word),
  gp0: gp0(word),
  prime: gpPrime(word),
  length: word.length,
}));

/** @param {string} text */
function p57Word(text) {
  const row = p57Rows.find((candidate) => candidate.text === text);
  assert.ok(row);
  return row;
}

const must = p57Word("MUST");
const shed = p57Word("SHED");
const tunnel = p57Word("TUNNELNG");
const surface = p57Word("SURFACE");
const divinity = p57Word("DIUINITY");

assert.deepEqual(
  {
    mustGp0: must.gp0,
    mustPrime: must.prime,
    shedGp0: shed.gp0,
    shedPrime: shed.prime,
    tunnelGp0: tunnel.gp0,
    surfaceGp0: surface.gp0,
    divinityGp0: divinity.gp0,
  },
  {
    mustGp0: 51,
    mustPrime: 186,
    shedGp0: 64,
    shedPrime: 232,
    tunnelGp0: 94,
    surfaceGp0: 67,
    divinityGp0: 105,
  }
);

// Reproduce the p28 DH23 shared value directly from the original page geometry.
const parts = transcription.split(/^\s*%\s*$/m);
const p28Lines = parts[28]
  .trim()
  .split("/")
  .filter((line) => line.trim().length > 0);
const line6Runes = [...p28Lines[5]].filter((rune) => runeIndex.has(rune));
assert.equal(line6Runes.length, 23);
assert.deepEqual(
  line6Runes.slice(0, 2).map((rune) => corpus.translit[runeIndex.get(rune)]),
  ["D", "H"]
);

const p28Words = runeWords(parts[28]);
const selectedWord = p28Words[27];
assert.deepEqual(selectedWord, [28, 24, 10, 1, 20]);
assert.equal(selectedWord.length, 5);

// The page transcription fixes word28 as the final word of physical line6.
// Its 1-based start within that 23-rune line is 19.
const line6Words = runeWords(p28Lines[5]);
assert.deepEqual(line6Words.at(-1), selectedWord);
const selectedLocalStart =
  1 +
  line6Words
    .slice(0, -1)
    .reduce((sum, word) => sum + word.length, 0);
assert.equal(selectedLocalStart, 19);

const dh23 = {
  p: line6Runes.length,
  g: selectedWord.length,
  a: 6,
  B: selectedLocalStart,
};
dh23.K = powMod(dh23.B, dh23.a, dh23.p);
assert.deepEqual(dh23, { p: 23, g: 5, a: 6, B: 19, K: 2 });

// Reproduce the already selected ordered radix transition.
assert.equal(alphabet60.length, 60);
assert.equal(alphabet59.length, 59);
assert.equal(phi(must.prime), 60);
assert.equal(tokens[must.gp0], "0x");
assert.equal(decode(tokens[must.gp0], alphabet60), 59);
assert.equal(p57Rows[must.position].text, "SHED");

const absentDigits = [...alphabet60].filter(
  (digit) => !tokens.some((token) => token.includes(digit))
);
assert.deepEqual(absentDigits, ["f"]);

// The value removed by changing the numeral state is source-defined.
const shedValues = tokens.map(
  (token) => decode(token, alphabet60) - decode(token, alphabet59)
);
assert.deepEqual(
  [...new Set(shedValues)].sort((a, b) => a - b),
  [0, 1, 2, 3, 4]
);
assert.equal(shedValues.reduce((sum, value) => sum + value, 0), 507);

// The four literal concentric circumferences of the physical 32x8 table.
const shells = [0, 1, 2, 3].map((depth) => {
  const cells = shellCells(depth);
  return {
    depth,
    cells,
    length: cells.length,
    shedSum: sumAt(shedValues, cells),
  };
});
assert.deepEqual(
  shells.map((shell) => shell.length),
  [76, 68, 60, 52]
);
assert.deepEqual(
  shells.map((shell) => shell.shedSum),
  [162, 146, 105, 94]
);

// Shared K=2 removes depths0 and1. The surviving 28x4 object is depths2+3.
const survivingCells = shells[2].cells.length + shells[3].cells.length;
assert.equal(survivingCells, 28 * 4);
assert.equal(survivingCells, 112);
assert.equal(phi(shed.prime), survivingCells);

// The exposed circumference is the unique shell whose shed-sum is DIVINITY.
assert.equal(shells[dh23.K].length, 60);
assert.equal(shells[dh23.K].shedSum, divinity.gp0);
assert.deepEqual(
  shells
    .filter((shell) => shell.shedSum === divinity.gp0)
    .map((shell) => shell.depth),
  [2]
);

// The only circumference within it is TUNNELNG.
assert.equal(shells[3].shedSum, tunnel.gp0);
assert.deepEqual(
  shells
    .filter((shell) => shell.shedSum === tunnel.gp0)
    .map((shell) => shell.depth),
  [3]
);


// The recovered inner-shell label has a typed page exit under the same
// post-SHED numeral state. Base59 selects the final unsolved physical page;
// the pre-transition base60 control selects solved p56 instead.
assert.equal(tokens[tunnel.gp0], "0u");
assert.equal(decode(tokens[tunnel.gp0], alphabet59), 55);
assert.equal(decode(tokens[tunnel.gp0], alphabet60), 56);

const p57PageLandings59 = p57Rows
  .map((word) => ({
    text: word.text,
    address: word.gp0,
    value: decode(tokens[word.gp0], alphabet59),
  }))
  .filter((row) => row.value >= 0 && row.value <= 57);
assert.deepEqual(
  p57PageLandings59
    .filter((row) => row.value >= 54)
    .map((row) => ({ text: row.text, value: row.value })),
  [{ text: "TUNNELNG", value: 55 }]
);

// "TUNNELNG TO THE SURFACE": SURFACE's GP0 address is on the inner ring.
// Under the newly selected base59 pointer, it jumps in one edge to the
// exposed depth2 ring, at the global fixed point.
const shellSets = shells.map((shell) => new Set(shell.cells));
assert.equal(shellSets[3].has(surface.gp0), true);
assert.equal(tokens[surface.gp0], "3C");
const surfaceTarget = decode(tokens[surface.gp0], alphabet59);
assert.equal(surfaceTarget, 189);
assert.equal(shellSets[2].has(surfaceTarget), true);
assert.equal(tokens[surfaceTarget], "3C");
assert.equal(decode(tokens[surfaceTarget], alphabet59), surfaceTarget);

// Matched scale diagnostic: permute the exact 256 shed-value multiset over
// fixed table positions. This is post-discovery calibration, not a historical
// authorship p-value.
let rngState = 0x48b5902d;
/** @returns {number} */
function rand32() {
  let x = rngState >>> 0;
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  rngState = x >>> 0;
  return rngState;
}

/** @param {number[]} values */
function shuffle(values) {
  const copy = values.slice();
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = rand32() % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const trials = 100000;
let depth2Divinity = 0;
let jointNested = 0;
for (let trial = 0; trial < trials; trial += 1) {
  const shuffled = shuffle(shedValues);
  const sum2 = sumAt(shuffled, shells[2].cells);
  const sum3 = sumAt(shuffled, shells[3].cells);
  if (sum2 === divinity.gp0) depth2Divinity += 1;
  if (sum2 === divinity.gp0 && sum3 === tunnel.gp0) jointNested += 1;
}

console.log(
  JSON.stringify(
    {
      status:
        "PASS: selected 60->59 shed values label the shared2 surface DIVINITY and its inner circumference TUNNELNG",
      dh23,
      radixTransition: {
        mustPrime: must.prime,
        phiMustPrime: phi(must.prime),
        mustGp0: must.gp0,
        mustToken: tokens[must.gp0],
        mustBase60Value: decode(tokens[must.gp0], alphabet60),
        instruction: "SHED",
        absentDigits,
      },
      shells: shells.map((shell) => ({
        depth: shell.depth,
        length: shell.length,
        shedSum: shell.shedSum,
        p57Gp0Matches: p57Rows
          .filter((word) => word.gp0 === shell.shedSum)
          .map((word) => word.text),
      })),
      survivingCore: {
        dimensions: [28, 4],
        cells: survivingCells,
        phiShedPrime: phi(shed.prime),
        exposedDepth: dh23.K,
        exposedLength: shells[2].length,
        exposedShedSum: shells[2].shedSum,
        exposedLabel: "DIUINITY",
        innerLength: shells[3].length,
        innerShedSum: shells[3].shedSum,
        innerLabel: "TUNNELNG",
        tunnelPageExit59: decode(tokens[tunnel.gp0], alphabet59),
        tunnelPageControl60: decode(tokens[tunnel.gp0], alphabet60),
        terminalPageLandings59: p57PageLandings59.filter(
          (row) => row.value >= 54
        ),
      },
      surfacePointer: {
        address: surface.gp0,
        addressShell: 3,
        token: tokens[surface.gp0],
        target: surfaceTarget,
        targetShell: 2,
        fixedPoint: decode(tokens[surfaceTarget], alphabet59),
      },
      matchedShuffle: {
        trials,
        seed: "0x48b5902d",
        depth2Divinity,
        depth2DivinityRate: depth2Divinity / trials,
        jointNested,
        jointNestedRate: jointNested / trials,
        warning:
          "post-discovery scale diagnostic only; shared2 is independently fixed, while the radix-difference shell statistic was discovered in this invocation",
      },
      interpretation:
        "After WE MUST SHED selects the 60->59 transition, value60-value59 is the literal amount shed at each p50 cell. Independent DH shared2 removes two outer circumferences. The resulting 28x4 core has phi(GP-prime(SHED))=112 cells. Its exposed 60-cell circumference has shed-sum GP0(DIUINITY)=105, while the only circumference within has shed-sum GP0(TUNNELNG)=94. GP0(SURFACE)=67 lies on that inner ring and its base59 pointer moves in one edge to fixed point189 on the exposed DIVINITY ring. The recovered TUNNELNG address94 then maps under the selected base59 state to physical p55; base60 would map to p56, and TUNNELNG is the only p57 word whose base59 value lands in terminal pages54-57. No unknown plaintext is recovered.",
    },
    null,
    2
  )
);
