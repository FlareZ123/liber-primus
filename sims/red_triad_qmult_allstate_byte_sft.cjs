"use strict";

/**
 * Exact all-row-state source-quotient GF(29^2) byte-register gate.
 *
 * Original sources: p3 13+23u+2u²=0; p39 15(X-24)² divides the
 * printed 256-byte polynomial; quotient has 127 field-element pairs.
 * The 12954 original runes following the two-rune header form
 * 51 rows × 127 field elements, with C_t = P_t + S_t.
 *
 * Test the two natural evolving state laws on each row:
 *     S_(t+1) = Q_j * S_t + C_t
 *     S_(t+1) = Q_j * S_t + P_t
 * Grant all 841 field-element initial states INDEPENDENTLY PER ROW.
 *
 * Candidate plaintext transport: canonical byte 0..255 serialized as
 * a+29b or b+29a, or u^(byte+unknown phase), with any cyclic phase
 * 0..839. The source primitive u has exact multiplicative order 840.
 * This is a key-independent necessary-condition capacity test for
 * these transports, not a universal proof against non-GP registers.
 *
 * Run from repository root: node sims/red_triad_qmult_allstate_byte_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const MOD = 29;
const SIZE = 127;
const ROWS = 51;

/** @param {string} name @returns {any} */
function load(name) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, name), "utf8"));
}

/** @param {number} x @returns {number} */
function mod(x) { return ((x % MOD) + MOD) % MOD; }

/** @typedef {[number,number]} Field */
/** @param {Field} a @param {Field} b @returns {Field} */
function plus(a, b) { return [mod(a[0] + b[0]), mod(a[1] + b[1])]; }
/** @param {Field} a @param {Field} b @returns {Field} */
function minus(a, b) { return [mod(a[0] - b[0]), mod(a[1] - b[1])]; }
/** @param {Field} a @param {Field} b @returns {Field} */
function times(a, b) {
  return [
    mod(a[0] * b[0] + 8 * a[1] * b[1]),
    mod(a[0] * b[1] + a[1] * b[0] + 3 * a[1] * b[1])
  ];
}

/**
 * Retain all 254 quotient coefficients in ascending polynomial order
 * and interpret low/high consecutive coefficients as 127 field pairs.
 * @param {number[]} bytes
 * @returns {Field[]}
 */
function quotient(bytes) {
  assert.equal(bytes.length, 256);
  const rem = bytes.slice().reverse().map(mod);
  const coeff = Array(254).fill(0);
  for (let j = 253; j >= 0; j--) {
    const factor = mod(2 * rem[j + 2]);
    coeff[j] = factor;
    for (let k = 0; k < 3; k++)
      rem[j + k] = mod(rem[j + k] - factor * [27, 5, 15][k]);
  }
  assert.deepEqual(rem.slice(0, 2), [0, 0]);
  assert.equal(coeff[253], 0);
  return Array.from({length: SIZE}, (_, j) => [coeff[2 * j], coeff[2 * j + 1]]);
}

/** @returns {{logs:Int16Array,powers:Field[]}} */
function generatorTable() {
  const logs = new Int16Array(841).fill(-1);
  const powers = [];
  let x = /** @type {Field} */ ([1, 0]);
  for (let i = 0; i < 840; i++) {
    const index = x[0] + MOD * x[1];
    assert.equal(logs[index], -1);
    logs[index] = i;
    powers.push(x);
    x = times(x, [0, 1]);
  }
  assert.deepEqual(x, [1, 0]);
  assert.equal(logs[0], -1);
  return {logs, powers};
}

/**
 * A nonzero alphabet can encode the bytes u^(phase+b), b=0..255,
 * with *any unknown phase*, exactly when its used discrete-log
 * symbols fit a cyclic interval of 256 consecutive exponents.
 * Return the minimal interval SPAN in cyclic log coordinates,
 * or Infinity for any zero field element.
 * @param {number[]} values
 * @param {Int16Array} logs
 * @returns {number}
 */
function cyclicLogSpan(values, logs) {
  const points = [];
  for (const v of values) {
    if (v === 0) return Infinity;
    points.push(logs[v]);
  }
  points.sort((a, b) => a - b);
  let maxGap = points[0] + 840 - points[points.length - 1];
  for (let j = 1; j < points.length; j++)
    maxGap = Math.max(maxGap, points[j] - points[j - 1]);
  return 840 - maxGap;
}

/**
 * Decrypt for a given initial field state. The original source
 * supplies every field step; there is NO assumed row-to-row state.
 * @param {Field[]} row
 * @param {Field[]} q
 * @param {Field} seed
 * @param {"cipher"|"plain"} feedback
 * @returns {Field[]}
 */
function decrypt(row, q, seed, feedback) {
  let state = seed.slice();
  const output = [];
  for (let j = 0; j < SIZE; j++) {
    const plain = minus(row[j], state);
    output.push(plain);
    state = plus(times(q[j], state), feedback === "cipher" ? row[j] : plain);
  }
  return output;
}

/**
 * Exact synthetic encoder control, driven by a known seed and
 * canonical 127-byte array encoded into GF841 field elements.
 * @param {Field[]} plain
 * @param {Field[]} q
 * @param {Field} seed
 * @param {"cipher"|"plain"} feedback
 * @returns {Field[]}
 */
function encrypt(plain, q, seed, feedback) {
  let state = seed.slice();
  const output = [];
  for (let j = 0; j < SIZE; j++) {
    const cipher = plus(plain[j], state);
    output.push(cipher);
    state = plus(times(q[j], state), feedback === "cipher" ? cipher : plain[j]);
  }
  return output;
}

/**
 * Enumerate all 841 arbitrary secret initial states for one source row.
 * Scores are necessary conditions, independent of language and byte content.
 * @param {Field[]} row
 * @param {Field[]} q
 * @param {"cipher"|"plain"} feedback
 * @param {Int16Array} logs
 * @returns {{bestByte:[number,number],bestLogSpan:number,fullByte:[number,number],fullLog:number,bestSeed:[number,number],bestLogSeed:number}}
 */
function scan(row, q, feedback, logs) {
  let bestByte = /** @type {[number,number]} */ ([0, 0]);
  let bestSeed = /** @type {[number,number]} */ ([-1, -1]);
  let bestLogSpan = Infinity;
  let bestLogSeed = -1;
  let fullByte = /** @type {[number,number]} */ ([0, 0]);
  let fullLog = 0;
  for (let h = 0; h < 841; h++) {
    const initial = /** @type {Field} */ ([h % 29, Math.floor(h / 29)]);
    const plain = decrypt(row, q, initial, feedback);
    let n0 = 0, n1 = 0;
    const raw = [];
    for (const p of plain) {
      if (p[0] + MOD * p[1] < 256) n0++;
      if (p[1] + MOD * p[0] < 256) n1++;
      raw.push(p[0] + MOD * p[1]);
    }
    if (n0 > bestByte[0]) { bestByte[0] = n0; bestSeed[0] = h; }
    if (n1 > bestByte[1]) { bestByte[1] = n1; bestSeed[1] = h; }
    if (n0 === SIZE) fullByte[0]++;
    if (n1 === SIZE) fullByte[1]++;
    const span = cyclicLogSpan(raw, logs);
    if (span < bestLogSpan) { bestLogSpan = span; bestLogSeed = h; }
    if (span <= 255) fullLog++;
  }
  return {bestByte, bestSeed, bestLogSpan, bestLogSeed, fullByte, fullLog};
}

/** @param {Field[]} payload @returns {Field[][]} */
function rowify(payload) {
  assert.equal(payload.length, ROWS * SIZE);
  return Array.from({length: ROWS}, (_, i) => payload.slice(i * SIZE, (i + 1) * SIZE));
}

/**
 * @param {Field[]} q
 * @param {Field[][]} source
 * @param {Int16Array} logs
 * @param {Field[]} powers
 * @returns {any}
 */
function run(q, source, logs, powers) {
  const originalResults = {};
  const plants = {};
  for (const feedback of /** @type {const} */ (["cipher", "plain"])) {
    const variants = source.map(row => scan(row, q, feedback, logs));
    assert.equal(variants.length, ROWS);
    assert.ok(variants.every(x => x.fullByte.every(n => n === 0) && x.fullLog === 0));
    originalResults[feedback] = {
      maxCanonicalAccepted: [
        Math.max(...variants.map(x => x.bestByte[0])),
        Math.max(...variants.map(x => x.bestByte[1]))
      ],
      minCyclicLogSpan: Math.min(...variants.map(x => x.bestLogSpan)),
      medianRowBestLogSpan: variants.map(x => x.bestLogSpan).sort((a,b) => a-b)[25],
      fullCanonicalRows: variants.filter(x => x.fullByte.some(n => n)).length,
      fullLogRows: variants.filter(x => x.fullLog).length,
      firstRow: variants[0],
      lastRow: variants[50],
    };
    const fixtures = {canonicalRows: 0, logarithmicRows: 0};
    for (let i = 0; i < ROWS; i++) {
      const bytes = Array.from({length: SIZE}, (_,j) => (i * 37 + j * 19 + i * j * 3) % 256);
      const raw = /** @type {Field[]} */ (bytes.map(b => [b % 29, Math.floor(b / 29)]));
      const phase = (i * 7 + 51) % 840;
      const logarithmic = powers && bytes.map(b => powers[(phase + b) % 840]);
      const seed = /** @type {Field} */ ([(i + 9) % 29, (17 * i + 3) % 29]);
      const canonCipher = encrypt(raw, q, seed, feedback);
      assert.deepEqual(decrypt(canonCipher, q, seed, feedback), raw);
      const canonResult = scan(canonCipher, q, feedback, logs);
      assert.ok(canonResult.fullByte[0] > 0);
      fixtures.canonicalRows++;
      const logCipher = encrypt(logarithmic, q, seed, feedback);
      assert.deepEqual(decrypt(logCipher, q, seed, feedback), logarithmic);
      const logResult = scan(logCipher, q, feedback, logs);
      assert.ok(logResult.fullLog > 0);
      fixtures.logarithmicRows++;
      if (i === 0) {
        const qWrong = q.slice(1).concat([q[0]]);
        assert.equal(scan(canonCipher, qWrong, feedback, logs).fullByte[0], 0);
        assert.equal(scan(logCipher, qWrong, feedback, logs).fullLog, 0);
      }
    }
    plants[feedback] = fixtures;
  }
  return {originalResults, plantedByteControls: plants};
}

function main() {
  const corpus = load("resources/liber-primus/lp2-corpus.json");
  const grid = load("resources/liber-primus/base60-grid.json");
  const indices = corpus.pages.filter(p => p.page < 56).flatMap(p => p.indices);
  assert.equal(indices.length, 12956);
  assert.deepEqual(indices.slice(0, 2), [15, 8]);
  const payload = indices.slice(2);
  const source = rowify(Array.from({length: payload.length/2},(_,j) =>
    /** @type {Field} */ ([payload[2*j],payload[2*j+1]])));
  const q = quotient(grid.byte_rows.flat());
  const {logs, powers} = generatorTable();
  assert.ok(q.every(v => v[0] || v[1]));
  const report = run(q, source, logs, powers);
  process.stdout.write(JSON.stringify({
    hypothesis: "GF841 quotient pair multipliers, arbitrary secret field seed per 127-pair row",
    input: {totalRunes: indices.length, header: indices.slice(0,2),
      rows: ROWS, fieldPairsPerRow: SIZE, sourceMultiplierPairs: q.length},
    alphabet: "byte b serialized as a+29b / b+29a, or u^(b+any phase), b=0..255",
    ...report,
    conclusion: "Original fails every unknown row initial state for the stated canonical and logarithmic 256-byte transports; full source-matched byte plants succeed."
  },null,2)+"\n");
}

if (require.main === module) main();
module.exports = {scan, decrypt, encrypt, quotient, generatorTable, cyclicLogSpan};
