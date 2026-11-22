"use strict";
/**
 * Original-cipher admissibility gate for conjectural three-prime RSA use of
 * Cicada's pre-LP2 PARABLE product 1,595,277,641.
 * Node 22 / Windows 11, read-only, single runnable test file.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const read = (p) => fs.readFileSync(path.join(__dirname, "..", p), "utf8");
const c = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const prime = (n) => crypto.checkPrimeSync(BigInt(n));
const gp = [];
for (let n = 2; gp.length < 29; n++) {
  if (prime(n)) gp.push(n);
}
const map = new Map(c.runes.map((r, i) => [r, gp[i]]));
const sections = read("resources/liber-primus/lp2-transcription.txt")
  .split("%").at(-1).replace(/[\/\r\n]/g, "")
  .split(/[.§]/).map(s => [...s].filter(r => map.has(r))).filter(a => a.length > 0);
assert.deepEqual(sections.map(x => x.length), [7, 30, 30, 28]);
const sums = sections.map(x => x.reduce((s, r) => s + map.get(r), 0));
assert.deepEqual(sums, [449, 1259, 1031, 1229]);

const [p, q, r] = sums.slice(1);
assert.ok(prime(p) && prime(q) && prime(r));
const n = BigInt(p) * BigInt(q) * BigInt(r);
const e = 65537n;
const phi = BigInt(p - 1) * BigInt(q - 1) * BigInt(r - 1);
const d = 401379393n;
assert.equal(n, 1595277641n);
assert.equal(e * d % phi, 1n);
assert.ok(29n ** 6n < n && n < 29n ** 7n);

function modPow(base, power, modulus) {
  let result = 1n;
  let a = base % modulus;
  for (let exp = power; exp > 0n; exp >>= 1n) {
    if (exp & 1n) result = result * a % modulus;
    a = a * a % modulus;
  }
  return result;
}
/** Pack GP index digits in the given endianness into one nonnegative integer. */
function pack(digits, reverse) {
  const input = reverse ? [...digits].reverse() : digits;
  return input.reduce((v, k) => v * 29n + BigInt(k), 0n);
}
function unpack(value, width) {
  const digits = new Array(width);
  let v = value;
  for (let i = width - 1; i >= 0; i--) {
    digits[i] = Number(v % 29n);
    v /= 29n;
  }
  assert.equal(v, 0n);
  return digits;
}
const chapters = [
  { name: "p8–14 (tree)", first: 8, last: 14, count: 247, invalid: [217, 221] },
  { name: "p33–39 (numbered)", first: 33, last: 39, count: 240, invalid: [220, 217] },
  { name: "p54–55 (terminal)", first: 54, last: 55, count: 44, invalid: [40, 40] }
];
for (const chapter of chapters) {
  const runes = c.pages.slice(chapter.first, chapter.last + 1).flatMap(page => page.indices);
  assert.equal(runes.length, chapter.count * 7);
  for (let ri = 0; ri < 2; ri++) {
    const reverse = ri === 1;
    const blocks = [];
    for (let i = 0; i < runes.length; i += 7) {
      blocks.push(pack(runes.slice(i, i + 7), reverse));
    }
    const invalid = blocks.filter(value => value >= n).length;
    assert.equal(invalid, chapter.invalid[ri]);
    console.log(chapter.name + ", " + (reverse ? "reversed" : "printed") +
      " 7-digit blocks: " + invalid + "/" + blocks.length + " >= RSA modulus N");
  }
}

// A distinct six-GP-rune fixed-width RSA proposal needs no ciphertext
// range padding, but every decrypted value must still fit in six runes.
// The complete physical p33–39 chapter has exactly 280 such packets.
const chapterSix = c.pages.slice(33, 40).flatMap(page => page.indices);
assert.equal(chapterSix.length, 1680);
const sixBlocks = [];
for (let i = 0; i < chapterSix.length; i += 6) {
  sixBlocks.push(pack(chapterSix.slice(i, i + 6), false));
}
assert.ok(sixBlocks.every(v => v < n));
for (const [exponent, inverse, expectedInvalid] of [
  [3n, 1060779147n, 172],
  [65537n, 401379393n, 182]
]) {
  assert.equal(exponent * inverse % phi, 1n);
  const plaintext = sixBlocks.map(v => modPow(v, inverse, n));
  const invalid = plaintext.filter(v => v >= 29n ** 6n).length;
  assert.equal(invalid, expectedInvalid);
  console.log("p33–39, six-rune ciphertext, RSA exponent " + exponent +
    ": " + invalid + "/" + sixBlocks.length +
    " decrypted blocks cannot fit six original GP rune slots");
}

// A true three-prime RSA encoder emits valid 7-digit ciphertext words.
// Plant 200 known native GP five-rune packets, recovering all source digits.
const clear = [...c.pages[57].indices, ...c.pages[56].indices];
const planted = Array.from({ length: 200 }, (_, k) =>
  Array.from({ length: 5 }, (_, j) => clear[(5 * k + j) % clear.length]));
for (const digits of planted) {
  const m = pack(digits, false);
  assert.ok(m < n);
  const encrypted = modPow(m, e, n);
  const ciphertextDigits = unpack(encrypted, 7);
  assert.ok(pack(ciphertextDigits, false) < n);
  assert.equal(modPow(pack(ciphertextDigits, false), d, n), m);
  assert.deepEqual(unpack(modPow(encrypted, d, n), 5), digits);
}
console.log("PASS authentic-p57/p56 200-block source-native three-prime RSA round-trip");
console.log("DECISION: all three untouched original rune chapters violate 7-digit canonical RSA ciphertext range before exponent/key selection.");
