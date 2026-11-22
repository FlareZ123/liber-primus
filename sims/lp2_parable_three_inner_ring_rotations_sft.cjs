"use strict";

/**
 * Source-constrained original terminal256 negative:
 * 2013 Parable's three GP-prime clause sums rotate the three inner
 * 32x8 numerical-table circumferences. No LP2 unknown plaintext is inferred.
 *
 * Run as a single-file test on Windows Node 22:
 *   node sims/lp2_parable_three_inner_ring_rotations_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");

/** @param {string} p @returns {any} */
function readJson(p) {
  return JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
}
const corpus = readJson("resources/liber-primus/lp2-corpus.json");
const grid = readJson("resources/liber-primus/lp2-grid-256.json");
const tokens = corpus.translit
  .map((token, index) => ({ token, index }))
  .sort((a, b) => b.token.length - a.token.length);

/** @param {string} phrase @returns {number[]} */
function gp(phrase) {
  const out = [];
  for (const word of phrase.split(" ")) {
    for (let i = 0; i < word.length;) {
      const item = tokens.find(({ token }) => word.startsWith(token, i));
      assert(item, "Unknown GP substring: " + word.slice(i));
      out.push(item.index);
      i += item.token.length;
    }
  }
  return out;
}

/** @param {number[]} xs @returns {number} */
function primeSum(xs) {
  return xs.reduce((sum, x) => sum + corpus.prime[x], 0);
}
// Original p57 punctuation fixes its four exact GP index spans.
// Read them directly to preserve K->C, V->U and ING->NG orthography.
const page57 = corpus.pages[57].indices;
const heading = page57.slice(0, 7);
const bodies = [
  page57.slice(7, 37),
  page57.slice(37, 67),
  page57.slice(67, 95)
];
const sums = bodies.map(primeSum);
assert.equal(primeSum(heading), 449);
assert.deepEqual(sums, [1259, 1031, 1229]);
assert.deepEqual(bodies.map(x => x.length), [30, 30, 28]);
assert.deepEqual(heading.concat(...bodies), corpus.pages[57].indices);
assert.equal(sums.reduce((a, b) => a * b, 1), 1595277641);

const p56 = gp("AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE");
assert.equal(p56.length, 85);
const source56 = corpus.pages[56].indices;
let p = 2;
for (let i = 0; i < p56.length; i++) {
  if (i === 56) {
    assert.equal(source56[i], 0);
    assert.equal(p56[i], 0);
    continue;
  }
  while (true) {
    let isPrime = true;
    for (let d = 2; d * d <= p; d++) {
      if (p % d === 0) { isPrime = false; break; }
    }
    if (isPrime) break;
    p++;
  }
  const originalDecrypt = ((source56[i] - (p - 1)) % 29 + 29) % 29;
  assert.equal(originalDecrypt, p56[i], "p56 authenticated prime-totient index " + i);
  p++;
}
const known = p56.concat(corpus.pages[57].indices);
assert.equal(known.length, 180);
assert.equal(corpus.pages[55].indices.length, 76);
assert.equal(grid.bytes.length, 256);

/** @param {number} depth @returns {number[]} */
function ring(depth) {
  const cells = [], t = depth, b = 31 - depth, l = depth, r = 7 - depth;
  for (let x = l; x <= r; x++) cells.push(8 * t + x);
  for (let y = t + 1; y <= b; y++) cells.push(8 * y + r);
  for (let x = r - 1; x >= l; x--) cells.push(8 * b + x);
  for (let y = b - 1; y > t; y--) cells.push(8 * y + l);
  return cells;
}
const rings = Array.from({ length: 4 }, (_, i) => ring(i));
assert.deepEqual(rings.map(x => x.length), [76, 68, 60, 52]);
assert.equal(new Set(rings.flat()).size, 256);

/**
 * Minimum number of symbols that disagree with any secret deterministic
 * input-to-output lookup map, without assuming or fitting the map itself.
 * @param {number[]} inputs @param {number[]} outputs @returns {number}
 */
function unavoidableEdits(inputs, outputs) {
  assert.equal(inputs.length, outputs.length);
  /** @type {Map<number, Map<number, number>>} */
  const tally = new Map();
  for (let i = 0; i < inputs.length; i++) {
    const group = tally.get(inputs[i]) || new Map();
    group.set(outputs[i], (group.get(outputs[i]) || 0) + 1);
    tally.set(inputs[i], group);
  }
  let edits = 0;
  for (const group of tally.values()) {
    const counts = [...group.values()];
    edits += counts.reduce((a, b) => a + b, 0) - Math.max(...counts);
  }
  return edits;
}
const rotations = rings.slice(1).map((cells, j) => sums[j] % cells.length);
assert.deepEqual(rotations, [35, 11, 33]);
const cases = [];
for (const winding of [1, -1]) {
  const blocks = rings.slice(1).map((ids, j) =>
    ids.map((_, i) => grid.bytes[
      ids[((rotations[j] + winding * i) % ids.length + ids.length) % ids.length]
    ])
  );
  for (const backward of [false, true]) {
    const target = backward ? known.slice().reverse() : known;
    let start = 0;
    const byRing = blocks.map(bytes => {
      const ptext = target.slice(start, start + bytes.length);
      start += bytes.length;
      assert.equal(unavoidableEdits(bytes, bytes.map(x => (x * 7 + 13) % 29)), 0,
        "Secret-codebook positive control");
      return unavoidableEdits(bytes, ptext);
    });
    assert.equal(start, 180);
    cases.push({ winding, backward, byRing,
      minimumEdits: byRing.reduce((a, b) => a + b, 0),
      globalMinimumEdits: unavoidableEdits(blocks.flat(), target) });
  }
}
assert.equal(cases.length, 4);
assert.deepEqual(cases.map(x => x.minimumEdits), [21, 21, 22, 20]);
assert.deepEqual(cases[0].byRing, [8, 7, 6]);
assert(cases.every(x => x.minimumEdits > 0));

console.log(JSON.stringify({
  source: "Original p49-51 32x8 table, original solved p56 and clear p57",
  parablePrimeSums: sums, independentHistoricalProduct: 1595277641,
  interiorRingLengths: [68, 60, 52], rotations,
  withheldUnknownP55: 76, independentlyKnownP56P57: 180,
  cases,
  positiveControls: "all four source-rotated per-ring deterministic plants fit with zero edits",
  result: "No lossless fixed byte-to-rune decoder, even with a secret codebook per ring; the source does not specify a changing-state operation."
}, null, 2));
