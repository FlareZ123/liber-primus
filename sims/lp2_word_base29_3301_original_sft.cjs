"use strict";

/**
 * Source-exact LP2 GP29 printed-word modular-arithmetic gate.
 * Windows 11 / Node.js 22: run as one SFT in the repository checkout.
 * Uses only checked-in originals and independently solved LP1 text.
 *
 * Mathematical scope: C_w = a*P_w + b modulo 29^length(w),
 * a coprime to 29, same a,b at every printed word.
 * The source-visible Cicada identifier 3301 is one frozen a candidate;
 * no manuscript instruction authenticates this word-arithmetic operation.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
/** @param {string} p */
const read = p => fs.readFileSync(path.join(root, p), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const src = read("resources/liber-primus/lp2-transcription.txt");
const solved = read("resources/liber-primus/lp1-plaintext-reference.txt");
const runeIds = new Map(gp.runes.map((r, i) => [r, i]));
const unknownLength = gp.pages.slice(0, 56).reduce((n, p) => n + p.indices.length, 0);
assert.equal(unknownLength, 12956);
const pageEnds = [];
let pageEnd = 0;
for (const p of gp.pages.slice(0, 56)) {
  pageEnd += p.indices.length;
  pageEnds.push(pageEnd);
}
const words = [];
let current = [];
let runeCount = 0;
for (const ch of src) {
  if (runeIds.has(ch)) {
    if (runeCount === unknownLength) break;
    runeCount++;
    current.push(runeIds.get(ch));
  } else if ((ch === "-" || ch === ".") && current.length) {
    words.push({ digits: current, page: pageEnds.findIndex(x => x >= runeCount) });
    current = [];
  }
}
if (current.length) {
  words.push({ digits: current, page: pageEnds.findIndex(x => x >= runeCount) });
}
assert.equal(runeCount, 12956);
assert.equal(words.length, 2896);
assert.equal(words.filter(w => w.digits.length === 2).length, 448);
/** @param {number[]} a */
function ioc(a) {
  const counts = Array(29).fill(0);
  for (const x of a) counts[x]++;
  return counts.reduce((v, x) => v + x * (x - 1), 0) / (a.length * (a.length - 1));
}
/** @param {number[]} a */
function equalPairs(a) {
  let n = 0;
  for (let i = 0; i < a.length; i++) {
    for (let j = i + 1; j < a.length; j++) n += Number(a[i] === a[j]);
  }
  return n;
}
assert.equal(words.reduce((v, w) => v + equalPairs(w.digits), 0), 811);
/** @param {bigint} a @param {bigint} m */
function inv(a, m) {
  let r0 = m, r1 = a % m, s0 = 0n, s1 = 1n;
  while (r1 !== 0n) {
    const q = r0 / r1;
    [r0, r1] = [r1, r0 - q * r1];
    [s0, s1] = [s1, s0 - q * s1];
  }
  assert.equal(r0, 1n);
  return ((s0 % m) + m) % m;
}
/**
 * @param {number[]} digits
 * @param {"be" | "le"} orientation
 * @param {boolean} decode
 * @param {bigint} a
 * @param {bigint} b
 */
function affine(digits, orientation, decode, a = 3301n, b = 0n) {
  const m = 29n ** BigInt(digits.length);
  const arr = orientation === "be" ? digits : digits.slice().reverse();
  let value = 0n;
  for (const digit of arr) value = value * 29n + BigInt(digit);
  const y = decode ? ((value - b + m) * inv(a, m)) % m : ((a * value + b) % m);
  let z = y;
  const out = Array(digits.length).fill(0);
  for (let i = out.length - 1; i >= 0; i--) {
    out[i] = Number(z % 29n);
    z /= 29n;
  }
  return orientation === "be" ? out : out.reverse();
}
function endpoints(list) {
  return [ioc(list.map(w => w[0])), ioc(list.map(w => w[w.length - 1]))];
}
const originalArrays = words.map(w => w.digits);
const originalEnds = endpoints(originalArrays);
assert.ok(Math.abs(originalEnds[0] - 0.03442208418019256) < 1e-13);
assert.ok(Math.abs(originalEnds[1] - 0.0345451769577954) < 1e-13);

const GP_TERMS = gp.translit.map((s, i) => ({ s, i })).sort((a, b) => b.s.length - a.s.length);
/** @param {string} plainWord */
function nativeGP(plainWord) {
  const s = plainWord.replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const out = [];
  for (let i = 0; i < s.length;) {
    if (s.startsWith("ING", i)) {
      out.push(21); i += 3; continue;
    }
    const matched = GP_TERMS.find(x => s.startsWith(x.s, i));
    assert.ok(matched, "cannot encode " + plainWord + " at " + i);
    out.push(matched.i);
    i += matched.s.length;
  }
  return out;
}
const lp1 = solved.split(/\r?\n/)
  .filter(line => line.trim() && !line.startsWith("#") && !line.startsWith("[") && !/^\d/.test(line))
  .join(" ").toUpperCase().match(/[A-Z]+/g).map(nativeGP);
assert.equal(lp1.length, 761);
const solvedEnds = endpoints(lp1);
assert.ok(solvedEnds[0] > 0.06 && solvedEnds[1] > 0.09);
const sourceLength2 = endpoints(originalArrays.filter(x => x.length === 2));
const nativeLength2 = endpoints(lp1.filter(x => x.length === 2));
assert.ok(sourceLength2.every(x => x < 0.04));
assert.ok(nativeLength2.every(x => x > 0.14));

const result = [];
for (const orientation of ["be", "le"]) {
  for (const decode of [true, false]) {
    const transformed = words.map(w => ({ page: w.page, digits: affine(w.digits, orientation, decode) }));
    for (let i = 0; i < words.length; i++) {
      const replay = affine(transformed[i].digits, orientation, !decode);
      assert.deepEqual(replay, words[i].digits);
    }
    const training = transformed.filter(w => w.page >= 16 && w.page <= 21).flatMap(w => w.digits);
    const holdout = transformed.filter(w => w.page >= 40 && w.page <= 53).flatMap(w => w.digits);
    const all = transformed.flatMap(w => w.digits);
    result.push({ orientation, decode, trainIoC: ioc(training),
      holdoutIoC: ioc(holdout), bookIoC: ioc(all),
      withinWordSamePairs: transformed.reduce((v, w) => v + equalPairs(w.digits), 0) });
  }
}
// Arbitrary global word-affine units and offsets preserve the less-significant
// endpoint's equality partition for every original length, by modular reduction.
for (const orientation of ["be", "le"]) {
  for (const a of [1n, 17n, 3301n]) for (const b of [0n, 23n]) {
    const output = originalArrays.map(w => affine(w, orientation, false, a, b));
    const before = orientation === "be" ? originalEnds[1] : originalEnds[0];
    const after = orientation === "be" ? endpoints(output)[1] : endpoints(output)[0];
    assert.ok(Math.abs(before - after) < 1e-13);
  }
}
// Actual solved-source native control in planted ciphertext, including all
// native word lengths: this tests complete invertibility, not authorship.
for (const orientation of ["be", "le"]) {
  for (const a of [17n, 3301n]) for (const b of [0n, 23n]) {
    const c = lp1.map(w => affine(w, orientation, false, a, b));
    for (let i = 0; i < lp1.length; i++) {
      assert.deepEqual(affine(c[i], orientation, true, a, b), lp1[i]);
    }
  }
}
console.log(JSON.stringify({sourceWords: words.length, sourceRunes: runeCount,
  sourceE: 811, sourceEndpointsIoC: originalEnds,
  sourceLength2EndpointsIoC: sourceLength2,
  solvedLP1Words: lp1.length, solvedLP1EndpointsIoC: solvedEnds,
  solvedLP1Length2EndpointsIoC: nativeLength2, result}, null, 2));
console.log("PASS: original 3301 word-number gates, native controls, all-secret endpoint invariant");
