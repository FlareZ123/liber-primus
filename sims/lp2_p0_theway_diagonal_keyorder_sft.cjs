"use strict";

/**
 * Agent17 SFT: test whether the source-selected THE1..WAY13 numbered diagonal
 * independently emits the 13 p0 state-key atoms.
 * Node.js 22 / CommonJS. Reads canonical repository resources only.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(ROOT, relative), "utf8").replace(/\r/g, "");
}

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number[]} values @returns {number[]} */
function H(values) {
  const out = [];
  for (let left = 0, right = values.length - 1; left < right; left += 1, right -= 1) {
    out.push(mod29(values[left] - values[right]), mod29(values[left] + values[right]));
  }
  if (values.length % 2 === 1) out.push(values[(values.length - 1) / 2]);
  return out;
}

/** @param {number[]} values @returns {number} */
function hsum(values) {
  return mod29(H(values).reduce((sum, value) => sum + value, 0));
}

/** @param {number[]} values @returns {number} */
function gp0(values) {
  return mod29(values.reduce((sum, value) => sum + value, 0));
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));

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
let crossing = 0;

function flush() {
  if (!current.length) return;
  if (startSegment === endSegment) {
    const page = pages[startSegment];
    page.words.push({
      ordinal: page.words.length + 1,
      start: startOffset,
      values: current.slice(),
    });
  } else {
    crossing += 1;
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
      flush();
    }
  }
}
flush();
assert.equal(crossing, 32);

const byPage = new Map(pages.map((page) => [page.page, page.words]));
const clear = signed
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .split(/\n\n/u)
  .slice(1)
  .join("\n");
const source = clear
  .split(/[^A-Za-z0-9]+/u)
  .filter((token) => /^[A-Za-z]+$/u.test(token))
  .map((word) => word.toUpperCase());
assert.equal(source.length, 43);
assert.deepEqual(source.slice(1, 14), [
  "THE", "PATH", "LIES", "EMPTY", "EPIPHANY", "SEEKS", "THE",
  "DEVOTED", "LIBER", "PRIMUS", "IS", "THE", "WAY",
]);

// This exact state-key vector is the existing p0 reversible candidate. The
// present test asks whether its ORDER is recoverable from the independently
// selected source interval, without consulting candidate plaintext letters.
const stateKey = [26,24,8,19,27,24,18,3,0,8,0,16,19];

const rows = [];
for (let sourceIndex = 1; sourceIndex <= 13; sourceIndex += 1) {
  const object = (byPage.get(sourceIndex) || [])[sourceIndex];
  assert.ok(object, `missing numbered-diagonal object at source index ${sourceIndex}`);
  const wholeH = H(object.values);
  const shed = object.values.length >= 3 ? object.values.slice(1, -1) : [];
  const shedH = shed.length ? H(shed) : [];
  const target = stateKey[sourceIndex - 1];
  rows.push({
    sourceIndex,
    sourceWord: source[sourceIndex],
    page: sourceIndex,
    ordinal: sourceIndex + 1,
    start: object.start,
    raw: object.values,
    wholeH,
    shedH,
    scalars: {
      gp0: gp0(object.values),
      hsum: hsum(object.values),
      length: object.values.length,
      outerDifference: wholeH[0],
      outerSum: wholeH[1],
    },
    target,
    targetInRaw: object.values.includes(target),
    targetInWholeH: wholeH.includes(target),
    targetInShedH: shedH.includes(target),
  });
}

const scalarNames = ["gp0", "hsum", "length", "outerDifference", "outerSum"];
const scalarMatches = Object.fromEntries(scalarNames.map((name) => [
  name,
  rows.filter((row) => row.scalars[name] === row.target).map((row) => row.sourceIndex),
]));

console.log(JSON.stringify({
  status: "PASS",
  route: "THE1..WAY13 -> page=i / word=i+1 numbered diagonal",
  targetStateKey: stateKey,
  rows,
  summary: {
    targetInRaw: rows.filter((row) => row.targetInRaw).length,
    targetInWholeH: rows.filter((row) => row.targetInWholeH).length,
    targetInShedH: rows.filter((row) => row.targetInShedH).length,
    scalarMatches,
  },
}, null, 2));
