"use strict";

/**
 * Original LP2 225-red-rune / 31-thirteen-dot vs 256-cell 16x16
 * mixed-difference inversion gate. Run with Node.js 22 from any cwd.
 * It only reads pinned local repository resources and writes nothing.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (name) => JSON.parse(fs.readFileSync(path.join(root, "resources", "liber-primus", name), "utf8"));
const corpus = read("lp2-corpus.json");
const ink = read("lp2-ink-annotations.json");
const table = read("lp2-grid-256.json");
const MOD = 29;
const mod = (v) => ((v % MOD) + MOD) % MOD;

/** @param {number[]} values */
function mixedDifference(values) {
  assert.equal(values.length, 256);
  const result = [];
  for (let row = 1; row < 16; row++) {
    for (let col = 1; col < 16; col++) {
      const k = row * 16 + col;
      result.push(mod(values[k] - values[k - 16] - values[k - 1] + values[k - 17]));
    }
  }
  return result;
}

/**
 * Invert a 15x15 mixed-difference tape using the first row and column
 * of the original table as 31 independently fixed boundary values.
 * @param {number[]} original
 * @param {number[]} difference
 */
function integrate(original, difference) {
  assert.equal(original.length, 256);
  assert.equal(difference.length, 225);
  const result = new Array(256).fill(0);
  for (let i = 0; i < 16; i++) {
    result[i] = mod(original[i]);
    result[i * 16] = mod(original[i * 16]);
  }
  let j = 0;
  for (let row = 1; row < 16; row++) {
    for (let col = 1; col < 16; col++) {
      const k = row * 16 + col;
      result[k] = mod(difference[j++] + result[k - 16] + result[k - 1] - result[k - 17]);
    }
  }
  return result;
}

/**
 * Count equality-pattern contradictions. Every stationary bijection
 * preserves equality and inequality of values at every pair of sites.
 * @param {number[]} red
 * @param {number[]} difference
 */
function comparePairMasks(red, difference) {
  let redEqual = 0;
  let diffEqual = 0;
  let bothEqual = 0;
  /** @type {null | {i:number,j:number,red:number[],difference:number[]}} */
  let firstRedEqualOnly = null;
  /** @type {null | {i:number,j:number,red:number[],difference:number[]}} */
  let firstDiffEqualOnly = null;
  for (let i = 0; i < red.length; i++) {
    for (let j = i + 1; j < red.length; j++) {
      const a = red[i] === red[j];
      const b = difference[i] === difference[j];
      redEqual += Number(a);
      diffEqual += Number(b);
      bothEqual += Number(a && b);
      if (a && !b && firstRedEqualOnly === null) {
        firstRedEqualOnly = {i,j,red:[red[i],red[j]],difference:[difference[i],difference[j]]};
      }
      if (b && !a && firstDiffEqualOnly === null) {
        firstDiffEqualOnly = {i,j,red:[red[i],red[j]],difference:[difference[i],difference[j]]};
      }
    }
  }
  return {redEqual,diffEqual,bothEqual,redEqualDiffUnequal:redEqual-bothEqual,
          diffEqualRedUnequal:diffEqual-bothEqual,firstRedEqualOnly,firstDiffEqualOnly};
}

assert.equal(corpus.runes.length,29);
const red = ink.pages.flatMap((page) => (page.red_spans || []).flatMap(
  (span) => [...span.runes].map((rune) => corpus.runes.indexOf(rune))
));
const markers = ink.pages.flatMap((page) => page.large_punctuation || []).filter((p) => p[1] === 13);
const tokens = table.pages.flatMap((p) => p.tokens);
assert.equal(red.length,225);
assert.equal(markers.length,31);
assert.equal(tokens.length,256);
assert.equal(red.includes(-1),false);
assert.equal(225,15*15);
assert.equal(markers.length,16*16-15*15);
assert.equal(table.alphabet.length,60);
assert.equal(table.alphabet.includes("f"),true);

for (const radix of [60,59]) {
  const alphabet = radix === 59 ? table.alphabet.replace("f","") : table.alphabet;
  assert.equal(alphabet.length,radix);
  const values = tokens.map((token) => {
    assert.equal(token.length,2);
    const left=alphabet.indexOf(token[0]),right=alphabet.indexOf(token[1]);
    assert.ok(left>=0 && right>=0,"invalid table digit");
    return radix*left+right;
  });
  assert.ok(values.every((value) => Number.isInteger(value) && value>=0 && value<=255));
  const difference=mixedDifference(values);
  assert.deepEqual(integrate(values,difference),values.map(mod));

  // Planted source-length positive: a fixed bijection of all 225
  // original differences is recovered and restores all 256 values.
  const planted=difference.map((value) => mod(7*value+11));
  const recovered=planted.map((value) => mod(25*(value-11)));
  assert.deepEqual(recovered,difference);
  assert.deepEqual(integrate(values,recovered),values.map(mod));

  const comparison=comparePairMasks(red,difference);
  const direct=red.reduce((total,value,i) => total+Number(value===difference[i]),0);
  const expected=radix===60
    ? {direct:10,redEqual:837,diffEqual:834,bothEqual:28,contradictions:1615}
    : {direct:6,redEqual:837,diffEqual:866,bothEqual:34,contradictions:1635};
  assert.equal(direct,expected.direct);
  assert.equal(comparison.redEqual,expected.redEqual);
  assert.equal(comparison.diffEqual,expected.diffEqual);
  assert.equal(comparison.bothEqual,expected.bothEqual);
  assert.equal(comparison.redEqualDiffUnequal+comparison.diffEqualRedUnequal,expected.contradictions);
  assert.ok(comparison.redEqualDiffUnequal>0 && comparison.diffEqualRedUnequal>0);
  console.log(JSON.stringify({radix,direct,redCount:red.length,markerCount:markers.length,
    differenceCount:difference.length,...comparison,
    plantedPositive:"225/225 bijection; 256/256 residue restoration"},null,2));
}
console.log("PASS: Both frozen 16x16 mixed-difference models fail every stationary bijective red-rune relabeling.");