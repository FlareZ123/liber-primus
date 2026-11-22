"use strict";

/**
 * Source-locked p32 21-axis-rune key vs the adjoining original LP2 chapter.
 *
 * The 2016 signed tree JPEG has dimensions 563x569; those equal GP-prime
 * sums of the first row / column of p32's original 11x11 rune square.
 * Test the 21 unique edge runes, row first then column (shared corner once),
 * as a continuous GP29 historical arithmetic key on original pp33-39.
 *
 * Independent GP-native plaintext control uses the source-clear p57.
 * This script does not write files or introduce fitted alphabet phases.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const book = JSON.parse(fs.readFileSync(
  path.join(root, "resources", "liber-primus", "lp2-corpus.json"), "utf8"
));
const M = 29;

/** @param {number} x @returns {number} */
function mod(x) {
  return ((x % M) + M) % M;
}

/** @param {number} n @returns {number[]} */
function page(n) {
  const p = book.pages.find(p => p.page === n);
  assert.ok(p, `Missing source page ${n}`);
  return p.indices;
}

/** @param {number[]} values @returns {number} */
function ioc(values) {
  const counts = Array(M).fill(0);
  for (const x of values) counts[x]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (values.length * (values.length - 1));
}

/**
 * @param {number[]} input
 * @param {number[]} key
 * @param {"index" | "prime" | "totient"} mode
 * @param {-1 | 1} sign
 * @param {boolean} skipF
 * @returns {{output:number[],forcedNonLiteralF:number}}
 */
function transform(input, key, mode, sign, skipF) {
  const output = [];
  let clock = 0;
  let forcedNonLiteralF = 0;
  for (const c of input) {
    if (skipF && c === 0) {
      output.push(0);
      continue;
    }
    const r = key[clock % key.length];
    const k = mode === "index" ? r :
      mode === "prime" ? book.prime[r] : book.prime[r] - 1;
    const p = mod(c + sign * k);
    if (skipF && p === 0) forcedNonLiteralF++;
    output.push(p);
    clock++;
  }
  return {output, forcedNonLiteralF};
}

const square = page(32);
assert.equal(square.length, 121);
const top = square.slice(0, 11);
const left = Array.from({length: 11}, (_, y) => square[11 * y]);
assert.equal(top.reduce((s, x) => s + book.prime[x], 0), 563);
assert.equal(left.reduce((s, x) => s + book.prime[x], 0), 569);
const key = [...top, ...left.slice(1)];
assert.equal(key.length, 21);
assert.equal(key.map(x => book.translit[x]).join(""),
  "LTHAEWAEUPIACWNGHTHHNGTSNGTEAO");
const unknown = Array.from({length: 7}, (_, j) => page(j + 33)).flat();
assert.equal(unknown.length, 1680);
assert.equal(unknown.filter(x => x === 0).length, 40);
const control = page(57);
assert.equal(control.length, 95);

/** @type {Array<"index" | "prime" | "totient">} */
const modes = ["index", "prime", "totient"];
for (const mode of modes) {
  for (const sign of /** @type {Array<-1 | 1>} */ ([-1, 1])) {
    // Exact inverse for a planted GP-native text under each basic key family.
    const plant = transform(control, key, mode, -sign, false).output;
    const recovered = transform(plant, key, mode, sign, false).output;
    assert.deepEqual(recovered, control);
    for (const skipF of [false, true]) {
      const {output, forcedNonLiteralF} =
        transform(unknown, key, mode, sign, skipF);
      console.log(JSON.stringify({
        mode, sign, skipF,
        length: output.length,
        ioc: Number(ioc(output).toFixed(12)),
        forcedNonLiteralF,
        preview: output.slice(0, 36).map(x => book.translit[x]).join(" ")
      }));
    }
  }
}
console.log("P32_AXIS_KEY_COMPLETE " + JSON.stringify({
  source: "signed-2016 tree 563x569 + LP2 p32 original 11x11",
  keyLength: key.length,
  keyLatin: key.map(x => book.translit[x]).join(""),
  targetPages: [33, 34, 35, 36, 37, 38, 39],
  targetRunes: unknown.length,
  positiveControlRunes: control.length,
  models: 12
}));
