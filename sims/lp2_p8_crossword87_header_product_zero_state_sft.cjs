"use strict";

/**
 * Original 2014 LP2 p7-p9 source register: red-heading product, complete
 * cross-page word, and the two valid ternary zero-splice candidates.
 *
 * Run on Windows 11 using Node.js 22. No dependencies or command-line flags.
 * This is a source-level test. It makes no plaintext-recovery claim.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..", "resources", "liber-primus");
const corpus = JSON.parse(fs.readFileSync(path.join(root, "lp2-corpus.json"), "utf8"));
const ink = JSON.parse(fs.readFileSync(path.join(root, "lp2-ink-annotations.json"), "utf8"));
const grid = JSON.parse(fs.readFileSync(path.join(root, "lp2-grid-256.json"), "utf8"));
const source = fs.readFileSync(path.join(root, "lp2-transcription.txt"), "utf8");
const pages = source.split("%");
const runeIds = new Map(corpus.runes.map((r, i) => [r, i]));
const runes = new Set(corpus.runes);

/** @param {number[]} a @returns {number} */
const product29 = a => a.reduce((v, x) => (v * x) % 29, 1);
/** @param {number[]} a @returns {number} */
const sum29 = a => a.reduce((v, x) => v + x, 0);
/** @param {string} a @returns {number[]} */
const indices = a => Array.from(a, x => runeIds.get(x));

/** @param {string} a @returns {string} */
function clean(a) { return a.replace(/[\/\s&$]/g, ""); }

/**
 * Original page-crossing words. Hyphens and periods terminate printed words.
 * Page references in the runeless p50 case are intentionally not inferred
 * from the percent-delimited transcription.
 * @returns {{boundary: number, left: string, right: string, word: string, values: number[]}[]}
 */
function crossingWords() {
  const out = [];
  for (let i = 0; i < pages.length - 1; i++) {
    const a = clean(pages[i]);
    const b = clean(pages[i + 1]);
    if (!runes.has(Array.from(a).at(-1)) || !runes.has(Array.from(b)[0])) continue;
    const left = Array.from(a.slice(a.search(/[^-.]*$/))).filter(c => runes.has(c)).join("");
    const right = Array.from(b.split(/[-.]/, 1)[0]).filter(c => runes.has(c)).join("");
    const word = left + right;
    out.push({ boundary: i, left, right, word, values: indices(word) });
  }
  return out;
}

const crossings = crossingWords();
assert.equal(crossings.length, 32);
const p8Cross = crossings.find(w => w.boundary === 8);
assert(p8Cross);
assert.equal(p8Cross.left, "ᛇ");
assert.equal(p8Cross.right, "ᚣᚹᚫᚷᛄ");
assert.deepEqual(p8Cross.values, [12, 26, 7, 25, 6, 11]);
assert.equal(sum29(p8Cross.values), 87);
assert.equal(sum29(p8Cross.values) % 29, 0);
assert.deepEqual(crossings.filter(w => sum29(w.values) % 29 === 0).map(w => w.boundary), [8]);
assert.equal(crossings.filter(w => w.values.length === 6).length, 5);

const p7 = corpus.pages[7].indices;
const p8 = corpus.pages[8].indices;
const p9 = corpus.pages[9].indices;
assert.equal(p7.length, 208);
assert.equal(p8.length, 255);
assert.equal(p9.slice(0, 5).join(","), "26,7,25,6,11");
const p8Ink = ink.pages.find(p => p.page === 8);
assert(p8Ink);
assert.deepEqual(p8Ink.red_spans.map(s => [s.start, s.length]), [[0, 12]]);
const red = p8.slice(0, 12);
assert.equal(red.length, 12);
assert.deepEqual(red, [14, 10, 14, 19, 1, 14, 19, 5, 2, 13, 3, 17]);
// The first complete p8 red word transliterates literally to "XIXM":
// Latin Roman XIX = nineteen, and the following GP29 rune M has index19.
// The X-I-X trigram is unique among all original p0-p55 rune streams.
// This offers a *human-visible* source of historical DH B=19 on p8 itself,
// independent of the previously used p6 singleton M19. It is a candidate
// author cue, not a proof of intended Roman-numeral decoding.
const sourceRoman19Register = {
  runeIndices: red.slice(0, 4),
  literalTransliteration: red.slice(0, 4).map(v => corpus.translit[v]).join(""),
  romanNumeral: "XIX",
  romanValue: 10 + (10 - 1),
  followingGPIndex: red[3],
};
assert.deepEqual(sourceRoman19Register.runeIndices, [14, 10, 14, 19]);
assert.equal(sourceRoman19Register.literalTransliteration, "XIXM");
assert.equal(sourceRoman19Register.romanValue, sourceRoman19Register.followingGPIndex);
const romanHits = [];
for (const p of corpus.pages.filter(p => p.page <= 55)) {
  for (let i = 0; i <= p.indices.length - 3; i++) {
    if ([14, 10, 14].every((v, j) => p.indices[i + j] === v)) {
      romanHits.push({ page: p.page, offset: i, followingIndex: p.indices[i + 3] });
    }
  }
}
assert.deepEqual(romanHits, [{ page: 8, offset: 0, followingIndex: 19 }]);
assert.equal(product29(red.slice(0, 4)), 4);
assert.equal(product29(red.slice(4)), 3);
assert.equal(product29(red), 12);
assert.equal(p8.at(-1), 12);
assert.equal(red.length, p8.at(-1));

// The seam also closes on the primitive 3-4-5 integer right triangle.
// These operands are literal source-word products, not fitted keys.
const redLegA = product29(red.slice(0, 4));
const redLegB = product29(red.slice(4));
const blackHypotenuse = product29(p9.slice(0, 5));
assert.deepEqual([redLegA, redLegB, blackHypotenuse], [4, 3, 5]);
assert.equal(redLegA * redLegA + redLegB * redLegB, blackHypotenuse * blackHypotenuse);
assert.equal(redLegA + redLegB + blackHypotenuse, red.length);
assert.equal((redLegA * redLegB) / 2, p8Cross.values.length);


// A simpler recoverable historic DH23 parameter route that does NOT require
// fitting the p7 five-dot Shamir/quartic interpolation (already documented).
// p6's one-rune red word is the literal second word M=19; p7's opening
// red two-rune word itself contains the field modulus23 and e=3.
// The newly identified 3-4-5 seam supplies BOTH g=5 and area a=6.
const p6 = corpus.pages[6].indices;
const p6Red = p6.slice(71, 82);
assert.deepEqual(p6Red, [24, 16, 14, 17, 19, 6, 27, 15, 17, 14, 12]);
const redIsolatedB = p6Red[4];
assert.equal(redIsolatedB, 19);
const originalDHWithoutInterpolation = {
  p: p7.slice(-14)[0],
  g: blackHypotenuse,
  a: (redLegA * redLegB) / 2,
  b: product29([14, 28]),
  A: product29([5, 7, 11]),
  B: redIsolatedB,
  K: product29([6, 28, 19]),
  e: product29(red.slice(4)),
  q: product29(red.slice(0, 4)),
};
assert.deepEqual(originalDHWithoutInterpolation,
  { p: 23, g: 5, a: 6, b: 15, A: 8, B: 19, K: 2, e: 3, q: 4 });
assert.equal(sourceRoman19Register.romanValue, originalDHWithoutInterpolation.B);
assert.equal(sourceRoman19Register.followingGPIndex, originalDHWithoutInterpolation.B);
assert.equal(p7.slice(-14)[1], originalDHWithoutInterpolation.e);
assert.equal(p7.slice(-14)[6], originalDHWithoutInterpolation.g);
const dh = originalDHWithoutInterpolation;
/** @param {number} base @param {number} power @param {number} modulus @returns {number} */
function powMod(base, power, modulus) {
  let value = 1;
  for (let i = 0; i < power; i++) value = value * base % modulus;
  return value;
}
assert.equal(powMod(dh.g, dh.a, dh.p), dh.A);
assert.equal(powMod(dh.g, dh.b, dh.p), dh.B);
assert.equal(powMod(dh.A, dh.b, dh.p), dh.K);
assert.equal(powMod(dh.B, dh.a, dh.p), dh.K);
assert.equal(powMod(dh.K, 2, dh.p), dh.q);

const startHeadingControls = [];
for (const p of ink.pages) {
  if (p.page > 55) continue;
  const spans = (p.red_spans || []).slice().sort((a, b) => a.start - b.start);
  if (!spans.length || spans[0].start !== 0) continue;
  let len = 0;
  for (const s of spans) {
    if (s.start !== len) break;
    len += s.length;
  }
  const values = corpus.pages[p.page].indices;
  startHeadingControls.push({
    page: p.page,
    headingRunes: len,
    headingProduct29: product29(values.slice(0, len)),
    lastRune29: values.at(-1),
  });
}
assert.equal(startHeadingControls.length, 9);
assert.deepEqual(startHeadingControls.filter(x =>
  x.headingProduct29 === x.lastRune29 &&
  x.headingRunes === x.lastRune29).map(x => x.page), [8]);

const redWords = [[23, 3], [22, 16, 2, 25], [5, 7, 11], [14, 28], [6, 28, 19]];
assert.deepEqual(p7.slice(-14), redWords.flat());
const product = redWords.map(product29);
assert.deepEqual(product, [11, 26, 8, 15, 2]);
const taps = product.map(v => v % 3);
assert.deepEqual(taps, [2, 2, 2, 0, 2]);

const sequence = [];
let state = taps.slice();
for (let i = 0; i < 242; i++) {
  sequence.push(state[0]);
  state = state.slice(1).concat([taps.reduce((v, t, j) => v + t * state[j], 0) % 3]);
}
assert.deepEqual(state, taps);
const splicePositions = [];
for (let i = 0; i < 242; i++) {
  if ([0, 1, 2, 3].every(j => sequence[(i + j) % 242] === 0)) {
    splicePositions.push((i + 4) % 242);
  }
}
assert.deepEqual(splicePositions, [87, 208]);

/** @param {number} splice @returns {{unique: number, zeroIndex: number, carriedAddress: number}} */
function addressRegister(splice) {
  const trits = [...sequence.slice(0, splice), 0, ...sequence.slice(splice)];
  const addresses = trits.map((_, i) =>
    Array.from({ length: 5 }, (_, j) => trits[(i + j) % 243])
      .reduce((v, t) => v * 3 + t, 0));
  return {
    unique: new Set(addresses).size,
    zeroIndex: addresses.indexOf(0),
    carriedAddress: addresses[242],
  };
}
const registers = splicePositions.map(s => ({ splice: s, ...addressRegister(s) }));
assert.deepEqual(registers, [
  { splice: 87, unique: 243, zeroIndex: 83, carriedAddress: 78 },
  { splice: 208, unique: 243, zeroIndex: 204, carriedAddress: 78 },
]);

const punctuation = { stopOffsets: [], wordBoundaryOffsets: [] };
let offset = 0;
for (const ch of pages[8]) {
  if (runes.has(ch)) offset++;
  else if (offset > 12 && offset < 255) {
    if (ch === ".") punctuation.stopOffsets.push(offset - 12);
    if (ch === "-") punctuation.wordBoundaryOffsets.push(offset - 12);
  }
}
assert.equal(offset, 255);
assert.deepEqual(punctuation.stopOffsets, [28, 122, 208]);
assert(punctuation.wordBoundaryOffsets.includes(87));
assert(!punctuation.stopOffsets.includes(87));


// Triangle product3*4*5=60 selects the UNIQUE twice-peeled 60-cell
// clockwise perimeter of the 32x8 table, but does not authenticate
// using its byte values as a GP29 additive running key.
const tableBytes = grid.pages.flatMap(p => p.bytes);
assert.equal(tableBytes.length, 256);
const inner60 = [];
for (let c = 2; c <= 5; c++) inner60.push(2 * 8 + c);
for (let r = 3; r <= 29; r++) inner60.push(r * 8 + 5);
for (let c = 4; c >= 2; c--) inner60.push(29 * 8 + c);
for (let r = 28; r >= 3; r--) inner60.push(r * 8 + 2);
assert.equal(inner60.length, 60);
assert.equal(new Set(inner60).size, 60);
assert.equal(redLegA * redLegB * blackHypotenuse, inner60.length);
const originalCiphertext = corpus.pages.slice(9, 15).flatMap(p => p.indices);
const p13Start = corpus.pages.slice(9, 13).reduce((s, p) => s + p.indices.length, 0);
assert.equal(originalCiphertext.length, 1474);
assert.equal(p13Start, 1065);
const phase = sum29(p8Cross.values) % inner60.length;
assert.equal(phase, 27);
/** @param {number[]} values @returns {number} */
function indexOfCoincidence(values) {
  const counts = Array(29).fill(0);
  for (const v of values) counts[v]++;
  return counts.reduce((n, c) => n + c * (c - 1), 0) / (values.length * (values.length - 1));
}
/** @param {number[]} values @param {number} sign @returns {number[]} */
function ringTranslate(values, sign) {
  return values.map((v, i) => ((v + sign * (tableBytes[inner60[(i + phase) % 60]] % 29)) % 29 + 29) % 29);
}
const terminalKnown = corpus.pages[57].indices;

// The primitive 3-4-5 triangle determines a unit-determinant GF29
// orthogonal 2x2 operator: (1/5) * [a,-b;b,a] with 1/5=6 mod29.
// Test both physical leg orders and rotation directions, with the exact
// carried p8 rune as the first original ciphertext pair member. Printed
// whole-word resets are an independently source-visible clock alternative.
const carriedCiphertext = [p8.at(-1), ...originalCiphertext];
assert.equal(carriedCiphertext.length, 1475);
const p8SuffixText = pages[8].slice(pages[8].lastIndexOf("ᛇ"));
const printedText = p8SuffixText + pages.slice(9, 15).join("");
const physicalWords = [];
let currentWord = [];
for (const ch of printedText) {
  if (runeIds.has(ch)) currentWord.push(runeIds.get(ch));
  else if (ch === "-" || ch === "." || ch === "&" || ch === "$") {
    if (currentWord.length) physicalWords.push(currentWord);
    currentWord = [];
  }
}
if (currentWord.length) physicalWords.push(currentWord);
assert.equal(physicalWords.length, 333);
assert.deepEqual(physicalWords[0], p8Cross.values);
assert.deepEqual(physicalWords.flat(), carriedCiphertext);

/** @param {number[]} values @param {number} a @param {number} b @param {number} direction @returns {number[]} */
function rotateGP29(values, a, b, direction) {
  const out = values.slice();
  const aa = (6 * a) % 29;
  const bb = (6 * direction * b + 29) % 29;
  for (let i = 0; i + 1 < values.length; i += 2) {
    out[i] = ((aa * values[i] - bb * values[i + 1]) % 29 + 29) % 29;
    out[i + 1] = ((bb * values[i] + aa * values[i + 1]) % 29 + 29) % 29;
  }
  return out;
}
const pairRotations = [];
const p13FromCarried = 1 + p13Start;
for (const [a, b] of [[3, 4], [4, 3]]) {
  assert.equal(a * a + b * b, 25);
  for (const dir of [-1, 1]) {
    for (const reset of ["continuous", "printed-words"]) {
      const frames = reset === "continuous" ? [carriedCiphertext] : physicalWords;
      const outputFrames = frames.map(w => rotateGP29(w, a, b, dir));
      const decrypted = outputFrames.flat();
      const recovered = outputFrames.map(w => rotateGP29(w, a, b, -dir)).flat();
      assert.deepEqual(recovered, carriedCiphertext);
      const solvedFrame = terminalKnown;
      assert.deepEqual(rotateGP29(rotateGP29(solvedFrame, a, b, dir), a, b, -dir), solvedFrame);
      pairRotations.push({
        a, b, direction: dir, reset,
        fullIoC: indexOfCoincidence(decrypted),
        untouchedP13IoC: indexOfCoincidence(decrypted.slice(p13FromCarried, p13FromCarried + 200)),
        firstWordGP: decrypted.slice(0, 6).map(v => corpus.translit[v]).join(" "),
        replayedOriginalRunes: recovered.length,
        plantedSolvedRunes: solvedFrame.length,
      });
    }
  }
}
assert.equal(pairRotations.length, 8);
assert(pairRotations.every(x => x.fullIoC < 0.036));

const sourcePackets = [
  { scope: "after-first-red4-to-complete-crossword", values: p8.slice(4).concat(corpus.pages[9].indices.slice(0, 5)) },
  { scope: "after-full-red12-to-complete-crossword", values: p8.slice(12).concat(corpus.pages[9].indices.slice(0, 5)) },
];
assert.deepEqual(sourcePackets.map(x => x.values.length), [256, 248]);
const sourcePacketRotations = [];
for (const packet of sourcePackets) {
  for (const [a, b] of [[3, 4], [4, 3]]) {
    for (const dir of [-1, 1]) {
      const decoded = rotateGP29(packet.values, a, b, dir);
      assert.deepEqual(rotateGP29(decoded, a, b, -dir), packet.values);
      sourcePacketRotations.push({
        scope: packet.scope, a, b, direction: dir,
        rawIoC: indexOfCoincidence(packet.values),
        outputIoC: indexOfCoincidence(decoded),
        firstFortyGP: decoded.slice(0, 40).map(v => corpus.translit[v]).join(" "),
        originalReplayedRunes: decoded.length,
      });
    }
  }
}
assert.equal(sourcePacketRotations.length, 8);
assert(sourcePacketRotations.every(x => x.outputIoC < 0.036));


// A non-linear, explicitly source-keyed GF(3^5) DH action. The p7 primitive
// recurrence fixes a monic degree-five irreducible polynomial over F3 and
// the fourth red word supplies b=15. Since gcd(15,242)=1, s -> s^15 is a
// bijection of all 243 field elements (0 maps to 0). This is a genuine
// state-ADDRESS permutation, unlike the earlier GP29 scalar exponent masks.
// The GP29 output equation remains a candidate, not an author instruction.
/** @param {number} x @param {number} y @returns {number} */
function mulGF243(x, y) {
  const aa = [], bb = [], coeff = Array(9).fill(0);
  for (let j = 0; j < 5; j++) {
    aa.push(x % 3); bb.push(y % 3);
    x = Math.floor(x / 3); y = Math.floor(y / 3);
  }
  for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) {
    coeff[i + j] += aa[i] * bb[j];
  }
  for (let k = 8; k >= 5; k--) {
    const x = coeff[k] % 3;
    for (let j = 0; j < 5; j++) coeff[k - 5 + j] += x * taps[j];
  }
  return coeff.slice(0, 5).reduceRight((v, digit) => v * 3 + digit % 3, 0);
}
/** @param {number} x @param {number} power @returns {number} */
function powGF243(x, power) {
  let out = 1;
  while (power) {
    if (power % 2) out = mulGF243(out, x);
    x = mulGF243(x, x);
    power = Math.floor(power / 2);
  }
  return out;
}
const states87 = [...sequence.slice(0, 87), 0, ...sequence.slice(87)]
  .map((_, i, a) => Array.from({ length: 5 }, (_, j) => a[(i + j) % 243])
    .reduce((v, t) => 3 * v + t, 0));
assert.equal(new Set(states87).size, 243);
const blackOriginal = p8.slice(12);
assert.equal(blackOriginal.length, 243);
const tableGF3 = Array(243);
for (let i = 0; i < 243; i++) tableGF3[states87[i]] = blackOriginal[i];
assert(tableGF3.every(v => Number.isInteger(v)));
const sourceExponent = originalDHWithoutInterpolation.b;
assert.equal(sourceExponent, 15);
const exponent15GF3Table = Array.from({ length: 243 }, (_, v) => powGF243(v, sourceExponent));
assert.equal(new Set(exponent15GF3Table).size, 243);
assert(exponent15GF3Table.every((v, i) => powGF243(v, 113) === i));
assert.equal(powGF243(3, 242), 1); // x (polynomial basis) is primitive
const nonlinearGF3KeyCycle = states87.map(st => tableGF3[exponent15GF3Table[st]]);
assert.equal(nonlinearGF3KeyCycle.length, 243);
assert.deepEqual([...nonlinearGF3KeyCycle].sort((a, b) => a - b),
  [...blackOriginal].sort((a, b) => a - b));
/** @param {number[]} values @param {number} sign @returns {number[]} */
function applyGF3Table(values, sign) {
  return values.map((v, i) => ((v + sign * nonlinearGF3KeyCycle[i % 243]) % 29 + 29) % 29);
}
const nonlinearGF3TableResults = [];
for (const sign of [-1, 1]) {
  const decrypted = applyGF3Table(originalCiphertext, sign);
  assert.deepEqual(applyGF3Table(decrypted, -sign), originalCiphertext);
  assert.deepEqual(applyGF3Table(applyGF3Table(terminalKnown, -sign), sign), terminalKnown);
  nonlinearGF3TableResults.push({
    sign, sourceGF3Exponent: sourceExponent,
    fullIoC: indexOfCoincidence(decrypted),
    untouchedP13IoC: indexOfCoincidence(decrypted.slice(p13Start, p13Start + 200)),
    firstFortyGP: decrypted.slice(0, 40).map(v => corpus.translit[v]).join(" "),
    reencryptionRunes: decrypted.length,
    plantedSolvedRunes: terminalKnown.length,
  });
}
assert(nonlinearGF3TableResults.every(x => x.fullIoC < 0.036));


// The same authentic 3-4-5 values and original bare TREE illustration admit
// a completely independent 3^5 combinatorial route: the classical 1934
// Berggren/Barning/Hall rooted TERNARY tree of primitive Pythagorean triples.
// Its standard left-to-right U,A,D child maps yield exactly243 depth-five
// triples, matching original p8's *complete* black body (including carry).
// The p8 red 8-word even-position values 5,13,17 equal the root hypotenuse
// and the two nonmiddle first-child hypotenuses. The missing middle child's
// hypotenuse is 29 (the GP alphabet modulus), but the correspondence is
// retrospective and does not specify the authored decryption equation.
/** @param {number[]} t @returns {number[]} */
function upBerggren(t) {
  const [a, b, h] = t;
  return [a - 2 * b + 2 * h, 2 * a - b + 2 * h, 2 * a - 2 * b + 3 * h];
}
/** @param {number[]} t @returns {number[]} */
function alongBerggren(t) {
  const [a, b, h] = t;
  return [a + 2 * b + 2 * h, 2 * a + b + 2 * h, 2 * a + 2 * b + 3 * h];
}
/** @param {number[]} t @returns {number[]} */
function downBerggren(t) {
  const [a, b, h] = t;
  return [-a + 2 * b + 2 * h, -2 * a + b + 2 * h, -2 * a + 2 * b + 3 * h];
}
const berggrenRoot = [redLegB, redLegA, blackHypotenuse];
assert.deepEqual(berggrenRoot, [3, 4, 5]);
const berggrenFirstChildren = [upBerggren(berggrenRoot),
  alongBerggren(berggrenRoot), downBerggren(berggrenRoot)];
assert.deepEqual(berggrenFirstChildren, [
  [5, 12, 13], [21, 20, 29], [15, 8, 17],
]);
assert.deepEqual(red.filter((v, i) => i >= 4 && i % 2 === 1), [14, 5, 13, 17]);
assert.deepEqual(red.filter((v, i) => i >= 6 && i % 2 === 1), [5, 13, 17]);
const originalRedCountOnP7 = redWords.length;
assert.equal(originalRedCountOnP7, 5);
let berggrenDepth5 = [berggrenRoot];
for (let layer = 0; layer < originalRedCountOnP7; layer++) {
  berggrenDepth5 = berggrenDepth5.flatMap(t =>
    [upBerggren(t), alongBerggren(t), downBerggren(t)]);
}
assert.equal(berggrenDepth5.length, 243);
assert.equal(new Set(berggrenDepth5.map(t => t.join(","))).size, 243);
assert(berggrenDepth5.every(([a, b, h]) =>
  a > 0 && b > 0 && h > 0 && a * a + b * b === h * h));
const rootPerimeter = berggrenRoot.reduce((n, v) => n + v, 0);
assert.equal(rootPerimeter, red.length);
assert.equal(rootPerimeter, p8.at(-1));
const berggrenTreeConsumers = [];
for (const [keyLabel, keyValues] of [
  ["hypotenuse", berggrenDepth5.map(t => t[2] % 29)],
  ["perimeter", berggrenDepth5.map(t => t.reduce((n, v) => n + v, 0) % 29)],
]) {
  for (const [scope, sourceText] of [["p8-black243", blackOriginal], ["p9-p14", originalCiphertext]]) {
    for (const sign of [-1, 1]) {
      const out = sourceText.map((v, i) =>
        ((v + sign * keyValues[i % 243]) % 29 + 29) % 29);
      const replay = out.map((v, i) =>
        ((v - sign * keyValues[i % 243]) % 29 + 29) % 29);
      assert.deepEqual(replay, sourceText);
      const solvedPlant = terminalKnown.map((v, i) =>
        ((v - sign * keyValues[i % 243]) % 29 + 29) % 29);
      assert.deepEqual(solvedPlant.map((v, i) =>
        ((v + sign * keyValues[i % 243]) % 29 + 29) % 29), terminalKnown);
      berggrenTreeConsumers.push({
        key: keyLabel, scope, sign,
        originalIoC: indexOfCoincidence(sourceText),
        recoveredIoC: indexOfCoincidence(out),
        firstFortyGP: out.slice(0, 40).map(v => corpus.translit[v]).join(" "),
        reencryptionRunes: replay.length, plantedSolvedRunes: terminalKnown.length,
      });
    }
  }
}
assert.equal(berggrenTreeConsumers.length, 8);
assert(berggrenTreeConsumers.every(x => x.recoveredIoC < 0.037));
const hyp29 = berggrenDepth5.map(t => t[2] % 29);
assert.equal(hyp29.filter(v => v === 0).length, 15);
assert.equal(blackOriginal.filter(v => v === 0).length, 8);
const directHypMatching = blackOriginal.filter((v, i) => v === hyp29[i]).length;
assert.equal(directHypMatching, 11);


// Another bounded original-output law that actually READS branch decisions
// from the preceding five source runes (rather than merely replaying the
// 243-leaf key tape): GP29 ordinal mod3 selects U/A/D; the resulting leaf
// hypotenuse or perimeter gives the GP29 transformation. Both already-visible
// ciphertext and just-recovered plaintext clocks are independently reversible.
/** @param {number[]} a @param {number} sign @param {number[]} keys
 *  @param {boolean} plainFeedback @returns {number[]} */
function decodeBerggrenFeedback(a, sign, keys, plainFeedback) {
  const history = p8.slice(-5);
  const out = [];
  for (const c of a) {
    const addr = history.slice(-5).reduce((v, x) => 3 * v + x % 3, 0);
    const p = ((c + sign * keys[addr]) % 29 + 29) % 29;
    out.push(p);
    history.push(plainFeedback ? p : c);
  }
  return out;
}
/** @param {number[]} a @param {number} sign @param {number[]} keys
 *  @param {boolean} plainFeedback @returns {number[]} */
function encodeBerggrenFeedback(a, sign, keys, plainFeedback) {
  const history = p8.slice(-5);
  const out = [];
  for (const p of a) {
    const addr = history.slice(-5).reduce((v, x) => 3 * v + x % 3, 0);
    const c = ((p - sign * keys[addr]) % 29 + 29) % 29;
    out.push(c);
    history.push(plainFeedback ? p : c);
  }
  return out;
}
const berggrenFiveBranchFeedback = [];
for (const [statistic, leafKeys] of [
  ["hypotenuse", berggrenDepth5.map(t => t[2] % 29)],
  ["perimeter", berggrenDepth5.map(t => t.reduce((n, v) => n + v, 0) % 29)],
]) {
  for (const feedback of [false, true]) {
    for (const sign of [-1, 1]) {
      const originalDecoded = decodeBerggrenFeedback(originalCiphertext, sign, leafKeys, feedback);
      assert.deepEqual(encodeBerggrenFeedback(originalDecoded, sign, leafKeys, feedback), originalCiphertext);
      const originalSolvedPlant = encodeBerggrenFeedback(terminalKnown, sign, leafKeys, feedback);
      assert.deepEqual(decodeBerggrenFeedback(originalSolvedPlant, sign, leafKeys, feedback), terminalKnown);
      berggrenFiveBranchFeedback.push({
        statistic, feedback: feedback ? "plaintext" : "ciphertext", sign,
        fullIoC: indexOfCoincidence(originalDecoded),
        p13First200IoC: indexOfCoincidence(originalDecoded.slice(p13Start, p13Start + 200)),
        firstFortyGP: originalDecoded.slice(0, 40).map(v => corpus.translit[v]).join(" "),
        originalReplayRunes: originalDecoded.length, solvedPositiveRunes: terminalKnown.length,
      });
    }
  }
}
assert.equal(berggrenFiveBranchFeedback.length, 8);
assert(berggrenFiveBranchFeedback.every(x => x.fullIoC < 0.036));


// LP1 explicitly says "THE TOTIENT FUNCTION IS SACRED", and p56 really
// uses a plaintext-F-transparent totient clock. This makes Euler phi of
// Berggren leaf hypotenuses/perimeters a stronger *typed* first-party rule
// than choosing arbitrary modular coefficients. The DP below tests EXACT
// true transparent F semantics (F plaintext consumes no key), allowing
// ambiguous ciphertext F to mean either literal F or encoded non-F.
// Testing every initial phase avoids rescuing with an unprinted page key.
/** @param {number} n @returns {number} */
function eulerPhi(n) {
  let out = n, rem = n;
  for (let p = 2; p * p <= rem; p++) {
    if (rem % p) continue;
    while (rem % p === 0) rem /= p;
    out = out / p * (p - 1);
  }
  if (rem > 1) out = out / rem * (rem - 1);
  return out;
}
/** @param {number[]} ciphertext @param {number[]} key @param {number} sign
 *  @param {boolean} anyInitialPhase @returns {{reached: number, survivors: number}} */
function transparentTotientDP(ciphertext, key, sign, anyInitialPhase) {
  let phases = new Set(anyInitialPhase
    ? Array.from({ length: 243 }, (_, i) => i) : [0]);
  for (let i = 0; i < ciphertext.length; i++) {
    const c = ciphertext[i], next = new Set();
    for (const phase of phases) {
      // LP1/p56 transparency: plaintext F0 maps to ciphertext F0, and
      // must not consume the next key value.
      if (c === 0) next.add(phase);
      // Conversely encoded ordinary (non-F) plaintext always consumes it.
      const p = ((c + sign * key[phase]) % 29 + 29) % 29;
      if (p !== 0) next.add((phase + 1) % 243);
    }
    phases = next;
    if (phases.size === 0) return { reached: i, survivors: 0 };
  }
  return { reached: ciphertext.length, survivors: phases.size };
}
/** @param {number[]} plaintext @param {number[]} key @param {number} sign
 *  @returns {number[]} */
function plantTransparentTotient(plaintext, key, sign) {
  let phase = 0;
  return plaintext.map(p => {
    if (p === 0) return 0;
    const c = ((p - sign * key[phase]) % 29 + 29) % 29;
    phase = (phase + 1) % 243;
    return c;
  });
}
const berggrenTotientTransparentDP = [];
for (const [statistic, key] of [
  ["phi(hypotenuse)", berggrenDepth5.map(t => eulerPhi(t[2]) % 29)],
  ["phi(perimeter)", berggrenDepth5.map(t => eulerPhi(t.reduce((n, v) => n + v, 0)) % 29)],
]) {
  assert.equal(key.length, 243);
  assert.equal(new Set(key).size, 29);
  for (const sign of [-1, 1]) {
    const sourcePhase0 = transparentTotientDP(originalCiphertext, key, sign, false);
    const sourceAnyPhase = transparentTotientDP(originalCiphertext, key, sign, true);
    const planted = plantTransparentTotient(terminalKnown, key, sign);
    const positive = transparentTotientDP(planted, key, sign, false);
    assert.equal(positive.reached, terminalKnown.length);
    assert(positive.survivors > 0);
    berggrenTotientTransparentDP.push({
      statistic, sign, originalPhase0: sourcePhase0,
      originalAnyPhase: sourceAnyPhase,
      solvedPositive: positive,
    });
  }
}
assert.deepEqual(berggrenTotientTransparentDP.map(x => x.originalPhase0.reached), [7, 119, 183, 7]);
assert.deepEqual(berggrenTotientTransparentDP.map(x => x.originalAnyPhase.reached), [306, 285, 393, 303]);
assert(berggrenTotientTransparentDP.every(x => x.originalAnyPhase.survivors === 0));

const ringReceivers = [];
for (const sign of [-1, 1]) {
  const candidate = ringTranslate(originalCiphertext, sign);
  assert.deepEqual(ringTranslate(candidate, -sign), originalCiphertext);
  const planted = ringTranslate(terminalKnown, -sign);
  assert.deepEqual(ringTranslate(planted, sign), terminalKnown);
  ringReceivers.push({
    inverseSign: sign,
    fullIoC: indexOfCoincidence(candidate),
    untouchedP13IoC: indexOfCoincidence(candidate.slice(p13Start, p13Start + 200)),
    firstFortyGP: candidate.slice(0, 40).map(v => corpus.translit[v]).join(" "),
    reencryptionRunes: candidate.length,
    plantedSolvedRunes: terminalKnown.length,
  });
}
assert(ringReceivers.every(x => x.fullIoC < 0.036));


// A separate physically exact cross-page channel: p7 has precisely194
// original black runes before its final14 red runes. P8's authentic243
// black glyphs are divided by their ORIGINAL printed punctuation into
// 49 page-local word fragments (last fragment is the carried singleton).
// Thus the next page has 243-49=194 INTRA-word successor slots. These
// can be aligned to p7's black194 without using any unknown plaintext.
// This is an original-source count equality; it does not authenticate
// a cipher or authorize moving five continuation runes from p9.
let p8RuneOffset = 0, p8PrintedBlack = "";
for (const ch of pages[8]) {
  if (runes.has(ch)) {
    if (p8RuneOffset >= 12) p8PrintedBlack += ch;
    p8RuneOffset++;
  } else if (p8RuneOffset >= 12) p8PrintedBlack += ch;
}
assert.equal(p8RuneOffset, 255);
const blackFragments = p8PrintedBlack.split(/[-.]/)
  .map(fragment => Array.from(fragment).filter(c => runes.has(c))
    .map(c => runeIds.get(c)))
  .filter(fragment => fragment.length > 0);
assert.equal(blackFragments.length, 49);
assert.deepEqual(blackFragments.flat(), blackOriginal);
assert.deepEqual(blackFragments.at(-1), [12]);
const p7BlackToP8WordDifferential = {
  p7BlackPrefix: p7.slice(0, 194),
  p8BlackWordFragments: blackFragments,
  inWordSteps: blackFragments.reduce((n, w) => n + w.length - 1, 0),
};
assert.equal(p7BlackToP8WordDifferential.p7BlackPrefix.length, 194);
assert.equal(p7BlackToP8WordDifferential.inWordSteps, 194);
const wordDifferentialTests = [];
/** @param {number} n @returns {number} */
const modGP = n => ((n % 29) + 29) % 29;
/** @param {number[][]} words @param {string} law @param {number} sign
 * @param {boolean} isEncode @returns {number[][]} */
function wordDifferential(words, law, sign, isEncode) {
  let offset = 0;
  return words.map(word => {
    if (!word.length) return [];
    const out = [word[0]];
    for (let i = 1; i < word.length; i++) {
      const k = p7BlackToP8WordDifferential.p7BlackPrefix[offset++];
      const prevCipher = isEncode ? out[i - 1] : word[i - 1];
      if (law === "pad") out.push(modGP(word[i] + (isEncode ? -sign : sign) * k));
      if (law === "difference") out.push(isEncode
        ? modGP(word[i] + prevCipher - sign * k)
        : modGP(word[i] - prevCipher + sign * k));
      if (law === "sum") out.push(isEncode
        ? modGP(word[i] - prevCipher - sign * k)
        : modGP(word[i] + prevCipher + sign * k));
    }
    return out;
  });
}
for (const law of ["pad", "difference", "sum"]) {
  for (const sign of [-1, 1]) {
    const recovered = wordDifferential(blackFragments, law, sign, false);
    assert.deepEqual(wordDifferential(recovered, law, sign, true), blackFragments);
    const output = recovered.flat();
    assert.equal(output.length, 243);
    const inside = recovered.flatMap(w => w.slice(1));
    assert.equal(inside.length, 194);
    wordDifferentialTests.push({
      law, sign, originalIoc: indexOfCoincidence(blackOriginal),
      recoveredIoc: indexOfCoincidence(output),
      internalIoc: indexOfCoincidence(inside),
      firstWords: recovered.slice(0, 12).map(w => w.map(v => corpus.translit[v]).join("")).join(" "),
      originalReplayedRunes: output.length,
    });
  }
}
assert.equal(wordDifferentialTests.length, 6);
assert(wordDifferentialTests.every(x => x.recoveredIoc < 0.036));

console.log(JSON.stringify({
  source: "Original p7-p9 GP29 corpus, ink spans, and physical text",
  page8: {
    redWordsProducts29: [product29(red.slice(0, 4)), product29(red.slice(4))],
    redHeadingLength: red.length,
    redHeadingProduct29: product29(red),
    blackRuneCount: p8.length - red.length,
    pageFinalRune29: p8.at(-1),
    crossingWord: p8Cross.word,
    crossingIndices: p8Cross.values,
    crossingSum: sum29(p8Cross.values),
    triangleLegsAndHypotenuse: [redLegA, redLegB, blackHypotenuse],
    trianglePerimeter: redLegA + redLegB + blackHypotenuse,
    triangleArea: (redLegA * redLegB) / 2,
  },
  originalCrossingWords: {
    total: crossings.length,
    sum0mod29Boundaries: crossings.filter(w => sum29(w.values) % 29 === 0).map(w => w.boundary),
    lengthSixCount: crossings.filter(w => w.values.length === 6).length,
  },
  headingControls: startHeadingControls,
  sourceRedRomanXIXM: sourceRoman19Register,
  sourceRomanXIXOriginalOccurrences: romanHits,
  p7RedProducts29: product,
  directHistoricalDH23WithoutFiveDotInterpolation: originalDHWithoutInterpolation,
  p7PrimitiveTaps3: taps,
  splicePositions,
  registers,
  originalBlackPunctuation: punctuation.stopOffsets.concat([]),
  wordBoundary87: punctuation.wordBoundaryOffsets.includes(87),
  candidateRadix60Perimeter: { length: inner60.length, phase, rawIoC: indexOfCoincidence(originalCiphertext), receiverTests: ringReceivers },
  pythagoreanOriginalGP29PairRotations: pairRotations,
  pythagoreanOriginalP8SourcePacketRotations: sourcePacketRotations,
  sourceSelectedGF243DHExponent15Table: nonlinearGF3TableResults,
  exactP7Black194ToP8Black49WordInterior194: wordDifferentialTests,
  berggrenTripleRootChildren: berggrenFirstChildren,
  berggrenDepthFiveOriginalConsumers: berggrenTreeConsumers,
  berggrenDirectLeafHypotenuseMatches: directHypMatching,
  berggrenSourceFiveRuneBranchFeedback: berggrenFiveBranchFeedback,
  berggrenOriginalTotientTransparentFPhaseExhaustion: berggrenTotientTransparentDP,
  interpretation: "The carry-word GP0 sum selects splice87, whereas the earlier sentence-offset criterion selects208. The physical carried rune cannot itself be the all-zero five-trit state in either valid de Bruijn register. No first-party cipher output law is specified.",
}, null, 2));
