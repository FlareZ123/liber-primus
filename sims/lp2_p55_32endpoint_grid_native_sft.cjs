"use strict";
/**
 * Source-anchored LP2 p55: 32 complete-word endpoints select one byte
 * from each row of the original 32 x 8 numeral table; test the direct
 * GP29 additive consumer on the 43 complete-word interiors.
 *
 * Windows / Node.js 22. Read-only standalone test.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const load = name => fs.readFileSync(path.join(__dirname, "..", name), "utf8");
const corpus = JSON.parse(load("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(load("resources/liber-primus/lp2-grid-256.json"));
const segments = load("resources/liber-primus/lp2-transcription.txt").split("%");
const symbolIds = new Map(corpus.runes.map((symbol, i) => [symbol, i]));
const parse = text => [...text].filter(symbol => symbolIds.has(symbol))
  .map(symbol => symbolIds.get(symbol));
const words = segments[54].replace(/[\s/]/g, "").split(/[-.&$§]/g)
  .map(parse).filter(word => word.length);
const p55 = corpus.pages.find(page => page.page === 55).indices;
const p57 = corpus.pages.find(page => page.page === 57).indices;
assert.equal(grid.bytes.length, 256);
assert.equal(words.length, 17);
assert.deepEqual(words.flat(), p55);
assert.equal(words[0].length, 1); // Incoming fragment from physical p54.
assert.equal(p55.length, 76);
const body = words.slice(1);
assert.deepEqual(body.map(word => word.length),
  [4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3]);
const endpoints = body.flatMap(word => [word[0], word[word.length - 1]]);
const interior = body.flatMap(word => word.slice(1, -1));
assert.equal(endpoints.length, 32);
assert.equal(interior.length, 43);
assert.deepEqual(interior.flatMap((x, i) => x === 0 ? [i] : []), [11]);
const mod = x => ((x % 29) + 29) % 29;
const ioc = values => {
  const counts = Array(29).fill(0);
  for (const v of values) counts[v]++;
  return counts.reduce((n, k) => n + k * (k - 1), 0) /
    (values.length * (values.length - 1));
};
const render = values => values.map(v => corpus.translit[v]).join(" ");

/**
 * Exact inverse of the authentic p56-style plaintext-F bypass,
 * extended conditionally to a cyclic source table key. Both possible
 * meanings of every ciphertext F are retained, without text scoring.
 * @param {number[]} cipher
 * @param {number[]} key
 * @param {number} sign
 * @returns {{plain:number[], clock:number, skips:number[]}[]}
 */
function invertTransparentF(cipher, key, sign) {
  let states = [{ plain: [], clock: 0, skips: [] }];
  for (let i = 0; i < cipher.length; i++) {
    const next = [];
    for (const state of states) {
      const candidate = mod(cipher[i] + sign * key[state.clock % key.length]);
      if (candidate !== 0) next.push({
        plain: [...state.plain, candidate], clock: state.clock + 1,
        skips: state.skips,
      });
      if (cipher[i] === 0) next.push({
        plain: [...state.plain, 0], clock: state.clock,
        skips: [...state.skips, i],
      });
    }
    states = next;
  }
  return states;
}
/** @param {number[]} plain @param {number[]} key @param {number} sign */
function encodeTransparentF(plain, key, sign) {
  const cipher = [];
  let clock = 0;
  for (const p of plain) {
    if (p === 0) cipher.push(0);
    else cipher.push(mod(p - sign * key[clock++ % key.length]));
  }
  return cipher;
}
const results = [];
const expected = [
  { selector: "ordinal", sign: -1, direct: 0.028792912513842743, paths: 1 },
  { selector: "ordinal", sign: +1, direct: 0.029900332225913623, paths: 2 },
  { selector: "prime", sign: -1, direct: 0.04540420819490587, paths: 2 },
  { selector: "prime", sign: +1, direct: 0.036544850498338874, paths: 0 },
];
for (const selector of ["ordinal", "prime"]) {
  const columns = endpoints.map(x =>
    (selector === "ordinal" ? x : corpus.prime[x]) % 8);
  const key = columns.map((col, row) => grid.bytes[8 * row + col] % 29);
  assert.equal(key.length, 32);
  for (const sign of [-1, +1]) {
    const direct = interior.map((x, i) => mod(x + sign * key[i % 32]));
    assert.deepEqual(direct.map((x, i) => mod(x - sign * key[i % 32])),
      interior);
    const actualPaths = invertTransparentF(interior, key, sign);
    const expectedRow = expected.find(x => x.selector === selector &&
      x.sign === sign);
    assert.ok(Math.abs(ioc(direct) - expectedRow.direct) < 1e-14);
    assert.equal(actualPaths.length, expectedRow.paths);
    const solvedPlant = p57.slice(0, 43);
    const encrypted = encodeTransparentF(solvedPlant, key, sign);
    const recovered = invertTransparentF(encrypted, key, sign);
    assert.ok(recovered.some(state =>
      state.plain.every((x, i) => x === solvedPlant[i])));
    results.push({
      selector, sign, key, directIoC: ioc(direct),
      directPlaintextCandidate: render(direct),
      authenticTransparentFPaths: actualPaths.map(state => ({
        skipLocations: state.skips, ioc: ioc(state.plain),
        candidate: render(state.plain),
      })),
      solvedP57Positive: "43/43",
    });
  }
}
console.log(JSON.stringify({
  source: "Original LP2 p55 76 glyphs: one carried, 16 complete words",
  originalWordEndings: 32, originalWordInteriors: 43,
  selectorTableRows: 32, selectorTableColumns: 8,
  noAuthenticatedUnknownPlaintext: true, results,
}, null, 2));
