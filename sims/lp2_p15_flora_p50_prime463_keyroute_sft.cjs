"use strict";

/**
 * Source-anchored LP2 candidate: p15's 11th Fibonacci-prime entry
 * corresponds to the rune-free 11th floral page (p50).
 *
 * Test one finite original-cipher consumer of the resulting prime463
 * as a generator of the p40–55 title-stripped 3299-rune position register,
 * while taking additive key values from the p49–51 256-byte printed table.
 *
 * No key, rune, phase or input position is fitted to the output.
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..", "resources", "liber-primus");
const corpus = JSON.parse(fs.readFileSync(path.join(root, "lp2-corpus.json"), "utf8"));
const table = JSON.parse(fs.readFileSync(path.join(root, "lp2-grid-256.json"), "utf8"));
const bytes = table.bytes;
const group = corpus.pages.slice(40, 56);
const printedP15 = [3299, 3298, 3296, 3294, 3288, 3278, 3258, 3222,
  3152, 3038, 2838, 2472, 1820, 708, 1206, 4516];
const fibonacci = [0, 1, 2, 3, 5, 8, 13, 21,
  34, 55, 89, 144, 233, 377, 610, 987];

/** @param {number} n */
function primesThroughRank(n) {
  const found = [];
  for (let candidate = 2; found.length < n; candidate++) {
    if (found.every((p) => p * p > candidate || candidate % p !== 0)) {
      found.push(candidate);
    }
  }
  return found;
}

/** @param {number} x */
function mod29(x) {
  return ((x % 29) + 29) % 29;
}

/** @param {number[]} values */
function ioc(values) {
  const freq = Array(29).fill(0);
  for (const x of values) freq[x]++;
  return freq.reduce((s, count) => s + count * (count - 1), 0) /
    (values.length * (values.length - 1));
}

assert.equal(group.length, 16);
assert.deepEqual(group.map((p) => p.page), Array.from({ length: 16 }, (_, i) => 40 + i));
assert.equal(group[10].indices.length, 0);
assert.deepEqual(group.map((p) => p.indices.length),
  [231, 273, 272, 274, 273, 270, 270, 274, 271, 66, 0, 92, 263, 179, 232, 76]);
const primes = primesThroughRank(988);
const recovered = fibonacci.map((f, i) => {
  const number = primes[f];
  assert.equal(Math.abs(3301 - number), printedP15[i]);
  return number;
});
assert.deepEqual(recovered, [2, 3, 5, 7, 13, 23, 43, 79,
  149, 263, 463, 829, 1481, 2593, 4507, 7817]);
assert.equal(3301 - printedP15[10], 463);
assert.equal(primes[462], 3299); // The 463rd prime is the highlighted p15 value.
assert.equal(printedP15[0], 3299);
assert.equal(40 + 10, 50);

const body = group.flatMap((page) => page.page === 40
  ? page.indices.slice(8)
  : page.page === 54 ? page.indices.slice(9) : page.indices);
assert.equal(group.reduce((s, p) => s + p.indices.length, 0), 3316);
assert.equal(body.length, 3299);
assert.equal(bytes.length, 256);
assert.equal(crypto.createHash("sha256").update(Buffer.from(bytes)).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");

// The observed j=10 source prime is a primitive root modulo the 3299-rune register.
const permutation = [0];
const visited = new Set([0]);
let v = 1;
for (let i = 0; i < 3298; i++) {
  assert.equal(visited.has(v), false);
  visited.add(v);
  permutation.push(v);
  v = v * 463 % 3299;
}
assert.equal(v, 1);
assert.equal(visited.size, 3299);
assert.equal(permutation[1], 1);
assert.equal(permutation[2], 463);

/**
 * The 256-byte table can be used as a direct periodic rune pad.
 * The two schedules differ by whether the table clock follows the
 * 463-power readout or the fixed original register positions.
 * @param {number[]} ciphertext
 * @param {(byte:number)=>number} reduction
 * @param {number} sign
 * @param {"readout"|"source"} clock
 */
function inverse(ciphertext, reduction, sign, clock) {
  return permutation.map((from, i) => mod29(
    ciphertext[from] + sign * reduction(bytes[(clock === "readout" ? i : from) % 256])
  ));
}

/**
 * Independent source-native known plaintext forward plant.
 * @param {number[]} plaintext
 * @param {(byte:number)=>number} reduction
 * @param {number} sign
 * @param {"readout"|"source"} clock
 */
function encrypt(plaintext, reduction, sign, clock) {
  const ciphertext = Array(3299);
  for (let i = 0; i < 3299; i++) {
    const to = permutation[i];
    const keyAt = clock === "readout" ? i : to;
    ciphertext[to] = mod29(plaintext[i] - sign * reduction(bytes[keyAt % 256]));
  }
  return ciphertext;
}

const reducers = [
  { name: "byte%29", fn: /** @param {number} x */ (x) => x % 29 },
  { name: "scaled", fn: /** @param {number} x */ (x) => Math.floor(x * 29 / 256) }
];
const solved = corpus.pages[57].indices;
assert.equal(solved.length, 95);
assert.ok(ioc(solved) > 0.055);
const plant = Array.from({ length: 3299 }, (_, i) => solved[i % solved.length]);
const expected = [
  0.03435850141846097, 0.03451070587389714,
  0.03452099989503775, 0.03453497035230001,
  0.034440669765779766, 0.03447633119615974,
  0.03439324373981053, 0.0345516981366535
];
const outputs = [];
for (const { name, fn } of reducers) {
  for (const sign of [-1, +1]) {
    for (const clock of ["readout", "source"]) {
      const result = inverse(body, fn, sign, clock);
      const plantedCipher = encrypt(plant, fn, sign, clock);
      assert.deepEqual(inverse(plantedCipher, fn, sign, clock), plant);
      outputs.push({
        reduction: name, sign, clock,
        ioc: ioc(result),
        first32: result.slice(0, 32).map((x) => corpus.translit[x]).join(" ")
      });
    }
  }
}
assert.equal(outputs.length, 8);
for (let i = 0; i < outputs.length; i++) {
  assert.ok(Math.abs(outputs[i].ioc - expected[i]) < 1e-12);
}
assert.ok(Math.abs(ioc(body) - 0.034464934244182635) < 1e-12);
console.log(JSON.stringify({
  p15Index: 10, correspondingFloralPage: 50, p15Cell: printedP15[10],
  selectedPrime: recovered[10], nthPrime463: primes[462],
  sourceBodyLength: body.length, generatorCycleLength: 3298,
  tableByteCount: bytes.length, sourceIoc: ioc(body),
  solvedP57Ioc: ioc(solved), plantedRecoveries: "8 x 3299/3299",
  outputs
}, null, 2));
