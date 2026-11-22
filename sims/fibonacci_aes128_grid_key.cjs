"use strict";

/**
 * Direct AES-128 decryption gate for the original LP2 256-byte base-60 grid,
 * using 16-byte keys from the independently known page-15 Fibonacci-prime square.
 * Manual runner: node sims/fibonacci_aes128_grid_key.cjs
 *
 * Deliberately bounded: no fitted key bytes, arbitrary key hashes, learned
 * ciphertext shifts, or English scorer. A successful direct byte payload
 * should be wholly printable ASCII or entirely 0..28 GP indices.
 * @module fibonacci_aes128_grid_key
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {createCipheriv, createDecipheriv, createHash} = require("node:crypto");
const {readSquare, primeList, uniqueFibonacciPrimeRanks, clockwiseSpiral} =
  require("./fibonacci_prime_spiral.cjs");

const ROOT = path.resolve(__dirname, "..");
/** @param {string} name */
function read(name) {
  return fs.readFileSync(path.join(ROOT, name));
}
/** @param {number} value */
function byte(value) {
  return ((value % 256) + 256) % 256;
}
/** @param {number[]} values */
function asBytes(values) {
  return Buffer.from(values.map(byte));
}

/** @returns {{keys:Array<{name:string,key:Buffer}>,row:number[],spiral:number[]}} */
function deriveKeys() {
  const square = readSquare();
  const positions = clockwiseSpiral();
  const spiral = positions.map(([r, c]) => square[r][c]);
  const row = square.flat();
  assert.deepEqual(spiral, [3299,3298,3296,3294,3288,3278,3258,3222,
    3152,3038,2838,2472,1820,708,1206,4516]);
  const ranks = uniqueFibonacciPrimeRanks();
  const primes = primeList(Math.max(...ranks));
  const source = new Map([
    ["square", spiral],
    ["3301-minus-square", spiral.map(x => 3301 - x)],
    ["Fibonacci-indexed-primes", ranks.map(i => primes[i - 1])],
    ["prime-ranks", ranks],
    ["Fibonacci-values", ranks.map(i => i - 1)]
  ]);
  const rowIndices = [...Array(16).keys()]
    .sort((i, j) => 4 * positions[i][0] + positions[i][1] -
      (4 * positions[j][0] + positions[j][1]));
  const keys = [];
  for (const [sourceName, values] of source) {
    for (const [orderName, order] of [
      ["spiral", [...Array(16).keys()]], ["row-major", rowIndices]
    ]) {
      const arranged = order.map(i => values[i]);
      for (const reverse of [false, true]) {
        for (const sign of [1, -1]) {
          const name = [sourceName, orderName, reverse ? "reverse" : "forward",
            sign < 0 ? "negated" : "direct"].join("/");
          const ordered = reverse ? [...arranged].reverse() : arranged;
          const key = asBytes(ordered.map(x => sign * x));
          assert.equal(key.length, 16);
          keys.push({name, key});
        }
      }
    }
  }
  assert.equal(keys.length, 40);
  return {keys, row, spiral};
}

/** @param {Buffer} input */
function gridTraversals(input) {
  assert.equal(input.length, 256);
  const column = [];
  for (let c = 0; c < 8; c++) {
    for (let r = 0; r < 32; r++) column.push(input[8 * r + c]);
  }
  return new Map([
    ["row-major", input],
    ["reverse-row-major", Buffer.from(input).reverse()],
    ["column-major", Buffer.from(column)],
    ["reverse-column-major", Buffer.from(column).reverse()]
  ]);
}

/**
 * Decrypt 256 bytes with a declared 128-bit key, AES mode and IV.
 * @param {Buffer} ciphertext
 * @param {Buffer} key
 * @param {string} mode
 * @param {Buffer|null} iv
 */
function decrypt(ciphertext, key, mode, iv) {
  const decoder = createDecipheriv("aes-128-" + mode, key, iv);
  if (mode === "ecb" || mode === "cbc") decoder.setAutoPadding(false);
  return Buffer.concat([decoder.update(ciphertext), decoder.final()]);
}

/** @param {Buffer} output */
function score(output) {
  let printable = 0, gpByte = 0, longestAscii = 0, asciiRun = 0;
  for (const value of output) {
    if ((value >= 32 && value <= 126) || value === 9 ||
      value === 10 || value === 13) printable++;
    if (value < 29) gpByte++;
    if (value >= 32 && value <= 126) asciiRun++;
    else asciiRun = 0;
    longestAscii = Math.max(longestAscii, asciiRun);
  }
  return {printable, gpByte, longestAscii};
}

/**
 * Exact known-plaintext roundtrip with an independently sourced LP1 passage.
 * @param {Buffer} key
 */
function plantRoundtrip(key) {
  const plain = read("resources/liber-primus/lp1-plaintext-reference.txt")
    .subarray(0, 256);
  assert.equal(plain.length, 256);
  const iv = Buffer.alloc(16);
  const encoder = createCipheriv("aes-128-cbc", key, iv);
  encoder.setAutoPadding(false);
  const cipher = Buffer.concat([encoder.update(plain), encoder.final()]);
  const recovered = decrypt(cipher, key, "cbc", iv);
  assert.deepEqual(recovered, plain);
  return {source: "first 256 original LP1 translation file bytes",
    ciphertextBytes: cipher.length, recoveredBytes: recovered.length,
    byteExact: recovered.equals(plain)};
}

/** Full manifest of source-derived candidate AES-128 keys and grid layouts. */
function main() {
  const original = JSON.parse(read(
    "resources/liber-primus/lp2-grid-256.json").toString("utf8"));
  assert.equal(original.byte_count, 256);
  const raw = asBytes(original.bytes);
  assert.equal(raw.length, 256);
  const {keys, row, spiral} = deriveKeys();
  const ivs = new Map([
    ["zero", Buffer.alloc(16)],
    ["original-grid-first16", raw.subarray(0, 16)],
    ["original-grid-last16", raw.subarray(240)],
    ["square-row-major", asBytes(row)],
    ["square-spiral", asBytes(spiral)]
  ]);
  const modes = ["ecb", "cbc", "ctr", "cfb", "ofb"];
  let candidates = 0, asciiCandidates = 0, gpCandidates = 0;
  let bestPrintable = null, bestGp = null, bestRun = null;
  for (const {name, key} of keys) {
    for (const [layout, ciphertext] of gridTraversals(raw)) {
      for (const mode of modes) {
        const variations = mode === "ecb" ? [["none", null]] : [...ivs];
        for (const [ivName, iv] of variations) {
          const result = decrypt(ciphertext, key, mode, iv);
          assert.equal(result.length, 256);
          const metrics = score(result);
          const row = {key: name, layout, mode, iv: ivName,
            ...metrics, first32Hex: result.subarray(0, 32).toString("hex")};
          if (!bestPrintable || metrics.printable > bestPrintable.printable)
            bestPrintable = row;
          if (!bestGp || metrics.gpByte > bestGp.gpByte) bestGp = row;
          if (!bestRun || metrics.longestAscii > bestRun.longestAscii)
            bestRun = row;
          asciiCandidates += Number(metrics.printable === 256);
          gpCandidates += Number(metrics.gpByte === 256);
          candidates++;
        }
      }
    }
  }
  assert.equal(candidates, 3360);
  assert.equal(asciiCandidates, 0);
  assert.equal(gpCandidates, 0);
  assert.equal(bestPrintable.printable, 125);
  assert.equal(bestGp.gpByte, 49);
  assert.equal(bestRun.longestAscii, 12);
  const result = {
    classification: "Direct AES-128 key/IV gate; negative for plain ASCII or GP byte arrays",
    originalGridSha256: createHash("sha256").update(raw).digest("hex"),
    gridBytes: raw.length, sourceKeys: keys.length,
    gridTraversals: 4, cipherModes: modes,
    ivPerNonEcbMode: ivs.size, configurations: candidates,
    allPrintableAscii: asciiCandidates, allGpIndices0To28: gpCandidates,
    bestPrintable, bestGp, bestRun,
    plantedPositive: plantRoundtrip(keys[0].key),
    notes: "No unknown plaintext or cipher key recovered; binary/compressed or other coding remains possible."
  };
  console.log(JSON.stringify(result, null, 2));
  return result;
}
if (require.main === module) main();
module.exports = {deriveKeys, gridTraversals, decrypt, score, main};
