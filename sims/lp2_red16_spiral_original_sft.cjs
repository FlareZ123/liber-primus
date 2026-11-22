"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

/** @param {string} file */
function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, "..", "resources", "liber-primus", file), "utf8"));
}

/** @param {number[]} a */
function ioc(a) {
  const h = Array(29).fill(0);
  for (const v of a) h[v]++;
  return h.reduce((sum, n) => sum + n * (n - 1), 0) / (a.length * (a.length - 1));
}

/**
 * Source-fixed GP29 Vigenere decoder; the inverse uses the opposite sign.
 * @param {number[]} cipher
 * @param {number[]} key
 * @param {number} sign
 */
function transform(cipher, key, sign) {
  return cipher.map((v, i) => (v + 29 + sign * key[i % key.length]) % 29);
}

function main() {
  const corpus = readJson("lp2-corpus.json");
  const ink = readJson("lp2-ink-annotations.json");
  const pages = corpus.pages.filter((p) => p.page < 56 && p.indices.length);
  const original = pages.flatMap((p) => p.indices);
  const afterSquare = pages.filter((p) => p.page >= 16 && p.page <= 22).flatMap((p) => p.indices);
  assert.equal(original.length, 12956);
  assert.equal(afterSquare.length, 1744);

  const spans = ink.pages.filter((p) => p.page < 56)
    .flatMap((p) => (p.red_spans || []).map((span) => ({
      page: p.page, start: span.start, first: [...span.runes][0],
    })));
  assert.deepEqual(spans.map((s) => s.page),
    [0, 3, 3, 6, 7, 8, 15, 15, 23, 27, 33, 33, 39, 40, 53, 54]);
  const chronological = spans.map((s) => corpus.runes.indexOf(s.first));
  assert.deepEqual(chronological,
    [15, 20, 13, 24, 23, 14, 0, 20, 1, 19, 23, 21, 27, 0, 16, 24]);
  const spiral = [[1, 1], [1, 2], [2, 2], [2, 1], [2, 0], [1, 0],
    [0, 0], [0, 1], [0, 2], [0, 3], [1, 3], [2, 3],
    [3, 3], [3, 2], [3, 1], [3, 0]].map(([r, c]) => 4 * r + c);
  assert.equal(new Set(spiral).size, 16);
  assert.equal(spiral[0], 5);
  const keys = {
    chronological,
    spiral: spiral.map((i) => chronological[i]),
    inverse_spiral: chronological.map((_, i) => chronological[spiral.indexOf(i)]),
  };
  const translit = (xs) => xs.map((v) => corpus.translit[v]).join("-");
  console.log("Source: 16 distinct red spans among physical unsolved pp0..55");
  console.log("Spiral first: red p15 3299 at grid row2 col2, then right/down");
  console.log("Raw initial sequence:", translit(chronological));
  console.log("Spiral initial sequence:", translit(keys.spiral));
  console.log("Input IoC: p16..22", ioc(afterSquare).toFixed(9), "book", ioc(original).toFixed(9));

  for (const [name, key] of Object.entries(keys)) {
    for (const sign of [-1, 1]) {
      const decSquare = transform(afterSquare, key, sign);
      const decBook = transform(original, key, sign);
      assert.deepEqual(transform(decSquare, key, -sign), afterSquare);
      assert.deepEqual(transform(decBook, key, -sign), original);
      const plant = Array.from({length: original.length}, (_, i) => [18, 8, 24, 13, 3, 15, 4, 18, 9, 24][i % 10]);
      assert.deepEqual(transform(transform(plant, key, -sign), key, sign), plant);
      console.log(JSON.stringify({
        key: name, sign, afterSquareIoC: ioc(decSquare), bookIoC: ioc(decBook),
        beginning: translit(decSquare.slice(0, 24)),
      }));
    }
  }

  // More direct source-visible pairing: 16 printed p15 numbers are a single
  // Caesar shift per red span. The actual Fibonacci spiral gives one
  // chronology; printed row-major gives a natural independent source order.
  // Both are fixed before reading the unknown red text.
  const spiralNumbers = [
    3299, 3298, 3296, 3294, 3288, 3278, 3258, 3222,
    3152, 3038, 2838, 2472, 1820, 708, 1206, 4516,
  ];
  const rowMajorNumbers = [
    3258, 3222, 3152, 3038, 3278, 3299, 3298, 2838,
    3288, 3294, 3296, 2472, 4516, 1206, 708, 1820,
  ];
  const fibonacciValues = [
    0, 1, 2, 3, 5, 8, 13, 21,
    34, 55, 89, 144, 233, 377, 610, 987,
  ];
  assert.equal(spiralNumbers[0], 3299);
  assert.deepEqual(spiral.map((i) => rowMajorNumbers[i]), spiralNumbers);

  const red = ink.pages.filter((p) => p.page < 56)
    .flatMap((p) => (p.red_spans || []).map((span) =>
      [...span.runes].map((r) => corpus.runes.indexOf(r))));
  assert.equal(red.length, 16);
  assert.equal(red.flat().length, 213);
  const originalRed = red.flat();
  console.log("Original unsolved red-span IoC:", ioc(originalRed).toFixed(9));

  for (const [name, source] of Object.entries({
    spiral_printed: spiralNumbers,
    row_major_printed: rowMajorNumbers,
    spiral_fibonacci: fibonacciValues,
  })) {
    for (const sign of [-1, 1]) {
      const decoded = red.map((span, i) =>
        span.map((v) => (v + 29 + sign * (source[i] % 29)) % 29));
      const reciphered = decoded.map((span, i) =>
        span.map((v) => (v + 29 - sign * (source[i] % 29)) % 29));
      assert.deepEqual(reciphered, red);
      console.log(JSON.stringify({
        mode: "source_span_shift", key: name, sign,
        total: decoded.flat().length, redIoC: ioc(decoded.flat()),
        firstSix: decoded.slice(0, 6).map(translit),
      }));
    }
  }
}
main();
