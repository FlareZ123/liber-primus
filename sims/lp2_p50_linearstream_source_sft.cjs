"use strict";

/**
 * Original LP2 p49–51 32×8 table: bounded full-byte linear-state test.
 *
 * A GF(2)-linear generator with <=32 hidden state bits, observed through a
 * fixed linear bit projection once per output byte, has binary linear
 * complexity <=32 for each stationary source-byte bit lane. Infer each
 * lane's minimal recurrence from the first 128 bytes and blind-predict
 * all 128 remaining positions. Test both native row and column readout.
 *
 * Additionally enumerate ALL 256 possible 8-bit affine-LCG multipliers
 * with the observed first two bytes fixing the additive constant.
 *
 * One original-source read-only Windows 11 / Node.js 22+ / CommonJS SFT.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const original = JSON.parse(fs.readFileSync(
  path.join(__dirname, "..", "resources", "liber-primus", "lp2-grid-256.json"),
  "utf8"
));
assert.equal(original.shape, "32 rows by 8 columns across LP2 pages 49, 50, 51");
const rowBytes = Buffer.from(original.bytes);
assert.equal(rowBytes.length, 256);
const digest = crypto.createHash("sha256").update(rowBytes).digest("hex");
assert.equal(digest,
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");

const columnBytes = Buffer.from(Array.from({length:256}, (_, i) =>
  rowBytes[(i % 32) * 8 + Math.floor(i / 32)]));

/**
 * Berlekamp–Massey over GF(2), using C[0]=1 and feedback coefficients
 * C[j] for the j-th previous bit. Returns minimal linear complexity.
 * @param {number[]} bits - An observed 0/1 stream.
 * @returns {{order:number,coefficients:number[]}}
 */
function berlekampMassey(bits) {
  const max = bits.length;
  const C = new Uint8Array(max + 1);
  const B = new Uint8Array(max + 1);
  C[0] = B[0] = 1;
  let order = 0;
  let shift = 1;
  for (let n = 0; n < max; n++) {
    let discrepancy = bits[n];
    for (let j = 1; j <= order; j++)
      discrepancy ^= C[j] & bits[n - j];
    if (discrepancy === 0) {
      shift++;
      continue;
    }
    const previous = C.slice();
    for (let j = 0; j + shift < C.length; j++)
      C[j + shift] ^= B[j];
    if (2 * order <= n) {
      order = n + 1 - order;
      B.set(previous);
      shift = 1;
    } else {
      shift++;
    }
  }
  return {order, coefficients: Array.from(C.slice(0, order + 1))};
}

/**
 * Continue a known recurrence without accessing heldout bits.
 * @param {number[]} trainingBits
 * @param {number[]} coefficients
 * @param {number} totalLength
 * @returns {number[]}
 */
function predict(trainingBits, coefficients, totalLength) {
  const seq = trainingBits.slice();
  while (seq.length < totalLength) {
    let bit = 0;
    for (let j = 1; j < coefficients.length; j++)
      bit ^= coefficients[j] & seq[seq.length - j];
    seq.push(bit);
  }
  return seq;
}

/** @param {Buffer | number[]} bytes @returns {{bit:number,order:number,correctHeldout:number,fullOrder:number}[]} */
function analyze(bytes) {
  const result = [];
  for (let bit = 0; bit < 8; bit++) {
    const stream = Array.from(bytes, (byte) => (byte >>> bit) & 1);
    const trained = berlekampMassey(stream.slice(0, 128));
    const predicted = predict(stream.slice(0, 128), trained.coefficients, 256);
    let correct = 0;
    for (let i = 128; i < 256; i++)
      correct += predicted[i] === stream[i] ? 1 : 0;
    result.push({bit, order:trained.order, correctHeldout:correct,
      fullOrder:berlekampMassey(stream).order});
  }
  return result;
}

/**
 * All exact affine LCGs modulo 256 consistent with the complete input.
 * @param {Buffer | number[]} bytes
 * @returns {{a:number,b:number}[]}
 */
function affineLCG(bytes) {
  const fits = [];
  for (let a = 0; a < 256; a++) {
    const b = (bytes[1] - a * bytes[0]) & 255;
    let correct = true;
    for (let i = 1; i < bytes.length - 1; i++)
      if (bytes[i + 1] !== ((a * bytes[i] + b) & 255)) {
        correct = false;
        break;
      }
    if (correct) fits.push({a, b});
  }
  return fits;
}

// Exact synthetic source-shaped 32-bit linear-state positive.
let state = 0x3301;
const planted = [];
for (let i = 0; i < 256; i++) {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  planted.push((state >>> 0) & 255);
}
const plantedResult = analyze(planted);
assert.ok(plantedResult.every((x) => x.order === 32 && x.correctHeldout === 128));

const lcgPlant = [1];
for (let i = 1; i < 256; i++)
  lcgPlant.push((5 * lcgPlant[i - 1] + 1) & 255);
assert.deepEqual(affineLCG(lcgPlant), [{a:5,b:1}]);

const row = analyze(rowBytes);
const column = analyze(columnBytes);
assert.deepEqual(row.map((r) => [r.order,r.correctHeldout]), [
  [66,71],[64,64],[65,60],[64,69],
  [64,54],[65,66],[63,63],[65,70]
]);
assert.deepEqual(column.map((r) => [r.order,r.correctHeldout]), [
  [63,64],[66,65],[64,60],[64,64],
  [65,74],[64,57],[64,65],[64,66]
]);
assert.ok(row.every((x) => x.fullOrder >= 128));
assert.equal(affineLCG(rowBytes).length,0);
assert.equal(affineLCG(columnBytes).length,0);

console.log(JSON.stringify({
  input: "original 256 printed p49–51 table cells, source byte order",
  sha256:digest,
  trainBytes:128,heldoutBytes:128,
  maxHypothesizedLinearStateBits:32,
  row, column,
  eightBitAffineLCGMatches:{row:0,column:0},
  plantedXorshift32:{seed:"0x3301",first128RecoveredOrders:plantedResult.map(x=>x.order),
    heldoutAllBitsCorrect:plantedResult.every(x=>x.correctHeldout===128)},
  plantedAffineLCG:{a:5,b:1,seed:1,exactlyRecovered:true},
  inference:"No direct 32-bit GF(2)-linear-state byte-stream or affine 8-bit LCG under two native serializations; nonlinear outputs, transformations and externally supplied keys survive"
},null,2));
console.log("PASS: original 256-byte linear recurrence and positive-control test");
