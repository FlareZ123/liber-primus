"use strict";
/**
 * Tests source-motivated orderings of LP1 p05's 13 GP word cells as a
 * 76-rune key tape for LP2 p55, using the authentic p56 prime-totient
 * cipher and its strict plaintext-F passthrough.
 *
 * Motivations: the signed 2016 words-map sentence ("words are the map ...
 * numbers are the direction"), the p05 5x5 word/numeral square, and the
 * word MOBIUS within the 13 cells. These do not authenticate any one
 * ordering; the finite candidates below are exploratory and frozen.
 *
 * Tests eight key orders x all eight interpretations of p55 ciphertext-F
 * positions. A candidate is impossible if any non-skipped ciphertext rune
 * decrypts to plaintext F, because the p56 encoder must pass plaintext F
 * through without consuming a key symbol. Each order also gets a solved-p57
 * 76-rune positive plant under the same forward/inverse rule.
 *
 * Run from repository root:
 *   node sims/lp1_p05_wordvalue_mobius_p55_phi_gate.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.join(__dirname, "..");
const read = file => fs.readFileSync(path.join(ROOT, file), "utf8");
const book = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const lp1 = read("resources/transcriptions/lp1_wulfic_canonical.txt");
const anchor = "272-138-";
assert.ok(lp1.includes(anchor));
const rows = lp1.slice(lp1.indexOf(anchor)).split(/\r?\n/).slice(0, 5)
  .map(line => line.replace(/\/$/, "").split("-"));
assert.deepEqual(rows.map(row => row.length), [5, 5, 5, 5, 5]);
const runeIndex = rune => book.runes.indexOf(rune);
const primeSum = cell => cell.split("").reduce((sum, rune) => {
  const index = runeIndex(rune);
  assert.ok(index >= 0 && index < 29);
  return sum + book.prime[index];
}, 0);
const square = rows.map(row => row.map(cell => /^\d+$/.test(cell) ? Number(cell) : primeSum(cell)));
const expectedSquare = [
  [272, 138, 341, 131, 151],
  [366, 199, 130, 320, 18],
  [226, 245, 91, 245, 226],
  [18, 320, 130, 199, 366],
  [151, 131, 341, 138, 272]
];
assert.deepEqual(square, expectedSquare);
for (let r = 0; r < 5; r++) assert.equal(square[r].reduce((a, b) => a + b, 0), 1033);
for (let c = 0; c < 5; c++) assert.equal(square.reduce((s, row) => s + row[c], 0), 1033);
assert.equal(square.reduce((s, row, i) => s + row[i], 0), 1033);
assert.equal(square.reduce((s, row, i) => s + row[4 - i], 0), 1033);

const words = rows.flatMap((row, r) => row.map((cell, c) => ({
  cell, r, c, pos: r * 5 + c
})).filter(x => !/^\d+$/.test(x.cell)).map(x => ({
  ...x,
  runes: x.cell.split("").map(runeIndex),
  value: primeSum(x.cell),
  name: x.cell.split("").map(rune => book.translit[runeIndex(rune)]).join("")
})));
assert.equal(words.length, 13);
assert.deepEqual(words.map(w => w.name), [
  "SHADOWS", "AETHEREAL", "BUFFERS", "UOID", "CARNAL", "OBSCURA",
  "FORM", "MOBIUS", "ANALOG", "UOID", "MOURNFUL", "AETHEREAL", "CABAL"
]);
assert.deepEqual(words.map(w => w.value), [
  341, 366, 199, 130, 320, 245, 91, 226, 320, 130, 199, 366, 341
]);
assert.deepEqual(words.map(w => w.runes.length), [7, 6, 7, 4, 6, 7, 4, 6, 6, 4, 8, 6, 5]);

const p55 = book.pages.find(page => page.page === 55).indices;
const p57 = book.pages.find(page => page.page === 57).indices;
assert.equal(p55.length, 76);
assert.equal(p57.length, 95);
const cipherFs = p55.flatMap((value, i) => value === 0 ? [i] : []);
assert.deepEqual(cipherFs, [15, 25, 41]);
const mod29 = value => (value % 29 + 29) % 29;

function valueOrder(descending, reverseTies) {
  return words.slice().sort((a, b) =>
    (descending ? b.value - a.value : a.value - b.value) ||
    (reverseTies ? b.pos - a.pos : a.pos - b.pos)
  ).flatMap(word => word.runes);
}
function rowTraversal(rowIndices, twist) {
  return rowIndices.flatMap((rowIndex, step) => {
    let cells = words.filter(word => word.r === rowIndex)
      .sort((a, b) => a.c - b.c);
    const reverseRow = step % 2 === 1;
    if (reverseRow) cells = cells.reverse();
    return cells.flatMap(word =>
      twist && reverseRow ? word.runes.slice().reverse() : word.runes
    );
  });
}
const orders = [
  ["value_ascending_stable", valueOrder(false, false)],
  ["value_descending_stable", valueOrder(true, false)],
  ["value_ascending_reverse_ties", valueOrder(false, true)],
  ["value_descending_reverse_ties", valueOrder(true, true)],
  ["row_boustrophedon_top_left", rowTraversal([0, 1, 2, 3, 4], false)],
  ["row_mobius_twist_top_left", rowTraversal([0, 1, 2, 3, 4], true)],
  ["row_boustrophedon_bottom_right", rowTraversal([4, 3, 2, 1, 0], false)],
  ["row_mobius_twist_bottom_right", rowTraversal([4, 3, 2, 1, 0], true)]
];

function positivePlant(keyPhi) {
  const plain = p57.slice(0, 76);
  const cipher = [];
  let encodeClock = 0;
  for (const value of plain) {
    if (value === 0) cipher.push(0);
    else cipher.push(mod29(value + keyPhi[encodeClock++]));
  }
  const literalF = new Set(plain.flatMap((value, i) => value === 0 ? [i] : []));
  let decodeClock = 0;
  const recovered = cipher.map((value, i) => {
    if (literalF.has(i)) {
      assert.equal(value, 0);
      return 0;
    }
    return mod29(value - keyPhi[decodeClock++]);
  });
  assert.deepEqual(recovered, plain);
  assert.equal(decodeClock, encodeClock);
  return { recoveredRunes: recovered.length, keySymbolsConsumed: decodeClock };
}

function run() {
  const results = [];
  for (const [name, key] of orders) {
    assert.equal(key.length, 76, name + " must retain all 76 source runes");
    const keyPhi = key.map(index => mod29(book.prime[index] - 1));
    const plant = positivePlant(keyPhi);
    const masks = Array.from({ length: 8 }, (_, mask) => {
      const skipped = new Set(cipherFs.filter((_, j) => (mask & (1 << j)) !== 0));
      const forbiddenPlainF = [];
      let clock = 0;
      for (let i = 0; i < p55.length; i++) {
        if (skipped.has(i)) continue;
        const plain = mod29(p55[i] - keyPhi[clock++]);
        if (plain === 0) forbiddenPlainF.push(i);
      }
      assert.ok(forbiddenPlainF.length > 0,
        name + " mask " + mask + " must violate the p56 passthrough rule");
      return { mask, forbiddenPlainF, keySymbolsConsumed: clock };
    });
    const common = masks.map(x => x.forbiddenPlainF)
      .reduce((a, b) => a.filter(position => b.includes(position)));
    results.push({
      order: name,
      wordOrder: name.startsWith("value_")
        ? words.slice().sort((a, b) =>
            (name.includes("descending") ? b.value - a.value : a.value - b.value) ||
            (name.includes("reverse_ties") ? b.pos - a.pos : a.pos - b.pos)
          ).map(w => w.name + ":" + w.value)
        : null,
      keyLength: key.length,
      viableMasks: 0,
      minForbiddenPlainF: Math.min(...masks.map(x => x.forbiddenPlainF.length)),
      commonForbiddenPositions: common,
      masks,
      positivePlant: plant
    });
  }
  assert.equal(results.length, 8);
  assert.ok(results.every(result => result.viableMasks === 0));
  const output = {
    source: "LP1 p05 mixed 5x5 Wisdom square and LP2 p55/p57 original corpus",
    signed2016Motivation: "words are the map, their meaning is the road, and their numbers are the direction",
    wordCells: words.map(w => ({ name: w.name, primeSum: w.value, row: w.r, column: w.c })),
    p55CiphertextFPositions: cipherFs,
    keyTransform: "phi(GP-prime(key rune)) mod 29",
    p55FMaskCount: 8,
    orderCount: orders.length,
    candidateCount: orders.length * 8,
    viableCandidates: results.reduce((sum, result) => sum + result.viableMasks, 0),
    results,
    verdict: "All eight source-motivated key orders fail every p55 ciphertext-F interpretation under the authenticated p56 plaintext-F passthrough; all eight solved-p57 positive plants recover exactly."
  };
  console.log(JSON.stringify(output, null, 2));
  return output;
}
if (require.main === module) run();
module.exports = { run };
