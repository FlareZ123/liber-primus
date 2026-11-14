"use strict";
/**
 * LP2 p55: original 2014 5/7/5 squares, their common 5x5 cores,
 * a 2016 signed-image dimension, and original p32/p55 GP29 runes.
 * Source-pinned one-to-one pad, composite XOR pad, left-column pad
 * and piecewise Hill-5 inversions. No key/phase/language fitting.
 * Run from repository root with Node.js 22, e.g. node sims/lp2_magic_centers_569_75body_sft.cjs.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.join(__dirname, "..");
const text = file => fs.readFileSync(path.join(ROOT, file), "utf8");
const bytes = file => fs.readFileSync(path.join(ROOT, file));
const MOD = 29;
const mod = n => (n % MOD + MOD) % MOD;

/** @param {number} n @returns {number} Euler phi(n) */
function phi(n) {
  let result = n;
  for (let divisor = 2; divisor * divisor <= n; divisor++) {
    if (n % divisor !== 0) continue;
    while (n % divisor === 0) n /= divisor;
    result -= result / divisor;
  }
  if (n > 1) result -= result / n;
  return Math.round(result);
}

/** @param {Buffer} src @returns {[number, number]} width, height */
function jpegDimensions(src) {
  assert.equal(src.readUInt16BE(0), 0xffd8);
  for (let p = 2; p + 9 < src.length;) {
    assert.equal(src[p], 0xff);
    let marker = src[p + 1];
    p += 2;
    while (marker === 0xff) marker = src[p++];
    if ([0xc0, 0xc1, 0xc2, 0xc3].includes(marker)) {
      return [src.readUInt16BE(p + 5), src.readUInt16BE(p + 3)];
    }
    p += src.readUInt16BE(p);
  }
  throw Error("JPEG frame dimensions not found");
}

/** @param {number[][]} input @returns {{det:number,inverse:number[][]}} */
function invert(input) {
  const n = input.length;
  const augmented = input.map((row, i) =>
    [...row.map(mod), ...Array.from({length: n}, (_, j) => Number(i === j))]);
  let det = 1;
  for (let col = 0; col < n; col++) {
    const pivot = augmented.findIndex((row, i) => i >= col && row[col] !== 0);
    assert.ok(pivot >= 0, "Source square must be invertible over GF(29)");
    if (pivot !== col) {
      [augmented[pivot], augmented[col]] = [augmented[col], augmented[pivot]];
      det = mod(-det);
    }
    const value = augmented[col][col];
    det = mod(det * value);
    let factor = 1;
    while (value * factor % MOD !== 1) factor++;
    augmented[col] = augmented[col].map(x => mod(x * factor));
    for (let i = 0; i < n; i++) {
      if (i === col) continue;
      const multiple = augmented[i][col];
      augmented[i] = augmented[i].map((x, j) =>
        mod(x - multiple * augmented[col][j]));
    }
  }
  return {det, inverse: augmented.map(row => row.slice(n))};
}

/** @param {number[][]} matrix @param {number[]} vector */
function apply(matrix, vector) {
  return matrix.map(row => mod(row.reduce((s, v, j) => s + v * vector[j], 0)));
}

/** @param {number[]} arr */
function ioc(arr) {
  const hist = new Array(MOD).fill(0);
  arr.forEach(x => hist[x]++);
  return hist.reduce((s, n) => s + n * (n - 1), 0) / (arr.length * (arr.length - 1));
}

/** @param {number[][]} sourceMatrices @param {number[]} stream */
function hill(sourceMatrices, stream) {
  const inverse = sourceMatrices.map(matrix => invert(matrix).inverse);
  const result = [];
  for (let block = 0; block < 15; block++) {
    const which = Math.floor(block / 5);
    result.push(...apply(inverse[which], stream.slice(5 * block, 5 * block + 5)));
  }
  return result;
}

/** @param {number[][]} sourceMatrices @param {number[]} stream */
function encryptHill(sourceMatrices, stream) {
  const result = [];
  for (let block = 0; block < 15; block++) {
    const which = Math.floor(block / 5);
    result.push(...apply(sourceMatrices[which], stream.slice(5 * block, 5 * block + 5)));
  }
  return result;
}
function run() {
  const sections = text("resources/cicada2014-openpuff-magic-squares.txt")
    .trim().split(/\r?\n\s*\r?\n/).map(section =>
      section.trim().split(/\r?\n/).map(line => line.trim().split(/\s+/).map(Number)));
  assert.deepEqual(sections.map(s => [s.length, s[0].length]), [[5,5],[7,7],[5,5]]);
  const matrices = [sections[0], sections[1].slice(1, 6).map(row => row.slice(1, 6)), sections[2]];
  const centers = [sections[0][2][2], sections[1][3][3], sections[2][2][2]];
  assert.deepEqual(centers, [809, 331, 91]);
  const xor = centers[0] ^ centers[1] ^ centers[2];
  assert.equal(xor, 569);
  assert.equal(centers[0] - centers[1] + centers[2], 569);
  const dims = jpegDimensions(bytes("resources/historical/cicada2016-4gq25.jpg"));
  assert.deepEqual(dims, [563, 569]);
  const isPrime = value => value >= 2 &&
    Array.from({length: Math.floor(Math.sqrt(value)) - 1}, (_, i) => i + 2)
      .every(divisor => value % divisor !== 0);
  assert.ok(isPrime(xor) && isPrime(dims[0]));
  assert.ok(Array.from({length: dims[1] - dims[0] - 1}, (_, i) =>
    !isPrime(dims[0] + i + 1)).every(Boolean));
  const corpus = JSON.parse(text("resources/liber-primus/lp2-corpus.json"));
  const get = number => corpus.pages.find(page => page.page === number).indices;
  const p32 = get(32), p55 = get(55), known = get(57);
  assert.deepEqual([p32.length, p55.length, known.length], [121, 76, 95]);
  const left = Array.from({length: 11}, (_, i) => p32[i * 11]);
  const top = p32.slice(0, 11);
  assert.equal(left.reduce((s, v) => s + corpus.prime[v], 0), dims[1]);
  assert.equal(top.reduce((s, v) => s + corpus.prime[v], 0), dims[0]);
  const ordinals = [];
  for (let value = 2; ordinals.length < 104; value++) {
    if (ordinals.every(divisor => value % divisor !== 0)) ordinals.push(value);
  }
  assert.deepEqual(ordinals.slice(102, 104), [563, 569]);
  const repeatSites = [];
  for (let j = 1; j < p32.length; j++) {
    if (p32[j] === p32[j - 1]) repeatSites.push(j - 1);
  }
  assert.deepEqual(repeatSites, [29, 103]);
  assert.deepEqual(p32.slice(103, 105).map(v => corpus.translit[v]), ["N", "N"]);
  assert.deepEqual(p32.slice(102, 104).map(v => corpus.translit[v]), ["E", "N"]);

  // The original first p55 rune completes a p54 word: the 75 complete
  // body runes alone have an exact 3 x 25 numerical-square counterpart.
  const body = p55.slice(1);
  const sourceNums = matrices.flatMap(matrix => matrix.flat());
  assert.equal(sourceNums.length, body.length);
  const pad = sourceNums.map(value => phi(value) % MOD);
  const padPlain = body.map((value, i) => mod(value - pad[i]));
  const padPlus = body.map((value, i) => mod(value + pad[i]));
  const xor25 = matrices[0].flat().map((value, i) =>
    mod(value ^ matrices[1].flat()[i] ^ matrices[2].flat()[i]));
  const xorPlain = body.map((value, i) => mod(value - xor25[i % 25]));
  const leftPlain = body.map((value, i) => mod(value - left[i % 11]));
  const raw = matrices.map(mat => mat.map(row => row.map(mod)));
  const totient = matrices.map(mat => mat.map(row => row.map(value => phi(value) % MOD)));
  assert.deepEqual(raw.map(mat => invert(mat).det), [10, 8, 3]);
  assert.deepEqual(totient.map(mat => invert(mat).det), [23, 27, 28]);
  const rawHill = hill(raw, body);
  const phiHill = hill(totient, body);
  assert.deepEqual(encryptHill(raw, rawHill), body);
  assert.deepEqual(encryptHill(totient, phiHill), body);
  assert.deepEqual(padPlain.map((value, i) => mod(value + pad[i])), body);
  assert.deepEqual(xorPlain.map((value, i) => mod(value + xor25[i % 25])), body);
  assert.deepEqual(leftPlain.map((value, i) => mod(value + left[i % 11])), body);
  const plant = known.slice(0, 75);
  assert.deepEqual(hill(raw, encryptHill(raw, plant)), plant);
  assert.deepEqual(hill(totient, encryptHill(totient, plant)), plant);
  assert.deepEqual(plant.map((v,i) => mod(v + pad[i])).map((v,i) => mod(v - pad[i])), plant);

  const readouts = {
    original: body, xorThreeSquaresPad: xorPlain,
    threeSquaresTotientPad: padPlain, threeSquaresTotientAdd: padPlus,
    firstColumn569Pad: leftPlain, threeRawMatricesHill5: rawHill,
    threeTotientMatricesHill5: phiHill
  };
  const result = {
    sources: ["resources/cicada2014-openpuff-magic-squares.txt",
      "resources/historical/cicada2016-4gq25.jpg",
      "resources/liber-primus/lp2-corpus.json"],
    threeCenters: centers, centerXor: xor, alsoAlternatingSum: 569,
    signedImageWidthHeight: dims,
    treePage32AxisPrimeSums: [
      top.reduce((s,v) => s + corpus.prime[v], 0),
      left.reduce((s,v) => s + corpus.prime[v], 0)],
    dimensionPrimeOneBasedOrdinals: [103, 104],
    originalP32ZeroBasedDoubletStarts: repeatSites,
    zeroBasedDimensionOrdinalRead: "N N",
    conventionalOneBasedPrimeOrdinalRead: "E N",
    p55FullRunes: p55.length, p55CompleteBodyRunes: body.length,
    threeKeyMatricesDeterminantsRaw: raw.map(mat => invert(mat).det),
    threeKeyMatricesDeterminantsPhi: totient.map(mat => invert(mat).det),
    readouts: Object.fromEntries(Object.entries(readouts).map(([name, arr]) =>
      [name, {ioc: ioc(arr), first30GP: arr.slice(0,30).map(v => corpus.translit[v]).join(" ")}])),
    plantExact: true,
    conclusion: "Exact conditional cross-source numeral; no source-selected complete cipher or unknown LP2 plaintext"
  };
  assert.ok(Object.entries(readouts).slice(1).every(([, arr]) => ioc(arr) < 0.045));
  console.log(JSON.stringify(result, null, 2));
  return result;
}
if (require.main === module) run();
module.exports = {run};
