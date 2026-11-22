"use strict";

/**
 * Original-input SFT: 2013 289 interpause primes, base-60 digit expansion,
 * 2014 first 5x5 magic-square header, LP2 five numbered rune passages.
 * Distinct from the prior p56 F-transparent additive and 290-prime GP28
 * experiments: this receiver is a position-keyed, GP28 nonrepeat transducer
 * with a fixed 553-digit clock and an explicit EA equality sentinel.
 * Node.js 22 / CommonJS / read-only.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
/** @param {string} file @returns {string} */
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const shell = read("resources/historical/cicada2013-os-original-prime-echo.sh");
const lines = shell.split(/\r?\n/u).map((line) =>
  /^echo(?:\s+-n)?\s+"(\d+)\s*";\s+sleep\s+(\d+(?:\.\d+)?|\.\d+)$/u.exec(line.trim()))
  .filter(Boolean);
const records = lines.map((line) => ({ prime: Number(line[1]), pause: Number(line[2]) }));
assert.equal(records.length, 464);
assert.deepEqual(records.filter((r) => r.pause === 2).map((r) => r.prime), [1033, 3301]);
const before = records.findIndex((r) => r.prime === 1033);
const after = records.findIndex((r) => r.prime === 3301);
assert.deepEqual([before + 1, after + 1], [174, 464]);
const interior = records.slice(before + 1, after).map((r) => r.prime);
assert.equal(interior.length, 289);
assert.deepEqual([interior[0], interior.at(-1)], [1039, 3299]);

const squareText = read("resources/cicada2014-openpuff-magic-squares.txt");
const squares = squareText.trim().split(/\r?\n\s*\r?\n/u).map((part) =>
  part.trim().split(/\r?\n/u).map((row) => row.trim().split(/\s+/u).map(Number)));
assert.deepEqual(squares.map((a) => a.length), [5, 7, 5]);
assert.equal(squares[0].length ** 2, 25);

const pages = corpus.pages;
const units = [
  pages[36].indices.slice(99),
  pages[37].indices.slice(0, 91),
  pages[37].indices.slice(91, 189),
  pages[37].indices.slice(189).concat(pages[38].indices.slice(0, 57)),
  pages[38].indices.slice(57, 186),
];
assert.deepEqual(units.map((a) => a.length), [139, 91, 98, 96, 129]);
const original = units.flat();
assert.equal(original.length, 553);

const highFirst = interior.flatMap((n) => [Math.floor(n / 60), n % 60]);
const lowFirst = interior.flatMap((n) => [n % 60, Math.floor(n / 60)]);
assert.equal(highFirst.length, 578);
assert.equal(highFirst.length - original.length, squares[0].length ** 2);
assert.equal(highFirst.every((digit) => digit >= 0 && digit < 60), true);

const initialCipher = pages[36].indices[98];
assert.ok(Number.isInteger(initialCipher) && initialCipher >= 0 && initialCipher < 29);

/**
 * For each position, plaintext EA (GP index 28) yields an equal ciphertext
 * pair. For ordinary plaintext 0..27, take one of the 28 non-equal next runes
 * in cyclic order after the previous ciphertext rune. The key clock always
 * advances once per rune, so exactly 553 after-header digits are consumed.
 *
 * @param {number[]} cipher
 * @param {number[]} digits
 * @param {number} start
 * @param {number} sign
 * @returns {number[]}
 */
function decrypt(cipher, digits, start, sign) {
  let prev = initialCipher;
  return cipher.map((cur, i) => {
    const step = (cur - prev + 28) % 29;
    const k = digits[start + i] % 28;
    const p = step === 28 ? 28 : (((step - sign * k) % 28) + 28) % 28;
    prev = cur;
    return p;
  });
}

/**
 * @param {number[]} plain
 * @param {number[]} digits
 * @param {number} start
 * @param {number} sign
 * @returns {number[]}
 */
function encrypt(plain, digits, start, sign) {
  let prev = initialCipher;
  return plain.map((p, i) => {
    const k = digits[start + i] % 28;
    const next = p === 28
      ? prev
      : (prev + 1 + ((p + sign * k) % 28 + 28) % 28) % 29;
    prev = next;
    return next;
  });
}

/** @param {number[]} symbols @returns {number} */
function ioc(symbols) {
  const counts = Array(29).fill(0);
  for (const p of symbols) counts[p]++;
  const n = symbols.length;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) / (n * (n - 1));
}

const originalDoublets = original.filter((c, i) =>
  c === (i ? original[i - 1] : initialCipher)).length;
assert.equal(originalDoublets, 1);

const positive = Array.from({ length: original.length }, (_, i) =>
  pages[57].indices[i % pages[57].indices.length]);
positive[100] = 28;
const outcomes = [];
for (const [order, digits] of [["high-first", highFirst], ["low-first", lowFirst]]) {
  for (const start of [25, 0]) {
    for (const sign of [-1, 1]) {
      const candidate = decrypt(original, digits, start, sign);
      assert.deepEqual(encrypt(candidate, digits, start, sign), original);
      assert.deepEqual(decrypt(encrypt(positive, digits, start, sign), digits, start, sign), positive);
      assert.equal(candidate.filter((p) => p === 28).length, 1);
      const sourceControl = encrypt(positive, digits, start, sign);
      assert.equal(sourceControl.filter((c, i) =>
        c === (i ? sourceControl[i - 1] : initialCipher)).length, 1);
      outcomes.push({
        order, start, sign, outputIoC: Number(ioc(candidate).toFixed(12)),
        first45GP: candidate.slice(0, 45).map((p) => corpus.translit[p]).join(" "),
        genuineSourcePlantIoC: Number(ioc(positive).toFixed(12)),
      });
    }
  }
}
assert.deepEqual(outcomes.map((x) => x.outputIoC), [
  0.035281861782, 0.035019786671, 0.034816678460, 0.035701181959,
  0.035701181959, 0.036618444846, 0.035661870692, 0.035674974448,
]);
console.log(JSON.stringify({
  status: "PASS; source-locked full 553-rune GP28 step receiver yields no native text",
  sourcePrimes: interior.length, base60Digits: highFirst.length,
  headerDigits: 25, receiverRunes: original.length,
  itemLengths: units.map((a) => a.length), originalDoublets,
  sourceIoC: Number(ioc(original).toFixed(12)), outcomes,
}, null, 2));
