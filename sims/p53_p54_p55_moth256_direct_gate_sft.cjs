"use strict";

/**
 * A source-marked 256-rune terminal register, without tuned positions.
 * Usage on Node.js 22 (repository root): node sims/p53_p54_p55_moth256_direct_gate_sft.cjs
 *
 * The original p53 and p55 scans reuse the moth illustration. Their full
 * 179 + 76 runes plus p54's unique enlarged red initial form exactly 256
 * runes, the width of the printed p49-51 byte table. This is a hypothesis,
 * not an author-specified cipher or an authenticated decryption.
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
/** @param {string} name */
const readJSON = name => JSON.parse(fs.readFileSync(path.join(root, name), "utf8"));
const corpus = readJSON("resources/liber-primus/lp2-corpus.json");
const table = readJSON("resources/liber-primus/base60-grid.json");
const original = [
  ...corpus.pages[53].indices,
  corpus.pages[54].indices[0],
  ...corpus.pages[55].indices,
];
const bytes = table.byte_rows.flat();

assert.equal(corpus.pages[53].indices.length, 179);
assert.equal(corpus.pages[54].indices.length, 232);
assert.equal(corpus.pages[54].indices[0], 24);
assert.equal(corpus.pages[55].indices.length, 76);
assert.equal(original.length, 256);
assert.equal(bytes.length, 256);
assert.equal(
  crypto.createHash("sha256").update(Buffer.from(bytes)).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290"
);

/** @param {number} x */
const mod29 = x => (x % 29 + 29) % 29;
/** @param {number[]} a @param {number[]} divisor */
function remainder(a, divisor) {
  const work = a.map(mod29);
  const inverse = Array.from({ length: 29 }, (_, k) => k)
    .find(k => mod29(divisor[0] * k) === 1);
  assert.notEqual(inverse, undefined);
  for (let i = 0; i <= work.length - divisor.length; i++) {
    const factor = mod29(work[i] * inverse);
    for (let j = 0; j < divisor.length; j++) {
      work[i + j] = mod29(work[i + j] - factor * divisor[j]);
    }
  }
  return work.slice(1 - divisor.length);
}
/** @param {number[]} a */
function ioc(a) {
  const counts = Array(29).fill(0);
  for (const x of a) {
    assert.ok(Number.isInteger(x) && x >= 0 && x < 29);
    counts[x]++;
  }
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) / (a.length * (a.length - 1));
}
/** @param {number[]} data @param {number[]} key @param {-1|1} sign */
const transform = (data, key, sign) => data.map((c, i) => mod29(c + sign * key[i]));
const polynomials = { H: [24, 26, 3], G: [15, 5, 27] };

for (const factor of Object.values(polynomials)) {
  assert.deepEqual(remainder(bytes, factor), [0, 0]);
}
const registerSyndromes = Object.fromEntries(
  Object.entries(polynomials).map(([name, factor]) => [name, remainder(original, factor)])
);
assert.deepEqual(registerSyndromes, { H: [11, 19], G: [17, 9] });
assert.deepEqual(remainder([...original].reverse(), polynomials.H), [16, 5]);
assert.deepEqual(remainder([...original].reverse(), polynomials.G), [23, 16]);

const knownGP = corpus.pages[57].indices;
assert.equal(knownGP.length, 95);
const planted = Array.from({ length: 256 }, (_, i) => knownGP[i % knownGP.length]);
const models = [
  { name: "byte_mod29", key: bytes.map(x => x % 29) },
  { name: "byte_scaled29", key: bytes.map(x => Math.floor(29 * x / 256)) },
];
const reference = {
  byte_mod29: { minus: 0.03425245098039216, plus: 0.0328125 },
  byte_scaled29: { minus: 0.034895833333333334, plus: 0.03324142156862745 },
};
const results = [];
for (const model of models) {
  for (const sign of [-1, 1]) {
    const label = sign === -1 ? "minus" : "plus";
    const candidate = transform(original, model.key, sign);
    const cipherPlant = transform(planted, model.key, /** @type {-1|1} */ (-sign));
    assert.deepEqual(transform(cipherPlant, model.key, /** @type {-1|1} */ (sign)), planted);
    assert.deepEqual(transform(candidate, model.key, /** @type {-1|1} */ (-sign)), original);
    const collision = ioc(candidate);
    assert.ok(Math.abs(collision - reference[model.name][label]) < 0.000002);
    results.push({
      model: model.name,
      direction: label,
      original_rune_matches_after_reencryption: 256,
      planted_native_rune_matches: 256,
      ioc: collision,
      first40_gp_letters: candidate.slice(0, 40).map(x => corpus.translit[x]).join(""),
    });
  }
}
console.log(JSON.stringify({
  result: "No unknown LP2 plaintext; the frozen 256-rune moth/drop-cap register does not share the table's H/G codeword property or decode directly with the original table.",
  source_runes: 256,
  image_selection: "all p53 (179), p54 first enlarged Ac (1), all p55 (76)",
  source_byte_table: 256,
  register_syndromes: registerSyndromes,
  raw_ioc: ioc(original),
  models: results,
}, null, 2));
