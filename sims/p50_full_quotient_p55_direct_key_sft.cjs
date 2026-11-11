"use strict";

/**
 * Issue #392: fixed row-major p50 Q-key against all 76 original p55 runes.
 * Reproducer: node sims/p50_full_quotient_p55_direct_key_sft.cjs
 * No phase, word reset, skip filter, key cycling or candidate selection.
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
/** @param {string} location */
const json = location => JSON.parse(fs.readFileSync(path.join(root, location), "utf8"));
const grid = json("resources/liber-primus/base60-grid.json");
const corpus = json("resources/liber-primus/lp2-corpus.json");
const bytes = grid.byte_rows.flat();
assert.equal(grid.byte_rows.length, 32);
assert(grid.byte_rows.every(row => row.length === 8));
assert.equal(bytes.length, 256);
assert.equal(crypto.createHash("sha256").update(Buffer.from(bytes)).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");
const q = bytes.slice(0, 76).map(b => Math.floor(b / 29));
assert(q.every(x => Number.isInteger(x) && x >= 0 && x <= 8));
const cipher = corpus.pages.find(p => p.page === 55).indices;
const native = corpus.pages.find(p => p.page === 57).indices.slice(0, 76);
assert.equal(cipher.length, 76);
assert.equal(native.length, 76);
assert.equal(corpus.translit.slice(0, 5).join(""), "FUTHOR"); // GP29 order check
/** @param {number} x */
const m29 = x => (x % 29 + 29) % 29;
/** @param {number[]} indices */
const translit = indices => indices.map(i => corpus.translit[i]).join("").replace(/[^A-Z]/g, "");
const counts = new Map();
let quadTotal = 0;
for (const line of fs.readFileSync(path.join(root,
  "resources/control/duko_round27_english_quadgrams.txt"), "utf8").trim().split(/\r?\n/u)) {
  const [quad, countText] = line.trim().split(/\s+/u);
  if (quad && countText) {
    const count = Number(countText);
    assert(Number.isFinite(count));
    counts.set(quad, count);
    quadTotal += count;
  }
}
assert.equal(counts.size, 79495);
assert.equal(quadTotal, 7266795);
/** @param {number[]} indices */
function score(indices) {
  const text = translit(indices);
  const n = text.length - 3;
  let sum = 0;
  for (let i = 0; i < n; i++) {
    sum += Math.log10((counts.get(text.slice(i, i + 4)) || 0.01) / quadTotal);
  }
  return {mean: sum / n, latin: text, quadgrams: n};
}
const sub = cipher.map((c, i) => m29(c - q[i]));
const add = cipher.map((c, i) => m29(c + q[i]));
assert(sub.every((p, i) => m29(p + q[i]) === cipher[i]));
assert(add.every((p, i) => m29(p - q[i]) === cipher[i]));

const plant = native.map((p, i) => m29(p + q[i]));
const plantRecovered = plant.map((c, i) => m29(c - q[i]));
const rotatedWrongQ = q.slice(1).concat(q[0]);
const plantWrongKey = plant.map((c, i) => m29(c - rotatedWrongQ[i]));
assert.deepEqual(plantRecovered, native);
assert.notDeepEqual(plantWrongKey, native);

const scored = {
  original: score(cipher),
  subtract: score(sub),
  add: score(add),
  native: score(native),
  plantCipher: score(plant),
  plantRecovered: score(plantRecovered),
  wrongKeyPlant: score(plantWrongKey)
};
assert(Math.abs(scored.original.mean - (-7.379527125676375)) < 1e-10);
assert(Math.abs(scored.subtract.mean - (-7.440423758537153)) < 1e-10);
assert(Math.abs(scored.add.mean - (-7.82084392399598)) < 1e-10);
assert(Math.abs(scored.native.mean - (-4.368345963159677)) < 1e-10);

let seed = 0x392569f1;
/** @returns {number} A deterministic uniform [0,1) PRNG for the matched key shuffle. */
function random() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return (seed >>> 0) / 4294967296;
}
const shuffledSub = [], shuffledAdd = [];
for (let trial = 0; trial < 3000; trial++) {
  const key = q.slice();
  for (let i = key.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [key[i], key[j]] = [key[j], key[i]];
  }
  shuffledSub.push(score(cipher.map((c, i) => m29(c - key[i]))).mean);
  shuffledAdd.push(score(cipher.map((c, i) => m29(c + key[i]))).mean);
}
/** @param {number[]} values @param {number} candidate */
function nullSummary(values, candidate) {
  return {
    total: values.length,
    betterOrEqual: values.filter(x => x >= candidate).length,
    mean: values.reduce((sum, x) => sum + x, 0) / values.length,
    maximum: Math.max(...values)
  };
}
const subtractNull = nullSummary(shuffledSub, scored.subtract.mean);
const addNull = nullSummary(shuffledAdd, scored.add.mean);
assert.equal(subtractNull.betterOrEqual, 935);
assert.equal(addNull.betterOrEqual, 2516);
console.log(JSON.stringify({
  issue: 392, page: 55, runes: cipher.length,
  keyDefinition: "floor(base60_byte/29), first 76, row-major, cell 0",
  q, originalIndices: cipher, subtractIndices: sub, addIndices: add,
  scored, subtractNull, addNull,
  forwardReplay: true, exactPositivePlant: true,
  result: "No recognizable English in either fixed direct additive inverse."
}, null, 2));
