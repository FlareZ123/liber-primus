"use strict";
/**
 * Original-input Cicada 2013 audio -> p57 prime clauses -> 256-byte table
 * XOR navigation, and one source-selected 20-word p55 inverse.
 *
 * Reproduce: node sims/lp2_2013_parable_table_xor_word20_sft.cjs
 * Uses Node.js built-ins and the unchanged repository reference corpus.
 * A real LP2 decryption must yield readable text; no such claim is made here.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const root = path.join(__dirname, "..");
const read = name => fs.readFileSync(path.join(root, name), "utf8");
const c = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const table = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const all = read("resources/liber-primus/lp2-transcription.txt");
const p57text = all.split("%").at(-1).replaceAll("/", "");
const runeId = new Map(c.runes.map((r, i) => [r, i]));
const runes = s => [...s].filter(ch => runeId.has(ch)).map(ch => runeId.get(ch));
const sum = a => a.reduce((z, v) => z + c.prime[v], 0);
const units = p57text.split(".").slice(0, 4).map(runes);
assert.deepEqual(units.map(a => a.length), [7, 30, 30, 28]);
assert.deepEqual(units.flat(), c.pages[57].indices);
assert.deepEqual(units.map(sum), [449, 1259, 1031, 1229]);

// The number in the original 2013 audio 761.MP3 ID3 TXXX description:
// "Parable 1,595,277,641". Its pinned source hash and frame bytes are
// described in im-results/audio761-original-id3-frame-inventory.md.
const txxxNumber = 1595277641;
/** @param {number} n @returns {number[]} */
function factors(n) {
  const out = [];
  for (let d = 2; d * d <= n; d++) {
    while (n % d === 0) { out.push(d); n /= d; }
  }
  if (n > 1) out.push(n);
  return out;
}
assert.deepEqual(factors(txxxNumber), [1031, 1229, 1259]);
assert.equal(units.slice(1).map(sum).reduce((a, b) => a * b, 1), txxxNumber);
assert.equal(sum(runes("THE-INSTAR-EMERGENCE")), 761);

// Original 2013 NUMBER arithmetic supplies prime factorization, but DOES
// NOT prescribe the remaining prime-ordinal, table and XOR operations.
const primes = [];
for (let n = 2; primes.length < 300; n++) {
  if (primes.every(p => n % p !== 0)) primes.push(n);
}
const rank = n => {
  const index = primes.indexOf(n);
  assert.ok(index >= 0, "expected one of the source-prime sums");
  return index + 1;
};
const ordinals = units.map(sum).map(rank);
assert.deepEqual(ordinals, [87, 205, 173, 201]);
const bytes = table.byte_rows.flat();
assert.equal(bytes.length, 256);
const select = n => bytes[n - 1];
const picked = ordinals.map(select);
assert.deepEqual(picked, [111, 194, 148, 110]);
const destinations = ordinals.map(n => n ^ select(n));
assert.deepEqual(destinations, [56, 15, 57, 167]);
assert.equal(picked.reduce((a, b) => a + b), 563);

// Stage10 /167.jpg is byte-identical to original LP1 scan 15.jpg.
// Original Stage10 filenames 107/167/229 and hashes were independently
// checked in im-results/2014-stage10-three-images-lp1-source-handoff.md.
const stage10Original = fs.readFileSync(path.join(root,
  "resources/liber-primus/15.jpg"));
assert.equal(crypto.createHash("sha256").update(stage10Original)
  .digest("hex"),
  "f163903bec1236f1c89c96343d0bd1dee610b697c3ba82514651f04c5fbee4b9");

// The table lookup F(n)=n XOR cell[n] has a finite, source-fixed cycle of
// twenty states from the PARABLE title ordinal. LP2 p57 has 20 words.
const step = n => n ^ select(n);
const orbit = [];
let n = ordinals[0];
do {
  assert.ok(n > 0 && n <= 256 && !orbit.includes(n));
  orbit.push(n);
  n = step(n);
} while (n !== ordinals[0] && orbit.length < 257);
assert.equal(n, ordinals[0]);
assert.deepEqual(orbit, [
  87, 56, 104, 166, 180, 27, 182, 158, 101, 54,
  157, 169, 89, 138, 11, 151, 14, 10, 243, 217,
]);
const words = p57text.replaceAll("/", "")
  .replace(/[.&$§]/g, "-").split("-").map(runes)
  .filter(v => v.length);
assert.equal(words.length, 20);
assert.equal(words.flat().length, 95);
assert.equal(orbit.length, words.length);

// One bounded direct consumer of the above equality:
// take rune # (orbit state modulo printed word length), with the two usual
// zero- and one-based cyclic positions, then use the 20 selected runes
// as a repeating GP29 Vigenere key on ALL 76 original p55 runes.
// No tuned offsets, omitted symbols, skipped Fs or arbitrary key order.
const p55 = c.pages[55].indices;
assert.equal(p55.length, 76);
const mod29 = x => ((x % 29) + 29) % 29;
const ioc = a => {
  const counts = Array(29).fill(0);
  for (const x of a) counts[x]++;
  return counts.reduce((z, x) => z + x * (x - 1), 0) /
    (a.length * (a.length - 1));
};
const outcomes = [];
for (const offset of [0, -1]) {
  const key = words.map((w, i) => w[modIndex(orbit[i] + offset, w.length)]);
  assert.equal(key.length, 20);
  for (const sign of [1, -1]) {
    const decode = ciphertext =>
      ciphertext.map((v, i) => mod29(v + sign * key[i % key.length]));
    const encode = plaintext =>
      plaintext.map((v, i) => mod29(v - sign * key[i % key.length]));
    const attempt = decode(p55);
    assert.deepEqual(encode(attempt), p55);
    // Independent source-native known-plaintext plant.
    const known = c.pages[57].indices.slice(0, 76);
    assert.deepEqual(decode(encode(known)), known);
    outcomes.push({
      offset, sign, ioc: ioc(attempt),
      text: attempt.map(x => c.translit[x]).join(""),
    });
  }
}
/** @param {number} x @param {number} m @returns {number} */
function modIndex(x, m) { return ((x % m) + m) % m; }
assert.deepEqual(outcomes.map(x => Number(x.ioc.toFixed(12))), [
  0.031929824561, 0.034035087719, 0.029122807018, 0.034035087719,
]);
console.log(JSON.stringify({
  verified: true, original2013TXXX: txxxNumber,
  originalP57UnitPrimeSums: units.map(sum),
  primeOrdinals: ordinals, originalTableBytes: picked,
  originalXorDestinations: destinations, originalStage10Image: "167.jpg",
  p57Words: words.length, xorOrbit: orbit,
  p55OriginalRunes: p55.length, p55DirectInverse: outcomes,
  recoveredUnknownPlaintext: false,
}, null, 2));
