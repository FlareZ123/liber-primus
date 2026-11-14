"use strict";
/**
 * Original-source three-share candidate for the H/G-divisible 256-cell grid.
 * Read-only Node.js 22 SFT; invoke from anywhere in a checkout.
 * Decisive receivers: the complete historical 84-symbol p56 key, and p55 / p54–55.
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
/** @param {string} p @returns {string} */
const read = p => fs.readFileSync(path.join(__dirname, "..", p), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const bytes = JSON.parse(read("resources/liber-primus/lp2-grid-256.json")).bytes;
/** @param {number} n @returns {number} */
const mod = n => (n % 29 + 29) % 29;
assert.equal(bytes.length, 256);
assert.equal(crypto.createHash("sha256").update(Buffer.from(bytes)).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");

// Ascending GF29 factor coefficients H(x)G(x) from signed 2013 BASE29
// 3QO and original LP2 physical p39 red triad, respectively.
const H = [3, 26, 24];
const G = [27, 5, 15];
const factor = Array(5).fill(0);
for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++)
  factor[i + j] = mod(factor[i + j] + H[i] * G[j]);
assert.deepEqual(factor, [23, 21, 11, 17, 12]);
assert.equal(mod(12 * 17), 1);

// Descending printed byte polynomial P(x); divide P by H(x)G(x).
const work = bytes.slice().reverse().map(mod);
const quotientAscending = [];
for (let i = 255; i >= 4; i--) {
  const coefficient = mod(work[i] * 17);
  quotientAscending[i - 4] = coefficient;
  for (let j = 0; j < 5; j++)
    work[i - 4 + j] = mod(work[i - 4 + j] - coefficient * factor[j]);
}
assert.deepEqual(work.slice(0, 4), [0, 0, 0, 0]);
const quotient = quotientAscending.reverse();
assert.equal(quotient.length, 252);
assert.deepEqual(quotient.slice(0, 10), [0, 12, 9, 28, 2, 25, 23, 21, 18, 28]);

// The genuine p56 cipher consumes exactly 84 consecutive prime-totient shifts.
const primes = [];
for (let n = 2; primes.length < 84; n++) {
  let isPrime = true;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) isPrime = false;
  if (isPrime) primes.push(n);
}
const historicalKey = primes.map(p => mod(p - 1));
let clock = 0;
const authenticPlain = gp.pages[56].indices.map((c, i) =>
  i === 56 ? c : mod(c - historicalKey[clock++]));
assert.equal(clock, 84);
assert.equal(authenticPlain.map(i => gp.translit[i]).join(""),
  "ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTOITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE");

/** @param {number[]} values @returns {number} */
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const x of values) counts[x]++;
  return counts.reduce((s, n) => s + n * (n - 1), 0) / (values.length * (values.length - 1));
}
/** @param {number[]} a @param {number[]} b @returns {number} */
function equalityConflicts(a, b) {
  let mismatches = 0;
  for (let i = 0; i < a.length; i++) for (let j = i + 1; j < a.length; j++)
    if ((a[i] === a[j]) !== (b[i] === b[j])) mismatches++;
  return mismatches;
}
/** @param {number[]} data @param {number} i @param {string} geometry @returns {number[]} */
function triple(data, i, geometry) {
  return geometry === "three-blocks" ? [data[i], data[i + 84], data[i + 168]] :
    [data[3 * i], data[3 * i + 1], data[3 * i + 2]];
}
/** @param {number[]} plain @param {number[]} key @returns {number[]} */
function encrypt(plain, key) {
  return plain.map((value, i) => mod(value + key[i % key.length]));
}
/** @param {number[]} cipher @param {number[]} key @returns {number[]} */
function decrypt(cipher, key) {
  return cipher.map((value, i) => mod(value - key[i % key.length]));
}
const p55 = gp.pages[55].indices;
const finalChapter = gp.pages.slice(54, 56).flatMap(p => p.indices);
assert.equal(p55.length, 76);
assert.equal(finalChapter.length, 308);
const results = [];
for (const geometry of ["three-blocks", "interleaved-triplets"]) {
  const shared = Array.from({length:84}, (_, i) => {
    const t = triple(quotient, i, geometry);
    return mod(t[0] + t[1] + t[2]);
  });
  const exact = shared.filter((x, i) => x === historicalKey[i]).length;
  const contradictions = equalityConflicts(shared, historicalKey);
  const p55Recovered = decrypt(p55, shared);
  const chapterRecovered = decrypt(finalChapter, shared);
  const nativePlant = Array.from({length:76}, (_, i) => gp.pages[57].indices[i % 95]);
  assert.deepEqual(decrypt(encrypt(nativePlant, shared), shared), nativePlant);
  results.push({geometry, historicalKeyExact:exact, allSecretEqualityConflicts:contradictions,
    distinctSharedSymbols:new Set(shared).size, p55Ioc:ioc(p55Recovered),
    finalChapterIoc:ioc(chapterRecovered), first20P55:p55Recovered.slice(0, 20).map(i => gp.translit[i]).join(" ")});
}
assert.deepEqual(results.map(x => x.historicalKeyExact), [3, 10]);
assert.deepEqual(results.map(x => x.allSecretEqualityConflicts), [200, 207]);
assert.deepEqual(results.map(x => x.distinctSharedSymbols), [29, 26]);

// Historical three-byte XOR on the 252 systematic input slots: no ASCII payload.
// The last four original coefficients are source-compatible GF29 parity positions.
const systematic = bytes.slice(0, 252);
const xorControls = [];
for (const geometry of ["three-blocks", "interleaved-triplets"]) {
  const output = Array.from({length:84}, (_, i) => {
    const t = triple(systematic, i, geometry);
    return t[0] ^ t[1] ^ t[2];
  });
  xorControls.push({geometry, printableAscii:output.filter(x => x >= 32 && x <= 126).length,
    exactAscii:output.map(x => x >= 32 && x <= 126 ? String.fromCharCode(x) : ".").join("")});
}
assert.deepEqual(xorControls.map(x => x.printableAscii), [39, 29]);

// Historical byte XOR offers a separate GF29-key consumer: reduce the 84
// actual-byte three-share XOR values mod29; also XOR the H/G quotient terms.
// These are no-secret predictions against the authentic p56 entire key.
const xorKeyTransfers = [];
for (const [source, data] of [["systematic-252", systematic], ["H/G-quotient", quotient]]) {
  for (const geometry of ["three-blocks", "interleaved-triplets"]) {
    const key = Array.from({length:84}, (_, i) => {
      const t = triple(data, i, geometry);
      return mod(t[0] ^ t[1] ^ t[2]);
    });
    const plaintext = decrypt(p55, key);
    xorKeyTransfers.push({source, geometry,
      historicalKeyExact:key.filter((v, i) => v === historicalKey[i]).length,
      allSecretEqualityConflicts:equalityConflicts(key, historicalKey),
      p55Ioc:ioc(plaintext), p55First24:plaintext.slice(0, 24).map(i => gp.translit[i]).join("")});
  }
}
assert.deepEqual(xorKeyTransfers.map(x => x.historicalKeyExact), [4, 6, 2, 2]);
assert.deepEqual(xorKeyTransfers.map(x => x.allSecretEqualityConflicts), [199, 195, 205, 206]);
console.log(JSON.stringify({originalGrid256Sha256:"3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290",
  historicalP56KeyLength:historicalKey.length, rawP55Ioc:ioc(p55), rawChapterIoc:ioc(finalChapter),
  originalResults:results, byteXorControls:xorControls, xorKeyTransfers,
  decision:"Both independently motivated 3-share sources fail complete authentic p56 key and original p55 plaintext gates"}, null, 2));
