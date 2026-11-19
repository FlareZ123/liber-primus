"use strict";

/**
 * SFT: historical 3301 -> 76-cell p50 circumference phase -> p55 direct pad.
 *
 * Frozen source reading:
 * - recovered historical value 3301;
 * - authenticated continuation "The key is all around you";
 * - p50 outer circumference length 76;
 * - p55 ciphertext length 76;
 * - conventional contemporary base60;
 * - printed top-left clockwise perimeter order;
 * - phase = 3301 mod 76;
 * - authenticated additive decryption direction P=C-K mod29.
 *
 * Windows Node.js 22, CommonJS, no third-party dependencies.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative */
function readJson(relative) {
  return JSON.parse(fs.readFileSync(path.join(root, relative), "utf8"));
}

const corpus = readJson("resources/liber-primus/lp2-corpus.json");
const grid = readJson("resources/liber-primus/base60-grid.json");

/** @param {number} value */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number[]} values */
function scaledIoc(values) {
  const counts = Array(29).fill(0);
  for (const value of values) counts[value] += 1;
  return 29 * counts.reduce(
    (sum, count) => sum + count * (count - 1),
    0
  ) / (values.length * (values.length - 1));
}

const tokens = grid.rows.flat();
assert.equal(tokens.length, 256);
const alphabet = grid.alphabet;

const tableValues = tokens.map(token => {
  const high = alphabet.indexOf(token[0]);
  const low = alphabet.indexOf(token[1]);
  assert.ok(high >= 0 && low >= 0);
  return 60 * high + low;
});

// Physical p50 layout is 32 rows x 8 columns. Canonical printed perimeter
// starts at the top-left and proceeds clockwise.
const ring = [];
for (let column = 0; column < 8; column += 1) ring.push(column);
for (let row = 1; row < 32; row += 1) ring.push(row * 8 + 7);
for (let column = 6; column >= 0; column -= 1) {
  ring.push(31 * 8 + column);
}
for (let row = 30; row >= 1; row -= 1) ring.push(row * 8);
assert.equal(ring.length, 76);
assert.equal(new Set(ring).size, 76);

const recoveredHistoricalValue = 3301;
const phase = recoveredHistoricalValue % ring.length;
assert.equal(phase, 33);

const startCell = ring[phase];
assert.equal(startCell, 215);
assert.equal(tokens[startCell], "1O");
assert.equal(tableValues[startCell], 84);

const key = Array.from({length: ring.length}, (unused, index) => {
  void unused;
  const ringPosition = (phase + index) % ring.length;
  return mod29(tableValues[ring[ringPosition]]);
});

const p55 = corpus.pages.find(page => page.page === 55).indices;
assert.equal(p55.length, 76);

const plaintext = p55.map((cipher, index) =>
  mod29(cipher - key[index])
);

const transliteration = plaintext
  .map(value => corpus.translit[value])
  .join("");

assert.deepEqual(key.slice(0, 12), [
  26, 6, 1, 28, 18, 22, 15, 7, 6, 27, 27, 13,
]);

assert.equal(
  transliteration,
  "AMEJEOETHWPBXOEYOGMUAEDCERAETFLREOGSEADFAUGYDUEALAEOHPEOFHDHUYXEIFOEMIWJNEADANPEOMIAWOEWPFE"
);

const outputIoc = scaledIoc(plaintext);
assert.ok(Math.abs(outputIoc - 0.9259649122807018) < 1e-12);

const p57 = corpus.pages.find(page => page.page === 57).indices;
assert.equal(p57.length, 95);
const p57First76Ioc = scaledIoc(p57.slice(0, 76));
assert.ok(Math.abs(p57First76Ioc - 1.7298245614035088) < 1e-12);

// Exact reversible method-positive using genuine clear p57 symbols.
const plant = p57.slice(0, 76);
const encrypted = plant.map((plain, index) =>
  mod29(plain + key[index])
);
const recovered = encrypted.map((cipher, index) =>
  mod29(cipher - key[index])
);
assert.deepEqual(recovered, plant);

console.log(JSON.stringify({
  status: "PASS",
  sourceSelection: {
    recoveredHistoricalValue,
    authenticatedCue: "The key is all around you",
    perimeterLength: ring.length,
    p55Length: p55.length,
    phase,
    startCell,
    startToken: tokens[startCell],
    startBase60: tableValues[startCell],
    direction: "printed top-left clockwise",
    cipherDirection: "P=C-K mod29",
  },
  originalP55: {
    scaledIoC: outputIoc,
    clearP57First76ScaledIoC: p57First76Ioc,
    transliteration,
  },
  positiveControl: "76/76 exact reversible p57-derived plant",
  decision:
    "The historical 3301-mod-76 perimeter phase does not decrypt p55 under the single frozen direct additive receiver. Retire this exact historically motivated phase without expanding to alternate phases, signs, directions, radices or nonlinear consumers absent a new source clue.",
}, null, 2));
