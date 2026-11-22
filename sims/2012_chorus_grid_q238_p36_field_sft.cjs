"use strict";

/**
 * Bounded three-source Cicada field-key test:
 * archived 2012 MIDI Blake chorus (238 letters), unique LP2 p36 (238 runes),
 * and original LP2 256-byte table's irreducible Q238(X) over GF29.
 *
 * Test literal full-block field multiplication/division with GP29/Latin/MIDI
 * source-key values and both original reading orientations (12 variants).
 * No fitted phase, hidden seed, plaintext crib, score-selected transformation.
 *
 * Run: node sims/2012_chorus_grid_q238_p36_field_sft.cjs
 */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const {createHash} = require("node:crypto");

const ROOT = path.resolve(__dirname, "..");
/** @param {string} name @returns {any} */
const readJSON = name => JSON.parse(fs.readFileSync(path.join(ROOT, name), "utf8"));
const grid = readJSON("resources/liber-primus/lp2-grid-256.json").bytes;
const corpus = readJSON("resources/liber-primus/lp2-corpus.json");
const midi = readJSON("im-results/2012-midi-chorus-p36-238-inputs.json");
const source = fs.readFileSync(path.join(ROOT, "resources/control/cicada2012_blake_chorus.txt"), "utf8");
const chorus = source.split("BEGIN SOURCE TEXT")[1].split("END SOURCE TEXT")[0]
  .replace(/[^A-Za-z]/g, "").toUpperCase().split("");
const p36 = corpus.pages.find(x => x.page === 36).indices;
const GP = new Map(corpus.translit.map((s, i) => [s, i]));
GP.set("K", GP.get("C"));
GP.set("V", GP.get("U"));

assert.equal(chorus.length, 238);
assert.equal(p36.length, 238);
assert.deepEqual(corpus.pages.filter(p => p.page < 56 && p.runic_count === 238).map(p => p.page), [36]);
assert.equal(midi.first_cycle_note_plus_delta_sums.length, 238);
assert.equal(midi.source.blob_sha1, "11924e0e195208c2eea757655035e149fb8a190f");
assert.equal(grid.length, 256);
assert.equal(createHash("sha256").update(Buffer.from(grid)).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");

/** @param {number} n */
const fp = n => ((n % 29) + 29) % 29;
/** @param {number} a */
function invertScalar(a) {
  for (let i = 1; i < 29; i++) if (fp(a * i) === 1) return i;
  throw new Error("Noninvertible scalar");
}
/** @param {number[]} p */
function trim(p) {
  const a = p.map(fp);
  while (a.length > 1 && a[a.length - 1] === 0) a.pop();
  return a;
}
/** @param {number[]} a @param {number[]} b @param {number} [sign] */
function add(a, b, sign = 1) {
  return trim(Array.from({length: Math.max(a.length, b.length)},
    (_, i) => fp((a[i] || 0) + sign * (b[i] || 0))));
}
/** @param {number[]} a @param {number[]} b */
function mul(a, b) {
  const out = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      out[i + j] = fp(out[i + j] + a[i] * b[j]);
    }
  }
  return trim(out);
}
/** @param {number[]} a @param {number[]} b */
function div(a, b) {
  let r = trim(a);
  const den = trim(b), scale = invertScalar(den[den.length - 1]);
  const q = Array(Math.max(1, r.length - den.length + 1)).fill(0);
  while (r.length >= den.length && !(r.length === 1 && r[0] === 0)) {
    const shift = r.length - den.length;
    const k = fp(r[r.length - 1] * scale);
    q[shift] = k;
    for (let j = 0; j < den.length; j++)
      r[shift + j] = fp(r[shift + j] - k * den[j]);
    r = trim(r);
  }
  return {q: trim(q), r};
}
/** @param {number[]} p @param {number[]} modulus */
const reduce = (p, modulus) => div(p, modulus).r;
/** @param {number[]} sourceKey @param {number[]} modulus */
function inverse(sourceKey, modulus) {
  let [r0, r1] = [modulus, trim(sourceKey)];
  let [t0, t1] = [[0], [1]];
  while (!(r1.length === 1 && r1[0] === 0)) {
    const {q, r} = div(r0, r1);
    [r0, r1] = [r1, r];
    [t0, t1] = [t1, add(t0, mul(q, t1), -1)];
  }
  assert.equal(r0.length, 1);
  return reduce(t0.map(x => fp(x * invertScalar(r0[0]))), modulus);
}
/** @param {number[]} p */
const pad238 = p => Array.from({length: 238}, (_, i) => p[i] || 0);
/** @param {number[]} p */
function ioc(p) {
  const counts = Array(29).fill(0);
  for (const value of p) counts[value]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (p.length * (p.length - 1));
}

const small = [[5,1],[5,1],[11,18,1],[24,16,14,1],[11,15,0,9,1,5,10,20,12,1]];
const H16 = small.reduce(mul, [1]);
const originalPolynomial = grid.map(fp).reverse().slice(0, 255);
const factored = div(originalPolynomial, H16);
assert.deepEqual(factored.r, [0]);
const Q238 = factored.q.map(x => fp(28 * x));
assert.equal(Q238.length, 239);
assert.equal(Q238[238], 1);
assert.deepEqual(mul(H16, Q238).map(x => fp(28 * x)), originalPolynomial);

const keys = {
  GP: chorus.map(letter => GP.get(letter)),
  Latin: chorus.map(letter => letter.charCodeAt(0) - 65),
  MidiNoteDelta: midi.first_cycle_note_plus_delta_sums.map(x => x % 29),
};
assert.ok(Object.values(keys).every(k => k.length === 238 &&
  k.every(x => Number.isInteger(x) && x >= 0 && x <= 28)));
const planted = corpus.pages[57].indices.concat(corpus.pages[57].indices,
  corpus.pages[57].indices.slice(0, 48));
assert.equal(planted.length, 238);

const out = [];
for (const [keyName, key] of Object.entries(keys)) {
  for (const orientation of ["printed_high_to_low", "printed_low_to_high"]) {
    const cipher = orientation === "printed_high_to_low" ? p36.slice().reverse() : p36.slice();
    const keyPolynomial = orientation === "printed_high_to_low" ? key.slice().reverse() : key.slice();
    const inverseKey = inverse(keyPolynomial, Q238);
    assert.deepEqual(reduce(mul(keyPolynomial, inverseKey), Q238), [1]);

    for (const operation of ["divide", "multiply"]) {
      const decrypt = operation === "divide" ? inverseKey : keyPolynomial;
      const encrypt = operation === "divide" ? keyPolynomial : inverseKey;
      const decoded = pad238(reduce(mul(cipher, decrypt), Q238));
      assert.deepEqual(pad238(reduce(mul(decoded, encrypt), Q238)), cipher);
      const encryptedPlant = pad238(reduce(mul(planted, encrypt), Q238));
      const recoveredPlant = pad238(reduce(mul(encryptedPlant, decrypt), Q238));
      assert.deepEqual(recoveredPlant, planted);
      const physical = orientation === "printed_high_to_low" ?
        decoded.slice().reverse() : decoded;
      out.push({
        keyName, orientation, operation, ioc: ioc(physical),
        prefix: physical.slice(0, 30).map(i => corpus.translit[i]).join(""),
        recoveredPlant: recoveredPlant.length, reencodedP36: cipher.length,
      });
    }
  }
}
assert.equal(out.length, 12);
assert.ok(out.every(v => v.ioc < 0.054));

console.log(JSON.stringify({
  input: "2012 original MIDI chorus + original LP2 p36 + 2014 LP2 grid",
  chorusLetters: 238, p36Runes: 238, Q238Degree: 238,
  rawP36IoC: ioc(p36), knownP57IoC: ioc(corpus.pages[57].indices),
  models: out, foundOriginalUnknownPlaintext: false,
}, null, 2));
