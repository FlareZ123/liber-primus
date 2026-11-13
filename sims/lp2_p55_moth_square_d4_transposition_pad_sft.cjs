"use strict";

/**
 * Source-moth 5x5 grid: three 25-rune p55 body boards, square-column
 * transposition and fixed LP1 p5 totient key in both layer orders.
 * Uses the complete source-native 30-rune LP1 phrase as an exact p55
 * terminal plaintext prediction, not an optimized language score.
 *
 * Run: node sims/lp2_p55_moth_square_d4_transposition_pad_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, "..", "resources/liber-primus/lp2-corpus.json"),
  "utf8"));
const page = corpus.pages.find(p => p.page === 55).indices;
assert.equal(page.length, 76);
const body = page.slice(1);
assert.equal(body.length, 75);
const key = [
  12,15,10,14,5,4,24,19,12,6,25,23,14,23,25,
  6,12,19,24,4,5,14,10,15,12
];
assert.equal(key.length, 25);
const cribRunes = [
  "ᚦᛖ", "ᛏᚩᛏᛁᛖᚾᛏ", "ᚠᚢᚾᚳᛏᛡᚾ",
  "ᛁᛋ", "ᛋᚪᚳᚱᛖᛞ", "ᚪᛚᛚ", "ᚦᛝᛋ"
];
assert.deepEqual(cribRunes.map(w => [...w].length),
  [2,7,7,2,6,3,3]);
const crib = [...cribRunes.join("")].map(r => corpus.runes.indexOf(r));
assert(crib.every(n => n >= 0));
assert.equal(crib.length, 30);

/** @param {number} n */
const mod = n => ((n % 29) + 29) % 29;

/**
 * Eight dihedral orientations of a 5x5 board.
 * @param {number} r
 * @param {number} c
 * @param {number} orientation
 * @returns {[number,number]}
 */
function boardCoordinate(r, c, orientation) {
  for (let i = 0; i < orientation % 4; i++) {
    [r, c] = [c, 4 - r];
  }
  if (orientation >= 4) c = 4 - c;
  return [r, c];
}

/**
 * Permute three consecutive unmodified 5x5 boards.
 * @param {number[]} values
 * @param {number} orientation
 * @param {boolean} invert
 */
function transpose(values, orientation, invert) {
  assert.equal(values.length, 75);
  const result = Array(75);
  for (let block = 0; block < 3; block++) {
    for (let i = 0; i < 25; i++) {
      const [r, c] = boardCoordinate(Math.floor(i / 5), i % 5,
        orientation);
      const transformed = 25 * block + 5 * r + c;
      const original = 25 * block + i;
      if (invert) result[transformed] = values[original];
      else result[original] = values[transformed];
    }
  }
  return result;
}

/**
 * Candidate original decryptor. "before-pad" means pad then transpose
 * in the forward cipher. sign is the inverse addition sign.
 * @param {number[]} values
 * @param {number} orientation
 * @param {"before-pad"|"after-pad"} order
 * @param {number} sign
 */
function decrypt(values, orientation, order, sign) {
  const unpad = v => v.map((n, i) => mod(n + sign * key[i % 25]));
  return order === "before-pad"
    ? unpad(transpose(values, orientation, true))
    : transpose(unpad(values), orientation, true);
}

/**
 * Independently implements the exact forward operations.
 * @param {number[]} values
 * @param {number} orientation
 * @param {"before-pad"|"after-pad"} order
 * @param {number} sign
 */
function encrypt(values, orientation, order, sign) {
  const pad = v => v.map((n, i) => mod(n - sign * key[i % 25]));
  return order === "before-pad"
    ? transpose(pad(values), orientation, false)
    : pad(transpose(values, orientation, false));
}

const solved = corpus.pages.find(p => p.page === 57).indices;
assert(solved.length >= 45);
const nativePlant = [...solved.slice(0, 45), ...crib];
assert.equal(nativePlant.length, 75);
const results = [];
for (let orientation = 0; orientation < 8; orientation++) {
  for (const order of ["before-pad", "after-pad"]) {
    for (const sign of [-1, 1]) {
      const decoded = decrypt(body, orientation, order, sign);
      assert.deepEqual(encrypt(decoded, orientation, order, sign), body);
      assert.deepEqual(
        decrypt(encrypt(nativePlant, orientation, order, sign),
          orientation, order, sign), nativePlant);
      const actualMatch = crib.reduce((n, v, i) =>
        n + Number(decoded[45 + i] === v), 0);
      results.push({orientation, order, sign, matches: actualMatch});
    }
  }
}
assert.equal(results.length, 32);
const best = Math.max(...results.map(r => r.matches));
assert.equal(best, 3);
assert.equal(results.filter(r => r.matches === 3).length, 2);
const identity = results.find(r => r.orientation === 0 &&
  r.order === "before-pad" && r.sign === -1);
assert.equal(identity.matches, 1);

console.log(JSON.stringify({
  status: "PASS",
  input: "original p55 body 75 runes (carry excluded)",
  source: "LP1 p5 moth/5x5 totient matrix, exact p55 seven-word crib",
  candidates: results.length,
  nativePositiveRecovered: nativePlant.length,
  authenticPlaintextMatchesAtMost: best,
  originalEndingRunes: page.slice(46).map(i=>corpus.translit[i]).join(" "),
  topCandidates: results.filter(r => r.matches >= 2),
  conclusion: "No exact 30-rune plaintext under this frozen D4/pad grid family"
}, null, 2));
