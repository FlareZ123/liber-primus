"use strict";

/**
 * Original p50 table interior (30x6, 180 slots) versus the authentic
 * p56 plaintext (85 runes) and p57 cleartext (95 runes).
 *
 * Source grammar: solved p57 SHED CIRCUMFERENCES -> remove 76 cells in
 * outer 32x8 rectangle, read remaining 30x6 cells in printed row-major
 * order, align to the exact source-length 85+95 fully known ending.
 *
 * This tests *every* memoryless byte->GP29 lookup, even arbitrary secret
 * noninjective ones, without choosing a lookup or fitting the unknown p55.
 *
 * Run on Windows Node.js 22:
 *   node sims/lp2_grid_inner180_memoryless_gp_ending_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const readJSON = relative =>
  JSON.parse(fs.readFileSync(path.join(root, relative), "utf8"));
const corpus = readJSON("resources/liber-primus/lp2-corpus.json");
const grid = readJSON("resources/liber-primus/base60-grid.json").byte_rows;
assert.deepEqual(grid.map(row => row.length), Array(32).fill(8));

const gp = new Map(corpus.translit.map((rune, index) => [rune, index]));
gp.set("ING", 21);

/** @param {string} text @returns {number[]} */
function encodeGP(text) {
  const out = [];
  for (const raw of text.toUpperCase().match(/[A-Z]+/g) || []) {
    const word = raw.replace(/V/g, "U").replace(/K/g, "C").replace(/Z/g, "S");
    for (let i = 0; i < word.length;) {
      const token = [3, 2, 1].map(n => word.slice(i, i + n))
        .find(candidate => gp.has(candidate));
      assert.ok(token, "unknown authentic GP spelling in " + word);
      out.push(gp.get(token));
      i += token.length;
    }
  }
  return out;
}

const published56 = "AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EVERY PILGRIM TO SEEK OUT THIS PAGE";
const p56plain = encodeGP(published56);
const p57plain = corpus.pages.find(page => page.page === 57).indices;
assert.equal(p56plain.length, 85);
assert.equal(p57plain.length, 95);
const known = p56plain.concat(p57plain);
assert.equal(known.length, 180);

// Independent genuinely decrypted LP1 and p56 originals guard the known
// plaintext spelling and the genuine F bypass semantics.
const established = require("./authentic_decryption_regression.cjs").run();
assert.equal(established.length, 5);
assert.ok(established.every(v => v.exactEnglishMatch && v.wrongMethodRejected));

const interior = grid.slice(1, -1).flatMap(row => row.slice(1, -1));
const exterior = grid.flat().filter((_, index) => {
  const row = Math.floor(index / 8);
  const col = index % 8;
  return row === 0 || row === 31 || col === 0 || col === 7;
});
assert.equal(interior.length, 180);
assert.equal(exterior.length, 76);

// For every byte x, a fixed deterministic f(x) must have the same GP29
// output at all matching positions. This is a necessary condition for any
// one-token memoryless decoder, even if f is secret and nonbijective.
const observed = new Map();
const inconsistent = [];
const perByte = new Map();
for (let i = 0; i < known.length; i++) {
  const byte = interior[i];
  const symbol = known[i];
  const previous = observed.get(byte);
  if (previous === undefined) {
    observed.set(byte, { position: i, symbol });
  } else if (previous.symbol !== symbol) {
    inconsistent.push({
      byte,
      firstPosition: previous.position,
      firstGP: previous.symbol,
      secondPosition: i,
      secondGP: symbol
    });
  }
  const counts = perByte.get(byte) || new Uint16Array(29);
  counts[symbol]++;
  perByte.set(byte, counts);
}
const unavoidableMismatches = [...perByte.values()].reduce((total, row) =>
  total + row.reduce((a, b) => a + b, 0) - Math.max(...row), 0);
const perimeterUnlearned = exterior.filter(b => !observed.has(b)).length;
assert.equal(observed.size, 127);
assert.equal(inconsistent.length, 47);
assert.equal(perimeterUnlearned, 39);
assert.ok(unavoidableMismatches > 0);
assert.deepEqual(inconsistent[0], {
  byte: 59,
  firstPosition: 11,
  firstGP: 18,
  secondPosition: 32,
  secondGP: 6
});

// Second, physically motivated alternative: the printed EIGHT columns
// select eight independent, arbitrary byte-to-GP29 output tables.
// Even with this very broad secret 8x256 mapping, the six interior
// printed columns cannot predict a single outside-ring observation.
const columnObserved = new Map();
const columnDisagreements = [];
for (let i = 0; i < 180; i++) {
  const byte = interior[i];
  const originalColumn = (i % 6) + 1;
  const key = originalColumn * 256 + byte;
  const symbol = known[i];
  const previous = columnObserved.get(key);
  if (previous !== undefined && previous.symbol !== symbol) {
    columnDisagreements.push({
      originalColumn, byte,
      priorPosition: previous.position, priorGP: previous.symbol,
      newPosition: i, newGP: symbol
    });
  } else if (previous === undefined) {
    columnObserved.set(key, { symbol, position: i });
  }
}
const outerWithColumnCalibrated = exterior.filter((byte, index) => {
  const row = index < 8 ? 0 : index >= 68 ? 31
    : Math.floor((index - 8) / 2) + 1;
  const column = index < 8 ? index : index >= 68 ? index - 68
    : (index - 8) % 2 === 0 ? 0 : 7;
  assert.ok(row >= 0 && row < 32);
  assert.ok(column >= 0 && column < 8);
  return columnObserved.has(column * 256 + byte);
}).length;
assert.equal(columnObserved.size, 172);
assert.equal(columnDisagreements.length, 8);
assert.equal(outerWithColumnCalibrated, 0);

// Planted source-native positive: every source byte emits byte%29.
// All repeated token values are consistent and exactly predicted.
const plant = interior.map(byte => byte % 29);
const learned = new Map();
for (let i = 0; i < 180; i++) {
  const byte = interior[i];
  if (learned.has(byte)) assert.equal(learned.get(byte), plant[i]);
  else learned.set(byte, plant[i]);
}
assert.deepEqual(plant, interior.map(byte => learned.get(byte)));
const wrong = new Map(learned);
wrong.set(interior[0], (wrong.get(interior[0]) + 1) % 29);
assert.ok(plant.some((symbol, i) => wrong.get(interior[i]) !== symbol));

console.log(JSON.stringify({
  status: "PASS",
  decision: "Direct noninjective, secret, memoryless 256-byte-to-GP29 lookup is impossible under the frozen SHED row-major terminal-180 alignment.",
  source: {
    gridShape: "32x8",
    outerRing: exterior.length,
    innerRectangle: interior.length,
    knownAuthenticPlaintext: [p56plain.length, p57plain.length],
    independentSolvedOriginalRegressionVectors: established.length
  },
  original: {
    distinctInteriorByteInputs: observed.size,
    inconsistentRepeatedByteObservations: inconsistent.length,
    minimumNecessaryKnownOutputMismatches: unavoidableMismatches,
    firstContradiction: inconsistent[0],
    outerRingPositionsWithoutAnyCalibratingKnownByte: perimeterUnlearned,
    printedEightColumnLookup: {
      distinctInteriorByteColumnPairs: columnObserved.size,
      repeatedPairConflicts: columnDisagreements.length,
      firstContradiction: columnDisagreements[0],
      calibratableExteriorPositions: outerWithColumnCalibrated
    }
  },
  controls: {
    sourceNativeDeterministicLookupPlant: "180/180 exact",
    wrongLookupPlantRejected: true
  },
  caveat: "Applies only to one literal 30x6 row-major interior and memoryless lookup. Source does not select this alignment or establish the terminal256 connection. Positional/state-dependent operators remain possible. No new LP2 plaintext."
}, null, 2));
