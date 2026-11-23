"use strict";
/**
 * Source-first bounded original-runic p0..p2 / p8 3-to-1 reader.
 * Real source lengths: LP2 p0+p1+p2 = 262+266+201=729=3*243.
 * The physically original p8 has red 4|8 + 243 body runes.
 * The source clue motivates one hypothesis: p8 body rune i supplies an
 * additive GP29 key to the three consecutive p0..p2 sibling runes
 * (3i,3i+1,3i+2). This is conjectural, not an author-specified opcode.
 *
 * Run on Windows 11 / Node 22:
 *   node sims/lp2_p0p2_p8_ternary_sibling_original_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const corpus = require("../resources/liber-primus/lp2-corpus.json");

const original = corpus.pages.filter(p => p.page <= 2).flatMap(p => p.indices);
const key = corpus.pages.find(p => p.page === 8).indices.slice(12);
assert.deepEqual(corpus.pages.slice(0, 3).map(p => p.indices.length), [262, 266, 201]);
assert.equal(corpus.pages.find(p => p.page === 8).indices.length, 255);
assert.equal(original.length, 729);
assert.equal(key.length, 243);
const mod = v => (v % 29 + 29) % 29;

/**
 * @param {number[]} cipher GP29 source ciphertext
 * @param {number[]} key243 exact original p8 black body
 * @param {1|-1} sign additive key orientation
 * @returns {number[]} GP29 plaintext
 */
function decode(cipher, key243, sign) {
  return cipher.map((c, i) => mod(c - sign * key243[Math.floor(i / 3)]));
}
/**
 * @param {number[]} plain GP29 plaintext
 * @param {number[]} key243 original p8 body
 * @param {1|-1} sign additive key orientation
 * @returns {number[]} GP29 ciphertext
 */
function encode(plain, key243, sign) {
  return plain.map((c, i) => mod(c + sign * key243[Math.floor(i / 3)]));
}
function ioc(text) {
  const freq = Array(29).fill(0);
  for (const v of text) freq[v]++;
  return freq.reduce((n, v) => n + v * (v - 1), 0) / (text.length * (text.length - 1));
}
function topFive(text) {
  const freq = Array(29).fill(0);
  for (const v of text) freq[v]++;
  return freq.sort((a, b) => b - a).slice(0, 5).reduce((a, b) => a + b, 0);
}
/** @param {string} s original native English witness @returns {number[]} GP29*/
function gpEncode(s) {
  const terms = corpus.translit.map((s, i) => ({ s, i })).sort((a, b) => b.s.length - a.s.length);
  const out = [];
  for (const raw of s.toUpperCase().match(/[A-Z]+/g) || []) {
    const word = raw.replace(/QU/g, "CW").replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
    for (let j = 0; j < word.length;) {
      if (word.startsWith("ING", j)) { out.push(21); j += 3; continue; }
      if (word.startsWith("IO", j)) { out.push(27); j += 2; continue; }
      const t = terms.find(e => word.startsWith(e.s, j));
      assert(t, "Missing native GP29 token " + word.slice(j));
      out.push(t.i);
      j += t.s.length;
    }
  }
  return out;
}

const native = [
  ["Shakespeare", "resources/control/shakespeare_first300k.txt"],
  ["Gibran", "resources/control/gibran_prophet_58585.txt"],
  ["Emerson", "resources/control/emerson_essays_2944.txt"]
].map(([name, file]) => {
  const text = gpEncode(fs.readFileSync(path.resolve(__dirname, "..", file), "utf8")).slice(0, original.length);
  assert.equal(text.length, original.length);
  for (const sign of [1, -1]) {
    const plant = encode(text, key, sign);
    assert.deepEqual(decode(plant, key, sign), text);
    assert.deepEqual(encode(decode(plant, key, sign), key, sign), plant);
  }
  return { name, plainIoC: ioc(text), topFive: topFive(text) };
});
const seedP57 = corpus.pages.find(p => p.page === 57).indices;
assert.equal(seedP57.length, 95);
for (const sign of [1, -1]) {
  const plant = Array.from({length:original.length},(_,j)=>seedP57[j%seedP57.length]);
  assert.deepEqual(decode(encode(plant,key,sign),key,sign),plant);
}
const originalResults = [1, -1].map(sign => {
  const plain = decode(original, key, sign);
  assert.deepEqual(encode(plain, key, sign), original);
  return {
    sign,
    originalIoC: ioc(plain),
    originalTopFive: topFive(plain),
    originalFirst120Runes: plain.slice(0, 120).map(x => corpus.translit[x]).join(" ")
  };
});
assert(native.every(n => n.plainIoC > 0.050));
assert(originalResults.every(r => r.originalIoC < 0.040));
console.log(JSON.stringify({
  premise: "source-exact p0..p2 729 = 3 x p8 black243",
  fixedModel: "C[3j+t] = P[3j+t] ± p8black[j] (mod29), t=0,1,2",
  authenticSourceLengths: [262, 266, 201, 243],
  nativePositiveControls: native,
  completeOriginalInverses: originalResults,
  decision: "Both frozen orientations fail native-GP prose; neither yields an original unknown-page key/plaintext. Source ratio alone does not select this hypothetical opcode."
}, null, 2));
console.log("PASS");
