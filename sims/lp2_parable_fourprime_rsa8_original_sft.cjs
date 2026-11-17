"use strict";

/**
 * Exact original-source SFT: the clear p57 four prime sums as a candidate
 * four-prime RSA modulus with an eight-GP-rune cycle-walk register.
 * Run: node sims/lp2_parable_fourprime_rsa8_original_sft.cjs
 * Node.js 22, no package dependencies, read-only.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const source = JSON.parse(fs.readFileSync(
  path.join(__dirname, "..", "resources", "liber-primus", "lp2-corpus.json"),
  "utf8"
));
const N = 449n * 1259n * 1031n * 1229n;
const PHI = 448n * 1258n * 1030n * 1228n;
const RADIX = 29n;
const WIDTH = 8;
const DOMAIN = RADIX ** BigInt(WIDTH);
const CHAPTERS = [[33, 39], [40, 53]];
const EXPONENTS = [449n, 1033n, 3301n];

/** @param {bigint} base @param {bigint} exponent @returns {bigint} */
function modPow(base, exponent) {
  let result = 1n;
  while (exponent > 0n) {
    if ((exponent & 1n) !== 0n) result = (result * base) % N;
    base = (base * base) % N;
    exponent >>= 1n;
  }
  return result;
}

/** @param {bigint} a @returns {bigint} */
function inverseExponent(a) {
  let oldR = a;
  let r = PHI;
  let oldS = 1n;
  let s = 0n;
  while (r !== 0n) {
    const q = oldR / r;
    [oldR, r] = [r, oldR - q * r];
    [oldS, s] = [s, oldS - q * s];
  }
  assert.equal(oldR, 1n, "exponent must be invertible");
  return (oldS % PHI + PHI) % PHI;
}

/**
 * Exact eight-digit order-preserving or internally reversed RSA cycle-walk.
 * The source does not authenticate this format-preserving operation.
 * @param {number[]} input
 * @param {bigint} exponent
 * @param {boolean} reversed
 * @returns {number[]}
 */
function transform(input, exponent, reversed) {
  assert.equal(input.length % WIDTH, 0, "no silent tail or padding");
  const output = [];
  for (let start = 0; start < input.length; start += WIDTH) {
    const digits = input.slice(start, start + WIDTH);
    if (reversed) digits.reverse();
    let x = digits.reduce((acc, digit) => acc * RADIX + BigInt(digit), 0n);
    assert.ok(x < DOMAIN);
    do {
      x = modPow(x, exponent);
    } while (x >= DOMAIN);
    const next = new Array(WIDTH);
    for (let j = WIDTH - 1; j >= 0; j--) {
      next[j] = Number(x % RADIX);
      x /= RADIX;
    }
    if (reversed) next.reverse();
    output.push(...next);
  }
  return output;
}

/** @param {number[]} symbols @returns {number} */
function coincidence(symbols) {
  const counts = Array(29).fill(0);
  for (const symbol of symbols) {
    assert.ok(Number.isInteger(symbol) && symbol >= 0 && symbol <= 28);
    counts[symbol]++;
  }
  return counts.reduce((sum, x) => sum + x * (x - 1), 0) /
    (symbols.length * (symbols.length - 1));
}

/** @param {number} first @param {number} last @returns {number[]} */
function originalWindow(first, last) {
  return source.pages
    .filter((page) => page.page >= first && page.page <= last)
    .flatMap((page) => page.indices);
}

assert.equal(N, 716279660809n);
assert.equal(PHI, 712843586560n);
assert.equal(DOMAIN, 500246412961n);
assert.ok(DOMAIN < N && N < RADIX ** 9n);
const controls = originalWindow(57, 57);
assert.equal(controls.length, 95);
const plantedPlain = controls.slice(7);
assert.equal(plantedPlain.length, 88, "p57 PARABLE body has eleven eight-rune blocks");
const originalResults = [];

for (const e of EXPONENTS) {
  const d = inverseExponent(e);
  for (const reversed of [false, true]) {
    const plant = transform(plantedPlain, e, reversed);
    assert.deepEqual(transform(plant, d, reversed), plantedPlain);
    assert.deepEqual(transform(transform(plantedPlain, d, reversed), e, reversed), plantedPlain);

    for (const [first, last] of CHAPTERS) {
      const original = originalWindow(first, last);
      assert.equal(original.length, first === 33 ? 1680 : 3008);
      const originalIoc = coincidence(original);
      for (const [name, exponent, undo] of [
        ["public", e, d],
        ["private", d, e],
      ]) {
        const candidate = transform(original, exponent, reversed);
        assert.deepEqual(transform(candidate, undo, reversed), original);
        const ioc = coincidence(candidate);
        originalResults.push({
          chapter: "p" + first + "-p" + last,
          e: e.toString(),
          direction: name,
          reversed,
          runes: original.length,
          input_ioc: originalIoc,
          output_ioc: ioc,
          opening: candidate.slice(0, 24).map((value) => source.translit[value]).join(" "),
        });
      }
    }
  }
}

const maxIoc = Math.max(...originalResults.map((entry) => entry.output_ioc));
assert.ok(maxIoc < 0.036, "unexpected original plaintext-frequency concentration");
assert.ok(coincidence(controls) > 0.06, "clear p57 source-positive distribution");
// A distinct source-visible five-byte receiver: p50 has 256 printed bytes,
// while original p53 has exactly 51 red runes. The four-prime N fits five
// bytes; therefore 51 RSA ciphertext blocks would consume 255 bytes and
// leave one physically source-visible byte as a possible marker.
// Standard RSA requires every five-byte input integer to be STRICTLY below N.
const grid = JSON.parse(fs.readFileSync(path.join(
  __dirname, "..", "resources", "liber-primus", "base60-grid.json"
), "utf8"));
const ink = JSON.parse(fs.readFileSync(path.join(
  __dirname, "..", "resources", "liber-primus", "lp2-ink-annotations.json"
), "utf8"));
assert.equal(grid.byte_rows.length, 32);
const bytes = grid.byte_rows.flat();
assert.equal(bytes.length, 256);
const p53 = ink.pages.find((p) => p.page === 53);
assert.equal(p53.rune_count, 179);
assert.equal(p53.red_spans.length, 1);
assert.equal(p53.red_spans[0].start, 128);
assert.equal(p53.red_spans[0].length, 51);
const packetValidity = [];
for (const headMarker of [false, true]) {
  for (const littleEndian of [false, true]) {
    let valid = 0;
    let firstBad = null;
    for (let i = 0; i < 51; i++) {
      const packet = bytes.slice(Number(headMarker) + 5 * i,
        Number(headMarker) + 5 * i + 5);
      if (littleEndian) packet.reverse();
      const x = packet.reduce((sum, byte) => 256n * sum + BigInt(byte), 0n);
      if (x < N) valid++;
      else if (firstBad === null) firstBad = i;
    }
    packetValidity.push({
      head_marker: headMarker, little_endian: littleEndian,
      valid, invalid: 51 - valid, first_invalid_block: firstBad,
    });
  }
}
assert.deepEqual(packetValidity.map((x) => x.valid), [35, 28, 33, 36]);
assert.ok(packetValidity.every((x) => x.invalid > 0),
  "no source-order reading supplies complete canonical RSA5 ciphertext");

console.log(JSON.stringify({
  modulus: N.toString(),
  phi: PHI.toString(),
  eight_digit_domain: DOMAIN.toString(),
  original_models: originalResults.length,
  positive_controls: EXPONENTS.length * 2 * 2,
  canonical_RSA5_grid_packets: packetValidity,
  max_original_ioc: maxIoc,
  known_clear_p57_ioc: coincidence(controls),
  results: originalResults,
}, null, 2));
