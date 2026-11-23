"use strict";
/**
 * One source-crib GP29 LFSR transfer: the authenticated 2016 words
 * "EPIPHANY SEEKS", the 13 original p0 red runes, and one canonical
 * shortest Berlekamp-Massey recurrence over GF(29).
 *
 * Conditional experiment. The source does NOT say an LFSR was used.
 * Windows 11, Node.js 22: node sims/lp2_p0_epiphany_signed2016_bm6_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { createHash } = require("node:crypto");
const gp = JSON.parse(fs.readFileSync(path.resolve(
  __dirname, "../resources/liber-primus/lp2-corpus.json"), "utf8"));

/** @param {number} x @returns {number} */
const mod = x => (x % 29 + 29) % 29;
/** @param {number[]} arr @returns {number} */
function ioc(arr) {
  const f = Array(29).fill(0);
  for (const value of arr) f[value]++;
  return f.reduce((acc, n) => acc + n * (n - 1), 0) /
    (arr.length * (arr.length - 1));
}
/** @param {number[]} arr @returns {string} */
const render = arr => arr.map(i => gp.translit[i]).join("");
/**
 * Minimal connection polynomial C(x)=1+C1*x+...+CL*x^L.
 * @param {number[]} seq @returns {{degree:number, poly:number[]}}
 */
function berlekampMassey(seq) {
  const C = Array(seq.length + 1).fill(0);
  const B = C.slice();
  C[0] = 1;
  B[0] = 1;
  let degree = 0, since = 1, oldDiscrepancy = 1;
  for (let n = 0; n < seq.length; n++) {
    let discrepancy = 0;
    for (let j = 0; j <= degree; j++)
      discrepancy = mod(discrepancy + C[j] * seq[n - j]);
    if (discrepancy === 0) { since++; continue; }
    const previous = C.slice();
    const scale = mod(discrepancy * inverse(oldDiscrepancy));
    for (let j = since; j < C.length; j++)
      C[j] = mod(C[j] - scale * B[j - since]);
    if (2 * degree <= n) {
      degree = n + 1 - degree;
      for (let j = 0; j < B.length; j++) B[j] = previous[j];
      oldDiscrepancy = discrepancy;
      since = 1;
    } else since++;
  }
  return { degree, poly: C.slice(0, degree + 1) };
}
/** @param {number} n @returns {number} */
function inverse(n) {
  assert.notEqual(n, 0);
  for (let i = 1; i < 29; i++) if (mod(n * i) === 1) return i;
  throw Error("No GF29 inverse");
}
/**
 * Deterministically continue a public prefix with a fixed BM connection.
 * @param {number[]} prefix @param {number[]} poly
 * @param {number} count @returns {number[]}
 */
function continueKey(prefix, poly, count) {
  const key = prefix.slice();
  for (let n = key.length; n < count; n++) {
    let sum = 0;
    for (let j = 1; j < poly.length; j++)
      sum += poly[j] * key[n - j];
    key.push(mod(-sum));
  }
  return key;
}
/** @param {number[]} data @param {number[]} key @param {number} sign */
const translate = (data, key, sign) =>
  data.map((v, i) => mod(v + sign * key[i]));

assert.equal(gp.pages.length, 58);
const originalPages = [gp.pages[0], gp.pages[1], gp.pages[2]];
assert.deepEqual(originalPages.map(p => p.indices.length), [262, 266, 201]);
const ciphertext = originalPages.flatMap(p => p.indices);
assert.equal(ciphertext.length, 729);

// Signed 2016 phrase uses GP29 C in place of Latin K.
const knownPlain = "EPIPHANYSEECS".split("").map(ch => {
  const index = gp.translit.indexOf(ch);
  assert.ok(index >= 0, "Exact GP transliteration of the signed crib");
  return index;
});
assert.equal(knownPlain.length, 13);
assert.equal(render(knownPlain), "EPIPHANYSEECS");
assert.equal(render(ciphertext.slice(0, 13)), "SHEOGMIAFSYENGC");
const keyPrefix = ciphertext.slice(0, 13).map((v, i) =>
  mod(v - knownPlain[i]));
assert.deepEqual(keyPrefix, [26,24,8,19,27,24,18,3,0,8,0,16,19]);

const connection = berlekampMassey(keyPrefix);
assert.deepEqual(connection, {
  degree: 6, poly: [1,9,13,23,22,17,23]
});
const key = continueKey(keyPrefix, connection.poly, ciphertext.length);
assert.deepEqual(key.slice(0, 13), keyPrefix);
const plaintext = translate(ciphertext, key, -1);
assert.deepEqual(translate(plaintext, key, +1), ciphertext);
assert.deepEqual(plaintext.slice(0, 13), knownPlain);

// A genuine solved LP2 page is the positive control. Under the
// same *planted* recurrence, a known 13-rune crib recovers ALL 95.
const native = gp.pages[57].indices;
assert.equal(native.length, 95);
const plantedKey = continueKey(keyPrefix, connection.poly, native.length);
const plant = translate(native, plantedKey, +1);
const recoveredPrefix = plant.slice(0, 13).map((v, i) =>
  mod(v - native[i]));
const recoveredConnection = berlekampMassey(recoveredPrefix);
assert.deepEqual(recoveredConnection, connection);
const recoveredKey = continueKey(recoveredPrefix,
  recoveredConnection.poly, native.length);
assert.deepEqual(translate(plant, recoveredKey, -1), native);


// Independent *discriminating* body-reset hypothesis: the original dot
// immediately after the red 13-rune title resets the LFSR, and the signed
// 2016 continuation is literally THE DEVOTED. Only the first six body
// plaintext runes are given to recover a fresh six-value seed. Positions
// 6,7,8 are withheld until AFTER the recurrence predicts them. K->C and
// V->U are the canonical GP29 roman transliterations.
const expectedBody9 = ["TH","E","D","E","U","O","T","E","D"]
  .map(symbol => {
    const i = gp.translit.indexOf(symbol);
    assert.ok(i >= 0);
    return i;
  });
const sourceBody9 = gp.pages[0].indices.slice(13, 22);
assert.equal(sourceBody9.length, 9);
const bodySeed6 = sourceBody9.slice(0, 6)
  .map((v, i) => mod(v - expectedBody9[i]));
const bodyKey9 = continueKey(bodySeed6, connection.poly, 9);
const bodyPredicted9 = translate(sourceBody9, bodyKey9, -1);
assert.deepEqual(bodyPredicted9.slice(0, 6), expectedBody9.slice(0, 6));
assert.equal(render(bodyPredicted9), "THEDEUOIEOO");
assert.notDeepEqual(bodyPredicted9.slice(6), expectedBody9.slice(6));
assert.deepEqual(bodyPredicted9.slice(6).map((v, i) =>
  v === expectedBody9[i + 6]), [false, false, false]);
// A separate native planted reset has precisely the same six-seed receiver
// and recovers its held-out output under the correctly specified model.
const nativeResetKey = continueKey(bodySeed6, connection.poly, native.length);
const plantedReset = translate(native, nativeResetKey, +1);
const nativeResetSeed = plantedReset.slice(0, 6)
  .map((v, i) => mod(v - native[i]));
assert.deepEqual(translate(plantedReset,
  continueKey(nativeResetSeed, connection.poly, native.length), -1), native);

const cuts = [
  { label: "original p0 red known phrase", start: 0, end: 13 },
  { label: "original p0 black NEW 249", start: 13, end: 262 },
  { label: "original p1 holdout 266", start: 262, end: 528 },
  { label: "original p2 holdout 201", start: 528, end: 729 },
  { label: "original chapter p0-p2", start: 0, end: 729 }
];
console.log("signed known title", render(knownPlain));
console.log("source key13", keyPrefix.join(","));
console.log("BM degree", connection.degree,
  "connection", connection.poly.join(","));
console.log("original source SHA256", createHash("sha256")
  .update(Buffer.from(ciphertext)).digest("hex"));
for (const part of cuts) {
  const decoded = plaintext.slice(part.start, part.end);
  console.log(part.label, "len", decoded.length,
    "IoC", ioc(decoded).toFixed(12),
    "first120", render(decoded.slice(0, 120)));
}
console.log("native p57 control original IoC", ioc(native).toFixed(12));
console.log("native p57 full planted inverse", "95/95", "PASS");\nconsole.log("dot-reset body first6 crib", render(expectedBody9.slice(0,6)), "seed", bodySeed6.join(","));\nconsole.log("dot-reset withheld3 expected", render(expectedBody9.slice(6)), "actual", render(bodyPredicted9.slice(6)), "0/3");\nconsole.log("native p57 planted six-seed dot-reset", "95/95", "PASS");
console.log("original full original-input reencryption", "729/729", "PASS");
console.log("CONCLUSION: no original body plaintext under this fixed BM6 candidate.");
