"use strict";

/**
 * Source-fixed original-grid BASE29-high-digit and keypad-route gate.
 * Run from repo root: node sims/p50_base29_high_digit_keypad_sft.cjs
 * This proves a lossless two-channel byte decomposition and tests one
 * conventional 1..9 numpad route. It does not decode LP2.
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

/** @param {number} value @returns {number} */
const mod = value => (value % 29 + 29) % 29;

/** @param {number} value @returns {number} */
function inverse(value) {
  for (let k = 1; k < 29; k++) {
    if (mod(k * value) === 1) return k;
  }
  throw new Error("Noninvertible polynomial leading term");
}

/**
 * Multiply high-power-first polynomial vectors in GF29.
 * @param {number[]} a
 * @param {number[]} b
 * @returns {number[]}
 */
function multiply(a, b) {
  const out = new Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      out[i + j] = mod(out[i + j] + a[i] * b[j]);
    }
  }
  return out;
}

/**
 * Divide a high-power-first polynomial by a nonzero divisor in GF29.
 * @param {number[]} a
 * @param {number[]} b
 * @returns {{ quotient: number[], remainder: number[] }}
 */
function divide(a, b) {
  const work = a.slice();
  const quotient = [];
  const leadInverse = inverse(b[0]);
  for (let i = 0; i <= a.length - b.length; i++) {
    const factor = mod(work[i] * leadInverse);
    quotient.push(factor);
    for (let j = 0; j < b.length; j++) {
      work[i + j] = mod(work[i + j] - factor * b[j]);
    }
  }
  return { quotient, remainder: work.slice(quotient.length) };
}

/** @param {number} digit @returns {[number,number]} */
const keypadStep = digit => [digit % 3 - 1, Math.floor(digit / 3) - 1];

/**
 * The conventional 1–9 keypad is read bottom row first; 5 is stationary.
 * All rotations/reflections have the same revisit and closure counts.
 * @param {number[]} highDigits
 * @returns {{uniqueSites:number,backtracks:number,bboxArea:number,closedRows:number,nearRows:number,endpoint:[number,number]}}
 */
function pathMetrics(highDigits) {
  let x = 0, y = 0, minX = 0, maxX = 0, minY = 0, maxY = 0;
  const seen = new Set(["0,0"]);
  let backtracks = 0, closedRows = 0, nearRows = 0;
  let prev = [0, 0];
  for (let row = 0; row < 32; row++) {
    let rowX = 0, rowY = 0;
    for (let col = 0; col < 8; col++) {
      const [dx, dy] = keypadStep(highDigits[row * 8 + col]);
      if ((row || col) && dx === -prev[0] && dy === -prev[1] && (dx !== 0 || dy !== 0)) {
        backtracks++;
      }
      prev = [dx, dy];
      rowX += dx;
      rowY += dy;
      x += dx;
      y += dy;
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
      seen.add(String(x) + "," + String(y));
    }
    if (rowX === 0 && rowY === 0) closedRows++;
    if (Math.abs(rowX) <= 1 && Math.abs(rowY) <= 1) nearRows++;
  }
  return {
    uniqueSites: seen.size,
    backtracks,
    bboxArea: (maxX - minX + 1) * (maxY - minY + 1),
    closedRows,
    nearRows,
    endpoint: [x, y]
  };
}

const grid = JSON.parse(fs.readFileSync(path.resolve(__dirname,
  "../resources/liber-primus/lp2-grid-256.json"), "utf8"));
const bytes = grid.bytes;
assert.equal(bytes.length, 256);
assert.ok(bytes.every(v => Number.isInteger(v) && v >= 0 && v <= 255));
const hash = crypto.createHash("sha256").update(Buffer.from(bytes)).digest("hex");
assert.equal(hash, "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");

const high = bytes.map(v => Math.floor(v / 29));
const residue = bytes.map(mod);
assert.ok(high.every(v => v >= 0 && v <= 8));
assert.deepEqual(high.map((v, i) => v * 29 + residue[i]), bytes);
const hist = Array.from({ length: 9 }, (_, i) => high.filter(v => v === i).length);
assert.deepEqual(hist, [22, 33, 38, 22, 29, 32, 34, 21, 25]);

// H comes from BASE29 3301 -> 3QO (ascending source digits).
// G comes from the original p39 red triple. Polynomialization is conjectural.
const factor = multiply([24, 26, 3], [15, 5, 27]);
assert.deepEqual(factor, [12, 17, 11, 21, 23]);
const { quotient, remainder } = divide(residue, factor);
assert.equal(quotient.length, 252);
assert.deepEqual(remainder, [0, 0, 0, 0]);
assert.deepEqual(multiply(quotient, factor), residue);
assert.equal(quotient[0], 0);

// The 252 coefficients alone cannot reconstruct the original 256 bytes.
const changed = bytes.slice();
changed[0] -= 29;
assert.equal(bytes[0], 203);
assert.notDeepEqual(changed, bytes);
assert.deepEqual(changed.map(mod), residue);
assert.deepEqual(divide(changed.map(mod), factor).quotient, quotient);

const nineLiftPositions = residue.filter(v => v < 24).length;
const eightLiftPositions = residue.length - nineLiftPositions;
assert.equal(nineLiftPositions, 193);
assert.equal(eightLiftPositions, 63);
const liftAmbiguityBits =
  nineLiftPositions * Math.log2(9) + eightLiftPositions * Math.log2(8);

const observed = pathMetrics(high);
assert.deepEqual(observed, {
  uniqueSites: 151, backtracks: 26, bboxArea: 812,
  closedRows: 0, nearRows: 9, endpoint: [17, -13]
});

// Frozen histogram-preserving row-major permutation control, fixed LCG seed.
let seed = 0x0bc29d1;
const random = () => {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 4294967296;
};
const trials = 12000;
let uniqueGe = 0, bboxGe = 0, closedLe = 0, nearGe = 0;
let uniqueSum = 0, bboxSum = 0, closedSum = 0, nearSum = 0;
for (let i = 0; i < trials; i++) {
  const scrambled = high.slice();
  for (let j = scrambled.length - 1; j > 0; j--) {
    const k = Math.floor(random() * (j + 1));
    [scrambled[j], scrambled[k]] = [scrambled[k], scrambled[j]];
  }
  const m = pathMetrics(scrambled);
  uniqueSum += m.uniqueSites;
  bboxSum += m.bboxArea;
  closedSum += m.closedRows;
  nearSum += m.nearRows;
  uniqueGe += Number(m.uniqueSites >= observed.uniqueSites);
  bboxGe += Number(m.bboxArea >= observed.bboxArea);
  closedLe += Number(m.closedRows <= observed.closedRows);
  nearGe += Number(m.nearRows >= observed.nearRows);
}

console.log(JSON.stringify({
  interpretation: "conditional BASE29 quotient/remainder plus conventional keypad; not an LP2 decoder",
  originalByteSha256: hash,
  gridShape: [32, 8],
  factor,
  quotientSlots: quotient.length,
  quotientRemainder: remainder,
  highDigitHistogram: hist,
  exactByteReconstruction: true,
  quotientAloneIsLossy: true,
  independentByteLiftCountForm: "9^193 * 8^63",
  log2AmbiguousByteLifts: liftAmbiguityBits,
  canonicalKeypadPath: observed,
  control: {
    trials, seed: "0x0bc29d1", shuffle: "Fisher-Yates over the 256 fixed original high digits",
    meanUniqueSites: uniqueSum / trials,
    pUniqueGe: uniqueGe / trials,
    meanBboxArea: bboxSum / trials,
    pBboxGe: bboxGe / trials,
    meanClosedRows: closedSum / trials,
    pClosedLe: closedLe / trials,
    meanNearRows: nearSum / trials,
    pNearGe: nearGe / trials
  },
  decision: "No source fixes keypad use, start point, endpoints or a plaintext readout; no route-to-plaintext has been identified."
}, null, 2));
