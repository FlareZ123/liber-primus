"use strict";
/**
 * Complete original p54->p55 (10+76=86) two-stream 43x43 cipher attack.
 * All secret invertible 2x2 matrices over GF29 are checked SYMBOLICALLY:
 * original p55's 13-rune word imposes 11 A-output and two B-output equations.
 * Any proposed source-native 13-rune plaintext determines 4 secret matrix
 * entries from only 4 independent equations; remaining 9 are exact holdouts.
 * Exact native-GP lexicon from four pinned English source files (422 GP13 words).
 *
 * Test BOTH source-visible line-order and mirrored partner-pair order.
 * Exact original ciphertext, original printed word breaks, 10-rune p54 seam.
 * Two unknown-matrix native plaintext plants recover all 86 original-shaped
 * symbols and the precise hidden 2x2 matrix from a 13-rune word.
 *
 * Run: node sims/lp2_p54_p55_carry10_allsecret_gl2_word13_sft.cjs
 * Windows Node22, CommonJS built-ins, original inputs read-only.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = name => fs.readFileSync(path.join(root, name), "utf8");
const c = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcript = read("resources/lp2-transcription.txt").split("%");
const gpRune = new Map(c.runes.map((s, i) => [s, i]));
const mod = x => (x % 29 + 29) % 29;
const inv = x => { for (let i = 1; i < 29; i += 1) if (mod(i * x) === 1) return i; return 0; };
const nativeTokens = c.translit.map((s, i) => ({ s, i })).sort((a, b) => b.s.length - a.s.length);
/** Source-normal GP29 spelling, including authentic ING and IO handling. */
function nativeGP(word) {
  const s = word.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const out = [];
  for (let i = 0; i < s.length;) {
    if (s.startsWith("ING", i)) { out.push(21); i += 3; }
    else if (s.startsWith("IO", i)) { out.push(27); i += 2; }
    else {
      const t = nativeTokens.find(x => s.startsWith(x.s, i));
      assert.ok(t, "Unknown source native English token");
      out.push(t.i);
      i += t.s.length;
    }
  }
  return out;
}
assert.deepEqual(nativeGP("IN"), [10, 9]);
assert.deepEqual(nativeGP("THE"), [2, 18]);
assert.equal(nativeGP("CIRCUMSTANCES").length, 13);
const lex = new Map();
const sourceCounts = [];
for (const name of [
  "resources/control/shakespeare_first300k.txt",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/emerson_essays_2944.txt",
  "resources/control/english_wordfreq_textblob.txt"
]) {
  const words = read(name).match(/[A-Za-z]+/g) || [];
  for (const w of words) {
    const runes = nativeGP(w);
    if (runes.length === 13 && !lex.has(runes.join(","))) lex.set(runes.join(","), w);
  }
  sourceCounts.push({ file: name, words: words.length });
}
assert.equal(lex.size, 422);
/** Reconstruct original 76 and preceding 10 with preserved source hyphens. */
function pageWords(p) {
  const chunk = transcript[p < 50 ? p : p - 1];
  const arr = chunk.split(/[-.]/).map(part => Array.from(part,
    ch => gpRune.get(ch)).filter(x => x !== undefined)).filter(x => x.length);
  assert.deepEqual(arr.flat(), c.pages[p].indices);
  return arr;
}
const w54 = pageWords(54), w55 = pageWords(55);
const tail10 = w54.at(-1), p55 = w55.flat();
const widths = [1, 4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3];
assert.equal(tail10.length, 10);
assert.deepEqual(w55.map(x => x.length), widths);
const ip = [], ep = [];
let offset = 0;
for (const w of w55) {
  for (let j = 0; j < w.length; j += 1)
    (j > 0 && j < w.length - 1 ? ip : ep).push(offset + j);
  offset += w.length;
}
assert.equal(offset, 76);
assert.equal(ip.length, 43);
assert.equal(ep.length, 33);
const physicalInput = tail10.concat(p55);
assert.equal(physicalInput.length, 86);
/** Two 43-symbol tapes in original physical order. */
function splitTapes(full) {
  assert.equal(full.length, 86);
  return {
    a: ip.map(x => full[10 + x]),
    b: full.slice(0, 10).concat(ep.map(x => full[10 + x]))
  };
}
/** Reconstruct full contiguous 86-rune physical register. */
function combine(a, b) {
  assert.equal(a.length, 43);
  assert.equal(b.length, 43);
  const out = Array(86).fill(-1);
  for (let i = 0; i < 10; i += 1) out[i] = b[i];
  for (let i = 0; i < 33; i += 1) out[10 + ep[i]] = b[i + 10];
  for (let i = 0; i < 43; i += 1) out[10 + ip[i]] = a[i];
  assert.ok(out.every(x => x >= 0 && x < 29));
  return out;
}
assert.deepEqual(combine(...Object.values(splitTapes(physicalInput))), physicalInput);
/**
 * Fixed global matrix M mapping one 43-pair source stream to two GP29 runes.
 * If reversePartner, B is matched against A in reverse 43-position order.
 * @param {number[]} full Original-length contiguous 86-rune state
 * @param {number[]} key Four row-major entries [a,b,c,d]
 * @param {boolean} reversePartner Whether to pair B in mirror order
 */
function apply(full, key, reversePartner) {
  const { a, b } = splitTapes(full);
  const bp = reversePartner ? b.slice().reverse() : b;
  const aa = a.map((x, i) => mod(key[0] * x + key[1] * bp[i]));
  const bb = a.map((x, i) => mod(key[2] * x + key[3] * bp[i]));
  return combine(aa, reversePartner ? bb.reverse() : bb);
}
/** @param {number[]} key @returns {number[]} */
function matrixInverse(key) {
  const det = mod(key[0] * key[3] - key[1] * key[2]);
  assert.notEqual(det, 0);
  const d = inv(det);
  return [mod(key[3] * d), mod(-key[1] * d),
    mod(-key[2] * d), mod(key[0] * d)];
}
/**
 * At physical p55 position, identify which matrix row and source 43-pair.
 * @param {number[]} cipher full 86 rune source or synthetic cipher
 * @param {boolean} reversePartner
 */
function word13Equations(cipher, reversePartner) {
  const { a, b } = splitTapes(cipher);
  const bp = reversePartner ? b.slice().reverse() : b;
  return Array.from({ length: 13 }, (_, k) => {
    const physical = 23 + k;
    const inner = ip.indexOf(physical);
    const row = inner >= 0 ? 0 : 1;
    const i = inner >= 0 ? inner : 10 + ep.indexOf(physical);
    const pair = reversePartner && row ? 42 - i : i;
    assert.ok(pair >= 0 && pair < 43);
    return { row, x: a[pair], y: bp[pair], at: physical };
  });
}
/** Solve one row of a 2x2 matrix from first independent pair of constraints. */
function solveRow(equations) {
  for (let i = 0; i < equations.length; i += 1)
    for (let j = i + 1; j < equations.length; j += 1) {
      const p = equations[i], q = equations[j];
      const determinant = mod(p.x * q.y - p.y * q.x);
      if (!determinant) continue;
      const d = inv(determinant);
      return [mod(d * (p.z * q.y - p.y * q.z)),
        mod(d * (p.x * q.z - p.z * q.x))];
    }
  return null;
}
/**
 * For a specific native-GP13 whole-word candidate, determine ALL four unknown
 * coefficients from an exact two-by-two algebraic system, with nine holdouts.
 * @returns {null | number[]}
 */
function solveWord(cipher, word, reversePartner) {
  const equations = word13Equations(cipher, reversePartner)
    .map((p, i) => ({ ...p, z: word[i] }));
  const a = solveRow(equations.filter(x => x.row === 0));
  const b = solveRow(equations.filter(x => x.row === 1));
  if (!a || !b) return null;
  if (mod(a[0] * b[1] - a[1] * b[0]) === 0) return null;
  if (!equations.every(p => mod((p.row ? b : a)[0] * p.x +
    (p.row ? b : a)[1] * p.y) === p.z)) return null;
  return [...a, ...b];
}
/** All original lexicon candidates, with no key guessing or language scoring. */
function search(cipher, mirror) {
  const matches = [];
  for (const [g, word] of lex) {
    const key = solveWord(cipher, g.split(",").map(Number), mirror);
    if (key) matches.push({ word, matrix: key });
  }
  return matches;
}
const originalResults = [];
for (const mirror of [false, true]) {
  const matches = search(physicalInput, mirror);
  assert.equal(matches.length, 0);
  originalResults.push({
    pairing: mirror ? "source-reflected B tape" : "source-order B tape",
    native13WordTypes: lex.size,
    allInvertibleSecretMatricesTestedSymbolically: true,
    dictionaryMatchedOriginalWords: matches.length
  });
}
// Genuine native-GP original-sized plants, all 86 symbols, from independently
// known solved p57 and a distinct real thirteen-rune English dictionary word.
// Secret matrix [5,8;13,21] has determinant1 mod29 and is never handed to solver.
const secret = [5, 8, 13, 21];
assert.equal(mod(secret[0] * secret[3] - secret[1] * secret[2]), 1);
const native = c.pages[57].indices.slice(0, 86);
assert.equal(native.length, 86);
const positiveWord = nativeGP("CIRCUMSTANCES");
assert.equal(positiveWord.length, 13);
for (let j = 0; j < 13; j += 1) native[10 + 23 + j] = positiveWord[j];
const positives = [];
for (const mirror of [false, true]) {
  const encrypted = apply(native, matrixInverse(secret), mirror);
  const decoded = apply(encrypted, secret, mirror);
  assert.deepEqual(decoded, native);
  const recovered = solveWord(encrypted, positiveWord, mirror);
  assert.deepEqual(recovered, secret);
  const candidates = search(encrypted, mirror);
  assert.ok(candidates.some(x => x.word.toUpperCase() === "CIRCUMSTANCES" &&
    x.matrix.every((z, i) => z === secret[i])));
  const wrong = secret.slice();
  wrong[0] = mod(wrong[0] + 1);
  assert.notDeepEqual(apply(encrypted, wrong, mirror), native);
  positives.push({
    source: mirror ? "mirror" : "source-order",
    secretRecovered: recovered.join(","),
    nativeGPOriginal86Recovered: decoded.length,
    sourceWord13Recovered: "CIRCUMSTANCES",
    fullOriginalPositionRoundtrip: true
  });
}
console.log(JSON.stringify({
  result: "Complete original input key-recovery test: no known native-GP13 original word under either fixed 43-pair GL2(29) layout",
  source: { p54End: tail10.length, p55: p55.length,
    interior: ip.length, exterior: ep.length, totalOriginal: physicalInput.length,
    originalWord13: p55.slice(23, 36).map(i => c.translit[i]).join("-") },
  controlCorpora: sourceCounts,
  dictionaryGP13: lex.size,
  exhaustiveSecretInvertible2x2Matrices: 682080,
  original: originalResults,
  planted: positives,
  recoveredUnknownOriginalPlaintextRunes: 0,
  limits: "GP29, fixed invertible 2x2 matrix, source-order or one literal mirrored B partner stream, original 13-rune word preserved and in pinned native-English GP13 dictionary."
}, null, 2));