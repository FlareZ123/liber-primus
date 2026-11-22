"use strict";

/**
 * SFT: a nonlinear polynomial-evaluation key from the original LP2 grid and
 * the two original red triads, tested against all unsolved ciphertext runes.
 *
 * The p3 triple fixes GF(29^2) = F29[u]/(u^2-3u-8), with primitive u of order
 * 840. The p39 triple is 15(X-24)^2 and divides the 256-byte grid polynomial.
 * Since u^360 = 24, phase 360 is a source-derived candidate grid-key origin.
 *
 * For each nonzero field element u^t, evaluate either the complete printed
 * polynomial F or the exact quotient Q=F/[15(X-24)^2]. Project through
 * coordinates, trace, norm, or discrete
 * logarithms, then use the period-840 result in reversible GP29/GP28 ciphers.
 * This is a finite original-input hypothesis test, not a historical decoder.
 * Original and source-native planted plaintext are never interchanged.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const ROOT = path.resolve(__dirname, "..");

/** @param {string} relative @returns {any} */
const load = (relative) =>
  JSON.parse(fs.readFileSync(path.join(ROOT, relative), "utf8"));
/** @param {number} n @returns {number} */
const m = (n) => ((n % 29) + 29) % 29;
/** @param {number} n @returns {number} */
const m28 = (n) => ((n % 28) + 28) % 28;

/** @typedef {[number, number]} Field */
/** @param {Field} a @param {Field} b @returns {Field} */
function mul(a, b) {
  return [m(a[0] * b[0] + 8 * a[1] * b[1]),
    m(a[0] * b[1] + a[1] * b[0] + 3 * a[1] * b[1])];
}
/** @param {number[]} coefficients @param {Field} value @returns {Field} */
function evaluate(coefficients, value) {
  let state = /** @type {Field} */ ([0, 0]);
  for (const k of coefficients) {
    state = mul(state, value);
    state[0] = m(state[0] + k);
  }
  return state;
}

/**
 * Divide the exact source polynomial by the red p39 factor 15(X-24)^2,
 * keeping the original high-degree leading zero as a fixed-width slot.
 * @param {number[]} bytes
 * @returns {number[]}
 */
function quotientByRedFactor(bytes) {
  let coefficients = bytes.map(m);
  for (let pass = 0; pass < 2; pass++) {
    const quotient = [coefficients[0]];
    for (let i = 1; i < coefficients.length - 1; i++) {
      quotient.push(m(coefficients[i] + 24 * quotient[i - 1]));
    }
    assert.equal(m(coefficients.at(-1) + 24 * quotient.at(-1)), 0);
    coefficients = quotient;
  }
  assert.equal(coefficients.length, 254);
  return coefficients.map((value) => m(2 * value)); // 15^-1 = 2 (mod 29)
}

/**
 * @param {number[]} bytes
 * @param {"full"|"quotient"} mode
 */
function constructKeys(bytes, mode = "full") {
  const coefficients = mode === "quotient" ?
    quotientByRedFactor(bytes) : bytes.map(m);
  const elementLogs = new Map();
  const states = [];
  let u = /** @type {Field} */ ([1, 0]);
  for (let i = 0; i < 840; i++) {
    elementLogs.set(u.join(","), i);
    states.push(u);
    u = mul(u, [0, 1]);
  }
  assert.deepEqual(u, [1, 0]);
  assert.equal(elementLogs.size, 840);
  assert.deepEqual(states[360], [24, 0]);
  const output = states.map((state) => {
    const [a, b] = evaluate(coefficients, state);
    const trace = m(2 * a + 3 * b);
    const norm = m(a * a + 3 * a * b - 8 * b * b);
    const log = elementLogs.get([a, b].join(","));
    return {a, b, trace, norm,
      logLow: log === undefined ? 0 : log % 28,
      logHigh: log === undefined ? 0 : Math.floor(log / 28),
      logMod29: log === undefined ? 0 : log % 29};
  });
  const roots = output.flatMap((v, i) => v.a === 0 && v.b === 0 ? [i] : []);
  assert.deepEqual(roots, mode === "quotient" ? [433, 797] : [360, 433, 797]);
  if (mode === "quotient") {
    assert.deepEqual(output[360], {
      a: 23, b: 0, trace: 17, norm: 7,
      logLow: 4, logHigh: 17, logMod29: 16
    });
  }
  return {roots, table: output};
}

/** @param {number[]} symbols */
function ioc(symbols) {
  const histogram = new Int32Array(29);
  for (const symbol of symbols) histogram[symbol]++;
  return histogram.reduce((sum, n) => sum + n * (n - 1), 0) /
    (symbols.length * (symbols.length - 1));
}

/** @param {number[][]} pages */
function flatten(pages) {
  return pages.flatMap((page) => page);
}

/**
 * @param {number[][]} cipherPages
 * @param {number[]} key
 * @param {"global"|"page"} clock
 * @param {"add29"|"step28"} type
 * @param {1|-1} sign
 * @returns {number[][]}
 */
function decode(cipherPages, key, clock, type, sign) {
  const output = [];
  let consumed = 0;
  const log15 = new Int16Array(29).fill(-1);
  let power = 1;
  for (let i = 0; i < 28; i++) {
    log15[power] = i;
    power = m(power * 15);
  }
  for (const page of cipherPages) {
    const decoded = [];
    for (let i = 0; i < page.length; i++) {
      const k = key[(clock === "page" ? i : consumed + i) % 840];
      if (type === "add29") {
        decoded.push(m(page[i] + sign * k));
      } else if (i === 0) {
        decoded.push(page[0]);
      } else {
        const delta = m(page[i] - page[i - 1]);
        decoded.push(delta === 0 ? 28 : m28(log15[delta] + sign * k));
      }
    }
    consumed += page.length;
    output.push(decoded);
  }
  return output;
}

/**
 * Exact algebraic inverse of decode for a fixed public key and clock.
 * @param {number[][]} plaintext
 * @param {number[]} key
 * @param {"global"|"page"} clock
 * @param {"add29"|"step28"} type
 * @param {1|-1} sign
 * @returns {number[][]}
 */
function encode(plaintext, key, clock, type, sign) {
  const powers = Array(28);
  let power = 1;
  for (let i = 0; i < 28; i++) {
    powers[i] = power;
    power = m(power * 15);
  }
  const output = [];
  let consumed = 0;
  for (const page of plaintext) {
    const encrypted = [];
    for (let i = 0; i < page.length; i++) {
      const k = key[(clock === "page" ? i : consumed + i) % 840];
      if (type === "add29") {
        encrypted.push(m(page[i] - sign * k));
      } else if (i === 0) {
        encrypted.push(page[0]);
      } else if (page[i] === 28) {
        encrypted.push(encrypted[i - 1]);
      } else {
        encrypted.push(m(encrypted[i - 1] + powers[m28(page[i] - sign * k)]));
      }
    }
    consumed += page.length;
    output.push(encrypted);
  }
  return output;
}

/** @param {number[]} whole @param {number[]} lengths */
function slicePages(whole, lengths) {
  let offset = 0;
  return lengths.map((length) => {
    const slice = whole.slice(offset, offset + length);
    offset += length;
    return slice;
  });
}

function main() {
  const grid = load("resources/liber-primus/lp2-grid-256.json");
  const corpus = load("resources/liber-primus/lp2-corpus.json");
  const {nativeGP} = require("./red_triad_gf841_127cycle_inverse.cjs");
  const shakespeare = fs.readFileSync(
    path.join(ROOT, "resources/control/shakespeare_first300k.txt"), "utf8");
  const bytes = grid.bytes;
  assert.equal(bytes.length, 256);
  assert.equal(crypto.createHash("sha256").update(Buffer.from(bytes))
    .digest("hex"), "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");
  const cipherPages = corpus.pages.filter((page) =>
    page.page <= 55 && page.indices.length).map((page) => page.indices);
  const cipher = flatten(cipherPages);
  assert.equal(cipher.length, 12956);
  const mode = process.env.LP2_POLYNOMIAL_MODE === "quotient" ?
    "quotient" : "full";
  const {roots, table} = constructKeys(bytes, mode);
  const fields = ["a", "b", "trace", "norm",
    "logLow", "logHigh", "logMod29"];
  const all = [];
  for (const field of fields) {
    const sourceKey = table.map((state) => state[field]);
    for (const clock of ["global", "page"]) {
      for (const type of ["add29", "step28"]) {
        for (const sign of /** @type {(1|-1)[]} */ ([-1, 1])) {
          let best = {ioc: -1, phase: -1};
          let rootPhaseIoC = 0;
          for (let phase = 0; phase < 840; phase++) {
            const shifted = sourceKey.slice(phase).concat(sourceKey.slice(0, phase));
            const score = ioc(flatten(decode(cipherPages, shifted, clock, type, sign)));
            if (score > best.ioc) best = {ioc: score, phase};
            if (phase === 360) rootPhaseIoC = score;
          }
          all.push({field, clock, type, sign, ...best, rootPhaseIoC});
        }
      }
    }
  }
  all.sort((x, y) => y.ioc - x.ioc);
  assert.equal(all.length, 56);
  const bestPerType = ["add29", "step28"].map((type) =>
    all.find((x) => x.type === type));
  assert.ok(bestPerType.every((x) => x.ioc < 0.036));
  const native = nativeGP(shakespeare).slice(0, cipher.length);
  assert.equal(native.length, cipher.length);
  assert.ok(native.every((x) => Number.isInteger(x) && x >= 0 && x < 29));
  const lengths = cipherPages.map((page) => page.length);
  const nativePages = slicePages(native, lengths);
  const key = table.map((state) => state.trace);
  const anchored = key.slice(360).concat(key.slice(0, 360));
  const planted = encode(nativePages, anchored, "global", "step28", 1);
  const plantedRecovered = decode(planted, anchored, "global", "step28", 1);
  assert.deepEqual(plantedRecovered, nativePages);
  const wrongKey = key.slice(361).concat(key.slice(0, 361));
  const wrongRecovered = flatten(decode(planted, wrongKey, "global", "step28", 1));
  for (const model of bestPerType) {
    const sequence = table.map((state) => state[model.field]);
    const shifted = sequence.slice(model.phase).concat(sequence.slice(0, model.phase));
    const candidate = decode(cipherPages, shifted, model.clock, model.type, model.sign);
    assert.deepEqual(encode(candidate, shifted, model.clock, model.type, model.sign),
      cipherPages);
  }
  console.log(JSON.stringify({
    classification: "original-input bounded negative; no recovered original plaintext",
    originalGridBytes: bytes.length, fieldStates: table.length,
    polynomial: mode, polynomialCoefficientCount: mode === "full" ? 256 : 254,
    polynomialRootsOnNonzeroField: roots, root24Phase: 360,
    symbols: cipher.length, sourceIoC: ioc(cipher),
    originalCases: all.length * 840,
    bestPerType,
    bestTenModels: all.slice(0, 10),
    rootPhaseModels: all.filter((r) => r.field === "trace" && r.clock === "global"),
    plant: {
      cipher: "transparent GP28 successor; source phase360; trace(" +
        (mode === "full" ? "F" : "Q") + "(u^t))",
      recovered: flatten(plantedRecovered).length,
      nativeIoC: ioc(native), decodedIoC: ioc(flatten(plantedRecovered)),
      wrongPhaseIoC: ioc(wrongRecovered), fullExact: true
    },
    caveat: "Root and polynomial operations are source-derived but not independently authenticated instructions."
  }, null, 2));
}

if (require.main === module) main();
module.exports = {m, mul, evaluate, quotientByRedFactor, constructKeys,
  encode, decode, ioc};
