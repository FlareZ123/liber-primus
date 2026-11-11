"use strict";

/**
 * Original LP2 degree-238 source-factor ciphertext-feedback inverse.
 *
 * The printed 256-byte grid determines a unique irreducible degree-238
 * factor in GF(29); original physical p36 contains exactly 238 GP runes.
 * Freeze those runes as the full IV of a reversible CFB-like linear cipher:
 *
 *   P[t] = C[t] + SUM(j=0..237) R[j] * C[t-238+j]   (mod 29).
 *
 * Its encryption is:
 *   C[t] = P[t] - SUM(j=0..237) R[j] * C[t-238+j]   (mod 29).
 *
 * No key or plaintext is guessed. The original p36 is retained, not decoded,
 * and the remaining original p37..55 are an untouched original test.
 * This is NOT the previously tested raw LFSR generator condition P=0.
 *
 * Node 22; repository-root independent, built-in dependencies only.
 */

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const source = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const bytes = source.bytes;
assert.equal(bytes.length, 256);
assert.equal(crypto.createHash("sha256").update(Buffer.from(bytes)).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");

/** @param {number} v @returns {number} */
const mod = (v) => (v % 29 + 29) % 29;

/** @param {number[]} values @returns {number[]} */
function trim(values) {
  while (values.length > 1 && values[values.length - 1] === 0) values.pop();
  return values;
}

/**
 * Divide GF29 polynomial in ascending coefficient order by monic divisor.
 * @param {number[]} a
 * @param {number[]} b
 * @returns {{quotient:number[],remainder:number[]}}
 */
function divideMonic(a, b) {
  assert.equal(b[b.length - 1], 1);
  const r = a.slice(), degree = b.length - 1;
  const q = Array(a.length - degree).fill(0);
  for (let i = r.length - 1; i >= degree; i--) {
    const v = r[i];
    q[i - degree] = v;
    for (let j = 0; j <= degree; j++)
      r[i - degree + j] = mod(r[i - degree + j] - v * b[j]);
  }
  return {quotient:trim(q), remainder:trim(r.slice(0, degree) || [0])};
}

/** @returns {number[]} */
function sourceMonic238() {
  let poly = trim(bytes.slice().reverse().map(mod));
  assert.equal(poly.length, 255);
  const known = [
    [5, 1], [5, 1],
    [11, 18, 1],
    [24, 16, 14, 1],
    [11, 15, 0, 9, 1, 5, 10, 20, 12, 1],
  ];
  for (const factor of known) {
    const division = divideMonic(poly, factor);
    assert.deepEqual(division.remainder, [0]);
    poly = division.quotient;
  }
  assert.equal(poly.length, 239);
  assert.equal(poly[238], 28);
  const r = poly.map((v) => mod(28 * v));
  assert.equal(r[238], 1);
  return r;
}

const factor = sourceMonic238();

/**
 * @param {number[]} cipher Full IV plus ciphertext.
 * @param {number[]} taps Source polynomial ascending; monic.
 * @returns {number[]} Decoded runes following the IV.
 */
function decrypt(cipher, taps = factor) {
  assert.ok(cipher.length > 238);
  const output = [];
  for (let t = 238; t < cipher.length; t++) {
    let step = 0;
    for (let j = 0; j < 238; j++)
      step += taps[j] * cipher[t - 238 + j];
    output.push(mod(cipher[t] + step));
  }
  return output;
}

/**
 * @param {number[]} iv A source-selected 238-rune initial state.
 * @param {number[]} plaintext Native GP29 plaintext symbols.
 * @returns {number[]} Full IV followed by ciphertext.
 */
function encrypt(iv, plaintext) {
  assert.equal(iv.length, 238);
  const cipher = iv.slice();
  for (const p of plaintext) {
    const t = cipher.length;
    let step = 0;
    for (let j = 0; j < 238; j++)
      step += factor[j] * cipher[t - 238 + j];
    cipher.push(mod(p - step));
  }
  return cipher;
}

/**
 * @param {number[]} symbols
 * @returns {number}
 */
function coincidence(symbols) {
  const counts = Array(29).fill(0);
  for (const s of symbols) { assert.ok(Number.isInteger(s) && s >= 0 && s < 29); counts[s]++; }
  return counts.reduce((n, x) => n + x * (x - 1), 0) /
    (symbols.length * (symbols.length - 1));
}

/**
 * Greedy GP29 transliteration of independently held Shakespeare text.
 * @param {string} raw
 * @returns {number[]}
 */
function nativeGP(raw) {
  const dictionary = corpus.translit.map((t, i) => ({t, i}))
    .sort((a, b) => b.t.length - a.t.length);
  const output = [];
  for (const word of raw.toUpperCase().replace(/[V]/gu, "U")
    .replace(/[KQ]/gu, "C").replace(/[Z]/gu, "S").match(/[A-Z]+/gu) || []) {
    for (let i = 0; i < word.length;) {
      const token = dictionary.find(({t}) => word.startsWith(t, i));
      assert.ok(token, "unencodable native control");
      output.push(token.i);
      i += token.t.length;
    }
  }
  return output;
}

const pages = corpus.pages.filter((p) => p.page <= 55 && p.indices.length);
const p36 = corpus.pages[36].indices;
assert.equal(p36.length, 238);
const terminal = pages.filter((p) => p.page >= 36).flatMap((p) => p.indices);
assert.equal(terminal.length, 4250);
const originalAll = pages.flatMap((p) => p.indices);
assert.equal(originalAll.length, 12956);

const originalTerminalPlain = decrypt(terminal);
const originalAllPlain = decrypt(originalAll);
assert.equal(originalTerminalPlain.length, 4012);
assert.equal(originalAllPlain.length, 12718);
const actual = {
  terminalSourceCipher: coincidence(terminal),
  terminalRecovered: coincidence(originalTerminalPlain),
  bookSourceCipher: coincidence(originalAll),
  bookRecovered: coincidence(originalAllPlain),
};
assert.ok(Math.abs(actual.terminalRecovered - 0.034527432412311806) < 1e-14);
assert.ok(Math.abs(actual.bookRecovered - 0.03448750542910349) < 1e-14);

const native = nativeGP(read("resources/control/shakespeare_first300k.txt"));
assert.ok(native.length >= 2400);
const plain = native.slice(12000, 14400);
const plant = encrypt(p36, plain);
const decoded = decrypt(plant);
assert.deepEqual(decoded, plain, "source-native full-rune roundtrip");
assert.deepEqual(encrypt(p36, decoded), plant, "source-native forward verification");

// Deliberately wrong source: reverse the 238 feedback taps only.
const wrong = decrypt(plant, factor.slice(0, 238).reverse().concat([1]));
const output = {
  source: "unchanged source base60 grid, monic irreducible GF29 degree-238 factor",
  model: "C[t]=P[t]-sum(R[j]*C[t-238+j]) mod29, IV=p36",
  originalRuneCount: originalAll.length,
  originalTerminalAfterP36: originalTerminalPlain.length,
  fullBookAfterFirst238: originalAllPlain.length,
  original: actual,
  nativeControl: {
    ciphertextLength: plain.length,
    plaintextIoC: coincidence(plain),
    correctDecodedIoC: coincidence(decoded),
    wrongTapsIoC: coincidence(wrong),
    exactRecoveredRunes: decoded.filter((x, i) => x === plain[i]).length,
  },
  sourceFirst40: originalTerminalPlain.slice(0, 40)
    .map((x) => corpus.translit[x]).join(""),
  outcome: "No GP-native language revealed by this exact source-selected CFB residual.",
};
assert.ok(actual.terminalRecovered < 0.04);
assert.ok(actual.bookRecovered < 0.04);
assert.ok(coincidence(plain) > 0.05);
console.log(JSON.stringify(output, null, 2));
