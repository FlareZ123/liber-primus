"use strict";

/**
 * P50 literal-x four-erasure reconstruction from two independent source
 * polynomials. Run at repository root with Node.js 22.
 *
 * Original p49-p51 cells are a published source, not a secret ciphertext
 * solved here. The unknown common x digit is inferred without reading its
 * original numerical ordinal at the masked four positions.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");

/** @param {string} file @returns {any} */
function json(file) {
  return JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
}
/** @param {string} file @returns {string} */
function txt(file) {
  return fs.readFileSync(path.join(root, file), "utf8").replace(/\r\n/g, "\n");
}

const gp = json("resources/liber-primus/lp2-corpus.json");
const ink = json("resources/liber-primus/lp2-ink-annotations.json");
const grid = json("resources/liber-primus/base60-grid.json");
const tokens = grid.rows.flat();
const alphabet = grid.alphabet;
const signed2013Base29Digits = [3, 26, 24]; // 3301 -> "3QO"
assert.equal(signed2013Base29Digits.reduce((a, digit) => a * 29 + digit, 0), 3301);
const H = signed2013Base29Digits.slice().reverse();
const p39Red = ink.pages.find(page => page.page === 39)
  .red_spans.find(span => span.start === 119 && span.length === 3);
const G = [...p39Red.runes].map(rune => gp.runes.indexOf(rune)).reverse();
assert.deepEqual(gp.pages[39].indices.slice(119, 122), [27, 5, 15]);
assert.deepEqual(H, [24, 26, 3]);
assert.deepEqual(G, [15, 5, 27]);
assert.equal(tokens.length, 256);

const p = 29;
/** @param {number} x @returns {number} */
const mod = x => (x % p + p) % p;
/** @param {number} x @returns {number} */
function inv(x) {
  for (let i = 1; i < p; i++) if (mod(i * x) === 1) return i;
  throw new Error("noninvertible coefficient " + x);
}
/**
 * Descending polynomial remainder in GF29, preserving padded input slots.
 * @param {number[]} coefficients
 * @param {number[]} divisor
 * @returns {number[]}
 */
function remainder(coefficients, divisor) {
  const r = coefficients.map(mod);
  const leadingInverse = inv(divisor[0]);
  for (let i = 0; i <= r.length - divisor.length; i++) {
    const k = mod(r[i] * leadingInverse);
    for (let j = 0; j < divisor.length; j++) {
      r[i + j] = mod(r[i + j] - k * divisor[j]);
    }
  }
  return r.slice(r.length - divisor.length + 1);
}
/** @param {number[]} a @param {number[]} b @returns {number[]} */
function product(a, b) {
  const c = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++)
    for (let j = 0; j < b.length; j++)
      c[i + j] = mod(c[i + j] + a[i] * b[j]);
  return c;
}
const HG = product(H, G);
assert.deepEqual(HG, [12, 17, 11, 21, 23]);

// Locate the four literal right-hand x glyphs without using their values.
// 2014 source contains 0x three times and 2x once.
const xPositions = tokens.flatMap((token, i) => token[1] === "x" ? [i] : []);
assert.deepEqual(xPositions, [22, 51, 129, 219]);
assert.deepEqual(xPositions.map(i => tokens[i]), ["0x", "0x", "2x", "0x"]);
assert.equal(alphabet.length, 60);
assert.equal(alphabet.indexOf("x"), 59);

/**
 * Split a table into known contributions and unknown common right-glyph x.
 * known[i] is 60*a for a literal ax cell; at all other positions it is the
 * complete 60*a + right-hand digit. Then byte[i] = known[i] + x*basis[i].
 *
 * @param {string} digitAlphabet
 * @returns {{known:number[],basis:number[],radix:number}}
 */
function maskX(digitAlphabet) {
  const radix = digitAlphabet.length;
  const known = [];
  const basis = [];
  for (const token of tokens) {
    const a = Number(token[0]);
    assert(Number.isInteger(a) && a >= 0 && a <= 4);
    if (token[1] === "x") {
      known.push(radix * a);
      basis.push(1);
    } else {
      const digit = digitAlphabet.indexOf(token[1]);
      assert(digit >= 0);
      known.push(radix * a + digit);
      basis.push(0);
    }
  }
  return {known, basis, radix};
}

/**
 * Infer common x residue independently from every nonzero parity equation.
 * All equations must agree; no key or unknown-page plaintext is used.
 *
 * @param {number[]} known
 * @param {number[]} basis
 * @param {number[]} factor
 * @returns {{knownRemainder:number[],xRemainder:number[],proposals:number[],consensus:number|null}}
 */
function recoverCommonX(known, basis, factor) {
  const A = remainder(known, factor);
  const B = remainder(basis, factor);
  const proposals = B.map((b, i) => b ? mod(-A[i] * inv(b)) : null);
  const values = proposals.filter(x => x !== null);
  const common = values.length && values.every(x => x === values[0]) &&
    A.every((a, i) => mod(a + B[i] * values[0]) === 0) ? values[0] : null;
  return {knownRemainder: A, xRemainder: B, proposals, consensus: common};
}

/**
 * Solve a general four-erasure matrix. The right-hand side is exactly the
 * independent original 252 known coefficients' quartic residual.
 * @param {number[]} known
 * @param {number[]} positions
 * @param {number[]} divisor
 * @returns {{solution:number[],rank:number}}
 */
function recoverIndependentErasures(known, positions, divisor) {
  const target = remainder(known, divisor).map(v => mod(-v));
  const cols = positions.map(index => {
    const v = Array(known.length).fill(0);
    v[index] = 1;
    return remainder(v, divisor);
  });
  const M = target.map((value, r) => [...cols.map(col => col[r]), value]);
  let rank = 0;
  for (let c = 0; c < positions.length; c++) {
    const pivot = M.findIndex((line, row) => row >= rank && line[c] !== 0);
    if (pivot < 0) continue;
    [M[rank], M[pivot]] = [M[pivot], M[rank]];
    const multiplier = inv(M[rank][c]);
    M[rank] = M[rank].map(x => mod(x * multiplier));
    for (let r = 0; r < target.length; r++) {
      if (r === rank) continue;
      const factor = M[r][c];
      M[r] = M[r].map((v, i) => mod(v - factor * M[rank][i]));
    }
    rank++;
  }
  assert.equal(rank, positions.length, "four literal x erasures must be uniquely recoverable");
  const solution = M.map(row => row[positions.length]);
  return {solution, rank};
}

const parsed = maskX(alphabet);
const HRecovery = recoverCommonX(parsed.known, parsed.basis, H);
const GRecovery = recoverCommonX(parsed.known, parsed.basis, G);
const HGRecovery = recoverCommonX(parsed.known, parsed.basis, HG);
assert.deepEqual(HRecovery, {
  knownRemainder: [23, 12], xRemainder: [6, 17],
  proposals: [1, 1], consensus: 1
});
assert.deepEqual(GRecovery, {
  knownRemainder: [28, 8], xRemainder: [1, 21],
  proposals: [1, 1], consensus: 1
});
assert.deepEqual(HGRecovery, {
  knownRemainder: [23, 7, 26, 1], xRemainder: [6, 22, 3, 28],
  proposals: [1, 1, 1, 1], consensus: 1
});
const erased = recoverIndependentErasures(parsed.known, xPositions, HG);
assert.deepEqual(erased, {solution: [1, 1, 5, 1], rank: 4});
const originalBytes = tokens.map(t => 60 * Number(t[0]) + alphabet.indexOf(t[1]));
assert.deepEqual(xPositions.map(i => mod(originalBytes[i])), erased.solution);
assert.deepEqual(originalBytes, grid.byte_rows.flat());
assert.deepEqual(remainder(originalBytes, HG), [0, 0, 0, 0]);
assert.deepEqual([1, 30, 59].map(d => d % 29), [1, 1, 1],
  "GP29 parity identifies only the lower digit residue, not unique base60 digit");

// Explicit rival checks: source-available radix59 and reversed factor order.
const alt = maskX(alphabet.replace("f", ""));
const altH = recoverCommonX(alt.known, alt.basis, H);
const altG = recoverCommonX(alt.known, alt.basis, G);
const revH = recoverCommonX(parsed.known, parsed.basis, H.slice().reverse());
const revG = recoverCommonX(parsed.known, parsed.basis, G.slice().reverse());
assert.equal(altH.consensus, null);
assert.equal(altG.consensus, null);
assert.equal(revH.consensus, null);
assert.equal(revG.consensus, null);

// A genuine solved GP29 plaintext plant through the same full H*G codeword:
// polynomial encode 252 original solved LP1 runes, hide the four SAME x
// positions, uniquely recover them with NO access to the hidden values.
const sourceLP1 = txt("resources/transcriptions/lp1_wulfic_canonical.txt");
const start = sourceLP1.indexOf("ᚦᛖ-ᛚᚩᛋᛋ");
const end = sourceLP1.indexOf("\n$\n%\n", start);
assert(start >= 0 && end > start);
const runeToIndex = new Map(gp.runes.map((rune, i) => [rune, i]));
const solvedRunes = [...sourceLP1.slice(start, end)]
  .filter(character => runeToIndex.has(character))
  .map(character => runeToIndex.get(character));
assert.equal(solvedRunes.length, 755);
const encoded = product(solvedRunes.slice(0, 252), HG);
assert.equal(encoded.length, 256);
assert.deepEqual(remainder(encoded, HG), [0, 0, 0, 0]);
const plantPartial = encoded.map((n, i) => xPositions.includes(i) ? 0 : n);
const plantRecovered = recoverIndependentErasures(plantPartial, xPositions, HG);
assert.equal(plantRecovered.rank, 4);
assert.deepEqual(plantRecovered.solution, xPositions.map(i => encoded[i]));
const replay = plantPartial.slice();
for (let i = 0; i < 4; i++) replay[xPositions[i]] = plantRecovered.solution[i];
assert.deepEqual(replay, encoded);

console.log(JSON.stringify({
  source: "literal x in unchanged 256-cell p49-p51 table",
  sourceH: H, sourceG: G, quartic: HG,
  maskedPositions: xPositions,
  maskedTokens: xPositions.map(i => tokens[i]),
  signed2013XResidue: HRecovery,
  originalP39XResidue: GRecovery,
  combinedXResidue: HGRecovery,
  independentFourErasures: erased,
  sourceCheck: "0x/0x/2x/0x reconstructed as 1/1/5/1 modulo29",
  ambiguity: "x digit is 1, 30 or 59 modulo60; printed convention assigns 59",
  baselineRadix59: {H: altH, G: altG},
  reversedFactorOrientation: {H: revH, G: revG},
  solvedGPPlant: {inputRunes:252, encodedCells:256,
    hiddenPositions:4, recoveredPositions:4, exactReplay:true},
  plaintextRecovered: false
}, null, 2));
