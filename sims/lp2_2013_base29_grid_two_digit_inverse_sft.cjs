"use strict";

/**
 * A frozen source-selected BASE29 byte-expansion inverse for original LP2.
 *
 * The authenticated 2013 TCP challenge explicitly exercises BASE29, while
 * the original LP2 pp49–51 contain 256 printed two-character base60 bytes.
 * Replace each actual byte B by its *two* ordinary base29 positional digits
 * [floor(B/29), B%29] (both retained; 512 digits total). Test only GP29
 * additive enciphering with the printed-order, repeating digit stream,
 * either continuous or reset at physical page boundaries, in both signs.
 *
 * This rejects the *specific* byte-to-two-digits-to-additive-pad reading.
 * It says nothing about an unknown KDF, key clock, hidden source or cipher.
 *
 * Node 22; no dependencies, network access, or filesystem writes.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

/** @param {string} source */
function readJson(source) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, "..", source), "utf8"));
}

/** @param {number} value */
function twoBase29Digits(value) {
  assert(Number.isInteger(value) && value >= 0 && value <= 255);
  const high = Math.floor(value / 29);
  const low = value % 29;
  assert(high <= 8 && low < 29 && high * 29 + low === value);
  return [high, low];
}

/** @param {number[]} symbols */
function coincidenceIndex(symbols) {
  const counts = Array(29).fill(0);
  for (const value of symbols) {
    assert(Number.isInteger(value) && value >= 0 && value < 29);
    counts[value]++;
  }
  const n = symbols.length;
  return counts.reduce((sum, v) => sum + v * (v - 1), 0) / (n * (n - 1));
}

/**
 * @param {{page:number, indices:number[]}[]} pages
 * @param {number[]} key
 * @param {number} sign
 * @param {boolean} resetAtPages
 * @returns {number[]}
 */
function applyPad(pages, key, sign, resetAtPages) {
  const result = [];
  let clock = 0;
  for (const page of pages) {
    if (resetAtPages) clock = 0;
    for (const x of page.indices) {
      result.push((x + sign * key[clock % key.length] + 29) % 29);
      clock++;
    }
  }
  return result;
}

/** @param {number[]} values @param {string[]} transliterations */
function readable(values, transliterations) {
  return values.map((x) => transliterations[x]).join("");
}

function main() {
  const corpus = readJson("resources/liber-primus/lp2-corpus.json");
  const grid = readJson("resources/liber-primus/base60-grid.json");
  assert.equal(corpus.runes.length, 29);
  assert.equal(grid.rows.length, 32);
  assert(grid.rows.every((r) => r.length === 8));
  const digits = grid.alphabet;
  assert.equal(digits, "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx");
  const bytes = grid.rows.flat().map((token) => {
    assert.equal(token.length, 2);
    const a = digits.indexOf(token[0]);
    const b = digits.indexOf(token[1]);
    assert(a >= 0 && b >= 0);
    const value = 60 * a + b;
    assert(value >= 0 && value <= 255);
    return value;
  });
  assert.deepEqual(bytes, grid.byte_rows.flat());
  assert.equal(bytes.length, 256);
  const key = bytes.flatMap(twoBase29Digits);
  assert.equal(key.length, 512);
  assert.deepEqual(key.slice(0, 20), [7,0,7,28,5,22,6,12,3,10,8,5,4,10,6,9,3,5,8,17]);

  // The source BASE29 command's documented value, decimal 3301 -> 3QO:
  assert.equal(3 * 29 * 29 + 26 * 29 + 24, 3301);

  const pages = corpus.pages.filter((p) => p.status === "unsolved" && p.indices.length);
  assert.equal(pages.length, 55);
  const original = pages.flatMap((page) => page.indices);
  assert.equal(original.length, 12956);
  assert(Math.abs(coincidenceIndex(original) - 0.03447839786450569) < 1e-12);

  const tests = [
    {reset: false, sign: -1, expected: 0.03444990728945244},
    {reset: false, sign: +1, expected: 0.03449485352496095},
    {reset: true, sign: -1, expected: 0.034485988201732334},
    {reset: true, sign: +1, expected: 0.03448514218298337}
  ];
  const output = [];
  const known = corpus.pages.find((p) => p.page === 57);
  assert.equal(known.indices.length, 95);
  const plaintextPages = pages.map((page) => ({
    page: page.page,
    indices: page.indices.map((_, i) => known.indices[i % known.indices.length])
  }));

  for (const t of tests) {
    const recovered = applyPad(pages, key, t.sign, t.reset);
    const ioc = coincidenceIndex(recovered);
    assert(Math.abs(ioc - t.expected) < 1e-12);

    // Independent native-GP positive: encrypt and recover original solved
    // PARABLE runes under the exact proposed source-digit pad and reset.
    const plantedCipher = [];
    let clock = 0;
    for (const page of plaintextPages) {
      if (t.reset) clock = 0;
      for (const x of page.indices) {
        plantedCipher.push((x - t.sign * key[clock % key.length] + 29) % 29);
        clock++;
      }
    }
    const cursor = {pos: 0};
    const fakePages = plaintextPages.map((page) => ({
      page: page.page,
      indices: page.indices.map(() => plantedCipher[cursor.pos++])
    }));
    assert.deepEqual(applyPad(fakePages, key, t.sign, t.reset),
      plaintextPages.flatMap((page) => page.indices));

    output.push({
      keyClock: t.reset ? "physical-page reset" : "continuous",
      sign: t.sign,
      ioc,
      runePrefix: readable(recovered.slice(0, 70), corpus.translit)
    });
  }
  console.log(JSON.stringify({
    source: "2013 authenticated BASE29 and printed 32x8 base60 table",
    byteCount: bytes.length,
    keyRuneCount: key.length,
    unknownRuneCount: original.length,
    originalIoC: coincidenceIndex(original),
    candidates: output,
    controls: "4 of 4 source-native page-length-matched exact plaintext roundtrips"
  }, null, 2));
  console.log("PASS: exact two-digit BASE29 grid-key inverse is nonlinguistic in all four fixed models.");
}

main();
