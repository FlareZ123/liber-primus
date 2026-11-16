"use strict";

/**
 * LP2 terminal ring byte-state inverse, original-input and synthetic plant.
 * Run from repository root: node sims/lp2_terminal256_byte_state_ring_known180_sft.cjs
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
/** @param {string} name */
const read = name => JSON.parse(fs.readFileSync(path.join(root, name), "utf8"));
const corpus = read("resources/liber-primus/lp2-corpus.json");
const grid = read("resources/liber-primus/lp2-grid-256.json");
const bytes = grid.bytes;
const page = n => corpus.pages.find(p => p.page === n);
assert.equal(bytes.length, 256);
assert.equal(page(55).runic_count, 76);
assert.equal(page(56).runic_count, 85);
assert.equal(page(57).runic_count, 95);
const sha256 = "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290";
assert.equal(crypto.createHash("sha256").update(Buffer.from(bytes)).digest("hex"), sha256);

// Independently solved native GP29 text. Original p55 indices are never read.
const p56Text = "AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO " +
  "IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE";
const names = corpus.translit.map((token, index) => ({ token, index }))
  .sort((a, b) => b.token.length - a.token.length);
/** @param {string} text @returns {number[]} */
function gp29(text) {
  const out = [];
  for (const word of text.split(" ")) {
    for (let i = 0; i < word.length;) {
      const symbol = names.find(x => word.startsWith(x.token, i));
      assert.ok(symbol, "Bad GP29 spelling: " + word.slice(i));
      out.push(symbol.index);
      i += symbol.token.length;
    }
  }
  return out;
}
const known56 = gp29(p56Text);
assert.equal(known56.length, 85);
const known = known56.concat(page(57).indices);
assert.equal(known.length, 180);

/** @param {number} depth @returns {number[]} */
function ring(depth) {
  const out = [];
  const r0 = depth, r1 = 31 - depth, c0 = depth, c1 = 7 - depth;
  for (let c = c0; c <= c1; c++) out.push(8 * r0 + c);
  for (let r = r0 + 1; r <= r1; r++) out.push(8 * r + c1);
  for (let c = c1 - 1; c >= c0; c--) out.push(8 * r1 + c);
  for (let r = r1 - 1; r > r0; r--) out.push(8 * r + c0);
  return out;
}
const rings = [0, 1, 2, 3].map(ring);
assert.deepEqual(rings.map(r => r.length), [76, 68, 60, 52]);
const order = rings.flat();
assert.equal(new Set(order).size, 256);
const inside = order.slice(76);

/**
 * Necessary condition for EVERY autonomous 8-bit successor function,
 * including arbitrary unknown nonlinear 256-entry transition tables.
 * @param {number[]} key
 */
function successorConflicts(key) {
  const seen = new Map();
  const conflicts = [];
  let repeats = 0;
  for (let i = 0; i + 1 < key.length; i++) {
    const previous = seen.get(key[i]);
    if (previous) {
      repeats++;
      if (previous.next !== key[i + 1]) {
        conflicts.push({
          firstIndex: previous.index, secondIndex: i,
          state: key[i], firstNext: previous.next, secondNext: key[i + 1]
        });
      }
    } else {
      seen.set(key[i], { index: i, next: key[i + 1] });
    }
  }
  return { repeats, conflicts };
}

/**
 * Full invertible single-byte affine state family (a odd).
 * XOR has its own nonlinear bit-carry successor from arithmetic modulo 256.
 * @param {number[]} key
 */
function recoverOddLcg(key) {
  const out = [];
  for (let a = 1; a < 256; a += 2) {
    const b = (key[1] - a * key[0]) & 255;
    if (key.every((s, i) => i === 0 || (((a * key[i - 1] + b) & 255) === s)))
      out.push({ a, b });
  }
  return out;
}

const originalK = inside.map((cell, i) => bytes[cell] ^ known[i]);
const original = successorConflicts(originalK);
assert.equal(original.repeats, 44);
assert.equal(original.conflicts.length, 44);
assert.deepEqual(original.conflicts[0], {
  firstIndex: 7, secondIndex: 8, state: 143, firstNext: 143, secondNext: 206
});
assert.equal(recoverOddLcg(originalK).length, 0);

// Native-GP source-shaped positive, same 76 + 180 ring geometry.
// A hidden 76-rune plant is predicted from the 180 known inner positions.
const hidden = page(57).indices.slice(0, 76);
const plantPlain = hidden.concat(known);
assert.equal(plantPlain.length, 256);
const trueA = 5, trueB = 17, trueSeed = 37;
const trueK = [trueSeed];
for (let i = 1; i < 256; i++)
  trueK.push((trueA * trueK[i - 1] + trueB) & 255);
const plantBytes = Array(256);
for (let i = 0; i < 256; i++)
  plantBytes[order[i]] = plantPlain[i] ^ trueK[i];
const observedInnerKey = inside.map((cell, i) => plantBytes[cell] ^ known[i]);
const fitted = recoverOddLcg(observedInnerKey);
assert.deepEqual(fitted, [{ a: trueA, b: trueB }]);
assert.equal(successorConflicts(observedInnerKey).conflicts.length, 0);
const invA = Array.from({ length: 256 }, (_, i) => i)
  .find(x => (x * fitted[0].a) % 256 === 1);
assert.notEqual(invA, undefined);
const reconstructedK = Array(256);
reconstructedK[76] = observedInnerKey[0];
for (let i = 75; i >= 0; i--)
  reconstructedK[i] = ((reconstructedK[i + 1] - fitted[0].b) * invA) & 255;
for (let i = 77; i < 256; i++)
  reconstructedK[i] = (fitted[0].a * reconstructedK[i - 1] + fitted[0].b) & 255;
assert.deepEqual(reconstructedK, trueK);
const recoveredRim = order.slice(0, 76).map((cell, i) =>
  plantBytes[cell] ^ reconstructedK[i]);
assert.deepEqual(recoveredRim, hidden);
for (let i = 0; i < 256; i++)
  assert.equal(plantBytes[order[i]], plantPlain[i] ^ reconstructedK[i]);

console.log(JSON.stringify({
  original: {
    tableSha256: sha256,
    rings: rings.map(r => r.length),
    knownSolvedP56: 85, knownClearP57: 95, withheldP55: 76,
    repeatedStates: original.repeats,
    inconsistentSuccessors: original.conflicts.length,
    earliestContradiction: original.conflicts[0],
    oddLcgCandidates: 0
  },
  independentPlant: {
    uniquelyRecoveredKey: fitted[0],
    hiddenPerimeterRecovered: recoveredRim.length,
    exactReencryption: 256
  },
  conclusion: "No original p55 plaintext was recovered."
}, null, 2));
